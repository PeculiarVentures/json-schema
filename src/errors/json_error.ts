export class JsonError extends Error {

  constructor(public message: string, public innerError?: Error) {
    super();
  }

}
