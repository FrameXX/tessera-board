import { setCSSVariable } from "./utils/elements";
import TransitionsOption, { Transitions } from "./options/transitions_option";

class TransitionsManager {
  constructor(private readonly transitionsOption: TransitionsOption) {
    this.updateTransitions(this.transitionsOption.value);

    matchMedia("(prefers-reduced-motion: reduce)").addEventListener(
      "change",
      () => {
        if (this.transitionsOption.value === "auto") {
          this.updateTransitions(this.transitionsOption.value);
        }
      }
    );

    this.transitionsOption.addEventListener("change", (event) => {
      const newValue = (event as CustomEvent).detail as Transitions;
      this.updateTransitions(newValue);
    });
  }

  private updateTransitions(newTransitions: Transitions) {
    this.setTransitionsProperties(this.getApplyedTransitions(newTransitions));
  }

  public getApplyedTransitions(transitions: Transitions): boolean {
    let enabled: boolean;
    if (transitions === "auto") {
      enabled = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    } else {
      enabled = transitions === "enabled";
    }
    return enabled;
  }

  private setTransitionsProperties(enabled: boolean): void {
    if (enabled) {
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
