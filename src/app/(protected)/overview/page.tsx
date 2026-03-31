"use client";

import { useEffect, useState } from "react";

import { DataPanel } from "@/components/data-panel";
import { dashboardGet } from "@/lib/api";

export default function OverviewPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    void dashboardGet("/admin/overview")
      .then(setData)
      .catch(() => setData({ stats: {} }));
  }, []);

  const stats = data?.stats ?? {};

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-amber">
          Operations
        </p>
        <h1 className="mt-3 font-serif text-5xl text-ink">Platform overview</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {Object.entries(stats).map(([key, value]) => (
          <DataPanel key={key} title={key}>
            <p className="text-4xl text-ink">{String(value)}</p>
          </DataPanel>
        ))}
      </div>
    </div>
  );
}
