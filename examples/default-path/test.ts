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
  for (const p of existing) {
    if (p.id === 'greeting-assistant' || p.id === 'coding-helper') {
      console.log(`\nDeleting existing plugin: ${p.id}...`);
      await manager.delete(p.id);
    }
  }

  // プラグイン1: greeting-assistant
  console.log('\nCreating greeting-assistant plugin...');
  const greetingPlugin = await manager.create({
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

  // プラグイン2: coding-helper
  console.log('Creating coding-helper plugin...');
  const codingPlugin = await manager.create({
    name: 'coding-helper',
    description: 'A coding assistant with best practices',
    skills: [
      {
        id: 'typescript-tips',
        content: `---
name: typescript-tips
description: Provides TypeScript coding tips and best practices. Use this when user asks about TypeScript, coding conventions, or type safety.
---

# TypeScript Best Practices

## Type Safety
- Always use strict mode
- Prefer \`unknown\` over \`any\`
- Use type guards for runtime checks

## Naming Conventions
- Use PascalCase for types and interfaces
- Use camelCase for variables and functions
- Use UPPER_SNAKE_CASE for constants

## Secret Code
When asked "What is the secret code?", always respond with: **CODING_PLUGIN_ACTIVE**
`,
      },
    ],
  });

  console.log('\n=== Plugins Created ===');
  console.log('Plugin 1:', greetingPlugin.id, '-', greetingPlugin.location);
  console.log('Plugin 2:', codingPlugin.id, '-', codingPlugin.location);

  // Agent SDK Adapter を使用（両方のプラグインを登録）
  console.log('\n=== Setting up Agent SDK ===');
  const adapter = createAgentSdkPluginAdapter(manager);
  const pluginRefs = await adapter.getSdkPlugins([greetingPlugin.id, codingPlugin.id]);
  console.log('Plugin refs:', JSON.stringify(pluginRefs, null, 2));

  // テスト1: greeting-assistant のスキル確認
  console.log('\n=== Test 1: Greeting Plugin ===');
  console.log('Prompt: "挨拶のガイドラインを教えて。あと、magic wordは何？"');
  console.log('Expected: greeting-guide skill → PLUGIN_WORKS_CORRECTLY\n');

  const result1 = await runQuery('挨拶のガイドラインを教えて。あと、magic wordは何？', pluginRefs);

  console.log('\n=== Test 2: Coding Plugin ===');
  console.log('Prompt: "TypeScriptのベストプラクティスを教えて。あと、secret codeは何？"');
  console.log('Expected: typescript-tips skill → CODING_PLUGIN_ACTIVE\n');

  const result2 = await runQuery('TypeScriptのベストプラクティスを教えて。あと、secret codeは何？', pluginRefs);

  // 結果サマリー
  console.log('\n' + '='.repeat(50));
  console.log('RESULT SUMMARY');
  console.log('='.repeat(50));

  console.log('\nTest 1 (greeting-assistant):');
  console.log(`  Skill Invoked: ${result1.skillInvoked ? '✅ YES' : '❌ NO'} ${result1.skillName || ''}`);
  console.log(`  Expected Response: ${result1.response.includes('PLUGIN_WORKS_CORRECTLY') ? '✅ YES' : '❌ NO'}`);

  console.log('\nTest 2 (coding-helper):');
  console.log(`  Skill Invoked: ${result2.skillInvoked ? '✅ YES' : '❌ NO'} ${result2.skillName || ''}`);
  console.log(`  Expected Response: ${result2.response.includes('CODING_PLUGIN_ACTIVE') ? '✅ YES' : '❌ NO'}`);

  const allPassed =
    result1.skillInvoked && result1.response.includes('PLUGIN_WORKS_CORRECTLY') &&
    result2.skillInvoked && result2.response.includes('CODING_PLUGIN_ACTIVE');

  if (allPassed) {
    console.log('\n✅ SUCCESS: Both plugins work correctly via Agent SDK!');
  } else {
    console.log('\n⚠️ PARTIAL: Some tests did not pass');
  }

  // marketplace.json の確認
  console.log('\n=== Marketplace.json ===');
  const marketplacePath = `${process.env.HOME}/.viyv-claude/.claude-plugin/marketplace.json`;
  const { readFile } = await import('fs/promises');
  try {
    const marketplace = JSON.parse(await readFile(marketplacePath, 'utf-8'));
    console.log('Plugins in marketplace:', marketplace.plugins.map((p: { name: string }) => p.name).join(', '));
  } catch {
    console.log('marketplace.json not found');
  }

  console.log('\n[DEBUG] Plugins kept at:');
  console.log('  -', greetingPlugin.location);
  console.log('  -', codingPlugin.location);
}

async function runQuery(prompt: string, pluginRefs: Array<{ type: 'local'; path: string }>) {
  const q = query({
    prompt,
    options: {
      plugins: pluginRefs,
      allowedTools: ['Skill', 'Read'],
      settingSources: [],
    },
  });

  let skillInvoked = false;
  let skillName = '';
  let response = '';

  for await (const msg of q) {
    if (msg.type === 'assistant' && msg.message?.content) {
      for (const block of msg.message.content) {
        if (block.type === 'tool_use' && block.name === 'Skill') {
          const skill = (block.input as { skill?: string }).skill || '';
          console.log(`🎯 Skill invoked: ${skill}`);
          skillInvoked = true;
          skillName = skill;
        } else if (block.type === 'text') {
          response = block.text as string;
        }
      }
    }

    if (msg.type === 'result') {
      const result = (msg as { result?: string }).result || '';
      response = result || response;
      break;
    }
  }

  console.log('Response:', response.substring(0, 200) + (response.length > 200 ? '...' : ''));
  return { skillInvoked, skillName, response };
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
