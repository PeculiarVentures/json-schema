import { defineConfig } from "tsdown";

const banner = `/** Copyright (c) ${new Date().getFullYear()}, Peculiar Ventures, All rights reserved. */`;

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  unbundle: false,
  // Keep .js/.mjs/.d.ts output names (package.json is "type": "commonjs")
  // instead of tsdown's node-platform default of fixed .cjs/.mjs extensions.
  fixedExtension: false,
  exports: {
    all: false,
    legacy: true,
  },
  outDir: "build",
  tsconfig: "tsconfig.json",
  outputOptions: {
    banner,
  },
  attw: {
    level: "error",
    profile: "strict",
  },
});
