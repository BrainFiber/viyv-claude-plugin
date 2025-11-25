import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { scaffoldNewPlugin, __scaffoldTestUtils } from './scaffold.js';
import { pathExists, ensureDir } from 'fs-extra';

describe('scaffoldNewPlugin', () => {
  let cwd: string;

  beforeEach(async () => {
    cwd = await mkdtemp('/tmp/viyv-new-');
  });

  afterEach(async () => {
    await rm(cwd, { recursive: true, force: true });
  });

  it('creates marketplace and plugin structure with templated values', async () => {
    await scaffoldNewPlugin({
      cwd,
      pluginName: 'Hello World',
      description: 'Demo plugin',
      version: '1.2.3',
      authorName: 'Tester',
      authorEmail: 't@example.com',
      marketplaceName: 'my-mp',
      ownerName: 'Owner',
      ownerEmail: 'o@example.com',
    });

    expect(await pathExists(join(cwd, '.claude-plugin', 'marketplace.json'))).toBe(true);
    expect(await pathExists(join(cwd, 'plugins', 'hello-world', '.claude-plugin', 'plugin.json'))).toBe(true);

    const mp = JSON.parse(await readFile(join(cwd, '.claude-plugin', 'marketplace.json'), 'utf-8'));
    expect(mp.name).toBe('my-mp');
    expect(mp.plugins[0].name).toBe('hello-world');
    // source should be relative path starting with ./
    expect(mp.plugins[0].source).toBe('./plugins/hello-world');

    const pj = JSON.parse(
      await readFile(join(cwd, 'plugins', 'hello-world', '.claude-plugin', 'plugin.json'), 'utf-8')
    );
    expect(pj.name).toBe('Hello World');
    expect(pj.version).toBe('1.2.3');
    expect(pj.author.name).toBe('Tester');
  });

  it('fails if paths exist without force', async () => {
    await scaffoldNewPlugin({ cwd, pluginName: 'One' });
    await expect(scaffoldNewPlugin({ cwd, pluginName: 'One' })).rejects.toThrow(/already exists/);
  });

  it('slugifies names and allows force overwrite', async () => {
    const pluginDir = join(cwd, 'plugins', 'plugin');
    const mpDir = join(cwd, '.claude-plugin');
    await scaffoldNewPlugin({ cwd, pluginName: 'Already' });
    // create conflicting dirs but allow overwrite with force and fallback slug
    await scaffoldNewPlugin({ cwd, pluginName: '!!!', force: true });
    expect(await pathExists(pluginDir)).toBe(true);
    expect(await pathExists(mpDir)).toBe(true);
  });

  it('throws when plugin directory already exists', async () => {
    const pluginDir = join(cwd, 'plugins', 'hello');
    await ensureDir(pluginDir);
    await expect(scaffoldNewPlugin({ cwd, pluginName: 'hello' })).rejects.toThrow(/already exists/);
  });

  it('fills missing template vars with empty string', async () => {
    const { renderTemplate } = __scaffoldTestUtils;
    const src = join(cwd, 'tpl.txt');
    const dest = join(cwd, 'out.txt');
    await writeFile(src, 'Hello {{UNKNOWN}}!', 'utf-8');
    await renderTemplate(src, dest, {});
    const rendered = await readFile(dest, 'utf-8');
    expect(rendered).toBe('Hello !');
  });
});
