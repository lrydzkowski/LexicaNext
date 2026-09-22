import { readFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { getAppVersion } from './scripts/release-version.mjs';

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = command === 'build';
  const outputDir = process.env.VITE_OUTPUT_DIR || '../../LexicaNext.WebApp/wwwroot';
  const env = loadEnv(mode, './env-config', 'LEXICA_');
  const appVersion = getAppVersion(process.env.LEXICA_RELEASE_TAG, process.env.LEXICA_REQUIRE_RELEASE_TAG);

  return {
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
    },
    plugins: [react()],
    resolve: {
      tsconfigPaths: true,
      alias: {
        '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
      },
    },
    build: {
      outDir: outputDir,
      emptyOutDir: true,
      sourcemap: true,
    },
    envDir: './env-config',
    server: isProduction
      ? undefined
      : {
          https: {
            pfx: readFileSync('./certificates/lan.pfx'),
            passphrase: env.LEXICA_HTTPS_PASSWORD,
          },
          proxy: {
            '/api': {
              target: 'https://localhost:7226',
              changeOrigin: true,
              secure: false,
            },
          },
        },
  };
});
