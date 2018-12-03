import { JsonError } from "./json_error";

export class SerializerError extends JsonError {

  constructor(public schemaName: string, message: string, innerError?: Error) {
    super(`Cannot serialize by '${schemaName}' schema. ${message}`, innerError);
  }

}
