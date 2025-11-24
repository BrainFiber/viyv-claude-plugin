/**
 * Plugin source types
 */
export type PluginSource =
  | { type: 'local'; path: string }
  | { type: 'url'; url: string }
  | { type: 'generated'; templateId?: string };

/**
 * Plugin metadata
 */
export type PluginMeta = {
  id: string;
  name: string;
  version: string;
  description?: string;
  location: string;
  source: PluginSource;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};

/**
 * Plugin JSON structure (Claude Code spec)
 */
export type PluginJson = {
  name: string;
  description?: string;
  version: string;
  author?: {
    name: string;
    email?: string;
    url?: string;
  };
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
  commands?: string | string[];
  agents?: string | string[];
  skills?: string;
  hooks?: string | Record<string, unknown>;
  mcpServers?: string | Record<string, unknown>;
};

/**
 * Skill input for creating/updating plugins
 */
export type SkillInput = {
  id: string;
  content: string;
  files?: SkillFileInput[];
};

export type SkillFileInput = {
  path: string; // relative path under skills/<id>, max one subdirectory
  content: string;
};

export type CommandInput = {
  id: string;
  content: string;
};

export type AgentInput = {
  id: string;
  content: string;
};

export type HooksInput = Record<string, unknown>;
export type McpServersInput = Record<string, unknown>;

/**
 * Create plugin input
 */
export type CreatePluginInput = {
  name: string;
  version?: string;
  description?: string;
  author?: {
    name: string;
    email?: string;
    url?: string;
  };
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
  skills?: SkillInput[];
  commands?: CommandInput[];
  agents?: AgentInput[];
  hooks?: HooksInput;
  mcpServers?: McpServersInput;
  tags?: string[];
};

/**
 * Update plugin input
 */
export type UpdatePluginInput = {
  name?: string;
  version?: string;
  description?: string;
  skills?: SkillInput[];
  commands?: CommandInput[];
  agents?: AgentInput[];
  hooks?: HooksInput;
  mcpServers?: McpServersInput;
  tags?: string[];
};

/**
 * Import from path input
 */
export type ImportFromPathInput = {
  path: string;
  name?: string;
  tags?: string[];
};

/**
 * Import from URL input
 */
export type ImportFromUrlInput = {
  url: string;
  name?: string;
  tags?: string[];
};

/**
 * List filter options
 */
export type ListFilterOptions = {
  tags?: string[];
};
