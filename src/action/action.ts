import { ExplanMain } from "../explanMain/explanMain";
import { Op } from "../ops/ops";
import { ok, Result } from "../result";

export type PostActonWork = "" | "paintChart" | "planDefinitionChanged";

export interface Action {
  description: string;
  postActionWork: PostActonWork;
  // TODO - Do we need a PostActionFocus: number which points to the Task we should move the focus to?
  undo: boolean; // If true include in undo/redo actions.
  do(explanMain: ExplanMain): Promise<Result<Action>>;
}

export class NOOPAction implements Action {
  description: string = "Does nothing";
  postActionWork: PostActonWork = "";
  undo: boolean = false;

  async do(explanMain: ExplanMain): Promise<Result<Action>> {
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

  async do(explanMain: ExplanMain): Promise<Result<Action>> {
    const ret = this.op.applyTo(explanMain.plan);
    if (!ret.ok) {
      return ret;
    }
    return ok(
      new ActionFromOp(ret.value.inverse, this.postActionWork, this.undo)
    );
  }
}
