import { join } from 'path';
import { homedir } from 'os';
import { readFile, writeFile, mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';
import type { AuthCredentials } from './types.js';

const AUTH_FILE_NAME = 'auth.json';

export function getAuthFilePath(): string {
  return join(homedir(), '.viyv-claude', AUTH_FILE_NAME);
}

export async function saveCredentials(creds: AuthCredentials): Promise<void> {
  const filePath = getAuthFilePath();
  const dir = join(homedir(), '.viyv-claude');

  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  await writeFile(filePath, JSON.stringify(creds, null, 2), 'utf-8');
}

export async function loadCredentials(): Promise<AuthCredentials | null> {
  const filePath = getAuthFilePath();

  if (!existsSync(filePath)) {
    return null;
  }

  try {
    const content = await readFile(filePath, 'utf-8');
    const creds: AuthCredentials = JSON.parse(content);

    // Check if token is expired
    if (new Date(creds.expiresAt) < new Date()) {
      await clearCredentials();
      return null;
    }

    return creds;
  } catch {
    return null;
  }
}

export async function clearCredentials(): Promise<void> {
  const filePath = getAuthFilePath();

  if (existsSync(filePath)) {
    await rm(filePath);
  }
}
