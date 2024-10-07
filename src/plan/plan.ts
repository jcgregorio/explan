import {
  Chart,
  ChartSerialized,
  Task,
  TaskSerialized,
} from "../chart/chart.ts";
import { DirectedEdge, DirectedEdgeSerialized } from "../dag/dag.ts";
import { MetricDefinition, MetricDefinitions } from "../metrics/metrics.ts";
import { MetricRange } from "../metrics/range.ts";
import {
  AddEdgeOp,
  InsertNewEmptyTaskAfterOp,
  RationalizeEdgesOp,
  SetTaskNameOp,
  SetTaskStateOp,
} from "../ops/chart.ts";
import { AddMetricOp, SetMetricValueOp } from "../ops/metrics.ts";
import { Op, applyAllOpsToPlan } from "../ops/ops.ts";
import {
  AddResourceOp,
  AddResourceOptionOp,
  SetResourceValueOp,
} from "../ops/resources.ts";
import {
  ResourceDefinition,
  ResourceDefinitions,
} from "../resources/resources.ts";
import { Result, ok } from "../result.ts";
import { UncertaintyToNum } from "../stats/cdf/triangular/jacobian.ts";

export type StaticMetricKeys = "Duration" | "Percent Complete";

export const StaticMetricDefinitions: MetricDefinitions = {
  // How long a task will take, in days.
  Duration: new MetricDefinition(0, new MetricRange(), true),
  // The percent complete for a task.
  Percent: new MetricDefinition(0, new MetricRange(0, 100), true),
};

export const StaticResourceDefinitions: ResourceDefinitions = {
  Uncertainty: {
    values: Object.keys(UncertaintyToNum),
    isStatic: true,
  },
};

export interface PlanSerialized {
  chart: ChartSerialized;
  resourceDefinitions: ResourceDefinitions;
  metricDefinitions: MetricDefinitions;
}

export class Plan {
  chart: Chart;

  resourceDefinitions: ResourceDefinitions;

  metricDefinitions: MetricDefinitions;

  constructor() {
    this.chart = new Chart();

    this.resourceDefinitions = Object.assign({}, StaticResourceDefinitions);
    this.metricDefinitions = Object.assign({}, StaticMetricDefinitions);
    this.applyMetricsAndResourcesToVertices();
  }

  applyMetricsAndResourcesToVertices() {
    Object.keys(this.metricDefinitions).forEach((metricName: string) => {
      const md = this.metricDefinitions[metricName]!;
      this.chart.Vertices.forEach((task: Task) => {
        task.setMetric(metricName, md.default);
      });
    });
    Object.entries(this.resourceDefinitions).forEach(
      ([key, resourceDefinition]) => {
        this.chart.Vertices.forEach((task: Task) => {
          task.setResource(key, resourceDefinition.values[0]);
        });
      }
    );
  }

  toJSON(): PlanSerialized {
    return {
      chart: this.chart.toJSON(),
      resourceDefinitions: Object.fromEntries(
        Object.entries(this.resourceDefinitions).filter(
          ([key, resourceDefinition]) => !resourceDefinition.isStatic
        )
      ),
      metricDefinitions: Object.fromEntries(
        Object.entries(this.metricDefinitions).filter(
          ([key, metricDefinition]) => !metricDefinition.isStatic
        )
      ),
    };
  }

  getMetricDefinition(key: string): MetricDefinition | undefined {
    return this.metricDefinitions[key];
  }

  setMetricDefinition(key: string, metricDefinition: MetricDefinition) {
    this.metricDefinitions[key] = metricDefinition;
  }

  deleteMetricDefinition(key: string) {
    delete this.metricDefinitions[key];
  }

  getResourceDefinition(key: string): ResourceDefinition | undefined {
    return this.resourceDefinitions[key];
  }

  setResourceDefinition(key: string, value: ResourceDefinition) {
    this.resourceDefinitions[key] = value;
  }

  deleteResourceDefinition(key: string) {
    delete this.resourceDefinitions[key];
  }

  // Returns a new Task with defaults for all metrics and resources.
  newTask(): Task {
    const ret = new Task();
    Object.keys(this.metricDefinitions).forEach((metricName: string) => {
      const md = this.getMetricDefinition(metricName)!;

      ret.setMetric(metricName, md.default);
    });
    Object.entries(this.resourceDefinitions).forEach(
      ([key, resourceDefinition]) => {
        ret.setResource(key, resourceDefinition.values[0]);
      }
    );
    return ret;
  }
}

export const FromJSON = (text: string): Result<Plan> => {
  const planSerialized: PlanSerialized = JSON.parse(text);
  const plan = new Plan();

  let ops: Op[][] = [];

  plan.resourceDefinitions = Object.assign(
    plan.resourceDefinitions,
    planSerialized.resourceDefinitions
  );
  plan.metricDefinitions = Object.assign(
    plan.metricDefinitions,
    planSerialized.metricDefinitions
  );
  plan.applyMetricsAndResourcesToVertices();

  // Now add in all the Tasks and Edges via Ops, but make sure to skip the Start
  // and Finish tasks.
  const startAndFinishIndices: number[] = [
    0,
    planSerialized.chart.vertices.length - 1,
  ];
  const startAndFinishTaskNames: string[] = ["Start", "Finish"];
  ops.push(
    ...planSerialized.chart.vertices.map(
      (taskSerialized: TaskSerialized, taskIndex: number): Op[] => {
        // Test for both because some imports might be externally generated and
        // not know about Start and Finish.
        if (
          startAndFinishIndices.includes(taskIndex) &&
          startAndFinishTaskNames.includes(taskSerialized.name)
        ) {
          return [];
        }
        const ret: Op[] = [
          InsertNewEmptyTaskAfterOp(0),
          SetTaskNameOp(1, taskSerialized.name),
          SetTaskStateOp(1, taskSerialized.state),
        ];

        const metricOps = Object.entries(taskSerialized.metrics).map(
          ([metricName, metricValue]): Op[] => {
            return [SetMetricValueOp(metricName, metricValue, 1)];
          }
        );
        const resourceOps = Object.entries(taskSerialized.resources).map(
          ([resourceName, resourceValue]): Op[] => {
            return [SetResourceValueOp(resourceName, resourceValue, 1)];
          }
        );
        return ret.concat(...metricOps, ...resourceOps);
      }
    )
  );

  // Now add in all the Edges via Ops.
  ops.push(
    planSerialized.chart.edges.map((e: DirectedEdgeSerialized): Op => {
      return AddEdgeOp(e.i, e.j);
    })
  );

  applyAllOpsToPlan(ops.flat(), plan);

  const ret = RationalizeEdgesOp().apply(plan);
  if (!ret.ok) {
    return ret;
  }
  return ok(ret.value.plan);
};
