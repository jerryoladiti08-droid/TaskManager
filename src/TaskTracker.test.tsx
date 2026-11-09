import { StrictMode } from "react";
import { render, screen, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TaskTracker from "./TaskTracker";
import { TASKS_STORAGE_KEY } from "./taskModel";

let errorSpy: ReturnType<typeof vi.spyOn>;
let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  window.localStorage.clear(); // persistence is on now, so every test must start clean
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  // Nothing in any test may have logged an error or warning
  // (this is what catches duplicate/missing key warnings, act() warnings, etc.).
  expect(errorSpy).not.toHaveBeenCalled();
  expect(warnSpy).not.toHaveBeenCalled();
  vi.restoreAllMocks();
  cleanup();
});

const setup = () => {
  const user = userEvent.setup();
  const view = render(
    <StrictMode>
      <TaskTracker />
    </StrictMode>,
  );
  return { user, unmount: view.unmount };
};

type User = ReturnType<typeof userEvent.setup>;

const addTask = async (user: User, text: string, priority?: string) => {
  if (priority !== undefined) {
    await user.selectOptions(screen.getByLabelText("Priority"), priority);
  }
  await user.type(screen.getByLabelText("Task title"), text);
  await user.click(screen.getByRole("button", { name: "Add task" }));
};

const readSaved = (): unknown => {
  const raw = window.localStorage.getItem(TASKS_STORAGE_KEY);
  return raw === null ? null : JSON.parse(raw);
};

describe("TaskTracker behaviour", () => {
  it("shows the empty state and hides filters/footer when there are no tasks", () => {
    setup();
    expect(screen.getByText(/No tasks yet/)).toBeTruthy();
    expect(screen.queryByRole("group", { name: "Filter tasks" })).toBeNull();
    expect(screen.queryByText(/left$/)).toBeNull();
  });

  it("rejects blank and whitespace-only titles with an accessible error, then clears it on typing", async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText("Task title"), "   ");
    await user.click(screen.getByRole("button", { name: "Add task" }));
    expect(screen.getByRole("alert").textContent).toMatch(/Enter a task title/);
    expect(screen.getByLabelText("Task title").getAttribute("aria-invalid")).toBe("true");
    expect(screen.queryByRole("list")).toBeNull();

    await user.type(screen.getByLabelText("Task title"), "x");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByLabelText("Task title").getAttribute("aria-invalid")).toBe("false");
  });

  it("adds tasks (trimmed), clears the input, and pluralises the counter", async () => {
    const { user } = setup();
    await addTask(user, "  Write tests  ", "high");
    expect(screen.getByText("Write tests")).toBeTruthy();
    expect((screen.getByLabelText("Task title") as HTMLInputElement).value).toBe("");
    expect(screen.getByText("1 task left")).toBeTruthy();

    await addTask(user, "Ship it");
    expect(screen.getByText("2 tasks left")).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("allows duplicate titles without key warnings", async () => {
    const { user } = setup();
    await addTask(user, "Same");
    await addTask(user, "Same");
    expect(screen.getAllByText("Same")).toHaveLength(2);
  });

  it("toggles completion and shows Clear completed only when something is done", async () => {
    const { user } = setup();
    await addTask(user, "One");
    await addTask(user, "Two");
    expect(screen.queryByText(/Clear completed/)).toBeNull();

    await user.click(screen.getByRole("checkbox", { name: 'Mark "One" as done' }));
    expect(screen.getByText("1 task left")).toBeTruthy();
    expect(screen.getByText("Clear completed (1)")).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: 'Mark "One" as not done' })).toBeTruthy();

    await user.click(screen.getByRole("checkbox", { name: 'Mark "One" as not done' }));
    expect(screen.queryByText(/Clear completed/)).toBeNull();
  });

  it("filters, and explains when a filter has no matches", async () => {
    const { user } = setup();
    await addTask(user, "One");
    await addTask(user, "Two");
    await user.click(screen.getByRole("checkbox", { name: 'Mark "One" as done' }));

    await user.click(screen.getByRole("button", { name: "active" }));
    expect(screen.queryByText("One")).toBeNull();
    expect(screen.getByText("Two")).toBeTruthy();
    expect(screen.getByRole("button", { name: "active" }).getAttribute("aria-pressed")).toBe("true");

    await user.click(screen.getByRole("button", { name: "done" }));
    expect(screen.getByText("One")).toBeTruthy();
    expect(screen.queryByText("Two")).toBeNull();

    await user.click(screen.getByRole("button", { name: 'Delete "One"' }));
    expect(screen.getByText("No done tasks to show.")).toBeTruthy();
  });

  it("deletes the right row and clears completed", async () => {
    const { user } = setup();
    await addTask(user, "A");
    await addTask(user, "B");
    await addTask(user, "C");

    await user.click(screen.getByRole("button", { name: 'Delete "B"' }));
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(within(items[0]!).getByText("A")).toBeTruthy();
    expect(within(items[1]!).getByText("C")).toBeTruthy();

    await user.click(screen.getByRole("checkbox", { name: 'Mark "A" as done' }));
    await user.click(screen.getByText("Clear completed (1)"));
    expect(screen.queryByText("A")).toBeNull();
    expect(screen.getByText("C")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: 'Delete "C"' }));
    expect(screen.getByText(/No tasks yet/)).toBeTruthy();
  });
});

describe("TaskTracker persistence", () => {
  it("saves every change to localStorage as JSON", async () => {
    const { user } = setup();
    await addTask(user, "Persist me", "high");
    expect(readSaved()).toEqual([{ id: 1, title: "Persist me", priority: "high", done: false }]);

    await user.click(screen.getByRole("checkbox", { name: 'Mark "Persist me" as done' }));
    expect(readSaved()).toEqual([{ id: 1, title: "Persist me", priority: "high", done: true }]);

    await user.click(screen.getByRole("button", { name: 'Delete "Persist me"' }));
    expect(readSaved()).toEqual([]);
  });

  it("restores tasks, done state and priority after a reload", async () => {
    const first = setup();
    await addTask(first.user, "Keep me", "low");
    // the dropdown keeps its last choice, so set "medium" explicitly for the second task
    await addTask(first.user, "Finish me", "medium");
    await first.user.click(screen.getByRole("checkbox", { name: 'Mark "Finish me" as done' }));
    first.unmount();

    setup();
    expect(screen.getByText("Keep me")).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: 'Mark "Finish me" as not done' })).toBeTruthy();
    expect(screen.getByText("1 task left")).toBeTruthy();
    // "low" is also a <select> option, so look for the badge inside the list only
    expect(within(screen.getByRole("list")).getByText("low")).toBeTruthy();
  });

  it("keeps ids unique after a reload (no duplicate-key warnings)", async () => {
    const first = setup();
    await addTask(first.user, "Before reload");
    first.unmount();

    const second = setup();
    await addTask(second.user, "After reload");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(readSaved()).toEqual([
      { id: 1, title: "Before reload", priority: "medium", done: false },
      { id: 2, title: "After reload", priority: "medium", done: false },
    ]);
  });

  it("continues numbering above the highest saved id", async () => {
    window.localStorage.setItem(
      TASKS_STORAGE_KEY,
      JSON.stringify([
        { id: 7, title: "Saved one", priority: "high", done: true },
        { id: 9, title: "Saved two", priority: "low", done: false },
      ]),
    );
    const { user } = setup();
    expect(screen.getByRole("checkbox", { name: 'Mark "Saved one" as not done' })).toBeTruthy();
    expect(screen.getByText("1 task left")).toBeTruthy();

    await addTask(user, "New one");
    expect(readSaved()).toEqual([
      { id: 7, title: "Saved one", priority: "high", done: true },
      { id: 9, title: "Saved two", priority: "low", done: false },
      { id: 10, title: "New one", priority: "medium", done: false },
    ]);
  });

  it.each([
    ["corrupted JSON", "{not json"],
    ["a non-array value", JSON.stringify({ id: 1 })],
    ["tasks missing fields", JSON.stringify([{ id: 1, title: "x" }])],
    ["an unknown priority", JSON.stringify([{ id: 1, title: "x", priority: "urgent", done: false }])],
    [
      "duplicate ids",
      JSON.stringify([
        { id: 1, title: "a", priority: "low", done: false },
        { id: 1, title: "b", priority: "low", done: false },
      ]),
    ],
  ])("ignores %s in storage and starts empty", (_label, stored) => {
    window.localStorage.setItem(TASKS_STORAGE_KEY, stored);
    setup();
    expect(screen.getByText(/No tasks yet/)).toBeTruthy();
  });

  it("keeps working when localStorage is blocked", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });

    const { user } = setup();
    expect(screen.getByText(/No tasks yet/)).toBeTruthy();
    await addTask(user, "Still works");
    expect(screen.getByText("Still works")).toBeTruthy();
  });
});
