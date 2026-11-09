import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLocalStorage } from "./useLocalStorage";

const isNumber = (value: unknown): value is number => typeof value === "number";
const isStringList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  window.localStorage.clear();
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(errorSpy).not.toHaveBeenCalled();
  vi.restoreAllMocks();
});

describe("useLocalStorage<T>", () => {
  it("returns the initial value when nothing is stored", () => {
    const { result } = renderHook(() => useLocalStorage<number>("n", 5, isNumber));
    expect(result.current[0]).toBe(5);
  });

  it("reads a valid stored value", () => {
    window.localStorage.setItem("n", "42");
    const { result } = renderHook(() => useLocalStorage<number>("n", 5, isNumber));
    expect(result.current[0]).toBe(42);
  });

  it("works for any JSON type, not just one (generic)", () => {
    window.localStorage.setItem("list", JSON.stringify(["a", "b"]));
    const { result } = renderHook(() => useLocalStorage<string[]>("list", [], isStringList));
    expect(result.current[0]).toEqual(["a", "b"]);
  });

  it("falls back when the stored value fails the validator", () => {
    window.localStorage.setItem("n", JSON.stringify("not a number"));
    const { result } = renderHook(() => useLocalStorage<number>("n", 5, isNumber));
    expect(result.current[0]).toBe(5);
  });

  it("falls back when the stored text is not valid JSON", () => {
    window.localStorage.setItem("n", "{oops");
    const { result } = renderHook(() => useLocalStorage<number>("n", 5, isNumber));
    expect(result.current[0]).toBe(5);
  });

  it("writes new values, including functional updates", () => {
    const { result } = renderHook(() => useLocalStorage<number>("n", 1, isNumber));
    expect(window.localStorage.getItem("n")).toBe("1");

    act(() => result.current[1](10));
    expect(result.current[0]).toBe(10);
    expect(window.localStorage.getItem("n")).toBe("10");

    act(() => result.current[1]((previous) => previous + 1));
    expect(result.current[0]).toBe(11);
    expect(window.localStorage.getItem("n")).toBe("11");
  });

  it("does not crash when storage throws on read or write", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });

    const { result } = renderHook(() => useLocalStorage<number>("n", 3, isNumber));
    expect(result.current[0]).toBe(3);
    act(() => result.current[1](4));
    expect(result.current[0]).toBe(4);
  });
});
