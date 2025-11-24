import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { createPluginManager } from '../../packages/core/dist/index.js';

async function main() {
  const root = await mkdtemp(join(tmpdir(), 'viyv-skills-'));
  process.env.CLAUDE_PLUGIN_ROOT = root;
  const manager = await createPluginManager();

  console.log('Creating skill-only plugin...');
  const plugin = await manager.create({
    name: 'skills-only-demo',
    description: 'Plugin containing only skills',
    skills: [
      {
        id: 'process-pdfs',
        content: [
          '---',
          'name: process-pdfs',
          'description: extract text from PDF files; use when user mentions pdfs or documents',
          '---',
          '# PDF Processing',
          '',
          'Use pdfplumber to extract text:',
          '```python',
          'import pdfplumber',
          'with pdfplumber.open("file.pdf") as pdf:',
          '    text = pdf.pages[0].extract_text()',
          '```',
          '',
          'Keep responses concise.',
        ].join('\n'),
        files: [
          {
            path: 'REFERENCE.md',
            content: '# Reference\n\nPrefer pdfplumber; fall back to pypdf for simple tasks.',
          },
        ],
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
