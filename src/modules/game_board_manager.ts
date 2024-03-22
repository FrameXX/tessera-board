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
        (this.game.primaryPlayer.color.value === "white")
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
      this.game.primaryPlayer.color.value !== "white"
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
      ? this.game.primaryPlayer.color.value
      : this.game.secondaryPlayer.color.value;
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
      pieceColor !== this.game.playingPlayer.color.value
    )
      return false;

    if (!this.game.settings.secondCheckboardEnabled.value) return true;

    if (
      (this.isPrimaryBoard &&
        pieceColor !== this.game.primaryPlayer.color.value) ||
      (!this.isPrimaryBoard &&
        pieceColor === this.game.primaryPlayer.color.value)
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
      ...this.game.primaryPlayerCapturingPaths.value,
      ...this.game.secondaryPlayerCapturingPaths.value,
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

  public onPieceDragStart(
    targetPosition: BoardPosition,
    pieceContext: PieceContext
  ): void {
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

  public onPieceDragOverCell(
    targetPosition: BoardPosition,
    pieceContext: PieceContext
  ): void {
    if (positionsEqual(targetPosition, pieceContext)) {
      this.draggingOverCell.value = targetPosition;
      return;
    }

    const validMove = this.getValidMove(targetPosition);
    this.draggingOverCell.value = validMove ? targetPosition : null;
  }

  private temporarilyActivateDragEndTimeout() {
    this.dragEndTimeoutActive = true;
    setTimeout(() => {
      this.dragEndTimeoutActive = false;
    }, 100);
  }

  public onPieceDragEnd(targetPosition: BoardPosition): void {
    this.temporarilyActivateDragEndTimeout();
    this.draggingOverCell.value = null;

    const validMove = this.getValidMove(targetPosition);
    if (validMove) this.registerMove(validMove);
  }

  private isMovePerformationPermitted(piece: Piece) {
    if (this.game.settings.secondCheckboardEnabled.value) {
      if (
        piece.color !== this.game.primaryPlayer.color.value &&
        this.isPrimaryBoard
      )
        return false;
      if (
        piece.color === this.game.primaryPlayer.color.value &&
        !this.isPrimaryBoard
      )
        return false;
    }

    if (piece.color !== this.game.playingPlayer.color.value) return false;

    if (this.game.winner.value !== "none") return false;

    return true;
  }

  private getValidMove(position: BoardPosition): Move | null {
    if (!this.selectedPiece.value) return null;
    if (!this.availibleMoves) return null;
    if (!this.isMovePerformationPermitted(this.selectedPiece.value.piece))
      return null;
    const validMove = this.getAvailibleMoveWithClickablePosition(position);
    return validMove;
  }

  public onPieceClick = (pieceContext: PieceContext): void => {
    if (this.dragEndTimeoutActive) return;

    if (!this.selectedPiece.value) {
      this.selectPiece(pieceContext);
      return;
    }

    if (positionsEqual(this.selectedPiece.value, pieceContext)) {
      this.unselectPiece();
      return;
    }

    const validMove = this.getValidMove(pieceContext);

    if (validMove) {
      this.registerMove(validMove);
      return;
    }

    this.unselectPiece();
    this.selectPiece(pieceContext);
  };

  private registerMove(move: Move) {
    this.unselectPiece();
    this.game.performMove(move);
  }

  public onCellClick(position: BoardPosition): void {
    if (this.dragEndTimeoutActive) return;

    if (this.selectedCell.value) {
      const clickedSameCell = positionsEqual(this.selectedCell.value, position);
      this.unselectCell();
      if (!clickedSameCell) this.selectCell(position);
      return;
    }

    const validMove = this.getValidMove(position);

    if (validMove) {
      this.registerMove(validMove);
      return;
    }

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
