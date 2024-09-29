import { Chart, Task, validateChart } from "./chart/chart.ts";
import { DirectedEdge } from "./dag/dag.ts";
import { InsertNewEmptyTaskAfterOp } from "./ops/chart.ts";
import { Plan } from "./plan/plan.ts";
import { ComputeSlack } from "./slack/slack.ts";

const taskA = new Task("A");
taskA.metrics.set("Duration", 10);

const taskB = new Task("B");
taskB.metrics.set("Duration", 15);

const C: Chart = {
  Vertices: [new Task("Start"), taskA, taskB, new Task("Finish")],
  Edges: [
    new DirectedEdge(0, 1),
    new DirectedEdge(0, 2),
    new DirectedEdge(1, 3),
    new DirectedEdge(2, 3),
  ],
};

console.log("Tasks on the critical path:", ComputeSlack(C));
console.log(
  "Tasks on the critical path for in the first quartile:",
  ComputeSlack(C, (t: Task) => t.durationModel.sample(t.duration, 0.25)),
);

const plan = new Plan();
const op = InsertNewEmptyTaskAfterOp(0);
let err = op.apply(plan);
console.log("Applying op: ", err);
const op2 = InsertNewEmptyTaskAfterOp(1);
let res = op2.apply(plan);
console.assert(res.ok);
if (res.ok) {
  console.log("Applying op2: ", res);
  res = res.value.inverse.apply(plan);
  console.log("Applying op2.inverse: ", err);
}

// Ops that fail to apply revert applied ops.
err = InsertNewEmptyTaskAfterOp(99).apply(plan);
console.log("Applying op: ", err);
console.log(validateChart(plan.chart));

console.log(JSON.stringify(plan, null, "  "));
