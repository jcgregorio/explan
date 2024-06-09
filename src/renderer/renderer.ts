import { Result, ok, error } from "../result.ts";
import { validate, Chart } from "../chart/chart.ts";
import { Slack } from "../slack/slack.ts";

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
  slack: Slack,
  opts: RenderOptions
): Result<null> {
  const vret = validate(chart);
  if (!vret.ok) {
    return vret;
  }
  const topologicalOrder = vret.value;

  // Figure out how wide the canvas will be in terms of days using the total length of the project.

  // Descend through the topological order drawing task lines in their swim
  // lanes, recording pixel locations for start and end, to be used later when
  // drawing the dependencies among the tasks.

  return ok(null);
}
