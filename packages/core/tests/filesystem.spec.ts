import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { mkdtemp, rm } from 'fs/promises';
import { PluginFileSystem } from '../src/filesystem/PluginFileSystem.js';
import { pathExists } from 'fs-extra';

let root: string;
let fsys: PluginFileSystem;

describe('PluginFileSystem', () => {
  beforeEach(async () => {
    root = await mkdtemp('/tmp/viyv-fs-');
    fsys = new PluginFileSystem(root);
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('returns empty list when skills dir is missing', async () => {
    const list = await fsys.listSkills(join(root, 'plugins', 'no-skills'));
    expect(list).toEqual([]);
  });

  it('creates, lists, and deletes skills', async () => {
    const pluginPath = await fsys.createPluginDir('p1');
    await fsys.writeSkill(pluginPath, 'hello', '# hi');
    await fsys.writeSkill(pluginPath, 'bye', '# bye');

    const skills = await fsys.listSkills(pluginPath);
    expect(skills.sort()).toEqual(['bye', 'hello']);

    await fsys.deleteSkill(pluginPath, 'hello');
    expect(await pathExists(join(pluginPath, 'skills', 'hello'))).toBe(false);
  });

  it('throws on missing plugin.json or skill content', async () => {
    const pluginPath = await fsys.createPluginDir('p2');
    await expect(fsys.readPluginJson(pluginPath)).rejects.toThrow(/Failed to read/);
    await expect(fsys.readSkill(pluginPath, 'missing')).rejects.toThrow(/Failed to read skill/);
  });

  it('returns plugin path helper', () => {
    expect(fsys.getPluginPath('abc')).toBe(join(root, 'plugins', 'abc'));
  });
});
