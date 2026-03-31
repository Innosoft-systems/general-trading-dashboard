export function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm text-slate-700">
      <span className="font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`rounded-2xl border border-slate-300 px-4 py-3 outline-none ${props.className ?? ""}`}
    />
  );
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={`min-h-28 rounded-2xl border border-slate-300 px-4 py-3 outline-none ${props.className ?? ""}`}
    />
  );
}
