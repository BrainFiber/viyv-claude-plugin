#!/usr/bin/env node
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { readFile } from 'fs/promises';
import { resolveMarketplacePath, readMarketplaceName, resolveRootFromMarketplace } from './utils.js';
import { loadState, saveState } from './state.js';
import { runClaude } from './exec.js';
import { fetchSource, detectPluginSource, parseMarketSource, detectSourceKind } from './source.js';
import { ClaudePluginManagerImpl, getDefaultPluginRoot } from 'viyv-claude-plugin-core';

const DEFAULT_MARKET_URL = process.env.VIYV_MARKET_URL || 'https://viyv-market.vercel.app';

function printHelp() {
  console.log(`Usage: viyv-claude-plugin <command> [options]

Commands:
  setup                 Register local marketplace with Claude Code
  uninstall             Remove registered marketplace
  update                Update marketplace from its source
  list                  List installed plugins
  install <source> [name...]  Install plugin(s) from source (all by default)
                        Sources: dir, zip, github URL, market:plugin-id
  remove <id>           Remove a locally installed plugin
  update-plugin <id>    Re-install a plugin from its original source
  new <name>            Scaffold a marketplace + plugin in current directory

Market Commands:
  login                 Authenticate with viyv-market
  logout                Remove stored credentials
  whoami                Show current authenticated user
  search <query>        Search plugins on viyv-market

  help                  Show this help
`);
}

type Parsed = { command?: string; args: string[]; flags: Record<string, string | boolean> };

function parseArgs(argv: string[]): Parsed {
  const [command, ...rest] = argv;
  const flags: Record<string, string | boolean> = {};
  const args: string[] = [];
  for (let i = 0; i < rest.length; i++) {
    const token = rest[i];
    switch (token) {
      case '-p':
      case '--path':
        flags.path = rest[++i];
        break;
      case '-n':
      case '--name':
        flags.name = rest[++i];
        break;
      case '--ref':
        flags.ref = rest[++i];
        break;
      case '--force':
        flags.force = true;
        break;
      case '--all':
        flags.all = true;
        break;
      case '--dry-run':
        flags.dryRun = true;
        break;
      case '-h':
      case '--help':
        flags.help = true;
        break;
      // new command flags
      case '--dir':
        flags.dir = rest[++i];
        break;
      case '--description':
        flags.description = rest[++i];
        break;
      case '--version':
        flags.version = rest[++i];
        break;
      case '--author-name':
        flags['author-name'] = rest[++i];
        break;
      case '--author-email':
        flags['author-email'] = rest[++i];
        break;
      case '--marketplace-name':
        flags['marketplace-name'] = rest[++i];
        break;
      case '--owner-name':
        flags['owner-name'] = rest[++i];
        break;
      case '--owner-email':
        flags['owner-email'] = rest[++i];
        break;
      default:
        args.push(token);
        break;
    }
  }
  return { command, args, flags };
}

function resolvePaths(flagPath?: string) {
  const mpPath = flagPath || resolveMarketplacePath();
  const root = resolveRootFromMarketplace(mpPath);
  const marketplaceDir = mpPath.endsWith('.claude-plugin') ? mpPath : join(mpPath, '.claude-plugin');
  return { root, marketplaceDir };
}

function setEnvRoot(root: string) {
  process.env.CLAUDE_PLUGIN_ROOT = root;
}

async function handleSetup(flags: Record<string, any>) {
  const { marketplaceDir, root } = resolvePaths(flags.path);
  const nameFromFile = await readMarketplaceName(marketplaceDir);
  const name = flags.name || nameFromFile;

  if (!existsSync(marketplaceDir)) {
    console.error(`Marketplace path not found: ${marketplaceDir}`);
    process.exitCode = 1;
    return;
  }

  const addArgs = ['plugin', 'marketplace', 'add', root];
  if (flags.dryRun) {
    console.log(`[dry-run] claude ${addArgs.join(' ')}`);
    if (name) await saveState({ marketplaceName: name, marketplacePath: root });
    return;
  }

  // Try to add silently first - if already installed, it will fail
  const addRes = runClaude(addArgs, process.cwd(), { silent: true });
  if (addRes.status !== 0) {
    // If already installed, try to update instead
    const updateArgs = ['plugin', 'marketplace', 'update'];
    if (name) updateArgs.push(name);
    const updateRes = runClaude(updateArgs, process.cwd());
    if (updateRes.status !== 0) {
      process.exitCode = updateRes.status ?? 1;
      return;
    }
  }

  await saveState({ marketplaceName: name, marketplacePath: root });
  if (name) console.log(`Registered marketplace: ${name}`);
}

async function handleUninstall(flags: Record<string, any>) {
  const state = await loadState();
  const { root } = resolvePaths(flags.path || state.marketplacePath);
  const name = flags.name || state.marketplaceName || (await readMarketplaceName(join(root, '.claude-plugin')));
  if (!name) {
    console.error('No marketplace name found. Use --name to specify.');
    process.exitCode = 1;
    return;
  }

  const args = ['plugin', 'marketplace', 'remove', name];
  if (flags.dryRun) {
    console.log(`[dry-run] claude ${args.join(' ')}`);
    return;
  }

  const res = runClaude(args, process.cwd());
  if (res.status !== 0) {
    process.exitCode = res.status ?? 1;
    return;
  }
  await saveState({});
  console.log(`Removed marketplace: ${name}`);
}

async function handleMarketplaceUpdate(flags: Record<string, any>) {
  const state = await loadState();
  const { root } = resolvePaths(flags.path || state.marketplacePath);
  const name = flags.name || state.marketplaceName || (await readMarketplaceName(join(root, '.claude-plugin')));
  const args = ['plugin', 'marketplace', 'update'];
  if (name) args.push(name);

  if (flags.dryRun) {
    console.log(`[dry-run] claude ${args.join(' ')}`);
  } else {
    const res = runClaude(args, process.cwd());
    if (res.status !== 0) {
      process.exitCode = res.status ?? 1;
      return;
    }
  }

  // Re-copy installed plugins from local marketplace
  setEnvRoot(root);
  const { updated, failed } = await updateInstalledMarketplacePlugins(root, flags);

  if (name) {
    await saveState({ marketplaceName: name, marketplacePath: root });
  }

  // Report results
  if (updated.length > 0) {
    console.log(`Updated marketplace: ${name || 'all'}`);
    console.log(`Re-copied plugins: ${updated.join(', ')}`);
  } else if (failed.length === 0) {
    console.log(`Updated marketplace: ${name || 'all'}`);
  }

  if (failed.length > 0) {
    console.error(`Failed to update: ${failed.join(', ')}`);
    process.exitCode = 1;
  }
}

async function handleList(_flags: Record<string, any>) {
  const state = await loadState();
  // Use installed plugins directory (~/.viyv-claude/), not marketplace source
  const installedRoot = getDefaultPluginRoot();
  const manager = new ClaudePluginManagerImpl(installedRoot);

  const plugins = await manager.list();
  if (plugins.length === 0) {
    console.log('No plugins installed.');
    return;
  }

  console.log('Installed plugins:\n');
  for (const plugin of plugins) {
    const installRecord = state.installs?.[plugin.id];
    console.log(`  ${plugin.id} (${plugin.version})`);
    if (installRecord?.source) {
      console.log(`    source: ${installRecord.source}`);
    }
    if (installRecord?.lastInstalledAt) {
      console.log(`    installed: ${installRecord.lastInstalledAt}`);
    }
    console.log();
  }
}

async function handleInstall(args: string[], flags: Record<string, any>) {
  const source = args[0];
  if (!source) {
    console.error('install requires a <source> argument');
    process.exitCode = 1;
    return;
  }

  // Handle market: source specially
  const sourceKind = detectSourceKind(source);
  if (sourceKind === 'market') {
    await handleMarketInstall(source, flags);
    return;
  }

  const pluginNames = args.slice(1); // Optional plugin names for marketplace
  const { root } = resolvePaths(flags.path);
  setEnvRoot(root);
  const manager = new ClaudePluginManagerImpl(root);

  const fetch = await fetchSource(source, flags.ref);
  try {
    const detection = await detectPluginSource(fetch.path);

    if (detection.type === 'none') {
      console.error('Error: plugin.json or marketplace.json not found in source');
      process.exitCode = 1;
      return;
    }

    if (detection.type === 'plugin') {
      // Single plugin installation
      await installSinglePlugin(fetch.path, source, flags, manager, root);
      return;
    }

    // Marketplace handling
    const { plugins } = detection;
    if (plugins.length === 0) {
      console.error('Error: No plugins found in marketplace');
      process.exitCode = 1;
      return;
    }

    // If only 1 plugin in marketplace, install it directly
    if (plugins.length === 1) {
      const plugin = plugins[0];
      const pluginPath = join(fetch.path, plugin.source);
      await installSinglePlugin(pluginPath, source, flags, manager, root, plugin.name);
      return;
    }

    // Multiple plugins - if --all flag, install all
    if (flags.all) {
      for (const plugin of plugins) {
        const pluginPath = join(fetch.path, plugin.source);
        await installSinglePlugin(pluginPath, source, flags, manager, root, plugin.name);
      }
      return;
    }

    // Multiple plugins - install all by default (no name specified)
    if (pluginNames.length === 0) {
      for (const plugin of plugins) {
        const pluginPath = join(fetch.path, plugin.source);
        await installSinglePlugin(pluginPath, source, flags, manager, root, plugin.name);
      }
      return;
    }

    // Install specified plugins
    for (const name of pluginNames) {
      const plugin = plugins.find(p => p.name === name);
      if (!plugin) {
        console.error(`Error: Plugin "${name}" not found in marketplace`);
        console.error('Available plugins:');
        for (const p of plugins) {
          console.error(`  - ${p.name}`);
        }
        process.exitCode = 1;
        return;
      }
      const pluginPath = join(fetch.path, plugin.source);
      await installSinglePlugin(pluginPath, source, flags, manager, root, plugin.name);
    }
  } finally {
    await fetch.cleanup();
  }
}

async function installSinglePlugin(
  pluginPath: string,
  source: string,
  flags: Record<string, any>,
  manager: InstanceType<typeof ClaudePluginManagerImpl>,
  root: string,
  overrideName?: string
) {
  const pluginJson = JSON.parse(await readFile(join(pluginPath, '.claude-plugin', 'plugin.json'), 'utf-8'));
  const name = flags.name || overrideName || pluginJson.name;

  if (flags.dryRun) {
    console.log(`[dry-run] would install plugin "${name}" from ${source} into ${root}`);
    return;
  }

  // If force and plugin exists, delete first
  if (flags.force) {
    const existing = await manager.get(name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    if (existing) await manager.delete(existing.id);
  }

  const meta = await manager.importFromPath({ path: pluginPath, name });
  const state = await loadState();
  const installs = state.installs || {};
  installs[meta.id] = {
    source,
    type: flags.ref ? `${detectSourceTypeLabel(source)}#${flags.ref}` : detectSourceTypeLabel(source),
    ref: flags.ref,
    lastInstalledAt: new Date().toISOString(),
  };
  await saveState({ ...state, marketplacePath: state.marketplacePath || root, installs });
  console.log(`Installed plugin: ${meta.id} (${meta.version})`);
}

async function handleRemove(args: string[], flags: Record<string, any>) {
  const id = args[0];
  if (!id) {
    console.error('remove requires a <id> argument');
    process.exitCode = 1;
    return;
  }
  const { root } = resolvePaths(flags.path);
  setEnvRoot(root);
  const manager = new ClaudePluginManagerImpl(root);

  if (flags.dryRun) {
    console.log(`[dry-run] would remove plugin ${id}`);
    return;
  }
  await manager.delete(id);
  const state = await loadState();
  if (state.installs) delete state.installs[id];
  await saveState(state);
  console.log(`Removed plugin: ${id}`);
}

async function handleUpdatePlugin(args: string[], flags: Record<string, any>) {
  const id = args[0];
  if (!id) {
    console.error('update-plugin requires a <id> argument');
    process.exitCode = 1;
    return;
  }
  const state = await loadState();
  const record = state.installs?.[id];
  const source = flags.source || record?.source;
  const ref = flags.ref || record?.ref;
  if (!source) {
    console.error('No source recorded for this plugin. Provide --source.');
    process.exitCode = 1;
    return;
  }
  const { root } = resolvePaths(flags.path || state.marketplacePath);
  setEnvRoot(root);
  const manager = new ClaudePluginManagerImpl(root);

  const fetch = await fetchSource(source, ref);
  try {
    const detection = await detectPluginSource(fetch.path);

    if (detection.type === 'none') {
      console.error('Error: plugin.json or marketplace.json not found in source');
      process.exitCode = 1;
      return;
    }

    let pluginPath: string;

    if (detection.type === 'plugin') {
      pluginPath = fetch.path;
    } else {
      // marketplace - find the plugin by id
      const plugin = detection.plugins.find(p => p.name === id);
      if (!plugin) {
        console.error(`Error: Plugin "${id}" not found in marketplace`);
        console.error('Available plugins:');
        for (const p of detection.plugins) {
          console.error(`  - ${p.name}`);
        }
        process.exitCode = 1;
        return;
      }
      pluginPath = join(fetch.path, plugin.source);
    }

    if (flags.dryRun) {
      console.log(`[dry-run] would update plugin ${id} from ${source}`);
      return;
    }

    await manager.delete(id);
    const meta = await manager.importFromPath({ path: pluginPath });
    const installs = state.installs || {};
    installs[id] = {
      source,
      type: detectSourceTypeLabel(source),
      ref,
      lastInstalledAt: new Date().toISOString(),
    };
    await saveState({ ...state, installs });
    console.log(`Updated plugin: ${meta.id} (${meta.version})`);
  } finally {
    await fetch.cleanup();
  }
}

function detectSourceTypeLabel(source: string): string {
  if (source.startsWith('http')) return source.includes('github.com') ? 'github' : 'url';
  if (source.endsWith('.zip')) return 'zip';
  return 'dir';
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function updateInstalledMarketplacePlugins(
  marketplaceRoot: string,
  flags: Record<string, any>
): Promise<{ updated: string[]; failed: string[] }> {
  // Resolve to absolute path
  const absoluteMarketplaceRoot = resolve(marketplaceRoot);

  // Use the default plugin root (~/.viyv-claude/) for installed plugins
  const installedRoot = getDefaultPluginRoot();
  const manager = new ClaudePluginManagerImpl(installedRoot);
  const state = await loadState();

  // 1. Detect marketplace plugins from the source
  const detection = await detectPluginSource(absoluteMarketplaceRoot);
  if (detection.type !== 'marketplace') {
    return { updated: [], failed: [] }; // Not a marketplace, nothing to update
  }

  // 2. Get installed plugins
  const installedPlugins = await manager.list();
  const installedIds = new Set(installedPlugins.map(p => p.id));

  // 3. Find installed plugins from this marketplace
  const toUpdate = detection.plugins.filter(mp => installedIds.has(slugify(mp.name)));

  const updated: string[] = [];
  const failed: string[] = [];

  for (const plugin of toUpdate) {
    const id = slugify(plugin.name);
    const pluginPath = resolve(absoluteMarketplaceRoot, plugin.source);

    if (flags.dryRun) {
      console.log(`[dry-run] would re-copy plugin "${id}" from ${pluginPath}`);
      updated.push(id);
      continue;
    }

    try {
      // Delete existing
      await manager.delete(id);

      // Re-import from marketplace source
      await manager.importFromPath({ path: pluginPath, name: plugin.name });

      // Update install record with timestamp
      const installs = state.installs || {};
      if (installs[id]) {
        installs[id].lastInstalledAt = new Date().toISOString();
      } else {
        installs[id] = {
          source: marketplaceRoot,
          type: 'local',
          lastInstalledAt: new Date().toISOString(),
        };
      }
      await saveState({ ...state, installs });

      updated.push(id);
    } catch (err) {
      console.error(`Failed to update plugin "${id}": ${(err as Error).message}`);
      failed.push(id);
    }
  }

  return { updated, failed };
}

async function main() {
  const { command, args, flags } = parseArgs(process.argv.slice(2));
  if (!command || flags.help || command === 'help') {
    printHelp();
    return;
  }

  try {
    switch (command) {
      case 'setup':
        await handleSetup(flags);
        break;
      case 'uninstall':
        await handleUninstall(flags);
        break;
      case 'update':
        // Accept path as first argument: update . or update /path/to/marketplace
        if (args[0]) flags.path = args[0];
        await handleMarketplaceUpdate(flags);
        break;
      case 'list':
        await handleList(flags);
        break;
      case 'install':
        await handleInstall(args, flags);
        break;
      case 'remove':
        await handleRemove(args, flags);
        break;
      case 'update-plugin':
        await handleUpdatePlugin(args, flags);
        break;
      case 'new':
        await handleNew(args, flags);
        break;
      case 'login':
        await handleLogin(flags);
        break;
      case 'logout':
        await handleLogout();
        break;
      case 'whoami':
        await handleWhoami();
        break;
      case 'search':
        await handleSearch(args, flags);
        break;
      default:
        console.error(`Unknown command: ${command}`);
        printHelp();
        process.exitCode = 1;
    }
  } catch (err) {
    console.error((err as Error).message);
    process.exitCode = 1;
  }
}

async function handleLogin(flags: Record<string, any>) {
  const { loginWithLocalhost } = await import('./auth/login.js');
  const marketUrl = flags.market || DEFAULT_MARKET_URL;

  console.log(`Authenticating with ${marketUrl}...`);

  try {
    const creds = await loginWithLocalhost(marketUrl);
    console.log(`\nAuthenticated as @${creds.username}`);
  } catch (err) {
    console.error(`Login failed: ${(err as Error).message}`);
    process.exitCode = 1;
  }
}

async function handleLogout() {
  const { clearCredentials } = await import('./auth/store.js');
  await clearCredentials();
  console.log('Logged out successfully.');
}

async function handleWhoami() {
  const { loadCredentials } = await import('./auth/store.js');
  const creds = await loadCredentials();

  if (!creds) {
    console.log('Not logged in. Run: viyv-claude-plugin login');
    return;
  }

  console.log(`Logged in as @${creds.username}`);
  console.log(`  User ID: ${creds.userId}`);
  console.log(`  Market: ${creds.marketUrl}`);
  console.log(`  Expires: ${creds.expiresAt}`);
}

async function handleSearch(args: string[], flags: Record<string, any>) {
  const query = args.join(' ');
  const { loadCredentials } = await import('./auth/store.js');
  const { MarketClient } = await import('./market/client.js');

  const creds = await loadCredentials();
  const marketUrl = flags.market || creds?.marketUrl || DEFAULT_MARKET_URL;
  const client = new MarketClient(marketUrl, creds?.token);

  try {
    const plugins = await client.searchPlugins(query, { limit: 20 });

    if (plugins.length === 0) {
      console.log('No plugins found.');
      return;
    }

    console.log(`Found ${plugins.length} plugin(s):\n`);

    for (const plugin of plugins) {
      console.log(`  ${plugin.id} (v${plugin.latest_version || '?.?.?'})`);
      if (plugin.description) {
        console.log(`    ${plugin.description.slice(0, 60)}${plugin.description.length > 60 ? '...' : ''}`);
      }
      console.log(`    by @${plugin.owner?.username || 'unknown'} | ${plugin.download_count} downloads`);
      console.log(`    Install: viyv-claude-plugin install market:${plugin.id}`);
      console.log();
    }
  } catch (err) {
    console.error(`Search failed: ${(err as Error).message}`);
    process.exitCode = 1;
  }
}

async function handleMarketInstall(source: string, flags: Record<string, any>) {
  const { loadCredentials } = await import('./auth/store.js');
  const { fetchFromMarket } = await import('./market/download.js');

  const { pluginId, version } = parseMarketSource(source);
  const creds = await loadCredentials();
  const marketUrl = flags.market || creds?.marketUrl || DEFAULT_MARKET_URL;

  console.log(`Installing ${pluginId}${version ? `@${version}` : ''} from market...`);

  const { root } = resolvePaths(flags.path);
  setEnvRoot(root);
  const manager = new ClaudePluginManagerImpl(root);

  try {
    const fetch = await fetchFromMarket(marketUrl, pluginId, creds?.token, version);

    try {
      const detection = await detectPluginSource(fetch.path);

      if (detection.type === 'none') {
        console.error('Error: Downloaded plugin does not contain plugin.json');
        process.exitCode = 1;
        return;
      }

      if (flags.dryRun) {
        console.log(`[dry-run] would install plugin "${pluginId}" from market into ${root}`);
        return;
      }

      // If force and plugin exists, delete first
      if (flags.force) {
        const existing = await manager.get(pluginId);
        if (existing) await manager.delete(existing.id);
      }

      const meta = await manager.importFromPath({ path: fetch.path, name: pluginId });
      const state = await loadState();
      const installs = state.installs || {};
      installs[meta.id] = {
        source,
        type: 'market',
        ref: version,
        lastInstalledAt: new Date().toISOString(),
      };
      await saveState({ ...state, marketplacePath: state.marketplacePath || root, installs });
      console.log(`Installed plugin: ${meta.id} (${meta.version})`);
    } finally {
      await fetch.cleanup();
    }
  } catch (err) {
    console.error(`Failed to install from market: ${(err as Error).message}`);
    process.exitCode = 1;
  }
}

main();
async function handleNew(args: string[], flags: Record<string, any>) {
  const name = args[0];
  if (!name) {
    console.error('new requires a <name> argument');
    process.exitCode = 1;
    return;
  }
  const dir = flags.dir || process.cwd();
  const { scaffoldNewPlugin } = await import('./scaffold.js');
  await scaffoldNewPlugin({
    cwd: dir,
    pluginName: name,
    description: flags.description,
    version: flags.version,
    authorName: flags['author-name'],
    authorEmail: flags['author-email'],
    marketplaceName: flags['marketplace-name'],
    ownerName: flags['owner-name'],
    ownerEmail: flags['owner-email'],
    force: flags.force,
  });
  console.log(`Created new plugin scaffold at ${dir}`);
}
