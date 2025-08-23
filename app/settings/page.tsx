"use client";

import { LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useMeetings } from "@/hooks/use-meetings";
import { useTasks } from "@/hooks/use-tasks";
import { SidebarNav } from "@/components/sidebar-nav";
import { ProtectedRoute } from "@/components/protected-route";
import { NotificationSettings } from "@/components/notification-settings";
import { ThemeSettings } from "@/components/theme-settings";
import { AppSettings } from "@/components/app-settings";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { todayMeetings, upcomingMeetings } = useMeetings();
  const { pendingTasks, inProgressTasks } = useTasks();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <ProtectedRoute>
      <div className="flex w-full h-screen">
        {/* Sidebar */}
        <SidebarNav
          onCreateMeeting={() => {}}
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
                      <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">
                        Settings
                      </h1>
                      <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                        Configure preferences
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
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
                                <p className="text-sm font-medium">
                                  {user.name}
                                </p>
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
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Settings</h2>
                <p className="text-muted-foreground">
                  Configure your preferences and view system information
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
                      Meeting Reminders
                    </h3>
                    <NotificationSettings />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
                      Appearance
                    </h3>
                    <ThemeSettings />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
                      System Information
                    </h3>
                    <AppSettings />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
