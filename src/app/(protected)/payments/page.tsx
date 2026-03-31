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
  dashboardPut,
} from "@/lib/api";

const blankLocalized = { uz: "", ru: "", en: "" };

export default function PaymentsPage() {
  const [settings, setSettings] = useState<any>({
    minAmountMinor: 0,
    maxAmountMinor: 0,
    cardSchemes: ["visa", "mastercard"],
    supportContact: blankLocalized,
    checkboxTextByLocale: blankLocalized,
    paymentDescriptionByLocale: blankLocalized,
  });
  const [attempts, setAttempts] = useState<any[]>([]);
  const [consents, setConsents] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [paymentContent, setPaymentContent] = useState<any[]>([]);
  const [paymentContentDraft, setPaymentContentDraft] = useState<any>({
    locale: "ru",
    heading: "",
    subheading: "",
    disclosureBlocks: [],
    checkboxText: "",
    providerSectionTitle: "",
  });
  const [paymentContentId, setPaymentContentId] = useState<string | null>(null);
  const [cardSchemesCsv, setCardSchemesCsv] = useState("visa, mastercard");
  const [disclosuresCsv, setDisclosuresCsv] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const [
        settingsResponse,
        paymentContentResponse,
        attemptsResponse,
        consentsResponse,
        invoicesResponse,
      ] = await Promise.all([
        dashboardGet<any>("/admin/cms/payment-settings"),
        dashboardGet<any[]>("/admin/cms/payment-page-content"),
        dashboardGet<any[]>("/admin/payment-attempts"),
        dashboardGet<any[]>("/admin/consent-logs"),
        dashboardGet<any[]>("/admin/invoices"),
      ]);
      if (settingsResponse) {
        setSettings(settingsResponse);
        setCardSchemesCsv((settingsResponse.cardSchemes ?? []).join(", "));
      }
      setPaymentContent(paymentContentResponse);
      setAttempts(attemptsResponse);
      setConsents(consentsResponse);
      setInvoices(invoicesResponse);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load payment domain",
      );
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    await dashboardPut("/admin/cms/payment-settings", {
      ...settings,
      cardSchemes: cardSchemesCsv
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });
    setMessage("Payment settings updated");
    await load();
  };

  const savePaymentContent = async () => {
    const body = {
      ...paymentContentDraft,
      disclosureBlocks: disclosuresCsv
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    if (paymentContentId) {
      await dashboardPatch(
        `/admin/cms/payment-page-content/${paymentContentId}`,
        body,
      );
      setMessage("Payment page content updated");
    } else {
      await dashboardPost("/admin/cms/payment-page-content", body);
      setMessage("Payment page content created");
    }

    setPaymentContentId(null);
    setPaymentContentDraft({
      locale: "ru",
      heading: "",
      subheading: "",
      disclosureBlocks: [],
      checkboxText: "",
      providerSectionTitle: "",
    });
    setDisclosuresCsv("");
    await load();
  };

  return (
    <div className="grid gap-6">
      {message ? <StatusBanner message={message} /> : null}
      {error ? <StatusBanner message={error} tone="error" /> : null}
      <DataPanel title="Payment settings">
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Minimum amount minor">
              <TextInput
                type="number"
                value={settings.minAmountMinor}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    minAmountMinor: Number(e.target.value),
                  })
                }
              />
            </FormField>
            <FormField label="Maximum amount minor">
              <TextInput
                type="number"
                value={settings.maxAmountMinor}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxAmountMinor: Number(e.target.value),
                  })
                }
              />
            </FormField>
          </div>
          <FormField label="Card schemes (comma separated)">
            <TextInput
              value={cardSchemesCsv}
              onChange={(e) => setCardSchemesCsv(e.target.value)}
            />
          </FormField>
          <LocalizedStringEditor
            label="Support contact"
            value={settings.supportContact ?? blankLocalized}
            onChange={(next) =>
              setSettings({ ...settings, supportContact: next })
            }
            multiline
          />
          <LocalizedStringEditor
            label="Required checkbox text"
            value={settings.checkboxTextByLocale ?? blankLocalized}
            onChange={(next) =>
              setSettings({ ...settings, checkboxTextByLocale: next })
            }
            multiline
          />
          <LocalizedStringEditor
            label="Payment description"
            value={settings.paymentDescriptionByLocale ?? blankLocalized}
            onChange={(next) =>
              setSettings({ ...settings, paymentDescriptionByLocale: next })
            }
            multiline
          />
          <div>
            <button
              onClick={() => void save()}
              className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
            >
              Save payment settings
            </button>
          </div>
        </div>
      </DataPanel>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <DataPanel title="Payment page content">
          <ListTable
            columns={["Locale", "Heading", "Provider title", "Actions"]}
            rows={paymentContent.map((item) => [
              item.locale,
              item.heading,
              item.providerSectionTitle,
              <div key={item._id} className="flex gap-2">
                <button
                  onClick={() => {
                    setPaymentContentId(item._id);
                    setPaymentContentDraft(item);
                    setDisclosuresCsv((item.disclosureBlocks ?? []).join("\n"));
                  }}
                  className="rounded-full border border-slate-300 px-3 py-1"
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    void dashboardDelete(
                      `/admin/cms/payment-page-content/${item._id}`,
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
          title={
            paymentContentId
              ? "Edit payment page copy"
              : "Create payment page copy"
          }
        >
          <div className="grid gap-4">
            <FormField label="Locale">
              <TextInput
                value={paymentContentDraft.locale}
                onChange={(e) =>
                  setPaymentContentDraft({
                    ...paymentContentDraft,
                    locale: e.target.value,
                  })
                }
              />
            </FormField>
            <FormField label="Heading">
              <TextInput
                value={paymentContentDraft.heading}
                onChange={(e) =>
                  setPaymentContentDraft({
                    ...paymentContentDraft,
                    heading: e.target.value,
                  })
                }
              />
            </FormField>
            <FormField label="Subheading">
              <TextInput
                value={paymentContentDraft.subheading}
                onChange={(e) =>
                  setPaymentContentDraft({
                    ...paymentContentDraft,
                    subheading: e.target.value,
                  })
                }
              />
            </FormField>
            <FormField label="Disclosure blocks (one per line)">
              <textarea
                value={disclosuresCsv}
                onChange={(e) => setDisclosuresCsv(e.target.value)}
                className="min-h-36 rounded-2xl border border-slate-300 px-4 py-3 outline-none"
              />
            </FormField>
            <FormField label="Checkbox text">
              <TextInput
                value={paymentContentDraft.checkboxText}
                onChange={(e) =>
                  setPaymentContentDraft({
                    ...paymentContentDraft,
                    checkboxText: e.target.value,
                  })
                }
              />
            </FormField>
            <FormField label="Provider section title">
              <TextInput
                value={paymentContentDraft.providerSectionTitle}
                onChange={(e) =>
                  setPaymentContentDraft({
                    ...paymentContentDraft,
                    providerSectionTitle: e.target.value,
                  })
                }
              />
            </FormField>
            <div className="flex gap-3">
              <button
                onClick={() => void savePaymentContent()}
                className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
              >
                {paymentContentId ? "Update" : "Create"}
              </button>
              <button
                onClick={() => {
                  setPaymentContentId(null);
                  setPaymentContentDraft({
                    locale: "ru",
                    heading: "",
                    subheading: "",
                    disclosureBlocks: [],
                    checkboxText: "",
                    providerSectionTitle: "",
                  });
                  setDisclosuresCsv("");
                }}
                className="rounded-full border border-slate-300 px-5 py-3 text-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </DataPanel>
      </div>
      <DataPanel title="Payment attempts">
        <ListTable
          columns={["Reference", "Provider", "Email", "Status"]}
          rows={attempts.map((item) => [
            item.reference,
            item.providerKey,
            item.email,
            item.status,
          ])}
        />
      </DataPanel>
      <DataPanel title="Consent logs">
        <ListTable
          columns={["Email", "Provider", "Accepted", "Locale"]}
          rows={consents.map((item) => [
            item.email,
            item.providerKey,
            String(item.accepted),
            item.locale,
          ])}
        />
      </DataPanel>
      <DataPanel title="Invoices">
        <ListTable
          columns={["Invoice", "Reference", "Locale"]}
          rows={invoices.map((item) => [
            item.invoiceNumber,
            item.paymentAttemptRef,
            item.locale,
          ])}
        />
      </DataPanel>
    </div>
  );
}
