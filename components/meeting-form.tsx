"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import type { Meeting, MeetingType, Priority } from "@/types/meeting";

// Zod schema for form validation
const meetingFormSchema = z.object({
  title: z.string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(100, { message: "Title must not exceed 100 characters" }),
  description: z.string()
    .max(500, { message: "Description must not exceed 500 characters" })
    .optional(),
  date: z.string()
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, { message: "Date must be today or in the future" }),
  time: z.string()
    .min(1, { message: "Time is required" })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Invalid time format" }),
  duration: z.number()
    .min(5, { message: "Duration must be at least 5 minutes" })
    .max(480, { message: "Duration cannot exceed 8 hours (480 minutes)" }),
  type: z.enum(["meeting", "call", "interview", "presentation"] as const),
  priority: z.enum(["low", "medium", "high"] as const),
  attendees: z.array(z.string().email({ message: "Invalid email format" }))
    .optional(),
  location: z.string()
    .max(200, { message: "Location must not exceed 200 characters" })
    .optional(),
});

type MeetingFormData = z.infer<typeof meetingFormSchema>;

interface MeetingFormProps {
  meeting?: Meeting;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (meeting: Omit<Meeting, "id">) => Promise<void>;
}

export function MeetingForm({
  meeting,
  isOpen,
  onClose,
  onSubmit,
}: Readonly<MeetingFormProps>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendeeInput, setAttendeeInput] = useState("");
  const [attendeeError, setAttendeeError] = useState("");

  const form = useForm<MeetingFormData>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: "",
      duration: 60,
      type: "meeting",
      priority: "medium",
      attendees: [],
      location: "",
    },
  });

  useEffect(() => {
    if (meeting) {
      form.reset({
        title: meeting.title,
        description: meeting.description,
        date: meeting.date,
        time: meeting.time,
        duration: meeting.duration,
        type: meeting.type as MeetingType,
        priority: meeting.priority as Priority,
        attendees: meeting.attendees,
        location: meeting.location,
      });
    } else if (isOpen) {
      // Reset form for new meeting
      form.reset({
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        time: "",
        duration: 60,
        type: "meeting",
        priority: "medium",
        attendees: [],
        location: "",
      });
    }
  }, [meeting, isOpen, form]);

  const handleSubmitForm = async (data: MeetingFormData) => {
    setIsSubmitting(true);

    try {
      const now = new Date();
      const meetingData = {
        ...data,
        description: data.description || "",
        location: data.location || "",
        attendees: data.attendees || [],
        completed: false,
        createdAt: now,
        updatedAt: now,
      };

      await onSubmit(meetingData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAttendee = () => {
    const trimmedInput = attendeeInput.trim();
    setAttendeeError("");

    if (!trimmedInput) {
      setAttendeeError("Please enter an email address");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedInput)) {
      setAttendeeError("Please enter a valid email address");
      return;
    }

    const currentAttendees = form.getValues("attendees") ?? [];
    
    if (currentAttendees.includes(trimmedInput)) {
      setAttendeeError("This attendee has already been added");
      return;
    }

    form.setValue("attendees", [...currentAttendees, trimmedInput]);
    setAttendeeInput("");
    setAttendeeError("");
  };

  const removeAttendee = (attendee: string) => {
    const currentAttendees = form.getValues("attendees") ?? [];
    form.setValue(
      "attendees",
      currentAttendees.filter((a) => a !== attendee)
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[500px] sm:max-w-[600px] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {meeting ? "Edit Meeting" : "Create Meeting"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmitForm)}
            className="space-y-3 sm:space-y-4"
          >
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter meeting title"
                        {...field}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter meeting description (optional)"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date and Time - Stack on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Time *</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          className="h-10 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Duration */}
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">
                      Duration (minutes) *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="5"
                        max="480"
                        className="h-10 text-sm"
                        placeholder="60"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Meeting duration in minutes (5 min - 8 hours)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type and Priority - Stack on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Type *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full text-sm">
                            <SelectValue placeholder="Select meeting type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-full">
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="call">Call</SelectItem>
                          <SelectItem value="interview">Interview</SelectItem>
                          <SelectItem value="presentation">
                            Presentation
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Priority *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full text-sm">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-full">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Meeting location or video link (optional)"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Attendees */}
              <FormField
                control={form.control}
                name="attendees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Attendees</FormLabel>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={attendeeInput}
                        onChange={(e) => {
                          setAttendeeInput(e.target.value);
                          setAttendeeError("");
                        }}
                        placeholder="Enter email address"
                        className="h-10 text-sm"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addAttendee();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={addAttendee}
                        variant="outline"
                        size="sm"
                        className="h-10 px-4"
                      >
                        Add
                      </Button>
                    </div>
                    {attendeeError && (
                      <p className="text-destructive text-sm">{attendeeError}</p>
                    )}
                    {field.value && field.value?.length && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {field.value.map((attendee) => (
                          <div
                            key={attendee}
                            className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs sm:text-sm"
                          >
                            <span className="truncate max-w-[200px]">
                              {attendee}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeAttendee(attendee)}
                              className="ml-1 text-muted-foreground hover:text-foreground text-sm"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <FormDescription>
                      Add attendees by their email addresses
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
                    {meeting ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  `${meeting ? "Update" : "Create"}`
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}