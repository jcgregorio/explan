import { Chart, Task } from "./chart/chart.ts";
import { DirectedEdge } from "./dag/dag.ts";
import {
  DupTaskOp,
  InsertNewEmptyTaskAfterOp,
  SetTaskNameOp,
  SplitTaskOp,
} from "./ops/chart.ts";
import { SetMetricValueOp } from "./ops/metrics.ts";
import { applyAllOpsToPlan } from "./ops/ops.ts";
import { Plan, StaticMetricKeys } from "./plan/plan.ts";
import {
  ColorTheme,
  RenderOptions,
  renderTasksToCanvas,
} from "./renderer/renderer.ts";
import { ComputeSlack, Slack } from "./slack/slack";

const plan = new Plan(new Chart());

// StaticMetricKeys aren't being applied to new Tasks... ?!?!?
const res = applyAllOpsToPlan(
  [
    SetMetricValueOp(StaticMetricKeys.Duration, 0, 0),
    SetMetricValueOp(StaticMetricKeys.Duration, 0, 1),
    InsertNewEmptyTaskAfterOp(0),
    SetTaskNameOp(1, "Task A"),
    SetMetricValueOp(StaticMetricKeys.Duration, 5, 1),
    SplitTaskOp(1),
    SetTaskNameOp(2, "Task B"),
    SplitTaskOp(2),
    SetTaskNameOp(3, "Task C"),
    SetMetricValueOp(StaticMetricKeys.Duration, 10, 2),
    DupTaskOp(2),
    SetTaskNameOp(3, "Task C"),
    SetMetricValueOp(StaticMetricKeys.Duration, 15, 3),
  ],
  plan
);

if (!res.ok) {
  console.log(res.error);
}

let slack: Slack[] = [];
const slackResult = ComputeSlack(plan.chart);
if (!slackResult.ok) {
  console.error(slackResult);
} else {
  slack = slackResult.value;
}

const paintChart = () => {
  const canvas = document.querySelector<HTMLCanvasElement>("canvas")!;
  const parent = canvas!.parentElement!;
  const ratio = window.devicePixelRatio;
  const { width, height } = parent.getBoundingClientRect();
  const canvasWidth = Math.ceil(width * ratio);
  const canvasHeight = Math.ceil(height * ratio);
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  const colorTheme: ColorTheme = {
    surface: "#fff",
    onSurface: "#000",
  };
  const opts: RenderOptions = {
    fontSizePx: 36,
    hasText: true,
    displaySubRange: null,
    colorTheme: colorTheme,
    marginSizePx: 10,
    displayTimes: true,
  };

  renderTasksToCanvas(parent, canvas, ctx, plan.chart, slack, opts);
};

paintChart();

window.addEventListener("resize", paintChart);
