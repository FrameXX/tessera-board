import { watch, type Ref } from "vue";
import EscapeManager from "./escape_manager";
import {
  setCSSVariable,
  setPrimaryHue,
  setSaturationMultiplier,
} from "./utils/elements";
import type ToastManager from "./toast_manager";
import type UserDataManager from "./user_data_manager";
import type ConfirmDialog from "./dialogs/confirm";
import type Game from "./game";
import type { GamePausedState } from "./user_data/game_paused";
import type { Winner } from "./game";

class InteractionManager {
  public readonly escapeManager: EscapeManager;

  constructor(
    private readonly toastManager: ToastManager,
    private readonly userDataManager: UserDataManager,
    private readonly game: Game,
    private readonly confirmDialog: ConfirmDialog,
    private readonly actionPanelOpen: Ref<boolean>,
    private readonly settingsOpen: Ref<boolean>,
    private readonly aboutOpen: Ref<boolean>,
    private readonly gamePaused: Ref<GamePausedState>,
    private readonly autoPauseGame: Ref<boolean>
  ) {
    this.escapeManager = new EscapeManager(this.toggleActionsPanel);
    watch(settingsOpen, () => {
      this.onDistractionChange();
    });
    watch(aboutOpen, () => {
      this.onDistractionChange();
    });
  }

  public updatePrimaryHue(playerPlaying: boolean, winner: Winner) {
    switch (winner) {
    case "none":
      setPrimaryHue(playerPlaying);
      break;
    case "draw":
      setSaturationMultiplier(0);
      break;
    case "player":
      setPrimaryHue(true);
      break;
    case "opponent":
      setPrimaryHue(false);
      break;
    default:
      break;
    }
    if (winner !== "draw") {
      setSaturationMultiplier(1);
    }
  }

  public toggleActionsPanel = () => {
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
  };

  public toggleSettings = () => {
    this.settingsOpen.value = !this.settingsOpen.value;
    this.settingsOpen.value
      ? this.escapeManager.addLayer(this.toggleActionsPanel)
      : this.escapeManager.removeLayer();
  };

  public toggleAbout = () => {
    this.aboutOpen.value = !this.aboutOpen.value;
    this.aboutOpen.value
      ? this.escapeManager.addLayer(this.toggleActionsPanel)
      : this.escapeManager.removeLayer();
  };

  public updateScreenRotation(rotate: boolean): void {
    rotate
      ? setCSSVariable("app-transform", "rotate(-0.5turn)")
      : setCSSVariable("app-transform", "");
  }

  public tryRecoverData() {
    if (!navigator.cookieEnabled) {
      this.toastManager.showToast(
        "Cookies are disabled. -> No changes will be restored in next session.",

        "cookie-alert"
      );
      return false;
    }
    this.userDataManager.recoverData();
    return true;
  }

  public async onGameRestart() {
    const confirmed = await this.confirmDialog.show(
      "Currently played game will be lost. Are you sure?",
      "Confirm",
      "Cancel",
      "You can also start a new game by pressing Shift + R, which will bypass this confirmation dialog."
    );
    if (!confirmed) return;
    this.actionPanelOpen.value = false;
    this.game.restart();
  }

  public manuallyTogglePause() {
    if (this.gamePaused.value === "not") {
      this.gamePaused.value = "manual";
    } else {
      this.gamePaused.value = "not";
    }
  }

  public onDistractionChange() {
    const distracted =
      document.visibilityState === "hidden" ||
      this.settingsOpen.value ||
      this.aboutOpen.value;

    if (
      distracted &&
      this.autoPauseGame.value &&
      this.gamePaused.value === "not"
    ) {
      this.gamePaused.value = "auto";
    }
    if (!distracted && this.gamePaused.value === "auto") {
      this.gamePaused.value = "not";
    }
  }
}

export default InteractionManager;
