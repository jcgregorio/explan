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

export class NOOPAction implements Action {
  name: string = "NOOP";
  description: string = "Does nothing";
  postActionWork: PostActonWork = "";
  undo: boolean = false;

  do(explanMain: ExplanMain): Result<Action> {
    return ok(new NOOPAction());
  }
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

  do(explanMain: ExplanMain): Result<Action> {
    const ret = this.op.apply(explanMain.plan);
    if (!ret.ok) {
      return ret;
    }
    return ok(
      new ActionFromOp(ret.value.inverse, this.postActionWork, this.undo)
    );
  }
}
