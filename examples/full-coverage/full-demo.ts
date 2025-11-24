import { tmpdir } from 'os';
import { join } from 'path';
import { mkdtemp, writeFile, mkdir, rm } from 'fs/promises';
import AdmZip from 'adm-zip';
import {
  createPluginManager,
  createAgentSdkPluginAdapter,
} from 'viyv-claude-plugin-core';

async function makeTempRoot(label: string) {
  return mkdtemp(join(tmpdir(), `viyv-demo-${label}-`));
}

async function main() {
  // isolate all artifacts under a temp root
  const root = await makeTempRoot('root');
  process.env.CLAUDE_PLUGIN_ROOT = root;
  console.log(`👉 Using plugin root: ${root}`);

  const manager = await createPluginManager();

  // 1) Create a plugin with all components
  console.log('\n[create] full-feature plugin');
  const created = await manager.create({
    name: 'full-demo',
    description: 'Demo plugin with commands/agents/hooks/mcp/skills',
    version: '1.0.0',
    commands: [{ id: 'hello', content: '# Hello\nRespond with a friendly greeting.' }],
    agents: [{ id: 'reviewer', content: '# Reviewer\nHandle reviews.' }],
    skills: [
      {
        id: 'add',
        content: ['---', 'name: add', 'description: add two numbers', '---', '# Add', '', 'Add two numbers.'].join('\n'),
      },
    ],
    hooks: { hooks: { SessionStart: [{ hooks: [{ type: 'notification', message: 'Session started' }] }] } },
    mcpServers: {
      demo: {
        command: 'echo',
        args: ['demo'],
      },
    },
    tags: ['demo', 'full'],
  });
  console.log('created:', created);

  // 2) List and get
  console.log('\n[list]');
  console.log(await manager.list());

  console.log('\n[get] full-demo');
  console.log(await manager.get('full-demo'));

  // 3) Update: replace commands/agents/hooks/mcp/skills
  console.log('\n[update] full-demo');
  await manager.update('full-demo', {
    version: '1.1.0',
    commands: [{ id: 'bye', content: '# Bye\nSay goodbye politely.' }],
    agents: [{ id: 'assistant', content: '# Assistant\nHelp with tasks.' }],
    skills: [
      {
        id: 'subtract',
        content: ['---', 'name: subtract', 'description: subtract numbers', '---', '# Subtract', '', 'Subtract numbers.'].join('\n'),
      },
    ],
    hooks: { hooks: { PostToolUse: [] } },
    mcpServers: { another: { command: 'echo', args: ['updated'] } },
  });
  console.log(await manager.get('full-demo'));

  // 4) Import from local path (builds a minimal plugin on the fly)
  console.log('\n[import] from local path');
  const localSrc = await makeTempRoot('plugin-src');
  await mkdir(join(localSrc, '.claude-plugin'), { recursive: true });
  await mkdir(join(localSrc, 'skills', 'echo'), { recursive: true });
  await writeFile(join(localSrc, '.claude-plugin', 'plugin.json'), JSON.stringify({
    name: 'imported-plugin',
    version: '0.1.0',
    description: 'import demo',
  }, null, 2));
  await writeFile(
    join(localSrc, 'skills', 'echo', 'SKILL.md'),
    ['---', 'name: echo', 'description: repeat input', '---', '# Echo', '', 'Repeat input.'].join('\n')
  );
  const imported = await manager.importFromPath({ path: localSrc, tags: ['imported'] });
  console.log('imported:', imported);

  // 5) Adapter for Agent SDK
  console.log('\n[adapter] SDK plugin refs');
  const adapter = createAgentSdkPluginAdapter(manager);
  console.log(await adapter.getSdkPlugins(['full-demo', imported.id]));

  // 6) Import from URL (zip generated on-the-fly)
  console.log('\n[import] from URL');
  const zipTemp = await makeTempRoot('zip');
  const zipPath = join(zipTemp, 'demo.zip');
  const zip = new AdmZip();
  zip.addFile('.claude-plugin/plugin.json', Buffer.from(JSON.stringify({ name: 'url-plugin', version: '0.0.1' }, null, 2)));
  zip.addFile(
    'skills/url-skill/SKILL.md',
    Buffer.from(['---', 'name: url-skill', 'description: say hi', '---', '# URL Skill', '', 'Say hi.'].join('\n'))
  );
  zip.writeZip(zipPath);
  const fileUrl = `file://${zipPath}`;
  const importedUrl = await manager.importFromUrl({ url: fileUrl });
  console.log('imported from url:', importedUrl);

  // 7) Delete
  console.log('\n[delete] full-demo');
  await manager.delete('full-demo');
  console.log(await manager.list());

  // cleanup temp roots
  await rm(root, { recursive: true, force: true });
  await rm(localSrc, { recursive: true, force: true });
  await rm(zipTemp, { recursive: true, force: true });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
