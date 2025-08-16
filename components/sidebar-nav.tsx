"use client"
import { Calendar, Home, Plus, Settings, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar"

interface SidebarNavProps {
  onCreateMeeting: () => void
  onNavigate: (page: string) => void
  activePage: string
}

export function SidebarNav({ onCreateMeeting, onNavigate, activePage }: SidebarNavProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <Home className="h-4 w-4" /> },
    { id: "today", label: "Today's Meetings", icon: <Calendar className="h-4 w-4" /> },
    { id: "upcoming", label: "Upcoming Meetings", icon: <Clock className="h-4 w-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-center w-full px-2">
          <h2 className="text-lg font-semibold text-foreground">Tidy Meets</h2>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className="space-y-1">
          {/* Create Meeting Button */}
          <div className="px-2 mb-4">
            <Button onClick={onCreateMeeting} className="w-full justify-start">
              <Plus className="h-4 w-4" />
              <span className="ml-2">New Meeting</span>
            </Button>
          </div>

          {/* Navigation Items */}
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={activePage === item.id}
                  onClick={() => onNavigate(item.id)}
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
