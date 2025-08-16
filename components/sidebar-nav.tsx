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
}

export function SidebarNav({ onCreateMeeting, onNavigate, activePage }: SidebarNavProps) {
  const { isMobile, setOpenMobile } = useSidebar()
  
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <Home className="h-4 w-4" /> },
    { id: "today", label: "Today's Meetings", icon: <Calendar className="h-4 w-4" /> },
    { id: "upcoming", label: "Upcoming Meetings", icon: <Clock className="h-4 w-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
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
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Tidy Meets</h2>
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
                  {item.icon}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
