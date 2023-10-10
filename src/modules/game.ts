import { ComputedRef, Ref, watch } from "vue";
import type BoardStateData from "./user_data/board_state";
import type { PlayerColorOptionValue } from "./user_data/preferred_player_color";
import { capitalizeFirst, getRandomNumber } from "./utils/misc";
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
export function isTeamName(string: string): string is TeamName {
  return string === "White" || string === "black";
}

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

export type SecondsPerMoveRunOutPunishment = "game_loss" | "random_move";
export function isSecondsPerMoveRunOutPunishment(
  string: string
): string is SecondsPerMoveRunOutPunishment {
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
    playerSecondsPerMove: Ref<number>,
    opponentSecondsPerMove: Ref<number>,
    playerSecondsPerMatch: Ref<number>,
    opponentSecondsPerMatch: Ref<number>,
    playerMoveSeconds: Ref<number>,
    opponentMoveSeconds: Ref<number>,
    playerMatchSeconds: Ref<number>,
    opponentMatchSeconds: Ref<number>,
    private readonly secondsPerMoveRunOutPunishment: Ref<SecondsPerMoveRunOutPunishment>,
    private readonly winner: Ref<Winner>,
    private readonly toastManager: ToastManager
  ) {
    this.playerMoveSecondsTimer = new Timer(
      playerMoveSeconds,
      playerSecondsPerMove
    );

    this.opponentMoveSecondsTimer = new Timer(
      opponentMoveSeconds,
      opponentSecondsPerMove
    );

    this.playerMatchSecondsTimer = new Timer(
      playerMatchSeconds,
      playerSecondsPerMatch
    );

    this.opponentMatchSecondsTimer = new Timer(
      opponentMatchSeconds,
      opponentSecondsPerMatch
    );

    this.addTimerEventListeners();
    this.gameBoardManager.addEventListener("move", () => this.onMove());
  }

  private addTimerEventListeners() {
    this.playerMoveSecondsTimer.addEventListener("runout", () =>
      this.onPlayerMoveSecondsRunOut()
    );
    this.playerMoveSecondsTimer.addEventListener("runback", () =>
      this.onSecondsRunBack()
    );

    this.opponentMoveSecondsTimer.addEventListener("runout", () =>
      this.onOpponentMoveSecondsRunOut()
    );
    this.opponentMoveSecondsTimer.addEventListener("runback", () =>
      this.onSecondsRunBack()
    );

    this.playerMatchSecondsTimer.addEventListener("runout", () =>
      this.onPlayerMatchSecondsRunOut()
    );
    this.playerMatchSecondsTimer.addEventListener("runback", () =>
      this.onSecondsRunBack()
    );

    this.opponentMatchSecondsTimer.addEventListener("runout", () =>
      this.onOpponentMatchSecondsRunOut()
    );
    this.opponentMatchSecondsTimer.addEventListener("runback", () =>
      this.onSecondsRunBack()
    );
  }

  private playerWin() {
    const winner: Winner = "player";
    this.puaseTimers();
    this.winner.value = winner;
    this.toastManager.showToast(
      `${getPlayerTeamName(winner, this.playerColor.value)} won.`,
      "info",
      "crown-outline"
    );
  }

  private opponentWin() {
    const winner: Winner = "opponent";
    this.puaseTimers();
    this.winner.value = winner;
    this.toastManager.showToast(
      `${getPlayerTeamName(winner, this.playerColor.value)} won.`,
      "info",
      "crown-outline"
    );
  }

  public onPlayerMoveSecondsRunOut() {
    if (this.secondsPerMoveRunOutPunishment.value === "game_loss") {
      this.opponentWin();
    }
  }

  public onOpponentMoveSecondsRunOut() {
    if (this.secondsPerMoveRunOutPunishment.value === "game_loss") {
      this.playerWin();
    }
  }

  public onPlayerMatchSecondsRunOut() {
    this.opponentWin();
  }

  public onOpponentMatchSecondsRunOut() {
    this.playerWin();
  }

  public onSecondsRunBack() {
    if (!isTeamName(this.winner.value)) {
      return;
    }
    this.toastManager.showToast(
      `${getOpossiteTeamName(this.winner.value)} is back in the game.`
    );
    this.winner.value = "none";
    this.updateTimerState(this.playerPlaying.value);
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

  private resetMoveTimers() {
    this.playerMoveSecondsTimer.reset();
    this.opponentMoveSecondsTimer.reset();
  }

  private restartTimers() {
    this.playerMoveSecondsTimer.restart();
    this.opponentMoveSecondsTimer.restart();
    this.playerMatchSecondsTimer.restart();
    this.opponentMatchSecondsTimer.restart();
  }

  private puaseTimers() {
    this.playerMoveSecondsTimer.pause();
    this.opponentMoveSecondsTimer.pause();
    this.playerMatchSecondsTimer.pause();
    this.opponentMatchSecondsTimer.pause();
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
    this.gameBoardStateData.save();
    this.winner.value = "none";
  }

  public resume() {
    this.updateTimerState(this.playerPlaying.value);
  }

  public onMove() {
    this.moveIndex.value++;
    this.updateTimerState(this.playerPlaying.value);
    this.resetMoveTimers();
    this.gameBoardStateData.save();
  }
}

export default Game;
