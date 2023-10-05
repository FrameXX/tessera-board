import type { Ref } from "vue";

class Timer {
  private interval: number | null = null;

  constructor(private readonly seconds: Ref<number>) {}

  private setInterval() {
    this.interval = setInterval(() => {
      this.seconds.value++;
    }, 1000);
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
