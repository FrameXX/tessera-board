import SelectUserData from "./select_user_data";

export type GamePaused = "not" | "auto" | "manual";
export function isGamePaused(string: string): string is GamePaused {
  return string === "not" || string === "auto" || string === "manual";
}

class GamePausedData extends SelectUserData<GamePaused> {}

export default GamePausedData;
