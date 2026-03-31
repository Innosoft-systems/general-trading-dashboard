export function DataPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-panel">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-2xl text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}
