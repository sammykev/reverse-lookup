import { EnrichResult, SocialProfile } from "../types";

const emptyFields = () => ({
  name: null,
  firstName: null,
  lastName: null,
  age: null,
  birthYear: null,
  location: null,
  jobTitle: null,
  company: null,
  phones: [] as string[],
  emails: [] as string[],
  socialProfiles: [] as SocialProfile[],
});

// Merge two enrichment results — prefer `a` for scalar fields, union social profiles.
function merge(a: EnrichResult, b: EnrichResult): EnrichResult {
  const seenNetworks = new Set(a.socialProfiles.map((p) => p.network));
  const extraProfiles = b.socialProfiles.filter((p) => !seenNetworks.has(p.network));
  const seenPhones = new Set(a.phones);
  const seenEmails = new Set(a.emails);
  return {
    name: a.name ?? b.name,
    firstName: a.firstName ?? b.firstName,
    lastName: a.lastName ?? b.lastName,
    age: a.age ?? b.age,
    birthYear: a.birthYear ?? b.birthYear,
    location: a.location ?? b.location,
    jobTitle: a.jobTitle ?? b.jobTitle,
    company: a.company ?? b.company,
    phones: [...a.phones, ...b.phones.filter((p) => !seenPhones.has(p))],
    emails: [...a.emails, ...b.emails.filter((e) => !seenEmails.has(e))],
    socialProfiles: [...a.socialProfiles, ...extraProfiles],
    provider: [a.provider, b.provider].filter(Boolean).join("+"),
    configured: true,
  };
}

// ── People Data Labs ─────────────────────────────────────────────────────────
// Free tier: 100 calls/month — app.peopledatalabs.com
async function viaPDL(params: { email?: string; phone?: string }, key: string): Promise<EnrichResult | null> {
  const qs = new URLSearchParams({ pretty: "false" });
  if (params.email) qs.set("email", params.email);
  if (params.phone) qs.set("phone", params.phone);

  try {
    const res = await fetch(`https://api.peopledatalabs.com/v5/person/enrich?${qs}`, {
      headers: { "X-Api-Key": key },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (res.status === 404) return { ...emptyFields(), provider: "pdl", configured: true };
    if (!res.ok) return null;

    const body: any = await res.json();
    const d = body?.data;
    if (!d) return { ...emptyFields(), provider: "pdl", configured: true };

    const socialProfiles: SocialProfile[] = (d.profiles ?? []).map((p: any) => ({
      network: p.network ?? "unknown",
      url: p.url ?? null,
      username: p.username ?? null,
    }));

    const age = d.birth_year ? new Date().getFullYear() - Number(d.birth_year) : null;

    return {
      name: d.full_name ?? null,
      firstName: d.first_name ?? null,
      lastName: d.last_name ?? null,
      age,
      birthYear: d.birth_year ? Number(d.birth_year) : null,
      location: d.location_names?.[0] ?? d.location_name ?? null,
      jobTitle: d.job_title ?? null,
      company: d.job_company_name ?? null,
      phones: Array.isArray(d.phone_numbers) ? d.phone_numbers : [],
      emails: Array.isArray(d.emails) ? d.emails.map((e: any) => e.address ?? e) : [],
      socialProfiles,
      provider: "pdl",
      configured: true,
    };
  } catch {
    return null;
  }
}

// ── FullContact ──────────────────────────────────────────────────────────────
// Better at personal emails via social graph matching.
// Free tier available — platform.fullcontact.com
async function viaFullContact(params: { email?: string; phone?: string }, key: string): Promise<EnrichResult | null> {
  const body: Record<string, string> = {};
  if (params.email) body.email = params.email;
  if (params.phone) body.phone = params.phone;

  try {
    const res = await fetch("https://api.fullcontact.com/v3/person.enrich", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (res.status === 404 || res.status === 422) return { ...emptyFields(), provider: "fullcontact", configured: true };
    if (!res.ok) return null;

    const d: any = await res.json();

    const socialProfiles: SocialProfile[] = (d.socialProfiles ?? []).map((p: any) => ({
      network: (p.type ?? p.network ?? "unknown").toLowerCase(),
      url: p.url ?? null,
      username: p.username ?? null,
    }));

    const currentOrg = (d.organizations ?? []).find((o: any) => o.current) ?? d.organizations?.[0];

    return {
      name: d.fullName ?? null,
      firstName: d.givenName ?? null,
      lastName: d.familyName ?? null,
      age: d.age ?? null,
      birthYear: d.age ? new Date().getFullYear() - Number(d.age) : null,
      location: d.location ?? null,
      jobTitle: currentOrg?.title ?? null,
      company: currentOrg?.name ?? null,
      phones: Array.isArray(d.phones) ? d.phones.map((p: any) => p.value ?? p) : [],
      emails: Array.isArray(d.emails) ? d.emails.map((e: any) => e.value ?? e) : [],
      socialProfiles,
      provider: "fullcontact",
      configured: true,
    };
  } catch {
    return null;
  }
}

// ── Public entry point ───────────────────────────────────────────────────────
export async function enrichPerson(params: { email?: string; phone?: string }): Promise<EnrichResult> {
  const pdlKey = process.env.PDL_API_KEY;
  const fcKey = process.env.FULLCONTACT_API_KEY;

  if (!pdlKey && !fcKey) {
    return {
      ...emptyFields(),
      provider: "",
      configured: false,
      error: "Person enrichment not configured. Add PDL_API_KEY or FULLCONTACT_API_KEY to your environment.",
    };
  }

  // Run both providers in parallel for maximum coverage.
  const [pdlResult, fcResult] = await Promise.all([
    pdlKey ? viaPDL(params, pdlKey) : Promise.resolve(null),
    fcKey ? viaFullContact(params, fcKey) : Promise.resolve(null),
  ]);

  // Merge whichever providers returned data.
  if (pdlResult && fcResult) return merge(pdlResult, fcResult);
  if (pdlResult) return pdlResult;
  if (fcResult) return fcResult;

  return {
    ...emptyFields(),
    provider: [pdlKey ? "pdl" : "", fcKey ? "fullcontact" : ""].filter(Boolean).join("+"),
    configured: true,
  };
}
