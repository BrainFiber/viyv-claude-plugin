import type { SkillInput } from '../types/index.js';

const RESERVED = ['anthropic', 'claude'];
const ID_REGEX = /^[a-z0-9-]{1,64}$/;

type Frontmatter = {
  name?: string;
  description?: string;
};

function extractFrontmatter(content: string): Frontmatter {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return {};
  const block = match[1];
  const lines = block.split(/\r?\n/);
  const fm: Frontmatter = {};
  for (const line of lines) {
    const kv = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, raw] = kv;
    const val = raw.replace(/^['"]|['"]$/g, '').trim();
    if (key === 'name') fm.name = val;
    if (key === 'description') fm.description = val;
  }
  return fm;
}

function hasXmlTags(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  return /<[^>]+>/.test(value);
}

function containsReserved(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  return RESERVED.some((word) => value.toLowerCase().includes(word));
}

function validateFilePath(path: string): void {
  if (path.startsWith('/') || path.startsWith('..')) {
    throw new Error(`Skill file path must be relative without leading '/' or '..': ${path}`);
  }
  if (path.includes('\\')) {
    throw new Error(`Skill file path must use forward slashes: ${path}`);
  }
  const depth = path.split('/').length;
  if (depth > 2) {
    throw new Error(`Skill file path depth must be at most one subdirectory: ${path}`);
  }
}

export function validateSkillInput(skill: SkillInput): void {
  if (!ID_REGEX.test(skill.id)) {
    throw new Error(
      `Invalid skill id "${skill.id}": use lowercase letters, numbers, hyphens, max 64 chars`
    );
  }
  if (containsReserved(skill.id)) {
    throw new Error(`Invalid skill id "${skill.id}": reserved terms not allowed`);
  }

  const frontmatter = extractFrontmatter(skill.content);
  if (!frontmatter.name || !frontmatter.description) {
    throw new Error(
      `Skill ${skill.id} must include YAML frontmatter with name and description fields`
    );
  }

  if (containsReserved(frontmatter.name)) {
    throw new Error(`Skill name contains reserved terms: ${frontmatter.name}`);
  }

  if (hasXmlTags(frontmatter.name) || hasXmlTags(frontmatter.description)) {
    throw new Error(`Skill name/description cannot contain XML tags`);
  }

  if (frontmatter.name.length > 64) {
    throw new Error(`Skill name exceeds 64 characters for skill ${skill.id}`);
  }
  if (frontmatter.description.length > 1024) {
    throw new Error(`Skill description exceeds 1024 characters for skill ${skill.id}`);
  }

  const lineCount = skill.content.split(/\r?\n/).length;
  if (lineCount > 500) {
    throw new Error(`Skill ${skill.id} exceeds 500 lines; split into references`);
  }

  if (skill.files) {
    for (const file of skill.files) {
      validateFilePath(file.path);
    }
  }
}

// Exposed for white-box tests to ensure guard clauses stay defensive
export const __skillTestUtils = {
  extractFrontmatter,
  hasXmlTags,
  containsReserved,
};
