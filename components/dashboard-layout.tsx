"use client";

import { ReactNode, useState } from "react";
import { SidebarNav } from "@/components/sidebar-nav";
import { MeetingForm } from "@/components/meeting-form";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus, User, LogOut, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useMeetingsStore } from "@/stores/meetings-store";
import { useTasksStore } from "@/stores/tasks-store";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Meeting } from "@/types/meeting";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: Readonly<DashboardLayoutProps>) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const { getTodayMeetings, getUpcomingMeetings, addMeeting } = useMeetingsStore();
  const { getPendingTasks } = useTasksStore();
  const { user, logout } = useAuth();

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
            
            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.name || "User"}
                      className="h-6 w-6 rounded-full"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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