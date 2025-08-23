"use client"

import { Calendar, Home, Plus, Settings, Clock, Bell, CheckSquare, ArrowLeft, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar"
import { useRouter, usePathname } from "next/navigation"
import type { Meeting } from "@/types/meeting"

interface MeetingDetailsSidebarProps {
  meeting: Meeting
  onCreateMeeting: () => void
  todayCount?: number
  upcomingCount?: number
  tasksCount?: number
}

export function MeetingDetailsSidebar({ 
  meeting, 
  onCreateMeeting, 
  todayCount = 0, 
  upcomingCount = 0, 
  tasksCount = 0 
}: MeetingDetailsSidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar()
  const router = useRouter()
  const pathname = usePathname()
  
  const menuItems = [
    { id: "/", label: "Dashboard", icon: <Home className="h-4 w-4" />, count: null },
    { id: "/today-meetings", label: "Today's Meetings", icon: <Calendar className="h-4 w-4 text-blue-500" />, count: todayCount },
    { id: "/upcoming-meetings", label: "Upcoming Meetings", icon: <Clock className="h-4 w-4" />, count: upcomingCount },
    { id: "/tasks", label: "Tasks", icon: <CheckSquare className="h-4 w-4 text-purple-500" />, count: tasksCount },
    { id: "/settings", label: "Settings", icon: <Settings className="h-4 w-4" />, count: null },
  ]
  
  const handleNavClick = (path: string) => {
    router.push(path)
    // Only close sidebar on mobile
    if (isMobile) {
      setOpenMobile(false)
    }
  }
  
  const handleCreateMeeting = () => {
    onCreateMeeting()
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const handleBackToMeetings = () => {
    router.push("/")
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "meeting": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "call": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "interview": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "presentation": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }
  
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToMeetings}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground p-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </Button>
        </div>
        
        {/* Meeting Details Card */}
        <Card className="p-4 bg-muted/50">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-sm text-foreground truncate" title={meeting.title}>
                {meeting.title}
              </h3>
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="secondary" className={`text-xs ${getPriorityColor(meeting.priority)}`}>
                  {meeting.priority}
                </Badge>
                <Badge variant="outline" className={`text-xs ${getTypeColor(meeting.type)}`}>
                  {meeting.type}
                </Badge>
                {meeting.completed && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Completed
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>{new Date(meeting.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>{meeting.time}</span>
                {meeting.duration && <span>({meeting.duration}min)</span>}
              </div>
              {meeting.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate" title={meeting.location}>{meeting.location}</span>
                </div>
              )}
              {meeting.attendees && meeting.attendees.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  <span>{meeting.attendees.length} attendee{meeting.attendees.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <Button 
              onClick={handleCreateMeeting}
              className="w-full justify-start mb-2"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Meeting
            </Button>
          </SidebarMenuItem>
          
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton 
                onClick={() => handleNavClick(item.id)}
                isActive={pathname === item.id}
                className="w-full justify-between"
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.count !== null && item.count > 0 && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {item.count}
                  </Badge>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}