"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMeetingsStore } from "@/stores/meetings-store";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function MeetingDurationChart() {
  const { meetings } = useMeetingsStore();

  const getDurationData = () => {
    const durationRanges = [
      { range: "0-30 min", min: 0, max: 30, count: 0 },
      { range: "30-60 min", min: 30, max: 60, count: 0 },
      { range: "1-2 hrs", min: 60, max: 120, count: 0 },
      { range: "2+ hrs", min: 120, max: Infinity, count: 0 },
    ];

    meetings.forEach(meeting => {
      const duration = meeting.duration || 0;
      const range = durationRanges.find(r => duration >= r.min && duration < r.max);
      if (range) {
        range.count++;
      }
    });

    return durationRanges.map(({ range, count }) => ({
      range,
      count,
    }));
  };

  const chartData = getDurationData();

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{value: number}>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-blue-500">
            Meetings: {payload[0]?.value || 0}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Meeting Duration Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="range" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}