"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasksStore } from "@/stores/tasks-store";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export function TaskCompletionChart() {
  const { getCompletedTasks, getPendingTasks } = useTasksStore();

  const getTaskData = () => {
    const completed = getCompletedTasks();
    const pending = getPendingTasks();

    return [
      {
        name: "Completed",
        value: completed.length,
        color: "#10b981",
      },
      {
        name: "Pending",
        value: pending.length,
        color: "#f59e0b",
      },
    ].filter(item => item.value > 0);
  };

  const chartData = getTaskData();

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{payload: {name: string; value: number}}> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = chartData.reduce((sum, item) => sum + item.value, 0);
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">
            {data.value} tasks ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: { payload?: Array<{color: string; value: string}> }) => {
    return (
      <div className="flex justify-center gap-4 mt-4">
        {payload?.map((entry: {color: string; value: string}, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Task Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">No tasks available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Task Completion Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}