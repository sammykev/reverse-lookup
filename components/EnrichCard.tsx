import { EnrichResult } from "@/lib/types";
import { User, MapPin, Briefcase, Phone, Mail, Share2 } from "lucide-react";

const NETWORK_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  twitter: "Twitter / X",
  github: "GitHub",
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  angellist: "AngelList",
  crunchbase: "Crunchbase",
};

export default function EnrichCard({ enrich }: { enrich: EnrichResult }) {
  if (!enrich.configured) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-medium text-slate-700">Person enrichment not configured</p>
        <p className="mt-1 text-sm text-slate-500">
          Add <code className="rounded bg-slate-100 px-1">PDL_API_KEY</code> to your Vercel environment variables to
          show name, age, location, and social profiles. Free at{" "}
          <span className="text-brand-600">app.peopledatalabs.com</span>.
        </p>
      </div>
    );
  }

  const hasData =
    enrich.name ||
    enrich.location ||
    enrich.jobTitle ||
    enrich.phones.length > 0 ||
    enrich.emails.length > 0 ||
    enrich.socialProfiles.length > 0;

  if (!hasData) {
    if (enrich.error) {
      return (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          {enrich.error}
        </div>
      );
    }
    return (
      <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
        No person record found for this identifier.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-500 text-white">
          <User className="h-4 w-4" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">{enrich.name ?? "Unknown person"}</p>
          {(enrich.age || enrich.birthYear) && (
            <p className="text-sm text-slate-500">
              {enrich.age ? `Age ~${enrich.age}` : ""}
              {enrich.age && enrich.birthYear ? " · " : ""}
              {enrich.birthYear ? `Born ${enrich.birthYear}` : ""}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {enrich.location && (
          <InfoRow icon={<MapPin className="h-4 w-4" />} label="Location" value={enrich.location} />
        )}
        {(enrich.jobTitle || enrich.company) && (
          <InfoRow
            icon={<Briefcase className="h-4 w-4" />}
            label="Work"
            value={[enrich.jobTitle, enrich.company].filter(Boolean).join(" at ")}
          />
        )}
        {enrich.phones.length > 0 && (
          <InfoRow
            icon={<Phone className="h-4 w-4" />}
            label="Phone(s)"
            value={enrich.phones.join(", ")}
          />
        )}
        {enrich.emails.length > 0 && (
          <InfoRow
            icon={<Mail className="h-4 w-4" />}
            label="Email(s)"
            value={enrich.emails.join(", ")}
          />
        )}
      </div>

      {enrich.socialProfiles.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
            <Share2 className="h-3.5 w-3.5" /> Social profiles
          </p>
          <div className="flex flex-wrap gap-2">
            {enrich.socialProfiles.map((p, i) => (
              <a
                key={i}
                href={p.url ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-medium text-brand-600 shadow-sm ring-1 ring-brand-100 hover:bg-brand-50"
              >
                {NETWORK_LABELS[p.network] ?? p.network}
                {p.username && <span className="text-slate-400">@{p.username}</span>}
              </a>
            ))}
          </div>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">Data source: People Data Labs</p>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}
