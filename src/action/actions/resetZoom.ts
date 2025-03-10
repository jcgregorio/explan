import { ExplanMain } from "../../explanMain/explanMain";
import { ok, Result } from "../../result";
import { Action, PostActonWork } from "../action";

export class ResetZoomAction implements Action {
  description: string = "Undoes the zoom.";
  postActionWork: PostActonWork = "paintChart";
  undo: boolean = false;

  async do(explanMain: ExplanMain): Promise<Result<Action>> {
    explanMain.displayRange = null;
    return ok(this);
  }
}
