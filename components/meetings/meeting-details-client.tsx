"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useMeetingsStore } from "@/stores/meetings-store";
import { useTasksStore } from "@/stores/tasks-store";
import { MeetingDetails } from "@/components/meeting-details";
import { MeetingForm } from "@/components/meeting-form";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Meeting } from "@/types/meeting";
import { toast } from "sonner";
import {
  subscribeMeetings,
  updateMeeting as updateMeetingFirebase,
  deleteMeeting as deleteMeetingFirebase,
  addMeetingNote as addMeetingNoteFirebase,
  toggleMeetingCompletion as toggleMeetingFirebase,
} from "@/lib/firebase/meetings";
import { subscribeTasks } from "@/lib/firebase/tasks";

interface MeetingDetailsClientProps {
  initialMeeting: Meeting;
}

export function MeetingDetailsClient({
  initialMeeting,
}: Readonly<MeetingDetailsClientProps>) {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Zustand stores
  const { meetings, setMeetings, updateMeeting, removeMeeting } =
    useMeetingsStore();

  const { setTasks } = useTasksStore();

  // Local state for UI
  const [meeting, setMeeting] = useState<Meeting>(initialMeeting);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | undefined>();

  // Initialize stores and subscribe to real-time updates
  useEffect(() => {
    if (!user?.uid) return;

    // Subscribe to meetings for real-time updates
    const unsubscribeMeetings = subscribeMeetings(user.uid, (meetings) => {
      setMeetings(meetings);

      // Update current meeting if it exists in the new data
      const updatedMeeting = meetings.find((m) => m.id === initialMeeting.id);
      if (updatedMeeting) {
        setMeeting(updatedMeeting);
      }
    });

    // Subscribe to tasks for sidebar counts
    const unsubscribeTasks = subscribeTasks(user.uid, (tasks) => {
      setTasks(tasks);
    });

    return () => {
      unsubscribeMeetings();
      unsubscribeTasks();
    };
  }, [user?.uid, initialMeeting.id, setMeetings, setTasks]);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (meetingData: Omit<Meeting, "id">) => {
    try {
      if (editingMeeting) {
        const { ...updateData } = meetingData;
        await updateMeetingFirebase(editingMeeting.id, updateData);
        updateMeeting(editingMeeting.id, updateData);
        toast.success("Meeting updated successfully");
      }

      setIsFormOpen(false);
      setEditingMeeting(undefined);
    } catch (error) {
      console.error("Error submitting meeting:", error);
      toast.error("Failed to update meeting");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMeetingFirebase(id);
      removeMeeting(id);
      toast.success("Meeting deleted successfully");
      router.push("/");
    } catch (error) {
      console.error("Error deleting meeting:", error);
      toast.error("Failed to delete meeting");
    }
  };

  const handleToggleComplete = async (meetingId: string) => {
    try {
      const currentMeeting = meetings.find((m) => m.id === meetingId);
      if (currentMeeting) {
        const newStatus = currentMeeting.completed ? false : true;
        await toggleMeetingFirebase(meetingId, newStatus);
        updateMeeting(meetingId, { completed: newStatus });
        toast.success("Meeting completion status toggled successfully");
      }
    } catch (error) {
      console.error("Error toggling completion:", error);
      toast.error("Failed to toggle completion status");
    }
  };

  const handleEditNotes = async (meetingId: string, notes: string) => {
    try {
      await updateMeetingFirebase(meetingId, { notes });
      updateMeeting(meetingId, { notes });
    } catch (error) {
      console.error("Error updating notes:", error);
      toast.error("Failed to update meeting notes");
    }
  };

  const handleAddNote = async (
    meetingId: string,
    noteContent: string,
    noteType: "regular" | "follow-up",
    author?: string,
    taskDetails?: {
      assignee?: string;
      priority?: "low" | "medium" | "high";
      dueDate?: string;
    },
  ) => {
    try {
      await addMeetingNoteFirebase(
        user!.uid,
        meetingId,
        noteContent,
        noteType,
        author,
        taskDetails,
      );
      // The meeting will be updated through real-time subscription
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add meeting note");
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen w-full max-w-4xl mx-auto bg-background">
      {/* Header with Back Button */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">
                  Meeting Details
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  View and manage meeting information
                </p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2">
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
                <DropdownMenuContent className="w-56" align="end" forceMount>
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
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl mx-auto my-4">
        <MeetingDetails
          meeting={meeting}
          onBack={handleBack}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleComplete={handleToggleComplete}
          onEditNotes={handleEditNotes}
          onAddNote={handleAddNote}
        />
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
