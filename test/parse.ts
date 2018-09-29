import * as assert from "assert";
import { JsonProp } from "../src/decorators";
import { JsonParser } from "../src/parser";
import { JsonPropTypes } from "../src/prop_types";

const CustomNumberConverter: IJsonConverter<number, string> = {
  parse: (value: string) => parseInt(value, 10),
  serialize: (value: number) => value.toString(),
};

context("Parse", () => {

  context("primitives", () => {
    it("default schema", () => {
      class Test {
        @JsonProp()
        public value = 0;
      }

      const json = `{"value":2,"odd":1}`;
      const obj = JsonParser.parse(json, Test);
      assert.equal(obj.value, 2);
      assert.equal((obj as any).odd, undefined);
    });
    it("required", () => {
      class Test {
        @JsonProp()
        public value = 0;
      }

      const json = `{}`;
      assert.throws(() => {
        JsonParser.parse(json, Test);
      });
    });
    it("optional", () => {
      class Test {
        @JsonProp({ optional: true })
        public value = 0;
      }

      const json = `{}`;
      const obj = JsonParser.parse(json, Test);
      assert.equal(obj.value, 0);
    });
    it("converter", () => {
      class Test {
        @JsonProp({ converter: CustomNumberConverter })
        public value = 0;
      }

      const json = `{"value":"2"}`;
      const obj = JsonParser.parse(json, Test);
      assert.equal(obj.value, 2);
    });
    it("custom name", () => {
      class Test {
        @JsonProp({ name: "v" })
        public value = 0;
      }

      const json = `{"v":2}`;
      const obj = JsonParser.parse(json, Test);
      assert.equal(obj.value, 2);
    });
    context("repeated", () => {
      it("simple", () => {
        class Test {
          @JsonProp({ name: "v", repeated: true })
          public value: number[] = [];
        }

        const json = `{"v":[1,2,3]}`;
        const obj = JsonParser.parse(json, Test);
        assert.equal(obj.value.length, 3);
        assert.equal(obj.value[0], 1);
        assert.equal(obj.value[1], 2);
        assert.equal(obj.value[2], 3);
      });
      it("converter", () => {
        class Test {
          @JsonProp({ name: "v", repeated: true, converter: CustomNumberConverter })
          public value: number[] = [];
        }

        const json = `{"v":["1","2","3"]}`;
        const obj = JsonParser.parse(json, Test);
        assert.equal(obj.value.length, 3);
        assert.equal(obj.value[0], 1);
        assert.equal(obj.value[1], 2);
        assert.equal(obj.value[2], 3);
      });
    });
    context("check types", () => {
      context("boolean", () => {
        it("correct", () => {
          class Test {
            @JsonProp({ name: "v", type: JsonPropTypes.Boolean })
            public value = false;
          }

          const json = `{"v":true}`;
          const obj = JsonParser.parse(json, Test);
          assert.equal(obj.value, true);
        });
        it("wrong", () => {
          class Test {
            @JsonProp({ name: "v", type: JsonPropTypes.Boolean })
            public value = false;
          }

          const json = `{"v":1}`;
          assert.throws(() => {
            JsonParser.parse(json, Test);
          });
        });
      });
      context("number", () => {
        it("correct", () => {
          class Test {
            @JsonProp({ name: "v", type: JsonPropTypes.Number })
            public value = 0;
          }

          const json = `{"v":1}`;
          const obj = JsonParser.parse(json, Test);
          assert.equal(obj.value, 1);
        });
        it("wrong", () => {
          class Test {
            @JsonProp({ name: "v", type: JsonPropTypes.Number })
            public value = 0;
          }

          const json = `{"v":"1"}`;
          assert.throws(() => {
            JsonParser.parse(json, Test);
          });
        });
      });
      context("string", () => {
        it("correct", () => {
          class Test {
            @JsonProp({ name: "v", type: JsonPropTypes.String })
            public value = "";
          }

          const json = `{"v":"text"}`;
          const obj = JsonParser.parse(json, Test);
          assert.equal(obj.value, "text");
        });
        it("wrong", () => {
          class Test {
            @JsonProp({ name: "v", type: JsonPropTypes.String })
            public value = 0;
          }

          const json = `{"v":1}`;
          assert.throws(() => {
            JsonParser.parse(json, Test);
          });
        });
      });
    });
  });

  context("constructed", () => {
    it("simple", () => {
      class Child {
        @JsonProp()
        public value = 0;
      }
      class Parent {
        @JsonProp({ type: Child })
        public child = new Child();
      }

      const json = `{"child":{"value":2}}`;
      const obj = JsonParser.parse(json, Parent);
      assert.equal(obj.child.value, 2);
    });
    it("repeated", () => {
      class Child {
        @JsonProp({ name: "v" })
        public value = 0;
      }
      class Parent {
        @JsonProp({ type: Child, repeated: true })
        public children: Child[] = [];
      }

      const json = `{"children":[{"v":1},{"v":2}]}`;
      const obj = JsonParser.parse(json, Parent);
      assert.equal(obj.children.length, 2);
      assert.equal(obj.children[0].value, 1);
      assert.equal(obj.children[1].value, 2);
    });
    it("without schema and IJsonConvertible", () => {
      class Test implements IJsonConvertible<string> {
        public name = "";

        public fromJSON(json: string): this {
          this.name = json;
          return this;
        }
        public toJSON(): string {
          return this.name;
        }
      }
      const test = JsonParser.parse(`"test"`, Test);
      assert.equal(test.name, "test");
    });
  });

});
