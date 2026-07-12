# ReverseLookup

A reverse-lookup web app in the style of reverselookup.com. Search a **phone
number**, verify an **email address**, or search for a **person by name** — with
real data from trusted providers, wired server-side so API keys never reach the
browser.

Built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**.

## Features

| Lookup | Data provider | What you get |
| --- | --- | --- |
| Reverse phone | [NumVerify](https://numverify.com) (free tier) → [Abstract](https://www.abstractapi.com/api/phone-validation-api) fallback | validity, carrier, line type, region, country |
| Email verification | [Abstract Email Validation](https://www.abstractapi.com/api/email-verification-validation-api) | deliverability, format, MX/SMTP, disposable/free/role flags |
| People search | Pluggable provider (`PEOPLE_PROVIDER_URL`) | name, age, location, phones, emails, relatives |

## Getting started

```bash
npm install
cp .env.example .env.local   # add your API keys
npm run dev                  # http://localhost:3000
```

The app runs without keys — each lookup degrades gracefully to a clear
"provider not configured" message — so you can wire providers in one at a time.

## Environment variables

See [`.env.example`](./.env.example). All keys are read **server-side only** in
Next.js route handlers under `app/api/lookup/*`.

- `NUMVERIFY_API_KEY` — primary phone provider (free tier: 100 lookups/month).
- `ABSTRACT_PHONE_API_KEY` — phone fallback.
- `ABSTRACT_EMAIL_API_KEY` — email verification.
- `PEOPLE_PROVIDER_URL` / `PEOPLE_PROVIDER_API_KEY` — people search (see below).

## People search & the data reality

Full owner-identity data (real name → address, relatives, associated numbers)
is licensed from **regulated data brokers**; there is no dependable free API,
and reselling it is subject to the US **Fair Credit Reporting Act (FCRA)** — it
must not be used for employment, tenant, credit, or insurance screening.

Rather than fabricate results, people search calls a JSON HTTP endpoint **you**
control via `PEOPLE_PROVIDER_URL`. That endpoint fronts whatever licensed source
you have a contract with. It receives `?name=<full name>&state=<optional>` and
must return:

```json
{
  "results": [
    {
      "name": "Jane Doe",
      "age": 42,
      "location": "Austin, TX",
      "phones": ["+1 512 555 0143"],
      "emails": ["jane@example.com"],
      "relatives": ["John Doe"]
    }
  ]
}
```

Swapping providers is a single-file change in [`lib/providers/people.ts`](./lib/providers/people.ts).

## Project structure

```
app/
  page.tsx                 landing page + search
  {phone,email,name}/      shareable result routes (?q=...)
  api/lookup/{...}/route.ts server-side provider calls
components/                UI (search panel, result cards)
lib/
  providers/               phone.ts, email.ts, people.ts
  types.ts, validate.ts
```

## Legal

For personal use only. ReverseLookup is not a consumer reporting agency.
