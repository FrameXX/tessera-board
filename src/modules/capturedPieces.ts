import { ref } from "vue";
import type { PieceId } from "./pieces/piece";
import type Piece from "./pieces/piece";

export default class CapturedPieces {
  public readonly white = ref<PieceId[]>([]);
  public readonly black = ref<PieceId[]>([]);

  public clearAll() {
    this.white.value = [];
    this.black.value = [];
  }

  public add(piece: Piece) {
    console.log(piece);
    piece.color === "white"
      ? this.white.value.push(piece.pieceId)
      : this.black.value.push(piece.pieceId);
    console.log(this.white.value);
  }

  public remove(piece: Piece) {
    piece.color == "white"
      ? this.white.value.splice(this.white.value.indexOf(piece.pieceId), 1)
      : this.black.value.splice(this.black.value.indexOf(piece.pieceId), 1);
  }
}
