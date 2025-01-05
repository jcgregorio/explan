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

const undoStack: Action[] = [];

export const undo = async (explanMain: ExplanMain): Promise<Result<null>> => {
  const action = undoStack.pop()!;
  if (!action) {
    return ok(null);
  }

  return await executeUndo(action, explanMain);
};

export const execute = async (
  name: ActionNames,
  explanMain: ExplanMain
): Promise<Result<null>> => {
  const action = ActionRegistry[name];
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
    undoStack.push(ret.value);
  }
  return ok(null);
};

export const executeOp = async (
  op: Op,
  postActionWork: PostActonWork,
  undo: boolean,
  explanMain: ExplanMain
): Promise<Result<null>> => {
  const action = new ActionFromOp(op, postActionWork, undo);
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

      break;

    default:
      break;
  }
  if (action.undo) {
    undoStack.push(ret.value);
  }
  return ok(null);
};

const executeUndo = async (
  action: Action,
  explanMain: ExplanMain
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

      break;

    default:
      break;
  }
  return ok(null);
};
