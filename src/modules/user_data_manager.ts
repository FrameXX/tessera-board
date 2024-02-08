import type UserData from "./user_data/user_data";
import type ConfirmDialog from "./dialogs/confirm";
import type Toaster from "./toast_manager";
import { exportData, importData } from "./utils/data";

class UserDataManager {
  private readonly confirmDialog: ConfirmDialog;
  private readonly toaster: Toaster;

  constructor(
    public entries: UserData<any>[],
    dialogManager: ConfirmDialog,
    toaster: Toaster
  ) {
    this.confirmDialog = dialogManager;
    this.toaster = toaster;
  }

  public requestExportData() {
    if (!navigator.cookieEnabled) {
      this.toaster.bake(
        "Cannot access local storage because cookies are disabled.",
        "database-alert",
        "error"
      );
      return;
    }
    exportData();
  }

  public async requestImportData() {
    const confirmed = await this.confirmDialog.show(
      "Are you sure? All current data will be cleared, new data will be written and page reloaded."
    );
    if (!confirmed) return;
    if (!navigator.cookieEnabled) {
      this.toaster.bake(
        "Cannot access local storage because cookies are disabled.",
        "database-alert",
        "error"
      );
      return;
    }
    importData(this.toaster);
  }

  public recoverData() {
    let recoverError = false;
    for (const entry of this.entries) {
      try {
        entry.recover(this.toaster);
      } catch (error) {
        console.error(
          `An unexpected error occured when restoring ${entry.id}. No data was restored. Data may be corrupted or invalid. Alerting user.`,
          error
        );
        recoverError = true;
      }
    }
    if (recoverError) {
      this.toaster.bake(
        "Some values could not be restored from local storage. Data may be corrupted or invalid. If the problem persists clear all data.",
        "database-alert",
        "error"
      );
    }
  }

  public onRecoverCheck() {
    for (const entry of this.entries) {
      entry.onRecoverCheck();
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
      this.toaster.bake(
        "It's not possible to clear any data because cookies are disabled. -> Access to local storage was denied.",

        "database-alert"
      );
      return;
    }
    const confirmed = await this.confirmDialog.show(
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
