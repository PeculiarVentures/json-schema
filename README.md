# JSON-SCHEMA

Implements ES2015 [decorators](https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841) to simplify JSON schema creation. The decorators can be used for both serialization or parsing of JSON greatly simplify working with JSON.


## Introduction

JSON (JavaScript Object Notation) is a lightweight data-interchange format. It is easy for humans to read and write.


## Installation

Installation is handled via  `npm`:

```
$ npm install json-schema
```

## Examples
Node.js:

```js
var {JsonParser, JsonSerializer, JsonProp, JsonPropTypes} = require("json-schema");

// custom data converter
const JsonBase64Urlonverter: IJsonConverter<Uint8Array, string> = {
  parse: (value: string) => base64UrlToBuffer(value),
  serialize: (value: Uint8Array) => bufferToBase64Url(value),
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

const ecPubKey = JsonParser.parse(json, EcPublicKey);
console.log(ecPubKey);

ecPubKey.usages.push("verify");

const jsonText = JsonSerializer.serialize(ecPubKey, undefined, 2);
console.log(jsonText);

// Output
//
// EcPublicKey {keyType: "EC", namedCurve: "P-256", x: Uint8Array(32), y: Uint8Array(32), extractable: true, …}
// index.ts:59
// {
// index.ts:64
//   "kty": "EC",
//   "crv": "P-256",
//   "x": "zCQ5BPHPCLZYgdpo1n+x/90P2Ij52d53YVwTh3ZdiMo=",
//   "y": "pDfQTUx0+OiZc5ZuKMcA7v2Q7ZPKsQwzB58bft0JTko=",
//   "ext": true,
//   "key_ops": [
//     "verify"
//   ]
// }
```

Schema extending
```js
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
  public name = 0;
  @JsonProp({ name: "w", repeated: true, type: Word })
  public words = [];
}

const json = `{
  "i":1,
  "n":"Bob",
  "w":[
    {"i":2,"t":"hello"},
    {"i":3,"t":"world"}
  ]
}`;

const person = JsonParser.parse(json, Person);
console.log(person);

const word = new Word();
word.id = 4;
word.text = "!!!";

const jsonText = JsonSerializer.serialize(person, undefined, 2);
console.log(jsonText);

// Output
//
// Person {id: 1, name: "Bob", words: [Word {id: 2, text: "hello"}, Word {id: 3, text: "world"}]}
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

Use [index.d.ts](index.d.ts) file
