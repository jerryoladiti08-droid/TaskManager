import { useTasks } from "../context/useTasks";
import { FILTERS } from "../taskModel";

export default function FilterBar() {
  const { tasks, filter, setFilter } = useTasks();


  if (tasks.length === 0) return null;

  return (
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
  );
}
