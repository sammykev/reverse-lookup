import { BreachResult, Breach } from "../types";

/**
 * Breach lookup — two-provider strategy, both free:
 *
 * PRIMARY (no key needed):
 *   XposedOrNot  — free, no key, returns breach names for an email.
 *   HIBP /breaches — free public catalog of all breach details (name→metadata).
 *   Combined: XposedOrNot names → matched against HIBP catalog → full details.
 *
 * UPGRADE (optional paid key):
 *   HIBP /breachedaccount — if HIBP_API_KEY is set, uses the official per-email
 *   endpoint directly for the most accurate + up-to-date results ($3.50/month).
 */

// ── Free HIBP breach catalog (no key required) ────────────────────────────────
let hibpCatalogCache: Map<string, any> | null = null;
let hibpCatalogFetchedAt = 0;
const CATALOG_TTL_MS = 6 * 60 * 60 * 1000; // refresh every 6 hours

async function getHibpCatalog(): Promise<Map<string, any>> {
  const now = Date.now();
  if (hibpCatalogCache && now - hibpCatalogFetchedAt < CATALOG_TTL_MS) {
    return hibpCatalogCache;
  }
  const res = await fetch("https://haveibeenpwned.com/api/v3/breaches", {
    headers: { "user-agent": "ReverseLookup/1.0" },
    next: { revalidate: 21600 },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) return new Map();
  const list: any[] = await res.json();
  const map = new Map(list.map((b) => [b.Name.toLowerCase(), b]));
  hibpCatalogCache = map;
  hibpCatalogFetchedAt = now;
  return map;
}

function catalogEntryToBreach(b: any): Breach {
  return {
    name: b.Name,
    title: b.Title,
    domain: b.Domain ?? "",
    breachDate: b.BreachDate ?? "",
    addedDate: b.AddedDate ?? "",
    pwnCount: b.PwnCount ?? 0,
    dataClasses: b.DataClasses ?? [],
    description: b.Description ?? "",
    isVerified: b.IsVerified ?? false,
    isSensitive: b.IsSensitive ?? false,
    logoPath: b.LogoPath ?? null,
  };
}

// ── XposedOrNot (free, no key) ────────────────────────────────────────────────
async function viaXposedOrNot(email: string): Promise<string[] | null> {
  try {
    const res = await fetch(
      `https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`,
      {
        headers: { "user-agent": "ReverseLookup/1.0" },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      }
    );
    if (res.status === 404) return []; // clean
    if (!res.ok) return null;
    const data: any = await res.json();

    // XposedOrNot returns breach names in several possible shapes
    if (Array.isArray(data?.breaches)) return data.breaches as string[];
    if (data?.BreachesSummary?.site) {
      return (data.BreachesSummary.site as string).split(";").filter(Boolean);
    }
    if (data?.Error) return []; // "Not found"
    return [];
  } catch {
    return null;
  }
}

// ── HIBP paid endpoint (optional, most accurate) ──────────────────────────────
async function viaHibpPaid(email: string, key: string): Promise<Breach[] | null> {
  try {
    const res = await fetch(
      `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
      {
        headers: { "hibp-api-key": key, "user-agent": "ReverseLookup/1.0" },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      }
    );
    if (res.status === 404) return [];
    if (!res.ok) return null;
    const raw: any[] = await res.json();
    return raw.map(catalogEntryToBreach);
  } catch {
    return null;
  }
}

// ── Public entry point ────────────────────────────────────────────────────────
export async function lookupBreaches(email: string): Promise<BreachResult> {
  const hibpKey = process.env.HIBP_API_KEY;

  try {
    // ── Path 1: paid HIBP key available — most accurate ──────────────────────
    if (hibpKey) {
      const breaches = await viaHibpPaid(email, hibpKey);
      if (breaches !== null) {
        breaches.sort((a, b) => b.breachDate.localeCompare(a.breachDate));
        return { query: email, breaches, pasteCount: null, configured: true, provider: "hibp" };
      }
    }

    // ── Path 2: free (XposedOrNot + HIBP catalog) ────────────────────────────
    const [breachNames, catalog] = await Promise.all([
      viaXposedOrNot(email),
      getHibpCatalog(),
    ]);

    if (breachNames === null) {
      return {
        query: email,
        breaches: [],
        pasteCount: null,
        configured: true,
        provider: "xposedornot",
        error: "Breach lookup temporarily unavailable. Try again shortly.",
      };
    }

    const breaches: Breach[] = breachNames
      .map((name) => {
        const entry = catalog.get(name.toLowerCase());
        if (entry) return catalogEntryToBreach(entry);
        // Name not in catalog — return minimal record
        return {
          name,
          title: name,
          domain: "",
          breachDate: "",
          addedDate: "",
          pwnCount: 0,
          dataClasses: [],
          description: "",
          isVerified: false,
          isSensitive: false,
          logoPath: null,
        } satisfies Breach;
      })
      .sort((a, b) => b.breachDate.localeCompare(a.breachDate));

    return {
      query: email,
      breaches,
      pasteCount: null,
      configured: true,
      provider: "xposedornot+hibp-catalog",
    };
  } catch (err: any) {
    const msg = err?.name === "TimeoutError" ? "Request timed out." : (err?.message ?? "Unknown error.");
    return {
      query: email,
      breaches: [],
      pasteCount: null,
      configured: true,
      provider: "xposedornot",
      error: `Breach lookup failed — ${msg}`,
    };
  }
}
