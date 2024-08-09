// Metrics define floating point values that are tracked per Task.

import { error, ok, Result } from "../result";
import { clamp, ClampResult, MetricRange } from "./range";

export class MetricDefinition {
  range: MetricRange;
  default: number;

  constructor(range: MetricRange, defaultValue: number) {
    this.range = range;
    this.default = clamp(defaultValue, range.min, range.max);
  }
}

export type MetricDefinitions = Map<string, MetricDefinition>;

// Keeps track of Metric values for a single entity, such as a Task.
export class MetricsContainer {
  private values: Map<string, number> = new Map();

  // A reference to a common instance of MetricDefinitions.
  private metricDefinitions: MetricDefinitions;

  constructor(metricDefinitions: MetricDefinitions) {
    this.metricDefinitions = metricDefinitions;
    metricDefinitions.forEach((value: MetricDefinition, key: string) => {
      this.values.set(key, value.default);
    });
  }

  set(key: string, value: number): Result<ClampResult> {
    const def = this.metricDefinitions.get(key);
    if (def === undefined) {
      return error(`'${key}' is not a known metric name.`);
    }
    const cr = def.range.clamp(value);
    this.values.set(key, cr.newValue);
    return ok(cr);
  }

  get(key: string): number | undefined {
    return this.values.get(key);
  }

  // Returns true if the metric existed and was been removed, or false if it
  // didn't exist.
  delete(key: string): boolean {
    // Should we also confirm it's been removed from the metricDefinitions?
    return this.values.delete(key);
  }
}
