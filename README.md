# JSON-SCHEMA

This package uses ES2015 [decorators](https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841) to simplify JSON [schema creation and use](https://json-schema.org/understanding-json-schema/index.html). 


## Introduction

JSON (JavaScript Object Notation) is a lightweight data-interchange format that was designed to be easy for humans to read and write but in practice, it is [minefield](http://seriot.ch/parsing_json.html) when it machines need to parse it.

While the use of schemas can help with this problem their use can be complicated. When using `JSON-SCHEMA` this is addressed by using decorators to make both serialization and parsing of XML possible via a simple class that handles the schemas for you.  

This is important because validating input data before its use is important to do because all input data is evil. Using a schema helps you handle this data [safely](https://www.whitehatsec.com/blog/handling-untrusted-json-safely/). 


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