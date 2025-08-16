"use client"

import { useState } from "react"
import { Plus, Calendar, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { ViewToggle } from "@/components/view-toggle"
import { MeetingFilters } from "@/components/meeting-filters"
import { MeetingCard } from "@/components/meeting-card"
import { MeetingTable } from "@/components/meeting-table"
import { TodaysMeetings } from "@/components/todays-meetings"
import { UpcomingMeetings } from "@/components/upcoming-meetings"
import { useMeetings } from "@/hooks/use-meetings"
import type { ViewMode, Meeting } from "@/types/meeting"
import { toast } from "sonner"
import { SidebarNav } from "@/components/sidebar-nav"
import { MeetingForm } from "@/components/meeting-form"

export default function Dashboard() {
  const {
    meetings,
    filteredMeetings,
    todayMeetings,
    completedMeetings,
    filters,
    setFilters,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    toggleMeetingCompletion,
  } = useMeetings()

  const [viewMode, setViewMode] = useState<ViewMode>("card")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | undefined>()
  const [currentPage, setCurrentPage] = useState("dashboard")

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting)
    setIsFormOpen(true)
  }

  const handleCreateMeeting = () => {
    setEditingMeeting(undefined)
    setIsFormOpen(true)
  }

  const handleFormSubmit = (meetingData: Omit<Meeting, "id">) => {
    if (editingMeeting) {
      updateMeeting(editingMeeting.id, meetingData)
      toast.success("Meeting updated successfully")
    } else {
      createMeeting(meetingData)
      toast.success("Meeting created successfully")
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

  const handleNavigate = (page: string) => {
    setCurrentPage(page)
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

  const renderPageContent = () => {
    switch (currentPage) {
      case "today":
        return <TodaysMeetings onEditMeeting={handleEdit} />
      case "upcoming":
        return <UpcomingMeetings onEditMeeting={handleEdit} />
      case "settings":
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p className="text-muted-foreground">Settings page coming soon...</p>
          </div>
        )
      default:
        return (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat) => (
                <Card key={stat.title} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.gradient}`}>
                        <stat.icon className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters and View Toggle */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex-1 w-full">
                <MeetingFilters filters={filters} onFiltersChange={setFilters} />
              </div>
              <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>

            {/* Meetings Display */}
            {filteredMeetings.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No meetings found</h3>
                  <p className="text-muted-foreground mb-4">
                    {filters.search || filters.status !== "all" || filters.priority !== "all" || filters.type !== "all"
                      ? "Try adjusting your filters to see more meetings."
                      : "Get started by creating your first meeting."}
                  </p>
                  <Button onClick={handleCreateMeeting}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Meeting
                  </Button>
                </CardContent>
              </Card>
            ) : viewMode === "card" ? (
              <div className="grid grid-cols-1 gap-6">
                {filteredMeetings.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleComplete={handleToggleComplete}
                  />
                ))}
              </div>
            ) : (
              <MeetingTable
                meetings={filteredMeetings}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
              />
            )}
          </>
        )
    }
  }

  return (
    <div className="flex w-full h-screen">
      {/* Sidebar */}
      <SidebarNav onCreateMeeting={handleCreateMeeting} onNavigate={handleNavigate} activePage={currentPage} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {currentPage === "dashboard" && "Dashboard"}
                  {currentPage === "today" && "Today's Meetings"}
                  {currentPage === "upcoming" && "Upcoming Meetings"}
                  {currentPage === "settings" && "Settings"}
                </h1>
                <p className="text-muted-foreground">
                  {currentPage === "dashboard" && "Manage your meetings efficiently"}
                  {currentPage === "today" && "Focus on today's scheduled meetings"}
                  {currentPage === "upcoming" && "Plan ahead with upcoming meetings"}
                  {currentPage === "settings" && "Configure your preferences"}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button onClick={handleCreateMeeting}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Meeting
                </Button>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto px-6 py-8">{renderPageContent()}</main>
      </div>

      {/* Meeting Form Modal */}
      <MeetingForm
        meeting={editingMeeting}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
