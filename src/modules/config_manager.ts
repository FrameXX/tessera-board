import UserData from "./user_data/user_data";
import type ConfigInventory from "./config_inventory";
import type ToastManager from "./toast_manager";
import { getRandomId } from "./utils/misc";
import { CommonConfigPrint } from "./config_inventory";
import { Ref } from "vue";

class ConfigManager {
  constructor(
    private readonly inventory: ConfigInventory,
    private readonly entries: UserData<any>[],
    private readonly configsListRef: Ref<CommonConfigPrint[]>,
    private readonly showConfigsRef: Ref<boolean>,
    private readonly showSaveConfigRef: Ref<boolean>,
    private readonly configNameRef: Ref<string>,
    private readonly toastManager: ToastManager
  ) {}

  private handleErrorOnRestore() {
    this.toastManager.showToast(
      "An error occured while trying to load and apply configuration. Your data are probably corrupted or invalid and it's recommended that you clear all data.",
      "error",
      "database-alert"
    );
  }

  public restoreConfig(configPrint: CommonConfigPrint) {
    if (configPrint.predefined) {
      const configValues = this.inventory.getPredefinedConfigValues(
        configPrint.id
      );
      if (!configValues) {
        return;
      }
      try {
        for (const index in configValues) {
          const entry = this.entries[index];
          entry.value = configValues[index];
        }
      } catch (error) {
        console.error(
          `An error occured while trying to apply a config of id ${configPrint.id} from inventory ${this.inventory.id}. The config is incompaible with the entries. Alerting user.`,
          error
        );
        this.handleErrorOnRestore();
        return;
      }
    } else {
      const configValues = this.inventory.loadConfigValues(configPrint.id);
      if (!configValues) {
        console.error(
          `Config of id ${configPrint.id} of inventory ${this.inventory.id} failed to load. Alerting user.`
        );
        this.handleErrorOnRestore();
        return;
      }
      if (configValues.length !== this.entries.length) {
        console.error(
          "Length of config values array does not match length of entries array. The data does not seem to be compatible. Alerting user."
        );
        this.handleErrorOnRestore();
        return;
      }
      try {
        for (const index in configValues) {
          const entry = this.entries[index];
          entry.load(configValues[index]);
        }
      } catch (error) {
        console.error(
          `An error occured while trying to apply a config of id ${configPrint.id} from inventory ${this.inventory.id}. The data is corrupt, invalid or the config is incompaible with the entries. Alerting user.`,
          error
        );
        this.handleErrorOnRestore();
        return;
      }
    }
    for (const entry of this.entries) {
      entry.apply();
      entry.updateReference();
    }
  }

  // If id equal to some of the already defiend config ids is passed, the method can also be used to overwrite values of already saved configs
  saveConfig(writeId?: string) {
    if (!writeId) {
      writeId = getRandomId();
    }

    const name = "test";

    let values: string[] = [];
    for (const entry of this.entries) {
      values.push(entry.dump());
    }

    this.inventory.saveConfig({ id: writeId, name, values });
  }
}

export default ConfigManager;
