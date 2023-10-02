import ComplexUserData from "./complex_user_data";
import type ToastManager from "../toast_manager";

export type BooleanBoardState = boolean[][];

class BooleanBoardStateData extends ComplexUserData<BooleanBoardState> {
  constructor(
    id: string,
    value: BooleanBoardState,
    reactiveValue: BooleanBoardState,
    toastManager: ToastManager,
    autoSave: boolean = true
  ) {
    super(id, value, reactiveValue, toastManager, autoSave);
  }

  get numberVersion() {
    return this.value.map((row) => row.map((value) => Number(value)));
  }

  public dump(): string {
    return JSON.stringify(this.numberVersion);
  }

  public load(dumped: string): void {
    const value = this.safelyParse(dumped);
    if (!value) {
      return;
    }
    if (!Array.isArray(value)) {
      console.error("The parsed value of boolean board state is not an array.");
      this.handleInvalidLoadValue(dumped);
      return;
    }
    for (const rowIndex in value) {
      for (const colIndex in value[rowIndex]) {
        value[rowIndex][colIndex] = Boolean(value[rowIndex][colIndex]);
      }
    }
    this.value = value;
  }

  public apply(): void {}
}

export default BooleanBoardStateData;
