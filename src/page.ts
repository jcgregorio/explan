import { Task } from "./chart/chart.ts";
import { FilterFunc } from "./chart/filter/filter.ts";
import { DirectedEdge, edgesBySrcAndDstToMap } from "./dag/dag.ts";
import { MetricDefinition } from "./metrics/metrics.ts";
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
  DIVIDER_MOVE_EVENT,
  DividerMove,
  DividerMoveResult,
} from "./renderer/dividermove/dividermove.ts";
import { KDTree } from "./renderer/kd/kd.ts";
import {
  DRAG_RANGE_EVENT,
  DragRange,
  MouseDrag,
} from "./renderer/mousedrag/mousedrag.ts";
import { MouseMove } from "./renderer/mousemove/mousemove.ts";
import { DisplayRange } from "./renderer/range/range.ts";
import {
  RenderOptions,
  RenderResult,
  TaskLabel,
  TaskLocation,
  UpdateHighlightFromMousePos,
  renderTasksToCanvas,
  suggestedCanvasHeight,
} from "./renderer/renderer.ts";
import { Point } from "./renderer/scale/point.ts";
import { Scale } from "./renderer/scale/scale.ts";
import { Result } from "./result.ts";
import { ComputeSlack, CriticalPath, Slack, Span } from "./slack/slack.ts";
import { Jacobian, Uncertainty } from "./stats/cdf/triangular/jacobian.ts";
import { Theme, colorThemeFromElement } from "./style/theme/theme.ts";
import { toggleTheme } from "./style/toggler/toggler.ts";
import { TemplateResult, html, render } from "lit-html";
import { simulation } from "./simulation/simulation.ts";

const FONT_SIZE_PX = 32;

const NUM_SIMULATION_LOOPS = 100;

let plan = new Plan();
const precision = new Precision(2);

const rndInt = (n: number): number => {
  return Math.floor(Math.random() * n);
};

const DURATION = 100;

const rndDuration = (): number => {
  return rndInt(DURATION);
};

const people: string[] = ["Fred", "Barney", "Wilma", "Betty"];

let taskID = 0;
const rndName = (): string => `T ${taskID++}`;

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
for (let i = 0; i < 15; i++) {
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
let radarScale: Scale | null = null;

const radar = document.querySelector<HTMLElement>("#radar")!;
new MouseDrag(radar);

const dragRangeHandler = (e: CustomEvent<DragRange>) => {
  if (radarScale === null) {
    return;
  }
  console.log("mouse", e.detail);
  const begin = radarScale.dayRowFromPoint(e.detail.begin);
  const end = radarScale.dayRowFromPoint(e.detail.end);
  displayRange = new DisplayRange(begin.day, end.day);
  console.log(displayRange);
  paintChart();
};

radar.addEventListener(DRAG_RANGE_EVENT, dragRangeHandler as EventListener);

// Divider dragging.
const explanMain = document.querySelector<HTMLElement>("explan-main")!;
const divider = document.querySelector<HTMLElement>("vertical-divider")!;
new DividerMove(document.body, divider, "column");

const dividerDragRangeHandler = (e: CustomEvent<DividerMoveResult>) => {
  explanMain.style.setProperty(
    "grid-template-columns",
    `calc(${e.detail.before}% - 15px) 10px auto`
  );
  paintChart();
};

document.body.addEventListener(
  DIVIDER_MOVE_EVENT,
  dividerDragRangeHandler as EventListener
);

document.querySelector("#reset-zoom")!.addEventListener("click", () => {
  displayRange = null;
  paintChart();
});

document.querySelector("#dark-mode-toggle")!.addEventListener("click", () => {
  console.log("click");
  toggleTheme();
  paintChart();
});

document.querySelector("#radar-toggle")!.addEventListener("click", () => {
  document.querySelector("radar-parent")!.classList.toggle("hidden");
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

let criticalPathsOnly = false;
const toggleCriticalPathsOnly = () => {
  criticalPathsOnly = !criticalPathsOnly;
};

let focusOnTask = false;
const toggleFocusOnTask = () => {
  focusOnTask = !focusOnTask;
  if (!focusOnTask) {
    displayRange = null;
  }
};

const forceFocusOnTask = () => {
  focusOnTask = true;
};

document
  .querySelector("#critical-paths-toggle")!
  .addEventListener("click", () => {
    toggleCriticalPathsOnly();
    paintChart();
  });

const overlayCanvas = document.querySelector<HTMLCanvasElement>("#overlay")!;
const mm = new MouseMove(overlayCanvas);

let updateHighlightFromMousePos: UpdateHighlightFromMousePos | null = null;

let selectedTask: number = -1;

const selectedTaskPanel: HTMLElement = document.querySelector(
  "selected-task-panel"
)!;

type UpdateSelectedTaskPanel = (taskIndex: number) => void;

// Builds the task panel which then returns a closure used to update the panel
// with info from a specific Task.
const buildSelectedTaskPanel = (): UpdateSelectedTaskPanel => {
  const selectedTaskPanelTemplate = (
    task: Task,
    plan: Plan
  ): TemplateResult => html`
    <table>
      <tr>
        <td>Name</td>
        <td>${task.name}</td>
      </tr>
      ${Object.entries(plan.resourceDefinitions).map(
        ([resourceKey, defn]) =>
          html` <tr>
            <td>
              <label for="${resourceKey}">${resourceKey}</label>
            </td>
            <td>
              <select id="${resourceKey}">
                ${defn.values.map(
                  (resourceValue: string) =>
                    html`<option
                      name=${resourceValue}
                      ?selected=${task.resources[resourceKey] === resourceValue}
                    >
                      ${resourceValue}
                    </option>`
                )}
              </select>
            </td>
          </tr>`
      )}
      ${Object.keys(plan.metricDefinitions).map(
        (key: string) =>
          html` <tr>
            <td><label for="${key}">${key}</label></td>
            <td>
              <input id="${key}" type="number" value="${task.metrics[key]}" />
            </td>
          </tr>`
      )}
    </table>
  `;

  const updateSelectedTaskPanel = (taskIndex: number) => {
    if (taskIndex === -1) {
      render(html`No task selected.`, selectedTaskPanel);
      return;
    }
    const task = plan.chart.Vertices[taskIndex];
    render(selectedTaskPanelTemplate(task, plan), selectedTaskPanel);
  };

  return updateSelectedTaskPanel;
};

const updateSelectedTaskPanel = buildSelectedTaskPanel();

updateSelectedTaskPanel(selectedTask);

const onMouseMove = () => {
  const location = mm.readLocation();
  if (location !== null && updateHighlightFromMousePos !== null) {
    updateHighlightFromMousePos(location, "mousemove");
  }
  window.requestAnimationFrame(onMouseMove);
};
window.requestAnimationFrame(onMouseMove);

overlayCanvas.addEventListener("mousedown", (e: MouseEvent) => {
  const p = new Point(e.offsetX, e.offsetY);
  if (updateHighlightFromMousePos !== null) {
    selectedTask = updateHighlightFromMousePos(p, "mousedown") || -1;
    updateSelectedTaskPanel(selectedTask);
  }
});

overlayCanvas.addEventListener("dblclick", (e: MouseEvent) => {
  const p = new Point(e.offsetX, e.offsetY);
  if (updateHighlightFromMousePos !== null) {
    selectedTask = updateHighlightFromMousePos(p, "mousedown") || -1;
    forceFocusOnTask();
    paintChart();
    updateSelectedTaskPanel(selectedTask);
  }
});

const paintChart = () => {
  console.time("paintChart");

  const themeColors: Theme = colorThemeFromElement(document.body);

  let filterFunc: FilterFunc | null = null;
  const startAndFinish = [0, plan.chart.Vertices.length - 1];
  if (criticalPathsOnly) {
    const highlightSet = new Set(criticalPath);
    filterFunc = (task: Task, taskIndex: number): boolean => {
      if (startAndFinish.includes(taskIndex)) {
        return true;
      }
      return highlightSet.has(taskIndex);
    };
  } else if (focusOnTask && selectedTask != -1) {
    // Find all predecessor and successors of the given task.
    const neighborSet = new Set();
    neighborSet.add(selectedTask);
    let earliestStart = spans[selectedTask].start;
    let latestFinish = spans[selectedTask].finish;
    plan.chart.Edges.forEach((edge: DirectedEdge) => {
      if (edge.i === selectedTask) {
        neighborSet.add(edge.j);
        if (latestFinish < spans[edge.j].finish) {
          latestFinish = spans[edge.j].finish;
        }
      }
      if (edge.j === selectedTask) {
        neighborSet.add(edge.i);
        if (earliestStart > spans[edge.i].start) {
          earliestStart = spans[edge.i].start;
        }
      }
    });
    // TODO - Since we overwrite displayRange that means dragging on the radar
    // will not work when focusing on a selected task. Bug or feature?
    displayRange = new DisplayRange(earliestStart - 1, latestFinish + 1);

    filterFunc = (task: Task, taskIndex: number): boolean => {
      if (startAndFinish.includes(taskIndex)) {
        return true;
      }

      return neighborSet.has(taskIndex);
    };
  }

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
      highlight: themeColors.highlight,
    },
    hasTimeline: false,
    hasTasks: true,
    hasEdges: false,
    drawTimeMarkersOnTasks: false,
    taskLabel: taskLabel,
    taskEmphasize: criticalPath,
    filterFunc: null,
    groupByResource: groupByOptions[groupByOptionsIndex],
    highlightedTask: null,
    selectedTaskIndex: selectedTask,
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
      highlight: themeColors.highlight,
    },
    hasTimeline: topTimeline,
    hasTasks: true,
    hasEdges: true,
    drawTimeMarkersOnTasks: true,
    taskLabel: taskLabel,
    taskEmphasize: criticalPath,
    filterFunc: filterFunc,
    groupByResource: groupByOptions[groupByOptionsIndex],
    highlightedTask: 1,
    selectedTaskIndex: selectedTask,
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
      highlight: themeColors.highlight,
    },
    hasTimeline: true,
    hasTasks: false,
    hasEdges: true,
    drawTimeMarkersOnTasks: true,
    taskLabel: taskLabel,
    taskEmphasize: criticalPath,
    filterFunc: filterFunc,
    groupByResource: groupByOptions[groupByOptionsIndex],
    highlightedTask: null,
    selectedTaskIndex: selectedTask,
  };

  const ret = paintOneChart("#radar", radarOpts);
  if (!ret.ok) {
    return;
  }
  radarScale = ret.value.scale;

  paintOneChart("#timeline", timelineOpts);
  const zoomRet = paintOneChart("#zoomed", zoomOpts, "#overlay");
  if (zoomRet.ok) {
    updateHighlightFromMousePos = zoomRet.value.updateHighlightFromMousePos;
    if (zoomRet.value.selectedTaskLocation !== null) {
      document.querySelector("chart-parent")!.scroll({
        top: zoomRet.value.selectedTaskLocation.y,
        behavior: "smooth",
      });
    }
  }

  console.timeEnd("paintChart");
};

const prepareCanvas = (
  canvas: HTMLCanvasElement,
  canvasWidth: number,
  canvasHeight: number,
  width: number,
  height: number
): CanvasRenderingContext2D => {
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  return ctx;
};

const paintOneChart = (
  canvasID: string,
  opts: RenderOptions,
  overlayID: string = ""
): Result<RenderResult> => {
  const canvas = document.querySelector<HTMLCanvasElement>(canvasID)!;
  const parent = canvas!.parentElement!;
  const ratio = window.devicePixelRatio;
  const width = parent.clientWidth - FONT_SIZE_PX;
  let height = parent.clientHeight;
  const canvasWidth = Math.ceil(width * ratio);
  let canvasHeight = Math.ceil(height * ratio);

  const newHeight = suggestedCanvasHeight(
    canvas,
    spans,
    opts,
    plan.chart.Vertices.length + 2 // TODO - Why do we need the +2 here!?
  );
  canvasHeight = newHeight;
  height = newHeight / window.devicePixelRatio;

  let overlay: HTMLCanvasElement | null = null;
  if (overlayID) {
    overlay = document.querySelector<HTMLCanvasElement>(overlayID)!;
    prepareCanvas(overlay, canvasWidth, canvasHeight, width, height);
  }
  const ctx = prepareCanvas(canvas, canvasWidth, canvasHeight, width, height);

  return renderTasksToCanvas(parent, canvas, ctx, plan, spans, opts, overlay);
};

export interface CriticalPathEntry {
  count: number;
  tasks: number[];
  durations: number[];
}

const onPotentialCriticialPathClick = (
  key: string,
  allCriticalPaths: Map<string, CriticalPathEntry>
) => {
  const criticalPathEntry = allCriticalPaths.get(key)!;
  criticalPathEntry.durations.forEach((duration: number, taskIndex: number) => {
    plan.chart.Vertices[taskIndex].duration = duration;
  });
  recalculateSpan();
  paintChart();
};

const simulate = () => {
  const allCriticalPaths = simulation(plan, NUM_SIMULATION_LOOPS);

  const criticalPathsTemplate = html`
    <ul>
      ${Array.from(allCriticalPaths.entries()).map(
        ([key, value]) =>
          html`<li
            @click=${() => onPotentialCriticialPathClick(key, allCriticalPaths)}
          >
            ${value.count} : ${key}
          </li>`
      )}
    </ul>
  `;

  const critialPaths =
    document.querySelector<HTMLUListElement>("#criticalPaths")!;
  render(criticalPathsTemplate, critialPaths);

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
};

// Populate the download link.
const download = document.querySelector<HTMLLinkElement>("#download")!;
console.log(JSON.stringify(plan, null, "  "));
const downloadBlob = new Blob([JSON.stringify(plan, null, "  ")], {
  type: "application/json",
});
download.href = URL.createObjectURL(downloadBlob);

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
  paintChart();
});

document.querySelector("#simulate")!.addEventListener("click", () => {
  simulate();
  paintChart();
});

paintChart();
window.addEventListener("resize", paintChart);

const focusButton = document
  .querySelector("#focus-on-selected-task")!
  .addEventListener("click", () => {
    toggleFocusOnTask();
    paintChart();
  });
