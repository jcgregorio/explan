import { ExplanMain } from "../../explanMain/explanMain";
import { ok, Result } from "../../result";
import { Action, PostActonWork } from "../action";

export class HelpAction implements Action {
  description: string = "Displays the help dialog.";
  postActionWork: PostActonWork = "";
  undo: boolean = false;

  do(explanMain: ExplanMain): Result<Action> {
    explanMain
      .querySelector<HTMLDialogElement>("keyboard-map-dialog")!
      .showModal();
    return ok(this);
  }
}
