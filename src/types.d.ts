type IEmptyConstructor<T> = new() => T;

interface IJsonConverter<T, S> {
  fromJSON(value: S, target: any): T;
  toJSON(value: T, target: any): S;
}

interface IJsonConvertible<T = any> {
  fromJSON(json: T): this;
  toJSON(): T;
}

interface IValidation {
  validate(value: any): void;
}
