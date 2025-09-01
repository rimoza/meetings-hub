'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Users, ChevronRight, Activity, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
// import { Appointment } from '@/types/appointment';
import { useAppointments } from '@/hooks/use-appointments';
import { cn } from '@/lib/utils';
import { formatAppointmentNumber } from '@/lib/firebase/appointments';

// Somali day names
const somaliDays = {
  Saturday: 'Sabti',
  Sunday: 'Axad',
  Monday: 'Isniin',
  Tuesday: 'Salaasa',
  Wednesday: 'Arbaco',
  Thursday: 'Khamiis',
  Friday: 'Jimce'
};

// Somali month names
const somaliMonths = {
  January: 'January',
  February: 'February',
  March: 'March',
  April: 'April',
  May: 'May',
  June: 'June',
  July: 'July',
  August: 'August',
  September: 'September',
  October: 'October',
  November: 'November',
  December: 'December'
};

// Function to format date in Somali
const formatSomaliDate = (date: Date): string => {
  const dayName = format(date, 'EEEE') as keyof typeof somaliDays;
  const monthName = format(date, 'MMMM') as keyof typeof somaliMonths;
  const dayNumber = format(date, 'd');
  
  return `${somaliDays[dayName]}, ${dayNumber} ${somaliMonths[monthName]}`;
};

interface QueuedAppointment {
  id: string;
  number: string;
  attendee: string;
  title: string;
  time: string;
  status: string;
  isNext?: boolean;
  isSeeingNow?: boolean;
  estimatedWait?: number;
}

export default function AppointmentQueue() {
  const { appointments, isLoading } = useAppointments();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentAppointment, setCurrentAppointment] = useState<QueuedAppointment | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<QueuedAppointment[]>([]);
  const [seeingAppointmentId, setSeeingAppointmentId] = useState<string | null>(null);
  const [animateNumber, setAnimateNumber] = useState(false);
  const [announcement, setAnnouncement] = useState('Welcome to our facility. We appreciate your patience.');
  
  const announcements = [
    'Welcome to our facility. We appreciate your patience.',
    'Please be ready when your number is called.',
    'Our staff is here to assist you with any questions.',
    'Thank you for visiting us today.',
    'We strive to serve you efficiently.'
  ];

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotate announcements
  useEffect(() => {
    const announcementTimer = setInterval(() => {
      setAnnouncement(prev => {
        const currentIndex = announcements.indexOf(prev);
        return announcements[(currentIndex + 1) % announcements.length];
      });
    }, 8000);
    return () => clearInterval(announcementTimer);
  }, []);

  // Monitor for status changes in the seeing appointment - real-time response
  useEffect(() => {
    if (!seeingAppointmentId) return;

    const seeingApt = appointments.find(apt => apt.id === seeingAppointmentId);
    
    // If the seeing appointment is completed or cancelled, clear it immediately
    if (seeingApt && (seeingApt.status === 'completed' || seeingApt.status === 'cancelled')) {
      setSeeingAppointmentId(null);
    }
  }, [seeingAppointmentId, appointments]);

  // Process appointments to find current and next - instant updates
  useEffect(() => {
    if (!appointments.length) {
      setCurrentAppointment(null);
      setSeeingAppointmentId(null);
      return;
    }

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

    // Create queue items
    const queueItems: QueuedAppointment[] = todaysAppointments.map((apt, index) => ({
      id: apt.id,
      number: `#${formatAppointmentNumber(apt.dailyNumber || 1)}`,
      attendee: apt.attendee,
      title: apt.title,
      time: apt.time,
      status: apt.status,
      isSeeingNow: false,
      isNext: false,
      estimatedWait: index * 15
    }));

    // Find all confirmed appointments
    const confirmedAppointments = queueItems.filter(apt => apt.status === 'confirmed');
    
    let current: QueuedAppointment | null = null;

    // Priority 1: If there's a seeing appointment that's still confirmed, keep it
    if (seeingAppointmentId) {
      const seeingApt = queueItems.find(apt => apt.id === seeingAppointmentId);
      if (seeingApt && seeingApt.status === 'confirmed') {
        current = seeingApt;
        current.isSeeingNow = true;
      } else if (seeingApt && (seeingApt.status === 'completed' || seeingApt.status === 'cancelled' || seeingApt.status === 'scheduled')) {
        setSeeingAppointmentId(null);
      }
    }

    // Priority 2: If no current seeing appointment, find the first confirmed appointment
    if (!current && confirmedAppointments.length > 0) {
      current = confirmedAppointments[0];
      current.isSeeingNow = true;
      setSeeingAppointmentId(current.id);
    }

    // Priority 3: If no confirmed appointments, clear the queue
    if (!current && confirmedAppointments.length === 0) {
      setSeeingAppointmentId(null);
    }

    // Check if current appointment changed for animation
    if (current && current.id !== currentAppointment?.id) {
      setAnimateNumber(true);
      setTimeout(() => setAnimateNumber(false), 1000);
    }

    setCurrentAppointment(current);
    
    // Set upcoming appointments (excluding current)
    const upcoming = queueItems.filter(apt => 
      apt.id !== current?.id && 
      (apt.status === 'confirmed' || apt.status === 'scheduled')
    ).slice(0, 5);
    
    if (upcoming.length > 0) {
      upcoming[0].isNext = true;
    }
    
    setUpcomingAppointments(upcoming);
  }, [appointments, seeingAppointmentId]); // Removed currentTime dependency for faster updates

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
      <div className="h-screen w-screen bg-gradient-to-br from-teal-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-transparent border-t-teal-500 border-r-blue-500 mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-32 w-32 border-4 border-teal-400/30 mx-auto"></div>
          </div>
          <p className="mt-8 text-2xl text-gray-700 font-medium animate-pulse">Loading appointment queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex flex-col overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Header with branding */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Activity className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                <div>Xafiiska Guddoomiyaha</div>
              </h1>
              <p className="text-2xl text-gray-600">Ballamaha dadweynaha</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold text-gray-700">
              {formatSomaliDate(currentTime)}
            </div>
            <div className="text-4xl font-bold text-teal-600 tabular-nums">
              {format(currentTime, 'h:mm:ss a')}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex relative z-10">
        {/* Left side - Current serving number */}
        <div className="flex-1 flex items-center justify-center p-12">
          {!currentAppointment ? (
            <div className="text-center">
              <Calendar className="w-32 h-32 text-gray-300 mx-auto mb-8 animate-pulse" />
              <h2 className="text-4xl font-semibold text-gray-400 mb-4">No Active Queue</h2>
              <p className="text-xl text-gray-500">Please check with reception</p>
            </div>
          ) : (
            <div className={cn(
              "text-center transition-all duration-1000",
              animateNumber && "animate-slideUp"
            )}>
              <div className="mb-8">
                <span className="text-2xl font-medium text-gray-600 uppercase tracking-wider">
                  Now Serving
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-400 blur-3xl opacity-30 animate-pulse"></div>
                <div className={cn(
                  "relative bg-white rounded-3xl shadow-2xl p-16 border-4 border-teal-100",
                  animateNumber && "animate-scaleIn"
                )}>
                  <div className="text-9xl font-bold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
                    {currentAppointment.number}
                  </div>
                  <div className="mt-8 text-3xl font-semibold text-gray-700">
                    {currentAppointment.attendee}
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2 text-xl text-gray-600">
                    <Clock className="w-6 h-6" />
                    <span>{formatTime(currentAppointment.time)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right side - Upcoming queue */}
        <div className="w-1/3 bg-white/60 backdrop-blur-sm border-l border-gray-200 p-8 overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Users className="w-8 h-8 text-teal-500" />
              Upcoming Queue
            </h2>
          </div>

          <div className="space-y-4">
            {upcomingAppointments.map((item, index) => (
              <Card 
                key={item.id}
                className={cn(
                  "transition-all duration-500 animate-fadeIn",
                  item.isNext 
                    ? "bg-gradient-to-r from-teal-50 to-blue-50 border-teal-300 shadow-lg scale-105" 
                    : "bg-white hover:shadow-md"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "text-2xl font-bold",
                        item.isNext ? "text-teal-600" : "text-gray-500"
                      )}>
                        {item.number}
                      </div>
                      {item.isNext && (
                        <Badge className="bg-teal-100 text-teal-700 animate-pulse">
                          Next
                        </Badge>
                      )}
                    </div>
                    <ChevronRight className={cn(
                      "w-6 h-6",
                      item.isNext ? "text-teal-500 animate-pulse" : "text-gray-400"
                    )} />
                  </div>
                  <div className="mt-3">
                    <div className="font-medium text-gray-700">{item.attendee}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatTime(item.time)} • Est. wait: {item.estimatedWait} min
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {upcomingAppointments.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No upcoming appointments</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer ticker with announcements */}
      <footer className="relative z-10 bg-gradient-to-r from-teal-600 to-blue-600 text-white">
        <div className="px-8 py-6">
          <div className="flex items-center gap-8">
            <Sparkles className="w-8 h-8 flex-shrink-0 animate-pulse" />
            <div className="flex-1 overflow-hidden">
              <div className="animate-marquee whitespace-nowrap text-xl">
                {announcement} • Average service time: 15 minutes • Please have your documents ready • 
                Free WiFi available: Guest_Network • For assistance, please contact reception
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-5 h-5" />
              <span>Live Queue</span>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(30px, 10px) scale(1.05); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0.5; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .animate-blob {
          animation: blob 10s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-slideUp {
          animation: slideUp 0.8s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.6s ease-out;
        }

        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}