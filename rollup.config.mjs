import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';

// Browser-specific configuration
const browserConfig = {
  input: '.build-temp/client/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      intro: 'var global = typeof window !== "undefined" ? window : global;',
      inlineDynamicImports: true,
      interop: 'auto',
    },
    {
      file: 'dist/index.mjs',
      format: 'esm',
      sourcemap: true,
      exports: 'named',
      intro: 'var global = typeof window !== "undefined" ? window : global;',
      inlineDynamicImports: true,
      interop: 'auto',
    },
  ],
  plugins: [
    peerDepsExternal(),
    typescript({
      tsconfig: './tsconfig.client.json',
      declaration: false,
      sourceMap: true,
      jsx: 'react-jsx',
      include: ['src/client/**/*', 'src/shared/**/*', 'src/core/**/*'],
    }),
    resolve({
      browser: true,
      preferBuiltins: false,
      mainFields: ['browser', 'module', 'main'],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    commonjs({
      transformMixedEsModules: true,
      include: [/node_modules/, /src\/core/, /src\/shared/, /src\/client/],
      requireReturnsDefault: 'auto',
    }),
    json(),
    replace({
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      },
    }),
  ],
  external: ['react', 'react-dom', 'react/jsx-runtime'],
};

// Server-specific configuration
const serverConfig = {
  input: '.build-temp/server/index.js',
  output: [
    {
      file: 'dist/server/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      inlineDynamicImports: true,
      interop: 'auto',
    },
    {
      file: 'dist/server/index.mjs',
      format: 'esm',
      sourcemap: true,
      exports: 'named',
      inlineDynamicImports: true,
      interop: 'auto',
    },
  ],
  plugins: [
    peerDepsExternal(),
    typescript({
      tsconfig: './tsconfig.server.json',
      declaration: false,
      sourceMap: true,
      include: ['src/server/**/*', 'src/shared/**/*', 'src/core/**/*'],
    }),
    resolve({
      browser: false,
      preferBuiltins: true,
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    commonjs({
      include: [/node_modules/, /src\/core/, /src\/shared/],
      requireReturnsDefault: 'auto',
    }),
    json(),
  ],
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    'fs',
    'path',
    'crypto',
    'stream',
    'util',
    'events',
    'os',
    'buffer',
  ],
};

export default [browserConfig, serverConfig];
