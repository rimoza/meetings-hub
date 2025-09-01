"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  Users,
  // TrendingUp,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  // Activity,
  Target,
  CalendarDays,
  Timer,
  UserCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useMeetingsStore } from "@/stores/meetings-store";
import { useTasksStore } from "@/stores/tasks-store";
import { useArchivesStore } from "@/stores/archives-store";
import { useReportsStore } from "@/stores/reports-store";
import { useAuth } from "@/contexts/auth-context";
import { format } from "date-fns";
import { toast } from "sonner";
import { MeetingForm } from "@/components/meeting-form";
import { DashboardLoading } from "@/components/loading/dashboard-loading";
import {
  subscribeMeetings,
  createMeeting as createMeetingFirebase,
  updateMeeting as updateMeetingFirebase,
} from "@/lib/firebase/meetings";
import { subscribeTasks } from "@/lib/firebase/tasks";
import { subscribeArchives } from "@/lib/firebase/archives";
import { subscribeReports } from "@/lib/firebase/reports";
import type { Meeting } from "@/types/meeting";

const meetingData = [
  { day: "Mon", meetings: 4, completed: 3 },
  { day: "Tue", meetings: 6, completed: 5 },
  { day: "Wed", meetings: 8, completed: 7 },
  { day: "Thu", meetings: 5, completed: 5 },
  { day: "Fri", meetings: 7, completed: 6 },
  { day: "Sat", meetings: 2, completed: 2 },
  { day: "Sun", meetings: 1, completed: 1 },
];

const taskStatusData = [
  { name: "Completed", value: 45, color: "#10b981" },
  { name: "In Progress", value: 30, color: "#3b82f6" },
  { name: "Pending", value: 25, color: "#f59e0b" },
];

const activityData = [
  { time: "09:00", activity: 18 },
  { time: "10:00", activity: 25 },
  { time: "11:00", activity: 32 },
  { time: "12:00", activity: 20 },
  { time: "13:00", activity: 15 },
  { time: "14:00", activity: 28 },
  { time: "15:00", activity: 35 },
  { time: "16:00", activity: 30 },
  { time: "17:00", activity: 22 },
];

export function DashboardClient() {
  const { user } = useAuth();
  const { getTodayMeetings, getUpcomingMeetings, setMeetings, updateMeeting, isLoading } = useMeetingsStore();
  const { getPendingTasks, tasks, setTasks } = useTasksStore();
  const { archives, setArchives } = useArchivesStore();
  const { reports, setReports } = useReportsStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | undefined>();

  console.log(archives, 'archives');
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribeMeetings = subscribeMeetings(user.uid, (meetings) => {
      setMeetings(meetings);
    });

    const unsubscribeTasks = subscribeTasks(user.uid, (tasks) => {
      setTasks(tasks);
    });

    const unsubscribeArchives = subscribeArchives(user.uid, (archives) => {
      setArchives(archives);
    });

    const unsubscribeReports = subscribeReports(user.uid, (reports) => {
      setReports(reports);
    });

    return () => {
      unsubscribeMeetings();
      unsubscribeTasks();
      unsubscribeArchives();
      unsubscribeReports();
    };
  }, [user?.uid, setMeetings, setTasks, setArchives, setReports]);

  const handleFormSubmit = async (meetingData: Omit<Meeting, "id">) => {
    try {
      if (editingMeeting) {
        await updateMeetingFirebase(editingMeeting.id, meetingData);
        updateMeeting(editingMeeting.id, meetingData);
        toast.success("Meeting updated successfully");
      } else {
        await createMeetingFirebase(user!.uid, meetingData);
        toast.success("Meeting created successfully");
      }
      setIsFormOpen(false);
      setEditingMeeting(undefined);
    } catch (error) {
      console.error("Error submitting meeting:", error);
      toast.error(
        editingMeeting
          ? "Failed to update meeting"
          : "Failed to create meeting",
      );
    }
  };

  if (isLoading) {
    return <DashboardLoading />;
  }

  const todayMeetings = getTodayMeetings();
  const upcomingMeetings = getUpcomingMeetings();
  const pendingTasks = getPendingTasks();
  const completedTasks = tasks.filter(t => t.status === "completed");

  const stats = [
    {
      title: "Completion Rate",
      value: `${completedTasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%`,
      change: "+5%",
      trend: "up",
      icon: <Target className="h-4 w-4" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
    },
    {
      title: "Pending Tasks",
      value: pendingTasks.length,
      change: "-8%",
      trend: "down",
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      title: "Today's Meetings",
      value: todayMeetings.length,
      change: "+12%",
      trend: "up",
      icon: <Calendar className="h-4 w-4" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: "Total Reports",
      value: reports.length,
      change: "+18%",
      trend: "up",
      icon: <Users className="h-4 w-4" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      user: "Sarah Chen",
      action: "completed meeting",
      target: "Product Review",
      time: "2 mins ago",
      avatar: "SC",
      color: "bg-blue-500",
    },
    {
      id: 2,
      user: "Mike Johnson",
      action: "scheduled appointment",
      target: "Client Demo",
      time: "15 mins ago",
      avatar: "MJ",
      color: "bg-green-500",
    },
    {
      id: 3,
      user: "Emma Wilson",
      action: "updated task",
      target: "Q4 Planning",
      time: "1 hour ago",
      avatar: "EW",
      color: "bg-purple-500",
    },
    {
      id: 4,
      user: "David Lee",
      action: "added report",
      target: "Monthly Review",
      time: "3 hours ago",
      avatar: "DL",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your meetings today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Current time</p>
            <p className="text-2xl font-semibold tabular-nums">
              {format(currentTime, "HH:mm:ss")}
            </p>
          </div>
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="bg-primary hover:bg-primary/90 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            New Meeting
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className="relative overflow-hidden border-muted/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                <div className={stat.color}>{stat.icon}</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className={`flex items-center text-xs font-medium ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <Progress value={75} className="mt-3 h-1.5" />
            </CardContent>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary/5 to-transparent" />
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-7">
        {/* Meeting Trends */}
        <Card className="col-span-4 border-muted/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Meeting Trends</CardTitle>
                <CardDescription>Weekly meeting completion rate</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-accent">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Export data</DropdownMenuItem>
                  <DropdownMenuItem>View details</DropdownMenuItem>
                  <DropdownMenuItem>Share report</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={meetingData}>
                <defs>
                  <linearGradient id="colorMeetings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="meetings"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorMeetings)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task Distribution */}
        <Card className="col-span-3 border-muted/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Task Distribution</CardTitle>
                <CardDescription>Current task status breakdown</CardDescription>
              </div>
              <Badge variant="secondary" className="font-normal">
                {tasks.length} total
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {taskStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activity */}
        <Card className="border-muted/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="hover:bg-accent">
                View all
                <ArrowUpRight className="ml-2 h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-all cursor-pointer group"
                >
                  <Avatar className="group-hover:scale-110 transition-transform">
                    <AvatarFallback className={`${activity.color} text-white text-xs`}>
                      {activity.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>
                      <span className="text-muted-foreground"> {activity.action} </span>
                      <span className="font-medium">{activity.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Activity Heatmap */}
        <Card className="border-muted/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Daily Activity</CardTitle>
                <CardDescription>Peak hours for meetings</CardDescription>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span>Live</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar 
                  dataKey="activity" 
                  fill="url(#colorGradient)"
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Meetings */}
      <Card className="border-muted/50 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upcoming Meetings</CardTitle>
              <CardDescription>Your next scheduled meetings</CardDescription>
            </div>
            <Badge variant="outline" className="font-normal">
              <Clock className="mr-1 h-3 w-3" />
              {upcomingMeetings.length} scheduled
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {upcomingMeetings.length > 0 ? (
            <div className="space-y-3">
              {upcomingMeetings.slice(0, 5).map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/30 transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors group-hover:scale-110">
                      <CalendarDays className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{meeting.title}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {meeting.time}
                        </span>
                        {meeting.attendees && (
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <UserCheck className="h-3 w-3" />
                            {meeting.attendees.length} attendees
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    View
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming meetings scheduled</p>
            </div>
          )}
        </CardContent>
      </Card>

      <MeetingForm
        meeting={editingMeeting}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMeeting(undefined);
        }}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}