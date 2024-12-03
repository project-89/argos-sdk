import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import pkg from './package.json' assert { type: 'json' };

export default {
  input: 'src/lib/argos-sdk/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
    },
  ],
  external: [...Object.keys(pkg.peerDependencies || {})],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: './dist/types/lib/argos-sdk',
      outDir: './dist',
      exclude: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx'],
      compilerOptions: {
        sourceMap: true,
        declarationMap: true,
      },
    }),
    resolve(),
    commonjs(),
  ],
};
