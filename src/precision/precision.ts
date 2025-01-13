import { Rounder } from "../types/types";

export interface PrecisionSerialized {
  precision: number;
}
export class Precision {
  private _precision: number;

  constructor(precision: number = 0) {
    if (!Number.isFinite(precision)) {
      precision = 0;
    }
    this._precision = Math.abs(Math.trunc(precision));
  }

  round(x: number): number {
    return +x.toFixed(this._precision);
  }

  rounder(): Rounder {
    return (x: number): number => this.round(x);
  }

  public get precision(): number {
    return this._precision;
  }

  toJSON(): PrecisionSerialized {
    return {
      precision: this._precision,
    };
  }

  static FromJSON(s: PrecisionSerialized | undefined): Precision {
    if (s === undefined) {
      return new Precision();
    }
    return new Precision(s.precision);
  }
}
