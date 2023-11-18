import type { MoveId} from "./move";
import { isMoveId } from "./move";

export interface RawMove {
  // Raw Move can possibly have extra custom properties
  [extra: string]: any;
  moveId: MoveId;
  performed: boolean;
}

export function isRawMove(object: any): object is RawMove {
  if (typeof object.moveId !== "string") return false;
  if (typeof object.performed !== "boolean") return false;
  return isMoveId(object.moveId);
}
