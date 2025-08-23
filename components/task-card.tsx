"use client"

import { MoreHorizontal, Calendar, User, CheckCircle, Clock, XCircle, PlayCircle, Flag, Eye } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Task } from "@/types/task"

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onToggleComplete: (taskId: string) => void
  onChangeStatus?: (taskId: string, status: Task["status"]) => void
}

export function TaskCard({ task, onEdit, onDelete, onToggleComplete, onChangeStatus }: TaskCardProps) {
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

  const handleStatusChange = (newStatus: Task["status"]) => {
    if (onChangeStatus) {
      onChangeStatus(task.id, newStatus)
    }
  }

  return (
    <Card className={`transition-all hover:shadow-md ${
      task.status === "completed" ? "opacity-75" : ""
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(task.status)}
              <Link 
                href={`/tasks/${task.id}`}
                className={`font-semibold text-sm truncate hover:underline ${
                  task.status === "completed" ? "line-through text-muted-foreground" : ""
                }`}
              >
                {task.title}
              </Link>
              <Flag className={`h-3 w-3 ${getPriorityColor(task.priority)}`} />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={task.type === "follow_up" ? "secondary" : "outline"} className="text-xs">
                {task.type === "follow_up" ? "Follow Up" : "Task"}
              </Badge>
              <Badge variant={getStatusBadgeVariant(task.status)} className="text-xs">
                {task.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          </div>
          
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
              <DropdownMenuItem onClick={() => handleStatusChange("pending")}>
                Mark as Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("in_progress")}>
                Mark as In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
                Mark as Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("cancelled")}>
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
        </div>

        {task.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="space-y-2 mb-3">
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(task.date)}
          </div>
          {task.assignee && (
            <div className="flex items-center text-xs text-muted-foreground">
              <User className="h-3 w-3 mr-1" />
              {task.assignee}
            </div>
          )}
        </div>

        {task.todoList && task.todoList.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-medium text-muted-foreground mb-1">
              To-Do ({task.todoList.length} items)
            </div>
            <div className="space-y-1">
              {task.todoList.slice(0, 3).map((todo) => (
                <div key={todo.id} className="flex items-center gap-2 text-xs p-1 bg-muted rounded text-muted-foreground">
                  <span className={`w-2 h-2 rounded-full ${
                    todo.status === 'completed' 
                      ? 'bg-green-500' 
                      : todo.status === 'in_progress'
                      ? 'bg-blue-500'
                      : 'bg-gray-400'
                  }`} />
                  <span className={todo.status === 'completed' ? 'line-through' : ''}>{todo.text}</span>
                </div>
              ))}
              {task.todoList.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{task.todoList.length - 3} more items
                </div>
              )}
            </div>
          </div>
        )}

        {(task.labels && task.labels.length > 0) || (task.tags && task.tags.length > 0) && (
          <div className="flex flex-wrap gap-1">
            {task.labels?.map((label) => (
              <Badge key={label} variant="secondary" className="text-xs">
                {label}
              </Badge>
            ))}
            {task.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex justify-between items-center w-full">
          <div className="text-xs text-muted-foreground">
            Priority: <span className={`font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority.toUpperCase()}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleComplete(task.id)}
            className="text-xs"
          >
            {task.status === "completed" ? "Mark Incomplete" : "Mark Complete"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}