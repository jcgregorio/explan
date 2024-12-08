import { ExplanMain } from "../explanMain/explanMain.ts";
import { Op } from "../ops/ops.ts";
import { ok, Result } from "../result.ts";
import { Action, ActionFromOp, PostActonWork } from "./action.ts";
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
  explanMain: ExplanMain
): Result<null> => {
  const action = actionRegistry[name];
  const ret = action.do(explanMain);
  if (!ret.ok) {
    return ret;
  }
  switch (action.postActionWork) {
    case "":
      break;
    case "paintChart":
      explanMain.paintChart();

    case "planDefinitionChanged":
      explanMain.planDefinitionHasBeenChanged();
      explanMain.paintChart();

    default:
      break;
  }
  if (action.undo) {
    undoStack.push(ret.value);
  }
  return ok(null);
};

export const executeOp = (
  op: Op,
  postActionWork: PostActonWork,
  undo: boolean,
  explanMain: ExplanMain
): Result<null> => {
  const action = new ActionFromOp(op, postActionWork, undo);
  const ret = action.do(explanMain);
  if (!ret.ok) {
    return ret;
  }
  switch (action.postActionWork) {
    case "":
      break;

    case "paintChart":
      explanMain.paintChart();
      break;

    case "planDefinitionChanged":
      explanMain.planDefinitionHasBeenChanged();
      explanMain.paintChart();
      break;

    default:
      break;
  }
  if (action.undo) {
    undoStack.push(ret.value);
  }
  return ok(null);
};
