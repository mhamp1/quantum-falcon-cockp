import { useState, useEffect, useCallback, useRef } from 'react';
import { getKVValue, setKVValue, deleteKVValue } from '@/lib/kv-storage';

/**
 * Safe KV hook with localStorage fallback
 * Use this instead of @github/spark/hooks useKV to prevent blob storage errors
 * 
 * Gracefully handles:
 * - RestError: The specified blob does not exist
 * - Azure Blob Storage failures
 * - GitHub Spark KV storage unavailability
 * - All errors silently fall back to localStorage
 */
export function useKVSafe<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(defaultValue);
  const [isInitialized, setIsInitialized] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    const loadInitialValue = async () => {
      try {
        const stored = await getKVValue<T>(key);
        if (isMountedRef.current) {
          if (stored !== undefined) {
            setValue(stored);
          }
          setIsInitialized(true);
        }
      } catch (error) {
        console.debug(`[useKVSafe] Failed to load key "${key}":`, error);
        if (isMountedRef.current) {
          setIsInitialized(true);
        }
      }
    };

    loadInitialValue();

    return () => {
      isMountedRef.current = false;
    };
  }, [key]);

  const updateValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue((prevValue) => {
        const valueToSet = typeof newValue === 'function' 
          ? (newValue as (prev: T) => T)(prevValue)
          : newValue;
        
        // Async save to KV without blocking UI
        Promise.resolve().then(() => {
          setKVValue(key, valueToSet).catch((error) => {
            console.debug(`[useKVSafe] Failed to save key "${key}":`, error);
          });
        });
        
        return valueToSet;
      });
    },
    [key]
  );

  const deleteValue = useCallback(() => {
    setValue(defaultValue);
    deleteKVValue(key).catch((error) => {
      console.debug(`[useKVSafe] Failed to delete key "${key}":`, error);
    });
  }, [key, defaultValue]);

  return [value, updateValue, deleteValue];
}

/**
 * Alias for useKVSafe - drop-in replacement for @github/spark/hooks useKV
 * Use this to avoid blob storage errors
 */
export const useKV = useKVSafe;
