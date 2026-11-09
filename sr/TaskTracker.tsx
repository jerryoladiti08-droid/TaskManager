import { useRef, useState } from "react";
import type { ChangeEvent, SubmitEvent } from "react";

// ---------- Types ----------
// A "union" type: a value can only be one of these exact strings.
type Priority = "low" | "medium" | "high";
type Filter = "all" | "active" | "done";

interface Task {
  id: number;
  title: string;
  priority: Priority;
  done: boolean;
}

// ---------- Constants ----------
const PRIORITIES: readonly Priority[] = ["low", "medium", "high"];
const FILTERS: readonly Filter[] = ["all", "active", "done"];

// Record<Priority, string> forces an entry for EVERY priority.
// If you add "urgent" to Priority later, TypeScript flags this object until you do too.
const PRIORITY_STYLES: Record<Priority, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

// ---------- Helpers ----------
// A "type guard": a <select> gives back a plain string, so we check it is one of ours
// before storing it. This replaces an unsafe `as Priority` cast.
const isPriority = (value: string): value is Priority =>
  PRIORITIES.some((p) => p === value);

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

// ---------- Component ----------
export default function TaskTracker() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState<string | null>(null);

  // A ref holds a value that survives re-renders WITHOUT causing one.
  // Used here as a simple counter so every task gets a unique, stable id.
  const nextId = useRef<number>(1);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = title.trim();

    if (trimmed === "") {
      setError("Enter a task title before adding.");
      return;
    }

    const newTask: Task = {
      id: nextId.current,
      title: trimmed,
      priority,
      done: false,
    };
    nextId.current += 1;

    // Functional update: build the new array from the latest one, never mutate.
    setTasks((prev) => [...prev, newTask]);
    setTitle("");
    setError(null);
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (error !== null) setError(null); // clear the error as soon as they start fixing it
  };

  const handlePriorityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (isPriority(value)) setPriority(value);
  };

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    );
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((task) => !task.done));
  };

  // Derived values: calculated from state on every render, NOT stored in state,
  // so they can never drift out of sync with the task list.
  const visibleTasks = tasks.filter((task) => matchesFilter(task, filter));
  const remainingCount = tasks.filter((task) => !task.done).length;
  const completedCount = tasks.length - remainingCount;

  return (
    <section className="mx-auto my-10 max-w-xl rounded-lg bg-white p-6 shadow-md">
      <h1 className="mb-4 text-2xl font-bold text-gray-900">Task tracker</h1>

      <form onSubmit={handleSubmit} noValidate className="mb-2 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="task-title" className="sr-only">
          Task title
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="What needs doing?"
          aria-invalid={error !== null}
          aria-describedby={error !== null ? "task-error" : undefined}
          className="flex-1 rounded border border-gray-300 px-3 py-2"
        />

        <label htmlFor="task-priority" className="sr-only">
          Priority
        </label>
        <select
          id="task-priority"
          value={priority}
          onChange={handlePriorityChange}
          className="rounded border border-gray-300 px-3 py-2"
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
        >
          Add task
        </button>
      </form>

      {/* Conditional rendering 1: the error only exists while `error` has a message */}
      {error !== null && (
        <p id="task-error" role="alert" className="mb-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Conditional rendering 2: the filter bar only appears once there are tasks */}
      {tasks.length > 0 && (
        <div role="group" aria-label="Filter tasks" className="mb-4 mt-4 flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`rounded-full px-3 py-1 text-sm capitalize ${
                filter === f ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Conditional rendering 3: three possible bodies, chosen by the data */}
      {tasks.length === 0 ? (
        <p className="py-6 text-center text-gray-500">No tasks yet. Add your first one above.</p>
      ) : visibleTasks.length === 0 ? (
        <p className="py-6 text-center text-gray-500">No {filter} tasks to show.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {visibleTasks.map((task) => (
            // key = the task's own unique id, NOT the array index, so React can track
            // each row correctly when items are deleted or the filter changes.
            <li key={task.id} className="flex items-center gap-3 py-3">
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTask(task.id)}
                aria-label={`Mark "${task.title}" as ${task.done ? "not done" : "done"}`}
              />
              <span
                className={`flex-1 ${task.done ? "text-gray-400 line-through" : "text-gray-900"}`}
              >
                {task.title}
              </span>
              <span className={`rounded px-2 py-0.5 text-xs ${PRIORITY_STYLES[task.priority]}`}>
                {task.priority}
              </span>
              <button
                type="button"
                onClick={() => deleteTask(task.id)}
                aria-label={`Delete "${task.title}"`}
                className="text-sm text-red-600 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Conditional rendering 4: footer summary, and "Clear completed" only when useful */}
      {tasks.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <p>
            {remainingCount} {remainingCount === 1 ? "task" : "tasks"} left
          </p>
          {completedCount > 0 && (
            <button type="button" onClick={clearCompleted} className="text-indigo-600 hover:underline">
              Clear completed ({completedCount})
            </button>
          )}
        </div>
      )}
    </section>
  );
}
