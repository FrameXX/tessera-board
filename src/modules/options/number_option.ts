import Storable from "../storable";

export default class NumberOption extends Storable<number> {
  constructor(
    defaultValue: number,
    id: string,
    private readonly min?: number,
    private readonly max?: number
  ) {
    super(defaultValue, id);
  }

  public fromString(string: string): void {
    let value = +string;
    if (this.max) value = Math.min(value, this.max);
    if (this.min) value = Math.max(value, this.min);
    this.value = value;
  }

  public toString(): string {
    return this.value.toString();
  }
}
