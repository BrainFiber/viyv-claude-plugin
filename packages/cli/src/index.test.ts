import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runClaude } from './exec.js';
import { resolveMarketplacePath } from './utils.js';
import * as childProc from 'child_process';

vi.mock('child_process', () => ({
  spawnSync: vi.fn(() => ({ status: 5 })),
}));

// Simple sanity tests for helpers; command wiring is thin and relies on commander + child_process

describe('utils', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.HOME = '/home/tester';
    process.env.CLAUDE_HOME = '';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('resolves default marketplace path', () => {
    expect(resolveMarketplacePath()).toBe('/home/tester/.viyv-claude/.claude-plugin');
  });
});

describe('runClaude', () => {
  it('returns status code from child process', () => {
    const res = runClaude(['help'], process.cwd());
    expect(res.status).toBe(5);
  });
});
