"use strict";
(() => {
  // src/result.ts
  function ok(value) {
    return { ok: true, value };
  }
  function error(value) {
    if (typeof value === "string") {
      return { ok: false, error: new Error(value) };
    }
    return { ok: false, error: value };
  }

  // src/dag/dag.ts
  var DirectedEdge = class {
    i = 0;
    j = 0;
    constructor(i, j) {
      this.i = i;
      this.j = j;
    }
    equal(rhs) {
      return rhs.i === this.i && rhs.j === this.j;
    }
  };
  var edgesBySrcToMap = (edges) => {
    const ret = /* @__PURE__ */ new Map();
    edges.forEach((e) => {
      const arr = ret.get(e.i) || [];
      arr.push(e);
      ret.set(e.i, arr);
    });
    return ret;
  };
  var edgesByDstToMap = (edges) => {
    const ret = /* @__PURE__ */ new Map();
    edges.forEach((e) => {
      const arr = ret.get(e.j) || [];
      arr.push(e);
      ret.set(e.j, arr);
    });
    return ret;
  };
  var edgesBySrcAndDstToMap = (edges) => {
    const ret = {
      bySrc: /* @__PURE__ */ new Map(),
      byDst: /* @__PURE__ */ new Map()
    };
    edges.forEach((e) => {
      let arr = ret.bySrc.get(e.i) || [];
      arr.push(e);
      ret.bySrc.set(e.i, arr);
      arr = ret.byDst.get(e.j) || [];
      arr.push(e);
      ret.byDst.set(e.j, arr);
    });
    return ret;
  };

  // src/dag/algorithms/toposort.ts
  var topologicalSort = (g) => {
    const ret = {
      hasCycles: false,
      cycle: [],
      order: []
    };
    const edgeMap = edgesBySrcToMap(g.Edges);
    const nodesWithoutPermanentMark = /* @__PURE__ */ new Set();
    g.Vertices.forEach(
      (_, index) => nodesWithoutPermanentMark.add(index)
    );
    const hasPermanentMark = (index) => {
      return !nodesWithoutPermanentMark.has(index);
    };
    const temporaryMark = /* @__PURE__ */ new Set();
    const visit = (index) => {
      if (hasPermanentMark(index)) {
        return true;
      }
      if (temporaryMark.has(index)) {
        return false;
      }
      temporaryMark.add(index);
      const nextEdges = edgeMap.get(index);
      if (nextEdges !== void 0) {
        for (let i = 0; i < nextEdges.length; i++) {
          const e = nextEdges[i];
          if (!visit(e.j)) {
            return false;
          }
        }
      }
      temporaryMark.delete(index);
      nodesWithoutPermanentMark.delete(index);
      ret.order.unshift(index);
      return true;
    };
    const ok2 = visit(0);
    if (!ok2) {
      ret.hasCycles = true;
      ret.cycle = [...temporaryMark.keys()];
    }
    return ret;
  };

  // src/chart/chart.ts
  var DEFAULT_TASK_NAME = "Task Name";
  var Task = class _Task {
    constructor(name = "") {
      this.name = name || DEFAULT_TASK_NAME;
      this.metrics = /* @__PURE__ */ new Map();
      this.resources = {};
    }
    // Resource keys and values. The parent plan contains all the resource
    // definitions.
    // Should resources also have a ResourcesContainer?
    resources;
    metrics;
    name;
    state = "unstarted";
    // Recorded as the number of days from the Start Milestone.
    actualStart = 0;
    actualFinish = 0;
    get duration() {
      return this.metrics.get("Duration");
    }
    get percent() {
      return this.metrics.get("Percent");
    }
    dup() {
      const ret = new _Task();
      ret.resources = Object.assign({}, this.resources);
      ret.metrics = new Map(this.metrics);
      ret.name = this.name;
      ret.state = this.state;
      ret.actualFinish = this.actualFinish;
      ret.actualStart = this.actualStart;
      return ret;
    }
  };
  var Chart = class {
    Vertices;
    Edges;
    constructor() {
      const start = new Task("Start");
      start.metrics.set("Duration", 0);
      const finish = new Task("Finish");
      finish.metrics.set("Duration", 0);
      this.Vertices = [start, finish];
      this.Edges = [new DirectedEdge(0, 1)];
    }
  };
  function validateChart(g) {
    if (g.Vertices.length < 2) {
      return error(
        "Chart must contain at least two node, the start and finish tasks."
      );
    }
    const edgesByDst = edgesByDstToMap(g.Edges);
    const edgesBySrc = edgesBySrcToMap(g.Edges);
    if (edgesByDst.get(0) !== void 0) {
      return error("The start node (0) has an incoming edge.");
    }
    for (let i = 1; i < g.Vertices.length; i++) {
      if (edgesByDst.get(i) === void 0) {
        return error(
          `Found node that isn't (0) that has no incoming edges: ${i}`
        );
      }
    }
    if (edgesBySrc.get(g.Vertices.length - 1) !== void 0) {
      return error(
        "The last node, which should be the Finish Milestone, has an outgoing edge."
      );
    }
    for (let i = 0; i < g.Vertices.length - 1; i++) {
      if (edgesBySrc.get(i) === void 0) {
        return error(
          `Found node that isn't T_finish that has no outgoing edges: ${i}`
        );
      }
    }
    const numVertices = g.Vertices.length;
    for (let i = 0; i < g.Edges.length; i++) {
      const element = g.Edges[i];
      if (element.i < 0 || element.i >= numVertices || element.j < 0 || element.j >= numVertices) {
        return error(`Edge ${element} points to a non-existent Vertex.`);
      }
    }
    const tsRet = topologicalSort(g);
    if (tsRet.hasCycles) {
      return error(`Chart has cycle: ${[...tsRet.cycle].join(", ")}`);
    }
    return ok(tsRet.order);
  }
  function ChartValidate(c) {
    const ret = validateChart(c);
    if (!ret.ok) {
      return ret;
    }
    if (c.Vertices[0].duration !== 0) {
      return error(
        `Start Milestone must have duration of 0, instead got ${c.Vertices[0].duration}`
      );
    }
    if (c.Vertices[c.Vertices.length - 1].duration !== 0) {
      return error(
        `Finish Milestone must have duration of 0, instead got ${c.Vertices[c.Vertices.length - 1].duration}`
      );
    }
    return ret;
  }

  // src/ops/ops.ts
  var Op = class _Op {
    subOps = [];
    constructor(subOps) {
      this.subOps = subOps;
    }
    // Reverts all SubOps up to the given index.
    applyAllInverseSubOpsToPlan(plan2, inverseSubOps) {
      for (let i = 0; i < inverseSubOps.length; i++) {
        const e = inverseSubOps[i].apply(plan2);
        if (!e.ok) {
          return e;
        }
        plan2 = e.value.plan;
      }
      return ok(plan2);
    }
    // Applies the Op to a Plan.
    apply(plan2) {
      const inverseSubOps = [];
      for (let i = 0; i < this.subOps.length; i++) {
        const e = this.subOps[i].apply(plan2);
        if (!e.ok) {
          const revertErr = this.applyAllInverseSubOpsToPlan(plan2, inverseSubOps);
          if (!revertErr.ok) {
            return revertErr;
          }
          return e;
        }
        plan2 = e.value.plan;
        inverseSubOps.unshift(e.value.inverse);
      }
      return ok({
        plan: plan2,
        inverse: new _Op(inverseSubOps)
      });
    }
  };
  var applyAllInverseOpsToPlan = (inverses, plan2) => {
    for (let i = 0; i < inverses.length; i++) {
      const res2 = inverses[i].apply(plan2);
      if (!res2.ok) {
        return res2;
      }
      plan2 = res2.value.plan;
    }
    return ok(plan2);
  };
  var applyAllOpsToPlan = (ops2, plan2) => {
    const inverses = [];
    for (let i = 0; i < ops2.length; i++) {
      const res2 = ops2[i].apply(plan2);
      if (!res2.ok) {
        const inverseRes = applyAllInverseOpsToPlan(inverses, plan2);
        if (!inverseRes.ok) {
          return inverseRes;
        }
        return res2;
      }
      inverses.unshift(res2.value.inverse);
      plan2 = res2.value.plan;
    }
    return ok({
      ops: inverses,
      plan: plan2
    });
  };

  // src/ops/chart.ts
  function DirectedEdgeForPlan(i, j, plan2) {
    const chart = plan2.chart;
    if (j === -1) {
      j = chart.Vertices.length - 1;
    }
    if (i < 0 || i >= chart.Vertices.length) {
      return error(
        `i index out of range: ${i} not in [0, ${chart.Vertices.length - 1}]`
      );
    }
    if (j < 0 || j >= chart.Vertices.length) {
      return error(
        `j index out of range: ${j} not in [0, ${chart.Vertices.length - 1}]`
      );
    }
    if (i === j) {
      return error(`A Task can not depend on itself: ${i} === ${j}`);
    }
    return ok(new DirectedEdge(i, j));
  }
  var AddEdgeSubOp = class {
    i = 0;
    j = 0;
    constructor(i, j) {
      this.i = i;
      this.j = j;
    }
    apply(plan2) {
      if (this.i === -1) {
        this.i = plan2.chart.Vertices.length - 1;
      }
      if (this.j === -1) {
        this.j = plan2.chart.Vertices.length - 1;
      }
      const e = DirectedEdgeForPlan(this.i, this.j, plan2);
      if (!e.ok) {
        return e;
      }
      if (!plan2.chart.Edges.find((value) => value.equal(e.value))) {
        plan2.chart.Edges.push(e.value);
      }
      return ok({
        plan: plan2,
        inverse: this.inverse()
      });
    }
    inverse() {
      return new RemoveEdgeSupOp(this.i, this.j);
    }
  };
  var RemoveEdgeSupOp = class {
    i = 0;
    j = 0;
    constructor(i, j) {
      this.i = i;
      this.j = j;
    }
    apply(plan2) {
      if (this.i === -1) {
        this.i = plan2.chart.Vertices.length - 1;
      }
      if (this.j === -1) {
        this.j = plan2.chart.Vertices.length - 1;
      }
      const e = DirectedEdgeForPlan(this.i, this.j, plan2);
      if (!e.ok) {
        return e;
      }
      plan2.chart.Edges = plan2.chart.Edges.filter(
        (v) => !v.equal(e.value)
      );
      return ok({
        plan: plan2,
        inverse: this.inverse()
      });
    }
    inverse() {
      return new AddEdgeSubOp(this.i, this.j);
    }
  };
  function indexInRangeForVertices(index, chart) {
    if (index < 0 || index > chart.Vertices.length - 2) {
      return error(`${index} is not in range [0, ${chart.Vertices.length - 2}]`);
    }
    return ok(null);
  }
  var AddTaskAfterSubOp = class {
    index = 0;
    constructor(index) {
      this.index = index;
    }
    apply(plan2) {
      const chart = plan2.chart;
      const ret = indexInRangeForVertices(this.index, chart);
      if (!ret.ok) {
        return ret;
      }
      plan2.chart.Vertices.splice(this.index + 1, 0, plan2.newTask());
      for (let i = 0; i < chart.Edges.length; i++) {
        const edge = chart.Edges[i];
        if (edge.i >= this.index + 1) {
          edge.i++;
        }
        if (edge.j >= this.index + 1) {
          edge.j++;
        }
      }
      return ok({ plan: plan2, inverse: this.inverse() });
    }
    inverse() {
      return new DeleteTaskSubOp(this.index + 1);
    }
  };
  var DeleteTaskSubOp = class {
    index = 0;
    constructor(index) {
      this.index = index;
    }
    apply(plan2) {
      const chart = plan2.chart;
      const ret = indexInRangeForVertices(this.index, chart);
      if (!ret.ok) {
        return ret;
      }
      chart.Vertices.splice(this.index, 1);
      for (let i = 0; i < chart.Edges.length; i++) {
        const edge = chart.Edges[i];
        if (edge.i > this.index) {
          edge.i--;
        }
        if (edge.j > this.index) {
          edge.j--;
        }
      }
      return ok({ plan: plan2, inverse: this.inverse() });
    }
    inverse() {
      return new AddTaskAfterSubOp(this.index - 1);
    }
  };
  var RationalizeEdgesSubOp = class _RationalizeEdgesSubOp {
    constructor() {
    }
    apply(plan2) {
      const srcAndDst = edgesBySrcAndDstToMap(plan2.chart.Edges);
      const Start = 0;
      const Finish = plan2.chart.Vertices.length - 1;
      for (let i = Start; i < Finish; i++) {
        const destinations = srcAndDst.bySrc.get(i);
        if (destinations === void 0) {
          plan2.chart.Edges.push(new DirectedEdge(i, Finish));
        } else {
          if (destinations.length > 1 && destinations.find((value) => value.j === Finish)) {
            const toBeRemoved = new DirectedEdge(i, Finish);
            plan2.chart.Edges = plan2.chart.Edges.filter(
              (value) => !toBeRemoved.equal(value)
            );
          }
        }
      }
      for (let i = Start + 1; i < Finish; i++) {
        const destinations = srcAndDst.byDst.get(i);
        if (destinations === void 0) {
          plan2.chart.Edges.push(new DirectedEdge(Start, i));
        } else {
          if (destinations.length > 1 && destinations.find((value) => value.i === Start)) {
            const toBeRemoved = new DirectedEdge(Start, i);
            plan2.chart.Edges = plan2.chart.Edges.filter(
              (value) => !toBeRemoved.equal(value)
            );
          }
        }
      }
      if (plan2.chart.Edges.length === 0) {
        plan2.chart.Edges.push(new DirectedEdge(Start, Finish));
      }
      return ok({ plan: plan2, inverse: this.inverse() });
    }
    inverse() {
      return new _RationalizeEdgesSubOp();
    }
  };
  var SetTaskNameSubOp = class _SetTaskNameSubOp {
    taskIndex;
    name;
    constructor(taskIndex, name) {
      this.taskIndex = taskIndex;
      this.name = name;
    }
    apply(plan2) {
      const ret = indexInRangeForVertices(this.taskIndex, plan2.chart);
      if (!ret.ok) {
        return ret;
      }
      const oldName = plan2.chart.Vertices[this.taskIndex].name;
      plan2.chart.Vertices[this.taskIndex].name = this.name;
      return ok({
        plan: plan2,
        inverse: this.inverse(oldName)
      });
    }
    inverse(oldName) {
      return new _SetTaskNameSubOp(this.taskIndex, oldName);
    }
  };
  function InsertNewEmptyTaskAfterOp(taskIndex) {
    return new Op([
      new RationalizeEdgesSubOp(),
      new AddTaskAfterSubOp(taskIndex),
      new AddEdgeSubOp(0, taskIndex + 1),
      new AddEdgeSubOp(taskIndex + 1, -1),
      new RationalizeEdgesSubOp()
    ]);
  }
  function SetTaskNameOp(taskIndex, name) {
    return new Op([new SetTaskNameSubOp(taskIndex, name)]);
  }

  // src/ops/metrics.ts
  var SetMetricValueSubOp = class _SetMetricValueSubOp {
    name;
    value;
    taskIndex;
    constructor(name, value, taskIndex) {
      this.name = name;
      this.value = value;
      this.taskIndex = taskIndex;
    }
    apply(plan2) {
      const metricsDefinition = plan2.metricDefinitions.get(this.name);
      if (metricsDefinition === void 0) {
        return error(`${this.name} does not exist as a Metric`);
      }
      const metricsMap = plan2.chart.Vertices[this.taskIndex].metrics;
      const oldValue = metricsMap.get(this.name) || metricsDefinition.default;
      metricsMap.set(this.name, this.value);
      return ok({ plan: plan2, inverse: this.inverse(oldValue) });
    }
    inverse(value) {
      return new _SetMetricValueSubOp(this.name, value, this.taskIndex);
    }
  };
  function SetMetricValueOp(name, value, taskIndex) {
    return new Op([new SetMetricValueSubOp(name, value, taskIndex)]);
  }

  // src/metrics/range.ts
  var clamp = (x, min, max) => {
    if (x > max) {
      return max;
    }
    if (x < min) {
      return min;
    }
    return x;
  };
  var MetricRange = class {
    _min = -Number.MAX_VALUE;
    _max = Number.MAX_VALUE;
    constructor(min = -Number.MAX_VALUE, max = Number.MAX_VALUE) {
      if (max < min) {
        [min, max] = [max, min];
      }
      this._min = min;
      this._max = max;
    }
    clamp(value) {
      return clamp(value, this._min, this._max);
    }
    get min() {
      return this._min;
    }
    get max() {
      return this._max;
    }
  };

  // src/metrics/metrics.ts
  var MetricDefinition = class {
    range;
    default;
    isStatic;
    constructor(defaultValue, range = new MetricRange(), isStatic = false) {
      this.range = range;
      this.default = clamp(defaultValue, range.min, range.max);
      this.isStatic = isStatic;
    }
  };

  // src/stats/cdf/triangular/triangular.ts
  var Triangular = class {
    a;
    b;
    c;
    F_c;
    /**  The triangular distribution is a continuous probability distribution with
    lower limit `a`, upper limit `b`, and mode `c`, where a < b and a ≤ c ≤ b. */
    constructor(a, b, c) {
      this.a = a;
      this.b = b;
      this.c = c;
      this.F_c = (c - a) / (b - a);
    }
    /**  Produce a sample from the triangular distribution. The value of 'p'
     should be in [0, 1.0]. */
    sample(p) {
      if (p < 0) {
        return 0;
      } else if (p > 1) {
        return 1;
      } else if (p < this.F_c) {
        return this.a + Math.sqrt(p * (this.b - this.a) * (this.c - this.a));
      } else {
        return this.b - Math.sqrt((1 - p) * (this.b - this.a) * (this.b - this.c));
      }
    }
  };

  // src/stats/cdf/triangular/jacobian.ts
  var UncertaintyToNum = {
    low: 1.1,
    moderate: 1.5,
    high: 2,
    extreme: 5
  };
  var Jacobian = class {
    triangular;
    constructor(expected, uncertainty) {
      const mul = UncertaintyToNum[uncertainty];
      this.triangular = new Triangular(expected / mul, expected * mul, expected);
    }
    sample(p) {
      return this.triangular.sample(p);
    }
  };

  // src/plan/plan.ts
  var StaticMetricDefinitions = /* @__PURE__ */ new Map([
    // How long a task will take, in days.
    ["Duration", new MetricDefinition(0, new MetricRange(), true)],
    // The percent complete for a task.
    ["Percent", new MetricDefinition(0, new MetricRange(0, 100), true)]
  ]);
  var StaticResourceDefinitions = [
    {
      key: "Uncertainty",
      values: Object.keys(UncertaintyToNum)
    }
  ];
  var Plan = class {
    chart;
    resourceDefinitions = StaticResourceDefinitions.slice();
    metricDefinitions;
    constructor() {
      this.chart = new Chart();
      this.metricDefinitions = new Map(
        StaticMetricDefinitions
      );
      [...this.metricDefinitions.keys()].forEach((metricName) => {
        const md = this.metricDefinitions.get(metricName);
        this.chart.Vertices.forEach((task) => {
          task.metrics.set(metricName, md.default);
        });
      });
      this.resourceDefinitions.forEach(
        (resourceDefinition) => {
          this.chart.Vertices.forEach((task) => {
            task.resources[resourceDefinition.key] = resourceDefinition.values[0];
          });
        }
      );
    }
    // Returns a new Task with defaults for all metrics and resources.
    newTask() {
      const ret = new Task();
      [...this.metricDefinitions.keys()].forEach((metricName) => {
        const md = this.metricDefinitions.get(metricName);
        ret.metrics.set(metricName, md.default);
      });
      this.resourceDefinitions.forEach(
        (resourceDefinition) => {
          ret.resources[resourceDefinition.key] = resourceDefinition.values[0];
        }
      );
      return ret;
    }
  };

  // src/slack/slack.ts
  var Span = class {
    start = 0;
    finish = 0;
  };
  var Slack = class {
    early = new Span();
    late = new Span();
    slack = 0;
  };
  var defaultTaskDuration = (t) => {
    return t.duration;
  };
  function ComputeSlack(c, taskDuration = defaultTaskDuration) {
    const slacks = [];
    for (let i = 0; i < c.Vertices.length; i++) {
      slacks.push(new Slack());
    }
    const r = ChartValidate(c);
    if (!r.ok) {
      return error(r.error);
    }
    const edges = edgesBySrcAndDstToMap(c.Edges);
    const topologicalOrder = r.value;
    topologicalOrder.slice(1).forEach((vertexIndex) => {
      const task = c.Vertices[vertexIndex];
      const slack = slacks[vertexIndex];
      slack.early.start = Math.max(
        ...edges.byDst.get(vertexIndex).map((e) => {
          const predecessorSlack = slacks[e.i];
          return predecessorSlack.early.finish;
        })
      );
      slack.early.finish = slack.early.start + taskDuration(task, vertexIndex);
    });
    topologicalOrder.reverse().forEach((vertexIndex) => {
      const task = c.Vertices[vertexIndex];
      const slack = slacks[vertexIndex];
      const successors = edges.bySrc.get(vertexIndex);
      if (!successors) {
        slack.late.finish = slack.early.finish;
        slack.late.start = slack.early.start;
      } else {
        slack.late.finish = Math.min(
          ...edges.bySrc.get(vertexIndex).map((e) => {
            const successorSlack = slacks[e.j];
            return successorSlack.late.start;
          })
        );
        slack.late.start = slack.late.finish - taskDuration(task, vertexIndex);
        slack.slack = slack.late.finish - slack.early.finish;
      }
    });
    return ok(slacks);
  }
  var CriticalPath = (slacks) => {
    const ret = [];
    slacks.forEach((slack, index) => {
      if (slack.late.finish - slack.early.finish === 0 && slack.early.finish - slack.early.start !== 0) {
        ret.push(index);
      }
    });
    return ret;
  };

  // src/main.ts
  var taskA = new Task("A");
  taskA.metrics.set("Duration", 10);
  var taskB = new Task("B");
  taskB.metrics.set("Duration", 15);
  var plan = new Plan();
  var ops = [
    InsertNewEmptyTaskAfterOp(0),
    SetMetricValueOp("Duration", 10, 1),
    SetTaskNameOp(1, "A"),
    InsertNewEmptyTaskAfterOp(1),
    SetMetricValueOp("Duration", 15, 2),
    SetTaskNameOp(1, "B")
  ];
  var res = applyAllOpsToPlan(ops, plan);
  if (!res.ok) {
    throw res.error;
  }
  plan = res.value.plan;
  var C = plan.chart;
  var jacobians = C.Vertices.map((t) => {
    return new Jacobian(t.duration, "low");
  });
  var slacksRet = ComputeSlack(C);
  if (!slacksRet.ok) {
    throw new Error(`Error computing slack: ${slacksRet.error}`);
  }
  console.log("Tasks on the critical path:", CriticalPath(slacksRet.value));
  console.log(
    "Tasks on the critical path for in the first quartile:",
    ComputeSlack(
      C,
      (t, taskIndex) => jacobians[taskIndex].sample(0.25)
    )
  );
  console.log(validateChart(plan.chart));
  console.log(JSON.stringify(plan, null, "  "));
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL3Jlc3VsdC50cyIsICIuLi9zcmMvZGFnL2RhZy50cyIsICIuLi9zcmMvZGFnL2FsZ29yaXRobXMvdG9wb3NvcnQudHMiLCAiLi4vc3JjL2NoYXJ0L2NoYXJ0LnRzIiwgIi4uL3NyYy9vcHMvb3BzLnRzIiwgIi4uL3NyYy9vcHMvY2hhcnQudHMiLCAiLi4vc3JjL29wcy9tZXRyaWNzLnRzIiwgIi4uL3NyYy9tZXRyaWNzL3JhbmdlLnRzIiwgIi4uL3NyYy9tZXRyaWNzL21ldHJpY3MudHMiLCAiLi4vc3JjL3N0YXRzL2NkZi90cmlhbmd1bGFyL3RyaWFuZ3VsYXIudHMiLCAiLi4vc3JjL3N0YXRzL2NkZi90cmlhbmd1bGFyL2phY29iaWFuLnRzIiwgIi4uL3NyYy9wbGFuL3BsYW4udHMiLCAiLi4vc3JjL3NsYWNrL3NsYWNrLnRzIiwgIi4uL3NyYy9tYWluLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKiogUmVzdWx0IGFsbG93cyBlYXNpZXIgaGFuZGxpbmcgb2YgcmV0dXJuaW5nIGVpdGhlciBhbiBlcnJvciBvciBhIHZhbHVlIGZyb20gYVxuICogZnVuY3Rpb24uICovXG5leHBvcnQgdHlwZSBSZXN1bHQ8VD4gPSB7IG9rOiB0cnVlOyB2YWx1ZTogVCB9IHwgeyBvazogZmFsc2U7IGVycm9yOiBFcnJvciB9O1xuXG5leHBvcnQgZnVuY3Rpb24gb2s8VD4odmFsdWU6IFQpOiBSZXN1bHQ8VD4ge1xuICByZXR1cm4geyBvazogdHJ1ZSwgdmFsdWU6IHZhbHVlIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlcnJvcjxUPih2YWx1ZTogc3RyaW5nIHwgRXJyb3IpOiBSZXN1bHQ8VD4ge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogbmV3IEVycm9yKHZhbHVlKSB9O1xuICB9XG4gIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IHZhbHVlIH07XG59XG4iLCAiLyoqIE9uZSB2ZXJ0ZXggb2YgYSBncmFwaC4gKi9cbmV4cG9ydCB0eXBlIFZlcnRleCA9IG9iamVjdDtcblxuLyoqIEV2ZXJ5IFZlcnRleCBpbiBhIGdyYXBoLiAqL1xuZXhwb3J0IHR5cGUgVmVydGljZXMgPSBWZXJ0ZXhbXTtcblxuLyoqIEEgc3Vic2V0IG9mIFZlcnRpY2VzIHJlZmVycmVkIHRvIGJ5IHRoZWlyIGluZGV4IG51bWJlci4gKi9cbmV4cG9ydCB0eXBlIFZlcnRleEluZGljZXMgPSBudW1iZXJbXTtcblxuLyoqIE9uZSBlZGdlIG9mIGEgZ3JhcGgsIHdoaWNoIGlzIGEgZGlyZWN0ZWQgY29ubmVjdGlvbiBmcm9tIHRoZSBpJ3RoIFZlcnRleCB0b1xudGhlIGondGggVmVydGV4LCB3aGVyZSB0aGUgVmVydGV4IGlzIHN0b3JlZCBpbiBhIFZlcnRpY2VzLlxuICovXG5leHBvcnQgY2xhc3MgRGlyZWN0ZWRFZGdlIHtcbiAgaTogbnVtYmVyID0gMDtcbiAgajogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpOiBudW1iZXIsIGo6IG51bWJlcikge1xuICAgIHRoaXMuaSA9IGk7XG4gICAgdGhpcy5qID0gajtcbiAgfVxuXG4gIGVxdWFsKHJoczogRGlyZWN0ZWRFZGdlKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHJocy5pID09PSB0aGlzLmkgJiYgcmhzLmogPT09IHRoaXMuajtcbiAgfVxufVxuXG4vKiogRXZlcnkgRWdkZSBpbiBhIGdyYXBoLiAqL1xuZXhwb3J0IHR5cGUgRWRnZXMgPSBEaXJlY3RlZEVkZ2VbXTtcblxuLyoqIEEgZ3JhcGggaXMganVzdCBhIGNvbGxlY3Rpb24gb2YgVmVydGljZXMgYW5kIEVkZ2VzIGJldHdlZW4gdGhvc2UgdmVydGljZXMuICovXG5leHBvcnQgdHlwZSBEaXJlY3RlZEdyYXBoID0ge1xuICBWZXJ0aWNlczogVmVydGljZXM7XG4gIEVkZ2VzOiBFZGdlcztcbn07XG5cbi8qKlxuIEdyb3VwcyB0aGUgRWRnZXMgYnkgdGhlaXIgYGlgIHZhbHVlLlxuXG4gQHBhcmFtIGVkZ2VzIC0gQWxsIHRoZSBFZ2VzIGluIGEgRGlyZWN0ZWRHcmFwaC5cbiBAcmV0dXJucyBBIG1hcCBmcm9tIHRoZSBWZXJ0ZXggaW5kZXggdG8gYWxsIHRoZSBFZGdlcyB0aGF0IHN0YXJ0IGF0XG4gICBhdCB0aGF0IFZlcnRleCBpbmRleC5cbiAqL1xuZXhwb3J0IGNvbnN0IGVkZ2VzQnlTcmNUb01hcCA9IChlZGdlczogRWRnZXMpOiBNYXA8bnVtYmVyLCBFZGdlcz4gPT4ge1xuICBjb25zdCByZXQgPSBuZXcgTWFwPG51bWJlciwgRWRnZXM+KCk7XG5cbiAgZWRnZXMuZm9yRWFjaCgoZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgY29uc3QgYXJyID0gcmV0LmdldChlLmkpIHx8IFtdO1xuICAgIGFyci5wdXNoKGUpO1xuICAgIHJldC5zZXQoZS5pLCBhcnIpO1xuICB9KTtcblxuICByZXR1cm4gcmV0O1xufTtcblxuLyoqXG4gICBHcm91cHMgdGhlIEVkZ2VzIGJ5IHRoZWlyIGBqYCB2YWx1ZS5cbiAgXG4gICBAcGFyYW0gZWRnZXMgLSBBbGwgdGhlIEVkZ2VzIGluIGEgRGlyZWN0ZWRHcmFwaC5cbiAgIEByZXR1cm5zIEEgbWFwIGZyb20gdGhlIFZlcnRleCBpbmRleCB0byBhbGwgdGhlIEVkZ2VzIHRoYXQgZW5kIGF0XG4gICAgIGF0IHRoYXQgVmVydGV4IGluZGV4LlxuICAgKi9cblxuZXhwb3J0IGNvbnN0IGVkZ2VzQnlEc3RUb01hcCA9IChlZGdlczogRWRnZXMpOiBNYXA8bnVtYmVyLCBFZGdlcz4gPT4ge1xuICBjb25zdCByZXQgPSBuZXcgTWFwPG51bWJlciwgRWRnZXM+KCk7XG5cbiAgZWRnZXMuZm9yRWFjaCgoZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgY29uc3QgYXJyID0gcmV0LmdldChlLmopIHx8IFtdO1xuICAgIGFyci5wdXNoKGUpO1xuICAgIHJldC5zZXQoZS5qLCBhcnIpO1xuICB9KTtcblxuICByZXR1cm4gcmV0O1xufTtcblxuZXhwb3J0IHR5cGUgU3JjQW5kRHN0UmV0dXJuID0ge1xuICBieVNyYzogTWFwPG51bWJlciwgRWRnZXM+O1xuICBieURzdDogTWFwPG51bWJlciwgRWRnZXM+O1xufTtcblxuZXhwb3J0IGNvbnN0IGVkZ2VzQnlTcmNBbmREc3RUb01hcCA9IChlZGdlczogRWRnZXMpOiBTcmNBbmREc3RSZXR1cm4gPT4ge1xuICBjb25zdCByZXQgPSB7XG4gICAgYnlTcmM6IG5ldyBNYXA8bnVtYmVyLCBFZGdlcz4oKSxcbiAgICBieURzdDogbmV3IE1hcDxudW1iZXIsIEVkZ2VzPigpLFxuICB9O1xuXG4gIGVkZ2VzLmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgIGxldCBhcnIgPSByZXQuYnlTcmMuZ2V0KGUuaSkgfHwgW107XG4gICAgYXJyLnB1c2goZSk7XG4gICAgcmV0LmJ5U3JjLnNldChlLmksIGFycik7XG4gICAgYXJyID0gcmV0LmJ5RHN0LmdldChlLmopIHx8IFtdO1xuICAgIGFyci5wdXNoKGUpO1xuICAgIHJldC5ieURzdC5zZXQoZS5qLCBhcnIpO1xuICB9KTtcblxuICByZXR1cm4gcmV0O1xufTtcbiIsICJpbXBvcnQge1xuICBWZXJ0ZXgsXG4gIFZlcnRleEluZGljZXMsXG4gIERpcmVjdGVkR3JhcGgsXG4gIGVkZ2VzQnlTcmNUb01hcCxcbn0gZnJvbSBcIi4uL2RhZy50c1wiO1xuXG4vKipcblRoZSByZXR1cm4gdHlwZSBmb3IgdGhlIFRvcGxvZ2ljYWxTb3J0IGZ1bmN0aW9uLiBcbiAqL1xudHlwZSBUU1JldHVybiA9IHtcbiAgaGFzQ3ljbGVzOiBib29sZWFuO1xuXG4gIGN5Y2xlOiBWZXJ0ZXhJbmRpY2VzO1xuXG4gIG9yZGVyOiBWZXJ0ZXhJbmRpY2VzO1xufTtcblxuLyoqXG5SZXR1cm5zIGEgdG9wb2xvZ2ljYWwgc29ydCBvcmRlciBmb3IgYSBEaXJlY3RlZEdyYXBoLCBvciB0aGUgbWVtYmVycyBvZiBhIGN5Y2xlIGlmIGFcbnRvcG9sb2dpY2FsIHNvcnQgY2FuJ3QgYmUgZG9uZS5cbiBcbiBUaGUgdG9wb2xvZ2ljYWwgc29ydCBjb21lcyBmcm9tOlxuXG4gICAgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVG9wb2xvZ2ljYWxfc29ydGluZyNEZXB0aC1maXJzdF9zZWFyY2hcblxuTCBcdTIxOTAgRW1wdHkgbGlzdCB0aGF0IHdpbGwgY29udGFpbiB0aGUgc29ydGVkIG5vZGVzXG53aGlsZSBleGlzdHMgbm9kZXMgd2l0aG91dCBhIHBlcm1hbmVudCBtYXJrIGRvXG4gICAgc2VsZWN0IGFuIHVubWFya2VkIG5vZGUgblxuICAgIHZpc2l0KG4pXG5cbmZ1bmN0aW9uIHZpc2l0KG5vZGUgbilcbiAgICBpZiBuIGhhcyBhIHBlcm1hbmVudCBtYXJrIHRoZW5cbiAgICAgICAgcmV0dXJuXG4gICAgaWYgbiBoYXMgYSB0ZW1wb3JhcnkgbWFyayB0aGVuXG4gICAgICAgIHN0b3AgICAoZ3JhcGggaGFzIGF0IGxlYXN0IG9uZSBjeWNsZSlcblxuICAgIG1hcmsgbiB3aXRoIGEgdGVtcG9yYXJ5IG1hcmtcblxuICAgIGZvciBlYWNoIG5vZGUgbSB3aXRoIGFuIGVkZ2UgZnJvbSBuIHRvIG0gZG9cbiAgICAgICAgdmlzaXQobSlcblxuICAgIHJlbW92ZSB0ZW1wb3JhcnkgbWFyayBmcm9tIG5cbiAgICBtYXJrIG4gd2l0aCBhIHBlcm1hbmVudCBtYXJrXG4gICAgYWRkIG4gdG8gaGVhZCBvZiBMXG5cbiAqL1xuZXhwb3J0IGNvbnN0IHRvcG9sb2dpY2FsU29ydCA9IChnOiBEaXJlY3RlZEdyYXBoKTogVFNSZXR1cm4gPT4ge1xuICBjb25zdCByZXQ6IFRTUmV0dXJuID0ge1xuICAgIGhhc0N5Y2xlczogZmFsc2UsXG4gICAgY3ljbGU6IFtdLFxuICAgIG9yZGVyOiBbXSxcbiAgfTtcblxuICBjb25zdCBlZGdlTWFwID0gZWRnZXNCeVNyY1RvTWFwKGcuRWRnZXMpO1xuXG4gIGNvbnN0IG5vZGVzV2l0aG91dFBlcm1hbmVudE1hcmsgPSBuZXcgU2V0PG51bWJlcj4oKTtcbiAgZy5WZXJ0aWNlcy5mb3JFYWNoKChfOiBWZXJ0ZXgsIGluZGV4OiBudW1iZXIpID0+XG4gICAgbm9kZXNXaXRob3V0UGVybWFuZW50TWFyay5hZGQoaW5kZXgpXG4gICk7XG5cbiAgY29uc3QgaGFzUGVybWFuZW50TWFyayA9IChpbmRleDogbnVtYmVyKTogYm9vbGVhbiA9PiB7XG4gICAgcmV0dXJuICFub2Rlc1dpdGhvdXRQZXJtYW5lbnRNYXJrLmhhcyhpbmRleCk7XG4gIH07XG5cbiAgY29uc3QgdGVtcG9yYXJ5TWFyayA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuXG4gIGNvbnN0IHZpc2l0ID0gKGluZGV4OiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgICBpZiAoaGFzUGVybWFuZW50TWFyayhpbmRleCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAodGVtcG9yYXJ5TWFyay5oYXMoaW5kZXgpKSB7XG4gICAgICAvLyBXZSBvbmx5IHJldHVybiBmYWxzZSBvbiBmaW5kaW5nIGEgbG9vcCwgd2hpY2ggaXMgc3RvcmVkIGluXG4gICAgICAvLyB0ZW1wb3JhcnlNYXJrLlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0ZW1wb3JhcnlNYXJrLmFkZChpbmRleCk7XG5cbiAgICBjb25zdCBuZXh0RWRnZXMgPSBlZGdlTWFwLmdldChpbmRleCk7XG4gICAgaWYgKG5leHRFZGdlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5leHRFZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBlID0gbmV4dEVkZ2VzW2ldO1xuICAgICAgICBpZiAoIXZpc2l0KGUuaikpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0ZW1wb3JhcnlNYXJrLmRlbGV0ZShpbmRleCk7XG4gICAgbm9kZXNXaXRob3V0UGVybWFuZW50TWFyay5kZWxldGUoaW5kZXgpO1xuICAgIHJldC5vcmRlci51bnNoaWZ0KGluZGV4KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBXZSB3aWxsIHByZXN1bWUgdGhhdCBWZXJ0ZXhbMF0gaXMgdGhlIHN0YXJ0IG5vZGUgYW5kIHRoYXQgd2Ugc2hvdWxkIHN0YXJ0IHRoZXJlLlxuICBjb25zdCBvayA9IHZpc2l0KDApO1xuICBpZiAoIW9rKSB7XG4gICAgcmV0Lmhhc0N5Y2xlcyA9IHRydWU7XG4gICAgcmV0LmN5Y2xlID0gWy4uLnRlbXBvcmFyeU1hcmsua2V5cygpXTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59O1xuIiwgImltcG9ydCB7IFJlc3VsdCwgb2ssIGVycm9yIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHtcbiAgVmVydGV4SW5kaWNlcyxcbiAgRWRnZXMsXG4gIERpcmVjdGVkR3JhcGgsXG4gIGVkZ2VzQnlTcmNUb01hcCxcbiAgZWRnZXNCeURzdFRvTWFwLFxuICBEaXJlY3RlZEVkZ2UsXG59IGZyb20gXCIuLi9kYWcvZGFnXCI7XG5cbmltcG9ydCB7IHRvcG9sb2dpY2FsU29ydCB9IGZyb20gXCIuLi9kYWcvYWxnb3JpdGhtcy90b3Bvc29ydC50c1wiO1xuaW1wb3J0IHsgTWV0cmljVmFsdWVzIH0gZnJvbSBcIi4uL21ldHJpY3MvbWV0cmljcy50c1wiO1xuXG5leHBvcnQgdHlwZSBUYXNrU3RhdGUgPSBcInVuc3RhcnRlZFwiIHwgXCJzdGFydGVkXCIgfCBcImNvbXBsZXRlXCI7XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1RBU0tfTkFNRSA9IFwiVGFzayBOYW1lXCI7XG5cbi8vIERvIHdlIGNyZWF0ZSBzdWItY2xhc3NlcyBhbmQgdGhlbiBzZXJpYWxpemUgc2VwYXJhdGVseT8gT3IgZG8gd2UgaGF2ZSBhXG4vLyBjb25maWcgYWJvdXQgd2hpY2ggdHlwZSBvZiBEdXJhdGlvblNhbXBsZXIgaXMgYmVpbmcgdXNlZD9cbi8vXG4vLyBXZSBjYW4gdXNlIHRyYWRpdGlvbmFsIG9wdGltaXN0aWMvcGVzc2ltaXN0aWMgdmFsdWUuIE9yIEphY29iaWFuJ3Ncbi8vIHVuY2VydGFpbnRseSBtdWx0aXBsaWVycyBbMS4xLCAxLjUsIDIsIDVdIGFuZCB0aGVpciBpbnZlcnNlcyB0byBnZW5lcmF0ZSBhblxuLy8gb3B0aW1pc3RpYyBwZXNzaW1pc3RpYy5cblxuLyoqIFRhc2sgaXMgYSBWZXJ0ZXggd2l0aCBkZXRhaWxzIGFib3V0IHRoZSBUYXNrIHRvIGNvbXBsZXRlLiAqL1xuZXhwb3J0IGNsYXNzIFRhc2sge1xuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcgPSBcIlwiKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZSB8fCBERUZBVUxUX1RBU0tfTkFNRTtcbiAgICB0aGlzLm1ldHJpY3MgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5yZXNvdXJjZXMgPSB7fTtcbiAgfVxuXG4gIC8vIFJlc291cmNlIGtleXMgYW5kIHZhbHVlcy4gVGhlIHBhcmVudCBwbGFuIGNvbnRhaW5zIGFsbCB0aGUgcmVzb3VyY2VcbiAgLy8gZGVmaW5pdGlvbnMuXG5cbiAgLy8gU2hvdWxkIHJlc291cmNlcyBhbHNvIGhhdmUgYSBSZXNvdXJjZXNDb250YWluZXI/XG4gIHJlc291cmNlczogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcblxuICBtZXRyaWNzOiBNZXRyaWNWYWx1ZXM7XG5cbiAgbmFtZTogc3RyaW5nO1xuXG4gIHN0YXRlOiBUYXNrU3RhdGUgPSBcInVuc3RhcnRlZFwiO1xuXG4gIC8vIFJlY29yZGVkIGFzIHRoZSBudW1iZXIgb2YgZGF5cyBmcm9tIHRoZSBTdGFydCBNaWxlc3RvbmUuXG4gIGFjdHVhbFN0YXJ0OiBudW1iZXIgPSAwO1xuXG4gIGFjdHVhbEZpbmlzaDogbnVtYmVyID0gMDtcblxuICBwdWJsaWMgZ2V0IGR1cmF0aW9uKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubWV0cmljcy5nZXQoXCJEdXJhdGlvblwiKSE7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHBlcmNlbnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5tZXRyaWNzLmdldChcIlBlcmNlbnRcIikhO1xuICB9XG5cbiAgcHVibGljIGR1cCgpOiBUYXNrIHtcbiAgICBjb25zdCByZXQgPSBuZXcgVGFzaygpO1xuICAgIHJldC5yZXNvdXJjZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnJlc291cmNlcyk7XG4gICAgcmV0Lm1ldHJpY3MgPSBuZXcgTWFwKHRoaXMubWV0cmljcyk7XG4gICAgcmV0Lm5hbWUgPSB0aGlzLm5hbWU7XG4gICAgcmV0LnN0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICByZXQuYWN0dWFsRmluaXNoID0gdGhpcy5hY3R1YWxGaW5pc2g7XG4gICAgcmV0LmFjdHVhbFN0YXJ0ID0gdGhpcy5hY3R1YWxTdGFydDtcbiAgICByZXR1cm4gcmV0O1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFRhc2tzID0gVGFza1tdO1xuXG4vKiogQSBDaGFydCBpcyBhIERpcmVjdGVkR3JhcGgsIGJ1dCB3aXRoIFRhc2tzIGZvciBWZXJ0aWNlcy4gKi9cbmV4cG9ydCBjbGFzcyBDaGFydCB7XG4gIFZlcnRpY2VzOiBUYXNrcztcbiAgRWRnZXM6IEVkZ2VzO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGNvbnN0IHN0YXJ0ID0gbmV3IFRhc2soXCJTdGFydFwiKTtcbiAgICBzdGFydC5tZXRyaWNzLnNldChcIkR1cmF0aW9uXCIsIDApO1xuICAgIGNvbnN0IGZpbmlzaCA9IG5ldyBUYXNrKFwiRmluaXNoXCIpO1xuICAgIGZpbmlzaC5tZXRyaWNzLnNldChcIkR1cmF0aW9uXCIsIDApO1xuICAgIHRoaXMuVmVydGljZXMgPSBbc3RhcnQsIGZpbmlzaF07XG4gICAgdGhpcy5FZGdlcyA9IFtuZXcgRGlyZWN0ZWRFZGdlKDAsIDEpXTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBUb3BvbG9naWNhbE9yZGVyID0gVmVydGV4SW5kaWNlcztcblxuZXhwb3J0IHR5cGUgVmFsaWRhdGVSZXN1bHQgPSBSZXN1bHQ8VG9wb2xvZ2ljYWxPcmRlcj47XG5cbi8qKiBWYWxpZGF0ZXMgYSBEaXJlY3RlZEdyYXBoIGlzIGEgdmFsaWQgQ2hhcnQuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVDaGFydChnOiBEaXJlY3RlZEdyYXBoKTogVmFsaWRhdGVSZXN1bHQge1xuICBpZiAoZy5WZXJ0aWNlcy5sZW5ndGggPCAyKSB7XG4gICAgcmV0dXJuIGVycm9yKFxuICAgICAgXCJDaGFydCBtdXN0IGNvbnRhaW4gYXQgbGVhc3QgdHdvIG5vZGUsIHRoZSBzdGFydCBhbmQgZmluaXNoIHRhc2tzLlwiXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN0IGVkZ2VzQnlEc3QgPSBlZGdlc0J5RHN0VG9NYXAoZy5FZGdlcyk7XG4gIGNvbnN0IGVkZ2VzQnlTcmMgPSBlZGdlc0J5U3JjVG9NYXAoZy5FZGdlcyk7XG5cbiAgLy8gVGhlIGZpcnN0IFZlcnRleCwgVF8wIGFrYSB0aGUgU3RhcnQgTWlsZXN0b25lLCBtdXN0IGhhdmUgMCBpbmNvbWluZyBlZGdlcy5cbiAgaWYgKGVkZ2VzQnlEc3QuZ2V0KDApICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gZXJyb3IoXCJUaGUgc3RhcnQgbm9kZSAoMCkgaGFzIGFuIGluY29taW5nIGVkZ2UuXCIpO1xuICB9XG5cbiAgLy8gQW5kIG9ubHkgVF8wIHNob3VsZCBoYXZlIDAgaW5jb21pbmcgZWRnZXMuXG4gIGZvciAobGV0IGkgPSAxOyBpIDwgZy5WZXJ0aWNlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChlZGdlc0J5RHN0LmdldChpKSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGBGb3VuZCBub2RlIHRoYXQgaXNuJ3QgKDApIHRoYXQgaGFzIG5vIGluY29taW5nIGVkZ2VzOiAke2l9YFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvLyBUaGUgbGFzdCBWZXJ0ZXgsIFRfZmluaXNoLCB0aGUgRmluaXNoIE1pbGVzdG9uZSwgbXVzdCBoYXZlIDAgb3V0Z29pbmcgZWRnZXMuXG4gIGlmIChlZGdlc0J5U3JjLmdldChnLlZlcnRpY2VzLmxlbmd0aCAtIDEpICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBcIlRoZSBsYXN0IG5vZGUsIHdoaWNoIHNob3VsZCBiZSB0aGUgRmluaXNoIE1pbGVzdG9uZSwgaGFzIGFuIG91dGdvaW5nIGVkZ2UuXCJcbiAgICApO1xuICB9XG5cbiAgLy8gQW5kIG9ubHkgVF9maW5pc2ggc2hvdWxkIGhhdmUgMCBvdXRnb2luZyBlZGdlcy5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBnLlZlcnRpY2VzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgIGlmIChlZGdlc0J5U3JjLmdldChpKSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGBGb3VuZCBub2RlIHRoYXQgaXNuJ3QgVF9maW5pc2ggdGhhdCBoYXMgbm8gb3V0Z29pbmcgZWRnZXM6ICR7aX1gXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG51bVZlcnRpY2VzID0gZy5WZXJ0aWNlcy5sZW5ndGg7XG4gIC8vIEFuZCBhbGwgZWRnZXMgbWFrZSBzZW5zZSwgaS5lLiB0aGV5IGFsbCBwb2ludCB0byB2ZXJ0ZXhlcyB0aGF0IGV4aXN0LlxuICBmb3IgKGxldCBpID0gMDsgaSA8IGcuRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBlbGVtZW50ID0gZy5FZGdlc1tpXTtcbiAgICBpZiAoXG4gICAgICBlbGVtZW50LmkgPCAwIHx8XG4gICAgICBlbGVtZW50LmkgPj0gbnVtVmVydGljZXMgfHxcbiAgICAgIGVsZW1lbnQuaiA8IDAgfHxcbiAgICAgIGVsZW1lbnQuaiA+PSBudW1WZXJ0aWNlc1xuICAgICkge1xuICAgICAgcmV0dXJuIGVycm9yKGBFZGdlICR7ZWxlbWVudH0gcG9pbnRzIHRvIGEgbm9uLWV4aXN0ZW50IFZlcnRleC5gKTtcbiAgICB9XG4gIH1cblxuICAvLyBOb3cgd2UgY29uZmlybSB0aGF0IHdlIGhhdmUgYSBEaXJlY3RlZCBBY3ljbGljIEdyYXBoLCBpLmUuIHRoZSBncmFwaCBoYXMgbm9cbiAgLy8gY3ljbGVzIGJ5IGNyZWF0aW5nIGEgdG9wb2xvZ2ljYWwgc29ydCBzdGFydGluZyBhdCBUXzBcbiAgLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVG9wb2xvZ2ljYWxfc29ydGluZyNEZXB0aC1maXJzdF9zZWFyY2hcbiAgY29uc3QgdHNSZXQgPSB0b3BvbG9naWNhbFNvcnQoZyk7XG4gIGlmICh0c1JldC5oYXNDeWNsZXMpIHtcbiAgICByZXR1cm4gZXJyb3IoYENoYXJ0IGhhcyBjeWNsZTogJHtbLi4udHNSZXQuY3ljbGVdLmpvaW4oXCIsIFwiKX1gKTtcbiAgfVxuXG4gIHJldHVybiBvayh0c1JldC5vcmRlcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDaGFydFZhbGlkYXRlKGM6IENoYXJ0KTogVmFsaWRhdGVSZXN1bHQge1xuICBjb25zdCByZXQgPSB2YWxpZGF0ZUNoYXJ0KGMpO1xuICBpZiAoIXJldC5vaykge1xuICAgIHJldHVybiByZXQ7XG4gIH1cbiAgaWYgKGMuVmVydGljZXNbMF0uZHVyYXRpb24gIT09IDApIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBgU3RhcnQgTWlsZXN0b25lIG11c3QgaGF2ZSBkdXJhdGlvbiBvZiAwLCBpbnN0ZWFkIGdvdCAke2MuVmVydGljZXNbMF0uZHVyYXRpb259YFxuICAgICk7XG4gIH1cbiAgaWYgKGMuVmVydGljZXNbYy5WZXJ0aWNlcy5sZW5ndGggLSAxXS5kdXJhdGlvbiAhPT0gMCkge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIGBGaW5pc2ggTWlsZXN0b25lIG11c3QgaGF2ZSBkdXJhdGlvbiBvZiAwLCBpbnN0ZWFkIGdvdCAke1xuICAgICAgICBjLlZlcnRpY2VzW2MuVmVydGljZXMubGVuZ3RoIC0gMV0uZHVyYXRpb25cbiAgICAgIH1gXG4gICAgKTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuIiwgImltcG9ydCB7IFJlc3VsdCwgb2sgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhbi50c1wiO1xuXG4vLyBPcGVyYXRpb25zIG9uIFBsYW5zLiBOb3RlIHRoZXkgYXJlIHJldmVyc2libGUsIHNvIHdlIGNhbiBoYXZlIGFuICd1bmRvJyBsaXN0LlxuXG4vLyBBbHNvLCBzb21lIG9wZXJhdGlvbnMgbWlnaHQgaGF2ZSAncGFydGlhbHMnLCBpLmUuIHJldHVybiBhIGxpc3Qgb2YgdmFsaWRcbi8vIG9wdGlvbnMgdGhhdCBjYW4gYmUgcGFzc2VkIHRvIHRoZSBvcGVyYXRpb24uIEZvciBleGFtcGxlLCBhZGRpbmcgYVxuLy8gcHJlZGVjZXNzb3IgY291bGQgbGlzdCBhbGwgdGhlIFRhc2tzIHRoYXQgd291bGQgbm90IGZvcm0gYSBsb29wLCBpLmUuIGV4Y2x1ZGVcbi8vIGFsbCBkZXNjZW5kZW50cywgYW5kIHRoZSBUYXNrIGl0c2VsZiwgZnJvbSB0aGUgbGlzdCBvZiBvcHRpb25zLlxuLy9cbi8vICogQ2hhbmdlIHN0cmluZyB2YWx1ZSBpbiBhIFRhc2suXG4vLyAqIENoYW5nZSBkdXJhdGlvbiB2YWx1ZSBpbiBhIFRhc2suXG4vLyAqIEluc2VydCBuZXcgZW1wdHkgVGFzayBhZnRlciBJbmRleC5cbi8vICogU3BsaXQgYSBUYXNrLiAoUHJlZGVjZXNzb3IgdGFrZXMgYWxsIGluY29taW5nIGVkZ2VzLCBzb3VyY2UgdGFza3MgYWxsIG91dGdvaW5nIGVkZ2VzKS5cbi8vXG4vLyAqIER1cGxpY2F0ZSBhIFRhc2sgKGFsbCBlZGdlcyBhcmUgZHVwbGljYXRlZCBmcm9tIHRoZSBzb3VyY2UgVGFzaykuXG4vLyAqIERlbGV0ZSBwcmVkZWNlc3NvciB0byBhIFRhc2suXG4vLyAqIERlbGV0ZSBzdWNjZXNzb3IgdG8gYSBUYXNrLlxuLy8gKiBEZWxldGUgYSBUYXNrLlxuXG4vLyBOZWVkIFVuZG8vUmVkbyBTdGFja3MuXG4vLyBUaGVzZSByZWNvcmQgdGhlIHN1Yi1vcHMgZm9yIGVhY2ggbGFyZ2Ugb3AuIEUuZy4gYW4gaW5zZXJ0IHRhc2sgb3AgaXMgbWFkZVxuLy8gb2YgdGhyZWUgc3ViLW9wczpcbi8vICAgIDEuIGluc2VydCB0YXNrIGludG8gVmVydGljZXMgYW5kIHJlbnVtYmVyIEVkZ2VzXG4vLyAgICAyLiBBZGQgZWRnZSBmcm9tIFN0YXJ0IHRvIE5ldyBUYXNrXG4vLyAgICAzLiBBZGQgZWRnZSBmcm9tIE5ldyBUYXNrIHRvIEZpbmlzaFxuLy9cbi8vIEVhY2ggc3ViLW9wOlxuLy8gICAgMS4gUmVjb3JkcyBhbGwgdGhlIGluZm8gaXQgbmVlZHMgdG8gd29yay5cbi8vICAgIDIuIENhbiBiZSBcImFwcGxpZWRcIiB0byBhIFBsYW4uXG4vLyAgICAzLiBDYW4gZ2VuZXJhdGUgaXRzIGludmVyc2Ugc3ViLW9wLlxuXG4vLyBUaGUgcmVzdWx0cyBmcm9tIGFwcGx5aW5nIGEgU3ViT3AuIFRoaXMgaXMgdGhlIG9ubHkgd2F5IHRvIGdldCB0aGUgaW52ZXJzZSBvZlxuLy8gYSBTdWJPcCBzaW5jZSB0aGUgU3ViT3AgaW52ZXJzZSBtaWdodCBkZXBlbmQgb24gdGhlIHN0YXRlIG9mIHRoZSBQbGFuIGF0IHRoZVxuLy8gdGltZSB0aGUgU3ViT3Agd2FzIGFwcGxpZWQuXG5leHBvcnQgaW50ZXJmYWNlIFN1Yk9wUmVzdWx0IHtcbiAgcGxhbjogUGxhbjtcbiAgaW52ZXJzZTogU3ViT3A7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3ViT3Age1xuICAvLyBJZiB0aGUgYXBwbHkgcmV0dXJucyBhbiBlcnJvciBpdCBpcyBndWFyYW50ZWVkIG5vdCB0byBoYXZlIG1vZGlmaWVkIHRoZVxuICAvLyBQbGFuLlxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0Pjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBPcFJlc3VsdCB7XG4gIHBsYW46IFBsYW47XG4gIGludmVyc2U6IE9wO1xufVxuXG4vLyBPcCBhcmUgb3BlcmF0aW9ucyBhcmUgYXBwbGllZCB0byBtYWtlIGNoYW5nZXMgdG8gYSBQbGFuLlxuZXhwb3J0IGNsYXNzIE9wIHtcbiAgc3ViT3BzOiBTdWJPcFtdID0gW107XG5cbiAgY29uc3RydWN0b3Ioc3ViT3BzOiBTdWJPcFtdKSB7XG4gICAgdGhpcy5zdWJPcHMgPSBzdWJPcHM7XG4gIH1cblxuICAvLyBSZXZlcnRzIGFsbCBTdWJPcHMgdXAgdG8gdGhlIGdpdmVuIGluZGV4LlxuICBhcHBseUFsbEludmVyc2VTdWJPcHNUb1BsYW4oXG4gICAgcGxhbjogUGxhbixcbiAgICBpbnZlcnNlU3ViT3BzOiBTdWJPcFtdXG4gICk6IFJlc3VsdDxQbGFuPiB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnZlcnNlU3ViT3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlID0gaW52ZXJzZVN1Yk9wc1tpXS5hcHBseShwbGFuKTtcbiAgICAgIGlmICghZS5vaykge1xuICAgICAgICByZXR1cm4gZTtcbiAgICAgIH1cbiAgICAgIHBsYW4gPSBlLnZhbHVlLnBsYW47XG4gICAgfVxuXG4gICAgcmV0dXJuIG9rKHBsYW4pO1xuICB9XG5cbiAgLy8gQXBwbGllcyB0aGUgT3AgdG8gYSBQbGFuLlxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PE9wUmVzdWx0PiB7XG4gICAgY29uc3QgaW52ZXJzZVN1Yk9wczogU3ViT3BbXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zdWJPcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGUgPSB0aGlzLnN1Yk9wc1tpXS5hcHBseShwbGFuKTtcbiAgICAgIGlmICghZS5vaykge1xuICAgICAgICAvLyBSZXZlcnQgYWxsIHRoZSBTdWJPcHMgYXBwbGllZCB1cCB0byB0aGlzIHBvaW50IHRvIGdldCB0aGUgUGxhbiBiYWNrIGluIGFcbiAgICAgICAgLy8gZ29vZCBwbGFjZS5cbiAgICAgICAgY29uc3QgcmV2ZXJ0RXJyID0gdGhpcy5hcHBseUFsbEludmVyc2VTdWJPcHNUb1BsYW4ocGxhbiwgaW52ZXJzZVN1Yk9wcyk7XG4gICAgICAgIGlmICghcmV2ZXJ0RXJyLm9rKSB7XG4gICAgICAgICAgcmV0dXJuIHJldmVydEVycjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZTtcbiAgICAgIH1cbiAgICAgIHBsYW4gPSBlLnZhbHVlLnBsYW47XG4gICAgICBpbnZlcnNlU3ViT3BzLnVuc2hpZnQoZS52YWx1ZS5pbnZlcnNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IG5ldyBPcChpbnZlcnNlU3ViT3BzKSxcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBBbGxPcHNSZXN1bHQgPSB7XG4gIG9wczogT3BbXTtcbiAgcGxhbjogUGxhbjtcbn07XG5cbmNvbnN0IGFwcGx5QWxsSW52ZXJzZU9wc1RvUGxhbiA9IChpbnZlcnNlczogT3BbXSwgcGxhbjogUGxhbik6IFJlc3VsdDxQbGFuPiA9PiB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaW52ZXJzZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCByZXMgPSBpbnZlcnNlc1tpXS5hcHBseShwbGFuKTtcbiAgICBpZiAoIXJlcy5vaykge1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgcGxhbiA9IHJlcy52YWx1ZS5wbGFuO1xuICB9XG5cbiAgcmV0dXJuIG9rKHBsYW4pO1xufTtcblxuLy8gQ29udmVuaWVuY2UgZnVuY3Rpb24gZm9yIGFwcGx5aW5nIG11bHRpcGxlIE9wcyB0byBhIHBsYW4sIHVzZWQgbW9zdGx5IGZvclxuLy8gdGVzdGluZy5cbmV4cG9ydCBjb25zdCBhcHBseUFsbE9wc1RvUGxhbiA9IChcbiAgb3BzOiBPcFtdLFxuICBwbGFuOiBQbGFuXG4pOiBSZXN1bHQ8QWxsT3BzUmVzdWx0PiA9PiB7XG4gIGNvbnN0IGludmVyc2VzOiBPcFtdID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcmVzID0gb3BzW2ldLmFwcGx5KHBsYW4pO1xuICAgIGlmICghcmVzLm9rKSB7XG4gICAgICBjb25zdCBpbnZlcnNlUmVzID0gYXBwbHlBbGxJbnZlcnNlT3BzVG9QbGFuKGludmVyc2VzLCBwbGFuKTtcbiAgICAgIGlmICghaW52ZXJzZVJlcy5vaykge1xuICAgICAgICAvLyBUT0RPIENhbiB3ZSB3cmFwIHRoZSBFcnJvciBpbiBhbm90aGVyIGVycm9yIHRvIG1ha2UgaXQgY2xlYXIgdGhpc1xuICAgICAgICAvLyBlcnJvciBoYXBwZW5lZCB3aGVuIHRyeWluZyB0byBjbGVhbiB1cCBmcm9tIHRoZSBwcmV2aW91cyBFcnJvciB3aGVuXG4gICAgICAgIC8vIHRoZSBhcHBseSgpIGZhaWxlZC5cbiAgICAgICAgcmV0dXJuIGludmVyc2VSZXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH1cbiAgICBpbnZlcnNlcy51bnNoaWZ0KHJlcy52YWx1ZS5pbnZlcnNlKTtcbiAgICBwbGFuID0gcmVzLnZhbHVlLnBsYW47XG4gIH1cblxuICByZXR1cm4gb2soe1xuICAgIG9wczogaW52ZXJzZXMsXG4gICAgcGxhbjogcGxhbixcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgYXBwbHlBbGxPcHNUb1BsYW5BbmRUaGVuSW52ZXJzZSA9IChcbiAgb3BzOiBPcFtdLFxuICBwbGFuOiBQbGFuXG4pOiBSZXN1bHQ8QWxsT3BzUmVzdWx0PiA9PiB7XG4gIGNvbnN0IHJlcyA9IGFwcGx5QWxsT3BzVG9QbGFuKG9wcywgcGxhbik7XG4gIGlmICghcmVzLm9rKSB7XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICByZXR1cm4gYXBwbHlBbGxPcHNUb1BsYW4ocmVzLnZhbHVlLm9wcywgcmVzLnZhbHVlLnBsYW4pO1xufTtcbi8vIE5vT3AgaXMgYSBuby1vcC5cbmV4cG9ydCBmdW5jdGlvbiBOb09wKCk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbXSk7XG59XG4iLCAiaW1wb3J0IHsgUmVzdWx0LCBvaywgZXJyb3IgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBEaXJlY3RlZEVkZ2UsIGVkZ2VzQnlTcmNBbmREc3RUb01hcCB9IGZyb20gXCIuLi9kYWcvZGFnLnRzXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhbi50c1wiO1xuaW1wb3J0IHsgQ2hhcnQsIFRhc2tTdGF0ZSB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgT3AsIFN1Yk9wLCBTdWJPcFJlc3VsdCB9IGZyb20gXCIuL29wcy50c1wiO1xuXG4vKiogQSB2YWx1ZSBvZiAtMSBmb3IgaiBtZWFucyB0aGUgRmluaXNoIE1pbGVzdG9uZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBEaXJlY3RlZEVkZ2VGb3JQbGFuKFxuICBpOiBudW1iZXIsXG4gIGo6IG51bWJlcixcbiAgcGxhbjogUGxhblxuKTogUmVzdWx0PERpcmVjdGVkRWRnZT4ge1xuICBjb25zdCBjaGFydCA9IHBsYW4uY2hhcnQ7XG4gIGlmIChqID09PSAtMSkge1xuICAgIGogPSBjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICB9XG4gIGlmIChpIDwgMCB8fCBpID49IGNoYXJ0LlZlcnRpY2VzLmxlbmd0aCkge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIGBpIGluZGV4IG91dCBvZiByYW5nZTogJHtpfSBub3QgaW4gWzAsICR7Y2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMX1dYFxuICAgICk7XG4gIH1cbiAgaWYgKGogPCAwIHx8IGogPj0gY2hhcnQuVmVydGljZXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGVycm9yKFxuICAgICAgYGogaW5kZXggb3V0IG9mIHJhbmdlOiAke2p9IG5vdCBpbiBbMCwgJHtjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxfV1gXG4gICAgKTtcbiAgfVxuICBpZiAoaSA9PT0gaikge1xuICAgIHJldHVybiBlcnJvcihgQSBUYXNrIGNhbiBub3QgZGVwZW5kIG9uIGl0c2VsZjogJHtpfSA9PT0gJHtqfWApO1xuICB9XG4gIHJldHVybiBvayhuZXcgRGlyZWN0ZWRFZGdlKGksIGopKTtcbn1cblxuZXhwb3J0IGNsYXNzIEFkZEVkZ2VTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaTogbnVtYmVyID0gMDtcbiAgajogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpOiBudW1iZXIsIGo6IG51bWJlcikge1xuICAgIHRoaXMuaSA9IGk7XG4gICAgdGhpcy5qID0gajtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBpZiAodGhpcy5pID09PSAtMSkge1xuICAgICAgdGhpcy5pID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICAgIH1cbiAgICBpZiAodGhpcy5qID09PSAtMSkge1xuICAgICAgdGhpcy5qID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICAgIH1cblxuICAgIGNvbnN0IGUgPSBEaXJlY3RlZEVkZ2VGb3JQbGFuKHRoaXMuaSwgdGhpcy5qLCBwbGFuKTtcbiAgICBpZiAoIWUub2spIHtcbiAgICAgIHJldHVybiBlO1xuICAgIH1cblxuICAgIC8vIE9ubHkgYWRkIHRoZSBlZGdlIGlmIGl0IGRvZXNuJ3QgZXhpc3RzIGFscmVhZHkuXG4gICAgaWYgKCFwbGFuLmNoYXJ0LkVkZ2VzLmZpbmQoKHZhbHVlOiBEaXJlY3RlZEVkZ2UpID0+IHZhbHVlLmVxdWFsKGUudmFsdWUpKSkge1xuICAgICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKGUudmFsdWUpO1xuICAgIH1cblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCksXG4gICAgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFJlbW92ZUVkZ2VTdXBPcCh0aGlzLmksIHRoaXMuaik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbW92ZUVkZ2VTdXBPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaTogbnVtYmVyID0gMDtcbiAgajogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpOiBudW1iZXIsIGo6IG51bWJlcikge1xuICAgIHRoaXMuaSA9IGk7XG4gICAgdGhpcy5qID0gajtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBpZiAodGhpcy5pID09PSAtMSkge1xuICAgICAgdGhpcy5pID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICAgIH1cbiAgICBpZiAodGhpcy5qID09PSAtMSkge1xuICAgICAgdGhpcy5qID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICAgIH1cblxuICAgIGNvbnN0IGUgPSBEaXJlY3RlZEVkZ2VGb3JQbGFuKHRoaXMuaSwgdGhpcy5qLCBwbGFuKTtcbiAgICBpZiAoIWUub2spIHtcbiAgICAgIHJldHVybiBlO1xuICAgIH1cbiAgICBwbGFuLmNoYXJ0LkVkZ2VzID0gcGxhbi5jaGFydC5FZGdlcy5maWx0ZXIoXG4gICAgICAodjogRGlyZWN0ZWRFZGdlKTogYm9vbGVhbiA9PiAhdi5lcXVhbChlLnZhbHVlKVxuICAgICk7XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpLFxuICAgIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBBZGRFZGdlU3ViT3AodGhpcy5pLCB0aGlzLmopO1xuICB9XG59XG5cbmZ1bmN0aW9uIGluZGV4SW5SYW5nZUZvclZlcnRpY2VzKGluZGV4OiBudW1iZXIsIGNoYXJ0OiBDaGFydCk6IFJlc3VsdDxudWxsPiB7XG4gIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPiBjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAyKSB7XG4gICAgcmV0dXJuIGVycm9yKGAke2luZGV4fSBpcyBub3QgaW4gcmFuZ2UgWzAsICR7Y2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMn1dYCk7XG4gIH1cbiAgcmV0dXJuIG9rKG51bGwpO1xufVxuXG5mdW5jdGlvbiBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlc0V4Y2x1c2l2ZShcbiAgaW5kZXg6IG51bWJlcixcbiAgY2hhcnQ6IENoYXJ0XG4pOiBSZXN1bHQ8bnVsbD4ge1xuICBpZiAoaW5kZXggPCAxIHx8IGluZGV4ID4gY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMikge1xuICAgIHJldHVybiBlcnJvcihgJHtpbmRleH0gaXMgbm90IGluIHJhbmdlIFsxLCAke2NoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDJ9XWApO1xuICB9XG4gIHJldHVybiBvayhudWxsKTtcbn1cblxuZXhwb3J0IGNsYXNzIEFkZFRhc2tBZnRlclN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBpbmRleDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGNoYXJ0ID0gcGxhbi5jaGFydDtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLmluZGV4LCBjaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuc3BsaWNlKHRoaXMuaW5kZXggKyAxLCAwLCBwbGFuLm5ld1Rhc2soKSk7XG5cbiAgICAvLyBVcGRhdGUgRWRnZXMuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFydC5FZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZWRnZSA9IGNoYXJ0LkVkZ2VzW2ldO1xuICAgICAgaWYgKGVkZ2UuaSA+PSB0aGlzLmluZGV4ICsgMSkge1xuICAgICAgICBlZGdlLmkrKztcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlLmogPj0gdGhpcy5pbmRleCArIDEpIHtcbiAgICAgICAgZWRnZS5qKys7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBEZWxldGVUYXNrU3ViT3AodGhpcy5pbmRleCArIDEpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEdXBUYXNrU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGluZGV4OiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGluZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgY2hhcnQgPSBwbGFuLmNoYXJ0O1xuICAgIGNvbnN0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzRXhjbHVzaXZlKHRoaXMuaW5kZXgsIGNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBjb25zdCBjb3B5ID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLmluZGV4XS5kdXAoKTtcbiAgICAvLyBJbnNlcnQgdGhlIGR1cGxpY2F0ZSBpbW1lZGlhdGVseSBhZnRlciB0aGUgVGFzayBpdCBpcyBjb3BpZWQgZnJvbS5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLnNwbGljZSh0aGlzLmluZGV4LCAwLCBjb3B5KTtcblxuICAgIC8vIFVwZGF0ZSBFZGdlcy5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJ0LkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlZGdlID0gY2hhcnQuRWRnZXNbaV07XG4gICAgICBpZiAoZWRnZS5pID4gdGhpcy5pbmRleCkge1xuICAgICAgICBlZGdlLmkrKztcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlLmogPiB0aGlzLmluZGV4KSB7XG4gICAgICAgIGVkZ2UuaisrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlVGFza1N1Yk9wKHRoaXMuaW5kZXggKyAxKTtcbiAgfVxufVxuXG50eXBlIFN1YnN0aXR1dGlvbiA9IE1hcDxEaXJlY3RlZEVkZ2UsIERpcmVjdGVkRWRnZT47XG5cbmV4cG9ydCBjbGFzcyBNb3ZlQWxsT3V0Z29pbmdFZGdlc0Zyb21Ub1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBmcm9tVGFza0luZGV4OiBudW1iZXIgPSAwO1xuICB0b1Rhc2tJbmRleDogbnVtYmVyID0gMDtcbiAgYWN0dWFsTW92ZXM6IFN1YnN0aXR1dGlvbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBmcm9tVGFza0luZGV4OiBudW1iZXIsXG4gICAgdG9UYXNrSW5kZXg6IG51bWJlcixcbiAgICBhY3R1YWxNb3ZlczogU3Vic3RpdHV0aW9uID0gbmV3IE1hcCgpXG4gICkge1xuICAgIHRoaXMuZnJvbVRhc2tJbmRleCA9IGZyb21UYXNrSW5kZXg7XG4gICAgdGhpcy50b1Rhc2tJbmRleCA9IHRvVGFza0luZGV4O1xuICAgIHRoaXMuYWN0dWFsTW92ZXMgPSBhY3R1YWxNb3ZlcztcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBjaGFydCA9IHBsYW4uY2hhcnQ7XG4gICAgbGV0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzRXhjbHVzaXZlKHRoaXMuZnJvbVRhc2tJbmRleCwgY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlc0V4Y2x1c2l2ZSh0aGlzLnRvVGFza0luZGV4LCBjaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYWN0dWFsTW92ZXMudmFsdWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc3QgYWN0dWFsTW92ZXM6IFN1YnN0aXR1dGlvbiA9IG5ldyBNYXAoKTtcbiAgICAgIC8vIFVwZGF0ZSBhbGwgRWRnZXMgdGhhdCBzdGFydCBhdCAnZnJvbVRhc2tJbmRleCcgYW5kIGNoYW5nZSB0aGUgc3RhcnQgdG8gJ3RvVGFza0luZGV4Jy5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hhcnQuRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZWRnZSA9IGNoYXJ0LkVkZ2VzW2ldO1xuICAgICAgICAvLyBTa2lwIHRoZSBjb3JuZXIgY2FzZSB0aGVyZSBmcm9tVGFza0luZGV4IHBvaW50cyB0byBUYXNrSW5kZXguXG4gICAgICAgIGlmIChlZGdlLmkgPT09IHRoaXMuZnJvbVRhc2tJbmRleCAmJiBlZGdlLmogPT09IHRoaXMudG9UYXNrSW5kZXgpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlZGdlLmkgPT09IHRoaXMuZnJvbVRhc2tJbmRleCkge1xuICAgICAgICAgIGFjdHVhbE1vdmVzLnNldChcbiAgICAgICAgICAgIG5ldyBEaXJlY3RlZEVkZ2UodGhpcy50b1Rhc2tJbmRleCwgZWRnZS5qKSxcbiAgICAgICAgICAgIG5ldyBEaXJlY3RlZEVkZ2UoZWRnZS5pLCBlZGdlLmopXG4gICAgICAgICAgKTtcbiAgICAgICAgICBlZGdlLmkgPSB0aGlzLnRvVGFza0luZGV4O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gb2soe1xuICAgICAgICBwbGFuOiBwbGFuLFxuICAgICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UoXG4gICAgICAgICAgdGhpcy50b1Rhc2tJbmRleCxcbiAgICAgICAgICB0aGlzLmZyb21UYXNrSW5kZXgsXG4gICAgICAgICAgYWN0dWFsTW92ZXNcbiAgICAgICAgKSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJ0LkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG5ld0VkZ2UgPSB0aGlzLmFjdHVhbE1vdmVzLmdldChwbGFuLmNoYXJ0LkVkZ2VzW2ldKTtcbiAgICAgICAgaWYgKG5ld0VkZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHBsYW4uY2hhcnQuRWRnZXNbaV0gPSBuZXdFZGdlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvayh7XG4gICAgICAgIHBsYW46IHBsYW4sXG4gICAgICAgIGludmVyc2U6IG5ldyBNb3ZlQWxsT3V0Z29pbmdFZGdlc0Zyb21Ub1N1Yk9wKFxuICAgICAgICAgIHRoaXMudG9UYXNrSW5kZXgsXG4gICAgICAgICAgdGhpcy5mcm9tVGFza0luZGV4XG4gICAgICAgICksXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBpbnZlcnNlKFxuICAgIHRvVGFza0luZGV4OiBudW1iZXIsXG4gICAgZnJvbVRhc2tJbmRleDogbnVtYmVyLFxuICAgIGFjdHVhbE1vdmVzOiBTdWJzdGl0dXRpb25cbiAgKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgTW92ZUFsbE91dGdvaW5nRWRnZXNGcm9tVG9TdWJPcChcbiAgICAgIHRvVGFza0luZGV4LFxuICAgICAgZnJvbVRhc2tJbmRleCxcbiAgICAgIGFjdHVhbE1vdmVzXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29weUFsbEVkZ2VzRnJvbVRvU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGZyb21JbmRleDogbnVtYmVyID0gMDtcbiAgdG9JbmRleDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3Rvcihmcm9tSW5kZXg6IG51bWJlciwgdG9JbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5mcm9tSW5kZXggPSBmcm9tSW5kZXg7XG4gICAgdGhpcy50b0luZGV4ID0gdG9JbmRleDtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLmZyb21JbmRleCwgcGxhbi5jaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgY29uc3QgbmV3RWRnZXM6IERpcmVjdGVkRWRnZVtdID0gW107XG4gICAgcGxhbi5jaGFydC5FZGdlcy5mb3JFYWNoKChlZGdlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICAgIGlmIChlZGdlLmkgPT09IHRoaXMuZnJvbUluZGV4KSB7XG4gICAgICAgIG5ld0VkZ2VzLnB1c2gobmV3IERpcmVjdGVkRWRnZSh0aGlzLnRvSW5kZXgsIGVkZ2UuaikpO1xuICAgICAgfVxuICAgICAgaWYgKGVkZ2UuaiA9PT0gdGhpcy5mcm9tSW5kZXgpIHtcbiAgICAgICAgbmV3RWRnZXMucHVzaChuZXcgRGlyZWN0ZWRFZGdlKGVkZ2UuaSwgdGhpcy50b0luZGV4KSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKC4uLm5ld0VkZ2VzKTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IG5ldyBSZW1vdmVBbGxFZGdlc1N1Yk9wKG5ld0VkZ2VzKSB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVtb3ZlQWxsRWRnZXNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVtdO1xuXG4gIGNvbnN0cnVjdG9yKGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSkge1xuICAgIHRoaXMuZWRnZXMgPSBlZGdlcztcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBwbGFuLmNoYXJ0LkVkZ2VzID0gcGxhbi5jaGFydC5FZGdlcy5maWx0ZXIoXG4gICAgICAoZWRnZTogRGlyZWN0ZWRFZGdlKSA9PlxuICAgICAgICAtMSA9PT1cbiAgICAgICAgdGhpcy5lZGdlcy5maW5kSW5kZXgoKHRvQmVSZW1vdmVkOiBEaXJlY3RlZEVkZ2UpID0+XG4gICAgICAgICAgZWRnZS5lcXVhbCh0b0JlUmVtb3ZlZClcbiAgICAgICAgKVxuICAgICk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiBuZXcgQWRkQWxsRWRnZXNTdWJPcCh0aGlzLmVkZ2VzKSB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQWRkQWxsRWRnZXNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVtdO1xuXG4gIGNvbnN0cnVjdG9yKGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSkge1xuICAgIHRoaXMuZWRnZXMgPSBlZGdlcztcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBwbGFuLmNoYXJ0LkVkZ2VzLnB1c2goLi4udGhpcy5lZGdlcyk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiBuZXcgUmVtb3ZlQWxsRWRnZXNTdWJPcCh0aGlzLmVkZ2VzKSB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVsZXRlVGFza1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBpbmRleDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGNoYXJ0ID0gcGxhbi5jaGFydDtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLmluZGV4LCBjaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGNoYXJ0LlZlcnRpY2VzLnNwbGljZSh0aGlzLmluZGV4LCAxKTtcblxuICAgIC8vIFVwZGF0ZSBFZGdlcy5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJ0LkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlZGdlID0gY2hhcnQuRWRnZXNbaV07XG4gICAgICBpZiAoZWRnZS5pID4gdGhpcy5pbmRleCkge1xuICAgICAgICBlZGdlLmktLTtcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlLmogPiB0aGlzLmluZGV4KSB7XG4gICAgICAgIGVkZ2Uuai0tO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBBZGRUYXNrQWZ0ZXJTdWJPcCh0aGlzLmluZGV4IC0gMSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJhdGlvbmFsaXplRWRnZXNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBzcmNBbmREc3QgPSBlZGdlc0J5U3JjQW5kRHN0VG9NYXAocGxhbi5jaGFydC5FZGdlcyk7XG4gICAgY29uc3QgU3RhcnQgPSAwO1xuICAgIGNvbnN0IEZpbmlzaCA9IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcblxuICAgIC8vIGxvb3Agb3ZlciBhbGwgdmVydGljcyBmcm9tIFtTdGFydCwgRmluaXNoKSBhbmQgbG9vayBmb3IgdGhlaXJcbiAgICAvLyBkZXN0aW5hdGlvbnMuIElmIHRoZXkgaGF2ZSBub25lIHRoZW4gYWRkIGluIGFuIGVkZ2UgdG8gRmluaXNoLiBJZiB0aGV5XG4gICAgLy8gaGF2ZSBtb3JlIHRoYW4gb25lIHRoZW4gcmVtb3ZlIGFueSBsaW5rcyB0byBGaW5pc2guXG4gICAgZm9yIChsZXQgaSA9IFN0YXJ0OyBpIDwgRmluaXNoOyBpKyspIHtcbiAgICAgIGNvbnN0IGRlc3RpbmF0aW9ucyA9IHNyY0FuZERzdC5ieVNyYy5nZXQoaSk7XG4gICAgICBpZiAoZGVzdGluYXRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKG5ldyBEaXJlY3RlZEVkZ2UoaSwgRmluaXNoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBcmUgdGhlcmUgYW55IHVuZWVkZWQgRWdkZXMgdG8gRmluaXNoPyBJZiBzbyBmaWx0ZXIgdGhlbSBvdXQuXG4gICAgICAgIGlmIChcbiAgICAgICAgICBkZXN0aW5hdGlvbnMubGVuZ3RoID4gMSAmJlxuICAgICAgICAgIGRlc3RpbmF0aW9ucy5maW5kKCh2YWx1ZTogRGlyZWN0ZWRFZGdlKSA9PiB2YWx1ZS5qID09PSBGaW5pc2gpXG4gICAgICAgICkge1xuICAgICAgICAgIGNvbnN0IHRvQmVSZW1vdmVkID0gbmV3IERpcmVjdGVkRWRnZShpLCBGaW5pc2gpO1xuICAgICAgICAgIHBsYW4uY2hhcnQuRWRnZXMgPSBwbGFuLmNoYXJ0LkVkZ2VzLmZpbHRlcihcbiAgICAgICAgICAgICh2YWx1ZTogRGlyZWN0ZWRFZGdlKSA9PiAhdG9CZVJlbW92ZWQuZXF1YWwodmFsdWUpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGxvb3Agb3ZlciBhbGwgdmVydGljcyBmcm9tKFN0YXJ0LCBGaW5pc2hdIGFuZCBsb29rIGZvciB0aGVpciBzb3VyY2VzLiBJZlxuICAgIC8vIHRoZXkgaGF2ZSBub25lIHRoZW4gYWRkIGluIGFuIGVkZ2UgZnJvbSBTdGFydC4gSWYgdGhleSBoYXZlIG1vcmUgdGhhbiBvbmVcbiAgICAvLyB0aGVuIHJlbW92ZSBhbnkgbGlua3MgZnJvbSBTdGFydC5cbiAgICBmb3IgKGxldCBpID0gU3RhcnQgKyAxOyBpIDwgRmluaXNoOyBpKyspIHtcbiAgICAgIGNvbnN0IGRlc3RpbmF0aW9ucyA9IHNyY0FuZERzdC5ieURzdC5nZXQoaSk7XG4gICAgICBpZiAoZGVzdGluYXRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKG5ldyBEaXJlY3RlZEVkZ2UoU3RhcnQsIGkpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEFyZSB0aGVyZSBhbnkgdW4tbmVlZGVkIEVnZGVzIGZyb20gU3RhcnQ/IElmIHNvIGZpbHRlciB0aGVtIG91dC5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIGRlc3RpbmF0aW9ucy5sZW5ndGggPiAxICYmXG4gICAgICAgICAgZGVzdGluYXRpb25zLmZpbmQoKHZhbHVlOiBEaXJlY3RlZEVkZ2UpID0+IHZhbHVlLmkgPT09IFN0YXJ0KVxuICAgICAgICApIHtcbiAgICAgICAgICBjb25zdCB0b0JlUmVtb3ZlZCA9IG5ldyBEaXJlY3RlZEVkZ2UoU3RhcnQsIGkpO1xuICAgICAgICAgIHBsYW4uY2hhcnQuRWRnZXMgPSBwbGFuLmNoYXJ0LkVkZ2VzLmZpbHRlcihcbiAgICAgICAgICAgICh2YWx1ZTogRGlyZWN0ZWRFZGdlKSA9PiAhdG9CZVJlbW92ZWQuZXF1YWwodmFsdWUpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAocGxhbi5jaGFydC5FZGdlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHBsYW4uY2hhcnQuRWRnZXMucHVzaChuZXcgRGlyZWN0ZWRFZGdlKFN0YXJ0LCBGaW5pc2gpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNldFRhc2tOYW1lU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIHRhc2tJbmRleDogbnVtYmVyO1xuICBuYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IodGFza0luZGV4OiBudW1iZXIsIG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMudGFza0luZGV4ID0gdGFza0luZGV4O1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXModGhpcy50YXNrSW5kZXgsIHBsYW4uY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICBjb25zdCBvbGROYW1lID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLnRhc2tJbmRleF0ubmFtZTtcbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMudGFza0luZGV4XS5uYW1lID0gdGhpcy5uYW1lO1xuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG9sZE5hbWUpLFxuICAgIH0pO1xuICB9XG5cbiAgaW52ZXJzZShvbGROYW1lOiBzdHJpbmcpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBTZXRUYXNrTmFtZVN1Yk9wKHRoaXMudGFza0luZGV4LCBvbGROYW1lKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2V0VGFza1N0YXRlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIHRhc2tTdGF0ZTogVGFza1N0YXRlO1xuICB0YXNrSW5kZXg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3Rvcih0YXNrSW5kZXg6IG51bWJlciwgdGFza1N0YXRlOiBUYXNrU3RhdGUpIHtcbiAgICB0aGlzLnRhc2tJbmRleCA9IHRhc2tJbmRleDtcbiAgICB0aGlzLnRhc2tTdGF0ZSA9IHRhc2tTdGF0ZTtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLnRhc2tJbmRleCwgcGxhbi5jaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGNvbnN0IG9sZFN0YXRlID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLnRhc2tJbmRleF0uc3RhdGU7XG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLnRhc2tJbmRleF0uc3RhdGUgPSB0aGlzLnRhc2tTdGF0ZTtcbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZShvbGRTdGF0ZSksXG4gICAgfSk7XG4gIH1cblxuICBpbnZlcnNlKHRhc2tTdGF0ZTogVGFza1N0YXRlKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgU2V0VGFza1N0YXRlU3ViT3AodGhpcy50YXNrSW5kZXgsIHRhc2tTdGF0ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEluc2VydE5ld0VtcHR5VGFza0FmdGVyT3AodGFza0luZGV4OiBudW1iZXIpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW1xuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgICBuZXcgQWRkVGFza0FmdGVyU3ViT3AodGFza0luZGV4KSxcbiAgICBuZXcgQWRkRWRnZVN1Yk9wKDAsIHRhc2tJbmRleCArIDEpLFxuICAgIG5ldyBBZGRFZGdlU3ViT3AodGFza0luZGV4ICsgMSwgLTEpLFxuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZXRUYXNrTmFtZU9wKHRhc2tJbmRleDogbnVtYmVyLCBuYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBTZXRUYXNrTmFtZVN1Yk9wKHRhc2tJbmRleCwgbmFtZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNldFRhc2tTdGF0ZU9wKHRhc2tJbmRleDogbnVtYmVyLCB0YXNrU3RhdGU6IFRhc2tTdGF0ZSk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFNldFRhc2tTdGF0ZVN1Yk9wKHRhc2tJbmRleCwgdGFza1N0YXRlKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU3BsaXRUYXNrT3AodGFza0luZGV4OiBudW1iZXIpOiBPcCB7XG4gIGNvbnN0IHN1Yk9wczogU3ViT3BbXSA9IFtcbiAgICBuZXcgRHVwVGFza1N1Yk9wKHRhc2tJbmRleCksXG4gICAgbmV3IEFkZEVkZ2VTdWJPcCh0YXNrSW5kZXgsIHRhc2tJbmRleCArIDEpLFxuICAgIG5ldyBNb3ZlQWxsT3V0Z29pbmdFZGdlc0Zyb21Ub1N1Yk9wKHRhc2tJbmRleCwgdGFza0luZGV4ICsgMSksXG4gIF07XG5cbiAgcmV0dXJuIG5ldyBPcChzdWJPcHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRHVwVGFza09wKHRhc2tJbmRleDogbnVtYmVyKTogT3Age1xuICBjb25zdCBzdWJPcHM6IFN1Yk9wW10gPSBbXG4gICAgbmV3IER1cFRhc2tTdWJPcCh0YXNrSW5kZXgpLFxuICAgIG5ldyBDb3B5QWxsRWRnZXNGcm9tVG9TdWJPcCh0YXNrSW5kZXgsIHRhc2tJbmRleCArIDEpLFxuICBdO1xuXG4gIHJldHVybiBuZXcgT3Aoc3ViT3BzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFkZEVkZ2VPcChmcm9tVGFza0luZGV4OiBudW1iZXIsIHRvVGFza0luZGV4OiBudW1iZXIpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW1xuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgICBuZXcgQWRkRWRnZVN1Yk9wKGZyb21UYXNrSW5kZXgsIHRvVGFza0luZGV4KSxcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gIF0pO1xufVxuIiwgIi8vIENoYW5nZU1ldHJpY1ZhbHVlXG5cbmltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IE1ldHJpY0RlZmluaXRpb24gfSBmcm9tIFwiLi4vbWV0cmljcy9tZXRyaWNzLnRzXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhbi50c1wiO1xuaW1wb3J0IHsgUmVzdWx0LCBlcnJvciwgb2sgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBPcCwgU3ViT3AsIFN1Yk9wUmVzdWx0IH0gZnJvbSBcIi4vb3BzLnRzXCI7XG5cbmV4cG9ydCBjbGFzcyBBZGRNZXRyaWNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgbmFtZTogc3RyaW5nO1xuICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uO1xuXG4gIC8vIE1hcHMgYW4gaW5kZXggb2YgYSBUYXNrIHRvIGEgdmFsdWUgZm9yIHRoZSBnaXZlbiBtZXRyaWMga2V5LlxuICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uLFxuICAgIHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCkgLy8gU2hvdWxkIG9ubHkgYmUgc3VwcGxpZWQgYnkgaW52ZXJzZSBhY3Rpb25zLlxuICApIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbiA9IG1ldHJpY0RlZmluaXRpb247XG4gICAgdGhpcy50YXNrTWV0cmljVmFsdWVzID0gdGFza01ldHJpY1ZhbHVlcztcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBpZiAocGxhbi5tZXRyaWNEZWZpbml0aW9ucy5oYXModGhpcy5uYW1lKSkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmFtZX0gYWxyZWFkeSBleGlzdHMgYXMgYSBNZXRyaWNgKTtcbiAgICB9XG5cbiAgICBwbGFuLm1ldHJpY0RlZmluaXRpb25zLnNldCh0aGlzLm5hbWUsIHRoaXMubWV0cmljRGVmaW5pdGlvbik7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIGFkZCB0aGlzIG1ldHJpYyBhbmQgc2V0IGl0IHRvIHRoZSBkZWZhdWx0LFxuICAgIC8vIHVubGVzcyB0aGVyZSBpcyBtYXRjaGluZyBlbnRyeSBpbiB0YXNrTWV0cmljVmFsdWVzLCBpbiB3aGljaCBjYXNlIHdlIHdpbGxcbiAgICAvLyB1c2UgdGhhdCB2YWx1ZSwgaS5lLiB0aGlzIEFkZE1ldHJpY1N1Yk9wIGlzIGFjdHVhbGx5IGEgcmV2ZXJ0IG9mIGFcbiAgICAvLyBEZWxldGVNZXRyaWNTdWJPcC5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIHRhc2subWV0cmljcy5zZXQoXG4gICAgICAgIHRoaXMubmFtZSxcbiAgICAgICAgdGhpcy50YXNrTWV0cmljVmFsdWVzLmdldChpbmRleCkgfHwgdGhpcy5tZXRyaWNEZWZpbml0aW9uLmRlZmF1bHRcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlTWV0cmljU3ViT3AodGhpcy5uYW1lKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVsZXRlTWV0cmljU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG5hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IG1ldHJpY0RlZmluaXRpb24gPSBwbGFuLm1ldHJpY0RlZmluaXRpb25zLmdldCh0aGlzLm5hbWUpO1xuXG4gICAgaWYgKG1ldHJpY0RlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgVGhlIG1ldHJpYyB3aXRoIG5hbWUgJHt0aGlzLm5hbWV9IGRvZXMgbm90IGV4aXN0IGFuZCBjYW4ndCBiZSBkZWxldGVkLmBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKG1ldHJpY0RlZmluaXRpb24uaXNTdGF0aWMpIHtcbiAgICAgIHJldHVybiBlcnJvcihgVGhlIHN0YXRpYyBNZXRyaWMgJHt0aGlzLm5hbWV9IGNhbid0IGJlIGRlbGV0ZWQuYCk7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGZyb20gcmVzb3VyY2UgZGVmaW5pdGlvbnMuXG4gICAgcGxhbi5tZXRyaWNEZWZpbml0aW9ucy5kZWxldGUodGhpcy5uYW1lKTtcblxuICAgIGNvbnN0IHRhc2tJbmRleFRvRGVsZXRlZE1ldHJpY1ZhbHVlOiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpO1xuXG4gICAgLy8gTm93IGxvb2sgYXQgYWxsIFRhc2tzIGFuZCByZW1vdmUgYHRoaXMubmFtZWAgZnJvbSB0aGUgbWV0cmljIHdoaWxlIGFsc29cbiAgICAvLyBidWlsZGluZyB1cCB0aGUgaW5mbyBuZWVkZWQgZm9yIGEgcmV2ZXJ0LlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSB0YXNrLm1ldHJpY3MuZ2V0KHRoaXMubmFtZSk7XG4gICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0YXNrSW5kZXhUb0RlbGV0ZWRNZXRyaWNWYWx1ZS5zZXQoaW5kZXgsIHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHRhc2subWV0cmljcy5kZWxldGUodGhpcy5uYW1lKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG1ldHJpY0RlZmluaXRpb24sIHRhc2tJbmRleFRvRGVsZXRlZE1ldHJpY1ZhbHVlKSxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgaW52ZXJzZShcbiAgICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uLFxuICAgIG1ldHJpY1ZhbHVlc0ZvckRlbGV0ZWRSZXNvdXJjZU5hbWU6IE1hcDxudW1iZXIsIG51bWJlcj5cbiAgKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgQWRkTWV0cmljU3ViT3AoXG4gICAgICB0aGlzLm5hbWUsXG4gICAgICBtZXRyaWNEZWZpbml0aW9uLFxuICAgICAgbWV0cmljVmFsdWVzRm9yRGVsZXRlZFJlc291cmNlTmFtZVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbmFtZU1ldHJpY1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBvbGROYW1lOiBzdHJpbmc7XG4gIG5ld05hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihvbGROYW1lOiBzdHJpbmcsIG5ld05hbWU6IHN0cmluZykge1xuICAgIHRoaXMub2xkTmFtZSA9IG9sZE5hbWU7XG4gICAgdGhpcy5uZXdOYW1lID0gbmV3TmFtZTtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBpZiAocGxhbi5tZXRyaWNEZWZpbml0aW9ucy5oYXModGhpcy5uZXdOYW1lKSkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmV3TmFtZX0gYWxyZWFkeSBleGlzdHMgYXMgYSBtZXRyaWMuYCk7XG4gICAgfVxuXG4gICAgY29uc3QgbWV0cmljRGVmaW5pdGlvbiA9IHBsYW4ubWV0cmljRGVmaW5pdGlvbnMuZ2V0KHRoaXMub2xkTmFtZSk7XG4gICAgaWYgKG1ldHJpY0RlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMub2xkTmFtZX0gZG9lcyBub3QgZXhpc3QgYXMgYSBNZXRyaWNgKTtcbiAgICB9XG4gICAgaWYgKG1ldHJpY0RlZmluaXRpb24uaXNTdGF0aWMpIHtcbiAgICAgIHJldHVybiBlcnJvcihgU3RhdGljIG1ldHJpYyAke3RoaXMub2xkTmFtZX0gY2FuJ3QgYmUgcmVuYW1lZC5gKTtcbiAgICB9XG5cbiAgICBwbGFuLm1ldHJpY0RlZmluaXRpb25zLnNldCh0aGlzLm5ld05hbWUsIG1ldHJpY0RlZmluaXRpb24pO1xuICAgIHBsYW4ubWV0cmljRGVmaW5pdGlvbnMuZGVsZXRlKHRoaXMub2xkTmFtZSk7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIHJlbmFtZSB0aGlzIG1ldHJpYy5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2spID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGFzay5tZXRyaWNzLmdldCh0aGlzLm9sZE5hbWUpIHx8IG1ldHJpY0RlZmluaXRpb24uZGVmYXVsdDtcbiAgICAgIHRhc2subWV0cmljcy5zZXQodGhpcy5uZXdOYW1lLCB2YWx1ZSk7XG4gICAgICB0YXNrLm1ldHJpY3MuZGVsZXRlKHRoaXMub2xkTmFtZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgUmVuYW1lTWV0cmljU3ViT3AodGhpcy5uZXdOYW1lLCB0aGlzLm9sZE5hbWUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBVcGRhdGVNZXRyaWNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgbmFtZTogc3RyaW5nO1xuICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uO1xuXG4gIC8vIE1hcHMgYW4gaW5kZXggb2YgYSBUYXNrIHRvIGEgdmFsdWUgZm9yIHRoZSBnaXZlbiBtZXRyaWMga2V5LlxuICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uLFxuICAgIHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCkgLy8gU2hvdWxkIG9ubHkgYmUgc3VwcGxpZWQgYnkgaW52ZXJzZSBhY3Rpb25zLlxuICApIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbiA9IG1ldHJpY0RlZmluaXRpb247XG4gICAgdGhpcy50YXNrTWV0cmljVmFsdWVzID0gdGFza01ldHJpY1ZhbHVlcztcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBvbGRNZXRyaWNEZWZpbml0aW9uID0gcGxhbi5tZXRyaWNEZWZpbml0aW9ucy5nZXQodGhpcy5uYW1lKTtcbiAgICBpZiAob2xkTWV0cmljRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5uYW1lfSBkb2VzIG5vdCBleGlzdCBhcyBhIE1ldHJpY2ApO1xuICAgIH1cbiAgICBpZiAob2xkTWV0cmljRGVmaW5pdGlvbi5pc1N0YXRpYykge1xuICAgICAgcmV0dXJuIGVycm9yKGBTdGF0aWMgbWV0cmljICR7dGhpcy5uYW1lfSBjYW4ndCBiZSB1cGRhdGVkLmApO1xuICAgIH1cblxuICAgIHBsYW4ubWV0cmljRGVmaW5pdGlvbnMuc2V0KHRoaXMubmFtZSwgdGhpcy5tZXRyaWNEZWZpbml0aW9uKTtcblxuICAgIGNvbnN0IHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCk7XG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCB1cGRhdGUgdGhlIG1ldHJpYyB2YWx1ZXMgdG8gcmVmbGVjdCB0aGUgbmV3XG4gICAgLy8gbWV0cmljIGRlZmluaXRpb24sIHVubGVzcyB0aGVyZSBpcyBtYXRjaGluZyBlbnRyeSBpbiB0YXNrTWV0cmljVmFsdWVzLCBpblxuICAgIC8vIHdoaWNoIGNhc2Ugd2Ugd2lsbCB1c2UgdGhhdCB2YWx1ZSwgaS5lLiB0aGlzIFVwZGF0ZU1ldHJpY1N1Yk9wIGlzXG4gICAgLy8gYWN0dWFsbHkgYSByZXZlcnQgb2YgYW5vdGhlciBVcGRhdGVNZXRyaWNTdWJPcC5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IG9sZFZhbHVlID0gdGFzay5tZXRyaWNzLmdldCh0aGlzLm5hbWUpITtcblxuICAgICAgbGV0IG5ld1ZhbHVlOiBudW1iZXI7XG4gICAgICBpZiAodGhpcy50YXNrTWV0cmljVmFsdWVzLmhhcyhpbmRleCkpIHtcbiAgICAgICAgLy8gdGFza01ldHJpY1ZhbHVlcyBoYXMgYSB2YWx1ZSB0aGVuIHVzZSB0aGF0LCBhcyB0aGlzIGlzIGFuIGludmVyc2VcbiAgICAgICAgLy8gb3BlcmF0aW9uLlxuICAgICAgICBuZXdWYWx1ZSA9IHRoaXMudGFza01ldHJpY1ZhbHVlcy5nZXQoaW5kZXgpITtcbiAgICAgIH0gZWxzZSBpZiAob2xkVmFsdWUgPT09IG9sZE1ldHJpY0RlZmluaXRpb24uZGVmYXVsdCkge1xuICAgICAgICAvLyBJZiB0aGUgb2xkVmFsdWUgaXMgdGhlIGRlZmF1bHQsIGNoYW5nZSBpdCB0byB0aGUgbmV3IGRlZmF1bHQuXG4gICAgICAgIG5ld1ZhbHVlID0gdGhpcy5tZXRyaWNEZWZpbml0aW9uLmRlZmF1bHQ7XG4gICAgICAgIHRhc2tNZXRyaWNWYWx1ZXMuc2V0KGluZGV4LCBvbGRWYWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBDbGFtcC5cbiAgICAgICAgbmV3VmFsdWUgPSB0aGlzLm1ldHJpY0RlZmluaXRpb24ucmFuZ2UuY2xhbXAob2xkVmFsdWUpO1xuICAgICAgICB0YXNrTWV0cmljVmFsdWVzLnNldChpbmRleCwgb2xkVmFsdWUpO1xuICAgICAgfVxuICAgICAgdGFzay5tZXRyaWNzLnNldCh0aGlzLm5hbWUsIG5ld1ZhbHVlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG9sZE1ldHJpY0RlZmluaXRpb24sIHRhc2tNZXRyaWNWYWx1ZXMpLFxuICAgIH0pO1xuICB9XG5cbiAgaW52ZXJzZShcbiAgICBvbGRNZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uLFxuICAgIHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj5cbiAgKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgVXBkYXRlTWV0cmljU3ViT3AoXG4gICAgICB0aGlzLm5hbWUsXG4gICAgICBvbGRNZXRyaWNEZWZpbml0aW9uLFxuICAgICAgdGFza01ldHJpY1ZhbHVlc1xuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNldE1ldHJpY1ZhbHVlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG5hbWU6IHN0cmluZztcbiAgdmFsdWU6IG51bWJlcjtcbiAgdGFza0luZGV4OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCB2YWx1ZTogbnVtYmVyLCB0YXNrSW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMudGFza0luZGV4ID0gdGFza0luZGV4O1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IG1ldHJpY3NEZWZpbml0aW9uID0gcGxhbi5tZXRyaWNEZWZpbml0aW9ucy5nZXQodGhpcy5uYW1lKTtcbiAgICBpZiAobWV0cmljc0RlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmFtZX0gZG9lcyBub3QgZXhpc3QgYXMgYSBNZXRyaWNgKTtcbiAgICB9XG5cbiAgICBjb25zdCBtZXRyaWNzTWFwID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLnRhc2tJbmRleF0ubWV0cmljcztcbiAgICBjb25zdCBvbGRWYWx1ZSA9IG1ldHJpY3NNYXAuZ2V0KHRoaXMubmFtZSkgfHwgbWV0cmljc0RlZmluaXRpb24uZGVmYXVsdDtcbiAgICBtZXRyaWNzTWFwLnNldCh0aGlzLm5hbWUsIHRoaXMudmFsdWUpO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG9sZFZhbHVlKSB9KTtcbiAgfVxuXG4gIGludmVyc2UodmFsdWU6IG51bWJlcik6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFNldE1ldHJpY1ZhbHVlU3ViT3AodGhpcy5uYW1lLCB2YWx1ZSwgdGhpcy50YXNrSW5kZXgpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBZGRNZXRyaWNPcChcbiAgbmFtZTogc3RyaW5nLFxuICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uXG4pOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBBZGRNZXRyaWNTdWJPcChuYW1lLCBtZXRyaWNEZWZpbml0aW9uKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRGVsZXRlTWV0cmljT3AobmFtZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgRGVsZXRlTWV0cmljU3ViT3AobmFtZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJlbmFtZU1ldHJpY09wKG9sZE5hbWU6IHN0cmluZywgbmV3TmFtZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgUmVuYW1lTWV0cmljU3ViT3Aob2xkTmFtZSwgbmV3TmFtZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFVwZGF0ZU1ldHJpY09wKFxuICBuYW1lOiBzdHJpbmcsXG4gIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb25cbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFVwZGF0ZU1ldHJpY1N1Yk9wKG5hbWUsIG1ldHJpY0RlZmluaXRpb24pXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZXRNZXRyaWNWYWx1ZU9wKFxuICBuYW1lOiBzdHJpbmcsXG4gIHZhbHVlOiBudW1iZXIsXG4gIHRhc2tJbmRleDogbnVtYmVyXG4pOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBTZXRNZXRyaWNWYWx1ZVN1Yk9wKG5hbWUsIHZhbHVlLCB0YXNrSW5kZXgpXSk7XG59XG4iLCAiLy8gVXRpbGl0aWVzIGZvciBkZWFsaW5nIHdpdGggYSByYW5nZSBvZiBudW1iZXJzLlxuXG5leHBvcnQgY29uc3QgY2xhbXAgPSAoeDogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIpOiBudW1iZXIgPT4ge1xuICBpZiAoeCA+IG1heCkge1xuICAgIHJldHVybiBtYXg7XG4gIH1cbiAgaWYgKHggPCBtaW4pIHtcbiAgICByZXR1cm4gbWluO1xuICB9XG4gIHJldHVybiB4O1xufTtcblxuLy8gUmFuZ2UgZGVmaW5lcyBhIHJhbmdlIG9mIG51bWJlcnMsIGZyb20gW21pbiwgbWF4XSBpbmNsdXNpdmUuXG5leHBvcnQgY2xhc3MgTWV0cmljUmFuZ2Uge1xuICBwcml2YXRlIF9taW46IG51bWJlciA9IC1OdW1iZXIuTUFYX1ZBTFVFO1xuICBwcml2YXRlIF9tYXg6IG51bWJlciA9IE51bWJlci5NQVhfVkFMVUU7XG5cbiAgY29uc3RydWN0b3IobWluOiBudW1iZXIgPSAtTnVtYmVyLk1BWF9WQUxVRSwgbWF4OiBudW1iZXIgPSBOdW1iZXIuTUFYX1ZBTFVFKSB7XG4gICAgaWYgKG1heCA8IG1pbikge1xuICAgICAgW21pbiwgbWF4XSA9IFttYXgsIG1pbl07XG4gICAgfVxuICAgIHRoaXMuX21pbiA9IG1pbjtcbiAgICB0aGlzLl9tYXggPSBtYXg7XG4gIH1cblxuICBjbGFtcCh2YWx1ZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gY2xhbXAodmFsdWUsIHRoaXMuX21pbiwgdGhpcy5fbWF4KTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWluKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX21pbjtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWF4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX21heDtcbiAgfVxufVxuIiwgIi8vIE1ldHJpY3MgZGVmaW5lIGZsb2F0aW5nIHBvaW50IHZhbHVlcyB0aGF0IGFyZSB0cmFja2VkIHBlciBUYXNrLlxuXG5pbXBvcnQgeyBjbGFtcCwgTWV0cmljUmFuZ2UgfSBmcm9tIFwiLi9yYW5nZS50c1wiO1xuXG5leHBvcnQgY2xhc3MgTWV0cmljRGVmaW5pdGlvbiB7XG4gIHJhbmdlOiBNZXRyaWNSYW5nZTtcbiAgZGVmYXVsdDogbnVtYmVyO1xuICBpc1N0YXRpYzogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBkZWZhdWx0VmFsdWU6IG51bWJlcixcbiAgICByYW5nZTogTWV0cmljUmFuZ2UgPSBuZXcgTWV0cmljUmFuZ2UoKSxcbiAgICBpc1N0YXRpYzogYm9vbGVhbiA9IGZhbHNlXG4gICkge1xuICAgIHRoaXMucmFuZ2UgPSByYW5nZTtcbiAgICB0aGlzLmRlZmF1bHQgPSBjbGFtcChkZWZhdWx0VmFsdWUsIHJhbmdlLm1pbiwgcmFuZ2UubWF4KTtcbiAgICB0aGlzLmlzU3RhdGljID0gaXNTdGF0aWM7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgTWV0cmljRGVmaW5pdGlvbnMgPSBNYXA8c3RyaW5nLCBNZXRyaWNEZWZpbml0aW9uPjtcblxuZXhwb3J0IHR5cGUgTWV0cmljVmFsdWVzID0gTWFwPHN0cmluZywgbnVtYmVyPjtcbiIsICIvKipcbiAqIFRyaWFuZ3VsYXIgaXMgdGhlIGludmVyc2UgQ3VtdWxhdGl2ZSBEZW5zaXR5IEZ1bmN0aW9uIChDREYpIGZvciB0aGVcbiAqIHRyaWFuZ3VsYXIgZGlzdHJpYnV0aW9uLlxuICpcbiAqIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1RyaWFuZ3VsYXJfZGlzdHJpYnV0aW9uI0dlbmVyYXRpbmdfcmFuZG9tX3ZhcmlhdGVzXG4gKlxuICogVGhlIGludmVyc2Ugb2YgdGhlIENERiBpcyB1c2VmdWwgZm9yIGdlbmVyYXRpbmcgc2FtcGxlcyBmcm9tIHRoZVxuICogZGlzdHJpYnV0aW9uLCBpLmUuIHBhc3NpbmcgaW4gdmFsdWVzIGZyb20gdGhlIHVuaWZvcm0gZGlzdHJpYnV0aW9uIFswLCAxXVxuICogd2lsbCBwcm9kdWNlIHNhbXBsZSB0aGF0IGxvb2sgbGlrZSB0aGV5IGNvbWUgZnJvbSB0aGUgdHJpYW5ndWxhclxuICogZGlzdHJpYnV0aW9uLlxuICpcbiAqXG4gKi9cblxuZXhwb3J0IGNsYXNzIFRyaWFuZ3VsYXIge1xuICBwcml2YXRlIGE6IG51bWJlcjtcbiAgcHJpdmF0ZSBiOiBudW1iZXI7XG4gIHByaXZhdGUgYzogbnVtYmVyO1xuICBwcml2YXRlIEZfYzogbnVtYmVyO1xuXG4gIC8qKiAgVGhlIHRyaWFuZ3VsYXIgZGlzdHJpYnV0aW9uIGlzIGEgY29udGludW91cyBwcm9iYWJpbGl0eSBkaXN0cmlidXRpb24gd2l0aFxuICBsb3dlciBsaW1pdCBgYWAsIHVwcGVyIGxpbWl0IGBiYCwgYW5kIG1vZGUgYGNgLCB3aGVyZSBhIDwgYiBhbmQgYSBcdTIyNjQgYyBcdTIyNjQgYi4gKi9cbiAgY29uc3RydWN0b3IoYTogbnVtYmVyLCBiOiBudW1iZXIsIGM6IG51bWJlcikge1xuICAgIHRoaXMuYSA9IGE7XG4gICAgdGhpcy5iID0gYjtcbiAgICB0aGlzLmMgPSBjO1xuXG4gICAgLy8gRl9jIGlzIHRoZSBjdXRvZmYgaW4gdGhlIGRvbWFpbiB3aGVyZSB3ZSBzd2l0Y2ggYmV0d2VlbiB0aGUgdHdvIGhhbHZlcyBvZlxuICAgIC8vIHRoZSB0cmlhbmdsZS5cbiAgICB0aGlzLkZfYyA9IChjIC0gYSkgLyAoYiAtIGEpO1xuICB9XG5cbiAgLyoqICBQcm9kdWNlIGEgc2FtcGxlIGZyb20gdGhlIHRyaWFuZ3VsYXIgZGlzdHJpYnV0aW9uLiBUaGUgdmFsdWUgb2YgJ3AnXG4gICBzaG91bGQgYmUgaW4gWzAsIDEuMF0uICovXG4gIHNhbXBsZShwOiBudW1iZXIpOiBudW1iZXIge1xuICAgIGlmIChwIDwgMCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfSBlbHNlIGlmIChwID4gMS4wKSB7XG4gICAgICByZXR1cm4gMS4wO1xuICAgIH0gZWxzZSBpZiAocCA8IHRoaXMuRl9jKSB7XG4gICAgICByZXR1cm4gdGhpcy5hICsgTWF0aC5zcXJ0KHAgKiAodGhpcy5iIC0gdGhpcy5hKSAqICh0aGlzLmMgLSB0aGlzLmEpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgdGhpcy5iIC0gTWF0aC5zcXJ0KCgxIC0gcCkgKiAodGhpcy5iIC0gdGhpcy5hKSAqICh0aGlzLmIgLSB0aGlzLmMpKVxuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBUcmlhbmd1bGFyIH0gZnJvbSBcIi4vdHJpYW5ndWxhci50c1wiO1xuXG5leHBvcnQgdHlwZSBVbmNlcnRhaW50eSA9IFwibG93XCIgfCBcIm1vZGVyYXRlXCIgfCBcImhpZ2hcIiB8IFwiZXh0cmVtZVwiO1xuXG5leHBvcnQgY29uc3QgVW5jZXJ0YWludHlUb051bTogUmVjb3JkPFVuY2VydGFpbnR5LCBudW1iZXI+ID0ge1xuICBsb3c6IDEuMSxcbiAgbW9kZXJhdGU6IDEuNSxcbiAgaGlnaDogMixcbiAgZXh0cmVtZTogNSxcbn07XG5cbmV4cG9ydCBjbGFzcyBKYWNvYmlhbiB7XG4gIHByaXZhdGUgdHJpYW5ndWxhcjogVHJpYW5ndWxhcjtcbiAgY29uc3RydWN0b3IoZXhwZWN0ZWQ6IG51bWJlciwgdW5jZXJ0YWludHk6IFVuY2VydGFpbnR5KSB7XG4gICAgY29uc3QgbXVsID0gVW5jZXJ0YWludHlUb051bVt1bmNlcnRhaW50eV07XG4gICAgdGhpcy50cmlhbmd1bGFyID0gbmV3IFRyaWFuZ3VsYXIoZXhwZWN0ZWQgLyBtdWwsIGV4cGVjdGVkICogbXVsLCBleHBlY3RlZCk7XG4gIH1cblxuICBzYW1wbGUocDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy50cmlhbmd1bGFyLnNhbXBsZShwKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IENoYXJ0LCBUYXNrIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBNZXRyaWNEZWZpbml0aW9uLCBNZXRyaWNEZWZpbml0aW9ucyB9IGZyb20gXCIuLi9tZXRyaWNzL21ldHJpY3MudHNcIjtcbmltcG9ydCB7IE1ldHJpY1JhbmdlIH0gZnJvbSBcIi4uL21ldHJpY3MvcmFuZ2UudHNcIjtcbmltcG9ydCB7XG4gIFJlc291cmNlRGVmaW5pdGlvbixcbiAgUmVzb3VyY2VEZWZpbml0aW9ucyxcbn0gZnJvbSBcIi4uL3Jlc291cmNlcy9yZXNvdXJjZXMudHNcIjtcbmltcG9ydCB7IFVuY2VydGFpbnR5VG9OdW0gfSBmcm9tIFwiLi4vc3RhdHMvY2RmL3RyaWFuZ3VsYXIvamFjb2JpYW4udHNcIjtcblxuZXhwb3J0IHR5cGUgU3RhdGljTWV0cmljS2V5cyA9IFwiRHVyYXRpb25cIiB8IFwiUGVyY2VudCBDb21wbGV0ZVwiO1xuXG5leHBvcnQgY29uc3QgU3RhdGljTWV0cmljRGVmaW5pdGlvbnM6IE1ldHJpY0RlZmluaXRpb25zID0gbmV3IE1hcDxcbiAgc3RyaW5nLFxuICBNZXRyaWNEZWZpbml0aW9uXG4+KFtcbiAgLy8gSG93IGxvbmcgYSB0YXNrIHdpbGwgdGFrZSwgaW4gZGF5cy5cbiAgW1wiRHVyYXRpb25cIiwgbmV3IE1ldHJpY0RlZmluaXRpb24oMCwgbmV3IE1ldHJpY1JhbmdlKCksIHRydWUpXSxcbiAgLy8gVGhlIHBlcmNlbnQgY29tcGxldGUgZm9yIGEgdGFzay5cbiAgW1wiUGVyY2VudFwiLCBuZXcgTWV0cmljRGVmaW5pdGlvbigwLCBuZXcgTWV0cmljUmFuZ2UoMCwgMTAwKSwgdHJ1ZSldLFxuXSk7XG5cbmV4cG9ydCBjb25zdCBTdGF0aWNSZXNvdXJjZURlZmluaXRpb25zOiBSZXNvdXJjZURlZmluaXRpb25zID0gW1xuICB7XG4gICAga2V5OiBcIlVuY2VydGFpbnR5XCIsXG4gICAgdmFsdWVzOiBPYmplY3Qua2V5cyhVbmNlcnRhaW50eVRvTnVtKSxcbiAgfSxcbl07XG5cbmV4cG9ydCBjbGFzcyBQbGFuIHtcbiAgY2hhcnQ6IENoYXJ0O1xuXG4gIHJlc291cmNlRGVmaW5pdGlvbnM6IFJlc291cmNlRGVmaW5pdGlvbnMgPSBTdGF0aWNSZXNvdXJjZURlZmluaXRpb25zLnNsaWNlKCk7XG5cbiAgbWV0cmljRGVmaW5pdGlvbnM6IE1ldHJpY0RlZmluaXRpb25zO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY2hhcnQgPSBuZXcgQ2hhcnQoKTtcbiAgICB0aGlzLm1ldHJpY0RlZmluaXRpb25zID0gbmV3IE1hcDxzdHJpbmcsIE1ldHJpY0RlZmluaXRpb24+KFxuICAgICAgU3RhdGljTWV0cmljRGVmaW5pdGlvbnNcbiAgICApO1xuICAgIFsuLi50aGlzLm1ldHJpY0RlZmluaXRpb25zLmtleXMoKV0uZm9yRWFjaCgobWV0cmljTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBtZCA9IHRoaXMubWV0cmljRGVmaW5pdGlvbnMuZ2V0KG1ldHJpY05hbWUpITtcbiAgICAgIHRoaXMuY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaykgPT4ge1xuICAgICAgICB0YXNrLm1ldHJpY3Muc2V0KG1ldHJpY05hbWUsIG1kLmRlZmF1bHQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdGhpcy5yZXNvdXJjZURlZmluaXRpb25zLmZvckVhY2goXG4gICAgICAocmVzb3VyY2VEZWZpbml0aW9uOiBSZXNvdXJjZURlZmluaXRpb24pID0+IHtcbiAgICAgICAgdGhpcy5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICAgICAgdGFzay5yZXNvdXJjZXNbcmVzb3VyY2VEZWZpbml0aW9uLmtleV0gPSByZXNvdXJjZURlZmluaXRpb24udmFsdWVzWzBdO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgLy8gUmV0dXJucyBhIG5ldyBUYXNrIHdpdGggZGVmYXVsdHMgZm9yIGFsbCBtZXRyaWNzIGFuZCByZXNvdXJjZXMuXG4gIG5ld1Rhc2soKTogVGFzayB7XG4gICAgY29uc3QgcmV0ID0gbmV3IFRhc2soKTtcbiAgICBbLi4udGhpcy5tZXRyaWNEZWZpbml0aW9ucy5rZXlzKCldLmZvckVhY2goKG1ldHJpY05hbWU6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgbWQgPSB0aGlzLm1ldHJpY0RlZmluaXRpb25zLmdldChtZXRyaWNOYW1lKSE7XG5cbiAgICAgIHJldC5tZXRyaWNzLnNldChtZXRyaWNOYW1lLCBtZC5kZWZhdWx0KTtcbiAgICB9KTtcbiAgICB0aGlzLnJlc291cmNlRGVmaW5pdGlvbnMuZm9yRWFjaChcbiAgICAgIChyZXNvdXJjZURlZmluaXRpb246IFJlc291cmNlRGVmaW5pdGlvbikgPT4ge1xuICAgICAgICByZXQucmVzb3VyY2VzW3Jlc291cmNlRGVmaW5pdGlvbi5rZXldID0gcmVzb3VyY2VEZWZpbml0aW9uLnZhbHVlc1swXTtcbiAgICAgIH1cbiAgICApO1xuICAgIHJldHVybiByZXQ7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBSZXN1bHQsIG9rLCBlcnJvciB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IFRhc2ssIENoYXJ0LCBDaGFydFZhbGlkYXRlIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBEaXJlY3RlZEVkZ2UsIGVkZ2VzQnlTcmNBbmREc3RUb01hcCB9IGZyb20gXCIuLi9kYWcvZGFnLnRzXCI7XG5cbi8qKiBTcGFuIHJlcHJlc2VudHMgd2hlbiBhIHRhc2sgd2lsbCBiZSBkb25lLCBpLmUuIGl0IGNvbnRhaW5zIHRoZSB0aW1lIHRoZSB0YXNrXG4gKiBpcyBleHBlY3RlZCB0byBiZWdpbiBhbmQgZW5kLiAqL1xuZXhwb3J0IGNsYXNzIFNwYW4ge1xuICBzdGFydDogbnVtYmVyID0gMDtcbiAgZmluaXNoOiBudW1iZXIgPSAwO1xufVxuXG4vKiogVGhlIHN0YW5kYXJkIHNsYWNrIGNhbGN1bGF0aW9uIHZhbHVlcy4gKi9cbmV4cG9ydCBjbGFzcyBTbGFjayB7XG4gIGVhcmx5OiBTcGFuID0gbmV3IFNwYW4oKTtcbiAgbGF0ZTogU3BhbiA9IG5ldyBTcGFuKCk7XG4gIHNsYWNrOiBudW1iZXIgPSAwO1xufVxuXG5leHBvcnQgdHlwZSBUYXNrRHVyYXRpb24gPSAodDogVGFzaywgdGFza0luZGV4OiBudW1iZXIpID0+IG51bWJlcjtcblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRUYXNrRHVyYXRpb24gPSAodDogVGFzayk6IG51bWJlciA9PiB7XG4gIHJldHVybiB0LmR1cmF0aW9uO1xufTtcblxuZXhwb3J0IHR5cGUgU2xhY2tSZXN1bHQgPSBSZXN1bHQ8U2xhY2tbXT47XG5cbi8vIENhbGN1bGF0ZSB0aGUgc2xhY2sgZm9yIGVhY2ggVGFzayBpbiB0aGUgQ2hhcnQuXG5leHBvcnQgZnVuY3Rpb24gQ29tcHV0ZVNsYWNrKFxuICBjOiBDaGFydCxcbiAgdGFza0R1cmF0aW9uOiBUYXNrRHVyYXRpb24gPSBkZWZhdWx0VGFza0R1cmF0aW9uXG4pOiBTbGFja1Jlc3VsdCB7XG4gIC8vIENyZWF0ZSBhIFNsYWNrIGZvciBlYWNoIFRhc2suXG4gIGNvbnN0IHNsYWNrczogU2xhY2tbXSA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGMuVmVydGljZXMubGVuZ3RoOyBpKyspIHtcbiAgICBzbGFja3MucHVzaChuZXcgU2xhY2soKSk7XG4gIH1cblxuICBjb25zdCByID0gQ2hhcnRWYWxpZGF0ZShjKTtcbiAgaWYgKCFyLm9rKSB7XG4gICAgcmV0dXJuIGVycm9yKHIuZXJyb3IpO1xuICB9XG5cbiAgY29uc3QgZWRnZXMgPSBlZGdlc0J5U3JjQW5kRHN0VG9NYXAoYy5FZGdlcyk7XG5cbiAgY29uc3QgdG9wb2xvZ2ljYWxPcmRlciA9IHIudmFsdWU7XG5cbiAgLy8gRmlyc3QgZ28gZm9yd2FyZCB0aHJvdWdoIHRoZSB0b3BvbG9naWNhbCBzb3J0IGFuZCBmaW5kIHRoZSBlYXJseSBzdGFydCBmb3JcbiAgLy8gZWFjaCB0YXNrLCB3aGljaCBpcyB0aGUgbWF4IG9mIGFsbCB0aGUgcHJlZGVjZXNzb3JzIGVhcmx5IGZpbmlzaCB2YWx1ZXMuXG4gIC8vIFNpbmNlIHdlIGtub3cgdGhlIGR1cmF0aW9uIHdlIGNhbiBhbHNvIGNvbXB1dGUgdGhlIGVhcmx5IGZpbmlzaC5cbiAgdG9wb2xvZ2ljYWxPcmRlci5zbGljZSgxKS5mb3JFYWNoKCh2ZXJ0ZXhJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgY29uc3QgdGFzayA9IGMuVmVydGljZXNbdmVydGV4SW5kZXhdO1xuICAgIGNvbnN0IHNsYWNrID0gc2xhY2tzW3ZlcnRleEluZGV4XTtcbiAgICBzbGFjay5lYXJseS5zdGFydCA9IE1hdGgubWF4KFxuICAgICAgLi4uZWRnZXMuYnlEc3QuZ2V0KHZlcnRleEluZGV4KSEubWFwKChlOiBEaXJlY3RlZEVkZ2UpOiBudW1iZXIgPT4ge1xuICAgICAgICBjb25zdCBwcmVkZWNlc3NvclNsYWNrID0gc2xhY2tzW2UuaV07XG4gICAgICAgIHJldHVybiBwcmVkZWNlc3NvclNsYWNrLmVhcmx5LmZpbmlzaDtcbiAgICAgIH0pXG4gICAgKTtcbiAgICBzbGFjay5lYXJseS5maW5pc2ggPSBzbGFjay5lYXJseS5zdGFydCArIHRhc2tEdXJhdGlvbih0YXNrLCB2ZXJ0ZXhJbmRleCk7XG4gIH0pO1xuXG4gIC8vIE5vdyBiYWNrd2FyZHMgdGhyb3VnaCB0aGUgdG9wb2xvZ2ljYWwgc29ydCBhbmQgZmluZCB0aGUgbGF0ZSBmaW5pc2ggb2YgZWFjaFxuICAvLyB0YXNrLCB3aGljaCBpcyB0aGUgbWluIG9mIGFsbCB0aGUgc3VjY2Vzc29yIHRhc2tzIGxhdGUgc3RhcnRzLiBBZ2FpbiBzaW5jZVxuICAvLyB3ZSBrbm93IHRoZSBkdXJhdGlvbiB3ZSBjYW4gYWxzbyBjb21wdXRlIHRoZSBsYXRlIHN0YXJ0LiBGaW5hbGx5LCBzaW5jZSB3ZVxuICAvLyBub3cgaGF2ZSBhbGwgdGhlIGVhcmx5L2xhdGUgYW5kIHN0YXJ0L2ZpbmlzaCB2YWx1ZXMgd2UgY2FuIG5vdyBjYWxjdWF0ZSB0aGVcbiAgLy8gc2xhY2suXG4gIHRvcG9sb2dpY2FsT3JkZXIucmV2ZXJzZSgpLmZvckVhY2goKHZlcnRleEluZGV4OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCB0YXNrID0gYy5WZXJ0aWNlc1t2ZXJ0ZXhJbmRleF07XG4gICAgY29uc3Qgc2xhY2sgPSBzbGFja3NbdmVydGV4SW5kZXhdO1xuICAgIGNvbnN0IHN1Y2Nlc3NvcnMgPSBlZGdlcy5ieVNyYy5nZXQodmVydGV4SW5kZXgpO1xuICAgIGlmICghc3VjY2Vzc29ycykge1xuICAgICAgc2xhY2subGF0ZS5maW5pc2ggPSBzbGFjay5lYXJseS5maW5pc2g7XG4gICAgICBzbGFjay5sYXRlLnN0YXJ0ID0gc2xhY2suZWFybHkuc3RhcnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNsYWNrLmxhdGUuZmluaXNoID0gTWF0aC5taW4oXG4gICAgICAgIC4uLmVkZ2VzLmJ5U3JjLmdldCh2ZXJ0ZXhJbmRleCkhLm1hcCgoZTogRGlyZWN0ZWRFZGdlKTogbnVtYmVyID0+IHtcbiAgICAgICAgICBjb25zdCBzdWNjZXNzb3JTbGFjayA9IHNsYWNrc1tlLmpdO1xuICAgICAgICAgIHJldHVybiBzdWNjZXNzb3JTbGFjay5sYXRlLnN0YXJ0O1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICAgIHNsYWNrLmxhdGUuc3RhcnQgPSBzbGFjay5sYXRlLmZpbmlzaCAtIHRhc2tEdXJhdGlvbih0YXNrLCB2ZXJ0ZXhJbmRleCk7XG4gICAgICBzbGFjay5zbGFjayA9IHNsYWNrLmxhdGUuZmluaXNoIC0gc2xhY2suZWFybHkuZmluaXNoO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIG9rKHNsYWNrcyk7XG59XG5cbmV4cG9ydCBjb25zdCBDcml0aWNhbFBhdGggPSAoc2xhY2tzOiBTbGFja1tdKTogbnVtYmVyW10gPT4ge1xuICBjb25zdCByZXQ6IG51bWJlcltdID0gW107XG4gIHNsYWNrcy5mb3JFYWNoKChzbGFjazogU2xhY2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICBpZiAoXG4gICAgICBzbGFjay5sYXRlLmZpbmlzaCAtIHNsYWNrLmVhcmx5LmZpbmlzaCA9PT0gMCAmJlxuICAgICAgc2xhY2suZWFybHkuZmluaXNoIC0gc2xhY2suZWFybHkuc3RhcnQgIT09IDBcbiAgICApIHtcbiAgICAgIHJldC5wdXNoKGluZGV4KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmV0O1xufTtcbiIsICJpbXBvcnQgeyBDaGFydCwgVGFzaywgdmFsaWRhdGVDaGFydCB9IGZyb20gXCIuL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBEaXJlY3RlZEVkZ2UgfSBmcm9tIFwiLi9kYWcvZGFnLnRzXCI7XG5pbXBvcnQgeyBJbnNlcnROZXdFbXB0eVRhc2tBZnRlck9wLCBTZXRUYXNrTmFtZU9wIH0gZnJvbSBcIi4vb3BzL2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBTZXRNZXRyaWNWYWx1ZU9wIH0gZnJvbSBcIi4vb3BzL21ldHJpY3MudHNcIjtcbmltcG9ydCB7IE9wLCBhcHBseUFsbE9wc1RvUGxhbiB9IGZyb20gXCIuL29wcy9vcHMudHNcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi9wbGFuL3BsYW4udHNcIjtcbmltcG9ydCB7IENvbXB1dGVTbGFjaywgQ3JpdGljYWxQYXRoIH0gZnJvbSBcIi4vc2xhY2svc2xhY2sudHNcIjtcbmltcG9ydCB7IEphY29iaWFuIH0gZnJvbSBcIi4vc3RhdHMvY2RmL3RyaWFuZ3VsYXIvamFjb2JpYW4udHNcIjtcblxuY29uc3QgdGFza0EgPSBuZXcgVGFzayhcIkFcIik7XG50YXNrQS5tZXRyaWNzLnNldChcIkR1cmF0aW9uXCIsIDEwKTtcblxuY29uc3QgdGFza0IgPSBuZXcgVGFzayhcIkJcIik7XG50YXNrQi5tZXRyaWNzLnNldChcIkR1cmF0aW9uXCIsIDE1KTtcblxubGV0IHBsYW4gPSBuZXcgUGxhbigpO1xuXG5jb25zdCBvcHM6IE9wW10gPSBbXG4gIEluc2VydE5ld0VtcHR5VGFza0FmdGVyT3AoMCksXG4gIFNldE1ldHJpY1ZhbHVlT3AoXCJEdXJhdGlvblwiLCAxMCwgMSksXG4gIFNldFRhc2tOYW1lT3AoMSwgXCJBXCIpLFxuICBJbnNlcnROZXdFbXB0eVRhc2tBZnRlck9wKDEpLFxuICBTZXRNZXRyaWNWYWx1ZU9wKFwiRHVyYXRpb25cIiwgMTUsIDIpLFxuICBTZXRUYXNrTmFtZU9wKDEsIFwiQlwiKSxcbl07XG5cbmNvbnN0IHJlcyA9IGFwcGx5QWxsT3BzVG9QbGFuKG9wcywgcGxhbik7XG5pZiAoIXJlcy5vaykge1xuICB0aHJvdyByZXMuZXJyb3I7XG59XG5wbGFuID0gcmVzLnZhbHVlLnBsYW47XG5cbmNvbnN0IEM6IENoYXJ0ID0gcGxhbi5jaGFydDtcblxuY29uc3QgamFjb2JpYW5zID0gQy5WZXJ0aWNlcy5tYXAoKHQ6IFRhc2spID0+IHtcbiAgcmV0dXJuIG5ldyBKYWNvYmlhbih0LmR1cmF0aW9uLCBcImxvd1wiKTtcbn0pO1xuXG5jb25zdCBzbGFja3NSZXQgPSBDb21wdXRlU2xhY2soQyk7XG5pZiAoIXNsYWNrc1JldC5vaykge1xuICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIGNvbXB1dGluZyBzbGFjazogJHtzbGFja3NSZXQuZXJyb3J9YCk7XG59XG5jb25zb2xlLmxvZyhcIlRhc2tzIG9uIHRoZSBjcml0aWNhbCBwYXRoOlwiLCBDcml0aWNhbFBhdGgoc2xhY2tzUmV0LnZhbHVlKSk7XG5jb25zb2xlLmxvZyhcbiAgXCJUYXNrcyBvbiB0aGUgY3JpdGljYWwgcGF0aCBmb3IgaW4gdGhlIGZpcnN0IHF1YXJ0aWxlOlwiLFxuICBDb21wdXRlU2xhY2soQywgKHQ6IFRhc2ssIHRhc2tJbmRleDogbnVtYmVyKSA9PlxuICAgIGphY29iaWFuc1t0YXNrSW5kZXhdLnNhbXBsZSgwLjI1KVxuICApXG4pO1xuXG5jb25zb2xlLmxvZyh2YWxpZGF0ZUNoYXJ0KHBsYW4uY2hhcnQpKTtcblxuY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkocGxhbiwgbnVsbCwgXCIgIFwiKSk7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7QUFJTyxXQUFTLEdBQU0sT0FBcUI7QUFDekMsV0FBTyxFQUFFLElBQUksTUFBTSxNQUFhO0FBQUEsRUFDbEM7QUFFTyxXQUFTLE1BQVMsT0FBa0M7QUFDekQsUUFBSSxPQUFPLFVBQVUsVUFBVTtBQUM3QixhQUFPLEVBQUUsSUFBSSxPQUFPLE9BQU8sSUFBSSxNQUFNLEtBQUssRUFBRTtBQUFBLElBQzlDO0FBQ0EsV0FBTyxFQUFFLElBQUksT0FBTyxPQUFPLE1BQU07QUFBQSxFQUNuQzs7O0FDRE8sTUFBTSxlQUFOLE1BQW1CO0FBQUEsSUFDeEIsSUFBWTtBQUFBLElBQ1osSUFBWTtBQUFBLElBRVosWUFBWSxHQUFXLEdBQVc7QUFDaEMsV0FBSyxJQUFJO0FBQ1QsV0FBSyxJQUFJO0FBQUEsSUFDWDtBQUFBLElBRUEsTUFBTSxLQUE0QjtBQUNoQyxhQUFPLElBQUksTUFBTSxLQUFLLEtBQUssSUFBSSxNQUFNLEtBQUs7QUFBQSxJQUM1QztBQUFBLEVBQ0Y7QUFrQk8sTUFBTSxrQkFBa0IsQ0FBQyxVQUFxQztBQUNuRSxVQUFNLE1BQU0sb0JBQUksSUFBbUI7QUFFbkMsVUFBTSxRQUFRLENBQUMsTUFBb0I7QUFDakMsWUFBTSxNQUFNLElBQUksSUFBSSxFQUFFLENBQUMsS0FBSyxD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ekQsVUFBTSxNQUFnQixDQUFDO0FBQ3ZCLFdBQU8sUUFBUSxDQUFDLE9BQWMsVUFBa0I7QUFDOUMsVUFDRSxNQUFNLEtBQUssU0FBUyxNQUFNLE1BQU0sV0FBVyxLQUMzQyxNQUFNLE1BQU0sU0FBUyxNQUFNLE1BQU0sVUFBVSxHQUMzQztBQUNBLFlBQUksS0FBSyxLQUFLO0FBQUEsTUFDaEI7QUFBQSxJQUNGLENBQUM7QUFDRCxXQUFPO0FBQUEsRUFDVDs7O0FDMUZBLE1BQU0sUUFBUSxJQUFJLEtBQUssR0FBRztBQUMxQixRQUFNLFFBQVEsSUFBSSxZQUFZLEVBQUU7QUFFaEMsTUFBTSxRQUFRLElBQUksS0FBSyxHQUFHO0FBQzFCLFFBQU0sUUFBUSxJQUFJLFlBQVksRUFBRTtBQUVoQyxNQUFJLE9BQU8sSUFBSSxLQUFLO0FBRXBCLE1BQU0sTUFBWTtBQUFBLElBQ2hCLDBCQUEwQixDQUFDO0FBQUEsSUFDM0IsaUJBQWlCLFlBQVksSUFBSSxDQUFDO0FBQUEsSUFDbEMsY0FBYyxHQUFHLEdBQUc7QUFBQSxJQUNwQiwwQkFBMEIsQ0FBQztBQUFBLElBQzNCLGlCQUFpQixZQUFZLElBQUksQ0FBQztBQUFBLElBQ2xDLGNBQWMsR0FBRyxHQUFHO0FBQUEsRUFDdEI7QUFFQSxNQUFNLE1BQU0sa0JBQWtCLEtBQUssSUFBSTtBQUN2QyxNQUFJLENBQUMsSUFBSSxJQUFJO0FBQ1gsVUFBTSxJQUFJO0FBQUEsRUFDWjtBQUNBLFNBQU8sSUFBSSxNQUFNO0FBRWpCLE1BQU0sSUFBVyxLQUFLO0FBRXRCLE1BQU0sWUFBWSxFQUFFLFNBQVMsSUFBSSxDQUFDLE1BQVk7QUFDNUMsV0FBTyxJQUFJLFNBQVMsRUFBRSxVQUFVLEtBQUs7QUFBQSxFQUN2QyxDQUFDO0FBRUQsTUFBTSxZQUFZLGFBQWEsQ0FBQztBQUNoQyxNQUFJLENBQUMsVUFBVSxJQUFJO0FBQ2pCLFVBQU0sSUFBSSxNQUFNLDBCQUEwQixVQUFVLEtBQUssRUFBRTtBQUFBLEVBQzdEO0FBQ0EsVUFBUSxJQUFJLCtCQUErQixhQUFhLFVBQVUsS0FBSyxDQUFDO0FBQ3hFLFVBQVE7QUFBQSxJQUNOO0FBQUEsSUFDQTtBQUFBLE1BQWE7QUFBQSxNQUFHLENBQUMsR0FBUyxjQUN4QixVQUFVLFNBQVMsRUFBRSxPQUFPLElBQUk7QUFBQSxJQUNsQztBQUFBLEVBQ0Y7QUFFQSxVQUFRLElBQUksY0FBYyxLQUFLLEtBQUssQ0FBQztBQUVyQyxVQUFRLElBQUksS0FBSyxVQUFVLE1BQU0sTUFBTSxJQUFJLENBQUM7IiwKICAibmFtZXMiOiBbIm9rIiwgInBsYW4iLCAicmVzIiwgIm9wcyIsICJwbGFuIiwgInBsYW4iLCAicGxhbiIsICJwbGFuIl0KfQo=
