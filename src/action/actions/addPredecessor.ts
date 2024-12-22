import { AddDependencyDialog } from "../../add-dependency-dialog/add-dependency-dialog";
import { ExplanMain } from "../../explanMain/explanMain";
import { AddEdgeOp } from "../../ops/chart";
import { error, ok, Result } from "../../result";
import { Action, ActionFromOp, PostActonWork } from "../action";

export class AddPredecessorAction implements Action {
  description: string =
    "Prompts for and adds a predecessor to the current Task.";
  postActionWork: PostActonWork = "planDefinitionChanged";
  undo: boolean = true;

  async do(explanMain: ExplanMain): Promise<Result<Action>> {
    if (explanMain.selectedTask === -1) {
      return error(new Error("A Task must be selected."));
    }
    const predTaskIndex = await explanMain
      .querySelector<AddDependencyDialog>("add-dependency-dialog")!
      .selectDependency(explanMain.plan.chart, explanMain.selectedTask, "pred");
    if (predTaskIndex === undefined) {
      return error(new Error("No predecessor was selected."));
    }
    const ret = AddEdgeOp(predTaskIndex, explanMain.selectedTask).applyTo(
      explanMain.plan
    );
    if (!ret.ok) {
      return ret;
    }
    return ok(
      new ActionFromOp(
        ret.value.inverse,
        (this.postActionWork = this.postActionWork),
        true
      )
    );
  }
}
