// Metrics define floating point values that are tracked per Task.

import { clamp, MetricRange } from "./range";

export class MetricDefinition {
  displayName: string;
  range: MetricRange;
  default: number;

  constructor(displayName: string, range: MetricRange, defaultValue: number) {
    this.displayName = displayName;
    this.range = range;
    this.default = clamp(defaultValue, range.min, range.max);
  }
}

export type MetricDefinitions = Map<string, MetricDefinition>;
