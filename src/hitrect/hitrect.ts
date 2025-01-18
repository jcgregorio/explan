import { Point } from "../renderer/scale/point";
import { Rect } from "../types/types";

const withinY = (y: number, rect: Rect): boolean => {
  return rect.topLeft.y <= y && rect.bottomRight.y >= y;
};

const withinX = (x: number, rect: Rect): boolean => {
  return rect.topLeft.x <= x && rect.bottomRight.x >= x;
};

export class HitRect {
  rects: Rect[];
  constructor(rects: Rect[]) {
    this.rects = rects.sort(
      (a: Rect, b: Rect): number => a.topLeft.y - b.topLeft.y
    );
  }

  /** Returns the index of the Rect that p is in, otherwise returns -1. */
  hit(p: Point): number {
    let start = 0;
    let end = this.rects.length - 1;

    while (start <= end) {
      // Find the mid index
      let mid = Math.floor((start + end) / 2);

      // If element is present at
      // mid, return True
      if (withinY(p.y, this.rects[mid])) {
        if (withinX(p.x, this.rects[mid])) {
          return mid;
        }
        return -1;
      }
      // Else look in left or
      // right half accordingly
      else if (this.rects[mid].topLeft.y < p.y) {
        start = mid + 1;
      } else {
        end = mid - 1;
      }
    }

    return -1;
  }
}
