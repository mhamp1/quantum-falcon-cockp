/**
 * useKVFallback Hook
 *
 * A wrapper around Spark's useKV that provides localStorage fallback
 * when the Spark KV storage is unavailable (e.g., in local development).
 *
 * This hook has the same API as useKV but gracefully handles authentication
 * failures by falling back to localStorage.
 */

import { useState, useEffect, useCallback, useMemo } from "react";

import { getKVValue, setKVValue, deleteKVValue } from "@/lib/kv-storage";

type SetStateAction<T> = T | ((prevState: T) => T);

/**
 * A hook that provides persistent key-value storage with automatic fallback.
 * Works identically to Spark's useKV but uses localStorage when Spark KV is unavailable.
 *
 * @param key - The key under which to store the value.
 * @param initialValue - The initial value to use if no stored value is found.
 * @returns An array containing the current value, a setter function, and a delete function.
 *
 * @example
 * const [count, setCount, deleteCount] = useKVFallback("count", 0);
 */
export function useKVFallback<T>(
  key: string,
  initialValue: T,
): [T, (value: SetStateAction<T>) => void, () => void] {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Load initial value from storage
  useEffect(() => {
    if (hasLoadedOnce) return;
    
    let isMounted = true;

    async function loadValue() {
      try {
        const storedValue = await getKVValue<T>(key);

        if (isMounted) {
          if (storedValue !== undefined) {
            setValue(storedValue);
          } else {
            // If no value exists, set the initial value
            await setKVValue(key, initialValue);
          }
          setIsLoading(false);
          setHasLoadedOnce(true);
        }
      } catch (error) {
        console.error(
          `[useKVFallback] Error loading value for key "${key}":`,
          error,
        );
        if (isMounted) {
          setValue(initialValue);
          setIsLoading(false);
          setHasLoadedOnce(true);
        }
      }
    }

    loadValue();

    return () => {
      isMounted = false;
    };
  }, [key, initialValue, hasLoadedOnce]);

  // Setter function
  const setStoredValue = useCallback(
    (newValue: SetStateAction<T>) => {
      setValue((currentValue) => {
        const nextValue =
          typeof newValue === "function"
            ? (newValue as (prevState: T) => T)(currentValue)
            : newValue;

        // Async update to storage (don't block UI)
        setKVValue(key, nextValue).catch((error) => {
          console.error(
            `[useKVFallback] Error setting value for key "${key}":`,
            error,
          );
        });

        return nextValue;
      });
    },
    [key],
  );

  // Delete function
  const deleteStoredValue = useCallback(() => {
    setValue(initialValue);
    deleteKVValue(key).catch((error) => {
      console.error(
        `[useKVFallback] Error deleting value for key "${key}":`,
        error,
      );
    });
  }, [key, initialValue]);

  return [value, setStoredValue, deleteStoredValue];
}

/**
 * Alternative export that matches the Spark useKV naming exactly
 */
export const useKV = useKVFallback;
