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
}

export function MeetingCard({ meeting, onEdit, onDelete, onToggleComplete }: MeetingCardProps) {
  return (
    <Card className={`transition-all hover:shadow-md ${meeting.completed ? "opacity-75" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <h3 className={`font-semibold ${meeting.completed ? "line-through" : ""}`}>{meeting.title}</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
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
        <div className="flex flex-wrap gap-2">
          <Badge className={priorityColors[meeting.priority]}>{meeting.priority}</Badge>
          <Badge className={typeColors[meeting.type]}>{meeting.type}</Badge>
          {meeting.completed && <Badge variant="secondary">Completed</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>
            {meeting.attendees && meeting.attendees.length > 0 ? meeting.attendees.join(", ") : "No attendees"}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(meeting.date), "PPP")}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{meeting.time}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{meeting.location}</span>
        </div>
        {meeting.description && <p className="text-sm text-muted-foreground mt-2">{meeting.description}</p>}
      </CardContent>
    </Card>
  )
}
