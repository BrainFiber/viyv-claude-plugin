/**
 * data-processor プラグイン作成テスト
 *
 * すべてのスキルファイルが正しく生成されることを確認します。
 */
import { mkdtemp, rm, readdir } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { createPluginManager } from '../../packages/core/dist/index.js';

async function main() {
  const root = await mkdtemp(join(tmpdir(), 'viyv-data-processor-'));
  process.env.CLAUDE_PLUGIN_ROOT = root;
  const manager = await createPluginManager();

  console.log('Creating data-processor plugin...');
  const plugin = await manager.create({
    name: 'data-processor',
    description: 'Self-contained data processing skill with scripts and documentation',
    skills: [
      {
        id: 'data-processor',
        content: [
          '---',
          'name: data-processor',
          'description: Generate, process, and validate user data; use when user asks about data processing, statistics, or user analytics.',
          '---',
          '# Data Processor',
          '',
          '## Overview',
          'A self-contained data processing workflow that generates sample data, computes statistics, and validates output.',
          '',
          '## Quick Start',
          '1. Generate data: `python scripts/generate_data.py > data.json`',
          '2. Process data: `python scripts/process_data.py data.json > stats.json`',
          '3. Validate output: `python scripts/validate_output.py stats.json`',
          '',
          '## Documentation',
          '- [WORKFLOW.md](WORKFLOW.md) - Step-by-step workflow guide',
          '- [api-reference.md](api-reference.md) - Script API reference',
          '- [examples.md](examples.md) - Usage examples',
          '',
          '## Important',
          '- Always run scripts in order: generate → process → validate',
          '- Check WORKFLOW.md for detailed steps',
          '- Refer to api-reference.md for script arguments',
        ].join('\n'),
        files: [
          {
            path: 'WORKFLOW.md',
            content: [
              '# Workflow Guide',
              '',
              '## Step 1: Generate Sample Data',
              'Run `generate_data.py` to create sample user data.',
              '```bash',
              'python scripts/generate_data.py > data.json',
              '```',
              'This creates a JSON file with 5 sample users.',
              '',
              '## Step 2: Process Data',
              'Run `process_data.py` to compute statistics.',
              '```bash',
              'python scripts/process_data.py data.json > stats.json',
              '```',
              'This calculates:',
              '- Total user count',
              '- Average age',
              '- Country distribution',
              '',
              '## Step 3: Validate Output',
              'Run `validate_output.py` to verify the results.',
              '```bash',
              'python scripts/validate_output.py stats.json',
              '```',
              'Expected output: "OK" if valid, error message if not.',
              '',
              '## Complete Example',
              '```bash',
              'python scripts/generate_data.py > data.json',
              'python scripts/process_data.py data.json > stats.json',
              'python scripts/validate_output.py stats.json',
              '```',
            ].join('\n'),
          },
          {
            path: 'api-reference.md',
            content: [
              '# API Reference',
              '',
              '## generate_data.py',
              '**Usage**: `python generate_data.py [--count N]`',
              '',
              '**Arguments**:',
              '- `--count N`: Number of users to generate (default: 5)',
              '',
              '**Output**: JSON array to stdout',
              '```json',
              '[{"name": "Alice", "age": 28, "country": "USA"}, ...]',
              '```',
              '',
              '## process_data.py',
              '**Usage**: `python process_data.py INPUT_FILE`',
              '',
              '**Arguments**:',
              '- `INPUT_FILE`: Path to JSON file with user data',
              '',
              '**Output**: JSON object to stdout',
              '```json',
              '{"total_users": 5, "average_age": 32.4, "countries": {"USA": 2, "UK": 3}}',
              '```',
              '',
              '## validate_output.py',
              '**Usage**: `python validate_output.py STATS_FILE`',
              '',
              '**Arguments**:',
              '- `STATS_FILE`: Path to JSON file with statistics',
              '',
              '**Output**:',
              '- "OK" if valid',
              '- Error message with exit code 1 if invalid',
            ].join('\n'),
          },
          {
            path: 'examples.md',
            content: [
              '# Usage Examples',
              '',
              '## Example 1: Basic Workflow',
              '```bash',
              '# Generate 5 users',
              'python scripts/generate_data.py > data.json',
              '',
              '# View generated data',
              'cat data.json',
              '',
              '# Process and get statistics',
              'python scripts/process_data.py data.json > stats.json',
              '',
              '# View statistics',
              'cat stats.json',
              '',
              '# Validate',
              'python scripts/validate_output.py stats.json',
              '# Output: OK',
              '```',
              '',
              '## Example 2: Custom Count',
              '```bash',
              '# Generate 10 users',
              'python scripts/generate_data.py --count 10 > data.json',
              'python scripts/process_data.py data.json > stats.json',
              'python scripts/validate_output.py stats.json',
              '```',
              '',
              '## Example 3: Pipeline',
              '```bash',
              '# One-liner pipeline',
              'python scripts/generate_data.py | python scripts/process_data.py /dev/stdin',
              '```',
            ].join('\n'),
          },
          {
            path: 'scripts/generate_data.py',
            content: [
              '#!/usr/bin/env python3',
              '"""Generate sample user data."""',
              'import json',
              'import sys',
              'import random',
              '',
              'NAMES = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry"]',
              'COUNTRIES = ["USA", "UK", "Japan", "Germany", "France"]',
              '',
              'def main():',
              '    count = 5',
              '    if "--count" in sys.argv:',
              '        idx = sys.argv.index("--count")',
              '        if idx + 1 < len(sys.argv):',
              '            count = int(sys.argv[idx + 1])',
              '',
              '    users = []',
              '    for _ in range(count):',
              '        users.append({',
              '            "name": random.choice(NAMES),',
              '            "age": random.randint(18, 65),',
              '            "country": random.choice(COUNTRIES)',
              '        })',
              '',
              '    json.dump(users, sys.stdout, indent=2)',
              '    print()  # newline',
              '',
              'if __name__ == "__main__":',
              '    main()',
            ].join('\n'),
          },
          {
            path: 'scripts/process_data.py',
            content: [
              '#!/usr/bin/env python3',
              '"""Process user data and compute statistics."""',
              'import json',
              'import sys',
              '',
              'def main():',
              '    if len(sys.argv) < 2:',
              '        print("Usage: process_data.py INPUT_FILE", file=sys.stderr)',
              '        sys.exit(1)',
              '',
              '    input_file = sys.argv[1]',
              '    if input_file == "/dev/stdin":',
              '        data = json.load(sys.stdin)',
              '    else:',
              '        with open(input_file) as f:',
              '            data = json.load(f)',
              '',
              '    if not data:',
              '        print("Error: Empty data", file=sys.stderr)',
              '        sys.exit(1)',
              '',
              '    total_users = len(data)',
              '    average_age = sum(u["age"] for u in data) / total_users',
              '    countries = {}',
              '    for u in data:',
              '        c = u["country"]',
              '        countries[c] = countries.get(c, 0) + 1',
              '',
              '    stats = {',
              '        "total_users": total_users,',
              '        "average_age": round(average_age, 1),',
              '        "countries": countries',
              '    }',
              '',
              '    json.dump(stats, sys.stdout, indent=2)',
              '    print()  # newline',
              '',
              'if __name__ == "__main__":',
              '    main()',
            ].join('\n'),
          },
          {
            path: 'scripts/validate_output.py',
            content: [
              '#!/usr/bin/env python3',
              '"""Validate statistics output."""',
              'import json',
              'import sys',
              '',
              'def main():',
              '    if len(sys.argv) < 2:',
              '        print("Usage: validate_output.py STATS_FILE", file=sys.stderr)',
              '        sys.exit(1)',
              '',
              '    stats_file = sys.argv[1]',
              '    with open(stats_file) as f:',
              '        stats = json.load(f)',
              '',
              '    errors = []',
              '',
              '    # Check required fields',
              '    required = ["total_users", "average_age", "countries"]',
              '    for field in required:',
              '        if field not in stats:',
              '            errors.append(f"Missing field: {field}")',
              '',
              '    # Validate types',
              '    if "total_users" in stats and not isinstance(stats["total_users"], int):',
              '        errors.append("total_users must be an integer")',
              '',
              '    if "average_age" in stats and not isinstance(stats["average_age"], (int, float)):',
              '        errors.append("average_age must be a number")',
              '',
              '    if "countries" in stats and not isinstance(stats["countries"], dict):',
              '        errors.append("countries must be an object")',
              '',
              '    if errors:',
              '        for e in errors:',
              '            print(f"Error: {e}", file=sys.stderr)',
              '        sys.exit(1)',
              '',
              '    print("OK")',
              '',
              'if __name__ == "__main__":',
              '    main()',
            ].join('\n'),
          },
        ],
      },
    ],
  });

  console.log('Created:', plugin.id);
  console.log('Location:', plugin.location);

  // 生成されたファイルを確認
  const skillDir = join(plugin.location, 'skills', 'data-processor');
  console.log('\nGenerated files:');

  async function listFiles(dir: string, prefix = ''): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        console.log(`${prefix}${entry.name}/`);
        await listFiles(fullPath, prefix + '  ');
      } else {
        console.log(`${prefix}${entry.name}`);
      }
    }
  }

  await listFiles(skillDir);

  console.log('\nListing plugins:');
  console.log(await manager.list());

  console.log('\nCleaning up...');
  await manager.delete(plugin.id);
  await rm(root, { recursive: true, force: true });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
