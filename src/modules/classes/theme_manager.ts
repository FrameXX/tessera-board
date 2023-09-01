import { setCSSVariable } from "../utils/elements";
import type { ThemeValue } from "../user_data/theme";

export type Theme = "light" | "dark";

class ThemeManager {
  public usedTheme: ThemeValue;

  constructor(usedTheme: ThemeValue) {
    this.usedTheme = usedTheme;
    this.applyUsedTheme();
    matchMedia("(prefers-color-scheme: dark)").addEventListener(
      "change",
      () => {
        if (this.usedTheme === "auto") {
          this.applyUsedTheme();
        }
      }
    );
  }

  public get preferredTheme(): Theme {
    let theme: Theme;
    if (this.usedTheme == "auto") {
      if (matchMedia("(prefers-color-scheme: dark)").matches) {
        theme = "dark";
      } else {
        theme = "light";
      }
    } else {
      theme = this.usedTheme;
    }
    return theme;
  }

  private setThemeProperties(theme: Theme): void {
    setCSSVariable("L-text", `var(--L-${theme}-text)`);
    setCSSVariable("L-surface", `var(--L-${theme}-surface)`);
    setCSSVariable("L-surface-top", `var(--L-${theme}-surface-top)`);
    setCSSVariable("L-accent", `var(--L-${theme}-accent)`);
    setCSSVariable("L-cell-white", `var(--L-${theme}-cell-white)`);
    setCSSVariable("L-cell-black", `var(--L-${theme}-cell-black)`);
    setCSSVariable("L-piece-fill-white", `var(--L-${theme}-piece-fill-white)`);
    setCSSVariable("L-piece-fill-black", `var(--L-${theme}-piece-fill-black)`);
    setCSSVariable(
      "L-piece-stroke-white",
      `var(--L-${theme}-piece-stroke-white)`
    );
    setCSSVariable(
      "L-piece-stroke-black",
      `var(--L-${theme}-piece-stroke-black)`
    );
    setCSSVariable("L-dim", `var(--L-${theme}-dim)`);
  }

  public applyUsedTheme(): void {
    this.setThemeProperties(this.preferredTheme);
  }
}

export default ThemeManager;
