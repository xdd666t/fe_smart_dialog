import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      'react/index': 'src/react/index.ts',
      'vue/index': 'src/vue/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: {
      compilerOptions: {
        composite: false,
      },
    },
    splitting: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    external: ['react', 'react-dom', 'react/jsx-runtime', 'vue'],
    loader: {
      '.css': 'text',
    },
    tsconfig: 'tsconfig.build.json',
    outExtension({ format }) {
      return {
        js: format === 'cjs' ? '.cjs' : '.js',
      };
    },
  },
  {
    entry: {
      'fe-smart-dialog.global': 'src/index.ts',
    },
    format: ['iife'],
    globalName: 'FeSmartDialog',
    minify: true,
    sourcemap: true,
    clean: false,
    loader: {
      '.css': 'text',
    },
    tsconfig: 'tsconfig.build.json',
    outExtension() {
      return {
        js: '.js',
      };
    },
  },
]);
