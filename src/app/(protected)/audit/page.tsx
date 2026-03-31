export default function AuditPage() {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-panel">
      <p className="text-sm uppercase tracking-[0.22em] text-amber">Audit</p>
      <h1 className="mt-3 font-serif text-4xl text-ink">
        Audit logging foundation is enabled in the backend domain
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
        The backend stores audit records for sensitive operational changes. This
        screen is intentionally conservative until more mutation workflows are
        implemented.
      </p>
    </section>
  );
}
