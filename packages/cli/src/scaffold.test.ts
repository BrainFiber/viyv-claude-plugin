import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readFile } from 'fs/promises';
import { join } from 'path';
import { scaffoldNewPlugin } from './scaffold.js';
import { pathExists } from 'fs-extra';

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
});
