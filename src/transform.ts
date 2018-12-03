/// <reference path="./types.d.ts" />

import { throwIfTypeIsWrong } from "./helper";
import { IJsonSchemaItem } from "./schema";
import { LengthValidation } from "./validations";

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

}
