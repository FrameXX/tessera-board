import { Ref } from "vue";
import { CommonConfigPrint } from "./config_inventory";
import type ConfigManager from "./config_manager";
import ConfirmDialog from "./confirm_dialog";
import ToastManager from "./toast_manager";

class ConfigDialog {
  private manager?: ConfigManager;
  private resolveName?: (value?: { name: string; description: string }) => void;

  constructor(
    private readonly showConfigsRef: Ref<boolean>,
    private readonly configsListRef: Ref<CommonConfigPrint[]>,
    private readonly showNameConfigRef: Ref<boolean>,
    private readonly configNameRef: Ref<string>,
    private readonly configDescriptionRef: Ref<string>,
    private readonly confirmDialog: ConfirmDialog,
    private readonly toastManager: ToastManager
  ) {}

  private updateConfigList() {
    if (this.manager) {
      this.configsListRef.value = [];
      this.configsListRef.value = this.manager.inventory.configPrints;
    }
  }

  public show = (manager: ConfigManager) => {
    this.manager = manager;
    this.configsListRef.value = this.manager.inventory.configPrints;
    this.updateConfigList();
    this.showConfigsRef.value = true;
  };

  public onCancel = () => {
    this.manager = undefined;
    this.showConfigsRef.value = false;
  };

  public onSaveConfig = async () => {
    this.configNameRef.value = "";
    this.configDescriptionRef.value = "";
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
    this.configNameRef.value = currentName;
    this.configDescriptionRef.value = currentDescription;
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
    this.showNameConfigRef.value = true;
    return new Promise(
      (resolve: (value?: { name: string; description: string }) => void) => {
        this.resolveName = resolve;
      }
    );
  }

  public onConfirmName = () => {
    if (this.resolveName) {
      if (this.configNameRef.value === "") {
        this.toastManager.showToast(
          "Configuration name cannot be an empty string.",
          "error",
          "alert-circle-outline"
        );
        return;
      }
      this.resolveName({
        name: this.configNameRef.value,
        description: this.configDescriptionRef.value,
      });
      this.resolveName = undefined;
    }
    this.showNameConfigRef.value = false;
  };

  public onCancelName = () => {
    if (this.resolveName) {
      this.resolveName();
      this.resolveName = undefined;
    }
    this.showNameConfigRef.value = false;
  };
}

export default ConfigDialog;
