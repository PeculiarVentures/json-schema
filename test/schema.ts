import * as assert from "assert";
import { JsonProp } from "../src/decorators";
import { schemaStorage } from "../src/storage";

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
    assert.equal(Object.keys(parentSchema.items).length, 1);
    assert.equal(Object.keys(childSchema.items).length, 2);
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
