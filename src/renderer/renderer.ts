import { Task, validateChart } from "../chart/chart.ts";
import { DirectedEdge } from "../dag/dag.ts";
import { Plan } from "../plan/plan.ts";
import { ResourceDefinition } from "../resources/resources.ts";
import { Result, ok } from "../result.ts";
import { Span } from "../slack/slack.ts";
import { DisplayRange } from "./range/range.ts";
import { Point } from "./scale/point.ts";
import { Feature, Metric, Scale } from "./scale/scale.ts";

type Direction = "up" | "down";

export interface Colors {
  surface: string;
  onSurface: string;
  onSurfaceMuted: string;
  onSurfaceHighlight: string;
  overlay: string;
  groupColor: string;
}

export type TaskIndexToRow = Map<number, number>;

/** Function use to produce a text label for a task and its slack. */
export type TaskLabel = (taskIndex: number) => string;

/** Controls of the displayRange in RenderOptions is used.
 *
 *  "restrict": Only display the parts of the chart that appear in the range.
 *
 *  "highlight": Display the full range of the data, but highlight the range.
 */
export type DisplayRangeUsage = "restrict" | "highlight";

export const defaultTaskLabel: TaskLabel = (taskIndex: number): string =>
  taskIndex.toFixed(0);

export interface RenderOptions {
  /** The text font size, this drives the size of all other chart features.
   * */
  fontSizePx: number;

  /** Display text if true. */
  hasText: boolean;

  /** If supplied then only the tasks in the given range will be displayed. */
  displayRange: DisplayRange | null;

  /** Controls how the `displayRange` is used if supplied. */
  displayRangeUsage: DisplayRangeUsage;

  /** The color theme. */
  colors: Colors;

  /** If true then display times at the top of the chart. */
  hasTimeline: boolean;

  /** If true then draw vertical lines from the timeline down to task start and
   * finish points. */
  drawTimeMarkersOnTasks: boolean;

  /** Draw dependency edges between tasks if true. */
  hasEdges: boolean;

  /** Function that produces display text for a Task and its associated Slack. */
  taskLabel: TaskLabel;

  /** The indices of tasks that should be highlighted when draw, typically used
   * to highlight the critical path. */
  taskHighlights: number[];

  /** Group the tasks together vertically based on the given resource. If the
   * empty string is supplied then just display by topological order.
   */
  groupByResource: string;
}

const verticalArrowStartFeatureFromTaskDuration = (
  task: Task,
  direction: Direction
): Feature => {
  if (task.duration === 0) {
    if (direction === "down") {
      return Feature.verticalArrowStartFromMilestoneBottom;
    }
    return Feature.verticalArrowStartFromMilestoneTop;
  } else {
    return Feature.verticalArrowStart;
  }
};

const verticalArrowDestFeatureFromTaskDuration = (
  task: Task,
  direction: Direction
): Feature => {
  if (task.duration === 0) {
    if (direction === "down") {
      return Feature.verticalArrowDestToMilestoneTop;
    }
    return Feature.verticalArrowDestToMilestoneBottom;
  } else {
    if (direction === "down") {
      return Feature.verticalArrowDestTop;
    }
    return Feature.verticalArrowDestBottom;
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
  spans: Span[],
  opts: RenderOptions,
  maxRows: number
): number {
  return new Scale(
    opts,
    canvas.width,
    spans[spans.length - 1].finish + 1
  ).height(maxRows);
}

// TODO - Pass in max rows, and a mapping that maps from taskIndex to row,
// because two different tasks might be placed on the same row. Also we should
// pass in max rows? Or should that come from the above mapping?
export function renderTasksToCanvas(
  parent: HTMLElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  plan: Plan,
  spans: Span[],
  opts: RenderOptions
): Result<Scale> {
  const vret = validateChart(plan.chart);
  if (!vret.ok) {
    return vret;
  }

  // Highlighted tasks.
  const taskHighlights: Set<number> = new Set(opts.taskHighlights);

  // Calculate how wide we need to make the groupBy column.
  let maxGroupNameLength = 0;
  if (opts.groupByResource !== "" && opts.hasText) {
    maxGroupNameLength = opts.groupByResource.length;
    const resourceDefinition = plan.getResourceDefinition(opts.groupByResource);
    if (resourceDefinition !== undefined) {
      resourceDefinition.values.forEach((value: string) => {
        maxGroupNameLength = Math.max(maxGroupNameLength, value.length);
      });
    }
  }

  const totalNumberOfRows = spans.length;
  const totalNumberOfDays = spans[spans.length - 1].finish;
  const scale = new Scale(
    opts,
    canvas.width,
    totalNumberOfDays + 1,
    maxGroupNameLength
  );

  const taskLineHeight = scale.metric(Metric.taskLineHeight);
  const diamondDiameter = scale.metric(Metric.milestoneDiameter);
  const percentHeight = scale.metric(Metric.percentHeight);
  const arrowHeadHeight = scale.metric(Metric.arrowHeadHeight);
  const arrowHeadWidth = scale.metric(Metric.arrowHeadWidth);
  const daysWithTimeMarkers: Set<number> = new Set();
  const tiret = taskIndexToRowFromGroupBy(opts, plan);
  if (!tiret.ok) {
    return tiret;
  }
  const taskIndexToRow = tiret.value.taskIndexToRow;
  const rowRanges = tiret.value.rowRanges;
  const resourceDefinition = tiret.value.resourceDefinition;

  // Set up canvas basics.
  clearCanvas(ctx, opts, canvas);
  setFontSize(ctx, opts);

  const clipRegion = new Path2D();
  const clipOrigin = scale.feature(0, 0, Feature.tasksClipRectOrigin);
  const clipWidth = canvas.width - clipOrigin.x;
  clipRegion.rect(clipOrigin.x, 0, clipWidth, canvas.height);

  // Draw big red rect over where the clip region will be.
  if (0) {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.stroke(clipRegion);
  }

  ctx.fillStyle = opts.colors.onSurface;
  ctx.strokeStyle = opts.colors.onSurface;

  if (rowRanges !== null) {
    drawSwimLaneHighlights(
      ctx,
      scale,
      rowRanges,
      totalNumberOfDays,
      opts.colors.groupColor
    );

    if (resourceDefinition !== null && opts.hasText) {
      drawSwimLaneLabels(ctx, opts, resourceDefinition, scale, rowRanges);
    }
  }

  ctx.fillStyle = opts.colors.onSurface;
  ctx.strokeStyle = opts.colors.onSurface;

  ctx.save();
  ctx.clip(clipRegion);
  // Draw tasks in their rows.
  plan.chart.Vertices.forEach((task: Task, taskIndex: number) => {
    const row = taskIndexToRow.get(taskIndex)!;
    const span = spans[taskIndex];
    const taskStart = scale.feature(row, span.start, Feature.taskLineStart);
    const taskEnd = scale.feature(row, span.finish, Feature.taskLineStart);

    ctx.fillStyle = opts.colors.onSurfaceMuted;
    ctx.strokeStyle = opts.colors.onSurfaceMuted;

    // Draw in time markers if displayed.
    if (opts.drawTimeMarkersOnTasks) {
      drawTimeMarkerAtDayToTask(
        ctx,
        row,
        span.start,
        task,
        opts,
        scale,
        daysWithTimeMarkers
      );
      drawTimeMarkerAtDayToTask(
        ctx,
        row,
        span.finish,
        task,
        opts,
        scale,
        daysWithTimeMarkers
      );
    }

    if (taskHighlights.has(taskIndex)) {
      ctx.fillStyle = opts.colors.onSurfaceHighlight;
      ctx.strokeStyle = opts.colors.onSurfaceHighlight;
    } else {
      ctx.fillStyle = opts.colors.onSurface;
      ctx.strokeStyle = opts.colors.onSurface;
    }
    if (taskStart.x === taskEnd.x) {
      drawMilestone(ctx, taskStart, diamondDiameter, percentHeight);
    } else {
      drawTaskBar(ctx, taskStart, taskEnd, taskLineHeight);
    }

    // Skip drawing the test of the Start and Finish tasks.
    if (taskIndex !== 0 && taskIndex !== totalNumberOfRows - 1) {
      drawTaskText(ctx, opts, scale, row, span, task, taskIndex, clipWidth);
    }
  });

  ctx.lineWidth = 1;
  ctx.strokeStyle = opts.colors.onSurfaceMuted;

  if (opts.hasEdges) {
    // Now draw all the arrows, i.e. edges.
    plan.chart.Edges.forEach((e: DirectedEdge) => {
      const srcSlack: Span = spans[e.i];
      const dstSlack: Span = spans[e.j];
      const srcTask: Task = plan.chart.Vertices[e.i];
      const dstTask: Task = plan.chart.Vertices[e.j];
      const srcRow = taskIndexToRow.get(e.i)!;
      const dstRow = taskIndexToRow.get(e.j)!;
      const srcDay = srcSlack.finish;
      const dstDay = dstSlack.start;

      drawArrowBetweenTasks(
        ctx,
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
  }

  ctx.restore();

  // Now draw the range highlights if required.
  if (opts.displayRange !== null && opts.displayRangeUsage === "highlight") {
    // Draw a rect over each side that isn't in the range.
    if (opts.displayRange.begin > 0) {
      drawRangeOverlay(
        ctx,
        opts,
        scale,
        0,
        opts.displayRange.begin,
        totalNumberOfRows
      );
    }
    if (opts.displayRange.end < totalNumberOfDays) {
      drawRangeOverlay(
        ctx,
        opts,
        scale,
        opts.displayRange.end,
        totalNumberOfDays + 1,
        totalNumberOfRows
      );
    }
  }

  return ok(scale);
}

function drawRangeOverlay(
  ctx: CanvasRenderingContext2D,
  opts: RenderOptions,
  scale: Scale,
  beginDay: number,
  endDay: number,
  totalNumberOfRows: number
) {
  const topLeft = scale.feature(0, beginDay, Feature.displayRangeTop);
  const bottomRight = scale.feature(
    totalNumberOfRows,
    endDay,
    Feature.taskRowBottom
  );
  ctx.fillStyle = opts.colors.overlay;
  ctx.fillRect(
    topLeft.x,
    topLeft.y,
    bottomRight.x - topLeft.x,
    bottomRight.y - topLeft.y
  );
  console.log("drawRangeOverlay", topLeft, bottomRight);
}

function drawArrowBetweenTasks(
  ctx: CanvasRenderingContext2D,
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
      ctx,
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
      ctx,
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
  ctx.fillStyle = opts.colors.surface;
  ctx.strokeStyle = opts.colors.onSurface;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function setFontSize(ctx: CanvasRenderingContext2D, opts: RenderOptions) {
  ctx.font = `${opts.fontSizePx}px serif`;
}

// Draw L shaped arrow, first going between rows, then going between days.
function drawLShapedArrowToTask(
  ctx: CanvasRenderingContext2D,
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
  ctx.beginPath();
  const direction: Direction = srcRow < dstRow ? "down" : "up";
  const vertLineStart = scale.feature(
    srcRow,
    srcDay,
    verticalArrowStartFeatureFromTaskDuration(srcTask, direction)
  );
  const vertLineEnd = scale.feature(
    dstRow,
    srcDay,
    horizontalArrowDestFeatureFromTaskDuration(dstTask)
  );
  ctx.moveTo(vertLineStart.x + 0.5, vertLineStart.y);
  ctx.lineTo(vertLineStart.x + 0.5, vertLineEnd.y);

  // Draw horizontal part of the "L".
  const horzLineStart = vertLineEnd;
  const horzLineEnd = scale.feature(
    dstRow,
    dstDay,
    horizontalArrowDestFeatureFromTaskDuration(dstTask)
  );
  ctx.moveTo(vertLineStart.x + 0.5, horzLineStart.y);
  ctx.lineTo(horzLineEnd.x + 0.5, horzLineEnd.y);

  // Draw the arrowhead. This arrow head will always point to the right
  // since that's how time flows.
  ctx.moveTo(horzLineEnd.x + 0.5, horzLineEnd.y);
  ctx.lineTo(
    horzLineEnd.x - arrowHeadHeight + 0.5,
    horzLineEnd.y + arrowHeadWidth
  );
  ctx.moveTo(horzLineEnd.x + 0.5, horzLineEnd.y);
  ctx.lineTo(
    horzLineEnd.x - arrowHeadHeight + 0.5,
    horzLineEnd.y - arrowHeadWidth
  );
  ctx.stroke();
}

function drawVerticalArrowToTask(
  ctx: CanvasRenderingContext2D,
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
  const direction: Direction = srcRow < dstRow ? "down" : "up";
  const arrowStart = scale.feature(
    srcRow,
    srcDay,
    verticalArrowStartFeatureFromTaskDuration(srcTask, direction)
  );
  const arrowEnd = scale.feature(
    dstRow,
    dstDay,
    verticalArrowDestFeatureFromTaskDuration(dstTask, direction)
  );

  ctx.beginPath();
  ctx.moveTo(arrowStart.x + 0.5, arrowStart.y);
  ctx.lineTo(arrowEnd.x + 0.5, arrowEnd.y);

  // Draw the arrowhead.
  const deltaY = direction === "down" ? -arrowHeadHeight : arrowHeadHeight;
  ctx.moveTo(arrowEnd.x + 0.5, arrowEnd.y);
  ctx.lineTo(arrowEnd.x - arrowHeadWidth + 0.5, arrowEnd.y + deltaY);
  ctx.moveTo(arrowEnd.x + 0.5, arrowEnd.y);
  ctx.lineTo(arrowEnd.x + arrowHeadWidth + 0.5, arrowEnd.y + deltaY);
  ctx.stroke();
}

function drawTaskText(
  ctx: CanvasRenderingContext2D,
  opts: RenderOptions,
  scale: Scale,
  row: number,
  span: Span,
  task: Task,
  taskIndex: number,
  clipWidth: number
) {
  if (!opts.hasText) {
    return;
  }
  const label = opts.taskLabel(taskIndex);

  let xStartInTime = span.start;
  let xPixelDelta = 0;
  // Determine where on the x-axis to start drawing the task text.
  if (opts.displayRange !== null && opts.displayRangeUsage === "restrict") {
    if (opts.displayRange.in(span.start)) {
      xStartInTime = span.start;
      xPixelDelta = 0;
    } else if (opts.displayRange.in(span.finish)) {
      xStartInTime = span.finish;
      const meas = ctx.measureText(label);
      xPixelDelta = -meas.width - 2 * scale.metric(Metric.textXOffset);
    } else if (
      span.start < opts.displayRange.begin &&
      span.finish > opts.displayRange.end
    ) {
      xStartInTime = opts.displayRange.begin;
      xPixelDelta = clipWidth / 2;
    }
  }
  ctx.lineWidth = 1;
  ctx.fillStyle = opts.colors.onSurface;
  ctx.textBaseline = "top";
  const textStart = scale.feature(row, xStartInTime, Feature.textStart);
  ctx.fillText(
    opts.taskLabel(taskIndex),
    textStart.x + xPixelDelta,
    textStart.y
  );
}

function drawTaskBar(
  ctx: CanvasRenderingContext2D,
  taskStart: Point,
  taskEnd: Point,
  taskLineHeight: number
) {
  ctx.fillRect(
    taskStart.x,
    taskStart.y,
    taskEnd.x - taskStart.x,
    taskLineHeight
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
    verticalArrowDestFeatureFromTaskDuration(task, "down")
  );
  ctx.lineWidth = 1;

  ctx.setLineDash([
    scale.metric(Metric.lineDashLine),
    scale.metric(Metric.lineDashGap),
  ]);
  ctx.moveTo(timeMarkStart.x + 0.5, timeMarkStart.y);
  ctx.lineTo(timeMarkStart.x + 0.5, timeMarkEnd.y);
  ctx.stroke();

  ctx.setLineDash([]);

  ctx.fillStyle = opts.colors.onSurface;
  ctx.textBaseline = "top";
  const textStart = scale.feature(row, day, Feature.timeTextStart);
  if (opts.hasText) {
    ctx.fillText(`${day}`, textStart.x, textStart.y);
  }
};

/** Represents a half-open interval of rows, e.g. [start, finish). */
interface RowRange {
  start: number;
  finish: number;
}

interface TaskIndexToRowReturn {
  taskIndexToRow: TaskIndexToRow;

  /** Maps each resource value index to a range of rows. */
  rowRanges: Map<number, RowRange> | null;

  resourceDefinition: ResourceDefinition | null;
}

const taskIndexToRowFromGroupBy = (
  opts: RenderOptions,
  plan: Plan
): Result<TaskIndexToRowReturn> => {
  const vret = validateChart(plan.chart);
  if (!vret.ok) {
    return vret;
  }
  const topologicalOrder = vret.value;

  const resource = plan.getResourceDefinition(opts.groupByResource);

  // topologicalOrder maps from row to task index, this will produce the inverse mapping.
  const taskIndexToRow = new Map(
    // This looks backwards, but it isn't. Remember that the map callback takes
    // (value, index) as its arguments.
    topologicalOrder.map((taskIndex: number, row: number) => [taskIndex, row])
  );

  if (resource === undefined) {
    return ok({
      taskIndexToRow: taskIndexToRow,
      rowRanges: null,
      resourceDefinition: null,
    });
  }

  const startTaskIndex = 0;
  const finishTaskIndex = plan.chart.Vertices.length - 1;
  const ignorable = [startTaskIndex, finishTaskIndex];

  // Group all tasks by their resource value, while preserving topological
  // order with the groups.
  const groups = new Map<string, number[]>();
  topologicalOrder.forEach((taskIndex: number) => {
    const resourceValue =
      plan.chart.Vertices[taskIndex].getResource(opts.groupByResource) || "";
    const groupMembers = groups.get(resourceValue) || [];
    groupMembers.push(taskIndex);
    groups.set(resourceValue, groupMembers);
  });

  const ret = new Map<number, number>();

  // Ugh, Start and Finish Tasks need to be mapped, but should not be done via
  // resource value, so Start should always be first.
  ret.set(0, 0);

  // Now increment up the rows as we move through all the groups.
  let row = 1;
  // And track how many rows are in each group.
  const rowRanges: Map<number, RowRange> = new Map();
  resource.values.forEach((resourceValue: string, resourceIndex: number) => {
    const startOfRow = row;
    (groups.get(resourceValue) || []).forEach((taskIndex: number) => {
      if (ignorable.includes(taskIndex)) {
        return;
      }
      ret.set(taskIndex, row);
      row++;
    });
    rowRanges.set(resourceIndex, { start: startOfRow, finish: row });
  });
  ret.set(finishTaskIndex, row);

  return ok({
    taskIndexToRow: ret,
    rowRanges: rowRanges,
    resourceDefinition: resource,
  });
};

const drawSwimLaneHighlights = (
  ctx: CanvasRenderingContext2D,
  scale: Scale,
  rowRanges: Map<number, RowRange>,
  totalNumberOfDays: number,
  groupColor: string
) => {
  ctx.fillStyle = groupColor;

  let group = 0;
  rowRanges.forEach((rowRange: RowRange) => {
    const topLeft = scale.feature(
      rowRange.start,
      0,
      Feature.groupEnvelopeStart
    );
    const bottomRight = scale.feature(
      rowRange.finish,
      totalNumberOfDays + 1,
      Feature.taskEnvelopeTop
    );
    group++;
    // Only highlight every other group backgroud with the groupColor.
    if (group % 2 == 1) {
      return;
    }
    ctx.fillRect(
      topLeft.x,
      topLeft.y,
      bottomRight.x - topLeft.x,
      bottomRight.y - topLeft.y
    );
  });
};

const drawSwimLaneLabels = (
  ctx: CanvasRenderingContext2D,
  opts: RenderOptions,
  resourceDefinition: ResourceDefinition,
  scale: Scale,
  rowRanges: Map<number, RowRange>
) => {
  if (rowRanges) ctx.lineWidth = 1;
  ctx.fillStyle = opts.colors.onSurface;
  ctx.textBaseline = "bottom";
  const groupByOrigin = scale.feature(0, 0, Feature.groupByOrigin);

  ctx.fillText(opts.groupByResource, groupByOrigin.x, groupByOrigin.y);

  rowRanges.forEach((rowRange: RowRange, resourceIndex: number) => {
    if (rowRange.start === rowRange.finish) {
      return;
    }
    const middleRow =
      rowRange.start + Math.floor((rowRange.finish - rowRange.start) / 2);
    const textStart = scale.feature(middleRow, 0, Feature.groupTextStart);
    ctx.fillText(
      resourceDefinition.values[resourceIndex],
      textStart.x,
      textStart.y
    );
  });
};
