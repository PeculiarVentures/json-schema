export class JsonError extends Error {

  constructor(public message: string, public innerError?: Error) {
    super(innerError
      ? `${message}. See the inner exception for more details.`
      : message);
  }

}
