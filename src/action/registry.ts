import { ExplanMain } from "../explanMain/explanMain.ts";
import { Op } from "../ops/ops.ts";
import { ok, Result } from "../result.ts";
import { Action, ActionFromOp, PostActonWork } from "./action.ts";
import { ResetZoomAction } from "./actions/resetZoom.ts";
import { ToggleDarkModeAction } from "./actions/toggleDarkMode.ts";
import { ToggleRadarAction } from "./actions/toggleRadar.ts";

export type ActionNames =
  | "ToggleDarkModeAction"
  | "ToggleRadarAction"
  | "ResetZoomAction";

export const ActionRegistry: Record<ActionNames, Action> = {
  ToggleDarkModeAction: new ToggleDarkModeAction(),
  ToggleRadarAction: new ToggleRadarAction(),
  ResetZoomAction: new ResetZoomAction(),
};
