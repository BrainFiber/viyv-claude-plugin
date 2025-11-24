import { join } from 'path';
import fse from 'fs-extra';
const { ensureDir, remove, copy, readJson, writeJson, readFile, writeFile, readdir } = fse;
import type {
  PluginJson,
  SkillInput,
  CommandInput,
  AgentInput,
  HooksInput,
  McpServersInput,
} from '../types/index.js';

/**
 * Plugin File System
 * Handles plugin directory and file operations
 */
export class PluginFileSystem {
  private pluginsDir: string;

  constructor(private rootPath: string) {
    this.pluginsDir = join(rootPath, 'plugins');
  }

  /**
   * Create plugin directory structure
   */
  async createPluginDir(id: string): Promise<string> {
    const pluginPath = join(this.pluginsDir, id);
    const claudePluginDir = join(pluginPath, '.claude-plugin');
    const skillsDir = join(pluginPath, 'skills');
    const commandsDir = join(pluginPath, 'commands');
    const agentsDir = join(pluginPath, 'agents');
    const hooksDir = join(pluginPath, 'hooks');

    await ensureDir(claudePluginDir);
    await ensureDir(skillsDir);
    await ensureDir(commandsDir);
    await ensureDir(agentsDir);
    await ensureDir(hooksDir);

    return pluginPath;
  }

  /**
   * Delete plugin directory
   */
  async deletePluginDir(id: string): Promise<void> {
    const pluginPath = join(this.pluginsDir, id);
    await remove(pluginPath);
  }

  /**
   * Copy plugin directory from source
   */
  async copyPluginDir(srcPath: string, id: string): Promise<string> {
    const destPath = join(this.pluginsDir, id);
    await ensureDir(this.pluginsDir);
    await copy(srcPath, destPath, {
      overwrite: false,
      errorOnExist: true,
    });
    return destPath;
  }

  /**
   * Write plugin.json
   */
  async writePluginJson(pluginPath: string, data: PluginJson): Promise<void> {
    const jsonPath = join(pluginPath, '.claude-plugin', 'plugin.json');
    await ensureDir(join(pluginPath, '.claude-plugin'));
    await writeJson(jsonPath, data, { spaces: 2 });
  }

  /**
   * Read plugin.json
   */
  async readPluginJson(pluginPath: string): Promise<PluginJson> {
    const jsonPath = join(pluginPath, '.claude-plugin', 'plugin.json');
    try {
      return await readJson(jsonPath);
    } catch (error) {
      throw new Error(`Failed to read plugin.json from ${pluginPath}: ${error}`);
    }
  }

  /**
   * Write skill file
   */
  async writeSkill(pluginPath: string, skillId: string, content: string): Promise<void> {
    const skillDir = join(pluginPath, 'skills', skillId);
    const skillPath = join(skillDir, 'SKILL.md');

    await ensureDir(skillDir);
    await writeFile(skillPath, content, 'utf-8');
  }

  /**
   * Read skill file
   */
  async readSkill(pluginPath: string, skillId: string): Promise<string> {
    const skillPath = join(pluginPath, 'skills', skillId, 'SKILL.md');
    try {
      return await readFile(skillPath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read skill ${skillId}: ${error}`);
    }
  }

  /**
   * Delete skill
   */
  async deleteSkill(pluginPath: string, skillId: string): Promise<void> {
    const skillDir = join(pluginPath, 'skills', skillId);
    await remove(skillDir);
  }

  /**
   * List skills in plugin
   */
  async listSkills(pluginPath: string): Promise<string[]> {
    const skillsDir = join(pluginPath, 'skills');
    try {
      const entries = await readdir(skillsDir, { withFileTypes: true });
      return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
    } catch (error) {
      // If skills directory doesn't exist, return empty array
      return [];
    }
  }

  /**
   * Write multiple skills
   */
  async writeSkills(pluginPath: string, skills: SkillInput[]): Promise<void> {
    for (const skill of skills) {
      await this.writeSkill(pluginPath, skill.id, skill.content);
      if (skill.files && skill.files.length > 0) {
        for (const file of skill.files) {
          const target = join(pluginPath, 'skills', skill.id, file.path);
          const dir = join(target, '..');
          await ensureDir(dir);
          await writeFile(target, file.content, 'utf-8');
        }
      }
    }
  }

  /**
   * Write command markdown files
   */
  async writeCommands(pluginPath: string, commands: CommandInput[]): Promise<void> {
    const commandsDir = join(pluginPath, 'commands');
    await ensureDir(commandsDir);
    for (const cmd of commands) {
      const filePath = join(commandsDir, `${cmd.id}.md`);
      await writeFile(filePath, cmd.content, 'utf-8');
    }
  }

  /**
   * Write agents markdown files
   */
  async writeAgents(pluginPath: string, agents: AgentInput[]): Promise<void> {
    const agentsDir = join(pluginPath, 'agents');
    await ensureDir(agentsDir);
    for (const agent of agents) {
      const filePath = join(agentsDir, `${agent.id}.md`);
      await writeFile(filePath, agent.content, 'utf-8');
    }
  }

  /**
   * Write hooks configuration
   */
  async writeHooksConfig(pluginPath: string, hooks: HooksInput): Promise<void> {
    const hooksDir = join(pluginPath, 'hooks');
    await ensureDir(hooksDir);
    const hooksPath = join(hooksDir, 'hooks.json');
    await writeJson(hooksPath, hooks, { spaces: 2 });
  }

  /**
   * Write MCP server configuration
   */
  async writeMcpServers(pluginPath: string, mcp: McpServersInput): Promise<void> {
    const mcpPath = join(pluginPath, '.mcp.json');
    await writeJson(mcpPath, mcp, { spaces: 2 });
  }

  async removeCommands(pluginPath: string): Promise<void> {
    await remove(join(pluginPath, 'commands'));
  }

  async removeAgents(pluginPath: string): Promise<void> {
    await remove(join(pluginPath, 'agents'));
  }

  async removeHooks(pluginPath: string): Promise<void> {
    await remove(join(pluginPath, 'hooks'));
  }

  async removeMcp(pluginPath: string): Promise<void> {
    await remove(join(pluginPath, '.mcp.json'));
  }

  /**
   * Get plugin path by ID
   */
  getPluginPath(id: string): string {
    return join(this.pluginsDir, id);
  }
}
