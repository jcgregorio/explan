// Utilities for dealing with a range of numbers.

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
export class MetricRange {
  private _min: number = Number.MIN_VALUE;
  private _max: number = Number.MAX_VALUE;

  constructor(min: number = Number.MIN_VALUE, max: number = Number.MAX_VALUE) {
    if (max < min) {
      [min, max] = [max, min];
    }
    this._min = min;
    this._max = max;
  }

  clamp(value: number): number {
    return clamp(value, this._min, this._max);
  }

  public get min(): number {
    return this._min;
  }

  public get max(): number {
    return this._max;
  }
}
