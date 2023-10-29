type EscapeCallback = (args?: any) => void;

class EscapeManager {
  private readonly escapeStack: EscapeCallback[];
  public defaultCallBack: EscapeCallback | null = null;

  constructor() {
    this.escapeStack = [];
  }

  public escape() {
    const callBack = this.escapeStack[this.escapeStack.length - 1];
    if (callBack) {
      callBack();
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
