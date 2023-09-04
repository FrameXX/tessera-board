import UserData from "./user_data";
import type TransitionsManager from "../transitions_manager";
import type { Ref } from "vue";

export type TransitionsValue = "enabled" | "disabled" | "auto";
function isTransitionsValue(string: string): string is TransitionsValue {
  return string === "enabled" || string === "disabled" || string === "auto";
}

export const DEFAULT_TRANSITIONS_VALUE: TransitionsValue = "auto";

class TransitionsData extends UserData<TransitionsValue> {
  private transitionManager: TransitionsManager;

  constructor(
    value: TransitionsValue,
    valueRef: Ref<TransitionsValue>,
    transitionsManager: TransitionsManager
  ) {
    super("transitions", value, valueRef);
    this.transitionManager = transitionsManager;
  }

  public load(dumped: string): void {
    if (isTransitionsValue(dumped)) {
      this.value = dumped;
    } else {
      this.handleInvalidLoadValue(dumped);
    }
  }

  public dump(): string {
    return this.value;
  }

  public apply(): void {
    this.transitionManager.usedTransitions = this.value;
    this.transitionManager.applyUsedTransitions();
  }
}

export default TransitionsData;
