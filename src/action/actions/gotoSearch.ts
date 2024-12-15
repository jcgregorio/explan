import { ExplanMain } from "../../explanMain/explanMain";
import { ok, Result } from "../../result";
import { SearchTaskPanel } from "../../search/search";
import { Action, PostActonWork } from "../action";

export class GoToSearchAction implements Action {
  description: string = "Moves focus to search control.";
  postActionWork: PostActonWork = "";
  undo: boolean = false;

  do(_explanMain: ExplanMain): Result<Action> {
    document
      .querySelector<SearchTaskPanel>("search-task-panel")!
      .setKeyboardFocusToInput("name-only");
    return ok(this);
  }
}

export class GoToFullSearchAction implements Action {
  description: string =
    "Moves focus to search control and does a full search of all resource values.";
  postActionWork: PostActonWork = "";
  undo: boolean = false;

  do(_explanMain: ExplanMain): Result<Action> {
    document
      .querySelector<SearchTaskPanel>("search-task-panel")!
      .setKeyboardFocusToInput("full-info");
    return ok(this);
  }
}
