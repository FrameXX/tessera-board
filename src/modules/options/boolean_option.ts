import Storable from "../storable";

export default class BooleanOption extends Storable<boolean> {
  constructor(defaultValue: boolean, id: string) {
    super(defaultValue, id);
  }

  public fromString(string: string): void {
    this.value = Boolean(+string);
  }

  public toString(): string {
    return Number(this.value).toString();
  }
}
