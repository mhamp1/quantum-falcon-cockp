import { useKVSafe } from '@/hooks/useKVFallback'

type UseKVOptions<T> = {
  ttl?: number
  serialize?: (value: T) => string
  deserialize?: (value: string) => T
}

/**
 * Lightweight shim for @github/spark/hooks during local development.
 * We intentionally bypass the remote Spark KV service to avoid rate limits
 * and rely on our resilient localStorage-backed implementation instead.
 */
export function useKV<T>(
  key: string,
  defaultValue: T,
  _options?: UseKVOptions<T>
) {
  return useKVSafe<T>(key, defaultValue)
}

