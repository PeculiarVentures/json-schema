/// <reference path="../types.d.ts" />

import { ValidationError } from "../errors/validation_error";

export class LengthValidation implements IValidation {

  constructor(private length?: number, private minLength?: number, private maxLength?: number) {
  }

  public validate(value: any): void {
    if (this.length !== undefined) {
      if (value.length !== this.length) {
        throw new ValidationError(`Value length must be exactly ${this.length}.`);
      }
      return; // ignore min and max if length presents
    }
    if (this.minLength !== undefined) {
      if (value.length < this.minLength) {
        throw new ValidationError(`Value length must be more than ${this.minLength}.`);
      }
    }
    if (this.maxLength !== undefined) {
      if (value.length > this.maxLength) {
        throw new ValidationError(`Value length must be less than ${this.maxLength}.`);
      }
    }

  }

}
