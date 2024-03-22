import SelectOption from "./select_option";

export type Theme = "auto" | "light" | "dark";
export function isTheme(string: string): string is Theme {
  return string === "auto" || string === "light" || string === "dark";
}

export default class ThemeOption extends SelectOption<Theme> {
  constructor(defaultValue: Theme) {
    super(defaultValue, "theme", isTheme);
  }
}
