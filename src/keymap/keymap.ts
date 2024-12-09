import { execute } from "../action/execute";
import { ActionNames } from "../action/registry";
import { ExplanMain } from "../explanMain/explanMain";

const KeyMap: Map<string, ActionNames> = new Map([
  ["shift-ctrl-R", "ToggleRadarAction"],
  ["shift-ctrl-M", "ToggleDarkModeAction"],
  ["shift-ctrl-Z", "ResetZoomAction"],
  ["ctrl-z", "UndoAction"],
]);

let explanMain: ExplanMain;

export const StartKeyboardHandling = (em: ExplanMain) => {
  explanMain = em;
  document.addEventListener("keydown", onKeyDown);
};

const onKeyDown = (e: KeyboardEvent) => {
  const keyname = `${e.shiftKey ? "shift-" : ""}${e.ctrlKey ? "ctrl-" : ""}${e.metaKey ? "meta-" : ""}${e.altKey ? "alt-" : ""}${e.key}`;
  const actionName = KeyMap.get(keyname);
  if (actionName === undefined) {
    return;
  }
  e.stopPropagation();
  e.preventDefault();
  const ret = execute(actionName, explanMain);
  if (!ret.ok) {
    console.log(ret.error);
  }
};
