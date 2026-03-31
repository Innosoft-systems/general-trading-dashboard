import { DashboardNav } from "@/components/dashboard-nav";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-shell">
      <DashboardNav />
      <div className="min-w-0 flex-1 overflow-x-hidden p-6 xl:p-8">
        {children}
      </div>
    </div>
  );
}
