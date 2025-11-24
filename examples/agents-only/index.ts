import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { createPluginManager } from '../../packages/core/dist/index.js';

async function main() {
  const root = await mkdtemp(join(tmpdir(), 'viyv-agents-'));
  process.env.CLAUDE_PLUGIN_ROOT = root;
  const manager = await createPluginManager();

  console.log('Creating agents-only plugin...');
  const plugin = await manager.create({
    name: 'agents-only-demo',
    description: 'Plugin containing only agents',
    agents: [
      {
        id: 'code-reviewer',
        content: [
          '# code-reviewer',
          '',
          'Focus on:',
          '- Bugs and edge cases',
          '- Tests coverage suggestions',
          '- Clear, concise summaries',
        ].join('\n'),
      },
    ],
  });

  console.log('Created:', plugin.id);
  console.log('Listing plugins:');
  console.log(await manager.list());

  console.log('Cleaning up...');
  await manager.delete(plugin.id);
  await rm(root, { recursive: true, force: true });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
