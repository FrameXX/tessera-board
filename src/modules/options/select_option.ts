import Storable from "../storable";

export default class SelectOption<
  ValueType extends string
> extends Storable<ValueType> {
  constructor(
    defaultValue: ValueType,
    id: string,
    private readonly validate: (string: string) => string is ValueType,
    private readonly invalidCallback?: (value: string) => any
  ) {
    super(defaultValue, id);
  }

  public fromString(string: string): void {
    if (!this.validate(string)) {
      console.warn("An invalid value was not load from string", string);
      if (this.invalidCallback) this.invalidCallback(string);
    } else {
      this.value = string;
    }
  }

  public toString(): string {
    return this.value;
  }
}
