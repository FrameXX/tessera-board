import { type ComputedRef, type Ref, watch } from "vue";
import type BoardStateData from "./user_data/board_state";
import type { PlayerColorOptionValue } from "./user_data/preferred_player_color";
import { getRandomNumber } from "./utils/misc";
import type GameBoardManager from "./game_board_manager";
import type ToastManager from "./toast_manager";
import type RawBoardStateData from "./user_data/raw_board_state";
import Timer from "./timer";
import type ConfirmDialog from "./dialogs/confirm";
import type { BoardPieceProps, BoardPosition } from "../components/Board.vue";
import type {
  PieceId,
  PiecesImportance} from "./pieces/piece";
import {
  positionsToPath,
  type Path,
  getTargetMatchingPaths
} from "./pieces/piece";
import type { BoardStateValue } from "./user_data/board_state";
import type { GamePaused } from "./user_data/game_paused";

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

export type WinReason =
  | "none"
  | "move_timeout"
  | "match_timeout"
  | "resign"
  | "checkmate"
  | "stalemate"
  | "block";
export function isWinReason(string: string): string is WinReason {
  return (
    string === "none" ||
    string === "move_timeout" ||
    string === "match_timeout" ||
    string === "resign" ||
    string === "checkmate" ||
    string === "stalemate" ||
    string === "block"
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
    private readonly piecesImportance: PiecesImportance,
    private readonly blackCapturedPieces: Ref<PieceId[]>,
    private readonly whiteCapturedPieces: Ref<PieceId[]>,
    private readonly reviveFromCapturedPieces: Ref<boolean>,
    private readonly ignorePiecesProtections: Ref<boolean>,
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

  private draw(reason: WinReason) {
    this.toastManager.showToast("Draw.", "sword-cross");
    this.winner.value = "draw";
    this.winReason.value = reason;
    this.updateTimerState();
  }

  private onPlayerMoveSecondsBeyondLimit() {
    this.toastManager.showToast(
      `${getColorTeamName(this.playerColor.value)} run out of move time!`,
      "timer-alert-outline"
    );
    if (this.secondsMoveLimitRunOutPunishment.value === "game_loss") {
      this.opponentWin("move_timeout");
    } else if (this.secondsMoveLimitRunOutPunishment.value === "random_move") {
      this.boardManager.performRandomMove(this.playerColor.value);
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
      this.boardManager.performRandomMove(
        getOpossitePlayerColor(this.playerColor.value)
      );
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
    this.onMove();
    this.clearTimers();
    this.updateTimerState();
    this.boardStateData.save();
    invalidatePiecesCache(this.pieceProps.value);
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
    invalidatePiecesCache(this.pieceProps.value);
    this.updateCapturingPaths();
    this.checkLoss();
  }

  private checkLoss() {
    const guardedPieces = getGuardedPieces(
      this.pieceProps.value,
      this.playingColor
    );
    const checked = isGuardedPieceChecked(
      this.boardStateValue,
      this.playingColor,
      this.pieceProps.value,
      guardedPieces
    );
    if (checked) this.toastManager.showToast("Check!", "cross");
    const canPlayerMove = this.canPlayerMove(
      this.playingColor,
      this.pieceProps.value
    );
    if (!canPlayerMove) {
      if (checked || guardedPieces.length === 0) {
        const winReason: WinReason =
          guardedPieces.length !== 0 ? "block" : "checkmate";
        this.playerPlaying.value
          ? this.opponentWin(winReason)
          : this.playerWin(winReason);
      } else {
        this.draw("stalemate");
      }
    }
  }

  private canPlayerMove(color: PlayerColor, pieceProps: BoardPieceProps[]) {
    for (const props of pieceProps) {
      if (props.piece.color !== color) continue;
      const moves = props.piece.getPossibleMoves(
        props,
        this.boardStateValue,
        this.boardStateData,
        this.piecesImportance,
        this.blackCapturedPieces,
        this.whiteCapturedPieces,
        this.reviveFromCapturedPieces,
        this.ignorePiecesProtections
      );
      if (moves.length !== 0) {
        return true;
      }
    }
    return false;
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

export function getGuardedPieces(
  pieceProps: BoardPieceProps[],
  color: PlayerColor
) {
  return pieceProps.filter((props) => {
    if (props.piece.color !== color) return false;
    return props.piece.guarded;
  });
}

export function isGuardedPieceChecked(
  boardStateValue: BoardStateValue,
  color: PlayerColor,
  allPieceProps: BoardPieceProps[],
  guardedPieces: BoardPieceProps[]
) {
  let capturingPaths: Path[] = [];

  for (const pieceProps of allPieceProps) {
    const piece = pieceProps.piece;
    if (piece.color === color) {
      continue;
    }
    const origin: BoardPosition = pieceProps;
    capturingPaths = [
      ...capturingPaths,
      ...positionsToPath(
        piece.getCapturingPositions(origin, boardStateValue),
        origin
      ),
    ];
  }

  for (const piece of guardedPieces) {
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

export function invalidatePiecesCache(allPieceProps: BoardPieceProps[]) {
  for (const pieceProps of allPieceProps) {
    pieceProps.piece.invalidateCache();
  }
}

export default Game;
