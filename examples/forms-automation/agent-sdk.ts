/**
 * Agent SDK 連携サンプル（forms-automation プラグイン）
 *
 * 期待動作:
 *  - 一時ディレクトリにプラグインを生成
 *  - Agent SDK へ plugin refs を渡して query を実行
 *  - 認証情報 (Anthropic API / Claude Code) が環境にある場合、assistant か result が返る
 *
 * 実行方法:
 *   cd examples/forms-automation
 *   pnpm install  # 未実行なら
 *   pnpm sdk      # もしくは npx tsx agent-sdk.ts
 */
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { createPluginManager, createAgentSdkPluginAdapter } from '../../packages/core/dist/index.js';
import { query } from '@anthropic-ai/claude-agent-sdk';

async function main() {
  const tempRoot = await mkdtemp(join(tmpdir(), 'viyv-forms-sdk-'));

  // Claude Code が ~/.claude に書こうとして失敗しないよう、一時ディレクトリを使う
  process.env.CLAUDE_PLUGIN_ROOT = tempRoot;
  process.env.CLAUDE_HOME = tempRoot;
  process.env.HOME = process.env.HOME || tempRoot; // 念のため

  const manager = await createPluginManager();

  // forms-automation プラグインを作成（同梱サンプルと同じ内容）
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
          {
            path: 'FORMS.md',
            content: ['# Form-filling guide', '', '1. Analyze form → fields.json', '2. Map values → fields.json', '3. Validate → validate.py', '4. Fill → fill_form.py', '5. Verify output visually or via diff'].join(
              '\n'
            ),
          },
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

  const adapter = createAgentSdkPluginAdapter(manager);
  const pluginRefs = await adapter.getSdkPlugins([plugin.id]);
  console.log('Agent SDK plugin refs:', pluginRefs);

  const q = query({
    prompt: 'Fill the form with name=Alice, date=2025-01-01 using the plugin.',
    options: {
      plugins: pluginRefs,
      allowedTools: ['Skill'],
      settingSources: [], // ファイル設定を読まない
      stderr: (data: string) => {
        process.stderr.write(`SDK stderr: ${data}\n`);
      },
    },
  });

  try {
    for await (const msg of q) {
      console.log('\n--- SDK message:', msg.type, '---');
      console.log(JSON.stringify(msg, null, 2));

      // Skill tool_use があるか確認
      if (msg.type === 'assistant' && msg.message?.content) {
        for (const block of msg.message.content) {
          if (block.type === 'tool_use' && block.name === 'Skill') {
            console.log('\n🎯 Skill tool used! Input:', JSON.stringify(block.input, null, 2));
          }
        }
      }

      if (msg.type === 'result') {
        console.log('\n✅ Final result received');
        break;
      }
    }
  } finally {
    await manager.delete(plugin.id);
    await rm(tempRoot, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
