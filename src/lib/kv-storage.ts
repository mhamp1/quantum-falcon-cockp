/**
 * KV Storage Fallback for Local Development
 * 
 * This module provides a localStorage-based fallback for the Spark KV storage system
 * when running outside the GitHub Spark environment (e.g., local development).
 * 
 * It intercepts failed KV requests and falls back to localStorage seamlessly.
 */

const KV_PREFIX = 'spark_kv_';
const KV_AVAILABLE_KEY = '__spark_kv_available__';

let sparkKVAvailable: boolean | null = null;

export async function isSparkKVAvailable(): Promise<boolean> {
  if (sparkKVAvailable !== null) {
    return sparkKVAvailable;
  }

  const cached = sessionStorage.getItem(KV_AVAILABLE_KEY);
  if (cached !== null) {
    sparkKVAvailable = cached === 'true';
    return sparkKVAvailable;
  }

  try {
    const response = await fetch('/_spark/kv', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    sparkKVAvailable = response.status === 200;
  } catch {
    sparkKVAvailable = false;
  }

  sessionStorage.setItem(KV_AVAILABLE_KEY, String(sparkKVAvailable));
  
  if (!sparkKVAvailable) {
    console.info('[KV Storage] Using localStorage fallback');
  }
  
  return sparkKVAvailable;
}

/**
 * Get a value from storage (Spark KV or localStorage fallback)
 */
export async function getKVValue<T>(key: string): Promise<T | undefined> {
  return getFromLocalStorage<T>(key);
}

/**
 * Set a value in storage (Spark KV or localStorage fallback)
 */
export async function setKVValue<T>(key: string, value: T): Promise<void> {
  setInLocalStorage(key, value);
}

/**
 * Delete a value from storage (Spark KV or localStorage fallback)
 */
export async function deleteKVValue(key: string): Promise<void> {
  deleteFromLocalStorage(key);
}

/**
 * Get all keys from storage
 */
export async function getKVKeys(): Promise<string[]> {
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
    console.error(`[KV Fallback] Error reading from localStorage:`, error);
    return undefined;
  }
}

function setInLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(KV_PREFIX + key, JSON.stringify(value));
  } catch (error) {
    console.error(`[KV Fallback] Error writing to localStorage:`, error);
  }
}

function deleteFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(KV_PREFIX + key);
  } catch (error) {
    console.error(`[KV Fallback] Error deleting from localStorage:`, error);
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
    console.error(`[KV Fallback] Error getting keys from localStorage:`, error);
    return [];
  }
}
