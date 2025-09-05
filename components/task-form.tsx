"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import type { Task, TodoItem } from "@/types/task";
import { useMeetings } from "@/hooks/use-meetings";

// Zod schema for task form validation
const taskFormSchema = z.object({
  title: z.string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(100, { message: "Title must not exceed 100 characters" }),
  description: z.string()
    .max(500, { message: "Description must not exceed 500 characters" })
    .optional(),
  date: z.string()
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, { message: "Date must be today or in the future" }),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"] as const),
  assignee: z.string()
    .max(100, { message: "Assignee name must not exceed 100 characters" })
    .optional(),
  type: z.enum(["task", "follow_up"] as const),
  priority: z.enum(["low", "medium", "high"] as const),
  meetingId: z.string().optional(),
  todoList: z.array(z.object({
    id: z.string(),
    text: z.string().min(1, { message: "Todo item cannot be empty" }),
    status: z.enum(["pending", "in_progress", "completed"] as const),
  })).optional(),
  labels: z.array(z.string().min(1).max(30)).optional(),
  tags: z.array(z.string().min(1).max(30)).optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, "id">) => void;
  meetingId?: string;
}

export function TaskForm({
  task,
  isOpen,
  onClose,
  onSubmit,
  meetingId,
}: TaskFormProps) {
  const { meetings } = useMeetings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTodo, setNewTodo] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newTag, setNewTag] = useState("");
  const [todoError, setTodoError] = useState("");
  const [labelError, setLabelError] = useState("");
  const [tagError, setTagError] = useState("");

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      status: "pending",
      assignee: "",
      type: meetingId ? "follow_up" : "task",
      priority: "medium",
      meetingId: meetingId || "",
      todoList: [],
      labels: [],
      tags: [],
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description,
        date: task.date,
        status: task.status,
        assignee: task.assignee || "",
        type: task.type,
        priority: task.priority,
        meetingId: task.meetingId || "",
        todoList: task.todoList || [],
        labels: task.labels || [],
        tags: task.tags || [],
      });
    } else if (isOpen) {
      form.reset({
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        status: "pending",
        assignee: "",
        type: meetingId ? "follow_up" : "task",
        priority: "medium",
        meetingId: meetingId || "",
        todoList: [],
        labels: [],
        tags: [],
      });
    }
  }, [task, meetingId, isOpen, form]);

  const handleSubmitForm = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      onSubmit({
        ...data,
        description: data.description || "",
        assignee: data.assignee || "",
        meetingId: data.type === "follow_up" && data.meetingId ? data.meetingId : "",
        todoList: data.todoList || [],
        labels: data.labels || [],
        tags: data.tags || [],
        createdAt: task?.createdAt || new Date(),
        updatedAt: new Date(),
      });
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTodo = () => {
    const trimmedTodo = newTodo.trim();
    setTodoError("");

    if (!trimmedTodo) {
      setTodoError("Please enter a todo item");
      return;
    }

    if (trimmedTodo.length > 200) {
      setTodoError("Todo item must not exceed 200 characters");
      return;
    }

    const newTodoItem: TodoItem = {
      id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: trimmedTodo,
      status: "pending",
    };
    
    const currentTodos = form.getValues("todoList") ?? [];
    form.setValue("todoList", [...currentTodos, newTodoItem]);
    setNewTodo("");
    setTodoError("");
  };

  const handleRemoveTodo = (index: number) => {
    const currentTodos = form.getValues("todoList") ?? [];
    form.setValue("todoList", currentTodos.filter((_, i) => i !== index));
  };

  const handleAddLabel = () => {
    const trimmedLabel = newLabel.trim();
    setLabelError("");

    if (!trimmedLabel) {
      setLabelError("Please enter a label");
      return;
    }

    if (trimmedLabel.length > 30) {
      setLabelError("Label must not exceed 30 characters");
      return;
    }

    const currentLabels = form.getValues("labels") ?? [];
    
    if (currentLabels.includes(trimmedLabel)) {
      setLabelError("This label already exists");
      return;
    }

    form.setValue("labels", [...currentLabels, trimmedLabel]);
    setNewLabel("");
    setLabelError("");
  };

  const handleRemoveLabel = (label: string) => {
    const currentLabels = form.getValues("labels") ?? [];
    form.setValue("labels", currentLabels.filter((l) => l !== label));
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    setTagError("");

    if (!trimmedTag) {
      setTagError("Please enter a tag");
      return;
    }

    if (trimmedTag.length > 30) {
      setTagError("Tag must not exceed 30 characters");
      return;
    }

    const currentTags = form.getValues("tags") ?? [];
    
    if (currentTags.includes(trimmedTag)) {
      setTagError("This tag already exists");
      return;
    }

    form.setValue("tags", [...currentTags, trimmedTag]);
    setNewTag("");
    setTagError("");
  };

  const handleRemoveTag = (tag: string) => {
    const currentTags = form.getValues("tags") ?? [];
    form.setValue("tags", currentTags.filter((t) => t !== tag));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter task title"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="w-full">
                        <SelectItem value="task">Task</SelectItem>
                        <SelectItem value="follow_up">Follow Up</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter task description (optional)"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Date *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="h-10 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 w-full text-sm">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="w-full">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Priority *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 w-full text-sm">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="w-full">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className={`grid gap-3 ${form.watch("type") === "follow_up" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
              <FormField
                control={form.control}
                name="assignee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Assignee</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter assignee name (optional)"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Person responsible for this task</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("type") === "follow_up" && (
                <FormField
                  control={form.control}
                  name="meetingId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Related Meeting</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="Select meeting" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-full">
                          <SelectItem value="">None</SelectItem>
                          {meetings.map((meeting) => (
                            <SelectItem key={meeting.id} value={meeting.id}>
                              {meeting.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="todoList"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">To-Do List</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      value={newTodo}
                      onChange={(e) => {
                        setNewTodo(e.target.value);
                        setTodoError("");
                      }}
                      placeholder="Add a to-do item"
                      className="h-10"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTodo();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddTodo} className="h-10 px-4">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {todoError && (
                    <p className="text-destructive text-sm">{todoError}</p>
                  )}
                  {field.value && field.value?.length && field.value.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {field.value.map((todo, index) => (
                        <div
                          key={todo.id}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                todo.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : todo.status === "in_progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {todo.status}
                            </span>
                            <span className="text-sm">{todo.text}</span>
                          </div>
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
                  <FormDescription>Create a checklist of items for this task</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="labels"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Labels</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        value={newLabel}
                        onChange={(e) => {
                          setNewLabel(e.target.value);
                          setLabelError("");
                        }}
                        placeholder="Add a label"
                        className="h-10"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddLabel();
                          }
                        }}
                      />
                      <Button type="button" onClick={handleAddLabel} className="h-10 px-4">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {labelError && (
                      <p className="text-destructive text-sm">{labelError}</p>
                    )}
                    {field.value && field.value?.length && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.value.map((label) => (
                          <Badge
                            key={label}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => handleRemoveLabel(label)}
                          >
                            {label} <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                    <FormDescription>Categorize your task with labels</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Tags</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => {
                          setNewTag(e.target.value);
                          setTagError("");
                        }}
                        placeholder="Add a tag"
                        className="h-10"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button type="button" onClick={handleAddTag} className="h-10 px-4">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {tagError && (
                      <p className="text-destructive text-sm">{tagError}</p>
                    )}
                    {field.value && field.value?.length && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.value.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            #{tag} <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                    <FormDescription>Add searchable tags</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {task ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  task ? "Update" : "Create"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}