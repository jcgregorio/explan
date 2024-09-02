export const MIN_DISPLAY_RANGE = 7;

/** Represents a range of days over which to display a zoomed in view, using
 * the half-open interval [begin, end).
 */
export class DisplayRange {
  private _begin: number;
  private _end: number;

  constructor(begin: number, end: number) {
    this._begin = begin;
    this._end = end;
    if (this._begin > this._end) {
      [this._end, this._begin] = [this._begin, this._end];
    }
    if (this._end - this._begin < MIN_DISPLAY_RANGE) {
      this._end = this._begin + MIN_DISPLAY_RANGE;
    }
  }

  public get begin(): number {
    return this._begin;
  }

  public get end(): number {
    return this._end;
  }

  public get rangeInDays(): number {
    return this._end - this._begin;
  }
}
