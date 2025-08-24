"use client";

import { ReactNode, useState } from "react";
import { SidebarNav } from "@/components/sidebar-nav";
import { MeetingForm } from "@/components/meeting-form";
import { useMeetingsStore } from "@/stores/meetings-store";
import { useTasksStore } from "@/stores/tasks-store";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const { getTodayMeetings, getUpcomingMeetings } = useMeetingsStore();
  const { getPendingTasks } = useTasksStore();

  // Computed values for sidebar counts
  const todayMeetings = getTodayMeetings();
  const upcomingMeetings = getUpcomingMeetings();
  const pendingTasks = getPendingTasks();

  return (
    <>
      <div className="flex h-screen overflow-hidden">
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
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
      />
    </>
  );
}