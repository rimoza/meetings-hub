"use client";

import {
  Calendar,
  User,
  CheckCircle,
  Clock,
  XCircle,
  PlayCircle,
  Flag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Task } from "@/types/task";

interface TaskTableProps {
  tasks: Task[];
}


export function TaskTable({
  tasks,
}: Readonly<TaskTableProps>) {

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-orange-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };


  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold w-[120px]">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                Status
              </div>
            </TableHead>
            <TableHead className="font-semibold">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Task
              </div>
            </TableHead>
            <TableHead className="font-semibold">
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-muted-foreground" />
                Type
              </div>
            </TableHead>
            <TableHead className="font-semibold text-center">Priority</TableHead>
            <TableHead className="font-semibold">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Date
              </div>
            </TableHead>
            <TableHead className="font-semibold">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Assignee
              </div>
            </TableHead>
            <TableHead className="font-semibold">Labels</TableHead>
          </TableRow>
        </TableHeader>
            <TableBody>
              {tasks.map((task, index) => {
                const isLast = index === tasks.length - 1;
                return (
                <TableRow
                  key={task.id}
                  className={`group hover:bg-muted/30 transition-colors ${
                    task.status === "completed" ? "opacity-60" : ""
                  } ${!isLast ? "border-b" : ""}`}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <span className="text-sm capitalize">
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div
                        className={`font-medium text-sm ${
                          task.status === "completed"
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {task.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        task.type === "follow_up" ? "secondary" : "outline"
                      }
                      className="text-xs"
                    >
                      {task.type === "follow_up" ? "Follow Up" : "Task"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Flag
                        className={`h-3 w-3 mr-1 ${getPriorityColor(task.priority)}`}
                      />
                      <span
                        className={`text-sm font-medium ${getPriorityColor(task.priority)}`}
                      >
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
                      <span className="text-muted-foreground text-sm">
                        Unassigned
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {task.labels?.slice(0, 2).map((label) => (
                        <Badge
                          key={label}
                          variant="secondary"
                          className="text-xs"
                        >
                          {label}
                        </Badge>
                      ))}
                      {task.tags?.slice(0, 1).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                      {(task.labels?.length || 0) + (task.tags?.length || 0) >
                        3 && (
                        <Badge variant="outline" className="text-xs">
                          +
                          {(task.labels?.length || 0) +
                            (task.tags?.length || 0) -
                            3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
    </div>
  );
}
