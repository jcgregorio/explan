// Metrics define floating point values that are tracked per Task.

import { clamp, MetricRange } from "./range.ts";

export class MetricDefinition {
  range: MetricRange;
  default: number;
  isStatic: boolean;

  constructor(
    defaultValue: number,
    range: MetricRange = new MetricRange(),
    isStatic: boolean = false
  ) {
    this.range = range;
    this.default = clamp(defaultValue, range.min, range.max);
    this.isStatic = isStatic;
  }
}

export type MetricDefinitions = { [key: string]: MetricDefinition };

export type MetricValues = { [key: string]: number };
