"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MeetingFilters as FilterType } from "@/types/meeting";

interface MeetingFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
}

export function MeetingFilters({
  filters,
  onFiltersChange,
}: Readonly<MeetingFiltersProps>) {
  return (
    <div className="flex flex-col lg:flex-row justify-between gap-3 w-full p-4 bg-card/50 backdrop-blur-sm border rounded-lg shadow-sm">
      {/* Search Bar */}
      <div className="relative flex-1 lg:max-w-2xl">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
        <Input
          placeholder="Search by title, description, or attendees..."
          value={filters.search}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value })
          }
          className="pl-10 h-10 bg-background/60 border-muted focus:bg-background transition-colors"
        />
      </div>

      {/* Divider for larger screens */}
      <div className="hidden lg:block w-px h-10 bg-border/50 self-center" />

      {/* Filter Dropdowns */}
      <div className="flex gap-2 flex-wrap sm:flex-nowrap">
        <Select
          value={filters.status}
          onValueChange={(value: FilterType["status"]) =>
            onFiltersChange({ ...filters, status: value })
          }
        >
          <SelectTrigger className="h-10 text-sm w-full sm:w-[130px] bg-background/60 border-muted hover:bg-background/80 transition-colors">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.priority}
          onValueChange={(value: FilterType["priority"]) =>
            onFiltersChange({ ...filters, priority: value })
          }
        >
          <SelectTrigger className="h-10 text-sm w-full sm:w-[130px] bg-background/60 border-muted hover:bg-background/80 transition-colors">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.type}
          onValueChange={(value: FilterType["type"]) =>
            onFiltersChange({ ...filters, type: value })
          }
        >
          <SelectTrigger className="h-10 text-sm w-full sm:w-[130px] bg-background/60 border-muted hover:bg-background/80 transition-colors">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="call">Call</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="presentation">Presentation</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
