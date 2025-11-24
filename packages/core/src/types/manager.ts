import type {
  PluginMeta,
  CreatePluginInput,
  UpdatePluginInput,
  ImportFromPathInput,
  ImportFromUrlInput,
  ListFilterOptions,
} from './plugin.js';

/**
 * Claude Plugin Manager interface
 */
export interface ClaudePluginManager {
  /**
   * List all plugins with optional filtering
   */
  list(filter?: ListFilterOptions): Promise<PluginMeta[]>;

  /**
   * Get a plugin by ID
   */
  get(id: string): Promise<PluginMeta | undefined>;

  /**
   * Create a new plugin
   */
  create(input: CreatePluginInput): Promise<PluginMeta>;

  /**
   * Update an existing plugin
   */
  update(id: string, patch: UpdatePluginInput): Promise<PluginMeta>;

  /**
   * Delete a plugin
   */
  delete(id: string, options?: { force?: boolean }): Promise<void>;

  /**
   * Import plugin from local path
   */
  importFromPath(input: ImportFromPathInput): Promise<PluginMeta>;

  /**
   * Import plugin from URL
   */
  importFromUrl(input: ImportFromUrlInput): Promise<PluginMeta>;
}
