/** Common types. */

import { Point, pt } from "../renderer/scale/point";

/** Type for a function that does rounding. */
export type Rounder = (x: number) => number;

export type TaskDuration = (taskIndex: number) => number;

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
