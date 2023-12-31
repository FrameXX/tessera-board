import { getDigitStr } from "./misc";

export default class Duration {
  public readonly minutes: number;
  public readonly seconds: number;

  constructor(seconds: number) {
    this.minutes = Math.trunc(seconds / 60);
    this.seconds = seconds % 60;
  }

  get totalSeconds() {
    return this.minutes * 60 + this.seconds;
  }

  get stringifiedLimit() {
    if (this.minutes === 0 && this.seconds === 0) return "∞";
    return this.strigifiedTimer;
  }

  get strigifiedTimer() {
    return `${getDigitStr(this.minutes)}:${getDigitStr(this.seconds)}`;
  }
}
