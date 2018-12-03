import { isConvertible } from "./helper";
import { JsonPropTypes } from "./prop_types";
import { IJsonSchema, IJsonSchemaItem } from "./schema";
import { schemaStorage } from "./storage";
import { EnumerationValidation, ExclusiveValidation, InclusiveValidation, LengthValidation } from "./validations";
import { PatternValidation } from "./validations/pattern";

export interface IJsonPropOptions {
  type?: JsonPropTypes | IEmptyConstructor<any>;
  optional?: boolean;
  defaultValue?: any;
  converter?: IJsonConverter<any, any>;
  repeated?: boolean;
  name?: string;

  // string
  /**
   * Defines regular expression for text
   */
  pattern?: string | RegExp;
  /**
   * Defines a list of acceptable values
   */
  enumeration?: string[];
  /**
   * Specifies the exact number of characters or list items allowed. Must be equal to or greater than zero
   */
  length?: number;
  /**
   * Specifies the minimum number of characters or list items allowed. Must be equal to or greater than zero
   */
  minLength?: number;
  /**
   * Specifies the maximum number of characters or list items allowed. Must be equal to or greater than zero
   */
  maxLength?: number;

  // number
  /**
   * Specifies the lower bounds for numeric values (the value must be greater than or equal to this value)
   */
  minInclusive?: number;
  /**
   * Specifies the upper bounds for numeric values (the value must be less than or equal to this value)
   */
  maxInclusive?: number;
  /**
   * Specifies the lower bounds for numeric values (the value must be greater than this value)
   */
  minExclusive?: number;
  /**
   * Specifies the upper bounds for numeric values (the value must be less than this value)
   */
  maxExclusive?: number;
}

function getValidations(item: IJsonPropOptions) {
  const validations: IValidation[] = [];

  if (item.pattern) {
    validations.push(new PatternValidation(item.pattern));
  }

  if (item.type === JsonPropTypes.Number || item.type === JsonPropTypes.Any) {
    if (item.minInclusive !== undefined || item.maxInclusive !== undefined) {
      validations.push(new InclusiveValidation(item.minInclusive, item.maxInclusive));
    }
    if (item.minExclusive !== undefined || item.maxExclusive !== undefined) {
      validations.push(new ExclusiveValidation(item.minExclusive, item.maxExclusive));
    }
    if (item.enumeration !== undefined) {
      validations.push(new EnumerationValidation(item.enumeration));
    }
  }

  if (item.type === JsonPropTypes.String || item.repeated || item.type === JsonPropTypes.Any) {
    if (item.length !== undefined || item.minLength !== undefined || item.maxLength !== undefined) {
      validations.push(new LengthValidation(item.length, item.minLength, item.maxLength));
    }
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
    validations: [],
  };
  const copyOptions = Object.assign(defaultSchema, options) as IJsonSchemaItem;
  copyOptions.validations = getValidations(copyOptions);

  if (typeof copyOptions.type !== "number") {
    // CONSTRUCTED
    if (!schemaStorage.has(copyOptions.type) && !isConvertible(copyOptions.type)) {
      throw new Error(`${errorMessage}. Assigning type doesn't have schema.`);
    }
  }

  schema.items[propertyKey] = copyOptions;
};
