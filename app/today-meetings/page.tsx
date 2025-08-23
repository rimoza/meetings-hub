"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { TodaysMeetings } from "@/components/todays-meetings"
import { useMeetings } from "@/hooks/use-meetings"
import { useTasks } from "@/hooks/use-tasks"
import type { Meeting } from "@/types/meeting"
import { toast } from "sonner"
import { SidebarNav } from "@/components/sidebar-nav"
import { MeetingForm } from "@/components/meeting-form"
import { ProtectedRoute } from "@/components/protected-route"
import { LogOut, User as UserIcon } from "lucide-react"

export default function TodayMeetingsPage() {
  const { user, logout } = useAuth()
  const {
    todayMeetings,
    upcomingMeetings,
    createMeeting,
    updateMeeting,
  } = useMeetings()
  const { pendingTasks, inProgressTasks } = useTasks()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | undefined>()

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting)
    setIsFormOpen(true)
  }

  const handleCreateMeeting = () => {
    setEditingMeeting(undefined)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (meetingData: Omit<Meeting, "id">) => {
    try {
      if (editingMeeting) {
        await updateMeeting(editingMeeting.id, meetingData)
        toast.success("Meeting updated successfully")
      } else {
        await createMeeting(meetingData)
        toast.success("Meeting created successfully")
      }
      setIsFormOpen(false)
      setEditingMeeting(undefined)
    } catch (error) {
      console.error("Error submitting meeting:", error)
    }
  }

  const handleLogout = () => {
    logout()
    window.location.href = "/login"
  }

  return (
    <ProtectedRoute>
      <div className="flex w-full h-screen">
        {/* Sidebar */}
        <SidebarNav 
          onCreateMeeting={handleCreateMeeting} 
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
                        Today&apos;s Meetings
                      </h1>
                      <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                        Today&apos;s scheduled meetings
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
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <UserIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                              <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                              </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
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
            <TodaysMeetings onEditMeeting={handleEdit} />
          </main>
        </div>

        {/* Meeting Form Modal */}
        <MeetingForm
          meeting={editingMeeting}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
        />
      </div>
    </ProtectedRoute>
  )
}