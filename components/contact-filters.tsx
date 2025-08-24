"use client";

import { useState } from "react";
import { Search, Filter, X, Star, Flag, Building, MapPin } from "lucide-react";
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
import type { ContactFilters } from "@/types/contact";

interface ContactFiltersProps {
  filters: ContactFilters;
  onFiltersChange: (filters: ContactFilters) => void;
  availableTags?: string[];
  availableCompanies?: string[];
  availableLocations?: string[];
}

export function ContactFilters({
  filters,
  onFiltersChange,
  availableTags = [],
  availableCompanies = [],
  availableLocations = [],
}: Readonly<ContactFiltersProps>) {
  const [tagInput, setTagInput] = useState("");

  const updateFilters = (updates: Partial<ContactFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const addTag = (tag: string) => {
    if (tag && !filters.tags.includes(tag)) {
      updateFilters({ tags: [...filters.tags, tag] });
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    updateFilters({ tags: filters.tags.filter(t => t !== tag) });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      tags: [],
      important: "all",
      favorite: "all",
      company: undefined,
      location: undefined,
    });
  };

  const hasActiveFilters = 
    filters.search || 
    filters.important !== "all" || 
    filters.favorite !== "all" ||
    filters.tags.length > 0 ||
    filters.company ||
    filters.location;

  return (
    <div className="space-y-4">
      {/* Search and Quick Filters Row */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search contacts..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          {/* Quick Filter Buttons */}
          <Button
            variant={filters.favorite === true ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilters({ 
              favorite: filters.favorite === true ? "all" : true 
            })}
            className="flex items-center gap-1"
          >
            <Star className={`h-4 w-4 ${filters.favorite === true ? "fill-current" : ""}`} />
            <span className="hidden sm:inline">Favorites</span>
          </Button>

          <Button
            variant={filters.important === true ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilters({ 
              important: filters.important === true ? "all" : true 
            })}
            className="flex items-center gap-1"
          >
            <Flag className={`h-4 w-4 ${filters.important === true ? "fill-current" : ""}`} />
            <span className="hidden sm:inline">Important</span>
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-fit">
                <Filter className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">More Filters</span>
                <span className="sm:hidden">Filters</span>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2 h-5 text-xs">
                    {(filters.tags.length + 
                      (filters.important !== "all" ? 1 : 0) +
                      (filters.favorite !== "all" ? 1 : 0) +
                      (filters.company ? 1 : 0) +
                      (filters.location ? 1 : 0) +
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

                {/* Company Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Company</Label>
                  <Select
                    value={filters.company || ""}
                    onValueChange={(value) => updateFilters({ company: value || undefined })}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Filter by company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All companies</SelectItem>
                      {availableCompanies.map((company) => (
                        <SelectItem key={company} value={company}>
                          {company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Location</Label>
                  <Select
                    value={filters.location || ""}
                    onValueChange={(value) => updateFilters({ location: value || undefined })}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Filter by location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All locations</SelectItem>
                      {availableLocations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag filter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      className="text-sm"
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addTag(tagInput.trim()))
                      }
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addTag(tagInput.trim())}
                      disabled={!tagInput.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  
                  {/* Available Tags */}
                  {availableTags.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Available tags:</p>
                      <div className="flex flex-wrap gap-1">
                        {availableTags.map((tag) => (
                          <Button
                            key={tag}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => addTag(tag)}
                            disabled={filters.tags.includes(tag)}
                          >
                            {tag}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Tags */}
                  {filters.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {filters.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
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
          
          {filters.favorite === true && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              Favorites
              <button
                onClick={() => updateFilters({ favorite: "all" })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.important === true && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Flag className="h-3 w-3 fill-current" />
              Important
              <button
                onClick={() => updateFilters({ important: "all" })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.company && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              {filters.company}
              <button
                onClick={() => updateFilters({ company: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.location && (
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {filters.location}
              <button
                onClick={() => updateFilters({ location: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              Tag: {tag}
              <button
                onClick={() => removeTag(tag)}
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