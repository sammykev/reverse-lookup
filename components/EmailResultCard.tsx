import { EmailResult } from "@/lib/types";
import { ResultRow, Badge } from "./ResultRow";

function deliverabilityBadge(value: EmailResult["deliverable"]) {
  if (!value) return <span className="text-slate-400">—</span>;
  if (value === "DELIVERABLE") return <Badge tone="green">Deliverable</Badge>;
  if (value === "UNDELIVERABLE") return <Badge tone="red">Undeliverable</Badge>;
  return <Badge tone="amber">Unknown</Badge>;
}

function yesNo(value: boolean | null, invertTone = false) {
  if (value === null) return <span className="text-slate-400">—</span>;
  const tone = invertTone ? (value ? "red" : "green") : value ? "green" : "slate";
  return <Badge tone={tone as any}>{value ? "Yes" : "No"}</Badge>;
}

export default function EmailResultCard({ result }: { result: EmailResult }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{result.query}</h2>
          <p className="text-sm text-slate-500">Email verification</p>
        </div>
        {deliverabilityBadge(result.deliverable)}
      </div>
      <ResultRow label="Valid format" value={yesNo(result.validFormat)} />
      <ResultRow
        label="Quality score"
        value={result.qualityScore != null ? result.qualityScore.toFixed(2) : null}
      />
      <ResultRow label="MX records found" value={yesNo(result.mxFound)} />
      <ResultRow label="SMTP valid" value={yesNo(result.smtpValid)} />
      <ResultRow label="Free provider" value={yesNo(result.isFree)} />
      <ResultRow label="Disposable" value={yesNo(result.isDisposable, true)} />
      <ResultRow label="Role address" value={yesNo(result.isRole)} />
      {result.autocorrect && (
        <ResultRow label="Did you mean" value={<span className="text-brand-600">{result.autocorrect}</span>} />
      )}
      {result.provider && (
        <p className="mt-4 text-xs text-slate-400">Data source: {result.provider}</p>
      )}
    </div>
  );
}
