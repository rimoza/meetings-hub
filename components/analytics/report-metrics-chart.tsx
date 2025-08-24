"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReportsStore } from "@/stores/reports-store";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { FileText, TrendingUp } from "lucide-react";

export function ReportMetricsChart() {
  const { reports } = useReportsStore();

  const getLast30DaysData = () => {
    const today = new Date();
    const data = [];

    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i);
      const dayStart = startOfDay(date);
      
      const reportsOnDay = reports.filter(report => {
        const reportDate = new Date(report.createdAt);
        return isSameDay(reportDate, dayStart);
      });

      const reportsWithFiles = reportsOnDay.filter(report => report.file);

      data.push({
        date: format(date, 'MMM dd'),
        fullDate: format(date, 'yyyy-MM-dd'),
        total: reportsOnDay.length,
        withFiles: reportsWithFiles.length,
        withoutFiles: reportsOnDay.length - reportsWithFiles.length,
      });
    }

    return data.filter((_, index) => index % 3 === 0); // Show every 3rd day for readability
  };

  const chartData = getLast30DaysData();
  
  const totalReports = reports.length;
  const reportsWithFiles = reports.filter(report => report.file).length;
  const averageFilesPerDay = chartData.length > 0 
    ? (chartData.reduce((sum, day) => sum + day.withFiles, 0) / chartData.length).toFixed(1)
    : "0";

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{payload: {total: number; withFiles: number}}>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-blue-500">
              Total Reports: {payload[0]?.payload?.total || 0}
            </p>
            <p className="text-sm text-green-500">
              With Files: {payload[0]?.payload?.withFiles || 0}
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
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Report Creation Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-500">{totalReports}</p>
              <p className="text-xs text-muted-foreground">Total Reports</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">{reportsWithFiles}</p>
              <p className="text-xs text-muted-foreground">With Files</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <p className="text-2xl font-bold text-orange-500">{averageFilesPerDay}</p>
              </div>
              <p className="text-xs text-muted-foreground">Avg/Day</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="withFiles"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}