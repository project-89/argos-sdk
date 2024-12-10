import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import pkg from './package.json' assert { type: 'json' };

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

const plugins = [
  typescript({
    tsconfig: './tsconfig.json',
    declaration: false,
    exclude: ['**/__tests__/**', '**/*.test.ts'],
  }),
  resolve(),
  commonjs(),
];

export default [
  // ESM build
  {
    input: 'src/index.ts',
    output: {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
    },
    external,
    plugins,
  },
  // CJS build
  {
    input: 'src/index.ts',
    output: {
      file: './dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    external,
    plugins,
  },
  // UMD build
  {
    input: 'src/index.ts',
    output: {
      file: pkg.main,
      format: 'umd',
      name: 'ArgosSDK',
      sourcemap: true,
      globals: {
        'cross-fetch': 'fetch',
        react: 'React',
      },
    },
    external,
    plugins,
  },
];
