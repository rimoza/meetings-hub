"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMeetingsStore } from "@/stores/meetings-store";
import { useTasksStore } from "@/stores/tasks-store";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function CompletionRate() {
  const { meetings, getCompletedMeetings } = useMeetingsStore();
  const { tasks, getCompletedTasks } = useTasksStore();

  const completedMeetings = getCompletedMeetings();
  const completedTasks = getCompletedTasks();

  const meetingCompletionRate = meetings.length > 0 
    ? (completedMeetings.length / meetings.length) * 100 
    : 0;
    
  const taskCompletionRate = tasks.length > 0 
    ? (completedTasks.length / tasks.length) * 100 
    : 0;

  const getProgressColor = (rate: number) => {
    if (rate >= 75) return "bg-green-500";
    if (rate >= 50) return "bg-yellow-500";
    if (rate >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  const getTrendIcon = (rate: number) => {
    if (rate >= 70) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (rate >= 40) return <Minus className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const completionData = [
    {
      label: "Meetings",
      completed: completedMeetings.length,
      total: meetings.length,
      rate: meetingCompletionRate,
    },
    {
      label: "Tasks",
      completed: completedTasks.length,
      total: tasks.length,
      rate: taskCompletionRate,
    },
  ];

  const overallRate = 
    (meetings.length + tasks.length) > 0
      ? ((completedMeetings.length + completedTasks.length) / (meetings.length + tasks.length)) * 100
      : 0;

  return (
    <Card className="">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Completion Rates</CardTitle>
          {getTrendIcon(overallRate)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="h-32 w-32 -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-secondary"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(overallRate / 100) * 352} 352`}
                  className={`transition-all duration-500 ${
                    overallRate >= 75 ? "text-green-500" :
                    overallRate >= 50 ? "text-yellow-500" :
                    overallRate >= 25 ? "text-orange-500" :
                    "text-red-500"
                  }`}
                />
              </svg>
              <div className="absolute">
                <p className="text-3xl font-bold">{Math.round(overallRate)}%</p>
                <p className="text-xs text-muted-foreground">Overall</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {completionData.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-muted-foreground">
                    {item.completed}/{item.total}
                  </span>
                </div>
                <div className="relative">
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${getProgressColor(item.rate)}`}
                      style={{ width: `${item.rate}%` }}
                    />
                  </div>
                  <span className="absolute right-0 -top-5 text-xs font-medium">
                    {Math.round(item.rate)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-500">
                  {completedMeetings.length + completedTasks.length}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-500">
                  {(meetings.length - completedMeetings.length) + (tasks.length - completedTasks.length)}
                </p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}