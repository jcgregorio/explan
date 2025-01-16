import { Point } from "../renderer/scale/point";

export interface Rect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const withinY = (y: number, rect: Rect): boolean => {
  return rect.top <= y && rect.bottom >= y;
};

const withinX = (x: number, rect: Rect): boolean => {
  return rect.left <= x && rect.right >= x;
};

export class HitRect {
  rects: Rect[];
  constructor(rects: Rect[]) {
    this.rects = rects.sort((a: Rect, b: Rect): number => a.top - b.top);
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
      else if (this.rects[mid].top < p.y) {
        start = mid + 1;
      } else {
        end = mid - 1;
      }
    }

    return -1;
  }
}
