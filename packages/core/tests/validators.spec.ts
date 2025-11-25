import { describe, it, expect } from 'vitest';
import { validateSkillInput, __skillTestUtils } from '../src/validators/skill.js';

const validContent = ['---', 'name: valid-skill', 'description: does things', '---', '# body'].join(
  '\n'
);

describe('validateSkillInput', () => {
  it('accepts well-formed skills', () => {
    expect(() =>
      validateSkillInput({
        id: 'good-id',
        content: validContent,
        files: [{ path: 'NOTES.md', content: '# notes' }],
      })
    ).not.toThrow();
  });

  it('rejects reserved words in frontmatter name', () => {
    const content = ['---', 'name: Anthropic helper', 'description: ok', '---', '# body'].join('\n');
    expect(() =>
      validateSkillInput({
        id: 'reserved-name',
        content,
      })
    ).toThrow(/reserved terms/);
  });

  it('rejects xml tags in description', () => {
    const content = ['---', 'name: ok', 'description: <tag>bad</tag>', '---', '# body'].join('\n');
    expect(() =>
      validateSkillInput({
        id: 'xml-desc',
        content,
      })
    ).toThrow(/XML tags/);
  });

  it('requires name and description in frontmatter', () => {
    expect(() =>
      validateSkillInput({
        id: 'missing-frontmatter',
        content: '# missing frontmatter',
      })
    ).toThrow(/frontmatter/);
  });

  it('rejects names longer than 64 characters', () => {
    const longName = 'n'.repeat(65);
    const content = ['---', `name: ${longName}`, 'description: ok', '---', '# body'].join('\n');
    expect(() =>
      validateSkillInput({
        id: 'long-name',
        content,
      })
    ).toThrow(/exceeds 64 characters/);
  });

  it('skips unknown frontmatter lines', () => {
    const content = [
      '---',
      'name: skip-unknown',
      'unexpected line',
      'description: ok',
      '---',
      '# body',
    ].join('\n');
    expect(() =>
      validateSkillInput({
        id: 'skip-unknown',
        content,
      })
    ).not.toThrow();
  });

  it('exposes defensive guards for undefined values', () => {
    const { hasXmlTags, containsReserved } = __skillTestUtils;
    expect(hasXmlTags(undefined)).toBe(false);
    expect(containsReserved(undefined)).toBe(false);
  });

  it('rejects invalid extra file paths', () => {
    const invalidPaths = [
      '/abs/file.md',
      '../escape.md',
      'dir\\bad.md',
      'too/deep/path.md', // depth > 2
    ];
    for (const path of invalidPaths) {
      expect(() =>
        validateSkillInput({
          id: 'files-test',
          content: validContent,
          files: [{ path, content: 'x' }],
        })
      ).toThrow(/Skill file path/);
    }
  });
});
