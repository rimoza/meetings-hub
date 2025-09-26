"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckSquare,
  Clock,
  AlertCircle,
  Calendar,
  Tag,
  Hash,
  LogOut,
  User as UserIcon,
  CheckCircle,
  X,
  Plus,
  Target,
  Award,
  Zap,
  Flame,
  Sparkles,
  Timer,
  Activity,
  BarChart3,
  CalendarDays,
  Users,
  FileText,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskForm } from "@/components/task-form";
import { useTasks } from "@/hooks/use-tasks";
import {
  updateTodoStatus,
  addTodoItem,
  deleteTodoItem,
} from "@/lib/firebase/tasks";
import { Input } from "@/components/ui/input";
import { useMeetings } from "@/hooks/use-meetings";
import { useAuth } from "@/contexts/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProtectedRoute } from "@/components/protected-route";
import type { Task } from "@/types/task";
import { toast } from "sonner";

export default function TaskDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const { user, logout } = useAuth();
  const { meetings } = useMeetings();
  const { tasks, updateTask, deleteTask, toggleTaskCompletion } = useTasks();

  const [task, setTask] = useState<Task | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [newTodoText, setNewTodoText] = useState("");
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [updatingTodoIds, setUpdatingTodoIds] = useState<Set<string>>(new Set());
  const [deletingTodoIds, setDeletingTodoIds] = useState<Set<string>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const foundTask = tasks.find((t) => t.id === taskId);
    if (foundTask) {
      setTask(foundTask);
    }
  }, [taskId, tasks]);

  const handleEdit = () => {
    setIsEditFormOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (task) {
      deleteTask(task.id);
      toast.success("Task deleted successfully");
      router.push("/tasks");
    }
    setIsDeleteDialogOpen(false);
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleToggleComplete = () => {
    if (task) {
      toggleTaskCompletion(task.id);
      toast.success("Task status updated");
    }
  };

  const handleFormSubmit = async (taskData: Omit<Task, "id">) => {
    if (task) {
      try {
        updateTask(task.id, taskData);
        toast.success("Task updated successfully");
        setIsEditFormOpen(false);
      } catch (error) {
        console.error("Error updating task:", error);
        toast.error("Failed to update task");
      }
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const handleTodoStatusChange = async (
    todoId: string,
    status: "pending" | "in_progress" | "completed",
  ) => {
    if (!task) return;

    // Prevent multiple rapid updates to the same todo
    if (updatingTodoIds.has(todoId)) return;

    setUpdatingTodoIds(prev => new Set(prev).add(todoId));

    try {
      await updateTodoStatus(task.id, todoId, status);
      toast.success(`Todo item status updated to ${status}`);
      // Let the real-time subscription handle the UI update naturally
      // No need to manually refresh - the subscription will update the task data
    } catch (error) {
      console.error("Error updating todo status:", error);
      toast.error("Failed to update todo status");
    } finally {
      setUpdatingTodoIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(todoId);
        return newSet;
      });
    }
  };

  const handleAddTodo = async () => {
    if (!task || !newTodoText.trim()) return;

    setIsAddingTodo(true);
    const todoText = newTodoText.trim(); // Store the text before clearing

    try {
      await addTodoItem(task.id, todoText);
      toast.success("Todo item added successfully");
      setNewTodoText("");
      // Let the real-time subscription handle the UI update naturally
      // The subscription will automatically add the new todo to the task
    } catch (error) {
      console.error("Error adding todo item:", error);
      toast.error("Failed to add todo item");
    } finally {
      setIsAddingTodo(false);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    if (!task) return;

    // Prevent multiple rapid deletions of the same todo
    if (deletingTodoIds.has(todoId)) return;

    setDeletingTodoIds(prev => new Set(prev).add(todoId));

    try {
      await deleteTodoItem(task.id, todoId);
      toast.success("Todo item deleted successfully");
      // Let the real-time subscription handle the UI update naturally
      // The subscription will automatically remove the todo from the task
    } catch (error) {
      console.error("Error deleting todo item:", error);
      toast.error("Failed to delete todo item");
    } finally {
      setDeletingTodoIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(todoId);
        return newSet;
      });
    }
  };

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "in_progress":
        return <AlertCircle className="h-4 w-4" />;
      case "completed":
        return <CheckSquare className="h-4 w-4" />;
      case "cancelled":
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const relatedMeeting = task?.meetingId
    ? meetings.find((m) => m.id === task.meetingId)
    : null;

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
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Modern Header with Glass Effect */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left Section - Navigation */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/tasks")}
                  className="flex items-center gap-2 hover:bg-muted/50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Back to Tasks</span>
                  <span className="sm:hidden">Back</span>
                </Button>

                {/* Task Title with Creative Badge */}
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-full"></div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground truncate max-w-md">
                      {task.title}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className={`${getStatusColor(task.status)} border-0 text-xs font-medium animate-pulse`}
                      >
                        {getStatusIcon(task.status)}
                        <span className="ml-1 capitalize">
                          {task.status.replace("_", " ")}
                        </span>
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`${getPriorityColor(task.priority)} border-0 text-xs`}
                      >
                        {task.priority === "high" && <Flame className="h-3 w-3 mr-1" />}
                        {task.priority === "medium" && <Zap className="h-3 w-3 mr-1" />}
                        {task.priority === "low" && <Target className="h-3 w-3 mr-1" />}
                        {task.priority} priority
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Actions */}
              <div className="flex items-center gap-2">
                {/* Quick Actions */}
                <div className="hidden sm:flex items-center gap-1">
                  <Button
                    onClick={handleToggleComplete}
                    variant={task.status === "completed" ? "default" : "outline"}
                    size="sm"
                    className="hover:scale-105 transition-transform"
                  >
                    {task.status === "completed" ? (
                      <>
                        <Award className="h-4 w-4 mr-2" />
                        Completed!
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Complete
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    size="sm"
                    className="hover:scale-105 transition-transform"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>

                {/* Mobile Actions */}
                <div className="sm:hidden flex items-center gap-1">
                  <Button
                    onClick={handleToggleComplete}
                    variant={task.status === "completed" ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                  >
                    {task.status === "completed" ? (
                      <Award className="h-4 w-4" />
                    ) : (
                      <CheckSquare className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>

                <ThemeToggle />

                {/* User Menu */}
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 hover:from-primary/30 hover:to-primary/10 transition-all"
                      >
                        <UserIcon className="h-4 w-4" />
                        <span className="sr-only">Toggle user menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user?.name || user?.email}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section with Task Overview */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Overview Hero */}
          <div className="mb-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-background to-secondary/5 border border-border/50">
              <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
              <div className="relative p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Left Side - Task Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          task.status === "completed" ? "bg-green-500/20" :
                          task.status === "in_progress" ? "bg-blue-500/20" :
                          task.status === "cancelled" ? "bg-red-500/20" :
                          "bg-yellow-500/20"
                        }`}>
                          {getStatusIcon(task.status)}
                        </div>
                        {task.status === "completed" && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-foreground">{task.title}</h2>
                        <p className="text-muted-foreground flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Task Overview & Progress
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Progress</span>
                        <span className="text-muted-foreground">
                          {task.todoList ? `${task.todoList.filter(t => t.status === "completed").length}/${task.todoList.length}` : "0/0"} completed
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ease-out ${
                            task.status === "completed" ? "bg-green-500" :
                            task.status === "in_progress" ? "bg-blue-500" :
                            task.status === "cancelled" ? "bg-red-500" :
                            "bg-yellow-500"
                          }`}
                          style={{
                            width: task.todoList && task.todoList.length > 0
                              ? `${(task.todoList.filter(t => t.status === "completed").length / task.todoList.length) * 100}%`
                              : task.status === "completed" ? "100%" : "0%"
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Quick Stats */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-xl bg-card border border-border/50">
                        <div className="text-2xl font-bold text-primary">
                          {task.todoList ? task.todoList.filter(t => t.status === "completed").length : 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-card border border-border/50">
                        <div className="text-2xl font-bold text-orange-500">
                          {task.todoList ? task.todoList.filter(t => t.status === "in_progress").length : 0}
                        </div>
                        <div className="text-xs text-muted-foreground">In Progress</div>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-card border border-border/50">
                        <div className="text-2xl font-bold text-blue-500">
                          {task.todoList ? task.todoList.filter(t => t.status === "pending").length : 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Pending</div>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-card border border-border/50">
                        <div className="text-2xl font-bold text-purple-500">
                          {task.priority === "high" ? "🔥" : task.priority === "medium" ? "⚡" : "🎯"}
                        </div>
                        <div className="text-xs text-muted-foreground">Priority</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Task Details Card */}
              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText className="h-5 w-5 text-primary" />
                    Task Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {task.description && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Description
                      </h3>
                      <p className="text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">
                        {task.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        Schedule
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Timer className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Due Date:</span>
                          <span className="font-medium">{new Date(task.date).toLocaleDateString()}</span>
                        </div>
                        {task.assignee && (
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Assignee:</span>
                            <span className="font-medium">{task.assignee}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        Status & Priority
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getStatusColor(task.status)} border-0`}>
                            {getStatusIcon(task.status)}
                            <span className="ml-1 capitalize">
                              {task.status.replace("_", " ")}
                            </span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getPriorityColor(task.priority)} border-0`}>
                            {task.priority === "high" && <Flame className="h-3 w-3" />}
                            {task.priority === "medium" && <Zap className="h-3 w-3" />}
                            {task.priority === "low" && <Target className="h-3 w-3" />}
                            {task.priority} priority
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {relatedMeeting && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-primary" />
                        Related Meeting
                      </h3>
                      <Card className="p-4 bg-muted/30 border-dashed">
                        <p className="font-medium text-foreground">{relatedMeeting.title}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(relatedMeeting.date).toLocaleDateString()} at {relatedMeeting.time}
                        </p>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>

            {/* Todo List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  To-Do List{" "}
                  {task.todoList &&
                    task.todoList.length > 0 &&
                    `(${task.todoList.filter((todo) => todo.status === "completed").length}/${task.todoList.length})`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add new todo input */}
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Add a new todo item..."
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddTodo();
                      }
                    }}
                    disabled={isAddingTodo}
                  />
                  <Button
                    onClick={handleAddTodo}
                    disabled={isAddingTodo || !newTodoText.trim()}
                    size="icon"
                  >
                    {isAddingTodo ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Todo items list */}
                {task.todoList && task.todoList.length > 0 ? (
                  <div className="space-y-3">
                    {task.todoList.map((todo) => (
                      <div
                        key={todo.id}
                        className="flex items-center gap-3 p-3 rounded-lg border group hover:shadow-sm transition-shadow"
                      >
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                            todo.status === "completed"
                              ? "bg-green-500"
                              : todo.status === "in_progress"
                                ? "bg-blue-500"
                                : "bg-gray-400"
                          }`}
                        >
                          {todo.status === "completed" ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : todo.status === "in_progress" ? (
                            <Clock className="w-4 h-4" />
                          ) : (
                            <AlertCircle className="w-4 h-4" />
                          )}
                        </div>
                        <span
                          className={`flex-1 text-sm ${todo.status === "completed" ? "line-through text-muted-foreground" : ""}`}
                        >
                          {todo.text}
                        </span>
                        <Select
                          value={todo.status}
                          onValueChange={(
                            status: "pending" | "in_progress" | "completed",
                          ) => handleTodoStatusChange(todo.id, status)}
                          disabled={updatingTodoIds.has(todo.id)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteTodo(todo.id)}
                          disabled={deletingTodoIds.has(todo.id)}
                        >
                          {deletingTodoIds.has(todo.id) ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No todo items yet. Add one above to get started!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Labels and Tags */}
            {((task.labels && task.labels.length > 0) ||
              (task.tags && task.tags.length > 0)) && (
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
                    <span className="ml-2 text-muted-foreground font-mono text-xs">
                      {task.id}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Labels and Tags Card */}
              {((task.labels && task.labels.length > 0) ||
                (task.tags && task.tags.length > 0)) && (
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Tag className="h-5 w-5 text-primary" />
                      Labels & Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {task.labels && task.labels.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Labels</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {task.labels.map((label) => (
                            <Badge key={label} variant="secondary" className="hover:scale-105 transition-transform">
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {task.tags && task.tags.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Tags</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {task.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="hover:scale-105 transition-transform">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Task Information Card */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-primary" />
                    Task Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Created
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(task.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span className="font-medium flex items-center gap-2">
                        <Timer className="h-4 w-4 text-primary" />
                        Last Updated
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(task.updatedAt).toLocaleString()}
                      </span>
                    </div>

                    {task.completedAt && (
                      <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <span className="font-medium flex items-center gap-2 text-green-700 dark:text-green-300">
                          <Award className="h-4 w-4" />
                          Completed
                        </span>
                        <span className="text-green-600 dark:text-green-400">
                          {new Date(task.completedAt).toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span className="font-medium flex items-center gap-2">
                        <Hash className="h-4 w-4 text-primary" />
                        Task ID
                      </span>
                      <span className="text-muted-foreground font-mono text-xs">
                        {task.id}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleToggleComplete}
                    variant={task.status === "completed" ? "default" : "outline"}
                    className="w-full justify-start hover:scale-[1.02] transition-all"
                  >
                    {task.status === "completed" ? (
                      <>
                        <Award className="h-4 w-4 mr-2" />
                        Task Completed! 🎉
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Mark as Complete
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    className="w-full justify-start hover:scale-[1.02] transition-all"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Task
                  </Button>

                  <Button
                    onClick={handleDelete}
                    variant="destructive"
                    className="w-full justify-start hover:scale-[1.02] transition-all"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Task
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Task
            </DialogTitle>
            <DialogDescription className="text-left">
              Are you sure you want to delete this task? This action cannot be undone and will permanently remove the task and all its associated data.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="rounded-lg bg-muted/50 p-4 border border-destructive/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{task?.title}</p>
                  <p className="text-sm text-muted-foreground">
                    This task will be permanently deleted
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              className="hover:bg-muted/80"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Form */}
      <TaskForm
        task={task}
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </ProtectedRoute>
  );
}
