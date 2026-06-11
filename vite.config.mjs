import { defineConfig, transformWithOxc } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

const jsxInJs = {
  name: 'jsx-in-js',
  enforce: 'pre',
  async transform(code, id) {
    if (!id.includes('/src/') || !id.endsWith('.js')) {
      return null;
    }
    return transformWithOxc(code, id, {
      lang: 'jsx',
      jsx: {
        runtime: 'automatic',
        importSource: 'react',
      },
    });
  },
};

export default defineConfig({
  base: './',
  build: {
    outDir: 'build',
  },
  css: {
    modules: {
      generateScopedName: '[name]__[local]',
    },
    preprocessorOptions: {
      scss: {
        silenceDeprecations: [
          'color-functions',
          'global-builtin',
          'if-function',
          'import',
        ],
      },
    },
  },
  plugins: [
    jsxInJs,
    react({
      include: /\.[jt]sx?$/,
    }),
    svgr({
      include: '**/*.svg',
      svgrOptions: {
        exportType: 'default',
      },
    }),
  ],
  ssr: {
    noExternal: ['wave-resampler'],
  },
});
