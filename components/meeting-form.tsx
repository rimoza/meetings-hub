"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, Plus } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarIntegration, QuickCalendarButton } from "@/components/calendar-integration"
import type { Meeting, MeetingType, Priority } from "@/types/meeting"

interface MeetingFormProps {
  meeting?: Meeting
  isOpen: boolean
  onClose: () => void
  onSubmit: (meeting: Omit<Meeting, "id">) => Promise<void>
}

interface FormData {
  title: string
  description: string
  date: Date
  time: string
  duration: number
  type: MeetingType
  priority: Priority
  attendees: string[]
  location: string
  addToCalendar: boolean
}

export function MeetingForm({ meeting, isOpen, onClose, onSubmit }: MeetingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdMeeting, setCreatedMeeting] = useState<Meeting | null>(null)
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    date: new Date(),
    time: "",
    duration: 60,
    type: "meeting",
    priority: "medium",
    attendees: [],
    location: "",
    addToCalendar: false,
  })

  const [attendeeInput, setAttendeeInput] = useState("")

  useEffect(() => {
    if (meeting) {
      setFormData({
        title: meeting.title,
        description: meeting.description,
        date: new Date(meeting.date),
        time: meeting.time,
        duration: meeting.duration,
        type: meeting.type as MeetingType,
        priority: meeting.priority as Priority,
        attendees: meeting.attendees,
        location: meeting.location,
        addToCalendar: false,
      })
    } else {
      // Reset form for new meeting
      setFormData({
        title: "",
        description: "",
        date: new Date(),
        time: "",
        duration: 60,
        type: "meeting",
        priority: "medium",
        attendees: [],
        location: "",
        addToCalendar: false,
      })
    }
    // Reset created meeting when form opens/closes
    setCreatedMeeting(null)
  }, [meeting, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const now = new Date()
      const meetingData = {
        ...formData,
        date: formData.date.toISOString().split("T")[0],
        completed: false,
        createdAt: now,
        updatedAt: now,
      }
      
      await onSubmit(meetingData)
      
      // If user wants to add to calendar and this is a new meeting, store the meeting data
      if (formData.addToCalendar && !meeting) {
        setCreatedMeeting({
          ...meetingData,
          id: `temp-${Date.now()}`, // Temporary ID for calendar integration
        } as Meeting)
      } else {
        // Close form immediately if not adding to calendar or if editing
        onClose()
      }
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addAttendee = () => {
    if (attendeeInput.trim() && !formData.attendees.includes(attendeeInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        attendees: [...prev.attendees, attendeeInput.trim()],
      }))
      setAttendeeInput("")
    }
  }

  const removeAttendee = (attendee: string) => {
    setFormData((prev) => ({
      ...prev,
      attendees: prev.attendees.filter((a) => a !== attendee),
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[500px] sm:max-w-[600px] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{meeting ? "Edit Meeting" : "Create Meeting"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {/* Title */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Meeting title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Meeting description"
                rows={3}
              />
            </div>

            {/* Date and Time - Stack on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label className="text-sm">Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-9 sm:h-10 text-sm",
                        !formData.date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "MMM d, yyyy") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => date && setFormData((prev) => ({ ...prev, date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="time" className="text-sm">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                  className="h-9 sm:h-10 text-sm"
                  required
                />
              </div>
            </div>

            {/* Duration - Full width on mobile */}
            <div>
              <Label htmlFor="duration" className="text-sm">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                step="15"
                value={formData.duration}
                onChange={(e) => setFormData((prev) => ({ ...prev, duration: Number.parseInt(e.target.value) }))}
                className="h-9 sm:h-10 text-sm"
                placeholder="60"
              />
            </div>

            {/* Type and Priority - Stack on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label className="text-sm">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: MeetingType) => setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="h-9 sm:h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: Priority) => setFormData((prev) => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger className="h-9 sm:h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Meeting location or video link"
              />
            </div>

            {/* Attendees - Mobile optimized */}
            <div>
              <Label className="text-sm">Attendees</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={attendeeInput}
                  onChange={(e) => setAttendeeInput(e.target.value)}
                  placeholder="Add attendee"
                  className="h-9 sm:h-10 text-sm"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAttendee())}
                />
                <Button type="button" onClick={addAttendee} variant="outline" size="sm" className="h-9 px-3 sm:h-10 sm:px-4">
                  Add
                </Button>
              </div>
              {formData.attendees.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {formData.attendees.map((attendee) => (
                    <div
                      key={attendee}
                      className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs sm:text-sm"
                    >
                      <span className="truncate max-w-[120px]">{attendee}</span>
                      <button
                        type="button"
                        onClick={() => removeAttendee(attendee)}
                        className="ml-1 text-muted-foreground hover:text-foreground text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calendar Integration Option - Only show for new meetings */}
            {!meeting && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Checkbox
                  id="addToCalendar"
                  checked={formData.addToCalendar}
                  onCheckedChange={(checked) => 
                    setFormData((prev) => ({ ...prev, addToCalendar: checked as boolean }))
                  }
                />
                <div className="flex-1">
                  <Label 
                    htmlFor="addToCalendar" 
                    className="text-sm font-medium cursor-pointer flex items-center"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2 text-blue-600" />
                    Add to calendar after creation
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Show calendar options to add this meeting to your calendar app
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            {createdMeeting ? (
              // Show calendar options after meeting creation
              <div className="w-full space-y-3">
                <div className="text-center">
                  <h3 className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                    Meeting created successfully! 🎉
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Choose how to add it to your calendar:
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <QuickCalendarButton meeting={createdMeeting} provider="download" size="sm" />
                  <QuickCalendarButton meeting={createdMeeting} provider="google" size="sm" />
                  <QuickCalendarButton meeting={createdMeeting} provider="outlook" size="sm" />
                  <QuickCalendarButton meeting={createdMeeting} provider="yahoo" size="sm" />
                </div>
                <div className="flex justify-center">
                  <Button variant="outline" onClick={onClose} size="sm">
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              // Show normal form buttons
              <>
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto order-2 sm:order-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto order-1 sm:order-2">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {meeting ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    `${meeting ? "Update" : "Create"} Meeting`
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
