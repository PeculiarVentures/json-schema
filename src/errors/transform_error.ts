import { IJsonSchema } from "../schema";
import { JsonError } from "./json_error";

export class TransformError extends JsonError {

  constructor(public schema: IJsonSchema, message: string, innerError?: Error) {
    super(message, innerError);
  }

}
