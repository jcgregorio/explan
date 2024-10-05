import { Triangular } from "./triangular";

export type Uncertainty = "low" | "moderate" | "high" | "extreme";

const uncertaintyToNum: Record<Uncertainty, number> = {
  low: 1.1,
  moderate: 1.5,
  high: 2,
  extreme: 5,
};

export class Jacobian {
  private triangular: Triangular;
  constructor(expected: number, uncertainty: Uncertainty) {
    const mul = uncertaintyToNum[uncertainty];
    this.triangular = new Triangular(expected / mul, expected * mul, expected);
  }

  sample(p: number): number {
    return this.triangular.sample(p);
  }
}
