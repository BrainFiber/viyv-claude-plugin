import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { mkdirp, writeJson, writeFile } from 'fs-extra';
import { resolvePluginRoot, getDefaultPluginRoot, getConfigFilePath } from '../src/config/resolver.js';

const originalEnv = { ...process.env };

describe('resolvePluginRoot', () => {
  let tempHome: string;

  beforeEach(async () => {
    tempHome = join('/tmp', `.tmp-viyv-home-${Date.now()}`);
    process.env.CLAUDE_PLUGIN_ROOT = '';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('prefers CLAUDE_PLUGIN_ROOT env', async () => {
    process.env.CLAUDE_PLUGIN_ROOT = '/custom/from/env';
    expect(await resolvePluginRoot()).toBe('/custom/from/env');
  });

  it('uses CLAUDE_HOME for defaults', async () => {
    const fakeHome = join(tempHome, 'home0');
    process.env.CLAUDE_HOME = fakeHome;
    expect(getConfigFilePath()).toContain(fakeHome);
    expect(getDefaultPluginRoot()).toContain(fakeHome);
  });

  it('falls back to homedir when no env or config exists', async () => {
    process.env.CLAUDE_HOME = '';
    process.env.HOME = '';
    process.env.USERPROFILE = '';
    expect(await resolvePluginRoot()).toBe(getDefaultPluginRoot());
  });

  it('falls back to config.json when env not set', async () => {
    const fakeHome = join(tempHome, 'home1');
    process.env.HOME = fakeHome;
    process.env.USERPROFILE = fakeHome;
    await mkdirp(join(fakeHome, '.viyv-claude'));
    await writeJson(join(fakeHome, '.viyv-claude', 'config.json'), {
      pluginRoot: '/from/config',
    });

    expect(await resolvePluginRoot()).toBe('/from/config');
  });

  it('returns default when config missing or invalid', async () => {
    const fakeHome = join(tempHome, 'home2');
    process.env.HOME = fakeHome;
    process.env.USERPROFILE = fakeHome;
    await mkdirp(join(fakeHome, '.viyv-claude'));
    // invalid json shape should be ignored
    await writeJson(join(fakeHome, '.viyv-claude', 'config.json'), { invalid: true });

    expect(await resolvePluginRoot()).toBe(getDefaultPluginRoot());
  });

  it('uses default when config exists but pluginRoot absent', async () => {
    const fakeHome = join(tempHome, 'home3');
    process.env.HOME = fakeHome;
    await mkdirp(join(fakeHome, '.viyv-claude'));
    await writeJson(join(fakeHome, '.viyv-claude', 'config.json'), {});
    expect(await resolvePluginRoot()).toBe(getDefaultPluginRoot());
  });

  it('ignores broken config file', async () => {
    const fakeHome = join(tempHome, 'home4');
    process.env.HOME = fakeHome;
    const configPath = getConfigFilePath();
    await mkdirp(join(fakeHome, '.viyv-claude'));
    await writeFile(configPath, '{invalid json');
    expect(await resolvePluginRoot()).toBe(getDefaultPluginRoot());
  });
});
