declare namespace JsonSchema {

  interface IEmptyConstructor<T> {
    new(): T;
  }

  interface IJsonConverter<T, S> {
    fromJSON(value: S, target: any): T;
    toJSON(value: T, target: any): S;
  }

  interface IJsonConvertible<T = any> {
    fromJSON(json: T): this;
    toJSON(): T;
  }

  enum JsonPropTypes {
    Any,
    Boolean,
    Number,
    String,
  }

  interface IJsonPropOptions {
    type?: JsonPropTypes | IEmptyConstructor<any>;
    optional?: boolean;
    defaultValue?: any;
    converter?: IJsonConverter<any, any>;
    repeated?: boolean;
    name?: string;
    /**
     * Defines name of schema
     */
    schema?: string;
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

  const JsonProp: (options?: IJsonPropOptions) => PropertyDecorator;

  class JsonSerializer {
    public static serialize(
      obj: any,
      targetSchema?: IEmptyConstructor<any> | null,
      replacer?: (key: string, value: any) => any,
      space?: string | number,
    ): string;
    public static toJSON(obj: any, targetSchema?: IEmptyConstructor<any> | null): any;
  }

  class JsonParser {
    public static parse<T>(data: string, schema: IEmptyConstructor<T>): T;
    public static fromJSON<T>(target: any, targetSchema: IEmptyConstructor<T>): T;
  }
}

export = JsonSchema;
