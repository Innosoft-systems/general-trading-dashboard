"use client";

import { useEffect, useState } from "react";

import { DataPanel } from "@/components/data-panel";
import { FormField, TextInput } from "@/components/form-field";
import { LocalizedStringEditor } from "@/components/localized-string-editor";
import { ListTable } from "@/components/list-table";
import { StatusBanner } from "@/components/status-banner";
import { dashboardGet, dashboardPut } from "@/lib/api";

const blankLocalized = { uz: "", ru: "", en: "" };

export default function ContactPage() {
  const [settings, setSettings] = useState<any>({
    supportEmail: "",
    phone: "",
    addressByLocale: blankLocalized,
    introByLocale: blankLocalized,
    consentTextByLocale: blankLocalized,
    mapUrl: "",
  });
  const [rows, setRows] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const [settingsResponse, submissions] = await Promise.all([
        dashboardGet<any>("/admin/cms/contact-settings"),
        dashboardGet<any[]>("/admin/contact-submissions"),
      ]);
      if (settingsResponse) setSettings(settingsResponse);
      setRows(submissions);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load contact domain",
      );
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    await dashboardPut("/admin/cms/contact-settings", settings);
    setMessage("Contact settings updated");
    await load();
  };

  return (
    <div className="grid gap-6">
      <DataPanel title="Contact settings">
        {message ? <StatusBanner message={message} /> : null}
        {error ? <StatusBanner message={error} tone="error" /> : null}
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Support email">
              <TextInput
                value={settings.supportEmail ?? ""}
                onChange={(e) =>
                  setSettings({ ...settings, supportEmail: e.target.value })
                }
              />
            </FormField>
            <FormField label="Phone">
              <TextInput
                value={settings.phone ?? ""}
                onChange={(e) =>
                  setSettings({ ...settings, phone: e.target.value })
                }
              />
            </FormField>
          </div>
          <FormField label="Map URL">
            <TextInput
              value={settings.mapUrl ?? ""}
              onChange={(e) =>
                setSettings({ ...settings, mapUrl: e.target.value })
              }
            />
          </FormField>
          <LocalizedStringEditor
            label="Address"
            value={settings.addressByLocale ?? blankLocalized}
            onChange={(next) =>
              setSettings({ ...settings, addressByLocale: next })
            }
            multiline
          />
          <LocalizedStringEditor
            label="Intro"
            value={settings.introByLocale ?? blankLocalized}
            onChange={(next) =>
              setSettings({ ...settings, introByLocale: next })
            }
            multiline
          />
          <LocalizedStringEditor
            label="Consent text"
            value={settings.consentTextByLocale ?? blankLocalized}
            onChange={(next) =>
              setSettings({ ...settings, consentTextByLocale: next })
            }
            multiline
          />
          <div>
            <button
              onClick={() => void save()}
              className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
            >
              Save settings
            </button>
          </div>
        </div>
      </DataPanel>

      <DataPanel title="Contact submissions">
        <ListTable
          columns={["Name", "Email", "Locale", "Status"]}
          rows={rows.map((item) => [
            item.name,
            item.email,
            item.locale,
            item.status,
          ])}
        />
      </DataPanel>
    </div>
  );
}
