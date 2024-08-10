// Metrics define floating point values that are tracked per Task.

import { clamp, MetricRange } from "./range";

export class MetricDefinition {
  range: MetricRange;
  default: number;

  constructor(range: MetricRange, defaultValue: number) {
    this.range = range;
    this.default = clamp(defaultValue, range.min, range.max);
  }
}

export type MetricDefinitions = Map<string, MetricDefinition>;

export type MetricValues = Map<string, number>;
