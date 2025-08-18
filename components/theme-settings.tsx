"use client"

import { useEffect, useState } from "react"
import { Monitor, Moon, Sun, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"

export function ThemeSettings() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-secondary/50 rounded-lg">
              <Palette className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Theme Preferences</CardTitle>
              <CardDescription>Loading theme settings...</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    )
  }

  const currentTheme = theme === "system" ? systemTheme : theme
  
  const themeOptions = [
    {
      id: "light",
      label: "Light",
      description: "Clean and bright interface",
      icon: Sun,
      active: theme === "light"
    },
    {
      id: "dark", 
      label: "Dark",
      description: "Easy on the eyes in low light",
      icon: Moon,
      active: theme === "dark"
    },
    {
      id: "system",
      label: "System",
      description: "Follows your device settings",
      icon: Monitor,
      active: theme === "system"
    }
  ]

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-secondary/50 rounded-lg">
            <Palette className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg">Theme Preferences</CardTitle>
            <CardDescription>
              Currently using {currentTheme} theme
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {themeOptions.map((option) => (
            <div
              key={option.id}
              className={`relative p-3 border rounded-lg cursor-pointer transition-colors hover:bg-secondary/50 ${
                option.active 
                  ? "border-primary bg-primary/5" 
                  : "border-border"
              }`}
              onClick={() => setTheme(option.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    option.active 
                      ? "bg-primary/10" 
                      : "bg-secondary"
                  }`}>
                    <option.icon className={`h-4 w-4 ${
                      option.active 
                        ? "text-primary" 
                        : "text-muted-foreground"
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{option.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
                
                {option.active && (
                  <Badge variant="default" className="text-xs">
                    Active
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-secondary/30 rounded-lg border">
          <div className="flex items-start space-x-2">
            <Monitor className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">System Theme</p>
              <p className="text-muted-foreground text-xs">
                When "System" is selected, the theme will automatically switch based on your device's appearance settings.
                {theme === "system" && (
                  <span className="block mt-1 font-medium">
                    Currently showing: <span className="capitalize">{systemTheme}</span>
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}