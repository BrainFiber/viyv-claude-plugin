import { join } from 'path';
import fse from 'fs-extra';
const { ensureDir, pathExists, remove, writeFile } = fse;
import { randomBytes } from 'crypto';
import AdmZip from 'adm-zip';

/**
 * Plugin Importer
 * Handles importing plugins from various sources
 */
export class PluginImporter {
  private tempDir: string;

  constructor(private rootPath: string) {
    this.tempDir = join(rootPath, '.temp');
  }

  /**
   * Import plugin from local path
   */
  async importFromPath(srcPath: string, _targetId: string): Promise<string> {
    if (!(await pathExists(srcPath))) {
      throw new Error(`Source path does not exist: ${srcPath}`);
    }

    // Validate plugin structure
    const pluginJsonPath = join(srcPath, '.claude-plugin', 'plugin.json');
    if (!(await pathExists(pluginJsonPath))) {
      throw new Error(`Invalid plugin: missing .claude-plugin/plugin.json in ${srcPath}`);
    }

    return srcPath;
  }

  /**
   * Import plugin from URL (zip)
   */
  async importFromUrl(url: string, targetId: string): Promise<string> {
    await ensureDir(this.tempDir);

    try {
      // Download zip
      const zipPath = await this.downloadZip(url);

      // Extract zip
      const extractedPath = await this.extractZip(zipPath, targetId);

      // Validate plugin structure
      const pluginJsonPath = join(extractedPath, '.claude-plugin', 'plugin.json');
      if (!(await pathExists(pluginJsonPath))) {
        throw new Error(`Invalid plugin archive: missing .claude-plugin/plugin.json`);
      }

      return extractedPath;
    } catch (error) {
      // Clean up temp directory on error
      try {
        await remove(this.tempDir);
      } catch {
        // Ignore cleanup errors
      }
      throw error;
    }
  }

  /**
   * Download zip from URL
   */
  private async downloadZip(url: string): Promise<string> {
    const fileName = `${Date.now()}-${randomBytes(4).toString('hex')}.zip`;
    const zipPath = join(this.tempDir, fileName);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      await writeFile(zipPath, Buffer.from(buffer));

      return zipPath;
    } catch (error) {
      throw new Error(`Failed to download zip from ${url}: ${error}`);
    }
  }

  /**
   * Extract zip file
   */
  private async extractZip(zipPath: string, targetId: string): Promise<string> {
    const extractDir = join(this.tempDir, targetId);

    try {
      const zip = new AdmZip(zipPath);
      const zipEntries = zip.getEntries();

      // Check if zip has a root folder
      const rootFolderName = this.detectRootFolder(zipEntries);

      if (rootFolderName) {
        await ensureDir(extractDir);
        for (const entry of zipEntries) {
          if (!entry.entryName.startsWith(`${rootFolderName}/`)) continue;
          const relativePath = entry.entryName.slice(rootFolderName.length + 1);
          if (!relativePath) continue;

          const targetPath = join(extractDir, relativePath);
          if (entry.isDirectory) {
            await ensureDir(targetPath);
          } else {
            await ensureDir(join(targetPath, '..'));
            await writeFile(targetPath, entry.getData());
          }
        }
      } else {
        // Extract directly preserving structure
        zip.extractAllTo(extractDir, true);
      }

      // Clean up zip file
      await remove(zipPath);

      return extractDir;
    } catch (error) {
      throw new Error(`Failed to extract zip: ${error}`);
    }
  }

  /**
   * Detect root folder in zip
   * Returns folder name if all entries are under a single root folder
   */
  private detectRootFolder(entries: AdmZip.IZipEntry[]): string | null {
    const topLevelItems = new Set<string>();

    for (const entry of entries) {
      const parts = entry.entryName.split('/');
      if (parts.length > 0 && parts[0]) {
        topLevelItems.add(parts[0]);
      }
    }

    // If there's only one top-level item and it's a folder, return it
    if (topLevelItems.size === 1) {
      return Array.from(topLevelItems)[0];
    }

    return null;
  }

  /**
   * Clean up temp directory
   */
  async cleanup(): Promise<void> {
    try {
      await remove(this.tempDir);
    } catch {
      // Ignore cleanup errors
    }
  }
}
