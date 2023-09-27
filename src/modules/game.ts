import { type Ref } from "vue";
import type { PlayerColor } from "./pieces/piece";
import type BoardStateData from "./user_data/board_state";
import type { PreferredPlayerColorValue } from "./user_data/preferred_player_color";
import { getRandomNumber } from "./utils/misc";
import GameBoardManager from "./game_board_manager";

export class GameLogicError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, GameLogicError.prototype);
    this.name = GameLogicError.name;
  }
}

class Game {
  constructor(
    private readonly gameBoardManager: GameBoardManager,
    private readonly gameBoardStateData: BoardStateData,
    private readonly defaultBoardStateData: BoardStateData,
    private readonly playerColor: Ref<PlayerColor>,
    private readonly playerPlaying: Ref<boolean>,
    private readonly preferredPlayerColor: Ref<PreferredPlayerColorValue>
  ) {
    this.gameBoardManager.addEventListener("interpret-move", () =>
      this.onmoveEnd()
    );
  }

  private setupDefaultBoardState() {
    // Copy default checkboard
    this.gameBoardStateData.load(this.defaultBoardStateData.dump(), true);
    this.gameBoardStateData.updateReference();
  }

  private choosePlayerColor() {
    if (this.preferredPlayerColor.value === "random") {
      getRandomNumber(0, 1)
        ? (this.playerColor.value = "white")
        : (this.playerColor.value = "black");
    } else {
      this.playerColor.value = this.preferredPlayerColor.value;
    }
  }

  public restart() {
    this.setupDefaultBoardState();
    this.choosePlayerColor();
    this.gameBoardManager.resetBoard();
  }

  public onmoveStart() {}

  public onmoveEnd() {}
}

export default Game;
