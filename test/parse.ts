import * as assert from "assert";
import { JsonProp } from "../src/decorators";
import { ParserError } from "../src/errors";
import { JsonParser } from "../src/parser";
import { JsonPropTypes } from "../src/prop_types";

const CustomNumberConverter: IJsonConverter<number, string> = {
  fromJSON: (value: string) => parseInt(value, 10),
  toJSON: (value: number) => value.toString(),
};

context("Parse", () => {

  context("primitives", () => {
    it("default schema", () => {
      class Test {
        @JsonProp()
        public value = 0;
      }

      const json = `{"value":2,"odd":1}`;
      const obj = JsonParser.parse(json, {
        targetSchema: Test,
      });
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
        JsonParser.parse(json, {
          targetSchema: Test,
        });
      });
    });
    it("optional", () => {
      class Test {
        @JsonProp({ optional: true })
        public value = 0;
      }

      const json = `{}`;
      const obj = JsonParser.parse(json, {
        targetSchema: Test,
      });
      assert.equal(obj.value, 0);
    });
    it("converter", () => {
      class Test {
        @JsonProp({ converter: CustomNumberConverter })
        public value = 0;
      }

      const json = `{"value":"2"}`;
      const obj = JsonParser.parse(json, {
        targetSchema: Test,
      });
      assert.equal(obj.value, 2);
    });
    it("custom name", () => {
      class Test {
        @JsonProp({ name: "v" })
        public value = 0;
      }

      const json = `{"v":2}`;
      const obj = JsonParser.parse(json, {
        targetSchema: Test,
      });
      assert.equal(obj.value, 2);
    });
    context("repeated", () => {
      it("simple", () => {
        class Test {
          @JsonProp({ name: "v", repeated: true })
          public value: number[] = [];
        }

        const json = `{"v":[1,2,3]}`;
        const obj = JsonParser.parse(json, {
          targetSchema: Test,
        });
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
        const obj = JsonParser.parse(json, {
          targetSchema: Test,
        });
        assert.equal(obj.value.length, 3);
        assert.equal(obj.value[0], 1);
        assert.equal(obj.value[1], 2);
        assert.equal(obj.value[2], 3);
      });
      it("throw error if property is not Array", () => {
        class Test {
          @JsonProp({
            repeated: true,
            type: JsonPropTypes.String,
          })
          public values: string[] = [];
        }

        assert.throws(() => {
          JsonParser.fromJSON({
            values: "not Array",
          }, {
              targetSchema: Test,
            });
        });
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
          const obj = JsonParser.parse(json, {
            targetSchema: Test,
          });
          assert.equal(obj.value, true);
        });
        it("wrong", () => {
          class Test {
            @JsonProp({ name: "v", type: JsonPropTypes.Boolean })
            public value = false;
          }

          const json = `{"v":1}`;
          assert.throws(() => {
            JsonParser.parse(json, {
              targetSchema: Test,
            });
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
          const obj = JsonParser.parse(json, {
            targetSchema: Test,
          });
          assert.equal(obj.value, 1);
        });
        it("wrong", () => {
          class Test {
            @JsonProp({ name: "v", type: JsonPropTypes.Number })
            public value = 0;
          }

          const json = `{"v":"1"}`;
          assert.throws(() => {
            JsonParser.parse(json, {
              targetSchema: Test,
            });
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
          const obj = JsonParser.parse(json, {
            targetSchema: Test,
          });
          assert.equal(obj.value, "text");
        });
        it("wrong", () => {
          class Test {
            @JsonProp({ name: "v", type: JsonPropTypes.String })
            public value = 0;
          }

          const json = `{"v":1}`;
          assert.throws(() => {
            JsonParser.parse(json, {
              targetSchema: Test,
            });
          });
        });
      });
    });
    context("validations", () => {

      context("pattern", () => {

        context("RegExp type", () => {

          class Test {
            @JsonProp({ pattern: /[0-9]{6}/ })
            public text!: string;
          }

          it("matches", () => {
            const json = `{"text":"123456"}`;

            const test = JsonParser.parse(json, {
              targetSchema: Test,
            });
            assert.equal(test.text, test.text);
          });

          it("second checking", () => {
            const json = `{"text":"123456"}`;

            const test = JsonParser.parse(json, {
              targetSchema: Test,
            });
            assert.equal(test.text, test.text);
          });

          it("bad value", () => {
            const json = `{"text":"a23456"}`;

            assert.throws(() => {
              JsonParser.parse(json, {
                targetSchema: Test,
              });
            });
          });

          it("throw error if pattern is using for not string type", () => {
            const json = `{"text":123456}`;

            assert.throws(() => {
              JsonParser.parse(json, {
                targetSchema: Test,
              });
            });
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
      const obj = JsonParser.parse(json, {
        targetSchema: Parent,
      });
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
      const obj = JsonParser.parse(json, {
        targetSchema: Parent,
      });
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
      const test = JsonParser.parse(`"test"`, {
        targetSchema: Test,
      });
      assert.equal(test.name, "test");
    });
  });

  context("schema name", () => {

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

      @JsonProp({ name: "type", optional: true })
      // Don't print type for short schema
      public type = "Type";
    }

    it("default schema", () => {
      const json = {
        value: "Value_new",
        child: {
          name: "Name_new",
        },
        type: "Type_new",
      };
      const test = JsonParser.fromJSON(json, {
        targetSchema: Test,
      });
      assert.deepEqual(test, {
        value: "Value_new",
        child: {
          name: "Name_new",
        },
        type: "Type_new",
      });
    });

    it("custom schema", () => {
      const json = {
        v: "Value_new",
        c: {
          n: "Name_new",
        },
      };
      const test = JsonParser.fromJSON(json, {
        targetSchema: Test,
        schemaName: "short",
      });
      assert.deepEqual(test, {
        value: "Value_new",
        child: {
          name: "Name_new",
        },
        type: "Type",
      });
    });

    it("wrong schema name", () => {
      const json = {
        value: "Value_new",
        child: {
          name: "Name_new",
        },
        type: "Type_new",
      };
      const test = JsonParser.fromJSON(json, {
        targetSchema: Test,
        schemaName: "wrang",
      });
      assert.deepEqual(test, {
        value: "Value_new",
        child: {
          name: "Name_new",
        },
        type: "Type_new",
      });
    });

  });

  context("Strict checking", () => {

    context("strictProperty", () => {

      it("option is disabled by default", () => {
        class Test {
          @JsonProp()
          public value!: string;
        }

        assert.doesNotThrow(() => {
          JsonParser.fromJSON({ value: "hello", odd: 1 }, { targetSchema: Test });
        });
      });

      it("should throw error if JSON has od field and option is enabled", () => {
        class Test {
          @JsonProp()
          public value!: string;
        }

        assert.throws(() => {
          JsonParser.fromJSON({ value: "hello", odd: 1 }, { targetSchema: Test, strictProperty: true });
        }, ParserError);
      });

      it("use checking for array items", () => {
        class Test {
          @JsonProp()
          public value!: string;
        }

        class TestArray {
          @JsonProp({ type: Test, repeated: true })
          public items: Test[] = [];
        }

        assert.throws(() => {
          JsonParser.fromJSON(
            {
              items: [
                { value: "test1" },
                { value: "test2", odd: 1 },
              ],
            },
            {
              targetSchema: TestArray,
              strictProperty: true,
            },
          );
        }, ParserError);
      });

    });

  });

});
