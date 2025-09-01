"use client";
import {
  Calendar,
  Home,
  Settings,
  Clock,
  CheckSquare,
  ChevronDown,
  Archive,
  FileText,
  Users,
  CalendarDays,
  UserCheck,
  Monitor,
  Printer,
} from "lucide-react";
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
  const router = useRouter();
  const pathname = usePathname();
  const [isMeetingsOpen, setIsMeetingsOpen] = useState(false);

  const meetingSubItems = [
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
    },
    {
      id: "/meetings",
      label: "All Meetings",
      icon: <CalendarDays className="h-4 w-4" />,
      count: null,
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
      id: "/print-settings",
      label: "Print Settings",
      icon: <Printer className="h-4 w-4 text-indigo-500" />,
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
    // Open queue in new tab
    if (path === '/queue') {
      window.open(path, '_blank');
    } else {
      router.push(path);
    }
    // Only close sidebar on mobile
    if (isMobile) {
      setOpenMobile(false);
    }
  };


  return (
    <Sidebar collapsible="icon" className="border-r bg-card/50">
      <SidebarHeader className="border-b bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3 px-3 py-4">
          {/* Logo - Always visible */}
          <div className="relative">
            <div className="p-2.5 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg shrink-0">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
          </div>
          
          {/* Project title - Hidden when collapsed */}
          <div className="flex items-center w-full min-w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:hidden">
            <div className="min-w-0">
              <h2 className="text-base font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent whitespace-nowrap truncate">
                Chairman Office
              </h2>
              <p className="text-xs text-muted-foreground">Work Management System</p>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <div className="space-y-2">


          {/* Navigation Items - Mobile optimized */}
          <SidebarMenu>
            {/* Dashboard */}
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={pathname === "/"}
                onClick={() => handleNavClick("/")}
                className="h-11 rounded-lg hover:bg-accent transition-all duration-200 data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium"
                tooltip="Dashboard"
              >
                <div className="p-1.5 rounded-md bg-background">
                  <Home className="h-4 w-4 shrink-0" />
                </div>
                <span className="ml-3">Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Meetings Dropdown */}
            <Collapsible open={isMeetingsOpen} onOpenChange={setIsMeetingsOpen}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className="h-11 rounded-lg hover:bg-accent transition-all duration-200 cursor-pointer data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                    isActive={meetingSubItems.some(item => pathname === item.id)}
                    tooltip="Meetings"
                  >
                    <div className="p-1.5 rounded-md bg-blue-500/10">
                      <Calendar className="h-4 w-4 text-blue-500 shrink-0" />
                    </div>
                    <span className="ml-3 font-medium">Meetings</span>
                    <ChevronDown 
                      className={`h-4 w-4 ml-auto transition-transform duration-200 ${
                        isMeetingsOpen ? "rotate-180" : ""
                      }`}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <SidebarMenuSub className="ml-4 space-y-1 border-l-2 border-muted pl-4">
                    {meetingSubItems.map((item) => (
                      <SidebarMenuSubItem key={item.id}>
                        <SidebarMenuSubButton
                          isActive={pathname === item.id}
                          onClick={() => handleNavClick(item.id)}
                          className="h-9 rounded-md hover:bg-accent/50 transition-colors data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              {item.icon}
                              <span className="ml-3 text-sm">{item.label}</span>
                            </div>
                            {item.count !== null && item.count > 0 && (
                              <Badge
                                variant={item.count > 0 ? "default" : "secondary"}
                                className="h-5 min-w-[1.5rem] text-[10px]"
                              >
                                {item.count > 99 ? "99+" : item.count}
                              </Badge>
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
            {menuItems.slice(1).map((item) => {
              const getIconBackground = () => {
                if (item.id === '/appointments') return 'bg-green-500/10';
                if (item.id === '/queue') return 'bg-blue-500/10';
                if (item.id === '/tasks') return 'bg-purple-500/10';
                if (item.id === '/print-settings') return 'bg-indigo-500/10';
                return 'bg-background';
              };
              
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={pathname === item.id}
                    onClick={() => handleNavClick(item.id)}
                    className="h-11 rounded-lg hover:bg-accent transition-all duration-200 data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium"
                    tooltip={item.label}
                  >
                    <div className={`p-1.5 rounded-md ${getIconBackground()}`}>
                      {item.icon}
                    </div>
                    <span className="ml-3">{item.label}</span>
                    {item.count !== null && item.count > 0 && (
                      <Badge
                        variant="default"
                        className="ml-auto h-5 min-w-[1.5rem] text-[10px]"
                      >
                        {item.count > 99 ? "99+" : item.count}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
