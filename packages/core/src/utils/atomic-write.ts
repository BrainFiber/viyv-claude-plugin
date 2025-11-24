import fse from 'fs-extra';
const { writeFile, rename, unlink } = fse;
import { join, dirname } from 'path';
import { randomBytes } from 'crypto';

/**
 * Atomically write a file using temp file + rename strategy
 */
export async function atomicWrite(filePath: string, content: string): Promise<void> {
  const dir = dirname(filePath);
  const tmpName = `.${Date.now()}-${randomBytes(6).toString('hex')}.tmp`;
  const tmpPath = join(dir, tmpName);

  try {
    // Write to temp file
    await writeFile(tmpPath, content, 'utf-8');

    // Atomic rename
    await rename(tmpPath, filePath);
  } catch (error) {
    // Clean up temp file if it exists
    try {
      await unlink(tmpPath);
    } catch {
      // Ignore cleanup errors
    }
    throw error;
  }
}
