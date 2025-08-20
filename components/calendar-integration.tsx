"use client"

import { useState } from 'react'
import { Calendar, Download, ExternalLink, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Meeting } from '@/types/meeting'
import { 
  downloadICalFile, 
  generateGoogleCalendarUrl, 
  generateOutlookCalendarUrl,
  generateYahooCalendarUrl,
  copyCalendarLink 
} from '@/lib/calendar/calendar-utils'
import { toast } from 'sonner'

interface CalendarIntegrationProps {
  meeting: Meeting
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showTooltip?: boolean
}

export function CalendarIntegration({ 
  meeting, 
  variant = 'ghost', 
  size = 'sm',
  showTooltip = true 
}: CalendarIntegrationProps) {
  const [copiedProvider, setCopiedProvider] = useState<string | null>(null)

  const handleDownload = () => {
    try {
      downloadICalFile(meeting)
      toast.success('Calendar file downloaded successfully!')
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Failed to download calendar file')
    }
  }

  const handleCalendarOpen = (provider: 'google' | 'outlook' | 'yahoo', url: string) => {
    try {
      window.open(url, '_blank', 'noopener,noreferrer')
      toast.success(`Opening ${provider} calendar...`)
    } catch (error) {
      console.error(`Failed to open ${provider} calendar:`, error)
      toast.error(`Failed to open ${provider} calendar`)
    }
  }

  const handleCopyLink = async (provider: 'google' | 'outlook' | 'yahoo') => {
    const success = await copyCalendarLink(meeting, provider)
    if (success) {
      setCopiedProvider(provider)
      toast.success(`${provider} calendar link copied to clipboard!`)
      setTimeout(() => setCopiedProvider(null), 2000)
    } else {
      toast.error(`Failed to copy ${provider} calendar link`)
    }
  }

  const googleUrl = generateGoogleCalendarUrl(meeting)
  const outlookUrl = generateOutlookCalendarUrl(meeting)
  const yahooUrl = generateYahooCalendarUrl(meeting)

  const button = (
    <Button variant={variant} size={size}>
      <Calendar className="h-4 w-4 mr-2" />
      {/* {size !== 'icon' && 'Add to Calendar'} */}
    </Button>
  )

  const content = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {button}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Download .ics file */}
        <DropdownMenuItem onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download .ics file
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Google Calendar */}
        <DropdownMenuItem 
          onClick={() => handleCalendarOpen('google', googleUrl)}
        >
          <div className="flex items-center w-full">
            <div className="w-4 h-4 mr-2 text-blue-600">📅</div>
            <span className="flex-1">Google Calendar</span>
            <ExternalLink className="h-3 w-3 ml-2 opacity-60" />
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleCopyLink('google')}
        >
          <div className="flex items-center w-full pl-6">
            {copiedProvider === 'google' ? (
              <Check className="h-3 w-3 mr-2 text-green-600" />
            ) : (
              <Copy className="h-3 w-3 mr-2 opacity-60" />
            )}
            <span className="text-xs text-muted-foreground">
              {copiedProvider === 'google' ? 'Link copied!' : 'Copy link'}
            </span>
          </div>
        </DropdownMenuItem>
        
        {/* Outlook */}
        <DropdownMenuItem 
          onClick={() => handleCalendarOpen('outlook', outlookUrl)}
        >
          <div className="flex items-center w-full">
            <div className="w-4 h-4 mr-2 text-blue-700">📧</div>
            <span className="flex-1">Outlook</span>
            <ExternalLink className="h-3 w-3 ml-2 opacity-60" />
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleCopyLink('outlook')}
        >
          <div className="flex items-center w-full pl-6">
            {copiedProvider === 'outlook' ? (
              <Check className="h-3 w-3 mr-2 text-green-600" />
            ) : (
              <Copy className="h-3 w-3 mr-2 opacity-60" />
            )}
            <span className="text-xs text-muted-foreground">
              {copiedProvider === 'outlook' ? 'Link copied!' : 'Copy link'}
            </span>
          </div>
        </DropdownMenuItem>
        
        {/* Yahoo Calendar */}
        <DropdownMenuItem 
          onClick={() => handleCalendarOpen('yahoo', yahooUrl)}
        >
          <div className="flex items-center w-full">
            <div className="w-4 h-4 mr-2 text-purple-600">📆</div>
            <span className="flex-1">Yahoo Calendar</span>
            <ExternalLink className="h-3 w-3 ml-2 opacity-60" />
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleCopyLink('yahoo')}
        >
          <div className="flex items-center w-full pl-6">
            {copiedProvider === 'yahoo' ? (
              <Check className="h-3 w-3 mr-2 text-green-600" />
            ) : (
              <Copy className="h-3 w-3 mr-2 opacity-60" />
            )}
            <span className="text-xs text-muted-foreground">
              {copiedProvider === 'yahoo' ? 'Link copied!' : 'Copy link'}
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent>
            <p>Add meeting to your calendar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return content
}

// Simplified version for quick actions
interface QuickCalendarButtonProps {
  meeting: Meeting
  provider: 'google' | 'outlook' | 'yahoo' | 'download'
  size?: 'default' | 'sm' | 'icon'
}

export function QuickCalendarButton({ meeting, provider, size = 'sm' }: QuickCalendarButtonProps) {
  const [isSuccess, setIsSuccess] = useState(false)

  const handleClick = async () => {
    try {
      switch (provider) {
        case 'download':
          downloadICalFile(meeting)
          break
        case 'google':
          window.open(generateGoogleCalendarUrl(meeting), '_blank', 'noopener,noreferrer')
          break
        case 'outlook':
          window.open(generateOutlookCalendarUrl(meeting), '_blank', 'noopener,noreferrer')
          break
        case 'yahoo':
          window.open(generateYahooCalendarUrl(meeting), '_blank', 'noopener,noreferrer')
          break
      }
      
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 2000)
      
    } catch (error) {
      console.error(`Failed to handle ${provider} calendar:`, error)
      toast.error(`Failed to open ${provider} calendar`)
    }
  }

  const getButtonContent = () => {
    if (isSuccess) {
      return <Check className="h-4 w-4" />
    }

    switch (provider) {
      case 'download':
        return <Download className="h-4 w-4" />
      case 'google':
        return <span className="text-blue-600">📅</span>
      case 'outlook':
        return <span className="text-blue-700">📧</span>
      case 'yahoo':
        return <span className="text-purple-600">📆</span>
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getTooltipText = () => {
    switch (provider) {
      case 'download':
        return 'Download .ics file'
      case 'google':
        return 'Add to Google Calendar'
      case 'outlook':
        return 'Add to Outlook'
      case 'yahoo':
        return 'Add to Yahoo Calendar'
      default:
        return 'Add to calendar'
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={size}
            onClick={handleClick}
            className={`transition-colors ${
              isSuccess 
                ? 'text-green-600 hover:text-green-700' 
                : 'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20'
            }`}
          >
            {getButtonContent()}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}