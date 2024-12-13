import { ExplanMain } from "../../explanMain/explanMain";
import { SplitTaskOp } from "../../ops/chart";
import { error, ok, Result } from "../../result";
import { Action, ActionFromOp, PostActonWork } from "../action";

export class SplitTaskAction implements Action {
  description: string = "Splits a task.";
  postActionWork: PostActonWork = "planDefinitionChanged";
  undo: boolean = true;

  do(explanMain: ExplanMain): Result<Action> {
    if (explanMain.selectedTask === -1) {
      return error(new Error("A task must be selected first."));
    }
    const ret = SplitTaskOp(explanMain.selectedTask).apply(explanMain.plan);
    if (!ret.ok) {
      return ret;
    }
    return ok(
      new ActionFromOp(ret.value.inverse, this.postActionWork, this.undo)
    );
  }
}
