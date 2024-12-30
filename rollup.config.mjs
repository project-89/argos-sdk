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
    input: 'dist/cjs/index.js',
    output: [
      {
        dir: 'dist/cjs',
        format: 'cjs',
        sourcemap: true,
        preserveModules: true,
        exports: 'named',
      },
      {
        dir: 'dist/esm',
        format: 'esm',
        sourcemap: true,
        preserveModules: true,
        exports: 'named',
      },
    ],
    plugins: basePlugins,
  },
  // Server build
  {
    input: 'dist/cjs/server/index.js',
    output: [
      {
        dir: 'dist/server/cjs',
        format: 'cjs',
        sourcemap: true,
        preserveModules: true,
        exports: 'named',
      },
      {
        dir: 'dist/server/esm',
        format: 'esm',
        sourcemap: true,
        preserveModules: true,
        exports: 'named',
      },
    ],
    plugins: basePlugins,
  },
];
