"use client"

import { Calendar, Clock, MapPin, Users, Edit, Trash2, CheckCircle2, XCircle, MoreHorizontal, AlertCircle, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DeleteConfirmDialog } from "@/components/ui/confirm-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import type { Meeting } from "@/types/meeting"
import { format } from "date-fns"
import Link from "next/link"

interface MeetingTableProps {
  meetings: Meeting[]
  onEdit: (meeting: Meeting) => void
  onDelete: (id: string) => void
  onToggleComplete: (id: string) => void
  nextMeetingId?: string
}

const priorityConfig = {
  low: { 
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    dot: "bg-emerald-500"
  },
  medium: { 
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    dot: "bg-amber-500"
  },
  high: { 
    color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    dot: "bg-rose-500"
  },
}

const typeIcons = {
  meeting: Calendar,
  call: Clock,
  interview: Users,
  presentation: MoreHorizontal,
}

export function MeetingTable({ meetings, onEdit, onDelete, onToggleComplete, nextMeetingId }: MeetingTableProps) {
  const router = useRouter()
  
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Meeting
              </div>
            </TableHead>
            <TableHead className="font-semibold">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Date & Time
              </div>
            </TableHead>
            <TableHead className="font-semibold">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Location
              </div>
            </TableHead>
            <TableHead className="font-semibold">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Attendees
              </div>
            </TableHead>
            <TableHead className="font-semibold text-center">Priority</TableHead>
            <TableHead className="font-semibold text-center">Status</TableHead>
            <TableHead className="font-semibold text-center w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meetings.map((meeting, index) => {
            const TypeIcon = typeIcons[meeting.type] || Calendar
            const isLast = index === meetings.length - 1
            const isNext = nextMeetingId === meeting.id
            
            // Check if meeting is overdue
            const now = new Date()
            const meetingDateTime = new Date(`${meeting.date}T${meeting.time}`)
            const isOverdue = !meeting.completed && meetingDateTime < now
            
            return (
              <TableRow 
                key={meeting.id} 
                className={`group hover:bg-muted/30 transition-colors ${
                  meeting.completed ? "opacity-60" : ""
                } ${!isLast ? "border-b" : ""} ${
                  isNext && !meeting.completed 
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800" 
                    : isOverdue 
                      ? "bg-red-50 dark:bg-red-950/20" 
                      : ""
                }`}
              >
                {/* Meeting Title & Type */}
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg shrink-0 ${
                      meeting.completed ? "bg-muted" : "bg-primary/10"
                    }`}>
                      <TypeIcon className={`h-4 w-4 ${
                        meeting.completed ? "text-muted-foreground" : "text-primary"
                      }`} />
                    </div>
                    <div className="min-w-0">
                      <p className={`font-semibold truncate ${
                        meeting.completed ? "line-through text-muted-foreground" : ""
                      }`}>
                        <Link href={`/meetings/${meeting.id}`} className="hover:underline">
                        {meeting.title}
                        </Link>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {isNext && !meeting.completed && (
                          <Badge className="text-xs bg-blue-600 hover:bg-blue-700 text-white border-blue-600 animate-pulse">
                            <Clock className="h-3 w-3 mr-1" />
                            Next
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs capitalize">
                          {meeting.type}
                        </Badge>
                        {meeting.description && (
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {meeting.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                
                {/* Date & Time */}
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-sm">
                      {format(new Date(meeting.date), "MMM d, yyyy")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {meeting.time} • {meeting.duration} min
                    </span>
                  </div>
                </TableCell>
                
                {/* Location */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm truncate max-w-[150px]">
                      {meeting.location}
                    </span>
                  </div>
                </TableCell>
                
                {/* Attendees */}
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 cursor-help">
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {meeting.attendees?.length || 0}
                          </Badge>
                          {meeting.attendees && meeting.attendees.length > 0 && (
                            <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                              {meeting.attendees[0]}
                              {meeting.attendees.length > 1 && ` +${meeting.attendees.length - 1}`}
                            </span>
                          )}
                        </div>
                      </TooltipTrigger>
                      {meeting.attendees && meeting.attendees.length > 0 && (
                        <TooltipContent>
                          <div className="text-xs">
                            {meeting.attendees.join(", ")}
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                
                {/* Priority */}
                <TableCell className="text-center">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${priorityConfig[meeting.priority].color}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${priorityConfig[meeting.priority].dot}`} />
                    {meeting.priority}
                  </Badge>
                </TableCell>
                
                {/* Status */}
                <TableCell className="text-center">
                  {meeting.completed ? (
                    <Badge variant="default" className="text-xs bg-emerald-500 hover:bg-emerald-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Done
                    </Badge>
                  ) : isOverdue ? (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Overdue
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </TableCell>
                
                {/* Actions */}
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    {/* Actions Dropdown Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-muted"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => router.push(`/meetings/${meeting.id}`)}
                          className="cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem
                          onClick={() => onEdit(meeting)}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Meeting
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem
                          onClick={() => onToggleComplete(meeting.id)}
                          className="cursor-pointer"
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
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DeleteConfirmDialog
                          itemName={meeting.title}
                          itemType="meeting"
                          onConfirm={() => onDelete(meeting.id)}
                        >
                          <DropdownMenuItem
                            className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Meeting
                          </DropdownMenuItem>
                        </DeleteConfirmDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      
      {meetings.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No meetings found</p>
        </div>
      )}
    </div>
  )
}
