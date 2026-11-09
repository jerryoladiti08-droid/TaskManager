// The shared "vocabulary" of the app: types, constants and runtime guards.
// No React in here, so any file (components, context, tests) can import it.

export type Priority = "low" | "medium" | "high";
export type Filter = "all" | "active" | "done";

export interface Task {
  id: number;
  title: string;
  priority: Priority;
  done: boolean;
}

export const TASKS_STORAGE_KEY = "task-tracker:tasks";

export const PRIORITIES: readonly Priority[] = ["low", "medium", "high"];
export const FILTERS: readonly Filter[] = ["all", "active", "done"];

// <select> values arrive as plain strings, so check before trusting them.
export const isPriority = (value: string): value is Priority =>
  PRIORITIES.some((p) => p === value);

// Data read back from localStorage is untrusted: anyone (or an older version of
// this app) may have written something different. These guards check the real shape.
export const isTask = (value: unknown): value is Task =>
  typeof value === "object" &&
  value !== null &&
  "id" in value &&
  typeof value.id === "number" &&
  Number.isInteger(value.id) &&
  "title" in value &&
  typeof value.title === "string" &&
  "priority" in value &&
  typeof value.priority === "string" &&
  isPriority(value.priority) &&
  "done" in value &&
  typeof value.done === "boolean";

// Duplicate ids would produce duplicate React keys, so reject them too.
export const isTaskArray = (value: unknown): value is Task[] =>
  Array.isArray(value) &&
  value.every(isTask) &&
  new Set(value.map((task) => task.id)).size === value.length;
