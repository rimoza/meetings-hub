import { getTasks } from '@/lib/firebase/server'
import { PageHeader } from '@/components/ui/page-header'
import { TasksPageClient } from '@/components/tasks/tasks-page-client'
import { ProtectedRoute } from '@/components/protected-route'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function TasksPage() {
  // Server-side data fetching - will need userId from auth context in client
  // For now, we'll let the client component handle initial data loading
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        {/* Server-rendered page header */}
        <PageHeader 
          title="Tasks"
          description="Manage your tasks and follow-ups"
        >
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </PageHeader>
        
        {/* Client component for interactive features and real-time updates */}
        <TasksPageClient />
      </div>
    </ProtectedRoute>
  )
}

export const metadata = {
  title: 'Tasks - Kulan Space',
  description: 'Manage your tasks and follow-ups effectively'
}