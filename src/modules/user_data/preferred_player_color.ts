import type { Ref } from "vue";
import SelectUserData from "./select_user_data";
import type ToastManager from "../toast_manager";

export type PlayerColorOptionValue = "white" | "black" | "random";
function isPlayerColorOptionValue(
  string: string
): string is PlayerColorOptionValue {
  return string === "white" || string === "black" || string === "random";
}

class PlayerColorOptionData extends SelectUserData<PlayerColorOptionValue> {
  constructor(
    id: string,
    value: PlayerColorOptionValue,
    valueRef: Ref<PlayerColorOptionValue>,
    toastManager: ToastManager
  ) {
    super(id, value, isPlayerColorOptionValue, toastManager, valueRef);
  }

  public apply(): void {}
}

export default PlayerColorOptionData;
