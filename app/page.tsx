"use client"

import { useState } from "react"
import { Plus, Calendar, CheckCircle, Clock, LogOut, User as UserIcon  } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { ViewToggle } from "@/components/view-toggle"
import { MeetingFilters } from "@/components/meeting-filters"
import { MeetingCard } from "@/components/meeting-card"
import { MeetingTable } from "@/components/meeting-table"
import { useMeetings } from "@/hooks/use-meetings"
import { useTasks } from "@/hooks/use-tasks"
import type { ViewMode, Meeting } from "@/types/meeting"
import { toast } from "sonner"
import { SidebarNav } from "@/components/sidebar-nav"
import { MeetingForm } from "@/components/meeting-form"
import { ProtectedRoute } from "@/components/protected-route"

export default function Dashboard() {
  const { user, logout } = useAuth()
  const {
    meetings,
    filteredMeetings,
    todayMeetings,
    upcomingMeetings,
    completedMeetings,
    nextMeeting,
    filters,
    setFilters,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    toggleMeetingCompletion,
  } = useMeetings()
  const { pendingTasks, inProgressTasks } = useTasks()

  const [viewMode, setViewMode] = useState<ViewMode>("table")
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
      // Close the form immediately after successful submission
      setIsFormOpen(false)
      setEditingMeeting(undefined)
    } catch (error) {
      // Error handling is already done in the hook functions
      console.error("Error submitting meeting:", error)
    }
  }

  const handleDelete = (meetingId: string) => {
    deleteMeeting(meetingId)
    toast.success("Meeting deleted successfully")
  }

  const handleToggleComplete = (meetingId: string) => {
    toggleMeetingCompletion(meetingId)
    toast.success("Meeting completion status toggled successfully")
  }

  const handleLogout = () => {
    logout()
    window.location.href = "/login"
  }

  const stats = [
    {
      title: "Total Meetings",
      value: meetings.length,
      icon: Calendar,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Completed",
      value: completedMeetings.length,
      icon: CheckCircle,
      gradient: "from-green-500 to-green-600",
    },
    {
      title: "Today's Meetings",
      value: todayMeetings.length,
      icon: Clock,
      gradient: "from-purple-500 to-purple-600",
    },
  ]

  const dashboardContent = (
    <>
      {/* Stats Cards - Mobile First */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="overflow-hidden">
            <CardHeader className="p-3 sm:p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-r ${stat.gradient}`}>
                  <stat.icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and View Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <MeetingFilters filters={filters} onFiltersChange={setFilters} />
        </div>
        <div className="flex justify-end lg:justify-start">
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
      </div>

      {/* Meetings Display */}
      {filteredMeetings.length === 0 ? (
        <Card className="text-center py-8 sm:py-12">
          <CardContent>
            <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">No meetings found</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 px-2">
              {filters.search || filters.status !== "all" || filters.priority !== "all" || filters.type !== "all"
                ? "Try adjusting your filters."
                : "Create your first meeting."}
            </p>
            <Button onClick={handleCreateMeeting} size="sm" className="sm:size-default">
              <Plus className="h-4 w-4 mr-2" />
              Create Meeting
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6">
          {filteredMeetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
              isNext={nextMeeting?.id === meeting.id}
            />
          ))}
        </div>
      ) : (
        <MeetingTable
          meetings={filteredMeetings}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleComplete={handleToggleComplete}
          nextMeetingId={nextMeeting?.id}
        />
      )}
    </>
  )

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
        {/* Header - Mobile First */}
        <header className="border-b bg-card">
          <div className="px-3 py-3 sm:px-4 sm:py-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden" />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">
                      Dashboard
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                      Manage your meetings
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

        <main className="flex-1 overflow-auto px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">{dashboardContent}</main>
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
