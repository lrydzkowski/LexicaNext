import * as process from 'process';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isProduction = command === 'build';
  const outputDir = process.env.VITE_OUTPUT_DIR || '../../LexicaNext.WebApp/wwwroot';

  return {
    plugins: [react()],
    build: {
      outDir: outputDir,
      sourcemap: true,
    },
    envDir: './env-config',
    server: isProduction
      ? undefined
      : {
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
