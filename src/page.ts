import { Task } from "./chart/chart.ts";
import {
  DupTaskOp,
  InsertNewEmptyTaskAfterOp,
  SetTaskNameOp,
  SplitTaskOp,
} from "./ops/chart.ts";
import { SetMetricValueOp } from "./ops/metrics.ts";
import { Op, applyAllOpsToPlan } from "./ops/ops.ts";
import { Plan, StaticMetricKeys } from "./plan/plan.ts";
import { DisplayRange } from "./renderer/range/range.ts";
import {
  RenderOptions,
  TaskLabel,
  renderTasksToCanvas,
  suggestedCanvasHeight,
} from "./renderer/renderer.ts";
import { ComputeSlack, Slack } from "./slack/slack";

const plan = new Plan();

const rndInt = (n: number): number => {
  return Math.floor(Math.random() * n);
};

const DURATION = 100;

const rndDuration = (): number => {
  return rndInt(DURATION) + 1;
};

const rndName = (): string => `Task ${String.fromCharCode(65 + rndInt(26))}`;

const ops: Op[] = [
  InsertNewEmptyTaskAfterOp(0),
  SetMetricValueOp(StaticMetricKeys.Duration, rndDuration(), 1),
  SetTaskNameOp(1, rndName()),
];

let numTasks = 1;
for (let i = 0; i < 10; i++) {
  let index = rndInt(numTasks) + 1;
  ops.push(
    SplitTaskOp(index),
    SetMetricValueOp(StaticMetricKeys.Duration, rndDuration(), index + 1),
    SetTaskNameOp(index + 1, rndName())
  );
  numTasks++;
  index = rndInt(numTasks) + 1;
  ops.push(
    DupTaskOp(index),
    SetMetricValueOp(StaticMetricKeys.Duration, rndInt(10) + 1, index + 1),
    SetTaskNameOp(index + 1, rndName())
  );
  numTasks++;
}

const res = applyAllOpsToPlan(ops, plan);

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

const taskLabel: TaskLabel = (task: Task, slack: Slack): string =>
  `${task.name} (${slack.earlyStart}) `;

const paintChart = () => {
  const radarOpts: RenderOptions = {
    fontSizePx: 12,
    hasText: false,
    displaySubRange: null,
    colorTheme: {
      surface: "#fff",
      onSurface: "#2072c3",
    },
    marginSizePx: 10,
    displayTimes: false,
    taskLabel: taskLabel,
  };

  const zoomOpts: RenderOptions = {
    fontSizePx: 32,
    hasText: true,
    displaySubRange: new DisplayRange(50, 100),
    colorTheme: {
      surface: "#fff",
      onSurface: "#000",
    },
    marginSizePx: 10,
    displayTimes: true,
    taskLabel: taskLabel,
  };

  paintOneChart("#radar", radarOpts);
  paintOneChart("#zoomed", zoomOpts);
};

const paintOneChart = (canvasID: string, opts: RenderOptions) => {
  const canvas = document.querySelector<HTMLCanvasElement>(canvasID)!;
  const parent = canvas!.parentElement!;
  const ratio = window.devicePixelRatio;
  const { width, height } = parent.getBoundingClientRect();
  const canvasWidth = Math.ceil(width * ratio);
  const canvasHeight = Math.ceil(height * ratio);
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  // Now update the canvas height so that it fits the chart being drawn.
  // TODO Turn this into an option since we won't always want this.

  if (1) {
    const newHeight = suggestedCanvasHeight(
      canvas,
      slack,
      opts,
      plan.chart.Vertices.length + 2 // TODO - Why do we need the +1 here!?
    );
    canvas.height = newHeight;
    canvas.style.height = `${newHeight / ratio}px`;
  }
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  renderTasksToCanvas(parent, canvas, ctx, plan.chart, slack, opts);
};

paintChart();

window.addEventListener("resize", paintChart);
