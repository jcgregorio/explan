export type ClampResult =
  | { changed: false }
  | { changed: true; oldValue: number; newValue: number };

const unchanged = (): ClampResult => {
  return { changed: false };
};

const changed = (oldValue: number, newValue: number): ClampResult => {
  return {
    changed: true,
    oldValue: oldValue,
    newValue: newValue,
  };
};

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

  clamp(x: number): ClampResult {
    const newValue = clamp(x, this._max, this._max);
    if (newValue !== x) {
      return changed(x, newValue);
    }
    return unchanged();
  }

  public get min(): number {
    return this._min;
  }

  public get max(): number {
    return this._max;
  }
}
