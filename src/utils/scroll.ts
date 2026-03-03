export type ScrollTarget = HTMLElement | Window;

export const getScrollParent = (el: HTMLElement | null): HTMLElement | null => {
  let node: HTMLElement | null = el;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    const overflowY = style.overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
    node = node.parentElement;
  }
  return null;
};

export const resolveScrollTarget = (
  el: HTMLElement | null,
  fallbackSelector?: string
): ScrollTarget => {
  const parent = getScrollParent(el);
  if (parent) return parent;
  if (fallbackSelector) {
    const candidate = document.querySelector(fallbackSelector);
    if (candidate instanceof HTMLElement) return candidate;
  }
  return window;
};

export const addScrollListener = (
  target: ScrollTarget,
  handler: () => void,
  options: AddEventListenerOptions = { passive: true }
) => {
  if (target instanceof Window) {
    target.addEventListener('scroll', handler, options);
  } else {
    target.addEventListener('scroll', handler, options);
  }
};

export const removeScrollListener = (target: ScrollTarget, handler: () => void) => {
  if (target instanceof Window) {
    target.removeEventListener('scroll', handler);
  } else {
    target.removeEventListener('scroll', handler);
  }
};

export const getScrollTop = (target: ScrollTarget): number => {
  return target instanceof Window ? window.scrollY : target.scrollTop;
};

/**
 * 將容器內的子元素平滑捲動到容器垂直中央位置
 */
export const scrollChildIntoCenter = (
  container: HTMLElement,
  child: HTMLElement,
  behavior: ScrollBehavior = 'smooth'
) => {
  const containerRect = container.getBoundingClientRect();
  const childRect = child.getBoundingClientRect();

  const offset = childRect.top - containerRect.top;
  const targetScrollTop =
    container.scrollTop + offset - container.clientHeight / 2 + child.offsetHeight / 2;

  container.scrollTo({ top: targetScrollTop, behavior });
};
