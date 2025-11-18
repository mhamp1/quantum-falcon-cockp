import { useState, useEffect, useCallback, useRef } from 'react';
import { getKVValue, setKVValue, deleteKVValue } from '@/lib/kv-storage';

type SetStateAction<T> = T | ((prevState: T) => T);

export function useKV<T>(
  key: string,
  initialValue: T
): [T, (value: SetStateAction<T>) => void, () => void] {
  const [value, setValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);
  const isLoadingRef = useRef(false);
  const initialValueRef = useRef(initialValue);

  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [initialValue]);

  useEffect(() => {
    if (isLoadingRef.current) return;
    
    let isMounted = true;
    isLoadingRef.current = true;

    async function loadValue() {
      try {
        const storedValue = await getKVValue<T>(key);
        
        if (isMounted) {
          if (storedValue !== undefined && storedValue !== null) {
            setValue(storedValue);
          }
          setIsInitialized(true);
        }
      } catch (error) {
        console.error(`[useKV] Error loading value for key "${key}":`, error);
        if (isMounted) {
          setValue(initialValueRef.current);
          setIsInitialized(true);
        }
      } finally {
        if (isMounted) {
          isLoadingRef.current = false;
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
    setValue(initialValueRef.current);
    deleteKVValue(key).catch((error) => {
      console.error(`[useKV] Error deleting value for key "${key}":`, error);
    });
  }, [key]);

  return [value, setStoredValue, deleteStoredValue];
}
