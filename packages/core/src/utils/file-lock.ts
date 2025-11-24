/**
 * Simple file lock implementation using promises
 * This is a basic implementation for single-process scenarios
 * For multi-process scenarios, consider using proper-lockfile or similar
 */

type LockEntry = {
  queue: Array<() => void>;
  locked: boolean;
};

const locks = new Map<string, LockEntry>();

/**
 * Acquire a lock for a file path
 */
export async function acquireLock(filePath: string): Promise<() => void> {
  let entry = locks.get(filePath);

  if (!entry) {
    entry = { queue: [], locked: false };
    locks.set(filePath, entry);
  }

  if (entry.locked) {
    // Wait for lock to be released
    await new Promise<void>((resolve) => {
      entry!.queue.push(resolve);
    });
  }

  entry.locked = true;

  // Return release function
  return () => {
    const nextInQueue = entry!.queue.shift();
    if (nextInQueue) {
      // Pass lock to next waiter
      nextInQueue();
    } else {
      // No one waiting, unlock
      entry!.locked = false;
    }
  };
}

/**
 * Execute a function with file lock
 */
export async function withLock<T>(filePath: string, fn: () => Promise<T>): Promise<T> {
  const release = await acquireLock(filePath);
  try {
    return await fn();
  } finally {
    release();
  }
}
