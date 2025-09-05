"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { Archive } from "@/types/archive";

// Zod schema for archive form validation
const archiveFormSchema = z.object({
  title: z.string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(100, { message: "Title must not exceed 100 characters" }),
  date: z.string()
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, { message: "Date must be today or in the future" }),
  status: z.enum(["active", "archived", "draft"] as const),
  labels: z.array(z.string().min(1).max(30))
    .optional(),
});

type ArchiveFormData = z.infer<typeof archiveFormSchema>;

interface ArchiveFormProps {
  archive?: Archive | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (archive: Omit<Archive, "id" | "createdAt" | "updatedAt">) => Promise<void>;
}

export function ArchiveForm({
  archive,
  isOpen,
  onClose,
  onSubmit,
}: Readonly<ArchiveFormProps>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [labelInput, setLabelInput] = useState("");
  const [labelError, setLabelError] = useState("");

  const form = useForm<ArchiveFormData>({
    resolver: zodResolver(archiveFormSchema),
    defaultValues: {
      title: "",
      date: new Date().toISOString().split("T")[0],
      status: "draft",
      labels: [],
    },
  });

  useEffect(() => {
    if (archive) {
      form.reset({
        title: archive.title,
        date: archive.date,
        status: archive.status,
        labels: archive.labels,
      });
    } else if (isOpen) {
      // Reset form for new archive
      form.reset({
        title: "",
        date: new Date().toISOString().split("T")[0],
        status: "draft",
        labels: [],
      });
    }
    setLabelInput("");
    setLabelError("");
  }, [archive, isOpen, form]);

  const handleSubmitForm = async (data: ArchiveFormData) => {
    setIsSubmitting(true);

    try {
      const archiveData = {
        ...data,
        labels: data.labels || [],
      };

      await onSubmit(archiveData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addLabel = () => {
    const trimmedLabel = labelInput.trim();
    setLabelError("");

    if (!trimmedLabel) {
      setLabelError("Please enter a label");
      return;
    }

    if (trimmedLabel.length > 30) {
      setLabelError("Label must not exceed 30 characters");
      return;
    }

    const currentLabels = form.getValues("labels") ?? [];
    
    if (currentLabels.includes(trimmedLabel)) {
      setLabelError("This label already exists");
      return;
    }

    form.setValue("labels", [...currentLabels, trimmedLabel]);
    setLabelInput("");
    setLabelError("");
  };

  const removeLabel = (label: string) => {
    const currentLabels = form.getValues("labels") ?? [];
    form.setValue("labels", currentLabels.filter((l) => l !== label));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[500px] sm:max-w-[600px] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {archive ? "Edit Archive" : "Create Archive"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
            <div className="grid grid-cols-1 gap-3">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Archive title"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Date *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="h-10 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 w-full text-sm">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-full">
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Labels */}
              <FormField
                control={form.control}
                name="labels"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Labels</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        value={labelInput}
                        onChange={(e) => {
                          setLabelInput(e.target.value);
                          setLabelError("");
                        }}
                        placeholder="Add label"
                        className="h-10"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addLabel();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={addLabel}
                        variant="outline"
                        className="h-10 px-4"
                      >
                        Add
                      </Button>
                    </div>
                    {labelError && (
                      <p className="text-destructive text-sm">{labelError}</p>
                    )}
                    {field.value && field.value?.length && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {field.value.map((label) => (
                          <Badge
                            key={label}
                            variant="secondary"
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
                    <FormDescription>
                      Add labels to categorize and organize archives
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-3">
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
                  `${archive ? "Update" : "Create"}`
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}