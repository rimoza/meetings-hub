import { TasksPageClient } from '@/components/tasks/tasks-page-client'
import { ProtectedRoute } from '@/components/protected-route'

export default async function TasksPage() {
  return (
    <ProtectedRoute>
      {/* Use full-screen layout with sidebar and header like other pages */}
      <TasksPageClient />
    </ProtectedRoute>
  )
}

export const metadata = {
  title: 'Tasks - Kulan Space',
  description: 'Manage your tasks and follow-ups effectively'
}