import typescript from "rollup-plugin-typescript2";

let pkg = require("./package.json");
let external = [...Object.keys(pkg.dependencies)];
let banner = [
  "/**",
  ` * Copyright (c) ${new Date().getFullYear()}, Peculiar Ventures, All rights reserved.`,
  " */",
  "",
]

export default {
  input: "src/index.ts",
  plugins: [
    typescript({
      check: true,
      clean: true,
      tsconfigOverride: {
        compilerOptions: {
          module: "ES2015",
        }
      }
    }),
  ],
  external,
  output: [
    {
      banner,
      file: pkg.main,
      format: "cjs",
    },
    {
      banner,
      file: pkg.module,
      format: "es",
    },
  ]
};