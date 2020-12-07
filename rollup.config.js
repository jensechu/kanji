"use strict";

import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs'

export default {
  input: "src/kanji.ts",
  output: {
    file: "dist/js/kanji.js",
    format: "iife",
    sourcemap: true,
    name: 'kanji',
  },

  plugins: [
    typescript(),
    commonjs(),
    resolve({ browser: true }),
  ]
}
