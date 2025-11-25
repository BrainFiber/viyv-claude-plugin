import { describe, it, expect, vi, afterEach } from 'vitest';
import { spawnSync } from 'child_process';
import { runClaude } from './exec.js';

vi.mock('child_process', () => ({
  spawnSync: vi.fn(),
}));

const mockedSpawn = vi.mocked(spawnSync);

describe('runClaude', () => {
  afterEach(() => {
    mockedSpawn.mockReset();
  });

  it('uses pipe stdio when silent', () => {
    mockedSpawn.mockReturnValue({ status: 0 } as any);
    const res = runClaude(['plugin', 'marketplace', 'add'], '/tmp/test', { silent: true });
    expect(res.status).toBe(0);
    expect(mockedSpawn).toHaveBeenCalledWith('claude', ['plugin', 'marketplace', 'add'], {
      cwd: '/tmp/test',
      stdio: 'pipe',
      shell: false,
    });
  });

  it('inherits stdio by default', () => {
    mockedSpawn.mockReturnValue({ status: 2 } as any);
    const res = runClaude(['help'], '/tmp/other');
    expect(res.status).toBe(2);
    expect(mockedSpawn).toHaveBeenCalledWith('claude', ['help'], {
      cwd: '/tmp/other',
      stdio: 'inherit',
      shell: false,
    });
  });
});
