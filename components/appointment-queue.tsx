'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
import { Clock, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Appointment } from '@/types/appointment';
import { useAppointments } from '@/hooks/use-appointments';

interface QueuedAppointment {
  id: string;
  attendee: string;
  title: string;
  time: string;
  status: string;
  isNext?: boolean;
  isSeeingNow?: boolean;
}

export default function AppointmentQueue() {
  const { appointments, isLoading } = useAppointments();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentAppointment, setCurrentAppointment] = useState<QueuedAppointment | null>(null);
  const [seeingAppointmentId, setSeeingAppointmentId] = useState<string | null>(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, []);

  // Monitor for status changes in the seeing appointment
  useEffect(() => {
    if (!seeingAppointmentId) return;

    const checkInterval = setInterval(() => {
      const seeingApt = appointments.find(apt => apt.id === seeingAppointmentId);
      
      // If the seeing appointment is completed or cancelled, clear it
      if (seeingApt && (seeingApt.status === 'completed' || seeingApt.status === 'cancelled')) {
        setSeeingAppointmentId(null);
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(checkInterval);
  }, [seeingAppointmentId, appointments]);

  // Process appointments to find current and next
  useEffect(() => {
    if (!appointments.length) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Get today's appointments that are not cancelled or completed
    const todaysAppointments = appointments
      .filter(apt => 
        apt.date === today && 
        apt.status !== 'cancelled' && 
        apt.status !== 'completed'
      )
      .sort((a, b) => a.time.localeCompare(b.time));

    if (todaysAppointments.length === 0) {
      setCurrentAppointment(null);
      setSeeingAppointmentId(null);
      return;
    }

    // Find the first confirmed appointment that hasn't been completed/cancelled
    const confirmedAppointments = todaysAppointments.filter(apt => apt.status === 'confirmed');
    
    let current: Appointment | null = null;

    // If we have a seeing appointment, keep it as current until completed/cancelled
    if (seeingAppointmentId) {
      const seeingApt = todaysAppointments.find(apt => apt.id === seeingAppointmentId);
      if (seeingApt && seeingApt.status !== 'completed' && seeingApt.status !== 'cancelled') {
        current = seeingApt;
      } else {
        // Seeing appointment was completed/cancelled, move to next confirmed
        setSeeingAppointmentId(null);
      }
    }

    // If no seeing appointment, find first confirmed appointment
    if (!current && confirmedAppointments.length > 0) {
      current = confirmedAppointments[0];
      setSeeingAppointmentId(current.id);
    }

    setCurrentAppointment(current ? {
      id: current.id,
      attendee: current.attendee,
      title: current.title,
      time: current.time,
      status: current.status,
      isSeeingNow: true
    } : null);
  }, [appointments, currentTime, seeingAppointmentId]);

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


  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-transparent border-t-emerald-400 border-r-blue-400 mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-32 w-32 border-4 border-emerald-400/30 mx-auto"></div>
          </div>
          <p className="mt-8 text-2xl text-white font-medium animate-pulse">Loading appointment queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-10 md:top-20 left-10 md:left-20 w-48 h-48 md:w-96 md:h-96 bg-primary rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 md:bottom-20 right-10 md:right-20 w-48 h-48 md:w-96 md:h-96 bg-primary/80 rounded-full filter blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-96 md:h-96 bg-primary/60 rounded-full filter blur-3xl animate-pulse animation-delay-2000"></div>
      </div>
      
      {/* Header */}
      {/* <header className="text-center py-3 sm:py-4 md:py-6 lg:py-8 flex-shrink-0 relative z-10 px-4 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="relative inline-block mb-2 md:mb-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent animate-gradient-text leading-tight">
              ⚡ Appointment Queue ⚡
            </h1>
            <div className="absolute -inset-2 bg-primary/10 blur-lg rounded-lg -z-10"></div>
          </div>
          <div className="space-y-1 md:space-y-2">
            <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl text-foreground/90 font-medium">
              {format(currentTime, 'EEEE, MMMM d, yyyy')}
            </div>
            <div className="relative inline-block">
              <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent tabular-nums">
                {format(currentTime, 'h:mm:ss a')}
              </div>
              <div className="absolute inset-0 bg-primary/10 blur-sm rounded-lg animate-pulse -z-10"></div>
            </div>
          </div>
        </div>
      </header> */}

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 relative z-10 py-4 sm:py-6 md:py-8 pb-24 sm:pb-28 md:pb-32">
        {!currentAppointment ? (
          <div className="text-center max-w-2xl mx-auto">
            <div className="relative mb-6 md:mb-8">
              <Calendar className="mx-auto h-16 sm:h-20 md:h-24 lg:h-32 w-16 sm:w-20 md:w-24 lg:w-32 text-emerald-400 animate-bounce" />
              <div className="absolute inset-0 bg-emerald-400/20 blur-2xl rounded-full animate-pulse"></div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4 md:mb-6">No Appointments Today</h2>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300">Please check back later or contact reception.</p>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center px-4 sm:px-6 md:px-8">
            {/* Current Appointment - Full Screen Card */}
            {currentAppointment ? (
              <Card className="">
                {/* <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10"></div> */}
                <CardHeader className="">
                  {/* <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20"></div> */}
                  <CardTitle className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-5 relative z-10">
                    <div className="relative">
                      <User className="h-8 sm:h-10 md:h-12 lg:h-14 xl:h-16 2xl:h-20 w-8 sm:w-10 md:w-12 lg:w-14 xl:w-16 2xl:w-20 animate-pulse" />
                      {/* <div className="absolute inset-0 bg-white/30 rounded-full blur-md animate-ping"></div> */}
                    </div>
                    <span className="bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">Now Seeing</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 md:p-12 lg:p-16 xl:p-20 text-center">
                  <div className="space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12 animate-fade-in">
                    <div className="relative">
                      <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent mb-4 sm:mb-6 animate-pulse">
                        #{currentAppointment.id.slice(-4).toUpperCase()}
                      </div>
                      {/* <div className="relative inline-block">
                        <Badge variant="default" className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 transition-all duration-300 shadow-lg">
                          {currentAppointment.isSeeingNow ? '👁️ Seeing Now' : currentAppointment.status === 'confirmed' ? '✓ Confirmed' : '⏱ Scheduled'}
                        </Badge>
                        <div className="absolute inset-0 bg-emerald-400/30 blur-md rounded-full animate-pulse"></div>
                      </div> */}
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4 md:mb-6">
                        {currentAppointment.attendee}
                      </div>
                      <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 md:mb-10 italic">
                        {/* {currentAppointment.title} */}
                      </div>
                      <div className="inline-flex items-center justify-center text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full px-6 sm:px-8 md:px-10 lg:px-12 py-3 sm:py-4 md:py-5 lg:py-6 shadow-lg">
                        <div className="relative mr-3 sm:mr-4">
                          <Clock className="h-6 sm:h-8 md:h-10 lg:h-12 xl:h-14 2xl:h-16 w-6 sm:w-8 md:w-10 lg:w-12 xl:w-14 2xl:w-16 animate-spin" style={{animationDuration: '8s'}} />
                          <div className="absolute inset-0 bg-emerald-400/20 blur-sm rounded-full animate-pulse"></div>
                        </div>
                        <span className="font-semibold">{formatTime(currentAppointment.time)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">No Current Appointment</div>
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-gray-400 dark:text-gray-500">Waiting for appointments</div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="fixed bottom-2 sm:bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 z-30 px-4 max-w-full">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg shadow-xl px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 border border-gray-200 dark:border-gray-700 hover:border-emerald-500/50 transition-all duration-300">
          <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium text-center tracking-wide">
            📞 For assistance, please contact reception
          </p>
        </div>
      </footer>
    </div>
  );
}