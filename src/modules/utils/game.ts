import type { ComputedRef } from "vue";
import type {
  PieceContext,
  BoardPosition,
  BoardStateValue,
} from "../board_manager";
import { isPieceId, type Path, type PiecesImportance } from "../pieces/piece";
import type Piece from "../pieces/piece";
import type Move from "../moves/move";
import type defualtSettings from "../user_data/default_settings";
import type { RawPiece } from "../pieces/raw_piece";
import type { MoveForwardContext } from "../moves/move";

export type GameSettings = typeof defualtSettings;
export type MoveDirection = "forward" | "reverse";
export type MoveExecution = "perform" | MoveDirection;

export type Player = "player" | "opponent";
export function isPlayer(string: string): string is Player {
  return string === "player" || string === "opponent";
}

export type PlayerColor = "white" | "black";
export function isPlayerColor(string: string): string is PlayerColor {
  return string === "white" || string === "black";
}

export type TeamName = "White" | "Black";

export function getOpossiteTeamName(teamName: TeamName): TeamName {
  return teamName === "White" ? "Black" : "White";
}

export function getOpossitePlayerColor(playerColor: PlayerColor) {
  return playerColor === "white" ? "black" : "white";
}

export function getColorTeamName(playerColor: PlayerColor): TeamName {
  return playerColor === "white" ? "White" : "Black";
}

export function getPlayerTeamName(
  player: Player,
  playerColor: PlayerColor
): TeamName {
  const teamName =
    player === "player"
      ? getColorTeamName(playerColor)
      : getColorTeamName(getOpossitePlayerColor(playerColor));
  return teamName;
}

type UndecidedWinner = "draw" | "none";
export function isUndecidedWinner(string: string): string is UndecidedWinner {
  return string === "draw" || string === "none";
}

export type Winner = UndecidedWinner | Player;
export function isWinner(string: string): string is Winner {
  return isPlayer(string) || isUndecidedWinner(string);
}

export type WinReason =
  | "none"
  | "move_timeout"
  | "match_timeout"
  | "resign"
  | "checkmate"
  | "stalemate"
  | "block";
export function isWinReason(string: string | null): string is WinReason {
  return (
    string === "none" ||
    string === "move_timeout" ||
    string === "match_timeout" ||
    string === "resign" ||
    string === "checkmate" ||
    string === "stalemate" ||
    string === "block"
  );
}

export type SecondsPerMovePenalty = "game_loss" | "random_move";
export function isSecondsPerMovePenalty(
  string: string
): string is SecondsPerMovePenalty {
  return string === "game_loss" || string === "random_move";
}

export class GameLogicError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, GameLogicError.prototype);
    this.name = GameLogicError.name;
  }
}

export function getAllpieceContext(boardStateValue: BoardStateValue) {
  const allPiecesContext: PieceContext[] = [];
  for (const [rowIndex, row] of boardStateValue.entries()) {
    for (const [colIndex, piece] of row.entries()) {
      if (!piece) {
        continue;
      }
      allPiecesContext.push({
        row: rowIndex,
        col: colIndex,
        piece: piece,
      });
    }
  }
  allPiecesContext.sort((a, b) => {
    return a.piece.id.localeCompare(b.piece.id);
  });
  return allPiecesContext;
}

export function getGuardedPieces(
  allPiecesContext: PieceContext[],
  color: PlayerColor
) {
  return allPiecesContext.filter((props) => {
    if (props.piece.color !== color) return false;
    return props.piece.guarded;
  });
}

export function isGuardedPieceChecked(
  boardStateValue: BoardStateValue,
  color: PlayerColor,
  allpiecesContext: PieceContext[],
  guardedPieces: PieceContext[],
  lastMove: ComputedRef<Move | null>
) {
  let capturingPaths: Path[] = [];

  for (const pieceContext of allpiecesContext) {
    const piece = pieceContext.piece;
    if (piece.color === color) {
      continue;
    }
    const origin: BoardPosition = pieceContext;
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

export function invalidatePiecesCache(allPiecesContext: PieceContext[]) {
  for (const pieceContext of allPiecesContext) {
    pieceContext.piece.invalidateCache();
  }
}

export function positionsArrayHasPosition(
  positions: BoardPosition[],
  matchingPosition: BoardPosition
) {
  for (const position of positions) {
    if (positionsEqual(position, matchingPosition)) return true;
  }
  return false;
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

export function willMoveCheckGuardedPiece(
  move: Move,
  color: PlayerColor,
  newBoardStateValue: BoardStateValue,
  moveForwardContext: MoveForwardContext,
  lastMove: ComputedRef<Move | null>
) {
  move.forward(moveForwardContext);

  const allPiecesContext = getAllpieceContext(newBoardStateValue);
  invalidatePiecesCache(allPiecesContext);
  const guardedPieces = getGuardedPieces(allPiecesContext, color);
  const checksGuardedPiece = isGuardedPieceChecked(
    newBoardStateValue,
    color,
    allPiecesContext,
    guardedPieces,
    lastMove
  );

  move.reverse(newBoardStateValue);

  return checksGuardedPiece;
}

export function getDiffPosition(
  position: BoardPosition,
  colDiff: number,
  rowDiff: number
): BoardPosition {
  return sumPositions(position, { row: rowDiff, col: colDiff });
}

export function getBoardPositionPiece(
  position: BoardPosition,
  boardStateValue: BoardStateValue
) {
  return boardStateValue[position.row][position.col];
}

export function isFriendlyPiece(
  piece: Piece | null,
  friendlyColor: PlayerColor
) {
  if (!piece) {
    return false;
  }
  return piece.color === friendlyColor;
}

export function isPositionOnBoard(target: BoardPosition) {
  return (
    target.row >= 0 && target.row <= 7 && target.col >= 0 && target.col <= 7
  );
}

export function getTargetMatchingPaths(
  target: BoardPosition,
  capturingPaths: Path[]
) {
  return capturingPaths.filter((path) => positionsEqual(path.target, target));
}

export function positionWillBeCaptured(
  target: BoardPosition,
  capturingPaths: Path[]
): boolean {
  const matchingPositions = getTargetMatchingPaths(target, capturingPaths);
  return matchingPositions.length !== 0;
}

export function getCapturingPositionPath(
  target: BoardPosition,
  origin: BoardPosition
): Path {
  return { origin: origin, target: target };
}

export function positionsToPath(
  boardPositions: BoardPosition[],
  origin: BoardPosition
) {
  return boardPositions.map((target) =>
    getCapturingPositionPath(target, origin)
  );
}

export function chooseBestPiece(
  pieces: RawPiece[],
  piecesImportance: PiecesImportance
) {
  let bestPiece = pieces[0];
  for (const piece of pieces) {
    if (
      piecesImportance[bestPiece.pieceId].value <
      piecesImportance[piece.pieceId].value
    ) {
      bestPiece = piece;
    }
  }
  return bestPiece;
}

export function sumPositions(
  pos1: BoardPosition,
  pos2: BoardPosition
): BoardPosition {
  return { row: pos1.row + pos2.row, col: pos1.col + pos2.col };
}

export function isRawPiece(object: any): object is RawPiece {
  if (typeof object.pieceId !== "string") return false;
  if (typeof object.color !== "string") return false;
  if (!isPieceId(object.pieceId)) return false;
  if (!isPlayerColor(object.color)) return false;
  return true;
}

export function getRawPiece(piece: Piece): RawPiece {
  return { color: piece.color, pieceId: piece.pieceId, id: piece.id };
}
