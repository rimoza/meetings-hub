"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ViewToggle } from "@/components/view-toggle";
import { MeetingFilters } from "@/components/meeting-filters";
import { MeetingCard } from "@/components/meeting-card";
import { MeetingTable } from "@/components/meeting-table";
import { useMeetingsStore } from "@/stores/meetings-store";
import { useTasksStore } from "@/stores/tasks-store";
import type { ViewMode, Meeting } from "@/types/meeting";
import { toast } from "sonner";
import { MeetingForm } from "@/components/meeting-form";
import { DashboardLoading } from "@/components/loading/dashboard-loading";
import {
  subscribeMeetings,
  createMeeting as createMeetingFirebase,
  updateMeeting as updateMeetingFirebase,
  deleteMeeting as deleteMeetingFirebase,
  toggleMeetingCompletion as toggleMeetingFirebase,
} from "@/lib/firebase/meetings";
import { subscribeTasks } from "@/lib/firebase/tasks";

export function DashboardClient() {
  const { user, logout } = useAuth();

  // Zustand stores
  const {
    meetings,
    filteredMeetings,
    isLoading,
    filters,
    setMeetings,
    setFilters,
    updateMeeting,
    removeMeeting,
    getTodayMeetings,
    getUpcomingMeetings,
    getCompletedMeetings,
  } = useMeetingsStore();

  const { setTasks, getPendingTasks, getInProgressTasks } = useTasksStore();

  // Local UI state
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | undefined>();

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribeMeetings = subscribeMeetings(user.uid, (meetings) => {
      setMeetings(meetings);
    });

    const unsubscribeTasks = subscribeTasks(user.uid, (tasks) => {
      setTasks(tasks);
    });

    return () => {
      unsubscribeMeetings();
      unsubscribeTasks();
    };
  }, [user?.uid, setMeetings, setTasks]);

  // Computed values
  const todayMeetings = getTodayMeetings();
  const upcomingMeetings = getUpcomingMeetings();
  const completedMeetings = getCompletedMeetings();
  const pendingTasks = getPendingTasks();
  const inProgressTasks = getInProgressTasks();

  // Get next meeting
  const nextMeeting = upcomingMeetings[0]; // Assuming they're sorted by date

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setIsFormOpen(true);
  };

  const handleCreateMeeting = () => {
    setEditingMeeting(undefined);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (meetingData: Omit<Meeting, "id">) => {
    try {
      if (editingMeeting) {
        await updateMeetingFirebase(editingMeeting.id, meetingData);
        updateMeeting(editingMeeting.id, meetingData);
        toast.success("Meeting updated successfully");
      } else {
        await createMeetingFirebase(user!.uid, meetingData);
        // Real-time subscription will automatically add the new meeting to the store
        toast.success("Meeting created successfully");
      }
      setIsFormOpen(false);
      setEditingMeeting(undefined);
    } catch (error) {
      console.error("Error submitting meeting:", error);
      toast.error(
        editingMeeting
          ? "Failed to update meeting"
          : "Failed to create meeting",
      );
    }
  };

  const handleDelete = async (meetingId: string) => {
    try {
      await deleteMeetingFirebase(meetingId);
      removeMeeting(meetingId);
      toast.success("Meeting deleted successfully");
    } catch (error) {
      console.error("Error deleting meeting:", error);
      toast.error("Failed to delete meeting");
    }
  };

  const handleToggleComplete = async (meetingId: string) => {
    try {
      const meeting = meetings.find((m) => m.id === meetingId);
      if (meeting) {
        const newStatus = !meeting.completed;
        await toggleMeetingFirebase(meetingId, newStatus);
        updateMeeting(meetingId, { completed: newStatus });
        toast.success("Meeting completion status toggled successfully");
      }
    } catch (error) {
      console.error("Error toggling completion:", error);
      toast.error("Failed to toggle completion status");
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const stats = [
    {
      title: "Total Meetings",
      value: meetings.length,
      icon: Calendar,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Completed",
      value: completedMeetings.length,
      icon: CheckCircle,
      gradient: "from-green-500 to-green-600",
    },
    {
      title: "Today's Meetings",
      value: todayMeetings.length,
      icon: Clock,
      gradient: "from-purple-500 to-purple-600",
    },
  ];

  if (isLoading) {
    return <DashboardLoading />;
  }

  const dashboardContent = (
    <>
      {/* Stats Cards - Mobile First */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="overflow-hidden">
            <CardHeader className="p-3 sm:p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div
                  className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-r ${stat.gradient}`}
                >
                  <stat.icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and View Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <MeetingFilters filters={filters} onFiltersChange={setFilters} />
        </div>
        <div className="flex justify-end lg:justify-start">
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
      </div>

      {/* Meetings Display */}
      {filteredMeetings.length === 0 ? (
        <Card className="text-center py-8 sm:py-12">
          <CardContent>
            <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">
              No meetings found
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 px-2">
              {filters.search ||
              filters.status !== "all" ||
              filters.priority !== "all" ||
              filters.type !== "all"
                ? "Try adjusting your filters."
                : "Create your first meeting."}
            </p>
            <Button
              onClick={handleCreateMeeting}
              size="sm"
              className="sm:size-default"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Meeting
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6">
          {filteredMeetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
              isNext={nextMeeting?.id === meeting.id}
            />
          ))}
        </div>
      ) : (
        <MeetingTable
          meetings={filteredMeetings}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleComplete={handleToggleComplete}
          nextMeetingId={nextMeeting?.id}
        />
      )}
    </>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Mobile First */}
        <header className="border-b bg-card">
          <div className="px-3 py-3 sm:px-4 sm:py-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden" />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">
                      Dashboard
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                      Manage your meetings
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <Button
                      onClick={handleCreateMeeting}
                      size="sm"
                      className="hidden sm:inline-flex"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="hidden lg:inline">New Meeting</span>
                      <span className="lg:hidden">New</span>
                    </Button>
                    <Button
                      onClick={handleCreateMeeting}
                      size="icon"
                      className="sm:hidden h-8 w-8"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>

                    {/* User Menu */}
                    {user && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <UserIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                              <p className="text-sm font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.email}
                              </p>
                            </div>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={handleLogout}
                            className="text-red-600 dark:text-red-400"
                          >
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
          {dashboardContent}
        </main>

      {/* Meeting Form Modal */}
      <MeetingForm
        meeting={editingMeeting}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMeeting(undefined);
        }}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
