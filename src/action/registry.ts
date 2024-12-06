import { ExplanMain } from "../explanMain/explanMain";
import { ok, Result } from "../result";
import { Action } from "./action";
import { ToggleDarkModeAction } from "./actions/toggleDarkMode";

export type actionNames = "ToggleDarkModeAction";

export const actionRegistry: Record<actionNames, Action> = {
  ToggleDarkModeAction: new ToggleDarkModeAction(),
};

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
  return ok(null);
};
