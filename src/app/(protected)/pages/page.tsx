"use client";

import { useEffect, useState } from "react";

import { DataPanel } from "@/components/data-panel";
import { FormField, TextArea, TextInput } from "@/components/form-field";
import { ImageArrayUploadField } from "@/components/image-upload-field";
import { LocalizedRichTextEditor } from "@/components/localized-rich-text-editor";
import { LocalizedStringEditor } from "@/components/localized-string-editor";
import { ListTable } from "@/components/list-table";
import { StatusBanner } from "@/components/status-banner";
import {
  dashboardDelete,
  dashboardGet,
  dashboardPatch,
  dashboardPost,
} from "@/lib/api";

const blankLocalized = { uz: "", ru: "", en: "" };
const blankPage = {
  pageKey: "about",
  titleByLocale: blankLocalized,
  bodyByLocale: blankLocalized,
  seo: {},
  supportingImageUrls: [],
  publishState: "draft",
};

export default function PagesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [draft, setDraft] = useState<any>(blankPage);
  const [imagesCsv, setImagesCsv] = useState("");
  const [seoText, setSeoText] = useState("{}");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setItems(await dashboardGet<any[]>("/admin/cms/pages"));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load pages",
      );
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const reset = () => {
    setDraft(blankPage);
    setImagesCsv("");
    setSeoText("{}");
    setEditingId(null);
  };

  const save = async () => {
    const body = {
      ...draft,
      supportingImageUrls: imagesCsv
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      seo: JSON.parse(seoText || "{}"),
    };

    if (editingId) {
      await dashboardPatch(`/admin/cms/pages/${editingId}`, body);
      setMessage("Page updated");
    } else {
      await dashboardPost("/admin/cms/pages", body);
      setMessage("Page created");
    }

    reset();
    await load();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this page?")) return;
    await dashboardDelete(`/admin/cms/pages/${id}`);
    setMessage("Page deleted");
    await load();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <DataPanel title="Static pages">
        {message ? <StatusBanner message={message} /> : null}
        {error ? <StatusBanner message={error} tone="error" /> : null}
        <ListTable
          columns={["Image", "Page key", "RU title", "State", "Actions"]}
          rows={items.map((page) => [
            <div key={`${page._id}-image`} className="min-w-[14rem]">
              {page.supportingImageUrls?.[0] ? (
                <img
                  src={page.supportingImageUrls[0]}
                  alt={page.titleByLocale?.ru ?? "Page"}
                  className="h-28 w-56 rounded-2xl object-cover shadow-sm"
                />
              ) : (
                <div className="h-28 w-56 rounded-2xl bg-slate-100" />
              )}
            </div>,
            page.pageKey,
            page.titleByLocale?.ru,
            page.publishState,
            <div key={page._id} className="flex gap-2">
              <button
                onClick={() => {
                  setEditingId(page._id);
                  setDraft(page);
                  setImagesCsv((page.supportingImageUrls ?? []).join(", "));
                  setSeoText(JSON.stringify(page.seo ?? {}, null, 2));
                }}
                className="rounded-full border border-slate-300 px-3 py-1"
              >
                Edit
              </button>
              <button
                onClick={() => void remove(page._id)}
                className="rounded-full border border-rose-300 px-3 py-1 text-rose-600"
              >
                Delete
              </button>
            </div>,
          ])}
        />
      </DataPanel>
      <DataPanel title={editingId ? "Edit page" : "Create page"}>
        <div className="grid gap-4">
          <FormField label="Page key">
            <TextInput
              value={draft.pageKey}
              onChange={(e) => setDraft({ ...draft, pageKey: e.target.value })}
            />
          </FormField>
          <LocalizedStringEditor
            label="Title"
            value={draft.titleByLocale}
            onChange={(next) => setDraft({ ...draft, titleByLocale: next })}
          />
          <LocalizedRichTextEditor
            label="Body"
            value={draft.bodyByLocale}
            onChange={(next) => setDraft({ ...draft, bodyByLocale: next })}
          />
          <ImageArrayUploadField
            label="Supporting images"
            values={imagesCsv
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)}
            onChange={(next) => setImagesCsv(next.join(", "))}
          />
          <FormField label="Publish state">
            <select
              value={draft.publishState}
              onChange={(e) =>
                setDraft({ ...draft, publishState: e.target.value })
              }
              className="rounded-2xl border border-slate-300 px-4 py-3"
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </FormField>
          <FormField label="SEO JSON">
            <TextArea
              value={seoText}
              onChange={(e) => setSeoText(e.target.value)}
              className="min-h-36 font-mono text-xs"
            />
          </FormField>
          <div className="flex gap-3">
            <button
              onClick={() => void save()}
              className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
            >
              {editingId ? "Update" : "Create"}
            </button>
            <button
              onClick={reset}
              className="rounded-full border border-slate-300 px-5 py-3 text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      </DataPanel>
    </div>
  );
}
