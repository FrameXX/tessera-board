import { watch, type Ref, ref } from "vue";
import EscapeManager from "./escape_manager";
import {
  setCSSVariable,
  setPrimaryHue,
  setSaturationMultiplier,
} from "./utils/elements";
import ToastManager from "./toast_manager";
import type Game from "./game";
import type { Winner } from "./game";
import DurationDialog from "./dialogs/duration";
import ConfirmDialog from "./dialogs/confirm";
import ConfigPieceDialog from "./dialogs/config_piece";
import SelectPieceDialog from "./dialogs/select_piece";
import ConfigPrintDialog from "./dialogs/config_print";
import ConfigsDialog from "./dialogs/configs";

/**
 * UI stands for User Interface. The class takes care of all the props and functions related to user interface.
 * @class
 */
class UI {
  public readonly escapeManager: EscapeManager;
  public readonly actionPanelOpen: Ref<boolean> = ref(false);
  public readonly settingsOpen: Ref<boolean> = ref(false);
  public readonly aboutOpen: Ref<boolean> = ref(false);
  public readonly toastManager = new ToastManager();
  public readonly durationDialog = new DurationDialog();
  public readonly confirmDialog = new ConfirmDialog();
  public readonly configPieceDialog = new ConfigPieceDialog();
  public readonly selectPieceDialog = new SelectPieceDialog(this.toastManager);
  public readonly configPrintDialog = new ConfigPrintDialog(this.toastManager);
  public readonly configsDialog = new ConfigsDialog(
    this.confirmDialog,
    this.configPrintDialog,
    this.toastManager
  );

  constructor(private readonly game: Game) {
    this.escapeManager = new EscapeManager(this.toggleActionsPanel);
    watch(this.settingsOpen, () => {
      this.onDistractionChange();
    });
    watch(this.aboutOpen, () => {
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
    this.game.userDataManager.recoverData();
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
    if (this.game.paused.value === "not") {
      this.game.paused.value = "manual";
    } else {
      this.game.paused.value = "not";
    }
  }

  public onDistractionChange() {
    const distracted =
      document.visibilityState === "hidden" ||
      this.settingsOpen.value ||
      this.aboutOpen.value;

    if (
      distracted &&
      this.game.settings.autoPauseGame.value &&
      this.game.paused.value === "not"
    ) {
      this.game.paused.value = "auto";
    }
    if (!distracted && this.game.paused.value === "auto") {
      this.game.paused.value = "not";
    }
  }
}

export default UI;
