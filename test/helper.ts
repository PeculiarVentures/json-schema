import * as assert from "assert";
import { isConvertible } from "../src/helper";
import { IJsonConvertible } from "../src/types";

context("helper", () => {
  context("isConvertible", () => {
    it("true", () => {
      class Test implements IJsonConvertible {
        public fromJSON(json: any): this {
          throw new Error("Method not implemented.");
        }
        public toJSON() {
          throw new Error("Method not implemented.");
        }
      }
      assert.equal(isConvertible(new Test()), true);
      assert.equal(isConvertible(Test), true);
    });
    it("false", () => {
      class Test {
        public toJSON() {
          throw new Error("Method not implemented.");
        }
      }
      assert.equal(isConvertible(new Test()), false);
      assert.equal(isConvertible(Test), false);
    });
    it("null", () => {
      assert.equal(isConvertible(false), false);
    });
  });
});
