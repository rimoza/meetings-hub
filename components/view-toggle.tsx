"use client"

import { LayoutGrid, Table } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ViewMode } from "@/types/meeting"

interface ViewToggleProps {
  viewMode: ViewMode
  onViewModeChange: (view: ViewMode) => void
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg">
      <Button
        variant={viewMode === "table" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("table")}
        className="h-8 px-3"
      >
        <Table className="h-4 w-4" />
        <span className="sr-only">Table view</span>
      </Button>
      <Button
        variant={viewMode === "card" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("card")}
        className="h-8 px-3"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="sr-only">Card view</span>
      </Button>
    </div>
  )
}
