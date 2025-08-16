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
