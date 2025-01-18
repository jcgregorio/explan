/** Common types. */

import { Point } from "../renderer/scale/point";

/** Type for a function that does rounding. */
export type Rounder = (x: number) => number;

export type TaskDuration = (taskIndex: number) => number;

export interface Rect {
  topLeft: Point;
  bottomRight: Point;
}
