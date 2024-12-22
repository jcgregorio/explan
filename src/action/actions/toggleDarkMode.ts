import { ExplanMain } from "../../explanMain/explanMain";
import { ok, Result } from "../../result";
import { toggleTheme } from "../../style/toggler/toggler";
import { Action, PostActonWork } from "../action";

export class ToggleDarkModeAction implements Action {
  description: string = "Toggles dark mode.";
  postActionWork: PostActonWork = "paintChart";
  undo: boolean = false;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async do(explanMain: ExplanMain): Promise<Result<Action>> {
    toggleTheme();
    // ToggleDarkModeAction is its own inverse.
    return ok(this);
  }
}
