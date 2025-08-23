import { create } from 'zustand'
import type { Meeting, MeetingFilters } from '@/types/meeting'

interface MeetingsStore {
  // State
  meetings: Meeting[]
  filteredMeetings: Meeting[]
  isLoading: boolean
  error: string | null
  filters: MeetingFilters

  // Actions
  setMeetings: (meetings: Meeting[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: MeetingFilters) => void
  addMeeting: (meeting: Meeting) => void
  updateMeeting: (id: string, updates: Partial<Meeting>) => void
  removeMeeting: (id: string) => void

  // Computed getters
  getTodayMeetings: () => Meeting[]
  getUpcomingMeetings: () => Meeting[]
  getCompletedMeetings: () => Meeting[]
  getOverdueMeetings: () => Meeting[]
}

const applyFilters = (meetings: Meeting[], filters: MeetingFilters): Meeting[] => {
  return meetings.filter((meeting) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch = 
        meeting.title.toLowerCase().includes(searchLower) ||
        meeting.description.toLowerCase().includes(searchLower) ||
        meeting.location?.toLowerCase().includes(searchLower) ||
        meeting.attendees?.some(attendee => attendee.toLowerCase().includes(searchLower))
      if (!matchesSearch) return false
    }

    // Status filter - convert completed boolean to status string for filtering
    if (filters.status !== 'all') {
      const meetingStatus = meeting.completed ? 'completed' : 'pending'
      if (meetingStatus !== filters.status) return false
    }

    // Type filter  
    if (filters.type !== 'all' && meeting.type !== filters.type) return false

    // Priority filter
    if (filters.priority !== 'all' && meeting.priority !== filters.priority) return false

    return true
  })
}

const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

export const useMeetingsStore = create<MeetingsStore>((set, get) => ({
  // Initial state
  meetings: [],
  filteredMeetings: [],
  isLoading: true,
  error: null,
  filters: {
    search: '',
    status: 'all',
    type: 'all',
    priority: 'all'
  },

  // Actions
  setMeetings: (meetings) => {
    const { filters } = get()
    const filteredMeetings = applyFilters(meetings, filters)
    set({ meetings, filteredMeetings, isLoading: false })
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setFilters: (filters) => {
    const { meetings } = get()
    const filteredMeetings = applyFilters(meetings, filters)
    set({ filters, filteredMeetings })
  },

  addMeeting: (meeting) => {
    const { meetings, filters } = get()
    const newMeetings = [...meetings, meeting]
    const filteredMeetings = applyFilters(newMeetings, filters)
    set({ meetings: newMeetings, filteredMeetings })
  },

  updateMeeting: (id, updates) => {
    const { meetings, filters } = get()
    const newMeetings = meetings.map(meeting => 
      meeting.id === id ? { ...meeting, ...updates } : meeting
    )
    const filteredMeetings = applyFilters(newMeetings, filters)
    set({ meetings: newMeetings, filteredMeetings })
  },

  removeMeeting: (id) => {
    const { meetings, filters } = get()
    const newMeetings = meetings.filter(meeting => meeting.id !== id)
    const filteredMeetings = applyFilters(newMeetings, filters)
    set({ meetings: newMeetings, filteredMeetings })
  },

  // Computed getters
  getTodayMeetings: () => {
    const { meetings } = get()
    const today = new Date()
    return meetings.filter(meeting => isSameDay(new Date(meeting.date), today))
  },

  getUpcomingMeetings: () => {
    const { meetings } = get()
    const now = new Date()
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.date)
      return meetingDate > now && !meeting.completed
    })
  },

  getCompletedMeetings: () => {
    const { meetings } = get()
    return meetings.filter(meeting => meeting.completed)
  },

  getOverdueMeetings: () => {
    const { meetings } = get()
    const now = new Date()
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.date)
      return meetingDate < now && !meeting.completed
    })
  }
}))