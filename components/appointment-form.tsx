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
import { Calendar, Clock, User, Plus } from 'lucide-react';
import { Appointment, AppointmentStatus } from '@/types/appointment';

interface AppointmentFormProps {
  appointment?: Partial<Appointment>;
  onSubmit: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  trigger?: React.ReactNode;
}

const statusOptions: { value: AppointmentStatus; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
  { value: 'no-show', label: 'No Show' },
];

export default function AppointmentForm({ appointment, onSubmit, trigger }: AppointmentFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: appointment?.title || '',
    date: appointment?.date || '',
    time: appointment?.time || '',
    status: appointment?.status || 'scheduled' as AppointmentStatus,
    attendee: appointment?.attendee || '',
    attendeeEmail: appointment?.attendeeEmail || '',
    duration: appointment?.duration || 60,
    location: appointment?.location || '',
    description: appointment?.description || '',
    reminderSent: appointment?.reminderSent || false,
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
          attendee: '',
          attendeeEmail: '',
          duration: 60,
          location: '',
          description: '',
          reminderSent: false,
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
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {appointment?.id ? 'Edit Appointment' : 'New Appointment'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter appointment title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
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
            
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 60)}
                min="15"
                step="15"
              />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="attendee">Attendee *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="attendee"
                  value={formData.attendee}
                  onChange={(e) => handleInputChange('attendee', e.target.value)}
                  placeholder="Enter attendee name"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="attendeeEmail">Attendee Email</Label>
              <Input
                id="attendeeEmail"
                type="email"
                value={formData.attendeeEmail}
                onChange={(e) => handleInputChange('attendeeEmail', e.target.value)}
                placeholder="Enter attendee email"
              />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter location or meeting link"
              />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Add appointment details..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : appointment?.id ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}