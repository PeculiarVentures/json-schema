import { IJsonSchema } from "../schema";
import { ParserError } from "./parser_error";

export interface IKeyErrors {
  [key: string]: Error;
}

export class KeyError extends ParserError {

  constructor(schema: IJsonSchema, public keys: string[], public errors: IKeyErrors = {}) {
    super(schema, "Some keys doesn't match to schema");
  }

}
