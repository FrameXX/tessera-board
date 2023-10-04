import { type Ref } from "vue";
import type { PlayerColor } from "./pieces/piece";
import type BoardStateData from "./user_data/board_state";
import type { PlayerColorOptionValue } from "./user_data/preferred_player_color";
import { getRandomNumber } from "./utils/misc";
import GameBoardManager from "./game_board_manager";
import ToastManager from "./toast_manager";
import type RawBoardStateData from "./user_data/raw_board_state";

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
    private readonly defaultBoardStateData: RawBoardStateData,
    private readonly playerColor: Ref<PlayerColor>,
    private readonly firstMoveColor: Ref<PlayerColor>,
    private readonly preferredFirstMoveColor: Ref<PlayerColorOptionValue>,
    private readonly moveIndex: Ref<number>,
    private readonly preferredPlayerColor: Ref<PlayerColorOptionValue>,
    private readonly toastManager: ToastManager
  ) {
    this.gameBoardManager.addEventListener("move", () => this.onMove());
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

  private chooseFirstMoveColor() {
    if (this.preferredFirstMoveColor.value === "random") {
      getRandomNumber(0, 1)
        ? (this.firstMoveColor.value = "white")
        : (this.firstMoveColor.value = "black");
    } else {
      this.firstMoveColor.value = this.preferredFirstMoveColor.value;
    }
  }

  public restart() {
    this.setupDefaultBoardState();
    this.choosePlayerColor();
    this.chooseFirstMoveColor();
    this.gameBoardManager.resetBoard();
    this.toastManager.showToast("New match started.", "info", "flag-checkered");
    this.moveIndex.value = 0;
  }

  public onMove() {
    this.moveIndex.value++;
  }
}

export default Game;
