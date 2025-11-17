import { useState, useEffect, useCallback } from 'react';
import { getKVValue, setKVValue, deleteKVValue } from '@/lib/kv-storage';

type SetStateAction<T> = T | ((prevState: T) => T);

export function useKV<T>(
  key: string,
  initialValue: T
): [T, (value: SetStateAction<T>) => void, () => void] {
  const [value, setValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadValue() {
      try {
        const storedValue = await getKVValue<T>(key);
        
        if (isMounted) {
          if (storedValue !== undefined && storedValue !== null) {
            console.log(`[useKV] Loaded value for key "${key}":`, storedValue);
            setValue(storedValue);
          } else {
            console.log(`[useKV] No stored value for key "${key}", using initial:`, initialValue);
          }
          setIsInitialized(true);
        }
      } catch (error) {
        console.error(`[useKV] Error loading value for key "${key}":`, error);
        if (isMounted) {
          setValue(initialValue);
          setIsInitialized(true);
        }
      }
    }

    loadValue();

    return () => {
      isMounted = false;
    };
  }, [key]);

  const setStoredValue = useCallback(
    (newValue: SetStateAction<T>) => {
      setValue((currentValue) => {
        const nextValue = typeof newValue === 'function'
          ? (newValue as (prevState: T) => T)(currentValue)
          : newValue;

        console.log(`[useKV] Setting value for key "${key}":`, nextValue);

        if (isInitialized) {
          setKVValue(key, nextValue).catch((error) => {
            console.error(`[useKV] Error setting value for key "${key}":`, error);
          });
        }

        return nextValue;
      });
    },
    [key, isInitialized]
  );

  const deleteStoredValue = useCallback(() => {
    setValue(initialValue);
    deleteKVValue(key).catch((error) => {
      console.error(`[useKV] Error deleting value for key "${key}":`, error);
    });
  }, [key, initialValue]);

  return [value, setStoredValue, deleteStoredValue];
}
