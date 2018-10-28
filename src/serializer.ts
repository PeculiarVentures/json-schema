import { isConvertible } from "./helper";
import { schemaStorage } from "./storage";

export class JsonSerializer {
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
        throw new Error("Cannot get schema for `targetSchema` param");
      }

      targetSchema = (targetSchema || obj.constructor) as IEmptyConstructor<any>;
      if (schemaStorage.has(targetSchema)) {
        const schema = schemaStorage.get(targetSchema);
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
            throw new Error(`Property '${key}' is required in '${targetSchema.name}' schema`);
          }

          if (typeof item.type === "number") {
            // PRIMITIVE
            if (item.converter) {
              // CONVERTER
              if (item.repeated) {
                // REPEATED
                value = objItem.map((el: any) => item.converter!.toJSON(el, obj));
                value.forEach((el: any) => item.validations.forEach((v) => v.validate(el)));
              } else {
                value = item.converter.toJSON(objItem, obj);
                item.validations.forEach((v) => v.validate(value));
              }
            } else {
              value = objItem;
              item.validations.forEach((v) => v.validate(value));
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
