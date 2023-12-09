import { reactive, ref, computed } from "vue";
import type { BoardPieceProps, BoardPosition } from "./board_manager";
import BoardManager from "./board_manager";
import type { PiecesImportance } from "./pieces/piece";
import type Game from "./game";
import type Move from "./moves/move";
import type { MoveForwardContext } from "./moves/move";
import type { PlayerColor } from "./utils/game";
import {
  GameLogicError,
  getTargetMatchingPaths,
  moveHasClickablePosition,
  positionsEqual,
} from "./utils/game";

class GameBoardManager extends BoardManager {
  private _selectedPiece: BoardPieceProps | null = null;
  private _selectedCell: BoardPosition | null = null;
  private availibleMoves: Move[] = [];
  private dragEndTimeout: boolean = false;
  public readonly selectedCells = ref<BoardPosition[]>([]);
  public readonly selectedPieces = ref<BoardPosition[]>([]);
  public readonly draggingOverCells = ref<BoardPosition[]>([]);
  public readonly rotated = computed(() => {
    if (
      this.game.settings.tableModeEnabled.value ||
      !this.game.settings.secondCheckboardEnabled.value
    ) {
      return false;
    }
    return this.game.playerColor.value === "black";
  });

  constructor(
    private readonly game: Game,
    private readonly playerBoard: boolean,
    private readonly piecesImportance: PiecesImportance
  ) {
    super(
      reactive(
        Array(8)
          .fill(null)
          .map(() => new Array(8).fill(null))
      ),
      computed(() => {
        if (!this.game.settings.secondCheckboardEnabled.value) {
          return this.game.rotated.value;
        }
        return (this.game.playerColor.value === "black") === this.playerBoard;
      })
    );
  }

  private clearAvailibleMoves() {
    this.availibleMoves = [];
  }

  private clearSelectedPiece() {
    if (this.selectedPiece) {
      this.selectedPieces.value = [];
    }
  }

  private clearSelectedCells() {
    if (this.selectedCell) {
      this.selectedCells.value = [];
    }
  }

  private clearDraggingOverCells() {
    this.draggingOverCells.value = [];
  }

  private shouldShowMoves(pieceColor: PlayerColor) {
    if (
      this.game.settings.showOtherAvailibleMoves.value ||
      this.game.winner.value !== "none"
    )
      return true;
    if (
      !this.game.settings.secondCheckboardEnabled.value &&
      pieceColor !== this.game.playingColor.value
    )
      return false;
    if (this.game.settings.secondCheckboardEnabled.value) {
      if (
        (this.playerBoard && pieceColor !== this.game.playerColor.value) ||
        (!this.playerBoard && pieceColor === this.game.playerColor.value)
      ) {
        return false;
      }
    }
    return true;
  }

  private get moveForwardContext(): MoveForwardContext {
    return {
      boardStateValue: this.game.gameBoardState,
      piecesImportance: this.piecesImportance,
      blackCapturedPieces: this.game.blackCapturedPieces,
      whiteCapturedPieces: this.game.whiteCapturedPieces,
      reviveFromCapturedPieces: this.game.settings.reviveFromCapturedPieces,
    };
  }

  private set selectedPiece(pieceProps: BoardPieceProps | null) {
    this.clearCellsMarks();
    this.clearSelectedPiece();
    this.clearAvailibleMoves();
    this._selectedPiece = null;

    if (!pieceProps) return;

    this._selectedPiece = pieceProps;
    this.selectedPieces.value.push(pieceProps);

    if (!this.shouldShowMoves(pieceProps.piece.color)) {
      return;
    }

    const moves = pieceProps.piece.getPossibleMoves(
      pieceProps,
      this.game.gameBoardState,
      this.game.gameBoardStateData,
      this.moveForwardContext,
      this.game.settings.ignorePiecesGuardedProperty,
      this.game.lastMove
    );
    for (const move of moves) {
      move.showCellMarks(this.cellMarks, this.game.gameBoardState);
    }
    this.availibleMoves = moves;
  }

  private get selectedPiece(): BoardPieceProps | null {
    return this._selectedPiece;
  }

  private getPositionMatchingMove(position: BoardPosition): Move | null {
    if (!this.availibleMoves) {
      return null;
    }

    const matchingMoves = this.availibleMoves.filter((move) => {
      return moveHasClickablePosition(move, position);
    });

    if (matchingMoves.length > 1) {
      throw new GameLogicError(
        `Multiple moves have same clickable positions for row ${position.row}, col ${position.col}.`
      );
    }

    if (matchingMoves.length !== 1) {
      return null;
    }
    return matchingMoves[0];
  }

  public async performMove(move: Move) {
    this.selectedPiece = null;
    this.game.performMove(move);
  }

  private get selectedCell(): BoardPosition | null {
    return this._selectedCell;
  }

  private showCellCapturingPieces(position: BoardPosition) {
    const paths = getTargetMatchingPaths(position, [
      ...this.game.whiteCapturingPaths.value,
      ...this.game.blackCapturingPaths.value,
    ]);
    for (const path of paths) {
      const origin = path.origin;
      this.cellMarks[origin.row][origin.col] = "capturing";
    }
  }

  private set selectedCell(position: BoardPosition | null) {
    this.clearSelectedCells();
    this.clearCellsMarks();
    this._selectedCell = null;

    if (!position) {
      return;
    }

    this.selectedCells.value.push(position);
    if (this.game.settings.showCapturingPieces.value)
      this.showCellCapturingPieces(position);

    this._selectedCell = position;
  }

  public unselectContent() {
    this.selectedPiece = null;
    this.selectedCell = null;
  }

  private getMoveIfPossible(position: BoardPosition): Move | null {
    if (this.game.winner.value !== "none") return null;
    if (!this.availibleMoves || !this.selectedPiece) return null;
    if (this.game.settings.secondCheckboardEnabled.value) {
      if (
        this.selectedPiece.piece.color !== this.game.playerColor.value &&
        this.playerBoard
      )
        return null;
      if (
        this.selectedPiece.piece.color === this.game.playerColor.value &&
        !this.playerBoard
      )
        return null;
    }
    if (this.selectedPiece.piece.color !== this.game.playingColor.value)
      return null;
    const matchingMove = this.getPositionMatchingMove(position);
    if (!matchingMove) {
      return null;
    }
    return matchingMove;
  }

  private moveToIfPossible(position: BoardPosition): boolean {
    const matchingMove = this.getMoveIfPossible(position);
    if (!matchingMove) {
      return false;
    }
    this.performMove(matchingMove);
    return true;
  }

  public onPieceDragStart(
    targetPosition: BoardPosition,
    pieceProps: BoardPieceProps
  ): void {
    this.onPieceDragOverCell(targetPosition, pieceProps);
    if (this.selectedPiece === null) {
      this.onPieceClick(pieceProps);
      return;
    }
    if (!positionsEqual(pieceProps, this.selectedPiece))
      this.onPieceClick(pieceProps);
  }

  public onPieceDragOverCell(
    targetPosition: BoardPosition,
    pieceProps: BoardPieceProps
  ): void {
    this.clearDraggingOverCells();
    if (
      this.getMoveIfPossible(targetPosition) !== null ||
      positionsEqual(pieceProps, targetPosition)
    ) {
      this.draggingOverCells.value.push(targetPosition);
    }
  }

  public onPieceDragEnd(targetPosition: BoardPosition): void {
    this.dragEndTimeout = true;
    setTimeout(() => {
      this.dragEndTimeout = false;
    }, 100);
    this.clearDraggingOverCells();
    const matchingMove = this.getMoveIfPossible(targetPosition);
    if (matchingMove !== null) {
      this.performMove(matchingMove);
    }
  }

  // Called by Board component
  public onPieceClick(pieceProps: BoardPieceProps): void {
    if (this.dragEndTimeout) return;
    const moved = this.moveToIfPossible(pieceProps);
    if (moved) return;

    // Unselect cell
    if (this.selectedCell) this.selectedCell = null;
    if (this.selectedPiece === null) {
      this.selectedPiece = pieceProps;
      return;
    }
    if (!positionsEqual(this.selectedPiece, pieceProps)) {
      this.selectedPiece = pieceProps;
      return;
    }
    this.selectedPiece = null;
  }

  // Called by Board component
  public onCellClick(position: BoardPosition): void {
    // Check if cell is on any of the clickable position of any of the availible moves
    const moved = this.moveToIfPossible(position);
    if (moved) return;

    // Take the cell click as a piece click if no move was performed on that position. This is useful if the cells with pieces are selected using tabindex.
    const piece = this.game.gameBoardState[position.row][position.col];
    if (piece) {
      this.onPieceClick({ ...position, piece });
      return;
    }

    // Unselect piece
    if (this.selectedPiece) this.selectedPiece = null;
    if (this.selectedCell === null) {
      this.selectedCell = position;
      return;
    }
    if (!positionsEqual(this.selectedCell, position)) {
      this.selectedCell = position;
      return;
    }
    this.selectedCell = null;
  }
}

export default GameBoardManager;
