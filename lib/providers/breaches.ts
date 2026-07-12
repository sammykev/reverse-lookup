import { BreachResult, Breach } from "../types";

/**
 * HaveIBeenPwned v3 breach lookup.
 * Docs: https://haveibeenpwned.com/API/v3
 * Requires a paid API key ($3.50/month) — get one at haveibeenpwned.com/API/Key
 *
 * Returns every breach the email appeared in, plus paste count.
 */
export async function lookupBreaches(email: string): Promise<BreachResult> {
  const key = process.env.HIBP_API_KEY;

  if (!key) {
    return {
      query: email,
      breaches: [],
      pasteCount: null,
      configured: false,
      provider: "hibp",
      error: "Breach lookup not configured. Add HIBP_API_KEY to your environment.",
    };
  }

  const headers = {
    "hibp-api-key": key,
    "user-agent": "ReverseLookup/1.0",
  };

  try {
    // Run breach + paste lookups in parallel
    const [breachRes, pasteRes] = await Promise.all([
      fetch(
        `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
        { headers, cache: "no-store", signal: AbortSignal.timeout(10_000) }
      ),
      fetch(
        `https://haveibeenpwned.com/api/v3/pasteaccount/${encodeURIComponent(email)}`,
        { headers, cache: "no-store", signal: AbortSignal.timeout(10_000) }
      ),
    ]);

    // 404 = clean (not found in any breach)
    const breaches: Breach[] = [];
    if (breachRes.status === 200) {
      const raw: any[] = await breachRes.json();
      for (const b of raw) {
        breaches.push({
          name: b.Name,
          title: b.Title,
          domain: b.Domain,
          breachDate: b.BreachDate,
          addedDate: b.AddedDate,
          pwnCount: b.PwnCount,
          dataClasses: b.DataClasses ?? [],
          description: b.Description ?? "",
          isVerified: b.IsVerified ?? false,
          isSensitive: b.IsSensitive ?? false,
          logoPath: b.LogoPath ?? null,
        });
      }
    } else if (breachRes.status !== 404) {
      const detail = `HTTP ${breachRes.status}`;
      return { query: email, breaches: [], pasteCount: null, configured: true, provider: "hibp", error: `Breach lookup failed — ${detail}. Check HIBP_API_KEY.` };
    }

    // Sort most recent breach first
    breaches.sort((a, b) => b.breachDate.localeCompare(a.breachDate));

    let pasteCount: number | null = null;
    if (pasteRes.status === 200) {
      const pastes: any[] = await pasteRes.json();
      pasteCount = pastes.length;
    }

    return { query: email, breaches, pasteCount, configured: true, provider: "hibp" };
  } catch (err: any) {
    const msg = err?.name === "TimeoutError" ? "Request timed out." : (err?.message ?? "Unknown error.");
    return { query: email, breaches: [], pasteCount: null, configured: true, provider: "hibp", error: `Breach lookup failed — ${msg}` };
  }
}
