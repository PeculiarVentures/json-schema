<h1 align="center">
  @peculiar/json-schema
</h1>

<div align="center">

![NPM License](https://img.shields.io/npm/l/@peculiar/json-schema)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/PeculiarVentures/json-schema/test.yml?label=test)
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

The package ships both ESM and CommonJS builds with TypeScript declarations, and requires Node.js 16 or later.

`@JsonProp` is a TypeScript legacy (experimental) decorator. Enable it in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

## Examples

### Creating a schema

```ts
import { JsonParser, JsonSerializer, JsonProp, JsonPropTypes, IJsonConverter } from "@peculiar/json-schema";

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
