"use client";

import { useEffect, useState } from "react";

import { DataPanel } from "@/components/data-panel";
import { FormField, TextInput } from "@/components/form-field";
import { ImageUploadField } from "@/components/image-upload-field";
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
const blankItem = {
  imageUrl: "",
  altByLocale: blankLocalized,
  captionByLocale: blankLocalized,
  isVisible: true,
  showOnHomepage: false,
  sortOrder: 1,
};

export default function GalleryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [draft, setDraft] = useState<any>(blankItem);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setItems(await dashboardGet<any[]>("/admin/cms/gallery-items"));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load gallery items",
      );
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const reset = () => {
    setDraft(blankItem);
    setEditingId(null);
  };

  const save = async () => {
    if (editingId) {
      await dashboardPatch(`/admin/cms/gallery-items/${editingId}`, draft);
      setMessage("Gallery item updated");
    } else {
      await dashboardPost("/admin/cms/gallery-items", draft);
      setMessage("Gallery item created");
    }

    reset();
    await load();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this gallery item?")) return;
    await dashboardDelete(`/admin/cms/gallery-items/${id}`);
    setMessage("Gallery item deleted");
    await load();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <DataPanel title="Gallery">
        {message ? <StatusBanner message={message} /> : null}
        {error ? <StatusBanner message={error} tone="error" /> : null}
        <ListTable
          columns={["Image", "Caption", "Homepage", "Visible", "Actions"]}
          rows={items.map((item) => [
            <div key={`${item._id}-image`} className="min-w-[14rem]">
              <img
                src={item.imageUrl}
                alt={item.captionByLocale?.ru ?? "Gallery item"}
                className="h-28 w-56 rounded-2xl object-cover shadow-sm"
              />
            </div>,
            item.captionByLocale?.ru,
            String(item.showOnHomepage),
            String(item.isVisible),
            <div key={item._id} className="flex gap-2">
              <button
                onClick={() => {
                  setEditingId(item._id);
                  setDraft(item);
                }}
                className="rounded-full border border-slate-300 px-3 py-1"
              >
                Edit
              </button>
              <button
                onClick={() => void remove(item._id)}
                className="rounded-full border border-rose-300 px-3 py-1 text-rose-600"
              >
                Delete
              </button>
            </div>,
          ])}
        />
      </DataPanel>
      <DataPanel
        title={editingId ? "Edit gallery item" : "Create gallery item"}
      >
        <div className="grid gap-4">
          <ImageUploadField
            label="Image"
            value={draft.imageUrl}
            onChange={(next) => setDraft({ ...draft, imageUrl: next })}
          />
          <LocalizedStringEditor
            label="Alt text"
            value={draft.altByLocale}
            onChange={(next) => setDraft({ ...draft, altByLocale: next })}
          />
          <LocalizedStringEditor
            label="Caption"
            value={draft.captionByLocale}
            onChange={(next) => setDraft({ ...draft, captionByLocale: next })}
            multiline
          />
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Sort order">
              <TextInput
                type="number"
                value={draft.sortOrder}
                onChange={(e) =>
                  setDraft({ ...draft, sortOrder: Number(e.target.value) })
                }
              />
            </FormField>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={draft.isVisible}
                onChange={(e) =>
                  setDraft({ ...draft, isVisible: e.target.checked })
                }
              />
              Visible
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={draft.showOnHomepage}
                onChange={(e) =>
                  setDraft({ ...draft, showOnHomepage: e.target.checked })
                }
              />
              Show on homepage
            </label>
          </div>
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
