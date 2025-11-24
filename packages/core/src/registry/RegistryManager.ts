import { join } from 'path';
import fse from 'fs-extra';
const { ensureDir, pathExists, readJson } = fse;
import type { RegistrySchema, PluginMeta } from '../types/index.js';
import { createEmptyRegistry, REGISTRY_VERSION } from '../types/index.js';
import { atomicWrite } from '../utils/atomic-write.js';
import { withLock } from '../utils/file-lock.js';

/**
 * Registry Manager
 * Handles reading and writing of registry.json
 */
export class RegistryManager {
  private registryPath: string;

  constructor(private rootPath: string) {
    this.registryPath = join(rootPath, 'registry.json');
  }

  /**
   * Read registry
   */
  async read(): Promise<RegistrySchema> {
    return withLock(this.registryPath, async () => {
      if (!(await pathExists(this.registryPath))) {
        return createEmptyRegistry();
      }

      try {
        const data = await readJson(this.registryPath);
        return this.validateRegistry(data);
      } catch (error) {
        throw new Error(`Failed to read registry: ${error}`);
      }
    });
  }

  /**
   * Write registry
   */
  async write(data: RegistrySchema): Promise<void> {
    return withLock(this.registryPath, async () => {
      try {
        // Ensure parent directory exists
        await ensureDir(this.rootPath);

        // Atomic write
        const content = JSON.stringify(data, null, 2);
        await atomicWrite(this.registryPath, content);
      } catch (error) {
        throw new Error(`Failed to write registry: ${error}`);
      }
    });
  }

  /**
   * Add plugin to registry
   */
  async addPlugin(meta: PluginMeta): Promise<void> {
    const registry = await this.read();

    // Check for duplicate ID
    if (registry.plugins.some((p) => p.id === meta.id)) {
      throw new Error(`Plugin with ID "${meta.id}" already exists`);
    }

    registry.plugins.push(meta);
    await this.write(registry);
  }

  /**
   * Update plugin in registry
   */
  async updatePlugin(id: string, meta: Partial<PluginMeta>): Promise<void> {
    const registry = await this.read();

    const index = registry.plugins.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Plugin with ID "${id}" not found`);
    }

    registry.plugins[index] = {
      ...registry.plugins[index],
      ...meta,
      updatedAt: new Date().toISOString(),
    };

    await this.write(registry);
  }

  /**
   * Remove plugin from registry
   */
  async removePlugin(id: string): Promise<void> {
    const registry = await this.read();

    const index = registry.plugins.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Plugin with ID "${id}" not found`);
    }

    registry.plugins.splice(index, 1);
    await this.write(registry);
  }

  /**
   * Find plugin by ID
   */
  async findPlugin(id: string): Promise<PluginMeta | undefined> {
    const registry = await this.read();
    return registry.plugins.find((p) => p.id === id);
  }

  /**
   * List all plugins
   */
  async listPlugins(): Promise<PluginMeta[]> {
    const registry = await this.read();
    return registry.plugins;
  }

  /**
   * Validate registry data
   */
  private validateRegistry(data: unknown): RegistrySchema {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid registry: not an object');
    }

    if (!data.version) {
      // Upgrade old registry
      return {
        version: REGISTRY_VERSION,
        plugins: Array.isArray(data.plugins) ? data.plugins : [],
      };
    }

    if (!Array.isArray(data.plugins)) {
      throw new Error('Invalid registry: plugins is not an array');
    }

    return data as RegistrySchema;
  }
}
