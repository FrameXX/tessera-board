import type UserData from "../user_data/user_data";
import type DialogManager from "./dialog_manager";
import type ToastManager from "./toast_manager";

class UserDataManager {
  private readonly storageKey = "tessera-board";
  private readonly dialogManager: DialogManager;
  private readonly toastManager: ToastManager;
  public entries: UserData<any>[] = [];

  constructor(dialogManager: DialogManager, toastManager: ToastManager) {
    this.dialogManager = dialogManager;
    this.toastManager = toastManager;
  }

  public saveData = () => {
    let dataValues: any = {};
    for (const entry of this.entries) {
      dataValues[entry.id] = entry.dump();
    }
    localStorage.setItem(this.storageKey, JSON.stringify(dataValues));
  };

  public loadData() {
    const dataValuesString = localStorage.getItem(this.storageKey);
    if (dataValuesString) {
      let dataValues: any;
      try {
        dataValues = JSON.parse(dataValuesString);
      } catch (error) {
        console.error(
          "Parsing dataValuesString resulted in an error. Data may be corrupted. Alerting user."
        );
        this.handleFatalDataCorruption();
      }
      this.injectDataValues(dataValues);
    } else {
      console.log("localStorage is empty so no data was loaded.");
    }
  }

  private async handleFatalDataCorruption() {
    const confirmed = await this.dialogManager.confirmRequest(
      "Cannot load any data from localStorage. They are probably corrupted or invalid. It's recommended to clear all data.",
      "Clear data",
      "No"
    );
    if (confirmed) {
      this.clearData();
    }
  }

  private injectDataValues(dataValues: any) {
    let error = false;
    for (const entry of this.entries) {
      if (entry.id in dataValues) {
        try {
          entry.load(dataValues[entry.id]);
        } catch (error) {
          console.error(
            `An eerror occured when restoring ${entry.id}. No data was restored. Data may be corrupted. Alerting user.`,
            error
          );
          error = true;
        }
      } else {
        console.warn(
          `Key of entry ${entry.id} is missing from the restore dataValues so the data won't be restored.`
        );
      }
    }
    if (error) {
      this.toastManager.showToast(
        "Some values could not be restored. Data may be invalid. If the problem persists clear all data.",
        "error",
        "database-alert"
      );
    }
  }

  public applyData() {
    for (const entry of this.entries) {
      entry.apply();
    }
  }

  public updateReferences() {
    for (const entry of this.entries) {
      entry.updateReference();
    }
  }

  public async requestClearData() {
    if (!navigator.cookieEnabled) {
      this.toastManager.showToast(
        "It's not possible to clear any data because cookies are disabled. -> Access to local storage was denied.",
        "error",
        "database-alert"
      );
      return;
    }
    const confirmed = await this.dialogManager.confirmRequest(
      "This action deletes all data, preferences, configuration and games played (including the current one) stored on this device and reloads the page. Are you sure?"
    );
    if (confirmed) {
      this.clearData();
    }
  }

  public clearData() {
    localStorage.clear();
    location.reload();
  }
}

export default UserDataManager;
