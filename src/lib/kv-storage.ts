/**
 * KV Storage Fallback for Local Development
 * 
 * This module provides a localStorage-based fallback for the Spark KV storage system
 * when running outside the GitHub Spark environment (e.g., local development).
 * 
 * It intercepts failed KV requests and falls back to localStorage seamlessly.
 * All errors are silently suppressed to prevent debug panel pollution.
 */

const KV_PREFIX = 'spark_kv_';

/**
 * Get a value from storage (Spark KV or localStorage fallback)
 * All errors silently suppressed
 */
export async function getKVValue<T>(key: string): Promise<T | undefined> {
  try {
    if (typeof window !== 'undefined' && window.spark?.kv?.get) {
      try {
        const value = await window.spark.kv.get<T>(key);
        return value;
      } catch {
        // Silently fall back to localStorage
      }
    }
  } catch {
    // Silently fall back to localStorage
  }
  
  return getFromLocalStorage<T>(key);
}

/**
 * Set a value in storage (Spark KV or localStorage fallback)
 * All errors silently suppressed
 */
export async function setKVValue<T>(key: string, value: T): Promise<void> {
  try {
    if (typeof window !== 'undefined' && window.spark?.kv?.set) {
      try {
        await window.spark.kv.set(key, value);
        return;
      } catch {
        // Silently fall back to localStorage
      }
    }
  } catch {
    // Silently fall back to localStorage
  }
  
  setInLocalStorage(key, value);
}

/**
 * Delete a value from storage (Spark KV or localStorage fallback)
 * All errors silently suppressed
 */
export async function deleteKVValue(key: string): Promise<void> {
  try {
    if (typeof window !== 'undefined' && window.spark?.kv?.delete) {
      try {
        await window.spark.kv.delete(key);
        return;
      } catch {
        // Silently fall back to localStorage
      }
    }
  } catch {
    // Silently fall back to localStorage
  }
  
  deleteFromLocalStorage(key);
}

/**
 * Get all keys from storage
 * All errors silently suppressed
 */
export async function getKVKeys(): Promise<string[]> {
  try {
    if (typeof window !== 'undefined' && window.spark?.kv?.keys) {
      try {
        const keys = await window.spark.kv.keys();
        return keys;
      } catch {
        // Silently fall back to localStorage
      }
    }
  } catch {
    // Silently fall back to localStorage
  }
  
  return getKeysFromLocalStorage();
}

// LocalStorage utility functions (all errors silently suppressed)
function getFromLocalStorage<T>(key: string): T | undefined {
  try {
    const item = localStorage.getItem(KV_PREFIX + key);
    if (item === null) {
      return undefined;
    }
    return JSON.parse(item) as T;
  } catch {
    return undefined;
  }
}

function setInLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(KV_PREFIX + key, JSON.stringify(value));
  } catch {
    // Silently fail
  }
}

function deleteFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(KV_PREFIX + key);
  } catch {
    // Silently fail
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
  } catch {
    return [];
  }
}
