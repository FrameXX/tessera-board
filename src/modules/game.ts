import { type ComputedRef, type Ref, watch, ref, computed } from "vue";
import type BoardStateData from "./user_data/board_state";
import type { PreferredPlayerColor } from "./user_data/preferred_player_color";
import { getRandomArrayValue, getRandomNumber, isEven } from "./utils/misc";
import type ToastManager from "./toast_manager";
import type RawBoardStateData from "./user_data/raw_board_state";
import Timer from "./timer";
import type ConfirmDialog from "./dialogs/confirm";
import type { PieceId, PiecesImportance } from "./pieces/piece";
import {
  positionsToPath,
  type Path,
  getTargetMatchingPaths,
} from "./pieces/piece";
import type { GamePausedState } from "./user_data/game_paused";
import type {
  BoardPieceProps,
  BoardPosition,
  BoardStateValue,
} from "./board_manager";
import type Move from "./moves/move";
import type NumberUserData from "./user_data/number_user_data";
import type MoveListData from "./user_data/move_list";
import { MovePerformContext } from "./moves/move";
import SelectPieceDialog from "./dialogs/select_piece";
import GameBoardManager from "./game_board_manager";
import { UserDataError } from "./user_data/user_data";
import DefaultBoardManager from "./default_board_manager";
import ConfigPieceDialog from "./dialogs/config_piece";

type MoveDirection = "forward" | "reverse";
type MoveExecution = "perform" | MoveDirection;

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

export type GameOverReason =
  | "none"
  | "move_timeout"
  | "match_timeout"
  | "resign"
  | "checkmate"
  | "stalemate"
  | "block";
export function isGameOverReason(
  string: string | null
): string is GameOverReason {
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

export type SecondsPerMovePenalty = "game_loss" | "random_move";
export function isSecondsPerMovePenalty(
  string: string
): string is SecondsPerMovePenalty {
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
  public readonly winner = ref<Winner>("none");
  public readonly playingColor = computed(() => {
    let color: PlayerColor =
      (isEven(this.lastMoveIndex.value) &&
        this.preferredFirstMoveColor.value === "black") ||
      (!isEven(this.lastMoveIndex.value) &&
        this.preferredFirstMoveColor.value === "white")
        ? "white"
        : "black";
    return color;
  });
  public readonly playerPlaying = computed(() => {
    return this.playerColor.value === this.playingColor.value;
  });
  public readonly status = computed(() => {
    let text: string;
    switch (this.winner.value) {
      case "none":
        text =
          this.playerColor.value === "white" ? "White plays" : "Black plays";
        break;
      case "draw":
        text = "Draw";
        break;
      case "opponent":
        text = this.playerColor.value === "white" ? "Black won" : "White won";
        break;
      case "player":
        text = this.playerColor.value === "white" ? "White won" : "Black won";
        break;
      default:
        throw new UserDataError(
          `Winner value is of an invalid type. value: ${this.winner.value}`
        );
    }
    return text;
  });
  public readonly highlightedCells = computed(() => {
    if (!this.lastMove.value) {
      return [];
    }
    return this.lastMove.value.highlightedBoardPositions;
  });
  public readonly gameBoardPieceProps: Ref<BoardPieceProps[]>;
  public readonly defaultBoardPieceProps: Ref<BoardPieceProps[]>;
  public readonly playerBoardManager: GameBoardManager;
  public readonly opponentBoardManager: GameBoardManager;
  public readonly defaultBoardManager = new DefaultBoardManager(
    this.defaultBoardState,
    this.configPieceDialog,
    this.audioEffectsEnabled,
    this.pieceMoveAudioEffect,
    this.pieceRemoveAudioEffect,
    this.vibrationsEnabled
  );

  constructor(
    private readonly paused: Ref<GamePausedState>,
    private readonly boardStateData: BoardStateData,
    private readonly gameBoardState: BoardStateValue,
    private readonly defaultBoardStateData: RawBoardStateData,
    private readonly defaultBoardState: BoardStateValue,
    private whiteCapturingPaths: Ref<Path[]>,
    private blackCapturingPaths: Ref<Path[]>,
    public readonly playerColor: Ref<PlayerColor>,
    private readonly preferredFirstMoveColor: Ref<PreferredPlayerColor>,
    private readonly preferredPlayerColor: Ref<PreferredPlayerColor>,
    playerSecondsPerMove: Ref<number>,
    opponentSecondsPerMove: Ref<number>,
    playerSecondsPerMatch: Ref<number>,
    opponentSecondsPerMatch: Ref<number>,
    playerMoveSeconds: Ref<number>,
    opponentMoveSeconds: Ref<number>,
    playerMatchSeconds: Ref<number>,
    opponentMatchSeconds: Ref<number>,
    private readonly secondsMoveLimitRunOutPunishment: Ref<SecondsPerMovePenalty>,
    private readonly winReason: Ref<GameOverReason>,
    private readonly piecesImportance: PiecesImportance,
    private readonly blackCapturedPieces: Ref<PieceId[]>,
    private readonly whiteCapturedPieces: Ref<PieceId[]>,
    private readonly reviveFromCapturedPieces: Ref<boolean>,
    private readonly lastMoveIndex: Ref<number>,
    private readonly lastMoveIndexData: NumberUserData,
    private readonly moveList: Ref<Move[]>,
    private readonly moveListData: MoveListData,
    private readonly lastMove: ComputedRef<Move | null>,
    private readonly selectPieceDialog: SelectPieceDialog,
    private readonly audioEffectsEnabled: Ref<boolean>,
    private readonly pieceMoveAudioEffect: Howl,
    private readonly pieceRemoveAudioEffect: Howl,
    private readonly vibrationsEnabled: Ref<boolean>,
    public readonly secondCheckboardEnabled: Ref<boolean>,
    private readonly ignorePiecesGuardedProperty: Ref<boolean>,
    private readonly showCapturingPieces: Ref<boolean>,
    private readonly showOtherAvailibleMoves: Ref<boolean>,
    public readonly tableMode: Ref<boolean>,
    public readonly screenRotated: Ref<boolean>,
    private readonly confirmDialog: ConfirmDialog,
    private readonly configPieceDialog: ConfigPieceDialog,
    private readonly toastManager: ToastManager
  ) {
    this.gameBoardPieceProps = ref(getAllPieceProps(this.gameBoardState));
    this.defaultBoardPieceProps = ref(getAllPieceProps(this.gameBoardState));
    this.playerBoardManager = new GameBoardManager(
      this,
      this.whiteCapturingPaths,
      this.blackCapturingPaths,
      this.playerColor,
      this.winner,
      this.secondCheckboardEnabled,
      true,
      this.playingColor,
      this.gameBoardState,
      this.boardStateData,
      this.whiteCapturedPieces,
      this.blackCapturedPieces,
      this.showCapturingPieces,
      this.reviveFromCapturedPieces,
      this.showOtherAvailibleMoves,
      this.ignorePiecesGuardedProperty,
      this.piecesImportance,
      this.lastMove
    );
    this.opponentBoardManager = new GameBoardManager(
      this,
      this.whiteCapturingPaths,
      this.blackCapturingPaths,
      this.playerColor,
      this.winner,
      this.secondCheckboardEnabled,
      true,
      this.playingColor,
      this.gameBoardState,
      this.boardStateData,
      this.whiteCapturedPieces,
      this.blackCapturedPieces,
      this.showCapturingPieces,
      this.reviveFromCapturedPieces,
      this.showOtherAvailibleMoves,
      this.ignorePiecesGuardedProperty,
      this.piecesImportance,
      this.lastMove
    );
    watch(this.defaultBoardState, () => {
      this.defaultBoardPieceProps.value = getAllPieceProps(
        this.defaultBoardState
      );
    });

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
      playerSecondsPerMove
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
      opponentSecondsPerMove
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
      playerSecondsPerMatch
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
      opponentSecondsPerMatch
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
  }

  public performMove(move: Move) {
    move.perform(this.movePerformContext);
    this.moveList.value.push(move);
    this.onMove("perform");
  }

  private playerWin(reason: GameOverReason) {
    const winner: Winner = "player";
    this.toastManager.showToast(
      `${getPlayerTeamName(winner, this.playerColor.value)} won.`,

      "crown-outline"
    );
    this.winner.value = winner;
    this.winReason.value = reason;
    this.updateTimerState();
  }

  private clearCapturedPieces() {
    this.whiteCapturedPieces.value = [];
    this.blackCapturedPieces.value = [];
  }

  private opponentWin(reason: GameOverReason) {
    const winner: Winner = "opponent";
    this.toastManager.showToast(
      `${getPlayerTeamName(winner, this.playerColor.value)} won.`,
      "crown-outline"
    );
    this.winner.value = winner;
    this.winReason.value = reason;
    this.updateTimerState();
  }

  private draw(reason: GameOverReason) {
    this.toastManager.showToast("Draw.", "sword-cross");
    this.winner.value = "draw";
    this.winReason.value = reason;
    this.updateTimerState();
  }

  private performRandomMove(pieceColor?: PlayerColor) {
    let randomPiece: BoardPieceProps;
    let moves: Move[];
    do {
      do {
        randomPiece = getRandomArrayValue(this.gameBoardPieceProps.value);
      } while (
        typeof pieceColor === "undefined" ||
        randomPiece.piece.color !== pieceColor
      );
      moves = randomPiece.piece.getPossibleMoves(
        randomPiece,
        this.gameBoardState,
        this.boardStateData,
        this.movePerformContext,
        this.ignorePiecesGuardedProperty,
        this.lastMove
      );
    } while (moves.length === 0);
    const chosenMove = getRandomArrayValue(moves);
    this.performMove(chosenMove);
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

  private getFirstPlayerColor(): PlayerColor {
    if (this.preferredPlayerColor.value === "random") {
      return getRandomNumber(0, 1) ? "white" : "black";
    } else {
      return this.preferredPlayerColor.value;
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
    this.onBoardStateChange();
    this.playerColor.value = this.getFirstPlayerColor();
    this.clearCapturedPieces();
    this.toastManager.showToast("New match started.", "flag-checkered");
    this.lastMoveIndex.value = -1;
    this.onMoveForward();
    this.moveList.value = [];
    this.clearTimers();
  }

  public restore() {
    this.updateTimerState();
    this.updateCapturingPaths();
  }

  private spliceFutureMoves(listIndexDiff: number) {
    this.moveList.value.splice(this.lastMoveIndex.value, listIndexDiff);
  }

  private performReverseMove() {
    const reversedMove = this.moveList.value[this.lastMoveIndex.value + 1];
    reversedMove.reverse(this.gameBoardState);
  }

  private get movePerformContext(): MovePerformContext {
    return {
      boardStateValue: this.gameBoardState,
      blackCapturedPieces: this.blackCapturedPieces,
      whiteCapturedPieces: this.whiteCapturedPieces,
      selectPieceDialog: this.selectPieceDialog,
      reviveFromCapturedPieces: this.reviveFromCapturedPieces,
      audioEffectsEnabled: this.audioEffectsEnabled,
      moveAudioEffect: this.pieceMoveAudioEffect,
      removeAudioEffect: this.pieceRemoveAudioEffect,
      vibrationsEnabled: this.vibrationsEnabled,
      piecesImportance: this.piecesImportance,
    };
  }

  private performForwardMove() {
    const forwardedMove = this.moveList.value[this.lastMoveIndex.value];
    forwardedMove.forward(this.movePerformContext);
  }

  public forwardMove() {
    if (this.moveList.value.length - this.lastMoveIndex.value < 2) {
      this.toastManager.showToast(
        "You reached the last move. You cannot go further.",
        "cancel",
        "error"
      );
      if (this.vibrationsEnabled) navigator.vibrate(30);
      return;
    }
    this.onMove("forward");
  }

  public reverseMove() {
    if (this.lastMoveIndex.value === -1) {
      this.toastManager.showToast(
        "You reached the first move. You cannot go further.",
        "cancel",
        "error"
      );
      if (this.vibrationsEnabled) navigator.vibrate(30);
      return;
    }
    this.onMove("reverse");
  }

  public onMove(moveExecution: MoveExecution = "perform") {
    if (moveExecution === "reverse") {
      this.lastMoveIndex.value--;
    } else {
      this.lastMoveIndex.value++;
    }

    if (moveExecution === "perform") {
      const listIndexDiff =
        this.moveList.value.length - this.lastMoveIndex.value - 1;
      if (listIndexDiff > 0) {
        this.spliceFutureMoves(listIndexDiff);
      }
      this.onMovePerform();
    } else {
      if (moveExecution === "reverse") {
        this.performReverseMove();
      } else {
        this.performForwardMove();
      }
      this.onBoardStateChange();
    }

    if (moveExecution !== "reverse") {
      this.lastMoveIndexData.save();
      this.moveListData.save();
    }
  }

  private onBoardStateChange() {
    this.gameBoardPieceProps.value = getAllPieceProps(this.gameBoardState);
    this.updateTimerState();
    if (this.playerPlaying.value) {
      this.opponentMoveSecondsTimer.reset();
    } else {
      this.playerMoveSecondsTimer.reset();
    }
    invalidatePiecesCache(this.gameBoardPieceProps.value);
    this.updateCapturingPaths();
  }

  private onMoveForward() {
    this.onBoardStateChange();
    this.boardStateData.save();
  }

  private onMovePerform() {
    this.onMoveForward();
    this.checkLoss();
  }

  private checkLoss() {
    const guardedPieces = getGuardedPieces(
      this.gameBoardPieceProps.value,
      this.playingColor.value
    );
    const checked = isGuardedPieceChecked(
      this.gameBoardState,
      this.playingColor.value,
      this.gameBoardPieceProps.value,
      guardedPieces,
      this.lastMove
    );
    if (checked) this.toastManager.showToast("Check!", "cross");

    const canPlayerMove = this.canPlayerMove(
      this.playingColor.value,
      this.gameBoardPieceProps.value
    );
    if (!canPlayerMove) {
      if (checked || guardedPieces.length === 0) {
        const winReason: GameOverReason =
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
        this.gameBoardState,
        this.boardStateData,
        this.movePerformContext,
        this.ignorePiecesGuardedProperty,
        this.lastMove
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
    for (const pieceProps of this.gameBoardPieceProps.value) {
      const piece = pieceProps.piece;
      const origin: BoardPosition = {
        row: +pieceProps.row,
        col: +pieceProps.col,
      };
      if (piece.color === "white") {
        whiteCapturingPaths = [
          ...whiteCapturingPaths,
          ...positionsToPath(
            piece.getCapturingPositions(
              origin,
              this.gameBoardState,
              this.lastMove
            ),
            origin
          ),
        ];
      } else {
        blackCapturingPaths = [
          ...blackCapturingPaths,
          ...positionsToPath(
            piece.getCapturingPositions(
              origin,
              this.gameBoardState,
              this.lastMove
            ),
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
  guardedPieces: BoardPieceProps[],
  lastMove: ComputedRef<Move | null>
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
        piece.getCapturingPositions(origin, boardStateValue, lastMove),
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
