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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function viaAbstract(email: string, key: string): Promise<EmailResult | null> {
  const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${key}&email=${encodeURIComponent(email)}`;

  for (let attempt = 0; attempt < 2; attempt++) {
    let res: Response;
    try {
      res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
    } catch {
      return null;
    }

    if (res.status === 429) {
      if (attempt === 0) {
        await sleep(1500);
        continue;
      }
      return null; // still rate-limited after retry → hand off to fallback
    }

    if (!res.ok) return null;

    const data: any = await res.json();
    if (!data || data.email === undefined) return null;

    return {
      query: email,
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
  }
  return null;
}

async function viaMailboxlayer(email: string, key: string): Promise<EmailResult | null> {
  // Free tier uses http; paid tier supports https
  const url = `http://apilayer.net/api/check?access_key=${key}&email=${encodeURIComponent(email)}&smtp=1&format=1`;
  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  const data: any = await res.json();
  if (!data || data.email === undefined) return null;

  const deliverable: EmailResult["deliverable"] = data.smtp_check
    ? "DELIVERABLE"
    : data.mx_found
    ? "UNKNOWN"
    : "UNDELIVERABLE";

  return {
    query: email,
    deliverable,
    validFormat: data.format_valid ?? null,
    qualityScore: data.score != null ? Number(data.score) : null,
    isFree: data.free ?? null,
    isDisposable: data.disposable ?? null,
    isRole: data.role ?? null,
    mxFound: data.mx_found ?? null,
    smtpValid: data.smtp_check ?? null,
    autocorrect: data.did_you_mean || null,
    provider: "mailboxlayer",
  };
}

export async function lookupEmail(raw: string): Promise<EmailResult> {
  const email = raw.trim();
  const abstractKey = process.env.ABSTRACT_EMAIL_API_KEY;
  const mailboxlayerKey = process.env.MAILBOXLAYER_API_KEY;

  if (!abstractKey && !mailboxlayerKey) {
    return {
      ...empty(raw),
      error: "No email provider configured. Set ABSTRACT_EMAIL_API_KEY or MAILBOXLAYER_API_KEY.",
    };
  }

  try {
    if (abstractKey) {
      const result = await viaAbstract(email, abstractKey);
      if (result) return result;
    }

    if (mailboxlayerKey) {
      const result = await viaMailboxlayer(email, mailboxlayerKey);
      if (result) return result;
      return { ...empty(raw), error: "Mailboxlayer request failed. Check your MAILBOXLAYER_API_KEY." };
    }

    return {
      ...empty(raw),
      error: "Abstract rate limit hit and no Mailboxlayer fallback configured. Add MAILBOXLAYER_API_KEY in Vercel.",
    };
  } catch (err: any) {
    const msg = err?.name === "TimeoutError" ? "Request timed out (10s)." : (err?.message ?? "Unknown error.");
    return { ...empty(raw), error: `Email provider request failed — ${msg}` };
  }
}
