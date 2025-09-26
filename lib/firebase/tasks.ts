import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
  getFirestore,
  type Firestore,
  type FieldValue,
} from "firebase/firestore";
import { app, isFirebaseConfigured } from "@/lib/firebase/config";
import type { Task, TodoItem } from "@/types/task";

const COLLECTION_NAME = "tasks";
const db: Firestore | null =
  app && isFirebaseConfigured() ? getFirestore(app) : null;

// Convert Firestore document to Task type
const convertDocToTask = (doc: QueryDocumentSnapshot<DocumentData>): Task => {
  const data = doc.data();

  // Handle migration from string[] to TodoItem[]
  let todoList: TodoItem[] = [];
  if (data.todoList) {
    if (Array.isArray(data.todoList) && data.todoList.length > 0) {
      if (typeof data.todoList[0] === "string") {
        // Migrate from string[] to TodoItem[]
        todoList = data.todoList.map((text: string, index: number) => ({
          id: `todo-${index}`,
          text,
          status: "pending" as const,
        }));
      } else {
        // Already TodoItem[]
        todoList = data.todoList;
      }
    }
  }

  return {
    id: doc.id,
    title: data.title,
    description: data.description,
    date: data.date,
    status: data.status,
    assignee: data.assignee,
    todoList,
    labels: data.labels || [],
    tags: data.tags || [],
    type: data.type,
    meetingId: data.meetingId,
    priority: data.priority,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    completedAt: data.completedAt?.toDate() || undefined,
  };
};

// Create a new task
export const createTask = async (
  userId: string,
  taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "completedAt">,
) => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    // Ensure required fields are present and clean undefined values
    const cleanTaskData = {
      ...taskData,
      userId,
      todoList: taskData.todoList || [],
      labels: taskData.labels || [],
      tags: taskData.tags || [],
      assignee: taskData.assignee || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanTaskData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

// Helper function to extract todo items from note content
const extractTodoList = (content: string): string[] => {
  const todoItems: string[] = [];

  // Match various list formats:
  // - Item 1
  // * Item 2
  // 1. Item 3
  // • Item 4
  // ☐ Item 5
  // [ ] Item 6
  // - [ ] Item 7
  const listPatterns = [
    /^[\s]*[-*•]\s+(.+)$/gm, // - Item, * Item, • Item
    /^[\s]*\d+\.\s+(.+)$/gm, // 1. Item
    /^[\s]*☐\s+(.+)$/gm, // ☐ Item
    /^[\s]*\[\s*\]\s+(.+)$/gm, // [ ] Item
    /^[\s]*-\s*\[\s*\]\s+(.+)$/gm, // - [ ] Item
  ];

  for (const pattern of listPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const item = match[1].trim();
      if (item && !todoItems.includes(item)) {
        todoItems.push(item);
      }
    }
    pattern.lastIndex = 0; // Reset regex state
  }

  return todoItems;
};

// Create task from meeting note
export const createTaskFromMeetingNote = async (
  userId: string,
  meetingId: string,
  meetingTitle: string,
  noteContent: string,
  priority: "low" | "medium" | "high" = "medium",
  assignee?: string,
  dueDate?: string,
) => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    console.log("Creating task from meeting note:", {
      userId,
      meetingId,
      meetingTitle,
      noteContent,
      priority,
      assignee,
      dueDate
    });

    // Extract todo items from the note content
    const todoList = extractTodoList(noteContent);
    console.log("Extracted todo items:", todoList);

    // Convert string array to TodoItem array
    const todoItems: TodoItem[] = todoList.length > 0
      ? todoList.map((text, index) => ({
          id: `todo-${Date.now()}-${index}`,
          text,
          status: "pending" as const,
        }))
      : [];

    const taskData = {
      title: `Follow-up: ${meetingTitle}`,
      description: noteContent,
      date: dueDate || new Date().toISOString().split("T")[0], // Use provided due date or today's date
      status: "pending" as const,
      type: "follow_up" as const,
      meetingId,
      priority,
      assignee: assignee || undefined,
      todoList: todoItems,
      labels: [],
      tags: [],
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log("Task data to be created:", taskData);

    // Use the regular createTask function to ensure consistency
    const taskId = await createTask(userId, taskData);
    console.log("Task created successfully with ID:", taskId);
    return taskId;
  } catch (error) {
    console.error("Error creating task from meeting note:", error);
    throw error;
  }
};

// Update a task
export const updateTask = async (
  taskId: string,
  updates: Partial<Omit<Task, "id" | "createdAt">>,
) => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    // Add completedAt timestamp if status is being changed to completed
    if (updates.status === "completed") {
      (updateData as DocumentData & { completedAt?: FieldValue }).completedAt =
        serverTimestamp();
    }

    await updateDoc(taskRef, updateData);
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId: string) => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    await deleteDoc(doc(db, COLLECTION_NAME, taskId));
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

// Get all tasks for all users
export const getUserTasks = async (userId: string): Promise<Task[]> => {
  console.log(userId, 'userId in getUserTasks');
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    // Get all tasks regardless of userId
    const q = query(
      collection(db, COLLECTION_NAME)
    );

    const querySnapshot = await getDocs(q);
    const tasks = querySnapshot.docs.map(convertDocToTask);

    // Sort by date and priority
    return tasks.sort((a, b) => {
      const dateComparison = a.date.localeCompare(b.date);
      if (dateComparison !== 0) return dateComparison;

      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

// Subscribe to real-time task updates
export const subscribeTasks = (
  userId: string,
  callback: (tasks: Task[]) => void,
) => {
  if (!db) {
    console.warn("Firebase not configured, returning empty tasks");
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }

  // Get all tasks regardless of userId
  const q = query(
    collection(db, COLLECTION_NAME)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks = snapshot.docs.map(convertDocToTask);

      // Sort by date and priority
      const sortedTasks = tasks.sort((a, b) => {
        const dateComparison = a.date.localeCompare(b.date);
        if (dateComparison !== 0) return dateComparison;

        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      callback(sortedTasks);
    },
    (error) => {
      console.error("Error in tasks subscription:", error);
    },
  );
};

// Get tasks for a specific meeting
export const getMeetingTasks = async (
  userId: string,
  meetingId: string,
): Promise<Task[]> => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    // Get all tasks for this meeting regardless of userId
    const q = query(
      collection(db, COLLECTION_NAME),
      where("meetingId", "==", meetingId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertDocToTask);
  } catch (error) {
    console.error("Error fetching meeting tasks:", error);
    throw error;
  }
};

// Toggle task completion
export const toggleTaskCompletion = async (
  taskId: string,
  status: "completed" | "pending",
) => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    const updateData: DocumentData & { completedAt?: FieldValue } = {
      status,
      updatedAt: serverTimestamp(),
      ...(status === "completed" ? { completedAt: serverTimestamp() } : {}),
    };

    await updateDoc(taskRef, updateData);
  } catch (error) {
    console.error("Error toggling task completion:", error);
    throw error;
  }
};

// Update todo item status
export const updateTodoStatus = async (
  taskId: string,
  todoId: string,
  status: "pending" | "in_progress" | "completed",
) => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    const taskDoc = await getDoc(taskRef);

    if (!taskDoc.exists()) {
      throw new Error("Task not found");
    }

    const task = convertDocToTask(taskDoc);
    const updatedTodoList =
      task.todoList?.map((todo) =>
        todo.id === todoId ? { ...todo, status } : todo,
      ) || [];

    await updateDoc(taskRef, {
      todoList: updatedTodoList,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating todo status:", error);
    throw error;
  }
};

// Add a new todo item to a task
export const addTodoItem = async (
  taskId: string,
  todoText: string,
): Promise<TodoItem> => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    const taskDoc = await getDoc(taskRef);

    if (!taskDoc.exists()) {
      throw new Error("Task not found");
    }

    const task = convertDocToTask(taskDoc);
    const newTodo: TodoItem = {
      id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: todoText,
      status: "pending",
    };

    const updatedTodoList = [...(task.todoList || []), newTodo];

    await updateDoc(taskRef, {
      todoList: updatedTodoList,
      updatedAt: serverTimestamp(),
    });

    return newTodo;
  } catch (error) {
    console.error("Error adding todo item:", error);
    throw error;
  }
};

// Delete a todo item from a task
export const deleteTodoItem = async (taskId: string, todoId: string) => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    const taskDoc = await getDoc(taskRef);

    if (!taskDoc.exists()) {
      throw new Error("Task not found");
    }

    const task = convertDocToTask(taskDoc);
    const updatedTodoList =
      task.todoList?.filter((todo) => todo.id !== todoId) || [];

    await updateDoc(taskRef, {
      todoList: updatedTodoList,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error deleting todo item:", error);
    throw error;
  }
};
