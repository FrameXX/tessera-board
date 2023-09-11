import { reactive } from "vue";
import { CommonConfigPrint } from "./config_inventory";
import type ConfigManager from "./config_manager";
import type ConfigPrintDialog from "./config_print_dialog";
import ConfirmDialog from "./confirm_dialog";
import ToastManager from "./toast_manager";

interface ConfigsDialogProps {
  open: boolean;
  configsPrints: CommonConfigPrint[];
}

class ConfigsDialog {
  private configManager?: ConfigManager;
  public props: ConfigsDialogProps;

  constructor(
    private readonly confirmDialog: ConfirmDialog,
    private readonly configPrintDialog: ConfigPrintDialog,
    private readonly toastManager: ToastManager
  ) {
    this.props = reactive({
      open: false,
      configsPrints: [],
    });
  }

  private updateConfigList() {
    if (this.configManager) {
      // NOTE: The config list sometimes doesn't seem to update apropriately when the configsList is not cleared before new value is set. I do not know reason for this behavior.
      this.props.configsPrints = [];
      this.props.configsPrints = this.configManager.inventory.configPrints;
    }
  }

  public open = (manager: ConfigManager) => {
    this.configManager = manager;
    this.props.configsPrints = this.configManager.inventory.configPrints;
    this.updateConfigList();
    this.props.open = true;
  };

  public cancel = () => {
    this.configManager = undefined;
    this.props.open = false;
  };

  public saveConfig = async () => {
    const userConfigPrint = await this.configPrintDialog.open();
    if (!userConfigPrint) {
      return;
    }
    this.configManager?.saveConfig(
      userConfigPrint.name,
      userConfigPrint.description
    );
    this.updateConfigList();
    this.toastManager.showToast(
      "Config saved.",
      "info",
      "check-circle-outline"
    );
  };

  public deleteConfig = async (id: string) => {
    const confirmed = await this.confirmDialog.show(
      "Are you sure you want to delete this configuration? There is no official way to recover it."
    );
    if (confirmed) {
      this.configManager?.deleteConfig(id);
      this.updateConfigList();
    }
  };

  public renameConfig = async (
    id: string,
    currentName: string,
    currentDescription: string
  ) => {
    const userPrint = await this.configPrintDialog.open(
      currentName,
      currentDescription
    );
    if (!userPrint) {
      return;
    }
    this.configManager?.renameConfig(id, userPrint.name, userPrint.description);
    this.updateConfigList();
    this.toastManager.showToast(
      "Config renamed.",
      "info",
      "check-circle-outline"
    );
  };

  public restoreConfig(id: string, predefined: boolean) {
    predefined
      ? this.configManager?.restorePredefinedConfig(id)
      : this.configManager?.restoreUserConfig(id);
    this.configManager?.applyEntries();
    this.toastManager.showToast(
      "Config loaded.",
      "info",
      "check-circle-outline"
    );
  }
}

export default ConfigsDialog;
