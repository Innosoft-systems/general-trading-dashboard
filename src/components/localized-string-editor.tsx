"use client";

import { FormField, TextArea, TextInput } from "./form-field";

type Localized = { uz: string; ru: string; en: string };

export function LocalizedStringEditor({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: Localized;
  onChange: (next: Localized) => void;
  multiline?: boolean;
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 p-4">
      <p className="text-sm font-semibold text-ink">{label}</p>
      {(["ru", "en", "uz"] as const).map((locale) => (
        <FormField key={locale} label={locale.toUpperCase()}>
          {multiline ? (
            <TextArea
              value={value[locale]}
              onChange={(event) =>
                onChange({ ...value, [locale]: event.target.value })
              }
            />
          ) : (
            <TextInput
              value={value[locale]}
              onChange={(event) =>
                onChange({ ...value, [locale]: event.target.value })
              }
            />
          )}
        </FormField>
      ))}
    </div>
  );
}
