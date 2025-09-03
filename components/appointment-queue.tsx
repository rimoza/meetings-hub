'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, ChevronRight, CheckCircle2 } from 'lucide-react';
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
  const { showPreview, selectedAppointments, closePreview } = usePrintAppointment();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentAppointment, setCurrentAppointment] = useState<QueuedAppointment | null>(null);
  const [todaysAppointments, setTodaysAppointments] = useState<QueuedAppointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<QueuedAppointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<QueuedAppointment[]>([]);
  const [seeingAppointmentId, setSeeingAppointmentId] = useState<string | null>(null);
  const [animateNumber, setAnimateNumber] = useState(false);
  const [activeSection, setActiveSection] = useState<'today' | 'upcoming' | 'past'>('today');
  // const [announcement, setAnnouncement] = useState('Welcome to our facility. We appreciate your patience.');
  
  // const announcements = [
  //   'Welcome to our facility. We appreciate your patience.',
  //   'Please be ready when your number is called.',
  //   'Our staff is here to assist you with any questions.',
  //   'Thank you for visiting us today.',
  //   'We strive to serve you efficiently.'
  // ];

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
      setUpcomingAppointments([]);
      setPastAppointments([]);
      return;
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTimeStr = format(now, 'HH:mm');
    
    // Categorize appointments
    const todaysApts: QueuedAppointment[] = [];
    const upcomingApts: QueuedAppointment[] = [];
    const pastApts: QueuedAppointment[] = [];
    
    appointments.forEach((apt, index) => {
      const queueItem: QueuedAppointment = {
        id: apt.id,
        number: `#${formatAppointmentNumber(apt.dailyNumber || 1)}`,
        attendee: apt.attendee,
        title: apt.title,
        time: apt.time,
        status: apt.status,
        isSeeingNow: false,
        isNext: false,
        estimatedWait: index * 15
      };
      
      // Categorize based on date and status
      if (apt.status === 'completed' || apt.status === 'cancelled') {
        // Past appointments (completed or cancelled)
        pastApts.push(queueItem);
      } else if (apt.date === today) {
        // Today's appointments
        if (apt.time < currentTimeStr && apt.status !== 'confirmed') {
          // Past time but not completed
          pastApts.push(queueItem);
        } else {
          todaysApts.push(queueItem);
        }
      } else if (apt.date > today) {
        // Future appointments
        upcomingApts.push(queueItem);
      } else {
        // Past date appointments
        pastApts.push(queueItem);
      }
    });
    
    // Sort each category
    todaysApts.sort((a, b) => a.time.localeCompare(b.time));
    upcomingApts.sort((a, b) => a.time.localeCompare(b.time));
    pastApts.sort((a, b) => b.time.localeCompare(a.time)); // Most recent first
    
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
    
    // Mark next appointment
    const remainingToday = todaysApts.filter(apt => 
      apt.id !== current?.id && 
      (apt.status === 'confirmed' || apt.status === 'scheduled')
    );
    
    if (remainingToday.length > 0) {
      remainingToday[0].isNext = true;
    }
    
    setCurrentAppointment(current);
    setTodaysAppointments(todaysApts);
    setUpcomingAppointments(upcomingApts);
    setPastAppointments(pastApts);
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
    <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex flex-col overflow-hidden">
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
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 blur-3xl opacity-30 animate-pulse"></div>
                <div className={cn(
                  "relative bg-white rounded-3xl shadow-2xl p-16 border-4 border-orange-100",
                  animateNumber && "animate-scaleIn"
                )}>
                  <div className="text-9xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
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

        {/* Right side - Categorized appointments */}
        <div className="w-1/3 bg-white/70 backdrop-blur-sm border-l border-orange-200 overflow-hidden relative flex flex-col">
          {/* Section Tabs */}
          <div className="flex border-b border-orange-200 bg-white/80">
            <button
              onClick={() => setActiveSection('today')}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-all",
                activeSection === 'today'
                  ? "bg-orange-100 text-orange-700 border-b-2 border-orange-500"
                  : "text-gray-600 hover:bg-orange-50"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                Today ({todaysAppointments.length})
              </div>
            </button>
            <button
              onClick={() => setActiveSection('upcoming')}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-all",
                activeSection === 'upcoming'
                  ? "bg-orange-100 text-orange-700 border-b-2 border-orange-500"
                  : "text-gray-600 hover:bg-orange-50"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                Upcoming ({upcomingAppointments.length})
              </div>
            </button>
            <button
              onClick={() => setActiveSection('past')}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-all",
                activeSection === 'past'
                  ? "bg-orange-100 text-orange-700 border-b-2 border-orange-500"
                  : "text-gray-600 hover:bg-orange-50"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Past ({pastAppointments.length})
              </div>
            </button>
          </div>

          {/* Section Content */}
          <div className="flex-1 p-8 overflow-hidden relative">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {activeSection === 'today' && (
                  <>
                    <Calendar className="w-6 h-6 text-orange-500" />
                    Today&apos;s Queue
                  </>
                )}
                {activeSection === 'upcoming' && (
                  <>
                    <Clock className="w-6 h-6 text-orange-500" />
                    Upcoming Appointments
                  </>
                )}
                {activeSection === 'past' && (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-gray-500" />
                    Past Appointments
                  </>
                )}
              </h2>
            </div>

            {/* Scrollable container with infinite scroll for today's appointments */}
            {activeSection === 'today' && (
              <div className="relative h-[calc(100%-3rem)] overflow-hidden">
                {/* Gradient overlays for fade effect */}
                <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/70 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/70 to-transparent z-10 pointer-events-none"></div>
                
                {/* Scrolling content */}
                <div className="space-y-4 animate-infiniteScroll" style={{
                  '--scroll-height': `${todaysAppointments.length * 140}px`
                } as React.CSSProperties}>
                  {/* Duplicate list for infinite scroll effect */}
                  {todaysAppointments.length > 0 ? (
                    [...todaysAppointments, ...todaysAppointments, ...todaysAppointments].map((item, index) => {
                      const isOriginalNext = item.isNext && index < todaysAppointments.length;
                      const isCurrent = item.isSeeingNow && index < todaysAppointments.length;
                      
                      return (
                        <Card 
                          key={`${item.id}-${index}`}
                          className={cn(
                            "transition-all duration-500",
                            isCurrent
                              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-lg scale-105"
                              : isOriginalNext
                              ? "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300 shadow-lg" 
                              : "bg-white/90 hover:shadow-md"
                          )}
                        >
                          <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "text-xl font-bold",
                                  isCurrent ? "text-green-600" :
                                  isOriginalNext ? "text-orange-600" : "text-gray-500"
                                )}>
                                  {item.number}
                                </div>
                                {isCurrent && (
                                  <Badge className="bg-green-100 text-green-700 animate-pulse">
                                    Serving
                                  </Badge>
                                )}
                                {isOriginalNext && (
                                  <Badge className="bg-orange-100 text-orange-700 animate-pulse">
                                    Next
                                  </Badge>
                                )}
                              </div>
                              <ChevronRight className={cn(
                                "w-5 h-5",
                                isCurrent ? "text-green-500 animate-pulse" :
                                isOriginalNext ? "text-orange-500 animate-pulse" : "text-gray-400"
                              )} />
                            </div>
                            <div className="mt-2">
                              <div className="font-medium text-gray-700">{item.attendee}</div>
                              <div className="text-sm text-gray-500 mt-1">
                                {formatTime(item.time)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">No appointments today</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Upcoming appointments - regular scroll */}
            {activeSection === 'upcoming' && (
              <div className="h-[calc(100%-3rem)] overflow-y-auto space-y-3 pr-2">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((item) => (
                    <Card 
                      key={item.id}
                      className="bg-white/90 hover:shadow-md transition-all"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-bold text-gray-600">
                              {item.number}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {item.status}
                            </Badge>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="mt-2">
                          <div className="font-medium text-gray-700">{item.attendee}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {formatTime(item.time)} • {item.title}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No upcoming appointments</p>
                  </div>
                )}
              </div>
            )}

            {/* Past appointments - regular scroll */}
            {activeSection === 'past' && (
              <div className="h-[calc(100%-3rem)] overflow-y-auto space-y-3 pr-2">
                {pastAppointments.length > 0 ? (
                  pastAppointments.map((item) => (
                    <Card 
                      key={item.id}
                      className="bg-gray-50/50 opacity-75 hover:opacity-100 transition-all"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-bold text-gray-400">
                              {item.number}
                            </div>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                item.status === 'completed' ? "text-green-600 border-green-300" :
                                item.status === 'cancelled' ? "text-red-600 border-red-300" :
                                "text-gray-600"
                              )}
                            >
                              {item.status}
                            </Badge>
                          </div>
                          <CheckCircle2 className={cn(
                            "w-5 h-5",
                            item.status === 'completed' ? "text-green-500" : "text-gray-400"
                          )} />
                        </div>
                        <div className="mt-2">
                          <div className="font-medium text-gray-600">{item.attendee}</div>
                          <div className="text-sm text-gray-400 mt-1">
                            {formatTime(item.time)} • {item.title}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No past appointments</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
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
        @keyframes infiniteScroll {
          0% {
            transform: translateY(25%);
          }
          100% {
            transform: translateY(calc(-1 * var(--scroll-height) + 25%));
          }
        }
        
        .animate-infiniteScroll {
          animation: infiniteScroll ${Math.max(todaysAppointments.length * 4, 10)}s linear infinite;
          will-change: transform;
        }
        
        .animate-infiniteScroll:hover {
          animation-play-state: paused;
        }
        
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

      {/* Print Preview Modal */}
      <AppointmentPrintPreview
        appointments={selectedAppointments}
        isOpen={showPreview}
        onClose={closePreview}
      />
    </div>
  );
}