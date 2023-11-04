import type { Ref } from "vue";
import { getRandomId } from "./utils/misc";

export type ToastCase = "info" | "error";

export interface ToastProps {
  message: string;
  case: ToastCase;
  id: string;
  iconId?: string;
}

class ToastManager {
  private readonly durationPerCharacter = 70;
  private readonly initialDurationMs = 1200;
  private readonly maxStackSize = 3;

  constructor(private toasts: Ref<ToastProps[]>) {}

  private get stackSize() {
    return this.toasts.value.length;
  }

  public showToast(
    message: string,
    iconId?: string,
    toastCase: ToastCase = "info",
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

    this.toasts.value.push({
      message: message,
      case: toastCase,
      id: id,
      iconId: iconId,
    });

    setTimeout(this.hideToastId.bind(this, id), durationMs);
    return id;
  }

  public hideToastId(id: string) {
    this.toasts.value = this.toasts.value.filter((toast) => toast.id !== id);
  }

  private hideToastIndex(index: number = 0) {
    this.toasts.value.splice(index, 1);
  }
}

export default ToastManager;
