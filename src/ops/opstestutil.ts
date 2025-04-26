// These are ops that are useful for testing.
import { assert } from '@esm-bundle/chai';
import { Plan } from '../plan/plan.ts';
import { Result, ok } from '../result.ts';
import {
  Op,
  SubOp,
  SubOpResult,
  applyAllOpsToPlan,
  applyAllOpsToPlanAndThenInverse,
} from './ops';

export class NoOpSubOp implements SubOp {
  constructor() {}

  applyTo(plan: Plan): Result<SubOpResult> {
    return ok({ plan: plan, inverse: this.inverse() });
  }

  inverse(): SubOp {
    return new NoOpSubOp();
  }
}

// Callback function that passes in the plan to be inspected or altered
// mid-test. The function will not be called on inverse.
export type inspect = (plan: Plan) => void;

export class TestingSubOp implements SubOp {
  f: inspect;

  constructor(f: inspect) {
    this.f = f;
  }

  applyTo(plan: Plan): Result<SubOpResult> {
    this.f(plan);

    return ok({ plan: plan, inverse: this.inverse() });
  }

  inverse(): SubOp {
    return new NoOpSubOp();
  }
}

// Callback function that passes in the plan to be inspected or altered
// mid-test. Note that the function will be called both on the forward
// application and also on the application of the inverse, and the `isForward`
// argument indicates which direction Ops are being applied.
export type inspectBothWays = (plan: Plan, isForward: boolean) => void;

export class Testing2SubOp implements SubOp {
  f: inspectBothWays;
  isForward: boolean;

  constructor(f: inspectBothWays, isForward: boolean = true) {
    this.f = f;
    this.isForward = isForward;
  }

  applyTo(plan: Plan): Result<SubOpResult> {
    this.f(plan, this.isForward);

    return ok({ plan: plan, inverse: this.inverse() });
  }

  inverse(): SubOp {
    return new Testing2SubOp(this.f, !this.isForward);
  }
}

/** Op for testing that calls the given callback only in the forward direction.
 * I.e. only while the Op's are being applied, not when their inverses are being
 * applied.
 */
export function TOp(f: inspect): Op {
  return new Op([new TestingSubOp(f)], 'TOp');
}

/** Op for testing that calls the given callback in both the forward and
 * backward direction. I.e. while the Op's are being applied, and then when
 * their inverses are being applied. Only makes sense to use this insde
 * TestOpsForwardAndBack.
 */
export function T2Op(f: inspectBothWays): Op {
  return new Op([new Testing2SubOp(f)], 'T2Op');
}

export function TestOpsForwardAndBack(ops: Op[]): void {
  assert.isTrue(applyAllOpsToPlanAndThenInverse(ops, new Plan()).ok);
}

export function TestOpsForward(ops: Op[]): void {
  assert.isTrue(applyAllOpsToPlan(ops, new Plan()).ok);
}
