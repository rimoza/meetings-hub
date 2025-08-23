"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Edit, Trash2, CheckSquare, Clock, AlertCircle, Calendar, User, Tag, Hash, LogOut, User as UserIcon, CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import type { Task } from "@/types/task"
import { toast } from "sonner"

export default function TaskDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.id as string
  
  const { user, logout } = useAuth()
  const { todayMeetings, upcomingMeetings, meetings } = useMeetings()
  const { tasks, updateTask, deleteTask, toggleTaskCompletion, pendingTasks, inProgressTasks } = useTasks()
  
  const [task, setTask] = useState<Task | null>(null)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [completedTodos, setCompletedTodos] = useState<Set<number>>(new Set())

  useEffect(() => {
    const foundTask = tasks.find(t => t.id === taskId)
    if (foundTask) {
      setTask(foundTask)
    }
  }, [taskId, tasks])

  const handleEdit = () => {
    setIsEditFormOpen(true)
  }

  const handleDelete = () => {
    if (task && confirm("Are you sure you want to delete this task?")) {
      deleteTask(task.id)
      toast.success("Task deleted successfully")
      router.push("/tasks")
    }
  }

  const handleToggleComplete = () => {
    if (task) {
      toggleTaskCompletion(task.id)
      toast.success("Task status updated")
    }
  }

  const handleFormSubmit = async (taskData: Omit<Task, "id">) => {
    if (task) {
      try {
        updateTask(task.id, taskData)
        toast.success("Task updated successfully")
        setIsEditFormOpen(false)
      } catch (error) {
        console.error("Error updating task:", error)
        toast.error("Failed to update task")
      }
    }
  }

  const handleLogout = () => {
    logout()
    window.location.href = "/login"
  }

  const toggleTodoComplete = (index: number) => {
    setCompletedTodos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "in_progress":
        return <AlertCircle className="h-4 w-4" />
      case "completed":
        return <CheckSquare className="h-4 w-4" />
      case "cancelled":
        return <X className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const relatedMeeting = task?.meetingId ? meetings.find(m => m.id === task.meetingId) : null

  if (!task) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Task not found</h2>
            <Button onClick={() => router.push("/tasks")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tasks
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex w-full h-screen">
        {/* Sidebar */}
        <SidebarNav 
          onCreateMeeting={() => {}} 
          todayCount={todayMeetings.length}
          upcomingCount={upcomingMeetings.length}
          tasksCount={pendingTasks.length + inProgressTasks.length}
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
                      <div className="flex items-center gap-2 mb-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => router.push("/tasks")}
                          className="p-1"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">
                          {task.title}
                        </h1>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                        Task Details
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Button 
                        onClick={handleEdit}
                        size="sm"
                        variant="outline"
                        className="hidden sm:inline-flex"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        onClick={handleEdit}
                        size="icon"
                        variant="outline"
                        className="sm:hidden h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
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
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Task Overview Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-2xl">{task.title}</CardTitle>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className={`${getStatusColor(task.status)} border-0`}>
                          {getStatusIcon(task.status)}
                          <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
                        </Badge>
                        <Badge variant="outline" className={`${getPriorityColor(task.priority)} border-0`}>
                          {task.priority} priority
                        </Badge>
                        <Badge variant="outline">
                          {task.type === "follow_up" ? "Follow Up" : "Task"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleToggleComplete}
                        variant={task.status === "completed" ? "default" : "outline"}
                        size="sm"
                      >
                        <CheckSquare className="h-4 w-4 mr-2" />
                        {task.status === "completed" ? "Completed" : "Mark Complete"}
                      </Button>
                      <Button onClick={handleDelete} variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {task.description && (
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground">{task.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Due: {new Date(task.date).toLocaleDateString()}</span>
                    </div>
                    {task.assignee && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Assignee: {task.assignee}</span>
                      </div>
                    )}
                  </div>

                  {relatedMeeting && (
                    <div>
                      <h3 className="font-semibold mb-2">Related Meeting</h3>
                      <Card className="p-3">
                        <p className="font-medium">{relatedMeeting.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(relatedMeeting.date).toLocaleDateString()} at {relatedMeeting.time}
                        </p>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Todo List */}
              {task.todoList && task.todoList.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckSquare className="h-5 w-5" />
                      To-Do List ({task.todoList.filter((_, index) => completedTodos.has(index)).length}/{task.todoList.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {task.todoList.map((todo, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg border">
                          <button
                            onClick={() => toggleTodoComplete(index)}
                            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              completedTodos.has(index)
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {completedTodos.has(index) && <CheckCircle className="w-3 h-3" />}
                          </button>
                          <span className={`text-sm ${completedTodos.has(index) ? 'line-through text-muted-foreground' : ''}`}>
                            {todo}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Labels and Tags */}
              {((task.labels && task.labels.length > 0) || (task.tags && task.tags.length > 0)) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Labels & Tags</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {task.labels && task.labels.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Labels</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {task.labels.map((label) => (
                            <Badge key={label} variant="secondary">
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {task.tags && task.tags.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Tags</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {task.tags.map((tag) => (
                            <Badge key={tag} variant="outline">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Task Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle>Task Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Created:</span>
                      <span className="ml-2 text-muted-foreground">
                        {new Date(task.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Last Updated:</span>
                      <span className="ml-2 text-muted-foreground">
                        {new Date(task.updatedAt).toLocaleString()}
                      </span>
                    </div>
                    {task.completedAt && (
                      <div>
                        <span className="font-medium">Completed:</span>
                        <span className="ml-2 text-muted-foreground">
                          {new Date(task.completedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Task ID:</span>
                      <span className="ml-2 text-muted-foreground font-mono text-xs">{task.id}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </main>
        </div>
      </div>

      {/* Edit Task Form */}
      <TaskForm
        task={task}
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </ProtectedRoute>
  )
}