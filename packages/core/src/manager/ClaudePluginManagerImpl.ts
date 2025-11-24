import type {
  ClaudePluginManager,
  PluginMeta,
  CreatePluginInput,
  UpdatePluginInput,
  ImportFromPathInput,
  ImportFromUrlInput,
  ListFilterOptions,
  PluginJson,
} from '../types/index.js';
import { RegistryManager } from '../registry/RegistryManager.js';
import { PluginFileSystem } from '../filesystem/PluginFileSystem.js';
import { PluginImporter } from '../filesystem/PluginImporter.js';
import { validateSkillInput } from '../validators/skill.js';

/**
 * Generate a slug from a name
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Claude Plugin Manager Implementation
 */
export class ClaudePluginManagerImpl implements ClaudePluginManager {
  private registry: RegistryManager;
  private fs: PluginFileSystem;
  private importer: PluginImporter;

  constructor(rootPath: string) {
    this.registry = new RegistryManager(rootPath);
    this.fs = new PluginFileSystem(rootPath);
    this.importer = new PluginImporter(rootPath);
  }

  /**
   * List all plugins with optional filtering
   */
  async list(filter?: ListFilterOptions): Promise<PluginMeta[]> {
    const plugins = await this.registry.listPlugins();

    if (!filter?.tags || filter.tags.length === 0) {
      return plugins;
    }

    // Filter by tags
    return plugins.filter((plugin) => {
      if (!plugin.tags) return false;
      return filter.tags!.some((tag) => plugin.tags!.includes(tag));
    });
  }

  /**
   * Get a plugin by ID
   */
  async get(id: string): Promise<PluginMeta | undefined> {
    return this.registry.findPlugin(id);
  }

  /**
   * Create a new plugin
   */
  async create(input: CreatePluginInput): Promise<PluginMeta> {
    const id = slugify(input.name);
    const version = input.version || '1.0.0';

    // Check if plugin already exists
    const existing = await this.registry.findPlugin(id);
    if (existing) {
      throw new Error(`Plugin with ID "${id}" already exists`);
    }

    // Create plugin directory
    const pluginPath = await this.fs.createPluginDir(id);

    // Write plugin.json
    const pluginJson: PluginJson = {
      name: input.name,
      description: input.description,
      version,
      author: input.author,
      homepage: input.homepage,
      repository: input.repository,
      license: input.license,
      keywords: input.keywords,
    };
    if (input.commands?.length) pluginJson.commands = './commands';
    // NOTE: agents と skills は plugin.json に設定しない
    // SDK は agents/ と skills/ ディレクトリを自動検出する
    // plugin.json に agents フィールドがあると SDK がプラグインを認識しなくなる問題あり
    // if (input.agents?.length) pluginJson.agents = './agents';
    // if (input.skills?.length) pluginJson.skills = './skills';
    if (input.hooks) pluginJson.hooks = './hooks/hooks.json';
    if (input.mcpServers) pluginJson.mcpServers = './.mcp.json';

    await this.fs.writePluginJson(pluginPath, {
      ...pluginJson,
    });

    if (input.commands?.length) {
      await this.fs.writeCommands(pluginPath, input.commands);
    }
    if (input.agents?.length) {
      await this.fs.writeAgents(pluginPath, input.agents);
    }
    if (input.hooks) {
      await this.fs.writeHooksConfig(pluginPath, input.hooks);
    }
    if (input.mcpServers) {
      await this.fs.writeMcpServers(pluginPath, input.mcpServers);
    }
    // Write skills if provided
    if (input.skills && input.skills.length > 0) {
      input.skills.forEach(validateSkillInput);
      await this.fs.writeSkills(pluginPath, input.skills);
    }

    // Create plugin meta
    const now = new Date().toISOString();
    const meta: PluginMeta = {
      id,
      name: input.name,
      version,
      description: input.description,
      location: pluginPath,
      source: { type: 'generated' },
      tags: input.tags,
      createdAt: now,
      updatedAt: now,
    };

    // Add to registry
    await this.registry.addPlugin(meta);

    return meta;
  }

  /**
   * Update an existing plugin
   */
  async update(id: string, patch: UpdatePluginInput): Promise<PluginMeta> {
    const existing = await this.registry.findPlugin(id);
    if (!existing) {
      throw new Error(`Plugin with ID "${id}" not found`);
    }

    const pluginPath = existing.location;

    // Update plugin.json if name, version, or description changed
    if (
      patch.name ||
      patch.version ||
      patch.description ||
      patch.hooks ||
      patch.mcpServers ||
      patch.commands ||
      patch.agents
    ) {
      const currentPluginJson = await this.fs.readPluginJson(pluginPath);
      await this.fs.writePluginJson(pluginPath, {
        name: patch.name || currentPluginJson.name,
        version: patch.version || currentPluginJson.version,
        description: patch.description ?? currentPluginJson.description,
        author: currentPluginJson.author,
        homepage: currentPluginJson.homepage,
        repository: currentPluginJson.repository,
        license: currentPluginJson.license,
        keywords: currentPluginJson.keywords,
        commands:
          patch.commands != null
            ? patch.commands.length > 0
              ? './commands'
              : undefined
            : currentPluginJson.commands,
        agents:
          patch.agents != null
            ? patch.agents.length > 0
              ? './agents'
              : undefined
            : currentPluginJson.agents,
        skills:
          patch.skills != null
            ? patch.skills.length > 0
              ? './skills'
              : undefined
            : currentPluginJson.skills,
        hooks: patch.hooks ? './hooks/hooks.json' : currentPluginJson.hooks,
        mcpServers: patch.mcpServers ? './.mcp.json' : currentPluginJson.mcpServers,
      });
    }

    // Update skills if provided
    if (patch.skills) {
      patch.skills.forEach(validateSkillInput);
      // Remove all existing skills
      const existingSkills = await this.fs.listSkills(pluginPath);
      for (const skillId of existingSkills) {
        await this.fs.deleteSkill(pluginPath, skillId);
      }

      // Write new skills
      await this.fs.writeSkills(pluginPath, patch.skills);
    }

    if (patch.commands) {
      await this.fs.removeCommands(pluginPath);
      if (patch.commands.length > 0) {
        await this.fs.writeCommands(pluginPath, patch.commands);
      }
    }

    if (patch.agents) {
      await this.fs.removeAgents(pluginPath);
      if (patch.agents.length > 0) {
        await this.fs.writeAgents(pluginPath, patch.agents);
      }
    }

    if (patch.hooks) {
      await this.fs.writeHooksConfig(pluginPath, patch.hooks);
    }

    if (patch.mcpServers) {
      await this.fs.writeMcpServers(pluginPath, patch.mcpServers);
    }

    // Update registry
    await this.registry.updatePlugin(id, {
      name: patch.name,
      version: patch.version,
      description: patch.description,
      tags: patch.tags,
    });

    // Return updated meta
    const updated = await this.registry.findPlugin(id);
    if (!updated) {
      throw new Error(`Failed to retrieve updated plugin "${id}"`);
    }

    return updated;
  }

  /**
   * Delete a plugin
   */
  async delete(id: string, _options?: { force?: boolean }): Promise<void> {
    const existing = await this.registry.findPlugin(id);
    if (!existing) {
      throw new Error(`Plugin with ID "${id}" not found`);
    }

    // Delete plugin directory
    await this.fs.deletePluginDir(id);

    // Remove from registry
    await this.registry.removePlugin(id);
  }

  /**
   * Import plugin from local path
   */
  async importFromPath(input: ImportFromPathInput): Promise<PluginMeta> {
    // Validate source path
    const srcPath = await this.importer.importFromPath(input.path, '');

    // Read plugin.json to get name
    const pluginJson = await this.fs.readPluginJson(srcPath);
    const name = input.name || pluginJson.name;
    const id = slugify(name);

    // Check if plugin already exists
    const existing = await this.registry.findPlugin(id);
    if (existing) {
      throw new Error(`Plugin with ID "${id}" already exists`);
    }

    // Copy plugin directory
    const pluginPath = await this.fs.copyPluginDir(srcPath, id);

    // Create plugin meta
    const now = new Date().toISOString();
    const meta: PluginMeta = {
      id,
      name,
      version: pluginJson.version,
      description: pluginJson.description,
      location: pluginPath,
      source: { type: 'local', path: input.path },
      tags: input.tags,
      createdAt: now,
      updatedAt: now,
    };

    // Add to registry
    await this.registry.addPlugin(meta);

    return meta;
  }

  /**
   * Import plugin from URL
   */
  async importFromUrl(input: ImportFromUrlInput): Promise<PluginMeta> {
    // Generate temporary ID
    const tempId = `temp-${Date.now()}`;

    try {
      // Download and extract
      const extractedPath = await this.importer.importFromUrl(input.url, tempId);

      // Read plugin.json
      const pluginJson = await this.fs.readPluginJson(extractedPath);
      const name = input.name || pluginJson.name;
      const id = slugify(name);

      // Check if plugin already exists
      const existing = await this.registry.findPlugin(id);
      if (existing) {
        throw new Error(`Plugin with ID "${id}" already exists`);
      }

      // Copy to final location
      const pluginPath = await this.fs.copyPluginDir(extractedPath, id);

      // Create plugin meta
      const now = new Date().toISOString();
      const meta: PluginMeta = {
        id,
        name,
        version: pluginJson.version,
        description: pluginJson.description,
        location: pluginPath,
        source: { type: 'url', url: input.url },
        tags: input.tags,
        createdAt: now,
        updatedAt: now,
      };

      // Add to registry
      await this.registry.addPlugin(meta);

      // Clean up temp directory
      await this.importer.cleanup();

      return meta;
    } catch (error) {
      // Clean up on error
      await this.importer.cleanup();
      throw error;
    }
  }
}
