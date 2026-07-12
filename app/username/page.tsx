import SearchPanel from "@/components/SearchPanel";

export const metadata = { title: "Username Search — ReverseLookup" };

export default function UsernamePage({ searchParams }: { searchParams: { q?: string } }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Username search</h1>
      <SearchPanel initialKind="username" initialQuery={searchParams.q || ""} />
    </div>
  );
}
