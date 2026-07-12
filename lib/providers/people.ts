import { PeopleResult, PersonRecord } from "../types";

/**
 * People / name search.
 *
 * Owner-identity data (real name -> address / relatives / associated numbers)
 * is sold by regulated data brokers; there is no dependable free API. Rather
 * than fabricate results, this provider calls a JSON HTTP endpoint that you
 * control (set PEOPLE_PROVIDER_URL). That endpoint can front any licensed
 * data source. If it is not configured, the app returns `configured: false`
 * and the UI explains how to wire one up.
 *
 * Expected response shape from PEOPLE_PROVIDER_URL:
 *   { "results": [ { "name", "age", "location", "phones":[],
 *                    "emails":[], "relatives":[] } ] }
 */
export async function lookupPeople(name: string, state?: string): Promise<PeopleResult> {
  const base = process.env.PEOPLE_PROVIDER_URL;
  const key = process.env.PEOPLE_PROVIDER_API_KEY;

  if (!base) {
    return {
      query: name,
      results: [],
      provider: null,
      configured: false,
      error:
        "People search is not configured. Set PEOPLE_PROVIDER_URL to a JSON endpoint backed by a licensed data source.",
    };
  }

  try {
    const url = new URL(base);
    url.searchParams.set("name", name);
    if (state) url.searchParams.set("state", state);

    const headers: Record<string, string> = { Accept: "application/json" };
    if (key) headers["Authorization"] = `Bearer ${key}`;

    const res = await fetch(url.toString(), { headers, cache: "no-store" });
    if (!res.ok) {
      return {
        query: name,
        results: [],
        provider: "custom",
        configured: true,
        error: `People provider returned ${res.status}.`,
      };
    }
    const data: any = await res.json();
    const results: PersonRecord[] = Array.isArray(data?.results) ? data.results : [];
    return { query: name, results, provider: "custom", configured: true };
  } catch (err) {
    return {
      query: name,
      results: [],
      provider: "custom",
      configured: true,
      error: "People provider request failed. Check PEOPLE_PROVIDER_URL and network.",
    };
  }
}
