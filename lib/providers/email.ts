import { EmailResult } from "../types";

const empty = (query: string): EmailResult => ({
  query,
  deliverable: null,
  validFormat: null,
  qualityScore: null,
  isFree: null,
  isDisposable: null,
  isRole: null,
  mxFound: null,
  smtpValid: null,
  autocorrect: null,
  provider: null,
});

export async function lookupEmail(raw: string): Promise<EmailResult> {
  const email = raw.trim();
  const key = process.env.ABSTRACT_EMAIL_API_KEY;

  if (!key) {
    return {
      ...empty(raw),
      error: "No email provider configured. Set ABSTRACT_EMAIL_API_KEY in your environment.",
    };
  }

  try {
    const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${key}&email=${encodeURIComponent(email)}`;
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const body: any = await res.json();
        if (body?.error?.message) detail += `: ${body.error.message}`;
        else if (body?.message) detail += `: ${body.message}`;
      } catch {}
      return { ...empty(raw), error: `Email provider error — ${detail}. Check your ABSTRACT_EMAIL_API_KEY in Vercel.` };
    }
    const data: any = await res.json();
    if (!data || data.email === undefined) {
      return { ...empty(raw), error: "Email provider returned an unexpected response." };
    }
    return {
      query: raw,
      deliverable: data.deliverability || null,
      validFormat: data.is_valid_format?.value ?? null,
      qualityScore: data.quality_score != null ? Number(data.quality_score) : null,
      isFree: data.is_free_email?.value ?? null,
      isDisposable: data.is_disposable_email?.value ?? null,
      isRole: data.is_role_email?.value ?? null,
      mxFound: data.is_mx_found?.value ?? null,
      smtpValid: data.is_smtp_valid?.value ?? null,
      autocorrect: data.autocorrect || null,
      provider: "abstract",
    };
  } catch (err: any) {
    const msg = err?.name === "TimeoutError" ? "Request timed out (10s)." : (err?.message || "Unknown error.");
    return { ...empty(raw), error: `Email provider request failed — ${msg}` };
  }
}
