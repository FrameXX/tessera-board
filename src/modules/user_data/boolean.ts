import UserData from "./user_data";

import type { Ref } from "vue";

class BooleanData extends UserData<boolean> {
  constructor(value: boolean, valueRef: Ref<boolean>, id: string) {
    super(id, value, valueRef);
  }

  public dump(): string {
    const numRepr = this.value ? 1 : 0;
    return numRepr.toString();
  }

  public load(dumped: string): void {
    this.value = Boolean(+dumped);
  }

  public apply(): void {}
}

export default BooleanData;