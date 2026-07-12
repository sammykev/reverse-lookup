import { UsernameResult } from "@/lib/types";
import { ExternalLink, UserX } from "lucide-react";

const PLATFORM_COLORS: Record<string, string> = {
  "GitHub": "bg-slate-900 text-white",
  "Twitter / X": "bg-black text-white",
  "Instagram": "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  "TikTok": "bg-black text-white",
  "Reddit": "bg-orange-500 text-white",
  "Pinterest": "bg-red-600 text-white",
  "Tumblr": "bg-indigo-700 text-white",
  "Twitch": "bg-purple-600 text-white",
  "YouTube": "bg-red-600 text-white",
  "SoundCloud": "bg-orange-500 text-white",
  "Spotify": "bg-green-500 text-white",
  "Dev.to": "bg-slate-900 text-white",
  "Hashnode": "bg-blue-600 text-white",
  "Medium": "bg-slate-900 text-white",
  "Keybase": "bg-blue-500 text-white",
};

export default function UsernameResultCard({ result }: { result: UsernameResult }) {
  if (result.accounts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <UserX className="h-8 w-8 text-slate-300" />
        <div>
          <p className="font-medium text-slate-700">No accounts found for "{result.query}"</p>
          <p className="mt-1 text-sm text-slate-500">This username doesn't appear on any of the 15 platforms we check.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900">@{result.query}</h2>
        <p className="text-sm text-slate-500">
          Found on {result.accounts.length} platform{result.accounts.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {result.accounts.map((a) => (
          <a
            key={a.platform}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 hover:bg-slate-100"
          >
            <span className="font-medium text-slate-800">{a.platform}</span>
            <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
          </a>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-400">Checked {15} platforms · results reflect public account existence only</p>
    </div>
  );
}
