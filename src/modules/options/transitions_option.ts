import SelectOption from "./select_option";

export type Transitions = "auto" | "enabled" | "disabled";
export function isTransitions(string: string): string is Transitions {
  return string === "auto" || string === "enabled" || string === "disabled";
}

export default class TransitionsOption extends SelectOption<Transitions> {
  constructor(defaultValue: Transitions) {
    super(defaultValue, "transitions", isTransitions);
  }
}
