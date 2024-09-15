import {
  DupTaskOp,
  InsertNewEmptyTaskAfterOp,
  SetTaskNameOp,
  SplitTaskOp,
} from "./ops/chart.ts";
import { SetMetricValueOp } from "./ops/metrics.ts";
import { Op, applyAllOpsToPlan } from "./ops/ops.ts";
import { Plan } from "./plan/plan.ts";
import {
  DRAG_RANGE_EVENT,
  DragRange,
  MouseMove,
} from "./renderer/mousemove/mousemove.ts";
import { DisplayRange } from "./renderer/range/range.ts";
import {
  RenderOptions,
  TaskLabel,
  renderTasksToCanvas,
  suggestedCanvasHeight,
} from "./renderer/renderer.ts";
import { Scale } from "./renderer/scale/scale.ts";
import { Result } from "./result.ts";
import { ComputeSlack, Slack, Span } from "./slack/slack";
import { Theme, colorThemeFromElement } from "./style/theme/theme.ts";
import { toggleTheme } from "./style/toggler/toggler.ts";

const plan = new Plan();

const rndInt = (n: number): number => {
  return Math.floor(Math.random() * n);
};

const DURATION = 100;

const rndDuration = (): number => {
  return rndInt(DURATION);
};

const rndName = (): string => `Task ${String.fromCharCode(65 + rndInt(26))}`;

const ops: Op[] = [
  InsertNewEmptyTaskAfterOp(0),
  SetMetricValueOp("Duration", rndDuration(), 1),
  SetTaskNameOp(1, rndName()),
];

let numTasks = 1;
for (let i = 0; i < 20; i++) {
  let index = rndInt(numTasks) + 1;
  ops.push(
    SplitTaskOp(index),
    SetMetricValueOp("Duration", rndDuration(), index + 1),
    SetTaskNameOp(index + 1, rndName())
  );
  numTasks++;
  index = rndInt(numTasks) + 1;
  ops.push(
    DupTaskOp(index),
    SetMetricValueOp("Duration", rndDuration(), index + 1),
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

const spans: Span[] = slack.map((value: Slack): Span => {
  return value.early;
});

const taskLabel: TaskLabel = (taskIndex: number): string =>
  `${plan.chart.Vertices[taskIndex].name} (${slack[taskIndex].early.start}) `;

// TODO Extract this as a helper for the radar view.
let displayRange: DisplayRange | null = null;
let scale: Scale | null = null;

const radar = document.querySelector<HTMLElement>("#radar")!;
new MouseMove(radar);

const dragRangeHandler = (e: CustomEvent<DragRange>) => {
  if (scale === null) {
    return;
  }
  const begin = scale.dayRowFromPoint(e.detail.begin);
  const end = scale.dayRowFromPoint(e.detail.end);
  displayRange = new DisplayRange(begin.day, end.day);
  paintChart();
};

radar.addEventListener(DRAG_RANGE_EVENT, dragRangeHandler as EventListener);

document.querySelector("#dark-mode-toggle")!.addEventListener("click", () => {
  toggleTheme();
  paintChart();
});

const paintChart = () => {
  console.time("paintChart");

  const themeColors: Theme = colorThemeFromElement(document.body);

  const radarOpts: RenderOptions = {
    fontSizePx: 12,
    hasText: false,
    displayRange: displayRange,
    displayRangeUsage: "highlight",
    colors: {
      surface: themeColors.surface,
      onSurface: themeColors.onSurface,
      overlay: themeColors.overlay,
    },
    marginSizePx: 10,
    displayTimes: false,
    taskLabel: taskLabel,
  };

  const zoomOpts: RenderOptions = {
    fontSizePx: 32,
    hasText: true,
    // Need a toggle to either use the range to control what is displayed, or to
    // use it to draw the opaque regions over the radar.
    displayRange: displayRange, // new DisplayRange(50, 100),
    displayRangeUsage: "restrict",
    colors: {
      surface: themeColors.surface,
      onSurface: themeColors.onSurfaceSecondary,
      overlay: themeColors.overlay,
    },
    marginSizePx: 10,
    displayTimes: true,
    taskLabel: taskLabel,
  };

  paintOneChart("#zoomed", zoomOpts);
  const ret = paintOneChart("#radar", radarOpts);

  if (!ret.ok) {
    return;
  }
  scale = ret.value;
  console.timeEnd("paintChart");
};

const paintOneChart = (
  canvasID: string,
  opts: RenderOptions
): Result<Scale> => {
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
      spans,
      opts,
      plan.chart.Vertices.length + 2 // TODO - Why do we need the +2 here!?
    );
    canvas.height = newHeight;
    canvas.style.height = `${newHeight / ratio}px`;
  }
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  return renderTasksToCanvas(parent, canvas, ctx, plan.chart, spans, opts);
};

paintChart();

window.addEventListener("resize", paintChart);
