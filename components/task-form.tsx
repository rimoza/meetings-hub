"use client"

import { useState, useEffect } from "react"
import { X, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Task } from "@/types/task"
import { useMeetings } from "@/hooks/use-meetings"

interface TaskFormProps {
  task?: Task
  isOpen: boolean
  onClose: () => void
  onSubmit: (task: Omit<Task, "id">) => void
  meetingId?: string
}

export function TaskForm({ task, isOpen, onClose, onSubmit, meetingId }: TaskFormProps) {
  const { meetings } = useMeetings()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    status: "pending" as Task["status"],
    assignee: "",
    type: "task" as Task["type"],
    priority: "medium" as Task["priority"],
    meetingId: meetingId || "",
    todoList: [] as string[],
    labels: [] as string[],
    tags: [] as string[],
  })

  const [newTodo, setNewTodo] = useState("")
  const [newLabel, setNewLabel] = useState("")
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        date: task.date,
        status: task.status,
        assignee: task.assignee || "",
        type: task.type,
        priority: task.priority,
        meetingId: task.meetingId || "none",
        todoList: task.todoList || [],
        labels: task.labels || [],
        tags: task.tags || [],
      })
    } else if (meetingId) {
      setFormData(prev => ({ ...prev, meetingId, type: "follow_up" }))
    } else {
      setFormData({
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        status: "pending",
        assignee: "",
        type: "task",
        priority: "medium",
        meetingId: "none",
        todoList: [],
        labels: [],
        tags: [],
      })
    }
  }, [task, meetingId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      meetingId: formData.meetingId === "none" ? "" : formData.meetingId,
      createdAt: task?.createdAt || new Date(),
      updatedAt: new Date(),
    })
    onClose()
  }

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      setFormData(prev => ({
        ...prev,
        todoList: [...prev.todoList, newTodo.trim()]
      }))
      setNewTodo("")
    }
  }

  const handleRemoveTodo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      todoList: prev.todoList.filter((_, i) => i !== index)
    }))
  }

  const handleAddLabel = () => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      setFormData(prev => ({
        ...prev,
        labels: [...prev.labels, newLabel.trim()]
      }))
      setNewLabel("")
    }
  }

  const handleRemoveLabel = (label: string) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(l => l !== label)
    }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Enter task title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: Task["type"]) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Enter task description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Task["status"]) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: Task["priority"]) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Input
                id="assignee"
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                placeholder="Enter assignee name"
              />
            </div>

            {formData.type === "follow_up" && (
              <div className="space-y-2">
                <Label htmlFor="meetingId">Related Meeting</Label>
                <Select
                  value={formData.meetingId}
                  onValueChange={(value) => setFormData({ ...formData, meetingId: value })}
                >
                  <SelectTrigger id="meetingId">
                    <SelectValue placeholder="Select meeting" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {meetings.map((meeting) => (
                      <SelectItem key={meeting.id} value={meeting.id}>
                        {meeting.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>To-Do List</Label>
            <div className="flex gap-2">
              <Input
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a to-do item"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTodo())}
              />
              <Button type="button" onClick={handleAddTodo} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.todoList.length > 0 && (
              <div className="space-y-1 mt-2">
                {formData.todoList.map((todo, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{todo}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemoveTodo(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Labels</Label>
              <div className="flex gap-2">
                <Input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Add a label"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLabel())}
                />
                <Button type="button" onClick={handleAddLabel} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.labels.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.labels.map((label) => (
                    <Badge key={label} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveLabel(label)}>
                      {label} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                      #{tag} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {task ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}