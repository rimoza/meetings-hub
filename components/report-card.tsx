"use client";

import {
  FileText,
  Download,
  Edit,
  Trash2,
  User,
  Calendar,
  File,
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
import type { Report } from "@/types/report";
import { format } from "date-fns";

interface ReportCardProps {
  report: Report;
  onEdit: (report: Report) => void;
  onDelete: (id: string) => void;
}

export function ReportCard({
  report,
  onEdit,
  onDelete,
}: Readonly<ReportCardProps>) {
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = () => {
    if (report.file?.url) {
      window.open(report.file.url, "_blank");
    }
  };

  return (
    <Card className="group transition-all duration-200 hover:shadow-lg border-l-4 border-l-blue-500">
      <CardHeader className="p-4 sm:p-5">
        <div className="space-y-3">
          {/* Header Row with Title and Actions */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-base sm:text-lg tracking-tight line-clamp-2">
                  {report.title}
                </h3>
              </div>

              {/* File Badge */}
              {report.file && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-green-200 dark:border-green-800">
                    <File className="h-3 w-3 mr-1" />
                    Has Document
                  </Badge>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <TooltipProvider>
              <div className="flex items-center gap-1 shrink-0">
                {report.file && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/20 transition-colors"
                        onClick={handleDownload}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download document</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={() => onEdit(report)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit report</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <DeleteConfirmDialog
                      itemName={report.title}
                      itemType="report"
                      onConfirm={() => onDelete(report.id)}
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
                    <p>Delete report</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
        <div className="space-y-3">
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-3">
            {report.description}
          </p>

          {/* File Info */}
          {report.file && (
            <div className="flex items-center gap-3 p-2.5 bg-secondary/30 rounded-lg">
              <File className="h-4 w-4 text-blue-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{report.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(report.file.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="shrink-0"
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Created By */}
            <div className="flex items-center gap-3 p-2.5 bg-secondary/30 rounded-lg">
              <User className="h-4 w-4 text-primary shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Created By</p>
                <p className="text-xs text-muted-foreground truncate">
                  {report.createdBy}
                </p>
              </div>
            </div>

            {/* Created Date */}
            <div className="flex items-center gap-3 p-2.5 bg-secondary/30 rounded-lg">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Created</p>
                <p className="text-xs text-muted-foreground">
                  {format(report.createdAt, "MMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}