'use server'

import { revalidatePath } from 'next/cache'
import { createTask as createTaskFirebase, updateTask as updateTaskFirebase, deleteTask as deleteTaskFirebase } from '@/lib/firebase/tasks'
import type { Task } from '@/types/task'

export async function createTask(userId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>) {
  try {
    const task = await createTaskFirebase(userId, taskData)
    
    revalidatePath('/')
    revalidatePath('/tasks')
    
    return { success: true, task }
  } catch (error) {
    console.error('Server Action - Create task error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create task' 
    }
  }
}

export async function updateTask(taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) {
  try {
    await updateTaskFirebase(taskId, updates)
    
    revalidatePath('/')
    revalidatePath('/tasks')
    revalidatePath(`/tasks/${taskId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Server Action - Update task error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update task' 
    }
  }
}

export async function deleteTask(taskId: string) {
  try {
    await deleteTaskFirebase(taskId)
    
    revalidatePath('/')
    revalidatePath('/tasks')
    
    return { success: true }
  } catch (error) {
    console.error('Server Action - Delete task error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete task' 
    }
  }
}

export async function toggleTaskCompletion(taskId: string, status: 'pending' | 'in_progress' | 'completed' | 'cancelled') {
  try {
    await updateTaskFirebase(taskId, { status })
    
    revalidatePath('/')
    revalidatePath('/tasks')
    revalidatePath(`/tasks/${taskId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Server Action - Toggle task completion error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to toggle task completion' 
    }
  }
}