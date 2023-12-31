import type { Ref } from "vue";
import UserData from "./user_data";

class NumberUserData extends UserData<number> {
  constructor(
    id: string,
    value: number,
    valueRef?: Ref<number>,
    private readonly minValue?: number,
    private readonly maxValue?: number,
    autoSave: boolean = true
  ) {
    super(id, value, valueRef, autoSave);
  }

  public dump(): string {
    return this.value.toString();
  }

  public load(dumped: string): void {
    let value = +dumped;
    if (this.minValue) value = Math.max(value, this.minValue);
    if (this.maxValue) value = Math.min(value, this.maxValue);
    this.value = value;
  }

  public apply(): void {}
}

export default NumberUserData;
