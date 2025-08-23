"use client"

import { useState } from "react"
import { Plus, CheckSquare, Clock, AlertCircle, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ViewToggle } from "@/components/view-toggle"
import { TaskFilters } from "@/components/task-filters"
import { TaskCard } from "@/components/task-card"
import { TaskTable } from "@/components/task-table"
import { TaskForm } from "@/components/task-form"
import { useTasks } from "@/hooks/use-tasks"
import type { ViewMode, Task } from "@/types/task"
import { toast } from "sonner"

export default function TasksPage() {
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
            <p className="text-muted-foreground">Manage your tasks and follow-ups</p>
          </div>
          <Button onClick={handleCreateTask}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

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
    </div>
  )
}