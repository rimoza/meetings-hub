"use client"

import { Calendar, Clock, MapPin, MoreHorizontal, User } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Meeting } from "@/types/meeting"
import { format } from "date-fns"

interface MeetingCardProps {
  meeting: Meeting
  onEdit: (meeting: Meeting) => void
  onDelete: (id: string) => void
  onToggleComplete: (id: string) => void
}

const priorityColors = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const typeColors = {
  meeting: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  call: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  conference: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  interview: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  presentation: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
}

export function MeetingCard({ meeting, onEdit, onDelete, onToggleComplete }: MeetingCardProps) {
  return (
    <Card className={`transition-all hover:shadow-md ${meeting.completed ? "opacity-75" : ""}`}>
      <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start space-x-2 flex-1 min-w-0">
            <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <h3 className={`font-semibold text-sm sm:text-base ${meeting.completed ? "line-through" : ""} leading-tight`}>
              {meeting.title}
            </h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(meeting)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleComplete(meeting.id)}>
                {meeting.completed ? "Mark Pending" : "Mark Complete"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(meeting.id)} className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
          <Badge className={`text-xs ${priorityColors[meeting.priority]}`}>{meeting.priority}</Badge>
          <Badge className={`text-xs ${typeColors[meeting.type]}`}>{meeting.type}</Badge>
          {meeting.completed && <Badge variant="secondary" className="text-xs">Done</Badge>}
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0 space-y-2 sm:space-y-3">
        {/* Date and Time - Most Important Info */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="font-medium">{format(new Date(meeting.date), "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span>{meeting.time}</span>
          </div>
        </div>
        
        {/* Location */}
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="truncate">{meeting.location}</span>
        </div>
        
        {/* Attendees - Collapsible on mobile */}
        {meeting.attendees && meeting.attendees.length > 0 && (
          <div className="flex items-start space-x-2 text-xs sm:text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 mt-0.5" />
            <span className="line-clamp-2">
              {meeting.attendees.length > 2 
                ? `${meeting.attendees.slice(0, 2).join(", ")} +${meeting.attendees.length - 2} more`
                : meeting.attendees.join(", ")
              }
            </span>
          </div>
        )}
        
        {/* Description - Truncated on mobile */}
        {meeting.description && (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-none">
            {meeting.description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
