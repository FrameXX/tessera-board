import type { Ref } from "vue";
import BoardManager from "./board_manager";
import type {
  BoardPieceProps,
  MarkBoardState,
  BooleanBoardState,
  BoardPosition,
} from "../components/Board.vue";
import type { Piece, PieceId } from "./pieces/piece";
import { GameLogicError } from "./game";
import type BoardStateData from "./user_data/board_state";
import type { BoardStateValue } from "./user_data/board_state";
import Move from "./moves/move";
import SelectPieceDialog from "./dialogs/select_piece";
import { getPieceFromRaw, type RawPiece } from "./pieces/rawPiece";
import { getElementInstanceById, waitForTransitionEnd } from "./utils/elements";
import { isMoveShift } from "./moves/shift";
import { isMoveTransform } from "./moves/transform";

class GameBoardManager extends BoardManager {
  private _selectedPieceProps: BoardPieceProps | null = null;
  private availibleMoves: Move[] = [];

  constructor(
    private readonly boardStateData: BoardStateData,
    private readonly boardStateValue: BoardStateValue,
    private readonly whiteCapturedPieces: Ref<PieceId[]>,
    private readonly blackCapturedPieces: Ref<PieceId[]>,
    private readonly playerCellMarks: MarkBoardState,
    private readonly opponentBoardMarks: MarkBoardState,
    private readonly playerHighlightedPieces: BooleanBoardState,
    private readonly opponentHighlightedPieces: BooleanBoardState,
    private readonly higlightedCells: BooleanBoardState,
    private readonly selectPieceDialog: SelectPieceDialog,
    pieceMoveAudioEffect: Howl
  ) {
    super(pieceMoveAudioEffect);
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

  private clearHighlightedPiece() {
    if (this.selectedPieceProps) {
      this.playerHighlightedPieces[this.selectedPieceProps.row][
        this.selectedPieceProps.col
      ] = false;
    }
  }

  private set selectedPieceProps(pieceProps: BoardPieceProps | null) {
    // The selected position is the same as the current one
    if (this.selectedPieceProps && pieceProps) {
      if (positionsEqual(pieceProps, this.selectedPieceProps)) {
        return;
      }
    }

    // The selected position has no piece and currently no piece is selected
    if (!pieceProps && !this.selectedPieceProps) {
      return;
    }

    this.clearCellsMarks();
    this.clearHighlightedPiece();
    this.clearAvailibleMoves();
    this._selectedPieceProps = null;

    // Player unselected
    if (!pieceProps) {
      return;
    }

    if (pieceProps) {
      this.playerHighlightedPieces[pieceProps.row][pieceProps.col] = true;
      const moves = pieceProps.piece.getPossibleMoves(
        pieceProps,
        this.boardStateValue
      );
      moves.forEach((move) =>
        move.showCellMarks(this.playerCellMarks, this.boardStateValue)
      );
      this.availibleMoves = moves;
      this._selectedPieceProps = pieceProps;
    }
  }

  private get selectedPieceProps(): BoardPieceProps | null {
    return this._selectedPieceProps;
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

  private interpretMove(move: Move) {
    this.selectedPieceProps = null;
    this.clearHihlightedCellsPositions();
    if (isMoveShift(move)) {
      move.perform(
        this.boardStateValue,
        this.blackCapturedPieces,
        this.whiteCapturedPieces,
        this.higlightedCells
      );
    } else if (isMoveTransform(move)) {
      move.perform(
        this.boardStateValue,
        this.blackCapturedPieces,
        this.whiteCapturedPieces,
        this.higlightedCells,
        this.selectPieceDialog
      );
    }
    this.dispatchEvent(new Event("move"));
  }

  public resetBoard() {
    this.selectedPieceProps = null;
    this.clearHihlightedCellsPositions();
    this.clearCapturedPieces();
  }

  // Called by Board component
  public onPieceClick(boardPiece: BoardPieceProps): void {
    if (this.availibleMoves) {
      const position = this.getPiecePosition(boardPiece.piece.id);
      if (position) {
        const matchingMove = this.getPositionMatchingMove(position);
        if (matchingMove) {
          this.interpretMove(matchingMove);
          return;
        }
      }
    }

    this.selectedPieceProps = boardPiece;
  }

  // Called by Board component
  public onCellClick(position: BoardPosition): void {
    let moveInterpreted = false;

    // Check if cell is on any of the clickable position of any of the availible moves
    const matchingMove = this.getPositionMatchingMove(position);

    if (matchingMove) {
      this.interpretMove(matchingMove);
      moveInterpreted = true;
    }

    // Take the cell click as a piece click if no move was performed on that position. This is useful if the cells with pieces are selected using tabindex.
    if (!moveInterpreted) {
      const piece = this.boardStateValue[position.row][position.col];
      if (piece) this.onPieceClick({ ...position, piece });
    }
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

function positionsEqual(position1: BoardPosition, position2: BoardPosition) {
  return position1.row === position2.row && position1.col === position2.col;
}

export function addCapturedPiece(
  piece: Piece,
  blackCapturedPieces: Ref<PieceId[]>,
  whiteCapturedPieces: Ref<PieceId[]>
) {
  if (piece.color === "white") {
    blackCapturedPieces.value.push(piece.pieceId);
  } else {
    whiteCapturedPieces.value.push(piece.pieceId);
  }
}

export async function transformPositionValue(
  position: BoardPosition,
  piece: RawPiece,
  boardStateValue: BoardStateValue
) {
  boardStateValue[position.row][position.col] = getPieceFromRaw(piece);
}

export async function movePositionValue(
  origin: BoardPosition,
  target: BoardPosition,
  boardStateValue: BoardStateValue
) {
  const piece = boardStateValue[origin.row][origin.col];
  if (!piece) {
    return;
  }
  boardStateValue[target.row][target.col] = piece;
  boardStateValue[origin.row][origin.col] = null;
  const pieceElement = getElementInstanceById(`piece-${piece.id}`, SVGElement);
  await waitForTransitionEnd(pieceElement);
}

export function capturePosition(
  position: BoardPosition,
  boardStateValue: BoardStateValue,
  blackCapturedPieces: Ref<PieceId[]>,
  whiteCapturedPieces: Ref<PieceId[]>
) {
  const piece = boardStateValue[position.row][position.col];
  if (!piece) {
    return;
  }
  boardStateValue[position.row][position.col] = null;
  addCapturedPiece(piece, blackCapturedPieces, whiteCapturedPieces);
}

export default GameBoardManager;
