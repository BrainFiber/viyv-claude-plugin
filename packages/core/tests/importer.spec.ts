import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { join } from 'path';
import { mkdtemp, rm } from 'fs/promises';
import AdmZip from 'adm-zip';
import { PluginImporter } from '../src/filesystem/PluginImporter.js';
import { readJson, pathExists } from 'fs-extra';

async function createTempRoot() {
  return mkdtemp('/tmp/viyv-importer-');
}

describe('PluginImporter', () => {
  let root: string;
  let importer: PluginImporter;
  let originalFetch: typeof fetch;

  beforeEach(async () => {
    root = await createTempRoot();
    importer = new PluginImporter(root);
    originalFetch = global.fetch;
  });

  afterEach(async () => {
    global.fetch = originalFetch;
    await rm(root, { recursive: true, force: true });
  });

  it('validates local path has plugin.json', async () => {
    await expect(importer.importFromPath('/no/such/path', 'x')).rejects.toThrow(
      /does not exist/
    );
  });

  it('rejects local directory without plugin.json', async () => {
    const dir = await createTempRoot();
    await expect(importer.importFromPath(dir, 'x')).rejects.toThrow(/missing .claude-plugin/);
    await rm(dir, { recursive: true, force: true });
  });

  it('imports from URL zip and cleans temp', async () => {
    // build zip with root folder
    const zip = new AdmZip();
    zip.addFile('root/', Buffer.alloc(0));
    zip.addFile('root/.claude-plugin/', Buffer.alloc(0));
    zip.addFile('root/.claude-plugin/plugin.json', Buffer.from('{"name":"ZipPlugin","version":"1.0.0"}'));
    zip.addFile('root/skills/', Buffer.alloc(0));
    zip.addFile('root/skills/s1/', Buffer.alloc(0));
    zip.addFile('root/skills/s1/SKILL.md', Buffer.from('# skill'));
    const buffer = zip.toBuffer();

    global.fetch = vi.fn(async () => new Response(buffer));

    const extracted = await importer.importFromUrl('http://example.com/plugin.zip', 'tmpid');

    const pluginJson = await readJson(join(extracted, '.claude-plugin', 'plugin.json'));
    expect(pluginJson.name).toBe('ZipPlugin');
    expect(await pathExists(join(extracted, 'skills', 's1', 'SKILL.md'))).toBe(true);
  });

  it('cleans temp on invalid archive', async () => {
    const zip = new AdmZip();
    zip.addFile('no-plugin/README.md', Buffer.from('oops'));
    const buffer = zip.toBuffer();
    global.fetch = vi.fn(async () => new Response(buffer));

    await expect(
      importer.importFromUrl('http://example.com/bad.zip', 'tmpid')
    ).rejects.toThrow(
      /missing .claude-plugin\/plugin.json/
    );
    expect(await pathExists(join(root, '.temp'))).toBe(false);
  });

  it('fails when zip is corrupted', async () => {
    global.fetch = vi.fn(async () => new Response(Buffer.from('not a zip')));
    await expect(importer.importFromUrl('http://example.com/bad.zip', 'tmpid')).rejects.toThrow(
      /Failed to extract zip/
    );
    expect(await pathExists(join(root, '.temp'))).toBe(false);
  });

  it('fails download with non-OK response and fetch rejection', async () => {
    global.fetch = vi.fn(async () => new Response('', { status: 500, statusText: 'boom' }));
    await expect(importer.importFromUrl('http://example.com/bad.zip', 'tmpid')).rejects.toThrow(
      /Failed to download/
    );
    global.fetch = vi.fn(async () => {
      throw new Error('network');
    });
    await expect(importer.importFromUrl('http://example.com/bad2.zip', 'tmpid')).rejects.toThrow(
      /Failed to download zip/
    );
  });

  it('skips stray entries when extracting rooted archives', async () => {
    const zip = new AdmZip();
    zip.addFile('root', Buffer.from('orphan')); // will be ignored by extractZip loop
    zip.addFile('root/.claude-plugin/plugin.json', Buffer.from('{"name":"Mixed","version":"1.0.0"}'));
    const zipPath = join(root, 'mixed.zip');
    zip.writeZip(zipPath);

    const extracted = await (importer as any).extractZip(zipPath, 'mixed');
    const pluginJson = await readJson(join(extracted, '.claude-plugin', 'plugin.json'));
    expect(pluginJson.name).toBe('Mixed');
  });

  it('detects missing single root folder', () => {
    const entries = [
      { entryName: 'one/file.txt' },
      { entryName: 'two/other.txt' },
    ] as any;
    const rootName = (importer as any).detectRootFolder(entries);
    expect(rootName).toBeNull();
  });

  it('ignores empty entry names when detecting root folder', () => {
    const entries = [{ entryName: '' }, { entryName: 'root/file.txt' }] as any;
    const rootName = (importer as any).detectRootFolder(entries);
    expect(rootName).toBe('root');
  });
});
