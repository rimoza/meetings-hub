"use client"

import { useState } from "react"
import { 
  Calendar,
  MapPin,
  Users,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  Video,
  FileText,
  Link2,
  Copy,
  Share2,
  Bell
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { DeleteConfirmDialog } from "@/components/ui/confirm-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Meeting } from "@/types/meeting"
import { format } from "date-fns"
import { toast } from "sonner"

interface MeetingDetailsProps {
  meeting: Meeting
  onBack: () => void
  onEdit: (meeting: Meeting) => void
  onDelete: (id: string) => void
  onToggleComplete: (id: string) => void
}

const priorityConfig = {
  low: { 
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    dot: "bg-emerald-500",
    label: "Low Priority"
  },
  medium: { 
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    dot: "bg-amber-500",
    label: "Medium Priority"
  },
  high: { 
    color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    dot: "bg-rose-500",
    label: "High Priority"
  },
}

const typeConfig = {
  meeting: { icon: Calendar, label: "Meeting", color: "text-blue-600" },
  call: { icon: Phone, label: "Call", color: "text-green-600" },
  interview: { icon: Users, label: "Interview", color: "text-purple-600" },
  presentation: { icon: Video, label: "Presentation", color: "text-orange-600" },
}

export function MeetingDetails({ meeting, onBack, onEdit, onDelete, onToggleComplete }: MeetingDetailsProps) {
  const [copiedLink, setCopiedLink] = useState(false)
  
  // Check if meeting is overdue
  const now = new Date()
  const meetingDateTime = new Date(`${meeting.date}T${meeting.time}`)
  const isOverdue = !meeting.completed && meetingDateTime < now
  const isFuture = meetingDateTime > now
  
  const TypeIcon = typeConfig[meeting.type]?.icon || Calendar
  const typeInfo = typeConfig[meeting.type] || typeConfig.meeting
  
  // Calculate meeting end time
  const endTime = new Date(meetingDateTime.getTime() + meeting.duration * 60000)
  const formattedEndTime = format(endTime, "HH:mm")
  
  const handleCopyLink = () => {
    // Check if location is a URL
    if (meeting.location.startsWith('http')) {
      navigator.clipboard.writeText(meeting.location)
      setCopiedLink(true)
      toast.success("Link copied to clipboard")
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }
  
  const handleShare = () => {
    const shareText = `Meeting: ${meeting.title}\nDate: ${format(new Date(meeting.date), "MMMM d, yyyy")}\nTime: ${meeting.time}\nLocation: ${meeting.location}`
    
    if (navigator.share) {
      navigator.share({
        title: meeting.title,
        text: shareText,
      }).catch((err) => console.log('Error sharing:', err))
    } else {
      navigator.clipboard.writeText(shareText)
      toast.success("Meeting details copied to clipboard")
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share meeting details</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(meeting)}
        >
          <Edit className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Edit</span>
        </Button>
        
        <DeleteConfirmDialog
          itemName={meeting.title}
          itemType="meeting"
          onConfirm={() => {
            onDelete(meeting.id)
            onBack()
          }}
        >
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </DeleteConfirmDialog>
      </div>

      {/* Main content card */}
      <Card className={`${isOverdue ? "border-red-500" : ""}`}>
        <CardHeader className="pb-4">
          <div className="space-y-4">
            {/* Title and status */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className={`p-2 rounded-lg ${
                  meeting.completed ? "bg-muted" : "bg-primary/10"
                }`}>
                  <TypeIcon className={`h-5 w-5 ${
                    meeting.completed ? "text-muted-foreground" : typeInfo.color
                  }`} />
                </div>
                <div className="flex-1">
                  <CardTitle className={`text-2xl ${
                    meeting.completed ? "line-through text-muted-foreground" : ""
                  }`}>
                    {meeting.title}
                  </CardTitle>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {isOverdue && !meeting.completed && (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Overdue
                      </Badge>
                    )}
                    
                    <Badge 
                      variant="outline" 
                      className={`${priorityConfig[meeting.priority].color}`}
                    >
                      <span className={`w-2 h-2 rounded-full mr-1.5 ${priorityConfig[meeting.priority].dot}`} />
                      {priorityConfig[meeting.priority].label}
                    </Badge>
                    
                    <Badge variant="secondary" className="capitalize">
                      <TypeIcon className="h-3 w-3 mr-1" />
                      {typeInfo.label}
                    </Badge>
                    
                    {meeting.completed && (
                      <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Complete/Incomplete button */}
              <Button
                variant={meeting.completed ? "outline" : "default"}
                onClick={() => onToggleComplete(meeting.id)}
                className={meeting.completed ? "" : "bg-emerald-600 hover:bg-emerald-700"}
              >
                {meeting.completed ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Mark as Pending
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <Separator />
        
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8">
            {/* Left column */}
            <div className="space-y-6">
              {/* Date & Time */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Date & Time
                </h3>
                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">
                      {format(new Date(meeting.date), "EEEE, MMMM d, yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {meeting.time} - {formattedEndTime} ({meeting.duration} minutes)
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Location */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Location
                </h3>
                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-semibold">{meeting.location}</p>
                    {meeting.location.startsWith('http') && (
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0"
                          onClick={() => window.open(meeting.location, '_blank')}
                        >
                          <Link2 className="h-3 w-3 mr-1" />
                          Open link
                        </Button>
                        <span className="text-muted-foreground">•</span>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0"
                          onClick={handleCopyLink}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          {copiedLink ? "Copied!" : "Copy link"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Description */}
              {meeting.description && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Description
                  </h3>
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{meeting.description}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right column */}
            <div className="space-y-6">
              {/* Attendees */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Attendees ({meeting.attendees?.length || 0})
                </h3>
                {meeting.attendees && meeting.attendees.length > 0 ? (
                  <div className="space-y-2">
                    {meeting.attendees.map((attendee, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg"
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">
                            {attendee.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{attendee}</p>
                        </div>
                        {attendee.includes('@') && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => window.location.href = `mailto:${attendee}`}
                                >
                                  <Mail className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Send email</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-secondary/30 rounded-lg text-center">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No attendees added</p>
                  </div>
                )}
              </div>
              
              {/* Meeting metadata */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Meeting Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm font-medium">
                      {format(new Date(meeting.createdAt), "MMM d, yyyy 'at' HH:mm")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Last updated</span>
                    <span className="text-sm font-medium">
                      {format(new Date(meeting.updatedAt), "MMM d, yyyy 'at' HH:mm")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Meeting ID</span>
                    <span className="text-xs font-mono">{meeting.id}</span>
                  </div>
                </div>
              </div>
              
              {/* Quick actions */}
              {isFuture && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Quick Actions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      <Bell className="h-4 w-4 mr-2" />
                      Set Reminder
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Add Notes
                    </Button>
                    {meeting.location.startsWith('http') && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(meeting.location, '_blank')}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Join Meeting
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}