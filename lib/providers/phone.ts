import { PhoneResult } from "../types";
import { normalizePhone } from "../validate";

const empty = (query: string): PhoneResult => ({
  query,
  valid: null,
  formatted: null,
  localFormat: null,
  countryCode: null,
  countryName: null,
  location: null,
  carrier: null,
  lineType: null,
  provider: null,
});

async function viaNumverify(number: string, query: string, key: string): Promise<PhoneResult | null> {
  const url = `https://apilayer.net/api/validate?access_key=${key}&number=${encodeURIComponent(number)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const data: any = await res.json();
  if (!data || data.success === false || data.number === undefined) return null;
  return {
    query,
    valid: !!data.valid,
    formatted: data.international_format || null,
    localFormat: data.local_format || null,
    countryCode: data.country_code || null,
    countryName: data.country_name || null,
    location: data.location || null,
    carrier: data.carrier || null,
    lineType: data.line_type || null,
    provider: "numverify",
  };
}

async function viaAbstract(number: string, query: string, key: string): Promise<PhoneResult | null> {
  const url = `https://phonevalidation.abstractapi.com/v1/?api_key=${key}&phone=${encodeURIComponent(number)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const data: any = await res.json();
  if (!data || data.phone === undefined) return null;
  return {
    query,
    valid: !!data.valid,
    formatted: data.format?.international || null,
    localFormat: data.format?.local || null,
    countryCode: data.country?.code || null,
    countryName: data.country?.name || null,
    location: data.location || data.country?.name || null,
    carrier: data.carrier || null,
    lineType: data.type || null,
    provider: "abstract",
  };
}

export async function lookupPhone(raw: string): Promise<PhoneResult> {
  const number = normalizePhone(raw);
  const numverifyKey = process.env.NUMVERIFY_API_KEY;
  const abstractKey = process.env.ABSTRACT_PHONE_API_KEY;

  try {
    if (numverifyKey) {
      const result = await viaNumverify(number, raw, numverifyKey);
      if (result) return result;
    }
    if (abstractKey) {
      const result = await viaAbstract(number, raw, abstractKey);
      if (result) return result;
    }
  } catch (err) {
    return { ...empty(raw), error: "Phone provider request failed. Check your API key and network." };
  }

  return {
    ...empty(raw),
    error: "No phone provider configured. Set NUMVERIFY_API_KEY or ABSTRACT_PHONE_API_KEY in your environment.",
  };
}
