import * as assert from "assert";
import { JsonProp } from "../src/decorators";
import { DEFAULT_SCHEMA, schemaStorage } from "../src/storage";

context("Schema", () => {
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
    assert.equal(Object.keys(parentSchema.names[DEFAULT_SCHEMA]).length, 1);
    assert.equal(Object.keys(childSchema.names[DEFAULT_SCHEMA]).length, 2);
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
    assert.equal(Object.keys(parentSchema.names[DEFAULT_SCHEMA]).length, 1);
    assert.equal(Object.keys(childSchema.names[DEFAULT_SCHEMA]).length, 1);
    assert.equal(childSchema, parentSchema);
  });
  it("throw error on a non-existent schema", () => {
    class Parent {
      public value = 1;
    }
    assert.throws(() => {
      schemaStorage.get(Parent);
    });
  });
});
