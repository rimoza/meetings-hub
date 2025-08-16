"use client"

import { useState, useMemo } from "react"
import type { Meeting, MeetingFilters } from "@/types/meeting"

const initialMeetings: Meeting[] = [
  {
    id: "1",
    title: "Quarterly Business Review",
    description: "Quarterly business review meeting with stakeholders",
    date: "2024-12-20",
    time: "09:00",
    duration: 120,
    location: "WADDANI Office",
    attendees: ["suldaan.yuusuf@example.com"],
    completed: false,
    priority: "high",
    type: "meeting",
    createdAt: new Date("2024-12-15"),
    updatedAt: new Date("2024-12-15"),
  },
  {
    id: "2",
    title: "Project Planning Session",
    description: "Project discussion and planning with team leads",
    date: "2024-12-21",
    time: "14:30",
    duration: 90,
    location: "Gulf Star Hotel",
    attendees: ["sheikh.almis@example.com", "team@example.com"],
    completed: true,
    priority: "medium",
    type: "meeting",
    createdAt: new Date("2024-12-14"),
    updatedAt: new Date("2024-12-19"),
  },
  {
    id: "3",
    title: "Senior Developer Interview",
    description: "Technical interview for senior developer position",
    date: new Date().toISOString().split("T")[0],
    time: "11:00",
    duration: 60,
    location: "Virtual Meeting",
    attendees: ["amina.hassan@example.com", "hr@example.com"],
    completed: false,
    priority: "high",
    type: "interview",
    createdAt: new Date("2024-12-18"),
    updatedAt: new Date("2024-12-18"),
  },
  {
    id: "4",
    title: "Client Consultation",
    description: "Client consultation call for new project requirements",
    date: "2024-12-22",
    time: "16:00",
    duration: 45,
    location: "City Center",
    attendees: ["mohamed.ali@example.com"],
    completed: false,
    priority: "medium",
    type: "call",
    createdAt: new Date("2024-12-16"),
    updatedAt: new Date("2024-12-16"),
  },
  {
    id: "5",
    title: "Team Standup",
    description: "Team standup and sprint planning session",
    date: "2024-12-23",
    time: "10:30",
    duration: 30,
    location: "Conference Room A",
    attendees: ["fadumo.omar@example.com", "dev-team@example.com"],
    completed: false,
    priority: "low",
    type: "meeting",
    createdAt: new Date("2024-12-17"),
    updatedAt: new Date("2024-12-17"),
  },
]

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings)
  const [filters, setFilters] = useState<MeetingFilters>({
    search: "",
    status: "all",
    priority: "all",
    type: "all",
  })

  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
      const matchesSearch =
        meeting.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        meeting.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        meeting.location.toLowerCase().includes(filters.search.toLowerCase()) ||
        meeting.attendees.some((attendee) => attendee.toLowerCase().includes(filters.search.toLowerCase()))

      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "completed" && meeting.completed) ||
        (filters.status === "pending" && !meeting.completed)

      const matchesPriority = filters.priority === "all" || meeting.priority === filters.priority

      const matchesType = filters.type === "all" || meeting.type === filters.type

      return matchesSearch && matchesStatus && matchesPriority && matchesType
    })
  }, [meetings, filters])

  const todayMeetings = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]
    return meetings.filter((meeting) => meeting.date === today)
  }, [meetings])

  const upcomingMeetings = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]
    return meetings.filter((meeting) => meeting.date > today)
  }, [meetings])

  const completedMeetings = useMemo(() => {
    return meetings.filter((meeting) => meeting.completed)
  }, [meetings])

  const createMeeting = (meetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt">) => {
    const newMeeting: Meeting = {
      ...meetingData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setMeetings((prev) => [...prev, newMeeting])
  }

  const updateMeeting = (id: string, updates: Partial<Omit<Meeting, "id">>) => {
    setMeetings((prev) =>
      prev.map((meeting) => (meeting.id === id ? { ...meeting, ...updates, updatedAt: new Date() } : meeting)),
    )
  }

  const deleteMeeting = (id: string) => {
    setMeetings((prev) => prev.filter((meeting) => meeting.id !== id))
  }

  const toggleMeetingCompletion = (id: string) => {
    setMeetings((prev) =>
      prev.map((meeting) =>
        meeting.id === id ? { ...meeting, completed: !meeting.completed, updatedAt: new Date() } : meeting,
      ),
    )
  }

  return {
    meetings,
    filteredMeetings,
    todayMeetings,
    upcomingMeetings,
    completedMeetings,
    filters,
    setFilters,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    toggleMeetingCompletion,
  }
}
