import { TasksPageClient } from "@/components/tasks/tasks-page-client";

export default async function TasksPage() {
  return <TasksPageClient />;
}

export const metadata = {
  title: "Tasks - Kulan Space",
  description: "Manage your tasks and follow-ups effectively",
};
