import { ComputedRef } from "vue";
import {
  BoardPieceProps,
  BoardPosition,
  BoardStateValue,
} from "../board_manager";
import { PlayerColor } from "../game";
import { Path, getTargetMatchingPaths, positionsToPath } from "../pieces/piece";
import Move from "../moves/move";

export function getAllPieceProps(boardStateValue: BoardStateValue) {
  const allPieceProps: BoardPieceProps[] = [];
  for (const [rowIndex, row] of boardStateValue.entries()) {
    for (const [colIndex, piece] of row.entries()) {
      if (!piece) {
        continue;
      }
      allPieceProps.push({
        row: rowIndex,
        col: colIndex,
        piece: piece,
      });
    }
  }
  allPieceProps.sort((a, b) => {
    return a.piece.id.localeCompare(b.piece.id);
  });
  return allPieceProps;
}

export function getGuardedPieces(
  pieceProps: BoardPieceProps[],
  color: PlayerColor
) {
  return pieceProps.filter((props) => {
    if (props.piece.color !== color) return false;
    return props.piece.guarded;
  });
}

export function isGuardedPieceChecked(
  boardStateValue: BoardStateValue,
  color: PlayerColor,
  allPieceProps: BoardPieceProps[],
  guardedPieces: BoardPieceProps[],
  lastMove: ComputedRef<Move | null>
) {
  let capturingPaths: Path[] = [];

  for (const pieceProps of allPieceProps) {
    const piece = pieceProps.piece;
    if (piece.color === color) {
      continue;
    }
    const origin: BoardPosition = pieceProps;
    capturingPaths = [
      ...capturingPaths,
      ...positionsToPath(
        piece.getCapturingPositions(origin, boardStateValue, lastMove),
        origin
      ),
    ];
  }

  for (const piece of guardedPieces) {
    const paths = getTargetMatchingPaths(
      { row: piece.row, col: piece.col },
      capturingPaths
    );
    if (paths.length !== 0) {
      return true;
    }
  }
  return false;
}

export function invalidatePiecesCache(allPieceProps: BoardPieceProps[]) {
  for (const pieceProps of allPieceProps) {
    pieceProps.piece.invalidateCache();
  }
}
