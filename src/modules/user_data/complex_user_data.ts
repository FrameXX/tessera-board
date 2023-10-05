import { toRaw, watch } from "vue";
import type ToastManager from "../toast_manager";
import UserData from "./user_data";

// The ComplexUserData class uses reactive instead of ref which means it can also watch and react for changes in properties of the reatcive value, thus it's more suitable for more complex values. This is still an abstract class and some methods need to be implemented by extending classes (children).
abstract class ComplexUserData<ValueType> extends UserData<ValueType> {
  constructor(
    id: string,
    value: ValueType,
    protected reactiveValue: ValueType,
    toastManager: ToastManager,
    autoSave: boolean = true,
    saveImmidiately = false
  ) {
    super(id, value, toastManager);

    if (autoSave) {
      watch(reactiveValue!, (newValue) => {
        this.onValueChange(newValue);
      });
    }
    if (saveImmidiately && !this.isSavedOnce) this.save();
  }

  // HACK: Value of reactive is a proxy. To get the original value toRaw built-in Vue function is used to extract the real value.
  protected onValueChange(newValue: ValueType) {
    this.value = toRaw(newValue);
    this.apply();
    this.save();
  }

  // NOTE: Reactive loses reactivity if the whole value is overwritten. The values needs to be chnaged key by key instead of updating it as a whole.
  public updateReference() {
    for (const key in this.reactiveValue) {
      this.reactiveValue[key] = this.value[key];
    }
  }

  public apply(): void {}
}

export default ComplexUserData;
