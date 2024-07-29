import { Chart, Task } from "./chart/chart.ts";
import {
  ColorTheme,
  RenderOptions,
  renderTasksToCanvas,
} from "./renderer/renderer.ts";
import { ComputeSlack, Slack } from "./slack/slack";


const taskA = new Task("Task A");
taskA.duration = 10;

const taskB = new Task("Task B");
taskB.duration = 15;

const milestone1 = new Task("Milestone 1");
milestone1.duration = 0;

const taskC = new Task("Task C");
taskC.duration = 3;

const C: Chart = {
  Vertices: [
    new Task("Start"),
    taskA,
    taskB,
    milestone1,
    taskC,
    new Task("Finish"),
  ],
  Edges: [
    { i: 0, j: 1 },
    { i: 0, j: 2 },
    { i: 1, j: 3 },
    { i: 2, j: 3 },
    { i: 3, j: 4 },
    { i: 4, j: 5 },
  ],
};

let slack: Slack[] = [];
const slackResult = ComputeSlack(C);
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

  renderTasksToCanvas(parent, canvas, ctx, C, slack, opts);
};

paintChart();

window.addEventListener("resize", paintChart);
