import { PeopleResult } from "@/lib/types";
import { Phone, Mail, MapPin, Users } from "lucide-react";

export default function PeopleResultCard({ result }: { result: PeopleResult }) {
  if (!result.configured) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-lg font-semibold text-amber-900">People search not configured</h2>
        <p className="mt-2 text-sm text-amber-800">
          Owner-identity data comes from regulated data brokers, so there is no free API to
          plug in. To enable people search, point <code className="rounded bg-amber-100 px-1">PEOPLE_PROVIDER_URL</code> at
          a JSON endpoint backed by a licensed data source. See the README for the expected
          response shape.
        </p>
      </div>
    );
  }

  if (result.results.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500">
        No records found for “{result.query}”.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {result.results.map((person, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">{person.name}</h3>
            {person.age != null && <span className="text-sm text-slate-500">Age {person.age}</span>}
          </div>
          {person.location && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
              <MapPin className="h-4 w-4" /> {person.location}
            </p>
          )}
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Detail icon={<Phone className="h-4 w-4" />} label="Phones" items={person.phones} />
            <Detail icon={<Mail className="h-4 w-4" />} label="Emails" items={person.emails} />
            <Detail icon={<Users className="h-4 w-4" />} label="Relatives" items={person.relatives} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Detail({ icon, label, items }: { icon: React.ReactNode; label: string; items?: string[] }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
        {icon} {label}
      </p>
      {items && items.length > 0 ? (
        <ul className="mt-1 space-y-0.5 text-sm text-slate-800">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-sm text-slate-400">—</p>
      )}
    </div>
  );
}
