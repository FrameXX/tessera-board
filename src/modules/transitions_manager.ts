import { setCSSVariable } from "./utils/elements";
import type { TransitionsValue } from "./user_data/transitions";

class TransitionsManager {
  public usedTransitions: TransitionsValue;

  constructor(usedTransitions: TransitionsValue) {
    this.usedTransitions = usedTransitions;
    this.applyUsedTransitions();
    matchMedia("(prefers-reduced-motion: reduce)").addEventListener(
      "change",
      () => {
        if (this.usedTransitions === "auto") {
          this.applyUsedTransitions();
        }
      }
    );
  }

  public get preferredTransitions(): boolean {
    let preferred: boolean;
    if (this.usedTransitions === "auto") {
      preferred = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    } else {
      preferred = this.usedTransitions === "enabled";
    }
    return preferred;
  }

  public applyUsedTransitions() {
    const preferred = this.preferredTransitions;
    if (preferred) {
      setCSSVariable(
        "transition-duration-multiplier",
        "var(--transition-duration-multiplier-config)"
      );
    } else {
      setCSSVariable("transition-duration-multiplier", "0");
    }
  }
}

export default TransitionsManager;
