import { setCSSVariable } from "./utils/elements";
import ThemeOption, { Theme } from "./options/theme_option";

export type ApplyedTheme = "light" | "dark";

class ThemeManager {
  constructor(private readonly themeOption: ThemeOption) {
    this.updateTheme(this.themeOption.value);

    matchMedia("(prefers-color-scheme: dark)").addEventListener(
      "change",
      () => {
        if (this.themeOption.value === "auto") {
          this.updateTheme(this.themeOption.value);
        }
      }
    );

    this.themeOption.addEventListener("change", (event) => {
      const newValue = (event as CustomEvent).detail as Theme;
      this.updateTheme(newValue);
    });
  }

  private updateTheme(newTheme: Theme) {
    this.setThemeProperties(this.getApplyedTheme(newTheme));
  }

  public getApplyedTheme(theme: Theme): ApplyedTheme {
    let applyedTheme: ApplyedTheme;
    if (theme == "auto") {
      if (matchMedia("(prefers-color-scheme: dark)").matches) {
        applyedTheme = "dark";
      } else {
        applyedTheme = "light";
      }
    } else {
      applyedTheme = theme;
    }
    return applyedTheme;
  }

  private setThemeProperties(applyedTheme: ApplyedTheme): void {
    setCSSVariable("L-text", `var(--L-${applyedTheme}-text)`);
    setCSSVariable("L-surface", `var(--L-${applyedTheme}-surface)`);
    setCSSVariable("L-surface-top", `var(--L-${applyedTheme}-surface-top)`);
    setCSSVariable(
      "L-surface-accent",
      `var(--L-${applyedTheme}-surface-accent)`
    );
    setCSSVariable("L-accent", `var(--L-${applyedTheme}-accent)`);
    setCSSVariable("L-cell-white", `var(--L-${applyedTheme}-cell-white)`);
    setCSSVariable("L-cell-black", `var(--L-${applyedTheme}-cell-black)`);
    setCSSVariable(
      "L-piece-fill-white",
      `var(--L-${applyedTheme}-piece-fill-white)`
    );
    setCSSVariable(
      "L-piece-fill-black",
      `var(--L-${applyedTheme}-piece-fill-black)`
    );
    setCSSVariable(
      "L-piece-stroke-white",
      `var(--L-${applyedTheme}-piece-stroke-white)`
    );
    setCSSVariable(
      "L-piece-stroke-black",
      `var(--L-${applyedTheme}-piece-stroke-black)`
    );
    setCSSVariable("L-dim", `var(--L-${applyedTheme}-dim)`);
  }
}

export default ThemeManager;
