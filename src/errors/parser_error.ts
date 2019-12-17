import { IJsonSchema } from "../schema";
import { TransformError } from "./transform_error";

export class ParserError extends TransformError {

  constructor(schema: IJsonSchema, message: string, innerError?: Error) {
    super(schema, `JSON doesn't match to '${schema.target.name}' schema. ${message}`, innerError);
  }

}
