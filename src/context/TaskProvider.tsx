import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { TaskContext } from "./TaskContext";
import type { TaskContextValue } from "./TaskContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { TASKS_STORAGE_KEY, isTaskArray } from "../taskModel";
import type { Filter, Priority, Task } from "../taskModel";

interface TaskProviderProps {
  children: ReactNode;
}

const matchesFilter = (task: Task, filter: Filter): boolean => {
  switch (filter) {
    case "active":
      return !task.done;
    case "done":
      return task.done;
    case "all":
      return true;
  }
};

export function TaskProvider({ children }: TaskProviderProps) {
  const [tasks, setTasks] = useLocalStorage<Task[]>(TASKS_STORAGE_KEY, [], isTaskArray);
  const [filter, setFilter] = useState<Filter>("all");

  // Actions are wrapped in useCallback so their identity is stable. That matters
  // here (unlike in a plain component) because they live inside the context value:
  // a new function every render would make the value look "new" every render.
  const addTask = useCallback(
    (title: string, priority: Priority): boolean => {
      const trimmed = title.trim();
      if (trimmed === "") return false;

      setTasks((prev) => {
        // Next id = highest saved id + 1, so ids stay unique even after a reload.
        const id = prev.reduce((max, task) => Math.max(max, task.id), 0) + 1;
        return [...prev, { id, title: trimmed, priority, done: false }];
      });
      return true;
    },
    [setTasks],
  );

  const toggleTask = useCallback(
    (id: number) => {
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
      );
    },
    [setTasks],
  );

  const deleteTask = useCallback(
    (id: number) => {
      setTasks((prev) => prev.filter((task) => task.id !== id));
    },
    [setTasks],
  );

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((task) => !task.done));
  }, [setTasks]);

  // Memoised so consumers only re-render when something they could read changed,
  // not every time this provider re-renders for an unrelated reason.
  const value = useMemo<TaskContextValue>(() => {
    const remainingCount = tasks.filter((task) => !task.done).length;
    return {
      tasks,
      filter,
      visibleTasks: tasks.filter((task) => matchesFilter(task, filter)),
      remainingCount,
      completedCount: tasks.length - remainingCount,
      addTask,
      toggleTask,
      deleteTask,
      clearCompleted,
      setFilter,
    };
  }, [tasks, filter, addTask, toggleTask, deleteTask, clearCompleted]);

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}
