import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  return <DashboardClient />;
}

export const metadata = {
  title: "Dashboard - Kulan Space",
  description: "Your meeting management dashboard",
};
