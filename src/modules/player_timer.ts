import { type Ref, ref, computed, watch, capitalize } from "vue";
import type Game from "./game";
import type {
  Player,
  PlayerColor,
  WinReason} from "./utils/game";
import {
  getOpossitePlayerColor,
} from "./utils/game";

class PlayerTimer {
  public seconds = ref(0);
  public running = computed(() => {
    if (this.game.paused.value !== "not") return false;
    if (this.game.winner.value !== "none") return false;
    if (this.isPrimaryPlayer !== this.game.primaryPlayerPlaying.value)
      return false;
    return true;
  });
  public remainingSeconds = computed(() => {
    return this.secondsLimit.value - this.seconds.value;
  });
  public reachedLimit = computed(() => {
    return this.secondsLimit.value === 0
      ? false
      : this.remainingSeconds.value < 1;
  });
  private interval: number = 0;

  constructor(
    private readonly game: Game,
    private readonly isPrimaryPlayer: boolean,
    private readonly isMoveTimer: boolean,
    private readonly secondsLimit: Ref<number>
  ) {
    this.onRunningChange(this.running.value);
    this.onReachedLimitChange(this.reachedLimit.value);

    watch(this.running, (newValue) => this.onRunningChange(newValue));
    watch(this.reachedLimit, (newValue) => this.onReachedLimitChange(newValue));
  }

  private onReachedLimitChange(newValue: boolean) {
    newValue ? this.onReachLimit() : this.onUnreachLimit();
  }

  private onRunningChange(newValue: boolean) {
    newValue ? this.startInterval() : this.stopInterval();
  }

  private onUnreachLimit() {
    if (
      this.game.winReason.value === this.winReason &&
      this.game.winner.value === this.limitReachWinner
    ) {
      this.game.cancelWin();
    }
  }

  private onReachLimit() {
    this.game.ui.toastManager.showToast(
      `${capitalize(this.playerColor)} run out of ${this.name} time!`,
      "timer-alert-outline"
    );
    if (
      this.isMoveTimer &&
      this.game.settings.secondsMoveLimitRunOutPunishment.value ===
        "random_move"
    ) {
      const randomMove = this.game.getRandomMove(this.playerColor);
      this.game.performMove(randomMove);
      return;
    }
    this.game.playerWin(this.limitReachWinner, this.winReason);
  }

  private get limitReachWinner(): Player {
    return this.isPrimaryPlayer ? "secondary" : "primary";
  }

  private get name() {
    return this.isMoveTimer ? "move" : "match";
  }

  private get winReason(): WinReason {
    return this.isMoveTimer ? "move_timeout" : "match_timeout";
  }

  private get playerColor(): PlayerColor {
    return this.isPrimaryPlayer
      ? this.game.primaryPlayerColor.value
      : getOpossitePlayerColor(this.game.primaryPlayerColor.value);
  }

  private startInterval() {
    this.interval = window.setInterval(() => {
      this.seconds.value++;
    }, 1000);
  }

  private stopInterval() {
    window.clearInterval(this.interval);
  }

  public reset() {
    this.seconds.value = 0;
  }
}

export default PlayerTimer;
