import { watch, type Ref, ref, computed } from "vue";
import EscapeManager from "./escape_manager";
import {
  setCSSVariable,
  setPrimaryHue,
  setSaturationMultiplier,
} from "./utils/elements";
import ToastManager from "./toast_manager";
import type Game from "./game";
import DurationDialog from "./dialogs/duration";
import ConfirmDialog from "./dialogs/confirm";
import ConfigPieceDialog from "./dialogs/config_piece";
import SelectPieceDialog from "./dialogs/select_piece";
import ConfigPrintDialog from "./dialogs/config_print";
import ConfigsDialog from "./dialogs/configs";
import type { Winner } from "./utils/game";

const UI_FRAGMENTS = ["settings", "about", "help", "statistics"] as const;
type UIFragment = (typeof UI_FRAGMENTS)[number];

/**
 * UI stands for User Interface. The class takes care of all the props and functions related to user interface.
 * @class
 */
class UI {
  public readonly escapeManager: EscapeManager;
  public readonly actionPanelOpen: Ref<boolean> = ref(false);
  public readonly openedFragment: Ref<UIFragment | null> = ref(null);
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
  public readonly rotated = computed(() => {
    return (
      this.game.settings.tableModeEnabled.value &&
      !this.game.settings.secondCheckboardEnabled.value &&
      !this.game.primaryPlayerPlaying.value
    );
  });

  constructor(private readonly game: Game) {
    this.escapeManager = new EscapeManager(this.toggleActionsPanel);
    watch(this.game.paused, (newValue) => {
      if (newValue !== "not") {
        this.toastManager.showToast("Game paused", "pause");
      } else {
        this.toastManager.showToast("Game resumed", "play-outline");
      }
    });
    watch(this.openedFragment, () => {
      this.updateDistractionState();
    });
    watch(this.rotated, (newValue) => {
      this.updateScreenRotation(newValue);
    });

    addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key === "Escape") this.escapeManager.escape();
      if (event.key === "R" && event.shiftKey) this.game.restart();
      if (event.key === "P" && event.shiftKey) this.manuallyTogglePause();
      if (event.key === "Z" && (event.shiftKey || event.ctrlKey))
        this.game.requestUndoMove();
      if (event.key === "Y" && (event.shiftKey || event.ctrlKey))
        this.game.requestRedoMove();
      if (event.key === "C" && event.shiftKey) this.switchFragment("settings");
    });

    addEventListener("visibilitychange", () => {
      this.updateDistractionState();
    });
  }

  public updatePrimaryHue(primaryPlayerPlaying: boolean, winner: Winner) {
    switch (winner) {
      case "none":
        setPrimaryHue(primaryPlayerPlaying);
        break;
      case "draw":
        setSaturationMultiplier(0);
        break;
      case "primary":
        setPrimaryHue(true);
        break;
      case "secondary":
        setPrimaryHue(false);
        break;
      default:
        break;
    }
    if (winner !== "draw") {
      setSaturationMultiplier(1);
    }
  }

  public switchFragment(fragment: UIFragment) {
    if (this.actionPanelOpen.value && !this.openedFragment.value) {
      this.toggleFragment(fragment);
      return;
    }
    this.toggleActionsPanel();
    if (this.actionPanelOpen.value) this.toggleFragment(fragment);
  }

  public toggleActionsPanel = () => {
    this.actionPanelOpen.value = !this.actionPanelOpen.value;
    this.actionPanelOpen.value
      ? this.escapeManager.addLayer(this.toggleActionsPanel)
      : this.escapeManager.removeLayer();
    if (!this.actionPanelOpen.value) this.closeFragment();
  };

  private openFragment(fragment: UIFragment) {
    this.openedFragment.value = fragment;
  }

  private closeFragment() {
    this.openedFragment.value = null;
  }

  public toggleFragment(fragment: UIFragment) {
    this.openedFragment.value
      ? this.closeFragment()
      : this.openFragment(fragment);
    this.openedFragment.value
      ? this.escapeManager.addLayer(this.toggleActionsPanel)
      : this.escapeManager.removeLayer();
  }

  public updateScreenRotation(rotate: boolean): void {
    rotate
      ? setCSSVariable("app-transform", "rotate(-0.5turn)")
      : setCSSVariable("app-transform", "");
  }

  public async requestRestart() {
    const confirmed = await this.confirmDialog.show(
      "Currently played game will be lost. Are you sure?",
      "Confirm",
      "Cancel"
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

  public updateDistractionState() {
    const distracted =
      document.visibilityState === "hidden" || this.openedFragment.value;

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
