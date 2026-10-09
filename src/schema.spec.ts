import { describe, expect, it } from "vitest";
import { JsonProp } from "./decorators";
import { DEFAULT_SCHEMA, schemaStorage } from "./storage";

describe("Schema", () => {
  it("extending", () => {
    class Parent {
      @JsonProp()
      public value = 1;
    }
    class Child extends Parent {
      @JsonProp()
      public name = "";
    }
    const parentSchema = schemaStorage.get(Parent);
    const childSchema = schemaStorage.get(Child);
    expect(Object.keys(parentSchema.names[DEFAULT_SCHEMA]).length).toBe(1);
    expect(Object.keys(childSchema.names[DEFAULT_SCHEMA]).length).toBe(2);
  });
  it("child element without @JsonProp", () => {
    class Parent {
      @JsonProp()
      public value = 1;
    }
    class Child extends Parent {
      public name = "";
    }
    const parentSchema = schemaStorage.get(Parent);
    const childSchema = schemaStorage.get(Child);
    expect(Object.keys(parentSchema.names[DEFAULT_SCHEMA]).length).toBe(1);
    expect(Object.keys(childSchema.names[DEFAULT_SCHEMA]).length).toBe(1);
    expect(childSchema).toBe(parentSchema);
  });
  it("throw error on a non-existent schema", () => {
    class Parent {
      public value = 1;
    }
    expect(() => {
      schemaStorage.get(Parent);
    }).toThrow();
  });
});
