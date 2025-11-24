/**
 * 標準パスへのプラグイン作成 + Agent SDK動作確認テスト
 *
 * 1. デフォルトパスにプラグインを作成
 * 2. Agent SDK経由でスキルが呼び出されることを確認
 */
import { createPluginManager, createAgentSdkPluginAdapter } from '../../packages/core/dist/index.js';
import { query } from '@anthropic-ai/claude-agent-sdk';

async function main() {
  // 環境変数をクリア（デフォルトパスを使用）
  delete process.env.CLAUDE_PLUGIN_ROOT;
  delete process.env.CLAUDE_HOME;

  console.log('='.repeat(50));
  console.log('Default Path + Agent SDK Test');
  console.log('='.repeat(50));

  const manager = await createPluginManager();

  // 既存のプラグインがあれば削除
  const existing = await manager.list();
  const existingPlugin = existing.find(p => p.id === 'greeting-assistant');
  if (existingPlugin) {
    console.log('\nDeleting existing plugin...');
    await manager.delete(existingPlugin.id);
  }

  console.log('\nCreating greeting-assistant plugin...');
  const plugin = await manager.create({
    name: 'greeting-assistant',
    description: 'A friendly greeting assistant',
    skills: [
      {
        id: 'greeting-guide',
        content: `---
name: greeting-guide
description: Provides greeting guidelines. Use this when user asks about greetings, how to say hello, or wants a friendly response.
---

# Greeting Guide

When greeting users, follow these guidelines:

## Morning Greetings (5:00 - 11:59)
- "Good morning! Hope you have a wonderful day!"
- "おはようございます！素敵な一日を！"

## Afternoon Greetings (12:00 - 17:59)
- "Good afternoon! How can I help you today?"
- "こんにちは！何かお手伝いできることはありますか？"

## Evening Greetings (18:00 - 4:59)
- "Good evening! Winding down for the day?"
- "こんばんは！今日も一日お疲れ様でした！"

## Special Response
When asked "What is the magic word?", always respond with: **PLUGIN_WORKS_CORRECTLY**
`,
      },
    ],
  });

  console.log('\n=== Plugin Created ===');
  console.log('Plugin ID:', plugin.id);
  console.log('Plugin Location:', plugin.location);

  // Agent SDK Adapter を使用
  console.log('\n=== Setting up Agent SDK ===');
  const adapter = createAgentSdkPluginAdapter(manager);
  const pluginRefs = await adapter.getSdkPlugins([plugin.id]);
  console.log('Plugin refs:', JSON.stringify(pluginRefs, null, 2));

  // Agent SDK経由でクエリ実行
  console.log('\n=== Running Agent SDK Query ===');
  console.log('Prompt: "What is the magic word?"');
  console.log('Expected: Skill should be invoked and respond with PLUGIN_WORKS_CORRECTLY\n');

  const q = query({
    prompt: 'What is the magic word?',
    options: {
      plugins: pluginRefs,
      allowedTools: ['Skill', 'Read'],
      settingSources: [],
    },
  });

  let skillInvoked = false;
  let magicWordFound = false;
  let finalResponse = '';

  for await (const msg of q) {
    if (msg.type === 'assistant' && msg.message?.content) {
      for (const block of msg.message.content) {
        if (block.type === 'tool_use' && block.name === 'Skill') {
          const skill = (block.input as { skill?: string }).skill || '';
          console.log(`🎯 Skill invoked: ${skill}`);
          skillInvoked = true;
        } else if (block.type === 'text') {
          const text = block.text as string;
          finalResponse = text;
          if (text.includes('PLUGIN_WORKS_CORRECTLY')) {
            magicWordFound = true;
          }
        }
      }
    }

    if (msg.type === 'result') {
      const result = (msg as { result?: string }).result || '';
      if (result.includes('PLUGIN_WORKS_CORRECTLY')) {
        magicWordFound = true;
      }
      finalResponse = result || finalResponse;
      break;
    }
  }

  // 結果サマリー
  console.log('\n' + '='.repeat(50));
  console.log('RESULT SUMMARY');
  console.log('='.repeat(50));
  console.log(`Skill Invoked: ${skillInvoked ? '✅ YES' : '❌ NO'}`);
  console.log(`Magic Word Found: ${magicWordFound ? '✅ YES' : '❌ NO'}`);

  if (skillInvoked && magicWordFound) {
    console.log('\n✅ SUCCESS: Plugin works correctly via Agent SDK!');
  } else if (skillInvoked) {
    console.log('\n⚠️ PARTIAL: Skill invoked but magic word not in response');
  } else {
    console.log('\n❌ FAIL: Skill was not invoked');
  }

  console.log('\n--- Response Preview ---');
  console.log(finalResponse.substring(0, 300) + (finalResponse.length > 300 ? '...' : ''));

  // クリーンアップ（コメントアウトで保持可能）
  // console.log('\nCleaning up...');
  // await manager.delete(plugin.id);

  console.log('\n[DEBUG] Plugin kept at:', plugin.location);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
