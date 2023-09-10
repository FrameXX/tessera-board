import { Ref } from "vue";
import { CommonConfigPrint } from "./config_inventory";
import type ConfigManager from "./config_manager";
import ConfirmDialog from "./confirm_dialog";
import ToastManager from "./toast_manager";

interface ConfigsDialogRefs {
  open: Ref<boolean>;
  configPrintOpen: Ref<boolean>;
  configsPrints: Ref<CommonConfigPrint[]>;
  configName: Ref<string>;
  configDescription: Ref<string>;
}

class ConfigsDialog {
  private manager?: ConfigManager;
  private resolveName?: (value?: { name: string; description: string }) => void;

  constructor(
    private readonly refs: ConfigsDialogRefs,
    private readonly confirmDialog: ConfirmDialog,
    private readonly toastManager: ToastManager
  ) {}

  private updateConfigList() {
    if (this.manager) {
      // NOTE: The config list sometimes doesn't seem to update apropriately when the configsList ref is not cleared before new value is set
      this.refs.configsPrints.value = [];
      this.refs.configsPrints.value = this.manager.inventory.configPrints;
    }
  }

  public show = (manager: ConfigManager) => {
    this.manager = manager;
    this.refs.configsPrints.value = this.manager.inventory.configPrints;
    this.updateConfigList();
    this.refs.open.value = true;
  };

  public onCancel = () => {
    this.manager = undefined;
    this.refs.open.value = false;
  };

  public onSaveConfig = async () => {
    this.refs.configName.value = "";
    this.refs.configDescription.value = "";
    const userPrint = await this.showNameDialog();
    if (!userPrint) {
      return;
    }
    this.manager?.saveConfig(userPrint.name, userPrint.description);
    this.updateConfigList();
    this.toastManager.showToast(
      "Config saved.",
      "info",
      "check-circle-outline"
    );
  };

  public async onDeleteConfig(id: string) {
    const confirmed = await this.confirmDialog.show(
      "Are you sure you want to delete this configuration? There is no official way to recover it."
    );
    if (confirmed) {
      this.manager?.deleteConfig(id);
      this.updateConfigList();
    }
  }

  public async onRenameConfig(
    id: string,
    currentName: string,
    currentDescription: string
  ) {
    this.refs.configName.value = currentName;
    this.refs.configDescription.value = currentDescription;
    const userPrint = await this.showNameDialog();
    if (!userPrint) {
      return;
    }
    this.manager?.renameConfig(id, userPrint.name, userPrint.description);
    this.updateConfigList();
    this.toastManager.showToast(
      "Config renamed.",
      "info",
      "check-circle-outline"
    );
  }

  public onRestoreConfig(id: string, predefined: boolean) {
    predefined
      ? this.manager?.restorePredefinedConfig(id)
      : this.manager?.restoreUserConfig(id);
    this.manager?.applyEntries();
    this.toastManager.showToast(
      "Config loaded.",
      "info",
      "check-circle-outline"
    );
  }

  private showNameDialog() {
    this.refs.configPrintOpen.value = true;
    return new Promise(
      (resolve: (value?: { name: string; description: string }) => void) => {
        this.resolveName = resolve;
      }
    );
  }

  public onConfirmName = () => {
    if (this.resolveName) {
      if (this.refs.configName.value === "") {
        this.toastManager.showToast(
          "Configuration name cannot be an empty string.",
          "error",
          "alert-circle-outline"
        );
        return;
      }
      this.resolveName({
        name: this.refs.configName.value,
        description: this.refs.configDescription.value,
      });
      this.resolveName = undefined;
    }
    this.refs.configPrintOpen.value = false;
  };

  public onCancelName = () => {
    if (this.resolveName) {
      this.resolveName();
      this.resolveName = undefined;
    }
    this.refs.configPrintOpen.value = false;
  };
}

export default ConfigsDialog;
