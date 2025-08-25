'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Calendar, ChevronRight, Zap, Star, CheckCircle, Timer } from 'lucide-react';
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
}

export default function AppointmentQueue() {
  const { appointments, isLoading } = useAppointments();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentAppointment, setCurrentAppointment] = useState<QueuedAppointment | null>(null);
  const [nextAppointment, setNextAppointment] = useState<QueuedAppointment | null>(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, []);

  // Process appointments to find current and next
  useEffect(() => {
    if (!appointments.length) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Get today's appointments, confirmed or scheduled only
    const todaysAppointments = appointments
      .filter(apt => 
        apt.date === today && 
        (apt.status === 'confirmed' || apt.status === 'scheduled')
      )
      .sort((a, b) => a.time.localeCompare(b.time));

    if (todaysAppointments.length === 0) {
      setCurrentAppointment(null);
      setNextAppointment(null);
      return;
    }

    const currentTimeString = format(now, 'HH:mm');
    
    // Find current and next appointments
    let current: Appointment | null = null;
    let next: Appointment | null = null;

    for (let i = 0; i < todaysAppointments.length; i++) {
      const apt = todaysAppointments[i];
      const aptTime = apt.time;
      
      // Calculate appointment end time
      const [hours, minutes] = aptTime.split(':').map(Number);
      const aptStart = new Date(now);
      aptStart.setHours(hours, minutes, 0, 0);
      
      const aptEnd = new Date(aptStart);
      aptEnd.setMinutes(aptStart.getMinutes() + (apt.duration || 30));
      
      const aptEndString = format(aptEnd, 'HH:mm');

      // Check if appointment is currently active
      if (aptTime <= currentTimeString && currentTimeString <= aptEndString) {
        current = apt;
        next = todaysAppointments[i + 1] || null;
        break;
      }
      
      // If we haven't found a current appointment and this one is in the future
      if (aptTime > currentTimeString && !current) {
        next = apt;
        break;
      }
    }

    // If no current appointment, the next upcoming one becomes "next"
    if (!current && todaysAppointments.length > 0) {
      const upcoming = todaysAppointments.find(apt => apt.time > currentTimeString);
      next = upcoming || null;
    }

    setCurrentAppointment(current ? {
      id: current.id,
      attendee: current.attendee,
      title: current.title,
      time: current.time,
      status: current.status
    } : null);

    setNextAppointment(next ? {
      id: next.id,
      attendee: next.attendee,
      title: next.title,
      time: next.time,
      status: next.status,
      isNext: true
    } : null);
  }, [appointments, currentTime]);

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
    <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-400 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl animate-pulse animation-delay-2000"></div>
      </div>
      
      {/* Header */}
      <div className="text-center py-8 flex-shrink-0 relative z-10">
        <div className="relative inline-block">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6 animate-gradient-text">
            ⚡ Appointment Queue ⚡
          </h1>
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400/20 via-blue-400/20 to-purple-400/20 blur-lg rounded-lg"></div>
        </div>
        <div className="text-2xl md:text-4xl lg:text-5xl text-white font-medium mb-2">
          {format(currentTime, 'EEEE, MMMM d, yyyy')}
        </div>
        <div className="relative inline-block">
          <div className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-emerald-300 to-blue-300 bg-clip-text text-transparent">
            {format(currentTime, 'h:mm:ss a')}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-300/30 to-blue-300/30 blur-md rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8 relative z-10">
        {!currentAppointment && !nextAppointment ? (
          <div className="text-center">
            <div className="relative mb-8">
              <Calendar className="mx-auto h-24 md:h-32 lg:h-40 w-24 md:w-32 lg:w-40 text-emerald-400 animate-bounce" />
              <div className="absolute inset-0 bg-emerald-400/20 blur-2xl rounded-full animate-pulse"></div>
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">No Appointments Today</h2>
            <p className="text-2xl md:text-3xl lg:text-4xl text-gray-300">Please check back later or contact reception.</p>
          </div>
        ) : (
          <div className="w-full h-full relative">
            {/* Current Appointment - Full Screen */}
            {currentAppointment ? (
              <div className="w-full h-full flex items-center justify-center">
                <Card className="shadow-2xl border-0 bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-sm w-full max-w-7xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10"></div>
                  <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-center py-12 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20 animate-pulse"></div>
                    <CardTitle className="text-5xl md:text-7xl lg:text-8xl font-bold flex items-center justify-center gap-6 relative z-10">
                      <div className="relative">
                        <User className="h-12 md:h-20 lg:h-24 w-12 md:w-20 lg:w-24 animate-pulse" />
                        <div className="absolute inset-0 bg-white/30 rounded-full blur-md animate-ping"></div>
                      </div>
                      <span className="bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">Now Seeing</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-16 md:p-20 text-center">
                    <div className="space-y-10 animate-fade-in">
                      <div className="relative">
                        <div className="text-6xl md:text-8xl lg:text-9xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6 animate-pulse">
                          #{currentAppointment.id.slice(-4).toUpperCase()}
                        </div>
                        <div className="relative inline-block">
                          <Badge variant="default" className="text-2xl md:text-3xl lg:text-4xl px-10 py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 transition-all duration-300 shadow-lg">
                            {currentAppointment.status === 'confirmed' ? '✓ Confirmed' : '⏱ Scheduled'}
                          </Badge>
                          <div className="absolute inset-0 bg-emerald-400/30 blur-md rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <div>
                        <div className="text-5xl md:text-7xl lg:text-8xl font-semibold bg-gradient-to-r from-gray-700 to-gray-500 bg-clip-text text-transparent mb-6">
                          {currentAppointment.attendee}
                        </div>
                        <div className="text-3xl md:text-4xl lg:text-5xl text-gray-500 mb-8 italic">
                          {currentAppointment.title}
                        </div>
                        <div className="flex items-center justify-center text-3xl md:text-4xl lg:text-5xl text-gray-600 bg-gray-100/80 rounded-full px-12 py-6 shadow-lg inline-flex">
                          <div className="relative mr-4">
                            <Clock className="h-10 md:h-12 lg:h-14 w-10 md:w-12 lg:w-14 animate-spin" style={{animationDuration: '8s'}} />
                            <div className="absolute inset-0 bg-emerald-400/20 blur-sm rounded-full animate-pulse"></div>
                          </div>
                          <span className="font-semibold">{formatTime(currentAppointment.time)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="py-16 animate-pulse text-center">
                  <div className="text-4xl md:text-6xl lg:text-7xl text-gray-500 mb-6">No Current Appointment</div>
                  <div className="text-2xl md:text-3xl lg:text-4xl text-gray-400">Waiting for next appointment</div>
                </div>
              </div>
            )}

            {/* Next Appointment - Corner */}
            {nextAppointment && (
              <div className="absolute bottom-8 right-8 w-96 animate-fade-in">
                <Card className="shadow-2xl border-0 bg-gradient-to-br from-white/98 to-gray-50/98 backdrop-blur-sm relative overflow-hidden hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-center py-4 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse"></div>
                    <CardTitle className="text-xl font-bold flex items-center justify-center gap-2 relative z-10">
                      <ChevronRight className="h-5 w-5" />
                      <span>Up Next</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 text-center relative z-10">
                    <div className="space-y-3">
                      <div className="text-2xl font-bold text-gray-800">
                        #{nextAppointment.id.slice(-4).toUpperCase()}
                      </div>
                      <div className="text-xl font-semibold text-gray-700">
                        {nextAppointment.attendee}
                      </div>
                      <div className="text-sm text-gray-500 italic">
                        {nextAppointment.title}
                      </div>
                      <div className="flex items-center justify-center text-lg text-gray-600 bg-gray-100/80 rounded-full px-4 py-2">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="font-medium">{formatTime(nextAppointment.time)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-gradient-to-r from-white/90 to-gray-100/90 backdrop-blur-sm rounded-2xl shadow-2xl px-8 py-4 border border-white/20 animate-pulse">
            <p className="text-xl md:text-2xl lg:text-3xl bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent font-medium">
              📞 For assistance, please contact reception
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}