import SearchPanel from "@/components/SearchPanel";
import { Phone, Mail, Users, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      <section className="bg-gradient-to-b from-brand-50 to-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Find out who&apos;s behind a number, email, or name
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
            Real carrier and deliverability data, plus public-records people search — all in
            one place.
          </p>
          <div className="mx-auto mt-8 max-w-2xl">
            <SearchPanel />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          <Feature icon={<Phone className="h-5 w-5" />} title="Reverse phone">
            Identify a caller&apos;s carrier, line type, and region from any number.
          </Feature>
          <Feature icon={<Mail className="h-5 w-5" />} title="Email verification">
            Check deliverability, spot disposable addresses, and validate mailboxes.
          </Feature>
          <Feature icon={<Users className="h-5 w-5" />} title="People search">
            Search public records by name to find associated details.
          </Feature>
        </div>

        <div className="mt-12 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-6">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-500" />
          <p className="text-sm text-slate-600">
            For personal use only. ReverseLookup is not a consumer reporting agency and results
            may not be used for employment, tenant, credit, or insurance decisions.
          </p>
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{children}</p>
    </div>
  );
}
