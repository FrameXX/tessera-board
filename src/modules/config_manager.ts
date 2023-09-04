import UserData from "./user_data/user_data";
import type ConfigInventory from "./config_inventory";
import type ToastManager from "./toast_manager";
import { getRandomId } from "./utils/misc";

class ConfigManager {
  constructor(
    private readonly inventory: ConfigInventory,
    private readonly entries: UserData<any>[],
    private readonly toastManager: ToastManager
  ) {}

  private handleErrorOnRestore() {
    this.toastManager.showToast(
      "An error occured while trying to load and apply configuration. Your data are probably corrupted or invalid and it's recommended that you clear all data.",
      "error",
      "database-alert"
    );
  }

  public restoreConfig(id: string) {
    const configValues = this.inventory.loadConfigValues(id);
    if (!configValues) {
      console.error(
        `Config of id ${id} of inventory ${this.inventory.id} failed to load. Alerting user.`
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
        this.entries[index].load(configValues[index]);
      }
    } catch (error) {
      console.error(
        `An error occured while trying to apply a config of id ${id} from inventory ${this.inventory.id}. The data is corrupt, invalid or the config is incompaible with the entries. Alerting user.`,
        error
      );
    }
  }

  // If id equal to some of the already defiend config ids is passed, the method can also be used to overwrite values of already saved configs
  saveConfig(id?: string) {
    if (!id) {
      id = getRandomId();
    }

    const name = "test";

    let values: string[] = [];
    for (const entry of this.entries) {
      values.push(entry.dump());
    }

    this.inventory.saveConfig(id, name, values);
  }
}

export default ConfigManager;
