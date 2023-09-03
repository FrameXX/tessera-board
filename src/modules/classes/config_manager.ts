import UserData from "../user_data/user_data";
import { getRandomId } from "../utils/misc";
import type ToastManager from "./toast_manager";

interface Config {
  name: string;
  values: string[];
}

function validateConfig(object: any, entriesCount: number): object is Config {
  if ("name" in object && "values" in object) {
    return object.values.length === entriesCount;
  } else {
    return false;
  }
}

class ConfigManager {
  private configs: Config[] = [];

  constructor(
    private readonly id: string,
    private readonly entries: UserData<any>[],
    private readonly toastManager: ToastManager
  ) {}

  private handleErrorOnLoad() {
    this.toastManager.showToast(
      "An error occured while trying to load data from local storage. Your data are probably corrupted or invalid and it's recommended that you clear all data.",
      "error",
      "database-alert"
    );
  }

  private loadConfig(configId: string) {
    const configStr = localStorage.getItem(
      `${UserData.STORAGE_KEY}-configs-${this.id}-values-${configId}`
    );
    if (!configStr) {
      console.warn(
        `Configuration ${configId} of manager ${this.id} has no values set.`
      );
      return;
    }

    let config: any;
    try {
      config = JSON.parse(configStr);
    } catch (error) {
      console.error(
        `An error occured while trying to parse config under id ${configId} of manager ${this.id}. Data are probably corrupted or invalid. Alerting user.`,
        error
      );
      this.handleErrorOnLoad();
      return;
    }

    if (validateConfig(config, this.entries.length)) {
      this.configs.push(config);
    } else {
      console.error(
        `Config saved under id ${configId} of manager ${this.id} could not be validated.`
      );
      this.handleErrorOnLoad();
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
      console.error(
        `An error occured while trying to parse array of config ids of manager ${this.id}. Data are probably corrupted or invalid. Alerting user.`,
        error
      );
      this.handleErrorOnLoad();
      return;
    }

    for (const configId of configIds) {
      this.loadConfig(configId);
    }
  }

  public saveConfig(name: string) {
    const id = getRandomId();
    let values: string[] = [];
    for (const entry of this.entries) {
      values.push(entry.dump());
    }
    // Continue
  }

  public applyConfig(id: string) {}
}

export default ConfigManager;
