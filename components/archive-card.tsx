"use client";

import {
  Archive as ArchiveIcon,
  Edit,
  Trash2,
  // MoreHorizontal,
  Eye,
  Tag,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DeleteConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Archive } from "@/types/archive";
import { format } from "date-fns";

interface ArchiveCardProps {
  archive: Archive;
  onEdit: (archive: Archive) => void;
  onDelete: (id: string) => void;
  onView?: (archive: Archive) => void;
}

const statusConfig = {
  active: {
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
  archived: {
    color:
      "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200 dark:border-slate-800",
    dot: "bg-slate-500",
  },
  draft: {
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500",
  },
};

export function ArchiveCard({
  archive,
  onEdit,
  onDelete,
  onView,
}: Readonly<ArchiveCardProps>) {
  const borderColorClass = 
    archive.status === "active" 
      ? "border-l-emerald-500"
      : archive.status === "archived" 
        ? "border-l-slate-500"
        : "border-l-amber-500";

  const cardBackgroundClass = 
    archive.status === "archived" 
      ? "opacity-75"
      : "";

  return (
    <Card
      className={`group transition-all duration-200 hover:shadow-lg border-l-4 ${borderColorClass} ${cardBackgroundClass}`}
    >
      <CardHeader className="p-4 sm:p-5">
        <div className="space-y-3">
          {/* Header Row with Title and Actions */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-lg bg-primary/10`}
                >
                  <ArchiveIcon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-base sm:text-lg tracking-tight">
                    {archive.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    ID: {archive.id}
                  </p>
                </div>
              </div>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs border ${statusConfig[archive.status].color}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusConfig[archive.status].dot}`}
                  />
                  {archive.status}
                </Badge>

                {archive.labels.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {archive.labels.length} label{archive.labels.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <TooltipProvider>
              <div className="flex items-center gap-1 shrink-0">
                {onView && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/20 transition-colors"
                        onClick={() => onView(archive)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View archive</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={() => onEdit(archive)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit archive</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <DeleteConfirmDialog
                      itemName={archive.title}
                      itemType="archive"
                      onConfirm={() => onDelete(archive.id)}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DeleteConfirmDialog>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete archive</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
        <div className="space-y-3">
          {/* Date */}
          <div className="flex items-center gap-3 p-2.5 bg-secondary/30 rounded-lg">
            <Calendar className="h-4 w-4 text-primary" />
            <div className="text-sm">
              <p className="font-medium">
                {format(new Date(archive.date), "MMM d, yyyy")}
              </p>
              <p className="text-xs text-muted-foreground">
                Archive date
              </p>
            </div>
          </div>

          {/* Labels */}
          {archive.labels.length > 0 && (
            <div className="p-2.5 bg-secondary/30 rounded-lg">
              <p className="text-sm font-medium mb-2 flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Labels
              </p>
              <div className="flex flex-wrap gap-1">
                {archive.labels.map((label) => (
                  <Badge key={label} variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}