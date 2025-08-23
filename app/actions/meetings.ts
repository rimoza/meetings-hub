'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createMeeting as createMeetingFirebase, updateMeeting as updateMeetingFirebase, deleteMeeting as deleteMeetingFirebase, toggleMeetingCompletion as toggleMeetingFirebase } from '@/lib/firebase/meetings'
import type { Meeting } from '@/types/meeting'

export async function createMeeting(userId: string, meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const meeting = await createMeetingFirebase(userId, meetingData)
    
    revalidatePath('/')
    revalidatePath('/meetings')
    
    return { success: true, meeting }
  } catch (error) {
    console.error('Server Action - Create meeting error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create meeting' 
    }
  }
}

export async function updateMeeting(meetingId: string, updates: Partial<Omit<Meeting, 'id' | 'createdAt'>>) {
  try {
    await updateMeetingFirebase(meetingId, updates)
    
    revalidatePath('/')
    revalidatePath('/meetings')
    revalidatePath(`/meetings/${meetingId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Server Action - Update meeting error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update meeting' 
    }
  }
}

export async function deleteMeeting(meetingId: string) {
  try {
    await deleteMeetingFirebase(meetingId)
    
    revalidatePath('/')
    revalidatePath('/meetings')
    
    return { success: true }
  } catch (error) {
    console.error('Server Action - Delete meeting error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete meeting' 
    }
  }
}

export async function toggleMeetingCompletion(meetingId: string, completed: boolean) {
  try {
    await toggleMeetingFirebase(meetingId, completed)
    
    revalidatePath('/')
    revalidatePath('/meetings')
    revalidatePath(`/meetings/${meetingId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Server Action - Toggle completion error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to toggle completion' 
    }
  }
}

export async function redirectToMeeting(meetingId: string) {
  redirect(`/meetings/${meetingId}`)
}