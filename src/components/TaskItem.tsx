import type { Priority, Task } from "../taskModel";


interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

// Record<Priority, string> makes TypeScript demand a style for EVERY priority.
const PRIORITY_STYLES: Record<Priority, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <li className="flex items-center gap-3 py-3">
      <input
        type="checkbox"
        checked={task.done}
        onChange={() => onToggle(task.id)}
        aria-label={`Mark "${task.title}" as ${task.done ? "not done" : "done"}`}
      />
      <span className={`flex-1 ${task.done ? "text-gray-400 line-through" : "text-gray-900"}`}>
        {task.title}
      </span>
      <span className={`rounded px-2 py-0.5 text-xs ${PRIORITY_STYLES[task.priority]}`}>
        {task.priority}
      </span>
      <button
        type="button"
        onClick={() => onDelete(task.id)}
        aria-label={`Delete "${task.title}"`}
        className="text-sm text-red-600 hover:underline"
      >
        Delete
      </button>
    </li>
  );
}
