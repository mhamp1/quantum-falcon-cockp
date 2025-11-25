/**
 * KV Storage Fallback for Local Development
 * 
 * This module provides a localStorage-based fallback for the Spark KV storage system
 * when running outside the GitHub Spark environment (e.g., local development).
 * 
 * It intercepts failed KV requests and falls back to localStorage seamlessly.
 * All errors are silently suppressed to prevent debug panel pollution.
 */

import { logger } from '@/lib/logger'

declare global {
  interface Window {
    spark?: {
      kv?: {
        get<T>(key: string): Promise<T | undefined>
        set<T>(key: string, value: T): Promise<void>
        delete(key: string): Promise<void>
        keys(): Promise<string[]>
      }
    }
  }
}

const KV_PREFIX = 'spark_kv_';

const isLocalDev = () => {
  if (typeof window === 'undefined') return true
  const host = window.location?.hostname || ''
  return host === 'localhost' || host === '127.0.0.1'
}

const canUseSparkKV = () => {
  if (typeof window === 'undefined') return false
  if (isLocalDev()) return false
  return Boolean(window.spark?.kv)
}

/**
* Get a value from storage (Spark KV or localStorage fallback)
* All errors silently suppressed
*/
export async function getKVValue<T>(key: string): Promise<T | undefined> {
  if (canUseSparkKV()) {
    try {
      const value = await window.spark!.kv!.get<T>(key)
      return value
    } catch (error) {
      logger.debug(`Spark KV get failed for "${key}", falling back`, 'kv-storage', error)
    }
  }
  
  return getFromLocalStorage<T>(key);
}

/**
 * Set a value in storage (Spark KV or localStorage fallback)
 * All errors silently suppressed
 */
export async function setKVValue<T>(key: string, value: T): Promise<void> {
  if (canUseSparkKV()) {
    try {
      await window.spark!.kv!.set(key, value)
      return
    } catch (error) {
      logger.debug(`Spark KV set failed for "${key}", falling back`, 'kv-storage', error)
    }
  }
  
  setInLocalStorage(key, value);
}

/**
 * Delete a value from storage (Spark KV or localStorage fallback)
 * All errors silently suppressed
 */
export async function deleteKVValue(key: string): Promise<void> {
  if (canUseSparkKV()) {
    try {
      await window.spark!.kv!.delete(key)
      return;
    } catch (error) {
      logger.debug(`Spark KV delete failed for "${key}", falling back`, 'kv-storage', error)
    }
  }
  
  deleteFromLocalStorage(key);
}

/**
 * Get all keys from storage
 * All errors silently suppressed
 */
export async function getKVKeys(): Promise<string[]> {
  if (canUseSparkKV()) {
    try {
      const keys = await window.spark!.kv!.keys()
      return keys
    } catch (error) {
      logger.debug('Spark KV keys failed, falling back', 'kv-storage', error)
    }
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
