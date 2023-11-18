import type { PlayerColor } from "../modules/game";

export interface Arrow {
  color: PlayerColor;
  origin: BoardPosition;
  target: BoardPosition;
}
