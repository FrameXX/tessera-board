import type { ComputedRef } from "vue";
import { computed } from "vue";
import type { PieceContext, BoardPosition } from "./board_manager";
import BoardManager from "./board_manager";
import type { Piece } from "./pieces/piece";
import type Game from "./game";
import type Move from "./moves/move";
import type { PlayerColor } from "./utils/game";
import {
  GameLogicError,
  getTargetMatchingPaths,
  positionsArrayHasPosition,
  positionsEqual,
} from "./utils/game";

class GameBoardManager extends BoardManager {
  private availibleMoves: Move[] = [];
  private dragEndTimeoutActive: boolean = false;
  public readonly contentRotated: ComputedRef<boolean> = computed(() => {
    if (this.game.settings.secondCheckboardEnabled.value)
      return this.playerColor === "black";
    if (this.game.settings.tableModeEnabled.value)
      return (
        !this.game.primaryPlayerPlaying.value ===
        (this.game.primaryPlayerColor.value === "white")
      );
    return false;
  });
  public readonly boardRotated: ComputedRef<boolean> = computed(() => {
    if (this.game.settings.secondCheckboardEnabled.value) {
      if (this.game.settings.tableModeEnabled.value)
        return (this.playerColor === "black") === this.isPrimaryBoard;
      return this.playerColor === "black";
    }
    return (
      this.game.settings.tableModeEnabled.value &&
      this.game.primaryPlayerColor.value !== "white"
    );
  });

  constructor(
    private readonly game: Game,
    private readonly isPrimaryBoard: boolean
  ) {
    super();
  }

  private get playerColor() {
    return this.isPrimaryBoard
      ? this.game.primaryPlayerColor.value
      : this.game.secondaryPlayerColor.value;
  }

  private invalidateAvailibleMoves() {
    this.availibleMoves = [];
  }

  private isMarkingAvailibleMovesPermitted(pieceColor: PlayerColor) {
    if (
      this.game.settings.markUnactivePlayerAvailibleMoves.value ||
      this.game.winner.value !== "none"
    )
      return true;

    if (
      !this.game.settings.secondCheckboardEnabled.value &&
      pieceColor !== this.game.playingColor.value
    )
      return false;

    if (!this.game.settings.secondCheckboardEnabled.value) return true;

    if (
      (this.isPrimaryBoard &&
        pieceColor !== this.game.primaryPlayerColor.value) ||
      (!this.isPrimaryBoard &&
        pieceColor === this.game.primaryPlayerColor.value)
    )
      return false;

    return true;
  }

  private setAvailibleMoves(pieceContext: PieceContext) {
    this.availibleMoves = pieceContext.piece.getPossibleMoves(
      this.game,
      pieceContext
    );
  }

  private markMoves(moves: Move[]) {
    for (const move of moves) {
      move.showCellMarks(this.cellMarks, this.game.boardState);
    }
  }

  private unselectPiece() {
    if (!this.selectedPiece.value) {
      throw new GameLogicError("Cannot unselect Piece if no cell is selected.");
    }
    this.selectedPiece.value = null;
    this.clearCellMarks();
  }

  private selectPiece(pieceContext: PieceContext) {
    if (this.selectedPiece.value) {
      throw new GameLogicError(
        `Cannot select more than 1 piece. Piece "${JSON.stringify(
          this.selectedPiece.value
        )} is already slected.`
      );
    }

    if (this.selectedCell.value) this.unselectCell();

    this.invalidateAvailibleMoves();
    this.selectedPiece.value = pieceContext;

    if (!this.isMarkingAvailibleMovesPermitted(pieceContext.piece.color))
      return;

    this.setAvailibleMoves(pieceContext);
    this.markMoves(this.availibleMoves);
  }

  /**
   * This method returns a move that has provided position in its clickable positions if there's one.
   * @method
   * @param position
   * @returns Move or null in case no move targets the positon.
   */
  private getAvailibleMoveWithClickablePosition(
    position: BoardPosition
  ): Move | null {
    for (const move of this.availibleMoves) {
      if (positionsArrayHasPosition(move.clickablePositions, position))
        return move;
    }
    return null;
  }

  private markCellCapturingPieces(position: BoardPosition) {
    const paths = getTargetMatchingPaths(position, [
      ...this.game.whiteCapturingPaths.value,
      ...this.game.blackCapturingPaths.value,
    ]);
    for (const path of paths) {
      const origin = path.origin;
      this.cellMarks[origin.row][origin.col] = "capturing";
    }
  }

  private selectCell(position: BoardPosition) {
    if (this.selectedCell.value) {
      throw new GameLogicError(
        `Cannot select cell. Cell "${JSON.stringify(
          this.selectedCell.value
        )}" is already selected.`
      );
    }

    if (this.selectedPiece.value) this.unselectPiece();

    this.selectedCell.value = position;
    if (this.game.settings.markCellCapturingPieces.value)
      this.markCellCapturingPieces(position);
  }

  public unselectAll() {
    if (this.selectedPiece.value) this.unselectPiece();
    if (this.selectedCell.value) this.unselectCell();
  }

  private unselectCell() {
    if (!this.selectedCell.value) {
      throw new GameLogicError("Cannot unselect Cell if no cell is selected.");
    }
    this.selectedCell.value = null;
    this.clearCellMarks();
  }

  /**
   * This method is called by Board component when a user initializes a dragging sequence on a piece.
   * @method
   * @param targetPosition
   * @param pieceContext
   * @returns
   */
  public onPieceDragStart(
    targetPosition: BoardPosition,
    pieceContext: PieceContext
  ): void {
    // Select piece if not selected already
    if (this.selectedPiece.value) {
      if (!positionsEqual(this.selectedPiece.value, pieceContext)) {
        this.unselectPiece();
        this.selectPiece(pieceContext);
      }
    } else {
      this.selectPiece(pieceContext);
    }

    this.onPieceDragOverCell(targetPosition, pieceContext);
    if (!this.selectedPiece.value) {
      this.onPieceClick(pieceContext);
      return;
    }
    if (!positionsEqual(pieceContext, this.selectedPiece.value))
      this.onPieceClick(pieceContext);
  }

  /**
   * This function is called by BoardComponent when the user dragging a piece moves from one position (cell) to another.
   * @method
   * @param targetPosition
   * @param pieceContext
   * @returns
   */
  public onPieceDragOverCell(
    targetPosition: BoardPosition,
    pieceContext: PieceContext
  ): void {
    // A dragged piece can be returned to its original position.
    if (positionsEqual(targetPosition, pieceContext)) {
      this.draggingOverCell.value = targetPosition;
      return;
    }

    const matchingMove =
      this.getAvailibleMoveWithClickablePosition(targetPosition);

    this.draggingOverCell.value = matchingMove ? targetPosition : null;
  }

  private temporarilyActivateDragEndTimeout() {
    this.dragEndTimeoutActive = true;
    setTimeout(() => {
      this.dragEndTimeoutActive = false;
    }, 100);
  }

  /**
   * This method is called by Board component when the user dragging a Piece ends the dragging sequence.
   * @method
   * @param targetPosition
   * @returns
   */
  public onPieceDragEnd(targetPosition: BoardPosition): void {
    this.temporarilyActivateDragEndTimeout();
    this.draggingOverCell.value = null;
    const matchingMove =
      this.getAvailibleMoveWithClickablePosition(targetPosition);
    if (!matchingMove) {
      return;
    }
    this.registerMove(matchingMove);
  }

  private isMovePerformationPermitted(piece: Piece) {
    // Do not allow opponent on his checkboard to play moves for the player and vice versa.
    if (this.game.settings.secondCheckboardEnabled.value) {
      if (
        piece.color !== this.game.primaryPlayerColor.value &&
        this.isPrimaryBoard
      )
        return false;
      if (
        piece.color === this.game.primaryPlayerColor.value &&
        !this.isPrimaryBoard
      )
        return false;
    }

    // Do not allow player that is not playing to perform a move.
    if (piece.color !== this.game.playingColor.value) return false;

    // Do not allow move to be performed if game is decided.
    if (this.game.winner.value !== "none") return false;

    return true;
  }

  private tryToMove(position: BoardPosition): boolean {
    if (!this.selectedPiece.value) return false;
    if (!this.availibleMoves) return false;
    if (!this.isMovePerformationPermitted(this.selectedPiece.value.piece))
      return false;
    const matchingMove = this.getAvailibleMoveWithClickablePosition(position);
    if (!matchingMove) return false;
    this.registerMove(matchingMove);
    return true;
  }

  /**
   * This method is called by Board component to let know its manager that user has clicked a piece with provided piece context.
   * @method
   * @param pieceContext
   * @returns
   */
  public onPieceClick = (pieceContext: PieceContext): void => {
    if (this.dragEndTimeoutActive) return;

    // Select piece if none is selected.
    if (!this.selectedPiece.value) {
      this.selectPiece(pieceContext);
      return;
    }

    // Unselect piece if the same piece was clicked.
    if (positionsEqual(this.selectedPiece.value, pieceContext)) {
      this.unselectPiece();
      return;
    }

    const moved = this.tryToMove(pieceContext);

    if (moved) return;

    // Select the piece if there was no move to perform on it.
    this.unselectPiece();
    this.selectPiece(pieceContext);
  };

  private registerMove(move: Move) {
    this.unselectPiece();
    this.game.performMove(move);
  }

  /**
   * This method is called by Board component to let know its manager that user has clicked a cell with provided piece position.
   * @method
   * @param position
   * @returns
   */
  public onCellClick(position: BoardPosition): void {
    if (this.dragEndTimeoutActive) return;

    if (this.selectedCell.value) {
      // Unselect cell if the same cell was clicked and select another one if different was clicked.
      const clickedSameCell = positionsEqual(this.selectedCell.value, position);
      this.unselectCell();
      if (!clickedSameCell) {
        this.selectCell(position);
      }
      return;
    }

    const moved = this.tryToMove(position);

    if (moved) return;

    // Take the cell click as a piece click if no move was performed on that cell and there is a piece in that cell. This is useful if the cells with pieces are selected using tabindex.
    if (!this.selectedPiece.value) {
      const piece = this.game.boardState[position.row][position.col];
      if (piece) {
        this.onPieceClick({ ...position, piece });
        return;
      }
    }

    this.selectCell(position);
  }
}

export default GameBoardManager;
