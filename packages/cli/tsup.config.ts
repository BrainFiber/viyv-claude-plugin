import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: false,
  sourcemap: true,
  dts: true,
  format: ['esm'],
  target: 'node18',
  clean: true,
  noExternal: ['@viyv-claude-plugin'],
  external: ['fs-extra', 'adm-zip'],
});
