import { Rounder } from "../types/types";

export interface PrecisionSerialized {
  precision: number;
}
export class Precision {
  private multiplier: number;
  private _precision: number;

  constructor(precision: number = 0) {
    if (!Number.isFinite(precision)) {
      precision = 0;
    }
    this._precision = Math.abs(Math.trunc(precision));
    this.multiplier = 10 ** this._precision;
  }

  round(x: number): number {
    return Math.trunc(x * this.multiplier) / this.multiplier;
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
