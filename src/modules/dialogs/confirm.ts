import { reactive } from "vue";

interface ConfirmDialogProps {
  open: boolean;
  message: string;
  confirmText: string;
  cancelText: string;
  showHint: boolean;
  hint: string | null;
}

class ConfirmDialog {
  private resolve?: (confirmed: boolean) => void;
  public props: ConfirmDialogProps;

  constructor() {
    this.props = reactive({
      open: false,
      showHint: false,
      hint: "",
      message: "",
      confirmText: "",
      cancelText: "",
    });
  }

  public confirm = () => {
    if (this.resolve) {
      this.resolve(true);
      this.resolve = undefined;
      this.props.open = false;
    }
  };

  public cancel = () => {
    if (this.resolve) {
      this.resolve(false);
      this.resolve = undefined;
      this.props.open = false;
    }
  };

  public show = (
    message: string,
    confirmText: string = "Confirm",
    cancelText: string = "Cancel",
    hint: string | null = null
  ) => {
    this.props.message = message;
    this.props.confirmText = confirmText;
    this.props.cancelText = cancelText;
    if (hint === null) {
      this.props.showHint = false;
    } else {
      this.props.showHint = true;
      this.props.hint = hint;
    }
    this.props.open = true;

    return new Promise((resolve: (confirmed: boolean) => void) => {
      this.resolve = resolve;
    });
  };
}

export default ConfirmDialog;
