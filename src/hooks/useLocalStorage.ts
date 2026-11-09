import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

/** A type guard that decides whether untrusted data really is a T. */
export type Validator<T> = (value: unknown) => value is T;

function readFromStorage<T>(key: string, fallback: T, isValid: Validator<T>): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;

    // JSON.parse is typed as `any`; naming it `unknown` forces us to check it first.
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : fallback;
  } catch {
    // Corrupted JSON, or storage blocked (some private modes): start fresh.
    return fallback;
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  isValid: Validator<T>,
): [T, Dispatch<SetStateAction<T>>] {
  // Lazy initialiser: the function runs once, on first render only.
  const [value, setValue] = useState<T>(() => readFromStorage(key, initialValue, isValid));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or blocked: the app keeps working, it just won't persist.
    }
  }, [key, value]);

  return [value, setValue];
}
