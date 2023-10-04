import { Ref } from "vue";
import { BoardPosition, MarkBoardState } from "../../components/Board.vue";
import type { BooleanBoardState } from "../user_data/boolean_board_state";
import { BoardPositionValue, PieceId, PlayerColor } from "../pieces/piece";
import { RawPiece } from "../pieces/rawPiece";
import { BoardStateValue } from "../user_data/board_state";
import Move, { highlightBoardPosition } from "./move";
import SelectPieceDialog from "../dialogs/select_piece";
import {
  capturePosition,
  movePositionValue,
  transformPositionValue,
} from "./move";
import { getPieceNotation, getPositionNotation } from "../board_manager";

export function isMoveTransform(move: Move): move is Transform {
  return move.moveId === "transform";
}

class Transform extends Move {
  constructor(
    private readonly pieceId: PieceId,
    private readonly pieceColor: PlayerColor,
    private readonly origin: BoardPosition,
    private readonly target: BoardPosition,
    private readonly transformOptions: [RawPiece, ...RawPiece[]],
    private readonly captures?: BoardPositionValue
  ) {
    super("transform");
  }

  private getLimitedTransformOptions(
    blackCapturedPieces: Ref<PieceId[]>,
    whiteCapturedPieces: Ref<PieceId[]>
  ) {
    return this.transformOptions.filter((option) => {
      let captured: boolean;
      this.pieceColor === "white"
        ? (captured = whiteCapturedPieces.value.includes(option.pieceId))
        : (captured = blackCapturedPieces.value.includes(option.pieceId));
      return captured;
    });
  }

  public async perform(
    boardStateValue: BoardStateValue,
    blackCapturedPieces: Ref<PieceId[]>,
    whiteCapturedPieces: Ref<PieceId[]>,
    higlightedCells: BooleanBoardState,
    selectPieceDialog: SelectPieceDialog,
    banPromotionToUncapturedPieces: Ref<boolean>,
    audioEffects: Ref<boolean>,
    moveAudioEffect: Howl,
    removeAudioEffect: Howl
  ): Promise<string> {
    if (this.captures) {
      capturePosition(
        this.captures,
        boardStateValue,
        blackCapturedPieces,
        whiteCapturedPieces
      );
      if (audioEffects.value) removeAudioEffect.play();
    }
    await movePositionValue(this.origin, this.target, boardStateValue);
    if (audioEffects.value) moveAudioEffect.play();

    let transformOptions: RawPiece[];
    if (banPromotionToUncapturedPieces) {
      transformOptions = this.getLimitedTransformOptions(
        blackCapturedPieces,
        whiteCapturedPieces
      );
    } else {
      transformOptions = this.transformOptions;
    }
    if (transformOptions.length !== 0) {
      transformOptions = this.transformOptions;
    }

    let newPiece: RawPiece | null = null;
    transformOptions.length === 1
      ? (newPiece = transformOptions[0])
      : (newPiece = await selectPieceDialog.open(transformOptions));

    transformPositionValue(this.target, newPiece, boardStateValue);

    highlightBoardPosition(this.origin, higlightedCells);
    highlightBoardPosition(this.target, higlightedCells);

    let notation: string;
    this.captures
      ? (notation = `${getPieceNotation(this.pieceId)}x${getPositionNotation(
          this.captures
        )}=${getPieceNotation(newPiece.pieceId)}`)
      : (notation = `${getPositionNotation(this.target)}=${getPieceNotation(
          newPiece.pieceId
        )}`);
    return notation;
  }

  public getClickablePositions(): BoardPosition[] {
    return [this.target];
  }

  public showCellMarks(cellMarks: MarkBoardState): void {
    this.captures
      ? (cellMarks[this.target.row][this.target.col] = "capture")
      : (cellMarks[this.target.row][this.target.col] = "availible");
  }
}

export default Transform;
