"use client";

import { useEffect, useState } from "react";

import { DataPanel } from "@/components/data-panel";
import { FormField, TextArea, TextInput } from "@/components/form-field";
import { ListTable } from "@/components/list-table";
import { StatusBanner } from "@/components/status-banner";
import {
  dashboardDelete,
  dashboardGet,
  dashboardPatch,
  dashboardPost,
} from "@/lib/api";

const blankSection = {
  sectionType: "featuredTours",
  payload: {
    heading: { ru: "", en: "", uz: "" },
  },
  sortOrder: 1,
  isVisible: true,
  publishState: "draft",
};

export default function HomeSectionsPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [draft, setDraft] = useState<any>(blankSection);
  const [payloadText, setPayloadText] = useState(
    JSON.stringify(blankSection.payload, null, 2),
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const response = await dashboardGet<any[]>("/admin/cms/home-sections");
      setSections(response);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load sections",
      );
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    try {
      const payload = JSON.parse(payloadText);
      const body = { ...draft, payload };

      if (editingId) {
        await dashboardPatch(`/admin/cms/home-sections/${editingId}`, body);
        setMessage("Home section updated");
      } else {
        await dashboardPost("/admin/cms/home-sections", body);
        setMessage("Home section created");
      }

      setDraft(blankSection);
      setPayloadText(JSON.stringify(blankSection.payload, null, 2));
      setEditingId(null);
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Save failed");
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this section?")) return;
    await dashboardDelete(`/admin/cms/home-sections/${id}`);
    setMessage("Home section deleted");
    await load();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <DataPanel title="Home sections">
        {message ? <StatusBanner message={message} /> : null}
        {error ? <StatusBanner message={error} tone="error" /> : null}
        <ListTable
          columns={["Type", "Sort order", "Visible", "Actions"]}
          rows={sections.map((section) => [
            section.sectionType,
            section.sortOrder,
            String(section.isVisible),
            <div key={section._id} className="flex gap-2">
              <button
                onClick={() => {
                  setEditingId(section._id);
                  setDraft(section);
                  setPayloadText(JSON.stringify(section.payload, null, 2));
                }}
                className="rounded-full border border-slate-300 px-3 py-1"
              >
                Edit
              </button>
              <button
                onClick={() => void remove(section._id)}
                className="rounded-full border border-rose-300 px-3 py-1 text-rose-600"
              >
                Delete
              </button>
            </div>,
          ])}
        />
      </DataPanel>
      <DataPanel
        title={editingId ? "Edit home section" : "Create home section"}
      >
        <div className="grid gap-4">
          <FormField label="Section type">
            <TextInput
              value={draft.sectionType}
              onChange={(e) =>
                setDraft({ ...draft, sectionType: e.target.value })
              }
            />
          </FormField>
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
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={draft.isVisible}
              onChange={(e) =>
                setDraft({ ...draft, isVisible: e.target.checked })
              }
            />
            Visible on homepage
          </label>
          <FormField label="Payload JSON">
            <TextArea
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              className="min-h-80 font-mono text-xs"
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
              onClick={() => {
                setDraft(blankSection);
                setPayloadText(JSON.stringify(blankSection.payload, null, 2));
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
