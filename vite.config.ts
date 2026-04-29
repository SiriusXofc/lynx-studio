import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  build: {
    chunkSizeWarningLimit: 1800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/typescript/')) {
            return 'typescript-runtime';
          }

          if (id.includes('/node_modules/@codemirror/lang-')) {
            return 'cm-languages';
          }

          if (id.includes('/node_modules/isomorphic-git/')
            || id.includes('/node_modules/@isomorphic-git/lightning-fs/')) {
            return 'git-runtime';
          }

          if (id.includes('/node_modules/vscode-css-languageservice/')
            || id.includes('/node_modules/vscode-html-languageservice/')
            || id.includes('/node_modules/vscode-json-languageservice/')) {
            return 'vscode-services';
          }

          return undefined;
        },
      },
    },
  },
  server: {
    strictPort: true,
    host: '127.0.0.1',
    port: 1420,
  },
});
