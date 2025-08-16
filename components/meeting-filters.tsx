"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { MeetingFilters as FilterType } from "@/types/meeting"

interface MeetingFiltersProps {
  filters: FilterType
  onFiltersChange: (filters: FilterType) => void
}

export function MeetingFilters({ filters, onFiltersChange }: Readonly<MeetingFiltersProps>) {
  return (
    <div className="space-y-3">
      {/* Search Bar - Full Width on Mobile */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search meetings..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-10 h-9 sm:h-10"
        />
      </div>

      {/* Filter Dropdowns - Mobile First Grid */}
      <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
        <Select value={filters.status} onValueChange={(value: FilterType['status']) => onFiltersChange({ ...filters, status: value })}>
          <SelectTrigger className="h-9 text-xs sm:text-sm sm:h-10 sm:w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Done</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.priority} onValueChange={(value: FilterType['priority']) => onFiltersChange({ ...filters, priority: value })}>
          <SelectTrigger className="h-9 text-xs sm:text-sm sm:h-10 sm:w-[120px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.type} onValueChange={(value: FilterType['type']) => onFiltersChange({ ...filters, type: value })}>
          <SelectTrigger className="h-9 text-xs sm:text-sm sm:h-10 sm:w-[120px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="call">Call</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="presentation">Presentation</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
