import { ExplanMain } from "../../explanMain/explanMain";
import { ok, Result } from "../../result";
import { Action, PostActonWork } from "../action";

export class ToggleFocusAction implements Action {
  description: string = "Toggles the focus view.";
  postActionWork: PostActonWork = "paintChart";
  undo: boolean = false;

  async do(explanMain: ExplanMain): Promise<Result<Action>> {
    explanMain.toggleFocusOnTask();
    // ToggleFocusAction is its own inverse.
    return ok(this);
  }
}
