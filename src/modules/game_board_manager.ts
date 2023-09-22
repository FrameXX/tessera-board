import type { Ref } from "vue";
import BoardManager from "./board_manager";
import type {
  BoardPieceProps,
  MarkState,
  BooleanState,
} from "../components/Board.vue";
import type { BoardStateValue } from "./user_data/board_state";
import type Game from "./game";
import type { Turn, PieceId, Move } from "./pieces";
import { GameLogicError } from "./game";

class GameBoardManager extends BoardManager {
  private _selectedPieceProps: BoardPieceProps | null = null;
  private avalibleTurns: Turn[] = [];

  constructor(
    private readonly game: Game,
    boardState: BoardStateValue,
    private readonly whiteCapturedPieces: Ref<PieceId[]>,
    private readonly blackCapturedPieces: Ref<PieceId[]>,
    private readonly playerCellMarks: MarkState,
    private readonly opponentBoardMarks: MarkState,
    private readonly playerSelectedPieces: BooleanState,
    private readonly opponentSelectedPieces: BooleanState,
    private readonly higlightedCells: BooleanState
  ) {
    super(boardState);
  }

  private showAvalibleCellsMarks(turns: Turn[]) {
    for (const turn of turns) {
      this.playerCellMarks[turn.move.target.row][turn.move.target.col] =
        "availible";
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
        this.boardState
      );
      this.showAvalibleCellsMarks(turns);
      this._selectedPieceProps = pieceProps;
      this.avalibleTurns = turns;
    }
  }

  private get selectedPieceProps(): BoardPieceProps | null {
    return this._selectedPieceProps;
  }

  private interpretMove(move: Move, reverse: boolean = false) {
    this.clearHihlightedCells();

    // Capture pieces
    for (const capturePosition of move.captures) {
      this.boardState[capturePosition.row][capturePosition.col] = null;
    }

    // Move piece
    if (move.action == "move") {
      const originValue = this.boardState[move.origin.row][move.origin.col];
      this.boardState[move.origin.row][move.origin.col] = null;
      this.boardState[move.target.row][move.target.col] = originValue;
      if (originValue) {
        originValue.moved = true;
      }

      this.higlightedCells[move.origin.row][move.origin.col] = true;
      this.higlightedCells[move.target.row][move.target.col] = true;
    }
  }

  public onPieceClick(boardPiece: BoardPieceProps): void {
    this.selectedPieceProps = boardPiece;
  }

  public onCellClick(row: number, col: number): void {
    this.selectedPieceProps = null;

    let moveInterpreted = false;

    if (this.avalibleTurns) {
      const matchingTurns = this.avalibleTurns.filter((turn) => {
        const matchingPositions = turn.clickablePositions.filter(
          (position) => position.row === row && position.col === col
        );
        if (matchingPositions.length > 1) {
          throw new GameLogicError(
            `Single turn has multiple same clickable positions for row ${row}, col ${col}. Turn: ${turn}.`
          );
        }
        return matchingPositions.length > 0;
      });
      if (matchingTurns.length > 1) {
        throw new GameLogicError(
          `Multiple turns have same clickable positions for row ${row}, col ${col}.`
        );
      }
      if (matchingTurns.length > 0) {
        this.interpretMove(matchingTurns[0].move);
        moveInterpreted = true;
      }
    }
    if (!moveInterpreted) {
      const piece = this.boardState[row][col];
      if (piece) {
        this.onPieceClick({ row, col, piece });
      }
    }
  }
}

export default GameBoardManager;
