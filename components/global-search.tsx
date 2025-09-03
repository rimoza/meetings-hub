'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Calendar,
  CheckSquare,
  CalendarCheck,
  Users,
  FileText,
  Clock,
  MapPin,
  User,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMeetingsStore } from '@/stores/meetings-store';
import { useTasksStore } from '@/stores/tasks-store';
import { useAppointments } from '@/hooks/use-appointments';
import type { Meeting } from '@/types/meeting';
import type { Task } from '@/types/task';
import type { Appointment } from '@/types/appointment';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  type: 'meeting' | 'task' | 'appointment' | 'contact';
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  url: string;
  data: Meeting | Task | Appointment | any;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  // Get data from stores and hooks
  const { meetings } = useMeetingsStore();
  const { tasks } = useTasksStore();
  const { appointments } = useAppointments();

  // Combine all data into searchable results
  const allResults = useMemo(() => {
    const results: SearchResult[] = [];

    // Add meetings
    meetings.forEach((meeting) => {
      results.push({
        id: meeting.id,
        title: meeting.title,
        subtitle: `${meeting.date} at ${meeting.time}`,
        description: meeting.description || meeting.location,
        type: 'meeting',
        icon: Calendar,
        badge: meeting.status,
        url: `/meetings/${meeting.id}`,
        data: meeting,
      });
    });

    // Add tasks
    tasks.forEach((task) => {
      results.push({
        id: task.id,
        title: task.title,
        subtitle: task.dueDate ? `Due: ${task.dueDate}` : 'No due date',
        description: task.description,
        type: 'task',
        icon: CheckSquare,
        badge: task.priority,
        url: `/tasks/${task.id}`,
        data: task,
      });
    });

    // Add appointments
    appointments.forEach((appointment) => {
      results.push({
        id: appointment.id,
        title: appointment.title,
        subtitle: `${appointment.date} at ${appointment.time}`,
        description: `${appointment.attendee}${appointment.location ? ` • ${appointment.location}` : ''}`,
        type: 'appointment',
        icon: CalendarCheck,
        badge: appointment.status,
        url: `/appointments/${appointment.id}`,
        data: appointment,
      });
    });

    return results;
  }, [meetings, tasks, appointments]);

  // Filter results based on query
  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase().trim();
    return allResults.filter((result) => {
      return (
        result.title.toLowerCase().includes(searchTerm) ||
        result.subtitle?.toLowerCase().includes(searchTerm) ||
        result.description?.toLowerCase().includes(searchTerm) ||
        result.type.toLowerCase().includes(searchTerm)
      );
    });
  }, [query, allResults]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => 
            prev < filteredResults.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredResults[selectedIndex]) {
            handleSelectResult(filteredResults[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex, onClose]);

  const handleSelectResult = (result: SearchResult) => {
    router.push(result.url);
    onClose();
    setQuery('');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-700';
      case 'task':
        return 'bg-green-100 text-green-700';
      case 'appointment':
        return 'bg-purple-100 text-purple-700';
      case 'contact':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string, type: string) => {
    if (type === 'task') {
      switch (status) {
        case 'high':
          return 'bg-red-100 text-red-700';
        case 'medium':
          return 'bg-yellow-100 text-yellow-700';
        case 'low':
          return 'bg-green-100 text-green-700';
        default:
          return 'bg-gray-100 text-gray-700';
      }
    }
    
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="px-6 py-4 pb-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" />
            Search
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search meetings, tasks, appointments..."
              className="pl-10 h-12 text-base"
              autoFocus
            />
          </div>
        </div>

        <ScrollArea className="max-h-[400px]">
          {query && filteredResults.length === 0 && (
            <div className="p-6 text-center text-muted-foreground">
              <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-1">No results found</p>
              <p className="text-sm">Try searching with different keywords</p>
            </div>
          )}

          {query && filteredResults.length > 0 && (
            <div className="p-2">
              <div className="px-4 py-2 text-sm font-medium text-muted-foreground">
                {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
              </div>
              
              {filteredResults.map((result, index) => {
                const Icon = result.icon;
                return (
                  <button
                    key={result.id}
                    onClick={() => handleSelectResult(result)}
                    className={cn(
                      'w-full p-4 rounded-lg text-left transition-colors hover:bg-accent',
                      selectedIndex === index && 'bg-accent'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'p-2 rounded-md flex-shrink-0',
                        getTypeColor(result.type)
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{result.title}</h4>
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              'text-xs px-2 py-0 h-5',
                              result.badge && getStatusColor(result.badge, result.type)
                            )}
                          >
                            {result.badge || result.type}
                          </Badge>
                        </div>
                        
                        {result.subtitle && (
                          <p className="text-sm text-muted-foreground mb-1">
                            {result.subtitle}
                          </p>
                        )}
                        
                        {result.description && (
                          <p className="text-sm text-muted-foreground/80 truncate">
                            {result.description}
                          </p>
                        )}
                      </div>
                      
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {!query && (
            <div className="p-6 text-center text-muted-foreground">
              <div className="mb-4">
                <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium mb-1">Search everything</p>
                <p className="text-sm">Find meetings, tasks, appointments, and more</p>
              </div>
              
              <div className="text-xs text-muted-foreground/60 space-y-1">
                <p>↑↓ to navigate • Enter to select • Esc to close</p>
                <p>Tip: Search by name, date, status, or type</p>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}