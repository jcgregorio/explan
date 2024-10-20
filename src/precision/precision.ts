export class Precision {
  private multiplier: number;
  private _precision: number;

  constructor(precision: number) {
    if (!Number.isFinite(precision)) {
      precision = 0;
    }
    this._precision = Math.abs(Math.trunc(precision));
    this.multiplier = 10 ** this._precision;
  }

  round(x: number): number {
    return Math.trunc(x * this.multiplier) / this.multiplier;
  }

  public get precision(): number {
    return this._precision;
  }
}
