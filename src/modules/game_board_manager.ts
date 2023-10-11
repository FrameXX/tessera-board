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
import { GameLogicError, type PlayerColor } from "./game";
import type { BoardStateValue } from "./user_data/board_state";
import Move from "./moves/move";
import SelectPieceDialog from "./dialogs/select_piece";
import { isMoveShift } from "./moves/shift";
import { isMoveTransform } from "./moves/promote";
import { isMoveCastling } from "./moves/castling";
import type ToastManager from "./toast_manager";

class GameBoardManager extends BoardManager {
  private _selectedPiece: BoardPieceProps | null = null;
  private _selectedCell: BoardPosition | null = null;
  private availibleMoves: Move[] = [];
  private whiteCapturingPaths: Path[] = [];
  private blackCapturingPaths: Path[] = [];

  constructor(
    private readonly playingColor: Ref<PlayerColor>,
    private readonly boardStateValue: BoardStateValue,
    private readonly whiteCapturedPieces: Ref<PieceId[]>,
    private readonly blackCapturedPieces: Ref<PieceId[]>,
    private readonly playerCellMarks: MarkBoardState,
    // @ts-ignore
    private readonly opponentBoardMarks: MarkBoardState,
    private readonly playerSelectedPieces: Ref<BoardPosition[]>,
    // @ts-ignore
    private readonly opponentSelectedPieces: Ref<BoardPosition[]>,
    private readonly playerSelectedCells: Ref<BoardPosition[]>,
    // @ts-ignore
    private readonly opponentSelectedCells: Ref<BoardPosition[]>,
    private readonly higlightedCells: BooleanBoardState,
    private readonly selectPieceDialog: SelectPieceDialog,
    private readonly audioEffects: Ref<boolean>,
    private readonly pieceMoveAudioEffect: Howl,
    private readonly pieceRemoveAudioEffect: Howl,
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
    for (const rowIndex in this.playerCellMarks) {
      for (const colIndex in this.playerCellMarks[rowIndex]) {
        this.playerCellMarks[rowIndex][colIndex] = null;
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
      this.playerSelectedPieces.value = [];
    }
  }

  private clearSelectedCell() {
    if (this.selectedCell) {
      this.playerSelectedCells.value = [];
    }
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
    // The selected position is the same as the current one
    if (this.selectedPiece && pieceProps) {
      if (positionsEqual(pieceProps, this.selectedPiece)) return;
    }

    this.clearCellsMarks();
    this.clearSelectedPiece();
    this.clearAvailibleMoves();
    this._selectedPiece = null;

    // Player unselected
    if (!pieceProps) return;

    this._selectedPiece = pieceProps;
    this.playerSelectedPieces.value.push(pieceProps);

    if (
      !this.showOtherAvailibleMoves.value &&
      pieceProps.piece.color !== this.playingColor.value
    )
      return;

    const moves = pieceProps.piece.getPossibleMoves(
      pieceProps,
      this.boardStateValue,
      pieceProps.piece.color === "white"
        ? this.blackCapturingPaths
        : this.whiteCapturingPaths
    );
    moves.forEach((move) =>
      move.showCellMarks(this.playerCellMarks, this.boardStateValue)
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
    for (const rowIndex in this.playerCellMarks) {
      for (const colIndex in this.playerCellMarks[rowIndex]) {
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
        this.audioEffects,
        this.pieceMoveAudioEffect,
        this.pieceRemoveAudioEffect
      );
    } else if (isMoveTransform(move)) {
      await move.perform(
        this.boardStateValue,
        this.blackCapturedPieces,
        this.whiteCapturedPieces,
        this.higlightedCells,
        this.selectPieceDialog,
        this.banPromotionToUncapturedPieces,
        this.audioEffects,
        this.pieceMoveAudioEffect,
        this.pieceRemoveAudioEffect
      );
    } else if (isMoveCastling(move)) {
      await move.perform(
        this.boardStateValue,
        this.higlightedCells,
        this.audioEffects,
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
      ...this.whiteCapturingPaths,
      ...this.blackCapturingPaths,
    ]);
    for (const path of paths) {
      const origin = path.origin;
      const piece = this.boardStateValue[origin.row][origin.col];
      if (!piece) {
        throw new GameLogicError(
          `Path is defined from an origin that has no piece. Origin: ${origin}`
        );
      }
      this.playerCellMarks[origin.row][origin.col] = "capturing";
    }
  }

  private set selectedCell(position: BoardPosition | null) {
    // Same cell is already selected
    if (this.selectedCell && position) {
      if (positionsEqual(this.selectedCell, position)) {
        return;
      }
    }

    this.clearSelectedCell();
    this.clearCellsMarks();
    this._selectedCell = null;

    if (!position) {
      return;
    }

    this.playerSelectedCells.value.push(position);
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
    this.whiteCapturingPaths = whiteCapturingPaths;
    this.blackCapturingPaths = blackCapturingPaths;
  }

  public resetBoard() {
    this.selectedPiece = null;
    this.selectedCell = null;
    this.clearHihlightedCellsPositions();
    this.clearCapturedPieces();
    this.invalidatePiecesCache();
    this.updateCapturingPaths();
  }

  private moveToIfPossible(position: BoardPosition): boolean {
    if (!this.availibleMoves || !this.selectedPiece) return false;

    if (this.selectedPiece.piece.color !== this.playingColor.value)
      return false;

    const matchingMove = this.getPositionMatchingMove(position);
    if (!matchingMove) {
      return false;
    }
    this.interpretMove(matchingMove);
    return true;
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
    this.selectedPiece = boardPiece;
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
    this.selectedCell = position;
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
