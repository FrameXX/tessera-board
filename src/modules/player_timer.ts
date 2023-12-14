import { type Ref, ref, computed, watch } from "vue";
import Game from "./game";
import {
  PlayerColor,
  WinReason,
  Winner,
  getColorTeamName,
  getOpossitePlayerColor,
} from "./utils/game";

class PlayerTimer {
  public seconds = ref(0);
  public running = computed(() => {
    if (this.game.paused.value !== "not") return false;
    if (this.game.winner.value !== "none") return false;
    if (this.isPlayer !== this.game.playerPlaying.value) return false;
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
    private readonly isPlayer: boolean,
    private readonly isMoveTimer: boolean,
    private readonly secondsLimit: Ref<number>
  ) {
    watch(this.running, (newValue) =>
      newValue ? this.startInterval() : this.stopInterval()
    );
    watch(this.reachedLimit, (newValue) =>
      newValue ? this.onReachLimit() : this.onUnreachLimit()
    );
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
      `${getColorTeamName(this.playerColor)} run out of ${this.name} time!`,
      "timer-alert-outline"
    );
    if (
      this.isMoveTimer &&
      this.game.settings.secondsMoveLimitRunOutPunishment.value ===
        "random_move"
    ) {
      this.game.performRandomMove(this.playerColor);
      return;
    }
    this.opponentWin();
  }

  private get limitReachWinner(): Winner {
    return this.isPlayer ? "opponent" : "player";
  }

  private get name() {
    return this.isMoveTimer ? "move" : "match";
  }

  private get winReason(): WinReason {
    return this.isMoveTimer ? "move_timeout" : "match_timeout";
  }

  private get playerColor(): PlayerColor {
    return this.isPlayer
      ? this.game.playerColor.value
      : getOpossitePlayerColor(this.game.playerColor.value);
  }

  private opponentWin() {
    this.isPlayer
      ? this.game.opponentWin(this.winReason)
      : this.game.playerWin(this.winReason);
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
