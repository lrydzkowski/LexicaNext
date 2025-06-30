import * as process from 'process';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isProduction = command === 'build';
  const outputDir = process.env.VITE_OUTPUT_DIR || '../../LexicaNext.WebApp/wwwroot';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
      },
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@mantine/core',
        '@mantine/hooks',
        '@mantine/notifications',
        '@mantine/modals',
        '@auth0/auth0-react',
        '@tanstack/react-query',
        'react-router',
      ],
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
          hmr: {
            overlay: true,
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
