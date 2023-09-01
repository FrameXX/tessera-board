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

export async function waitForTransitionEnd(
  element: HTMLElement | SVGElement,
  propertyName?: string,
  abortionTimoutMs: number = 800
): Promise<void> {
  return new Promise((resolve) => {
    const abortionTimeout = setTimeout(() => {
      resolve();
      console.warn(
        `Waiting for transition was forcefully aborted after ${abortionTimoutMs} miliseconds.`
      );
    }, abortionTimoutMs);

    element.ontransitionend = (event: TransitionEvent) => {
      if (!propertyName || event.propertyName === propertyName) {
        element.ontransitionend = null;
        clearTimeout(abortionTimeout);
        resolve();
      }
    };
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
  DOMRoot.style.setProperty("--S-primary-text", "var(--S-primary-text-active)");
  DOMRoot.style.setProperty(
    "--S-primary-surface",
    "var(--S-primary-surface-active)"
  );
  DOMRoot.style.setProperty(
    "--S-primary-surface-top",
    "var(--S-primary-surface-top-active)"
  );
  DOMRoot.style.setProperty(
    "--S-primary-accent",
    "var(--S-primary-accent-active)"
  );
  DOMRoot.style.setProperty("--S-cell", "var(--S-cell-active)");
  DOMRoot.style.setProperty("--S-piece-fill", "var(--S-piece-fill-active)");
  DOMRoot.style.setProperty("--S-piece-stroke", "var(--S-piece-stroke-active)");
  DOMRoot.style.setProperty("--S-dim", "var(--S-dim-active)");
}
