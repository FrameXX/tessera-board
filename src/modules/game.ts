import { ComputedRef, Ref, watch } from "vue";
import type { PlayerColor } from "./pieces/piece";
import type BoardStateData from "./user_data/board_state";
import type { PlayerColorOptionValue } from "./user_data/preferred_player_color";
import { getRandomNumber } from "./utils/misc";
import GameBoardManager from "./game_board_manager";
import ToastManager from "./toast_manager";
import type RawBoardStateData from "./user_data/raw_board_state";
import Timer from "./timer";

export class GameLogicError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, GameLogicError.prototype);
    this.name = GameLogicError.name;
  }
}

class Game {
  private readonly playerMoveSecondsTimer: Timer;
  private readonly opponentMoveSecondsTimer: Timer;
  private readonly playerMatchSecondsTimer: Timer;
  private readonly opponentMatchSecondsTimer: Timer;

  constructor(
    private readonly gameBoardManager: GameBoardManager,
    private readonly gameBoardStateData: BoardStateData,
    private readonly defaultBoardStateData: RawBoardStateData,
    private readonly playerColor: Ref<PlayerColor>,
    private readonly firstMoveColor: Ref<PlayerColor>,
    private readonly preferredFirstMoveColor: Ref<PlayerColorOptionValue>,
    private readonly playerPlaying: ComputedRef<boolean>,
    private readonly moveIndex: Ref<number>,
    private readonly preferredPlayerColor: Ref<PlayerColorOptionValue>,
    playerMoveSeconds: Ref<number>,
    opponentMoveSeconds: Ref<number>,
    playerMatchSeconds: Ref<number>,
    opponentMatchSeconds: Ref<number>,
    private readonly toastManager: ToastManager
  ) {
    this.playerMoveSecondsTimer = new Timer(playerMoveSeconds);
    this.opponentMoveSecondsTimer = new Timer(opponentMoveSeconds);
    this.playerMatchSecondsTimer = new Timer(playerMatchSeconds);
    this.opponentMatchSecondsTimer = new Timer(opponentMatchSeconds);
    this.gameBoardManager.addEventListener("move", () => this.onMove());
    watch(this.playerPlaying, (newValue) => {
      this.updateTimerState(newValue);
    });
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

  private restartMoveTimers() {
    this.playerMoveSecondsTimer.restart();
    this.opponentMoveSecondsTimer.restart();
  }

  private restartTimers() {
    this.restartMoveTimers();
    this.playerMatchSecondsTimer.restart();
    this.opponentMatchSecondsTimer.restart();
  }

  private updateTimerState(playerPlaying: boolean) {
    if (playerPlaying) {
      this.opponentMoveSecondsTimer.pause();
      this.opponentMatchSecondsTimer.pause();
      this.playerMoveSecondsTimer.resume();
      this.playerMatchSecondsTimer.resume();
    } else {
      this.playerMoveSecondsTimer.pause();
      this.playerMatchSecondsTimer.pause();
      this.opponentMoveSecondsTimer.resume();
      this.opponentMatchSecondsTimer.resume();
    }
  }

  public restart() {
    this.restartTimers();
    this.setupDefaultBoardState();
    this.choosePlayerColor();
    this.chooseFirstMoveColor();
    this.gameBoardManager.resetBoard();
    this.toastManager.showToast("New match started.", "info", "flag-checkered");
    this.moveIndex.value = 0;
    this.updateTimerState(this.playerPlaying.value);
  }

  public resume() {
    this.updateTimerState(this.playerPlaying.value);
  }

  public onMove() {
    this.moveIndex.value++;
    this.updateTimerState(this.playerPlaying.value);
  }
}

export default Game;
