import { ExplanMain } from "../explanMain/explanMain";
import { Op } from "../ops/ops";
import { ok, Result } from "../result";

export type PostActonWork = "" | "paintChart" | "planDefinitionChanged";

export interface Action {
  name: string;
  description: string;
  postActionWork: PostActonWork;
  undo: boolean; // If true include in undo/redo actions.
  do(explanMain: ExplanMain): Result<Action>;
}

export class ActionFromOp {
  name: string = "ActionFromOp";
  description: string = "Action constructed directly from an Op.";
  postActionWork: PostActonWork;
  undo: boolean;

  op: Op;

  constructor(op: Op, postActionWork: PostActonWork, undo: boolean) {
    this.postActionWork = postActionWork;
    this.undo = undo;
    this.op = op;
  }

  do(explainMain: ExplanMain): Result<Action> {
    const ret = this.op.apply(explainMain.plan);
    if (!ret.ok) {
      return ret;
    }
    return ok(
      new ActionFromOp(this.postActionWork, this.undo, ret.value.inverse)
    );
  }
}