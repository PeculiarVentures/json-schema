import typescript from "rollup-plugin-typescript";
import cleanup from "rollup-plugin-cleanup";

let pkg = require("./package.json");
let external = [...Object.keys(pkg.dependencies)];

export default {
  input: "src/index.ts",
  plugins: [
    typescript({ typescript: require("typescript"), target: "esnext" }),
    cleanup({ extensions: ["ts"] }),
  ],
  external,
  output: [
    {
      file: pkg.main,
      format: "cjs",
    }
  ]
};