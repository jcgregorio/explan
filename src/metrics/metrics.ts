// Metrics define floating point values that are tracked per Task.

import { Precision, PrecisionSerialized } from "../precision/precision.ts";
import { clamp, MetricRange, MetricRangeSerialized } from "./range.ts";

export interface MetricDefinitionSerialized {
  range: MetricRangeSerialized;
  default: number;
  precision: PrecisionSerialized;
}

export class MetricDefinition {
  range: MetricRange;
  default: number;
  isStatic: boolean;
  precision: Precision;

  constructor(
    defaultValue: number,
    range: MetricRange = new MetricRange(),
    isStatic: boolean = false,
    precision: Precision = new Precision(1)
  ) {
    this.range = range;
    this.default = clamp(defaultValue, range.min, range.max);
    this.isStatic = isStatic;
    this.precision = precision;
  }

  toJSON(): MetricDefinitionSerialized {
    return {
      range: this.range.toJSON(),
      default: this.default,
      precision: this.precision.toJSON(),
    };
  }

  static FromJSON(s: MetricDefinitionSerialized | undefined): MetricDefinition {
    if (s === undefined) {
      return new MetricDefinition(0);
    }
    return new MetricDefinition(
      s.default || 0,
      MetricRange.FromJSON(s.range),
      false,
      Precision.FromJSON(s.precision)
    );
  }
}

export type MetricDefinitions = { [key: string]: MetricDefinition };

export type MetricDefinitionsSerialized = {
  [key: string]: MetricDefinitionSerialized;
};

export type MetricValues = { [key: string]: number };
