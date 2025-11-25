import { join, dirname } from 'path';
import { mkdir, writeFile, readFile, cp } from 'fs/promises';
import { existsSync } from 'fs';
import { copy } from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'plugin';
}

async function renderTemplate(src: string, dest: string, vars: Record<string, string>) {
  const content = await readFile(src, 'utf-8');
  const rendered = content.replace(/{{(.*?)}}/g, (_, key) => vars[key.trim()] ?? '');
  await mkdir(join(dest, '..'), { recursive: true });
  await writeFile(dest, rendered, 'utf-8');
}

export type ScaffoldOptions = {
  cwd: string;
  pluginName: string;
  description?: string;
  version?: string;
  authorName?: string;
  authorEmail?: string;
  marketplaceName?: string;
  ownerName?: string;
  ownerEmail?: string;
  force?: boolean;
};

export async function scaffoldNewPlugin(opts: ScaffoldOptions) {
  const pluginId = slugify(opts.pluginName);
  const pluginName = opts.pluginName;
  const description = opts.description || 'New plugin scaffold';
  const version = opts.version || '0.1.0';
  const authorName = opts.authorName || 'Local Dev';
  const authorEmail = opts.authorEmail || '';
  const marketplaceName = slugify(opts.marketplaceName || 'local-marketplace');
  const ownerName = opts.ownerName || authorName;
  const ownerEmail = opts.ownerEmail || authorEmail;

  const root = opts.cwd;
  const mpDir = join(root, '.claude-plugin');
  const pluginDir = join(root, 'plugins', pluginId);

  if (!opts.force) {
    if (existsSync(mpDir)) throw new Error(`${mpDir} already exists (use --force to overwrite)`);
    if (existsSync(pluginDir)) throw new Error(`${pluginDir} already exists (use --force to overwrite)`);
  }

  await mkdir(mpDir, { recursive: true });
  await mkdir(pluginDir, { recursive: true });

  const vars = {
    PLUGIN_ID: pluginId,
    PLUGIN_NAME: pluginName,
    PLUGIN_DESCRIPTION: description,
    PLUGIN_VERSION: version,
    PLUGIN_AUTHOR_NAME: authorName,
    PLUGIN_AUTHOR_EMAIL: authorEmail,
    MARKETPLACE_NAME: marketplaceName,
    OWNER_NAME: ownerName,
    OWNER_EMAIL: ownerEmail,
  } as Record<string, string>;

  const tplRoot = join(__dirname, '..', 'templates');

  // marketplace.json
  await renderTemplate(
    join(tplRoot, 'marketplace', 'marketplace.json'),
    join(mpDir, 'marketplace.json'),
    vars
  );

  // plugin files
  const pluginTplDir = join(tplRoot, 'plugin');
  // copy tree then render json/README/skill
  await copy(pluginTplDir, pluginDir, { overwrite: true });
  await renderTemplate(
    join(pluginTplDir, '.claude-plugin', 'plugin.json'),
    join(pluginDir, '.claude-plugin', 'plugin.json'),
    vars
  );
  await renderTemplate(
    join(pluginTplDir, 'README.md'),
    join(pluginDir, 'README.md'),
    vars
  );
  await renderTemplate(
    join(pluginTplDir, 'skills', 'sample-skill', 'SKILL.md'),
    join(pluginDir, 'skills', 'sample-skill', 'SKILL.md'),
    vars
  );
}

// Internal test helpers
export const __scaffoldTestUtils = {
  slugify,
  renderTemplate,
};
