import { TasksPageClient } from "@/components/tasks/tasks-page-client";

export default async function TasksPage() {
  return <TasksPageClient />;
}

export const metadata = {
  title: "Tasks - Chairman Office",
  description: "Manage your tasks and follow-ups effectively",
};
