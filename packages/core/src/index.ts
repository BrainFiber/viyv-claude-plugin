// Types
export type {
  PluginSource,
  PluginMeta,
  PluginJson,
  SkillInput,
  CreatePluginInput,
  UpdatePluginInput,
  ImportFromPathInput,
  ImportFromUrlInput,
  ListFilterOptions,
  RegistrySchema,
  SdkPluginRef,
  ClaudePluginManager,
} from './types/index.js';

export { REGISTRY_VERSION, createEmptyRegistry } from './types/index.js';

// Main Manager
export { ClaudePluginManagerImpl } from './manager/ClaudePluginManagerImpl.js';

// Adapter
export { createAgentSdkPluginAdapter } from './adapter/AgentSdkPluginAdapter.js';
export type { AgentSdkPluginAdapter } from './adapter/AgentSdkPluginAdapter.js';

// Config
export { resolvePluginRoot, getConfigFilePath, getDefaultPluginRoot } from './config/resolver.js';
export type { ConfigSchema } from './config/resolver.js';

// Factory function
import type { ClaudePluginManager as IClaudePluginManager } from './types/index.js';
import { ClaudePluginManagerImpl } from './manager/ClaudePluginManagerImpl.js';
import { resolvePluginRoot as _resolvePluginRoot } from './config/resolver.js';

export async function createPluginManager(): Promise<IClaudePluginManager> {
  const rootPath = await _resolvePluginRoot();
  return new ClaudePluginManagerImpl(rootPath);
}
