export default abstract class Storable<ValueType> extends EventTarget {
  public static storeIdPrefix = "tessera-board";
  private _value: ValueType;

  constructor(
    value: ValueType,
    public readonly id: string,
    private readonly autoSave = true
  ) {
    super();
    this._value = value;
    this.recover();
  }

  public set value(value: ValueType) {
    this._value = value;
    const changeEvent = new CustomEvent("change", { detail: value });
    this.dispatchEvent(changeEvent);
    if (this.autoSave) this.save();
  }

  public get value() {
    return this._value;
  }

  public save() {
    if (!navigator.cookieEnabled) return;
    localStorage.setItem(this.storeId, this.toString());
  }

  public recover() {
    if (!navigator.cookieEnabled) return;
    const itemValue = localStorage.getItem(this.storeId);
    if (itemValue) this.fromString(itemValue);
  }

  public abstract toString(): string;

  public abstract fromString(string: string): void;

  private get storeId() {
    return `${Storable.storeIdPrefix}-${this.id}`;
  }
}
