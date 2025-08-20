import type { Meeting } from '@/types/meeting'

// Format date for iCal format (YYYYMMDDTHHMMSS)
function formatDateForICal(date: string, time: string): string {
  const [year, month, day] = date.split('-')
  const [hour, minute] = time.split(':')
  return `${year}${month}${day}T${hour}${minute}00`
}

// Format date for iCal format with timezone (UTC)
function formatDateForICalUTC(date: string, time: string): string {
  const [year, month, day] = date.split('-')
  const [hour, minute] = time.split(':')
  const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute))
  return dateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

// Calculate end time based on duration
function calculateEndTime(date: string, time: string, duration: number): string {
  const [year, month, day] = date.split('-')
  const [hour, minute] = time.split(':')
  const startTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute))
  const endTime = new Date(startTime.getTime() + duration * 60 * 1000)
  
  return endTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

// Generate iCal/ICS file content
export function generateICalEvent(meeting: Meeting): string {
  const startTimeUTC = formatDateForICalUTC(meeting.date, meeting.time)
  const endTimeUTC = calculateEndTime(meeting.date, meeting.time, meeting.duration)
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  
  // Escape special characters for iCal format
  const escapeText = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;')
      .replace(/\n/g, '\\n')
  }

  const attendeesList = meeting.attendees?.length > 0 
    ? meeting.attendees.map(attendee => `ATTENDEE:MAILTO:${attendee}`).join('\r\n')
    : ''

  const icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Meetings Hub//Meeting Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${meeting.id}@meetingshub.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${startTimeUTC}`,
    `DTEND:${endTimeUTC}`,
    `SUMMARY:${escapeText(meeting.title)}`,
    `DESCRIPTION:${escapeText(meeting.description)}`,
    `LOCATION:${escapeText(meeting.location)}`,
    `STATUS:${meeting.completed ? 'CONFIRMED' : 'TENTATIVE'}`,
    `PRIORITY:${meeting.priority === 'high' ? '1' : meeting.priority === 'medium' ? '5' : '9'}`,
    // Add reminders - 15 minutes before
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${escapeText(meeting.title)}`,
    'END:VALARM',
    // Add another reminder - 1 hour before for high priority meetings
    ...(meeting.priority === 'high' ? [
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'ACTION:DISPLAY',
      `DESCRIPTION:1 Hour Reminder: ${escapeText(meeting.title)}`,
      'END:VALARM'
    ] : []),
    ...(attendeesList ? [attendeesList] : []),
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')

  return icalContent
}

// Download iCal file
export function downloadICalFile(meeting: Meeting): void {
  const icalContent = generateICalEvent(meeting)
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${meeting.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

// Generate Google Calendar URL
export function generateGoogleCalendarUrl(meeting: Meeting): string {
  const startDate = formatDateForICalUTC(meeting.date, meeting.time)
  const endDate = calculateEndTime(meeting.date, meeting.time, meeting.duration)
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: meeting.title,
    dates: `${startDate}/${endDate}`,
    details: meeting.description,
    location: meeting.location,
    trp: 'false' // Don't show "Add to calendar" popup
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

// Generate Outlook Calendar URL
export function generateOutlookCalendarUrl(meeting: Meeting): string {
  const startTime = new Date(`${meeting.date}T${meeting.time}:00`)
  const endTime = new Date(startTime.getTime() + meeting.duration * 60 * 1000)
  
  const params = new URLSearchParams({
    subject: meeting.title,
    body: meeting.description,
    location: meeting.location,
    startdt: startTime.toISOString(),
    enddt: endTime.toISOString(),
    allday: 'false',
    uid: meeting.id
  })

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}

// Generate Yahoo Calendar URL
export function generateYahooCalendarUrl(meeting: Meeting): string {
  const startTime = new Date(`${meeting.date}T${meeting.time}:00`)
  const endTime = new Date(startTime.getTime() + meeting.duration * 60 * 1000)
  
  const formatYahooDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const params = new URLSearchParams({
    v: '60',
    title: meeting.title,
    st: formatYahooDate(startTime),
    et: formatYahooDate(endTime),
    desc: meeting.description,
    in_loc: meeting.location
  })

  return `https://calendar.yahoo.com/?${params.toString()}`
}

// Generate Apple Calendar URL (webcal format)
export function generateAppleCalendarUrl(meeting: Meeting): string {
  const icalContent = generateICalEvent(meeting)
  const blob = new Blob([icalContent], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  
  // Convert http/https to webcal for Apple Calendar
  return url.replace(/^https?:/, 'webcal:')
}

// Get all calendar integration options
export interface CalendarOption {
  name: string
  icon: string
  action: () => void
  url?: string
}

export function getCalendarOptions(meeting: Meeting): CalendarOption[] {
  return [
    {
      name: 'Download .ics file',
      icon: '📅',
      action: () => downloadICalFile(meeting)
    },
    {
      name: 'Google Calendar',
      icon: '🟦',
      action: () => window.open(generateGoogleCalendarUrl(meeting), '_blank'),
      url: generateGoogleCalendarUrl(meeting)
    },
    {
      name: 'Outlook',
      icon: '🟨',
      action: () => window.open(generateOutlookCalendarUrl(meeting), '_blank'),
      url: generateOutlookCalendarUrl(meeting)
    },
    {
      name: 'Yahoo Calendar',
      icon: '🟣',
      action: () => window.open(generateYahooCalendarUrl(meeting), '_blank'),
      url: generateYahooCalendarUrl(meeting)
    }
  ]
}

// Copy calendar link to clipboard
export async function copyCalendarLink(meeting: Meeting, provider: 'google' | 'outlook' | 'yahoo'): Promise<boolean> {
  try {
    let url: string
    switch (provider) {
      case 'google':
        url = generateGoogleCalendarUrl(meeting)
        break
      case 'outlook':
        url = generateOutlookCalendarUrl(meeting)
        break
      case 'yahoo':
        url = generateYahooCalendarUrl(meeting)
        break
      default:
        return false
    }
    
    await navigator.clipboard.writeText(url)
    return true
  } catch (error) {
    console.error('Failed to copy calendar link:', error)
    return false
  }
}