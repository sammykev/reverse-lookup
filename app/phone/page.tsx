import SearchPanel from "@/components/SearchPanel";

export const metadata = { title: "Reverse Phone Lookup — ReverseLookup" };

export default function PhonePage({ searchParams }: { searchParams: { q?: string } }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Reverse phone lookup</h1>
      <SearchPanel initialKind="phone" initialQuery={searchParams.q || ""} />
    </div>
  );
}
