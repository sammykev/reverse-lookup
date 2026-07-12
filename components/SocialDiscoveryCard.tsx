import { SocialDiscoveryResult } from "@/lib/types";
import { Globe } from "lucide-react";

export default function SocialDiscoveryCard({ result }: { result: SocialDiscoveryResult }) {
  if (result.accounts.length === 0) return null;

  return (
    <div className="mt-4 rounded-2xl border border-purple-100 bg-purple-50 p-5">
      <p className="mb-3 flex items-center gap-2 font-semibold text-purple-900">
        <Globe className="h-4 w-4" />
        Linked accounts found ({result.accounts.length})
      </p>
      <div className="flex flex-wrap gap-2">
        {result.accounts.map((a) => (
          <a
            key={a.platform}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-purple-700 shadow-sm ring-1 ring-purple-200 hover:bg-purple-50"
          >
            {a.platform}
            {a.username && <span className="text-slate-400">@{a.username}</span>}
          </a>
        ))}
      </div>
    </div>
  );
}
