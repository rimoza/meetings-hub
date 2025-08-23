export interface MeetingNote {
  id: string
  content: string
  timestamp: Date
  author?: string // Optional field for who added the note
  type: "regular" | "follow-up" // Type of note to determine if task should be created
}

export interface Meeting {
  id: string
  title: string
  description: string
  date: string // Changed from Date to string for easier form handling
  time: string
  duration: number // Added duration field
  location: string
  attendees: string[] // Changed from single attendee to array
  completed: boolean // Changed from isCompleted to completed
  priority: "low" | "medium" | "high"
  type: "meeting" | "call" | "interview" | "presentation" // Updated types
  notes?: string // Legacy single note field - kept for backward compatibility
  meetingNotes?: MeetingNote[] // New field for multiple timestamped notes
  createdAt: Date
  updatedAt: Date
}

export interface MeetingFilters {
  search: string
  status: "all" | "completed" | "pending"
  priority: "all" | "low" | "medium" | "high"
  type: "all" | "meeting" | "call" | "interview" | "presentation"
}

export type ViewMode = "table" | "card"

export type MeetingType = "meeting" | "call" | "interview" | "presentation"
export type Priority = "low" | "medium" | "high"
