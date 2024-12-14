import { ExplanMain } from "../explanMain/explanMain.ts";
import { Op } from "../ops/ops.ts";
import { ok, Result } from "../result.ts";
import { Action, ActionFromOp, PostActonWork } from "./action.ts";
import { ActionNames, ActionRegistry } from "./registry.ts";

const undoStack: Action[] = [];
const redoStack: Action[] = [];

export const undo = (explanMain: ExplanMain): Result<null> => {
  const action = undoStack.pop()!;
  if (!action) {
    return ok(null);
  }

  return executeUndo(action, explanMain);
};

export const execute = (
  name: ActionNames,
  explanMain: ExplanMain
): Result<null> => {
  redoStack.length = 0;
  const action = ActionRegistry[name];
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

const executeUndo = (action: Action, explanMain: ExplanMain): Result<null> => {
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
    redoStack.push(ret.value);
  }
  return ok(null);
};
