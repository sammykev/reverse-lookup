export type LookupKind = "phone" | "email" | "name";

export interface SocialProfile {
  network: string;
  url: string | null;
  username: string | null;
}

export interface EnrichResult {
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  age: number | null;
  birthYear: number | null;
  location: string | null;
  jobTitle: string | null;
  company: string | null;
  phones: string[];
  emails: string[];
  socialProfiles: SocialProfile[];
  provider: string;
  configured: boolean;
  error?: string;
}

export interface PhoneResult {
  query: string;
  valid: boolean | null;
  formatted: string | null;
  localFormat: string | null;
  countryCode: string | null;
  countryName: string | null;
  location: string | null;
  carrier: string | null;
  lineType: string | null;
  provider: string | null;
  enrichment?: EnrichResult | null;
  error?: string;
}

export interface EmailResult {
  query: string;
  deliverable: "DELIVERABLE" | "UNDELIVERABLE" | "UNKNOWN" | null;
  validFormat: boolean | null;
  qualityScore: number | null;
  isFree: boolean | null;
  isDisposable: boolean | null;
  isRole: boolean | null;
  mxFound: boolean | null;
  smtpValid: boolean | null;
  autocorrect: string | null;
  provider: string | null;
  enrichment?: EnrichResult | null;
  error?: string;
}

export interface PersonRecord {
  name: string;
  age?: string | number | null;
  location?: string | null;
  phones?: string[];
  emails?: string[];
  relatives?: string[];
}

export interface PeopleResult {
  query: string;
  results: PersonRecord[];
  provider: string | null;
  configured: boolean;
  error?: string;
}
