"use client";

import { useState, useEffect } from "react";
import {
  CheckSquare,
  Clock,
  AlertCircle,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ViewToggle } from "@/components/view-toggle";
import { TaskFilters } from "@/components/task-filters";
import { TaskCard } from "@/components/task-card";
import { TaskTable } from "@/components/task-table";
import { TaskForm } from "@/components/task-form";
import { useTasksStore } from "@/stores/tasks-store";
import { useMeetingsStore } from "@/stores/meetings-store";
import { useAuth } from "@/contexts/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { SidebarNav } from "@/components/sidebar-nav";
import type { Task } from "@/types/task";
import { toast } from "sonner";
import {
  subscribeTasks,
  createTask as createTaskFirebase,
  updateTask as updateTaskFirebase,
  deleteTask as deleteTaskFirebase,
  toggleTaskCompletion as toggleTaskFirebase,
} from "@/lib/firebase/tasks";
import { subscribeMeetings } from "@/lib/firebase/meetings";
import { TasksLoading } from "@/components/loading/tasks-loading";

type ViewMode = "table" | "card";

export function TasksPageClient() {
  const { user, logout } = useAuth();

  // Zustand stores
  const {
    tasks,
    filteredTasks,
    isLoading,
    filters,
    setTasks,
    setFilters,
    updateTask,
    removeTask,
    getPendingTasks,
    getInProgressTasks,
    getCompletedTasks,
    getFollowUpTasks,
  } = useTasksStore();

  const { getTodayMeetings, getUpcomingMeetings, setMeetings } =
    useMeetingsStore();

  // Local UI state
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribeTasks = subscribeTasks(user.uid, (tasks) => {
      setTasks(tasks);
    });

    const unsubscribeMeetings = subscribeMeetings(user.uid, (meetings) => {
      setMeetings(meetings);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeMeetings();
    };
  }, [user?.uid, setTasks, setMeetings]);

  // Computed values
  const pendingTasks = getPendingTasks();
  const inProgressTasks = getInProgressTasks();
  const completedTasks = getCompletedTasks();
  const followUpTasks = getFollowUpTasks();
  const todayMeetings = getTodayMeetings();
  const upcomingMeetings = getUpcomingMeetings();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setIsFormOpen(true);
  };

  const handleCreateMeeting = () => {
    // Navigate to dashboard to create meeting
    window.location.href = "/";
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "completedAt">,
  ) => {
    try {
      if (editingTask) {
        await updateTaskFirebase(editingTask.id, taskData);
        updateTask(editingTask.id, taskData);
        toast.success("Task updated successfully");
      } else {
        await createTaskFirebase(user!.uid, taskData);
        // Real-time subscription will automatically add the new task to the store
        toast.success("Task created successfully");
      }

      setIsFormOpen(false);
      setEditingTask(undefined);
    } catch (error) {
      console.error("Error submitting task:", error);
      toast.error(
        editingTask ? "Failed to update task" : "Failed to create task",
      );
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTaskFirebase(id);
      removeTask(id);
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleToggleCompletion = async (id: string) => {
    try {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        const newStatus = task.status === "completed" ? "pending" : "completed";
        await toggleTaskFirebase(id, newStatus);
        updateTask(id, { status: newStatus });
        toast.success("Task status updated successfully");
      }
    } catch (error) {
      console.error("Error toggling task completion:", error);
      toast.error("Failed to update task status");
    }
  };

  if (isLoading) {
    return <TasksLoading />;
  }

  return (
    <div className="flex w-full h-screen">
      {/* Sidebar */}
      <SidebarNav
        onCreateMeeting={handleCreateMeeting}
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
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                      Tasks
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                      Manage your tasks and follow-ups
                    </p>
                  </div>

                  {/* Action Buttons and User Menu */}
                  <div className="flex items-center gap-2 ml-2">
                    <Button
                      onClick={handleCreateTask}
                      size="sm"
                      className="hidden sm:inline-flex"
                    >
                      <CheckSquare className="h-4 w-4 mr-2" />
                      <span className="hidden lg:inline">New Task</span>
                      <span className="lg:hidden">New</span>
                    </Button>
                    <Button
                      onClick={handleCreateTask}
                      size="icon"
                      className="sm:hidden h-8 w-8"
                    >
                      <CheckSquare className="h-4 w-4" />
                    </Button>
                    <ThemeToggle />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="relative h-9 w-9 rounded-full bg-primary/10"
                        >
                          <UserIcon className="h-4 w-4" />
                          <span className="sr-only">Toggle user menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-56"
                        align="end"
                        forceMount
                      >
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingTasks.length}</div>
                <p className="text-xs text-muted-foreground">
                  Tasks waiting to start
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  In Progress
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {inProgressTasks.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active tasks
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {completedTasks.length}
                </div>
                <p className="text-xs text-muted-foreground">Finished tasks</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Follow-ups
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{followUpTasks.length}</div>
                <p className="text-xs text-muted-foreground">
                  Meeting follow-ups
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex justify-end items-center mb-6">
            <div className="flex gap-2 items-center">
              <TaskFilters filters={filters} onFiltersChange={setFilters} />
              <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>
          </div>

          {/* Tasks Display */}
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {tasks.length === 0
                    ? "Create your first task to get started"
                    : "Try adjusting your filters to see more tasks"}
                </p>
                {tasks.length === 0 && (
                  <Button onClick={handleCreateTask}>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Create Task
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : viewMode === "card" ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onToggleComplete={handleToggleCompletion}
                />
              ))}
            </div>
          ) : (
            <TaskTable
              tasks={filteredTasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onToggleComplete={handleToggleCompletion}
            />
          )}
        </main>
      </div>

      {/* Task Form Modal */}
      <TaskForm
        task={editingTask}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(undefined);
        }}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
