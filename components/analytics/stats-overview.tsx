"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { useMeetingsStore } from "@/stores/meetings-store";
// import { useTasksStore } from "@/stores/tasks-store";

export function StatsOverview() {
  const { meetings, getTodayMeetings, getUpcomingMeetings, getCompletedMeetings } = useMeetingsStore();
  // const { tasks, getCompletedTasks, getPendingTasks } = useTasksStore();

  const todayMeetings = getTodayMeetings();
  const upcomingMeetings = getUpcomingMeetings();
  const completedMeetings = getCompletedMeetings();
  // const completedTasks = getCompletedTasks();
  // const pendingTasks = getPendingTasks();

  const stats = [
    {
      title: "Total Meetings",
      value: meetings.length,
      icon: Calendar,
      description: "All scheduled meetings",
      trend: "+12%",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Completed",
      value: completedMeetings.length,
      icon: CheckCircle,
      description: "Successfully completed",
      trend: "+8%",
      gradient: "from-green-500 to-green-600",
    },
    {
      title: "Today's Meetings",
      value: todayMeetings.length,
      icon: Clock,
      description: "Scheduled for today",
      trend: todayMeetings.length > 0 ? `${todayMeetings.length} active` : "None",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: "Upcoming",
      value: upcomingMeetings.length,
      icon: TrendingUp,
      description: "Future meetings",
      trend: "Next 7 days",
      gradient: "from-orange-500 to-orange-600",
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.gradient}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-1">
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <p className="text-xs font-medium text-primary">{stat.trend}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}