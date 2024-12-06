import { ExplanMain } from "../explanMain/explanMain";
import { ok, Result } from "../result";
import { Action } from "./action";
import { ToggleDarkModeAction } from "./actions/toggleDarkMode";
import { ToggleRadarAction } from "./actions/toggleRadar";

export type actionNames = "ToggleDarkModeAction" | "ToggleRadarAction";

export const actionRegistry: Record<actionNames, Action> = {
  ToggleDarkModeAction: new ToggleDarkModeAction(),
  ToggleRadarAction: new ToggleRadarAction(),
};

const undoStack: Action[] = [];
const redoStack: Action[] = [];

export const execute = (
  name: actionNames,
  explainMain: ExplanMain
): Result<null> => {
  const action = actionRegistry[name];
  const ret = action.do(explainMain);
  if (!ret.ok) {
    return ret;
  }
  switch (action.postActionWork) {
    case "":
      break;
    case "paintChart":
      explainMain.paintChart();

    case "planDefinitionChanged":
      explainMain.planDefinitionHasBeenChanged();
      explainMain.paintChart();

    default:
      break;
  }
  if (action.undo) {
    undoStack.push(ret.value);
  }
  return ok(null);
};
