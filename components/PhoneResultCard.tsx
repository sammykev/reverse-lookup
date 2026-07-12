import { PhoneResult } from "@/lib/types";
import { ResultRow, Badge } from "./ResultRow";
import EnrichCard from "./EnrichCard";

function boolBadge(value: boolean | null) {
  if (value === null) return <span className="text-slate-400">—</span>;
  return value ? <Badge tone="green">Valid</Badge> : <Badge tone="red">Invalid</Badge>;
}

export default function PhoneResultCard({ result }: { result: PhoneResult }) {
  return (
    <div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{result.formatted || result.query}</h2>
            <p className="text-sm text-slate-500">Reverse phone lookup</p>
          </div>
          {boolBadge(result.valid)}
        </div>
        <ResultRow label="Carrier" value={result.carrier} />
        <ResultRow label="Line type" value={result.lineType ? <span className="capitalize">{result.lineType}</span> : null} />
        <ResultRow label="Location" value={result.location} />
        <ResultRow label="Country" value={result.countryName} />
        <ResultRow label="Local format" value={result.localFormat} />
        {result.provider && (
          <p className="mt-4 text-xs text-slate-400">Data source: {result.provider}</p>
        )}
      </div>
      {result.enrichment && <EnrichCard enrich={result.enrichment} />}
    </div>
  );
}
