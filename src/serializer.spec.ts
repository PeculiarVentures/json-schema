import { describe, expect, it } from "vitest";
import { JsonProp } from "./decorators";
import { JsonPropTypes } from "./prop_types";
import { JsonSerializer } from "./serializer";
import { DEFAULT_SCHEMA, schemaStorage } from "./storage";
import { IJsonConverter, IJsonConvertible } from "./types";

const CustomNumberConverter: IJsonConverter<number, string> = {
  fromJSON: (value: string) => parseInt(value, 10),
  toJSON: (value: number) => value.toString(),
};

describe("JsonSerializer", () => {
  describe("primitives", () => {
    it("default schema", () => {
      class Test {
        @JsonProp()
        public value = 2;

        public odd = 1;
      }

      const schema = schemaStorage.get(Test);
      expect(schema.names[DEFAULT_SCHEMA].value.type).toBe(JsonPropTypes.Any);

      const json = JsonSerializer.serialize(new Test());
      expect(json).toBe(`{"value":2}`);
    });
    it("number", () => {
      class Test {
        @JsonProp({ type: JsonPropTypes.Number })
        public value = 2;

        public odd = 1;
      }

      const schema = schemaStorage.get(Test);
      expect(schema.names[DEFAULT_SCHEMA].value.type).toBe(JsonPropTypes.Number);

      const json = JsonSerializer.serialize(new Test());
      expect(json).toBe(`{"value":2}`);
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
      expect(json).toBe(`{"b":2}`);
    });
    it("custom name", () => {
      class Test {
        @JsonProp({ name: "v" })
        public value = 2;

        public odd = 1;
      }

      const json = JsonSerializer.serialize(new Test());
      expect(json).toBe(`{"v":2}`);
    });
    it("required", () => {
      class Test {
        @JsonProp({ name: "v" })
        public value?: number;

        public odd = 1;
      }

      expect(() => {
        JsonSerializer.serialize(new Test());
      }).toThrow();
    });
    it("optional", () => {
      class Test {
        @JsonProp({ name: "v", optional: true })
        public value?: number;

        public odd = 1;
      }

      const json = JsonSerializer.serialize(new Test());
      expect(json).toBe(`{}`);
    });

    describe("repeated", () => {
      it("simple", () => {
        class Test {
          @JsonProp({ name: "v", repeated: true })
          public values = [1, 2, 3];

          public odd = 1;
        }

        const json = JsonSerializer.serialize(new Test());
        expect(json).toBe(`{"v":[1,2,3]}`);
      });
      it("converter", () => {
        class Test {
          @JsonProp({ converter: CustomNumberConverter, name: "v", repeated: true })
          public values = [1, 2, 3];

          public odd = 1;
        }

        const json = JsonSerializer.serialize(new Test());
        expect(json).toBe(`{"v":["1","2","3"]}`);
      });
    });

    it("converter", () => {
      class Test {
        @JsonProp({ converter: CustomNumberConverter, name: "v" })
        public value = 2;
      }

      const json = JsonSerializer.serialize(new Test());
      expect(json).toBe(`{"v":"2"}`);
    });

    describe("validations", () => {
      describe("pattern", () => {
        class Test {
          @JsonProp({ pattern: "^[0-9]{6}$" })
          public text!: string;
        }

        it("correct value", () => {
          const test = new Test();
          test.text = "010203";

          const json = JsonSerializer.serialize(test);
          expect(json).toBe(`{"text":"010203"}`);
        });

        it("bad value", () => {
          const test = new Test();
          test.text = "0102";

          expect(() => {
            JsonSerializer.serialize(test);
          }).toThrow();
        });
      });
    });
  });

  describe("constructed", () => {
    it("don't throw error if type has toJSON/fromJSON methods", () => {
      // expect(() => {
      class Child implements IJsonConvertible {
        public value = 2;
        public fromJSON(_json: any): this {
          throw new Error("Method not implemented.");
        }
        public toJSON() {
          throw new Error("Method not implemented.");
        }
      }
      class _Test {
        @JsonProp({ type: Child })
        public child = new Child();
      }
      // }).not.toThrow();
    });
    it("throw error if type class doesn't have schema or toJSON/fromJSON methods", () => {
      expect(() => {
        class Child {
          public value = 2;
        }
        class _Test {
          @JsonProp({ type: Child })
          public child = new Child();
        }
      }).toThrow();
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
      expect(json).toBe(`{"child":{"value":2}}`);
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
        public children = [new Child(1), new Child(2), new Child(3)];

        public odd = 1;
      }

      const json = JsonSerializer.serialize(new Test());
      expect(json).toBe(`{"children":[{"v":1},{"v":2},{"v":3}]}`);
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
      expect(value).toBe(`"test"`);
    });
  });
  it("primitive", () => {
    const json = JsonSerializer.serialize(1);
    expect(json).toBe("1");
  });
  describe("object", () => {
    it("simple", () => {
      const json = JsonSerializer.serialize({ value: 1 });
      expect(json).toBe(`{"value":1}`);
    });
    it("schema is deep inside in object", () => {
      class Test {
        @JsonProp()
        public value = 2;
      }
      const json = JsonSerializer.serialize({ v: { v: new Test() } });
      expect(json).toBe(`{"v":{"v":{"value":2}}}`);
    });
  });
  it("extended type with additional props", () => {
    class Test {
      @JsonProp()
      public id = "1";
    }
    class Child extends Test {
      @JsonProp()
      public text = "some";
    }

    const json = JsonSerializer.serialize(new Child());
    expect(json).toBe(`{"id":"1","text":"some"}`);
  });
  describe("array", () => {
    it("primitives", () => {
      const json = JsonSerializer.serialize([1, 2, 3]);
      expect(json).toBe(`[1,2,3]`);
    });
    describe("constructed", () => {
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
        expect(json).toBe(`[{"value":"1"},{"value":"2"},{"value":"3"}]`);
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
        expect(json).toBe(`[{"createdAt":"1970-01-01T00:00:10.000Z","value":"1"},{"createdAt":"1970-01-01T00:00:10.000Z","value":"2"},{"createdAt":"1970-01-01T00:00:10.000Z","value":"3"}]`);
      });
    });
  });

  describe("serialize with target schema", () => {
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

      const json = JsonSerializer.serialize(
        {
          createdAt: new Date(10000),
          value: "text",
        },
        { targetSchema: Test },
      );

      expect(json).toBe(`{"createdAt":"1970-01-01T00:00:10.000Z","value":"text"}`);
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

      expect(() => {
        JsonSerializer.serialize(
          {
            createdAt: new Date(10000),
          },
          { targetSchema: Test },
        );
      }).toThrow();
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

      expect(() => {
        JsonSerializer.serialize(
          {
            createdAt: new Date(10000),
          },
          { targetSchema: Test },
        );
      }).toThrow();
    });
  });

  describe("schema name", () => {
    class Child {
      @JsonProp({ name: "name" })
      @JsonProp({ name: "n", schema: "short" })
      public name = "Name";
    }

    class Test {
      @JsonProp({ name: "value" })
      @JsonProp({ name: "v", schema: "short" })
      public value = "Value";

      @JsonProp({ name: "child", type: Child })
      @JsonProp({ name: "c", type: Child, schema: "short" })
      public child = new Child();

      @JsonProp({ name: "type" })
      // Don't print type for short schema
      public type = "Type";
    }

    it("default schema", () => {
      const test = new Test();

      const json = JsonSerializer.toJSON(test);
      expect(json).toEqual({
        value: "Value",
        child: {
          name: "Name",
        },
        type: "Type",
      });
    });

    it("custom schema", () => {
      const test = new Test();

      const json = JsonSerializer.toJSON(test, { schemaName: "short" });
      expect(json).toEqual({
        v: "Value",
        c: {
          n: "Name",
        },
        type: "Type",
      });
    });

    it("wrong schema name", () => {
      const test = new Test();

      const json = JsonSerializer.toJSON(test, { schemaName: "wrong" });
      // must use default schema
      expect(json).toEqual({
        value: "Value",
        child: {
          name: "Name",
        },
        type: "Type",
      });
    });
  });

  it("multi schema name", () => {
    class Test {
      @JsonProp({ type: JsonPropTypes.String, schema: "db" })
      public id!: string;

      @JsonProp({ type: JsonPropTypes.String, schema: ["db", "web"] })
      public value!: string;
    }

    const test = new Test();
    test.id = "12345";
    test.value = "Value";

    const dbJson = JsonSerializer.toJSON(test, { schemaName: "db" });
    expect(dbJson).toEqual({ id: "12345", value: "Value" });

    const webJson = JsonSerializer.toJSON(test, { schemaName: "web" });
    expect(webJson).toEqual({ value: "Value" });
  });
});
