"use client"

import { Calendar, Clock, MapPin, Users, Edit, Trash2, CheckCircle2, XCircle, MoreHorizontal, AlertCircle, Eye } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DeleteConfirmDialog } from "@/components/ui/confirm-dialog"
import { useRouter } from "next/navigation"
import type { Meeting } from "@/types/meeting"
import { format } from "date-fns"

interface MeetingCardProps {
  meeting: Meeting
  onEdit: (meeting: Meeting) => void
  onDelete: (id: string) => void
  onToggleComplete: (id: string) => void
}

const priorityConfig = {
  low: { 
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    dot: "bg-emerald-500"
  },
  medium: { 
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500"
  },
  high: { 
    color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    dot: "bg-rose-500"
  },
}

const typeIcons = {
  meeting: Calendar,
  call: Clock,
  interview: Users,
  presentation: MoreHorizontal,
}

export function MeetingCard({ meeting, onEdit, onDelete, onToggleComplete }: MeetingCardProps) {
  const router = useRouter()
  const TypeIcon = typeIcons[meeting.type] || Calendar
  
  // Check if meeting is overdue
  const now = new Date()
  const meetingDateTime = new Date(`${meeting.date}T${meeting.time}`)
  const isOverdue = !meeting.completed && meetingDateTime < now
  
  const borderColorClass = meeting.completed 
    ? "border-l-muted" 
    : isOverdue
      ? "border-l-red-600"
      : meeting.priority === "high" 
        ? "border-l-rose-500" 
        : meeting.priority === "medium" 
          ? "border-l-amber-500" 
          : "border-l-emerald-500"
  
  const cardBackgroundClass = isOverdue && !meeting.completed
    ? "bg-red-50 dark:bg-red-950/20"
    : ""
  
  return (
    <Card className={`group transition-all duration-200 hover:shadow-lg border-l-4 ${borderColorClass} ${
      meeting.completed ? "opacity-60" : ""
    } ${cardBackgroundClass}`}>
      <CardHeader className="p-4 sm:p-5">
        <div className="space-y-3">
          {/* Header Row with Title and Actions */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${
                  meeting.completed 
                    ? "bg-muted" 
                    : "bg-primary/10"
                }`}>
                  <TypeIcon className={`h-4 w-4 ${
                    meeting.completed 
                      ? "text-muted-foreground" 
                      : "text-primary"
                  }`} />
                </div>
                <h3 className={`font-semibold text-base sm:text-lg tracking-tight ${
                  meeting.completed ? "line-through text-muted-foreground" : ""
                }`}>
                  {meeting.title}
                </h3>
              </div>
              
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2">
                {isOverdue && !meeting.completed && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                )}
                
                <Badge 
                  variant="outline" 
                  className={`text-xs border ${priorityConfig[meeting.priority].color}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${priorityConfig[meeting.priority].dot}`} />
                  {meeting.priority} priority
                </Badge>
                
                <Badge variant="secondary" className="text-xs capitalize">
                  {meeting.type}
                </Badge>
                
                {meeting.completed && (
                  <Badge variant="default" className="text-xs bg-emerald-500 hover:bg-emerald-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Horizontal Action Buttons */}
            <TooltipProvider>
              <div className="flex items-center gap-1 shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/20 transition-colors"
                      onClick={() => router.push(`/meetings/${meeting.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View details</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={() => onEdit(meeting)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit meeting</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`h-8 w-8 p-0 transition-colors ${
                        meeting.completed 
                          ? "hover:bg-amber-100 hover:text-amber-600 dark:hover:bg-amber-900/20" 
                          : "hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-900/20"
                      }`}
                      onClick={() => onToggleComplete(meeting.id)}
                    >
                      {meeting.completed ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{meeting.completed ? "Mark as pending" : "Mark as complete"}</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DeleteConfirmDialog
                      itemName={meeting.title}
                      itemType="meeting"
                      onConfirm={() => onDelete(meeting.id)}
                    >
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DeleteConfirmDialog>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete meeting</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
        <div className="space-y-3">
          {/* Description */}
          {meeting.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {meeting.description}
            </p>
          )}
          
          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date & Time Box */}
            <div className="flex items-center gap-3 p-2.5 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <div className="text-sm">
                  <p className="font-medium">{format(new Date(meeting.date), "MMM d, yyyy")}</p>
                  <p className="text-xs text-muted-foreground">{meeting.time} • {meeting.duration} min</p>
                </div>
              </div>
            </div>
            
            {/* Location Box */}
            <div className="flex items-center gap-3 p-2.5 bg-secondary/30 rounded-lg">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <div className="text-sm truncate">
                <p className="font-medium truncate">{meeting.location}</p>
                <p className="text-xs text-muted-foreground">Location</p>
              </div>
            </div>
          </div>
          
          {/* Attendees */}
          {meeting.attendees && meeting.attendees.length > 0 && (
            <div className="flex items-center gap-2 p-2.5 bg-secondary/30 rounded-lg">
              <Users className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {meeting.attendees.length} Attendee{meeting.attendees.length !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {meeting.attendees.length > 3 
                    ? `${meeting.attendees.slice(0, 3).join(", ")} +${meeting.attendees.length - 3} more`
                    : meeting.attendees.join(", ")
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
