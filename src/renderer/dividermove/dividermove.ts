import { Point } from "../scale/point.ts";

// Values are returned as percentages.
export interface DividerMoveResult {
  before: number;
  after: number;
}

export const DIVIDER_MOVE_EVENT = "divider_move";

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const getPageRect = (ele: HTMLElement): Rect => {
  const viewportRect = ele.getBoundingClientRect();
  return {
    top: viewportRect.top + window.scrollY,
    left: viewportRect.left + window.scrollX,
    width: viewportRect.width,
    height: viewportRect.height,
  };
};

/** MouseMove watches mouse events for a given HTMLElement and emits
 * events around dragging.
 *
 * The emitted event is "dragrange" and is a CustomEvent<DragRange>.
 *
 * Once the mouse is pressed down in the HTMLElement an event will be
 * emitted periodically as the mouse moves.
 *
 * Once the mouse is released, or exits the HTMLElement one last event
 * is emitted.
 */
export class DividerMove {
  begin: Point | null = null;
  parentRect: Rect | null = null;
  currentMoveLocation: Point = new Point(0, 0);
  lastMoveSent: Point = new Point(0, 0);
  parent: HTMLElement;
  divider: HTMLElement;
  internvalHandle: number = 0;

  constructor(parent: HTMLElement, divider: HTMLElement) {
    this.parent = parent;
    this.divider = divider;
    this.divider.addEventListener("mousedown", this.mousedown.bind(this));
  }

  detach() {
    this.parent.removeEventListener("mousemove", this.mousemove.bind(this));
    this.divider.removeEventListener("mousedown", this.mousedown.bind(this));
    this.parent.removeEventListener("mouseup", this.mouseup.bind(this));
    this.parent.removeEventListener("mouseleave", this.mouseleave.bind(this));
    window.clearInterval(this.internvalHandle);
  }

  onTimeout() {
    if (!this.currentMoveLocation.equal(this.lastMoveSent)) {
      this.parent.dispatchEvent(
        // TODO clamp results to [5, 95]%.
        new CustomEvent<DividerMoveResult>(DIVIDER_MOVE_EVENT, {
          detail: {
            before:
              (100 * (this.currentMoveLocation.x - this.parentRect!.left)) /
              this.parentRect!.width,
            after:
              (100 *
                (this.parentRect!.left +
                  this.parentRect!.width -
                  this.currentMoveLocation.x)) /
              this.parentRect!.width,
          },
        })
      );
      this.lastMoveSent.set(this.currentMoveLocation);
    }
  }

  mousemove(e: MouseEvent) {
    if (this.begin === null) {
      return;
    }
    this.currentMoveLocation.x = e.pageX;
    this.currentMoveLocation.y = e.pageY;
  }

  mousedown(e: MouseEvent) {
    this.internvalHandle = window.setInterval(this.onTimeout.bind(this), 16);
    this.parentRect = getPageRect(this.parent);

    this.parent.addEventListener("mousemove", this.mousemove.bind(this));
    this.parent.addEventListener("mouseup", this.mouseup.bind(this));
    this.parent.addEventListener("mouseleave", this.mouseleave.bind(this));

    this.begin = new Point(e.pageX, e.pageY);
  }

  mouseup(e: MouseEvent) {
    if (this.begin === null) {
      return;
    }
    this.finished(new Point(e.pageX, e.pageY));
  }

  mouseleave(e: MouseEvent) {
    if (this.begin === null) {
      return;
    }
    this.finished(new Point(e.pageX, e.pageY));
  }

  finished(end: Point) {
    window.clearInterval(this.internvalHandle);

    this.parent.removeEventListener("mousemove", this.mousemove.bind(this));
    this.parent.removeEventListener("mouseup", this.mouseup.bind(this));
    this.parent.removeEventListener("mouseleave", this.mouseleave.bind(this));

    this.currentMoveLocation = end;
    this.onTimeout();
    this.begin = null;
    this.currentMoveLocation = new Point(0, 0);
    this.lastMoveSent = new Point(0, 0);
  }
}
