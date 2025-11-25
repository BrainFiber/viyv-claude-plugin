import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, rm, writeFile, readdir } from 'fs/promises';
import { join } from 'path';
import AdmZip from 'adm-zip';
import fsExtra from 'fs-extra';
import { spawnSync } from 'child_process';
import { tmpdir } from 'os';
import {
  detectSourceKind,
  fetchSource,
  ensurePluginJson,
  detectPluginSource,
  __sourceTestUtils,
} from './source.js';

vi.mock('child_process', () => ({
  spawnSync: vi.fn(),
}));

const { ensureDir, writeJson, pathExists } = fsExtra;

const originalFetch = global.fetch;
const tempDirs: string[] = [];
const tmpRoot = tmpdir();

async function createPluginDir(root: string, name = 'demo'): Promise<string> {
  const dir = join(root, name);
  await ensureDir(join(dir, '.claude-plugin'));
  await ensureDir(join(dir, 'skills', 's1'));
  await writeJson(join(dir, '.claude-plugin', 'plugin.json'), { name, version: '0.0.1' });
  await writeFile(join(dir, 'skills', 's1', 'SKILL.md'), '# skill', 'utf-8');
  return dir;
}

function buildPluginZipBuffer(): Buffer {
  const zip = new AdmZip();
  zip.addFile('.claude-plugin/plugin.json', Buffer.from('{"name":"Zip","version":"1.0.0"}'));
  return zip.toBuffer();
}

beforeEach(() => {
  global.fetch = originalFetch;
  vi.mocked(spawnSync).mockReset();
});

afterEach(async () => {
  global.fetch = originalFetch;
  while (tempDirs.length) {
    const dir = tempDirs.pop();
    if (dir) await rm(dir, { recursive: true, force: true });
  }
  const entries = await readdir(tmpRoot);
  await Promise.all(
    entries
      .filter((d) => d.startsWith('viyv-cli-'))
      .map((d) => rm(join(tmpRoot, d), { recursive: true, force: true }))
  );
});

describe('detectSourceKind', () => {
  it('classifies sources correctly', () => {
    expect(detectSourceKind('http://example.com/a.zip')).toBe('zip-url');
    expect(detectSourceKind('https://github.com/org/repo')).toBe('github');
    expect(detectSourceKind('https://example.com/git')).toBe('git-url');
    expect(detectSourceKind('/path/to/file.zip')).toBe('zip-file');
    expect(detectSourceKind('/path/to/dir')).toBe('dir');
  });
});

describe('fetchSource', () => {
  it('returns dir as-is', async () => {
    const root = await mkdtemp('/tmp/viyv-src-');
    tempDirs.push(root);
    const res = await fetchSource(root);
    expect(res.path).toBe(root);
    await res.cleanup();
  });

  it('unpacks local zip file', async () => {
    const root = await mkdtemp('/tmp/viyv-zip-');
    tempDirs.push(root);
    const pluginDir = await createPluginDir(root, 'zip-plugin');
    const zipPath = join(root, 'plugin.zip');
    const zip = new AdmZip();
    zip.addLocalFolder(pluginDir);
    zip.writeZip(zipPath);

    const res = await fetchSource(zipPath);
    tempDirs.push(res.path);
    expect(await pathExists(join(res.path, '.claude-plugin', 'plugin.json'))).toBe(true);
    await res.cleanup();
    expect(await pathExists(res.path)).toBe(false);
  });

  it('downloads and unpacks zip url', async () => {
    const buffer = buildPluginZipBuffer();
    global.fetch = vi.fn(async () => new Response(buffer));

    const res = await fetchSource('http://example.com/plugin.zip');
    tempDirs.push(res.path);
    expect(await pathExists(join(res.path, '.claude-plugin', 'plugin.json'))).toBe(true);
    await res.cleanup();
    expect(await pathExists(res.path)).toBe(false);
  });

  it('throws when zip url download fails', async () => {
    global.fetch = vi.fn(async () => new Response('', { status: 500, statusText: 'bad' }));
    await expect(fetchSource('http://example.com/broken.zip')).rejects.toThrow(/Failed to download zip/);
  });

  it('falls back to github zip when git unavailable', async () => {
    const buffer = buildPluginZipBuffer();
    global.fetch = vi.fn(async () => new Response(buffer));
    vi.mocked(spawnSync).mockReturnValue({ status: 1 } as any);

    const res = await fetchSource('https://github.com/org/repo', 'main');
    tempDirs.push(res.path);
    expect(await pathExists(join(res.path, '.claude-plugin', 'plugin.json'))).toBe(true);
    await res.cleanup();
  });

  it('clones via git when available', async () => {
    const cloneSpy = vi
      .mocked(spawnSync)
      .mockImplementation((cmd, args) => ({ status: cmd === 'git' ? 0 : 1 } as any));

    const res = await fetchSource('https://example.com/git.git');
    tempDirs.push(res.path);
    expect(cloneSpy).toHaveBeenCalledWith('git', expect.arrayContaining(['clone', '--depth', '1']), {
      stdio: 'inherit',
    });
    await res.cleanup();
    expect(await pathExists(res.path)).toBe(false);
  });

  it('surfaces git clone failures', async () => {
    vi.mocked(spawnSync).mockImplementation((cmd, args) => {
      if (Array.isArray(args) && args[0] === '--version') return { status: 0 } as any;
      return { status: 7 } as any;
    });

    await expect(fetchSource('https://github.com/org/repo')).rejects.toThrow(/git clone failed/);
  });
});

describe('internal helpers', () => {
  it('uses default zip filename when url path missing', async () => {
    const buffer = buildPluginZipBuffer();
    global.fetch = vi.fn(async () => new Response(buffer));
    const res = await __sourceTestUtils.downloadAndUnzip('');
    tempDirs.push(res.path);
    expect(await pathExists(join(res.path, '.claude-plugin', 'plugin.json'))).toBe(true);
    await res.cleanup();
  });

  it('rejects invalid github url', async () => {
    vi.mocked(spawnSync).mockReturnValue({ status: 1 } as any);
    await expect(__sourceTestUtils.fetchGithub('https://example.com/notgithub')).rejects.toThrow(/Invalid GitHub URL/);
  });

  it('defaults github branch to main when ref missing', async () => {
    const buffer = buildPluginZipBuffer();
    global.fetch = vi.fn(async () => new Response(buffer));
    vi.mocked(spawnSync).mockReturnValue({ status: 1 } as any);
    const res = await __sourceTestUtils.fetchGithub('https://github.com/org/repo');
    tempDirs.push(res.path);
    expect(await pathExists(join(res.path, '.claude-plugin', 'plugin.json'))).toBe(true);
    await res.cleanup();
  });

  it('handles git absence and ref flag in fetchGit', async () => {
    vi.mocked(spawnSync).mockReturnValue({ status: 1 } as any);
    await expect(__sourceTestUtils.fetchGit('https://example.com/git.git')).rejects.toThrow(/git is not available/);

    vi.mocked(spawnSync).mockImplementation((cmd, args) => {
      if (Array.isArray(args) && args[0] === '--version') return { status: 0 } as any;
      return { status: 0 } as any;
    });
    const res = await __sourceTestUtils.fetchGit('https://example.com/git.git', 'dev');
    tempDirs.push(res.path);
    expect(await pathExists(res.path)).toBe(true);
    await res.cleanup();
  });
});

describe('ensurePluginJson', () => {
  it('validates existence and readability', async () => {
    const root = await mkdtemp('/tmp/viyv-ensure-');
    tempDirs.push(root);
    await createPluginDir(root, 'plugin');
    const path = await ensurePluginJson(join(root, 'plugin'));
    expect(path.endsWith('plugin.json')).toBe(true);
    await expect(ensurePluginJson(root)).rejects.toThrow(/plugin.json not found/);
  });
});

describe('detectPluginSource', () => {
  it('detects plugin and marketplace and handles bad json', async () => {
    const root = await mkdtemp('/tmp/viyv-detect-');
    tempDirs.push(root);
    const pluginDir = await createPluginDir(root, 'solo');
    expect(await detectPluginSource(pluginDir)).toEqual({ type: 'plugin', path: pluginDir });

    const mpDir = join(root, 'market');
    await ensureDir(join(mpDir, '.claude-plugin'));
    await writeJson(join(mpDir, '.claude-plugin', 'marketplace.json'), {
      name: 'mp',
      plugins: [{ name: 'p', source: './plugins/p' }],
    });
    const mpDetection = await detectPluginSource(mpDir);
    expect(mpDetection.type).toBe('marketplace');

    await writeFile(join(mpDir, '.claude-plugin', 'marketplace.json'), 'broken', 'utf-8');
    expect(await detectPluginSource(mpDir)).toEqual({ type: 'none' });

    await writeJson(join(mpDir, '.claude-plugin', 'marketplace.json'), { name: 'mp', plugins: {} });
    const fallback = await detectPluginSource(mpDir);
    if (fallback.type === 'marketplace') {
      expect(fallback.plugins).toEqual([]);
    }
  });
});
