/**
 * 複数プラグインの暗黙的呼び出しテスト
 *
 * フルスタック開発支援シナリオ:
 *   - frontend-toolkit: React開発支援
 *   - backend-toolkit: API開発支援
 *   - quality-assurance: テスト支援
 *
 * 各プラグインはスキル + サブエージェントを持ち、
 * ユーザーのリクエストに応じて暗黙的に適切なプラグインが呼び出されることを確認
 *
 * 実行方法:
 *   pnpm test                    # デフォルト（フロントエンド系プロンプト）
 *   pnpm test:frontend           # フロントエンド系プロンプト
 *   pnpm test:backend            # バックエンド系プロンプト
 *   pnpm test:testing            # テスト系プロンプト
 */
import { mkdtemp, rm, writeFile, mkdir } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { createPluginManager, createAgentSdkPluginAdapter, ClaudePlugin } from '../../packages/core/dist/index.js';
import { query } from '@anthropic-ai/claude-agent-sdk';

// プラグイン定義
const PLUGINS = {
  frontendToolkit: {
    name: 'frontend-toolkit',
    description: 'React/TypeScript development toolkit for frontend developers',
    skills: [
      {
        id: 'react-patterns',
        content: `---
name: react-patterns
description: React component patterns and best practices. Use this when asked to create React components, implement UI features, or review frontend code.
---

# React Development Patterns

This skill provides React/TypeScript best practices for component development.

## When to Use
- Creating new React components
- Implementing UI features
- Reviewing frontend code structure

## Component Guidelines

### Functional Components
- Always use TypeScript with proper type definitions
- Use hooks for state management (useState, useEffect, useCallback, useMemo)
- Implement proper error boundaries

### File Structure
\`\`\`
ComponentName/
├── index.tsx        # Main component
├── styles.ts        # Styled components or CSS modules
├── types.ts         # TypeScript interfaces
└── hooks.ts         # Custom hooks
\`\`\`

## How to Generate Components

Use the Task tool to invoke the \`component-generator\` agent:
\`\`\`
subagent_type: "component-generator"
prompt: "Generate a React component for [description] following our patterns"
\`\`\`

The agent will create a complete component following these patterns.
`,
      },
    ],
    agents: [
      {
        id: 'component-generator',
        content: `---
name: component-generator
description: Generates React components following best practices.
tools: Read, Write
model: haiku
---

You are a React component generator. Create TypeScript React components with:

1. **Type Safety**: Full TypeScript interfaces
2. **Hooks**: Proper use of React hooks
3. **Styling**: CSS-in-JS or CSS modules
4. **Accessibility**: ARIA attributes where needed
5. **Testing**: Component is testable

Output format:
- Component code with TypeScript
- Props interface
- Basic usage example
`,
      },
    ],
  },

  backendToolkit: {
    name: 'backend-toolkit',
    description: 'API design and backend development toolkit',
    skills: [
      {
        id: 'api-guidelines',
        content: `---
name: api-guidelines
description: REST API design guidelines and backend patterns. Use this when asked to design APIs, create endpoints, or review backend architecture.
---

# API Design Guidelines

This skill provides REST API design best practices.

## When to Use
- Designing new API endpoints
- Creating backend services
- Reviewing API architecture

## REST API Standards

### HTTP Methods
| Method | Usage |
|--------|-------|
| GET | Retrieve resources |
| POST | Create resources |
| PUT | Update (replace) resources |
| PATCH | Partial update |
| DELETE | Remove resources |

### Response Format
\`\`\`json
{
  "data": { ... },
  "meta": { "page": 1, "total": 100 },
  "errors": []
}
\`\`\`

### Error Handling
- 400: Bad Request (validation errors)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## How to Design APIs

Use the Task tool to invoke the \`api-designer\` agent:
\`\`\`
subagent_type: "api-designer"
prompt: "Design REST API endpoints for [feature] following our guidelines"
\`\`\`

The agent will create API specifications following these patterns.
`,
      },
    ],
    agents: [
      {
        id: 'api-designer',
        content: `---
name: api-designer
description: Designs REST APIs following best practices.
tools: Read, Write
model: haiku
---

You are an API designer. Create REST API specifications with:

1. **Endpoints**: Clear URL paths and methods
2. **Request/Response**: JSON schemas
3. **Authentication**: Auth requirements
4. **Validation**: Input validation rules
5. **Error Handling**: Error response formats

Output format:
- Endpoint specification (method, path, description)
- Request body schema
- Response body schema
- Example curl commands
`,
      },
    ],
  },

  qualityAssurance: {
    name: 'quality-assurance',
    description: 'Testing standards and test generation toolkit',
    skills: [
      {
        id: 'testing-standards',
        content: `---
name: testing-standards
description: Testing guidelines and test generation standards. Use this when asked to write tests, review test coverage, or implement testing strategies.
---

# Testing Standards

This skill provides testing best practices and guidelines.

## When to Use
- Writing unit tests
- Creating integration tests
- Reviewing test coverage
- Implementing E2E tests

## Testing Pyramid

1. **Unit Tests** (70%)
   - Fast, isolated
   - Test single functions/components
   - Mock external dependencies

2. **Integration Tests** (20%)
   - Test component interactions
   - Database operations
   - API integrations

3. **E2E Tests** (10%)
   - Full user flows
   - Critical paths only

## Test Structure (AAA Pattern)
\`\`\`typescript
describe('ComponentName', () => {
  it('should do something', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = doSomething(input);

    // Assert
    expect(result).toBe('expected');
  });
});
\`\`\`

## How to Generate Tests

Use the Task tool to invoke the \`test-generator\` agent:
\`\`\`
subagent_type: "test-generator"
prompt: "Generate tests for [code/component] following our standards"
\`\`\`

The agent will create comprehensive tests following these patterns.
`,
      },
    ],
    agents: [
      {
        id: 'test-generator',
        content: `---
name: test-generator
description: Generates tests following best practices.
tools: Read, Write
model: haiku
---

You are a test generator. Create comprehensive tests with:

1. **Unit Tests**: Jest/Vitest syntax
2. **Coverage**: Edge cases, error handling
3. **Mocking**: Proper mock setup
4. **Assertions**: Clear expectations
5. **Documentation**: Test descriptions

Output format:
- Test file with describe/it blocks
- Mock setup if needed
- Multiple test cases covering happy path and edge cases
`,
      },
    ],
  },
};

// シナリオ別プロンプト
const SCENARIOS = {
  frontend: {
    name: 'Frontend Development',
    prompt: 'Please create a React button component that supports primary and secondary variants with loading state.',
    expectedPlugin: 'frontend-toolkit',
    expectedSkill: 'react-patterns',
    expectedAgent: 'component-generator',
  },
  backend: {
    name: 'Backend Development',
    prompt: 'Please design a REST API for user authentication with login, logout, and token refresh endpoints.',
    expectedPlugin: 'backend-toolkit',
    expectedSkill: 'api-guidelines',
    expectedAgent: 'api-designer',
  },
  testing: {
    name: 'Testing',
    prompt: 'Please write unit tests for a function that validates email addresses.',
    expectedPlugin: 'quality-assurance',
    expectedSkill: 'testing-standards',
    expectedAgent: 'test-generator',
  },
};

async function main() {
  // シナリオ選択
  const scenarioArg = process.argv.find(arg => arg.startsWith('--scenario='));
  const scenarioKey = scenarioArg?.split('=')[1] || 'frontend';
  const scenario = SCENARIOS[scenarioKey as keyof typeof SCENARIOS] || SCENARIOS.frontend;

  console.log('========================================');
  console.log('Multiple Plugins Implicit Invocation Test');
  console.log('========================================\n');
  console.log(`Scenario: ${scenario.name}`);
  console.log(`Prompt: "${scenario.prompt}"`);
  console.log(`Expected: ${scenario.expectedPlugin} → ${scenario.expectedSkill} → ${scenario.expectedAgent}\n`);

  const tempRoot = await mkdtemp(join(tmpdir(), 'viyv-multi-plugins-'));

  process.env.CLAUDE_PLUGIN_ROOT = tempRoot;
  process.env.CLAUDE_HOME = tempRoot;

  // サンプルコードディレクトリを作成
  const sampleDir = join(tempRoot, 'project');
  await mkdir(sampleDir, { recursive: true });

  // テスト用サンプルファイル
  await writeFile(
    join(sampleDir, 'utils.ts'),
    `export function validateEmail(email: string): boolean {
  return email.includes('@') && email.includes('.');
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
`
  );

  const manager = await createPluginManager();
  const createdPlugins: ClaudePlugin[] = [];

  try {
    console.log('Creating 3 plugins...\n');

    // 3つのプラグインを作成
    for (const [key, config] of Object.entries(PLUGINS)) {
      const plugin = await manager.create(config);
      createdPlugins.push(plugin);
      console.log(`  ✓ ${config.name} (${plugin.id})`);
    }

    console.log('\n--- Plugins Created ---');

    const adapter = createAgentSdkPluginAdapter(manager);
    const pluginIds = createdPlugins.map(p => p.id);
    const pluginRefs = await adapter.getSdkPlugins(pluginIds);

    console.log('Plugin refs count:', pluginRefs.length);
    console.log('');

    // クエリ実行
    console.log('--- Executing Query ---');
    console.log(`User: "${scenario.prompt}"\n`);

    const q = query({
      prompt: scenario.prompt,
      options: {
        plugins: pluginRefs,
        allowedTools: ['Task', 'Skill', 'Read', 'Write', 'Grep', 'Glob'],
        settingSources: [],
      },
    });

    // 結果追跡
    const results = {
      skillsInvoked: [] as string[],
      agentsInvoked: [] as string[],
      toolsUsed: [] as string[],
    };

    for await (const msg of q) {
      if (msg.type === 'assistant' && msg.message?.content) {
        for (const block of msg.message.content) {
          if (block.type === 'tool_use') {
            const toolName = block.name;
            if (!results.toolsUsed.includes(toolName)) {
              results.toolsUsed.push(toolName);
            }

            if (block.name === 'Skill') {
              const input = block.input as { skill?: string };
              const skillName = input.skill || 'unknown';
              console.log(`🎯 SKILL: ${skillName}`);
              if (!results.skillsInvoked.includes(skillName)) {
                results.skillsInvoked.push(skillName);
              }
            } else if (block.name === 'Task') {
              const input = block.input as { subagent_type?: string; description?: string };
              const agentType = input.subagent_type || 'unknown';
              console.log(`🚀 AGENT: ${agentType}`);
              if (input.description) {
                console.log(`   Description: ${input.description}`);
              }
              if (!results.agentsInvoked.includes(agentType)) {
                results.agentsInvoked.push(agentType);
              }
            }
          } else if (block.type === 'text') {
            const text = block.text as string;
            if (text.length > 200) {
              console.log(`\n📝 ${text.substring(0, 200)}...`);
            } else if (text.trim()) {
              console.log(`\n📝 ${text}`);
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
    console.log('Skills invoked:', results.skillsInvoked.join(', ') || 'None');
    console.log('Agents invoked:', results.agentsInvoked.join(', ') || 'None');
    console.log('Tools used:', results.toolsUsed.join(', ') || 'None');

    // 検証
    const skillMatched = results.skillsInvoked.some(s => s.includes(scenario.expectedSkill));
    const agentMatched = results.agentsInvoked.some(a => a.includes(scenario.expectedAgent));

    console.log('\n--- Verification ---');
    console.log(`Expected skill (${scenario.expectedSkill}):`, skillMatched ? '✅ MATCHED' : '❌ NOT MATCHED');
    console.log(`Expected agent (${scenario.expectedAgent}):`, agentMatched ? '✅ MATCHED' : '❌ NOT MATCHED');

    if (skillMatched && agentMatched) {
      console.log('\n✅ SUCCESS: Implicit invocation worked!');
      console.log(`   ${scenario.expectedPlugin} → ${scenario.expectedSkill} → ${scenario.expectedAgent}`);
    } else if (skillMatched) {
      console.log('\n⚠️  PARTIAL: Skill invoked but agent not called');
    } else if (agentMatched) {
      console.log('\n⚠️  PARTIAL: Agent called directly without skill');
    } else {
      console.log('\n❌ Neither expected skill nor agent was invoked');
    }

    // 他のプラグインが呼ばれていないか確認
    const unexpectedSkills = results.skillsInvoked.filter(s => !s.includes(scenario.expectedSkill));
    const unexpectedAgents = results.agentsInvoked.filter(a => !a.includes(scenario.expectedAgent));

    if (unexpectedSkills.length > 0 || unexpectedAgents.length > 0) {
      console.log('\n--- Other plugins also invoked ---');
      if (unexpectedSkills.length > 0) {
        console.log('Other skills:', unexpectedSkills.join(', '));
      }
      if (unexpectedAgents.length > 0) {
        console.log('Other agents:', unexpectedAgents.join(', '));
      }
    }

  } finally {
    // クリーンアップ
    for (const plugin of createdPlugins) {
      await manager.delete(plugin.id);
    }
    await rm(tempRoot, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
