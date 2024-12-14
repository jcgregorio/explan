import { Action } from "./action.ts";
import { HelpAction } from "./actions/help.ts";
import { ResetZoomAction } from "./actions/resetZoom.ts";
import {
  DupTaskAction,
  NewTaskAction,
  SplitTaskAction,
} from "./actions/tasks.ts";
import { ToggleDarkModeAction } from "./actions/toggleDarkMode.ts";
import { ToggleRadarAction } from "./actions/toggleRadar.ts";
import { UndoAction } from "./actions/undo.ts";

export type ActionNames =
  | "ToggleDarkModeAction"
  | "ToggleRadarAction"
  | "ResetZoomAction"
  | "UndoAction"
  | "HelpAction"
  | "SplitTaskAction"
  | "DupTaskAction"
  | "NewTaskAction";

export const ActionRegistry: Record<ActionNames, Action> = {
  ToggleDarkModeAction: new ToggleDarkModeAction(),
  ToggleRadarAction: new ToggleRadarAction(),
  ResetZoomAction: new ResetZoomAction(),
  UndoAction: new UndoAction(),
  HelpAction: new HelpAction(),
  SplitTaskAction: new SplitTaskAction(),
  DupTaskAction: new DupTaskAction(),
  NewTaskAction: new NewTaskAction(),
};
