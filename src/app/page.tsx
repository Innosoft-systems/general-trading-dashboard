"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { dashboardPost } from "@/lib/api";

const runtime = globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(
    runtime.process?.env?.NEXT_PUBLIC_BOOTSTRAP_ADMIN_EMAIL ?? "",
  );
  const [password, setPassword] = useState(
    runtime.process?.env?.NEXT_PUBLIC_BOOTSTRAP_ADMIN_PASSWORD ?? "",
  );
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await dashboardPost("/admin/auth/login", { email, password });
      router.push("/overview");
    } catch {
      setError("Unable to authenticate. Check bootstrap credentials.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(183,138,61,0.12),_transparent_35%),linear-gradient(180deg,_#f7f3ec,_#eef2f7)] p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-[2rem] border border-white/60 bg-white/90 p-8 shadow-panel backdrop-blur"
      >
        <p className="text-sm uppercase tracking-[0.22em] text-amber">
          Admin access
        </p>
        <h1 className="mt-3 font-serif text-4xl text-ink">Safar CMS</h1>
        <div className="mt-8 grid gap-4">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-full border border-slate-300 px-4 py-3"
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className="rounded-full border border-slate-300 px-4 py-3"
          />
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <button className="rounded-full bg-ink px-4 py-3 text-sm font-medium text-white">
            Sign in
          </button>
        </div>
      </form>
    </main>
  );
}
