import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
);

const basePlugins = [peerDepsExternal(), resolve(), commonjs()];

export default [
  // Client build
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      ...basePlugins,
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/types',
        outDir: './dist',
      }),
    ],
  },
  // Server build
  {
    input: 'src/server/index.ts',
    output: [
      {
        file: 'dist/server/index.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/server/index.esm.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      ...basePlugins,
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/server/types',
        outDir: './dist/server',
      }),
    ],
  },
];
