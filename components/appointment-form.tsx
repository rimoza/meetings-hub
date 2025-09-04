'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Calendar, Plus, Clock, Users, Phone, MapPin, FileText } from 'lucide-react';
import { Appointment, AppointmentStatus } from '@/types/appointment';

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
  const [formData, setFormData] = useState({
    title: appointment?.title || '',
    date: appointment?.date || '',
    time: appointment?.time || '',
    status: appointment?.status || 'scheduled' as AppointmentStatus,
    attendeeCount: appointment?.attendeeCount || 1,
    attendeePhone: appointment?.attendeePhone || '',
    duration: appointment?.duration || 0,
    location: appointment?.location || '',
    description: appointment?.description || '',
    reminderSent: appointment?.reminderSent || false,
    dailyNumber: appointment?.dailyNumber || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      setOpen(false);
      // Reset form if creating new appointment
      if (!appointment?.id) {
        setFormData({
          title: '',
          date: '',
          time: '',
          status: 'scheduled',
          attendeeCount: 1,
          attendeePhone: '',
          duration: 0,
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

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {appointment?.id ? 'Edit Appointment' : 'New Appointment'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground border-b pb-2">
              <Calendar className="h-4 w-4" />
              Appointment Details
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter appointment title"
                  className="mt-1"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date" className="text-sm font-medium">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="time" className="text-sm font-medium">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Duration & Attendees Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground border-b pb-2">
              <Clock className="h-4 w-4" />
              Duration & Attendees
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration" className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Duration (minutes) *
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration === 0 ? '' : formData.duration}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      handleInputChange('duration', 0);
                    } else {
                      const numValue = parseInt(value);
                      if (!isNaN(numValue)) {
                        handleInputChange('duration', numValue);
                      }
                    }
                  }}
                  min="1"
                  step="1"
                  placeholder="Enter duration in minutes"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="attendeeCount" className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  Number of Attendees
                </Label>
                <Input
                  id="attendeeCount"
                  type="number"
                  value={formData.attendeeCount}
                  onChange={(e) => handleInputChange('attendeeCount', parseInt(e.target.value) || 1)}
                  min="1"
                  max="50"
                  placeholder="1"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Contact & Location Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground border-b pb-2">
              <Phone className="h-4 w-4" />
              Contact & Location
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="attendeePhone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  Contact Phone
                </Label>
                <Input
                  id="attendeePhone"
                  type="tel"
                  value={formData.attendeePhone}
                  onChange={(e) => handleInputChange('attendeePhone', e.target.value)}
                  placeholder="e.g., +1 (555) 123-4567"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Meeting room, address, or video link"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground border-b pb-2">
              <FileText className="h-4 w-4" />
              Additional Information
            </div>
            
            <div>
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Add agenda, notes, or special requirements..."
                rows={3}
                className="mt-1 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t bg-muted/20 -mx-6 -mb-6 px-6 pb-6 mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="px-6">
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
                  {appointment?.id ? 'Update Appointment' : 'Create Appointment'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}