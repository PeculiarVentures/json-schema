interface IEmptyConstructor<T> {
  new(): T;
}

interface IJsonConverter<T, S> {
  parse(value: S, target: any): T;
  serialize(value: T, target: any): S;
}

interface IJsonConvertible<T = any> {
  fromJSON(json: T): this;
  toJSON(): T;
}
