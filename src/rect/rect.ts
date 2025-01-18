import { Point, pt } from "../point/point";

export interface Rect {
  topLeft: Point;
  bottomRight: Point;
}

export const rect = (x1: number, y1: number, x2: number, y2: number): Rect =>
  rectFromPoints(pt(x1, y1), pt(x2, y2));

export const rectFromPoints = (topLeft: Point, bottomRight: Point) => {
  return {
    topLeft: topLeft,
    bottomRight: bottomRight,
  };
};
