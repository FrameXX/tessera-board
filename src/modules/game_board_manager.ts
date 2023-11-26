import type { ComputedRef, Ref } from "vue";
import type {
  BoardPieceProps,
  BoardPosition,
  BoardStateValue,
  MarkBoardState,
} from "./board_manager";
import BoardManager from "./board_manager";
import type { PiecesImportance } from "./pieces/piece";
import type Piece from "./pieces/piece";
import {
  getTargetMatchingPaths,
  type Path,
  type PieceId,
} from "./pieces/piece";
import { GameLogicError, type Winner, type PlayerColor } from "./game";
import type Move from "./moves/move";
import type SelectPieceDialog from "./dialogs/select_piece";
import { isMoveShift } from "./moves/shift";
import { isMovePromotion } from "./moves/promotion";
import { isMoveCastling } from "./moves/castling";
import { getRandomArrayValue } from "./utils/misc";
import type BoardStateData from "./user_data/board_state";

class GameBoardManager extends BoardManager {
  private _selectedPiece: BoardPieceProps | null = null;
  private _selectedCell: BoardPosition | null = null;
  private availibleMoves: Move[] = [];
  private dragEndTimeout: boolean = false;

  constructor(
    private whiteCapturingPaths: Ref<Path[]>,
    private blackCapturingPaths: Ref<Path[]>,
    private readonly playerColor: Ref<PlayerColor>,
    private readonly winner: Ref<Winner>,
    private readonly secondCheckboard: Ref<boolean>,
    private readonly playerBoard: boolean,
    private readonly playingColor: Ref<PlayerColor>,
    private readonly boardStateValue: BoardStateValue,
    private readonly boardStateData: BoardStateData,
    private readonly whiteCapturedPieces: Ref<PieceId[]>,
    private readonly blackCapturedPieces: Ref<PieceId[]>,
    private readonly cellsMarks: MarkBoardState,
    private readonly selectedPieces: Ref<BoardPosition[]>,
    private readonly selectedCells: Ref<BoardPosition[]>,
    private readonly draggingOverCells: Ref<BoardPosition[]>,
    private readonly selectPieceDialog: SelectPieceDialog,
    private readonly audioEffects: Ref<boolean>,
    private readonly pieceMoveAudioEffect: Howl,
    private readonly pieceRemoveAudioEffect: Howl,
    private readonly useVibrations: Ref<boolean>,
    private readonly showCapturingPieces: Ref<boolean>,
    private readonly reviveFromCapturedPieces: Ref<boolean>,
    private readonly showOtherAvailibleMoves: Ref<boolean>,
    private readonly ignorePiecesProtections: Ref<boolean>,
    private readonly pieceProps: ComputedRef<BoardPieceProps[]>,
    private readonly piecesImportance: PiecesImportance,
    private readonly moveList: Ref<Move[]>,
    private readonly moveIndex: Ref<number>,
    private readonly lastMove: ComputedRef<Move | null>
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

  private shouldShowMoves(pieceColor: PlayerColor) {
    if (this.showOtherAvailibleMoves.value || this.winner.value !== "none")
      return true;
    if (!this.secondCheckboard.value && pieceColor !== this.playingColor.value)
      return false;
    if (this.secondCheckboard.value) {
      if (
        (this.playerBoard && pieceColor !== this.playerColor.value) ||
        (!this.playerBoard && pieceColor === this.playerColor.value)
      ) {
        return false;
      }
    }
    return true;
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

    if (!this.shouldShowMoves(pieceProps.piece.color)) {
      return;
    }

    const moves = pieceProps.piece.getPossibleMoves(
      pieceProps,
      this.boardStateValue,
      this.boardStateData,
      this.piecesImportance,
      this.blackCapturedPieces,
      this.whiteCapturedPieces,
      this.reviveFromCapturedPieces,
      this.ignorePiecesProtections,
      this.lastMove
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

  public performRandomMove(pieceColor?: PlayerColor) {
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
        this.boardStateValue,
        this.boardStateData,
        this.piecesImportance,
        this.blackCapturedPieces,
        this.whiteCapturedPieces,
        this.reviveFromCapturedPieces,
        this.ignorePiecesProtections,
        this.lastMove
      );
    } while (moves.length === 0);
    const chosenMove = getRandomArrayValue(moves);
    this.performMove(chosenMove);
  }

  public async performMove(move: Move) {
    this.selectedPiece = null;
    if (isMoveShift(move)) {
      await move.perform(
        this.boardStateValue,
        this.blackCapturedPieces,
        this.whiteCapturedPieces,
        this.audioEffects.value,
        this.pieceMoveAudioEffect,
        this.pieceRemoveAudioEffect,
        this.useVibrations.value
      );
    } else if (isMovePromotion(move)) {
      await move.perform(
        this.boardStateValue,
        this.blackCapturedPieces,
        this.whiteCapturedPieces,
        this.selectPieceDialog,
        this.reviveFromCapturedPieces,
        this.audioEffects.value,
        this.pieceMoveAudioEffect,
        this.pieceRemoveAudioEffect,
        this.useVibrations.value
      );
    } else if (isMoveCastling(move)) {
      await move.perform(
        this.boardStateValue,
        this.audioEffects.value,
        this.pieceMoveAudioEffect
      );
    }
    this.moveIndex.value++;
    this.moveList.value.push(move);
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

  public resetBoard() {
    this.selectedPiece = null;
    this.selectedCell = null;
    this.clearCapturedPieces();
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
