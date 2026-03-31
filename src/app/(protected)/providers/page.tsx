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

const blankProvider = {
  providerKey: "onramper",
  displayName: "",
  logoUrl: "",
  isVisible: true,
  isEnabled: false,
  sortOrder: 1,
  priority: 1,
  category: "tourism",
  providerType: "primary",
  disclosureByLocale: { uz: "", ru: "", en: "" },
  supportedCountries: [],
};

const blankMapping = {
  serviceType: "tour",
  serviceRefId: "",
  primaryProviderKey: "manual_sandbox",
  fallbackProviderKey: "",
  orderedProviderKeys: [],
};

export default function ProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [mappings, setMappings] = useState<any[]>([]);
  const [providerDraft, setProviderDraft] = useState<any>(blankProvider);
  const [mappingDraft, setMappingDraft] = useState<any>(blankMapping);
  const [editingProviderId, setEditingProviderId] = useState<string | null>(
    null,
  );
  const [editingMappingId, setEditingMappingId] = useState<string | null>(null);
  const [countriesCsv, setCountriesCsv] = useState("");
  const [orderCsv, setOrderCsv] = useState("");
  const [disclosureText, setDisclosureText] = useState(
    JSON.stringify(blankProvider.disclosureByLocale, null, 2),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const [providerResponse, mappingResponse] = await Promise.all([
        dashboardGet<any[]>("/admin/cms/provider-configs"),
        dashboardGet<any[]>("/admin/cms/service-provider-mappings"),
      ]);
      setProviders(providerResponse);
      setMappings(mappingResponse);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load provider domain",
      );
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const saveProvider = async () => {
    const body = {
      ...providerDraft,
      disclosureByLocale: JSON.parse(disclosureText || "{}"),
      supportedCountries: countriesCsv
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };
    if (editingProviderId) {
      await dashboardPatch(
        `/admin/cms/provider-configs/${editingProviderId}`,
        body,
      );
      setMessage("Provider updated");
    } else {
      await dashboardPost("/admin/cms/provider-configs", body);
      setMessage("Provider created");
    }
    setProviderDraft(blankProvider);
    setCountriesCsv("");
    setDisclosureText(
      JSON.stringify(blankProvider.disclosureByLocale, null, 2),
    );
    setEditingProviderId(null);
    await load();
  };

  const saveMapping = async () => {
    const body = {
      ...mappingDraft,
      orderedProviderKeys: orderCsv
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };
    if (editingMappingId) {
      await dashboardPatch(
        `/admin/cms/service-provider-mappings/${editingMappingId}`,
        body,
      );
      setMessage("Mapping updated");
    } else {
      await dashboardPost("/admin/cms/service-provider-mappings", body);
      setMessage("Mapping created");
    }
    setMappingDraft(blankMapping);
    setOrderCsv("");
    setEditingMappingId(null);
    await load();
  };

  return (
    <div className="grid gap-6">
      {message ? <StatusBanner message={message} /> : null}
      {error ? <StatusBanner message={error} tone="error" /> : null}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <DataPanel title="Provider configs">
          <ListTable
            columns={["Logo", "Provider", "Visible", "Enabled", "Actions"]}
            rows={providers.map((item) => [
              <div key={`${item._id}-logo`} className="min-w-[11rem]">
                <img
                  src={item.logoUrl}
                  alt={item.displayName}
                  className="h-24 w-44 rounded-2xl border border-slate-200 bg-white p-3 object-contain shadow-sm"
                />
              </div>,
              item.displayName,
              String(item.isVisible),
              String(item.isEnabled),
              <div key={item._id} className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingProviderId(item._id);
                    setProviderDraft(item);
                    setCountriesCsv((item.supportedCountries ?? []).join(", "));
                    setDisclosureText(
                      JSON.stringify(
                        item.disclosureByLocale ?? { uz: "", ru: "", en: "" },
                        null,
                        2,
                      ),
                    );
                  }}
                  className="rounded-full border border-slate-300 px-3 py-1"
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    void dashboardDelete(
                      `/admin/cms/provider-configs/${item._id}`,
                    ).then(load)
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
          title={editingProviderId ? "Edit provider" : "Create provider"}
        >
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Provider key">
                <TextInput
                  value={providerDraft.providerKey}
                  onChange={(e) =>
                    setProviderDraft({
                      ...providerDraft,
                      providerKey: e.target.value,
                    })
                  }
                />
              </FormField>
              <FormField label="Display name">
                <TextInput
                  value={providerDraft.displayName}
                  onChange={(e) =>
                    setProviderDraft({
                      ...providerDraft,
                      displayName: e.target.value,
                    })
                  }
                />
              </FormField>
              <ImageUploadField
                label="Logo"
                value={providerDraft.logoUrl}
                onChange={(next) =>
                  setProviderDraft({
                    ...providerDraft,
                    logoUrl: next,
                  })
                }
              />
              <FormField label="Sort order">
                <TextInput
                  type="number"
                  value={providerDraft.sortOrder}
                  onChange={(e) =>
                    setProviderDraft({
                      ...providerDraft,
                      sortOrder: Number(e.target.value),
                    })
                  }
                />
              </FormField>
              <FormField label="Priority">
                <TextInput
                  type="number"
                  value={providerDraft.priority ?? 0}
                  onChange={(e) =>
                    setProviderDraft({
                      ...providerDraft,
                      priority: Number(e.target.value),
                    })
                  }
                />
              </FormField>
              <FormField label="Category">
                <TextInput
                  value={providerDraft.category ?? "tourism"}
                  onChange={(e) =>
                    setProviderDraft({
                      ...providerDraft,
                      category: e.target.value,
                    })
                  }
                />
              </FormField>
              <FormField label="Type">
                <TextInput
                  value={providerDraft.providerType ?? "primary"}
                  onChange={(e) =>
                    setProviderDraft({
                      ...providerDraft,
                      providerType: e.target.value,
                    })
                  }
                />
              </FormField>
            </div>
            <FormField label="Supported countries (comma separated)">
              <TextInput
                value={countriesCsv}
                onChange={(e) => setCountriesCsv(e.target.value)}
              />
            </FormField>
            <FormField label="Disclosure JSON by locale">
              <TextArea
                value={disclosureText}
                onChange={(e) => setDisclosureText(e.target.value)}
                className="min-h-32 font-mono text-xs"
              />
            </FormField>
            <div className="flex items-center gap-6 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={providerDraft.isVisible}
                  onChange={(e) =>
                    setProviderDraft({
                      ...providerDraft,
                      isVisible: e.target.checked,
                    })
                  }
                />
                Visible
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={providerDraft.isEnabled}
                  onChange={(e) =>
                    setProviderDraft({
                      ...providerDraft,
                      isEnabled: e.target.checked,
                    })
                  }
                />
                Enabled
              </label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => void saveProvider()}
                className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
              >
                {editingProviderId ? "Update" : "Create"}
              </button>
              <button
                onClick={() => {
                  setProviderDraft(blankProvider);
                  setCountriesCsv("");
                  setDisclosureText(
                    JSON.stringify(blankProvider.disclosureByLocale, null, 2),
                  );
                  setEditingProviderId(null);
                }}
                className="rounded-full border border-slate-300 px-5 py-3 text-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </DataPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <DataPanel title="Service-provider mappings">
          <ListTable
            columns={["Service", "Primary", "Fallback", "Actions"]}
            rows={mappings.map((item) => [
              item.serviceType,
              item.primaryProviderKey,
              item.fallbackProviderKey ?? "-",
              <div key={item._id} className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingMappingId(item._id);
                    setMappingDraft(item);
                    setOrderCsv((item.orderedProviderKeys ?? []).join(", "));
                  }}
                  className="rounded-full border border-slate-300 px-3 py-1"
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    void dashboardDelete(
                      `/admin/cms/service-provider-mappings/${item._id}`,
                    ).then(load)
                  }
                  className="rounded-full border border-rose-300 px-3 py-1 text-rose-600"
                >
                  Delete
                </button>
              </div>,
            ])}
          />
        </DataPanel>
        <DataPanel title={editingMappingId ? "Edit mapping" : "Create mapping"}>
          <div className="grid gap-4">
            <FormField label="Service type">
              <TextInput
                value={mappingDraft.serviceType}
                onChange={(e) =>
                  setMappingDraft({
                    ...mappingDraft,
                    serviceType: e.target.value,
                  })
                }
              />
            </FormField>
            <FormField label="Service ref ID">
              <TextInput
                value={mappingDraft.serviceRefId ?? ""}
                onChange={(e) =>
                  setMappingDraft({
                    ...mappingDraft,
                    serviceRefId: e.target.value,
                  })
                }
              />
            </FormField>
            <FormField label="Primary provider">
              <TextInput
                value={mappingDraft.primaryProviderKey}
                onChange={(e) =>
                  setMappingDraft({
                    ...mappingDraft,
                    primaryProviderKey: e.target.value,
                  })
                }
              />
            </FormField>
            <FormField label="Fallback provider">
              <TextInput
                value={mappingDraft.fallbackProviderKey ?? ""}
                onChange={(e) =>
                  setMappingDraft({
                    ...mappingDraft,
                    fallbackProviderKey: e.target.value,
                  })
                }
              />
            </FormField>
            <FormField label="Ordered provider keys (comma separated)">
              <TextArea
                value={orderCsv}
                onChange={(e) => setOrderCsv(e.target.value)}
              />
            </FormField>
            <div className="flex gap-3">
              <button
                onClick={() => void saveMapping()}
                className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
              >
                {editingMappingId ? "Update" : "Create"}
              </button>
              <button
                onClick={() => {
                  setMappingDraft(blankMapping);
                  setOrderCsv("");
                  setEditingMappingId(null);
                }}
                className="rounded-full border border-slate-300 px-5 py-3 text-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </DataPanel>
      </div>
    </div>
  );
}
