import { Chart, validate } from "../chart/chart";
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
}

export function renderTasksToCanvas(
  parent: HTMLElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  chart: Chart,
  slacks: Slack[],
  opts: RenderOptions
): Result<null> {
  const vret = validate(chart);
  if (!vret.ok) {
    return vret;
  }
  const topologicalOrder = vret.value;
  const scale = new Scale(
    opts,
    canvas.width,
    slacks[slacks.length - 1].earlyFinish + 1
  );

  ctx.font = `${opts.fontSizePx}px serif`;
  ctx.fillStyle = opts.colorTheme.surface;
  ctx.strokeStyle = opts.colorTheme.onSurface;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = scale.metric(Metric.taskLineHeight);
  // Descend through the topological order drawing task lines in their swim
  // lanes, recording pixel locations for start and end, to be used later when
  // drawing the dependencies among the tasks.
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
    ctx.moveTo(taskStart.x, taskStart.y);
    ctx.lineTo(taskEnd.x, taskEnd.y);
    ctx.stroke();

    ctx.lineWidth = 1;
    ctx.fillStyle = opts.colorTheme.onSurface;
    ctx.textBaseline = "top";
    const textStart = scale.feature(row, slack.earlyStart, Feature.textStart);
    ctx.fillText(task.name, textStart.x, textStart.y);
  });

  return ok(null);
}
