import UserData from "../user_data/user_data";
import { getRandomId } from "../utils/misc";
import type ToastManager from "./toast_manager";

// Config will be inherited and applyed from the instance, however it will save under the defined key. Multiple configs can have same key and share their config data, but apply and inherit them from different instances.

interface Config {
  id: string;
  name: string;
  values: any[];
}

interface DataConfig {
  instance: UserData<any>;
}

class ConfigManager {
  private configs: Config[] = [];

  constructor(
    private readonly id: string,
    private toastManager: ToastManager
  ) {}

  private handleErrorOnLoad(error: unknown) {
    console.error(
      "An error occured while trying to parse array of config ids. Dara are probably corrupted or invalid. Alerting user.",
      error
    );
    this.toastManager.showToast(
      "An error occured while trying to load data from localStorage. Your data are probably corrupted or invalid and it's recommended that you clear all data.",
      "error"
    );
  }

  private loadConfigValues(configId: string) {
    const valuesStr = localStorage.getItem(
      `${UserData.STORAGE_KEY}-configs-${this.id}-values-${configId}`
    );
    if (!valuesStr) {
      console.warn(
        `Configuration ${configId} of manager ${this.id} has no values set.`
      );
      return;
    }
    let values: any;
    try {
      values = JSON.parse(valuesStr);
    } catch (error) {
      this.handleErrorOnLoad(error);
      return;
    }
  }

  public load() {
    const configIdsStr = localStorage.getItem(
      `${UserData.STORAGE_KEY}-configs-${this.id}`
    );
    if (!configIdsStr) {
      return;
    }

    let configIds: any;
    try {
      configIds = JSON.parse(configIdsStr);
    } catch (error) {
      this.handleErrorOnLoad(error);
      return;
    }

    for (const configId of configIds) {
      this.loadConfigValues(configId);
    }
  }

  public applyConfig(id: string) {}
}
