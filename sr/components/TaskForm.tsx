import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useTasks } from "../context/useTasks";
import { PRIORITIES, isPriority } from "../taskModel";
import type { Priority } from "../taskModel";

export default function TaskForm() {
  const { addTask } = useTasks();

  // Form-only state stays local: no other component needs to know what is half-typed.
  const [title, setTitle] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (addTask(title, priority)) {
      setTitle("");
      setError(null);
    } else {
      setError("Enter a task title before adding.");
    }
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (error !== null) setError(null);
  };

  const handlePriorityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (isPriority(value)) setPriority(value);
  };

  return (
    <>
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

      {error !== null && (
        <p id="task-error" role="alert" className="mb-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </>
  );
}
