import { JsonError } from "./json_error";

export class ParserError extends JsonError {

  constructor(public schemaName: string, message: string, innerError?: Error) {
    super(`Cannot parse by '${schemaName}' schema. ${message}`, innerError);
  }

}
