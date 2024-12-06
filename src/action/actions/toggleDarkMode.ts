import { ExplanMain } from "../../explanMain/explanMain";
import { ok, Result } from "../../result";
import { toggleTheme } from "../../style/toggler/toggler";
import { Action, PostActonWork } from "../action";

// Action that toggles between light and dark mode.s
export class ToggleDarkModeAction implements Action {
  name: string = "ToggleDarkModeAction";
  description: string = "Toggles dark mode.";
  postActionWork: PostActonWork = "paintChart";
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  do(explainMain: ExplanMain): Result<Action> {
    toggleTheme();
    // ToggleDarkModeAction is it's own inverse.
    return ok(this);
  }
}
