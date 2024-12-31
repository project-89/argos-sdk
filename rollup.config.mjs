import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import json from '@rollup/plugin-json';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
);

const basePlugins = [peerDepsExternal(), resolve(), commonjs(), json()];

export default [
  // Client build
  {
    input: '.build-temp/index.js',
    output: [
      {
        dir: 'dist',
        format: 'cjs',
        sourcemap: true,
        preserveModules: true,
        exports: 'named',
      },
      {
        dir: 'dist',
        format: 'esm',
        sourcemap: true,
        preserveModules: true,
        exports: 'named',
        entryFileNames: '[name].mjs',
      },
    ],
    plugins: basePlugins,
  },
  // Server build
  {
    input: '.build-temp/server/index.js',
    output: [
      {
        dir: 'dist/server',
        format: 'cjs',
        sourcemap: true,
        preserveModules: true,
        exports: 'named',
      },
      {
        dir: 'dist/server',
        format: 'esm',
        sourcemap: true,
        preserveModules: true,
        exports: 'named',
        entryFileNames: '[name].mjs',
      },
    ],
    plugins: basePlugins,
  },
];
