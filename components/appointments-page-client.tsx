'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ViewToggle } from '@/components/view-toggle';
import { Search, Plus, Calendar, Users, CheckCircle, Clock, Printer } from 'lucide-react';
import AppointmentForm from './appointment-form';
import AppointmentTable from './appointment-table';
import AppointmentCard from './appointment-card';
import { useAppointments } from '@/hooks/use-appointments';
import { usePrintAppointment } from '@/hooks/use-print-appointment';
import { useAutoPrint } from '@/hooks/use-auto-print';
import { appointmentsService } from '@/lib/firebase/appointments';
import { Appointment, ViewMode as AppointmentViewMode } from '@/types/appointment';
import { AppointmentPrintPreview } from './appointment-print-preview';
import { PrintService } from '@/lib/services/print-service';
import { toast } from 'sonner';

export default function AppointmentsPageClient() {
  const {
    appointments,
    isLoading,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getTodaysAppointments,
    getUpcomingAppointments,
    getAppointmentsByStatus,
  } = useAppointments();

  const {
    showPreview,
    selectedAppointments,
    printBatch,
    closePreview,
  } = usePrintAppointment();

  const { triggerAutoPrint } = useAutoPrint();

  // Debug logging
  console.log('Appointments page - isLoading:', isLoading, 'appointments count:', appointments.length);

  // Wrapper function to handle the return type mismatch and auto-print
  const handleCreateAppointment = async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const createdAppointmentId = await createAppointment(appointment);
    
    // Trigger auto-print if the appointment was created successfully
    if (createdAppointmentId && appointment.status === 'scheduled') {
      // We need to construct a full appointment object for auto-print
      const fullAppointment: Appointment = {
        ...appointment,
        id: typeof createdAppointmentId === 'string' ? createdAppointmentId : 'temp-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Trigger auto-print with a slight delay to ensure the appointment is fully processed
      setTimeout(() => {
        triggerAutoPrint(fullAppointment);
      }, 500);
    }
  };

  const [isMigrating, setIsMigrating] = useState(false);
  const handleMigration = async () => {
    setIsMigrating(true);
    try {
      console.log('🔧 Starting migration...');
      await appointmentsService.migrateDailyNumbers();
      toast.success('Daily numbers migration completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
      toast.error('Migration failed. Check console for details.');
    } finally {
      setIsMigrating(false);
    }
  };

  const [viewMode, setViewMode] = useState<AppointmentViewMode>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [printFilter, setPrintFilter] = useState<string>('all');

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
        case 'upcoming':
          matchesDate = appointmentDate >= today && 
                      appointment.status !== 'cancelled' && 
                      appointment.status !== 'completed';
          break;
      }
    }

    let matchesPrint = true;
    if (printFilter !== 'all') {
      const wasPrinted = PrintService.wasAppointmentPrinted(appointment.id);
      matchesPrint = printFilter === 'printed' ? wasPrinted : !wasPrinted;
    }

    return matchesSearch && matchesStatus && matchesDate && matchesPrint;
  });

  // Statistics
  const todaysAppointments = getTodaysAppointments();
  const upcomingAppointments = getUpcomingAppointments();
  const confirmedAppointments = getAppointmentsByStatus('confirmed');
  const completedAppointments = getAppointmentsByStatus('completed');

  const stats = [
    {
      title: "Today's Appointments",
      value: todaysAppointments.length,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Upcoming',
      value: upcomingAppointments.length,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Confirmed',
      value: confirmedAppointments.length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Completed',
      value: completedAppointments.length,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">
            Manage your appointments and schedule
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          {filteredAppointments.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => printBatch(filteredAppointments)}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print ({filteredAppointments.length})
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMigration} 
            disabled={isMigrating}
            className="gap-2"
          >
            <Clock className="h-4 w-4" />
            {isMigrating ? 'Migrating...' : 'Fix Numbers'}
          </Button>
          <AppointmentForm onSubmit={handleCreateAppointment} />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no-show">No Show</SelectItem>
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
            <SelectItem value="upcoming">Upcoming</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={printFilter} onValueChange={setPrintFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by print status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cards</SelectItem>
            <SelectItem value="printed">Printed</SelectItem>
            <SelectItem value="not-printed">Not Printed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="grid gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
            <p className="text-muted-foreground mb-4">
              {appointments.length === 0
                ? "Get started by creating your first appointment"
                : "No appointments match your current filters"}
            </p>
            <AppointmentForm 
              onSubmit={handleCreateAppointment}
              trigger={
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Appointment
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {viewMode === 'table' ? (
              <AppointmentTable
                appointments={filteredAppointments}
                onUpdate={updateAppointment}
                onDelete={deleteAppointment}
                isLoading={isLoading}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onUpdate={updateAppointment}
                    onDelete={deleteAppointment}
                  />
                ))}
              </div>
            )}
            
            <div className="text-sm text-muted-foreground text-center">
              Showing {filteredAppointments.length} of {appointments.length} appointments
            </div>
          </>
        )}
      </div>

      {/* Print Preview Modal */}
      <AppointmentPrintPreview
        appointments={selectedAppointments}
        isOpen={showPreview}
        onClose={closePreview}
      />
    </div>
  );
}