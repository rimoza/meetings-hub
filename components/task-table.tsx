"use client"

import { MoreHorizontal, Calendar, User, CheckCircle, Clock, XCircle, PlayCircle, Flag, ArrowUpDown, Eye } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import type { Task } from "@/types/task"

interface TaskTableProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onToggleComplete: (taskId: string) => void
  onChangeStatus?: (taskId: string, status: Task["status"]) => void
}

type SortKey = keyof Task | "none"
type SortOrder = "asc" | "desc"

export function TaskTable({ tasks, onEdit, onDelete, onToggleComplete, onChangeStatus }: TaskTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("none")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in_progress":
        return <PlayCircle className="h-4 w-4 text-blue-500" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadgeVariant = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "default" as const
      case "in_progress":
        return "secondary" as const
      case "cancelled":
        return "destructive" as const
      default:
        return "outline" as const
    }
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-orange-500"
      case "low":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortOrder("asc")
    }
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortKey === "none") return 0

    let aValue = a[sortKey as keyof Task]
    let bValue = b[sortKey as keyof Task]

    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase()
    }
    if (typeof bValue === "string") {
      bValue = bValue.toLowerCase()
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
    return 0
  })

  const handleStatusChange = (taskId: string, newStatus: Task["status"]) => {
    if (onChangeStatus) {
      onChangeStatus(taskId, newStatus)
    }
  }

  const SortButton = ({ sortKey: key, children }: { sortKey: SortKey; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 font-semibold"
      onClick={() => handleSort(key)}
    >
      {children}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  )

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">Status</TableHead>
                <TableHead>
                  <SortButton sortKey="title">Title</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton sortKey="type">Type</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton sortKey="priority">Priority</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton sortKey="date">Date</SortButton>
                </TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Labels</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTasks.map((task) => (
                <TableRow key={task.id} className={task.status === "completed" ? "opacity-60" : ""}>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {getStatusIcon(task.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Link 
                        href={`/tasks/${task.id}`}
                        className={`font-medium text-sm hover:underline ${
                          task.status === "completed" ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {task.title}
                      </Link>
                      {task.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {task.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={task.type === "follow_up" ? "secondary" : "outline"} className="text-xs">
                      {task.type === "follow_up" ? "Follow Up" : "Task"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Flag className={`h-3 w-3 mr-1 ${getPriorityColor(task.priority)}`} />
                      <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(task.date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {task.assignee ? (
                      <div className="flex items-center text-sm">
                        <User className="h-3 w-3 mr-1" />
                        {task.assignee}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {task.labels?.slice(0, 2).map((label) => (
                        <Badge key={label} variant="secondary" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                      {task.tags?.slice(0, 1).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                      {((task.labels?.length || 0) + (task.tags?.length || 0)) > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{((task.labels?.length || 0) + (task.tags?.length || 0)) - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/tasks/${task.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(task)}>
                          Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStatusChange(task.id, "pending")}>
                          Mark as Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(task.id, "in_progress")}>
                          Mark as In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(task.id, "completed")}>
                          Mark as Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(task.id, "cancelled")}>
                          Mark as Cancelled
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(task.id)}
                          className="text-red-600 dark:text-red-400"
                        >
                          Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {sortedTasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No tasks found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}