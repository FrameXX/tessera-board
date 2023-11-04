import { type ComputedRef, type Ref, watch } from "vue";
import type BoardStateData from "./user_data/board_state";
import type { PlayerColorOptionValue } from "./user_data/preferred_player_color";
import { getRandomArrayValue, getRandomNumber } from "./utils/misc";
import type GameBoardManager from "./game_board_manager";
import type ToastManager from "./toast_manager";
import type RawBoardStateData from "./user_data/raw_board_state";
import Timer from "./timer";
import type ConfirmDialog from "./dialogs/confirm";
import type { BoardPieceProps, BoardPosition } from "../components/Board.vue";
import {
  positionsToPath,
  type Path,
  getTargetMatchingPaths,
} from "./pieces/piece";
import type { BoardStateValue } from "./user_data/board_state";
import type { GamePaused } from "./user_data/game_paused";
import type Move from "./moves/move";

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
  const teamName =
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

export type WinReason = "none" | "move_timeout" | "match_timeout" | "resign";
export function isWinReason(string: string): string is WinReason {
  return (
    string === "none" ||
    string === "move_timeout" ||
    string === "match_timeout" ||
    string === "resign"
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
    private readonly paused: Ref<GamePaused>,
    private readonly boardManager: GameBoardManager,
    private readonly boardStateData: BoardStateData,
    private readonly boardStateValue: BoardStateValue,
    private readonly pieceProps: ComputedRef<BoardPieceProps[]>,
    private whiteCapturingPaths: Ref<Path[]>,
    private blackCapturingPaths: Ref<Path[]>,
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
    private readonly confirmDialog: ConfirmDialog,
    private readonly toastManager: ToastManager
  ) {
    watch(this.paused, (newValue) => {
      this.updateTimerState();
      if (newValue !== "not") {
        this.toastManager.showToast("Game paused", "pause");
      } else {
        this.toastManager.showToast("Game resumed", "play-outline");
      }
    });

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
      "crown-outline"
    );
    this.winner.value = winner;
    this.winReason.value = reason;
    this.updateTimerState();
  }

  private performRandomMove(pieceColor?: PlayerColor) {
    let randomPiece: BoardPieceProps;
    let moves: Move[];
    do {
      do {
        randomPiece = getRandomArrayValue(this.pieceProps.value);
      } while (
        typeof pieceColor === "undefined" ||
        randomPiece.piece.color !== pieceColor
      );
      moves = randomPiece.piece.getPossibleMoves(
        randomPiece,
        this.boardStateValue
      );
    } while (moves.length === 0);
    const chosenMove = getRandomArrayValue(moves);
    this.boardManager.performMove(chosenMove);
  }

  private onPlayerMoveSecondsBeyondLimit() {
    this.toastManager.showToast(
      `${getColorTeamName(this.playerColor.value)} run out of move time!`,
      "timer-alert-outline"
    );
    if (this.secondsMoveLimitRunOutPunishment.value === "game_loss") {
      this.opponentWin("move_timeout");
    } else if (this.secondsMoveLimitRunOutPunishment.value === "random_move") {
      this.performRandomMove(this.playerColor.value);
    }
  }

  private onOpponentMoveSecondsBeyondLimit() {
    this.toastManager.showToast(
      `${getColorTeamName(
        getOpossitePlayerColor(this.playerColor.value)
      )} run out of move time!`,
      "timer-alert-outline"
    );
    if (this.secondsMoveLimitRunOutPunishment.value === "game_loss") {
      this.playerWin("move_timeout");
    } else if (this.secondsMoveLimitRunOutPunishment.value === "random_move") {
      this.performRandomMove(getOpossitePlayerColor(this.playerColor.value));
    }
  }

  private onPlayerMatchSecondsBeyondLimit() {
    this.toastManager.showToast(
      `${getColorTeamName(this.playerColor.value)} run out of match time!`,
      "timer-alert-outline"
    );
    this.opponentWin("match_timeout");
  }

  private onOpponentMatchSecondsBeyondLimit() {
    this.toastManager.showToast(
      `${getColorTeamName(
        getOpossitePlayerColor(this.playerColor.value)
      )} run out of match time!`,
      "timer-alert-outline"
    );
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
      "keyboard-return"
    );
    this.winReason.value = "none";
    this.winner.value = "none";
    this.updateTimerState();
  }

  private setupDefaultBoardState() {
    this.boardStateData.load(this.defaultBoardStateData.dump(), true);
    this.boardStateData.updateReference();
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

  private resetMoveTimer() {
    if (this.playerPlaying.value) {
      this.opponentMoveSecondsTimer.reset();
    } else {
      this.playerMoveSecondsTimer.reset();
    }
  }

  private clearTimers() {
    this.playerMoveSecondsTimer.reset();
    this.opponentMoveSecondsTimer.reset();
    this.playerMatchSecondsTimer.reset();
    this.opponentMatchSecondsTimer.reset();
  }

  private updateTimerState() {
    if (
      this.winner.value !== "none" ||
      this.playerPlaying.value ||
      this.paused.value !== "not"
    ) {
      this.opponentMoveSecondsTimer.pause();
      this.opponentMatchSecondsTimer.pause();
    }
    if (
      this.winner.value !== "none" ||
      !this.playerPlaying.value ||
      this.paused.value !== "not"
    ) {
      this.playerMoveSecondsTimer.pause();
      this.playerMatchSecondsTimer.pause();
    }
    if (this.winner.value !== "none" || this.paused.value !== "not") {
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

  public async resign() {
    if (this.winner.value !== "none") {
      this.toastManager.showToast(
        "You cannot resign. The game ending was already decided.",
        "flag-off",
        "error"
      );
      return;
    }
    const confirmed = await this.confirmDialog.show(
      "Do you really want to give up this match? You are responsible for your decisions and this cannot be undone."
    );
    if (!confirmed) {
      return;
    }
    this.toastManager.showToast(
      `${getPlayerTeamName(
        this.playerPlaying.value ? "player" : "opponent",
        this.playerColor.value
      )} resigned`,

      "flag"
    );
    this.playerPlaying.value
      ? this.opponentWin("resign")
      : this.playerWin("resign");
  }

  public restart() {
    this.winner.value = "none";
    this.setupDefaultBoardState();
    this.choosePlayerColor();
    this.chooseFirstMoveColor();
    this.boardManager.resetBoard();
    this.toastManager.showToast("New match started.", "flag-checkered");
    this.moveIndex.value = 0;
    this.clearTimers();
    this.updateTimerState();
    this.boardStateData.save();
    this.invalidatePiecesCache();
    this.updateCapturingPaths();
  }

  public restore() {
    this.updateTimerState();
    this.updateCapturingPaths();
  }

  private get playingColor() {
    if (this.playerPlaying.value) {
      return this.playerColor.value;
    } else {
      return getOpossitePlayerColor(this.playerColor.value);
    }
  }

  public onMove() {
    this.updateTimerState();
    this.resetMoveTimer();
    this.boardStateData.save();
    this.invalidatePiecesCache();
    this.updateCapturingPaths();
    if (isSafeguardedPieceChecked(this.boardStateValue, this.playingColor))
      this.toastManager.showToast("Check!", "cross");
  }

  private invalidatePiecesCache() {
    for (const pieceProps of this.pieceProps.value) {
      pieceProps.piece.invalidateCache();
    }
  }

  public updateCapturingPaths() {
    let whiteCapturingPaths: Path[] = [];
    let blackCapturingPaths: Path[] = [];
    for (const pieceProps of this.pieceProps.value) {
      const piece = pieceProps.piece;
      const origin: BoardPosition = {
        row: +pieceProps.row,
        col: +pieceProps.col,
      };
      if (piece.color === "white") {
        whiteCapturingPaths = [
          ...whiteCapturingPaths,
          ...positionsToPath(
            piece.getCapturingPositions(origin, this.boardStateValue),
            origin
          ),
        ];
      } else {
        blackCapturingPaths = [
          ...blackCapturingPaths,
          ...positionsToPath(
            piece.getCapturingPositions(origin, this.boardStateValue),
            origin
          ),
        ];
      }
    }
    this.whiteCapturingPaths.value = whiteCapturingPaths;
    this.blackCapturingPaths.value = blackCapturingPaths;
  }
}

export default Game;

export function getAllPieceProps(boardStateValue: BoardStateValue) {
  const allPieceProps: BoardPieceProps[] = [];
  for (const [rowIndex, row] of boardStateValue.entries()) {
    for (const [colIndex, piece] of row.entries()) {
      if (!piece) {
        continue;
      }
      allPieceProps.push({
        row: rowIndex,
        col: colIndex,
        piece: piece,
      });
    }
  }
  allPieceProps.sort((a, b) => {
    return a.piece.id.localeCompare(b.piece.id);
  });
  return allPieceProps;
}

export function isSafeguardedPieceChecked(
  boardStateValue: BoardStateValue,
  color: PlayerColor
) {
  let capturingPaths: Path[] = [];
  const safeguardedPieces: BoardPieceProps[] = [];
  for (const [rowIndex, row] of boardStateValue.entries()) {
    for (const [colIndex, piece] of row.entries()) {
      if (!piece) {
        continue;
      }
      if (piece.color === color) {
        if (piece.safeguarded)
          safeguardedPieces.push({ row: rowIndex, col: colIndex, piece });
      } else {
        const origin: BoardPosition = {
          row: rowIndex,
          col: colIndex,
        };
        capturingPaths = [
          ...capturingPaths,
          ...positionsToPath(
            piece.getCapturingPositions(origin, boardStateValue),
            origin
          ),
        ];
      }
    }
  }
  for (const piece of safeguardedPieces) {
    const paths = getTargetMatchingPaths(
      { row: piece.row, col: piece.col },
      capturingPaths
    );
    if (paths.length !== 0) {
      return true;
    }
  }
  return false;
}
