import Link from "next/link";
import { Search } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-white">
            <Search className="h-4 w-4" />
          </span>
          <span className="text-lg">ReverseLookup</span>
        </Link>
        <nav className="hidden gap-6 text-sm text-slate-600 sm:flex">
          <Link href="/phone" className="hover:text-brand-600">Phone</Link>
          <Link href="/email" className="hover:text-brand-600">Email</Link>
          <Link href="/name" className="hover:text-brand-600">People</Link>
          <Link href="/username" className="hover:text-brand-600">Username</Link>
        </nav>
      </div>
    </header>
  );
}
