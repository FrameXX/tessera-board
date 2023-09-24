import type { Ref } from "vue";
import BoardManager from "./board_manager";
import type {
  BoardPieceProps,
  MarkState,
  BooleanState,
  BoardPosition,
} from "../components/Board.vue";
import type { Turn, PieceId, Move } from "./pieces";
import { GameLogicError } from "./game";
import type BoardStateData from "./user_data/board_state";
import type { BoardStateValue } from "./user_data/board_state";

class GameBoardManager extends BoardManager {
  public onMove?: () => any;
  private _selectedPieceProps: BoardPieceProps | null = null;
  private avalibleTurns: Turn[] = [];

  constructor(
    private readonly boardStateData: BoardStateData,
    private readonly boardStateValue: BoardStateValue,
    private readonly whiteCapturedPieces: Ref<PieceId[]>,
    private readonly blackCapturedPieces: Ref<PieceId[]>,
    private readonly playerCellMarks: MarkState,
    private readonly opponentBoardMarks: MarkState,
    private readonly playerSelectedPieces: BooleanState,
    private readonly opponentSelectedPieces: BooleanState,
    private readonly higlightedCells: BooleanState
  ) {
    super();
  }

  private showCellsMarks(turns: Turn[]) {
    for (const turn of turns) {
      for (const clickablePosition of turn.clickablePositions) {
        positionIsCapturedByTurn(turn, clickablePosition)
          ? (this.playerCellMarks[clickablePosition.row][
              clickablePosition.col
            ] = "capture")
          : (this.playerCellMarks[clickablePosition.row][
              clickablePosition.col
            ] = "availible");
      }
    }
  }

  private interpretMove(move: Move, reverse: boolean = false) {
    this.clearHihlightedCells();

    // Capture pieces
    for (const capturePosition of move.captures) {
      const piece =
        this.boardStateValue[capturePosition.row][capturePosition.col];
      this.boardStateValue[capturePosition.row][capturePosition.col] = null;

      if (piece) {
        if (piece.color === "white") {
          this.blackCapturedPieces.value.push(piece.pieceId);
        } else {
          this.whiteCapturedPieces.value.push(piece.pieceId);
        }
      }
    }

    // Move piece
    if (move.action == "move") {
      const originValue =
        this.boardStateValue[move.origin.row][move.origin.col];
      this.boardStateValue[move.origin.row][move.origin.col] = null;
      this.boardStateValue[move.target.row][move.target.col] = originValue;
      if (originValue) {
        originValue.moved = true;
      }

      this.higlightedCells[move.origin.row][move.origin.col] = true;
      this.higlightedCells[move.target.row][move.target.col] = true;
    }

    if (this.onMove) {
      this.onMove();
    }
  }

  private clearHihlightedCells() {
    for (const rowIndex in this.higlightedCells) {
      for (const colIndex in this.higlightedCells[rowIndex]) {
        this.higlightedCells[rowIndex][colIndex] = false;
      }
    }
  }

  private hideAllCellMarks() {
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

  private set selectedPieceProps(pieceProps: BoardPieceProps | null) {
    if (this.selectedPieceProps) {
      this.playerSelectedPieces[this.selectedPieceProps.row][
        this.selectedPieceProps.col
      ] = false;
    }
    this.hideAllCellMarks();
    this._selectedPieceProps = null;
    if (pieceProps) {
      this.playerSelectedPieces[pieceProps.row][pieceProps.col] = true;
      const turns = pieceProps.piece.getPossibleMoves(
        // BoardPieceProps extends BoardPosition and thus can be used as a BoardPosition argument.
        pieceProps,
        this.boardStateValue
      );
      this.showCellsMarks(turns);
      this._selectedPieceProps = pieceProps;
      this.avalibleTurns = turns;
    }
  }

  private get selectedPieceProps(): BoardPieceProps | null {
    return this._selectedPieceProps;
  }

  private getPositionMatchingMove(position: BoardPosition): Move | null {
    if (!this.avalibleTurns) {
      return null;
    }

    const matchingTurns = this.avalibleTurns.filter((turn) => {
      return turnHasClickablePosition(turn, position);
    });

    if (matchingTurns.length > 1) {
      throw new GameLogicError(
        `Multiple turns have same clickable positions for row ${position.row}, col ${position.col}.`
      );
    }

    if (matchingTurns.length !== 1) {
      return null;
    }
    return matchingTurns[0].move;
  }

  public clearBoard() {
    this.selectedPieceProps = null;
    this.clearHihlightedCells();
    this.clearCapturedPieces();
  }

  public onPieceClick(boardPiece: BoardPieceProps): void {
    this.selectedPieceProps = boardPiece;
  }

  public onCellClick(position: BoardPosition): void {
    this.selectedPieceProps = null;

    let moveInterpreted = false;

    // Check if cell is on any of the clickable position of any of the turns and thus has its move
    const matchingMove = this.getPositionMatchingMove(position);

    if (matchingMove) {
      this.interpretMove(matchingMove);
      this.avalibleTurns = [];
      moveInterpreted = true;
    }

    // Take the cell click as a piece click if no move was performed on that position. This is useful if the cells with pieces are selected using tabindex.
    if (!moveInterpreted) {
      const piece = this.boardStateValue[position.row][position.col];
      if (piece) {
        this.onPieceClick({ ...position, piece });
      }
    }
  }
}

function turnHasClickablePosition(
  turn: Turn,
  position: BoardPosition
): boolean {
  const matchingPositions = getMatchingPositions(
    turn.clickablePositions,
    position
  );

  // There should be no duplicates in clickable positions!
  if (matchingPositions.length > 1) {
    throw new GameLogicError(
      `Single turn has same clickable positions for row ${position.row}, col ${position.col}. Turn: ${turn}.`
    );
  }

  return matchingPositions.length !== 0;
}

function positionIsCapturedByTurn(turn: Turn, position: BoardPosition) {
  const matchingPositions = getMatchingPositions(turn.move.captures, position);

  // There should be no duplicates in turn captured positions!
  if (matchingPositions.length > 1) {
    throw new GameLogicError(
      `Single turn has duplicate capture positions for row ${position.row}, col ${position.col}. Turn: ${turn}.`
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

export default GameBoardManager;
