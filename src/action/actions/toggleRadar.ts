import { ExplanMain } from "../../explanMain/explanMain";
import { ok, Result } from "../../result";
import { toggleTheme } from "../../style/toggler/toggler";
import { Action, PostActonWork } from "../action";

// Action that toggles between light and dark mode.s
export class ToggleRadarAction implements Action {
  name: string = "ToggleRadarAction";
  description: string = "Toggles the radar view.";
  postActionWork: PostActonWork = "";
  undo: boolean = false;

  do(explainMain: ExplanMain): Result<Action> {
    explainMain.toggleRadar();
    // ToggleRadarAction is it's own inverse.
    return ok(this);
  }
}
