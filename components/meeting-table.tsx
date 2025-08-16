"use client"

import { MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Meeting } from "@/types/meeting"
import { format } from "date-fns"

interface MeetingTableProps {
  meetings: Meeting[]
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
  presentation: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
}

export function MeetingTable({ meetings, onEdit, onDelete, onToggleComplete }: MeetingTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Attendees</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meetings.map((meeting) => (
            <TableRow key={meeting.id} className={meeting.completed ? "opacity-75" : ""}>
              <TableCell className="font-medium">
                <span className={meeting.completed ? "line-through" : ""}>{meeting.title}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {meeting.attendees && meeting.attendees.length > 0 ? meeting.attendees.join(", ") : "No attendees"}
                </span>
              </TableCell>
              <TableCell>{format(new Date(meeting.date), "MMM dd, yyyy")}</TableCell>
              <TableCell>{meeting.time}</TableCell>
              <TableCell>{meeting.location}</TableCell>
              <TableCell>
                <Badge className={priorityColors[meeting.priority]}>{meeting.priority}</Badge>
              </TableCell>
              <TableCell>
                <Badge className={typeColors[meeting.type]}>{meeting.type}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={meeting.completed ? "secondary" : "outline"}>
                  {meeting.completed ? "Completed" : "Pending"}
                </Badge>
              </TableCell>
              <TableCell>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
