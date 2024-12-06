import { ExplanMain } from "../explanMain/explanMain.ts";
import { ok, Result } from "../result.ts";
import { Action } from "./action.ts";
import { ResetZoomAction } from "./actions/resetZoom.ts";
import { ToggleDarkModeAction } from "./actions/toggleDarkMode.ts";
import { ToggleRadarAction } from "./actions/toggleRadar.ts";

export type actionNames =
  | "ToggleDarkModeAction"
  | "ToggleRadarAction"
  | "ResetZoomAction";

export const actionRegistry: Record<actionNames, Action> = {
  ToggleDarkModeAction: new ToggleDarkModeAction(),
  ToggleRadarAction: new ToggleRadarAction(),
  ResetZoomAction: new ResetZoomAction(),
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
