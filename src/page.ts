import { Task } from "./chart/chart.ts";
import { edgesBySrcAndDstToMap } from "./dag/dag.ts";
import {
  DupTaskOp,
  InsertNewEmptyTaskAfterOp,
  SetTaskNameOp,
  SplitTaskOp,
} from "./ops/chart.ts";
import { SetMetricValueOp } from "./ops/metrics.ts";
import { Op, applyAllOpsToPlan } from "./ops/ops.ts";
import {
  AddResourceOp,
  AddResourceOptionOp,
  SetResourceValueOp,
} from "./ops/resources.ts";
import { FromJSON, Plan } from "./plan/plan.ts";
import { Precision } from "./precision/precision.ts";
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
import { ComputeSlack, CriticalPath, Slack, Span } from "./slack/slack.ts";
import { Jacobian, Uncertainty } from "./stats/cdf/triangular/jacobian.ts";
import { Theme, colorThemeFromElement } from "./style/theme/theme.ts";
import { toggleTheme } from "./style/toggler/toggler.ts";

const FONT_SIZE_PX = 32;

let plan = new Plan();
const precision = new Precision(2);

const rndInt = (n: number): number => {
  return Math.floor(Math.random() * n);
};

const DURATION = 1000;

const rndDuration = (): number => {
  return rndInt(DURATION);
};

const people: string[] = ["Fred", "Barney", "Wilma", "Betty"];

const rndName = (): string => `${String.fromCharCode(65 + rndInt(26))}`;

const ops: Op[] = [AddResourceOp("Person")];

people.forEach((person: string) => {
  ops.push(AddResourceOptionOp("Person", person));
});

ops.push(
  InsertNewEmptyTaskAfterOp(0),
  SetMetricValueOp("Duration", rndDuration(), 1),
  SetTaskNameOp(1, rndName()),
  SetResourceValueOp("Person", people[rndInt(people.length)], 1),
  SetResourceValueOp("Uncertainty", "moderate", 1)
);

let numTasks = 1;
for (let i = 0; i < 20; i++) {
  let index = rndInt(numTasks) + 1;
  ops.push(
    SplitTaskOp(index),
    SetMetricValueOp("Duration", rndDuration(), index + 1),
    SetTaskNameOp(index + 1, rndName()),
    SetResourceValueOp("Person", people[rndInt(people.length)], index + 1),
    SetResourceValueOp("Uncertainty", "moderate", index + 1)
  );
  numTasks++;
  index = rndInt(numTasks) + 1;
  ops.push(
    DupTaskOp(index),
    SetMetricValueOp("Duration", rndDuration(), index + 1),
    SetTaskNameOp(index + 1, rndName()),
    SetResourceValueOp("Person", people[rndInt(people.length)], index + 1),
    SetResourceValueOp("Uncertainty", "moderate", index + 1)
  );
  numTasks++;
}

const res = applyAllOpsToPlan(ops, plan);

if (!res.ok) {
  console.log(res.error);
}

let slacks: Slack[] = [];
let spans: Span[] = [];
let criticalPath: number[] = [];

const recalculateSpan = () => {
  const slackResult = ComputeSlack(plan.chart, undefined, precision.rounder());
  if (!slackResult.ok) {
    console.error(slackResult);
  } else {
    slacks = slackResult.value;
  }

  spans = slacks.map((value: Slack): Span => {
    return value.early;
  });
  criticalPath = CriticalPath(slacks, precision.rounder());
};

recalculateSpan();

const taskLabel: TaskLabel = (taskIndex: number): string =>
  `${plan.chart.Vertices[taskIndex].name}`;
//  `${plan.chart.Vertices[taskIndex].name} (${plan.chart.Vertices[taskIndex].resources["Person"]}) `;

// TODO Extract this as a helper for the radar view.
let displayRange: DisplayRange | null = null;
let scale: Scale | null = null;

const radar = document.querySelector<HTMLElement>("#radar")!;
new MouseMove(radar);

const dragRangeHandler = (e: CustomEvent<DragRange>) => {
  if (scale === null) {
    return;
  }
  console.log("mouse", e.detail);
  const begin = scale.dayRowFromPoint(e.detail.begin);
  const end = scale.dayRowFromPoint(e.detail.end);
  displayRange = new DisplayRange(begin.day, end.day);
  console.log(displayRange);
  paintChart();
};

radar.addEventListener(DRAG_RANGE_EVENT, dragRangeHandler as EventListener);

document.querySelector("#dark-mode-toggle")!.addEventListener("click", () => {
  console.log("click");
  toggleTheme();
  paintChart();
});

document.querySelector("#radar-toggle")!.addEventListener("click", () => {
  document.querySelector("#radar-parent")!.classList.toggle("hidden");
});

let topTimeline: boolean = false;

document
  .querySelector("#top-timeline-toggle")!
  .addEventListener("click", () => {
    topTimeline = !topTimeline;
    paintChart();
  });

let groupByOptions: string[] = ["", ...Object.keys(plan.resourceDefinitions)];
let groupByOptionsIndex: number = 0;

const toggleGroupBy = () => {
  groupByOptionsIndex = (groupByOptionsIndex + 1) % groupByOptions.length;
};

document.querySelector("#group-by-toggle")!.addEventListener("click", () => {
  toggleGroupBy();
  paintChart();
});

const paintChart = () => {
  console.time("paintChart");

  const themeColors: Theme = colorThemeFromElement(document.body);

  const radarOpts: RenderOptions = {
    fontSizePx: 6,
    hasText: false,
    displayRange: displayRange,
    displayRangeUsage: "highlight",
    colors: {
      surface: themeColors.surface,
      onSurface: themeColors.onSurface,
      onSurfaceMuted: themeColors.onSurfaceMuted,
      onSurfaceHighlight: themeColors.onSurfaceSecondary,
      overlay: themeColors.overlay,
      groupColor: themeColors.groupColor,
    },
    hasTimeline: false,
    hasTasks: true,
    hasEdges: false,
    drawTimeMarkersOnTasks: false,
    taskLabel: taskLabel,
    taskHighlights: criticalPath,
    groupByResource: groupByOptions[groupByOptionsIndex],
  };

  const zoomOpts: RenderOptions = {
    fontSizePx: FONT_SIZE_PX,
    hasText: true,
    displayRange: displayRange,
    displayRangeUsage: "restrict",
    colors: {
      surface: themeColors.surface,
      onSurface: themeColors.onSurface,
      onSurfaceMuted: themeColors.onSurfaceMuted,
      onSurfaceHighlight: themeColors.onSurfaceSecondary,
      overlay: themeColors.overlay,
      groupColor: themeColors.groupColor,
    },
    hasTimeline: topTimeline,
    hasTasks: true,
    hasEdges: true,
    drawTimeMarkersOnTasks: true,
    taskLabel: taskLabel,
    taskHighlights: criticalPath,
    groupByResource: groupByOptions[groupByOptionsIndex],
  };

  const timelineOpts: RenderOptions = {
    fontSizePx: FONT_SIZE_PX,
    hasText: true,
    displayRange: displayRange,
    displayRangeUsage: "restrict",
    colors: {
      surface: themeColors.surface,
      onSurface: themeColors.onSurface,
      onSurfaceMuted: themeColors.onSurfaceMuted,
      onSurfaceHighlight: themeColors.onSurfaceSecondary,
      overlay: themeColors.overlay,
      groupColor: themeColors.groupColor,
    },
    hasTimeline: true,
    hasTasks: false,
    hasEdges: true,
    drawTimeMarkersOnTasks: true,
    taskLabel: taskLabel,
    taskHighlights: criticalPath,
    groupByResource: groupByOptions[groupByOptionsIndex],
  };

  paintOneChart("#zoomed", zoomOpts);
  paintOneChart("#timeline", timelineOpts);
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

  return renderTasksToCanvas(parent, canvas, ctx, plan, spans, opts);
};

export interface CriticalPathEntry {
  count: number;
  tasks: number[];
  durations: number[];
}

const simulate = () => {
  // Simulate the uncertainty in the plan and generate possible alternate
  // critical paths.
  const MAX_RANDOM = 1000;
  const NUM_SIMULATION_LOOPS = 100;

  const allCriticalPaths = new Map<string, CriticalPathEntry>();

  for (let i = 0; i < NUM_SIMULATION_LOOPS; i++) {
    const durations = plan.chart.Vertices.map((t: Task) => {
      const rawDuration = new Jacobian(
        t.duration,
        t.getResource("Uncertainty") as Uncertainty
      ).sample(rndInt(MAX_RANDOM) / MAX_RANDOM);
      return precision.round(rawDuration);
    });

    const slacksRet = ComputeSlack(
      plan.chart,
      (t: Task, taskIndex: number) => durations[taskIndex],
      precision.rounder()
    );
    if (!slacksRet.ok) {
      throw slacksRet.error;
    }
    const criticalPath = CriticalPath(slacksRet.value, precision.rounder());
    const criticalPathAsString = `${criticalPath}`;
    let pathEntry = allCriticalPaths.get(criticalPathAsString);
    if (pathEntry === undefined) {
      pathEntry = {
        count: 0,
        tasks: criticalPath,
        durations: durations,
      };
      allCriticalPaths.set(criticalPathAsString, pathEntry);
    }
    pathEntry.count++;
  }

  let display = "";
  allCriticalPaths.forEach((value: CriticalPathEntry, key: string) => {
    display =
      display +
      `\n <li data-key=${key}>${value.count} : ${key} : ${value.durations.join(", ")}</li>`;
  });

  const critialPaths =
    document.querySelector<HTMLUListElement>("#criticalPaths")!;
  critialPaths.innerHTML = display;

  // Enable clicking on alternate critical paths.
  critialPaths.addEventListener("click", (e: MouseEvent) => {
    const criticalPathEntry = allCriticalPaths.get(
      (e.target as HTMLLIElement).dataset.key!
    )!;
    criticalPathEntry.durations.forEach(
      (duration: number, taskIndex: number) => {
        plan.chart.Vertices[taskIndex].duration = duration;
      }
    );
    recalculateSpan();
    paintChart();
  });

  // Generate a table of tasks on the critical path, sorted by duration, along
  // with their percentage chance of appearing on the critical path.

  interface CriticalPathTaskEntry {
    taskIndex: number;
    duration: number;
    numTimesAppeared: number;
  }

  const critialTasks: Map<number, CriticalPathTaskEntry> = new Map();

  allCriticalPaths.forEach((value: CriticalPathEntry) => {
    value.tasks.forEach((taskIndex: number) => {
      let taskEntry = critialTasks.get(taskIndex);
      if (taskEntry === undefined) {
        taskEntry = {
          taskIndex: taskIndex,
          duration: plan.chart.Vertices[taskIndex].duration,
          numTimesAppeared: 0,
        };
        critialTasks.set(taskIndex, taskEntry);
      }
      taskEntry.numTimesAppeared += value.count;
    });
  });

  const criticalTasksDurationDescending = [...critialTasks.values()].sort(
    (a: CriticalPathTaskEntry, b: CriticalPathTaskEntry): number => {
      return b.duration - a.duration;
    }
  );

  let critialTasksTable = criticalTasksDurationDescending
    .map(
      (taskEntry: CriticalPathTaskEntry) => `<tr>
  <td>${plan.chart.Vertices[taskEntry.taskIndex].name}</td>
  <td>${taskEntry.duration}</td>
  <td>${Math.floor((100 * taskEntry.numTimesAppeared) / NUM_SIMULATION_LOOPS)}</td>
</tr>`
    )
    .join("\n");
  critialTasksTable =
    `<tr><th>Name</th><th>Duration</th><th>%</th></tr>\n` + critialTasksTable;
  document.querySelector("#criticalTasks")!.innerHTML = critialTasksTable;

  // Show all tasks that could be on the critical path.

  recalculateSpan();
  criticalPath = criticalTasksDurationDescending.map(
    (taskEntry: CriticalPathTaskEntry) => taskEntry.taskIndex
  );
  paintChart();

  // Populate the download link.

  const download = document.querySelector<HTMLLinkElement>("#download")!;
  console.log(JSON.stringify(plan, null, "  "));
  const downloadBlob = new Blob([JSON.stringify(plan, null, "  ")], {
    type: "application/json",
  });
  download.href = URL.createObjectURL(downloadBlob);
};

// React to the upload input.
const fileUpload = document.querySelector<HTMLInputElement>("#file-upload")!;
fileUpload.addEventListener("change", async () => {
  const json = await fileUpload.files![0].text();
  const ret = FromJSON(json);
  if (!ret.ok) {
    console.log(ret.error);
    throw ret.error;
  }
  plan = ret.value;
  groupByOptions = ["", ...Object.keys(plan.resourceDefinitions)];
  recalculateSpan();
  simulate();
  const maps = edgesBySrcAndDstToMap(plan.chart.Edges);
  console.log(maps);
  console.log(plan);
  paintChart();
});

simulate();
paintChart();
window.addEventListener("resize", paintChart);
