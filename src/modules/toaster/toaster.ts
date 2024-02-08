import type { Ref} from "vue";
import { ref } from "vue";
import type { ToastType } from "./toast";
import Toast from "./toast";

export default class Toaster {
  public toasts: Ref<Toast[]> = ref([]);

  constructor(
    private readonly toastCapacity = 3,
    private readonly initialToastDurationMs = 1200,
    private readonly toastDurationMsPerChar = 70
  ) {}

  public bake = (
    message: string,
    iconId?: string,
    type: ToastType = "info",
    durationMs?: number
  ) => {
    if (this.isUsingFullCapacity) this.removeMostBaked();

    if (!durationMs)
      durationMs =
        this.initialToastDurationMs +
        this.toastDurationMsPerChar * message.length;

    const toast = new Toast(this, message, type, iconId);
    this.toasts.value.push(toast);

    setTimeout(this.remove.bind(this, toast.id), durationMs);
  };

  get isUsingFullCapacity() {
    return this.toasts.value.length >= this.toastCapacity;
  }

  public remove = (toastId: string) => {
    this.toasts.value = this.toasts.value.filter(
      (toast) => toast.id !== toastId
    );
  };

  private removeMostBaked() {
    this.remove(this.toasts.value[this.toasts.value.length - 1].id);
  }
}
