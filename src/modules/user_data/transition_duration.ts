import NumberUserData from "./number_user_data";
import { setCSSVariable } from "../utils/elements";
import type { Ref } from "vue";

class TransitionDurationData extends NumberUserData {
  constructor(value: number, valueRef: Ref<number>) {
    super("transition_duration", value, valueRef);
  }

  public apply(): void {
    setCSSVariable(
      "transition-duration-multiplier-config",
      (this.value / 100).toString()
    );
  }
}

export default TransitionDurationData;
