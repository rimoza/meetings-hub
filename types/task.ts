export interface TodoItem {
  id: string
  text: string
  status: "pending" | "in_progress" | "completed"
}

export interface Task {
  id: string
  title: string
  description: string
  date: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  assignee?: string
  todoList?: TodoItem[]
  labels?: string[]
  tags?: string[]
  type: "task" | "follow_up"
  meetingId?: string
  priority: "low" | "medium" | "high"
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export interface TaskFilters {
  search: string
  status: "all" | "pending" | "in_progress" | "completed" | "cancelled"
  type: "all" | "task" | "follow_up"
  priority: "all" | "low" | "medium" | "high"
  assignee?: string
}

export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled"
export type TaskType = "task" | "follow_up"
export type TaskPriority = "low" | "medium" | "high"
export type TodoStatus = "pending" | "in_progress" | "completed"