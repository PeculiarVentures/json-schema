import * as assert from "assert";
import { JsonProp } from "../src/decorators";
import { JsonPropTypes } from "../src/prop_types";
import { JsonSerializer } from "../src/serializer";
import { schemaStorage } from "../src/storage";

const CustomNumberConverter: IJsonConverter<number, string> = {
  fromJSON: (value: string) => parseInt(value, 10),
  toJSON: (value: number) => value.toString(),
};

context("JsonSerializer", () => {

  context("primitives", () => {
    it("default schema", () => {
      class Test {
        @JsonProp()
        public value = 2;

        public odd = 1;
      }

      const schema = schemaStorage.get(Test);
      assert.equal(schema.items.value.type, JsonPropTypes.Any);

      const json = JsonSerializer.serialize(new Test());
      assert.equal(json, `{"value":2}`);
    });
    it("number", () => {
      class Test {
        @JsonProp({ type: JsonPropTypes.Number })
        public value = 2;

        public odd = 1;
      }

      const schema = schemaStorage.get(Test);
      assert.equal(schema.items.value.type, JsonPropTypes.Number);

      const json = JsonSerializer.serialize(new Test());
      assert.equal(json, `{"value":2}`);
    });
    it("default value", () => {
      class Test {
        @JsonProp({ defaultValue: 2, name: "a" })
        public value = 2;

        @JsonProp({ defaultValue: 1, name: "b" })
        public value2 = 2;

        public odd = 1;
      }

      const json = JsonSerializer.serialize(new Test());
      assert.equal(json, `{"b":2}`);
    });
    it("custom name", () => {
      class Test {
        @JsonProp({ name: "v" })
        public value = 2;

        public odd = 1;
      }

      const json = JsonSerializer.serialize(new Test());
      assert.equal(json, `{"v":2}`);
    });
    it("required", () => {
      class Test {
        @JsonProp({ name: "v" })
        public value?: number;

        public odd = 1;
      }

      assert.throws(() => {
        JsonSerializer.serialize(new Test());
      });
    });
    it("optional", () => {
      class Test {
        @JsonProp({ name: "v", optional: true })
        public value?: number;

        public odd = 1;
      }

      const json = JsonSerializer.serialize(new Test());
      assert.equal(json, `{}`);
    });

    context("repeated", () => {
      it("simple", () => {
        class Test {
          @JsonProp({ name: "v", repeated: true })
          public values = [1, 2, 3];

          public odd = 1;
        }

        const json = JsonSerializer.serialize(new Test());
        assert.equal(json, `{"v":[1,2,3]}`);
      });
      it("converter", () => {
        class Test {
          @JsonProp({ converter: CustomNumberConverter, name: "v", repeated: true })
          public values = [1, 2, 3];

          public odd = 1;
        }

        const json = JsonSerializer.serialize(new Test());
        assert.equal(json, `{"v":["1","2","3"]}`);
      });
    });

    it("converter", () => {
      class Test {
        @JsonProp({ converter: CustomNumberConverter, name: "v" })
        public value = 2;
      }

      const json = JsonSerializer.serialize(new Test());
      assert.equal(json, `{"v":"2"}`);
    });
  });

  context("constructed", () => {

    it("don't throw error if type has toJSON/fromJSON methods", () => {
      // assert.doesNotThrow(() => {
      class Child implements IJsonConvertible {
        public value = 2;
        public fromJSON(json: any): this {
          throw new Error("Method not implemented.");
        }
        public toJSON() {
          throw new Error("Method not implemented.");
        }
      }
      class Test {
        @JsonProp({ type: Child })
        public child = new Child();
      }
      // });
    });
    it("throw error if type class doesn't have schema or toJSON/fromJSON methods", () => {
      assert.throws(() => {
        class Child {
          public value = 2;
        }
        class Test {
          @JsonProp({ type: Child })
          public child = new Child();
        }
      });
    });
    it("simple", () => {
      class Child {
        @JsonProp()
        public value = 2;

        public odd = 1;
      }
      class Test {
        @JsonProp({ type: Child })
        public child = new Child();

        public odd = 1;
      }

      const json = JsonSerializer.serialize(new Test());
      assert.equal(json, `{"child":{"value":2}}`);
    });
    it("repeated", () => {
      class Child {
        @JsonProp({ name: "v" })
        public value = 0;

        public odd = 1;

        constructor(value?: number) {
          if (value !== undefined) {
            this.value = value;
          }
        }
      }
      class Test {
        @JsonProp({ type: Child, repeated: true })
        public children = [
          new Child(1),
          new Child(2),
          new Child(3),
        ];

        public odd = 1;
      }

      const json = JsonSerializer.serialize(new Test());
      assert.equal(json, `{"children":[{"v":1},{"v":2},{"v":3}]}`);
    });
    it("IJsonConvertible", () => {
      class Test implements IJsonConvertible<string> {
        public name = "test";

        public fromJSON(json: string): this {
          this.name = json;
          return this;
        }
        public toJSON(): string {
          return this.name;
        }
      }
      const value = JsonSerializer.serialize(new Test());
      assert.equal(value, `"test"`);
    });
  });
  it("primitive", () => {
    const json = JsonSerializer.serialize(1);
    assert.equal(json, "1");
  });
  context("object", () => {
    it("simple", () => {
      const json = JsonSerializer.serialize({ value: 1 });
      assert.equal(json, `{"value":1}`);
    });
    it("schema is deep inside in object", () => {
      class Test {
        @JsonProp()
        public value = 2;
      }
      const json = JsonSerializer.serialize({ v: { v: new Test() } });
      assert.equal(json, `{"v":{"v":{"value":2}}}`);
    });
  });
  context("array", () => {
    it("primitives", () => {
      const json = JsonSerializer.serialize([1, 2, 3]);
      assert.equal(json, `[1,2,3]`);
    });
    context("constructed", () => {
      it("simple constructed type", () => {
        class Test {
          @JsonProp()
          public value = "";

          constructor(param?: string) {
            if (param) {
              this.value = param;
            }
          }
        }
        const json = JsonSerializer.serialize([new Test("1"), new Test("2"), new Test("3")]);
        assert.equal(json, `[{"value":"1"},{"value":"2"},{"value":"3"}]`);
      });
      it("extended constructed type, child class doesn't have JsonProp", () => {
        const JsonDateConverter: IJsonConverter<Date, string> = {
          fromJSON: (value: string) => new Date(value),
          toJSON: (value: Date) => value.toISOString(),
        };

        class Test {
          @JsonProp({ converter: JsonDateConverter })
          public createdAt = new Date(10000);
          @JsonProp()
          public value = "";

          constructor(param?: string) {
            if (param) {
              this.value = param;
            }
          }
        }
        class Child extends Test {
          public text = "some";
        }

        const json = JsonSerializer.serialize([new Child("1"), new Child("2"), new Child("3")]);
        // tslint:disable-next-line:max-line-length
        assert.equal(json, `[{"createdAt":"1970-01-01T00:00:10.000Z","value":"1"},{"createdAt":"1970-01-01T00:00:10.000Z","value":"2"},{"createdAt":"1970-01-01T00:00:10.000Z","value":"3"}]`);
      });
    });
  });

  context("serialize with target schema", () => {
    it("simple", () => {
      const JsonDateConverter: IJsonConverter<Date, string> = {
        fromJSON: (value: string) => new Date(value),
        toJSON: (value: Date) => value.toISOString(),
      };

      class Test {
        @JsonProp({ converter: JsonDateConverter })
        public createdAt = new Date(10000);
        @JsonProp()
        public value = "";

        constructor(param?: string) {
          if (param) {
            this.value = param;
          }
        }
      }

      const json = JsonSerializer.serialize({
        createdAt: new Date(10000),
        value: "text",
      }, Test);

      assert.equal(json, `{"createdAt":"1970-01-01T00:00:10.000Z","value":"text"}`);
    });
    it("throw error on bad data", () => {
      const JsonDateConverter: IJsonConverter<Date, string> = {
        fromJSON: (value: string) => new Date(value),
        toJSON: (value: Date) => value.toISOString(),
      };

      class Test {
        @JsonProp({ converter: JsonDateConverter })
        public createdAt = new Date(10000);
        @JsonProp()
        public value = "";

        constructor(param?: string) {
          if (param) {
            this.value = param;
          }
        }
      }

      assert.throws(() => {
        JsonSerializer.serialize({
          createdAt: new Date(10000),
        }, Test);
      });
    });
    it("throw error for bad target schema", () => {
      class Test {
        public createdAt = new Date(10000);
        public value = "";

        constructor(param?: string) {
          if (param) {
            this.value = param;
          }
        }
      }

      assert.throws(() => {
        JsonSerializer.serialize({
          createdAt: new Date(10000),
        }, Test);
      });
    });
  });

});
