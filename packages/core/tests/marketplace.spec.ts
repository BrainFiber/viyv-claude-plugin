import { tmpdir } from 'os';
import { join } from 'path';
import { mkdtemp, rm } from 'fs/promises';
import fse from 'fs-extra';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createPluginManager } from '../src/index.js';
import { MarketplaceManager } from '../src/marketplace/MarketplaceManager.js';

const { ensureDir, writeJson, readJson } = fse;

async function createTempRoot(): Promise<string> {
  return mkdtemp(join(tmpdir(), 'viyv-claude-mp-'));
}

describe('Marketplace sync', () => {
  let root: string;

  beforeEach(async () => {
    root = await createTempRoot();
    process.env.CLAUDE_PLUGIN_ROOT = root;
  });

  afterEach(async () => {
    delete process.env.CLAUDE_PLUGIN_ROOT;
    await rm(root, { recursive: true, force: true });
  });

  function marketplacePath(): string {
    return join(root, '.claude-plugin', 'marketplace.json');
  }

  it('writes marketplace entry on create and updates on version change', async () => {
    const manager = await createPluginManager();
    const created = await manager.create({
      name: 'Marketplace Demo',
      description: 'first',
      version: '0.1.0',
    });

    const first = await readJson(marketplacePath());
    expect(first.plugins).toHaveLength(1);
    expect(first.plugins[0].name).toBe(created.id);
    expect(first.plugins[0].source).toBe(`./plugins/${created.id}`);
    expect(first.plugins[0].version).toBe('0.1.0');
    expect(first.plugins[0].description).toBe('first');

    await manager.update(created.id, { version: '0.2.0', description: 'second' });
    const second = await readJson(marketplacePath());
    expect(second.plugins[0].version).toBe('0.2.0');
    expect(second.plugins[0].description).toBe('second');
  });

  it('removes marketplace entry on delete', async () => {
    const manager = await createPluginManager();
    const created = await manager.create({ name: 'Removable MP' });

    const before = await readJson(marketplacePath());
    expect(before.plugins.some((p: any) => p.name === created.id)).toBe(true);

    await manager.delete(created.id);
    const after = await readJson(marketplacePath());
    expect(after.plugins).toHaveLength(0);
  });

  it('adds marketplace entry when importing from path', async () => {
    const manager = await createPluginManager();
    const sourceRoot = await createTempRoot();
    const pluginDir = join(sourceRoot, 'importable');
    await ensureDir(join(pluginDir, '.claude-plugin'));
    await ensureDir(join(pluginDir, 'skills', 's1'));
    await writeJson(join(pluginDir, '.claude-plugin', 'plugin.json'), {
      name: 'Importable Plugin',
      version: '9.9.9',
      description: 'from path',
      author: { name: 'Importer' },
    });
    await fse.writeFile(join(pluginDir, 'skills', 's1', 'SKILL.md'), '# skill');

    const imported = await manager.importFromPath({ path: pluginDir });
    const mp = await readJson(marketplacePath());
    const entry = mp.plugins.find((p: any) => p.name === imported.id);
    expect(entry).toBeDefined();
    expect(entry.source).toBe(`./plugins/${imported.id}`);
    expect(entry.version).toBe('9.9.9');
    expect(entry.author.name).toBe('Importer');
  });

  it('throws on invalid marketplace file shapes', async () => {
    const manager = new MarketplaceManager(root);
    await ensureDir(join(root, '.claude-plugin'));

    // not an object
    await fse.writeFile(marketplacePath(), '123');
    await expect(manager.read()).rejects.toThrow(/not an object/);

    // missing name
    await writeJson(marketplacePath(), { owner: { name: 'x' }, plugins: [] });
    await expect(manager.read()).rejects.toThrow(/name is required/);

    // missing owner name
    await writeJson(marketplacePath(), { name: 'ok', owner: {}, plugins: [] });
    await expect(manager.read()).rejects.toThrow(/owner.name/);

    // plugins not array
    await writeJson(marketplacePath(), { name: 'ok', owner: { name: 'x' }, plugins: {} });
    await expect(manager.read()).rejects.toThrow(/plugins must be an array/);
  });
});
