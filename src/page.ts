import { Chart, Task } from "./chart/chart.ts";
import {
  ColorTheme,
  RenderOptions,
  renderTasksToCanvas,
} from "./renderer/renderer.ts";
import { ComputeSlack, Slack } from "./slack/slack";

const C: Chart = {
  Vertices: [
    new Task("Start"),
    new Task("A", 10),
    new Task("B", 15),
    new Task("Finish"),
  ],
  Edges: [
    { i: 0, j: 1 },
    { i: 0, j: 2 },
    { i: 1, j: 3 },
    { i: 2, j: 3 },
  ],
};

let slack: Slack[] = [];
const slackResult = ComputeSlack(C);
if (!slackResult.ok) {
  console.error(slackResult);
} else {
  slack = slackResult.value;
}

const canvas = document.querySelector<HTMLCanvasElement>("canvas")!;
const parent = canvas!.parentElement!;
const ctx = canvas.getContext("2d")!;
const colorTheme: ColorTheme = {
  surface: "#fff",
  onSurface: "#000",
};
const opts: RenderOptions = {
  fontSizePx: 12,
  hasText: true,
  displaySubRange: null,
  colorTheme: colorTheme,
  marginSizePx: 10,
};

renderTasksToCanvas(parent, canvas, ctx, C, slack, opts);
