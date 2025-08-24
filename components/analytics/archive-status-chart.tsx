"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useArchivesStore } from "@/stores/archives-store";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Archive, FileText, Package } from "lucide-react";

export function ArchiveStatusChart() {
  const { archives, getActiveArchives, getArchivedArchives, getDraftArchives } = useArchivesStore();

  const getArchiveData = () => {
    const active = getActiveArchives();
    const archived = getArchivedArchives();
    const draft = getDraftArchives();

    return [
      {
        status: "Active",
        count: active.length,
        color: "#10b981",
        icon: Package,
      },
      {
        status: "Archived",
        count: archived.length,
        color: "#6b7280",
        icon: Archive,
      },
      {
        status: "Draft",
        count: draft.length,
        color: "#f59e0b",
        icon: FileText,
      },
    ];
  };

  const chartData = getArchiveData();

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { status: string; count: number; color: string } }>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = archives.length;
      const percentage = total > 0 ? ((data.count / total) * 100).toFixed(1) : 0;
      
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.status}</p>
          <p className="text-sm">
            {data.count} archives ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (archives.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Archive Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">No archives available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Archive className="h-5 w-5" />
          Archive Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            {chartData.map((item) => (
              <div key={item.status} className="space-y-2">
                <div className="flex justify-center">
                  <item.icon className="h-6 w-6" style={{ color: item.color }} />
                </div>
                <div>
                  <p className="text-xl font-bold" style={{ color: item.color }}>
                    {item.count}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.status}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="status" 
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
                  radius={[4, 4, 0, 0]}
                  fill="#8884d8"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}