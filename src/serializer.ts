import { JsonError, SerializerError } from "./errors";
import { isConvertible } from "./helper";
import { DEFAULT_SCHEMA, schemaStorage } from "./storage";
import { JsonTransform } from "./transform";
import { IEmptyConstructor } from "./types";

export interface IJsonSerializerOptions {
  targetSchema?: IEmptyConstructor<any>;
  schemaName?: string;
}

export class JsonSerializer extends JsonTransform {
  // tslint:disable-next-line:max-line-length
  public static serialize(obj: any, options?: IJsonSerializerOptions, replacer?: (key: string, value: any) => any, space?: string | number): string {
    const json = this.toJSON(obj, options);
    return JSON.stringify(json, replacer, space);
  }
  public static toJSON(obj: any, options: IJsonSerializerOptions = {}): any {
    let res: any;
    let targetSchema = options.targetSchema;
    const schemaName = options.schemaName || DEFAULT_SCHEMA;

    if (isConvertible(obj)) {
      return obj.toJSON();
    }

    if (Array.isArray(obj)) {
      // ARRAY
      res = [];
      for (const item of obj) {
        res.push(this.toJSON(item, options));
      }
    } else if (typeof obj === "object") {
      // OBJECT
      if (targetSchema && !schemaStorage.has(targetSchema)) {
        throw new JsonError("Cannot get schema for `targetSchema` param");
      }

      targetSchema = (targetSchema || obj.constructor) as IEmptyConstructor<any>;
      if (schemaStorage.has(targetSchema)) {
        const schema = schemaStorage.get(targetSchema);
        res = {};

        const namedSchema = this.getSchemaByName(schema, schemaName);

        for (const key in namedSchema) {
          try {
            const item = namedSchema[key];
            const objItem = obj[key];
            let value: any;

            // DEFAULT VALUE || OPTIONAL
            if ((item.optional && objItem === undefined)
              || (item.defaultValue !== undefined && objItem === item.defaultValue)) {
              // skip value
              continue;
            }

            if (!item.optional && objItem === undefined) {
              // REQUIRED
              throw new SerializerError(targetSchema.name, `Property '${key}' is required.`);
            }

            if (typeof item.type === "number") {
              // PRIMITIVE
              if (item.converter) {
                // CONVERTER
                if (item.repeated) {
                  // REPEATED
                  value = objItem.map((el: any) => item.converter!.toJSON(el, obj));
                } else {
                  value = item.converter.toJSON(objItem, obj);
                }
              } else {
                value = objItem;
              }
            } else {
              // CONSTRUCTED
              if (item.repeated) {
                // REPEATED
                value = objItem.map((el: any) => this.toJSON(el, { schemaName }));
              } else {
                value = this.toJSON(objItem, { schemaName });
              }
            }

            this.checkTypes(value, item);
            this.checkValues(value, item);

            res[item.name || key] = value;
          } catch (e) {
            if (e instanceof SerializerError) {
              throw e;
            } else {
              throw new SerializerError(
                schema.target.name,
                `Property '${key}' is wrong. ${e.message}`,
                e);
            }
          }
        }
      } else {
        res = {};
        for (const key in obj) {
          res[key] = this.toJSON(obj[key], { schemaName });
        }
      }
    } else {
      // PRIMITIVE
      res = obj;
    }

    return res;
  }

}
