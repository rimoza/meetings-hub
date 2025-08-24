"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMeetingsStore } from "@/stores/meetings-store";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, startOfDay, isSameDay } from "date-fns";

export function MeetingsTrendChart() {
  const { meetings } = useMeetingsStore();

  const getLast7DaysData = () => {
    const today = new Date();
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayStart = startOfDay(date);
      
      const meetingsOnDay = meetings.filter(meeting => {
        const meetingDate = new Date(meeting.date);
        return isSameDay(meetingDate, dayStart);
      });

      const completedOnDay = meetingsOnDay.filter(meeting => meeting.completed);

      data.push({
        date: format(date, 'MMM dd'),
        fullDate: format(date, 'yyyy-MM-dd'),
        total: meetingsOnDay.length,
        completed: completedOnDay.length,
        pending: meetingsOnDay.length - completedOnDay.length,
      });
    }

    return data;
  };

  const chartData = getLast7DaysData();

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: { total: number; completed: number; pending: number } }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-blue-500">
              Total: {payload[0]?.payload?.total || 0}
            </p>
            <p className="text-sm text-green-500">
              Completed: {payload[0]?.payload?.completed || 0}
            </p>
            <p className="text-sm text-orange-500">
              Pending: {payload[0]?.payload?.pending || 0}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Meeting Trends (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="total"
                stackId="1"
                stroke="#3b82f6"
                fill="url(#totalGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="completed"
                stackId="2"
                stroke="#10b981"
                fill="url(#completedGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}