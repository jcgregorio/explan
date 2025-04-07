import { Point } from "../point/point";
import { Rect } from "../rect/rect";

const withinY = (y: number, rect: Rect): boolean => {
  return rect.topLeft.y <= y && rect.bottomRight.y >= y;
};

const withinX = (x: number, rect: Rect): boolean => {
  return rect.topLeft.x <= x && rect.bottomRight.x >= x;
};

export class HitRect<R extends Rect> {
  rects: R[];
  constructor(rects: R[]) {
    this.rects = rects.sort((a: R, b: R): number => a.topLeft.y - b.topLeft.y);
  }

  /** Returns the index of the Rect that p is in, otherwise returns -1. */
  hit(p: Point): R | null {
    let start = 0;
    let end = this.rects.length - 1;

    while (start <= end) {
      // Find the mid index
      const mid = Math.floor((start + end) / 2);

      // If element is present at
      // mid, return True
      if (withinY(p.y, this.rects[mid])) {
        if (withinX(p.x, this.rects[mid])) {
          return this.rects[mid];
        }
        return null;
      }
      // Else look in left or
      // right half accordingly
      else if (this.rects[mid].topLeft.y < p.y) {
        start = mid + 1;
      } else {
        end = mid - 1;
      }
    }

    return null;
  }
}
