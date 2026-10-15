<h1 align="center">
  @peculiar/json-schema
</h1>

<div align="center">

![NPM License](https://img.shields.io/npm/l/@peculiar/json-schema)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/PeculiarVentures/json-schema/publish.yml?branch=master&label=publish)
[![npm version](https://img.shields.io/npm/v/@peculiar/json-schema.svg)](https://www.npmjs.com/package/@peculiar/json-schema)
![Coveralls](https://img.shields.io/coverallsCoverage/github/PeculiarVentures/json-schema)
[![npm downloads](https://img.shields.io/npm/dm/@peculiar/json-schema.svg)](https://www.npmjs.com/package/@peculiar/json-schema)

</div>

Serialize and parse JSON with TypeScript classes. Describe the schema once with the `@JsonProp` decorator, and the library maps property names, converts values and validates input in both directions.

## Introduction

JSON (JavaScript Object Notation) is a lightweight data-interchange format that is easy for humans to read and write, but in practice it is a [minefield](https://seriot.ch/projects/parsing_json.html) when machines need to parse it.

Schemas help, but they can be complicated to use. `@peculiar/json-schema` addresses this with decorators: you annotate a class, and the library handles serialization, parsing and validation of JSON for you.

All input data is untrusted, so it should be validated before use. Parsing into a schema gives you a typed object or a descriptive error.

## Installation

```sh
npm install @peculiar/json-schema
```

The package is ESM-only with TypeScript declarations, and requires Node.js `^20.19.0 || >=22.12.0`. CommonJS code can still `require()` it on those versions.

`@JsonProp` is a TypeScript legacy (experimental) decorator. Enable it in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

## Breaking Changes In v3

v3 ships ESM only. The CommonJS build is removed: v2 published `build/index.js` (CommonJS), `build/index.mjs` (ESM) and `build/index.d.mts`; v3 publishes a single ES module, `build/index.js`, with `build/index.d.ts`, behind an `exports` map.

- **Node.js `^20.19.0 || >=22.12.0` is required** (previously `>=16.0.0`). These versions support `require()` of ES modules, so CommonJS code can keep using `require("@peculiar/json-schema")` without changes. Node.js 22.0–22.11 is not supported: it can't `require()` ESM.
- **TypeScript projects that compile to CommonJS** need `"module": "node20"` or `"nodenext"` (TypeScript 5.9+). With `"module": "node16"` the compiler reports TS1479.
- **ESM and bundler setups** (`"module": "preserve"`, `"moduleResolution": "bundler"`) work without changes.
- **Legacy `"moduleResolution": "node"` (node10)** resolves the package through `types`; `@peculiar/json-schema` has no subpath exports, so nothing else changes.
- **Jest in CommonJS mode** can't load ESM packages. Use Jest's ESM mode, add `@peculiar/json-schema` to the `transformIgnorePatterns` exceptions, or switch to Vitest.
- **Deep imports stay blocked.** The `exports` map allows only `@peculiar/json-schema` and `@peculiar/json-schema/package.json`, as in v2.
- **`require()` and `import` share one schema storage.** v2 shipped separate CommonJS and ESM copies, so an application that loaded both (for example ESM code plus a CommonJS dependency) got two schema storages, and classes decorated through one copy were unknown to `JsonParser`/`JsonSerializer` from the other. v3 has a single module, so both load the same storage.

The public API is unchanged; only packaging and runtime requirements changed. `@JsonProp` still needs `"experimentalDecorators": true`.

## Examples

### Creating a schema

```ts
import { JsonParser, JsonSerializer, JsonProp, JsonPropTypes, type IJsonConverter } from "@peculiar/json-schema";

// Custom data converter
const JsonBase64UrlConverter: IJsonConverter<Uint8Array, string> = {
  fromJSON: (value: string) => base64UrlToBuffer(value),
  toJSON: (value: Uint8Array) => bufferToBase64Url(value),
};

class EcPublicKey {
  @JsonProp({ name: "kty" })
  keyType = "EC";

  @JsonProp({ name: "crv" })
  namedCurve = "";

  @JsonProp({ converter: JsonBase64UrlConverter })
  x = new Uint8Array(0);

  @JsonProp({ converter: JsonBase64UrlConverter })
  y = new Uint8Array(0);

  @JsonProp({ name: "ext", type: JsonPropTypes.Boolean, optional: true })
  extractable = false;

  @JsonProp({ name: "key_ops", type: JsonPropTypes.String, repeated: true, optional: true })
  usages: string[] = [];
}

const json = `{
  "kty": "EC",
  "crv": "P-256",
  "x": "zCQ5BPHPCLZYgdpo1n-x_90P2Ij52d53YVwTh3ZdiMo",
  "y": "pDfQTUx0-OiZc5ZuKMcA7v2Q7ZPKsQwzB58bft0JTko",
  "ext": true
}`;

const ecPubKey = JsonParser.parse(json, { targetSchema: EcPublicKey });
console.log(ecPubKey);

ecPubKey.usages.push("verify");

const jsonText = JsonSerializer.serialize(ecPubKey, undefined, undefined, 2);
console.log(jsonText);

// Output
//
// EcPublicKey {keyType: "EC", namedCurve: "P-256", x: Uint8Array(32), y: Uint8Array(32), extractable: true, …}
//
// {
//   "kty": "EC",
//   "crv": "P-256",
//   "x": "zCQ5BPHPCLZYgdpo1n-x_90P2Ij52d53YVwTh3ZdiMo",
//   "y": "pDfQTUx0-OiZc5ZuKMcA7v2Q7ZPKsQwzB58bft0JTko",
//   "ext": true,
//   "key_ops": [
//     "verify"
//   ]
// }
```

`base64UrlToBuffer` and `bufferToBase64Url` stand for any base64url helpers, such as `Buffer.from(value, "base64url")` in Node.js.

### Extending a schema

```ts
import { JsonParser, JsonSerializer, JsonProp } from "@peculiar/json-schema";

class BaseObject {
  @JsonProp({ name: "i" })
  public id = 0;
}

class Word extends BaseObject {
  @JsonProp({ name: "t" })
  public text = "";
}

class Person extends BaseObject {
  @JsonProp({ name: "n" })
  public name = "";

  @JsonProp({ name: "w", repeated: true, type: Word })
  public words: Word[] = [];
}

const json = `{
  "i": 1,
  "n": "Bob",
  "w": [
    { "i": 2, "t": "hello" },
    { "i": 3, "t": "world" }
  ]
}`;

const person = JsonParser.parse(json, { targetSchema: Person });
console.log(person);

const word = new Word();
word.id = 4;
word.text = "!!!";
person.words.push(word);

const jsonText = JsonSerializer.serialize(person, undefined, undefined, 2);
console.log(jsonText);

// Output
//
// Person {id: 1, name: "Bob", words: [Word {id: 2, text: "hello"}, Word {id: 3, text: "world"}]}
//
// {
//   "i": 1,
//   "n": "Bob",
//   "w": [
//     {
//       "i": 2,
//       "t": "hello"
//     },
//     {
//       "i": 3,
//       "t": "world"
//     },
//     {
//       "i": 4,
//       "t": "!!!"
//     }
//   ]
// }
```

## API

See the type declarations in [`src/index.ts`](src/index.ts) (published as `build/index.d.ts`).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, commit conventions and the release flow.
