/// <reference path="./types.d.ts" />

import { JsonPropTypes } from "./prop_types";

export function checkType(value: any, type: JsonPropTypes) {
  switch (type) {
    case JsonPropTypes.Boolean:
      return typeof value === "boolean";
    case JsonPropTypes.Number:
      return typeof value === "number";
    case JsonPropTypes.String:
      return typeof value === "string";
  }
  return true;
}

export function throwIfTypeIsWrong(value: any, type: JsonPropTypes) {
  if (!checkType(value, type)) {
    throw new TypeError(`Value must be ${JsonPropTypes[type]}`);
  }
}

export function isConvertible(target: any): target is IJsonConvertible {
  if (target && target.prototype) {
    if (target.prototype.toJSON && target.prototype.fromJSON) {
      return true;
    } else {
      return isConvertible(target.prototype);
    }
  } else {
    return !!(target && target.toJSON && target.fromJSON);
  }
}
