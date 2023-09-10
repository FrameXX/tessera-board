import { Ref } from "vue";

interface ConfirmDialogRefs {
  open: Ref<boolean>;
  message: Ref<string>;
  confirmText: Ref<string>;
  cancelText: Ref<string>;
}

class ConfirmDialog {
  private resolve?: (confirmed: boolean) => void;

  constructor(private readonly refs: ConfirmDialogRefs) {}

  public onConfirm = () => {
    if (this.resolve) {
      this.resolve(true);
      this.resolve = undefined;
      this.refs.open.value = false;
    }
  };

  public onCancel = () => {
    if (this.resolve) {
      this.resolve(false);
      this.resolve = undefined;
      this.refs.open.value = false;
    }
  };

  public show(
    message: string,
    confirmText: string = "Confirm",
    cancelText: string = "Cancel"
  ) {
    this.refs.message.value = message;
    this.refs.confirmText.value = confirmText;
    this.refs.cancelText.value = cancelText;
    this.refs.open.value = true;

    return new Promise((resolve: (confirmed: boolean) => void) => {
      this.resolve = resolve;
    });
  }
}

export default ConfirmDialog;
