/**
 * ワークフローで複数サブエージェントを順次呼び出すテスト
 *
 * フロー:
 *   User Request
 *       ↓
 *   Skill (security-review)
 *       ↓ スキルの指示で直接サブエージェントを順番に呼び出す
 *   Agent 1 (code-scanner)
 *       ↓
 *   Agent 2 (security-analyzer)
 *       ↓
 *   Agent 3 (report-generator)
 *
 * 実行方法:
 *   pnpm workflow-test
 */
import { mkdtemp, rm, writeFile, mkdir } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { createPluginManager, createAgentSdkPluginAdapter } from '../../packages/core/dist/index.js';
import { query } from '@anthropic-ai/claude-agent-sdk';

async function main() {
  console.log('========================================');
  console.log('Workflow: スキルから複数サブエージェント順次呼び出し');
  console.log('========================================\n');

  const tempRoot = await mkdtemp(join(tmpdir(), 'viyv-workflow-'));

  process.env.CLAUDE_PLUGIN_ROOT = tempRoot;
  process.env.CLAUDE_HOME = tempRoot;

  // サンプルコードファイルを作成
  const sampleDir = join(tempRoot, 'sample-project');
  await mkdir(sampleDir, { recursive: true });

  const sampleFilePath = join(sampleDir, 'app.ts');
  await writeFile(
    sampleFilePath,
    `/**
 * Sample application with security issues
 */
const DB_PASSWORD = "admin123";
const API_SECRET = "sk-live-xxxxx";

export function authenticate(username: string, password: string) {
  // SQL injection vulnerable
  const query = \`SELECT * FROM users WHERE username = '\${username}' AND password = '\${password}'\`;
  return executeQuery(query);
}

export function renderUserInput(input: string) {
  // XSS vulnerable
  document.innerHTML = input;
}

export function processData(data: any) {
  // Code injection
  eval(data.code);
}

function executeQuery(sql: string) {
  console.log("Executing:", sql);
}
`
  );

  const manager = await createPluginManager();

  console.log('Creating plugin with skill and subagents...');

  // スキル + サブエージェントを manager.create で定義
  const plugin = await manager.create({
    name: 'security-workflow',
    description: 'Security review workflow with multiple specialized agents',
    skills: [
      {
        id: 'security-review',
        content: `---
name: security-review
description: Comprehensive security review process. Use this when asked to review code for security issues.
---

# Security Review Workflow

When performing a security review, you MUST execute these 3 agents in sequence:

## Step 1: Code Scanner
First, use the Task tool to invoke the \`code-scanner\` agent:
\`\`\`
subagent_type: "code-scanner"
prompt: "Scan [file_path] and identify code structure and potential security areas"
\`\`\`
Wait for the result before proceeding.

## Step 2: Security Analyzer
After code-scanner completes, use the Task tool to invoke the \`security-analyzer\` agent:
\`\`\`
subagent_type: "security-analyzer"
prompt: "Analyze the code for vulnerabilities based on the scan results"
\`\`\`
Wait for the result before proceeding.

## Step 3: Report Generator
Finally, use the Task tool to invoke the \`report-generator\` agent:
\`\`\`
subagent_type: "report-generator"
prompt: "Generate a comprehensive security report from the analysis"
\`\`\`

## Important
- Execute all 3 agents in order (1 → 2 → 3)
- Do NOT skip any agent
- Pass relevant context from each step to the next
`,
      },
    ],
    // サブエージェントを manager.create で定義
    agents: [
      {
        id: 'code-scanner',
        content: `---
name: code-scanner
description: Scans code structure and identifies areas of concern.
tools: Read, Grep, Glob
model: haiku
---

You are a code scanner. Your job is to:
1. Read the provided code file
2. Identify the overall structure (functions, classes, imports)
3. Flag areas that might have security implications

Output a structured summary of:
- Functions found
- Potential security areas (input handling, DB operations, auth, rendering)
`,
      },
      {
        id: 'security-analyzer',
        content: `---
name: security-analyzer
description: Analyzes code for specific security vulnerabilities.
tools: Read
model: haiku
---

You are a security analyzer. Analyze the code for:

1. SQL Injection
2. XSS (Cross-Site Scripting)
3. Code Injection (eval)
4. Hardcoded Secrets

For each vulnerability found, provide:
- Severity (CRITICAL/HIGH/MEDIUM/LOW)
- Line number
- Description
`,
      },
      {
        id: 'report-generator',
        content: `---
name: report-generator
description: Generates comprehensive security report.
tools: Read
model: haiku
---

Create a security report with:

1. **Executive Summary** - Overview of findings
2. **Vulnerabilities** - List with severity and location
3. **Risk Rating** - Overall score (1-10)
4. **Recommendations** - Priority fixes
`,
      },
    ],
  });

  console.log('Plugin created at:', plugin.location);

  const adapter = createAgentSdkPluginAdapter(manager);
  const pluginRefs = await adapter.getSdkPlugins([plugin.id]);

  const prompt = `Use the security-review skill to perform a comprehensive security review of the code in ${sampleFilePath}.`;

  console.log('\n--- Test Configuration ---');
  console.log('Prompt:', prompt);
  console.log('Expected flow:');
  console.log('  Skill (security-review)');
  console.log('    → code-scanner');
  console.log('    → security-analyzer');
  console.log('    → report-generator');
  console.log('');

  const q = query({
    prompt,
    options: {
      plugins: pluginRefs,
      allowedTools: ['Task', 'Skill', 'Read', 'Grep', 'Glob'],
      settingSources: [],
    },
  });

  const agentsInvoked: string[] = [];
  let skillUsed = false;

  try {
    for await (const msg of q) {
      if (msg.type === 'assistant' && msg.message?.content) {
        for (const block of msg.message.content) {
          if (block.type === 'tool_use') {
            if (block.name === 'Skill') {
              const input = block.input as { skill?: string };
              console.log('\n🎯 SKILL INVOKED:', input.skill);
              skillUsed = true;
            } else if (block.name === 'Task') {
              const input = block.input as { subagent_type?: string; description?: string };
              const agentType = input.subagent_type || 'unknown';
              console.log('\n🚀 AGENT INVOKED:', agentType);
              if (input.description) {
                console.log('   Description:', input.description);
              }

              if (!agentsInvoked.includes(agentType)) {
                agentsInvoked.push(agentType);
              }
            } else {
              console.log(`\n🔧 Tool: ${block.name}`);
            }
          } else if (block.type === 'text') {
            const text = block.text as string;
            if (text.length > 200) {
              console.log('\n📝 Output:', text.substring(0, 200) + '...');
            } else {
              console.log('\n📝 Output:', text);
            }
          }
        }
      }

      if (msg.type === 'result') {
        console.log('\n✅ Query completed');
        break;
      }
    }

    // サマリー
    console.log('\n========== SUMMARY ==========');
    console.log('Skill used:', skillUsed ? 'Yes (security-review)' : 'No');
    console.log('Agents invoked:', agentsInvoked.join(' → ') || 'None');

    const expectedAgents = ['code-scanner', 'security-analyzer', 'report-generator'];
    // エージェント名にプラグイン名がプレフィックスとして付く場合があるため部分一致でチェック
    const allAgentsUsed = expectedAgents.every(expected =>
      agentsInvoked.some(invoked => invoked.includes(expected))
    );

    if (skillUsed && allAgentsUsed) {
      console.log('\n✅ SUCCESS: Full workflow executed!');
      console.log('   Skill → code-scanner → security-analyzer → report-generator');
    } else if (skillUsed && agentsInvoked.length > 0) {
      console.log('\n⚠️  PARTIAL: Some agents executed');
      console.log('   Missing agents:', expectedAgents.filter(a => !agentsInvoked.includes(a)).join(', '));
    } else if (skillUsed) {
      console.log('\n⚠️  Skill used but no agents invoked');
    } else {
      console.log('\n❌ Workflow not executed as expected');
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
