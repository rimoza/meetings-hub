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
import { Search, Plus, Calendar, Users, CheckCircle, Clock, Printer, CalendarDays, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import AppointmentForm from './appointment-form';
import AppointmentTable from './appointment-table';
import AppointmentCard from './appointment-card';
import { useAppointments } from '@/hooks/use-appointments';
import { usePrintAppointment } from '@/hooks/use-print-appointment';
import { useAutoPrint } from '@/hooks/use-auto-print';
// import { appointmentsService } from '@/lib/firebase/appointments';
import { Appointment, ViewMode as AppointmentViewMode } from '@/types/appointment';
import { AppointmentPrintPreview } from './appointment-print-preview';
import { PrintService } from '@/lib/services/print-service';
// import { toast } from 'sonner';

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

  const [viewMode, setViewMode] = useState<AppointmentViewMode>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [printFilter, setPrintFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'past'>('today');

  // Categorize appointments
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const categorizeAppointments = () => {
    const todaysAppts: typeof appointments = [];
    const upcomingAppts: typeof appointments = [];
    const pastAppts: typeof appointments = [];
    
    appointments.forEach(apt => {
      const aptDateStr = apt.date;
      
      // Check if appointment is completed or cancelled - goes to past
      if (apt.status === 'completed' || apt.status === 'cancelled') {
        pastAppts.push(apt);
      } else if (aptDateStr === todayStr) {
        // Today's appointments
        todaysAppts.push(apt);
      } else if (aptDateStr > todayStr) {
        // Future appointments
        upcomingAppts.push(apt);
      } else {
        // Past date appointments
        pastAppts.push(apt);
      }
    });
    
    // Sort each category
    todaysAppts.sort((a, b) => a.time.localeCompare(b.time));
    upcomingAppts.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare === 0) {
        return a.time.localeCompare(b.time);
      }
      return dateCompare;
    });
    pastAppts.sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare === 0) {
        return b.time.localeCompare(a.time);
      }
      return dateCompare;
    });
    
    return { todaysAppts, upcomingAppts, pastAppts };
  };
  
  const { todaysAppts, upcomingAppts, pastAppts } = categorizeAppointments();
  
  // Filter appointments based on active tab and search/filter criteria
  const getFilteredAppointments = () => {
    const baseAppointments = 
      activeTab === 'today' ? todaysAppts :
      activeTab === 'upcoming' ? upcomingAppts :
      pastAppts;
    
    return baseAppointments.filter(appointment => {
      const matchesSearch = 
        appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        '';

      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;

      let matchesPrint = true;
      if (printFilter !== 'all') {
        const wasPrinted = PrintService.wasAppointmentPrinted(appointment.id);
        matchesPrint = printFilter === 'printed' ? wasPrinted : !wasPrinted;
      }

      return matchesSearch && matchesStatus && matchesPrint;
    });
  };
  
  const filteredAppointments = getFilteredAppointments();

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
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Upcoming',
      value: upcomingAppointments.length - todaysAppointments.length,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
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

  // Render appointments based on view mode
  const renderAppointments = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="grid gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      );
    }
    
    if (filteredAppointments.length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all' || printFilter !== 'all'
              ? 'No appointments match your current filters'
              : activeTab === 'today' ? 'No appointments scheduled for today'
              : activeTab === 'upcoming' ? 'No upcoming appointments'
              : 'No past appointments'}
          </p>
          {activeTab !== 'past' && (
            <AppointmentForm 
              onSubmit={handleCreateAppointment}
              trigger={
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Appointment
                </Button>
              }
            />
          )}
        </div>
      );
    }
    
    return (
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
          Showing {filteredAppointments.length} of {activeTab === 'today' ? todaysAppts.length : activeTab === 'upcoming' ? upcomingAppts.length : pastAppts.length} appointments
        </div>
      </>
    );
  };

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
          <AppointmentForm 
            onSubmit={handleCreateAppointment}
            trigger={
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New
              </Button>
            }
          />
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

      {/* Tabs for categories */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'today' | 'upcoming' | 'past')} className="w-full">
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
          <TabsList className="grid w-full lg:w-auto grid-cols-3 bg-muted/50">
            <TabsTrigger 
              value="today" 
              className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Today&apos;s
              <Badge variant="secondary" className="ml-2">
                {todaysAppts.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming"
              className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Upcoming
              <Badge variant="secondary" className="ml-2">
                {upcomingAppts.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="past"
              className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-700"
            >
              <History className="h-4 w-4 mr-2" />
              Past
              <Badge variant="secondary" className="ml-2">
                {pastAppts.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Filter status" />
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

            <Select value={printFilter} onValueChange={setPrintFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Print status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cards</SelectItem>
                <SelectItem value="printed">Printed</SelectItem>
                <SelectItem value="not-printed">Not Printed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tab Content */}
        <TabsContent value="today" className="space-y-4 mt-0">
          <div className={cn(
            "p-4 rounded-lg border",
            "bg-orange-50/50 border-orange-200"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-orange-900">Today&apos;s Appointments</h3>
            </div>
            <p className="text-sm text-orange-700">
              You have {todaysAppts.length} appointment{todaysAppts.length !== 1 ? 's' : ''} scheduled for today.
              {todaysAppts.filter(a => a.status === 'confirmed').length > 0 && 
                ` ${todaysAppts.filter(a => a.status === 'confirmed').length} confirmed.`}
            </p>
          </div>
          {renderAppointments()}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4 mt-0">
          <div className={cn(
            "p-4 rounded-lg border",
            "bg-blue-50/50 border-blue-200"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Upcoming Appointments</h3>
            </div>
            <p className="text-sm text-blue-700">
              You have {upcomingAppts.length} upcoming appointment{upcomingAppts.length !== 1 ? 's' : ''}.
              {upcomingAppts.filter(a => a.status === 'scheduled').length > 0 && 
                ` ${upcomingAppts.filter(a => a.status === 'scheduled').length} scheduled.`}
            </p>
          </div>
          {renderAppointments()}
        </TabsContent>

        <TabsContent value="past" className="space-y-4 mt-0">
          <div className={cn(
            "p-4 rounded-lg border",
            "bg-gray-50/50 border-gray-200"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <History className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Past Appointments</h3>
            </div>
            <p className="text-sm text-gray-700">
              You have {pastAppts.length} past appointment{pastAppts.length !== 1 ? 's' : ''}.
              {pastAppts.filter(a => a.status === 'completed').length > 0 && 
                ` ${pastAppts.filter(a => a.status === 'completed').length} completed.`}
              {pastAppts.filter(a => a.status === 'cancelled').length > 0 && 
                ` ${pastAppts.filter(a => a.status === 'cancelled').length} cancelled.`}
            </p>
          </div>
          {renderAppointments()}
        </TabsContent>
      </Tabs>

      {/* Print Preview Modal */}
      <AppointmentPrintPreview
        appointments={selectedAppointments}
        isOpen={showPreview}
        onClose={closePreview}
      />
    </div>
  );
}