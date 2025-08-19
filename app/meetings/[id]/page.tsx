"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, LogOut, User as UserIcon } from "lucide-react"
import { useMeetings } from "@/hooks/use-meetings"
import { useAuth } from "@/contexts/auth-context"
import { MeetingDetails } from "@/components/meeting-details"
import { MeetingForm } from "@/components/meeting-form"
import { ProtectedRoute } from "@/components/protected-route"
import { SidebarNav } from "@/components/sidebar-nav"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Meeting, MeetingNote } from "@/types/meeting"
import { toast } from "sonner"

interface MeetingDetailsPageProps {
  params: Promise<{
    id: string
  }>
}

export default function MeetingDetailsPage({ params }: Readonly<MeetingDetailsPageProps>) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user, logout } = useAuth()
  const { 
    meetings, 
    todayMeetings,
    upcomingMeetings,
    createMeeting,
    updateMeeting, 
    deleteMeeting, 
    toggleMeetingCompletion 
  } = useMeetings()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | undefined>()

  // Find the meeting by ID
  useEffect(() => {
    if (meetings.length > 0) {
      const foundMeeting = meetings.find(m => m.id === resolvedParams.id)
      if (foundMeeting) {
        setMeeting(foundMeeting)
        setIsLoading(false)
      } else {
        // Meeting not found, redirect to home
        toast.error("Meeting not found")
        router.push("/")
      }
    }
  }, [meetings, resolvedParams.id, router])

  // Update meeting state when meetings array changes (real-time updates)
  useEffect(() => {
    if (meeting && meetings.length > 0) {
      const updatedMeeting = meetings.find(m => m.id === meeting.id)
      if (updatedMeeting && JSON.stringify(updatedMeeting) !== JSON.stringify(meeting)) {
        setMeeting(updatedMeeting)
      }
    }
  }, [meetings, meeting?.id, meeting])

  const handleBack = () => {
    router.push("/")
  }

  const handleCreateMeeting = () => {
    // Navigate to main dashboard and trigger form
    router.push("/?create=true")
  }

  const handleNavigate = (page: string) => {
    router.push(page === "dashboard" ? "/" : `/?page=${page}`)
  }

  const handleLogout = () => {
    logout()
    window.location.href = "/login"
  }

  const handleEdit = (meeting: Meeting) => {
    console.log("Editing meeting:", meeting)
    setEditingMeeting(meeting)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (meetingData: Omit<Meeting, "id">) => {
    try {
      if (editingMeeting) {
        // For updates, exclude createdAt and updatedAt as they're handled by Firebase
        const { createdAt, updatedAt, ...updateData } = meetingData
        console.log("Submitting meeting update:", createdAt, updatedAt, updateData)
        await updateMeeting(editingMeeting.id, updateData)
        toast.success("Meeting updated successfully")
      } else {
        // Creating a new meeting
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

  const handleDelete = async (id: string) => {
    try {
      await deleteMeeting(id)
      toast.success("Meeting deleted successfully")
      router.push("/")
    } catch (error) {
      console.error("Error deleting meeting:", error)
      toast.error("Failed to delete meeting")
    }
  }

  const handleToggleComplete = (meetingId: string) => {
    toggleMeetingCompletion(meetingId)
    toast.success("Meeting completion status toggled successfully")
  }

  const handleEditNotes = async (meetingId: string, notes: string) => {
    try {
      await updateMeeting(meetingId, { notes })
      // The meeting state will be updated automatically through the useEffect that watches meetings array
    } catch (error) {
      console.error("Error updating notes:", error)
      toast.error("Failed to update meeting notes")
    }
  }

  const handleAddNote = async (meetingId: string, note: MeetingNote) => {
    try {
      const currentMeeting = meetings.find(m => m.id === meetingId)
      if (!currentMeeting) {
        throw new Error("Meeting not found")
      }
      
      const existingNotes = currentMeeting.meetingNotes || []
      const updatedNotes = [...existingNotes, note]
      
      await updateMeeting(meetingId, { meetingNotes: updatedNotes })
      // The meeting state will be updated automatically through the useEffect that watches meetings array
    } catch (error) {
      console.error("Error adding note:", error)
      toast.error("Failed to add meeting note")
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading meeting details...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // Show not found state
  if (!meeting) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Meeting Not Found</h1>
            <p className="text-muted-foreground mb-4">The meeting you&apos;re looking for doesn&apos;t exist.</p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex w-full h-screen">
        {/* Sidebar */}
        <SidebarNav 
          onCreateMeeting={handleCreateMeeting} 
          onNavigate={handleNavigate} 
          activePage="details"
          todayCount={todayMeetings.length}
          upcomingCount={upcomingMeetings.length}
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
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBack}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                      </Button>
                      <div className="border-l h-6 border-muted-foreground/20" />
                      <div>
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">
                          {meeting?.title || "Meeting Details"}
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                          View and manage meeting details
                        </p>
                      </div>
                    </div>
                    
                    {/* User Menu */}
                    <div className="flex items-center gap-2">
                      <ThemeToggle />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="relative h-9 w-9 rounded-full bg-primary/10"
                          >
                            <UserIcon className="h-4 w-4" />
                            <span className="sr-only">Toggle user menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                          <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {user?.name || user?.email}
                              </p>
                              <p className="text-xs leading-none text-muted-foreground">
                                {user?.email}
                              </p>
                            </div>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
            <MeetingDetails
              meeting={meeting}
              onBack={handleBack}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
              onEditNotes={handleEditNotes}
              onAddNote={handleAddNote}
            />
          </main>
        </div>

        {/* Meeting Form Modal */}
        <MeetingForm
          meeting={editingMeeting}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false)
            setEditingMeeting(undefined)
          }}
          onSubmit={handleFormSubmit}
        />
      </div>
    </ProtectedRoute>
  )
}