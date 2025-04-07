import { ExplanMain } from '../../explanMain/explanMain';
import {
  DeleteTaskOp,
  DupTaskOp,
  InsertNewEmptyTaskAfterOp,
  SplitTaskOp,
} from '../../ops/chart';
import { error, ok, Result } from '../../result';
import { Action, ActionFromOp, PostActonWork } from '../action';

export class SplitTaskAction implements Action {
  description: string = 'Splits a task.';
  postActionWork: PostActonWork = 'planDefinitionChanged';
  undo: boolean = true;

  async do(explanMain: ExplanMain): Promise<Result<Action>> {
    if (explanMain.selectedTask === -1) {
      return error(new Error('A task must be selected first.'));
    }
    const ret = SplitTaskOp(explanMain.selectedTask).applyTo(explanMain.plan);
    if (!ret.ok) {
      return ret;
    }
    return ok(
      new ActionFromOp(ret.value.inverse, this.postActionWork, this.undo)
    );
  }
}

export class DupTaskAction implements Action {
  description: string = 'Duplicates a task.';
  postActionWork: PostActonWork = 'planDefinitionChanged';
  undo: boolean = true;

  async do(explanMain: ExplanMain): Promise<Result<Action>> {
    if (explanMain.selectedTask === -1) {
      return error(new Error('A task must be selected first.'));
    }
    const ret = DupTaskOp(explanMain.selectedTask).applyTo(explanMain.plan);
    if (!ret.ok) {
      return ret;
    }
    return ok(
      new ActionFromOp(ret.value.inverse, this.postActionWork, this.undo)
    );
  }
}

export class NewTaskAction implements Action {
  description: string = 'Creates a new task.';
  postActionWork: PostActonWork = 'planDefinitionChanged';
  undo: boolean = true;

  async do(explanMain: ExplanMain): Promise<Result<Action>> {
    const ret = InsertNewEmptyTaskAfterOp(0).applyTo(explanMain.plan);
    if (!ret.ok) {
      return ret;
    }
    return ok(
      new ActionFromOp(ret.value.inverse, this.postActionWork, this.undo)
    );
  }
}

export class DeleteTaskAction implements Action {
  description: string = 'Deletes a task.';
  postActionWork: PostActonWork = 'planDefinitionChanged';
  undo: boolean = true;

  async do(explanMain: ExplanMain): Promise<Result<Action>> {
    if (explanMain.selectedTask === -1) {
      return error(new Error('A task must be selected first.'));
    }
    const ret = DeleteTaskOp(explanMain.selectedTask).applyTo(explanMain.plan);
    if (!ret.ok) {
      return ret;
    }
    explanMain.selectedTask = -1;
    return ok(
      new ActionFromOp(ret.value.inverse, this.postActionWork, this.undo)
    );
  }
}
