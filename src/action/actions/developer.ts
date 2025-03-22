import { DeveloperPanelDialog } from "../../developer-panel/developer-panel";
import { ExplanMain } from "../../explanMain/explanMain";
import { ok, Result } from "../../result";
import { Action, NOOPAction, PostActonWork } from "../action";

export class DeveloperPanelAction implements Action {
  description: string = "Opens the developer panel.";
  postActionWork: PostActonWork = "";
  undo: boolean = false;

  async do(explanMain: ExplanMain): Promise<Result<Action>> {
    explanMain
      .querySelector<DeveloperPanelDialog>("developer-panel")!
      .showDialog(explanMain);

    // Undo is not a reversible action.
    return ok(new NOOPAction());
  }
}
