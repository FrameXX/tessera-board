import type { Ref } from "vue";
import { getRandomId } from "../utils/misc";

export type ToastCase = "info" | "error";

export interface ToastElement {
  message: string;
  case: ToastCase;
  id: string;
  iconId?: string;
}

class ToastManager {
  private readonly durationPerCharacter = 70;
  private readonly initialDurationMs = 600;
  private readonly maxStackSize = 3;
  private toastsElements: Ref<ToastElement[]>;

  constructor(toastsRef: Ref<ToastElement[]>) {
    this.toastsElements = toastsRef;
  }

  private get stackSize() {
    return this.toastsElements.value.length;
  }

  public showToast(
    message: string,
    toastCase: ToastCase = "info",
    iconId?: string,
    durationMs?: number
  ): string {
    const id = getRandomId();

    // If stack is full hide last toast
    if (this.stackSize >= this.maxStackSize) {
      this.hideToastIndex(0);
    }

    // If duration is undefined calculate it automatically based on number of chars
    if (!durationMs) {
      durationMs =
        this.initialDurationMs + this.durationPerCharacter * message.length;
    }

    this.toastsElements.value.push({
      message: message,
      case: toastCase,
      id: id,
      iconId: iconId,
    });

    setTimeout(this.hideToastId.bind(this, id), durationMs);
    return id;
  }

  public hideToastId(id: string) {
    this.toastsElements.value = this.toastsElements.value.filter(
      (toast) => toast.id !== id
    );
  }

  private hideToastIndex(index: number = 0) {
    this.toastsElements.value.splice(index, 1);
  }
}

export default ToastManager;
