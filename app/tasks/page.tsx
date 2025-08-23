"use client"

import { useState } from "react"
import { Plus, CheckSquare, Clock, AlertCircle, LogOut, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ViewToggle } from "@/components/view-toggle"
import { TaskFilters } from "@/components/task-filters"
import { TaskCard } from "@/components/task-card"
import { TaskTable } from "@/components/task-table"
import { TaskForm } from "@/components/task-form"
import { useTasks } from "@/hooks/use-tasks"
import { useMeetings } from "@/hooks/use-meetings"
import { useAuth } from "@/contexts/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { SidebarNav } from "@/components/sidebar-nav"
import { ProtectedRoute } from "@/components/protected-route"
import type { ViewMode, Task } from "@/types/task"
import { toast } from "sonner"

export default function TasksPage() {
  const { user, logout } = useAuth()
  const { todayMeetings, upcomingMeetings } = useMeetings()
  const {
    tasks,
    filteredTasks,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    followUpTasks,
    filters,
    setFilters,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
  } = useTasks()

  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  const handleCreateTask = () => {
    setEditingTask(undefined)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (taskData: Omit<Task, "id">) => {
    try {
      if (editingTask) {
        updateTask(editingTask.id, taskData)
        toast.success("Task updated successfully")
      } else {
        createTask(taskData)
        toast.success("Task created successfully")
      }
      setIsFormOpen(false)
      setEditingTask(undefined)
    } catch (error) {
      console.error("Error submitting task:", error)
      toast.error("Failed to submit task")
    }
  }

  const handleDelete = (taskId: string) => {
    deleteTask(taskId)
    toast.success("Task deleted successfully")
  }

  const handleToggleComplete = (taskId: string) => {
    toggleTaskCompletion(taskId)
    toast.success("Task status updated")
  }

  const handleChangeStatus = (taskId: string, status: Task["status"]) => {
    updateTask(taskId, { status })
    toast.success("Task status updated")
  }

  const handleLogout = () => {
    logout()
    window.location.href = "/login"
  }

  const uniqueAssignees = Array.from(
    new Set(tasks.filter(task => task.assignee).map(task => task.assignee))
  ).filter(Boolean) as string[]

  const stats = [
    {
      title: "Total Tasks",
      value: tasks.length,
      icon: CheckSquare,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "In Progress",
      value: inProgressTasks.length,
      icon: Clock,
      gradient: "from-orange-500 to-orange-600",
    },
    {
      title: "Completed",
      value: completedTasks.length,
      icon: CheckSquare,
      gradient: "from-green-500 to-green-600",
    },
    {
      title: "Follow Ups",
      value: followUpTasks.length,
      icon: AlertCircle,
      gradient: "from-purple-500 to-purple-600",
    },
  ]

  return (
    <ProtectedRoute>
      <div className="flex w-full h-screen">
        {/* Sidebar */}
        <SidebarNav 
          onCreateMeeting={() => {}} 
          todayCount={todayMeetings.length}
          upcomingCount={upcomingMeetings.length}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="border-b bg-card">
            <div className="px-3 py-3 sm:px-4 sm:py-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">
                        Tasks
                      </h1>
                      <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                        Manage your tasks and follow-ups
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Button 
                        onClick={handleCreateTask}
                        size="sm"
                        className="hidden sm:inline-flex"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden lg:inline">New Task</span>
                        <span className="lg:hidden">New</span>
                      </Button>
                      <Button
                        onClick={handleCreateTask}
                        size="icon"
                        className="sm:hidden h-8 w-8"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      
                      {/* User Menu */}
                      {user && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <UserIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                              <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                              </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                              <LogOut className="mr-2 h-4 w-4" />
                              <span>Logout</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
            <div className="space-y-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.gradient}`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and View Controls */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <TaskFilters 
              filters={filters} 
              onFiltersChange={setFilters}
              assignees={uniqueAssignees}
            />
          </div>
          <div className="flex justify-end lg:justify-start">
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </div>

        {/* Tasks Display */}
        {filteredTasks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <CheckSquare className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-4">
                {filters.search || filters.status !== "all" || filters.type !== "all" || filters.priority !== "all" || filters.assignee
                  ? "Try adjusting your filters."
                  : "Create your first task to get started."}
              </p>
              <Button onClick={handleCreateTask}>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
                onChangeStatus={handleChangeStatus}
              />
            ))}
          </div>
        ) : (
          <TaskTable
            tasks={filteredTasks}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleComplete={handleToggleComplete}
            onChangeStatus={handleChangeStatus}
          />
        )}

            {/* Task Form Modal */}
            <TaskForm
              task={editingTask}
              isOpen={isFormOpen}
              onClose={() => setIsFormOpen(false)}
              onSubmit={handleFormSubmit}
            />
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}