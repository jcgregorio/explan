import { ActionNames } from "../action/registry";

const KeyMap: Map<string, ActionNames> = new Map([
  ["CTRL-R", "ToggleRadarAction"],
  ["CTRL-Z", "UndoAction"],
]);
