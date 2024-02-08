import type Toaster from "../toaster/toaster";
import { reactive } from "vue";

interface ConfigPrintDialogProps {
  open: boolean;
  name: string;
  description: string;
}

class ConfigPrintDialog {
  private resolve?: (value?: { name: string; description: string }) => void;
  public props: ConfigPrintDialogProps;

  constructor(private readonly toaster: Toaster) {
    this.props = reactive({
      open: false,
      name: "",
      description: "",
    });
  }

  public open = async (
    preloadedName: string = "",
    preloadedDescription: string = ""
  ) => {
    this.props.name = preloadedName;
    this.props.description = preloadedDescription;
    this.props.open = true;
    return new Promise(
      (resolve: (value?: { name: string; description: string }) => void) => {
        this.resolve = resolve;
      }
    );
  };

  public confirm = () => {
    if (this.resolve) {
      if (this.props.name === "") {
        this.toaster.bake(
          "Configuration name cannot be an empty string.",

          "alert-circle-outline"
        );
        return;
      }
      this.resolve({
        name: this.props.name,
        description: this.props.description,
      });
      this.resolve = undefined;
    }
    this.props.open = false;
  };

  public cancel = () => {
    if (this.resolve) {
      this.resolve();
      this.resolve = undefined;
    }
    this.props.open = false;
  };
}

export default ConfigPrintDialog;
