"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMeetingsStore } from "@/stores/meetings-store";
import { Calendar, Clock, MapPin, Video, Users, Phone } from "lucide-react";
import { format, isToday, isTomorrow, isThisWeek, differenceInMinutes } from "date-fns";

export function UpcomingTimeline() {
  const { getUpcomingMeetings } = useMeetingsStore();
  const upcomingMeetings = getUpcomingMeetings().slice(0, 5);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "in-person":
        return <Users className="h-4 w-4" />;
      case "phone":
        return <Phone className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isThisWeek(date)) return format(date, "EEEE");
    return format(date, "MMM d");
  };

  const getTimeUntil = (date: Date) => {
    const minutes = differenceInMinutes(date, new Date());
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
    return `${Math.floor(minutes / 1440)}d`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <Card className="">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Upcoming Meetings</CardTitle>
          <Badge variant="outline" className="text-xs">
            Next {upcomingMeetings.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {upcomingMeetings.length > 0 ? (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-4">
              {upcomingMeetings.map((meeting, index) => {
                const meetingDate = new Date(meeting.date);
                const isFirst = index === 0;
                
                return (
                  <div key={meeting.id} className="relative flex gap-4">
                    <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      isFirst ? "border-primary bg-primary" : "border-border bg-background"
                    }`}>
                      <div className={isFirst ? "text-primary-foreground" : "text-muted-foreground"}>
                        {getTypeIcon(meeting.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-2 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <p className="font-medium text-sm leading-none">
                            {meeting.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{format(meetingDate, "h:mm a")}</span>
                            <span>•</span>
                            <span>{getDateLabel(meetingDate)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={getPriorityColor(meeting.priority)} className="text-xs">
                            {meeting.priority}
                          </Badge>
                          {isFirst && (
                            <span className="text-xs font-medium text-primary">
                              in {getTimeUntil(meetingDate)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {meeting.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{meeting.location}</span>
                        </div>
                      )}
                      
                      {meeting.attendees && meeting.attendees.length > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {meeting.attendees.slice(0, 3).map((participant, i) => (
                              <div
                                key={i}
                                className="h-6 w-6 rounded-full bg-secondary border-2 border-background flex items-center justify-center"
                              >
                                <span className="text-xs font-medium">
                                  {participant.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            ))}
                          </div>
                          {meeting.attendees.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{meeting.attendees.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No upcoming meetings</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}