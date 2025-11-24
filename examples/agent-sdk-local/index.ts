/**
 * Agent SDK 統合用の最小ステップ:
 * 1) ローカルプラグインを作成
 * 2) Adapter で Agent SDK 用 plugin refs を生成
 * 3) (オプション) SDK がインストール済みなら query() に渡す
 *
 * NOTE: ここでは SDK が未インストールでも動くよう、SDK呼び出しはオプション扱い。
 */
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { createPluginManager, createAgentSdkPluginAdapter } from '../../packages/core/dist/index.js';

async function main() {
  const root = await mkdtemp(join(tmpdir(), 'viyv-agent-sdk-'));
  process.env.CLAUDE_PLUGIN_ROOT = root;
  const manager = await createPluginManager();

  // 1) プラグイン作成 (最小 Skill)
  const plugin = await manager.create({
    name: 'agent-sdk-demo',
    description: 'Minimal plugin for Agent SDK integration test',
    skills: [
      {
        id: 'hello-agent',
        content: [
          '---',
          'name: hello-agent',
          'description: respond hello when user greets; use when user says hello.',
          '---',
          '# Hello Agent',
          '',
          'Respond with a concise greeting and ask one clarifying question.',
        ].join('\n'),
      },
    ],
  });

  // 2) Adapter で Agent SDK 用 refs に変換
  const adapter = createAgentSdkPluginAdapter(manager);
  const pluginRefs = await adapter.getSdkPlugins([plugin.id]);
  console.log('Agent SDK plugin refs:', pluginRefs);

  // 3) SDK が入っていれば query() に渡す（任意）
  try {
    const sdkModuleName = '@anthropic-ai/claude-agent-sdk';
    // dynamic import だが、未インストールなら catch へ
    const sdk = await import(sdkModuleName);
    console.log('SDK detected, issuing test query...');
    const q = sdk.query({
      prompt: 'Say hello using plugin',
      options: {
        plugins: pluginRefs,
        allowedTools: ['Read', 'Write', 'Edit', 'Bash', 'Skill'],
        settingSources: [], // ファイル設定を読まない
      },
    });
    // 1メッセージだけ読む簡易サンプル
    for await (const msg of q) {
      console.log('SDK message:', msg.type);
      if (msg.type === 'result' || msg.type === 'assistant') break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('SDK not installed or query failed; skipping live call:', message);
  }

  await manager.delete(plugin.id);
  await rm(root, { recursive: true, force: true });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
