import type { ClaudePluginManager } from '../types/manager.js';
import type { SdkPluginRef } from '../types/sdk.js';

/**
 * Agent SDK Plugin Adapter interface
 */
export interface AgentSdkPluginAdapter {
  getSdkPlugins(pluginIds: string[]): Promise<SdkPluginRef[]>;
}

/**
 * Create Agent SDK Plugin Adapter
 */
export function createAgentSdkPluginAdapter(
  manager: ClaudePluginManager
): AgentSdkPluginAdapter {
  return {
    async getSdkPlugins(pluginIds: string[]): Promise<SdkPluginRef[]> {
      const results: SdkPluginRef[] = [];
      const notFound: string[] = [];

      for (const pluginId of pluginIds) {
        const meta = await manager.get(pluginId);

        if (!meta) {
          notFound.push(pluginId);
          continue;
        }

        results.push({
          type: 'local',
          path: meta.location,
        });
      }

      if (notFound.length > 0) {
        throw new Error(`Plugins not found: ${notFound.join(', ')}`);
      }

      return results;
    },
  };
}
