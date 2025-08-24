"use client";

import { ReactNode, useState } from "react";
import { SidebarNav } from "@/components/sidebar-nav";
import { MeetingForm } from "@/components/meeting-form";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
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
      <SidebarNav
        todayCount={todayMeetings.length}
        upcomingCount={upcomingMeetings.length}
        tasksCount={pendingTasks.length}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>
          
          <div className="flex items-center gap-2">
            {/* New Meeting Button */}
            <Button
              onClick={() => setIsFormOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Meeting
            </Button>
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* User Profile Button */}
            <Button variant="outline" size="icon">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </SidebarInset>
      <MeetingForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleMeetingSubmit}
      />
    </>
  );
}