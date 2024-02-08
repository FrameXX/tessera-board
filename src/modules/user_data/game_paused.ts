import type { Ref } from "vue";
import SelectUserData from "./select_user_data";
import type Toaster from "../toaster/toaster";

export type GamePausedState = "not" | "auto" | "manual";
export function isGamePausedState(string: string): string is GamePausedState {
  return string === "not" || string === "auto" || string === "manual";
}

class GamePausedData extends SelectUserData<GamePausedState> {
  constructor(value: GamePausedState, valueRef?: Ref<GamePausedState>) {
    super("game_paused", value, isGamePausedState, valueRef);
  }

  public load(dumped: string, toaster: Toaster): void {
    if (!this.validate(dumped)) {
      console.error(
        `An error occured while trying to parse game_paused user data ${this.id}.`
      );
      this.handleInvalidLoadValue(dumped, toaster);
      return;
    }

    // Do not recover the game as paused if it was paused automatically.
    if (dumped === "manual") {
      this.value = "manual";
    } else {
      this.value = "not";
    }
  }
}

export default GamePausedData;
