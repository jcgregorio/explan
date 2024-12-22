import { Task } from "../chart/chart.ts";
import { FilterFunc } from "../chart/filter/filter.ts";
import { DirectedEdge, edgesBySrcAndDstToMap } from "../dag/dag.ts";
import { SetMetricValueOp } from "../ops/metrics.ts";
import { Op } from "../ops/ops.ts";
import { SetResourceValueOp } from "../ops/resources.ts";
import { FromJSON, Plan } from "../plan/plan.ts";
import { Precision } from "../precision/precision.ts";
import {
  DIVIDER_MOVE_EVENT,
  DividerMove,
  DividerMoveResult,
} from "../renderer/dividermove/dividermove.ts";
import {
  DRAG_RANGE_EVENT,
  DragRange,
  MouseDrag,
} from "../renderer/mousedrag/mousedrag.ts";
import { MouseMove } from "../renderer/mousemove/mousemove.ts";
import { DisplayRange } from "../renderer/range/range.ts";
import {
  RenderOptions,
  RenderResult,
  TaskLabel,
  UpdateHighlightFromMousePos,
  renderTasksToCanvas,
  suggestedCanvasHeight,
} from "../renderer/renderer.ts";
import { Point } from "../renderer/scale/point.ts";
import { Scale } from "../renderer/scale/scale.ts";
import { Result } from "../result.ts";
import { ComputeSlack, CriticalPath, Slack, Span } from "../slack/slack.ts";
import { Theme, colorThemeFromElement } from "../style/theme/theme.ts";
import { TemplateResult, html, render } from "lit-html";
import {
  CriticalPathTaskEntry,
  criticalTaskFrequencies,
  simulation,
} from "../simulation/simulation.ts";
import { generateRandomPlan } from "../generate/generate.ts";
import { execute, executeOp } from "../action/execute.ts";
import { ActionFromOp } from "../action/action.ts";
import { StartKeyboardHandling } from "../keymap/keymap.ts";
import { DeleteTaskOp, SetTaskNameOp } from "../ops/chart.ts";
import { DependenciesControl } from "../dependencies/dependencies-control.ts";
import {
  allNonPredecessors,
  allNonSuccessors,
  allPredecessors,
  allSuccessors,
} from "../dag/algorithms/circular.ts";

const FONT_SIZE_PX = 32;

const NUM_SIMULATION_LOOPS = 100;

const precision = new Precision(2);

/** Type of function to call when the currently selected task has changed. */
type UpdateSelectedTaskPanel = (taskIndex: number) => void;

interface CriticalPathEntry {
  count: number;
  tasks: number[];
  durations: number[];
}

// Builds the task panel which then returns a closure used to update the panel
// with info from a specific Task.
const buildSelectedTaskPanel = (
  plan: Plan,
  selectedTaskPanel: HTMLElement,
  explanMain: ExplanMain
): UpdateSelectedTaskPanel => {
  const selectedTaskPanelTemplate = (
    task: Task,
    plan: Plan
  ): TemplateResult => html`
    <table>
      <tr>
        <td>Name</td>
        <td>
          <input
            type="text"
            .value="${task.name}"
            @change=${(e: Event) => {
              explanMain.taskNameChanged(
                explanMain.selectedTask,
                (e.target as HTMLInputElement).value
              );
            }}
          />
        </td>
      </tr>
      ${Object.entries(plan.resourceDefinitions).map(
        ([resourceKey, defn]) =>
          html` <tr>
            <td>
              <label for="${resourceKey}">${resourceKey}</label>
            </td>
            <td>
              <select
                id="${resourceKey}"
                @change=${(e: Event) => {
                  const ret = explanMain.taskResourceValueChanged(
                    explanMain.selectedTask,
                    resourceKey,
                    (e.target as HTMLInputElement).value
                  );
                  if (!ret.ok) {
                    // TODO popup error message.
                    console.log(ret);
                    e.preventDefault();
                  }
                }}
              >
                ${defn.values.map(
                  (resourceValue: string) =>
                    html`<option
                      name=${resourceValue}
                      .selected=${task.resources[resourceKey] === resourceValue}
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
              <input
                id="${key}"
                type="number"
                .value="${task.metrics[key]}"
                @change=${(e: Event) => {
                  const ret = explanMain.taskMetricValueChanged(
                    explanMain.selectedTask,
                    key,
                    (e.target as HTMLInputElement).value
                  );
                  if (!ret.ok) {
                    // TODO popup error message.
                    console.log(ret);
                    e.preventDefault();
                  }
                }}
              />
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
    console.log(task);
    render(selectedTaskPanelTemplate(task, plan), selectedTaskPanel);
  };

  return updateSelectedTaskPanel;
};

const criticalPathsTemplate = (
  allCriticalPaths: Map<string, CriticalPathEntry>,
  explanMain: ExplanMain
): TemplateResult => html`
  <ul>
    ${Array.from(allCriticalPaths.entries()).map(
      ([key, value]) =>
        html`<li
          @click=${() =>
            explanMain.onPotentialCriticialPathClick(key, allCriticalPaths)}
        >
          ${value.count} : ${key}
        </li>`
    )}
  </ul>
`;

const criticalTaskFrequenciesTemplate = (
  plan: Plan,
  criticalTasksDurationDescending: CriticalPathTaskEntry[]
) =>
  html`<tr>
      <th>Name</th>
      <th>Duration</th>
      <th>Frequency (%)</th>
    </tr>
    ${criticalTasksDurationDescending.map(
      (taskEntry: CriticalPathTaskEntry) =>
        html`<tr>
          <td>${plan.chart.Vertices[taskEntry.taskIndex].name}</td>
          <td>${taskEntry.duration}</td>
          <td>
            ${Math.floor(
              (100 * taskEntry.numTimesAppeared) / NUM_SIMULATION_LOOPS
            )}
          </td>
        </tr>`
    )} `;

export class ExplanMain extends HTMLElement {
  /** The Plan being edited. */
  plan: Plan = new Plan();

  /** The start and finish time for each Task in the Plan. */
  spans: Span[] = [];

  /** The task indices of tasks on the critical path. */
  criticalPath: number[] = [];

  /** The selection (in time) of the Plan currently being viewed. */
  displayRange: DisplayRange | null = null;

  /** Scale for the radar view, used for drag selecting a displayRange. */
  radarScale: Scale | null = null;

  /** All of the types of resources in the plan. */
  groupByOptions: string[] = [];

  /** Which of the resources are we currently grouping by, where 0 means no
   * grouping is done. */
  groupByOptionsIndex: number = 0;

  /** The currently selected task, as an index. */
  selectedTask: number = -1;

  // UI features that can be toggled on and off.
  topTimeline: boolean = false;
  criticalPathsOnly: boolean = false;
  focusOnTask: boolean = false;
  mouseMove: MouseMove | null = null;

  dependenciesControlPred: DependenciesControl | null = null;
  dependenciesControlSucc: DependenciesControl | null = null;

  /** Callback to call when the selected task changes. */
  updateSelectedTaskPanel: UpdateSelectedTaskPanel | null = null;

  /** Callback to call when a mouse moves over the chart. */
  updateHighlightFromMousePos: UpdateHighlightFromMousePos | null = null;

  connectedCallback() {
    this.dependenciesControlPred = this.querySelector(
      "dependencies-control[data-kind='pred']"
    );
    this.dependenciesControlSucc = this.querySelector(
      "dependencies-control[data-kind='succ']"
    );

    this.plan = generateRandomPlan();
    this.planDefinitionHasBeenChanged();

    // Dragging on the radar.
    const radar = this.querySelector<HTMLElement>("#radar")!;
    new MouseDrag(radar);
    radar.addEventListener(
      DRAG_RANGE_EVENT,
      this.dragRangeHandler.bind(this) as EventListener
    );

    // Divider dragging.
    const divider = this.querySelector<HTMLElement>("vertical-divider")!;
    new DividerMove(document.body, divider, "column");

    document.body.addEventListener(DIVIDER_MOVE_EVENT, ((
      e: CustomEvent<DividerMoveResult>
    ) => {
      this.style.setProperty(
        "grid-template-columns",
        `calc(${e.detail.before}% - 15px) 10px auto`
      );
      this.paintChart();
    }) as EventListener);

    // Buttons
    this.querySelector("#reset-zoom")!.addEventListener("click", () => {
      execute("ResetZoomAction", this);
    });

    this.querySelector("#dark-mode-toggle")!.addEventListener("click", () => {
      execute("ToggleDarkModeAction", this);
    });

    this.querySelector("#radar-toggle")!.addEventListener("click", () => {
      execute("ToggleRadarAction", this);
    });

    this.querySelector("#top-timeline-toggle")!.addEventListener(
      "click",
      () => {
        this.topTimeline = !this.topTimeline;
        this.paintChart();
      }
    );

    this.querySelector("#group-by-toggle")!.addEventListener("click", () => {
      this.toggleGroupBy();
      this.paintChart();
    });

    this.querySelector("#critical-paths-toggle")!.addEventListener(
      "click",
      () => {
        this.toggleCriticalPathsOnly();
        this.paintChart();
      }
    );

    const overlayCanvas = this.querySelector<HTMLCanvasElement>("#overlay")!;
    this.mouseMove = new MouseMove(overlayCanvas);
    window.requestAnimationFrame(this.onMouseMove.bind(this));

    overlayCanvas.addEventListener("mousedown", (e: MouseEvent) => {
      const p = new Point(e.offsetX, e.offsetY);
      if (this.updateHighlightFromMousePos !== null) {
        this.selectedTask =
          this.updateHighlightFromMousePos(p, "mousedown") || -1;
        this.updateTaskPanels(this.selectedTask);
      }
    });

    overlayCanvas.addEventListener("dblclick", (e: MouseEvent) => {
      const p = new Point(e.offsetX, e.offsetY);
      if (this.updateHighlightFromMousePos !== null) {
        this.setFocusOnTask(
          this.updateHighlightFromMousePos(p, "mousedown") || -1
        );
      }
    });

    this.updateSelectedTaskPanel = buildSelectedTaskPanel(
      this.plan,
      this.querySelector("selected-task-panel")!,
      this
    );

    this.updateTaskPanels(this.selectedTask);

    // React to the upload input.
    const fileUpload =
      document.querySelector<HTMLInputElement>("#file-upload")!;
    fileUpload.addEventListener("change", async () => {
      const json = await fileUpload.files![0].text();
      const ret = FromJSON(json);
      if (!ret.ok) {
        throw ret.error;
      }
      this.plan = ret.value;
      this.planDefinitionHasBeenChanged();
      this.paintChart();
    });

    this.querySelector("#simulate")!.addEventListener("click", () => {
      this.simulate();
      this.paintChart();
    });

    this.querySelector("#focus-on-selected-task")!.addEventListener(
      "click",
      () => {
        this.toggleFocusOnTask();
        this.paintChart();
      }
    );

    this.querySelector("#gen-random-plan")!.addEventListener("click", () => {
      this.plan = generateRandomPlan();
      this.planDefinitionHasBeenChanged();
      this.paintChart();
    });

    this.paintChart();
    window.addEventListener("resize", this.paintChart.bind(this));
    StartKeyboardHandling(this);
  }

  updateTaskPanels(taskIndex: number) {
    this.selectedTask = taskIndex;
    this.updateSelectedTaskPanel!(this.selectedTask);
    const edges = edgesBySrcAndDstToMap(this.plan.chart.Edges);
    this.dependenciesControlPred!.setTasksAndIndices(
      this.plan.chart.Vertices,
      (edges.byDst.get(taskIndex) || []).map((e: DirectedEdge) => e.i)
    );
    this.dependenciesControlSucc!.setTasksAndIndices(
      this.plan.chart.Vertices,
      (edges.bySrc.get(taskIndex) || []).map((e: DirectedEdge) => e.j)
    );
  }

  setFocusOnTask(index: number) {
    this.selectedTask = index;
    this.forceFocusOnTask();
    this.paintChart();
    this.updateTaskPanels(this.selectedTask);
  }

  taskResourceValueChanged(
    taskIndex: number,
    resourceKey: string,
    resourceValue: string
  ): Result<null> {
    const op = SetResourceValueOp(resourceKey, resourceValue, taskIndex);
    return executeOp(op, "planDefinitionChanged", true, this);
  }

  taskMetricValueChanged(
    taskIndex: number,
    metricKey: string,
    metricValue: string
  ): Result<null> {
    const op = SetMetricValueOp(metricKey, +metricValue, taskIndex);
    return executeOp(op, "planDefinitionChanged", true, this);
  }

  taskNameChanged(taskIndex: number, name: string): Result<null> {
    const op = SetTaskNameOp(taskIndex, name);
    return executeOp(op, "paintChart", true, this);
  }

  deleteTask(taskIndex: number): Result<null> {
    const op = DeleteTaskOp(taskIndex);
    return executeOp(op, "paintChart", true, this);
  }

  // TODO - Turn this on and off based on mouse entering the canvas area.
  onMouseMove() {
    const location = this.mouseMove!.readLocation();
    if (location !== null && this.updateHighlightFromMousePos !== null) {
      this.updateHighlightFromMousePos(location, "mousemove");
    }
    window.requestAnimationFrame(this.onMouseMove.bind(this));
  }

  planDefinitionHasBeenChanged() {
    this.radarScale = null;
    this.displayRange = null;
    this.groupByOptions = ["", ...Object.keys(this.plan.resourceDefinitions)];
    this.groupByOptionsIndex = 0;
    this.updateSelectedTaskPanel = buildSelectedTaskPanel(
      this.plan,
      this.querySelector("selected-task-panel")!,
      this
    );
    this.recalculateSpansAndCriticalPath();
  }

  recalculateSpansAndCriticalPath() {
    // Populate the download link.
    // TODO - Only do this on demand.
    const download = document.querySelector<HTMLLinkElement>("#download")!;
    const downloadBlob = new Blob([JSON.stringify(this.plan, null, "  ")], {
      type: "application/json",
    });
    download.href = URL.createObjectURL(downloadBlob);

    let slacks: Slack[] = [];

    const slackResult = ComputeSlack(
      this.plan.chart,
      undefined,
      precision.rounder()
    );
    if (!slackResult.ok) {
      console.error(slackResult);
    } else {
      slacks = slackResult.value;
    }

    this.spans = slacks.map((value: Slack): Span => {
      return value.early;
    });
    this.criticalPath = CriticalPath(slacks, precision.rounder());
    this.updateTaskPanels(this.selectedTask);
  }

  getTaskLabeller(): TaskLabel {
    return (taskIndex: number): string =>
      `${this.plan.chart.Vertices[taskIndex].name}`;
  }

  dragRangeHandler(e: CustomEvent<DragRange>) {
    if (this.radarScale === null) {
      return;
    }
    const begin = this.radarScale.dayRowFromPoint(e.detail.begin);
    const end = this.radarScale.dayRowFromPoint(e.detail.end);
    this.displayRange = new DisplayRange(begin.day, end.day);
    this.paintChart();
  }

  toggleRadar() {
    this.querySelector("radar-parent")!.classList.toggle("hidden");
  }

  toggleGroupBy() {
    this.groupByOptionsIndex =
      (this.groupByOptionsIndex + 1) % this.groupByOptions.length;
  }

  toggleCriticalPathsOnly() {
    this.criticalPathsOnly = !this.criticalPathsOnly;
  }

  toggleFocusOnTask() {
    this.focusOnTask = !this.focusOnTask;
    if (!this.focusOnTask) {
      this.displayRange = null;
    }
  }

  forceFocusOnTask() {
    this.focusOnTask = true;
  }

  paintChart() {
    console.time("paintChart");

    const themeColors: Theme = colorThemeFromElement(document.body);

    let filterFunc: FilterFunc | null = null;
    const startAndFinish = [0, this.plan.chart.Vertices.length - 1];
    if (this.criticalPathsOnly) {
      const highlightSet = new Set(this.criticalPath);
      filterFunc = (task: Task, taskIndex: number): boolean => {
        if (startAndFinish.includes(taskIndex)) {
          return true;
        }
        return highlightSet.has(taskIndex);
      };
    } else if (this.focusOnTask && this.selectedTask != -1) {
      // Find all predecessor and successors of the given task.
      const neighborSet = new Set();
      neighborSet.add(this.selectedTask);
      let earliestStart = this.spans[this.selectedTask].start;
      let latestFinish = this.spans[this.selectedTask].finish;
      this.plan.chart.Edges.forEach((edge: DirectedEdge) => {
        if (edge.i === this.selectedTask) {
          neighborSet.add(edge.j);
          if (latestFinish < this.spans[edge.j].finish) {
            latestFinish = this.spans[edge.j].finish;
          }
        }
        if (edge.j === this.selectedTask) {
          neighborSet.add(edge.i);
          if (earliestStart > this.spans[edge.i].start) {
            earliestStart = this.spans[edge.i].start;
          }
        }
      });
      // TODO - Since we overwrite displayRange that means dragging on the radar
      // will not work when focusing on a selected task. Bug or feature?
      this.displayRange = new DisplayRange(earliestStart - 1, latestFinish + 1);

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
      displayRange: this.displayRange,
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
      taskLabel: this.getTaskLabeller(),
      taskEmphasize: this.criticalPath,
      filterFunc: null,
      groupByResource: this.groupByOptions[this.groupByOptionsIndex],
      highlightedTask: null,
      selectedTaskIndex: this.selectedTask,
    };

    const zoomOpts: RenderOptions = {
      fontSizePx: FONT_SIZE_PX,
      hasText: true,
      displayRange: this.displayRange,
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
      hasTimeline: this.topTimeline,
      hasTasks: true,
      hasEdges: true,
      drawTimeMarkersOnTasks: true,
      taskLabel: this.getTaskLabeller(),
      taskEmphasize: this.criticalPath,
      filterFunc: filterFunc,
      groupByResource: this.groupByOptions[this.groupByOptionsIndex],
      highlightedTask: 1,
      selectedTaskIndex: this.selectedTask,
    };

    const timelineOpts: RenderOptions = {
      fontSizePx: FONT_SIZE_PX,
      hasText: true,
      displayRange: this.displayRange,
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
      taskLabel: this.getTaskLabeller(),
      taskEmphasize: this.criticalPath,
      filterFunc: filterFunc,
      groupByResource: this.groupByOptions[this.groupByOptionsIndex],
      highlightedTask: null,
      selectedTaskIndex: this.selectedTask,
    };

    const ret = this.paintOneChart("#radar", radarOpts);
    if (!ret.ok) {
      return;
    }
    this.radarScale = ret.value.scale;

    this.paintOneChart("#timeline", timelineOpts);
    const zoomRet = this.paintOneChart("#zoomed", zoomOpts, "#overlay");
    if (zoomRet.ok) {
      this.updateHighlightFromMousePos =
        zoomRet.value.updateHighlightFromMousePos;
      if (zoomRet.value.selectedTaskLocation !== null) {
        document.querySelector("chart-parent")!.scroll({
          top: zoomRet.value.selectedTaskLocation.y,
          behavior: "smooth",
        });
      }
    }

    console.timeEnd("paintChart");
  }

  prepareCanvas(
    canvas: HTMLCanvasElement,
    canvasWidth: number,
    canvasHeight: number,
    width: number,
    height: number
  ): CanvasRenderingContext2D {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;

    return ctx;
  }

  paintOneChart(
    canvasID: string,
    opts: RenderOptions,
    overlayID: string = ""
  ): Result<RenderResult> {
    const canvas = this.querySelector<HTMLCanvasElement>(canvasID)!;
    const parent = canvas!.parentElement!;
    const ratio = window.devicePixelRatio;
    const width = parent.clientWidth - FONT_SIZE_PX;
    let height = parent.clientHeight;
    const canvasWidth = Math.ceil(width * ratio);
    let canvasHeight = Math.ceil(height * ratio);

    const newHeight = suggestedCanvasHeight(
      canvas,
      this.spans,
      opts,
      this.plan.chart.Vertices.length + 2 // TODO - Why do we need the +2 here!?
    );
    canvasHeight = newHeight;
    height = newHeight / window.devicePixelRatio;

    let overlay: HTMLCanvasElement | null = null;
    if (overlayID) {
      overlay = document.querySelector<HTMLCanvasElement>(overlayID)!;
      this.prepareCanvas(overlay, canvasWidth, canvasHeight, width, height);
    }
    const ctx = this.prepareCanvas(
      canvas,
      canvasWidth,
      canvasHeight,
      width,
      height
    );

    return renderTasksToCanvas(
      parent,
      canvas,
      ctx,
      this.plan,
      this.spans,
      opts,
      overlay
    );
  }

  onPotentialCriticialPathClick(
    key: string,
    allCriticalPaths: Map<string, CriticalPathEntry>
  ) {
    const criticalPathEntry = allCriticalPaths.get(key)!;
    criticalPathEntry.durations.forEach(
      (duration: number, taskIndex: number) => {
        this.plan.chart.Vertices[taskIndex].duration = duration;
      }
    );
    this.recalculateSpansAndCriticalPath();
    this.paintChart();
  }

  simulate() {
    // Run the simulation.
    const allCriticalPaths = simulation(this.plan, NUM_SIMULATION_LOOPS);

    // Display all the potential critical paths found.
    render(
      criticalPathsTemplate(allCriticalPaths, this),
      document.querySelector<HTMLElement>("#criticalPaths")!
    );

    // Find how often each task appears on all the potential critical path.
    const criticalTasksDurationDescending = criticalTaskFrequencies(
      allCriticalPaths,
      this.plan
    );

    // Display a table of tasks on all potential critical paths.
    render(
      criticalTaskFrequenciesTemplate(
        this.plan,
        criticalTasksDurationDescending
      ),
      document.querySelector<HTMLElement>("#criticalTasks")!
    );

    // Reset the spans using the original durations.
    this.recalculateSpansAndCriticalPath();

    // Highlight all the tasks that could appear on the critical path.
    this.criticalPath = criticalTasksDurationDescending.map(
      (taskEntry: CriticalPathTaskEntry) => taskEntry.taskIndex
    );
    this.paintChart();
  }
}

customElements.define("explan-main", ExplanMain);
