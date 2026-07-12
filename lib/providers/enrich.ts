import { EnrichResult, SocialProfile } from "../types";

const empty = (): Omit<EnrichResult, "provider" | "configured"> => ({
  name: null,
  firstName: null,
  lastName: null,
  age: null,
  birthYear: null,
  location: null,
  jobTitle: null,
  company: null,
  phones: [],
  emails: [],
  socialProfiles: [],
});

/**
 * People Data Labs person enrichment.
 * Docs: https://docs.peopledatalabs.com/docs/person-enrichment-api
 * Free tier: 100 API calls / month — sign up at app.peopledatalabs.com
 *
 * Accepts email OR phone (or both). Returns name, age/birth_year,
 * location, job, social profiles (LinkedIn, Twitter, GitHub, etc.)
 */
export async function enrichPerson(params: {
  email?: string;
  phone?: string;
}): Promise<EnrichResult> {
  const key = process.env.PDL_API_KEY;

  if (!key) {
    return {
      ...empty(),
      provider: "pdl",
      configured: false,
      error: "Person enrichment not configured. Add PDL_API_KEY to your environment.",
    };
  }

  const qs = new URLSearchParams({ pretty: "false" });
  if (params.email) qs.set("email", params.email);
  if (params.phone) qs.set("phone", params.phone);

  try {
    const res = await fetch(
      `https://api.peopledatalabs.com/v5/person/enrich?${qs.toString()}`,
      {
        headers: { "X-Api-Key": key },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      }
    );

    if (res.status === 404) {
      return { ...empty(), provider: "pdl", configured: true };
    }

    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const body: any = await res.json();
        if (body?.error?.message) detail += `: ${body.error.message}`;
      } catch {}
      return {
        ...empty(),
        provider: "pdl",
        configured: true,
        error: `Enrichment error — ${detail}.`,
      };
    }

    const body: any = await res.json();
    const d = body?.data;
    if (!d) {
      return { ...empty(), provider: "pdl", configured: true };
    }

    const socialProfiles: SocialProfile[] = (d.profiles ?? []).map((p: any) => ({
      network: p.network ?? "unknown",
      url: p.url ?? null,
      username: p.username ?? null,
    }));

    const age =
      d.inferred_years_experience != null
        ? null
        : d.birth_year
        ? new Date().getFullYear() - Number(d.birth_year)
        : null;

    return {
      name: d.full_name ?? null,
      firstName: d.first_name ?? null,
      lastName: d.last_name ?? null,
      age: age,
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
  } catch (err: any) {
    const msg = err?.name === "TimeoutError" ? "Request timed out." : (err?.message ?? "Unknown error.");
    return {
      ...empty(),
      provider: "pdl",
      configured: true,
      error: `Enrichment request failed — ${msg}`,
    };
  }
}
