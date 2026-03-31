"use client";

import { useEffect, useState } from "react";

import { DataPanel } from "@/components/data-panel";
import { FormField, TextArea, TextInput } from "@/components/form-field";
import {
  ImageArrayUploadField,
  ImageUploadField,
} from "@/components/image-upload-field";
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

const blankTour = {
  titleByLocale: blankLocalized,
  slugByLocale: blankLocalized,
  shortDescriptionByLocale: blankLocalized,
  fullDescriptionByLocale: blankLocalized,
  coverImageUrl: "",
  galleryImageUrls: [],
  priceMinor: 0,
  currency: "UZS",
  featured: false,
  destinationKeys: [],
  categoryKeys: [],
  tagKeys: [],
  durationDays: 1,
  availabilityStatus: "available",
  seo: {},
  sortOrder: 1,
  status: "draft",
};

const toCsv = (items?: string[]) => (items ?? []).join(", ");
const fromCsv = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export default function ToursPage() {
  const [items, setItems] = useState<any[]>([]);
  const [draft, setDraft] = useState<any>(blankTour);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [galleryCsv, setGalleryCsv] = useState("");
  const [destinationsCsv, setDestinationsCsv] = useState("");
  const [categoriesCsv, setCategoriesCsv] = useState("");
  const [tagsCsv, setTagsCsv] = useState("");
  const [seoText, setSeoText] = useState("{}");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const response = await dashboardGet<any[]>("/admin/cms/tours");
      setItems(response);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load tours",
      );
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const reset = () => {
    setDraft(blankTour);
    setEditingId(null);
    setGalleryCsv("");
    setDestinationsCsv("");
    setCategoriesCsv("");
    setTagsCsv("");
    setSeoText("{}");
  };

  const save = async () => {
    try {
      const body = {
        ...draft,
        galleryImageUrls: fromCsv(galleryCsv),
        destinationKeys: fromCsv(destinationsCsv),
        categoryKeys: fromCsv(categoriesCsv),
        tagKeys: fromCsv(tagsCsv),
        seo: JSON.parse(seoText || "{}"),
      };

      if (editingId) {
        await dashboardPatch(`/admin/cms/tours/${editingId}`, body);
        setMessage("Tour updated");
      } else {
        await dashboardPost("/admin/cms/tours", body);
        setMessage("Tour created");
      }

      reset();
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Save failed");
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this tour?")) return;
    await dashboardDelete(`/admin/cms/tours/${id}`);
    setMessage("Tour deleted");
    if (editingId === id) reset();
    await load();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <DataPanel title="Tours">
        {message ? <StatusBanner message={message} /> : null}
        {error ? <StatusBanner message={error} tone="error" /> : null}
        <ListTable
          columns={[
            "Cover",
            "RU title",
            "Price minor",
            "Duration",
            "Status",
            "Actions",
          ]}
          rows={items.map((tour) => [
            <div key={`${tour._id}-cover`} className="min-w-[14rem]">
              <img
                src={tour.coverImageUrl}
                alt={tour.titleByLocale?.ru ?? "Tour"}
                className="h-28 w-56 rounded-2xl object-cover shadow-sm"
              />
            </div>,
            tour.titleByLocale?.ru,
            tour.priceMinor,
            tour.durationDays,
            tour.status,
            <div key={tour._id} className="flex gap-2">
              <button
                onClick={() => {
                  setEditingId(tour._id);
                  setDraft(tour);
                  setGalleryCsv(toCsv(tour.galleryImageUrls));
                  setDestinationsCsv(toCsv(tour.destinationKeys));
                  setCategoriesCsv(toCsv(tour.categoryKeys));
                  setTagsCsv(toCsv(tour.tagKeys));
                  setSeoText(JSON.stringify(tour.seo ?? {}, null, 2));
                }}
                className="rounded-full border border-slate-300 px-3 py-1"
              >
                Edit
              </button>
              <button
                onClick={() => void remove(tour._id)}
                className="rounded-full border border-rose-300 px-3 py-1 text-rose-600"
              >
                Delete
              </button>
            </div>,
          ])}
        />
      </DataPanel>

      <DataPanel title={editingId ? "Edit tour" : "Create tour"}>
        <div className="grid gap-4">
          <LocalizedStringEditor
            label="Title"
            value={draft.titleByLocale}
            onChange={(next) => setDraft({ ...draft, titleByLocale: next })}
          />
          <LocalizedStringEditor
            label="Slug"
            value={draft.slugByLocale}
            onChange={(next) => setDraft({ ...draft, slugByLocale: next })}
          />
          <LocalizedStringEditor
            label="Short description"
            value={draft.shortDescriptionByLocale}
            onChange={(next) =>
              setDraft({ ...draft, shortDescriptionByLocale: next })
            }
            multiline
          />
          <LocalizedRichTextEditor
            label="Full description"
            value={draft.fullDescriptionByLocale}
            onChange={(next) =>
              setDraft({ ...draft, fullDescriptionByLocale: next })
            }
          />
          <ImageUploadField
            label="Cover image"
            value={draft.coverImageUrl}
            onChange={(next) => setDraft({ ...draft, coverImageUrl: next })}
          />
          <ImageArrayUploadField
            label="Gallery images"
            values={fromCsv(galleryCsv)}
            onChange={(next) => setGalleryCsv(toCsv(next))}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Price minor">
              <TextInput
                type="number"
                value={draft.priceMinor}
                onChange={(e) =>
                  setDraft({ ...draft, priceMinor: Number(e.target.value) })
                }
              />
            </FormField>
            <FormField label="Currency">
              <TextInput
                value={draft.currency}
                onChange={(e) =>
                  setDraft({ ...draft, currency: e.target.value })
                }
              />
            </FormField>
            <FormField label="Duration days">
              <TextInput
                type="number"
                value={draft.durationDays}
                onChange={(e) =>
                  setDraft({ ...draft, durationDays: Number(e.target.value) })
                }
              />
            </FormField>
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
          <FormField label="Destination keys (comma separated)">
            <TextInput
              value={destinationsCsv}
              onChange={(e) => setDestinationsCsv(e.target.value)}
            />
          </FormField>
          <FormField label="Category keys (comma separated)">
            <TextInput
              value={categoriesCsv}
              onChange={(e) => setCategoriesCsv(e.target.value)}
            />
          </FormField>
          <FormField label="Tag keys (comma separated)">
            <TextInput
              value={tagsCsv}
              onChange={(e) => setTagsCsv(e.target.value)}
            />
          </FormField>
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(e) =>
                  setDraft({ ...draft, featured: e.target.checked })
                }
              />
              Featured
            </label>
            <label className="flex items-center gap-2">
              <span>Status</span>
              <select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                className="rounded-xl border border-slate-300 px-3 py-2"
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="archived">archived</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span>Availability</span>
              <select
                value={draft.availabilityStatus}
                onChange={(e) =>
                  setDraft({ ...draft, availabilityStatus: e.target.value })
                }
                className="rounded-xl border border-slate-300 px-3 py-2"
              >
                <option value="available">available</option>
                <option value="limited">limited</option>
                <option value="on_request">on_request</option>
                <option value="sold_out">sold_out</option>
              </select>
            </label>
          </div>
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
