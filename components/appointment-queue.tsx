'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Calendar, ChevronRight } from 'lucide-react';
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
      <div className="h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">Loading appointment queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="text-center py-6 flex-shrink-0">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-800 mb-4">Appointment Queue</h1>
        <div className="text-2xl md:text-4xl lg:text-5xl text-gray-600 font-medium">
          {format(currentTime, 'EEEE, MMMM d, yyyy')}
        </div>
        <div className="text-3xl md:text-5xl lg:text-6xl text-blue-600 font-bold mt-2">
          {format(currentTime, 'h:mm:ss a')}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8">
        {!currentAppointment && !nextAppointment ? (
          <div className="text-center">
            <Calendar className="mx-auto h-24 md:h-32 lg:h-40 w-24 md:w-32 lg:w-40 text-gray-400 mb-8" />
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-semibold text-gray-700 mb-6">No Appointments Today</h2>
            <p className="text-2xl md:text-3xl lg:text-4xl text-gray-500">Please check back later or contact reception.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 w-full max-w-none">
            {/* Current Appointment */}
            <Card className="shadow-2xl border-0 bg-white h-full">
              <CardHeader className="bg-green-600 text-white text-center py-8">
                <CardTitle className="text-3xl md:text-5xl lg:text-6xl font-bold flex items-center justify-center gap-4">
                  <User className="h-8 md:h-12 lg:h-16 w-8 md:w-12 lg:w-16" />
                  Now Seeing
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 md:p-12 text-center flex-1 flex flex-col justify-center">
                {currentAppointment ? (
                  <div className="space-y-6 md:space-y-8">
                    <div>
                      <div className="text-4xl md:text-6xl lg:text-8xl font-bold text-gray-800 mb-4">
                        #{currentAppointment.id.slice(-4).toUpperCase()}
                      </div>
                      <Badge variant="default" className="text-lg md:text-2xl lg:text-3xl px-6 md:px-8 py-2 md:py-3">
                        {currentAppointment.status === 'confirmed' ? 'Confirmed' : 'Scheduled'}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-3xl md:text-5xl lg:text-7xl font-semibold text-gray-700 mb-4">
                        {currentAppointment.attendee}
                      </div>
                      <div className="text-2xl md:text-3xl lg:text-4xl text-gray-500 mb-6">
                        {currentAppointment.title}
                      </div>
                      <div className="flex items-center justify-center text-2xl md:text-3xl lg:text-4xl text-gray-600">
                        <Clock className="h-6 md:h-8 lg:h-10 w-6 md:w-8 lg:w-10 mr-3" />
                        {formatTime(currentAppointment.time)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-16">
                    <div className="text-2xl md:text-4xl lg:text-5xl text-gray-500 mb-6">No Current Appointment</div>
                    <div className="text-xl md:text-2xl lg:text-3xl text-gray-400">Waiting for next appointment</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next Appointment */}
            <Card className="shadow-2xl border-0 bg-white h-full">
              <CardHeader className="bg-blue-600 text-white text-center py-8">
                <CardTitle className="text-3xl md:text-5xl lg:text-6xl font-bold flex items-center justify-center gap-4">
                  <ChevronRight className="h-8 md:h-12 lg:h-16 w-8 md:w-12 lg:w-16" />
                  Up Next
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 md:p-12 text-center flex-1 flex flex-col justify-center">
                {nextAppointment ? (
                  <div className="space-y-6 md:space-y-8">
                    <div>
                      <div className="text-4xl md:text-6xl lg:text-8xl font-bold text-gray-800 mb-4">
                        #{nextAppointment.id.slice(-4).toUpperCase()}
                      </div>
                      <Badge variant="secondary" className="text-lg md:text-2xl lg:text-3xl px-6 md:px-8 py-2 md:py-3">
                        {nextAppointment.status === 'confirmed' ? 'Confirmed' : 'Scheduled'}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-3xl md:text-5xl lg:text-7xl font-semibold text-gray-700 mb-4">
                        {nextAppointment.attendee}
                      </div>
                      <div className="text-2xl md:text-3xl lg:text-4xl text-gray-500 mb-6">
                        {nextAppointment.title}
                      </div>
                      <div className="flex items-center justify-center text-2xl md:text-3xl lg:text-4xl text-gray-600">
                        <Clock className="h-6 md:h-8 lg:h-10 w-6 md:w-8 lg:w-10 mr-3" />
                        {formatTime(nextAppointment.time)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-16">
                    <div className="text-2xl md:text-4xl lg:text-5xl text-gray-500 mb-6">No Next Appointment</div>
                    <div className="text-xl md:text-2xl lg:text-3xl text-gray-400">
                      {currentAppointment ? 'Last appointment of the day' : 'No appointments scheduled'}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer Info */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="bg-white rounded-lg shadow-lg px-8 py-4">
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-600">
              For assistance, please contact reception
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}