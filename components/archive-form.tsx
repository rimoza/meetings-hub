"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { Archive, ArchiveStatus } from "@/types/archive";

interface ArchiveFormProps {
  archive?: Archive;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (archive: Omit<Archive, "id" | "createdAt" | "updatedAt">) => Promise<void>;
}

interface FormData {
  title: string;
  date: Date;
  status: ArchiveStatus;
  tags: string[];
  labels: string[];
}

export function ArchiveForm({
  archive,
  isOpen,
  onClose,
  onSubmit,
}: Readonly<ArchiveFormProps>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    date: new Date(),
    status: "draft",
    tags: [],
    labels: [],
  });

  const [tagInput, setTagInput] = useState("");
  const [labelInput, setLabelInput] = useState("");

  useEffect(() => {
    if (archive) {
      setFormData({
        title: archive.title,
        date: new Date(archive.date),
        status: archive.status,
        tags: archive.tags,
        labels: archive.labels,
      });
    } else {
      // Reset form for new archive
      setFormData({
        title: "",
        date: new Date(),
        status: "draft",
        tags: [],
        labels: [],
      });
    }
    setTagInput("");
    setLabelInput("");
  }, [archive, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const archiveData = {
        ...formData,
        date: formData.date.toISOString().split("T")[0],
      };

      await onSubmit(archiveData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (
      tagInput.trim() &&
      !formData.tags.includes(tagInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const addLabel = () => {
    if (
      labelInput.trim() &&
      !formData.labels.includes(labelInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        labels: [...prev.labels, labelInput.trim()],
      }));
      setLabelInput("");
    }
  };

  const removeLabel = (label: string) => {
    setFormData((prev) => ({
      ...prev,
      labels: prev.labels.filter((l) => l !== label),
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[500px] sm:max-w-[600px] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {archive ? "Edit Archive" : "Create Archive"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {/* Title */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Archive title"
                required
              />
            </div>

            {/* Date and Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="date" className="text-sm">
                  Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      date: new Date(e.target.value),
                    }))
                  }
                  className="h-9 sm:h-10 text-sm"
                  required
                />
              </div>

              <div>
                <Label className="text-sm">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: ArchiveStatus) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="h-9 sm:h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label className="text-sm">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag"
                  className="h-9 sm:h-10 text-sm"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                />
                <Button
                  type="button"
                  onClick={addTag}
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 sm:h-10 sm:px-4"
                >
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1 text-xs sm:text-sm"
                    >
                      <span className="truncate max-w-[120px]">{tag}</span>
                      <button
                        type="button"
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

            {/* Labels */}
            <div>
              <Label className="text-sm">Labels</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  placeholder="Add label"
                  className="h-9 sm:h-10 text-sm"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addLabel())
                  }
                />
                <Button
                  type="button"
                  onClick={addLabel}
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 sm:h-10 sm:px-4"
                >
                  Add
                </Button>
              </div>
              {formData.labels.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {formData.labels.map((label) => (
                    <Badge
                      key={label}
                      variant="outline"
                      className="flex items-center gap-1 text-xs sm:text-sm"
                    >
                      <span className="truncate max-w-[120px]">{label}</span>
                      <button
                        type="button"
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

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {archive ? "Updating..." : "Creating..."}
                </>
              ) : (
                `${archive ? "Update" : "Create"} Archive`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}