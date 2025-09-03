"use client";

import { ReactNode } from "react";
import { SidebarNav } from "@/components/sidebar-nav";
import { NewItemDropdown } from "@/components/new-item-dropdown";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { User, LogOut, Settings, Search, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useMeetingsStore } from "@/stores/meetings-store";
import { useTasksStore } from "@/stores/tasks-store";
import { useAppointments } from "@/hooks/use-appointments";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Meeting } from "@/types/meeting";
import type { Task } from "@/types/task";
import type { Appointment } from "@/types/appointment";
import type { Contact } from "@/types/contact";
import type { Archive } from "@/types/archive";
import type { Report } from "@/types/report";
// import Image from "next/image";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: Readonly<DashboardLayoutProps>) {
  const { getTodayMeetings, getUpcomingMeetings, addMeeting } = useMeetingsStore();
  const { getPendingTasks, addTask } = useTasksStore();
  const { createAppointment } = useAppointments();
  const { user, logout } = useAuth();

  // Computed values for sidebar counts
  const todayMeetings = getTodayMeetings();
  const upcomingMeetings = getUpcomingMeetings();
  const pendingTasks = getPendingTasks();

  // Handle submissions for different item types
  const handleMeetingSubmit = async (meetingData: Omit<Meeting, "id">) => {
    const newMeeting: Meeting = {
      ...meetingData,
      id: `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    addMeeting(newMeeting);
  };

  const handleTaskSubmit = async (taskData: Omit<Task, "id">) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    addTask(newTask);
  };

  const handleAppointmentSubmit = async (appointmentData: Omit<Appointment, "id" | "createdAt" | "updatedAt">) => {
    try {
      await createAppointment(appointmentData);
    } catch (error) {
      console.error("Failed to create appointment:", error);
    }
  };

  const handleContactSubmit = async (contactData: Omit<Contact, "id" | "createdAt" | "updatedAt">) => {
    // TODO: Implement contact submission
    console.log("Contact:", contactData);
  };

  const handleArchiveSubmit = async (archiveData: Omit<Archive, "id" | "createdAt" | "updatedAt">) => {
    // TODO: Implement archive submission
    console.log("Archive:", archiveData);
  };

  const handleReportSubmit = async (reportData: Omit<Report, "id" | "createdAt" | "updatedAt">) => {
    // TODO: Implement report submission
    console.log("Report:", reportData);
  };

  return (
    <>
      <SidebarNav
        todayCount={todayMeetings.length}
        upcomingCount={upcomingMeetings.length}
        tasksCount={pendingTasks.length}
      />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
          <div className="flex items-center gap-4 flex-1">
            <SidebarTrigger className="-ml-1 hover:bg-accent rounded-md transition-colors" />
            
            {/* Search Bar */}
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search meetings, tasks, contacts..."
                className="pl-10 pr-4 h-9 bg-muted/40 border-muted focus:bg-background transition-colors"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative hover:bg-accent">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]" variant="destructive">
                3
              </Badge>
            </Button>
            
            {/* New Item Dropdown */}
            <NewItemDropdown
              onMeetingSubmit={handleMeetingSubmit}
              onTaskSubmit={handleTaskSubmit}
              onAppointmentSubmit={handleAppointmentSubmit}
              onContactSubmit={handleContactSubmit}
              onArchiveSubmit={handleArchiveSubmit}
              onReportSubmit={handleReportSubmit}
            />
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-accent">
                  {user?.photoURL ? (
                    <img
                      width={32}
                      height={32}
                      src={user.photoURL}
                      alt={user.name || "User"}
                      className="h-8 w-8 rounded-full ring-2 ring-background"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2">
                <DropdownMenuLabel className="font-normal pb-2">
                  <div className="flex items-center gap-3">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.name || "User"}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-foreground" />
                      </div>
                    )}
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem className="cursor-pointer rounded-md transition-colors">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 focus:text-red-600 cursor-pointer rounded-md transition-colors"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 bg-muted/30">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </SidebarInset>
    </>
  );
}