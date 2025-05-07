import { executeByName } from '../action/execute';
import { ActionNames } from '../action/registry';
import { ExplanMain } from '../explanMain/explanMain';
import { reportIfError } from '../report-error/report-error';

export const KeyMap: Map<string, ActionNames> = new Map([
  ['shift-ctrl-R', 'ToggleRadarAction'],
  ['shift-ctrl-M', 'ToggleDarkModeAction'],
  ['shift-ctrl-Z', 'ResetZoomAction'],
  ['ctrl-z', 'UndoAction'],
  ['ctrl-y', 'RedoAction'],
  ['shift-ctrl-H', 'HelpAction'],
  ['shift-ctrl-|', 'SplitTaskAction'],
  ['shift-ctrl-_', 'DupTaskAction'],
  ['alt-Insert', 'NewTaskAction'],
  ['alt-Delete', 'DeleteTaskAction'],
  ['ctrl-f', 'GoToSearchAction'],
  ['shift-ctrl-F', 'GoToFullSearchAction'],
  ['shift-ctrl-<', 'AddPredecessorAction'],
  ['shift-ctrl->', 'AddSuccessorAction'],
  ['shift-ctrl-V', 'DeveloperPanelAction'],
  ['ctrl-meta-1', 'MoveFocusToPredecessor1'],
  ['ctrl-meta-2', 'MoveFocusToPredecessor2'],
  ['ctrl-meta-3', 'MoveFocusToPredecessor3'],
  ['ctrl-meta-4', 'MoveFocusToPredecessor4'],
  ['ctrl-meta-5', 'MoveFocusToPredecessor5'],
  ['ctrl-meta-6', 'MoveFocusToPredecessor6'],
  ['ctrl-meta-7', 'MoveFocusToPredecessor7'],
  ['ctrl-meta-8', 'MoveFocusToPredecessor8'],
  ['ctrl-meta-9', 'MoveFocusToPredecessor9'],
  ['ctrl-meta-0', 'MoveFocusToPredecessor0'],
]);

let explanMain: ExplanMain;

export const StartKeyboardHandling = (em: ExplanMain) => {
  explanMain = em;
  document.addEventListener('keydown', onKeyDown);
};

const onKeyDown = async (e: KeyboardEvent) => {
  const keyname = `${e.shiftKey ? 'shift-' : ''}${e.ctrlKey ? 'ctrl-' : ''}${e.metaKey ? 'meta-' : ''}${e.altKey ? 'alt-' : ''}${e.key}`;
  console.log(keyname);
  const actionName = KeyMap.get(keyname);
  if (actionName === undefined) {
    return;
  }
  e.stopPropagation();
  e.preventDefault();
  const ret = await executeByName(actionName, explanMain);
  reportIfError(ret);
};

export const unmapUndoAndRedo = () => {
  KeyMap.delete('ctrl-z');
  KeyMap.delete('ctrl-y');
};
