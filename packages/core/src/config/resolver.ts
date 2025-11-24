import { homedir } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';
import fse from 'fs-extra';
const { readJson } = fse;

/**
 * Config file schema
 */
export type ConfigSchema = {
  pluginRoot?: string;
};

function getHomeDir(): string {
  return (
    process.env.CLAUDE_HOME ||
    process.env.HOME ||
    process.env.USERPROFILE ||
    homedir()
  );
}

function getConfigPath(): string {
  return join(getHomeDir(), '.viyv-claude', 'config.json');
}

function getDefaultRoot(): string {
  // Root is ~/.viyv-claude; PluginFileSystem will append "plugins"
  return join(getHomeDir(), '.viyv-claude');
}

/**
 * Resolve plugin root directory
 * Priority:
 * 1. Environment variable CLAUDE_PLUGIN_ROOT
 * 2. config.json pluginRoot
 * 3. Default ~/.viyv-claude/plugins
 */
export async function resolvePluginRoot(): Promise<string> {
  // 1. Check environment variable
  if (process.env.CLAUDE_PLUGIN_ROOT) {
    return process.env.CLAUDE_PLUGIN_ROOT;
  }

  // 2. Check config.json
  try {
    const configPath = getConfigPath();
    if (existsSync(configPath)) {
      const config = await readJson(configPath);
      if (config.pluginRoot) {
        return config.pluginRoot;
      }
    }
  } catch (error) {
    // If config.json is invalid, fall through to default
  }

  // 3. Return default
  return getDefaultRoot();
}

/**
 * Get config file path
 */
export function getConfigFilePath(): string {
  return getConfigPath();
}

/**
 * Get default plugin root
 */
export function getDefaultPluginRoot(): string {
  return getDefaultRoot();
}
