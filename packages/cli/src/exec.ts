import { spawnSync } from 'child_process';

export type ExecResult = {
  status: number | null;
};

export type RunClaudeOptions = {
  silent?: boolean;
};

export function runClaude(args: string[], cwd: string, options?: RunClaudeOptions): ExecResult {
  const res = spawnSync('claude', args, {
    cwd,
    stdio: options?.silent ? 'pipe' : 'inherit',
    shell: false,
  });
  return { status: res.status };
}
