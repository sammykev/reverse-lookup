import { BreachResult, Breach } from "@/lib/types";
import { ShieldAlert, ShieldCheck, AlertTriangle, ExternalLink } from "lucide-react";

const DATA_CLASS_COLORS: Record<string, string> = {
  "Passwords": "bg-red-100 text-red-700",
  "Email addresses": "bg-orange-100 text-orange-700",
  "Phone numbers": "bg-orange-100 text-orange-700",
  "Physical addresses": "bg-amber-100 text-amber-700",
  "Credit cards": "bg-red-100 text-red-700",
  "Social media profiles": "bg-purple-100 text-purple-700",
  "IP addresses": "bg-slate-100 text-slate-600",
  "Usernames": "bg-blue-100 text-blue-700",
  "Names": "bg-sky-100 text-sky-700",
  "Dates of birth": "bg-pink-100 text-pink-700",
  "Geographic locations": "bg-amber-100 text-amber-700",
};

function dataClass(label: string) {
  const cls = DATA_CLASS_COLORS[label] ?? "bg-slate-100 text-slate-600";
  return (
    <span key={label} className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function BreachItem({ breach }: { breach: Breach }) {
  return (
    <div className="rounded-xl border border-red-100 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-900">{breach.title}</p>
          <p className="text-xs text-slate-400">
            {breach.domain} · Breached {breach.breachDate} · {breach.pwnCount.toLocaleString()} accounts
          </p>
        </div>
        {breach.isVerified && (
          <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            Verified
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {breach.dataClasses.map((d) => dataClass(d))}
      </div>
    </div>
  );
}

export default function BreachCard({ result }: { result: BreachResult }) {
  if (!result.configured) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-medium text-slate-700">Breach lookup not configured</p>
        <p className="mt-1 text-sm text-slate-500">
          Add <code className="rounded bg-slate-100 px-1">HIBP_API_KEY</code> from{" "}
          <span className="text-brand-600">haveibeenpwned.com/API/Key</span> to show data breach history.
          Plans start at $3.50/month.
        </p>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
        {result.error}
      </div>
    );
  }

  if (result.breaches.length === 0) {
    return (
      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-5">
        <ShieldCheck className="h-6 w-6 shrink-0 text-green-600" />
        <div>
          <p className="font-semibold text-green-900">No breaches found</p>
          <p className="text-sm text-green-700">
            This email doesn't appear in any known data breaches.
            {result.pasteCount !== null && result.pasteCount > 0 && (
              <span className="ml-1">({result.pasteCount} paste{result.pasteCount !== 1 ? "s" : ""} found)</span>
            )}
          </p>
        </div>
      </div>
    );
  }

  const sensitiveCount = result.breaches.filter((b) => b.isSensitive).length;

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
        <ShieldAlert className="h-6 w-6 shrink-0 text-red-600" />
        <div>
          <p className="font-semibold text-red-900">
            Found in {result.breaches.length} data breach{result.breaches.length !== 1 ? "es" : ""}
          </p>
          <p className="text-sm text-red-700">
            {sensitiveCount > 0 && `${sensitiveCount} sensitive · `}
            {result.pasteCount !== null && result.pasteCount > 0 && `${result.pasteCount} paste${result.pasteCount !== 1 ? "s" : ""} · `}
            Sorted most recent first
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {result.breaches.map((b) => (
          <BreachItem key={b.name} breach={b} />
        ))}
      </div>

      <p className="mt-3 text-xs text-slate-400">Data source: HaveIBeenPwned</p>
    </div>
  );
}
