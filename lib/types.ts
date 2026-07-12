export type LookupKind = "phone" | "email" | "name" | "username";

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
  breaches?: BreachResult | null;
  socialDiscovery?: SocialDiscoveryResult | null;
  error?: string;
}

// ── Breach lookup ────────────────────────────────────────────────────────────
export interface Breach {
  name: string;
  title: string;
  domain: string;
  breachDate: string;
  addedDate: string;
  pwnCount: number;
  dataClasses: string[];
  description: string;
  isVerified: boolean;
  isSensitive: boolean;
  logoPath: string | null;
}

export interface BreachResult {
  query: string;
  breaches: Breach[];
  pasteCount: number | null;
  configured: boolean;
  provider: string;
  error?: string;
}

// ── Social account discovery ─────────────────────────────────────────────────
export interface SocialAccount {
  platform: string;
  url: string;
  username: string;
  found: boolean;
}

export interface SocialDiscoveryResult {
  query: string;
  accounts: SocialAccount[];
  configured: boolean;
  error?: string;
}

// ── Username search ──────────────────────────────────────────────────────────
export interface UsernameResult {
  query: string;
  accounts: SocialAccount[];
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
