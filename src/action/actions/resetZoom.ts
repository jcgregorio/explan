import { ExplanMain } from "../../explanMain/explanMain";
import { ok, Result } from "../../result";
import { toggleTheme } from "../../style/toggler/toggler";
import { Action, PostActonWork } from "../action";

export class ResetZoomAction implements Action {
  name: string = "ResetZoomAction";
  description: string = "Undoes the zoom.";
  postActionWork: PostActonWork = "paintChart";
  undo: boolean = false;

  do(explainMain: ExplanMain): Result<Action> {
    explainMain.displayRange = null;
    return ok(this);
  }
}
