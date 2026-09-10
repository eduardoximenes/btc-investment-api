import { AsyncLocalStorage } from 'node:async_hooks';

interface CorrelationContext {
  correlationId: string;
}

const storage = new AsyncLocalStorage<CorrelationContext>();

/**
 * Runs `fn` inside an AsyncLocalStorage scope carrying `correlationId`, so
 * anything logged during its execution (however deeply nested/async) can
 * read it back via `getCorrelationId` without it being passed explicitly.
 */
export function runWithCorrelationId<T>(correlationId: string, fn: () => T): T {
  return storage.run({ correlationId }, fn);
}

export function getCorrelationId(): string | undefined {
  return storage.getStore()?.correlationId;
}
