import { ComputedRef, Ref, watch } from "vue";
import type BoardStateData from "./user_data/board_state";
import type { PlayerColorOptionValue } from "./user_data/preferred_player_color";
import { getRandomNumber } from "./utils/misc";
import GameBoardManager from "./game_board_manager";
import ToastManager from "./toast_manager";
import type RawBoardStateData from "./user_data/raw_board_state";
import Timer from "./timer";

export type Player = "player" | "opponent";
export function isPlayer(string: string): string is Player {
  return string === "player" || string === "opponent";
}

export type PlayerColor = "white" | "black";
export function isPlayerColor(string: string): string is PlayerColor {
  return string === "white" || string === "black";
}

export type TeamName = "White" | "Black";

export function getOpossiteTeamName(teamName: TeamName): TeamName {
  return teamName === "White" ? "Black" : "White";
}

export function getOpossitePlayerColor(playerColor: PlayerColor) {
  return playerColor === "white" ? "black" : "white";
}

export function getColorTeamName(playerColor: PlayerColor): TeamName {
  return playerColor === "white" ? "White" : "Black";
}

export function getPlayerTeamName(
  player: Player,
  playerColor: PlayerColor
): TeamName {
  let teamName: TeamName;
  teamName =
    player === "player"
      ? getColorTeamName(playerColor)
      : getColorTeamName(getOpossitePlayerColor(playerColor));
  return teamName;
}

type UndecidedWinner = "draw" | "none";
export function isUndecidedWinner(string: string): string is UndecidedWinner {
  return string === "draw" || string === "none";
}

export type Winner = UndecidedWinner | Player;
export function isWinner(string: string): string is Winner {
  return isPlayer(string) || isUndecidedWinner(string);
}

export type WinReason = "none" | "move_timeout" | "match_timeout";
export function isWinReason(string: string): string is WinReason {
  return (
    string === "none" || string === "move_timout" || string === "match_timeout"
  );
}

export type MoveSecondsLimitRunOutPunishment = "game_loss" | "random_move";
export function isMoveSecondsLimitRunOutPunishment(
  string: string
): string is MoveSecondsLimitRunOutPunishment {
  return string === "game_loss" || string === "random_move";
}

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
    playerMoveSecondsLimit: Ref<number>,
    opponentMoveSecondsLimit: Ref<number>,
    playerMatchSecondsLimit: Ref<number>,
    opponentMatchSecondsLimit: Ref<number>,
    playerMoveSeconds: Ref<number>,
    opponentMoveSeconds: Ref<number>,
    playerMatchSeconds: Ref<number>,
    opponentMatchSeconds: Ref<number>,
    private readonly secondsMoveLimitRunOutPunishment: Ref<MoveSecondsLimitRunOutPunishment>,
    private readonly winner: Ref<Winner>,
    private readonly winReason: Ref<WinReason>,
    private readonly toastManager: ToastManager
  ) {
    this.playerMoveSecondsTimer = new Timer(
      playerMoveSeconds,
      playerMoveSecondsLimit
    );
    watch(this.playerMoveSecondsTimer.beyondLimit, (newValue) => {
      if (newValue) {
        this.onPlayerMoveSecondsBeyondLimit();
      } else if (
        this.winReason.value === "move_timeout" &&
        this.winner.value === "opponent"
      )
        this.cancelWin();
    });

    this.opponentMoveSecondsTimer = new Timer(
      opponentMoveSeconds,
      opponentMoveSecondsLimit
    );
    watch(this.opponentMoveSecondsTimer.beyondLimit, (newValue) => {
      if (newValue) {
        this.onOpponentMoveSecondsBeyondLimit();
      } else if (
        this.winReason.value === "move_timeout" &&
        this.winner.value === "player"
      )
        this.cancelWin();
    });

    this.playerMatchSecondsTimer = new Timer(
      playerMatchSeconds,
      playerMatchSecondsLimit
    );
    watch(this.playerMatchSecondsTimer.beyondLimit, (newValue) => {
      if (newValue) {
        this.onPlayerMatchSecondsBeyondLimit();
      } else if (
        this.winReason.value === "match_timeout" &&
        this.winner.value === "opponent"
      )
        this.cancelWin();
    });

    this.opponentMatchSecondsTimer = new Timer(
      opponentMatchSeconds,
      opponentMatchSecondsLimit
    );
    watch(this.opponentMatchSecondsTimer.beyondLimit, (newValue) => {
      if (newValue) {
        this.onOpponentMatchSecondsBeyondLimit();
      } else if (
        this.winReason.value === "match_timeout" &&
        this.winner.value === "player"
      )
        this.cancelWin();
    });

    watch(moveIndex, () => {
      this.onMove();
    });
  }

  private playerWin(reason: WinReason) {
    const winner: Winner = "player";
    this.toastManager.showToast(
      `${getPlayerTeamName(winner, this.playerColor.value)} won.`,
      "info",
      "crown-outline"
    );
    this.winner.value = winner;
    this.winReason.value = reason;
    this.updateTimerState();
  }

  private opponentWin(reason: WinReason) {
    const winner: Winner = "opponent";
    this.toastManager.showToast(
      `${getPlayerTeamName(winner, this.playerColor.value)} won.`,
      "info",
      "crown-outline"
    );
    this.winner.value = winner;
    this.winReason.value = reason;
    this.updateTimerState();
  }

  private onPlayerMoveSecondsBeyondLimit() {
    if (this.secondsMoveLimitRunOutPunishment.value === "game_loss") {
      this.opponentWin("move_timeout");
    }
  }

  private onOpponentMoveSecondsBeyondLimit() {
    if (this.secondsMoveLimitRunOutPunishment.value === "game_loss") {
      this.playerWin("move_timeout");
    }
  }

  private onPlayerMatchSecondsBeyondLimit() {
    this.opponentWin("match_timeout");
  }

  private onOpponentMatchSecondsBeyondLimit() {
    this.playerWin("match_timeout");
  }

  private cancelWin() {
    if (!isPlayer(this.winner.value)) {
      console.error("Winner value is not of Player type.");
      return;
    }
    this.toastManager.showToast(
      `${getOpossiteTeamName(
        getPlayerTeamName(this.winner.value, this.playerColor.value)
      )} is back in the game.`,
      "info",
      "keyboard-return"
    );
    this.winReason.value = "none";
    this.winner.value = "none";
    this.updateTimerState();
  }

  private setupDefaultBoardState() {
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

  private resetMoveTimers() {
    this.playerMoveSecondsTimer.reset();
    this.opponentMoveSecondsTimer.reset();
  }

  private resetTimers() {
    this.resetMoveTimers();
    this.playerMatchSecondsTimer.reset();
    this.opponentMatchSecondsTimer.reset();
  }

  private updateTimerState() {
    if (this.winner.value !== "none" || this.playerPlaying.value) {
      this.opponentMoveSecondsTimer.pause();
      this.opponentMatchSecondsTimer.pause();
    }
    if (this.winner.value !== "none" || !this.playerPlaying.value) {
      this.playerMoveSecondsTimer.pause();
      this.playerMatchSecondsTimer.pause();
    }
    if (this.winner.value !== "none") {
      return;
    }
    if (this.playerPlaying.value) {
      this.playerMoveSecondsTimer.resume();
      this.playerMatchSecondsTimer.resume();
    } else {
      this.opponentMoveSecondsTimer.resume();
      this.opponentMatchSecondsTimer.resume();
    }
  }

  public restart() {
    this.winner.value = "none";
    this.setupDefaultBoardState();
    this.choosePlayerColor();
    this.chooseFirstMoveColor();
    this.gameBoardManager.resetBoard();
    this.toastManager.showToast("New match started.", "info", "flag-checkered");
    this.moveIndex.value = 0;
    this.resetTimers();
    this.updateTimerState();
    this.gameBoardStateData.save();
  }

  public resume() {
    this.updateTimerState();
  }

  public onMove() {
    this.updateTimerState();
    this.resetMoveTimers();
    this.gameBoardStateData.save();
  }
}

export default Game;
