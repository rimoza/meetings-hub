"use client";

import { useState } from "react";
import { Search, Filter, X, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { ArchiveFilters } from "@/types/archive";

interface ArchiveFiltersProps {
  filters: ArchiveFilters;
  onFiltersChange: (filters: ArchiveFilters) => void;
  availableLabels?: string[];
}

export function ArchiveFilters({
  filters,
  onFiltersChange,
  availableLabels = [],
}: Readonly<ArchiveFiltersProps>) {
  const [labelInput, setLabelInput] = useState("");

  const updateFilters = (updates: Partial<ArchiveFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const addLabel = (label: string) => {
    if (label && !filters.labels.includes(label)) {
      updateFilters({ labels: [...filters.labels, label] });
    }
    setLabelInput("");
  };

  const removeLabel = (label: string) => {
    updateFilters({ labels: filters.labels.filter(l => l !== label) });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      status: "all",
      labels: [],
    });
  };

  const hasActiveFilters = 
    filters.search || 
    filters.status !== "all" || 
    filters.labels.length > 0;

  return (
    <div className="space-y-4">
      {/* Search and Status Row */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search archives..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={filters.status}
            onValueChange={(value: ArchiveFilters["status"]) =>
              updateFilters({ status: value })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-fit">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2 h-5 text-xs">
                    {(filters.labels.length + 
                      (filters.status !== "all" ? 1 : 0) +
                      (filters.search ? 1 : 0))}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Advanced Filters</h4>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-8 text-xs"
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Labels Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Labels</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add label filter"
                      value={labelInput}
                      onChange={(e) => setLabelInput(e.target.value)}
                      className="text-sm"
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addLabel(labelInput.trim()))
                      }
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addLabel(labelInput.trim())}
                      disabled={!labelInput.trim()}
                    >
                      Add
                    </Button>
                  </div>

                  {/* Available Labels */}
                  {availableLabels.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Available labels:</p>
                      <div className="flex flex-wrap gap-1">
                        {availableLabels.map((label) => (
                          <Button
                            key={label}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => addLabel(label)}
                            disabled={filters.labels.includes(label)}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Labels */}
                  {filters.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {filters.labels.map((label) => (
                        <Badge
                          key={label}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {label}
                          <button
                            onClick={() => removeLabel(label)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {filters.search && (
            <Badge variant="outline" className="flex items-center gap-1">
              Search: {filters.search}
              <button
                onClick={() => updateFilters({ search: "" })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.status !== "all" && (
            <Badge variant="outline" className="flex items-center gap-1">
              Status: {filters.status}
              <button
                onClick={() => updateFilters({ status: "all" })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.labels.map((label) => (
            <Badge key={label} variant="secondary" className="flex items-center gap-1">
              Label: {label}
              <button
                onClick={() => removeLabel(label)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}