import { Chart } from "../chart/chart";
import { ResourceDefinitions } from "../resources/resources";

export class Plan {
  chart: Chart;

  resourceDefinitions: ResourceDefinitions = [];

  constructor(chart: Chart) {
    this.chart = chart;
  }
}
