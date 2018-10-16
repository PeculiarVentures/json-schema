/// <reference path="./types.d.ts" />

import { JsonPropTypes } from "./prop_types";

export interface IJsonSchemaItem {
  type: JsonPropTypes | IEmptyConstructor<any>;
  optional?: boolean;
  defaultValue?: any;
  converter?: IJsonConverter<any, any>;
  repeated?: boolean;
  name?: string;
}

export interface IJsonSchema {
  target: IEmptyConstructor<any>;
  items: { [key: string]: IJsonSchemaItem };
}

export class JsonSchemaStorage {
  protected items = new Map<object, IJsonSchema>();

  public has(target: object) {
    return this.items.has(target) || !!this.findParentSchema(target);
  }

  public get(target: object) {
    const schema = this.items.get(target) || this.findParentSchema(target);
    if (!schema) {
      throw new Error("Cannot get schema for current target");
    }
    return schema;
  }

  public create(target: object) {
    // Initialize default JSON schema
    const schema = { items: {}, target } as IJsonSchema;

    // Get and assign schema from parent
    const parentSchema = this.findParentSchema(target);
    if (parentSchema) {
      Object.assign(schema, parentSchema);
      schema.items = Object.assign({}, schema.items, parentSchema.items);
    }

    return schema;
  }

  public set(target: object, schema: IJsonSchema) {
    this.items.set(target, schema);
    return this;
  }

  protected findParentSchema(target: object): IJsonSchema | null {
    const parent = (target as any).__proto__;
    if (parent) {
      const schema = this.items.get(parent);
      return schema || this.findParentSchema(parent);
    }
    return null;
  }

}
