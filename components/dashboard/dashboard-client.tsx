"use client";

import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { useMeetingsStore } from "@/stores/meetings-store";
import { useTasksStore } from "@/stores/tasks-store";
import type { Meeting } from "@/types/meeting";
import { toast } from "sonner";
import { MeetingForm } from "@/components/meeting-form";
import { DashboardLoading } from "@/components/loading/dashboard-loading";
import {
  subscribeMeetings,
  createMeeting as createMeetingFirebase,
  updateMeeting as updateMeetingFirebase,
} from "@/lib/firebase/meetings";
import { subscribeTasks } from "@/lib/firebase/tasks";
import { StatsOverview } from "@/components/analytics/stats-overview";
import { UpcomingTimeline } from "@/components/analytics/upcoming-timeline";
import { CompletionRate } from "@/components/analytics/completion-rate";
import { RecentActivity } from "@/components/analytics/recent-activity";

export function DashboardClient() {
  const { user } = useAuth();

  const {
    isLoading,
    setMeetings,
    updateMeeting,
  } = useMeetingsStore();

  const { setTasks } = useTasksStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | undefined>();

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

  const handleFormSubmit = async (meetingData: Omit<Meeting, "id">) => {
    try {
      if (editingMeeting) {
        await updateMeetingFirebase(editingMeeting.id, meetingData);
        updateMeeting(editingMeeting.id, meetingData);
        toast.success("Meeting updated successfully");
      } else {
        await createMeetingFirebase(user!.uid, meetingData);
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

  if (isLoading) {
    return <DashboardLoading />;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="border-b bg-card">
        <div className="px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">
                    Analytics Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                    Overview of your meetings and tasks
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
        <div className="space-y-6">
          <StatsOverview />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <CompletionRate />
            </div>
            
            <div className="space-y-6">
              <UpcomingTimeline />
              <RecentActivity />
            </div>
          </div>
        </div>
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