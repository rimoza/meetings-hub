"use client"

import { useState, useEffect, useMemo } from "react"
import type { Task, TaskFilters } from "@/types/task"

const STORAGE_KEY = "meetings-hub-tasks"

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filters, setFilters] = useState<TaskFilters>({
    search: "",
    status: "all",
    type: "all",
    priority: "all",
  })

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setTasks(parsed)
      } catch (error) {
        console.error("Failed to parse stored tasks:", error)
      }
    }
  }, [])

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks))
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch = 
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower) ||
          task.assignee?.toLowerCase().includes(searchLower) ||
          task.labels?.some(label => label.toLowerCase().includes(searchLower)) ||
          task.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        if (!matchesSearch) return false
      }

      if (filters.status !== "all" && task.status !== filters.status) return false
      if (filters.type !== "all" && task.type !== filters.type) return false
      if (filters.priority !== "all" && task.priority !== filters.priority) return false
      if (filters.assignee && task.assignee !== filters.assignee) return false

      return true
    })
  }, [tasks, filters])

  const pendingTasks = useMemo(() => 
    tasks.filter(task => task.status === "pending"),
    [tasks]
  )

  const inProgressTasks = useMemo(() => 
    tasks.filter(task => task.status === "in_progress"),
    [tasks]
  )

  const completedTasks = useMemo(() => 
    tasks.filter(task => task.status === "completed"),
    [tasks]
  )

  const followUpTasks = useMemo(() => 
    tasks.filter(task => task.type === "follow_up"),
    [tasks]
  )

  const createTask = (taskData: Omit<Task, "id">) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
    }
    saveTasks([...tasks, newTask])
    return newTask
  }

  const updateTask = (id: string, updates: Partial<Omit<Task, "id">>) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        const updatedTask = { 
          ...task, 
          ...updates,
          updatedAt: new Date()
        }
        if (updates.status === "completed" && task.status !== "completed") {
          updatedTask.completedAt = new Date()
        }
        return updatedTask
      }
      return task
    })
    saveTasks(updatedTasks)
  }

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter((task) => task.id !== id))
  }

  const toggleTaskCompletion = (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (task) {
      updateTask(id, {
        status: task.status === "completed" ? "pending" : "completed"
      })
    }
  }

  const addTodoItem = (taskId: string, todoItem: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      const currentTodos = task.todoList || []
      updateTask(taskId, {
        todoList: [...currentTodos, todoItem]
      })
    }
  }

  const removeTodoItem = (taskId: string, todoIndex: number) => {
    const task = tasks.find(t => t.id === taskId)
    if (task && task.todoList) {
      const updatedTodos = task.todoList.filter((_, index) => index !== todoIndex)
      updateTask(taskId, {
        todoList: updatedTodos
      })
    }
  }

  const updateTodoItem = (taskId: string, todoIndex: number, newValue: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task && task.todoList) {
      const updatedTodos = [...task.todoList]
      updatedTodos[todoIndex] = newValue
      updateTask(taskId, {
        todoList: updatedTodos
      })
    }
  }

  return {
    tasks,
    filteredTasks,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    followUpTasks,
    filters,
    setFilters,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    addTodoItem,
    removeTodoItem,
    updateTodoItem,
  }
}