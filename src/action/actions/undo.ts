import { ExplanMain } from "../../explanMain/explanMain";
import { ok, Result } from "../../result";
import { Action, NOOPAction, PostActonWork } from "../action";
import { undo } from "../execute";

export class UndoAction implements Action {
  description: string = "Undoes the last action.";
  postActionWork: PostActonWork = "";
  undo: boolean = false;

  do(explanMain: ExplanMain): Result<Action> {
    const ret = undo(explanMain);

    // Undo is not a reversible action.
    return ok(new NOOPAction());
  }
}
