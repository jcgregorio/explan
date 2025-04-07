import { ExplanMain } from "../explanMain/explanMain.ts";
import { Op } from "../ops/ops.ts";
import { ok, Result } from "../result.ts";
import { Action, ActionFromOp, PostActonWork } from "./action.ts";
import { ActionNames, ActionRegistry } from "./registry.ts";

declare global {
  interface GlobalEventHandlersEventMap {
    "plan-definition-changed": CustomEvent<null>;
  }
}

type typeOfAction = "normal" | "undo" | "redo";

const undoStack: Action[] = [];
const redoStack: Action[] = [];

export const undo = async (explanMain: ExplanMain): Promise<Result<null>> => {
  const action = undoStack.pop()!;
  if (!action) {
    return ok(null);
  }

  return await executeAction(action, explanMain, "undo");
};

export const redo = async (explanMain: ExplanMain): Promise<Result<null>> => {
  const action = redoStack.pop()!;
  if (!action) {
    return ok(null);
  }

  return await executeAction(action, explanMain, "redo");
};

export const executeByName = async (
  name: ActionNames,
  explanMain: ExplanMain,
): Promise<Result<null>> => {
  return executeAction(ActionRegistry[name], explanMain);
};

export const executeAction = async (
  action: Action,
  explanMain: ExplanMain,
  typeOfAction: typeOfAction = "normal",
): Promise<Result<null>> => {
  const ret = await action.do(explanMain);
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
      // Send an event in case we have any dialogs up that need to re-render if
      // the plan changed, possible since Ctrl-Z works from anywhere.
      document.dispatchEvent(new CustomEvent("plan-definition-changed"));

    default:
      break;
  }

  if (action.undo) {
    switch (typeOfAction) {
      case "normal":
        undoStack.push(ret.value);
        redoStack.length = 0;
        break;

      case "undo":
        redoStack.push(ret.value);
        break;

      case "redo":
        undoStack.push(ret.value);
        break;

      default:
        break;
    }
  }

  return ok(null);
};

export const executeOp = async (
  op: Op,
  postActionWork: PostActonWork,
  undo: boolean,
  explanMain: ExplanMain,
): Promise<Result<null>> => {
  return executeAction(new ActionFromOp(op, postActionWork, undo), explanMain);
};
