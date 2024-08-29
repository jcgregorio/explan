import { RoughCanvas } from "roughjs/bin/canvas";
import { Chart, Task, validateChart } from "../chart/chart";
import { DirectedEdge } from "../dag/dag";
import { Result, ok } from "../result";
import { Slack } from "../slack/slack";
import { Feature, Metric, Point, Scale } from "./scale/scale";
import rough from "roughjs/bin/rough";
import { Options } from "roughjs/bin/core";

export interface ColorTheme {
  surface: string;
  onSurface: string;
}

export interface DisplayRange {
  begin: number;
  end: number;
}

/** Function use to produce a text label for a task and its slack. */
export type TaskLabel = (task: Task, slack: Slack) => string;

export const defaultTaskLabel: TaskLabel = (
  task: Task,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _slack: Slack
): string => task.name;

export interface RenderOptions {
  /** The text font size, this drives the size of all other chart features.
   * */
  fontSizePx: number;

  /** Display text if true. */
  hasText: boolean;

  /** If supplied then only the tasks in the given range will be displayed. */
  displaySubRange: DisplayRange | null;

  /** The color theme. */
  colorTheme: ColorTheme;

  /** The margin, in pixels, around the chart. */
  marginSizePx: number;

  /** If true then display times at the top of the chart. */
  displayTimes: boolean;

  /** Function that produces display text for a Task and its associated Slack. */
  taskLabel: TaskLabel;
}

const verticalArrowStartFeatureFromTaskDuration = (task: Task): Feature => {
  if (task.duration === 0) {
    return Feature.verticalArrowStartFromMilestone;
  } else {
    return Feature.verticalArrowStart;
  }
};

const verticalArrowDestFeatureFromTaskDuration = (task: Task): Feature => {
  if (task.duration === 0) {
    return Feature.verticalArrowDestToMilestone;
  } else {
    return Feature.verticalArrowDest;
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const horizontalArrowStartFeatureFromTaskDuration = (task: Task): Feature => {
  if (task.duration === 0) {
    return Feature.horizontalArrowStartFromMilestone;
  } else {
    return Feature.horizontalArrowStart;
  }
};

const horizontalArrowDestFeatureFromTaskDuration = (task: Task): Feature => {
  if (task.duration === 0) {
    return Feature.horizontalArrowDestToMilestone;
  } else {
    return Feature.horizontalArrowDest;
  }
};

/**
 * Compute what the height of the canvas should be. Note that the value doesn't
 * know about `window.devicePixelRatio`, so if the canvas is already scaled by
 * `window.devicePixelRatio` then so will the result of this function.
 */
export function suggestedCanvasHeight(
  canvas: HTMLCanvasElement,
  slacks: Slack[],
  opts: RenderOptions,
  maxRows: number
): number {
  return new Scale(
    opts,
    canvas.width,
    slacks[slacks.length - 1].earlyFinish + 1
  ).height(maxRows);
}

export function renderTasksToCanvas(
  parent: HTMLElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  chart: Chart,
  slacks: Slack[],
  opts: RenderOptions
): Result<null> {
  const vret = validateChart(chart);
  if (!vret.ok) {
    return vret;
  }
  const topologicalOrder = vret.value;

  // topologicalOrder maps from row to task index. We also need to construct a
  // map that goes in the opposite direction.
  const taskIndexToRow: Map<number, number> = new Map(
    topologicalOrder.map((taskIndex: number, row: number) => [taskIndex, row])
  );

  const scale = new Scale(
    opts,
    canvas.width,
    slacks[slacks.length - 1].earlyFinish + 1
  );

  setFontSize(ctx, opts);
  clearCanvas(ctx, opts, canvas);

  const rcanvas = rough.canvas(canvas);

  const taskLineHeight = scale.metric(Metric.taskLineHeight);
  const diamondDiameter = scale.metric(Metric.milestoneDiameter);
  const percentHeight = scale.metric(Metric.percentHeight);
  const arrowHeadHeight = scale.metric(Metric.arrowHeadHeight);
  const arrowHeadWidth = scale.metric(Metric.arrowHeadWidth);

  const daysWithTimeMarkers: Set<number> = new Set();
  // Descend through the topological order drawing task lines in their swim
  // lanes.
  topologicalOrder.forEach((index: number, row: number) => {
    const task = chart.Vertices[index];
    const slack = slacks[index];
    const taskStart = scale.feature(
      row,
      slack.earlyStart,
      Feature.taskLineStart
    );
    const taskEnd = scale.feature(
      row,
      slack.earlyFinish,
      Feature.taskLineStart
    );

    // Draw in time markers if displayed.
    if (opts.displayTimes) {
      drawTimeMarkerAtDayToTask(
        ctx,
        row,
        slack.earlyStart,
        task,
        opts,
        scale,
        daysWithTimeMarkers
      );
      drawTimeMarkerAtDayToTask(
        ctx,
        row,
        slack.earlyFinish,
        task,
        opts,
        scale,
        daysWithTimeMarkers
      );
    }

    if (taskStart.x === taskEnd.x) {
      drawMilestone(ctx, taskStart, diamondDiameter, percentHeight);
    } else {
      drawTaskBar(rcanvas, taskStart, taskEnd, taskLineHeight);
    }

    drawTaskText(ctx, opts, scale, row, slack, task);
  });

  ctx.lineWidth = 1;
  ctx.strokeStyle = opts.colorTheme.onSurface;

  // Now draw all the arrows, i.e. edges.
  chart.Edges.forEach((e: DirectedEdge) => {
    const srcSlack: Slack = slacks[e.i];
    const dstSlack: Slack = slacks[e.j];
    const srcTask: Task = chart.Vertices[e.i];
    const dstTask: Task = chart.Vertices[e.j];
    const srcRow = taskIndexToRow.get(e.i)!;
    const dstRow = taskIndexToRow.get(e.j)!;
    const srcDay = srcSlack.earlyFinish;
    const dstDay = dstSlack.earlyStart;

    drawArrowBetweenTasks(
      rcanvas,
      srcDay,
      dstDay,
      scale,
      srcRow,
      srcTask,
      dstRow,
      dstTask,
      arrowHeadWidth,
      arrowHeadHeight
    );
  });
  return ok(null);
}

function drawArrowBetweenTasks(
  rcanvas: RoughCanvas,
  srcDay: number,
  dstDay: number,
  scale: Scale,
  srcRow: number,
  srcTask: Task,
  dstRow: number,
  dstTask: Task,
  arrowHeadWidth: number,
  arrowHeadHeight: number
) {
  if (srcDay === dstDay) {
    // TODO - Once we can present things in an order besides topological sort,
    // e.g. allow grouping into swimlanes by resource, then these arrows might
    // start pointing up, so both the arrow start and arrow head direction
    // might change and need to depend on the direction from srcRow to dstRow.
    drawVerticalArrowToTask(
      rcanvas,
      scale,
      srcRow,
      srcDay,
      srcTask,
      dstRow,
      dstDay,
      dstTask,
      arrowHeadWidth,
      arrowHeadHeight
    );
  } else {
    drawLShapedArrowToTask(
      rcanvas,
      scale,
      srcRow,
      srcDay,
      srcTask,
      dstRow,
      dstTask,
      dstDay,
      arrowHeadHeight,
      arrowHeadWidth
    );
  }
}

function clearCanvas(
  ctx: CanvasRenderingContext2D,
  opts: RenderOptions,
  canvas: HTMLCanvasElement
) {
  ctx.fillStyle = opts.colorTheme.surface;
  ctx.strokeStyle = opts.colorTheme.onSurface;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function setFontSize(ctx: CanvasRenderingContext2D, opts: RenderOptions) {
  ctx.font = `${opts.fontSizePx}px serif`;
}

// Draw L shaped arrow, first going between rows, then going between days.
function drawLShapedArrowToTask(
  rcanvas: RoughCanvas,
  scale: Scale,
  srcRow: number,
  srcDay: number,
  srcTask: Task,
  dstRow: number,
  dstTask: Task,
  dstDay: number,
  arrowHeadHeight: number,
  arrowHeadWidth: number
) {
  // TODO - Once we can present things in an order besides topological sort,
  // e.g. allow grouping into swimlanes by resource, then the vertical
  // section of the "L" might start pointing up, so both the
  // verticalArrowStart and verticalArrowDest locations might change and
  // need to depend on the direction from srcRow to dstRow.

  // Draw vertical part of the "L".
  const vertLineStart = scale.feature(
    srcRow,
    srcDay,
    verticalArrowStartFeatureFromTaskDuration(srcTask)
  );
  const vertLineEnd = scale.feature(
    dstRow,
    srcDay,
    horizontalArrowDestFeatureFromTaskDuration(dstTask)
  );
  rcanvas.line(
    vertLineStart.x + 0.5,
    vertLineStart.y,
    vertLineStart.x + 0.5,
    vertLineEnd.y
  );

  // Draw horizontal part of the "L".
  const horzLineStart = vertLineEnd;
  const horzLineEnd = scale.feature(
    dstRow,
    dstDay,
    horizontalArrowDestFeatureFromTaskDuration(dstTask)
  );
  rcanvas.line(
    vertLineStart.x + 0.5,
    horzLineStart.y,
    horzLineEnd.x + 0.5,
    horzLineEnd.y
  );

  // Draw the arrowhead. This arrow head will always point to the right
  // since that's how time flows.
  rcanvas.line(
    horzLineEnd.x + 0.5,
    horzLineEnd.y,
    horzLineEnd.x - arrowHeadHeight + 0.5,
    horzLineEnd.y + arrowHeadWidth
  );
  rcanvas.line(
    horzLineEnd.x + 0.5,
    horzLineEnd.y,
    horzLineEnd.x - arrowHeadHeight + 0.5,
    horzLineEnd.y - arrowHeadWidth
  );
}

function drawVerticalArrowToTask(
  rcanvas: RoughCanvas,
  scale: Scale,
  srcRow: number,
  srcDay: number,
  srcTask: Task,
  dstRow: number,
  dstDay: number,
  dstTask: Task,
  arrowHeadWidth: number,
  arrowHeadHeight: number
) {
  const arrowStart = scale.feature(
    srcRow,
    srcDay,
    verticalArrowStartFeatureFromTaskDuration(srcTask)
  );
  const arrowEnd = scale.feature(
    dstRow,
    dstDay,
    verticalArrowDestFeatureFromTaskDuration(dstTask)
  );

  rcanvas.line(arrowStart.x + 0.5, arrowStart.y, arrowEnd.x + 0.5, arrowEnd.y);

  // Draw the arrowhead.
  rcanvas.line(
    arrowEnd.x + 0.5,
    arrowEnd.y,
    arrowEnd.x - arrowHeadWidth + 0.5,
    arrowEnd.y - arrowHeadHeight
  );
  rcanvas.line(
    arrowEnd.x + 0.5,
    arrowEnd.y,
    arrowEnd.x + arrowHeadWidth + 0.5,
    arrowEnd.y - arrowHeadHeight
  );
}

function drawTaskText(
  ctx: CanvasRenderingContext2D,
  opts: RenderOptions,
  scale: Scale,
  row: number,
  slack: Slack,
  task: Task
) {
  ctx.lineWidth = 1;
  ctx.fillStyle = opts.colorTheme.onSurface;
  ctx.textBaseline = "top";
  const textStart = scale.feature(row, slack.earlyStart, Feature.textStart);
  ctx.fillText(opts.taskLabel(task, slack), textStart.x, textStart.y);
}

function drawTaskBar(
  rcanvas: RoughCanvas,
  taskStart: Point,
  taskEnd: Point,
  taskLineHeight: number
) {
  const opt: Options = {
    fillWeight: 1,
    hachureGap: 2,
    strokeWidth: 1,
    hachureAngle: 65,
    fill: "rgb(0, 0, 0, 0.5)",
    fillStyle: "hachure",
  };
  rcanvas.rectangle(
    taskStart.x,
    taskStart.y,
    taskEnd.x - taskStart.x,
    taskLineHeight,
    opt
  );
}

function drawMilestone(
  ctx: CanvasRenderingContext2D,
  taskStart: Point,
  diamondDiameter: number,
  percentHeight: number
) {
  ctx.beginPath();
  ctx.lineWidth = percentHeight / 2;
  ctx.moveTo(taskStart.x, taskStart.y - diamondDiameter);
  ctx.lineTo(taskStart.x + diamondDiameter, taskStart.y);
  ctx.lineTo(taskStart.x, taskStart.y + diamondDiameter);
  ctx.lineTo(taskStart.x - diamondDiameter, taskStart.y);
  ctx.closePath();
  ctx.stroke();
}

const drawTimeMarkerAtDayToTask = (
  ctx: CanvasRenderingContext2D,
  row: number,
  day: number,
  task: Task,
  opts: RenderOptions,
  scale: Scale,
  daysWithTimeMarkers: Set<number>
) => {
  if (daysWithTimeMarkers.has(day)) {
    return;
  }
  daysWithTimeMarkers.add(day);
  const timeMarkStart = scale.feature(row, day, Feature.timeMarkStart);
  const timeMarkEnd = scale.feature(
    row,
    day,
    verticalArrowDestFeatureFromTaskDuration(task)
  );
  ctx.lineWidth = 1;
  ctx.setLineDash([1, 2]);
  ctx.moveTo(timeMarkStart.x + 0.5, timeMarkStart.y);
  ctx.lineTo(timeMarkStart.x + 0.5, timeMarkEnd.y);
  ctx.stroke();

  ctx.setLineDash([]);

  ctx.fillStyle = opts.colorTheme.onSurface;
  ctx.textBaseline = "top";
  const textStart = scale.feature(row, day, Feature.timeTextStart);
  ctx.fillText(`${day}`, textStart.x, textStart.y);
};
