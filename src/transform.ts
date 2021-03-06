import { throwIfTypeIsWrong } from "./helper";
import { IJsonSchema, IJsonSchemaItem } from "./schema";
import { DEFAULT_SCHEMA } from "./storage";
import { LengthValidation } from "./validations";

export interface IJsonNamedSchema {
  [key: string]: IJsonSchemaItem;
}

export class JsonTransform {

  protected static checkValues(data: any, schemaItem: IJsonSchemaItem) {
    const values = Array.isArray(data) ? data : [data];
    for (const value of values) {
      for (const validation of schemaItem.validations) {
        if (validation instanceof LengthValidation && schemaItem.repeated) {
          validation.validate(data);
        } else {
          validation.validate(value);
        }
      }
    }
  }

  protected static checkTypes(value: any, schemaItem: IJsonSchemaItem) {
    if (schemaItem.repeated && !Array.isArray(value)) {
      throw new TypeError("Value must be Array");
    }
    if (typeof schemaItem.type === "number") {
      const values = Array.isArray(value) ? value : [value];
      for (const v of values) {
        throwIfTypeIsWrong(v, schemaItem.type);
      }
    }
  }

  protected static getSchemaByName(schema: IJsonSchema, name: string = DEFAULT_SCHEMA): IJsonNamedSchema {
    return { ...schema.names[DEFAULT_SCHEMA], ...schema.names[name] };
  }

}
