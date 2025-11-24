import type { PluginMeta } from './plugin.js';

/**
 * Registry schema
 */
export type RegistrySchema = {
  version: string;
  plugins: PluginMeta[];
};

/**
 * Default registry version
 */
export const REGISTRY_VERSION = '1.0.0';

/**
 * Create empty registry
 */
export function createEmptyRegistry(): RegistrySchema {
  return {
    version: REGISTRY_VERSION,
    plugins: [],
  };
}
