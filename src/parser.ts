/// <reference path="./types.d.ts" />

import { ParserError } from "./errors";
import { isConvertible } from "./helper";
import { DEFAULT_SCHEMA, schemaStorage } from "./storage";
import { JsonTransform } from "./transform";

export interface IJsonParserOptions<T> {
  targetSchema: IEmptyConstructor<T>;
  schemaName?: string;
}

export class JsonParser extends JsonTransform {
  public static parse<T>(data: string, options: IJsonParserOptions<T>): T {
    const obj = JSON.parse(data);
    return this.fromJSON(obj, options);
  }

  public static fromJSON<T>(target: any, options: IJsonParserOptions<T>): T {
    const targetSchema = options.targetSchema;
    const schemaName = options.schemaName || DEFAULT_SCHEMA;

    const obj = new targetSchema() as any;

    if (isConvertible(obj)) {
      return obj.fromJSON(target) as any;
    }

    const schema = schemaStorage.get(targetSchema);
    const namedSchema = this.getSchemaByName(schema, schemaName);

    for (const key in namedSchema) {
      try {
        const item = namedSchema[key];
        const name = item.name || key;
        const value = target[name];

        if (value === undefined && (item.optional || item.defaultValue !== undefined)) {
          // OPTIONAL
          continue;
        }

        if (!item.optional && value === undefined) {
          throw new ParserError(targetSchema.name, `Property '${name}' is required.`);
        }

        this.checkTypes(value, item);
        this.checkValues(value, item);

        if (typeof (item.type) === "number") {
          // PRIMITIVE
          if (item.converter) {
            if (item.repeated) {
              // REPEATED
              obj[key] = value.map((el: any) => item.converter!.fromJSON(el, obj));
            } else {
              obj[key] = item.converter.fromJSON(value, obj);
            }
          } else {
            obj[key] = value;
          }
        } else {
          // CONSTRUCTED
          if (item.repeated) {
            // REPEATED
            obj[key] = value.map((el: any) => this.fromJSON(el, {
              targetSchema: item.type as IEmptyConstructor<any>,
              schemaName,
            }));
          } else {
            obj[key] = this.fromJSON(value, {
              targetSchema: item.type,
              schemaName,
            });
          }
        }
      } catch (e) {
        if (e instanceof ParserError) {
          throw e;
        } else {
          throw new ParserError(
            schema.target.name,
            `Property '${key}' is wrong. ${e.message}`,
            e);
        }
      }
    }

    return obj;
  }

}
