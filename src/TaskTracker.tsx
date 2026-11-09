import FilterBar from "./components/FilterBar";
import TaskFooter from "./components/TaskFooter";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import { TaskProvider } from "./context/TaskProvider";

// The provider wraps everything that needs the task state. In a bigger app you would
// move <TaskProvider> up to main.tsx or App.tsx so the whole tree can use useTasks().
export default function TaskTracker() {
  return (
    <TaskProvider>
      <section className="mx-auto my-10 max-w-xl rounded-lg bg-white p-6 shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">Task tracker</h1>
        <TaskForm />
        <FilterBar />
        <TaskList />
        <TaskFooter />
      </section>
    </TaskProvider>
  );
}
