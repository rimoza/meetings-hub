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
        variant={viewMode === "card" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("card")}
        className="h-8 px-2 sm:px-3"
      >
        <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="sr-only sm:not-sr-only sm:ml-1 hidden sm:inline">Cards</span>
      </Button>
      <Button
        variant={viewMode === "table" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("table")}
        className="h-8 px-2 sm:px-3 hidden sm:inline-flex"
      >
        <Table className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="sr-only sm:not-sr-only sm:ml-1 hidden sm:inline">Table</span>
      </Button>
    </div>
  )
}
