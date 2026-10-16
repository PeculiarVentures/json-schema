import { describe, expect, it } from "vitest";
import * as api from "./index";
import { JsonParser, JsonProp, JsonPropTypes, JsonSerializer } from "./index";

describe("public API", () => {
  it("exports the runtime values", () => {
    expect(Object.keys(api).sort()).toEqual([
      "JsonError",
      "JsonParser",
      "JsonProp",
      "JsonPropTypes",
      "JsonSerializer",
      "KeyError",
      "ParserError",
      "SerializerError",
      "TransformError",
      "ValidationError",
    ]);
  });

  it("round-trips a decorated class", () => {
    class Item {
      @JsonProp({ name: "n", type: JsonPropTypes.Number })
      public value = 0;

      @JsonProp({ name: "t", type: JsonPropTypes.String, repeated: true, optional: true })
      public tags: string[] = [];
    }

    const item = JsonParser.parse(`{"n":1,"t":["a","b"]}`, { targetSchema: Item });
    expect(item).toBeInstanceOf(Item);
    expect(item.value).toBe(1);
    expect(item.tags).toEqual(["a", "b"]);
    expect(JsonSerializer.serialize(item)).toBe(`{"n":1,"t":["a","b"]}`);
  });
});
