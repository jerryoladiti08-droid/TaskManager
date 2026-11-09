import { useTasks } from "../context/useTasks";
import TaskItem from "./TaskItem";

export default function TaskList() {
  const { tasks, visibleTasks, filter, toggleTask, deleteTask } = useTasks();

  // Three possible bodies, chosen by the data (early returns keep it flat).
  if (tasks.length === 0) {
    return <p className="py-6 text-center text-gray-500">No tasks yet. Add your first one above.</p>;
  }

  if (visibleTasks.length === 0) {
    return <p className="py-6 text-center text-gray-500">No {filter} tasks to show.</p>;
  }

  return (
    <ul className="divide-y divide-gray-200">
      {visibleTasks.map((task) => (
        // key = the task's own unique id, never the array index.
        <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
      ))}
    </ul>
  );
}
