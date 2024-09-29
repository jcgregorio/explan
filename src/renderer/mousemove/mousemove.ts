import { Point } from "../scale/point";

export interface DragRange {
  begin: Point;
  end: Point;
}

export const DRAG_RANGE_EVENT = "dragrange";

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
export class MouseMove {
  begin: Point | null = null;
  currentMoveLocation: Point = new Point(0, 0);
  lastMoveSent: Point = new Point(0, 0);
  ele: HTMLElement;
  internvalHandle: number = 0;

  constructor(ele: HTMLElement) {
    this.ele = ele;
    ele.addEventListener("mousemove", this.mousemove.bind(this));
    ele.addEventListener("mousedown", this.mousedown.bind(this));
    ele.addEventListener("mouseup", this.mouseup.bind(this));
    ele.addEventListener("mouseleave", this.mouseleave.bind(this));
  }

  detach() {
    this.ele.removeEventListener("mousemove", this.mousemove.bind(this));
    this.ele.removeEventListener("mousedown", this.mousedown.bind(this));
    this.ele.removeEventListener("mouseup", this.mouseup.bind(this));
    this.ele.removeEventListener("mouseleave", this.mouseleave.bind(this));
    window.clearInterval(this.internvalHandle);
  }

  onTimeout() {
    if (!this.currentMoveLocation.equal(this.lastMoveSent)) {
      this.ele.dispatchEvent(
        new CustomEvent<DragRange>(DRAG_RANGE_EVENT, {
          detail: {
            begin: this.begin!.dup(),
            end: this.currentMoveLocation.dup(),
          },
        }),
      );
      this.lastMoveSent.set(this.currentMoveLocation);
    }
  }

  mousemove(e: MouseEvent) {
    if (this.begin === null) {
      return;
    }
    this.currentMoveLocation.x = e.offsetX;
    this.currentMoveLocation.y = e.offsetY;
  }

  mousedown(e: MouseEvent) {
    this.internvalHandle = window.setInterval(this.onTimeout.bind(this), 16);
    this.begin = new Point(e.offsetX, e.offsetY);
  }

  mouseup(e: MouseEvent) {
    this.finished(new Point(e.offsetX, e.offsetY));
  }

  mouseleave(e: MouseEvent) {
    if (this.begin === null) {
      return;
    }
    this.finished(new Point(e.offsetX, e.offsetY));
  }

  finished(end: Point) {
    window.clearInterval(this.internvalHandle);
    this.currentMoveLocation = end;
    this.onTimeout();
    this.begin = null;
    this.currentMoveLocation = new Point(0, 0);
    this.lastMoveSent = new Point(0, 0);
  }
}
