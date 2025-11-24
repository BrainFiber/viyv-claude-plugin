import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { mkdtemp, rm, readFile } from 'fs/promises';
import * as fse from 'fs-extra';
import { atomicWrite } from '../src/utils/atomic-write.js';
import { withLock } from '../src/utils/file-lock.js';

let root: string;

describe('atomicWrite', () => {
  beforeEach(async () => {
    root = await mkdtemp('/tmp/viyv-utils-');
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('writes content atomically', async () => {
    const target = join(root, 'file.txt');
    await atomicWrite(target, 'hello');
    expect(await readFile(target, 'utf-8')).toBe('hello');
  });

  it('cleans temp on failure', async () => {
    // target directory does not exist, forcing write failure and cleanup path
    const target = join(root, 'missing-dir', 'fail.txt');
    await expect(atomicWrite(target, 'x')).rejects.toThrow();
    const files = await fse.readdir(root);
    expect(files.every((f) => !f.endsWith('.tmp'))).toBe(true);
  });
});

describe('withLock', () => {
  beforeEach(async () => {
    root = await mkdtemp('/tmp/viyv-lock-');
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('serializes concurrent access', async () => {
    const sequence: number[] = [];
    const run = (n: number) =>
      withLock(join(root, 'lockfile'), async () => {
        sequence.push(n);
        await new Promise((r) => setTimeout(r, 10));
        sequence.push(n + 0.5);
      });

    await Promise.all([run(1), run(2), run(3)]);
    // ensure operations did not overlap: order should remain grouped
    expect(sequence).toEqual([1, 1.5, 2, 2.5, 3, 3.5]);
  });
});
