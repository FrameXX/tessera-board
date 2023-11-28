import type { Ref } from "vue";
import { watch } from "vue";
import type ToastManager from "../toast_manager";

export type SaveCallBack = () => void;

export class UserDataError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, UserDataError.prototype);
    this.name = UserDataError.name;
  }
}

// UserData class manages recovering, applying and saving data types from and to localStorage.
abstract class UserData<ValueType> {
  public static readonly BASE_STORAGE_KEY = "tessera_board";
  private valueRef?: Ref<ValueType>;
  protected storageKey: string;

  constructor(
    public readonly id: string,
    public value: ValueType,
    private readonly toastManager?: ToastManager,
    valueRef?: Ref<ValueType>,
    private readonly autoSave: boolean = true
  ) {
    this.storageKey = `${UserData.BASE_STORAGE_KEY}-${this.id}`;

    // Watch ref for changes, update the original value and save changes.
    if (!valueRef) {
      return;
    }
    this.valueRef = valueRef;
    watch(
      valueRef,
      async (newValue) => {
        this.onValueChange(newValue);
      },
      { deep: true }
    );
  }

  protected get isSavedOnce() {
    let isSavedOnce: boolean;
    navigator.cookieEnabled
      ? (isSavedOnce = localStorage.getItem(this.storageKey) !== null)
      : (isSavedOnce = false);
    return isSavedOnce;
  }

  protected safelyParse(dumped: string) {
    let value;
    try {
      value = JSON.parse(dumped);
    } catch (error) {
      console.error(
        `An error occured while trying to parse ${this.id}.`,
        error
      );
      this.handleInvalidLoadValue(dumped);
      return;
    }
    return value;
  }

  public onRecoverCheck() {}

  public save() {
    this.updateValueFromRef();
    if (navigator.cookieEnabled)
      localStorage.setItem(this.storageKey, this.dump());
  }

  private updateValueFromRef() {
    if (!this.valueRef) return;
    this.value = this.valueRef.value;
  }

  protected onValueChange(newValue: ValueType) {
    this.value = newValue;
    this.apply();
    if (this.autoSave) this.save();
  }

  protected handleInvalidLoadValue(value: string) {
    console.error(`Invalid load value for ${this.id}.`, value);
    if (!this.toastManager) {
      return;
    }
    this.toastManager.showToast(
      "An error occured while trying to load data from local storage. Your data are probably corrupted or invalid. If the problem persists clear all data.",
      "database-alert",
      "error"
    );
  }

  public updateReference() {
    if (this.valueRef) {
      this.valueRef.value = this.value;
    }
  }

  public recover() {
    const dumped = localStorage.getItem(this.storageKey);
    if (dumped) {
      this.load(dumped);
    }
  }

  public abstract apply(): void;

  // Dump value into a string
  public abstract dump(): string;

  // Load value from a string
  public abstract load(dumped: string): void;
}

export default UserData;
