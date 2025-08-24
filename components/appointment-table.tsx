'use client';

import { useState } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  MoreHorizontal, 
  Search, 
  Calendar, 
  Clock, 
  User,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Phone
} from 'lucide-react';
import { format } from 'date-fns';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import AppointmentForm from './appointment-form';

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
  completed: { label: 'Completed', variant: 'success' as const, icon: CheckCircle },
  'no-show': { label: 'No Show', variant: 'outline' as const, icon: XCircle },
};

export default function AppointmentTable({ 
  appointments, 
  onUpdate, 
  onDelete, 
  isLoading = false 
}: AppointmentTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.attendee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      '';

    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;

    let matchesDate = true;
    if (dateFilter !== 'all') {
      const today = new Date();
      const appointmentDate = new Date(appointment.date);
      
      switch (dateFilter) {
        case 'today':
          matchesDate = appointmentDate.toDateString() === today.toDateString();
          break;
        case 'week':
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          matchesDate = appointmentDate >= today && appointmentDate <= weekFromNow;
          break;
        case 'month':
          const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
          matchesDate = appointmentDate >= today && appointmentDate <= monthFromNow;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleQuickStatusChange = async (appointment: Appointment, newStatus: AppointmentStatus) => {
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
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(statusConfig).map(([status, config]) => (
              <SelectItem key={status} value={status}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Attendee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No appointments found
                </TableCell>
              </TableRow>
            ) : (
              filteredAppointments.map((appointment) => {
                const statusInfo = statusConfig[appointment.status];
                const StatusIcon = statusInfo.icon;
                
                return (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{appointment.title}</div>
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
                      <Badge variant={statusInfo.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {appointment.location || 'No location set'}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
                              onClick={() => handleQuickStatusChange(appointment, 'confirmed')}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Confirmed
                            </DropdownMenuItem>
                          )}
                          
                          {appointment.status !== 'completed' && (
                            <DropdownMenuItem
                              onClick={() => handleQuickStatusChange(appointment, 'completed')}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Completed
                            </DropdownMenuItem>
                          )}
                          
                          {appointment.attendeeEmail && (
                            <DropdownMenuItem
                              onClick={() => window.open(`mailto:${appointment.attendeeEmail}`, '_blank')}
                            >
                              <Phone className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                          )}
                          
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
                                  Are you sure you want to delete "{appointment.title}"? This action cannot be undone.
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
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {filteredAppointments.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredAppointments.length} of {appointments.length} appointments
        </div>
      )}
    </div>
  );
}