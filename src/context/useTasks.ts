import { useContext } from "react";
import { TaskContext } from "./TaskContext";
import type { TaskContextValue } from "./TaskContext";

export function useTasks(): TaskContextValue {
  const context = useContext(TaskContext);
  if (context === null) {
    throw new Error("useTasks must be used inside <TaskProvider>.");
  }
  return context;
}
