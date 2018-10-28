import { isConvertible } from "./helper";
import { JsonPropTypes } from "./prop_types";
import { IJsonSchema, IJsonSchemaItem } from "./schema";
import { schemaStorage } from "./storage";
import { PatternValidation } from "./validations/pattern";

export interface IJsonPropOptions {
  type?: JsonPropTypes | IEmptyConstructor<any>;
  optional?: boolean;
  defaultValue?: any;
  converter?: IJsonConverter<any, any>;
  repeated?: boolean;
  name?: string;
  pattern?: string | RegExp;
}

function getValidations(item: IJsonPropOptions) {
  const validations: IValidation[] = [];

  if (item.pattern) {
    validations.push(new PatternValidation(item.pattern));
  }

  return validations;
}

export const JsonProp = (options: IJsonPropOptions = {}) => (target: object, propertyKey: string) => {
  const errorMessage = `Cannot set type for ${propertyKey} property of ${target.constructor.name} schema`;
  let schema: IJsonSchema;
  if (!schemaStorage.has(target.constructor)) {
    schema = schemaStorage.create(target.constructor);
    schemaStorage.set(target.constructor, schema);
  } else {
    schema = schemaStorage.get(target.constructor);
    if (schema.target !== target.constructor) {
      schema = schemaStorage.create(target.constructor);
      schemaStorage.set(target.constructor, schema);
    }
  }

  const defaultSchema: IJsonSchemaItem = {
    type: JsonPropTypes.Any,
    validations: getValidations(options),
  };
  const copyOptions = Object.assign(defaultSchema, options) as IJsonSchemaItem;

  if (typeof copyOptions.type !== "number") {
    // CONSTRUCTED
    if (!schemaStorage.has(copyOptions.type) && !isConvertible(copyOptions.type)) {
      throw new Error(`${errorMessage}. Assigning type doesn't have schema.`);
    }
  }

  schema.items[propertyKey] = copyOptions;
};
