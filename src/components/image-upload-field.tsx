"use client";

import { useState } from "react";

import { dashboardUploadFile } from "@/lib/api";

import { FormField, TextInput } from "./form-field";
import { StatusBanner } from "./status-banner";

export function ImageUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const uploaded = await dashboardUploadFile("/admin/media/upload", file);
      onChange(uploaded.url);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 p-4">
      <FormField label={label}>
        <TextInput
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://... or uploaded file URL"
        />
      </FormField>
      {value ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <img src={value} alt={label} className="h-48 w-full object-cover" />
        </div>
      ) : null}
      <div className="flex items-center gap-3">
        <label className="inline-flex cursor-pointer rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => void onFileChange(event)}
          />
          {uploading ? "Uploading..." : "Upload image"}
        </label>
        <p className="text-xs text-slate-500">PNG, JPG, WebP, AVIF up to 8MB</p>
      </div>
      {error ? <StatusBanner message={error} tone="error" /> : null}
    </div>
  );
}

export function ImageArrayUploadField({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
}) {
  const [manualUrl, setManualUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const uploaded = await dashboardUploadFile("/admin/media/upload", file);
      onChange([...values, uploaded.url]);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 p-4">
      <p className="text-sm font-semibold text-ink">{label}</p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {values.map((url) => (
          <div
            key={url}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
          >
            <img src={url} alt={label} className="h-32 w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(values.filter((item) => item !== url))}
              className="w-full border-t border-slate-200 px-3 py-2 text-sm text-rose-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <label className="inline-flex cursor-pointer rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => void onFileChange(event)}
          />
          {uploading ? "Uploading..." : "Upload image"}
        </label>
        <TextInput
          value={manualUrl}
          onChange={(event) => setManualUrl(event.target.value)}
          placeholder="Paste image URL"
          className="min-w-[18rem]"
        />
        <button
          type="button"
          onClick={() => {
            if (!manualUrl.trim()) return;
            onChange([...values, manualUrl.trim()]);
            setManualUrl("");
          }}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm"
        >
          Add URL
        </button>
      </div>
      {error ? <StatusBanner message={error} tone="error" /> : null}
    </div>
  );
}
