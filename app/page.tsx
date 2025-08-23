import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { ProtectedRoute } from "@/components/protected-route";

export default async function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardClient />
    </ProtectedRoute>
  );
}

export const metadata = {
  title: "Dashboard - Kulan Space",
  description: "Your meeting management dashboard",
};
