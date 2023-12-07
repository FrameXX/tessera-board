import { reactive, ref, computed } from "vue";
import type {
  BoardPieceProps,
  BoardPosition,
  BoardStateValue,
  MarkBoardState,
} from "./board_manager";
import BoardManager from "./board_manager";
import type { PiecesImportance } from "./pieces/piece";
import type Piece from "./pieces/piece";
import { getTargetMatchingPaths } from "./pieces/piece";
import Game, { GameLogicError, type PlayerColor } from "./game";
import type Move from "./moves/move";
import { MoveForwardContext } from "./moves/move";

class GameBoardManager extends BoardManager {
  private _selectedPiece: BoardPieceProps | null = null;
  private _selectedCell: BoardPosition | null = null;
  private availibleMoves: Move[] = [];
  private dragEndTimeout: boolean = false;
  public cellsMarks: MarkBoardState = reactive(
    Array(8)
      .fill(null)
      .map(() => new Array(8).fill(null))
  );
  public readonly selectedCells = ref<BoardPosition[]>([]);
  public readonly selectedPieces = ref<BoardPosition[]>([]);
  public readonly draggingOverCells = ref<BoardPosition[]>([]);
  public readonly rotated = computed(() => {
    if (this.game.tableMode.value || !this.game.secondCheckboardEnabled.value) {
      return false;
    }
    return this.game.playerColor.value === "black";
  });
  public readonly contentRotated = computed(() => {
    if (!this.game.secondCheckboardEnabled.value) {
      return this.game.screenRotated.value;
    }
    if (!this.game.tableMode.value) {
      return this.game.playerColor.value === "black";
    }
    return this.game.playerColor.value === "black";
  });

  constructor(
    private readonly game: Game,
    private readonly playerBoard: boolean,
    private readonly piecesImportance: PiecesImportance
  ) {
    super();
  }

  private clearCellsMarks() {
    for (const rowIndex in this.cellsMarks) {
      for (const colIndex in this.cellsMarks[rowIndex]) {
        this.cellsMarks[rowIndex][colIndex] = null;
      }
    }
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
      this.game.showOtherAvailibleMoves.value ||
      this.game.winner.value !== "none"
    )
      return true;
    if (
      !this.game.secondCheckboardEnabled.value &&
      pieceColor !== this.game.playingColor.value
    )
      return false;
    if (this.game.secondCheckboardEnabled.value) {
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
      reviveFromCapturedPieces: this.game.reviveFromCapturedPieces,
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
      this.game.ignorePiecesGuardedProperty,
      this.game.lastMove
    );
    for (const move of moves) {
      move.showCellMarks(this.cellsMarks, this.game.gameBoardState);
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
      this.cellsMarks[origin.row][origin.col] = "capturing";
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
    if (this.game.showCapturingPieces.value)
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
    if (this.game.secondCheckboardEnabled.value) {
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

function moveHasClickablePosition(
  move: Move,
  position: BoardPosition
): boolean {
  const matchingPositions = getMatchingPositions(
    move.clickablePositions,
    position
  );

  // There should be no duplicates in clickable positions!
  if (matchingPositions.length > 1) {
    throw new GameLogicError(
      `Single move has same clickable positions for row ${position.row}, col ${position.col}. move: ${move}.`
    );
  }

  return matchingPositions.length !== 0;
}

function getMatchingPositions(
  positionsArray: BoardPosition[],
  position: BoardPosition
) {
  return positionsArray.filter((arrayMember) =>
    positionsEqual(arrayMember, position)
  );
}

export function positionsEqual(
  position1: BoardPosition,
  position2: BoardPosition
) {
  return position1.row === position2.row && position1.col === position2.col;
}

export function getPositionPiece(
  position: BoardPosition,
  boardStateValue: BoardStateValue
): Piece {
  const piece = boardStateValue[position.row][position.col];
  if (piece) {
    return piece;
  }
  throw new GameLogicError(
    `Board position is missing a required piece. Position: ${JSON.stringify(
      position
    )}`
  );
}

export default GameBoardManager;
