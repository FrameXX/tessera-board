import UserData from "./user_data";
import type ThemeManager from "../classes/theme_manager";
import type { Ref } from "vue";

export type ThemeValue = "light" | "dark" | "auto";
function isThemeValue(string: string): string is ThemeValue {
  return string === "light" || string === "dark" || string === "auto";
}

export const DEFAULT_THEME_VALUE: ThemeValue = "auto";

class ThemeData extends UserData<ThemeValue> {
  private themeManager: ThemeManager;

  constructor(
    value: ThemeValue,
    valueRef: Ref<ThemeValue>,
    themeManager: ThemeManager
  ) {
    super("theme", value, valueRef);
    this.themeManager = themeManager;
  }

  public load(dumped: string): void {
    if (isThemeValue(dumped)) {
      this.value = dumped;
    } else {
      this.handleInvalidLoadValue(dumped);
    }
  }

  public dump(): string {
    return this.value;
  }

  public apply(): void {
    this.themeManager.usedTheme = this.value;
    this.themeManager.applyUsedTheme();
  }
}

export default ThemeData;
