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
