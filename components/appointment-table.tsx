'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Calendar, 
  Clock, 
  User,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Appointment, AppointmentStatus } from '@/types/appointment';

interface AppointmentTableProps {
  appointments: Appointment[];
  onUpdate: (id: string, updates: Partial<Appointment>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

const statusConfig = {
  scheduled: { label: 'Scheduled', variant: 'secondary' as const, icon: Calendar },
  confirmed: { label: 'Confirmed', variant: 'default' as const, icon: CheckCircle },
  cancelled: { label: 'Cancelled', variant: 'destructive' as const, icon: XCircle },
  completed: { label: 'Completed', variant: 'default' as const, icon: CheckCircle },
  'no-show': { label: 'No Show', variant: 'outline' as const, icon: XCircle },
};

export default function AppointmentTable({ 
  appointments, 
  onUpdate, 
  // onDelete, 
  isLoading = false 
}: Readonly<AppointmentTableProps>) {
  const [confirmedAppointmentId, setConfirmedAppointmentId] = useState<string | null>(null);

  // Initialize the confirmed appointment from existing data
  useEffect(() => {
    const confirmed = appointments.find(apt => apt.status === 'confirmed');
    if (confirmed) {
      setConfirmedAppointmentId(confirmed.id);
    }
  }, [appointments]);

  const handleQuickStatusChange = async (appointment: Appointment, newStatus: AppointmentStatus) => {
    try {
      await onUpdate(appointment.id, { status: newStatus });
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const handleConfirmationToggle = async (appointment: Appointment, checked: boolean) => {
    try {
      if (checked) {
        // First, find all currently confirmed appointments and unconfirm them
        const currentlyConfirmed = appointments.filter(apt => 
          apt.status === 'confirmed' && apt.id !== appointment.id
        );
        
        // Unconfirm all previously confirmed appointments in parallel
        await Promise.all(
          currentlyConfirmed.map(apt => onUpdate(apt.id, { status: 'scheduled' }))
        );
        
        // Then confirm the new appointment
        await onUpdate(appointment.id, { status: 'confirmed' });
        setConfirmedAppointmentId(appointment.id);
      } else {
        // Unconfirm the appointment
        await onUpdate(appointment.id, { status: 'scheduled' });
        if (confirmedAppointmentId === appointment.id) {
          setConfirmedAppointmentId(null);
        }
      }
    } catch (error) {
      console.error('Error toggling appointment confirmation:', error);
    }
  };

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, 'h:mm a');
    } catch {
      return time;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">#</TableHead>
              <TableHead className="w-[100px]">Confirm</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Attendee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No appointments found
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appointment) => {
                const statusInfo = statusConfig[appointment.status];
                const StatusIcon = statusInfo.icon;
                
                return (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-semibold text-center">
                      00{appointment.dailyNumber}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={appointment.status === 'confirmed'}
                        onCheckedChange={(checked) => handleConfirmationToggle(appointment, checked)}
                        disabled={appointment.status === 'completed' || appointment.status === 'cancelled'}
                        aria-label="Confirm appointment"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <Link 
                          href={`/appointments/${appointment.id}`}
                          className="font-semibold hover:underline hover:text-primary transition-colors"
                        >
                          {appointment.title}
                        </Link>
                        {appointment.duration && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {appointment.duration}min
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDate(appointment.date)}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTime(appointment.time)}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="font-medium">{appointment.attendee}</span>
                        </div>
                        {appointment.attendeeEmail && (
                          <div className="text-sm text-muted-foreground">
                            {appointment.attendeeEmail}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
                            <Badge variant={statusInfo.variant} className="gap-1 cursor-pointer hover:opacity-80">
                              <StatusIcon className="h-3 w-3" />
                              {statusInfo.label}
                            </Badge>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem
                            onClick={() => handleQuickStatusChange(appointment, 'scheduled')}
                            disabled={appointment.status === 'scheduled'}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Scheduled
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleQuickStatusChange(appointment, 'confirmed')}
                            disabled={appointment.status === 'confirmed'}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirmed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleQuickStatusChange(appointment, 'completed')}
                            disabled={appointment.status === 'completed'}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleQuickStatusChange(appointment, 'cancelled')}
                            disabled={appointment.status === 'cancelled'}
                            className="text-destructive focus:text-destructive"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelled
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleQuickStatusChange(appointment, 'no-show')}
                            disabled={appointment.status === 'no-show'}
                            className="text-destructive focus:text-destructive"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            No Show
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {appointment.location || 'No location set'}
                      </div>
                    </TableCell>
                    
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}