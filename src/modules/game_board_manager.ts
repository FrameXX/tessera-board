import type { Ref } from "vue";
import BoardManager from "./board_manager";
import type {
  BoardPieceProps,
  MarkBoardState,
  BooleanBoardState,
  BoardPosition,
} from "../components/Board.vue";
import type { Turn, PieceId, Move } from "./pieces/piece";
import { GameLogicError } from "./game";
import type BoardStateData from "./user_data/board_state";
import type { BoardStateValue } from "./user_data/board_state";
import type Piece from "./pieces/piece";

class GameBoardManager extends BoardManager {
  private _selectedPieceProps: BoardPieceProps | null = null;
  private avalibleTurns: Turn[] = [];

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
    pieceMoveAudioEffect: Howl
  ) {
    super(pieceMoveAudioEffect);
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

  private capturePieces(capturePositions: BoardPosition[]) {
    const pieces: Piece[] = [];

    for (const position of capturePositions) {
      const piece = this.boardStateValue[position.row][position.col];
      if (!piece) {
        continue;
      }
      this.boardStateValue[position.row][position.col] = null;
      pieces.push(piece);
    }

    return pieces;
  }

  private addCapturedPieces(pieces: Piece[]) {
    for (const piece of pieces) {
      if (piece.color === "white") {
        this.blackCapturedPieces.value.push(piece.pieceId);
      } else {
        this.whiteCapturedPieces.value.push(piece.pieceId);
      }
    }
  }

  private movePiece(origin: BoardPosition, target: BoardPosition) {
    const originValue = this.boardStateValue[origin.row][origin.col];
    this.boardStateValue[origin.row][origin.col] = null;
    this.boardStateValue[target.row][target.col] = originValue;
  }

  private highlightCellsPositions(positions: BoardPosition[]) {
    for (const position of positions) {
      this.higlightedCells[position.row][position.col] = true;
    }
  }

  private interpretMove(move: Move, reverse: boolean = false) {
    const pieces = this.capturePieces(move.captures);
    this.addCapturedPieces(pieces);

    if (move.action == "move") {
      this.movePiece(move.origin, move.target);
    }

    this.dispatchEvent(new Event("interpret-move"));
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

  private clearAvailibleTurns() {
    this.avalibleTurns = [];
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
    this.clearAvailibleTurns();
    this._selectedPieceProps = null;
    if (!pieceProps) {
      return;
    }

    if (pieceProps) {
      this.playerHighlightedPieces[pieceProps.row][pieceProps.col] = true;
      const turns = pieceProps.piece.getPossibleMoves(
        pieceProps,
        this.boardStateValue
      );
      this.showCellsMarks(turns);
      this.avalibleTurns = turns;
      this._selectedPieceProps = pieceProps;
    }
  }

  private get selectedPieceProps(): BoardPieceProps | null {
    return this._selectedPieceProps;
  }

  private getPositionMatchingTurn(position: BoardPosition): Turn | null {
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
    return matchingTurns[0];
  }

  public resetBoard() {
    this.selectedPieceProps = null;
    this.clearHihlightedCellsPositions();
    this.clearCapturedPieces();
  }

  // Called by Board component
  public onPieceClick(boardPiece: BoardPieceProps): void {
    // There's no need to handle cases where user clicks on a piece to capture it because the mark shows over the piece making the click register as a cell click.
    this.selectedPieceProps = boardPiece;
  }

  // Called by Board component
  public onCellClick(position: BoardPosition): void {
    let moveInterpreted = false;

    // Check if cell is on any of the clickable position of any of the turns and thus has its move
    const matchingTurn = this.getPositionMatchingTurn(position);

    if (matchingTurn) {
      this.clearHihlightedCellsPositions();
      this.highlightCellsPositions([
        matchingTurn.move.origin,
        matchingTurn.move.target,
      ]);
      this.interpretMove(matchingTurn.move);
      matchingTurn.author.onMove(matchingTurn.move);
      moveInterpreted = true;
    }

    this.selectedPieceProps = null;

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
