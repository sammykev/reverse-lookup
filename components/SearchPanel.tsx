"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { LookupKind, PhoneResult, EmailResult, PeopleResult } from "@/lib/types";
import PhoneResultCard from "./PhoneResultCard";
import EmailResultCard from "./EmailResultCard";
import PeopleResultCard from "./PeopleResultCard";

const TABS: { kind: LookupKind; label: string; placeholder: string }[] = [
  { kind: "phone", label: "Phone", placeholder: "e.g. +1 202 555 0143" },
  { kind: "email", label: "Email", placeholder: "e.g. jane@example.com" },
  { kind: "name", label: "People", placeholder: "e.g. Jane Doe" },
];

type AnyResult = PhoneResult | EmailResult | PeopleResult;

export default function SearchPanel({
  initialKind = "phone",
  initialQuery = "",
}: {
  initialKind?: LookupKind;
  initialQuery?: string;
}) {
  const router = useRouter();
  const [kind, setKind] = useState<LookupKind>(initialKind);
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnyResult | null>(null);

  const run = useCallback(async (k: LookupKind, q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/lookup/${k}?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Lookup failed.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-run when arriving on a result page with a prefilled query.
  useEffect(() => {
    if (initialQuery.trim()) run(initialKind, initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/${kind}?q=${encodeURIComponent(query.trim())}`);
    run(kind, query);
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.kind}
            type="button"
            onClick={() => {
              setKind(t.kind);
              setResult(null);
              setError(null);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              kind === t.kind
                ? "bg-brand-500 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={TABS.find((t) => t.kind === kind)?.placeholder}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-brand-600 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search
        </button>
      </form>

      <div className="mt-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}
        {result && !error && (
          <>
            {kind === "phone" && <PhoneResultCard result={result as PhoneResult} />}
            {kind === "email" && <EmailResultCard result={result as EmailResult} />}
            {kind === "name" && <PeopleResultCard result={result as PeopleResult} />}
            {(result as any).error && kind !== "name" && (
              <p className="mt-3 text-sm text-amber-600">{(result as any).error}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
