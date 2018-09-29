/// <reference path="./types.d.ts" />

import { checkType, isConvertible } from "./helper";
import { JsonPropTypes } from "./prop_types";
import { schemaStorage } from "./storage";

export class JsonParser {
  public static parse<T>(data: string, schema: IEmptyConstructor<T>): T {
    const obj = JSON.parse(data);
    return this.fromJSON(obj, schema);
  }

  public static fromJSON<T>(target: any, targetSchema: IEmptyConstructor<T>): T {
    const obj = new targetSchema() as any;

    if (isConvertible(obj)) {
      return obj.fromJSON(target) as any;
    }

    const schema = schemaStorage.get(targetSchema);

    for (const key in schema.items) {
      const item = schema.items[key];
      const name = item.name || key;
      const value = target[name];

      if (value === undefined && (item.optional || item.defaultValue !== undefined)) {
        // OPTIONAL
        continue;
      }

      if (!item.optional && value === undefined) {
        throw new Error(`Cannot get required property '${name}' for JSON schema '${targetSchema.name}'`);
      }

      if (typeof (item.type) === "number") {
        // PRIMITIVE
        if (item.converter) {
          if (item.repeated) {
            // REPEATED
            obj[key] = value.map((el: any) => item.converter!.parse(el, obj));
          } else {
            obj[key] = item.converter.parse(value, obj);
          }
        } else {
          if (!item.repeated && !checkType(value, item.type)) {
            // check types for single values only
            throw new Error(`'${name}' property must be ${JsonPropTypes[item.type]} for schema '${targetSchema.name}'`);
          }
          obj[key] = value;
        }
      } else {
        // CONSTRUCTED
        if (item.repeated) {
          // REPEATED
          obj[key] = value.map((el: any) => this.fromJSON(el, item.type as IEmptyConstructor<any>));
        } else {
          obj[key] = this.fromJSON(value, item.type);
        }
      }
    }

    return obj;
  }
}
