import { ComplexUserData } from "./user_data";
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
    let value;
    try {
      value = JSON.parse(dumped);
    } catch (error) {
      console.error(
        "An error occured while trying to parse boolean board state.",
        error
      );
      this.handleInvalidLoadValue(dumped);
    }
    if (!Array.isArray(value)) {
      console.error("The parsed value of boolean board state is not an array");
      this.handleInvalidLoadValue(dumped);
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
