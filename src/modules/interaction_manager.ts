import { type Ref } from "vue";
import type EscapeManager from "./escape_manager";
import { setCSSVariable } from "./utils/elements";
import type ToastManager from "./toast_manager";
import type UserDataManager from "./user_data_manager";
import type ConfirmDialog from "./dialogs/confirm";
import type Game from "./game";
import type { GamePaused } from "./game";

class InteractionManager {
  constructor(
    private readonly escapeManager: EscapeManager,
    private readonly toastManager: ToastManager,
    private readonly userDataManager: UserDataManager,
    private readonly game: Game,
    private readonly confirmDialog: ConfirmDialog,
    private readonly actionPanelOpen: Ref<boolean>,
    private readonly settingsOpen: Ref<boolean>,
    private readonly aboutOpen: Ref<boolean>,
    private readonly gamePaused: Ref<GamePaused>,
    private readonly autoPause: Ref<boolean>
  ) {}

  toggleActionsPanel() {
    this.actionPanelOpen.value = !this.actionPanelOpen.value;
    this.actionPanelOpen.value
      ? this.escapeManager.addLayer(this.toggleActionsPanel)
      : this.escapeManager.removeLayer();

    if (!this.actionPanelOpen.value) {
      if (this.settingsOpen.value) {
        this.toggleSettings();
      }
      if (this.aboutOpen.value) {
        this.toggleAbout();
      }
    }
  }

  toggleSettings() {
    this.settingsOpen.value = !this.settingsOpen.value;
    this.settingsOpen.value
      ? this.escapeManager.addLayer(this.toggleActionsPanel)
      : this.escapeManager.removeLayer();
  }

  toggleAbout() {
    this.aboutOpen.value = !this.aboutOpen.value;
    this.aboutOpen.value
      ? this.escapeManager.addLayer(this.toggleActionsPanel)
      : this.escapeManager.removeLayer();
  }

  updateScreenRotation(rotate: boolean): void {
    rotate
      ? setCSSVariable("app-transform", "rotate(-0.5turn)")
      : setCSSVariable("app-transform", "");
  }

  tryRecoverData() {
    if (!navigator.cookieEnabled) {
      this.toastManager.showToast(
        "Cookies are disabled. -> No changes will be restored in next session.",
        "error",
        "cookie-alert"
      );
      return false;
    }
    this.userDataManager.recoverData();
    return true;
  }

  async onGameRestart() {
    const confirmed = await this.confirmDialog.show(
      "Currently played game will be lost. Are you sure?"
    );
    if (!confirmed) return;
    this.actionPanelOpen.value = false;
    this.game.restart();
  }

  manualyTogglePause() {
    if (this.gamePaused.value === "not") {
      this.gamePaused.value = "manual";
    } else {
      this.gamePaused.value = "not";
    }
  }

  onFocusChange(focused: boolean) {
    if (!focused && this.autoPause.value && this.gamePaused.value === "not") {
      this.gamePaused.value = "auto";
    }
    if (focused && this.gamePaused.value === "auto") {
      this.gamePaused.value = "not";
    }
  }
}

export default InteractionManager;
