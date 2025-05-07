import { Action } from './action.ts';
import { AddPredecessorAction } from './actions/addPredecessor.ts';
import { AddSuccessorAction } from './actions/addSuccessor.ts';
import { DeveloperPanelAction } from './actions/developer.ts';
import {
  GoToFullSearchAction,
  GoToSearchAction,
} from './actions/gotoSearch.ts';
import { HelpAction } from './actions/help.ts';
import { ResetZoomAction } from './actions/resetZoom.ts';
import {
  DeleteTaskAction,
  DupTaskAction,
  MoveFocusToPredecessor1,
  MoveFocusToPredecessor2,
  MoveFocusToPredecessor3,
  MoveFocusToPredecessor4,
  MoveFocusToPredecessor5,
  MoveFocusToPredecessor6,
  MoveFocusToPredecessor7,
  MoveFocusToPredecessor8,
  MoveFocusToPredecessor9,
  MoveFocusToSuccessor1,
  MoveFocusToSuccessor2,
  MoveFocusToSuccessor3,
  MoveFocusToSuccessor4,
  MoveFocusToSuccessor5,
  MoveFocusToSuccessor6,
  MoveFocusToSuccessor7,
  MoveFocusToSuccessor8,
  MoveFocusToSuccessor9,
  NewTaskAction,
  SplitTaskAction,
} from './actions/tasks.ts';
import { ToggleDarkModeAction } from './actions/toggleDarkMode.ts';
import { ToggleRadarAction } from './actions/toggleRadar.ts';
import { RedoAction, UndoAction } from './actions/undo.ts';

export type ActionNames =
  | 'ToggleDarkModeAction'
  | 'ToggleRadarAction'
  | 'ResetZoomAction'
  | 'UndoAction'
  | 'RedoAction'
  | 'HelpAction'
  | 'SplitTaskAction'
  | 'DupTaskAction'
  | 'NewTaskAction'
  | 'DeleteTaskAction'
  | 'GoToSearchAction'
  | 'GoToFullSearchAction'
  | 'AddPredecessorAction'
  | 'AddSuccessorAction'
  | 'DeveloperPanelAction'
  | 'MoveFocusToPredecessor1'
  | 'MoveFocusToPredecessor2'
  | 'MoveFocusToPredecessor3'
  | 'MoveFocusToPredecessor4'
  | 'MoveFocusToPredecessor5'
  | 'MoveFocusToPredecessor6'
  | 'MoveFocusToPredecessor7'
  | 'MoveFocusToPredecessor8'
  | 'MoveFocusToPredecessor9'
  | 'MoveFocusToSuccessor1'
  | 'MoveFocusToSuccessor2'
  | 'MoveFocusToSuccessor3'
  | 'MoveFocusToSuccessor4'
  | 'MoveFocusToSuccessor5'
  | 'MoveFocusToSuccessor6'
  | 'MoveFocusToSuccessor7'
  | 'MoveFocusToSuccessor8'
  | 'MoveFocusToSuccessor9';

export const ActionRegistry: Record<ActionNames, Action> = {
  ToggleDarkModeAction: new ToggleDarkModeAction(),
  ToggleRadarAction: new ToggleRadarAction(),
  ResetZoomAction: new ResetZoomAction(),
  UndoAction: new UndoAction(),
  RedoAction: new RedoAction(),
  HelpAction: new HelpAction(),
  SplitTaskAction: new SplitTaskAction(),
  DupTaskAction: new DupTaskAction(),
  NewTaskAction: new NewTaskAction(),
  DeleteTaskAction: new DeleteTaskAction(),
  GoToSearchAction: new GoToSearchAction(),
  GoToFullSearchAction: new GoToFullSearchAction(),
  AddPredecessorAction: new AddPredecessorAction(),
  AddSuccessorAction: new AddSuccessorAction(),
  DeveloperPanelAction: new DeveloperPanelAction(),
  MoveFocusToPredecessor1: new MoveFocusToPredecessor1(),
  MoveFocusToPredecessor2: new MoveFocusToPredecessor2(),
  MoveFocusToPredecessor3: new MoveFocusToPredecessor3(),
  MoveFocusToPredecessor4: new MoveFocusToPredecessor4(),
  MoveFocusToPredecessor5: new MoveFocusToPredecessor5(),
  MoveFocusToPredecessor6: new MoveFocusToPredecessor6(),
  MoveFocusToPredecessor7: new MoveFocusToPredecessor7(),
  MoveFocusToPredecessor8: new MoveFocusToPredecessor8(),
  MoveFocusToPredecessor9: new MoveFocusToPredecessor9(),
  MoveFocusToSuccessor1: new MoveFocusToSuccessor1(),
  MoveFocusToSuccessor2: new MoveFocusToSuccessor2(),
  MoveFocusToSuccessor3: new MoveFocusToSuccessor3(),
  MoveFocusToSuccessor4: new MoveFocusToSuccessor4(),
  MoveFocusToSuccessor5: new MoveFocusToSuccessor5(),
  MoveFocusToSuccessor6: new MoveFocusToSuccessor6(),
  MoveFocusToSuccessor7: new MoveFocusToSuccessor7(),
  MoveFocusToSuccessor8: new MoveFocusToSuccessor8(),
  MoveFocusToSuccessor9: new MoveFocusToSuccessor9(),
};
