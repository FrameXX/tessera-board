import { getRandomId } from "../utils/misc";
import type Toaster from "./toaster";

export type ToastType = "info" | "error";

export default class Toast {
  public readonly id = getRandomId();

  constructor(
    public readonly toaster: Toaster,
    public readonly message: string,
    public readonly type: ToastType,
    public readonly iconId?: string
  ) {}
}
