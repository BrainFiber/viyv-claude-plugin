import { createPluginManager } from '../../packages/core/dist/index.js';

async function main() {
  // Create plugin manager
  const manager = await createPluginManager();

  // Create a new plugin
  console.log('Creating a new plugin...');
  const plugin = await manager.create({
    name: 'example-plugin',
    description: 'An example plugin for demonstration',
    version: '1.0.0',
    tags: ['example', 'demo'],
    skills: [
      {
        id: 'greeting',
        content: `---
name: greeting
description: handles user greetings
---
# Greeting Skill

This skill handles greetings.

## Usage

Use this skill when the user says hello or greets you.

## Example

User: Hello!
Assistant: Hi there! How can I help you today?
`,
      },
    ],
  });

  console.log(`✓ Created plugin: ${plugin.id}`);
  console.log(`  Location: ${plugin.location}`);

  // List all plugins
  console.log('\nListing all plugins...');
  const plugins = await manager.list();
  console.log(`Found ${plugins.length} plugins:`);
  for (const p of plugins) {
    console.log(`  - ${p.id} (${p.version})`);
  }

  // Get plugin details
  console.log('\nGetting plugin details...');
  const retrieved = await manager.get(plugin.id);
  if (retrieved) {
    console.log(`Plugin: ${retrieved.name}`);
    console.log(`Description: ${retrieved.description}`);
    console.log(`Tags: ${retrieved.tags?.join(', ')}`);
  }

  // Update plugin
  console.log('\nUpdating plugin...');
  await manager.update(plugin.id, {
    description: 'Updated description',
    version: '1.1.0',
  });
  console.log('✓ Plugin updated');

  // Clean up (optional - remove the example plugin)
  console.log('\nCleaning up...');
  await manager.delete(plugin.id, { force: true });
  console.log('✓ Plugin deleted');
}

main().catch(console.error);
