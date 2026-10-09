import { describe, expect, it } from "vitest";
import { isConvertible } from "./helper";
import { IJsonConvertible } from "./types";

describe("helper", () => {
  describe("isConvertible", () => {
    it("true", () => {
      class Test implements IJsonConvertible {
        public fromJSON(_json: any): this {
          throw new Error("Method not implemented.");
        }
        public toJSON() {
          throw new Error("Method not implemented.");
        }
      }
      expect(isConvertible(new Test())).toBe(true);
      expect(isConvertible(Test)).toBe(true);
    });
    it("false", () => {
      class Test {
        public toJSON() {
          throw new Error("Method not implemented.");
        }
      }
      expect(isConvertible(new Test())).toBe(false);
      expect(isConvertible(Test)).toBe(false);
    });
    it("null", () => {
      expect(isConvertible(false)).toBe(false);
    });
  });
});
