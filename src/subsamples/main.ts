import { Chart, ChartValidate, Task } from "../chart/chart.ts";
import { InsertNewEmptyMilestoneAfterOp, SetTaskNameOp } from "../ops/chart.ts";
import { SetMetricValueOp } from "../ops/metrics.ts";
import { Op, applyAllOpsToPlan } from "../ops/ops.ts";
import { Plan } from "../plan/plan.ts";
import { Precision } from "../precision/precision.ts";
import { ComputeSlack, CriticalPath } from "../slack/slack.ts";
import { Jacobian } from "../stats/cdf/triangular/jacobian.ts";

const taskA = new Task("A");
taskA.setMetric("Duration", 10);

const taskB = new Task("B");
taskB.setMetric("Duration", 15);

let plan = new Plan();

const ops: Op[] = [
  InsertNewEmptyMilestoneAfterOp(0),
  SetMetricValueOp("Duration", 10, 1),
  SetTaskNameOp(1, "A"),
  InsertNewEmptyMilestoneAfterOp(1),
  SetMetricValueOp("Duration", 15, 2),
  SetTaskNameOp(1, "B"),
];

const res = applyAllOpsToPlan(ops, plan);
if (!res.ok) {
  throw res.error;
}
plan = res.value.plan;

const C: Chart = plan.chart;

const jacobians = C.Vertices.map((t: Task) => {
  return new Jacobian(t.duration, "low");
});

const precision = new Precision(0);

const slacksRet = ComputeSlack(C, undefined, precision.rounder());
if (!slacksRet.ok) {
  throw new Error(`Error computing slack: ${slacksRet.error}`);
}
console.log(
  "Tasks on the critical path:",
  CriticalPath(slacksRet.value, precision.rounder()),
);
console.log(
  "Tasks on the critical path for in the first quartile:",
  ComputeSlack(
    C,
    (taskIndex: number) => jacobians[taskIndex].sample(0.25),
    precision.rounder(),
  ),
);

console.log(ChartValidate(plan.chart));

console.log(JSON.stringify(plan, null, "  "));
