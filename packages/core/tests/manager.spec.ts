import { tmpdir } from 'os';
import { join } from 'path';
import { mkdtemp, rm, readFile } from 'fs/promises';
import fse from 'fs-extra';
import AdmZip from 'adm-zip';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  createPluginManager,
  createAgentSdkPluginAdapter,
  resolvePluginRoot,
} from '../src/index.js';

const { pathExists, readJson, ensureDir, writeJson, writeFile } = fse;

async function createTempRoot(): Promise<string> {
  return mkdtemp(join(tmpdir(), 'viyv-claude-test-'));
}

describe('ClaudePluginManager', () => {
  let root: string;

  beforeEach(async () => {
    root = await createTempRoot();
    process.env.CLAUDE_PLUGIN_ROOT = root;
  });

  afterEach(async () => {
    delete process.env.CLAUDE_PLUGIN_ROOT;
    // fs.rm supports recursive removal in Node 18+
    await rm(root, { recursive: true, force: true });
  });

  it('creates, lists, and retrieves a plugin with skills', async () => {
    const manager = await createPluginManager();

    const created = await manager.create({
      name: 'Sample Plugin',
      description: 'demo desc',
      tags: ['demo', 'test'],
      skills: [
        {
          id: 'hello',
          content: ['---', 'name: hello', 'description: say hello', '---', '# Hello', '', 'Say hello.'].join('\n'),
        },
      ],
    });

    expect(created.id).toBe('sample-plugin');
    expect(created.tags).toEqual(['demo', 'test']);
    expect(created.location).toContain('/plugins/sample-plugin');

    const listed = await manager.list();
    expect(listed).toHaveLength(1);
    expect(listed[0].id).toBe(created.id);

    const pluginJson = await readJson(
      join(created.location, '.claude-plugin', 'plugin.json')
    );
    expect(pluginJson.name).toBe('Sample Plugin');
    expect(pluginJson.description).toBe('demo desc');

    const skillContent = await readFile(
      join(created.location, 'skills', 'hello', 'SKILL.md'),
      'utf-8'
    );
    expect(skillContent).toContain('# Hello');
  });

  it('creates plugin with commands/agents/hooks/mcp', async () => {
    const manager = await createPluginManager();
    const created = await manager.create({
      name: 'Full Plugin',
      commands: [{ id: 'hello', content: '# Hello cmd' }],
      agents: [{ id: 'agent', content: '# Agent' }],
      hooks: { hooks: { PostToolUse: [] } },
      mcpServers: { demo: { command: 'echo' } },
    });

    const pluginJson = await fse.readJson(
      join(created.location, '.claude-plugin', 'plugin.json')
    );
    expect(pluginJson.commands).toBe('./commands');
    expect(pluginJson.hooks).toBe('./hooks/hooks.json');
    expect(pluginJson.mcpServers).toBe('./.mcp.json');

    expect(await fse.pathExists(join(created.location, 'commands', 'hello.md'))).toBe(true);
    expect(await fse.pathExists(join(created.location, 'agents', 'agent.md'))).toBe(true);
    expect(await fse.pathExists(join(created.location, 'hooks', 'hooks.json'))).toBe(true);
    expect(await fse.pathExists(join(created.location, '.mcp.json'))).toBe(true);
  });

  it('updates plugin metadata and skills', async () => {
    const manager = await createPluginManager();
    const created = await manager.create({
      name: 'Updatable',
      description: 'v1',
      version: '1.0.0',
      skills: [
        {
          id: 'a',
          content: ['---', 'name: a', 'description: first', '---', 'first'].join('\n'),
        },
      ],
    });

    const updated = await manager.update(created.id, {
      description: 'v2',
      version: '1.1.0',
      tags: ['updated'],
      skills: [
        {
          id: 'b',
          content: ['---', 'name: b', 'description: second', '---', 'second'].join('\n'),
        },
      ],
    });

    expect(updated.description).toBe('v2');
    expect(updated.version).toBe('1.1.0');
    expect(updated.tags).toEqual(['updated']);

    const pluginJson = await readJson(
      join(updated.location, '.claude-plugin', 'plugin.json')
    );
    expect(pluginJson.version).toBe('1.1.0');
    expect(pluginJson.description).toBe('v2');

    // old skill removed, new skill present
    expect(await pathExists(join(updated.location, 'skills', 'a'))).toBe(false);
    expect(await pathExists(join(updated.location, 'skills', 'b', 'SKILL.md'))).toBe(true);
  });

  it('deletes plugin and registry entry', async () => {
    const manager = await createPluginManager();
    const created = await manager.create({ name: 'Removable' });

    await manager.delete(created.id);

    expect(await manager.list()).toHaveLength(0);
    expect(await pathExists(created.location)).toBe(false);
  });

  it('throws when deleting or importing duplicates', async () => {
    const manager = await createPluginManager();
    await manager.create({ name: 'Unique' });
    await expect(manager.delete('missing-one')).rejects.toThrow(/not found/);

    // duplicate on importFromPath
    const sourceRoot = await createTempRoot();
    const pluginDir = join(sourceRoot, 'dup-plugin');
    await fse.ensureDir(join(pluginDir, '.claude-plugin'));
    await fse.writeJson(join(pluginDir, '.claude-plugin', 'plugin.json'), {
      name: 'Unique',
      version: '1.0.0',
    });
    await expect(manager.importFromPath({ path: pluginDir })).rejects.toThrow(/already exists/);
  });

  it('errors when updating missing plugin', async () => {
    const manager = await createPluginManager();
    await expect(manager.update('nope', { description: 'x' })).rejects.toThrow(/not found/);
  });

  it('replaces commands/agents/hooks/mcp on update', async () => {
    const manager = await createPluginManager();
    const created = await manager.create({
      name: 'Rewriter',
      commands: [{ id: 'c1', content: '# c1' }],
      agents: [{ id: 'a1', content: '# a1' }],
      hooks: { hooks: { PostToolUse: [] } },
      mcpServers: { demo: { command: 'echo' } },
    });

    await manager.update(created.id, {
      commands: [{ id: 'c2', content: '# c2' }],
      agents: [{ id: 'a2', content: '# a2' }],
      hooks: { hooks: { SessionStart: [] } },
      mcpServers: { other: { command: 'cat' } },
    });

    expect(await fse.pathExists(join(created.location, 'commands', 'c1.md'))).toBe(false);
    expect(await fse.pathExists(join(created.location, 'commands', 'c2.md'))).toBe(true);
    expect(await fse.pathExists(join(created.location, 'agents', 'a2.md'))).toBe(true);

    const hooks = await fse.readJson(join(created.location, 'hooks', 'hooks.json'));
    expect(hooks.hooks.SessionStart).toBeDefined();

    const mcp = await fse.readJson(join(created.location, '.mcp.json'));
    expect(mcp.other).toBeDefined();
  });

  it('adds commands/agents and updates plugin.json on update', async () => {
    const manager = await createPluginManager();
    const created = await manager.create({ name: 'MetaUpdate' });

    const beforeJson = await fse.readJson(
      join(created.location, '.claude-plugin', 'plugin.json')
    );
    expect(beforeJson.commands).toBeUndefined();
    expect(beforeJson.agents).toBeUndefined();

    await manager.update(created.id, {
      commands: [{ id: 'c-new', content: '# new command' }],
      agents: [{ id: 'a-new', content: '# new agent' }],
    });

    const afterJson = await fse.readJson(
      join(created.location, '.claude-plugin', 'plugin.json')
    );
    expect(afterJson.commands).toBe('./commands');
    expect(afterJson.agents).toBe('./agents');
    expect(await pathExists(join(created.location, 'commands', 'c-new.md'))).toBe(true);
    expect(await pathExists(join(created.location, 'agents', 'a-new.md'))).toBe(true);
  });

  it('removes commands/agents when updated with empty lists', async () => {
    const manager = await createPluginManager();
    const created = await manager.create({
      name: 'RemoveFeatures',
      commands: [{ id: 'c1', content: '# c1' }],
      agents: [{ id: 'a1', content: '# a1' }],
    });

    await manager.update(created.id, { commands: [], agents: [] });

    expect(await pathExists(join(created.location, 'commands'))).toBe(false);
    expect(await pathExists(join(created.location, 'agents'))).toBe(false);

    const json = await fse.readJson(join(created.location, '.claude-plugin', 'plugin.json'));
    expect(json.commands).toBeUndefined();
    expect(json.agents).toBeUndefined();
  });

  it('validates skill id and frontmatter', async () => {
    const manager = await createPluginManager();
    await expect(
      manager.create({
        name: 'InvalidSkill',
        skills: [{ id: 'BadCaps', content: '# no frontmatter' }],
      })
    ).rejects.toThrow(/lowercase/);

    await expect(
      manager.create({
        name: 'Reserved',
        skills: [
          {
            id: 'anthropic-skill',
            content: [
              '---',
              'name: anthropic-helper',
              'description: do things',
              '---',
              '# body',
            ].join('\n'),
          },
        ],
      })
    ).rejects.toThrow(/reserved/);
  });

  it('rejects oversized or long-line skills', async () => {
    const manager = await createPluginManager();
    const longDesc = 'x'.repeat(1025);
    await expect(
      manager.create({
        name: 'LongDesc',
        skills: [
          {
            id: 'long-desc',
            content: ['---', 'name: long-desc', `description: ${longDesc}`, '---', '# body'].join(
              '\n'
            ),
          },
        ],
      })
    ).rejects.toThrow(/description/);

    const lines = Array.from({ length: 501 }, () => 'line').join('\n');
    await expect(
      manager.create({
        name: 'TooManyLines',
        skills: [
          {
            id: 'too-many',
            content: ['---', 'name: too-many', 'description: ok', '---', lines].join('\n'),
          },
        ],
      })
    ).rejects.toThrow(/500 lines/);
  });

  it('writes additional skill files and replaces them on update', async () => {
    const manager = await createPluginManager();
    const baseSkill = {
      id: 'pdf-processing',
      content: ['---', 'name: pdf-processing', 'description: handles pdfs', '---', '# body'].join(
        '\n'
      ),
      files: [
        { path: 'FORMS.md', content: '# forms' },
        { path: 'reference/guide.md', content: '# guide' },
      ],
    };

    const created = await manager.create({
      name: 'SkillFiles',
      skills: [baseSkill],
    });

    expect(await pathExists(join(created.location, 'skills', 'pdf-processing', 'FORMS.md'))).toBe(
      true
    );
    expect(
      await pathExists(join(created.location, 'skills', 'pdf-processing', 'reference', 'guide.md'))
    ).toBe(true);

    await manager.update(created.id, {
      skills: [
        {
          id: 'pdf-processing',
          content: [
            '---',
            'name: pdf-processing',
            'description: new desc',
            '---',
            '# updated',
          ].join('\n'),
          files: [{ path: 'REFERENCE.md', content: '# new ref' }],
        },
      ],
    });

    expect(
      await pathExists(join(created.location, 'skills', 'pdf-processing', 'reference', 'guide.md'))
    ).toBe(false);
    expect(await pathExists(join(created.location, 'skills', 'pdf-processing', 'REFERENCE.md'))).toBe(
      true
    );
  });

  it('imports from URL and handles duplicate IDs', async () => {
    const manager = await createPluginManager();
    const zip = new AdmZip();
    zip.addFile('.claude-plugin/', Buffer.alloc(0));
    zip.addFile('.claude-plugin/plugin.json', Buffer.from('{"name":"UrlOne","version":"0.1.0"}'));
    zip.addFile('skills/s1/SKILL.md', Buffer.from('# skill'));
    const buffer = zip.toBuffer();
    const originalFetch = global.fetch;
    global.fetch = vi.fn(async () => new Response(buffer));

    const imported = await manager.importFromUrl({ url: 'http://example.com/p.zip' });
    expect(imported.id).toBe('urlone');
    expect(await pathExists(imported.location)).toBe(true);

    // duplicate import should throw and cleanup temp
    await expect(manager.importFromUrl({ url: 'http://example.com/p.zip' })).rejects.toThrow(
      /already exists/
    );
    global.fetch = originalFetch;
  });

  it('imports plugin from path and preserves metadata', async () => {
    const sourceRoot = await createTempRoot();
    // build a minimal plugin structure
    const pluginDir = join(sourceRoot, 'any-plugin');
    await ensureDir(join(pluginDir, '.claude-plugin'));
    await ensureDir(join(pluginDir, 'skills', 's1'));
    await writeJson(join(pluginDir, '.claude-plugin', 'plugin.json'), {
      name: 'External Plugin',
      description: 'from disk',
      version: '0.2.0',
    });
    await writeFile(join(pluginDir, 'skills', 's1', 'SKILL.md'), '# Skill');

    process.env.CLAUDE_PLUGIN_ROOT = root; // ensure target root
    const manager = await createPluginManager();
    const imported = await manager.importFromPath({ path: pluginDir, tags: ['imported'] });

    expect(imported.id).toBe('external-plugin');
    expect(imported.tags).toEqual(['imported']);
    expect(imported.source).toEqual({ type: 'local', path: pluginDir });
    expect(imported.location).not.toBe(pluginDir); // copied to managed location

    const copiedJson = await readJson(
      join(imported.location, '.claude-plugin', 'plugin.json')
    );
    expect(copiedJson.name).toBe('External Plugin');
    expect(await pathExists(join(imported.location, 'skills', 's1', 'SKILL.md'))).toBe(true);
  });

  it('filters by tags and prevents duplicates', async () => {
    const manager = await createPluginManager();
    await manager.create({ name: 'One', tags: ['a'] });
    await manager.create({ name: 'Two', tags: ['b'] });
    await manager.create({ name: 'NoTags' });
    const filtered = await manager.list({ tags: ['b'] });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('two');

    await expect(manager.create({ name: 'Two' })).rejects.toThrow(/already exists/);
  });

  it('removes skills when updated with empty array', async () => {
    const manager = await createPluginManager();
    const created = await manager.create({
      name: 'SkillRemover',
      skills: [
        {
          id: 'to-remove',
          content: ['---', 'name: to-remove', 'description: remove me', '---', '# body'].join('\n'),
        },
      ],
    });

    await manager.update(created.id, { description: 'updated', skills: [] });

    expect(await pathExists(join(created.location, 'skills', 'to-remove'))).toBe(false);
    const json = await fse.readJson(join(created.location, '.claude-plugin', 'plugin.json'));
    expect(json.skills).toBeUndefined();
    expect(json.description).toBe('updated');
  });

  it('adapts plugin IDs to Agent SDK refs and rejects unknown IDs', async () => {
    const manager = await createPluginManager();
    await manager.create({ name: 'Adapter Demo' });

    const adapter = createAgentSdkPluginAdapter(manager);
    const refs = await adapter.getSdkPlugins(['adapter-demo']);
    expect(refs).toEqual([
      { type: 'local', path: join(root, 'plugins', 'adapter-demo') },
    ]);

    await expect(adapter.getSdkPlugins(['missing-one'])).rejects.toThrow(/not found/i);
  });

  it('fails when registry cannot return updated plugin', async () => {
    const manager = await createPluginManager();
    const created = await manager.create({ name: 'Unstable Registry' });

    const registry = (manager as any).registry;
    const originalFind = registry.findPlugin.bind(registry);
    const findSpy = vi.spyOn(registry, 'findPlugin');
    findSpy.mockImplementationOnce(originalFind); // initial lookup succeeds
    findSpy.mockImplementationOnce(async () => undefined); // post-update lookup fails

    await expect(
      manager.update(created.id, { description: 'new desc' })
    ).rejects.toThrow(/Failed to retrieve updated plugin/);

    findSpy.mockRestore();
  });
});

describe('resolvePluginRoot', () => {
  it('returns env-specified root when set', async () => {
    const customRoot = join(tmpdir(), 'viyv-custom-root');
    process.env.CLAUDE_PLUGIN_ROOT = customRoot;
    expect(await resolvePluginRoot()).toBe(customRoot);
    delete process.env.CLAUDE_PLUGIN_ROOT;
  });
});
