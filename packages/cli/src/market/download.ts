import { mkdtemp, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { createHash } from 'crypto';
import AdmZip from 'adm-zip';
import { MarketClient } from './client.js';

export type MarketFetchResult = {
  path: string;
  cleanup: () => Promise<void>;
};

export async function fetchFromMarket(
  marketUrl: string,
  pluginId: string,
  token?: string,
  version?: string
): Promise<MarketFetchResult> {
  const client = new MarketClient(marketUrl, token);

  // Get download URL
  const downloadInfo = await client.downloadPlugin(pluginId, version);

  // Download the file
  const response = await fetch(downloadInfo.url);
  if (!response.ok) {
    throw new Error(`Failed to download plugin: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  // Verify checksum
  const actualChecksum = createHash('sha256').update(buffer).digest('hex');
  if (actualChecksum !== downloadInfo.checksum) {
    throw new Error(`Checksum mismatch: expected ${downloadInfo.checksum}, got ${actualChecksum}`);
  }

  // Extract to temp directory
  const tmpDir = await mkdtemp(join(tmpdir(), 'viyv-market-'));
  const zipPath = join(tmpDir, 'plugin.zip');

  await writeFile(zipPath, buffer);

  const zip = new AdmZip(zipPath);
  zip.extractAllTo(tmpDir, true);

  return {
    path: tmpDir,
    cleanup: () => rm(tmpDir, { recursive: true, force: true }),
  };
}
