import * as assert from "assert";
import { JsonParser, JsonProp, JsonSerializer, JsonPropTypes } from "../src";

function testValidationSuccess(obj: any, json: string) {
  const json2 = JsonSerializer.serialize(obj);
  assert.equal(json2, json);

  const obj2 = JsonParser.parse(json, obj.constructor);
  assert.deepEqual(obj2, obj);
}

function testValidationWrong(obj: any, json: string) {
  assert.throws(() => {
    JsonSerializer.serialize(obj);
  });

  assert.throws(() => {
    JsonParser.parse(json, obj.constructor);
  });
}

context("Validations", () => {

  context("pattern", () => {

    class Test {
      @JsonProp({ pattern: /[0-9]{6}/ })
      public value!: string;

      constructor(value: string) {
        this.value = value;
      }
    }

    it("correct", () => {
      testValidationSuccess(new Test("010203"), `{"value":"010203"}`);
    });

    it("wrong", () => {
      testValidationWrong(new Test("01020"), `{"value":"01020"}`);
    });

  });

  context("length", () => {

    context("string", () => {
      class Test {
        @JsonProp({ length: 6 })
        public value: string;

        constructor(value: string) {
          this.value = value;
        }
      }

      it("correct", () => {
        testValidationSuccess(new Test("010203"), `{"value":"010203"}`);
      });

      it("wrong", () => {
        testValidationWrong(new Test("01020"), `{"value":"01020"}`);
      });
    });

    context("array", () => {
      class Test {
        @JsonProp({ length: 6, repeated: true })
        public value: number[];

        constructor(value: number[]) {
          this.value = value;
        }
      }

      it("correct", () => {
        testValidationSuccess(new Test([1, 2, 3, 4, 5, 6]), `{"value":[1,2,3,4,5,6]}`);
      });

      it("wrong", () => {
        testValidationWrong(new Test([1, 2, 3, 4, 5]), `{"value":[1,2,3,4,5]}`);
      });
    });

  });

  context("max length", () => {

    context("string", () => {
      class Test {
        @JsonProp({ maxLength: 6 })
        public value: string;

        constructor(value: string) {
          this.value = value;
        }
      }

      it("correct", () => {
        testValidationSuccess(new Test("123456"), `{"value":"123456"}`);
      });

      it("wrong", () => {
        testValidationWrong(new Test("1234567"), `{"value":"1234567"}`);
      });
    });

    context("array", () => {
      class Test {
        @JsonProp({ maxLength: 6, repeated: true })
        public value: number[];

        constructor(value: number[]) {
          this.value = value;
        }
      }

      it("correct", () => {
        testValidationSuccess(new Test([1, 2, 3, 4, 5, 6]), `{"value":[1,2,3,4,5,6]}`);
      });

      it("wrong", () => {
        testValidationWrong(new Test([1, 2, 3, 4, 5, 6, 7]), `{"value":[1,2,3,4,5,6,7]}`);
      });
    });

  });

  context("min length", () => {

    context("string", () => {
      class Test {
        @JsonProp({ minLength: 3 })
        public value: string;

        constructor(value: string) {
          this.value = value;
        }
      }

      it("correct", () => {
        testValidationSuccess(new Test("123"), `{"value":"123"}`);
      });

      it("wrong", () => {
        testValidationWrong(new Test("12"), `{"value":"12"}`);
      });
    });

    context("array", () => {
      class Test {
        @JsonProp({ minLength: 3, repeated: true })
        public value: number[];

        constructor(value: number[]) {
          this.value = value;
        }
      }

      it("correct", () => {
        testValidationSuccess(new Test([1, 2, 3]), `{"value":[1,2,3]}`);
      });

      it("wrong", () => {
        testValidationWrong(new Test([1, 2]), `{"value":[1,2]}`);
      });
    });

  });

  context("enum", () => {

    class Test {
      @JsonProp({ enumeration: ["val1", "val2"] })
      public value: "val1" | "val2" | string;

      constructor(value: "val1" | "val2" | string) {
        this.value = value;
      }
    }

    it("correct", () => {
      testValidationSuccess(new Test("val1"), `{"value":"val1"}`);
    });

    it("wrong", () => {
      testValidationWrong(new Test("val3"), `{"value":"val3"}`);
    });

  });

  context("exclusive", () => {

    class Test {
      @JsonProp({ type: JsonPropTypes.Number, minExclusive: 1, maxExclusive: 3 })
      public value: number = 0;

      constructor(value: number) {
        this.value = value;
      }
    }

    it("correct", () => {
      testValidationSuccess(new Test(2), `{"value":2}`);
    });

    it("wrong MIN", () => {
      testValidationWrong(new Test(1), `{"value":1}`);
    });

    it("wrong MAX", () => {
      testValidationWrong(new Test(3), `{"value":3}`);
    });

    it("wrong MAX without MIN", () => {
      class TestMax {
        @JsonProp({ type: JsonPropTypes.Number, maxExclusive: 3 })
        public value: number = 0;

        constructor(value: number) {
          this.value = value;
        }
      }
      testValidationWrong(new TestMax(3), `{"value":3}`);
    });

    it("wrong MIN without MAX", () => {
      class TestMin {
        @JsonProp({ type: JsonPropTypes.Number, minExclusive: 1 })
        public value: number = 0;

        constructor(value: number) {
          this.value = value;
        }
      }
      testValidationWrong(new TestMin(1), `{"value":1}`);
    });

  });

  context("inclusive", () => {

    class Test {
      @JsonProp({ type: JsonPropTypes.Number, minInclusive: 1, maxInclusive: 3 })
      public value: number = 0;

      constructor(value: number) {
        this.value = value;
      }
    }

    it("correct MIN", () => {
      testValidationSuccess(new Test(1), `{"value":1}`);
    });

    it("correct MAX", () => {
      testValidationSuccess(new Test(3), `{"value":3}`);
    });

    it("wrong MIN", () => {
      testValidationWrong(new Test(0), `{"value":0}`);
    });

    it("wrong MAX", () => {
      testValidationWrong(new Test(4), `{"value":4}`);
    });

    it("wrong MAX without MIN", () => {
      class TestMax {
        @JsonProp({ type: JsonPropTypes.Number, maxInclusive: 3 })
        public value: number = 0;

        constructor(value: number) {
          this.value = value;
        }
      }
      testValidationWrong(new TestMax(4), `{"value":4}`);
    });

    it("wrong MIN without MAX", () => {
      class TestMin {
        @JsonProp({ type: JsonPropTypes.Number, minInclusive: 1 })
        public value: number = 0;

        constructor(value: number) {
          this.value = value;
        }
      }
      testValidationWrong(new TestMin(0), `{"value":0}`);
    });

  });

});
