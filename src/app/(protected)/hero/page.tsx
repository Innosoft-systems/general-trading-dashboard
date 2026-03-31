"use client";

import { useEffect, useState } from "react";

import { DataPanel } from "@/components/data-panel";
import { FormField, TextArea, TextInput } from "@/components/form-field";
import { ImageUploadField } from "@/components/image-upload-field";
import { ListTable } from "@/components/list-table";
import { StatusBanner } from "@/components/status-banner";
import {
  dashboardDelete,
  dashboardGet,
  dashboardPatch,
  dashboardPost,
} from "@/lib/api";

const blankHero = {
  contentByLocale: {
    uz: { title: "", subtitle: "", badge: "", ctaLabel: "", ctaUrl: "" },
    ru: { title: "", subtitle: "", badge: "", ctaLabel: "", ctaUrl: "" },
    en: { title: "", subtitle: "", badge: "", ctaLabel: "", ctaUrl: "" },
  },
  templateType: "cinematic-left-copy",
  backgroundImageUrl: "",
  foregroundImageUrl: "",
  alignment: "left",
  buttonPlacement: "bottom",
  overlayIntensity: 0.45,
  mobileStacked: true,
  sortOrder: 1,
  publishState: "draft",
};

export default function HeroPage() {
  const [slides, setSlides] = useState<any[]>([]);
  const [draft, setDraft] = useState<any>(blankHero);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const response = await dashboardGet<any[]>("/admin/cms/hero-slides");
      setSlides(response);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load hero slides",
      );
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    setError(null);
    setMessage(null);

    try {
      if (editingId) {
        await dashboardPatch(`/admin/cms/hero-slides/${editingId}`, draft);
        setMessage("Hero slide updated");
      } else {
        await dashboardPost("/admin/cms/hero-slides", draft);
        setMessage("Hero slide created");
      }

      setDraft(blankHero);
      setEditingId(null);
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Save failed");
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this hero slide?")) return;

    try {
      await dashboardDelete(`/admin/cms/hero-slides/${id}`);
      setMessage("Hero slide deleted");
      if (editingId === id) {
        setDraft(blankHero);
        setEditingId(null);
      }
      await load();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Delete failed",
      );
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <DataPanel title="Hero slides">
        {message ? <StatusBanner message={message} /> : null}
        {error ? <StatusBanner message={error} tone="error" /> : null}
        <ListTable
          columns={["Image", "Template", "RU title", "State", "Actions"]}
          rows={slides.map((slide) => [
            <div key={`${slide._id}-preview`} className="min-w-[14rem]">
              <img
                src={slide.backgroundImageUrl}
                alt={slide.contentByLocale?.ru?.title ?? "Hero slide"}
                className="h-28 w-56 rounded-2xl object-cover shadow-sm"
              />
            </div>,
            slide.templateType,
            slide.contentByLocale?.ru?.title,
            slide.publishState,
            <div key={slide._id} className="flex gap-2">
              <button
                onClick={() => {
                  setEditingId(slide._id);
                  setDraft({ ...slide });
                }}
                className="rounded-full border border-slate-300 px-3 py-1"
              >
                Edit
              </button>
              <button
                onClick={() => void remove(slide._id)}
                className="rounded-full border border-rose-300 px-3 py-1 text-rose-600"
              >
                Delete
              </button>
            </div>,
          ])}
        />
      </DataPanel>

      <DataPanel title={editingId ? "Edit hero slide" : "Create hero slide"}>
        <div className="grid gap-4">
          <FormField label="Template type">
            <TextInput
              value={draft.templateType}
              onChange={(e) =>
                setDraft({ ...draft, templateType: e.target.value })
              }
            />
          </FormField>
          <ImageUploadField
            label="Background image"
            value={draft.backgroundImageUrl}
            onChange={(next) =>
              setDraft({ ...draft, backgroundImageUrl: next })
            }
          />
          <ImageUploadField
            label="Foreground image"
            value={draft.foregroundImageUrl ?? ""}
            onChange={(next) =>
              setDraft({ ...draft, foregroundImageUrl: next })
            }
          />
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Alignment">
              <TextInput
                value={draft.alignment}
                onChange={(e) =>
                  setDraft({ ...draft, alignment: e.target.value })
                }
              />
            </FormField>
            <FormField label="Button placement">
              <TextInput
                value={draft.buttonPlacement}
                onChange={(e) =>
                  setDraft({ ...draft, buttonPlacement: e.target.value })
                }
              />
            </FormField>
            <FormField label="Overlay intensity">
              <TextInput
                type="number"
                step="0.05"
                value={draft.overlayIntensity}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    overlayIntensity: Number(e.target.value),
                  })
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
          <div className="flex items-center gap-6 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={draft.mobileStacked}
                onChange={(e) =>
                  setDraft({ ...draft, mobileStacked: e.target.checked })
                }
              />
              Mobile stacked
            </label>
            <label className="flex items-center gap-2">
              <span>Publish state</span>
              <select
                value={draft.publishState}
                onChange={(e) =>
                  setDraft({ ...draft, publishState: e.target.value })
                }
                className="rounded-xl border border-slate-300 px-3 py-2"
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="archived">archived</option>
              </select>
            </label>
          </div>

          {(["ru", "en", "uz"] as const).map((locale) => (
            <div
              key={locale}
              className="grid gap-3 rounded-2xl border border-slate-200 p-4"
            >
              <p className="text-sm font-semibold text-ink">
                {locale.toUpperCase()} content
              </p>
              <FormField label="Title">
                <TextInput
                  value={draft.contentByLocale[locale].title}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      contentByLocale: {
                        ...draft.contentByLocale,
                        [locale]: {
                          ...draft.contentByLocale[locale],
                          title: e.target.value,
                        },
                      },
                    })
                  }
                />
              </FormField>
              <FormField label="Subtitle">
                <TextArea
                  value={draft.contentByLocale[locale].subtitle}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      contentByLocale: {
                        ...draft.contentByLocale,
                        [locale]: {
                          ...draft.contentByLocale[locale],
                          subtitle: e.target.value,
                        },
                      },
                    })
                  }
                />
              </FormField>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Badge">
                  <TextInput
                    value={draft.contentByLocale[locale].badge}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        contentByLocale: {
                          ...draft.contentByLocale,
                          [locale]: {
                            ...draft.contentByLocale[locale],
                            badge: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </FormField>
                <FormField label="CTA label">
                  <TextInput
                    value={draft.contentByLocale[locale].ctaLabel}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        contentByLocale: {
                          ...draft.contentByLocale,
                          [locale]: {
                            ...draft.contentByLocale[locale],
                            ctaLabel: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </FormField>
                <FormField label="CTA URL">
                  <TextInput
                    value={draft.contentByLocale[locale].ctaUrl}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        contentByLocale: {
                          ...draft.contentByLocale,
                          [locale]: {
                            ...draft.contentByLocale[locale],
                            ctaUrl: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </FormField>
              </div>
            </div>
          ))}

          <div className="flex gap-3">
            <button
              onClick={() => void save()}
              className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
            >
              {editingId ? "Update" : "Create"}
            </button>
            <button
              onClick={() => {
                setDraft(blankHero);
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
