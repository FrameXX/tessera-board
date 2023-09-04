import UserData from "./user_data/user_data";
import type ToastManager from "./toast_manager";

interface ConfigPrint {
  id: string;
  name: string;
}

function isConfigPrint(object: any): object is ConfigPrint {
  if (!("id" in object && "name" in object)) {
    return false;
  }
  return typeof object.id === "string" && typeof object.name === "string";
}

function isArrayofConfigPrints(object: any): object is ConfigPrint[] {
  if (!Array.isArray(object)) {
    return false;
  }
  return object.every((element) => isConfigPrint(element));
}

function isArrayofStrings(object: any): object is string[] {
  if (!Array.isArray(object)) {
    return false;
  }
  return object.every((element) => typeof element === "string");
}

class ConfigInventory {
  private configPrints: ConfigPrint[] = [];

  constructor(
    public readonly id: string,
    private readonly toastManager: ToastManager
  ) {}

  private handleErrorOnLoad() {
    this.toastManager.showToast(
      "An error occured while trying to load data configurations from local storage. Your data are probably corrupted or invalid and it's recommended that you clear all data.",
      "error",
      "database-alert"
    );
  }

  public loadConfigValues(id: string) {
    const configValuesStr = localStorage.getItem(
      `${UserData.STORAGE_KEY}-configs-${this.id}-values-${id}`
    );
    if (!configValuesStr) {
      console.error(
        `Config values of config of id ${id} of inventory ${this.id} do not exist.`
      );
      return;
    }

    let configValues: any;
    try {
      configValues = JSON.parse(configValuesStr);
    } catch (error) {
      console.error(
        `An error occured while trying to parse list of config values under id ${id} of inventory ${this.id}. Data are probably corrupted or invalid. Alerting user.`,
        error
      );
      this.handleErrorOnLoad();
      return;
    }

    if (!isArrayofStrings(configValues)) {
      console.error(
        `Config saved under id ${id} of inventory ${this.id} could not be validated. It does not contain desired properties. Data are probably corrupted or invalid. Alerting user.`
      );
      this.handleErrorOnLoad();
      return;
    }

    return configValues;
  }

  public loadConfigPrints() {
    const configPrintsStr = localStorage.getItem(
      `${UserData.STORAGE_KEY}-configs-${this.id}`
    );
    if (!configPrintsStr) {
      return;
    }

    let configPrints: any;
    try {
      configPrints = JSON.parse(configPrintsStr);
    } catch (error) {
      console.error(
        `An error occured while trying to parse array of config prints of inventory ${this.id}. Data are probably corrupted or invalid. Alerting user.`,
        error
      );
      this.handleErrorOnLoad();
      return;
    }

    if (!isArrayofConfigPrints(configPrints)) {
      console.error(
        `Parsed config prints of inventory ${this.id} could not be validated. They properties do not match type ConfigPrint[]. Alerting user.`
      );
      this.handleErrorOnLoad();
      return;
    }

    this.configPrints = configPrints;
  }

  private saveConfigPrints() {
    localStorage.setItem(
      `${UserData.STORAGE_KEY}-configs-${this.id}`,
      JSON.stringify(this.configPrints)
    );
  }

  private addConfigPrint(id: string, name: string) {
    const currentIds = this.configPrints.map((print) => print.id);
    if (currentIds.includes(id)) {
      return;
    }
    this.configPrints.push({ id, name });
    this.saveConfigPrints();
  }

  public deleteConfig(id: string) {
    this.configPrints = this.configPrints.filter((print) => print.id !== id);
    this.saveConfigPrints();
    localStorage.removeItem(
      `${UserData.STORAGE_KEY}-configs-${this.id}-values-${id}`
    );
  }

  public saveConfig(id: string, name: string, values: string[]) {
    this.addConfigPrint(id, name);
    localStorage.setItem(
      `${UserData.STORAGE_KEY}-configs-${this.id}-values-${id}`,
      JSON.stringify(values)
    );
  }
}

export default ConfigInventory;
