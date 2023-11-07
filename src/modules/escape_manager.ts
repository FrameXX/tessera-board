type EscapeCallback = () => void;

class EscapeManager {
  private readonly escapeStack: EscapeCallback[];

  constructor(public defaultCallBack: EscapeCallback | null = null) {
    this.escapeStack = [];
  }

  public escape() {
    if (this.escapeStack.length > 0) {
      const callback = this.escapeStack[this.escapeStack.length - 1];
      callback();
    } else if (this.defaultCallBack) {
      this.defaultCallBack();
    }
  }

  addLayer(escapeCallback: EscapeCallback) {
    this.escapeStack.push(escapeCallback);
  }

  removeLayer() {
    this.escapeStack.pop();
  }
}

export default EscapeManager;
