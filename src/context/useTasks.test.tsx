import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTasks } from "./useTasks";

describe("useTasks", () => {
  it("throws a clear error when used outside <TaskProvider>", () => {
    // React reports render errors through console.error; silence it for this one case.
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useTasks())).toThrow("useTasks must be used inside <TaskProvider>.");
    errorSpy.mockRestore();
  });
});
