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

// Check if Spark KV is available by trying a simple request
let sparkKVAvailable: boolean | null = null;

export async function isSparkKVAvailable(): Promise<boolean> {
  // Check memory cache first
  if (sparkKVAvailable !== null) {
    return sparkKVAvailable;
  }

  // Check sessionStorage cache
  const cached = sessionStorage.getItem(KV_AVAILABLE_KEY);
  if (cached !== null) {
    sparkKVAvailable = cached === 'true';
    return sparkKVAvailable;
  }

  // Try to connect to Spark KV
  try {
    const response = await fetch('/_spark/kv', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    // 200 = available, anything else (401, 403, 404, etc) = unavailable
    sparkKVAvailable = response.status === 200;
  } catch {
    sparkKVAvailable = false;
  }

  // Cache the result in sessionStorage for this session
  sessionStorage.setItem(KV_AVAILABLE_KEY, String(sparkKVAvailable));
  
  if (!sparkKVAvailable) {
    console.info('[KV Storage] Spark KV unavailable - using localStorage fallback');
  }
  
  return sparkKVAvailable;
}

/**
 * Get a value from storage (Spark KV or localStorage fallback)
 */
export async function getKVValue<T>(key: string): Promise<T | undefined> {
  const useLocalStorage = !(await isSparkKVAvailable());
  
  if (useLocalStorage) {
    return getFromLocalStorage<T>(key);
  }

  // Try Spark KV first, fall back to localStorage on error
  try {
    const response = await fetch(`/_spark/kv/${encodeURIComponent(key)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('KV fetch failed');
    }

    const data = await response.json();
    return data.value as T;
  } catch {
    // Fall back to localStorage
    console.warn(`[KV Fallback] Using localStorage for key: ${key}`);
    return getFromLocalStorage<T>(key);
  }
}

/**
 * Set a value in storage (Spark KV or localStorage fallback)
 */
export async function setKVValue<T>(key: string, value: T): Promise<void> {
  const useLocalStorage = !(await isSparkKVAvailable());
  
  if (useLocalStorage) {
    setInLocalStorage(key, value);
    return;
  }

  // Try Spark KV first, fall back to localStorage on error
  try {
    const response = await fetch(`/_spark/kv/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });

    if (!response.ok) {
      throw new Error('KV set failed');
    }
  } catch {
    // Fall back to localStorage
    console.warn(`[KV Fallback] Using localStorage for key: ${key}`);
    setInLocalStorage(key, value);
  }
}

/**
 * Delete a value from storage (Spark KV or localStorage fallback)
 */
export async function deleteKVValue(key: string): Promise<void> {
  const useLocalStorage = !(await isSparkKVAvailable());
  
  if (useLocalStorage) {
    deleteFromLocalStorage(key);
    return;
  }

  // Try Spark KV first, fall back to localStorage on error
  try {
    const response = await fetch(`/_spark/kv/${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('KV delete failed');
    }
  } catch {
    // Fall back to localStorage
    console.warn(`[KV Fallback] Using localStorage for key: ${key}`);
    deleteFromLocalStorage(key);
  }
}

/**
 * Get all keys from storage
 */
export async function getKVKeys(): Promise<string[]> {
  const useLocalStorage = !(await isSparkKVAvailable());
  
  if (useLocalStorage) {
    return getKeysFromLocalStorage();
  }

  // Try Spark KV first, fall back to localStorage on error
  try {
    const response = await fetch('/_spark/kv', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('KV keys fetch failed');
    }

    const data = await response.json();
    return data.keys || [];
  } catch {
    // Fall back to localStorage
    console.warn('[KV Fallback] Using localStorage for keys list');
    return getKeysFromLocalStorage();
  }
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
