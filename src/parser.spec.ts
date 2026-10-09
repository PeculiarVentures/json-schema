import { describe, expect, it } from "vitest";
import { JsonProp } from "./decorators";
import { KeyError, ParserError } from "./errors";
import { JsonParser } from "./parser";
import { JsonPropTypes } from "./prop_types";
import { IJsonConverter, IJsonConvertible } from "./types";

const CustomNumberConverter: IJsonConverter<number, string> = {
  fromJSON: (value: string) => parseInt(value, 10),
  toJSON: (value: number) => value.toString(),
};

describe("Parse", () => {
  describe("primitives", () => {
    it("default schema", () => {
      class Test {
        @JsonProp()
        public value = 0;
      }

      const json = `{"value":2,"odd":1}`;
      const obj = JsonParser.parse(json, {
        targetSchema: Test,
      });
      expect(obj.value).toBe(2);
      expect((obj as any).odd).toBe(undefined);
    });
    it("required", () => {
      class Test {
        @JsonProp()
        public value = 0;
      }

      const json = `{}`;
      expect(() => {
        JsonParser.parse(json, {
          targetSchema: Test,
        });
      }).toThrow();
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
      expect(obj.value).toBe(0);
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
      expect(obj.value).toBe(2);
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
      expect(obj.value).toBe(2);
    });
    describe("repeated", () => {
      it("simple", () => {
        class Test {
          @JsonProp({ name: "v", repeated: true })
          public value: number[] = [];
        }

        const json = `{"v":[1,2,3]}`;
        const obj = JsonParser.parse(json, {
          targetSchema: Test,
        });
        expect(obj.value.length).toBe(3);
        expect(obj.value[0]).toBe(1);
        expect(obj.value[1]).toBe(2);
        expect(obj.value[2]).toBe(3);
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
        expect(obj.value.length).toBe(3);
        expect(obj.value[0]).toBe(1);
        expect(obj.value[1]).toBe(2);
        expect(obj.value[2]).toBe(3);
      });
      it("throw error if property is not Array", () => {
        class Test {
          @JsonProp({
            repeated: true,
            type: JsonPropTypes.String,
          })
          public values: string[] = [];
        }

        expect(() => {
          JsonParser.fromJSON(
            {
              values: "not Array",
            },
            {
              targetSchema: Test,
            },
          );
        }).toThrow();
      });
    });
    describe("check types", () => {
      describe("boolean", () => {
        it("correct", () => {
          class Test {
            @JsonProp({ name: "v", type: JsonPropTypes.Boolean })
            public value = false;
          }

          const json = `{"v":true}`;
          const obj = JsonParser.parse(json, {
            targetSchema: Test,
          });
          expect(obj.value).toBe(true);
        });
        it("wrong", () => {
          class Test {
            @JsonProp({ name: "v", type: JsonPropTypes.Boolean })
            public value = false;
          }

          const json = `{"v":1}`;
          expect(() => {
            JsonParser.parse(json, {
              targetSchema: Test,
            });
          }).toThrow();
        });
      });
      describe("number", () => {
        it("correct", () => {
          class Test {
            @JsonProp({ name: "v", type: JsonPropTypes.Number })
            public value = 0;
          }

          const json = `{"v":1}`;
          const obj = JsonParser.parse(json, {
            targetSchema: Test,
          });
          expect(obj.value).toBe(1);
        });
        it("wrong", () => {
          class Test {
            @JsonProp({ name: "v", type: JsonPropTypes.Number })
            public value = 0;
          }

          const json = `{"v":"1"}`;
          expect(() => {
            JsonParser.parse(json, {
              targetSchema: Test,
            });
          }).toThrow();
        });
      });
      describe("string", () => {
        it("correct", () => {
          class Test {
            @JsonProp({ name: "v", type: JsonPropTypes.String })
            public value = "";
          }

          const json = `{"v":"text"}`;
          const obj = JsonParser.parse(json, {
            targetSchema: Test,
          });
          expect(obj.value).toBe("text");
        });
        it("wrong", () => {
          class Test {
            @JsonProp({ name: "v", type: JsonPropTypes.String })
            public value = 0;
          }

          const json = `{"v":1}`;
          expect(() => {
            JsonParser.parse(json, {
              targetSchema: Test,
            });
          }).toThrow();
        });
      });
    });
    describe("validations", () => {
      describe("pattern", () => {
        describe("RegExp type", () => {
          class Test {
            @JsonProp({ pattern: /[0-9]{6}/ })
            public text!: string;
          }

          it("matches", () => {
            const json = `{"text":"123456"}`;

            const test = JsonParser.parse(json, {
              targetSchema: Test,
            });
            expect(test.text).toBe(test.text);
          });

          it("second checking", () => {
            const json = `{"text":"123456"}`;

            const test = JsonParser.parse(json, {
              targetSchema: Test,
            });
            expect(test.text).toBe(test.text);
          });

          it("bad value", () => {
            const json = `{"text":"a23456"}`;

            expect(() => {
              JsonParser.parse(json, {
                targetSchema: Test,
              });
            }).toThrow();
          });

          it("throw error if pattern is using for not string type", () => {
            const json = `{"text":123456}`;

            expect(() => {
              JsonParser.parse(json, {
                targetSchema: Test,
              });
            }).toThrow();
          });
        });
      });
    });
  });

  describe("constructed", () => {
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
      expect(obj.child.value).toBe(2);
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
      expect(obj.children.length).toBe(2);
      expect(obj.children[0].value).toBe(1);
      expect(obj.children[1].value).toBe(2);
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
      expect(test.name).toBe("test");
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
      expect(test).toEqual({
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
      expect(test).toEqual({
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
      expect(test).toEqual({
        value: "Value_new",
        child: {
          name: "Name_new",
        },
        type: "Type_new",
      });
    });
  });

  describe("Strict checking", () => {
    describe("strictProperty", () => {
      it("option is disabled by default", () => {
        class Test {
          @JsonProp()
          public value!: string;
        }

        expect(() => {
          JsonParser.fromJSON({ value: "hello", odd: 1 }, { targetSchema: Test });
        }).not.toThrow();
      });

      it("should throw error if JSON has od field and option is enabled", () => {
        class Test {
          @JsonProp()
          public value!: string;
        }

        expect(() => {
          JsonParser.fromJSON({ value: "hello", odd: 1 }, { targetSchema: Test, strictProperty: true });
        }).toThrow(ParserError);
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

        expect(() => {
          JsonParser.fromJSON(
            {
              items: [{ value: "test1" }, { value: "test2", odd: 1 }],
            },
            {
              targetSchema: TestArray,
              strictProperty: true,
            },
          );
        }).toThrow(ParserError);
      });
    });
  });

  describe("Check all keys", () => {
    it("Must add details about wrong keys to Error", () => {
      class Test {
        @JsonProp({ type: JsonPropTypes.String })
        public text!: string;
        @JsonProp({ type: JsonPropTypes.Number })
        public number!: number;
        @JsonProp({ type: JsonPropTypes.Boolean })
        public bool!: number;
      }

      const parse = () =>
        JsonParser.fromJSON(
          {
            text: "Test",
            bool: 10,
          },
          {
            targetSchema: Test,
            strictAllKeys: true,
          },
        );
      expect(parse).toThrow(KeyError);
      expect(parse).toThrow(expect.objectContaining({ keys: ["number", "bool"] }));
    });
  });

  it("multi schema name", () => {
    class Test {
      @JsonProp({ type: JsonPropTypes.String, schema: "db" })
      public id!: string;

      @JsonProp({ type: JsonPropTypes.String, schema: ["db", "web"] })
      public value!: string;
    }

    const json = { id: "12345", value: "Value" };

    const dbTest = JsonParser.fromJSON(json, { schemaName: "db", targetSchema: Test });
    expect(dbTest.value).toBe("Value");
    expect(dbTest.id).toBe("12345");

    const webTest = JsonParser.fromJSON(json, { schemaName: "web", targetSchema: Test });
    expect(webTest.value).toBe("Value");
    expect(webTest.id).toBe(undefined);
  });
});
