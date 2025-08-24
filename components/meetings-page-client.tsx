"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ViewToggle } from "@/components/view-toggle";
import { MeetingFilters } from "@/components/meeting-filters";
import { MeetingTable } from "@/components/meeting-table";
import { MeetingCard } from "@/components/meeting-card";
import { MeetingForm } from "@/components/meeting-form";
import { MeetingsLoading } from "@/components/loading/meetings-loading";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useMeetingsStore } from "@/stores/meetings-store";
import { useAuth } from "@/contexts/auth-context";
import { subscribeMeetings, updateMeeting as updateMeetingFirebase, deleteMeeting } from "@/lib/firebase/meetings";
import type { Meeting, ViewMode } from "@/types/meeting";
import { toast } from "sonner";

export function MeetingsPageClient() {
  const { user } = useAuth();
  const {
    filteredMeetings,
    isLoading,
    filters,
    setMeetings,
    setFilters,
    updateMeeting,
    removeMeeting,
  } = useMeetingsStore();

  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | undefined>();

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeMeetings(user.uid, (meetings) => {
      setMeetings(meetings);
    });

    return unsubscribe;
  }, [user?.uid, setMeetings]);

  const handleCreateMeeting = () => {
    setEditingMeeting(undefined);
    setIsFormOpen(true);
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setIsFormOpen(true);
  };

  const handleDeleteMeeting = async (id: string) => {
    try {
      await deleteMeeting(id);
      removeMeeting(id);
      toast.success("Meeting deleted successfully");
    } catch (error) {
      console.error("Error deleting meeting:", error);
      toast.error("Failed to delete meeting");
    }
  };

  const handleToggleComplete = async (id: string) => {
    const meeting = filteredMeetings.find((m) => m.id === id);
    if (!meeting) return;

    try {
      const updates = { completed: !meeting.completed };
      await updateMeetingFirebase(id, updates);
      updateMeeting(id, updates);
      toast.success(
        `Meeting marked as ${updates.completed ? "completed" : "pending"}`
      );
    } catch (error) {
      console.error("Error updating meeting:", error);
      toast.error("Failed to update meeting");
    }
  };

  const handleFormSubmit = async (meetingData: Omit<Meeting, "id">) => {
    try {
      if (editingMeeting) {
        await updateMeetingFirebase(editingMeeting.id, meetingData);
        updateMeeting(editingMeeting.id, meetingData);
        toast.success("Meeting updated successfully");
      }
      setIsFormOpen(false);
      setEditingMeeting(undefined);
    } catch (error) {
      console.error("Error submitting meeting:", error);
      toast.error(
        editingMeeting ? "Failed to update meeting" : "Failed to create meeting"
      );
    }
  };

  // Find next upcoming meeting
  const nextMeetingId = filteredMeetings
    .filter((m) => !m.completed && new Date(`${m.date}T${m.time}`) > new Date())
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())[0]?.id;

  if (isLoading) {
    return <MeetingsLoading />;
  }

  return (
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
                    All Meetings
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                    Manage and track all your meetings in one place
                  </p>
                </div>
                <Button onClick={handleCreateMeeting} className="shrink-0">
                  <Plus className="h-4 w-4 mr-2" />
                  New Meeting
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
        {/* Controls */}
        <div className="flex justify-end items-center mb-6">
          <div className="flex gap-2 items-center w-full">
            <MeetingFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </div>

        {/* Meetings Display */}
        {viewMode === "table" ? (
          <MeetingTable
            meetings={filteredMeetings}
            onEdit={handleEditMeeting}
            onDelete={handleDeleteMeeting}
            onToggleComplete={handleToggleComplete}
            nextMeetingId={nextMeetingId}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMeetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onEdit={handleEditMeeting}
                onDelete={handleDeleteMeeting}
                onToggleComplete={handleToggleComplete}
                isNext={meeting.id === nextMeetingId}
              />
            ))}
            {filteredMeetings.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No meetings found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {filteredMeetings.length === 0 && filters.search === "" && filters.status === "all" && filters.priority === "all" && filters.type === "all"
                    ? "Create your first meeting to get started"
                    : "Try adjusting your filters to see more meetings"}
                </p>
                {filteredMeetings.length === 0 && filters.search === "" && filters.status === "all" && filters.priority === "all" && filters.type === "all" && (
                  <Button onClick={handleCreateMeeting}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Meeting
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

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