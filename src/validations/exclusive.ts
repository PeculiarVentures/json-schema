/// <reference path="../types.d.ts" />

import { ValidationError } from "../errors/validation_error";
import { throwIfTypeIsWrong } from "../helper";
import { JsonPropTypes } from "../prop_types";

export class ExclusiveValidation implements IValidation {

  constructor(private min: number = Number.MIN_VALUE, private max: number = Number.MAX_VALUE) {
  }

  public validate(value: any): void {
    throwIfTypeIsWrong(value, JsonPropTypes.Number);

    if (!(this.min < value && value < this.max)) {
      const min = this.min === Number.MIN_VALUE ? "MIN" : this.min;
      const max = this.max === Number.MAX_VALUE ? "MAX" : this.max;
      throw new ValidationError(`Value doesn't match to diapason (${min},${max})`);
    }

  }

}
