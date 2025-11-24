/**
 * スキル経由でサブエージェントを呼び出すテスト
 *
 * 重要な発見:
 *  - サブエージェントは暗黙的に呼び出されない（明示的な指示が必要）
 *  - スキルの指示に「code-reviewer エージェントを使用せよ」と記載することで、
 *    AI が Task tool 経由でサブエージェントを呼び出す
 *
 * 実行方法:
 *   cd examples/subagents
 *   pnpm skill-test           # 暗黙的呼び出し（シンプルなレビュー依頼）
 *   pnpm skill-test --explicit # 明示的呼び出し（スキル名を指定）
 */
import { mkdtemp, rm, writeFile, mkdir } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { createPluginManager, createAgentSdkPluginAdapter } from '../../packages/core/dist/index.js';
import { query } from '@anthropic-ai/claude-agent-sdk';

async function main() {
  console.log('========================================');
  console.log('Skill → Subagent 暗黙的呼び出しテスト');
  console.log('========================================\n');

  const tempRoot = await mkdtemp(join(tmpdir(), 'viyv-skill-agent-'));

  process.env.CLAUDE_PLUGIN_ROOT = tempRoot;
  process.env.CLAUDE_HOME = tempRoot;

  // サンプルコードファイルを作成
  const sampleDir = join(tempRoot, 'sample-project');
  await mkdir(sampleDir, { recursive: true });

  const sampleFilePath = join(sampleDir, 'sample.ts');
  await writeFile(
    sampleFilePath,
    `/**
 * Sample API module with intentional issues
 */

// Security issue: hardcoded credentials
const API_KEY = "sk-secret-key-12345";

export interface User {
  id: number;
  name: string;
  email: string;
}

export async function fetchUsers(): Promise<User[]> {
  // No error handling
  const response = await fetch('https://api.example.com/users', {
    headers: { 'Authorization': \`Bearer \${API_KEY}\` }
  });
  return response.json();
}

export function validateEmail(email: string): boolean {
  // Weak validation
  return email.includes('@');
}

// Critical: using eval
export function processUserData(users: User[]): void {
  users.forEach(user => {
    eval(\`console.log("Processing: \${user.name}")\`);
  });
}
`
  );

  const manager = await createPluginManager();

  console.log('Creating plugin with skill that delegates to subagent...');

  // スキル + サブエージェントの両方を持つプラグインを作成
  const plugin = await manager.create({
    name: 'code-quality',
    description: 'Code quality tools with skills and specialized agents',
    // スキル: 固有情報 + サブエージェントへの委任を指示
    // ※ エージェント名と混同しないよう、全く異なる名前を使用
    skills: [
      {
        id: 'security-standards',
        content: `---
name: security-standards
description: Company-specific security standards and compliance checklist. MUST be used when reviewing code to ensure compliance with our security policies.
---

# Code Review Standards & Guidelines

This skill contains our company's official code review standards. **These standards are mandatory for all code reviews.**

## Security Checklist (Company Policy)

All code must be checked against these security requirements:

| Priority | Category | Check |
|----------|----------|-------|
| CRITICAL | Secrets | No hardcoded API keys, passwords, or tokens |
| CRITICAL | Injection | No use of eval(), exec(), or dynamic code execution |
| HIGH | Input | All user input must be validated and sanitized |
| HIGH | Auth | Authentication tokens must have expiration |
| MEDIUM | Error | No sensitive data in error messages |
| MEDIUM | Logging | No PII in log statements |

## Review Process

**Step 1**: Use the \`code-reviewer\` agent for detailed analysis
- The agent is specialized in security vulnerability detection
- It will check against OWASP Top 10 vulnerabilities

**Step 2**: Cross-reference results with the checklist above

**Step 3**: Assign severity ratings per company policy

## How to Invoke the Agent

Use the Task tool with:
\`\`\`
subagent_type: "code-reviewer"
prompt: "Review [file_path] for security vulnerabilities and code quality issues"
\`\`\`

## Company Compliance Requirements

- All CRITICAL issues must be fixed before merge
- HIGH issues require tech lead approval if not fixed
- Code review results must be documented
`,
        files: [
          {
            path: 'owasp-checklist.md',
            content: `# OWASP Top 10 Quick Reference

## A01: Broken Access Control
- Verify role-based access is enforced
- Check for IDOR vulnerabilities

## A02: Cryptographic Failures
- Ensure sensitive data is encrypted
- Check for weak algorithms

## A03: Injection
- Validate all inputs
- Use parameterized queries
- Never use eval()

## A07: Security Misconfiguration
- Remove debug code
- Hide error details in production
`,
          },
        ],
      },
    ],
    // agents/ ディレクトリにもエージェント定義を作成（自動検出用）
    agents: [
      {
        id: 'code-reviewer',
        content: `---
name: code-reviewer
description: Expert code reviewer for security, quality, and best practices analysis.
tools: Read, Grep, Glob
model: sonnet
---

You are an expert code reviewer with deep knowledge of security vulnerabilities.
`,
      },
    ],
  });

  console.log('Plugin created at:', plugin.location);

  // プラグイン構造をデバッグ表示
  const { execSync } = await import('child_process');
  console.log('\n--- Plugin File Structure ---');
  try {
    console.log(execSync(`find ${plugin.location} -type f`, { encoding: 'utf-8' }));
  } catch {
    console.log('Could not list files');
  }

  // plugin.json の内容を確認
  console.log('--- plugin.json content ---');
  try {
    console.log(execSync(`cat ${plugin.location}/.claude-plugin/plugin.json`, { encoding: 'utf-8' }));
  } catch {
    console.log('Could not read plugin.json');
  }

  const adapter = createAgentSdkPluginAdapter(manager);
  const pluginRefs = await adapter.getSdkPlugins([plugin.id]);

  console.log('\n--- Debug: Plugin Refs ---');
  console.log('Plugin ID:', plugin.id);
  console.log('Plugin refs:', JSON.stringify(pluginRefs, null, 2));

  // Programmatic agents: SDK の options.agents で定義
  const programmaticAgents = {
    'code-reviewer': {
      description: 'Expert code reviewer for security, quality, and best practices analysis.',
      prompt: `You are an expert code reviewer with deep knowledge of security vulnerabilities and code quality best practices.

## Your Responsibilities
- Identify security vulnerabilities (hardcoded secrets, injection risks, etc.)
- Check for code quality issues
- Suggest improvements with specific examples
- Rate the overall code quality (1-10)

## Review Format
1. **Security Issues**: List all security concerns with severity
2. **Code Quality**: Identify maintainability and readability issues
3. **Suggestions**: Provide actionable improvements
4. **Overall Rating**: Score from 1-10 with explanation`,
      tools: ['Read', 'Grep', 'Glob'],
      model: 'sonnet' as const,
    },
  };

  // シナリオ選択
  const scenarioArg = process.argv.includes('--explicit');

  let prompt: string;
  let scenarioDesc: string;

  if (scenarioArg) {
    // 明示的: スキルを名指しで呼び出し
    prompt = `Use the security-standards skill to review the code in ${sampleFilePath}.`;
    scenarioDesc = 'EXPLICIT: Invoke security-standards skill by name';
  } else {
    // 暗黙的: シンプルなレビュー依頼
    prompt = `Please review the code in ${sampleFilePath} and tell me about any issues.`;
    scenarioDesc = 'IMPLICIT: Simple review request';
  }

  console.log('\n--- Test Configuration ---');
  console.log('Scenario:', scenarioDesc);
  console.log('Prompt:', prompt);
  console.log('Expected flow: Prompt → Skill activates → Skill instructs to use code-reviewer agent');
  console.log('');

  const q = query({
    prompt,
    options: {
      plugins: pluginRefs,
      agents: programmaticAgents,
      allowedTools: ['Task', 'Skill', 'Bash', 'Read', 'Write', 'Grep', 'Glob'],
      settingSources: [],
      stderr: (data: string) => {
        process.stderr.write(`SDK stderr: ${data}\n`);
      },
    },
  });

  let skillUsed = false;
  let agentUsed = false;
  const toolsUsed: string[] = [];

  try {
    for await (const msg of q) {
      // init メッセージでスキル一覧を確認
      if (msg.type === 'system' && (msg as { subtype?: string }).subtype === 'init') {
        const initMsg = msg as { plugins?: unknown[]; slash_commands?: string[]; skills?: unknown };
        console.log('\n--- SDK Init Message ---');
        console.log('Plugins:', JSON.stringify(initMsg.plugins, null, 2));
        console.log('Slash commands:', initMsg.slash_commands);
        console.log('Skills:', JSON.stringify(initMsg.skills, null, 2));
        console.log('Full init:', JSON.stringify(msg, null, 2).substring(0, 500));
      }

      if (msg.type === 'assistant' && msg.message?.content) {
        for (const block of msg.message.content) {
          if (block.type === 'tool_use') {
            const toolName = block.name;
            if (!toolsUsed.includes(toolName)) {
              toolsUsed.push(toolName);
            }

            if (block.name === 'Skill') {
              const input = block.input as { skill?: string };
              console.log('\n🎯 SKILL INVOKED:', input.skill);
              skillUsed = true;
            } else if (block.name === 'Task') {
              const input = block.input as { subagent_type?: string; prompt?: string; description?: string };
              console.log('\n🚀 SUBAGENT INVOKED:');
              console.log('   Type:', input.subagent_type);
              console.log('   Description:', input.description);
              if (input.subagent_type === 'code-reviewer') {
                agentUsed = true;
              }
            } else {
              console.log(`\n🔧 Tool: ${toolName}`);
            }
          } else if (block.type === 'text') {
            const text = block.text as string;
            if (text.length > 300) {
              console.log('\n📝 Assistant:', text.substring(0, 300) + '...');
            } else {
              console.log('\n📝 Assistant:', text);
            }
          }
        }
      }

      if (msg.type === 'user' && msg.message?.content) {
        for (const block of msg.message.content) {
          if (block.type === 'tool_result') {
            const content = block.content as string;
            if (content && content.length > 0) {
              if (content.length > 200) {
                console.log('\n📋 Result:', content.substring(0, 200) + '...');
              } else {
                console.log('\n📋 Result:', content);
              }
            }
          }
        }
      }

      if (msg.type === 'result') {
        console.log('\n✅ Query completed');
        console.log('Duration:', (msg as { duration_ms?: number }).duration_ms, 'ms');
        break;
      }
    }

    // サマリー
    console.log('\n========== SUMMARY ==========');
    console.log('Tools used:', toolsUsed.join(', '));
    console.log('Skill used:', skillUsed ? 'Yes (security-standards)' : 'No');
    console.log('Subagent used:', agentUsed ? 'Yes (code-reviewer)' : 'No');

    if (skillUsed && agentUsed) {
      console.log('\n✅ SUCCESS: Skill → Subagent chain worked!');
      console.log('   The skill was activated and successfully delegated to the subagent.');
    } else if (skillUsed && !agentUsed) {
      console.log('\n⚠️  PARTIAL: Skill activated but did not delegate to subagent.');
      console.log('   The skill instructions to use the agent were not followed.');
    } else if (!skillUsed && agentUsed) {
      console.log('\n⚠️  UNEXPECTED: Subagent used directly without skill.');
    } else {
      console.log('\n❌ Neither skill nor subagent was used.');
      console.log('   Main agent handled the task directly.');
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
