import type UserData from "./user_data/user_data";
import type ConfigInventory from "./config_inventory";
import type ToastManager from "./toast_manager";
import { getRandomId } from "./utils/misc";

class ConfigManager {
  constructor(
    public readonly inventory: ConfigInventory,
    private readonly entries: UserData<any>[],
    private readonly toastManager: ToastManager
  ) {}

  private handleErrorOnRestore() {
    this.toastManager.showToast(
      "An error occured while trying to load and apply configuration. Your data are probably corrupted or invalid and it's recommended that you clear all data.",

      "database-alert"
    );
  }

  public restorePredefinedConfig(id: string) {
    const configValues = this.inventory.getPredefinedConfigValues(id);
    if (!configValues) {
      return;
    }
    try {
      for (const index in configValues) {
        const entry = this.entries[index];
        entry.load(configValues[index]);
      }
    } catch (error) {
      console.error(
        `An error occured while trying to apply a predefined config of id ${id} from inventory ${this.inventory.id}. The data is corrupt, invalid or the config is incompaible with the entries. Alerting user.`,
        error
      );
      this.handleErrorOnRestore();
      return;
    }
  }

  public restoreUserConfig(id: string) {
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
        const entry = this.entries[index];
        entry.load(configValues[index]);
      }
    } catch (error) {
      console.error(
        `An error occured while trying to apply a user config of id ${id} from inventory ${this.inventory.id}. The data is corrupt, invalid or the config is incompaible with the entries. Alerting user.`,
        error
      );
      this.handleErrorOnRestore();
      return;
    }
  }

  public applyEntries() {
    for (const entry of this.entries) {
      entry.apply();
      entry.updateReference();
    }
  }

  public renameConfig(id: string, newName: string, newDescription: string) {
    this.inventory.renameConfig(id, newName, newDescription);
  }

  public async saveConfig(name: string, description: string) {
    const id = getRandomId();

    const values: string[] = [];
    for (const entry of this.entries) {
      values.push(entry.dump());
    }

    this.inventory.saveConfig({ id, name, description, values });
  }

  public deleteConfig = (id: string) => {
    this.inventory.deleteConfig(id);
  };
}

export default ConfigManager;
