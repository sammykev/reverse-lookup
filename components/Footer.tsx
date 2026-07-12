export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-slate-500">
        <p className="max-w-3xl">
          ReverseLookup provides phone validation, email verification, and public-records
          search for personal use only. It is not a consumer reporting agency. Do not use
          this data for employment, tenant, credit, or insurance screening, or any purpose
          covered by the Fair Credit Reporting Act (FCRA).
        </p>
        <p className="mt-4">© {new Date().getFullYear()} ReverseLookup</p>
      </div>
    </footer>
  );
}
