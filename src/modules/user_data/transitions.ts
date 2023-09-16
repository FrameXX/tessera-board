import { SelectUserData } from "./user_data";
import type TransitionsManager from "../transitions_manager";
import type { Ref } from "vue";
import type ToastManager from "../toast_manager";

export type TransitionsValue = "enabled" | "disabled" | "auto";
function isTransitionsValue(string: string): string is TransitionsValue {
  return string === "enabled" || string === "disabled" || string === "auto";
}

class TransitionsData extends SelectUserData<TransitionsValue> {
  private transitionManager: TransitionsManager;

  constructor(
    value: TransitionsValue,
    valueRef: Ref<TransitionsValue>,
    transitionsManager: TransitionsManager,
    toastManager: ToastManager
  ) {
    super("transitions", value, isTransitionsValue, toastManager, valueRef);
    this.transitionManager = transitionsManager;
  }

  public apply(): void {
    this.transitionManager.usedTransitions = this.value;
    this.transitionManager.applyUsedTransitions();
  }
}

export default TransitionsData;
