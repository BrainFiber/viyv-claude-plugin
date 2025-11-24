import { spawnSync } from 'child_process';

export type ExecResult = {
  status: number | null;
};

export function runClaude(args: string[], cwd: string): ExecResult {
  const res = spawnSync('claude', args, {
    cwd,
    stdio: 'inherit',
    shell: false,
  });
  return { status: res.status };
}
