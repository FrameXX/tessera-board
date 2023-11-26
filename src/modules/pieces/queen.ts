import { ComputedRef } from "vue";
import type {
  BoardPieceProps,
  BoardPosition,
  BoardStateValue,
} from "../board_manager";
import type { PlayerColor } from "../game";
import type Move from "../moves/move";
import Shift from "../moves/shift";
import { Bishop } from "./bishop";
import Piece, { isFriendlyPiece } from "./piece";
import Rook from "./rook";

export class Queen extends Piece {
  constructor(color: PlayerColor, id?: string) {
    super(color, "queen", id);
  }

  public getNewCapturingPositions(
    position: BoardPosition,
    boardStateValue: BoardStateValue,
    lastMove: ComputedRef<Move | null>
  ): BoardPosition[] {
    // NOTE: Capturing positions of qeen are same as capturing positions of rook and bishop in same state joined together. There's no overlap between rook and bishop capturing positions which is also great.
    const rook = new Rook(this.color);
    const bishop = new Bishop(this.color);
    const capturingPositions: BoardPosition[] = [
      ...rook.getCapturingPositions(position, boardStateValue, lastMove),
      ...bishop.getCapturingPositions(position, boardStateValue, lastMove),
    ];
    return capturingPositions;
  }

  public getNewPossibleMoves(
    position: BoardPosition,
    boardStateValue: BoardStateValue,
    lastMove: ComputedRef<Move | null>
  ): Move[] {
    const moves: Move[] = [];
    const capturingPositions = this.getNewCapturingPositions(
      position,
      boardStateValue,
      lastMove
    );

    for (const target of capturingPositions) {
      let captures: BoardPieceProps | undefined = undefined;
      const piece = boardStateValue[target.row][target.col];
      if (isFriendlyPiece(piece, this.color)) {
        continue;
      }
      if (piece) captures = { ...target, piece: piece };
      moves.push(new Shift(this.pieceId, position, target, captures));
    }

    return moves;
  }

  public loadCustomProps(): void {}
}

export default Queen;
