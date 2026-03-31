"use client";

import { useEffect, useState } from "react";

import { DataPanel } from "@/components/data-panel";
import { FormField, TextInput } from "@/components/form-field";
import { ListTable } from "@/components/list-table";
import { StatusBanner } from "@/components/status-banner";
import { dashboardGet } from "@/lib/api";

export default function LogsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [provider, setProvider] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const query = new URLSearchParams();
      if (email) query.set("email", email);
      if (provider) query.set("provider", provider);
      if (status) query.set("status", status);
      const suffix = query.toString() ? `?${query.toString()}` : "";
      setRows(await dashboardGet<any[]>(`/admin/logs${suffix}`));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load logs",
      );
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="grid gap-6">
      <DataPanel title="Payment logs filters">
        {error ? <StatusBanner message={error} tone="error" /> : null}
        <div className="grid gap-4 md:grid-cols-4">
          <FormField label="Email">
            <TextInput
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>
          <FormField label="Provider">
            <TextInput
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            />
          </FormField>
          <FormField label="Status">
            <TextInput
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </FormField>
          <div className="flex items-end">
            <button
              onClick={() => void load()}
              className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
            >
              Apply
            </button>
          </div>
        </div>
      </DataPanel>
      <DataPanel title="Payment logs">
        <ListTable
          columns={[
            "Date",
            "Email",
            "Amount",
            "Provider",
            "Status",
            "Tx hash",
            "IP",
          ]}
          rows={rows.map((row) => [
            new Date(row.date).toLocaleString(),
            row.email,
            `${row.amountMinor} ${row.currency}`,
            row.provider,
            row.status,
            row.txHash ?? "-",
            row.ipMasked,
          ])}
        />
      </DataPanel>
    </div>
  );
}
