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
  public static readonly STORAGE_KEY = "tessera_board";
  private valueRef?: Ref<ValueType>;

  constructor(
    public readonly id: string,
    protected value: ValueType,
    private readonly toastManager: ToastManager,
    valueRef?: Ref<ValueType>
  ) {
    // Watch ref for changes, update the original value and save changes.
    if (valueRef) {
      this.valueRef = valueRef;
      watch(
        valueRef,
        async (newValue) => {
          this.onValueChange(newValue);
        },
        { deep: true }
      );
    }
  }

  public save() {
    if (navigator.cookieEnabled) {
      localStorage.setItem(`${UserData.STORAGE_KEY}-${this.id}`, this.dump());
    }
  }

  protected onValueChange(newValue: ValueType) {
    this.value = newValue;
    this.apply();
    this.save();
  }

  protected handleInvalidLoadValue(value: string) {
    console.error("Invalid load value.", value);
    this.toastManager.showToast(
      "An error occured while trying to load data from local storage. Your data are probably corrupted or invalid and it's recommended that you clear all data.",
      "error",
      "database-alert"
    );
  }

  public updateReference() {
    if (this.valueRef) {
      this.valueRef.value = this.value;
    }
  }

  public recover() {
    const dumped = localStorage.getItem(`${UserData.STORAGE_KEY}-${this.id}`);
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
