import { watch, type Ref } from "vue";

class Timer {
  private interval: number | null = null;
  private timeOut: boolean;

  constructor(
    private readonly seconds: Ref<number>,
    private readonly secondsLimit: Ref<number>,
    private readonly timeOutCallback: () => any,
    private readonly timeInCallBack: () => any
  ) {
    this.timeOut = this.isTimeOut();
    watch(this.seconds, this.checkTimeOut);
    watch(this.secondsLimit, this.checkTimeOut);
  }

  private checkTimeOut = () => {
    const timeOut = this.isTimeOut();
    if (timeOut === this.timeOut) return;
    timeOut ? this.timeOutCallback() : this.timeInCallBack();
    this.timeOut = timeOut;
  };

  private isTimeOut() {
    if (this.secondsLimit.value === 0) {
      return false;
    }
    return this.seconds.value >= this.secondsLimit.value;
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
