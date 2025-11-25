import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, stat } from 'fs/promises';
import { join } from 'path';
import { loadState, saveState } from './state.js';

const originalEnv = { ...process.env };
let home: string;

beforeEach(async () => {
  home = await mkdtemp('/tmp/viyv-cli-state-');
  process.env.CLAUDE_HOME = home;
});

afterEach(async () => {
  process.env = { ...originalEnv };
  await rm(home, { recursive: true, force: true });
});

describe('state persistence', () => {
  it('returns empty object when state file missing', async () => {
    const state = await loadState();
    expect(state).toEqual({});
  });

  it('saves and reloads state', async () => {
    const data = {
      marketplaceName: 'mp',
      marketplacePath: '/tmp/mp',
      installs: {
        demo: {
          source: 'local',
          type: 'dir',
          lastInstalledAt: '2025-01-01T00:00:00.000Z',
        },
      },
    };
    await saveState(data);
    const loaded = await loadState();
    expect(loaded).toEqual(data);

    // ensure file lives under CLAUDE_HOME
    const expectedPath = join(home, '.viyv-claude', 'cli-state.json');
    await expect(stat(expectedPath)).resolves.toBeTruthy();
  });

  it('uses HOME when CLAUDE_HOME is absent', async () => {
    delete process.env.CLAUDE_HOME;
    process.env.HOME = home;
    await saveState({ marketplacePath: 'x' });
    const expectedPath = join(home, '.viyv-claude', 'cli-state.json');
    const loaded = await loadState();
    expect(loaded.marketplacePath).toBe('x');
    await expect(stat(expectedPath)).resolves.toBeTruthy();
  });

  it('falls back to USERPROFILE', async () => {
    delete process.env.CLAUDE_HOME;
    delete process.env.HOME;
    process.env.USERPROFILE = home;
    await saveState({ marketplaceName: 'fallback' });
    const expectedPath = join(home, '.viyv-claude', 'cli-state.json');
    const loaded = await loadState();
    expect(loaded.marketplaceName).toBe('fallback');
    await expect(stat(expectedPath)).resolves.toBeTruthy();
  });

  it('uses cwd when no home environment variables are set', async () => {
    const originalCwd = process.cwd();
    process.chdir(home);
    delete process.env.CLAUDE_HOME;
    delete process.env.HOME;
    delete process.env.USERPROFILE;

    await saveState({ marketplaceName: 'cwd' });
    const expectedPath = join(home, '.viyv-claude', 'cli-state.json');
    const loaded = await loadState();
    expect(loaded.marketplaceName).toBe('cwd');
    await expect(stat(expectedPath)).resolves.toBeTruthy();

    process.chdir(originalCwd);
  });
});
