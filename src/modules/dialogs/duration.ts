import { reactive } from "vue";

interface DurationDialogProps {
  open: boolean;
  minutes: number;
  seconds: number;
}

class DurationDialog {
  private resolve?: (seconds: number | null) => void;
  public props: DurationDialogProps;

  constructor() {
    this.props = reactive({
      open: false,
      minutes: 0,
      seconds: 0,
    });
  }

  public confirm = () => {
    if (this.resolve) {
      this.resolve(this.props.minutes * 60 + this.props.seconds);
      this.resolve = undefined;
      this.props.open = false;
    }
  };

  public cancel = () => {
    if (this.resolve) {
      this.resolve(null);
      this.resolve = undefined;
      this.props.open = false;
    }
  };

  public show = (minutes: number, seconds: number) => {
    this.props.minutes = minutes;
    this.props.seconds = seconds;
    this.props.open = true;

    return new Promise((resolve: (seconds: number | null) => void) => {
      this.resolve = resolve;
    });
  };
}

export default DurationDialog;
