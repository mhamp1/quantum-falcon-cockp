/**
 * KV Storage Fallback for Local Development
 * 
 * This module provides a localStorage-based fallback for the Spark KV storage system
 * when running outside the GitHub Spark environment (e.g., local development).
 * 
 * It intercepts failed KV requests and falls back to localStorage seamlessly.
 */

const KV_PREFIX = 'spark_kv_';
const IS_DEV = import.meta.env.DEV;

/**
 * Get a value from storage (Spark KV or localStorage fallback)
 */
export async function getKVValue<T>(key: string): Promise<T | undefined> {
  try {
    if (typeof window !== 'undefined' && window.spark?.kv?.get) {
      try {
        const value = await window.spark.kv.get<T>(key);
        return value;
      } catch (sparkError) {
        if (IS_DEV) {
          console.debug(`[KV Storage] Spark KV failed for key "${key}", using localStorage fallback`);
        }
      }
    }
  } catch (error) {
    if (IS_DEV) {
      console.debug(`[KV Storage] Error accessing Spark KV, using localStorage fallback`);
    }
  }
  
  return getFromLocalStorage<T>(key);
}

/**
 * Set a value in storage (Spark KV or localStorage fallback)
 */
export async function setKVValue<T>(key: string, value: T): Promise<void> {
  try {
    if (typeof window !== 'undefined' && window.spark?.kv?.set) {
      try {
        await window.spark.kv.set(key, value);
        return;
      } catch (sparkError) {
        if (IS_DEV) {
          console.debug(`[KV Storage] Spark KV set failed for key "${key}", using localStorage fallback`);
        }
      }
    }
  } catch (error) {
    if (IS_DEV) {
      console.debug(`[KV Storage] Error accessing Spark KV, using localStorage fallback`);
    }
  }
  
  setInLocalStorage(key, value);
}

/**
 * Delete a value from storage (Spark KV or localStorage fallback)
 */
export async function deleteKVValue(key: string): Promise<void> {
  try {
    if (typeof window !== 'undefined' && window.spark?.kv?.delete) {
      try {
        await window.spark.kv.delete(key);
        return;
      } catch (sparkError) {
        if (IS_DEV) {
          console.debug(`[KV Storage] Spark KV delete failed for key "${key}", using localStorage fallback`);
        }
      }
    }
  } catch (error) {
    if (IS_DEV) {
      console.debug(`[KV Storage] Error accessing Spark KV, using localStorage fallback`);
    }
  }
  
  deleteFromLocalStorage(key);
}

/**
 * Get all keys from storage
 */
export async function getKVKeys(): Promise<string[]> {
  try {
    if (typeof window !== 'undefined' && window.spark?.kv?.keys) {
      try {
        const keys = await window.spark.kv.keys();
        return keys;
      } catch (sparkError) {
        if (IS_DEV) {
          console.debug(`[KV Storage] Spark KV keys failed, using localStorage fallback`);
        }
      }
    }
  } catch (error) {
    if (IS_DEV) {
      console.debug(`[KV Storage] Error accessing Spark KV, using localStorage fallback`);
    }
  }
  
  return getKeysFromLocalStorage();
}

// LocalStorage utility functions
function getFromLocalStorage<T>(key: string): T | undefined {
  try {
    const item = localStorage.getItem(KV_PREFIX + key);
    if (item === null) {
      return undefined;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    if (IS_DEV) {
      console.debug(`[KV Fallback] Error reading from localStorage:`, error);
    }
    return undefined;
  }
}

function setInLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(KV_PREFIX + key, JSON.stringify(value));
  } catch (error) {
    if (IS_DEV) {
      console.debug(`[KV Fallback] Error writing to localStorage:`, error);
    }
  }
}

function deleteFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(KV_PREFIX + key);
  } catch (error) {
    if (IS_DEV) {
      console.debug(`[KV Fallback] Error deleting from localStorage:`, error);
    }
  }
}

function getKeysFromLocalStorage(): string[] {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(KV_PREFIX)) {
        keys.push(key.substring(KV_PREFIX.length));
      }
    }
    return keys;
  } catch (error) {
    if (IS_DEV) {
      console.debug(`[KV Fallback] Error getting keys from localStorage:`, error);
    }
    return [];
  }
}
