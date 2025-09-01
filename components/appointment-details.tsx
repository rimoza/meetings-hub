'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Mail,
  // Phone,
  ArrowLeft,
  FileText,
  Timer,
  AlertCircle,
  Printer,
} from 'lucide-react';
import { format } from 'date-fns';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { useAppointments } from '@/hooks/use-appointments';
import AppointmentForm from './appointment-form';
import { AppointmentPrintPreview } from './appointment-print-preview';
import { toast } from 'sonner';

interface AppointmentDetailsProps {
  appointmentId: string;
}

const statusConfig = {
  scheduled: { label: 'Scheduled', variant: 'secondary' as const, icon: Calendar, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  confirmed: { label: 'Confirmed', variant: 'default' as const, icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
  cancelled: { label: 'Cancelled', variant: 'destructive' as const, icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
  completed: { label: 'Completed', variant: 'default' as const, icon: CheckCircle, color: 'text-green-700', bgColor: 'bg-green-50' },
  'no-show': { label: 'No Show', variant: 'outline' as const, icon: XCircle, color: 'text-orange-600', bgColor: 'bg-orange-50' },
};

export default function AppointmentDetails({ appointmentId }: AppointmentDetailsProps) {
  const router = useRouter();
  const { appointments, updateAppointment, deleteAppointment, isLoading } = useAppointments();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  useEffect(() => {
    const found = appointments.find(apt => apt.id === appointmentId);
    setAppointment(found || null);
  }, [appointments, appointmentId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="h-64 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-48 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center space-y-4">
          <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground" />
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Appointment Not Found</h1>
            <p className="text-muted-foreground">
              The appointment you&apos;re looking for doesn&apos;t exist or may have been deleted.
            </p>
          </div>
          <Button onClick={() => router.push('/appointments')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Appointments
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[appointment.status];
  const StatusIcon = statusInfo.icon;

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    try {
      // If confirming this appointment, unconfirm all others first
      if (newStatus === 'confirmed') {
        const currentlyConfirmed = appointments.filter(apt => 
          apt.status === 'confirmed' && apt.id !== appointment.id
        );
        
        // Unconfirm all previously confirmed appointments in parallel
        await Promise.all(
          currentlyConfirmed.map(apt => updateAppointment(apt.id, { status: 'scheduled' }))
        );
      }
      
      await updateAppointment(appointment.id, { status: newStatus });
      toast.success(`Appointment ${newStatus === 'completed' ? 'completed' : newStatus}`);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAppointment(appointment.id);
      toast.success('Appointment deleted successfully');
      router.push('/appointments');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to delete appointment');
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
      const date = new Date(dateString);
      return format(date, 'EEEE, MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const getAppointmentDateTime = () => {
    return new Date(`${appointment.date} ${appointment.time}`);
  };

  const isUpcoming = () => {
    const appointmentDateTime = getAppointmentDateTime();
    return appointmentDateTime > new Date() && appointment.status !== 'cancelled' && appointment.status !== 'completed';
  };

  const isPast = () => {
    const appointmentDateTime = getAppointmentDateTime();
    return appointmentDateTime < new Date();
  };

  const getTimeUntilAppointment = () => {
    const appointmentDateTime = getAppointmentDateTime();
    const now = new Date();
    const diff = appointmentDateTime.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{appointment.title}</h1>
            <p className="text-muted-foreground">Appointment Details</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge 
            variant={statusInfo.variant} 
            className={`gap-2 px-3 py-1 ${statusInfo.bgColor} ${statusInfo.color} border-0`}
          >
            <StatusIcon className="h-4 w-4" />
            {statusInfo.label}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <AppointmentForm
                appointment={appointment}
                onSubmit={async (updates) => {
                  await updateAppointment(appointment.id, updates);
                  toast.success('Appointment updated successfully');
                }}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Appointment
                  </DropdownMenuItem>
                }
              />
              
              <DropdownMenuSeparator />
              
              {appointment.status !== 'confirmed' && (
                <DropdownMenuItem onClick={() => handleStatusChange('confirmed')}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Confirmed
                </DropdownMenuItem>
              )}
              
              {appointment.status !== 'completed' && !isPast() && (
                <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Completed
                </DropdownMenuItem>
              )}
              
              {appointment.status !== 'cancelled' && (
                <DropdownMenuItem onClick={() => handleStatusChange('cancelled')}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Appointment
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              {appointment.attendeeEmail && (
                <DropdownMenuItem
                  onClick={() => window.open(`mailto:${appointment.attendeeEmail}`, '_blank')}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem onClick={() => setShowPrintPreview(true)}>
                <Printer className="mr-2 h-4 w-4" />
                Print Card
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Appointment
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &quot;{appointment.title}&quot;? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Date</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{formatDate(appointment.date)}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Time</div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{formatTime(appointment.time)}</span>
                    {appointment.duration && (
                      <span className="text-muted-foreground">({appointment.duration} min)</span>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Attendee Information */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-muted-foreground">Attendee</div>
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-medium text-lg">{appointment.attendee}</div>
                    {appointment.attendeeEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={`mailto:${appointment.attendeeEmail}`}
                          className="text-primary hover:underline"
                        >
                          {appointment.attendeeEmail}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location */}
              {appointment.location && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Location</div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>{appointment.location}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Description */}
              {appointment.description && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Description</div>
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="text-sm leading-relaxed">{appointment.description}</div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Timing Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Timing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isUpcoming() && (
                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="text-sm font-medium">Time Until Appointment</div>
                  <div className="text-lg font-semibold text-primary">
                    {getTimeUntilAppointment()}
                  </div>
                </div>
              )}
              
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{appointment.duration ? `${appointment.duration} minutes` : 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="capitalize">
                    {isUpcoming() ? 'Upcoming' : isPast() ? 'Past' : 'Today'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {appointment.status === 'scheduled' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleStatusChange('confirmed')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Appointment
                </Button>
              )}
              
              {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleStatusChange('completed')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Completed
                </Button>
              )}
              
              {appointment.attendeeEmail && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(`mailto:${appointment.attendeeEmail}`, '_blank')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              )}
              
              <AppointmentForm
                appointment={appointment}
                onSubmit={async (updates) => {
                  await updateAppointment(appointment.id, updates);
                  toast.success('Appointment updated successfully');
                }}
                trigger={
                  <Button size="sm" variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Appointment
                  </Button>
                }
              />
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{format(appointment.createdAt, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span>{format(appointment.updatedAt, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reminder:</span>
                <span>{appointment.reminderSent ? 'Sent' : 'Pending'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print Preview Modal */}
      <AppointmentPrintPreview
        appointments={[appointment]}
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
      />
    </div>
  );
}