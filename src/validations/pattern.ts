/// <reference path="../types.d.ts" />

export class PatternValidation implements IValidation {

  private pattern: RegExp;

  constructor(pattern: string | RegExp) {
    this.pattern = new RegExp(pattern);
  }

  public validate(value: any): void {
    const pattern = new RegExp(this.pattern.source, this.pattern.flags);
    if (typeof value !== "string") {
      throw new TypeError("Incoming value must be string");
    }

    if (!pattern.exec(value)) {
      throw new Error(`Value doesn't match to pattern '${pattern.toString()}'`);
    }
  }

}
