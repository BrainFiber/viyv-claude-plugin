import { join } from 'path';
import { mkdir, access, readFile, writeFile } from 'fs/promises';
import { constants as fsConstants } from 'fs';

export type InstallRecord = {
  source: string;
  type: string;
  ref?: string;
  lastInstalledAt: string;
};

export type CliState = {
  marketplaceName?: string;
  marketplacePath?: string;
  installs?: Record<string, InstallRecord>;
};

function stateDir(): string {
  const home =
    process.env.CLAUDE_HOME || process.env.HOME || process.env.USERPROFILE || '';
  return join(home, '.viyv-claude');
}

function stateFile(): string {
  return join(stateDir(), 'cli-state.json');
}

export async function loadState(): Promise<CliState> {
  const file = stateFile();
  try {
    await access(file, fsConstants.F_OK);
  } catch {
    return {};
  }
  const raw = await readFile(file, 'utf-8');
  return JSON.parse(raw) as CliState;
}

export async function saveState(state: CliState): Promise<void> {
  const file = stateFile();
  await mkdir(stateDir(), { recursive: true });
  await writeFile(file, JSON.stringify(state, null, 2), 'utf-8');
}
