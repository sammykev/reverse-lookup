import SearchPanel from "@/components/SearchPanel";

export const metadata = { title: "Email Verification — ReverseLookup" };

export default function EmailPage({ searchParams }: { searchParams: { q?: string } }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Email verification</h1>
      <SearchPanel initialKind="email" initialQuery={searchParams.q || ""} />
    </div>
  );
}
