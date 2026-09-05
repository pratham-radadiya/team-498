import RouteGuard from "@/components/layout/RouteGuard";
import AppShell from "@/components/layout/AppShell";

export default function DashboardLayout({ children }) {
  return (
    <RouteGuard>
      <AppShell>{children}</AppShell>
    </RouteGuard>
  );
}
