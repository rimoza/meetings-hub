'use client';

import { useEffect, useState } from 'react';
import { Calendar, } from 'lucide-react';
import { format } from 'date-fns';
// import { Appointment } from '@/types/appointment';
import { useAppointments } from '@/hooks/use-appointments';
import { usePrintAppointment } from '@/hooks/use-print-appointment';
import { cn } from '@/lib/utils';
import { formatAppointmentNumber } from '@/lib/firebase/appointments';
import { AppointmentPrintPreview } from './appointment-print-preview';

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
  attendeeCount: number;
  title: string;
  time: string;
  status: string;
  isNext?: boolean;
  isSeeingNow?: boolean;
  estimatedWait?: number;
}

export default function AppointmentQueue() {
  const { appointments, isLoading } = useAppointments();
  const { showPreview, selectedAppointments, closePreview } = usePrintAppointment();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentAppointment, setCurrentAppointment] = useState<QueuedAppointment | null>(null);
  const [todaysAppointments, setTodaysAppointments] = useState<QueuedAppointment[]>([]);
  const [seeingAppointmentId, setSeeingAppointmentId] = useState<string | null>(null);
  const [animateNumber, setAnimateNumber] = useState(false);
  // const [announcement, setAnnouncement] = useState('Welcome to our facility. We appreciate your patience.');
  
  // const announcements = [
  //   'Welcome to our facility. We appreciate your patience.',
  //   'Please be ready when your number is called.',
  //   'Our staff is here to assist you with any questions.',
  //   'Thank you for visiting us today.',
  //   'We strive to serve you efficiently.'
  // ];
  console.log(todaysAppointments);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotate announcements
  // useEffect(() => {
  //   const announcementTimer = setInterval(() => {
  //     setAnnouncement(prev => {
  //       const currentIndex = announcements.indexOf(prev);
  //       return announcements[(currentIndex + 1) % announcements.length];
  //     });
  //   }, 8000);
  //   return () => clearInterval(announcementTimer);
  // }, []);

  // Monitor for status changes in the seeing appointment - real-time response
  useEffect(() => {
    if (!seeingAppointmentId) return;

    const seeingApt = appointments.find(apt => apt.id === seeingAppointmentId);
    
    // If the seeing appointment is completed or cancelled, clear it immediately
    if (seeingApt && (seeingApt.status === 'completed' || seeingApt.status === 'cancelled')) {
      setSeeingAppointmentId(null);
    }
  }, [seeingAppointmentId, appointments]);

  // Process appointments to find current and categorize - instant updates
  useEffect(() => {
    if (!appointments.length) {
      setCurrentAppointment(null);
      setSeeingAppointmentId(null);
      setTodaysAppointments([]);
      return;
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Process today's appointments only (for simplified queue display)
    const todaysApts: QueuedAppointment[] = [];
    
    appointments.forEach((apt, index) => {
      // Only process today's appointments that are not completed/cancelled
      if (apt.date === today && apt.status !== 'completed' && apt.status !== 'cancelled') {
        const queueItem: QueuedAppointment = {
          id: apt.id,
          number: `#${formatAppointmentNumber(apt.dailyNumber || 1)}`,
          attendeeCount: apt.attendeeCount || 1,
          title: apt.title,
          time: apt.time,
          status: apt.status,
          isSeeingNow: false,
          isNext: false,
          estimatedWait: index * 15
        };
        
        todaysApts.push(queueItem);
      }
    });
    
    // Sort today's appointments by time
    todaysApts.sort((a, b) => a.time.localeCompare(b.time));
    
    // Find current appointment from today's appointments
    let current: QueuedAppointment | null = null;
    const confirmedToday = todaysApts.filter(apt => apt.status === 'confirmed');
    
    // Priority 1: If there's a seeing appointment that's still confirmed, keep it
    if (seeingAppointmentId) {
      const seeingApt = todaysApts.find(apt => apt.id === seeingAppointmentId);
      if (seeingApt && seeingApt.status === 'confirmed') {
        current = seeingApt;
        current.isSeeingNow = true;
      } else {
        setSeeingAppointmentId(null);
      }
    }
    
    // Priority 2: If no current seeing appointment, find the first confirmed appointment
    if (!current && confirmedToday.length > 0) {
      current = confirmedToday[0];
      current.isSeeingNow = true;
      setSeeingAppointmentId(current.id);
    }
    
    // Check if current appointment changed for animation
    if (current && current.id !== currentAppointment?.id) {
      setAnimateNumber(true);
      setTimeout(() => setAnimateNumber(false), 1000);
    }
    
    setCurrentAppointment(current);
    setTodaysAppointments(todaysApts);
  }, [appointments, seeingAppointmentId]); // Removed currentTime dependency for faster updates

  // const formatTime = (time: string) => {
  //   try {
  //     const [hours, minutes] = time.split(':');
  //     const date = new Date();
  //     date.setHours(parseInt(hours), parseInt(minutes));
  //     return format(date, 'h:mm a');
  //   } catch {
  //     return time;
  //   }
  // };


  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-transparent border-t-orange-500 border-r-amber-500 mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-32 w-32 border-4 border-orange-400/30 mx-auto"></div>
          </div>
          <p className="mt-8 text-2xl text-gray-700 font-medium animate-pulse">Loading appointment queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex flex-col overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Header with branding */}
      <header className="relative z-10 bg-white/90 backdrop-blur-sm border-b border-orange-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Calendar className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                <div>Xafiiska Guddoomiyaha</div>
              </h1>
              <p className="text-2xl text-gray-600">Ballamaha dadweynaha</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-2xl font-semibold text-gray-700">
                {formatSomaliDate(currentTime)}
              </div>
              <div className="text-4xl font-bold text-orange-600 tabular-nums">
                {format(currentTime, 'h:mm:ss a')}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full Screen Now Serving */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-16 py-24">
        {!currentAppointment ? (
          <div className="text-center">
            <Calendar className="w-48 h-48 text-gray-300 mx-auto mb-12 animate-pulse" />
            <h2 className="text-8xl font-semibold text-gray-400 mb-8">No Active Queue</h2>
            <p className="text-4xl text-gray-500">Please check with reception</p>
          </div>
        ) : (
          <div className={cn(
            "text-center transition-all duration-1000 w-full max-w-6xl",
            animateNumber && "animate-slideUp"
          )}>
            <div className="mb-4">
              <span className="text-6xl font-medium text-gray-600 uppercase tracking-wider">
                Now Serving
              </span>
            </div>
            <div className="relative bg-white shadow-xl rounded-3xl px-12 py-16 inline-block min-w-[600px]">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 blur-3xl opacity-40 animate-pulse"></div>
              <div className={cn(
                "relative mx-auto",
                animateNumber && "animate-scaleIn"
              )}>
                <div className="text-[10rem] leading-none font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                  {currentAppointment.number}
                </div>
                {/* <div className="mt-4 text-7xl font-semibold text-gray-700">
                  {currentAppointment.attendee}
                </div> */}
                {/* <div className="mt-4 flex items-center justify-center gap-4 text-5xl text-gray-600">
                  <Clock className="w-16 h-16" />
                  <span>{formatTime(currentAppointment.time)}</span>
                </div> */}
                {/* <div className="mt-4 text-4xl text-gray-500 font-medium">
                  {currentAppointment.title}
                </div> */}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer ticker with announcements */}
      {/* <footer className="relative z-10 bg-gradient-to-r from-teal-600 to-blue-600 text-white">
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
      </footer> */}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(30px, 10px) scale(1.05); }
        }

        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0.5; }
          to { transform: scale(1); opacity: 1; }
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

        .animate-slideUp {
          animation: slideUp 0.8s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.6s ease-out;
        }
      `}</style>

      {/* Print Preview Modal */}
      <AppointmentPrintPreview
        appointments={selectedAppointments}
        isOpen={showPreview}
        onClose={closePreview}
      />
    </div>
  );
}