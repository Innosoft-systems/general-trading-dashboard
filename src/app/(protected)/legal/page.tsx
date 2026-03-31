"use client";

import { useEffect, useState } from "react";

import { DataPanel } from "@/components/data-panel";
import { FormField, TextArea, TextInput } from "@/components/form-field";
import { ListTable } from "@/components/list-table";
import { RichTextEditor } from "@/components/rich-text-editor";
import { StatusBanner } from "@/components/status-banner";
import {
  dashboardDelete,
  dashboardGet,
  dashboardPatch,
  dashboardPost,
} from "@/lib/api";

const blankDocument = { key: "terms", routeKey: "terms" };
const blankVersion = {
  documentKey: "terms",
  locale: "ru",
  versionNumber: 1,
  title: "",
  body: "",
  effectiveAt: new Date().toISOString(),
  publishState: "draft",
};

export default function LegalPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [documentDraft, setDocumentDraft] = useState<any>(blankDocument);
  const [versionDraft, setVersionDraft] = useState<any>(blankVersion);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(
    null,
  );
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const [documentsResponse, versionsResponse] = await Promise.all([
        dashboardGet<any[]>("/admin/cms/legal-documents"),
        dashboardGet<any[]>("/admin/cms/policy-versions"),
      ]);
      setDocuments(documentsResponse);
      setVersions(versionsResponse);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load legal domain",
      );
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const saveDocument = async () => {
    if (editingDocumentId) {
      await dashboardPatch(
        `/admin/cms/legal-documents/${editingDocumentId}`,
        documentDraft,
      );
      setMessage("Legal document updated");
    } else {
      await dashboardPost("/admin/cms/legal-documents", documentDraft);
      setMessage("Legal document created");
    }
    setDocumentDraft(blankDocument);
    setEditingDocumentId(null);
    await load();
  };

  const saveVersion = async () => {
    if (editingVersionId) {
      await dashboardPatch(
        `/admin/cms/policy-versions/${editingVersionId}`,
        versionDraft,
      );
      setMessage("Policy version updated");
    } else {
      await dashboardPost("/admin/cms/policy-versions", versionDraft);
      setMessage("Policy version created");
    }
    setVersionDraft(blankVersion);
    setEditingVersionId(null);
    await load();
  };

  return (
    <div className="grid gap-6">
      {message ? <StatusBanner message={message} /> : null}
      {error ? <StatusBanner message={error} tone="error" /> : null}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <DataPanel title="Legal documents">
          <ListTable
            columns={["Key", "Route", "Actions"]}
            rows={documents.map((item) => [
              item.key,
              item.routeKey,
              <div key={item._id} className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingDocumentId(item._id);
                    setDocumentDraft(item);
                  }}
                  className="rounded-full border border-slate-300 px-3 py-1"
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    void dashboardDelete(
                      `/admin/cms/legal-documents/${item._id}`,
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
          title={editingDocumentId ? "Edit document" : "Create document"}
        >
          <div className="grid gap-4">
            <FormField label="Key">
              <TextInput
                value={documentDraft.key}
                onChange={(e) =>
                  setDocumentDraft({ ...documentDraft, key: e.target.value })
                }
              />
            </FormField>
            <FormField label="Route key">
              <TextInput
                value={documentDraft.routeKey}
                onChange={(e) =>
                  setDocumentDraft({
                    ...documentDraft,
                    routeKey: e.target.value,
                  })
                }
              />
            </FormField>
            <div className="flex gap-3">
              <button
                onClick={() => void saveDocument()}
                className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
              >
                {editingDocumentId ? "Update" : "Create"}
              </button>
              <button
                onClick={() => {
                  setDocumentDraft(blankDocument);
                  setEditingDocumentId(null);
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
        <DataPanel title="Policy versions">
          <ListTable
            columns={["Document", "Locale", "Version", "State", "Actions"]}
            rows={versions.map((item) => [
              item.documentKey,
              item.locale,
              item.versionNumber,
              item.publishState,
              <div key={item._id} className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingVersionId(item._id);
                    setVersionDraft({
                      ...item,
                      effectiveAt: new Date(item.effectiveAt).toISOString(),
                    });
                  }}
                  className="rounded-full border border-slate-300 px-3 py-1"
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    void dashboardPost(
                      `/admin/cms/policy-versions/${item._id}/publish`,
                      {},
                    ).then(load)
                  }
                  className="rounded-full border border-emerald-300 px-3 py-1 text-emerald-700"
                >
                  Publish
                </button>
                <button
                  onClick={() =>
                    void dashboardDelete(
                      `/admin/cms/policy-versions/${item._id}`,
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
        <DataPanel title={editingVersionId ? "Edit version" : "Create version"}>
          <div className="grid gap-4">
            <FormField label="Document key">
              <TextInput
                value={versionDraft.documentKey}
                onChange={(e) =>
                  setVersionDraft({
                    ...versionDraft,
                    documentKey: e.target.value,
                  })
                }
              />
            </FormField>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Locale">
                <TextInput
                  value={versionDraft.locale}
                  onChange={(e) =>
                    setVersionDraft({ ...versionDraft, locale: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Version number">
                <TextInput
                  type="number"
                  value={versionDraft.versionNumber}
                  onChange={(e) =>
                    setVersionDraft({
                      ...versionDraft,
                      versionNumber: Number(e.target.value),
                    })
                  }
                />
              </FormField>
            </div>
            <FormField label="Title">
              <TextInput
                value={versionDraft.title}
                onChange={(e) =>
                  setVersionDraft({ ...versionDraft, title: e.target.value })
                }
              />
            </FormField>
            <FormField label="Body">
              <RichTextEditor
                value={versionDraft.body}
                onChange={(next) =>
                  setVersionDraft({ ...versionDraft, body: next })
                }
              />
            </FormField>
            <FormField label="Effective at (ISO)">
              <TextInput
                value={versionDraft.effectiveAt}
                onChange={(e) =>
                  setVersionDraft({
                    ...versionDraft,
                    effectiveAt: e.target.value,
                  })
                }
              />
            </FormField>
            <FormField label="Publish state">
              <select
                value={versionDraft.publishState}
                onChange={(e) =>
                  setVersionDraft({
                    ...versionDraft,
                    publishState: e.target.value,
                  })
                }
                className="rounded-2xl border border-slate-300 px-4 py-3"
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
              </select>
            </FormField>
            <div className="flex gap-3">
              <button
                onClick={() => void saveVersion()}
                className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
              >
                {editingVersionId ? "Update" : "Create"}
              </button>
              <button
                onClick={() => {
                  setVersionDraft(blankVersion);
                  setEditingVersionId(null);
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
