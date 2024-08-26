import { Chart, Task, validateChart } from "../chart/chart";
import { DirectedEdge } from "../dag/dag";
import { Result, ok } from "../result";
import { Slack } from "../slack/slack";
import { Feature, Metric, Scale } from "./scale/scale";

export interface ColorTheme {
  surface: string;
  onSurface: string;
}

export interface DisplayRange {
  begin: number;
  end: number;
}
export interface RenderOptions {
  fontSizePx: number;
  hasText: boolean;
  displaySubRange: DisplayRange | null;
  colorTheme: ColorTheme;
  marginSizePx: number;
  displayTimes: boolean;
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

  ctx.font = `${opts.fontSizePx}px serif`;

  // Clear the canvas.
  ctx.fillStyle = opts.colorTheme.surface;
  ctx.strokeStyle = opts.colorTheme.onSurface;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const taskLineHeight = scale.metric(Metric.taskLineHeight);
  const diamondDiameter = scale.metric(Metric.milestoneDiameter);

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
      // Draw milestone marker as a diamond.
      ctx.beginPath();
      ctx.lineWidth = scale.metric(Metric.percentHeight);
      ctx.lineWidth = 1;
      ctx.moveTo(taskStart.x, taskStart.y - diamondDiameter);
      ctx.lineTo(taskStart.x + diamondDiameter, taskStart.y);
      ctx.lineTo(taskStart.x, taskStart.y + diamondDiameter);
      ctx.lineTo(taskStart.x - diamondDiameter, taskStart.y);
      ctx.closePath();
      ctx.stroke();
    } else {
      // Draw task.
      ctx.lineWidth = scale.metric(Metric.taskLineHeight);
      ctx.fillRect(
        taskStart.x,
        taskStart.y,
        taskEnd.x - taskStart.x,
        taskLineHeight
      );
    }

    ctx.lineWidth = 1;
    ctx.fillStyle = opts.colorTheme.onSurface;
    ctx.textBaseline = "top";
    const textStart = scale.feature(row, slack.earlyStart, Feature.textStart);
    ctx.fillText(task.name, textStart.x, textStart.y);
  });

  ctx.lineWidth = 1;
  ctx.strokeStyle = opts.colorTheme.onSurface;

  // Now draw all the arrows, i.e. edges.

  // Is this taking topoligicalOrder into account?
  chart.Edges.forEach((e: DirectedEdge) => {
    const srcSlack: Slack = slacks[e.i];
    const dstSlack: Slack = slacks[e.j];
    const srcTask: Task = chart.Vertices[e.i];
    const dstTask: Task = chart.Vertices[e.j];
    const srcRow = taskIndexToRow.get(e.i)!;
    const dstRow = taskIndexToRow.get(e.j)!;
    const srcDay = srcSlack.earlyFinish;
    const dstDay = dstSlack.earlyStart;

    const arrowHeadHeight = scale.metric(Metric.arrowHeadHeight);
    const arrowHeadWidth = scale.metric(Metric.arrowHeadWidth);

    if (srcDay === dstDay) {
      // TODO - Once we can present things in an order besides topological sort,
      // e.g. allow grouping into swimlanes by resource, then these arrows might
      // start pointing up, so both the arrow start and arrow head direction
      // might change and need to depend on the direction from srcRow to dstRow.

      // Draw a vertical arrow.
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
      ctx.moveTo(arrowStart.x + 0.5, arrowStart.y);
      ctx.lineTo(arrowEnd.x + 0.5, arrowEnd.y);

      // Draw the arrowhead.
      ctx.moveTo(arrowEnd.x + 0.5, arrowEnd.y);
      ctx.lineTo(
        arrowEnd.x - arrowHeadWidth + 0.5,
        arrowEnd.y - arrowHeadHeight
      );
      ctx.moveTo(arrowEnd.x + 0.5, arrowEnd.y);
      ctx.lineTo(
        arrowEnd.x + arrowHeadWidth + 0.5,
        arrowEnd.y - arrowHeadHeight
      );
    } else {
      // TODO - Once we can present things in an order besides topological sort,
      // e.g. allow grouping into swimlanes by resource, then the vertical
      // section of the "L" might start pointing up, so both the
      // verticalArrowStart and verticalArrowDest locations might change and
      // need to depend on the direction from srcRow to dstRow.

      // Draw L shaped arrow, first going between rows, then going between days.

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
    }
    ctx.stroke();
  });
  return ok(null);
}
