import { isConvertible } from "./helper";
import { schemaStorage } from "./storage";

export class JsonSerializer {
  public static serialize(obj: any, replacer?: (key: string, value: any) => any, space?: string | number): string {
    const json = this.toJSON(obj);
    return JSON.stringify(json, replacer, space);
  }
  public static toJSON(obj: any): any {
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
      if (schemaStorage.has(obj.constructor)) {
        const schema = schemaStorage.get(obj.constructor);
        res = {};

        for (const key in schema.items) {
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
            throw new Error(`Property '${key}' is required in '${obj.constructor.name}' schema`);
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

          res[item.name || key] = value;
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
