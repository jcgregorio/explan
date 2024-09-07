import { Triangular } from "../stats/cdf/triangular/triangular";
import { DurationModel } from "./duration";

/**
 * Uncertainty is a measure of how uncertain you are of a tasks duration.
 *
 * These names and values are taken from:
 *
 *    https://jacobian.org/2021/may/25/my-estimation-technique/
 */
export const Uncertainty = {
  low: 1.1,
  moderate: 1.5,
  high: 2.0,
  extreme: 5.0,
};

export class JacobianDuration implements DurationModel {
  lastDuration: number = -1;
  uncertainty: number;
  triangular: Triangular | null = null;

  constructor(uncertainty: number) {
    this.uncertainty = uncertainty;
  }

  sample(duration: number, p: number): number {
    if (this.lastDuration !== duration || !this.triangular) {
      this.triangular = new Triangular(
        duration / this.uncertainty,
        duration * this.uncertainty,
        duration
      );
    }
    return this.triangular.sample(p);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toJSON(_key: string): object {
    return {
      ctor: "JacobianDuration",
      uncertainty: this.uncertainty,
    };
  }

  dup(): DurationModel {
    return new JacobianDuration(this.uncertainty);
  }
}
