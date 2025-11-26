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

  it('installs all plugins from marketplace by default when no names specified', async () => {
    const mpDir = await createMarketplaceDir(sourceDir, [
      { name: 'plugin-a', version: '1.0.0' },
      { name: 'plugin-b', version: '2.0.0' },
      { name: 'plugin-c', version: '3.0.0' },
    ]);
    const manager = new ClaudePluginManagerImpl(root);
    const detection = await detectPluginSource(mpDir);

    expect(detection.type).toBe('marketplace');
    if (detection.type === 'marketplace') {
      // Simulate default behavior: install all plugins when no names specified
      for (const plugin of detection.plugins) {
        const pluginPath = join(mpDir, plugin.source);
        await manager.importFromPath({ path: pluginPath, name: plugin.name });
      }

      const installed = await manager.list();
      expect(installed).toHaveLength(3);
      const ids = installed.map(p => p.id);
      expect(ids).toContain('plugin-a');
      expect(ids).toContain('plugin-b');
      expect(ids).toContain('plugin-c');
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

// Helper function to slugify names (same as in index.ts)
function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// Helper to simulate updateInstalledMarketplacePlugins logic
async function updateInstalledMarketplacePlugins(
  marketplaceRoot: string,
  installedRoot: string
): Promise<{ updated: string[]; failed: string[] }> {
  const manager = new ClaudePluginManagerImpl(installedRoot);

  const detection = await detectPluginSource(marketplaceRoot);
  if (detection.type !== 'marketplace') {
    return { updated: [], failed: [] };
  }

  const installedPlugins = await manager.list();
  const installedIds = new Set(installedPlugins.map(p => p.id));

  const toUpdate = detection.plugins.filter(mp => installedIds.has(slugify(mp.name)));

  const updated: string[] = [];
  const failed: string[] = [];

  for (const plugin of toUpdate) {
    const id = slugify(plugin.name);
    const pluginPath = join(marketplaceRoot, plugin.source);

    try {
      await manager.delete(id);
      await manager.importFromPath({ path: pluginPath, name: plugin.name });
      updated.push(id);
    } catch (err) {
      failed.push(id);
    }
  }

  return { updated, failed };
}

describe('marketplace update flow (update command)', () => {
  let installedRoot: string;
  let sourceDir: string;

  beforeEach(async () => {
    installedRoot = await mkdtemp('/tmp/viyv-update-installed-');
    sourceDir = await mkdtemp('/tmp/viyv-update-source-');
    process.env.CLAUDE_PLUGIN_ROOT = installedRoot;
    process.env.CLAUDE_HOME = installedRoot;
    await saveState({ marketplacePath: installedRoot });
  });

  afterEach(async () => {
    delete process.env.CLAUDE_PLUGIN_ROOT;
    delete process.env.CLAUDE_HOME;
    await rm(installedRoot, { recursive: true, force: true });
    await rm(sourceDir, { recursive: true, force: true });
  });

  it('updates installed plugins from local marketplace', async () => {
    // Create marketplace with initial version
    const mpDir = await createMarketplaceDir(sourceDir, [
      { name: 'update-test-plugin', version: '1.0.0' },
    ]);
    const manager = new ClaudePluginManagerImpl(installedRoot);

    // Install initial version
    const detection = await detectPluginSource(mpDir);
    expect(detection.type).toBe('marketplace');
    if (detection.type === 'marketplace') {
      const plugin = detection.plugins[0];
      const pluginPath = join(mpDir, plugin.source);
      await manager.importFromPath({ path: pluginPath, name: plugin.name });
    }

    let installed = await manager.list();
    expect(installed).toHaveLength(1);
    expect(installed[0].version).toBe('1.0.0');

    // Update marketplace source to v2.0.0
    const pluginJsonPath = join(mpDir, 'plugins', 'update-test-plugin', '.claude-plugin', 'plugin.json');
    await fsWriteFile(pluginJsonPath, JSON.stringify({
      name: 'update-test-plugin',
      version: '2.0.0',
      description: 'Updated plugin',
    }, null, 2));

    // Run update
    const result = await updateInstalledMarketplacePlugins(mpDir, installedRoot);
    expect(result.updated).toContain('update-test-plugin');
    expect(result.failed).toHaveLength(0);

    // Verify version updated
    installed = await manager.list();
    expect(installed).toHaveLength(1);
    expect(installed[0].version).toBe('2.0.0');
  });

  it('only updates plugins that are installed', async () => {
    // Create marketplace with multiple plugins
    const mpDir = await createMarketplaceDir(sourceDir, [
      { name: 'installed-plugin', version: '1.0.0' },
      { name: 'not-installed-plugin', version: '1.0.0' },
    ]);
    const manager = new ClaudePluginManagerImpl(installedRoot);

    // Only install one plugin
    const detection = await detectPluginSource(mpDir);
    expect(detection.type).toBe('marketplace');
    if (detection.type === 'marketplace') {
      const plugin = detection.plugins.find(p => p.name === 'installed-plugin');
      const pluginPath = join(mpDir, plugin!.source);
      await manager.importFromPath({ path: pluginPath, name: plugin!.name });
    }

    // Update version in source
    const pluginJsonPath = join(mpDir, 'plugins', 'installed-plugin', '.claude-plugin', 'plugin.json');
    await fsWriteFile(pluginJsonPath, JSON.stringify({
      name: 'installed-plugin',
      version: '2.0.0',
      description: 'Updated',
    }, null, 2));

    // Run update
    const result = await updateInstalledMarketplacePlugins(mpDir, installedRoot);

    // Should only update the installed plugin
    expect(result.updated).toHaveLength(1);
    expect(result.updated).toContain('installed-plugin');

    // Verify only 1 plugin installed (not-installed-plugin was not installed)
    const installed = await manager.list();
    expect(installed).toHaveLength(1);
    expect(installed[0].id).toBe('installed-plugin');
  });

  it('returns empty when no plugins match', async () => {
    // Create marketplace with plugins
    const mpDir = await createMarketplaceDir(sourceDir, [
      { name: 'marketplace-plugin', version: '1.0.0' },
    ]);
    const manager = new ClaudePluginManagerImpl(installedRoot);

    // Install a different plugin (not in marketplace)
    const differentPluginDir = await createPluginDir(sourceDir, 'different-plugin', '1.0.0');
    await manager.importFromPath({ path: differentPluginDir, name: 'different-plugin' });

    // Run update
    const result = await updateInstalledMarketplacePlugins(mpDir, installedRoot);

    // No plugins should be updated
    expect(result.updated).toHaveLength(0);
    expect(result.failed).toHaveLength(0);
  });

  it('returns empty for non-marketplace source', async () => {
    // Create a single plugin (not a marketplace)
    const pluginDir = await createPluginDir(sourceDir, 'single-plugin', '1.0.0');

    // Run update with plugin directory (not marketplace)
    const result = await updateInstalledMarketplacePlugins(pluginDir, installedRoot);

    // Should return empty since it's not a marketplace
    expect(result.updated).toHaveLength(0);
    expect(result.failed).toHaveLength(0);
  });

  it('updates multiple installed plugins from marketplace', async () => {
    // Create marketplace with multiple plugins
    const mpDir = await createMarketplaceDir(sourceDir, [
      { name: 'plugin-a', version: '1.0.0' },
      { name: 'plugin-b', version: '1.0.0' },
      { name: 'plugin-c', version: '1.0.0' },
    ]);
    const manager = new ClaudePluginManagerImpl(installedRoot);

    // Install two plugins
    const detection = await detectPluginSource(mpDir);
    expect(detection.type).toBe('marketplace');
    if (detection.type === 'marketplace') {
      for (const name of ['plugin-a', 'plugin-c']) {
        const plugin = detection.plugins.find(p => p.name === name);
        const pluginPath = join(mpDir, plugin!.source);
        await manager.importFromPath({ path: pluginPath, name: plugin!.name });
      }
    }

    // Update versions in source
    for (const name of ['plugin-a', 'plugin-b', 'plugin-c']) {
      const pluginJsonPath = join(mpDir, 'plugins', name, '.claude-plugin', 'plugin.json');
      await fsWriteFile(pluginJsonPath, JSON.stringify({
        name,
        version: '2.0.0',
        description: 'Updated',
      }, null, 2));
    }

    // Run update
    const result = await updateInstalledMarketplacePlugins(mpDir, installedRoot);

    // Should only update the two installed plugins
    expect(result.updated).toHaveLength(2);
    expect(result.updated).toContain('plugin-a');
    expect(result.updated).toContain('plugin-c');

    // plugin-b should not be in updated list
    expect(result.updated).not.toContain('plugin-b');

    // Verify versions
    const installed = await manager.list();
    expect(installed).toHaveLength(2);
    for (const p of installed) {
      expect(p.version).toBe('2.0.0');
    }
  });
});
