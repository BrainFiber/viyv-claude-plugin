import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { createPluginManager } from '../../packages/core/dist/index.js';

async function main() {
  const root = await mkdtemp(join(tmpdir(), 'viyv-forms-'));
  process.env.CLAUDE_PLUGIN_ROOT = root;
  const manager = await createPluginManager();

  console.log('Creating forms-automation plugin...');
  const plugin = await manager.create({
    name: 'forms-automation',
    description: 'Skill bundle for form analysis, validation, and fill automation',
    skills: [
      {
        id: 'forms-automation',
        content: [
          '---',
          'name: forms-automation',
          'description: Automates analyzing, validating, and filling structured forms; use when user mentions forms, PDFs, or field mappings.',
          '---',
          '# Forms Automation',
          '',
          '## Quick start',
          '- Run `python scripts/analyze_form.py input.pdf > fields.json` to extract fields.',
          '- Edit `fields.json` with values.',
          '- Validate: `python scripts/validate.py fields.json`.',
          '- Fill: `python scripts/fill_form.py input.pdf fields.json output.pdf`.',
          '',
          '## References',
          '- Form guide: [FORMS.md](FORMS.md)',
          '- API/CLI reference: [reference.md](reference.md)',
          '- Usage examples: [examples.md](examples.md)',
          '',
          '## Execution guidance',
          '- Execute scripts (do not paste contents): prefer running them for deterministic results.',
          '- Keep responses concise; avoid re-stating the entire guide.',
        ].join('\n'),
        files: [
          { path: 'FORMS.md', content: ['# Form-filling guide', '', '1. Analyze form → fields.json', '2. Map values → fields.json', '3. Validate → validate.py', '4. Fill → fill_form.py', '5. Verify output visually or via diff'].join('\n') },
          {
            path: 'reference.md',
            content: [
              '# Reference',
              '',
              '## Scripts',
              '- `scripts/analyze_form.py input.pdf > fields.json`',
              '- `scripts/validate.py fields.json`',
              '- `scripts/fill_form.py input.pdf fields.json output.pdf`',
              '',
              '## Field schema',
              '- Each entry: `{ "field": {"type": "text|checkbox|signature", "page": n, "x": px, "y": px} }`',
              '',
              '## Dependencies',
              '- Python 3.10+',
              '- pip install: pdfplumber, pypdf2 (optional fallback)',
            ].join('\n'),
          },
          {
            path: 'examples.md',
            content: [
              '# Examples',
              '',
              '## Example 1: Simple text fill',
              '- Input: form.pdf with fields `name`, `date`',
              '- Steps:',
              '  1) analyze_form.py form.pdf > fields.json',
              '  2) edit fields.json with values',
              '  3) validate.py fields.json',
              '  4) fill_form.py form.pdf fields.json output.pdf',
              '- Expected: output.pdf populated; validation passes.',
              '',
              '## Example 2: Signature + checkbox',
              '- Add signature bounding box and a boolean checkbox.',
              '- validate.py reports missing required fields if not present.',
            ].join('\n'),
          },
          {
            path: 'scripts/analyze_form.py',
            content: [
              '#!/usr/bin/env python3',
              '"""Analyze form and emit stub field mapping."""',
              'import json, sys',
              'if len(sys.argv) < 2:',
              '    print("usage: analyze_form.py INPUT_PDF > fields.json", file=sys.stderr)',
              '    sys.exit(1)',
              'fields = {',
              '    "name": {"type": "text", "page": 1, "x": 100, "y": 200},',
              '    "date": {"type": "text", "page": 1, "x": 300, "y": 200},',
              '}',
              'json.dump(fields, sys.stdout, indent=2)',
            ].join('\n'),
          },
          {
            path: 'scripts/validate.py',
            content: [
              '#!/usr/bin/env python3',
              '"""Validate fields.json for required keys and types."""',
              'import json, sys',
              'if len(sys.argv) < 2:',
              '    print("usage: validate.py fields.json", file=sys.stderr)',
              '    sys.exit(1)',
              'data = json.load(open(sys.argv[1]))',
              'missing = []',
              'for key, val in data.items():',
              '    if "type" not in val or "page" not in val:',
              '        missing.append(key)',
              'if missing:',
              '    print(f"Invalid entries: {missing}", file=sys.stderr)',
              '    sys.exit(2)',
              'print("OK")',
            ].join('\n'),
          },
          {
            path: 'scripts/fill_form.py',
            content: [
              '#!/usr/bin/env python3',
              '"""Dummy filler to show flow; real implementation would draw text/checkbox."""',
              'import json, sys',
              'if len(sys.argv) < 4:',
              '    print("usage: fill_form.py input.pdf fields.json output.pdf", file=sys.stderr)',
              '    sys.exit(1)',
              '_, input_pdf, fields_json, output_pdf = sys.argv',
              'fields = json.load(open(fields_json))',
              'print(f"Would fill {len(fields)} fields from {input_pdf} into {output_pdf}")',
            ].join('\n'),
          },
        ],
      },
    ],
  });

  console.log('Created:', plugin.id);
  console.log('Skill path:', join(plugin.location, 'skills', 'forms-automation'));
  console.log('Listing plugins:');
  console.log(await manager.list());

  // clean up
  await manager.delete(plugin.id);
  await rm(root, { recursive: true, force: true });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
