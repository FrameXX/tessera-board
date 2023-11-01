import UserData from "./user_data/user_data";
import type ToastManager from "./toast_manager";

export interface UserConfigPrint {
  id: string;
  name: string;
  description: string;
}

export interface PredefinedConfig extends UserConfigPrint {
  values: string[];
}

export interface CommonConfigPrint extends UserConfigPrint {
  predefined: boolean;
}

// Validators
function isUserConfigPrint(object: any): object is UserConfigPrint {
  if (!("id" in object && "name" in object && "description" in object)) {
    return false;
  }
  return (
    typeof object.id === "string" &&
    typeof object.name === "string" &&
    typeof object.description === "string"
  );
}

function isArrayOfUserConfigPrints(object: any): object is UserConfigPrint[] {
  if (!Array.isArray(object)) {
    return false;
  }
  return object.every((element) => isUserConfigPrint(element));
}

function isArrayofStrings(object: any): object is string[] {
  if (!Array.isArray(object)) {
    return false;
  }
  return object.every((element) => typeof element === "string");
}

class ConfigInventory {
  public configPrints: CommonConfigPrint[] = [];

  constructor(
    public readonly id: string,
    public readonly predefinedConfigs: PredefinedConfig[],
    private readonly toastManager: ToastManager
  ) {
    this.configPrints = this.predefinedConfigs.map((config) => {
      return {
        id: config.id,
        name: config.name,
        description: config.description,
        predefined: true,
      };
    });
    if (navigator.cookieEnabled) {
      this.loadUserConfigPrints();
    }
  }

  private handleErrorOnLoad() {
    this.toastManager.showToast(
      "An error occured while trying to load data configurations from local storage. Your data are probably corrupted or invalid and it's recommended that you clear all data.",

      "database-alert"
    );
  }

  public getPredefinedConfigValues(id: string) {
    const predefinedConfig = this.predefinedConfigs.filter(
      (config) => config.id === id
    );
    if (predefinedConfig.length != 1) {
      console.warn(
        `Number of predefined configs of id ${id} in inventory ${this.id} is not 1. Id should be unique.`
      );
    }
    if (!predefinedConfig) {
      console.error(
        `Provided id ${id} of predefined config of inventory ${this.id} is not valid, or the value got lost.`
      );
      this.toastManager.showToast(
        "An unknown error occured while trying to apply preloaded config.",

        "database-alert"
      );
      return;
    }
    return predefinedConfig[0].values;
  }

  public loadConfigValues(id: string) {
    const configValuesStr = localStorage.getItem(
      `${UserData.BASE_STORAGE_KEY}-configs-${this.id}-values-${id}`
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

  private loadUserConfigPrints() {
    const configPrintsStr = localStorage.getItem(
      `${UserData.BASE_STORAGE_KEY}-configs-${this.id}`
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

    if (!isArrayOfUserConfigPrints(configPrints)) {
      console.error(
        `Parsed config prints of inventory ${this.id} could not be validated. They properties do not match type ConfigPrint[]. Alerting user.`
      );
      this.handleErrorOnLoad();
      return;
    }

    // Since all of these are loaded from storage none of them is predefined => All predefined properties will be set to false.
    const commonConfigPrints: CommonConfigPrint[] = configPrints.map(
      (print) => {
        return { ...print, predefined: false };
      }
    );
    this.configPrints = [...this.configPrints, ...commonConfigPrints];
  }

  private get userConfigPrints(): UserConfigPrint[] {
    return this.configPrints
      .filter((print) => !print.predefined)
      .map((print) => {
        return {
          id: print.id,
          name: print.name,
          description: print.description,
        };
      });
  }

  private saveConfigPrints() {
    localStorage.setItem(
      `${UserData.BASE_STORAGE_KEY}-configs-${this.id}`,
      JSON.stringify(this.userConfigPrints)
    );
  }

  private addConfigPrint(id: string, name: string, description: string) {
    const currentIds = this.configPrints.map((print) => print.id);
    if (currentIds.includes(id)) {
      return;
    }
    this.configPrints.push({ id, name, description, predefined: false });
    this.saveConfigPrints();
  }

  public renameConfig(id: string, newName: string, newDescription: string) {
    this.configPrints = this.configPrints.map((print) => {
      if (print.id === id) {
        return {
          id: print.id,
          name: newName,
          description: newDescription,
          predefined: print.predefined,
        };
      } else {
        return print;
      }
    });
    this.saveConfigPrints();
  }

  public deleteConfig(id: string) {
    this.configPrints = this.configPrints.filter((print) => print.id !== id);
    this.saveConfigPrints();
    localStorage.removeItem(
      `${UserData.BASE_STORAGE_KEY}-configs-${this.id}-values-${id}`
    );
  }

  public saveConfig(config: PredefinedConfig) {
    this.addConfigPrint(config.id, config.name, config.description);
    localStorage.setItem(
      `${UserData.BASE_STORAGE_KEY}-configs-${this.id}-values-${config.id}`,
      JSON.stringify(config.values)
    );
  }
}

export default ConfigInventory;
