"use client";

import { useState, useRef } from "react";
import { Upload, File, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { uploadFile } from "@/lib/firebase/reports";
import type { Report } from "@/types/report";
import { toast } from "sonner";

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
  
  const [formData, setFormData] = useState({
    title: report?.title || "",
    description: report?.description || "",
    file: report?.file || null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      await onSubmit({
        title: formData.title,
        description: formData.description,
        file: formData.file || undefined,
        createdBy: user.uid,
      });
      
      setFormData({
        title: "",
        description: "",
        file: null,
      });
      onClose();
    } catch (error) {
      console.error("Error submitting report:", error);
    } finally {
      setIsLoading(false);
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
      setFormData(prev => ({ ...prev, file: uploadedFile }));
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, file: null }));
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
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter report title"
                value={formData.title}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter report description"
                value={formData.description}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, description: e.target.value }))
                }
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Document Upload (Optional)</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                {formData.file ? (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <File className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">{formData.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(formData.file.size)}
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
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || isUploading || !formData.title.trim() || !formData.description.trim()}
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
      </DialogContent>
    </Dialog>
  );
}