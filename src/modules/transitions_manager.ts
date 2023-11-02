import { setCSSVariable } from "./utils/elements";
import type { Ref} from "vue";
import { watch } from "vue";

export type Transitions = "auto" | "enabled" | "disabled";
export function isTransitions(string: string): string is Transitions {
  return string === "auto" || string === "enabled" || string === "disabled";
}

class TransitionsManager {
  constructor(private readonly transitions: Ref<Transitions>) {
    this.updateTransitions(this.transitions.value);

    matchMedia("(prefers-reduced-motion: reduce)").addEventListener(
      "change",
      () => {
        if (this.transitions.value === "auto") {
          this.updateTransitions(this.transitions.value);
        }
      }
    );

    watch(this.transitions, (newValue) => {
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
