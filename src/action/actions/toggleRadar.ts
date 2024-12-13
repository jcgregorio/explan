import { ExplanMain } from "../../explanMain/explanMain";
import { ok, Result } from "../../result";
import { toggleTheme } from "../../style/toggler/toggler";
import { Action, PostActonWork } from "../action";

export class ToggleRadarAction implements Action {
  description: string = "Toggles the radar view.";
  postActionWork: PostActonWork = "";
  undo: boolean = false;

  do(explanMain: ExplanMain): Result<Action> {
    explanMain.toggleRadar();
    // ToggleRadarAction is its own inverse.
    return ok(this);
  }
}
