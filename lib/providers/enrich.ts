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
    socialProfiles: [
      ...a.socialProfiles,
      ...b.socialProfiles.filter((p) => !seenNetworks.has(p.network)),
    ],
    provider: [a.provider, b.provider].filter(Boolean).join("+"),
    configured: true,
  };
}

// ── People Data Labs ──────────────────────────────────────────────────────────
// Free tier: 100 calls/month — app.peopledatalabs.com
async function viaPDL(
  params: { email?: string; phone?: string },
  key: string
): Promise<EnrichResult | null> {
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

    return {
      name: d.full_name ?? null,
      firstName: d.first_name ?? null,
      lastName: d.last_name ?? null,
      age: d.birth_year ? new Date().getFullYear() - Number(d.birth_year) : null,
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

// ── Hunter.io Email Enrichment ────────────────────────────────────────────────
// Sign up free at hunter.io (Google login works). 25 enrichments/month free.
// Only works with email (not phone).
async function viaHunter(email: string, key: string): Promise<EnrichResult | null> {
  try {
    const res = await fetch(
      `https://api.hunter.io/v2/email-enrichment?email=${encodeURIComponent(email)}&api_key=${key}`,
      { cache: "no-store", signal: AbortSignal.timeout(10_000) }
    );
    if (res.status === 404) return { ...emptyFields(), provider: "hunter", configured: true };
    if (!res.ok) return null;

    const body: any = await res.json();
    const d = body?.data;
    if (!d) return { ...emptyFields(), provider: "hunter", configured: true };

    const socialProfiles: SocialProfile[] = [];
    if (d.linkedin_url) {
      socialProfiles.push({ network: "linkedin", url: d.linkedin_url, username: null });
    }
    if (d.twitter) {
      socialProfiles.push({
        network: "twitter",
        url: `https://twitter.com/${d.twitter}`,
        username: d.twitter,
      });
    }

    const firstName = d.first_name ?? null;
    const lastName = d.last_name ?? null;
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName ?? lastName ?? null;

    return {
      name: fullName,
      firstName,
      lastName,
      age: null,
      birthYear: null,
      location: d.location ?? d.city ?? null,
      jobTitle: d.position ?? null,
      company: d.organization ?? null,
      phones: d.phone_number ? [d.phone_number] : [],
      emails: d.email ? [d.email] : [],
      socialProfiles,
      provider: "hunter",
      configured: true,
    };
  } catch {
    return null;
  }
}

// ── Public entry point ────────────────────────────────────────────────────────
export async function enrichPerson(params: {
  email?: string;
  phone?: string;
}): Promise<EnrichResult> {
  const pdlKey = process.env.PDL_API_KEY;
  const hunterKey = process.env.HUNTER_API_KEY;

  if (!pdlKey && !hunterKey) {
    return {
      ...emptyFields(),
      provider: "",
      configured: false,
      error: "Person enrichment not configured. Add PDL_API_KEY or HUNTER_API_KEY to your environment.",
    };
  }

  // Run available providers in parallel.
  const [pdlResult, hunterResult] = await Promise.all([
    pdlKey ? viaPDL(params, pdlKey) : Promise.resolve(null),
    // Hunter only supports email lookups
    hunterKey && params.email ? viaHunter(params.email, hunterKey) : Promise.resolve(null),
  ]);

  if (pdlResult && hunterResult) return merge(pdlResult, hunterResult);
  if (pdlResult) return pdlResult;
  if (hunterResult) return hunterResult;

  return {
    ...emptyFields(),
    provider: [pdlKey ? "pdl" : "", hunterKey ? "hunter" : ""].filter(Boolean).join("+"),
    configured: true,
  };
}
