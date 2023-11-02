import { type Ref, type ComputedRef, computed } from "vue";

class Timer {
  private interval: number | null = null;
  public beyondLimit: ComputedRef<boolean>;

  constructor(
    private readonly seconds: Ref<number>,
    private readonly secondsLimit: Ref<number>
  ) {
    this.beyondLimit = computed(() => {
      if (this.secondsLimit.value === 0) {
        return false;
      }
      return seconds.value >= secondsLimit.value;
    });
  }

  private setInterval() {
    this.interval = window.setInterval(() => this.seconds.value++, 1000);
  }

  public reset() {
    this.seconds.value = 0;
  }

  public restart() {
    this.seconds.value = 0;
    if (this.interval === null) this.setInterval();
  }

  public pause() {
    if (this.interval !== null) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  public resume() {
    if (this.interval === null) this.setInterval();
  }
}

export default Timer;
