import {
  repaintElement,
  waitForTransitionEnd,
  getElementInstanceById,
} from "../utils/elements";
import TransitionsManager from "./transitions_manager";

class SplashscreenManager {
  private transitionsManager: TransitionsManager;
  private splashscreen = getElementInstanceById("splashscreen", HTMLElement);
  private cell1 = getElementInstanceById("cell1");
  private cell2 = getElementInstanceById("cell2");

  constructor(transitionsManager: TransitionsManager) {
    this.transitionsManager = transitionsManager;
  }

  public async hideSplashscreen() {
    const transition = this.transitionsManager.preferredTransitions;

    // Both animations end and start at the same time thus it's not required to listen to both elements.
    if (transition) {
      await this.awaitCell1AnimationIteration();
    }
    this.cell1.classList.remove("animated");
    this.cell2.classList.remove("animated");
    repaintElement(this.cell1);
    repaintElement(this.cell2);
    this.cell1.classList.add("away");
    this.cell2.classList.add("away");

    this.splashscreen.classList.add("faded");
    if (transition) {
      await waitForTransitionEnd(this.splashscreen, "opacity", 3000);
    }
    this.splashscreen.hidden = true;
  }

  private awaitCell1AnimationIteration(): Promise<void> {
    return new Promise((resolve) => {
      this.cell1.addEventListener("animationiteration", () => resolve());
    });
  }
}

export default SplashscreenManager;
