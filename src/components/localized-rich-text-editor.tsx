"use client";

import { RichTextEditor } from "./rich-text-editor";

type Localized = { uz: string; ru: string; en: string };

export function LocalizedRichTextEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Localized;
  onChange: (next: Localized) => void;
}) {
  return (
    <div className="grid gap-4 rounded-2xl border border-slate-200 p-4">
      <p className="text-sm font-semibold text-ink">{label}</p>
      {(["ru", "en", "uz"] as const).map((locale) => (
        <div key={locale} className="grid gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            {locale}
          </p>
          <RichTextEditor
            value={value[locale]}
            onChange={(next) => onChange({ ...value, [locale]: next })}
          />
        </div>
      ))}
    </div>
  );
}
