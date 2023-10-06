import type { PlayerColor } from "../pieces/piece";

export class ElementNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ElementNotFoundError.prototype);
    this.name = ElementNotFoundError.name;
  }
}

export class ElementTypeError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ElementNotFoundError.prototype);
    this.name = ElementNotFoundError.name;
  }
}

const DOMRoot = getDOMRoot();

function getDOMRoot(): HTMLElement {
  const root = document.querySelector(":root");
  if (!(root instanceof HTMLElement)) {
    throw new Error("Root DOM element wasn't found in DOM");
  }
  return root;
}

export function setCSSVariable(name: string, value: string) {
  DOMRoot.style.setProperty("--" + name, value);
}

export function repaintElement(...elements: Element[]): void {
  for (const element of elements) {
    getComputedStyle(element).opacity;
  }
}

export function areTransitionsDisabled(): boolean {
  return (
    DOMRoot.style.getPropertyValue("--transition-duration-multiplier") === "0"
  );
}

export async function waitForTransitionEnd(
  element: HTMLElement | SVGElement,
  propertyName?: string,
  abortionTimoutMs: number = 1000
): Promise<void> {
  return new Promise((resolve) => {
    if (areTransitionsDisabled()) {
      resolve();
      return;
    }
    const abortionTimeout = setTimeout(() => {
      resolve();
      console.warn(
        `Waiting for transition was forcefully aborted after ${abortionTimoutMs} miliseconds.`
      );
    }, abortionTimoutMs);

    element.addEventListener("transitionend", (event: Event) => {
      if (!(event instanceof TransitionEvent)) {
        console.error(
          "Transitionend listener did not return a TransitionEvent."
        );
        return;
      }
      if (!propertyName || event.propertyName === propertyName) {
        clearTimeout(abortionTimeout);
        resolve();
      }
    });
  });
}

function validateElementInstance<T extends Element>(
  element: Element | null,
  query: string,
  instance: { new (): T }
): T {
  if (element === null) {
    throw new ElementNotFoundError(
      `Element of query "${query}" wasn't found in DOM.`
    );
  }
  if (!(element instanceof instance)) {
    throw new ElementTypeError(
      `Element of id "${query}" is not an instance of "${instance.name}".`
    );
  }
  return element as T;
}

export function getElementInstanceById<T extends Element = Element>(
  id: string,
  instance: { new (): T } = Element as { new (): T }
): T {
  const element = document.getElementById(id);
  return validateElementInstance(element, "#" + id, instance);
}

export function activateColors(): void {
  setCSSVariable("S-primary-text", "var(--S-primary-text-active)");
  setCSSVariable("S-primary-surface", "var(--S-primary-surface-active)");
  setCSSVariable(
    "S-primary-surface-top",
    "var(--S-primary-surface-top-active)"
  );
  setCSSVariable(
    "S-primary-surface-accent",
    "var(--S-primary-surface-accent-active)"
  );
  setCSSVariable("S-primary-accent", "var(--S-primary-accent-active)");
  setCSSVariable("S-cell", "var(--S-cell-active)");
  setCSSVariable("S-piece-fill", "var(--S-piece-fill-active)");
  setCSSVariable("S-piece-stroke", "var(--S-piece-stroke-active)");
  setCSSVariable("S-dim", "var(--S-dim-active)");
}

export function updatePrimaryHue(playerPlaying: boolean) {
  playerPlaying
    ? setCSSVariable("H-primary", "var(--H-player)")
    : setCSSVariable("H-primary", "var(--H-opponent)");
}

export function updatePieceColors(playerColor: PlayerColor) {
  if (playerColor === "white") {
    setCSSVariable("H-piece-white", "var(--H-player)");
    setCSSVariable("H-piece-black", "var(--H-opponent)");
  } else {
    setCSSVariable("H-piece-white", "var(--H-opponent)");
    setCSSVariable("H-piece-black", "var(--H-player)");
  }
}

export async function hideSplashscreen(preferredTransitions: boolean) {
  const splashscreen = getElementInstanceById("splashscreen", HTMLElement);
  const cell1 = getElementInstanceById("cell1");
  const cell2 = getElementInstanceById("cell2");

  // Both animations end and start at the same time thus it's not required to listen to both elements.
  if (preferredTransitions) {
    await awaitElementAnimationIteration(cell1);
  }

  cell1.classList.remove("animated");
  cell2.classList.remove("animated");
  repaintElement(cell1);
  repaintElement(cell2);
  cell1.classList.add("away");
  cell2.classList.add("away");

  splashscreen.classList.add("faded");
  if (preferredTransitions) {
    await waitForTransitionEnd(splashscreen, "opacity", 3000);
  }
  splashscreen.hidden = true;
}

export function awaitElementAnimationIteration(
  element: Element
): Promise<void> {
  return new Promise((resolve) => {
    element.addEventListener("animationiteration", () => resolve());
  });
}
