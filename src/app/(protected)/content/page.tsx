"use client";

import { useEffect, useState } from "react";

import { DataPanel } from "@/components/data-panel";
import { FormField, TextInput } from "@/components/form-field";
import { LocalizedStringEditor } from "@/components/localized-string-editor";
import { ListTable } from "@/components/list-table";
import { StatusBanner } from "@/components/status-banner";
import {
  dashboardDelete,
  dashboardGet,
  dashboardPatch,
  dashboardPost,
} from "@/lib/api";

const blankEntry = {
  key: "",
  group: "global",
  valueByLocale: { uz: "", ru: "", en: "" },
  order: 0,
  published: true,
};

export default function ContentPage() {
  const [items, setItems] = useState<any[]>([]);
  const [draft, setDraft] = useState<any>(blankEntry);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setItems(await dashboardGet<any[]>("/admin/cms/content"));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load content entries",
      );
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    if (editingId) {
      await dashboardPatch(`/admin/cms/content/${editingId}`, draft);
      setMessage("Content entry updated");
    } else {
      await dashboardPost("/admin/cms/content", draft);
      setMessage("Content entry created");
    }

    setDraft(blankEntry);
    setEditingId(null);
    await load();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <DataPanel title="Global content">
        {message ? <StatusBanner message={message} /> : null}
        {error ? <StatusBanner message={error} tone="error" /> : null}
        <ListTable
          columns={["Key", "Group", "RU value", "Published", "Actions"]}
          rows={items.map((item) => [
            item.key,
            item.group,
            item.valueByLocale?.ru,
            String(item.published),
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
                onClick={() =>
                  void dashboardDelete(`/admin/cms/content/${item._id}`).then(
                    load,
                  )
                }
                className="rounded-full border border-rose-300 px-3 py-1 text-rose-600"
              >
                Delete
              </button>
            </div>,
          ])}
        />
      </DataPanel>
      <DataPanel
        title={editingId ? "Edit content entry" : "Create content entry"}
      >
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Key">
              <TextInput
                value={draft.key}
                onChange={(e) => setDraft({ ...draft, key: e.target.value })}
              />
            </FormField>
            <FormField label="Group">
              <TextInput
                value={draft.group}
                onChange={(e) => setDraft({ ...draft, group: e.target.value })}
              />
            </FormField>
            <FormField label="Order">
              <TextInput
                type="number"
                value={draft.order}
                onChange={(e) =>
                  setDraft({ ...draft, order: Number(e.target.value) })
                }
              />
            </FormField>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(e) =>
                setDraft({ ...draft, published: e.target.checked })
              }
            />
            Published
          </label>
          <LocalizedStringEditor
            label="Value"
            value={draft.valueByLocale}
            onChange={(next) => setDraft({ ...draft, valueByLocale: next })}
            multiline
          />
          <div className="flex gap-3">
            <button
              onClick={() => void save()}
              className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
            >
              {editingId ? "Update" : "Create"}
            </button>
            <button
              onClick={() => {
                setDraft(blankEntry);
                setEditingId(null);
              }}
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
