import { createContext } from "react";
import type { Filter, Priority, Task } from "../taskModel";

// Everything a component can read from, or ask of, the global task state.
export interface TaskContextValue {
  // state
  tasks: Task[];
  filter: Filter;

  // derived (calculated from the state above, never stored)
  visibleTasks: Task[];
  remainingCount: number;
  completedCount: number;

  // actions
  /** Returns false (and adds nothing) when the title is blank. */
  addTask: (title: string, priority: Priority) => boolean;
  toggleTask: (id: number) => void;
  deleteTask: (id: number) => void;
  clearCompleted: () => void;
  setFilter: (filter: Filter) => void;
}

// `null` means "no provider above me". The useTasks hook turns that into a clear
// error, so components never have to null-check the context themselves.
export const TaskContext = createContext<TaskContextValue | null>(null);
