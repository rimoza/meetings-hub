"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, File, X, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useAuth } from "@/contexts/auth-context";
import { uploadFile } from "@/lib/firebase/reports";
import type { Report } from "@/types/report";
import { toast } from "sonner";

// Zod schema for report form validation
const reportFormSchema = z.object({
  title: z.string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(100, { message: "Title must not exceed 100 characters" }),
  description: z.string()
    .min(10, { message: "Description must be at least 10 characters" })
    .max(1000, { message: "Description must not exceed 1000 characters" }),
  tags: z.array(z.string().min(1).max(30))
    .optional(),
  file: z.object({
    name: z.string(),
    size: z.number(),
    url: z.string(),
    type: z.string(),
  }).optional().nullable(),
});

type ReportFormData = z.infer<typeof reportFormSchema>;

interface ReportFormProps {
  report?: Report;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Report, "id" | "createdAt" | "updatedAt">) => Promise<void>;
}

export function ReportForm({
  report,
  isOpen,
  onClose,
  onSubmit,
}: Readonly<ReportFormProps>) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tagError, setTagError] = useState("");

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: [],
      file: null,
    },
  });

  useEffect(() => {
    if (report) {
      form.reset({
        title: report.title,
        description: report.description,
        tags: report.tags || [],
        file: report.file || null,
      });
    } else if (isOpen) {
      // Reset form for new report
      form.reset({
        title: "",
        description: "",
        tags: [],
        file: null,
      });
    }
    setTagInput("");
    setTagError("");
  }, [report, isOpen, form]);

  const handleSubmitForm = async (data: ReportFormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      await onSubmit({
        title: data.title,
        description: data.description,
        tags: data.tags || [],
        file: data.file || undefined,
        createdBy: user.uid,
      });
      
      onClose();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    setTagError("");

    if (!trimmedTag) {
      setTagError("Please enter a tag");
      return;
    }

    if (trimmedTag.length > 30) {
      setTagError("Tag must not exceed 30 characters");
      return;
    }

    const currentTags = form.getValues("tags") ?? [];
    
    if (currentTags.includes(trimmedTag)) {
      setTagError("This tag already exists");
      return;
    }

    form.setValue("tags", [...currentTags, trimmedTag]);
    setTagInput("");
    setTagError("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") ?? [];
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "image/jpeg",
      "image/png",
      "image/gif"
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error("File type not supported. Please upload PDF, Word, text, or image files.");
      return;
    }

    setIsUploading(true);
    try {
      const uploadedFile = await uploadFile(user.uid, file);
      form.setValue("file", uploadedFile);
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    form.setValue("file", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const currentFile = form.watch("file");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {report ? "Edit Report" : "Create New Report"}
          </DialogTitle>
          <DialogDescription>
            {report
              ? "Update the report details below."
              : "Fill in the details to create a new report."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter report title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter report description"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a detailed description of the report (10-1000 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (Optional)</FormLabel>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag and press Enter"
                          value={tagInput}
                          onChange={(e) => {
                            setTagInput(e.target.value);
                            setTagError("");
                          }}
                          onKeyDown={handleTagInputKeyDown}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddTag}
                          disabled={!tagInput.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {tagError && (
                        <p className="text-destructive text-sm">{tagError}</p>
                      )}
                      {field.value && field.value?.length && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="px-2 py-1"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-2 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <FormDescription>
                      Add tags to categorize and organize your reports
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Upload (Optional)</FormLabel>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                      {currentFile ? (
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <File className="h-8 w-8 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium">{currentFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(currentFile.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveFile}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                          <div className="mt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                            >
                              {isUploading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Choose File
                                </>
                              )}
                            </Button>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            PDF, Word, Text, or Image files up to 10MB
                          </p>
                        </div>
                      )}
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                    <FormDescription>
                      Optionally attach a document to support your report
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || isUploading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {report ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  report ? "Update Report" : "Create Report"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}