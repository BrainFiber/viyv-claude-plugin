/**
 * Subagent 動作確認用サンプル
 *
 * やること:
 *  1) 一時ディレクトリに plugins/forms-automation を生成
 *  2) Agent SDK の query() に plugins と agents (subagents) を渡す
 *  3) 最初の assistant/result メッセージが返れば成功（認証必須）
 *
 * 実行:
 *   cd examples/agent-sdk-local
 *   pnpm subagents   # or npx tsx agent-subagents.ts
 */
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { createPluginManager, createAgentSdkPluginAdapter } from '@viyv-claude-plugin';
import { query, type AgentDefinition } from '@anthropic-ai/claude-agent-sdk';

async function main() {
  const root = await mkdtemp(join(tmpdir(), 'viyv-subagents-'));
  // Claude Code/SDK が書き込む場所を一時領域に寄せる
  process.env.CLAUDE_PLUGIN_ROOT = root;
  process.env.CLAUDE_HOME = root;
  process.env.HOME = process.env.HOME || root;

  const manager = await createPluginManager();

  // forms-automation を作成（skills + 参照ファイル + scripts）
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
          'Use the scripts for deterministic actions (analyze_form.py, validate.py, fill_form.py).',
          'Keep responses concise.',
        ].join('\n'),
      },
    ],
  });

  const adapter = createAgentSdkPluginAdapter(manager);
  const pluginRefs = await adapter.getSdkPlugins([plugin.id]);
  console.log('Plugin refs for SDK:', pluginRefs);

  const subagents: Record<string, AgentDefinition> = {
    'form-analyst': {
      description: 'Extracts and maps fields; use for analyzing form structure.',
      prompt:
        'You specialize in understanding form fields and producing concise mappings. Prefer running analyze_form.py, then propose a mapping summary.',
      tools: ['Skill', 'Read'],
      model: 'sonnet',
    },
    'form-filler': {
      description: 'Validates and fills forms once mapping is ready.',
      prompt:
        'You execute validation and fill steps. Run validate.py then fill_form.py. Report any missing required fields.',
      tools: ['Skill', 'Bash', 'Read'],
      model: 'haiku',
    },
  };

  const q = query({
    prompt:
      'Use the subagents to analyze and fill a form with name=Alice, date=2025-01-01. Keep output concise.',
    options: {
      plugins: pluginRefs,
      agents: subagents,
      allowedTools: ['Skill', 'Bash', 'Read'],
      settingSources: [],
      stderr: (data: string) => process.stderr.write(`SDK stderr: ${data}\n`),
    },
  });

  try {
    for await (const msg of q) {
      console.log('SDK message:', msg.type);
      if (msg.type === 'assistant' || msg.type === 'result') {
        console.log('Message payload:', msg);
        break;
      }
    }
  } finally {
    await manager.delete(plugin.id);
    await rm(root, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
