"use client"

import { useMeetings } from "@/hooks/use-meetings"
import { MeetingCard } from "@/components/meeting-card"
import { MeetingTable } from "@/components/meeting-table"
import { ViewToggle } from "@/components/view-toggle"
import { MeetingFilters } from "@/components/meeting-filters"
import { useState } from "react"
import type { Meeting, MeetingFilters as MeetingFiltersType } from "@/types/meeting"

interface UpcomingMeetingsProps {
  onEditMeeting: (meeting: Meeting) => void
}

export function UpcomingMeetings({ onEditMeeting }: Readonly<UpcomingMeetingsProps>) {
  const { meetings, nextMeeting, deleteMeeting, toggleMeetingCompletion } = useMeetings()
  const [viewMode, setViewMode] = useState<"card" | "table">("table")
  const [filters, setFilters] = useState<MeetingFiltersType>({
    search: "",
    type: "all",
    priority: "all",
    status: "all",
  })

  // Filter meetings for upcoming (after today)
  const today = new Date().toISOString().split("T")[0]

  const upcomingMeetings = meetings.filter((meeting) => {
    return meeting.date > today
  })

  // Apply additional filters
  const filteredMeetings = upcomingMeetings.filter((meeting) => {
    const matchesSearch =
      meeting.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      meeting.attendees.some((attendee) => attendee.toLowerCase().includes(filters.search.toLowerCase()))
    const matchesType = filters.type === "all" || meeting.type === filters.type
    const matchesPriority = filters.priority === "all" || meeting.priority === filters.priority
    const matchesStatus =
      filters.status === "all" ||
      (filters.status === "completed" && meeting.completed) ||
      (filters.status === "pending" && !meeting.completed)

    return matchesSearch && matchesType && matchesPriority && matchesStatus
  })

  // Sort by completion status first, then by date and time
  const sortedMeetings = filteredMeetings.sort((a, b) => {
    // First sort by completion status (pending meetings first, completed meetings last)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1; // false (pending) comes before true (completed)
    }
    
    // Within the same completion status, sort by date and time
    const dateTimeA = new Date(`${a.date}T${a.time}`);
    const dateTimeB = new Date(`${b.date}T${b.time}`);
    
    // Sort in ascending order (earliest meetings first)
    return dateTimeA.getTime() - dateTimeB.getTime();
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Upcoming Meetings</h1>
          <p className="text-muted-foreground">
            {sortedMeetings.length} upcoming meeting{sortedMeetings.length !== 1 ? "s" : ""}
          </p>
        </div>
        <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      <MeetingFilters filters={filters} onFiltersChange={setFilters} />

      {sortedMeetings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No upcoming meetings scheduled</p>
        </div>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 gap-4">
          {sortedMeetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onEdit={() => onEditMeeting(meeting)}
              onDelete={() => deleteMeeting(meeting.id)}
              onToggleComplete={() => toggleMeetingCompletion(meeting.id)}
              isNext={nextMeeting?.id === meeting.id}
            />
          ))}
        </div>
      ) : (
        <MeetingTable
          meetings={sortedMeetings}
          onEdit={onEditMeeting}
          onDelete={deleteMeeting}
          onToggleComplete={toggleMeetingCompletion}
          nextMeetingId={nextMeeting?.id}
        />
      )}
    </div>
  )
}
