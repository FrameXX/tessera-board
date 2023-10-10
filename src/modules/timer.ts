import { watch, type Ref } from "vue";

class Timer extends EventTarget {
  private interval: number | null | NodeJS.Timer = null;
  private runOut: boolean = false;

  constructor(
    private readonly seconds: Ref<number>,
    private readonly totalSeconds: Ref<number>
  ) {
    super();
    watch(this.totalSeconds, (newValue) => {
      this.checkTotalSecondsLegibility(newValue);
    });
  }

  private onRunBack() {
    this.dispatchEvent(new Event("runback"));
    this.runOut = false;
  }

  private onRunOut() {
    this.dispatchEvent(new Event("runout"));
    this.runOut = true;
  }

  private checkTotalSecondsLegibility(totalSeconds: number) {
    if (totalSeconds === 0) return;
    if (this.seconds.value <= totalSeconds && !this.runOut) {
      this.onRunOut();
    } else if (this.seconds.value <= totalSeconds && this.runOut) {
      this.onRunBack();
    }
  }

  private checkRunOut() {
    if (this.seconds.value === this.totalSeconds.value) this.onRunOut();
  }

  private onInterval() {
    this.seconds.value++;
    this.checkRunOut();
  }

  private setInterval() {
    this.interval = setInterval(() => this.onInterval(), 1000);
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
