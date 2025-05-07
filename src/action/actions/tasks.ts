import { DirectedEdge, edgesBySrcAndDstToMap } from '../../dag/dag';
import { ExplanMain } from '../../explanMain/explanMain';
import {
  DeleteTaskOp,
  DupTaskOp,
  InsertNewEmptyTaskAfterOp,
  SplitTaskOp,
} from '../../ops/chart';
import { error, ok, Result } from '../../result';
import { Action, ActionFromOp, NOOPAction, PostActonWork } from '../action';

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

export class MoveFocusToPredecessor1 implements Action {
  description: string = 'Deletes a task.';
  postActionWork: PostActonWork = 'planDefinitionChanged';
  undo: boolean = false;
  predIndex: number = 0;

  async do(explanMain: ExplanMain): Promise<Result<Action>> {
    if (explanMain.selectedTask === -1) {
      return error(new Error('A task must be selected first.'));
    }

    // Find all the predecessors. Then move the focus to it.
    const edges = edgesBySrcAndDstToMap(explanMain.plan.chart.Edges);
    const predecessors = (edges.byDst.get(explanMain.selectedTask) || []).map(
      (e: DirectedEdge) => e.i
    );
    const selected =
      predecessors.length > this.predIndex && predecessors[this.predIndex];
    if (selected === false || selected === 0) {
      return error(new Error("Can't edit that task."));
    }

    explanMain.selectedTask = selected;

    return ok(new NOOPAction());
  }
}

export class MoveFocusToPredecessor2 extends MoveFocusToPredecessor1 {
  constructor() {
    super();
    this.predIndex = 1;
  }
}

export class MoveFocusToPredecessor3 extends MoveFocusToPredecessor1 {
  constructor() {
    super();
    this.predIndex = 2;
  }
}

export class MoveFocusToPredecessor4 extends MoveFocusToPredecessor1 {
  constructor() {
    super();
    this.predIndex = 3;
  }
}

export class MoveFocusToPredecessor5 extends MoveFocusToPredecessor1 {
  constructor() {
    super();
    this.predIndex = 4;
  }
}

export class MoveFocusToPredecessor6 extends MoveFocusToPredecessor1 {
  constructor() {
    super();
    this.predIndex = 5;
  }
}

export class MoveFocusToPredecessor7 extends MoveFocusToPredecessor1 {
  constructor() {
    super();
    this.predIndex = 6;
  }
}

export class MoveFocusToPredecessor8 extends MoveFocusToPredecessor1 {
  constructor() {
    super();
    this.predIndex = 7;
  }
}

export class MoveFocusToPredecessor9 extends MoveFocusToPredecessor1 {
  constructor() {
    super();
    this.predIndex = 8;
  }
}

export class MoveFocusToPredecessor0 extends MoveFocusToPredecessor1 {
  constructor() {
    super();
    this.predIndex = 9;
  }
}
