// Metrics define floating point values that are tracked per Task.

export interface ClampResult {
  changed: boolean;
  oldValue: number;
  newValue: number;
}

export const clamp = (x: number, min: number, max: number): number => {
  if (x > max) {
    return max;
  }
  if (x < min) {
    return min;
  }
  return x;
};

// Range defines a range of numbers, from [min, max] inclusive.
export class Range {
  private _min: number = Number.MIN_VALUE;
  private _max: number = Number.MAX_VALUE;

  constructor(
    min: number = Number.MIN_VALUE,
    max: number = Number.MAX_VALUE
  ) {
    if (max < min) {
      [min, max] = [max, min];
    }
    this._min = min;
    this._max = max;
  }

  clamp(x: number): ClampResult {
    const newValue = clamp(x, this._max, this._max);
    if (newValue !== x) {
      return {
        changed: true,
        oldValue: x,
        newValue: newValue,
      };
    }
    return {
      changed: false,
      oldValue: x,
      newValue: x,
    };
  }

  public get min(): number {
    return this._min;
  }

  public get max(): number {
    return this._max;
  }


}

export class MetricDefinition {
  displayName: string;
  range: Range;
  _default: number;

  constructor(displayName: string, range: Range, defaultValue: number) {
    this.displayName = displayName;
    this.range = range;
    this._default = clamp(defaultValue, range.min, range.max);
  }

  public get defaultValue(): number {
    return this._default;
  }
}

export type MetricDefinitions = Map<string, MetricDefinition>;
