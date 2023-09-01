import UserData from "./user_data";
import type { SaveCallBack } from "./user_data";
import { setCSSVariable } from "../utils/elements";
import type { Ref } from "vue";

export const DEFAULT_TRANSITION_DURATION_VALUE = 100;

class TransitionDurationData extends UserData<number> {
  constructor(
    saveCallBack: SaveCallBack,
    value: number,
    valueRef: Ref<number>
  ) {
    super(saveCallBack, "transition_duration", value, valueRef);
  }

  public dump(): string {
    return this.value.toString();
  }

  public load(dumped: string): void {
    this.value = +dumped;
  }

  public apply(): void {
    setCSSVariable(
      "transition-duration-multiplier-config",
      (this.value / 100).toString()
    );
  }
}

export default TransitionDurationData;
