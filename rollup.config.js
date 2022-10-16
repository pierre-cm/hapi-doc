import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

export default {
    input: './main.js',
    external: ['vite'],
    output: [
      {
        file: `dist/index.js`,
        format: 'cjs'
      },
      {
        file: `dist/index.esm.js`,
        format: 'esm'
      }
    ],
    plugins: [
        resolve({preferBuiltins: false}),
        json(),
        commonjs(),
        terser({ output: { comments: false } })
    ]
}