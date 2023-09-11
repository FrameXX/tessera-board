type EscapeCallback = (args?: any) => void;

class EscapeManager {
  private readonly escapeStack: EscapeCallback[];

  constructor(private readonly defaultCallBack: EscapeCallback) {
    this.escapeStack = [];
  }

  public escape() {
    const callBack = this.escapeStack[this.escapeStack.length - 1];
    callBack ? callBack() : this.defaultCallBack();
  }

  addLayer(escapeCallback: EscapeCallback) {
    this.escapeStack.push(escapeCallback);
  }

  removeLayer() {
    this.escapeStack.pop();
  }
}

export default EscapeManager;
