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
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
      {
        file: 'dist/index.mjs',
        format: 'esm',
        sourcemap: true,
        exports: 'named',
      },
    ],
    plugins: basePlugins,
  },
  // Server build
  {
    input: '.build-temp/server/index.js',
    output: [
      {
        file: 'dist/server/index.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
      {
        file: 'dist/server/index.mjs',
        format: 'esm',
        sourcemap: true,
        exports: 'named',
      },
    ],
    plugins: basePlugins,
  },
];
