// Metrics define floating point values that are tracked per Task.

import { Precision, PrecisionSerialized } from '../precision/precision.ts';
import { MetricRange, MetricRangeSerialized } from './range.ts';

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
    this.precision = precision;
    this.range = range;
    this.default = defaultValue;
    this.isStatic = isStatic;
    this.rationalize();
  }

  rationalize() {
    // min and max should be rounded to precision first. and then clamp and
    // precision applied to the default.
    this.range = new MetricRange(
      this.precision.round(this.range.min),
      this.precision.round(this.range.max)
    );
    // min and max should be rounded to precision first. and then clamp and
    // precision applied to the default.
    this.default = this.clampAndRound(this.default);
  }

  clampAndRound(x: number): number {
    return this.precision.round(this.range.clamp(x));
  }

  toJSON(): MetricDefinitionSerialized {
    return {
      range: this.range.toJSON(),
      default: this.default,
      precision: this.precision.toJSON(),
    };
  }

  static fromJSON(s: MetricDefinitionSerialized | undefined): MetricDefinition {
    if (s === undefined) {
      return new MetricDefinition(0);
    }
    return new MetricDefinition(
      s.default || 0,
      MetricRange.fromJSON(s.range),
      false,
      Precision.fromJSON(s.precision)
    );
  }
}

export type MetricDefinitions = { [key: string]: MetricDefinition };

export type MetricDefinitionsSerialized = {
  [key: string]: MetricDefinitionSerialized;
};

export type MetricValues = { [key: string]: number };
