import { ExplanMain } from "../../explanMain/explanMain";
import { ok, Result } from "../../result";
import { Action, NOOPAction, PostActonWork } from "../action";
import { redo, undo } from "../execute";

export class UndoAction implements Action {
  description: string = "Undoes the last action.";
  postActionWork: PostActonWork = "";
  undo: boolean = false;

  async do(explanMain: ExplanMain): Promise<Result<Action>> {
    const ret = undo(explanMain);

    // Undo is not a reversible action.
    return ok(new NOOPAction());
  }
}


export class RedoAction implements Action {
  description: string = "Redoes the most recent undo action.";
  postActionWork: PostActonWork = "";
  undo: boolean = false;

  async do(explanMain: ExplanMain): Promise<Result<Action>> {
    const ret = redo(explanMain);

    // Redo is not a reversible action.
    return ok(new NOOPAction());
  }
}