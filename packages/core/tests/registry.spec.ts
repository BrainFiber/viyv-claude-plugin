import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { join } from 'path';
import { mkdtemp, rm } from 'fs/promises';
import { writeJson } from 'fs-extra';
import { RegistryManager } from '../src/registry/RegistryManager.js';
import * as atomic from '../src/utils/atomic-write.js';

let root: string;
let registry: RegistryManager;

describe('RegistryManager', () => {
  beforeEach(async () => {
    root = await mkdtemp('/tmp/viyv-registry-');
    registry = new RegistryManager(root);
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('upgrades legacy registry lacking version', async () => {
    await writeJson(join(root, 'registry.json'), { plugins: [] });
    const data = await registry.read();
    expect(data.version).toBeTruthy();
  });

  it('upgrades legacy registry with non-array plugins', async () => {
    await writeJson(join(root, 'registry.json'), { plugins: 'oops' });
    const data = await registry.read();
    expect(data.plugins).toEqual([]);
  });

  it('throws on invalid registry shape', async () => {
    await writeJson(join(root, 'registry.json'), { version: '1.0.0', plugins: 'nope' });
    await expect(registry.read()).rejects.toThrow(/Invalid registry/);
  });

  it('throws when registry is not an object', async () => {
    await writeJson(join(root, 'registry.json'), 'oops');
    await expect(registry.read()).rejects.toThrow(/not an object/);
  });

  it('errors on update/remove missing plugin', async () => {
    await expect(registry.updatePlugin('x', {})).rejects.toThrow(/not found/);
    await expect(registry.removePlugin('x')).rejects.toThrow(/not found/);
  });

  it('rejects duplicate plugin ids', async () => {
    const meta = {
      id: 'dup',
      name: 'dup',
      version: '1.0.0',
      location: '/tmp',
      source: { type: 'generated' as const },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await registry.addPlugin(meta);
    await expect(registry.addPlugin(meta)).rejects.toThrow(/already exists/);
  });

  it('wraps write errors', async () => {
    const spy = vi.spyOn(atomic, 'atomicWrite').mockRejectedValue(new Error('fail'));
    await expect(registry.write({ version: '1.0.0', plugins: [] })).rejects.toThrow(
      /Failed to write registry/
    );
    spy.mockRestore();
  });
});
