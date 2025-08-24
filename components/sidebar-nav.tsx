"use client";
import {
  Calendar,
  Home,
  Settings,
  Clock,
  Bell,
  CheckSquare,
  ChevronDown,
  Archive,
  FileText,
  Users,
  CalendarDays,
  UserCheck,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useReminders } from "@/hooks/use-reminders";
import { useMeetings } from "@/hooks/use-meetings";
import { NotificationSidebar } from "@/components/notification-sidebar";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

interface SidebarNavProps {
  todayCount?: number;
  upcomingCount?: number;
  tasksCount?: number;
  appointmentsCount?: number;
}

export function SidebarNav({
  todayCount = 0,
  upcomingCount = 0,
  tasksCount = 0,
  appointmentsCount = 0,
}: Readonly<SidebarNavProps>) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { isPermissionGranted, isRemindersEnabled } = useReminders();
  const { upcomingMeetings } = useMeetings();
  const router = useRouter();
  const pathname = usePathname();
  const [isMeetingsOpen, setIsMeetingsOpen] = useState(false);

  const meetingSubItems = [
    
    {
      id: "/meetings",
      label: "All Meetings",
      icon: <CalendarDays className="h-4 w-4" />,
      count: null,
    },
    {
      id: "/today-meetings",
      label: "Today's Meetings",
      icon: <Calendar className="h-4 w-4" />,
      count: todayCount,
    },
    {
      id: "/upcoming-meetings",
      label: "Upcoming Meetings",
      icon: <Clock className="h-4 w-4" />,
      count: upcomingCount,
    }
  ];

  const menuItems = [
    {
      id: "/",
      label: "Dashboard",
      icon: <Home className="h-4 w-4" />,
      count: null,
    },
    {
      id: "/appointments",
      label: "Appointments",
      icon: <UserCheck className="h-4 w-4 text-green-500" />,
      count: appointmentsCount,
    },
    {
      id: "/queue",
      label: "Queue Display",
      icon: <Monitor className="h-4 w-4 text-blue-500" />,
      count: null,
    },
    {
      id: "/tasks",
      label: "Tasks",
      icon: <CheckSquare className="h-4 w-4 text-purple-500" />,
      count: tasksCount,
    },
    {
      id: "/contacts",
      label: "Contacts",
      icon: <Users className="h-4 w-4" />,
      count: null,
    },
    {
      id: "/archives",
      label: "Archives",
      icon: <Archive className="h-4 w-4" />,
      count: null,
    },
    {
      id: "/reports",
      label: "Reports",
      icon: <FileText className="h-4 w-4" />,
      count: null,
    },
    {
      id: "/settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
      count: null,
    },
  ];

  const handleNavClick = (path: string) => {
    router.push(path);
    // Only close sidebar on mobile
    if (isMobile) {
      setOpenMobile(false);
    }
  };


  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          {/* Logo - Always visible */}
          <div className="p-1 md:p-2 bg-primary rounded-lg shrink-0">
            <Calendar className="h-5 w-5 text-primary-foreground" />
          </div>
          
          {/* Project title and notification - Hidden when collapsed */}
          <div className="flex items-center justify-between w-full min-w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:hidden">
            <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">
              Kulan Space
            </h2>
            
            {/* Notification Icon with Badge */}
            <NotificationSidebar>
              <Button variant="ghost" size="sm" className="relative p-2 shrink-0">
                {isPermissionGranted && isRemindersEnabled ? (
                  <Bell className="h-5 w-5 text-primary" />
                ) : (
                  <Bell className="h-5 w-5 text-muted-foreground" />
                )}
                {upcomingMeetings.length > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs min-w-[1.25rem]"
                    variant={
                      isPermissionGranted && isRemindersEnabled
                        ? "default"
                        : "secondary"
                    }
                  >
                    {upcomingMeetings.length > 99
                      ? "99+"
                      : upcomingMeetings.length}
                  </Badge>
                )}
              </Button>
            </NotificationSidebar>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className="space-y-1">

          {/* Notification Status Indicator */}
          {isPermissionGranted && (
            <div className="px-2 mb-4 group-data-[collapsible=icon]:hidden">
              <div className="flex items-center justify-center p-2 bg-primary/10 rounded-lg border border-primary/20">
                <Bell className="h-4 w-4 text-primary mr-2" />
                <span className="text-sm font-medium text-primary">
                  Reminders Active
                </span>
              </div>
            </div>
          )}

          {/* Navigation Items - Mobile optimized */}
          <SidebarMenu>
            {/* Dashboard */}
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={pathname === "/"}
                onClick={() => handleNavClick("/")}
                className="h-10 text-sm sm:text-base"
                tooltip="Dashboard"
              >
                <Home className="h-4 w-4 shrink-0" />
                <span className="ml-2">Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Meetings Dropdown */}
            <Collapsible open={isMeetingsOpen} onOpenChange={setIsMeetingsOpen}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className="h-10 text-sm sm:text-base cursor-pointer"
                    isActive={meetingSubItems.some(item => pathname === item.id)}
                    tooltip="Meetings"
                  >
                    <Calendar className="h-4 w-4 text-blue-500 shrink-0" />
                    <span className="ml-2">Meetings</span>
                    <ChevronDown 
                      className={`h-4 w-4 ml-auto transition-transform ${
                        isMeetingsOpen ? "rotate-180" : ""
                      }`}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {meetingSubItems.map((item) => (
                      <SidebarMenuSubItem key={item.id}>
                        <SidebarMenuSubButton
                          isActive={pathname === item.id}
                          onClick={() => handleNavClick(item.id)}
                          className="h-9 text-sm"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              {item.icon}
                              <span className="ml-2">{item.label}</span>
                            </div>
                            {item.count !== null && (
                              <span
                                className={`ml-auto text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center ${
                                  item.count > 0
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {item.count > 99 ? "99+" : item.count}
                              </span>
                            )}
                          </div>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>

            {/* Other Menu Items */}
            {menuItems.slice(1).map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={pathname === item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="h-10 text-sm sm:text-base"
                  tooltip={item.label}
                >
                  <div className="flex items-center shrink-0">
                    {item.icon}
                  </div>
                  <span className="ml-2">{item.label}</span>
                  {item.count !== null && (
                    <span
                      className={`ml-auto text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center ${
                        item.count > 0
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.count > 99 ? "99+" : item.count}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
