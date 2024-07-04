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

export interface SubOp {
  // If the apply returns an error it is guaranteed not to have modified the
  // Plan.
  apply(c: Plan): Result<Plan>;

  inverse(): SubOp;
}

// Op are operations are applied to make changes to Plans.
export class Op {
  subOps: SubOp[] = [];

  constructor(subOps: SubOp[]) {
    this.subOps = subOps;
  }

  // Reverts all SubOps up to the given index.
  revertUpTo(c: Plan, index: number): Result<Plan> {
    const subOpsToRevert = this.subOps.slice(0, index).reverse();

    for (let i = 0; i < subOpsToRevert.length; i++) {
      const o = subOpsToRevert[i];
      const e = o.inverse().apply(c);
      if (!e.ok) {
        return e;
      }
      c = e.value;
    }
    return ok(c);
  }

  // Applies the Op to a Plan.
  apply(c: Plan): Result<Plan> {
    for (let i = 0; i < this.subOps.length; i++) {
      const s = this.subOps[i];
      const e = s.apply(c);
      if (!e.ok) {
        // Revert all the SubOps applied to this point to get the Plan
        // back in a good place.
        const revertErr = this.revertUpTo(c, i);
        if (!revertErr.ok) {
          return revertErr;
        }
        return e;
      }
    }
    return ok(c);
  }

  // Returns the inverse of this Op.
  inverse(): Op {
    const reversedInverted = this.subOps
      .slice()
      .reverse()
      .map((s: SubOp) => s.inverse());
    return new Op(reversedInverted);
  }
}
