'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
  // Phone,
  Mail,
  Eye,
  Printer
} from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import AppointmentForm from './appointment-form';
import { usePrintAppointment } from '@/hooks/use-print-appointment';
import { AppointmentPrintPreview } from './appointment-print-preview';

interface AppointmentCardProps {
  appointment: Appointment;
  onUpdate: (id: string, updates: Partial<Appointment>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const statusConfig = {
  scheduled: { label: 'Scheduled', variant: 'secondary' as const, icon: Calendar, color: 'text-blue-600' },
  confirmed: { label: 'Confirmed', variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
  cancelled: { label: 'Cancelled', variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
  completed: { label: 'Completed', variant: 'default' as const, icon: CheckCircle, color: 'text-green-700' },
  'no-show': { label: 'No Show', variant: 'outline' as const, icon: XCircle, color: 'text-orange-600' },
};

export default function AppointmentCard({ appointment, onUpdate, onDelete }: AppointmentCardProps) {
  const router = useRouter();
  const statusInfo = statusConfig[appointment.status];
  const StatusIcon = statusInfo.icon;
  const { showPreview, selectedAppointments, printSingle, closePreview } = usePrintAppointment();

  const handleQuickStatusChange = async (newStatus: AppointmentStatus) => {
    try {
      await onUpdate(appointment.id, { status: newStatus });
    } catch (error) {
      console.error('Error updating appointment status:', error);
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
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      } else {
        return format(date, 'MMM d, yyyy');
      }
    } catch {
      return dateString;
    }
  };

  const isUpcoming = () => {
    const appointmentDateTime = new Date(`${appointment.date} ${appointment.time}`);
    return appointmentDateTime > new Date() && appointment.status !== 'cancelled' && appointment.status !== 'completed';
  };

  return (
    <>
    <Card 
      className={`relative transition-all duration-200 hover:shadow-md cursor-pointer ${
        isUpcoming() ? 'border-l-4 border-l-primary' : ''
      }`}
      onClick={() => router.push(`/appointments/${appointment.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Link 
              href={`/appointments/${appointment.id}`}
              className="font-semibold text-lg leading-none tracking-tight hover:underline hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {appointment.title}
            </Link>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(appointment.date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatTime(appointment.time)}</span>
              </div>
              {appointment.duration && (
                <span>({appointment.duration}min)</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={statusInfo.variant} className="gap-1">
              <StatusIcon className="h-3 w-3" />
              {statusInfo.label}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/appointments/${appointment.id}`)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                
                <AppointmentForm
                  appointment={appointment}
                  onSubmit={(updates) => onUpdate(appointment.id, updates)}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  }
                />
                
                {appointment.status !== 'confirmed' && (
                  <DropdownMenuItem
                    onClick={() => handleQuickStatusChange('confirmed')}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark Confirmed
                  </DropdownMenuItem>
                )}
                
                {appointment.status !== 'completed' && (
                  <DropdownMenuItem
                    onClick={() => handleQuickStatusChange('completed')}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark Completed
                  </DropdownMenuItem>
                )}
                
                {appointment.attendeeEmail && (
                  <DropdownMenuItem
                    onClick={() => window.open(`mailto:${appointment.attendeeEmail}`, '_blank')}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem onClick={() => printSingle(appointment)}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Card
                </DropdownMenuItem>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
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
                        onClick={() => onDelete(appointment.id)}
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
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Attendee Info */}
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <div className="font-medium">{appointment.attendee}</div>
              {appointment.attendeeEmail && (
                <div className="text-sm text-muted-foreground">
                  {appointment.attendeeEmail}
                </div>
              )}
            </div>
          </div>
          
          {/* Location */}
          {appointment.location && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-sm text-muted-foreground">
                {appointment.location}
              </div>
            </div>
          )}
          
          {/* Description */}
          {appointment.description && (
            <div className="text-sm text-muted-foreground">
              {appointment.description}
            </div>
          )}
          
          {/* Quick Actions */}
          <div className="flex items-center gap-2 pt-2">
            {appointment.status === 'scheduled' && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickStatusChange('confirmed');
                }}
                className="h-7 text-xs"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Confirm
              </Button>
            )}
            
            {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickStatusChange('completed');
                }}
                className="h-7 text-xs"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Complete
              </Button>
            )}
            
            {appointment.attendeeEmail && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`mailto:${appointment.attendeeEmail}`, '_blank');
                }}
                className="h-7 text-xs"
              >
                <Mail className="h-3 w-3 mr-1" />
                Email
              </Button>
            )}
          </div>
          
          {/* Status indicator at bottom */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                appointment.status === 'confirmed' ? 'bg-green-500' :
                appointment.status === 'scheduled' ? 'bg-blue-500' :
                appointment.status === 'completed' ? 'bg-green-600' :
                appointment.status === 'cancelled' ? 'bg-red-500' :
                'bg-orange-500'
              }`} />
              <span className={statusInfo.color}>
                {statusInfo.label}
              </span>
            </div>
            
            <div>
              {isUpcoming() && (
                <span className="text-primary font-medium">Upcoming</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Print Preview Modal */}
    <AppointmentPrintPreview
      appointments={selectedAppointments}
      isOpen={showPreview}
      onClose={closePreview}
    />
    </>
  );
}