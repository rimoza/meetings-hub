"use client"
import { Calendar, Home, Plus, Settings, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar"

interface SidebarNavProps {
  onCreateMeeting: () => void
  onNavigate: (page: string) => void
  activePage: string
  todayCount?: number
  upcomingCount?: number
}

export function SidebarNav({ onCreateMeeting, onNavigate, activePage, todayCount = 0, upcomingCount = 0 }: SidebarNavProps) {
  const { isMobile, setOpenMobile } = useSidebar()
  
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <Home className="h-4 w-4" />, count: null },
    { id: "today", label: "Today's Meetings", icon: <Calendar className="h-4 w-4 text-blue-500" />, count: todayCount },
    { id: "upcoming", label: "Upcoming Meetings", icon: <Clock className="h-4 w-4" />, count: upcomingCount },
    { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" />, count: null },
  ]
  
  const handleNavClick = (pageId: string) => {
    onNavigate(pageId)
    // Only close sidebar on mobile
    if (isMobile) {
      setOpenMobile(false)
    }
  }
  
  const handleCreateMeeting = () => {
    onCreateMeeting()
    // Only close sidebar on mobile
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-center w-full px-2 py-2">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Kulan Space</h2>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className="space-y-1">
          {/* Create Meeting Button - Mobile optimized */}
          <div className="px-2 mb-4">
            <Button onClick={handleCreateMeeting} className="w-full justify-start h-10 text-sm sm:text-base">
              <Plus className="h-4 w-4" />
              <span className="ml-2">New Meeting</span>
            </Button>
          </div>

          {/* Navigation Items - Mobile optimized */}
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={activePage === item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="h-10 text-sm sm:text-base"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </div>
                    {item.count !== null && (
                      <span className={`ml-auto text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center ${
                        item.count > 0 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {item.count > 99 ? '99+' : item.count}
                      </span>
                    )}
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
