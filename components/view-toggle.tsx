"use client";

import { LayoutGrid, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ViewMode } from "@/types/meeting";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (view: ViewMode) => void;
}

export function ViewToggle({
  viewMode,
  onViewModeChange,
}: Readonly<ViewToggleProps>) {
  return (
    <div className="inline-flex items-center bg-card/50 backdrop-blur-sm border rounded-lg p-1 shadow-sm">
      <Button
        variant={viewMode === "table" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("table")}
        className="h-8 px-3 transition-all"
      >
        <Table className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline"></span>
      </Button>
      <Button
        variant={viewMode === "card" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("card")}
        className="h-8 px-3 transition-all"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline"></span>
      </Button>
    </div>
  );
}
