export function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  // keep a single leading + and digits only
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/[^\d]/g, "");
  return hasPlus ? `+${digits}` : digits;
}

export function isPlausiblePhone(raw: string): boolean {
  const digits = raw.replace(/[^\d]/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmailFormat(raw: string): boolean {
  return EMAIL_RE.test(raw.trim());
}

export function isPlausibleName(raw: string): boolean {
  return raw.trim().length >= 2;
}
