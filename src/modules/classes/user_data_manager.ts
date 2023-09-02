import type UserData from "../user_data/user_data";
import type DialogManager from "./dialog_manager";
import type ToastManager from "./toast_manager";

class UserDataManager {
  private readonly dialogManager: DialogManager;
  private readonly toastManager: ToastManager;
  public entries: UserData<any>[] = [];

  constructor(dialogManager: DialogManager, toastManager: ToastManager) {
    this.dialogManager = dialogManager;
    this.toastManager = toastManager;
  }

  public recoverData() {
    let recoverError = false;
    for (const entry of this.entries) {
      try {
        entry.recover();
      } catch (error) {
        console.error(
          `An eerror occured when restoring ${entry.id}. No data was restored. Data may be corrupted. Alerting user.`,
          error
        );
        recoverError = true;
      }
    }
    if (recoverError) {
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
