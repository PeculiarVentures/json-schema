import { JsonError, SerializerError } from "./errors";
import { isConvertible, throwIfTypeIsWrong } from "./helper";
import { JsonPropTypes } from "./prop_types";
import { schemaStorage } from "./storage";
import { JsonTransform } from "./transform";

export class JsonSerializer extends JsonTransform {
  // tslint:disable-next-line:max-line-length
  public static serialize(obj: any, targetSchema?: IEmptyConstructor<any> | null, replacer?: (key: string, value: any) => any, space?: string | number): string {
    const json = this.toJSON(obj, targetSchema || undefined);
    return JSON.stringify(json, replacer, space);
  }
  public static toJSON(obj: any, targetSchema?: IEmptyConstructor<any>): any {
    let res: any;

    if (isConvertible(obj)) {
      return obj.toJSON();
    }

    if (Array.isArray(obj)) {
      // ARRAY
      res = [];
      for (const item of obj) {
        res.push(this.toJSON(item));
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

        for (const key in schema.items) {
          try {
            const item = schema.items[key];
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
                value = objItem.map((el: any) => this.toJSON(el));
              } else {
                value = this.toJSON(objItem);
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
          res[key] = this.toJSON(obj[key]);
        }
      }
    } else {
      // PRIMITIVE
      res = obj;
    }

    return res;
  }

}
