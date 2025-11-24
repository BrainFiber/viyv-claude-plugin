import { join } from 'path';
import { access, readFile } from 'fs/promises';
import { constants as fsConstants } from 'fs';

export function resolveMarketplacePath(): string {
  const home =
    process.env.CLAUDE_HOME || process.env.HOME || process.env.USERPROFILE || '';
  return join(home, '.viyv-claude', '.claude-plugin');
}

export function resolveRootFromMarketplace(mpPath: string): string {
  return mpPath.endsWith('.claude-plugin') ? join(mpPath, '..') : mpPath;
}

export async function readMarketplaceName(mpPath: string): Promise<string | undefined> {
  const file = mpPath.endsWith('marketplace.json')
    ? mpPath
    : join(mpPath, 'marketplace.json');
  try {
    await access(file, fsConstants.F_OK);
  } catch {
    return undefined;
  }
  try {
    const raw = await readFile(file, 'utf-8');
    const data = JSON.parse(raw);
    return typeof data.name === 'string' ? data.name : undefined;
  } catch (_err) {
    return undefined;
  }
}
