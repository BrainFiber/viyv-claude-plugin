import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, mkdir, writeFile as fsWriteFile, readFile as fsReadFile, access } from 'fs/promises';
import { join } from 'path';
import { ClaudePluginManagerImpl } from '../../core/src/index.js';
import { fetchSource, detectPluginSource } from './source.js';
import { saveState } from './state.js';

async function createPluginDir(base: string, name: string, version = '0.1.0') {
  const dir = join(base, name);
  await mkdir(join(dir, '.claude-plugin'), { recursive: true });
  await mkdir(join(dir, 'skills', 's1'), { recursive: true });
  await fsWriteFile(join(dir, '.claude-plugin', 'plugin.json'), JSON.stringify({
    name,
    version,
    description: 'demo',
  }, null, 2));
  await fsWriteFile(join(dir, 'skills', 's1', 'SKILL.md'), '# skill');
  return dir;
}

describe('install/remove/update flow (local sources)', () => {
  let root: string;

  beforeEach(async () => {
    root = await mkdtemp('/tmp/viyv-cli-');
    process.env.CLAUDE_PLUGIN_ROOT = root;
    process.env.CLAUDE_HOME = root;
    await saveState({ marketplacePath: root });
  });

  afterEach(async () => {
    delete process.env.CLAUDE_PLUGIN_ROOT;
    delete process.env.CLAUDE_HOME;
    await rm(root, { recursive: true, force: true });
  });

  it('installs from local directory via manager', async () => {
    const src = await createPluginDir(root, 'Demo Plugin');
    const manager = new ClaudePluginManagerImpl(root);

    const fetched = await fetchSource(src);
    const meta = await manager.importFromPath({ path: fetched.path });
    expect(meta.id).toBe('demo-plugin');
    await expect(access(join(root, 'plugins', meta.id))).resolves.toBeUndefined();
    const mpRaw = await fsReadFile(join(root, '.claude-plugin', 'marketplace.json'), 'utf-8');
    const mp = JSON.parse(mpRaw);
    expect(mp.plugins.find((p: any) => p.name === meta.id)).toBeDefined();
  });

  it('replaces plugin on update', async () => {
    const src = await createPluginDir(root, 'Update Plugin', '0.1.0');
    const manager = new ClaudePluginManagerImpl(root);
    let fetched = await fetchSource(src);
    await manager.importFromPath({ path: fetched.path });
    await fetched.cleanup();

    const src2 = await createPluginDir(root, 'Update Plugin', '0.2.0');
    fetched = await fetchSource(src2);
    await manager.delete('update-plugin');
    const meta2 = await manager.importFromPath({ path: fetched.path });
    expect(meta2.version).toBe('0.2.0');
  });

  it('lists installed plugins', async () => {
    const manager = new ClaudePluginManagerImpl(root);

    // Install multiple plugins
    const src1 = await createPluginDir(root, 'Plugin A', '1.0.0');
    const src2 = await createPluginDir(root, 'Plugin B', '2.0.0');

    await manager.importFromPath({ path: src1 });
    await manager.importFromPath({ path: src2 });

    const plugins = await manager.list();
    expect(plugins).toHaveLength(2);

    const ids = plugins.map(p => p.id);
    expect(ids).toContain('plugin-a');
    expect(ids).toContain('plugin-b');

    const pluginA = plugins.find(p => p.id === 'plugin-a');
    const pluginB = plugins.find(p => p.id === 'plugin-b');
    expect(pluginA?.version).toBe('1.0.0');
    expect(pluginB?.version).toBe('2.0.0');
  });

  it('returns empty list when no plugins installed', async () => {
    const manager = new ClaudePluginManagerImpl(root);
    const plugins = await manager.list();
    expect(plugins).toHaveLength(0);
  });
});

async function createMarketplaceDir(base: string, plugins: { name: string; version: string }[]) {
  const dir = join(base, 'marketplace-source');
  await mkdir(join(dir, '.claude-plugin'), { recursive: true });

  // Create marketplace.json
  const marketplaceJson = {
    name: 'test-marketplace',
    owner: { name: 'Test Owner' },
    plugins: plugins.map(p => ({
      name: p.name,
      source: `./plugins/${p.name}`,
      version: p.version,
      description: `Description for ${p.name}`,
    })),
  };
  await fsWriteFile(join(dir, '.claude-plugin', 'marketplace.json'), JSON.stringify(marketplaceJson, null, 2));

  // Create plugin directories
  for (const p of plugins) {
    const pluginDir = join(dir, 'plugins', p.name);
    await mkdir(join(pluginDir, '.claude-plugin'), { recursive: true });
    await fsWriteFile(join(pluginDir, '.claude-plugin', 'plugin.json'), JSON.stringify({
      name: p.name,
      version: p.version,
      description: `Description for ${p.name}`,
    }, null, 2));
  }

  return dir;
}

describe('detectPluginSource', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp('/tmp/viyv-detect-');
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('detects plugin.json', async () => {
    const pluginDir = await createPluginDir(tempDir, 'Single Plugin', '1.0.0');
    const result = await detectPluginSource(pluginDir);
    expect(result.type).toBe('plugin');
    if (result.type === 'plugin') {
      expect(result.path).toBe(pluginDir);
    }
  });

  it('detects marketplace.json with multiple plugins', async () => {
    const mpDir = await createMarketplaceDir(tempDir, [
      { name: 'plugin-a', version: '1.0.0' },
      { name: 'plugin-b', version: '2.0.0' },
    ]);
    const result = await detectPluginSource(mpDir);
    expect(result.type).toBe('marketplace');
    if (result.type === 'marketplace') {
      expect(result.plugins).toHaveLength(2);
      expect(result.plugins.map(p => p.name)).toContain('plugin-a');
      expect(result.plugins.map(p => p.name)).toContain('plugin-b');
    }
  });

  it('detects marketplace.json with single plugin', async () => {
    const mpDir = await createMarketplaceDir(tempDir, [
      { name: 'only-plugin', version: '1.0.0' },
    ]);
    const result = await detectPluginSource(mpDir);
    expect(result.type).toBe('marketplace');
    if (result.type === 'marketplace') {
      expect(result.plugins).toHaveLength(1);
      expect(result.plugins[0].name).toBe('only-plugin');
    }
  });

  it('returns none when no plugin.json or marketplace.json', async () => {
    await mkdir(join(tempDir, 'empty', '.claude-plugin'), { recursive: true });
    const result = await detectPluginSource(join(tempDir, 'empty'));
    expect(result.type).toBe('none');
  });
});

describe('marketplace install flow', () => {
  let root: string;
  let sourceDir: string;

  beforeEach(async () => {
    root = await mkdtemp('/tmp/viyv-mp-install-');
    sourceDir = await mkdtemp('/tmp/viyv-mp-source-');
    process.env.CLAUDE_PLUGIN_ROOT = root;
    process.env.CLAUDE_HOME = root;
    await saveState({ marketplacePath: root });
  });

  afterEach(async () => {
    delete process.env.CLAUDE_PLUGIN_ROOT;
    delete process.env.CLAUDE_HOME;
    await rm(root, { recursive: true, force: true });
    await rm(sourceDir, { recursive: true, force: true });
  });

  it('installs from marketplace with single plugin', async () => {
    const mpDir = await createMarketplaceDir(sourceDir, [
      { name: 'solo-plugin', version: '1.0.0' },
    ]);
    const manager = new ClaudePluginManagerImpl(root);
    const detection = await detectPluginSource(mpDir);

    expect(detection.type).toBe('marketplace');
    if (detection.type === 'marketplace') {
      const plugin = detection.plugins[0];
      const pluginPath = join(mpDir, plugin.source);
      const meta = await manager.importFromPath({ path: pluginPath, name: plugin.name });
      expect(meta.id).toBe('solo-plugin');
    }
  });

  it('installs specific plugin from marketplace by name', async () => {
    const mpDir = await createMarketplaceDir(sourceDir, [
      { name: 'plugin-a', version: '1.0.0' },
      { name: 'plugin-b', version: '2.0.0' },
    ]);
    const manager = new ClaudePluginManagerImpl(root);
    const detection = await detectPluginSource(mpDir);

    expect(detection.type).toBe('marketplace');
    if (detection.type === 'marketplace') {
      const plugin = detection.plugins.find(p => p.name === 'plugin-b');
      expect(plugin).toBeDefined();
      const pluginPath = join(mpDir, plugin!.source);
      const meta = await manager.importFromPath({ path: pluginPath, name: plugin!.name });
      expect(meta.id).toBe('plugin-b');
      expect(meta.version).toBe('2.0.0');
    }
  });

  it('installs multiple plugins from marketplace', async () => {
    const mpDir = await createMarketplaceDir(sourceDir, [
      { name: 'plugin-x', version: '1.0.0' },
      { name: 'plugin-y', version: '2.0.0' },
      { name: 'plugin-z', version: '3.0.0' },
    ]);
    const manager = new ClaudePluginManagerImpl(root);
    const detection = await detectPluginSource(mpDir);

    expect(detection.type).toBe('marketplace');
    if (detection.type === 'marketplace') {
      // Install plugin-x and plugin-z
      for (const name of ['plugin-x', 'plugin-z']) {
        const plugin = detection.plugins.find(p => p.name === name);
        const pluginPath = join(mpDir, plugin!.source);
        await manager.importFromPath({ path: pluginPath, name: plugin!.name });
      }

      const installed = await manager.list();
      expect(installed).toHaveLength(2);
      const ids = installed.map(p => p.id);
      expect(ids).toContain('plugin-x');
      expect(ids).toContain('plugin-z');
      expect(ids).not.toContain('plugin-y');
    }
  });

  it('updates plugin from marketplace by id', async () => {
    // Create initial marketplace with v1.0.0
    const mpDir1 = await createMarketplaceDir(sourceDir, [
      { name: 'updatable-plugin', version: '1.0.0' },
    ]);
    const manager = new ClaudePluginManagerImpl(root);

    // Install initial version
    const detection1 = await detectPluginSource(mpDir1);
    expect(detection1.type).toBe('marketplace');
    if (detection1.type === 'marketplace') {
      const plugin = detection1.plugins[0];
      const pluginPath = join(mpDir1, plugin.source);
      await manager.importFromPath({ path: pluginPath, name: plugin.name });
    }

    let installed = await manager.list();
    expect(installed[0].version).toBe('1.0.0');

    // Create updated marketplace with v2.0.0
    await rm(mpDir1, { recursive: true, force: true });
    const mpDir2 = await createMarketplaceDir(sourceDir, [
      { name: 'updatable-plugin', version: '2.0.0' },
    ]);

    // Simulate update: detect, find by id, delete old, import new
    const detection2 = await detectPluginSource(mpDir2);
    expect(detection2.type).toBe('marketplace');
    if (detection2.type === 'marketplace') {
      const plugin = detection2.plugins.find(p => p.name === 'updatable-plugin');
      expect(plugin).toBeDefined();
      const pluginPath = join(mpDir2, plugin!.source);

      await manager.delete('updatable-plugin');
      await manager.importFromPath({ path: pluginPath, name: plugin!.name });
    }

    installed = await manager.list();
    expect(installed).toHaveLength(1);
    expect(installed[0].id).toBe('updatable-plugin');
    expect(installed[0].version).toBe('2.0.0');
  });
});
