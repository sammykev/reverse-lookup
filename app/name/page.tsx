import SearchPanel from "@/components/SearchPanel";

export const metadata = { title: "People Search — ReverseLookup" };

export default function NamePage({ searchParams }: { searchParams: { q?: string } }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">People search</h1>
      <SearchPanel initialKind="name" initialQuery={searchParams.q || ""} />
    </div>
  );
}
