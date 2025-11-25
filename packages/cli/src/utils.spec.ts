import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { resolveMarketplacePath, resolveRootFromMarketplace, readMarketplaceName } from './utils.js';

const originalEnv = { ...process.env };
let home: string;

beforeEach(async () => {
  home = await mkdtemp('/tmp/viyv-cli-home-');
  process.env.CLAUDE_HOME = home;
  delete process.env.HOME;
  delete process.env.USERPROFILE;
});

afterEach(async () => {
  process.env = { ...originalEnv };
  await rm(home, { recursive: true, force: true });
});

describe('utils paths', () => {
  it('resolves marketplace path from CLAUDE_HOME', () => {
    const mp = resolveMarketplacePath();
    expect(mp).toBe(join(home, '.viyv-claude', '.claude-plugin'));
  });

  it('falls back to HOME when CLAUDE_HOME is missing', () => {
    delete process.env.CLAUDE_HOME;
    process.env.HOME = home;
    const mp = resolveMarketplacePath();
    expect(mp).toBe(join(home, '.viyv-claude', '.claude-plugin'));
  });

  it('uses USERPROFILE when other env vars are absent', () => {
    delete process.env.CLAUDE_HOME;
    delete process.env.HOME;
    process.env.USERPROFILE = home;
    const mp = resolveMarketplacePath();
    expect(mp).toBe(join(home, '.viyv-claude', '.claude-plugin'));
  });

  it('returns relative path when no home env is set', () => {
    delete process.env.CLAUDE_HOME;
    delete process.env.HOME;
    delete process.env.USERPROFILE;
    const mp = resolveMarketplacePath();
    expect(mp).toBe(join('', '.viyv-claude', '.claude-plugin'));
  });

  it('derives root from marketplace folder', () => {
    const mpDir = join(home, '.viyv-claude', '.claude-plugin');
    expect(resolveRootFromMarketplace(mpDir)).toBe(join(home, '.viyv-claude'));
    expect(resolveRootFromMarketplace('/tmp/market')).toBe('/tmp/market');
  });
});

describe('readMarketplaceName', () => {
  it('returns undefined when file missing or invalid', async () => {
    const mpDir = join(home, '.viyv-claude', '.claude-plugin');
    expect(await readMarketplaceName(mpDir)).toBeUndefined();

    await mkdir(mpDir, { recursive: true });
    await writeFile(join(mpDir, 'marketplace.json'), 'not json', 'utf-8');
    expect(await readMarketplaceName(mpDir)).toBeUndefined();
  });

  it('reads marketplace name when present', async () => {
    const mpDir = join(home, '.viyv-claude', '.claude-plugin');
    await mkdir(mpDir, { recursive: true });
    await writeFile(
      join(mpDir, 'marketplace.json'),
      JSON.stringify({ name: 'demo-mp' }, null, 2),
      'utf-8'
    );

    expect(await readMarketplaceName(mpDir)).toBe('demo-mp');

    // passing direct file path should also work
    const filePath = join(home, 'marketplace.json');
    await writeFile(filePath, JSON.stringify({ name: 'from-file' }), 'utf-8');
    expect(await readMarketplaceName(filePath)).toBe('from-file');

    // missing name should return undefined
    await writeFile(filePath, JSON.stringify({}), 'utf-8');
    expect(await readMarketplaceName(filePath)).toBeUndefined();
  });
});
