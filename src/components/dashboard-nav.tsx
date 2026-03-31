"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items: Array<[string, string]> = [
  ["/overview", "Overview"],
  ["/content", "Content"],
  ["/hero", "Hero Slides"],
  ["/home-sections", "Home Sections"],
  ["/tours", "Tours"],
  ["/gallery", "Gallery"],
  ["/pages", "Static Pages"],
  ["/contact", "Contact"],
  ["/legal", "Legal"],
  ["/payments", "Payments"],
  ["/providers", "Providers"],
  ["/logs", "Logs"],
  ["/audit", "Audit"],
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <aside className="w-72 shrink-0 border-r border-slate-200 bg-white p-6">
      <p className="font-serif text-2xl text-ink">Safar CMS</p>
      <nav className="mt-8 grid gap-2">
        {items.map(([href, label]) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-2xl px-4 py-3 text-sm transition ${active ? "bg-ink text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
