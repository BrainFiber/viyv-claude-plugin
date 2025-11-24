import { basename, join } from 'path';
import fse from 'fs-extra';
const { ensureDir, pathExists, readJson } = fse;
import type { MarketplaceSchema, MarketplacePluginEntry, PluginMeta, PluginJson } from '../types/index.js';
import { atomicWrite } from '../utils/atomic-write.js';
import { withLock } from '../utils/file-lock.js';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'local-marketplace';
}

function deriveDefaultName(rootPath: string): string {
  const base = basename(rootPath);
  return slugify(base || 'local-marketplace');
}

function getDefaultOwner() {
  return {
    name: process.env.CLAUDE_MARKETPLACE_OWNER_NAME || 'Local Marketplace',
    email: process.env.CLAUDE_MARKETPLACE_OWNER_EMAIL,
  };
}

export class MarketplaceManager {
  private marketplacePath: string;
  private marketplaceDir: string;
  private defaultName: string;

  constructor(private rootPath: string) {
    this.marketplaceDir = join(rootPath, '.claude-plugin');
    this.marketplacePath = join(this.marketplaceDir, 'marketplace.json');
    this.defaultName = process.env.CLAUDE_MARKETPLACE_NAME || deriveDefaultName(rootPath);
  }

  async read(): Promise<MarketplaceSchema> {
    return withLock(this.marketplacePath, async () => {
      if (!(await pathExists(this.marketplacePath))) {
        return this.createDefaultMarketplace();
      }

      try {
        const data = await readJson(this.marketplacePath);
        return this.validate(data);
      } catch (error) {
        throw new Error(`Failed to read marketplace: ${error}`);
      }
    });
  }

  async write(data: MarketplaceSchema): Promise<void> {
    return withLock(this.marketplacePath, async () => {
      try {
        await ensureDir(this.marketplaceDir);
        const content = JSON.stringify(data, null, 2);
        await atomicWrite(this.marketplacePath, content);
      } catch (error) {
        throw new Error(`Failed to write marketplace: ${error}`);
      }
    });
  }

  async upsertPlugin(meta: PluginMeta, pluginJson?: PluginJson): Promise<void> {
    const marketplace = await this.read();
    const entry: MarketplacePluginEntry = {
      name: meta.id,
      source: `./plugins/${meta.id}`,
      description: meta.description,
      version: meta.version,
      author: pluginJson?.author,
    };

    const index = marketplace.plugins.findIndex((p) => p.name === entry.name);
    if (index >= 0) {
      marketplace.plugins[index] = {
        ...marketplace.plugins[index],
        ...entry,
      };
    } else {
      marketplace.plugins.push(entry);
    }

    await this.write(marketplace);
  }

  async removePlugin(id: string): Promise<void> {
    const marketplace = await this.read();
    const next = marketplace.plugins.filter((p) => p.name !== id);
    if (next.length === marketplace.plugins.length) return;
    marketplace.plugins = next;
    await this.write(marketplace);
  }

  private createDefaultMarketplace(): MarketplaceSchema {
    return {
      name: this.defaultName,
      owner: getDefaultOwner(),
      plugins: [],
    };
  }

  private validate(data: unknown): MarketplaceSchema {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid marketplace: not an object');
    }

    const obj = data as Record<string, unknown>;
    if (typeof obj.name !== 'string' || !obj.name) {
      throw new Error('Invalid marketplace: name is required');
    }
    if (!obj.owner || typeof obj.owner !== 'object' || typeof (obj.owner as any).name !== 'string') {
      throw new Error('Invalid marketplace: owner.name is required');
    }
    if (!Array.isArray(obj.plugins)) {
      throw new Error('Invalid marketplace: plugins must be an array');
    }

    return {
      name: obj.name,
      owner: obj.owner as MarketplaceSchema['owner'],
      plugins: obj.plugins as MarketplacePluginEntry[],
    };
  }
}
