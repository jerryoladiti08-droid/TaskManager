import { useTasks } from "../context/useTasks";

export default function TaskFooter() {
  const { tasks, remainingCount, completedCount, clearCompleted } = useTasks();

  if (tasks.length === 0) return null;

  return (
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
  );
}
