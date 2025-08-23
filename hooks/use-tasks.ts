"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import type { Task, TaskFilters, TodoItem } from "@/types/task";
import {
  subscribeTasks,
  createTask as createTaskFirebase,
  updateTask as updateTaskFirebase,
  deleteTask as deleteTaskFirebase,
  toggleTaskCompletion as toggleTaskFirebase,
} from "@/lib/firebase/tasks";

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({
    search: "",
    status: "all",
    type: "all",
    priority: "all",
  });

  // Subscribe to real-time task updates
  useEffect(() => {
    if (!user?.uid) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = subscribeTasks(user.uid, (tasks) => {
      console.log(`Received ${tasks.length} tasks from Firebase`);
      setTasks(tasks);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower) ||
          task.assignee?.toLowerCase().includes(searchLower) ||
          task.labels?.some((label) =>
            label.toLowerCase().includes(searchLower),
          ) ||
          task.tags?.some((tag) => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      if (filters.status !== "all" && task.status !== filters.status)
        return false;
      if (filters.type !== "all" && task.type !== filters.type) return false;
      if (filters.priority !== "all" && task.priority !== filters.priority)
        return false;
      if (filters.assignee && task.assignee !== filters.assignee) return false;

      return true;
    });
  }, [tasks, filters]);

  const pendingTasks = useMemo(
    () => tasks.filter((task) => task.status === "pending"),
    [tasks],
  );

  const inProgressTasks = useMemo(
    () => tasks.filter((task) => task.status === "in_progress"),
    [tasks],
  );

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.status === "completed"),
    [tasks],
  );

  const followUpTasks = useMemo(
    () => tasks.filter((task) => task.type === "follow_up"),
    [tasks],
  );

  // Create a new task
  const createTask = async (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "completedAt">,
  ) => {
    if (!user?.uid) {
      setError("User not authenticated");
      return;
    }

    try {
      setError(null);
      await createTaskFirebase(user.uid, taskData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      } else {
        setError("An unknown error occurred");
        throw err;
      }
    }
  };

  // Update a task
  const updateTask = async (
    id: string,
    updates: Partial<Omit<Task, "id" | "createdAt">>,
  ) => {
    try {
      setError(null);
      await updateTaskFirebase(id, updates);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      } else {
        setError("An unknown error occurred");
        throw err;
      }
    }
  };

  // Delete a task
  const deleteTask = async (id: string) => {
    try {
      setError(null);
      await deleteTaskFirebase(id);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      } else {
        setError("An unknown error occurred");
        throw err;
      }
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    try {
      setError(null);
      await toggleTaskFirebase(
        id,
        task.status === "completed" ? "pending" : "completed",
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      } else {
        setError("An unknown error occurred");
        throw err;
      }
    }
  };

  const addTodoItem = async (taskId: string, todoText: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      const currentTodos = task.todoList || [];
      const newTodoItem = {
        id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: todoText,
        status: "pending" as const,
      };
      await updateTask(taskId, {
        todoList: [...currentTodos, newTodoItem],
      });
    }
  };

  const removeTodoItem = async (taskId: string, todoIndex: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.todoList) {
      const updatedTodos = task.todoList.filter(
        (_, index) => index !== todoIndex,
      );
      await updateTask(taskId, {
        todoList: updatedTodos,
      });
    }
  };

  const updateTodoItem = async (
    taskId: string,
    todoIndex: number,
    updatedTodo: Partial<Omit<TodoItem, "id">>,
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.todoList && task.todoList[todoIndex]) {
      const updatedTodos = [...task.todoList];
      updatedTodos[todoIndex] = {
        ...updatedTodos[todoIndex],
        ...updatedTodo,
      };
      await updateTask(taskId, {
        todoList: updatedTodos,
      });
    }
  };

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
    isLoading,
    error,
  };
}
