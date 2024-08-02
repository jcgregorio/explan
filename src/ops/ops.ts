import { Result, ok } from "../result";
import { Plan } from "../plan/plan";

// Operations on Plans. Note they are reversible, so we can have an 'undo' list.

// Also, some operations might have 'partials', i.e. return a list of valid
// options that can be passed to the operation. For example, adding a
// predecessor could list all the Tasks that would not form a loop, i.e. exclude
// all descendents, and the Task itself, from the list of options.
//
// * Change string value in a Task.
// * Change duration value in a Task.
// * Add predecessor to a Task.
// * Add successor to a Task.
// * Delete predecessor to a Task.
// * Delete successor to a Task.
// * Insert new empty Task after another Task.
// * Duplicate a Task.
// * Split a Task.
// * Delete a Task.

// Need Undo/Redo Stacks.
// These record the sub-ops for each large op. E.g. an insert task op is made
// of three sub-ops:
//    1. insert task into Vertices and renumber Edges
//    2. Add edge from Start to New Task
//    3. Add edge from New Task to Finish
//
// Each sub-op:
//    1. Records all the info it needs to work.
//    2. Can be "applied" to a Plan.
//    3. Can generate its inverse sub-op.

// The results from applying a SubOp. This is the only way to get the inverse of
// a SubOp since the SubOp inverse might depend on the state of the Plan at the
// time the SubOp was applied.
export interface SubOpResult {
  plan: Plan;
  inverse: SubOp;
}

export interface SubOp {
  // If the apply returns an error it is guaranteed not to have modified the
  // Plan.
  apply(plan: Plan): Result<SubOpResult>;
}

export interface OpResult {
  plan: Plan;
  inverse: Op;
}

// Op are operations are applied to make changes to a Plan.
export class Op {
  subOps: SubOp[] = [];

  constructor(subOps: SubOp[]) {
    this.subOps = subOps;
  }

  // Reverts all SubOps up to the given index.
  applyAllInverseSubOpsToPlan(
    plan: Plan,
    inverseSubOps: SubOp[]
  ): Result<Plan> {
    for (let i = 0; i < inverseSubOps.length; i++) {
      const e = inverseSubOps[i].apply(plan);
      if (!e.ok) {
        return e;
      }
      plan = e.value.plan;
    }
    return ok(plan);
  }

  // Applies the Op to a Plan.
  apply(plan: Plan): Result<OpResult> {
    const inverseSubOps: SubOp[] = [];
    for (let i = 0; i < this.subOps.length; i++) {
      const e = this.subOps[i].apply(plan);
      if (!e.ok) {
        // Revert all the SubOps applied up to this point to get the Plan back in a
        // good place.
        const revertErr = this.applyAllInverseSubOpsToPlan(plan, inverseSubOps);
        if (!revertErr.ok) {
          return revertErr;
        }
        return e;
      }
      plan = e.value.plan;
      inverseSubOps.unshift(e.value.inverse);
    }

    return ok({
      plan: plan,
      inverse: new Op(inverseSubOps),
    });
  }
}

export type AllOpsResult = {
  ops: Op[];
  plan: Plan;
};

const applyAllInverseOpsToPlan = (inverses: Op[], plan: Plan): Result<null> => {
  for (let i = 0; i < inverses.length; i++) {
    const res = inverses[i].apply(plan);
    if (!res.ok) {
      return res;
    }
    plan = res.value.plan;
  }
  return ok(null);
};

export const applyAllOpsToPlan = (
  ops: Op[],
  plan: Plan
): Result<AllOpsResult> => {
  const inverses: Op[] = [];
  for (let i = 0; i < ops.length; i++) {
    const res = ops[i].apply(plan);
    if (!res.ok) {
      const inverseRes = applyAllInverseOpsToPlan(inverses, plan);
      if (!inverseRes) {
        return inverseRes;
      }
      return res;
    }
    inverses.unshift(res.value.inverse);
    plan = res.value.plan;
  }
  return ok({
    ops: inverses,
    plan: plan,
  });
};
