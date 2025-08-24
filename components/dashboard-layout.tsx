"use client";

import { ReactNode, useState } from "react";
import { SidebarNav } from "@/components/sidebar-nav";
import { MeetingForm } from "@/components/meeting-form";
import { useMeetingsStore } from "@/stores/meetings-store";
import { useTasksStore } from "@/stores/tasks-store";
import type { Meeting } from "@/types/meeting";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: Readonly<DashboardLayoutProps>) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const { getTodayMeetings, getUpcomingMeetings, addMeeting } = useMeetingsStore();
  const { getPendingTasks } = useTasksStore();

  // Computed values for sidebar counts
  const todayMeetings = getTodayMeetings();
  const upcomingMeetings = getUpcomingMeetings();
  const pendingTasks = getPendingTasks();

  // Handle meeting submission
  const handleMeetingSubmit = async (meetingData: Omit<Meeting, "id">) => {
    const newMeeting: Meeting = {
      ...meetingData,
      id: `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    addMeeting(newMeeting);
  };

  return (
    <>
      <div className="flex h-screen w-full overflow-hidden">
        <SidebarNav
          onCreateMeeting={() => setIsFormOpen(true)}
          todayCount={todayMeetings.length}
          upcomingCount={upcomingMeetings.length}
          tasksCount={pendingTasks.length}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      <MeetingForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleMeetingSubmit}
      />
    </>
  );
}