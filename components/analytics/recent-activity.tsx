"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { useMeetingsStore } from "@/stores/meetings-store";
import { useTasksStore } from "@/stores/tasks-store";
import { Calendar, CheckCircle, Clock, AlertCircle, Plus, Edit, Trash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function RecentActivity() {
  const { meetings } = useMeetingsStore();
  const { tasks } = useTasksStore();

  type ActivityItem = {
    id: string;
    type: "meeting" | "task";
    action: "created" | "completed" | "updated" | "deleted";
    title: string;
    timestamp: Date;
    status?: string;
    priority?: string;
  };

  const activities: ActivityItem[] = [
    ...meetings.map(meeting => ({
      id: meeting.id,
      type: "meeting" as const,
      action: meeting.completed ? "completed" as const : "created" as const,
      title: meeting.title,
      timestamp: new Date(meeting.date),
      status: meeting.completed ? "completed" : "pending",
      priority: meeting.priority,
    })),
    ...tasks.map(task => ({
      id: task.id,
      type: "task" as const,
      action: task.status === "completed" ? "completed" as const : "created" as const,
      title: task.title,
      timestamp: task.createdAt ? new Date(task.createdAt) : new Date(),
      status: task.status,
      priority: task.priority,
    })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 4);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return <Plus className="h-3 w-3" />;
      case "completed":
        return <CheckCircle className="h-3 w-3" />;
      case "updated":
        return <Edit className="h-3 w-3" />;
      case "deleted":
        return <Trash className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "created":
        return "text-blue-500 bg-blue-100";
      case "completed":
        return "text-green-500 bg-green-100";
      case "updated":
        return "text-yellow-500 bg-yellow-100";
      case "deleted":
        return "text-red-500 bg-red-100";
      default:
        return "text-gray-500 bg-gray-100";
    }
  };

  const getTypeIcon = (type: string) => {
    return type === "meeting" ? 
      <Calendar className="h-3 w-3" /> : 
      <AlertCircle className="h-3 w-3" />;
  };

  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <>
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                  <div className={`p-2 rounded-full ${getActionColor(activity.action)}`}>
                    {getActionIcon(activity.action)}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {activity.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {getTypeIcon(activity.type)}
                            <span className="capitalize">{activity.type}</span>
                          </div>
                          {activity.priority && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <Badge variant="outline" className="text-xs h-5">
                                {activity.priority}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {activity.type === "meeting" ? "Meeting" : "Task"} was {activity.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          )}
        </>
      </CardContent>
    </Card>
  );
}