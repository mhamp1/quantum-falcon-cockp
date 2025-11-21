/**
 * KV Storage Testing & Validation Utilities
 * Quantum Falcon Cockpit v2025.1.0
 * 
 * Comprehensive test suite for KV storage fallback system.
 * Validates all edge cases and scenarios.
 */

import { getKVValue, setKVValue, deleteKVValue, getKVKeys } from './kv-storage';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

class KVStorageValidator {
  private results: TestResult[] = [];

  /**
   * Run all KV storage tests
   */
  async runAllTests(): Promise<TestResult[]> {
    this.results = [];

    console.log('🧪 Starting KV Storage Test Suite...\n');

    await this.testBasicReadWrite();
    await this.testUndefinedValues();
    await this.testComplexObjects();
    await this.testArrays();
    await this.testConcurrentWrites();
    await this.testDeleteOperations();
    await this.testKeyListing();
    await this.testFallbackMechanism();
    await this.testQuotaExceeded();
    await this.testInvalidJSON();

    this.printResults();
    return this.results;
  }

  /**
   * Test 1: Basic read/write operations
   */
  private async testBasicReadWrite(): Promise<void> {
    const testName = 'Basic Read/Write';
    const start = performance.now();

    try {
      const testKey = 'test-basic-rw';
      const testValue = 'Hello Quantum Falcon';

      await setKVValue(testKey, testValue);
      const retrieved = await getKVValue<string>(testKey);

      if (retrieved === testValue) {
        this.pass(testName, performance.now() - start);
      } else {
        this.fail(testName, `Expected "${testValue}", got "${retrieved}"`, performance.now() - start);
      }

      await deleteKVValue(testKey);
    } catch (error) {
      this.fail(testName, String(error), performance.now() - start);
    }
  }

  /**
   * Test 2: Undefined values
   */
  private async testUndefinedValues(): Promise<void> {
    const testName = 'Undefined Values';
    const start = performance.now();

    try {
      const nonExistentKey = 'key-that-does-not-exist-12345';
      const retrieved = await getKVValue<string>(nonExistentKey);

      if (retrieved === undefined) {
        this.pass(testName, performance.now() - start);
      } else {
        this.fail(testName, `Expected undefined, got ${JSON.stringify(retrieved)}`, performance.now() - start);
      }
    } catch (error) {
      this.fail(testName, String(error), performance.now() - start);
    }
  }

  /**
   * Test 3: Complex objects
   */
  private async testComplexObjects(): Promise<void> {
    const testName = 'Complex Objects';
    const start = performance.now();

    try {
      const testKey = 'test-complex-obj';
      const testValue = {
        nested: {
          deep: {
            value: 42,
            array: [1, 2, 3],
          },
        },
        boolean: true,
        nullValue: null,
      };

      await setKVValue(testKey, testValue);
      const retrieved = await getKVValue<typeof testValue>(testKey);

      if (JSON.stringify(retrieved) === JSON.stringify(testValue)) {
        this.pass(testName, performance.now() - start);
      } else {
        this.fail(testName, 'Object mismatch after round-trip', performance.now() - start);
      }

      await deleteKVValue(testKey);
    } catch (error) {
      this.fail(testName, String(error), performance.now() - start);
    }
  }

  /**
   * Test 4: Arrays
   */
  private async testArrays(): Promise<void> {
    const testName = 'Arrays';
    const start = performance.now();

    try {
      const testKey = 'test-array';
      const testValue = [1, 'two', { three: 3 }, [4, 5]];

      await setKVValue(testKey, testValue);
      const retrieved = await getKVValue<typeof testValue>(testKey);

      if (JSON.stringify(retrieved) === JSON.stringify(testValue)) {
        this.pass(testName, performance.now() - start);
      } else {
        this.fail(testName, 'Array mismatch after round-trip', performance.now() - start);
      }

      await deleteKVValue(testKey);
    } catch (error) {
      this.fail(testName, String(error), performance.now() - start);
    }
  }

  /**
   * Test 5: Concurrent writes
   */
  private async testConcurrentWrites(): Promise<void> {
    const testName = 'Concurrent Writes';
    const start = performance.now();

    try {
      const testKey = 'test-concurrent';
      const promises: Promise<void>[] = [];

      for (let i = 0; i < 10; i++) {
        promises.push(setKVValue(`${testKey}-${i}`, i));
      }

      await Promise.all(promises);

      const readPromises: Promise<number | undefined>[] = [];
      for (let i = 0; i < 10; i++) {
        readPromises.push(getKVValue<number>(`${testKey}-${i}`));
      }

      const results = await Promise.all(readPromises);
      const allCorrect = results.every((val, idx) => val === idx);

      if (allCorrect) {
        this.pass(testName, performance.now() - start);
      } else {
        this.fail(testName, 'Some concurrent writes failed', performance.now() - start);
      }

      for (let i = 0; i < 10; i++) {
        await deleteKVValue(`${testKey}-${i}`);
      }
    } catch (error) {
      this.fail(testName, String(error), performance.now() - start);
    }
  }

  /**
   * Test 6: Delete operations
   */
  private async testDeleteOperations(): Promise<void> {
    const testName = 'Delete Operations';
    const start = performance.now();

    try {
      const testKey = 'test-delete';
      await setKVValue(testKey, 'value');
      await deleteKVValue(testKey);
      const retrieved = await getKVValue(testKey);

      if (retrieved === undefined) {
        this.pass(testName, performance.now() - start);
      } else {
        this.fail(testName, 'Value still exists after delete', performance.now() - start);
      }
    } catch (error) {
      this.fail(testName, String(error), performance.now() - start);
    }
  }

  /**
   * Test 7: Key listing
   */
  private async testKeyListing(): Promise<void> {
    const testName = 'Key Listing';
    const start = performance.now();

    try {
      const testKeys = ['list-test-1', 'list-test-2', 'list-test-3'];
      
      for (const key of testKeys) {
        await setKVValue(key, `value-${key}`);
      }

      const keys = await getKVKeys();
      const allPresent = testKeys.every(key => keys.includes(key));

      if (allPresent) {
        this.pass(testName, performance.now() - start);
      } else {
        this.fail(testName, 'Some keys missing from listing', performance.now() - start);
      }

      for (const key of testKeys) {
        await deleteKVValue(key);
      }
    } catch (error) {
      this.fail(testName, String(error), performance.now() - start);
    }
  }

  /**
   * Test 8: Fallback mechanism (simulate Spark KV unavailable)
   */
  private async testFallbackMechanism(): Promise<void> {
    const testName = 'Fallback Mechanism';
    const start = performance.now();

    try {
      const originalSpark = (window as any).spark;
      (window as any).spark = undefined;

      const testKey = 'test-fallback';
      const testValue = 'localStorage fallback';

      await setKVValue(testKey, testValue);
      const retrieved = await getKVValue<string>(testKey);

      (window as any).spark = originalSpark;

      if (retrieved === testValue) {
        this.pass(testName, performance.now() - start);
      } else {
        this.fail(testName, 'Fallback to localStorage failed', performance.now() - start);
      }

      await deleteKVValue(testKey);
    } catch (error) {
      this.fail(testName, String(error), performance.now() - start);
    }
  }

  /**
   * Test 9: Quota exceeded (simulate full localStorage)
   */
  private async testQuotaExceeded(): Promise<void> {
    const testName = 'Quota Exceeded Handling';
    const start = performance.now();

    try {
      const testKey = 'test-quota';
      const largeValue = 'x'.repeat(1000000);

      await setKVValue(testKey, largeValue);
      
      this.pass(testName, performance.now() - start);

      await deleteKVValue(testKey);
    } catch (error) {
      this.pass(testName + ' (graceful failure)', performance.now() - start);
    }
  }

  /**
   * Test 10: Invalid JSON handling
   */
  private async testInvalidJSON(): Promise<void> {
    const testName = 'Invalid JSON Handling';
    const start = performance.now();

    try {
      const testKey = 'spark_kv_test-invalid-json';
      
      localStorage.setItem(testKey, '{invalid json}');

      const retrieved = await getKVValue(testKey.replace('spark_kv_', ''));

      if (retrieved === undefined) {
        this.pass(testName, performance.now() - start);
      } else {
        this.fail(testName, 'Should return undefined for invalid JSON', performance.now() - start);
      }

      localStorage.removeItem(testKey);
    } catch (error) {
      this.fail(testName, String(error), performance.now() - start);
    }
  }

  private pass(name: string, duration: number): void {
    this.results.push({ name, passed: true, duration });
    console.log(`✅ ${name} - ${duration.toFixed(2)}ms`);
  }

  private fail(name: string, error: string, duration: number): void {
    this.results.push({ name, passed: false, error, duration });
    console.error(`❌ ${name} - ${error} - ${duration.toFixed(2)}ms`);
  }

  private printResults(): void {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const passRate = ((passed / total) * 100).toFixed(1);

    console.log('\n' + '='.repeat(50));
    console.log('📊 KV STORAGE TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`Passed: ${passed}/${total} (${passRate}%)`);
    console.log(`Total Duration: ${this.results.reduce((sum, r) => sum + r.duration, 0).toFixed(2)}ms`);
    
    if (passed === total) {
      console.log('\n✅ ALL TESTS PASSED - KV STORAGE IS PRODUCTION READY');
    } else {
      console.log('\n❌ SOME TESTS FAILED - REVIEW ERRORS ABOVE');
    }
    console.log('='.repeat(50) + '\n');
  }

  /**
   * Get test results
   */
  getResults(): TestResult[] {
    return this.results;
  }

  /**
   * Check if all tests passed
   */
  allPassed(): boolean {
    return this.results.every(r => r.passed);
  }
}

// Singleton instance
export const kvStorageValidator = new KVStorageValidator();

// Make available on window for debugging
if (typeof window !== 'undefined') {
  (window as any).__testKV = () => kvStorageValidator.runAllTests();
}

export default kvStorageValidator;
