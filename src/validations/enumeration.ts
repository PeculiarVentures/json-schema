import { ValidationError } from "../errors/validation_error";
import { throwIfTypeIsWrong } from "../helper";
import { JsonPropTypes } from "../prop_types";
import { IValidation } from "../types";

export class EnumerationValidation implements IValidation {

  constructor(private enumeration: string[]) {
  }

  public validate(value: any): void {
    throwIfTypeIsWrong(value, JsonPropTypes.String);

    if (!this.enumeration.includes(value)) {
      throw new ValidationError(`Value must be one of ${this.enumeration.map((v) => `'${v}'`).join(", ")}`);
    }
  }

}
