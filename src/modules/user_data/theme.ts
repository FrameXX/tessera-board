import { SelectUserData } from "./user_data";
import type ThemeManager from "../theme_manager";
import type { Ref } from "vue";
import type ToastManager from "../toast_manager";

export type ThemeValue = "light" | "dark" | "auto";
function isThemeValue(string: string): string is ThemeValue {
  return string === "light" || string === "dark" || string === "auto";
}

export const DEFAULT_THEME_VALUE: ThemeValue = "auto";

class ThemeData extends SelectUserData<ThemeValue> {
  private themeManager: ThemeManager;

  constructor(
    value: ThemeValue,
    valueRef: Ref<ThemeValue>,
    themeManager: ThemeManager,
    toastManager: ToastManager
  ) {
    super("theme", value, isThemeValue, toastManager, valueRef);
    this.themeManager = themeManager;
  }

  public apply(): void {
    this.themeManager.usedTheme = this.value;
    this.themeManager.applyUsedTheme();
  }
}

export default ThemeData;
