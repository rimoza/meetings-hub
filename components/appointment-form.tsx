'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Calendar, Plus, Clock, Users, Phone, MapPin, FileText } from 'lucide-react';
import { Appointment, AppointmentStatus } from '@/types/appointment';

// Zod schema for appointment form validation
const appointmentFormSchema = z.object({
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
  time: z.string()
    .min(1, { message: "Time is required" })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Invalid time format" }),
  status: z.enum(["scheduled", "confirmed", "cancelled", "completed", "no-show"] as const),
  duration: z.number()
    .min(5, { message: "Duration must be at least 5 minutes" })
    .max(480, { message: "Duration cannot exceed 8 hours (480 minutes)" }),
  attendeeCount: z.number()
    .min(1, { message: "At least 1 attendee is required" })
    .max(50, { message: "Cannot exceed 50 attendees" }),
  attendeePhone: z.string()
    .optional()
    .refine((phone) => {
      if (!phone) return true; // Optional field
      const phoneRegex = /^[\+]?[\s\-\(\)]*([0-9][\s\-\(\)]*){10,}$/;
      return phoneRegex.test(phone);
    }, { message: "Invalid phone number format" }),
  location: z.string()
    .max(200, { message: "Location must not exceed 200 characters" })
    .optional(),
  description: z.string()
    .max(500, { message: "Description must not exceed 500 characters" })
    .optional(),
  reminderSent: z.boolean().optional(),
  dailyNumber: z.number().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  appointment?: Partial<Appointment>;
  onSubmit: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const statusOptions: { value: AppointmentStatus; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
  { value: 'no-show', label: 'No Show' },
];

export default function AppointmentForm({ appointment, onSubmit, trigger, isOpen, onOpenChange }: Readonly<AppointmentFormProps>) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use external control when provided, otherwise use internal state
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      title: appointment?.title || '',
      date: appointment?.date || new Date().toISOString().split('T')[0],
      time: appointment?.time || '',
      status: appointment?.status || 'scheduled',
      duration: appointment?.duration || 60,
      attendeeCount: appointment?.attendeeCount || 1,
      attendeePhone: appointment?.attendeePhone || '',
      location: appointment?.location || '',
      description: appointment?.description || '',
      reminderSent: appointment?.reminderSent || false,
      dailyNumber: appointment?.dailyNumber || 0,
    },
  });

  const handleSubmitForm = async (data: AppointmentFormData) => {
    setIsSubmitting(true);

    try {
      await onSubmit({
        ...data,
        attendeePhone: data.attendeePhone || '',
        location: data.location || '',
        description: data.description || '',
        reminderSent: data.reminderSent || false,
        dailyNumber: data.dailyNumber || 0,
      });
      setOpen(false);
      
      // Reset form if creating new appointment
      if (!appointment?.id) {
        form.reset({
          title: '',
          date: new Date().toISOString().split('T')[0],
          time: '',
          status: 'scheduled',
          duration: 60,
          attendeeCount: 1,
          attendeePhone: '',
          location: '',
          description: '',
          reminderSent: false,
          dailyNumber: 0,
        });
      }
    } catch (error) {
      console.error('Error submitting appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultTrigger = (
    <Button size="sm" className="gap-2">
      <Plus className="h-4 w-4" />
      New Appointment
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {appointment?.id ? 'Edit Appointment' : 'New Appointment'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground border-b pb-2">
                <Calendar className="h-4 w-4" />
                Appointment Details
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter appointment title"
                          className="h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Date *</FormLabel>
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
                        <FormLabel className="text-sm font-medium">Time *</FormLabel>
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
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Status *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 w-full text-sm">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="w-full">
                            {statusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Duration & Attendees Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground border-b pb-2">
                <Clock className="h-4 w-4" />
                Duration & Attendees
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        Duration (minutes) *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="5"
                          max="480"
                          placeholder="Enter duration in minutes"
                          className="h-10"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Appointment duration (5 minutes - 8 hours)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="attendeeCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        Number of Attendees *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="50"
                          placeholder="1"
                          className="h-10"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum 50 attendees
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Contact & Location Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground border-b pb-2">
                <Phone className="h-4 w-4" />
                Contact & Location
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="attendeePhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        Contact Phone
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="e.g., +1 (555) 123-4567"
                          className="h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional contact number for the appointment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        Location
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Meeting room, address, or video link"
                          className="h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground border-b pb-2">
                <FileText className="h-4 w-4" />
                Additional Information
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add agenda, notes, or special requirements..."
                        rows={3}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional notes or agenda for the appointment
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t bg-muted/20 -mx-6 -mb-6 px-6 pb-6 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)} 
                className="px-6"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    {appointment?.id ? 'Update' : 'Create'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}