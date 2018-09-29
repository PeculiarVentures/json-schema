import { isConvertible } from "./helper";
import { JsonPropTypes } from "./prop_types";
import { IJsonSchema, IJsonSchemaItem } from "./schema";
import { schemaStorage } from "./storage";

export type IJsonPropOptions = Partial<IJsonSchemaItem>;

export const JsonProp = (options: IJsonPropOptions = {}) => (target: object, propertyKey: string) => {
  const errorMessage = `Cannot set type for ${propertyKey} property of ${target.constructor.name} schema`;
  let schema: IJsonSchema;
  if (!schemaStorage.has(target.constructor)) {
    schema = schemaStorage.create(target.constructor);
    schemaStorage.set(target.constructor, schema);
  } else {
    schema = schemaStorage.get(target.constructor);
  }
  const copyOptions = Object.assign({ type: JsonPropTypes.Any }, options) as IJsonSchemaItem;

  if (typeof copyOptions.type !== "number") {
    // CONSTRUCTED
    if (!schemaStorage.has(copyOptions.type) && !isConvertible(copyOptions.type)) {
      throw new Error(`${errorMessage}. Assigning type doesn't have schema.`);
    }
  }

  schema.items[propertyKey] = copyOptions;
};
