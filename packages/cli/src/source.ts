import { basename, join } from 'path';
import { mkdtemp, readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { spawnSync } from 'child_process';
import AdmZip from 'adm-zip';
import fsExtra from 'fs-extra';
const { pathExists, stat, remove } = fsExtra;

export type SourceKind = 'dir' | 'zip-file' | 'zip-url' | 'github' | 'git-url';

export type FetchResult = {
  path: string; // unpacked directory containing .claude-plugin/plugin.json
  cleanup: () => Promise<void>;
};

export function detectSourceKind(source: string): SourceKind {
  if (source.startsWith('http')) {
    if (source.endsWith('.zip')) return 'zip-url';
    if (source.includes('github.com')) return 'github';
    return 'git-url';
  }
  if (source.endsWith('.zip')) return 'zip-file';
  return 'dir';
}

async function makeTmpDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), 'viyv-cli-'));
}

export async function fetchSource(source: string, ref?: string): Promise<FetchResult> {
  const kind = detectSourceKind(source);
  switch (kind) {
    case 'dir':
      return { path: source, cleanup: async () => {} };
    case 'zip-file':
      return await unpackZipFile(source);
    case 'zip-url':
      return await downloadAndUnzip(source);
    case 'github':
      return await fetchGithub(source, ref);
    case 'git-url':
      return await fetchGit(source, ref);
  }
}

async function unpackZipFile(zipPath: string): Promise<FetchResult> {
  const tmp = await makeTmpDir();
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(tmp, true);
  return { path: tmp, cleanup: () => remove(tmp) };
}

async function downloadAndUnzip(url: string): Promise<FetchResult> {
  const tmp = await makeTmpDir();
  const zipPath = join(tmp, basename(url.split('?')[0] || 'plugin.zip'));

  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new Error(`Failed to download zip from ${url}: ${res.status} ${res.statusText}`);
  }
  await pipeline(res.body as any, createWriteStream(zipPath));
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(tmp, true);
  return { path: tmp, cleanup: () => remove(tmp) };
}

async function fetchGithub(url: string, ref?: string): Promise<FetchResult> {
  // Prefer git if available
  if (hasGit()) {
    return fetchGit(url, ref);
  }
  // fallback to zip download from GitHub archive
  const match = url.match(/github\.com\/([^/]+)\/([^/#]+)(?:[\/]|$)/);
  if (!match) throw new Error('Invalid GitHub URL');
  const owner = match[1];
  const repo = match[2];
  const branch = ref || 'main';
  const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`;
  return downloadAndUnzip(zipUrl);
}

async function fetchGit(url: string, ref?: string): Promise<FetchResult> {
  if (!hasGit()) throw new Error('git is not available in this environment');
  const tmp = await makeTmpDir();
  const args = ['clone', '--depth', '1'];
  if (ref) args.push('--branch', ref);
  args.push(url, tmp);
  const res = spawnSync('git', args, { stdio: 'inherit' });
  if (res.status !== 0) {
    throw new Error(`git clone failed with status ${res.status}`);
  }
  return { path: tmp, cleanup: () => remove(tmp) };
}

function hasGit(): boolean {
  const res = spawnSync('git', ['--version'], { stdio: 'ignore' });
  return res.status === 0;
}

export async function ensurePluginJson(dir: string): Promise<string> {
  const path = join(dir, '.claude-plugin', 'plugin.json');
  if (!(await pathExists(path))) {
    throw new Error('plugin.json not found in source');
  }
  await stat(path); // throws if unreadable
  await readFile(path, 'utf-8');
  return path;
}

export type MarketplacePluginEntry = {
  name: string;
  source: string;
  description?: string;
  version?: string;
};

export type PluginSourceDetection =
  | { type: 'plugin'; path: string }
  | { type: 'marketplace'; plugins: MarketplacePluginEntry[] }
  | { type: 'none' };

export async function detectPluginSource(dir: string): Promise<PluginSourceDetection> {
  const pluginJsonPath = join(dir, '.claude-plugin', 'plugin.json');
  const marketplaceJsonPath = join(dir, '.claude-plugin', 'marketplace.json');

  // Check for plugin.json first
  if (await pathExists(pluginJsonPath)) {
    return { type: 'plugin', path: dir };
  }

  // Check for marketplace.json
  if (await pathExists(marketplaceJsonPath)) {
    try {
      const raw = await readFile(marketplaceJsonPath, 'utf-8');
      const data = JSON.parse(raw);
      const plugins: MarketplacePluginEntry[] = Array.isArray(data.plugins) ? data.plugins : [];
      return { type: 'marketplace', plugins };
    } catch {
      return { type: 'none' };
    }
  }

  return { type: 'none' };
}

// Internal hooks for white-box tests
export const __sourceTestUtils = {
  downloadAndUnzip,
  fetchGithub,
  fetchGit,
  hasGit,
};
