import { Ref } from "vue";

export interface Dialog {
  message: string;
  confirmText: string;
  cancelText: string;
}

class ConfirmDialog {
  constructor(
    private readonly dialogRef: Ref<Dialog>,
    private readonly showDialogRef: Ref<boolean>
  ) {}

  public onConfirm = () => {
    if (this.resolve) {
      this.resolve(true);
      this.resolve = undefined;
      this.showDialogRef.value = false;
    }
  };

  public onCancel = () => {
    if (this.resolve) {
      this.resolve(false);
      this.resolve = undefined;
      this.showDialogRef.value = false;
    }
  };

  public show(
    message: string,
    confirmText: string = "Confirm",
    cancelText: string = "Cancel"
  ) {
    this.dialogRef.value = {
      message,
      confirmText,
      cancelText,
    };
    this.showDialogRef.value = true;
    return new Promise((resolve: (confirmed: boolean) => void) => {
      this.resolve = resolve;
    });
  }

  private resolve?: (confirmed: boolean) => void;
}

export default ConfirmDialog;
