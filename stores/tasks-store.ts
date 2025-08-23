import { create } from 'zustand'
import type { Task, TaskFilters, TodoItem } from '@/types/task'

interface TasksStore {
  // State
  tasks: Task[]
  filteredTasks: Task[]
  isLoading: boolean
  error: string | null
  filters: TaskFilters

  // Actions
  setTasks: (tasks: Task[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: TaskFilters) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  removeTask: (id: string) => void

  // Todo item actions
  addTodoItem: (taskId: string, todoText: string) => void
  updateTodoItem: (taskId: string, todoIndex: number, updates: Partial<Omit<TodoItem, 'id'>>) => void
  removeTodoItem: (taskId: string, todoIndex: number) => void

  // Computed getters
  getPendingTasks: () => Task[]
  getInProgressTasks: () => Task[]
  getCompletedTasks: () => Task[]
  getFollowUpTasks: () => Task[]
  getHighPriorityTasks: () => Task[]
}

const applyFilters = (tasks: Task[], filters: TaskFilters): Task[] => {
  return tasks.filter((task) => {
    // Search filter
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

    // Status filter
    if (filters.status !== 'all' && task.status !== filters.status) return false

    // Type filter
    if (filters.type !== 'all' && task.type !== filters.type) return false

    // Priority filter
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false

    // Assignee filter
    if (filters.assignee && task.assignee !== filters.assignee) return false

    return true
  })
}

export const useTasksStore = create<TasksStore>((set, get) => ({
  // Initial state
  tasks: [],
  filteredTasks: [],
  isLoading: true,
  error: null,
  filters: {
    search: '',
    status: 'all',
    type: 'all',
    priority: 'all'
  },

  // Actions
  setTasks: (tasks) => {
    const { filters } = get()
    const filteredTasks = applyFilters(tasks, filters)
    set({ tasks, filteredTasks, isLoading: false })
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setFilters: (filters) => {
    const { tasks } = get()
    const filteredTasks = applyFilters(tasks, filters)
    set({ filters, filteredTasks })
  },

  addTask: (task) => {
    const { tasks, filters } = get()
    const newTasks = [...tasks, task]
    const filteredTasks = applyFilters(newTasks, filters)
    set({ tasks: newTasks, filteredTasks })
  },

  updateTask: (id, updates) => {
    const { tasks, filters } = get()
    const newTasks = tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    )
    const filteredTasks = applyFilters(newTasks, filters)
    set({ tasks: newTasks, filteredTasks })
  },

  removeTask: (id) => {
    const { tasks, filters } = get()
    const newTasks = tasks.filter(task => task.id !== id)
    const filteredTasks = applyFilters(newTasks, filters)
    set({ tasks: newTasks, filteredTasks })
  },

  // Todo item actions
  addTodoItem: (taskId, todoText) => {
    const { tasks, filters } = get()
    const newTasks = tasks.map(task => {
      if (task.id === taskId) {
        const currentTodos = task.todoList || []
        const newTodoItem: TodoItem = {
          id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: todoText,
          status: 'pending'
        }
        return {
          ...task,
          todoList: [...currentTodos, newTodoItem]
        }
      }
      return task
    })
    const filteredTasks = applyFilters(newTasks, filters)
    set({ tasks: newTasks, filteredTasks })
  },

  updateTodoItem: (taskId, todoIndex, updates) => {
    const { tasks, filters } = get()
    const newTasks = tasks.map(task => {
      if (task.id === taskId && task.todoList && task.todoList[todoIndex]) {
        const updatedTodos = [...task.todoList]
        updatedTodos[todoIndex] = {
          ...updatedTodos[todoIndex],
          ...updates
        }
        return {
          ...task,
          todoList: updatedTodos
        }
      }
      return task
    })
    const filteredTasks = applyFilters(newTasks, filters)
    set({ tasks: newTasks, filteredTasks })
  },

  removeTodoItem: (taskId, todoIndex) => {
    const { tasks, filters } = get()
    const newTasks = tasks.map(task => {
      if (task.id === taskId && task.todoList) {
        const updatedTodos = task.todoList.filter((_, index) => index !== todoIndex)
        return {
          ...task,
          todoList: updatedTodos
        }
      }
      return task
    })
    const filteredTasks = applyFilters(newTasks, filters)
    set({ tasks: newTasks, filteredTasks })
  },

  // Computed getters
  getPendingTasks: () => {
    const { tasks } = get()
    return tasks.filter(task => task.status === 'pending')
  },

  getInProgressTasks: () => {
    const { tasks } = get()
    return tasks.filter(task => task.status === 'in_progress')
  },

  getCompletedTasks: () => {
    const { tasks } = get()
    return tasks.filter(task => task.status === 'completed')
  },

  getFollowUpTasks: () => {
    const { tasks } = get()
    return tasks.filter(task => task.type === 'follow_up')
  },

  getHighPriorityTasks: () => {
    const { tasks } = get()
    return tasks.filter(task => task.priority === 'high')
  }
}))