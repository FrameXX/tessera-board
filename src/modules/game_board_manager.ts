import type { Ref } from "vue";
import BoardManager from "./board_manager";
import type {
  BoardPieceProps,
  MarkBoardState,
  BoardPosition,
} from "../components/Board.vue";
import type { BooleanBoardState } from "./user_data/boolean_board_state";
import {
  getTargetMatchingPaths,
  type Path,
  type PieceId,
} from "./pieces/piece";
import { GameLogicError, type Winner, type PlayerColor } from "./game";
import type { BoardStateValue } from "./user_data/board_state";
import Move from "./moves/move";
import SelectPieceDialog from "./dialogs/select_piece";
import { isMoveShift } from "./moves/shift";
import { isMoveTransform } from "./moves/promotion";
import { isMoveCastling } from "./moves/castling";
import type ToastManager from "./toast_manager";

class GameBoardManager extends BoardManager {
  private _selectedPiece: BoardPieceProps | null = null;
  private _selectedCell: BoardPosition | null = null;
  private availibleMoves: Move[] = [];

  constructor(
    private whiteCapturingPaths: Ref<Path[]>,
    private blackCapturingPaths: Ref<Path[]>,
    private readonly playerColor: Ref<PlayerColor>,
    private readonly winner: Ref<Winner>,
    private readonly secondCheckboard: Ref<boolean>,
    private readonly playerBoard: boolean,
    private readonly playingColor: Ref<PlayerColor>,
    private readonly boardStateValue: BoardStateValue,
    private readonly whiteCapturedPieces: Ref<PieceId[]>,
    private readonly blackCapturedPieces: Ref<PieceId[]>,
    private readonly cellsMarks: MarkBoardState,
    private readonly selectedPieces: Ref<BoardPosition[]>,
    private readonly selectedCells: Ref<BoardPosition[]>,
    // @ts-ignore
    private readonly draggingOverCells: Ref<BoardPosition[]>,
    private readonly higlightedCells: BooleanBoardState,
    private readonly selectPieceDialog: SelectPieceDialog,
    private readonly audioEffects: Ref<boolean>,
    private readonly pieceMoveAudioEffect: Howl,
    private readonly pieceRemoveAudioEffect: Howl,
    private readonly useVibrations: Ref<boolean>,
    private readonly showCapturingPieces: Ref<boolean>,
    private readonly banPromotionToUncapturedPieces: Ref<boolean>,
    private readonly showOtherAvailibleMoves: Ref<boolean>,
    private readonly moveIndex: Ref<number>,
    // @ts-ignore
    private readonly toastManager: ToastManager
  ) {
    super();
  }

  private clearHihlightedCellsPositions() {
    for (const rowIndex in this.higlightedCells) {
      for (const colIndex in this.higlightedCells[rowIndex]) {
        this.higlightedCells[rowIndex][colIndex] = false;
      }
    }
  }

  private clearCellsMarks() {
    for (const rowIndex in this.cellsMarks) {
      for (const colIndex in this.cellsMarks[rowIndex]) {
        this.cellsMarks[rowIndex][colIndex] = null;
      }
    }
  }

  private clearCapturedPieces() {
    this.whiteCapturedPieces.value = [];
    this.blackCapturedPieces.value = [];
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

  private invalidatePiecesCache() {
    for (const rowIndex in this.boardStateValue) {
      for (const colIndex in this.boardStateValue[rowIndex]) {
        const piece = this.boardStateValue[rowIndex][colIndex];
        if (piece) {
          piece.invalidateCache();
        }
      }
    }
  }

  private set selectedPiece(pieceProps: BoardPieceProps | null) {
    this.clearCellsMarks();
    this.clearSelectedPiece();
    this.clearAvailibleMoves();
    this._selectedPiece = null;

    // Player unselected
    if (!pieceProps) return;

    this._selectedPiece = pieceProps;
    this.selectedPieces.value.push(pieceProps);

    if (
      !this.showOtherAvailibleMoves.value &&
      pieceProps.piece.color !== this.playingColor.value
    )
      return;

    const moves = pieceProps.piece.getPossibleMoves(
      pieceProps,
      this.boardStateValue,
      pieceProps.piece.color === "white"
        ? this.blackCapturingPaths.value
        : this.whiteCapturingPaths.value
    );
    moves.forEach((move) =>
      move.showCellMarks(this.cellsMarks, this.boardStateValue)
    );
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

  private getPiecePosition(id: string): BoardPosition | null {
    for (const rowIndex in this.cellsMarks) {
      for (const colIndex in this.cellsMarks[rowIndex]) {
        const piece = this.boardStateValue[rowIndex][colIndex];
        if (!piece) {
          continue;
        }
        if (piece.id != id) {
          continue;
        }
        return { row: +rowIndex, col: +colIndex };
      }
    }

    return null;
  }

  private async interpretMove(move: Move) {
    this.selectedPiece = null;
    this.clearHihlightedCellsPositions();
    if (isMoveShift(move)) {
      await move.perform(
        this.boardStateValue,
        this.blackCapturedPieces,
        this.whiteCapturedPieces,
        this.higlightedCells,
        this.audioEffects.value,
        this.pieceMoveAudioEffect,
        this.pieceRemoveAudioEffect,
        this.useVibrations.value
      );
    } else if (isMoveTransform(move)) {
      await move.perform(
        this.boardStateValue,
        this.blackCapturedPieces,
        this.whiteCapturedPieces,
        this.higlightedCells,
        this.selectPieceDialog,
        this.banPromotionToUncapturedPieces,
        this.audioEffects.value,
        this.pieceMoveAudioEffect,
        this.pieceRemoveAudioEffect,
        this.useVibrations.value
      );
    } else if (isMoveCastling(move)) {
      await move.perform(
        this.boardStateValue,
        this.higlightedCells,
        this.audioEffects.value,
        this.pieceMoveAudioEffect
      );
    }
    this.moveIndex.value++;
    this.invalidatePiecesCache();
    this.updateCapturingPaths();
  }

  private getCapturingPositionPath(
    position: BoardPosition,
    origin: BoardPosition
  ): Path {
    return { origin: origin, target: position };
  }

  private transformToPaths(
    boardPositions: BoardPosition[],
    origin: BoardPosition
  ) {
    return boardPositions.map((position) =>
      this.getCapturingPositionPath(position, origin)
    );
  }

  private get selectedCell(): BoardPosition | null {
    return this._selectedCell;
  }

  private showCellCapturingPieces(position: BoardPosition) {
    const paths = getTargetMatchingPaths(position, [
      ...this.whiteCapturingPaths.value,
      ...this.blackCapturingPaths.value,
    ]);
    for (const path of paths) {
      const origin = path.origin;
      const piece = this.boardStateValue[origin.row][origin.col];
      if (!piece) {
        throw new GameLogicError(
          `Path is defined from an origin that has no piece. Origin: ${JSON.stringify(
            origin
          )}`
        );
      }
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
    if (this.showCapturingPieces.value) this.showCellCapturingPieces(position);

    this._selectedCell = position;
  }

  public updateCapturingPaths() {
    let whiteCapturingPaths: Path[] = [];
    let blackCapturingPaths: Path[] = [];
    for (const rowIndex in this.boardStateValue) {
      for (const colIndex in this.boardStateValue[rowIndex]) {
        const piece = this.boardStateValue[rowIndex][colIndex];
        if (!piece) {
          continue;
        }
        const origin: BoardPosition = {
          row: +rowIndex,
          col: +colIndex,
        };
        if (piece.color === "white") {
          whiteCapturingPaths = [
            ...whiteCapturingPaths,
            ...this.transformToPaths(
              piece.getCapturingPositions(origin, this.boardStateValue),
              origin
            ),
          ];
        } else {
          blackCapturingPaths = [
            ...blackCapturingPaths,
            ...this.transformToPaths(
              piece.getCapturingPositions(origin, this.boardStateValue),
              origin
            ),
          ];
        }
      }
    }
    this.whiteCapturingPaths.value = whiteCapturingPaths;
    this.blackCapturingPaths.value = blackCapturingPaths;
  }

  public resetBoard() {
    this.selectedPiece = null;
    this.selectedCell = null;
    this.clearHihlightedCellsPositions();
    this.clearCapturedPieces();
    this.invalidatePiecesCache();
    this.updateCapturingPaths();
  }

  private getMoveIfPossible(position: BoardPosition): Move | null {
    if (this.winner.value !== "none") return null;
    if (!this.availibleMoves || !this.selectedPiece) return null;
    if (this.secondCheckboard.value) {
      if (
        this.selectedPiece.piece.color !== this.playerColor.value &&
        this.playerBoard
      )
        return null;
      if (
        this.selectedPiece.piece.color === this.playerColor.value &&
        !this.playerBoard
      )
        return null;
    }
    if (this.selectedPiece.piece.color !== this.playingColor.value) return null;
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
    this.interpretMove(matchingMove);
    return true;
  }

  public onPieceDragStart(
    boardPiece: BoardPieceProps,
    targetPosition: BoardPosition
  ): void {
    this.onPieceDragOverCell(boardPiece, targetPosition);
    if (this.selectedPiece === null) {
      this.onPieceClick(boardPiece);
      return;
    }
    if (!positionsEqual(boardPiece, this.selectedPiece))
      this.onPieceClick(boardPiece);
  }

  public onPieceDragOverCell(
    boardPiece: BoardPieceProps,
    targetPosition: BoardPosition
  ): void {
    if (
      this.getMoveIfPossible(targetPosition) !== null ||
      positionsEqual(boardPiece, targetPosition)
    ) {
      this.clearDraggingOverCells();
      this.draggingOverCells.value.push(targetPosition);
    }
  }

  public onPieceDragEnd(
    boardPiece: BoardPieceProps,
    targetPosition: BoardPosition
  ): void {
    this.clearDraggingOverCells();
    const matchingMove = this.getMoveIfPossible(targetPosition);
    if (matchingMove !== null) {
      this.interpretMove(matchingMove);
    }
  }

  // Called by Board component
  public onPieceClick(boardPiece: BoardPieceProps): void {
    const position = this.getPiecePosition(boardPiece.piece.id);
    if (position) {
      const moved = this.moveToIfPossible(position);
      if (moved) return;
    }

    // Unselect cell
    if (this.selectedCell) this.selectedCell = null;
    if (this.selectedPiece === null) {
      this.selectedPiece = boardPiece;
      return;
    }
    if (!positionsEqual(this.selectedPiece, boardPiece)) {
      this.selectedPiece = boardPiece;
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
    const piece = this.boardStateValue[position.row][position.col];
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
    move.getClickablePositions(),
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

export default GameBoardManager;
