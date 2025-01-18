import { Point, dup, equal, pt } from "../scale/point.ts";

/** MouseMove watches mouse events for a given HTMLElement and records the most
 *  recent location.
 */
export class MouseMove {
  currentMoveLocation: Point = pt(0, 0);
  lastReadLocation: Point = pt(0, 0);
  ele: HTMLElement;

  constructor(ele: HTMLElement) {
    this.ele = ele;
    ele.addEventListener("mousemove", this.mousemove.bind(this));
  }

  detach() {
    this.ele.removeEventListener("mousemove", this.mousemove.bind(this));
  }

  mousemove(e: MouseEvent) {
    this.currentMoveLocation.x = e.offsetX;
    this.currentMoveLocation.y = e.offsetY;
  }

  /** Returns a Point if the mouse had moved since the last read, otherwise
   * returns null.
   */
  readLocation(): Point | null {
    if (equal(this.currentMoveLocation, this.lastReadLocation)) {
      return null;
    }
    this.lastReadLocation = dup(this.currentMoveLocation);
    return dup(this.lastReadLocation);
  }
}
