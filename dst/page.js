"use strict";
(() => {
  // src/dag/dag.ts
  var DirectedEdge = class {
    i = 0;
    j = 0;
    constructor(i = 0, j = 0) {
      this.i = i;
      this.j = j;
    }
    equal(rhs) {
      return rhs.i === this.i && rhs.j === this.j;
    }
    toJSON() {
      return {
        i: this.i,
        j: this.j
      };
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
  function indexInRangeForVerticesExclusive(index, chart) {
    if (index < 1 || index > chart.Vertices.length - 2) {
      return error(`${index} is not in range [1, ${chart.Vertices.length - 2}]`);
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
  var DupTaskSubOp = class {
    index = 0;
    constructor(index) {
      this.index = index;
    }
    apply(plan2) {
      const chart = plan2.chart;
      const ret = indexInRangeForVerticesExclusive(this.index, chart);
      if (!ret.ok) {
        return ret;
      }
      const copy = plan2.chart.Vertices[this.index].dup();
      plan2.chart.Vertices.splice(this.index, 0, copy);
      for (let i = 0; i < chart.Edges.length; i++) {
        const edge = chart.Edges[i];
        if (edge.i > this.index) {
          edge.i++;
        }
        if (edge.j > this.index) {
          edge.j++;
        }
      }
      return ok({ plan: plan2, inverse: this.inverse() });
    }
    inverse() {
      return new DeleteTaskSubOp(this.index + 1);
    }
  };
  var MoveAllOutgoingEdgesFromToSubOp = class _MoveAllOutgoingEdgesFromToSubOp {
    fromTaskIndex = 0;
    toTaskIndex = 0;
    actualMoves;
    constructor(fromTaskIndex, toTaskIndex, actualMoves = /* @__PURE__ */ new Map()) {
      this.fromTaskIndex = fromTaskIndex;
      this.toTaskIndex = toTaskIndex;
      this.actualMoves = actualMoves;
    }
    apply(plan2) {
      const chart = plan2.chart;
      let ret = indexInRangeForVerticesExclusive(this.fromTaskIndex, chart);
      if (!ret.ok) {
        return ret;
      }
      ret = indexInRangeForVerticesExclusive(this.toTaskIndex, chart);
      if (!ret.ok) {
        return ret;
      }
      if (this.actualMoves.values.length === 0) {
        const actualMoves = /* @__PURE__ */ new Map();
        for (let i = 0; i < chart.Edges.length; i++) {
          const edge = chart.Edges[i];
          if (edge.i === this.fromTaskIndex && edge.j === this.toTaskIndex) {
            continue;
          }
          if (edge.i === this.fromTaskIndex) {
            actualMoves.set(
              new DirectedEdge(this.toTaskIndex, edge.j),
              new DirectedEdge(edge.i, edge.j)
            );
            edge.i = this.toTaskIndex;
          }
        }
        return ok({
          plan: plan2,
          inverse: this.inverse(
            this.toTaskIndex,
            this.fromTaskIndex,
            actualMoves
          )
        });
      } else {
        for (let i = 0; i < chart.Edges.length; i++) {
          const newEdge = this.actualMoves.get(plan2.chart.Edges[i]);
          if (newEdge !== void 0) {
            plan2.chart.Edges[i] = newEdge;
          }
        }
        return ok({
          plan: plan2,
          inverse: new _MoveAllOutgoingEdgesFromToSubOp(
            this.toTaskIndex,
            this.fromTaskIndex
          )
        });
      }
    }
    inverse(toTaskIndex, fromTaskIndex, actualMoves) {
      return new _MoveAllOutgoingEdgesFromToSubOp(
        toTaskIndex,
        fromTaskIndex,
        actualMoves
      );
    }
  };
  var CopyAllEdgesFromToSubOp = class {
    fromIndex = 0;
    toIndex = 0;
    constructor(fromIndex, toIndex) {
      this.fromIndex = fromIndex;
      this.toIndex = toIndex;
    }
    apply(plan2) {
      const ret = indexInRangeForVertices(this.fromIndex, plan2.chart);
      if (!ret.ok) {
        return ret;
      }
      const newEdges = [];
      plan2.chart.Edges.forEach((edge) => {
        if (edge.i === this.fromIndex) {
          newEdges.push(new DirectedEdge(this.toIndex, edge.j));
        }
        if (edge.j === this.fromIndex) {
          newEdges.push(new DirectedEdge(edge.i, this.toIndex));
        }
      });
      plan2.chart.Edges.push(...newEdges);
      return ok({ plan: plan2, inverse: new RemoveAllEdgesSubOp(newEdges) });
    }
  };
  var RemoveAllEdgesSubOp = class {
    edges;
    constructor(edges) {
      this.edges = edges;
    }
    apply(plan2) {
      plan2.chart.Edges = plan2.chart.Edges.filter(
        (edge) => -1 === this.edges.findIndex(
          (toBeRemoved) => edge.equal(toBeRemoved)
        )
      );
      return ok({ plan: plan2, inverse: new AddAllEdgesSubOp(this.edges) });
    }
  };
  var AddAllEdgesSubOp = class {
    edges;
    constructor(edges) {
      this.edges = edges;
    }
    apply(plan2) {
      plan2.chart.Edges.push(...this.edges);
      return ok({ plan: plan2, inverse: new RemoveAllEdgesSubOp(this.edges) });
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
          const toBeAdded = new DirectedEdge(i, Finish);
          plan2.chart.Edges.push(toBeAdded);
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
          const toBeAdded = new DirectedEdge(Start, i);
          plan2.chart.Edges.push(toBeAdded);
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
  function SplitTaskOp(taskIndex) {
    const subOps = [
      new DupTaskSubOp(taskIndex),
      new AddEdgeSubOp(taskIndex, taskIndex + 1),
      new MoveAllOutgoingEdgesFromToSubOp(taskIndex, taskIndex + 1)
    ];
    return new Op(subOps);
  }
  function DupTaskOp(taskIndex) {
    const subOps = [
      new DupTaskSubOp(taskIndex),
      new CopyAllEdgesFromToSubOp(taskIndex, taskIndex + 1)
    ];
    return new Op(subOps);
  }
  function RationalizeEdgesOp() {
    return new Op([new RationalizeEdgesSubOp()]);
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
      const metricsDefinition = plan2.getMetricDefinition(this.name);
      if (metricsDefinition === void 0) {
        return error(`${this.name} does not exist as a Metric`);
      }
      const task = plan2.chart.Vertices[this.taskIndex];
      const oldValue = task.getMetric(this.name) || metricsDefinition.default;
      task.setMetric(this.name, metricsDefinition.precision.round(this.value));
      return ok({ plan: plan2, inverse: this.inverse(oldValue) });
    }
    inverse(value) {
      return new _SetMetricValueSubOp(this.name, value, this.taskIndex);
    }
  };
  function SetMetricValueOp(name, value, taskIndex) {
    return new Op([new SetMetricValueSubOp(name, value, taskIndex)]);
  }

  // src/resources/resources.ts
  var DEFAULT_RESOURCE_VALUE = "";
  var ResourceDefinition = class _ResourceDefinition {
    values;
    isStatic;
    constructor(values = [DEFAULT_RESOURCE_VALUE], isStatic = false) {
      this.values = values;
      this.isStatic = isStatic;
    }
    toJSON() {
      return {
        values: this.values
      };
    }
    static FromJSON(s) {
      return new _ResourceDefinition(s.values);
    }
  };

  // src/ops/resources.ts
  var AddResourceSubOp = class {
    key;
    // Maps an index of a Task to a value for the given resource key.
    taskResourceValues;
    constructor(name, taskResourceValues = /* @__PURE__ */ new Map()) {
      this.key = name;
      this.taskResourceValues = taskResourceValues;
    }
    apply(plan2) {
      const foundMatch = plan2.getResourceDefinition(this.key);
      if (foundMatch !== void 0) {
        return error(`${this.key} already exists as a Resource`);
      }
      plan2.setResourceDefinition(this.key, new ResourceDefinition());
      plan2.chart.Vertices.forEach((task, index) => {
        task.setResource(
          this.key,
          this.taskResourceValues.get(index) || DEFAULT_RESOURCE_VALUE
        );
      });
      return ok({ plan: plan2, inverse: this.inverse() });
    }
    inverse() {
      return new DeleteResourceSupOp(this.key);
    }
  };
  var DeleteResourceSupOp = class {
    key;
    constructor(name) {
      this.key = name;
    }
    apply(plan2) {
      const resourceDefinition = plan2.getResourceDefinition(this.key);
      if (resourceDefinition === void 0) {
        return error(
          `The resource with name ${this.key} does not exist and can't be deleted.`
        );
      }
      plan2.deleteMetricDefinition(this.key);
      const taskIndexToDeletedResourceValue = /* @__PURE__ */ new Map();
      plan2.chart.Vertices.forEach((task, index) => {
        const value = task.getResource(this.key) || DEFAULT_RESOURCE_VALUE;
        taskIndexToDeletedResourceValue.set(index, value);
        task.deleteResource(this.key);
      });
      return ok({
        plan: plan2,
        inverse: this.inverse(taskIndexToDeletedResourceValue)
      });
    }
    inverse(resourceValuesForDeletedResourceKey) {
      return new AddResourceSubOp(this.key, resourceValuesForDeletedResourceKey);
    }
  };
  var AddResourceOptionSubOp = class {
    key;
    value;
    indicesOfTasksToChange = [];
    constructor(key, value, indicesOfTasksToChange = []) {
      this.key = key;
      this.value = value;
      this.indicesOfTasksToChange = indicesOfTasksToChange;
    }
    apply(plan2) {
      const definition = plan2.getResourceDefinition(this.key);
      if (definition === void 0) {
        return error(`${this.key} doesn't exist as a Resource`);
      }
      const existingIndex = definition.values.findIndex(
        (value) => value === this.value
      );
      if (existingIndex !== -1) {
        return error(
          `${this.value} already exists as a value in the Resource ${this.key}.`
        );
      }
      definition.values.push(this.value);
      this.indicesOfTasksToChange.forEach((taskIndex) => {
        plan2.chart.Vertices[taskIndex].setResource(this.key, this.value);
      });
      return ok({ plan: plan2, inverse: this.inverse() });
    }
    inverse() {
      return new DeleteResourceOptionSubOp(
        this.key,
        this.value,
        this.indicesOfTasksToChange
      );
    }
  };
  var DeleteResourceOptionSubOp = class {
    key;
    value;
    indicesOfTasksToChange;
    constructor(key, value, indicesOfTasksToChange = []) {
      this.key = key;
      this.value = value;
      this.indicesOfTasksToChange = indicesOfTasksToChange;
    }
    apply(plan2) {
      const definition = plan2.getResourceDefinition(this.key);
      if (definition === void 0) {
        return error(`${this.key} doesn't exist as a Resource`);
      }
      const valueIndex = definition.values.findIndex(
        (value) => value === this.value
      );
      if (valueIndex === -1) {
        return error(
          `${this.value} does not exist as a value in the Resource ${this.key}.`
        );
      }
      if (definition.values.length === 1) {
        return error(
          `Resources must have at least one value. ${this.value} only has one value, so it can't be deleted. `
        );
      }
      definition.values.splice(valueIndex, 1);
      const indicesOfTasksWithMatchingResourceValues = [];
      plan2.chart.Vertices.forEach((task, index) => {
        const resourceValue = task.getResource(this.key);
        if (resourceValue === void 0) {
          return;
        }
        task.setResource(this.key, definition.values[0]);
        indicesOfTasksWithMatchingResourceValues.push(index);
      });
      return ok({
        plan: plan2,
        inverse: this.inverse(indicesOfTasksWithMatchingResourceValues)
      });
    }
    inverse(indicesOfTasksToChange) {
      return new AddResourceOptionSubOp(
        this.key,
        this.value,
        indicesOfTasksToChange
      );
    }
  };
  var SetResourceValueSubOp = class _SetResourceValueSubOp {
    key;
    value;
    taskIndex;
    constructor(key, value, taskIndex) {
      this.key = key;
      this.value = value;
      this.taskIndex = taskIndex;
    }
    apply(plan2) {
      const foundMatch = plan2.getResourceDefinition(this.key);
      if (foundMatch === void 0) {
        return error(`${this.key} does not exist as a Resource`);
      }
      const foundValueMatch = foundMatch.values.findIndex((v) => {
        return v === this.value;
      });
      if (foundValueMatch === -1) {
        return error(`${this.key} does not have a value of ${this.value}`);
      }
      if (this.taskIndex < 0 || this.taskIndex >= plan2.chart.Vertices.length) {
        return error(`There is no Task at index ${this.taskIndex}`);
      }
      const task = plan2.chart.Vertices[this.taskIndex];
      const oldValue = task.getResource(this.key);
      task.setResource(this.key, this.value);
      return ok({ plan: plan2, inverse: this.inverse(oldValue) });
    }
    inverse(oldValue) {
      return new _SetResourceValueSubOp(this.key, oldValue, this.taskIndex);
    }
  };
  function AddResourceOp(name) {
    return new Op([new AddResourceSubOp(name)]);
  }
  function AddResourceOptionOp(key, value) {
    return new Op([new AddResourceOptionSubOp(key, value)]);
  }
  function SetResourceValueOp(key, value, taskIndex) {
    return new Op([new SetResourceValueSubOp(key, value, taskIndex)]);
  }

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
      this.metrics = {};
      this.resources = {};
    }
    // Resource keys and values. The parent plan contains all the resource
    // definitions.
    resources;
    metrics;
    name;
    state = "unstarted";
    toJSON() {
      return {
        resources: this.resources,
        metrics: this.metrics,
        name: this.name,
        state: this.state
      };
    }
    get duration() {
      return this.getMetric("Duration");
    }
    set duration(value) {
      this.setMetric("Duration", value);
    }
    getMetric(key) {
      return this.metrics[key];
    }
    setMetric(key, value) {
      this.metrics[key] = value;
    }
    deleteMetric(key) {
      delete this.metrics[key];
    }
    getResource(key) {
      return this.resources[key];
    }
    setResource(key, value) {
      this.resources[key] = value;
    }
    deleteResource(key) {
      delete this.resources[key];
    }
    dup() {
      const ret = new _Task();
      ret.resources = Object.assign({}, this.resources);
      ret.metrics = Object.assign({}, this.metrics);
      ret.name = this.name;
      ret.state = this.state;
      return ret;
    }
  };
  var Chart = class {
    Vertices;
    Edges;
    constructor() {
      const start = new Task("Start");
      start.setMetric("Duration", 0);
      const finish = new Task("Finish");
      finish.setMetric("Duration", 0);
      this.Vertices = [start, finish];
      this.Edges = [new DirectedEdge(0, 1)];
    }
    toJSON() {
      return {
        vertices: this.Vertices.map((t) => t.toJSON()),
        edges: this.Edges.map((e) => e.toJSON())
      };
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

  // src/precision/precision.ts
  var Precision = class _Precision {
    multiplier;
    _precision;
    constructor(precision2 = 0) {
      if (!Number.isFinite(precision2)) {
        precision2 = 0;
      }
      this._precision = Math.abs(Math.trunc(precision2));
      this.multiplier = 10 ** this._precision;
    }
    round(x) {
      return Math.trunc(x * this.multiplier) / this.multiplier;
    }
    rounder() {
      return (x) => this.round(x);
    }
    get precision() {
      return this._precision;
    }
    toJSON() {
      return {
        precision: this._precision
      };
    }
    static FromJSON(s) {
      if (s === void 0) {
        return new _Precision();
      }
      return new _Precision(s.precision);
    }
  };

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
  var MetricRange = class _MetricRange {
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
    toJSON() {
      return {
        min: this._min,
        max: this._max
      };
    }
    static FromJSON(s) {
      if (s === void 0) {
        return new _MetricRange();
      }
      return new _MetricRange(s.min, s.max);
    }
  };

  // src/metrics/metrics.ts
  var MetricDefinition = class _MetricDefinition {
    range;
    default;
    isStatic;
    precision;
    constructor(defaultValue, range = new MetricRange(), isStatic = false, precision2 = new Precision(1)) {
      this.range = range;
      this.default = clamp(defaultValue, range.min, range.max);
      this.isStatic = isStatic;
      this.precision = precision2;
    }
    toJSON() {
      return {
        range: this.range.toJSON(),
        default: this.default,
        precision: this.precision.toJSON()
      };
    }
    static FromJSON(s) {
      if (s === void 0) {
        return new _MetricDefinition(0);
      }
      return new _MetricDefinition(
        s.default || 0,
        MetricRange.FromJSON(s.range),
        false,
        Precision.FromJSON(s.precision)
      );
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
  var StaticMetricDefinitions = {
    // How long a task will take, in days.
    Duration: new MetricDefinition(0, new MetricRange(), true),
    // The percent complete for a task.
    Percent: new MetricDefinition(0, new MetricRange(0, 100), true)
  };
  var StaticResourceDefinitions = {
    Uncertainty: new ResourceDefinition(Object.keys(UncertaintyToNum), true)
  };
  var Plan = class {
    chart;
    resourceDefinitions;
    metricDefinitions;
    constructor() {
      this.chart = new Chart();
      this.resourceDefinitions = Object.assign({}, StaticResourceDefinitions);
      this.metricDefinitions = Object.assign({}, StaticMetricDefinitions);
      this.applyMetricsAndResourcesToVertices();
    }
    applyMetricsAndResourcesToVertices() {
      Object.keys(this.metricDefinitions).forEach((metricName) => {
        const md = this.metricDefinitions[metricName];
        this.chart.Vertices.forEach((task) => {
          task.setMetric(metricName, md.default);
        });
      });
      Object.entries(this.resourceDefinitions).forEach(
        ([key, resourceDefinition]) => {
          this.chart.Vertices.forEach((task) => {
            task.setResource(key, resourceDefinition.values[0]);
          });
        }
      );
    }
    toJSON() {
      return {
        chart: this.chart.toJSON(),
        resourceDefinitions: Object.fromEntries(
          Object.entries(this.resourceDefinitions).filter(
            ([key, resourceDefinition]) => !resourceDefinition.isStatic
          )
        ),
        metricDefinitions: Object.fromEntries(
          Object.entries(this.metricDefinitions).filter(([key, metricDefinition]) => !metricDefinition.isStatic).map(([key, metricDefinition]) => [key, metricDefinition.toJSON()])
        )
      };
    }
    getMetricDefinition(key) {
      return this.metricDefinitions[key];
    }
    setMetricDefinition(key, metricDefinition) {
      this.metricDefinitions[key] = metricDefinition;
    }
    deleteMetricDefinition(key) {
      delete this.metricDefinitions[key];
    }
    getResourceDefinition(key) {
      return this.resourceDefinitions[key];
    }
    setResourceDefinition(key, value) {
      this.resourceDefinitions[key] = value;
    }
    deleteResourceDefinition(key) {
      delete this.resourceDefinitions[key];
    }
    // Returns a new Task with defaults for all metrics and resources.
    newTask() {
      const ret = new Task();
      Object.keys(this.metricDefinitions).forEach((metricName) => {
        const md = this.getMetricDefinition(metricName);
        ret.setMetric(metricName, md.default);
      });
      Object.entries(this.resourceDefinitions).forEach(
        ([key, resourceDefinition]) => {
          ret.setResource(key, resourceDefinition.values[0]);
        }
      );
      return ret;
    }
  };
  var FromJSON = (text) => {
    const planSerialized = JSON.parse(text);
    const plan2 = new Plan();
    plan2.chart.Vertices = planSerialized.chart.vertices.map(
      (taskSerialized) => {
        const task = new Task(taskSerialized.name);
        task.state = taskSerialized.state;
        task.metrics = taskSerialized.metrics;
        task.resources = taskSerialized.resources;
        return task;
      }
    );
    plan2.chart.Edges = planSerialized.chart.edges.map(
      (directedEdgeSerialized) => new DirectedEdge(directedEdgeSerialized.i, directedEdgeSerialized.j)
    );
    const deserializedMetricDefinitions = Object.fromEntries(
      Object.entries(planSerialized.metricDefinitions).map(
        ([key, serializedMetricDefinition]) => [
          key,
          MetricDefinition.FromJSON(serializedMetricDefinition)
        ]
      )
    );
    plan2.metricDefinitions = Object.assign(
      {},
      StaticMetricDefinitions,
      deserializedMetricDefinitions
    );
    const deserializedResourceDefinitions = Object.fromEntries(
      Object.entries(planSerialized.resourceDefinitions).map(
        ([key, serializedResourceDefinition]) => [
          key,
          ResourceDefinition.FromJSON(serializedResourceDefinition)
        ]
      )
    );
    plan2.resourceDefinitions = Object.assign(
      {},
      StaticResourceDefinitions,
      deserializedResourceDefinitions
    );
    const ret = RationalizeEdgesOp().apply(plan2);
    if (!ret.ok) {
      return ret;
    }
    const retVal = validateChart(plan2.chart);
    if (!retVal.ok) {
      return retVal;
    }
    return ok(plan2);
  };

  // src/renderer/scale/point.ts
  var Point = class _Point {
    x;
    y;
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
    add(x, y) {
      this.x += x;
      this.y += y;
      return this;
    }
    sum(rhs) {
      return new _Point(this.x + rhs.x, this.y + rhs.y);
    }
    equal(rhs) {
      return this.x === rhs.x && this.y === rhs.y;
    }
    set(rhs) {
      this.x = rhs.x;
      this.y = rhs.y;
      return this;
    }
    dup() {
      return new _Point(this.x, this.y);
    }
  };

  // src/renderer/dividermove/dividermove.ts
  var DIVIDER_MOVE_EVENT = "divider_move";
  var getPageRect = (ele) => {
    const viewportRect = ele.getBoundingClientRect();
    return {
      top: viewportRect.top + window.scrollY,
      left: viewportRect.left + window.scrollX,
      width: viewportRect.width,
      height: viewportRect.height
    };
  };
  var DividerMove = class {
    begin = null;
    parentRect = null;
    currentMoveLocation = new Point(0, 0);
    lastMoveSent = new Point(0, 0);
    parent;
    divider;
    internvalHandle = 0;
    constructor(parent, divider2) {
      this.parent = parent;
      this.divider = divider2;
      this.divider.addEventListener("mousedown", this.mousedown.bind(this));
    }
    detach() {
      this.parent.removeEventListener("mousemove", this.mousemove.bind(this));
      this.divider.removeEventListener("mousedown", this.mousedown.bind(this));
      this.parent.removeEventListener("mouseup", this.mouseup.bind(this));
      this.parent.removeEventListener("mouseleave", this.mouseleave.bind(this));
      window.clearInterval(this.internvalHandle);
    }
    onTimeout() {
      if (!this.currentMoveLocation.equal(this.lastMoveSent)) {
        this.parent.dispatchEvent(
          // TODO clamp results to [5, 95]%.
          new CustomEvent(DIVIDER_MOVE_EVENT, {
            detail: {
              before: 100 * (this.currentMoveLocation.x - this.parentRect.left) / this.parentRect.width,
              after: 100 * (this.parentRect.left + this.parentRect.width - this.currentMoveLocation.x) / this.parentRect.width
            }
          })
        );
        this.lastMoveSent.set(this.currentMoveLocation);
      }
    }
    mousemove(e) {
      if (this.begin === null) {
        return;
      }
      this.currentMoveLocation.x = e.pageX;
      this.currentMoveLocation.y = e.pageY;
    }
    mousedown(e) {
      this.internvalHandle = window.setInterval(this.onTimeout.bind(this), 16);
      this.parentRect = getPageRect(this.parent);
      this.parent.addEventListener("mousemove", this.mousemove.bind(this));
      this.parent.addEventListener("mouseup", this.mouseup.bind(this));
      this.parent.addEventListener("mouseleave", this.mouseleave.bind(this));
      this.begin = new Point(e.pageX, e.pageY);
    }
    mouseup(e) {
      if (this.begin === null) {
        return;
      }
      this.finished(new Point(e.pageX, e.pageY));
    }
    mouseleave(e) {
      if (this.begin === null) {
        return;
      }
      this.finished(new Point(e.pageX, e.pageY));
    }
    finished(end) {
      window.clearInterval(this.internvalHandle);
      this.parent.removeEventListener("mousemove", this.mousemove.bind(this));
      this.parent.removeEventListener("mouseup", this.mouseup.bind(this));
      this.parent.removeEventListener("mouseleave", this.mouseleave.bind(this));
      this.currentMoveLocation = end;
      this.onTimeout();
      this.begin = null;
      this.currentMoveLocation = new Point(0, 0);
      this.lastMoveSent = new Point(0, 0);
    }
  };

  // src/renderer/mousemove/mousemove.ts
  var DRAG_RANGE_EVENT = "dragrange";
  var MouseMove = class {
    begin = null;
    currentMoveLocation = new Point(0, 0);
    lastMoveSent = new Point(0, 0);
    ele;
    internvalHandle = 0;
    constructor(ele) {
      this.ele = ele;
      ele.addEventListener("mousemove", this.mousemove.bind(this));
      ele.addEventListener("mousedown", this.mousedown.bind(this));
      ele.addEventListener("mouseup", this.mouseup.bind(this));
      ele.addEventListener("mouseleave", this.mouseleave.bind(this));
    }
    detach() {
      this.ele.removeEventListener("mousemove", this.mousemove.bind(this));
      this.ele.removeEventListener("mousedown", this.mousedown.bind(this));
      this.ele.removeEventListener("mouseup", this.mouseup.bind(this));
      this.ele.removeEventListener("mouseleave", this.mouseleave.bind(this));
      window.clearInterval(this.internvalHandle);
    }
    onTimeout() {
      if (!this.currentMoveLocation.equal(this.lastMoveSent)) {
        this.ele.dispatchEvent(
          new CustomEvent(DRAG_RANGE_EVENT, {
            detail: {
              begin: this.begin.dup(),
              end: this.currentMoveLocation.dup()
            }
          })
        );
        this.lastMoveSent.set(this.currentMoveLocation);
      }
    }
    mousemove(e) {
      if (this.begin === null) {
        return;
      }
      this.currentMoveLocation.x = e.offsetX;
      this.currentMoveLocation.y = e.offsetY;
    }
    mousedown(e) {
      this.internvalHandle = window.setInterval(this.onTimeout.bind(this), 16);
      this.begin = new Point(e.offsetX, e.offsetY);
    }
    mouseup(e) {
      this.finished(new Point(e.offsetX, e.offsetY));
    }
    mouseleave(e) {
      if (this.begin === null) {
        return;
      }
      this.finished(new Point(e.offsetX, e.offsetY));
    }
    finished(end) {
      window.clearInterval(this.internvalHandle);
      this.currentMoveLocation = end;
      this.onTimeout();
      this.begin = null;
      this.currentMoveLocation = new Point(0, 0);
      this.lastMoveSent = new Point(0, 0);
    }
  };

  // src/renderer/range/range.ts
  var MIN_DISPLAY_RANGE = 7;
  var DisplayRange = class {
    _begin;
    _end;
    constructor(begin, end) {
      this._begin = begin;
      this._end = end;
      if (this._begin > this._end) {
        [this._end, this._begin] = [this._begin, this._end];
      }
      if (this._end - this._begin < MIN_DISPLAY_RANGE) {
        this._end = this._begin + MIN_DISPLAY_RANGE;
      }
    }
    in(x) {
      return x >= this._begin && x <= this._end;
    }
    get begin() {
      return this._begin;
    }
    get end() {
      return this._end;
    }
    get rangeInDays() {
      return this._end - this._begin;
    }
  };

  // src/chart/filter/filter.ts
  var filter = (chart, filterFunc, highlightedTasks, spans2, labels) => {
    const vret = validateChart(chart);
    if (!vret.ok) {
      return vret;
    }
    const topologicalOrder = vret.value;
    if (filterFunc === null) {
      return ok({
        chartLike: chart,
        displayOrder: vret.value,
        highlightedTasks,
        spans: spans2,
        labels
      });
    }
    const tasks = [];
    const edges = [];
    const displayOrder = [];
    const filteredSpans = [];
    const filteredLabels = [];
    const fromOriginalToNewIndex = /* @__PURE__ */ new Map();
    chart.Vertices.forEach((task, originalIndex) => {
      if (filterFunc(task, originalIndex)) {
        tasks.push(task);
        filteredSpans.push(spans2[originalIndex]);
        filteredLabels.push(labels[originalIndex]);
        const newIndex = tasks.length - 1;
        fromOriginalToNewIndex.set(originalIndex, newIndex);
      }
    });
    chart.Edges.forEach((directedEdge) => {
      if (!fromOriginalToNewIndex.has(directedEdge.i) || !fromOriginalToNewIndex.has(directedEdge.j)) {
        return;
      }
      edges.push(
        new DirectedEdge(
          fromOriginalToNewIndex.get(directedEdge.i),
          fromOriginalToNewIndex.get(directedEdge.j)
        )
      );
    });
    topologicalOrder.forEach((originalTaskIndex) => {
      const task = chart.Vertices[originalTaskIndex];
      if (!filterFunc(task, originalTaskIndex)) {
        return;
      }
      displayOrder.push(fromOriginalToNewIndex.get(originalTaskIndex));
    });
    const updatedHighlightedTasks = highlightedTasks.map(
      (originalTaskIndex) => fromOriginalToNewIndex.get(originalTaskIndex)
    );
    return ok({
      chartLike: {
        Edges: edges,
        Vertices: tasks
      },
      displayOrder,
      highlightedTasks: updatedHighlightedTasks,
      spans: filteredSpans,
      labels: filteredLabels
    });
  };

  // src/renderer/scale/scale.ts
  var makeOdd = (n) => {
    if (n % 2 === 0) {
      return n + 1;
    }
    return n;
  };
  var Scale = class {
    dayWidthPx;
    rowHeightPx;
    blockSizePx;
    taskHeightPx;
    lineWidthPx;
    marginSizePx;
    timelineHeightPx;
    origin;
    totalNumberOfDays;
    groupByColumnWidthPx;
    timelineOrigin;
    tasksOrigin;
    groupByOrigin;
    tasksClipRectOrigin;
    constructor(opts, canvasWidthPx, totalNumberOfDays, maxGroupNameLength = 0) {
      this.totalNumberOfDays = totalNumberOfDays;
      this.groupByColumnWidthPx = maxGroupNameLength * opts.fontSizePx;
      this.blockSizePx = Math.floor(opts.fontSizePx / 3);
      this.taskHeightPx = makeOdd(Math.floor(this.blockSizePx * 3 / 4));
      this.lineWidthPx = makeOdd(Math.floor(this.taskHeightPx / 3));
      const milestoneRadius = Math.ceil(this.taskHeightPx / 2) + this.lineWidthPx;
      this.marginSizePx = milestoneRadius;
      this.timelineHeightPx = opts.hasTimeline ? Math.ceil(opts.fontSizePx * 4 / 3) : 0;
      this.timelineOrigin = new Point(milestoneRadius, 0);
      this.groupByOrigin = new Point(0, milestoneRadius + this.timelineHeightPx);
      let beginOffset = 0;
      if (opts.displayRange === null || opts.displayRangeUsage === "highlight") {
        this.dayWidthPx = (canvasWidthPx - this.groupByColumnWidthPx - 2 * this.marginSizePx) / totalNumberOfDays;
        this.origin = new Point(0, 0);
      } else {
        this.dayWidthPx = (canvasWidthPx - this.groupByColumnWidthPx - 2 * this.marginSizePx) / opts.displayRange.rangeInDays;
        beginOffset = Math.floor(
          this.dayWidthPx * opts.displayRange.begin + this.marginSizePx
        );
        this.origin = new Point(-beginOffset + this.marginSizePx, 0);
      }
      this.tasksOrigin = new Point(
        this.groupByColumnWidthPx - beginOffset + milestoneRadius,
        this.timelineHeightPx + milestoneRadius
      );
      this.tasksClipRectOrigin = new Point(
        this.groupByColumnWidthPx,
        this.timelineHeightPx
      );
      if (opts.hasText) {
        this.rowHeightPx = 6 * this.blockSizePx;
      } else {
        this.rowHeightPx = 1.1 * this.blockSizePx;
      }
    }
    /** The height of the chart. Note that it's not constrained by the canvas. */
    height(maxRows) {
      return maxRows * this.rowHeightPx + this.timelineHeightPx + 2 * this.marginSizePx;
    }
    dayRowFromPoint(point) {
      return {
        day: clamp(
          Math.floor(
            (window.devicePixelRatio * point.x - this.origin.x - this.marginSizePx - this.groupByColumnWidthPx) / this.dayWidthPx
          ),
          0,
          this.totalNumberOfDays
        ),
        row: Math.floor(
          (window.devicePixelRatio * point.y - this.origin.y - this.marginSizePx - this.timelineHeightPx) / this.rowHeightPx
        )
      };
    }
    /** The top left corner of the bounding box for a single task. */
    taskRowEnvelopeStart(row, day) {
      return this.origin.sum(
        new Point(
          Math.floor(
            day * this.dayWidthPx + this.marginSizePx + this.groupByColumnWidthPx
          ),
          Math.floor(
            row * this.rowHeightPx + this.marginSizePx + this.timelineHeightPx
          )
        )
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    groupRowEnvelopeStart(row, day) {
      return this.groupByOrigin.sum(
        new Point(
          0,
          row * this.rowHeightPx + this.marginSizePx + this.timelineHeightPx
        )
      );
    }
    groupHeaderStart() {
      return this.origin.sum(new Point(this.marginSizePx, this.marginSizePx));
    }
    timeEnvelopeStart(day) {
      return this.origin.sum(
        new Point(
          day * this.dayWidthPx + this.marginSizePx + this.groupByColumnWidthPx,
          this.marginSizePx
        )
      );
    }
    /** Returns the coordinate of the item */
    feature(row, day, coord) {
      switch (coord) {
        case 0 /* taskLineStart */:
        case 4 /* verticalArrowDestTop */:
        case 7 /* verticalArrowStart */:
          return this.taskRowEnvelopeStart(row, day).add(
            0,
            this.rowHeightPx - this.blockSizePx
          );
        case 5 /* verticalArrowDestBottom */:
          return this.taskRowEnvelopeStart(row, day).add(0, this.rowHeightPx);
        case 1 /* textStart */:
          return this.taskRowEnvelopeStart(row, day).add(
            this.blockSizePx,
            this.blockSizePx
          );
        case 2 /* groupTextStart */:
          return this.groupRowEnvelopeStart(row, day).add(
            this.blockSizePx,
            this.blockSizePx
          );
        case 3 /* percentStart */:
          return this.taskRowEnvelopeStart(row, day).add(
            0,
            this.rowHeightPx - this.lineWidthPx
          );
        case 6 /* horizontalArrowDest */:
        case 8 /* horizontalArrowStart */:
          return this.taskRowEnvelopeStart(row, day).add(
            0,
            Math.floor(this.rowHeightPx - 0.5 * this.blockSizePx) - 1
          );
        case 9 /* verticalArrowDestToMilestoneTop */:
          return this.feature(row, day, 4 /* verticalArrowDestTop */).add(
            0,
            -1 * this.metric(4 /* milestoneDiameter */)
          );
        case 10 /* verticalArrowDestToMilestoneBottom */:
          return this.feature(row, day, 4 /* verticalArrowDestTop */).add(
            0,
            this.metric(4 /* milestoneDiameter */)
          );
        case 11 /* horizontalArrowDestToMilestone */:
          return this.feature(row, day, 6 /* horizontalArrowDest */).add(
            -1 * this.metric(4 /* milestoneDiameter */),
            -1 * this.metric(4 /* milestoneDiameter */)
          );
        case 12 /* verticalArrowStartFromMilestoneTop */:
          return this.feature(row, day, 7 /* verticalArrowStart */).add(
            0,
            -1 * this.metric(4 /* milestoneDiameter */)
          );
        case 13 /* verticalArrowStartFromMilestoneBottom */:
          return this.feature(row, day, 7 /* verticalArrowStart */).add(
            0,
            this.metric(4 /* milestoneDiameter */)
          );
        case 14 /* horizontalArrowStartFromMilestone */:
          return this.feature(row, day, 8 /* horizontalArrowStart */).add(
            this.metric(4 /* milestoneDiameter */),
            0
          );
        case 16 /* taskEnvelopeTop */:
          return this.taskRowEnvelopeStart(row, day);
        case 15 /* groupEnvelopeStart */:
          return this.groupRowEnvelopeStart(row, day);
        case 19 /* timeMarkStart */:
          return this.timeEnvelopeStart(day);
        case 20 /* timeMarkEnd */:
          return this.timeEnvelopeStart(day).add(0, this.rowHeightPx * (row + 1));
        case 21 /* timeTextStart */:
          return this.timeEnvelopeStart(day).add(this.blockSizePx, 0);
        case 22 /* groupTitleTextStart */:
          return this.groupHeaderStart().add(this.blockSizePx, 0);
        case 17 /* displayRangeTop */:
          return this.timeEnvelopeStart(day);
        case 18 /* taskRowBottom */:
          return this.taskRowEnvelopeStart(row + 1, day);
        case 23 /* tasksClipRectOrigin */:
          return this.tasksClipRectOrigin;
        case 24 /* groupByOrigin */:
          return this.groupByOrigin;
        default:
          coord;
          return new Point(0, 0);
      }
    }
    metric(feature) {
      switch (feature) {
        case 0 /* taskLineHeight */:
          return this.taskHeightPx;
        case 1 /* percentHeight */:
          return this.lineWidthPx;
        case 2 /* arrowHeadHeight */:
          return this.taskHeightPx;
        case 3 /* arrowHeadWidth */:
          return Math.ceil(this.taskHeightPx);
        case 4 /* milestoneDiameter */:
          return Math.ceil(this.taskHeightPx);
        case 5 /* lineDashLine */:
          return this.blockSizePx;
        case 6 /* lineDashGap */:
          return this.blockSizePx;
        case 7 /* textXOffset */:
          return this.blockSizePx;
        default:
          feature;
          return 0;
      }
    }
  };

  // src/renderer/renderer.ts
  var verticalArrowStartFeatureFromTaskDuration = (task, direction) => {
    if (task.duration === 0) {
      if (direction === "down") {
        return 13 /* verticalArrowStartFromMilestoneBottom */;
      }
      return 12 /* verticalArrowStartFromMilestoneTop */;
    } else {
      return 7 /* verticalArrowStart */;
    }
  };
  var verticalArrowDestFeatureFromTaskDuration = (task, direction) => {
    if (task.duration === 0) {
      if (direction === "down") {
        return 9 /* verticalArrowDestToMilestoneTop */;
      }
      return 10 /* verticalArrowDestToMilestoneBottom */;
    } else {
      if (direction === "down") {
        return 4 /* verticalArrowDestTop */;
      }
      return 5 /* verticalArrowDestBottom */;
    }
  };
  var horizontalArrowDestFeatureFromTaskDuration = (task) => {
    if (task.duration === 0) {
      return 11 /* horizontalArrowDestToMilestone */;
    } else {
      return 6 /* horizontalArrowDest */;
    }
  };
  function suggestedCanvasHeight(canvas, spans2, opts, maxRows) {
    if (!opts.hasTasks) {
      maxRows = 0;
    }
    return new Scale(
      opts,
      canvas.width,
      spans2[spans2.length - 1].finish + 1
    ).height(maxRows);
  }
  function renderTasksToCanvas(parent, canvas, ctx, plan2, spans2, opts) {
    const vret = validateChart(plan2.chart);
    if (!vret.ok) {
      return vret;
    }
    const originalLabels = plan2.chart.Vertices.map(
      (task, taskIndex) => opts.taskLabel(taskIndex)
    );
    const fret = filter(
      plan2.chart,
      opts.filterFunc,
      opts.taskHighlights,
      spans2,
      originalLabels
    );
    if (!fret.ok) {
      return fret;
    }
    const chartLike = fret.value.chartLike;
    const labels = fret.value.labels;
    const resourceDefinition = plan2.getResourceDefinition(opts.groupByResource);
    const taskHighlights = new Set(fret.value.highlightedTasks);
    spans2 = fret.value.spans;
    const newHeight = suggestedCanvasHeight(
      canvas,
      spans2,
      opts,
      chartLike.Vertices.length + 2
      // TODO - Why do we need the +2 here!?
    );
    canvas.height = newHeight;
    canvas.style.height = `${newHeight / window.devicePixelRatio}px`;
    let maxGroupNameLength = 0;
    if (opts.groupByResource !== "" && opts.hasText) {
      maxGroupNameLength = opts.groupByResource.length;
      if (resourceDefinition !== void 0) {
        resourceDefinition.values.forEach((value) => {
          maxGroupNameLength = Math.max(maxGroupNameLength, value.length);
        });
      }
    }
    const totalNumberOfRows = spans2.length;
    const totalNumberOfDays = spans2[spans2.length - 1].finish;
    const scale2 = new Scale(
      opts,
      canvas.width,
      totalNumberOfDays + 1,
      maxGroupNameLength
    );
    const taskLineHeight = scale2.metric(0 /* taskLineHeight */);
    const diamondDiameter = scale2.metric(4 /* milestoneDiameter */);
    const percentHeight = scale2.metric(1 /* percentHeight */);
    const arrowHeadHeight = scale2.metric(2 /* arrowHeadHeight */);
    const arrowHeadWidth = scale2.metric(3 /* arrowHeadWidth */);
    const daysWithTimeMarkers = /* @__PURE__ */ new Set();
    const tiret = taskIndexToRowFromGroupBy(
      opts,
      resourceDefinition,
      chartLike,
      fret.value.displayOrder
    );
    if (!tiret.ok) {
      return tiret;
    }
    const taskIndexToRow = tiret.value.taskIndexToRow;
    const rowRanges = tiret.value.rowRanges;
    clearCanvas(ctx, opts, canvas);
    setFontSize(ctx, opts);
    const clipRegion = new Path2D();
    const clipOrigin = scale2.feature(0, 0, 23 /* tasksClipRectOrigin */);
    const clipWidth = canvas.width - clipOrigin.x;
    clipRegion.rect(clipOrigin.x, 0, clipWidth, canvas.height);
    if (0) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.stroke(clipRegion);
    }
    ctx.fillStyle = opts.colors.onSurface;
    ctx.strokeStyle = opts.colors.onSurface;
    if (rowRanges !== null) {
      if (opts.hasTasks) {
        drawSwimLaneHighlights(
          ctx,
          scale2,
          rowRanges,
          totalNumberOfDays,
          opts.colors.groupColor
        );
      }
      if (resourceDefinition !== void 0 && opts.hasText) {
        drawSwimLaneLabels(ctx, opts, resourceDefinition, scale2, rowRanges);
      }
    }
    ctx.fillStyle = opts.colors.onSurface;
    ctx.strokeStyle = opts.colors.onSurface;
    ctx.save();
    ctx.clip(clipRegion);
    chartLike.Vertices.forEach((task, taskIndex) => {
      const row = taskIndexToRow.get(taskIndex);
      const span = spans2[taskIndex];
      const taskStart = scale2.feature(row, span.start, 0 /* taskLineStart */);
      const taskEnd = scale2.feature(row, span.finish, 0 /* taskLineStart */);
      ctx.fillStyle = opts.colors.onSurfaceMuted;
      ctx.strokeStyle = opts.colors.onSurfaceMuted;
      if (opts.drawTimeMarkersOnTasks) {
        drawTimeMarkerAtDayToTask(
          ctx,
          row,
          span.start,
          task,
          opts,
          scale2,
          daysWithTimeMarkers
        );
      }
      if (taskHighlights.has(taskIndex)) {
        ctx.fillStyle = opts.colors.onSurfaceHighlight;
        ctx.strokeStyle = opts.colors.onSurfaceHighlight;
      } else {
        ctx.fillStyle = opts.colors.onSurface;
        ctx.strokeStyle = opts.colors.onSurface;
      }
      if (opts.hasTasks) {
        if (taskStart.x === taskEnd.x) {
          drawMilestone(ctx, taskStart, diamondDiameter, percentHeight);
        } else {
          drawTaskBar(ctx, taskStart, taskEnd, taskLineHeight);
        }
        if (taskIndex !== 0 && taskIndex !== totalNumberOfRows - 1) {
          drawTaskText(
            ctx,
            opts,
            scale2,
            row,
            span,
            task,
            taskIndex,
            clipWidth,
            labels
          );
        }
      }
    });
    ctx.lineWidth = 1;
    ctx.strokeStyle = opts.colors.onSurfaceMuted;
    if (opts.hasEdges && opts.hasTasks) {
      const highlightedEdges = [];
      const normalEdges = [];
      chartLike.Edges.forEach((e) => {
        if (taskHighlights.has(e.i) && taskHighlights.has(e.j)) {
          highlightedEdges.push(e);
        } else {
          normalEdges.push(e);
        }
      });
      ctx.strokeStyle = opts.colors.onSurfaceMuted;
      drawEdges(
        ctx,
        opts,
        normalEdges,
        spans2,
        chartLike.Vertices,
        scale2,
        taskIndexToRow,
        arrowHeadWidth,
        arrowHeadHeight,
        taskHighlights
      );
      ctx.strokeStyle = opts.colors.onSurfaceHighlight;
      drawEdges(
        ctx,
        opts,
        highlightedEdges,
        spans2,
        chartLike.Vertices,
        scale2,
        taskIndexToRow,
        arrowHeadWidth,
        arrowHeadHeight,
        taskHighlights
      );
    }
    ctx.restore();
    if (opts.displayRange !== null && opts.displayRangeUsage === "highlight") {
      if (opts.displayRange.begin > 0) {
        drawRangeOverlay(
          ctx,
          opts,
          scale2,
          0,
          opts.displayRange.begin,
          totalNumberOfRows
        );
      }
      if (opts.displayRange.end < totalNumberOfDays) {
        drawRangeOverlay(
          ctx,
          opts,
          scale2,
          opts.displayRange.end,
          totalNumberOfDays + 1,
          totalNumberOfRows
        );
      }
    }
    return ok(scale2);
  }
  function drawEdges(ctx, opts, edges, spans2, tasks, scale2, taskIndexToRow, arrowHeadWidth, arrowHeadHeight, taskHighlights) {
    edges.forEach((e) => {
      const srcSlack = spans2[e.i];
      const dstSlack = spans2[e.j];
      const srcTask = tasks[e.i];
      const dstTask = tasks[e.j];
      const srcRow = taskIndexToRow.get(e.i);
      const dstRow = taskIndexToRow.get(e.j);
      const srcDay = srcSlack.finish;
      const dstDay = dstSlack.start;
      if (taskHighlights.has(e.i) && taskHighlights.has(e.j)) {
        ctx.strokeStyle = opts.colors.onSurfaceHighlight;
      } else {
        ctx.strokeStyle = opts.colors.onSurfaceMuted;
      }
      drawArrowBetweenTasks(
        ctx,
        srcDay,
        dstDay,
        scale2,
        srcRow,
        srcTask,
        dstRow,
        dstTask,
        arrowHeadWidth,
        arrowHeadHeight
      );
    });
  }
  function drawRangeOverlay(ctx, opts, scale2, beginDay, endDay, totalNumberOfRows) {
    const topLeft = scale2.feature(0, beginDay, 17 /* displayRangeTop */);
    const bottomRight = scale2.feature(
      totalNumberOfRows,
      endDay,
      18 /* taskRowBottom */
    );
    ctx.fillStyle = opts.colors.overlay;
    ctx.fillRect(
      topLeft.x,
      topLeft.y,
      bottomRight.x - topLeft.x,
      bottomRight.y - topLeft.y
    );
    console.log("drawRangeOverlay", topLeft, bottomRight);
  }
  function drawArrowBetweenTasks(ctx, srcDay, dstDay, scale2, srcRow, srcTask, dstRow, dstTask, arrowHeadWidth, arrowHeadHeight) {
    if (srcDay === dstDay) {
      drawVerticalArrowToTask(
        ctx,
        scale2,
        srcRow,
        srcDay,
        srcTask,
        dstRow,
        dstDay,
        dstTask,
        arrowHeadWidth,
        arrowHeadHeight
      );
    } else {
      drawLShapedArrowToTask(
        ctx,
        scale2,
        srcRow,
        srcDay,
        srcTask,
        dstRow,
        dstTask,
        dstDay,
        arrowHeadHeight,
        arrowHeadWidth
      );
    }
  }
  function clearCanvas(ctx, opts, canvas) {
    ctx.fillStyle = opts.colors.surface;
    ctx.strokeStyle = opts.colors.onSurface;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  function setFontSize(ctx, opts) {
    ctx.font = `${opts.fontSizePx}px serif`;
  }
  function drawLShapedArrowToTask(ctx, scale2, srcRow, srcDay, srcTask, dstRow, dstTask, dstDay, arrowHeadHeight, arrowHeadWidth) {
    ctx.beginPath();
    const direction = srcRow < dstRow ? "down" : "up";
    const vertLineStart = scale2.feature(
      srcRow,
      srcDay,
      verticalArrowStartFeatureFromTaskDuration(srcTask, direction)
    );
    const vertLineEnd = scale2.feature(
      dstRow,
      srcDay,
      horizontalArrowDestFeatureFromTaskDuration(dstTask)
    );
    ctx.moveTo(vertLineStart.x + 0.5, vertLineStart.y);
    ctx.lineTo(vertLineStart.x + 0.5, vertLineEnd.y);
    const horzLineStart = vertLineEnd;
    const horzLineEnd = scale2.feature(
      dstRow,
      dstDay,
      horizontalArrowDestFeatureFromTaskDuration(dstTask)
    );
    ctx.moveTo(vertLineStart.x + 0.5, horzLineStart.y);
    ctx.lineTo(horzLineEnd.x + 0.5, horzLineEnd.y);
    ctx.moveTo(horzLineEnd.x + 0.5, horzLineEnd.y);
    ctx.lineTo(
      horzLineEnd.x - arrowHeadHeight + 0.5,
      horzLineEnd.y + arrowHeadWidth
    );
    ctx.moveTo(horzLineEnd.x + 0.5, horzLineEnd.y);
    ctx.lineTo(
      horzLineEnd.x - arrowHeadHeight + 0.5,
      horzLineEnd.y - arrowHeadWidth
    );
    ctx.stroke();
  }
  function drawVerticalArrowToTask(ctx, scale2, srcRow, srcDay, srcTask, dstRow, dstDay, dstTask, arrowHeadWidth, arrowHeadHeight) {
    const direction = srcRow < dstRow ? "down" : "up";
    const arrowStart = scale2.feature(
      srcRow,
      srcDay,
      verticalArrowStartFeatureFromTaskDuration(srcTask, direction)
    );
    const arrowEnd = scale2.feature(
      dstRow,
      dstDay,
      verticalArrowDestFeatureFromTaskDuration(dstTask, direction)
    );
    ctx.beginPath();
    ctx.moveTo(arrowStart.x + 0.5, arrowStart.y);
    ctx.lineTo(arrowEnd.x + 0.5, arrowEnd.y);
    const deltaY = direction === "down" ? -arrowHeadHeight : arrowHeadHeight;
    ctx.moveTo(arrowEnd.x + 0.5, arrowEnd.y);
    ctx.lineTo(arrowEnd.x - arrowHeadWidth + 0.5, arrowEnd.y + deltaY);
    ctx.moveTo(arrowEnd.x + 0.5, arrowEnd.y);
    ctx.lineTo(arrowEnd.x + arrowHeadWidth + 0.5, arrowEnd.y + deltaY);
    ctx.stroke();
  }
  function drawTaskText(ctx, opts, scale2, row, span, task, taskIndex, clipWidth, labels) {
    if (!opts.hasText) {
      return;
    }
    const label = labels[taskIndex];
    let xStartInTime = span.start;
    let xPixelDelta = 0;
    if (opts.displayRange !== null && opts.displayRangeUsage === "restrict") {
      if (opts.displayRange.in(span.start)) {
        xStartInTime = span.start;
        xPixelDelta = 0;
      } else if (opts.displayRange.in(span.finish)) {
        xStartInTime = span.finish;
        const meas = ctx.measureText(label);
        xPixelDelta = -meas.width - 2 * scale2.metric(7 /* textXOffset */);
      } else if (span.start < opts.displayRange.begin && span.finish > opts.displayRange.end) {
        xStartInTime = opts.displayRange.begin;
        xPixelDelta = clipWidth / 2;
      }
    }
    ctx.lineWidth = 1;
    ctx.fillStyle = opts.colors.onSurface;
    ctx.textBaseline = "top";
    const textStart = scale2.feature(row, xStartInTime, 1 /* textStart */);
    ctx.fillText(label, textStart.x + xPixelDelta, textStart.y);
  }
  function drawTaskBar(ctx, taskStart, taskEnd, taskLineHeight) {
    ctx.fillRect(
      taskStart.x,
      taskStart.y,
      taskEnd.x - taskStart.x,
      taskLineHeight
    );
  }
  function drawMilestone(ctx, taskStart, diamondDiameter, percentHeight) {
    ctx.beginPath();
    ctx.lineWidth = percentHeight / 2;
    ctx.moveTo(taskStart.x, taskStart.y - diamondDiameter);
    ctx.lineTo(taskStart.x + diamondDiameter, taskStart.y);
    ctx.lineTo(taskStart.x, taskStart.y + diamondDiameter);
    ctx.lineTo(taskStart.x - diamondDiameter, taskStart.y);
    ctx.closePath();
    ctx.stroke();
  }
  var drawTimeMarkerAtDayToTask = (ctx, row, day, task, opts, scale2, daysWithTimeMarkers) => {
    if (daysWithTimeMarkers.has(day)) {
      return;
    }
    daysWithTimeMarkers.add(day);
    const timeMarkStart = scale2.feature(row, day, 19 /* timeMarkStart */);
    const timeMarkEnd = scale2.feature(
      row,
      day,
      verticalArrowDestFeatureFromTaskDuration(task, "down")
    );
    ctx.lineWidth = 1;
    ctx.setLineDash([
      scale2.metric(5 /* lineDashLine */),
      scale2.metric(6 /* lineDashGap */)
    ]);
    ctx.moveTo(timeMarkStart.x + 0.5, timeMarkStart.y);
    ctx.lineTo(timeMarkStart.x + 0.5, timeMarkEnd.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = opts.colors.onSurface;
    ctx.textBaseline = "top";
    const textStart = scale2.feature(row, day, 21 /* timeTextStart */);
    if (opts.hasText && opts.hasTimeline) {
      ctx.fillText(`${day}`, textStart.x, textStart.y);
    }
  };
  var taskIndexToRowFromGroupBy = (opts, resourceDefinition, chartLike, displayOrder) => {
    const taskIndexToRow = new Map(
      // This looks backwards, but it isn't. Remember that the map callback takes
      // (value, index) as its arguments.
      displayOrder.map((taskIndex, row2) => [taskIndex, row2])
    );
    if (resourceDefinition === void 0) {
      return ok({
        taskIndexToRow,
        rowRanges: null,
        resourceDefinition: null
      });
    }
    const startTaskIndex = 0;
    const finishTaskIndex = chartLike.Vertices.length - 1;
    const ignorable = [startTaskIndex, finishTaskIndex];
    const groups = /* @__PURE__ */ new Map();
    displayOrder.forEach((taskIndex) => {
      const resourceValue = chartLike.Vertices[taskIndex].getResource(opts.groupByResource) || "";
      const groupMembers = groups.get(resourceValue) || [];
      groupMembers.push(taskIndex);
      groups.set(resourceValue, groupMembers);
    });
    const ret = /* @__PURE__ */ new Map();
    ret.set(0, 0);
    let row = 1;
    const rowRanges = /* @__PURE__ */ new Map();
    resourceDefinition.values.forEach(
      (resourceValue, resourceIndex) => {
        const startOfRow = row;
        (groups.get(resourceValue) || []).forEach((taskIndex) => {
          if (ignorable.includes(taskIndex)) {
            return;
          }
          ret.set(taskIndex, row);
          row++;
        });
        rowRanges.set(resourceIndex, { start: startOfRow, finish: row });
      }
    );
    ret.set(finishTaskIndex, row);
    return ok({
      taskIndexToRow: ret,
      rowRanges,
      resourceDefinition
    });
  };
  var drawSwimLaneHighlights = (ctx, scale2, rowRanges, totalNumberOfDays, groupColor) => {
    ctx.fillStyle = groupColor;
    let group = 0;
    rowRanges.forEach((rowRange) => {
      const topLeft = scale2.feature(
        rowRange.start,
        0,
        15 /* groupEnvelopeStart */
      );
      const bottomRight = scale2.feature(
        rowRange.finish,
        totalNumberOfDays + 1,
        16 /* taskEnvelopeTop */
      );
      group++;
      if (group % 2 == 1) {
        return;
      }
      ctx.fillRect(
        topLeft.x,
        topLeft.y,
        bottomRight.x - topLeft.x,
        bottomRight.y - topLeft.y
      );
    });
  };
  var drawSwimLaneLabels = (ctx, opts, resourceDefinition, scale2, rowRanges) => {
    if (rowRanges) ctx.lineWidth = 1;
    ctx.fillStyle = opts.colors.onSurface;
    const groupByOrigin = scale2.feature(0, 0, 24 /* groupByOrigin */);
    if (opts.hasTimeline) {
      ctx.textBaseline = "bottom";
      ctx.fillText(opts.groupByResource, groupByOrigin.x, groupByOrigin.y);
    }
    if (opts.hasTasks) {
      ctx.textBaseline = "top";
      rowRanges.forEach((rowRange, resourceIndex) => {
        if (rowRange.start === rowRange.finish) {
          return;
        }
        const textStart = scale2.feature(
          rowRange.start,
          0,
          2 /* groupTextStart */
        );
        ctx.fillText(
          resourceDefinition.values[resourceIndex],
          textStart.x,
          textStart.y
        );
      });
    }
  };

  // src/slack/slack.ts
  var Span = class {
    start;
    finish;
    constructor(start = 0, finish = 0) {
      this.start = start;
      this.finish = finish;
    }
  };
  var Slack = class {
    early = new Span();
    late = new Span();
    slack = 0;
  };
  var defaultTaskDuration = (t) => {
    return t.duration;
  };
  function ComputeSlack(c, taskDuration = defaultTaskDuration, round) {
    const slacks2 = new Array(c.Vertices.length);
    for (let i = 0; i < c.Vertices.length; i++) {
      slacks2[i] = new Slack();
    }
    const r = ChartValidate(c);
    if (!r.ok) {
      return error(r.error);
    }
    const edges = edgesBySrcAndDstToMap(c.Edges);
    const topologicalOrder = r.value;
    topologicalOrder.slice(1).forEach((vertexIndex) => {
      const task = c.Vertices[vertexIndex];
      const slack = slacks2[vertexIndex];
      slack.early.start = Math.max(
        ...edges.byDst.get(vertexIndex).map((e) => {
          const predecessorSlack = slacks2[e.i];
          return predecessorSlack.early.finish;
        })
      );
      slack.early.finish = round(
        slack.early.start + taskDuration(task, vertexIndex)
      );
    });
    topologicalOrder.reverse().forEach((vertexIndex) => {
      const task = c.Vertices[vertexIndex];
      const slack = slacks2[vertexIndex];
      const successors = edges.bySrc.get(vertexIndex);
      if (!successors) {
        slack.late.finish = slack.early.finish;
        slack.late.start = slack.early.start;
      } else {
        slack.late.finish = Math.min(
          ...edges.bySrc.get(vertexIndex).map((e) => {
            const successorSlack = slacks2[e.j];
            return successorSlack.late.start;
          })
        );
        slack.late.start = round(
          slack.late.finish - taskDuration(task, vertexIndex)
        );
        slack.slack = round(slack.late.finish - slack.early.finish);
      }
    });
    return ok(slacks2);
  }
  var CriticalPath = (slacks2, round) => {
    const ret = [];
    slacks2.forEach((slack, index) => {
      if (round(slack.late.finish - slack.early.finish) < Number.EPSILON && round(slack.early.finish - slack.early.start) > Number.EPSILON) {
        ret.push(index);
      }
    });
    return ret;
  };

  // src/style/theme/theme.ts
  var colorThemePrototype = {
    surface: "",
    onSurface: "",
    onSurfaceMuted: "",
    onSurfaceSecondary: "",
    overlay: "",
    groupColor: ""
  };
  var colorThemeFromElement = (ele) => {
    const style = getComputedStyle(ele);
    const ret = Object.assign({}, colorThemePrototype);
    Object.keys(ret).forEach((name) => {
      ret[name] = style.getPropertyValue(`--${name}`);
    });
    return ret;
  };

  // src/style/toggler/toggler.ts
  var toggleTheme = () => {
    document.body.classList.toggle("darkmode");
  };

  // src/page.ts
  var FONT_SIZE_PX = 32;
  var plan = new Plan();
  var precision = new Precision(2);
  var rndInt = (n) => {
    return Math.floor(Math.random() * n);
  };
  var DURATION = 100;
  var rndDuration = () => {
    return rndInt(DURATION);
  };
  var people = ["Fred", "Barney", "Wilma", "Betty"];
  var taskID = 0;
  var rndName = () => `T ${taskID++}`;
  var ops = [AddResourceOp("Person")];
  people.forEach((person) => {
    ops.push(AddResourceOptionOp("Person", person));
  });
  ops.push(
    InsertNewEmptyTaskAfterOp(0),
    SetMetricValueOp("Duration", rndDuration(), 1),
    SetTaskNameOp(1, rndName()),
    SetResourceValueOp("Person", people[rndInt(people.length)], 1),
    SetResourceValueOp("Uncertainty", "moderate", 1)
  );
  var numTasks = 1;
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
  var res = applyAllOpsToPlan(ops, plan);
  if (!res.ok) {
    console.log(res.error);
  }
  var slacks = [];
  var spans = [];
  var criticalPath = [];
  var recalculateSpan = () => {
    const slackResult = ComputeSlack(plan.chart, void 0, precision.rounder());
    if (!slackResult.ok) {
      console.error(slackResult);
    } else {
      slacks = slackResult.value;
    }
    spans = slacks.map((value) => {
      return value.early;
    });
    criticalPath = CriticalPath(slacks, precision.rounder());
  };
  recalculateSpan();
  var taskLabel = (taskIndex) => `${plan.chart.Vertices[taskIndex].name}`;
  var displayRange = null;
  var scale = null;
  var radar = document.querySelector("#radar");
  new MouseMove(radar);
  var dragRangeHandler = (e) => {
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
  radar.addEventListener(DRAG_RANGE_EVENT, dragRangeHandler);
  var wrapper = document.querySelector(".wrapper");
  var divider = document.querySelector("#divider");
  new DividerMove(document.body, divider);
  var dividerDragRangeHandler = (e) => {
    wrapper.style.setProperty(
      "grid-template-columns",
      `${e.detail.before}% 10px auto`
    );
    paintChart();
    console.log("mouse", e.detail.before, e.detail.after);
  };
  document.body.addEventListener(
    DIVIDER_MOVE_EVENT,
    dividerDragRangeHandler
  );
  document.querySelector("#reset-zoom").addEventListener("click", () => {
    displayRange = null;
    paintChart();
  });
  document.querySelector("#dark-mode-toggle").addEventListener("click", () => {
    console.log("click");
    toggleTheme();
    paintChart();
  });
  document.querySelector("#radar-toggle").addEventListener("click", () => {
    document.querySelector("#radar-parent").classList.toggle("hidden");
  });
  var topTimeline = false;
  document.querySelector("#top-timeline-toggle").addEventListener("click", () => {
    topTimeline = !topTimeline;
    paintChart();
  });
  var groupByOptions = ["", ...Object.keys(plan.resourceDefinitions)];
  var groupByOptionsIndex = 0;
  var toggleGroupBy = () => {
    groupByOptionsIndex = (groupByOptionsIndex + 1) % groupByOptions.length;
  };
  document.querySelector("#group-by-toggle").addEventListener("click", () => {
    toggleGroupBy();
    paintChart();
  });
  var criticalPathsOnly = false;
  var toggleCriticalPathsOnly = () => {
    criticalPathsOnly = !criticalPathsOnly;
  };
  document.querySelector("#critical-paths-toggle").addEventListener("click", () => {
    toggleCriticalPathsOnly();
    paintChart();
  });
  var paintChart = () => {
    console.time("paintChart");
    const themeColors = colorThemeFromElement(document.body);
    let filterFunc = null;
    if (criticalPathsOnly) {
      const highlightSet = new Set(criticalPath);
      const startAndFinish = [0, plan.chart.Vertices.length - 1];
      filterFunc = (task, taskIndex) => {
        if (startAndFinish.includes(taskIndex)) {
          return true;
        }
        return highlightSet.has(taskIndex);
      };
    }
    const radarOpts = {
      fontSizePx: 6,
      hasText: false,
      displayRange,
      displayRangeUsage: "highlight",
      colors: {
        surface: themeColors.surface,
        onSurface: themeColors.onSurface,
        onSurfaceMuted: themeColors.onSurfaceMuted,
        onSurfaceHighlight: themeColors.onSurfaceSecondary,
        overlay: themeColors.overlay,
        groupColor: themeColors.groupColor
      },
      hasTimeline: false,
      hasTasks: true,
      hasEdges: false,
      drawTimeMarkersOnTasks: false,
      taskLabel,
      taskHighlights: criticalPath,
      filterFunc: null,
      groupByResource: groupByOptions[groupByOptionsIndex]
    };
    const zoomOpts = {
      fontSizePx: FONT_SIZE_PX,
      hasText: true,
      displayRange,
      displayRangeUsage: "restrict",
      colors: {
        surface: themeColors.surface,
        onSurface: themeColors.onSurface,
        onSurfaceMuted: themeColors.onSurfaceMuted,
        onSurfaceHighlight: themeColors.onSurfaceSecondary,
        overlay: themeColors.overlay,
        groupColor: themeColors.groupColor
      },
      hasTimeline: topTimeline,
      hasTasks: true,
      hasEdges: true,
      drawTimeMarkersOnTasks: true,
      taskLabel,
      taskHighlights: criticalPath,
      filterFunc,
      groupByResource: groupByOptions[groupByOptionsIndex]
    };
    const timelineOpts = {
      fontSizePx: FONT_SIZE_PX,
      hasText: true,
      displayRange,
      displayRangeUsage: "restrict",
      colors: {
        surface: themeColors.surface,
        onSurface: themeColors.onSurface,
        onSurfaceMuted: themeColors.onSurfaceMuted,
        onSurfaceHighlight: themeColors.onSurfaceSecondary,
        overlay: themeColors.overlay,
        groupColor: themeColors.groupColor
      },
      hasTimeline: true,
      hasTasks: false,
      hasEdges: true,
      drawTimeMarkersOnTasks: true,
      taskLabel,
      taskHighlights: criticalPath,
      filterFunc,
      groupByResource: groupByOptions[groupByOptionsIndex]
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
  var paintOneChart = (canvasID, opts) => {
    const canvas = document.querySelector(canvasID);
    const parent = canvas.parentElement;
    const ratio = window.devicePixelRatio;
    const width = parent.clientWidth - FONT_SIZE_PX;
    const height = parent.clientHeight;
    const canvasWidth = Math.ceil(width * ratio);
    const canvasHeight = Math.ceil(height * ratio);
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    return renderTasksToCanvas(parent, canvas, ctx, plan, spans, opts);
  };
  var simulate = () => {
    const MAX_RANDOM = 1e3;
    const NUM_SIMULATION_LOOPS = 100;
    const allCriticalPaths = /* @__PURE__ */ new Map();
    for (let i = 0; i < NUM_SIMULATION_LOOPS; i++) {
      const durations = plan.chart.Vertices.map((t) => {
        const rawDuration = new Jacobian(
          t.duration,
          t.getResource("Uncertainty")
        ).sample(rndInt(MAX_RANDOM) / MAX_RANDOM);
        return precision.round(rawDuration);
      });
      const slacksRet = ComputeSlack(
        plan.chart,
        (t, taskIndex) => durations[taskIndex],
        precision.rounder()
      );
      if (!slacksRet.ok) {
        throw slacksRet.error;
      }
      const criticalPath2 = CriticalPath(slacksRet.value, precision.rounder());
      const criticalPathAsString = `${criticalPath2}`;
      let pathEntry = allCriticalPaths.get(criticalPathAsString);
      if (pathEntry === void 0) {
        pathEntry = {
          count: 0,
          tasks: criticalPath2,
          durations
        };
        allCriticalPaths.set(criticalPathAsString, pathEntry);
      }
      pathEntry.count++;
    }
    let display = "";
    allCriticalPaths.forEach((value, key) => {
      display = display + `
 <li data-key=${key}>${value.count} : ${key}</li>`;
    });
    const critialPaths = document.querySelector("#criticalPaths");
    critialPaths.innerHTML = display;
    critialPaths.addEventListener("click", (e) => {
      const criticalPathEntry = allCriticalPaths.get(
        e.target.dataset.key
      );
      criticalPathEntry.durations.forEach(
        (duration, taskIndex) => {
          plan.chart.Vertices[taskIndex].duration = duration;
        }
      );
      recalculateSpan();
      paintChart();
    });
    const critialTasks = /* @__PURE__ */ new Map();
    allCriticalPaths.forEach((value) => {
      value.tasks.forEach((taskIndex) => {
        let taskEntry = critialTasks.get(taskIndex);
        if (taskEntry === void 0) {
          taskEntry = {
            taskIndex,
            duration: plan.chart.Vertices[taskIndex].duration,
            numTimesAppeared: 0
          };
          critialTasks.set(taskIndex, taskEntry);
        }
        taskEntry.numTimesAppeared += value.count;
      });
    });
    const criticalTasksDurationDescending = [...critialTasks.values()].sort(
      (a, b) => {
        return b.duration - a.duration;
      }
    );
    let critialTasksTable = criticalTasksDurationDescending.map(
      (taskEntry) => `<tr>
  <td>${plan.chart.Vertices[taskEntry.taskIndex].name}</td>
  <td>${taskEntry.duration}</td>
  <td>${Math.floor(100 * taskEntry.numTimesAppeared / NUM_SIMULATION_LOOPS)}</td>
</tr>`
    ).join("\n");
    critialTasksTable = `<tr><th>Name</th><th>Duration</th><th>%</th></tr>
` + critialTasksTable;
    document.querySelector("#criticalTasks").innerHTML = critialTasksTable;
    recalculateSpan();
    criticalPath = criticalTasksDurationDescending.map(
      (taskEntry) => taskEntry.taskIndex
    );
    paintChart();
    const download = document.querySelector("#download");
    console.log(JSON.stringify(plan, null, "  "));
    const downloadBlob = new Blob([JSON.stringify(plan, null, "  ")], {
      type: "application/json"
    });
    download.href = URL.createObjectURL(downloadBlob);
  };
  var fileUpload = document.querySelector("#file-upload");
  fileUpload.addEventListener("change", async () => {
    const json = await fileUpload.files[0].text();
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
  document.querySelector("#simulate").addEventListener("click", () => {
    simulate();
    paintChart();
  });
  simulate();
  paintChart();
  window.addEventListener("resize", paintChart);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2RhZy9kYWcudHMiLCAiLi4vc3JjL3Jlc3VsdC50cyIsICIuLi9zcmMvb3BzL29wcy50cyIsICIuLi9zcmMvb3BzL2NoYXJ0LnRzIiwgIi4uL3NyYy9vcHMvbWV0cmljcy50cyIsICIuLi9zcmMvcmVzb3VyY2VzL3Jlc291cmNlcy50cyIsICIuLi9zcmMvb3BzL3Jlc291cmNlcy50cyIsICIuLi9zcmMvZGFnL2FsZ29yaXRobXMvdG9wb3NvcnQudHMiLCAiLi4vc3JjL2NoYXJ0L2NoYXJ0LnRzIiwgIi4uL3NyYy9wcmVjaXNpb24vcHJlY2lzaW9uLnRzIiwgIi4uL3NyYy9tZXRyaWNzL3JhbmdlLnRzIiwgIi4uL3NyYy9tZXRyaWNzL21ldHJpY3MudHMiLCAiLi4vc3JjL3N0YXRzL2NkZi90cmlhbmd1bGFyL3RyaWFuZ3VsYXIudHMiLCAiLi4vc3JjL3N0YXRzL2NkZi90cmlhbmd1bGFyL2phY29iaWFuLnRzIiwgIi4uL3NyYy9wbGFuL3BsYW4udHMiLCAiLi4vc3JjL3JlbmRlcmVyL3NjYWxlL3BvaW50LnRzIiwgIi4uL3NyYy9yZW5kZXJlci9kaXZpZGVybW92ZS9kaXZpZGVybW92ZS50cyIsICIuLi9zcmMvcmVuZGVyZXIvbW91c2Vtb3ZlL21vdXNlbW92ZS50cyIsICIuLi9zcmMvcmVuZGVyZXIvcmFuZ2UvcmFuZ2UudHMiLCAiLi4vc3JjL2NoYXJ0L2ZpbHRlci9maWx0ZXIudHMiLCAiLi4vc3JjL3JlbmRlcmVyL3NjYWxlL3NjYWxlLnRzIiwgIi4uL3NyYy9yZW5kZXJlci9yZW5kZXJlci50cyIsICIuLi9zcmMvc2xhY2svc2xhY2sudHMiLCAiLi4vc3JjL3N0eWxlL3RoZW1lL3RoZW1lLnRzIiwgIi4uL3NyYy9zdHlsZS90b2dnbGVyL3RvZ2dsZXIudHMiLCAiLi4vc3JjL3BhZ2UudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKiBPbmUgdmVydGV4IG9mIGEgZ3JhcGguICovXG5leHBvcnQgdHlwZSBWZXJ0ZXggPSBvYmplY3Q7XG5cbi8qKiBFdmVyeSBWZXJ0ZXggaW4gYSBncmFwaC4gKi9cbmV4cG9ydCB0eXBlIFZlcnRpY2VzID0gVmVydGV4W107XG5cbi8qKiBBIHN1YnNldCBvZiBWZXJ0aWNlcyByZWZlcnJlZCB0byBieSB0aGVpciBpbmRleCBudW1iZXIuICovXG5leHBvcnQgdHlwZSBWZXJ0ZXhJbmRpY2VzID0gbnVtYmVyW107XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlyZWN0ZWRFZGdlU2VyaWFsaXplZCB7XG4gIGk6IG51bWJlcjtcbiAgajogbnVtYmVyO1xufVxuXG4vKiogT25lIGVkZ2Ugb2YgYSBncmFwaCwgd2hpY2ggaXMgYSBkaXJlY3RlZCBjb25uZWN0aW9uIGZyb20gdGhlIGkndGggVmVydGV4IHRvXG50aGUgaid0aCBWZXJ0ZXgsIHdoZXJlIHRoZSBWZXJ0ZXggaXMgc3RvcmVkIGluIGEgVmVydGljZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBEaXJlY3RlZEVkZ2Uge1xuICBpOiBudW1iZXIgPSAwO1xuICBqOiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGk6IG51bWJlciA9IDAsIGo6IG51bWJlciA9IDApIHtcbiAgICB0aGlzLmkgPSBpO1xuICAgIHRoaXMuaiA9IGo7XG4gIH1cblxuICBlcXVhbChyaHM6IERpcmVjdGVkRWRnZSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiByaHMuaSA9PT0gdGhpcy5pICYmIHJocy5qID09PSB0aGlzLmo7XG4gIH1cblxuICB0b0pTT04oKTogRGlyZWN0ZWRFZGdlU2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGk6IHRoaXMuaSxcbiAgICAgIGo6IHRoaXMuaixcbiAgICB9O1xuICB9XG59XG5cbi8qKiBFdmVyeSBFZ2RlIGluIGEgZ3JhcGguICovXG5leHBvcnQgdHlwZSBFZGdlcyA9IERpcmVjdGVkRWRnZVtdO1xuXG4vKiogQSBncmFwaCBpcyBqdXN0IGEgY29sbGVjdGlvbiBvZiBWZXJ0aWNlcyBhbmQgRWRnZXMgYmV0d2VlbiB0aG9zZSB2ZXJ0aWNlcy4gKi9cbmV4cG9ydCB0eXBlIERpcmVjdGVkR3JhcGggPSB7XG4gIFZlcnRpY2VzOiBWZXJ0aWNlcztcbiAgRWRnZXM6IEVkZ2VzO1xufTtcblxuLyoqXG4gR3JvdXBzIHRoZSBFZGdlcyBieSB0aGVpciBgaWAgdmFsdWUuXG5cbiBAcGFyYW0gZWRnZXMgLSBBbGwgdGhlIEVnZXMgaW4gYSBEaXJlY3RlZEdyYXBoLlxuIEByZXR1cm5zIEEgbWFwIGZyb20gdGhlIFZlcnRleCBpbmRleCB0byBhbGwgdGhlIEVkZ2VzIHRoYXQgc3RhcnQgYXRcbiAgIGF0IHRoYXQgVmVydGV4IGluZGV4LlxuICovXG5leHBvcnQgY29uc3QgZWRnZXNCeVNyY1RvTWFwID0gKGVkZ2VzOiBFZGdlcyk6IE1hcDxudW1iZXIsIEVkZ2VzPiA9PiB7XG4gIGNvbnN0IHJldCA9IG5ldyBNYXA8bnVtYmVyLCBFZGdlcz4oKTtcblxuICBlZGdlcy5mb3JFYWNoKChlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICBjb25zdCBhcnIgPSByZXQuZ2V0KGUuaSkgfHwgW107XG4gICAgYXJyLnB1c2goZSk7XG4gICAgcmV0LnNldChlLmksIGFycik7XG4gIH0pO1xuXG4gIHJldHVybiByZXQ7XG59O1xuXG4vKipcbiAgIEdyb3VwcyB0aGUgRWRnZXMgYnkgdGhlaXIgYGpgIHZhbHVlLlxuICBcbiAgIEBwYXJhbSBlZGdlcyAtIEFsbCB0aGUgRWRnZXMgaW4gYSBEaXJlY3RlZEdyYXBoLlxuICAgQHJldHVybnMgQSBtYXAgZnJvbSB0aGUgVmVydGV4IGluZGV4IHRvIGFsbCB0aGUgRWRnZXMgdGhhdCBlbmQgYXRcbiAgICAgYXQgdGhhdCBWZXJ0ZXggaW5kZXguXG4gICAqL1xuXG5leHBvcnQgY29uc3QgZWRnZXNCeURzdFRvTWFwID0gKGVkZ2VzOiBFZGdlcyk6IE1hcDxudW1iZXIsIEVkZ2VzPiA9PiB7XG4gIGNvbnN0IHJldCA9IG5ldyBNYXA8bnVtYmVyLCBFZGdlcz4oKTtcblxuICBlZGdlcy5mb3JFYWNoKChlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICBjb25zdCBhcnIgPSByZXQuZ2V0KGUuaikgfHwgW107XG4gICAgYXJyLnB1c2goZSk7XG4gICAgcmV0LnNldChlLmosIGFycik7XG4gIH0pO1xuXG4gIHJldHVybiByZXQ7XG59O1xuXG5leHBvcnQgdHlwZSBTcmNBbmREc3RSZXR1cm4gPSB7XG4gIGJ5U3JjOiBNYXA8bnVtYmVyLCBFZGdlcz47XG4gIGJ5RHN0OiBNYXA8bnVtYmVyLCBFZGdlcz47XG59O1xuXG5leHBvcnQgY29uc3QgZWRnZXNCeVNyY0FuZERzdFRvTWFwID0gKGVkZ2VzOiBFZGdlcyk6IFNyY0FuZERzdFJldHVybiA9PiB7XG4gIGNvbnN0IHJldCA9IHtcbiAgICBieVNyYzogbmV3IE1hcDxudW1iZXIsIEVkZ2VzPigpLFxuICAgIGJ5RHN0OiBuZXcgTWFwPG51bWJlciwgRWRnZXM+KCksXG4gIH07XG5cbiAgZWRnZXMuZm9yRWFjaCgoZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgbGV0IGFyciA9IHJldC5ieVNyYy5nZXQoZS5pKSB8fCBbXTtcbiAgICBhcnIucHVzaChlKTtcbiAgICByZXQuYnlTcmMuc2V0KGUuaSwgYXJyKTtcbiAgICBhcnIgPSByZXQuYnlEc3QuZ2V0KGUuaikgfHwgW107XG4gICAgYXJyLnB1c2goZSk7XG4gICAgcmV0LmJ5RHN0LnNldChlLmosIGFycik7XG4gIH0pO1xuXG4gIHJldHVybiByZXQ7XG59O1xuIiwgIi8qKiBSZXN1bHQgYWxsb3dzIGVhc2llciBoYW5kbGluZyBvZiByZXR1cm5pbmcgZWl0aGVyIGFuIGVycm9yIG9yIGEgdmFsdWUgZnJvbSBhXG4gKiBmdW5jdGlvbi4gKi9cbmV4cG9ydCB0eXBlIFJlc3VsdDxUPiA9IHsgb2s6IHRydWU7IHZhbHVlOiBUIH0gfCB7IG9rOiBmYWxzZTsgZXJyb3I6IEVycm9yIH07XG5cbmV4cG9ydCBmdW5jdGlvbiBvazxUPih2YWx1ZTogVCk6IFJlc3VsdDxUPiB7XG4gIHJldHVybiB7IG9rOiB0cnVlLCB2YWx1ZTogdmFsdWUgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVycm9yPFQ+KHZhbHVlOiBzdHJpbmcgfCBFcnJvcik6IFJlc3VsdDxUPiB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpIHtcbiAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBuZXcgRXJyb3IodmFsdWUpIH07XG4gIH1cbiAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogdmFsdWUgfTtcbn1cbiIsICJpbXBvcnQgeyBSZXN1bHQsIG9rIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcblxuLy8gT3BlcmF0aW9ucyBvbiBQbGFucy4gTm90ZSB0aGV5IGFyZSByZXZlcnNpYmxlLCBzbyB3ZSBjYW4gaGF2ZSBhbiAndW5kbycgbGlzdC5cblxuLy8gQWxzbywgc29tZSBvcGVyYXRpb25zIG1pZ2h0IGhhdmUgJ3BhcnRpYWxzJywgaS5lLiByZXR1cm4gYSBsaXN0IG9mIHZhbGlkXG4vLyBvcHRpb25zIHRoYXQgY2FuIGJlIHBhc3NlZCB0byB0aGUgb3BlcmF0aW9uLiBGb3IgZXhhbXBsZSwgYWRkaW5nIGFcbi8vIHByZWRlY2Vzc29yIGNvdWxkIGxpc3QgYWxsIHRoZSBUYXNrcyB0aGF0IHdvdWxkIG5vdCBmb3JtIGEgbG9vcCwgaS5lLiBleGNsdWRlXG4vLyBhbGwgZGVzY2VuZGVudHMsIGFuZCB0aGUgVGFzayBpdHNlbGYsIGZyb20gdGhlIGxpc3Qgb2Ygb3B0aW9ucy5cbi8vXG4vLyAqIENoYW5nZSBzdHJpbmcgdmFsdWUgaW4gYSBUYXNrLlxuLy8gKiBDaGFuZ2UgZHVyYXRpb24gdmFsdWUgaW4gYSBUYXNrLlxuLy8gKiBJbnNlcnQgbmV3IGVtcHR5IFRhc2sgYWZ0ZXIgSW5kZXguXG4vLyAqIFNwbGl0IGEgVGFzay4gKFByZWRlY2Vzc29yIHRha2VzIGFsbCBpbmNvbWluZyBlZGdlcywgc291cmNlIHRhc2tzIGFsbCBvdXRnb2luZyBlZGdlcykuXG4vL1xuLy8gKiBEdXBsaWNhdGUgYSBUYXNrIChhbGwgZWRnZXMgYXJlIGR1cGxpY2F0ZWQgZnJvbSB0aGUgc291cmNlIFRhc2spLlxuLy8gKiBEZWxldGUgcHJlZGVjZXNzb3IgdG8gYSBUYXNrLlxuLy8gKiBEZWxldGUgc3VjY2Vzc29yIHRvIGEgVGFzay5cbi8vICogRGVsZXRlIGEgVGFzay5cblxuLy8gTmVlZCBVbmRvL1JlZG8gU3RhY2tzLlxuLy8gVGhlc2UgcmVjb3JkIHRoZSBzdWItb3BzIGZvciBlYWNoIGxhcmdlIG9wLiBFLmcuIGFuIGluc2VydCB0YXNrIG9wIGlzIG1hZGVcbi8vIG9mIHRocmVlIHN1Yi1vcHM6XG4vLyAgICAxLiBpbnNlcnQgdGFzayBpbnRvIFZlcnRpY2VzIGFuZCByZW51bWJlciBFZGdlc1xuLy8gICAgMi4gQWRkIGVkZ2UgZnJvbSBTdGFydCB0byBOZXcgVGFza1xuLy8gICAgMy4gQWRkIGVkZ2UgZnJvbSBOZXcgVGFzayB0byBGaW5pc2hcbi8vXG4vLyBFYWNoIHN1Yi1vcDpcbi8vICAgIDEuIFJlY29yZHMgYWxsIHRoZSBpbmZvIGl0IG5lZWRzIHRvIHdvcmsuXG4vLyAgICAyLiBDYW4gYmUgXCJhcHBsaWVkXCIgdG8gYSBQbGFuLlxuLy8gICAgMy4gQ2FuIGdlbmVyYXRlIGl0cyBpbnZlcnNlIHN1Yi1vcC5cblxuLy8gVGhlIHJlc3VsdHMgZnJvbSBhcHBseWluZyBhIFN1Yk9wLiBUaGlzIGlzIHRoZSBvbmx5IHdheSB0byBnZXQgdGhlIGludmVyc2Ugb2Zcbi8vIGEgU3ViT3Agc2luY2UgdGhlIFN1Yk9wIGludmVyc2UgbWlnaHQgZGVwZW5kIG9uIHRoZSBzdGF0ZSBvZiB0aGUgUGxhbiBhdCB0aGVcbi8vIHRpbWUgdGhlIFN1Yk9wIHdhcyBhcHBsaWVkLlxuZXhwb3J0IGludGVyZmFjZSBTdWJPcFJlc3VsdCB7XG4gIHBsYW46IFBsYW47XG4gIGludmVyc2U6IFN1Yk9wO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFN1Yk9wIHtcbiAgLy8gSWYgdGhlIGFwcGx5IHJldHVybnMgYW4gZXJyb3IgaXQgaXMgZ3VhcmFudGVlZCBub3QgdG8gaGF2ZSBtb2RpZmllZCB0aGVcbiAgLy8gUGxhbi5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3BSZXN1bHQge1xuICBwbGFuOiBQbGFuO1xuICBpbnZlcnNlOiBPcDtcbn1cblxuLy8gT3AgYXJlIG9wZXJhdGlvbnMgYXJlIGFwcGxpZWQgdG8gbWFrZSBjaGFuZ2VzIHRvIGEgUGxhbi5cbmV4cG9ydCBjbGFzcyBPcCB7XG4gIHN1Yk9wczogU3ViT3BbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKHN1Yk9wczogU3ViT3BbXSkge1xuICAgIHRoaXMuc3ViT3BzID0gc3ViT3BzO1xuICB9XG5cbiAgLy8gUmV2ZXJ0cyBhbGwgU3ViT3BzIHVwIHRvIHRoZSBnaXZlbiBpbmRleC5cbiAgYXBwbHlBbGxJbnZlcnNlU3ViT3BzVG9QbGFuKFxuICAgIHBsYW46IFBsYW4sXG4gICAgaW52ZXJzZVN1Yk9wczogU3ViT3BbXVxuICApOiBSZXN1bHQ8UGxhbj4ge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW52ZXJzZVN1Yk9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZSA9IGludmVyc2VTdWJPcHNbaV0uYXBwbHkocGxhbik7XG4gICAgICBpZiAoIWUub2spIHtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgICBwbGFuID0gZS52YWx1ZS5wbGFuO1xuICAgIH1cblxuICAgIHJldHVybiBvayhwbGFuKTtcbiAgfVxuXG4gIC8vIEFwcGxpZXMgdGhlIE9wIHRvIGEgUGxhbi5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGludmVyc2VTdWJPcHM6IFN1Yk9wW10gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc3ViT3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlID0gdGhpcy5zdWJPcHNbaV0uYXBwbHkocGxhbik7XG4gICAgICBpZiAoIWUub2spIHtcbiAgICAgICAgLy8gUmV2ZXJ0IGFsbCB0aGUgU3ViT3BzIGFwcGxpZWQgdXAgdG8gdGhpcyBwb2ludCB0byBnZXQgdGhlIFBsYW4gYmFjayBpbiBhXG4gICAgICAgIC8vIGdvb2QgcGxhY2UuXG4gICAgICAgIGNvbnN0IHJldmVydEVyciA9IHRoaXMuYXBwbHlBbGxJbnZlcnNlU3ViT3BzVG9QbGFuKHBsYW4sIGludmVyc2VTdWJPcHMpO1xuICAgICAgICBpZiAoIXJldmVydEVyci5vaykge1xuICAgICAgICAgIHJldHVybiByZXZlcnRFcnI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgICBwbGFuID0gZS52YWx1ZS5wbGFuO1xuICAgICAgaW52ZXJzZVN1Yk9wcy51bnNoaWZ0KGUudmFsdWUuaW52ZXJzZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiBuZXcgT3AoaW52ZXJzZVN1Yk9wcyksXG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgQWxsT3BzUmVzdWx0ID0ge1xuICBvcHM6IE9wW107XG4gIHBsYW46IFBsYW47XG59O1xuXG5jb25zdCBhcHBseUFsbEludmVyc2VPcHNUb1BsYW4gPSAoaW52ZXJzZXM6IE9wW10sIHBsYW46IFBsYW4pOiBSZXN1bHQ8UGxhbj4gPT4ge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGludmVyc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcmVzID0gaW52ZXJzZXNbaV0uYXBwbHkocGxhbik7XG4gICAgaWYgKCFyZXMub2spIHtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICAgIHBsYW4gPSByZXMudmFsdWUucGxhbjtcbiAgfVxuXG4gIHJldHVybiBvayhwbGFuKTtcbn07XG5cbi8vIENvbnZlbmllbmNlIGZ1bmN0aW9uIGZvciBhcHBseWluZyBtdWx0aXBsZSBPcHMgdG8gYSBwbGFuLCB1c2VkIG1vc3RseSBmb3Jcbi8vIHRlc3RpbmcuXG5leHBvcnQgY29uc3QgYXBwbHlBbGxPcHNUb1BsYW4gPSAoXG4gIG9wczogT3BbXSxcbiAgcGxhbjogUGxhblxuKTogUmVzdWx0PEFsbE9wc1Jlc3VsdD4gPT4ge1xuICBjb25zdCBpbnZlcnNlczogT3BbXSA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG9wcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHJlcyA9IG9wc1tpXS5hcHBseShwbGFuKTtcbiAgICBpZiAoIXJlcy5vaykge1xuICAgICAgY29uc3QgaW52ZXJzZVJlcyA9IGFwcGx5QWxsSW52ZXJzZU9wc1RvUGxhbihpbnZlcnNlcywgcGxhbik7XG4gICAgICBpZiAoIWludmVyc2VSZXMub2spIHtcbiAgICAgICAgLy8gVE9ETyBDYW4gd2Ugd3JhcCB0aGUgRXJyb3IgaW4gYW5vdGhlciBlcnJvciB0byBtYWtlIGl0IGNsZWFyIHRoaXNcbiAgICAgICAgLy8gZXJyb3IgaGFwcGVuZWQgd2hlbiB0cnlpbmcgdG8gY2xlYW4gdXAgZnJvbSB0aGUgcHJldmlvdXMgRXJyb3Igd2hlblxuICAgICAgICAvLyB0aGUgYXBwbHkoKSBmYWlsZWQuXG4gICAgICAgIHJldHVybiBpbnZlcnNlUmVzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgaW52ZXJzZXMudW5zaGlmdChyZXMudmFsdWUuaW52ZXJzZSk7XG4gICAgcGxhbiA9IHJlcy52YWx1ZS5wbGFuO1xuICB9XG5cbiAgcmV0dXJuIG9rKHtcbiAgICBvcHM6IGludmVyc2VzLFxuICAgIHBsYW46IHBsYW4sXG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGFwcGx5QWxsT3BzVG9QbGFuQW5kVGhlbkludmVyc2UgPSAoXG4gIG9wczogT3BbXSxcbiAgcGxhbjogUGxhblxuKTogUmVzdWx0PEFsbE9wc1Jlc3VsdD4gPT4ge1xuICBjb25zdCByZXMgPSBhcHBseUFsbE9wc1RvUGxhbihvcHMsIHBsYW4pO1xuICBpZiAoIXJlcy5vaykge1xuICAgIHJldHVybiByZXM7XG4gIH1cbiAgcmV0dXJuIGFwcGx5QWxsT3BzVG9QbGFuKHJlcy52YWx1ZS5vcHMsIHJlcy52YWx1ZS5wbGFuKTtcbn07XG4vLyBOb09wIGlzIGEgbm8tb3AuXG5leHBvcnQgZnVuY3Rpb24gTm9PcCgpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW10pO1xufVxuIiwgImltcG9ydCB7IFJlc3VsdCwgb2ssIGVycm9yIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgRGlyZWN0ZWRFZGdlLCBlZGdlc0J5U3JjQW5kRHN0VG9NYXAgfSBmcm9tIFwiLi4vZGFnL2RhZy50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcbmltcG9ydCB7IENoYXJ0LCBUYXNrU3RhdGUgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IE9wLCBTdWJPcCwgU3ViT3BSZXN1bHQgfSBmcm9tIFwiLi9vcHMudHNcIjtcblxuLyoqIEEgdmFsdWUgb2YgLTEgZm9yIGogbWVhbnMgdGhlIEZpbmlzaCBNaWxlc3RvbmUuICovXG5leHBvcnQgZnVuY3Rpb24gRGlyZWN0ZWRFZGdlRm9yUGxhbihcbiAgaTogbnVtYmVyLFxuICBqOiBudW1iZXIsXG4gIHBsYW46IFBsYW5cbik6IFJlc3VsdDxEaXJlY3RlZEVkZ2U+IHtcbiAgY29uc3QgY2hhcnQgPSBwbGFuLmNoYXJ0O1xuICBpZiAoaiA9PT0gLTEpIHtcbiAgICBqID0gY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgfVxuICBpZiAoaSA8IDAgfHwgaSA+PSBjaGFydC5WZXJ0aWNlcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBgaSBpbmRleCBvdXQgb2YgcmFuZ2U6ICR7aX0gbm90IGluIFswLCAke2NoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDF9XWBcbiAgICApO1xuICB9XG4gIGlmIChqIDwgMCB8fCBqID49IGNoYXJ0LlZlcnRpY2VzLmxlbmd0aCkge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIGBqIGluZGV4IG91dCBvZiByYW5nZTogJHtqfSBub3QgaW4gWzAsICR7Y2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMX1dYFxuICAgICk7XG4gIH1cbiAgaWYgKGkgPT09IGopIHtcbiAgICByZXR1cm4gZXJyb3IoYEEgVGFzayBjYW4gbm90IGRlcGVuZCBvbiBpdHNlbGY6ICR7aX0gPT09ICR7an1gKTtcbiAgfVxuICByZXR1cm4gb2sobmV3IERpcmVjdGVkRWRnZShpLCBqKSk7XG59XG5cbmV4cG9ydCBjbGFzcyBBZGRFZGdlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGk6IG51bWJlciA9IDA7XG4gIGo6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoaTogbnVtYmVyLCBqOiBudW1iZXIpIHtcbiAgICB0aGlzLmkgPSBpO1xuICAgIHRoaXMuaiA9IGo7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgaWYgKHRoaXMuaSA9PT0gLTEpIHtcbiAgICAgIHRoaXMuaSA9IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaiA9PT0gLTEpIHtcbiAgICAgIHRoaXMuaiA9IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgICB9XG5cbiAgICBjb25zdCBlID0gRGlyZWN0ZWRFZGdlRm9yUGxhbih0aGlzLmksIHRoaXMuaiwgcGxhbik7XG4gICAgaWYgKCFlLm9rKSB7XG4gICAgICByZXR1cm4gZTtcbiAgICB9XG5cbiAgICAvLyBPbmx5IGFkZCB0aGUgZWRnZSBpZiBpdCBkb2Vzbid0IGV4aXN0cyBhbHJlYWR5LlxuICAgIGlmICghcGxhbi5jaGFydC5FZGdlcy5maW5kKCh2YWx1ZTogRGlyZWN0ZWRFZGdlKSA9PiB2YWx1ZS5lcXVhbChlLnZhbHVlKSkpIHtcbiAgICAgIHBsYW4uY2hhcnQuRWRnZXMucHVzaChlLnZhbHVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpLFxuICAgIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBSZW1vdmVFZGdlU3VwT3AodGhpcy5pLCB0aGlzLmopO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZW1vdmVFZGdlU3VwT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGk6IG51bWJlciA9IDA7XG4gIGo6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoaTogbnVtYmVyLCBqOiBudW1iZXIpIHtcbiAgICB0aGlzLmkgPSBpO1xuICAgIHRoaXMuaiA9IGo7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgaWYgKHRoaXMuaSA9PT0gLTEpIHtcbiAgICAgIHRoaXMuaSA9IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaiA9PT0gLTEpIHtcbiAgICAgIHRoaXMuaiA9IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgICB9XG5cbiAgICBjb25zdCBlID0gRGlyZWN0ZWRFZGdlRm9yUGxhbih0aGlzLmksIHRoaXMuaiwgcGxhbik7XG4gICAgaWYgKCFlLm9rKSB7XG4gICAgICByZXR1cm4gZTtcbiAgICB9XG4gICAgcGxhbi5jaGFydC5FZGdlcyA9IHBsYW4uY2hhcnQuRWRnZXMuZmlsdGVyKFxuICAgICAgKHY6IERpcmVjdGVkRWRnZSk6IGJvb2xlYW4gPT4gIXYuZXF1YWwoZS52YWx1ZSlcbiAgICApO1xuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSxcbiAgICB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgQWRkRWRnZVN1Yk9wKHRoaXMuaSwgdGhpcy5qKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyhpbmRleDogbnVtYmVyLCBjaGFydDogQ2hhcnQpOiBSZXN1bHQ8bnVsbD4ge1xuICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID4gY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMikge1xuICAgIHJldHVybiBlcnJvcihgJHtpbmRleH0gaXMgbm90IGluIHJhbmdlIFswLCAke2NoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDJ9XWApO1xuICB9XG4gIHJldHVybiBvayhudWxsKTtcbn1cblxuZnVuY3Rpb24gaW5kZXhJblJhbmdlRm9yVmVydGljZXNFeGNsdXNpdmUoXG4gIGluZGV4OiBudW1iZXIsXG4gIGNoYXJ0OiBDaGFydFxuKTogUmVzdWx0PG51bGw+IHtcbiAgaWYgKGluZGV4IDwgMSB8fCBpbmRleCA+IGNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDIpIHtcbiAgICByZXR1cm4gZXJyb3IoYCR7aW5kZXh9IGlzIG5vdCBpbiByYW5nZSBbMSwgJHtjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAyfV1gKTtcbiAgfVxuICByZXR1cm4gb2sobnVsbCk7XG59XG5cbmV4cG9ydCBjbGFzcyBBZGRUYXNrQWZ0ZXJTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaW5kZXg6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoaW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMuaW5kZXggPSBpbmRleDtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBjaGFydCA9IHBsYW4uY2hhcnQ7XG4gICAgY29uc3QgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXModGhpcy5pbmRleCwgY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLnNwbGljZSh0aGlzLmluZGV4ICsgMSwgMCwgcGxhbi5uZXdUYXNrKCkpO1xuXG4gICAgLy8gVXBkYXRlIEVkZ2VzLlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hhcnQuRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVkZ2UgPSBjaGFydC5FZGdlc1tpXTtcbiAgICAgIGlmIChlZGdlLmkgPj0gdGhpcy5pbmRleCArIDEpIHtcbiAgICAgICAgZWRnZS5pKys7XG4gICAgICB9XG4gICAgICBpZiAoZWRnZS5qID49IHRoaXMuaW5kZXggKyAxKSB7XG4gICAgICAgIGVkZ2UuaisrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlVGFza1N1Yk9wKHRoaXMuaW5kZXggKyAxKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRHVwVGFza1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBpbmRleDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGNoYXJ0ID0gcGxhbi5jaGFydDtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlc0V4Y2x1c2l2ZSh0aGlzLmluZGV4LCBjaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgY29uc3QgY29weSA9IHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy5pbmRleF0uZHVwKCk7XG4gICAgLy8gSW5zZXJ0IHRoZSBkdXBsaWNhdGUgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIFRhc2sgaXQgaXMgY29waWVkIGZyb20uXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5zcGxpY2UodGhpcy5pbmRleCwgMCwgY29weSk7XG5cbiAgICAvLyBVcGRhdGUgRWRnZXMuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFydC5FZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZWRnZSA9IGNoYXJ0LkVkZ2VzW2ldO1xuICAgICAgaWYgKGVkZ2UuaSA+IHRoaXMuaW5kZXgpIHtcbiAgICAgICAgZWRnZS5pKys7XG4gICAgICB9XG4gICAgICBpZiAoZWRnZS5qID4gdGhpcy5pbmRleCkge1xuICAgICAgICBlZGdlLmorKztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IERlbGV0ZVRhc2tTdWJPcCh0aGlzLmluZGV4ICsgMSk7XG4gIH1cbn1cblxudHlwZSBTdWJzdGl0dXRpb24gPSBNYXA8RGlyZWN0ZWRFZGdlLCBEaXJlY3RlZEVkZ2U+O1xuXG5leHBvcnQgY2xhc3MgTW92ZUFsbE91dGdvaW5nRWRnZXNGcm9tVG9TdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgZnJvbVRhc2tJbmRleDogbnVtYmVyID0gMDtcbiAgdG9UYXNrSW5kZXg6IG51bWJlciA9IDA7XG4gIGFjdHVhbE1vdmVzOiBTdWJzdGl0dXRpb247XG5cbiAgY29uc3RydWN0b3IoXG4gICAgZnJvbVRhc2tJbmRleDogbnVtYmVyLFxuICAgIHRvVGFza0luZGV4OiBudW1iZXIsXG4gICAgYWN0dWFsTW92ZXM6IFN1YnN0aXR1dGlvbiA9IG5ldyBNYXAoKVxuICApIHtcbiAgICB0aGlzLmZyb21UYXNrSW5kZXggPSBmcm9tVGFza0luZGV4O1xuICAgIHRoaXMudG9UYXNrSW5kZXggPSB0b1Rhc2tJbmRleDtcbiAgICB0aGlzLmFjdHVhbE1vdmVzID0gYWN0dWFsTW92ZXM7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgY2hhcnQgPSBwbGFuLmNoYXJ0O1xuICAgIGxldCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlc0V4Y2x1c2l2ZSh0aGlzLmZyb21UYXNrSW5kZXgsIGNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXNFeGNsdXNpdmUodGhpcy50b1Rhc2tJbmRleCwgY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGlmICh0aGlzLmFjdHVhbE1vdmVzLnZhbHVlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGNvbnN0IGFjdHVhbE1vdmVzOiBTdWJzdGl0dXRpb24gPSBuZXcgTWFwKCk7XG4gICAgICAvLyBVcGRhdGUgYWxsIEVkZ2VzIHRoYXQgc3RhcnQgYXQgJ2Zyb21UYXNrSW5kZXgnIGFuZCBjaGFuZ2UgdGhlIHN0YXJ0IHRvICd0b1Rhc2tJbmRleCcuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJ0LkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGVkZ2UgPSBjaGFydC5FZGdlc1tpXTtcbiAgICAgICAgLy8gU2tpcCB0aGUgY29ybmVyIGNhc2UgdGhlcmUgZnJvbVRhc2tJbmRleCBwb2ludHMgdG8gVGFza0luZGV4LlxuICAgICAgICBpZiAoZWRnZS5pID09PSB0aGlzLmZyb21UYXNrSW5kZXggJiYgZWRnZS5qID09PSB0aGlzLnRvVGFza0luZGV4KSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZWRnZS5pID09PSB0aGlzLmZyb21UYXNrSW5kZXgpIHtcbiAgICAgICAgICBhY3R1YWxNb3Zlcy5zZXQoXG4gICAgICAgICAgICBuZXcgRGlyZWN0ZWRFZGdlKHRoaXMudG9UYXNrSW5kZXgsIGVkZ2UuaiksXG4gICAgICAgICAgICBuZXcgRGlyZWN0ZWRFZGdlKGVkZ2UuaSwgZWRnZS5qKVxuICAgICAgICAgICk7XG4gICAgICAgICAgZWRnZS5pID0gdGhpcy50b1Rhc2tJbmRleDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG9rKHtcbiAgICAgICAgcGxhbjogcGxhbixcbiAgICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKFxuICAgICAgICAgIHRoaXMudG9UYXNrSW5kZXgsXG4gICAgICAgICAgdGhpcy5mcm9tVGFza0luZGV4LFxuICAgICAgICAgIGFjdHVhbE1vdmVzXG4gICAgICAgICksXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFydC5FZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBuZXdFZGdlID0gdGhpcy5hY3R1YWxNb3Zlcy5nZXQocGxhbi5jaGFydC5FZGdlc1tpXSk7XG4gICAgICAgIGlmIChuZXdFZGdlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBwbGFuLmNoYXJ0LkVkZ2VzW2ldID0gbmV3RWRnZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gb2soe1xuICAgICAgICBwbGFuOiBwbGFuLFxuICAgICAgICBpbnZlcnNlOiBuZXcgTW92ZUFsbE91dGdvaW5nRWRnZXNGcm9tVG9TdWJPcChcbiAgICAgICAgICB0aGlzLnRvVGFza0luZGV4LFxuICAgICAgICAgIHRoaXMuZnJvbVRhc2tJbmRleFxuICAgICAgICApLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgaW52ZXJzZShcbiAgICB0b1Rhc2tJbmRleDogbnVtYmVyLFxuICAgIGZyb21UYXNrSW5kZXg6IG51bWJlcixcbiAgICBhY3R1YWxNb3ZlczogU3Vic3RpdHV0aW9uXG4gICk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IE1vdmVBbGxPdXRnb2luZ0VkZ2VzRnJvbVRvU3ViT3AoXG4gICAgICB0b1Rhc2tJbmRleCxcbiAgICAgIGZyb21UYXNrSW5kZXgsXG4gICAgICBhY3R1YWxNb3Zlc1xuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvcHlBbGxFZGdlc0Zyb21Ub1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBmcm9tSW5kZXg6IG51bWJlciA9IDA7XG4gIHRvSW5kZXg6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoZnJvbUluZGV4OiBudW1iZXIsIHRvSW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMuZnJvbUluZGV4ID0gZnJvbUluZGV4O1xuICAgIHRoaXMudG9JbmRleCA9IHRvSW5kZXg7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXModGhpcy5mcm9tSW5kZXgsIHBsYW4uY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGNvbnN0IG5ld0VkZ2VzOiBEaXJlY3RlZEVkZ2VbXSA9IFtdO1xuICAgIHBsYW4uY2hhcnQuRWRnZXMuZm9yRWFjaCgoZWRnZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgICBpZiAoZWRnZS5pID09PSB0aGlzLmZyb21JbmRleCkge1xuICAgICAgICBuZXdFZGdlcy5wdXNoKG5ldyBEaXJlY3RlZEVkZ2UodGhpcy50b0luZGV4LCBlZGdlLmopKTtcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlLmogPT09IHRoaXMuZnJvbUluZGV4KSB7XG4gICAgICAgIG5ld0VkZ2VzLnB1c2gobmV3IERpcmVjdGVkRWRnZShlZGdlLmksIHRoaXMudG9JbmRleCkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHBsYW4uY2hhcnQuRWRnZXMucHVzaCguLi5uZXdFZGdlcyk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiBuZXcgUmVtb3ZlQWxsRWRnZXNTdWJPcChuZXdFZGdlcykgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbW92ZUFsbEVkZ2VzU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXTtcblxuICBjb25zdHJ1Y3RvcihlZGdlczogRGlyZWN0ZWRFZGdlW10pIHtcbiAgICB0aGlzLmVkZ2VzID0gZWRnZXM7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgcGxhbi5jaGFydC5FZGdlcyA9IHBsYW4uY2hhcnQuRWRnZXMuZmlsdGVyKFxuICAgICAgKGVkZ2U6IERpcmVjdGVkRWRnZSkgPT5cbiAgICAgICAgLTEgPT09XG4gICAgICAgIHRoaXMuZWRnZXMuZmluZEluZGV4KCh0b0JlUmVtb3ZlZDogRGlyZWN0ZWRFZGdlKSA9PlxuICAgICAgICAgIGVkZ2UuZXF1YWwodG9CZVJlbW92ZWQpXG4gICAgICAgIClcbiAgICApO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogbmV3IEFkZEFsbEVkZ2VzU3ViT3AodGhpcy5lZGdlcykgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFkZEFsbEVkZ2VzU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXTtcblxuICBjb25zdHJ1Y3RvcihlZGdlczogRGlyZWN0ZWRFZGdlW10pIHtcbiAgICB0aGlzLmVkZ2VzID0gZWRnZXM7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKC4uLnRoaXMuZWRnZXMpO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogbmV3IFJlbW92ZUFsbEVkZ2VzU3ViT3AodGhpcy5lZGdlcykgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlbGV0ZVRhc2tTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaW5kZXg6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoaW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMuaW5kZXggPSBpbmRleDtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBjaGFydCA9IHBsYW4uY2hhcnQ7XG4gICAgY29uc3QgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXModGhpcy5pbmRleCwgY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICBjaGFydC5WZXJ0aWNlcy5zcGxpY2UodGhpcy5pbmRleCwgMSk7XG5cbiAgICAvLyBVcGRhdGUgRWRnZXMuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFydC5FZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZWRnZSA9IGNoYXJ0LkVkZ2VzW2ldO1xuICAgICAgaWYgKGVkZ2UuaSA+IHRoaXMuaW5kZXgpIHtcbiAgICAgICAgZWRnZS5pLS07XG4gICAgICB9XG4gICAgICBpZiAoZWRnZS5qID4gdGhpcy5pbmRleCkge1xuICAgICAgICBlZGdlLmotLTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgQWRkVGFza0FmdGVyU3ViT3AodGhpcy5pbmRleCAtIDEpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGNvbnN0cnVjdG9yKCkge31cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3Qgc3JjQW5kRHN0ID0gZWRnZXNCeVNyY0FuZERzdFRvTWFwKHBsYW4uY2hhcnQuRWRnZXMpO1xuICAgIGNvbnN0IFN0YXJ0ID0gMDtcbiAgICBjb25zdCBGaW5pc2ggPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDE7XG5cbiAgICAvLyBsb29wIG92ZXIgYWxsIHZlcnRpY3MgZnJvbSBbU3RhcnQsIEZpbmlzaCkgYW5kIGxvb2sgZm9yIHRoZWlyXG4gICAgLy8gZGVzdGluYXRpb25zLiBJZiB0aGV5IGhhdmUgbm9uZSB0aGVuIGFkZCBpbiBhbiBlZGdlIHRvIEZpbmlzaC4gSWYgdGhleVxuICAgIC8vIGhhdmUgbW9yZSB0aGFuIG9uZSB0aGVuIHJlbW92ZSBhbnkgbGlua3MgdG8gRmluaXNoLlxuICAgIGZvciAobGV0IGkgPSBTdGFydDsgaSA8IEZpbmlzaDsgaSsrKSB7XG4gICAgICBjb25zdCBkZXN0aW5hdGlvbnMgPSBzcmNBbmREc3QuYnlTcmMuZ2V0KGkpO1xuICAgICAgaWYgKGRlc3RpbmF0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IHRvQmVBZGRlZCA9IG5ldyBEaXJlY3RlZEVkZ2UoaSwgRmluaXNoKTtcbiAgICAgICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKHRvQmVBZGRlZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBcmUgdGhlcmUgYW55IHVuZWVkZWQgRWdkZXMgdG8gRmluaXNoPyBJZiBzbyBmaWx0ZXIgdGhlbSBvdXQuXG4gICAgICAgIGlmIChcbiAgICAgICAgICBkZXN0aW5hdGlvbnMubGVuZ3RoID4gMSAmJlxuICAgICAgICAgIGRlc3RpbmF0aW9ucy5maW5kKCh2YWx1ZTogRGlyZWN0ZWRFZGdlKSA9PiB2YWx1ZS5qID09PSBGaW5pc2gpXG4gICAgICAgICkge1xuICAgICAgICAgIGNvbnN0IHRvQmVSZW1vdmVkID0gbmV3IERpcmVjdGVkRWRnZShpLCBGaW5pc2gpO1xuICAgICAgICAgIHBsYW4uY2hhcnQuRWRnZXMgPSBwbGFuLmNoYXJ0LkVkZ2VzLmZpbHRlcihcbiAgICAgICAgICAgICh2YWx1ZTogRGlyZWN0ZWRFZGdlKSA9PiAhdG9CZVJlbW92ZWQuZXF1YWwodmFsdWUpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGxvb3Agb3ZlciBhbGwgdmVydGljcyBmcm9tKFN0YXJ0LCBGaW5pc2hdIGFuZCBsb29rIGZvciB0aGVpciBzb3VyY2VzLiBJZlxuICAgIC8vIHRoZXkgaGF2ZSBub25lIHRoZW4gYWRkIGluIGFuIGVkZ2UgZnJvbSBTdGFydC4gSWYgdGhleSBoYXZlIG1vcmUgdGhhbiBvbmVcbiAgICAvLyB0aGVuIHJlbW92ZSBhbnkgbGlua3MgZnJvbSBTdGFydC5cbiAgICBmb3IgKGxldCBpID0gU3RhcnQgKyAxOyBpIDwgRmluaXNoOyBpKyspIHtcbiAgICAgIGNvbnN0IGRlc3RpbmF0aW9ucyA9IHNyY0FuZERzdC5ieURzdC5nZXQoaSk7XG4gICAgICBpZiAoZGVzdGluYXRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgdG9CZUFkZGVkID0gbmV3IERpcmVjdGVkRWRnZShTdGFydCwgaSk7XG4gICAgICAgIHBsYW4uY2hhcnQuRWRnZXMucHVzaCh0b0JlQWRkZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXJlIHRoZXJlIGFueSB1bi1uZWVkZWQgRWdkZXMgZnJvbSBTdGFydD8gSWYgc28gZmlsdGVyIHRoZW0gb3V0LlxuICAgICAgICBpZiAoXG4gICAgICAgICAgZGVzdGluYXRpb25zLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgICBkZXN0aW5hdGlvbnMuZmluZCgodmFsdWU6IERpcmVjdGVkRWRnZSkgPT4gdmFsdWUuaSA9PT0gU3RhcnQpXG4gICAgICAgICkge1xuICAgICAgICAgIGNvbnN0IHRvQmVSZW1vdmVkID0gbmV3IERpcmVjdGVkRWRnZShTdGFydCwgaSk7XG4gICAgICAgICAgcGxhbi5jaGFydC5FZGdlcyA9IHBsYW4uY2hhcnQuRWRnZXMuZmlsdGVyKFxuICAgICAgICAgICAgKHZhbHVlOiBEaXJlY3RlZEVkZ2UpID0+ICF0b0JlUmVtb3ZlZC5lcXVhbCh2YWx1ZSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChwbGFuLmNoYXJ0LkVkZ2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKG5ldyBEaXJlY3RlZEVkZ2UoU3RhcnQsIEZpbmlzaCkpO1xuICAgIH1cblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2V0VGFza05hbWVTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgdGFza0luZGV4OiBudW1iZXI7XG4gIG5hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcih0YXNrSW5kZXg6IG51bWJlciwgbmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy50YXNrSW5kZXggPSB0YXNrSW5kZXg7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLnRhc2tJbmRleCwgcGxhbi5jaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGNvbnN0IG9sZE5hbWUgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMudGFza0luZGV4XS5uYW1lO1xuICAgIHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdLm5hbWUgPSB0aGlzLm5hbWU7XG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2Uob2xkTmFtZSksXG4gICAgfSk7XG4gIH1cblxuICBpbnZlcnNlKG9sZE5hbWU6IHN0cmluZyk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFNldFRhc2tOYW1lU3ViT3AodGhpcy50YXNrSW5kZXgsIG9sZE5hbWUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZXRUYXNrU3RhdGVTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgdGFza1N0YXRlOiBUYXNrU3RhdGU7XG4gIHRhc2tJbmRleDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHRhc2tJbmRleDogbnVtYmVyLCB0YXNrU3RhdGU6IFRhc2tTdGF0ZSkge1xuICAgIHRoaXMudGFza0luZGV4ID0gdGFza0luZGV4O1xuICAgIHRoaXMudGFza1N0YXRlID0gdGFza1N0YXRlO1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzKHRoaXMudGFza0luZGV4LCBwbGFuLmNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgY29uc3Qgb2xkU3RhdGUgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMudGFza0luZGV4XS5zdGF0ZTtcbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMudGFza0luZGV4XS5zdGF0ZSA9IHRoaXMudGFza1N0YXRlO1xuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG9sZFN0YXRlKSxcbiAgICB9KTtcbiAgfVxuXG4gIGludmVyc2UodGFza1N0YXRlOiBUYXNrU3RhdGUpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBTZXRUYXNrU3RhdGVTdWJPcCh0aGlzLnRhc2tJbmRleCwgdGFza1N0YXRlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gSW5zZXJ0TmV3RW1wdHlUYXNrQWZ0ZXJPcCh0YXNrSW5kZXg6IG51bWJlcik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICAgIG5ldyBBZGRUYXNrQWZ0ZXJTdWJPcCh0YXNrSW5kZXgpLFxuICAgIG5ldyBBZGRFZGdlU3ViT3AoMCwgdGFza0luZGV4ICsgMSksXG4gICAgbmV3IEFkZEVkZ2VTdWJPcCh0YXNrSW5kZXggKyAxLCAtMSksXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICBdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNldFRhc2tOYW1lT3AodGFza0luZGV4OiBudW1iZXIsIG5hbWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFNldFRhc2tOYW1lU3ViT3AodGFza0luZGV4LCBuYW1lKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU2V0VGFza1N0YXRlT3AodGFza0luZGV4OiBudW1iZXIsIHRhc2tTdGF0ZTogVGFza1N0YXRlKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgU2V0VGFza1N0YXRlU3ViT3AodGFza0luZGV4LCB0YXNrU3RhdGUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTcGxpdFRhc2tPcCh0YXNrSW5kZXg6IG51bWJlcik6IE9wIHtcbiAgY29uc3Qgc3ViT3BzOiBTdWJPcFtdID0gW1xuICAgIG5ldyBEdXBUYXNrU3ViT3AodGFza0luZGV4KSxcbiAgICBuZXcgQWRkRWRnZVN1Yk9wKHRhc2tJbmRleCwgdGFza0luZGV4ICsgMSksXG4gICAgbmV3IE1vdmVBbGxPdXRnb2luZ0VkZ2VzRnJvbVRvU3ViT3AodGFza0luZGV4LCB0YXNrSW5kZXggKyAxKSxcbiAgXTtcblxuICByZXR1cm4gbmV3IE9wKHN1Yk9wcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEdXBUYXNrT3AodGFza0luZGV4OiBudW1iZXIpOiBPcCB7XG4gIGNvbnN0IHN1Yk9wczogU3ViT3BbXSA9IFtcbiAgICBuZXcgRHVwVGFza1N1Yk9wKHRhc2tJbmRleCksXG4gICAgbmV3IENvcHlBbGxFZGdlc0Zyb21Ub1N1Yk9wKHRhc2tJbmRleCwgdGFza0luZGV4ICsgMSksXG4gIF07XG5cbiAgcmV0dXJuIG5ldyBPcChzdWJPcHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQWRkRWRnZU9wKGZyb21UYXNrSW5kZXg6IG51bWJlciwgdG9UYXNrSW5kZXg6IG51bWJlcik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICAgIG5ldyBBZGRFZGdlU3ViT3AoZnJvbVRhc2tJbmRleCwgdG9UYXNrSW5kZXgpLFxuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSYXRpb25hbGl6ZUVkZ2VzT3AoKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCldKTtcbn1cbiIsICIvLyBDaGFuZ2VNZXRyaWNWYWx1ZVxuXG5pbXBvcnQgeyBUYXNrIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBNZXRyaWNEZWZpbml0aW9uIH0gZnJvbSBcIi4uL21ldHJpY3MvbWV0cmljcy50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcbmltcG9ydCB7IFJlc3VsdCwgZXJyb3IsIG9rIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgT3AsIFN1Yk9wLCBTdWJPcFJlc3VsdCB9IGZyb20gXCIuL29wcy50c1wiO1xuXG5leHBvcnQgY2xhc3MgQWRkTWV0cmljU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG5hbWU6IHN0cmluZztcbiAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbjtcblxuICAvLyBNYXBzIGFuIGluZGV4IG9mIGEgVGFzayB0byBhIHZhbHVlIGZvciB0aGUgZ2l2ZW4gbWV0cmljIGtleS5cbiAgdGFza01ldHJpY1ZhbHVlczogTWFwPG51bWJlciwgbnVtYmVyPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbixcbiAgICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpIC8vIFNob3VsZCBvbmx5IGJlIHN1cHBsaWVkIGJ5IGludmVyc2UgYWN0aW9ucy5cbiAgKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLm1ldHJpY0RlZmluaXRpb24gPSBtZXRyaWNEZWZpbml0aW9uO1xuICAgIHRoaXMudGFza01ldHJpY1ZhbHVlcyA9IHRhc2tNZXRyaWNWYWx1ZXM7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgaWYgKHBsYW4uZ2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5hbWUpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm5hbWV9IGFscmVhZHkgZXhpc3RzIGFzIGEgTWV0cmljYCk7XG4gICAgfVxuXG4gICAgcGxhbi5zZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSwgdGhpcy5tZXRyaWNEZWZpbml0aW9uKTtcblxuICAgIC8vIE5vdyBsb29wIG92ZXIgZXZlcnkgdGFzayBhbmQgYWRkIHRoaXMgbWV0cmljIGFuZCBzZXQgaXQgdG8gdGhlIGRlZmF1bHQsXG4gICAgLy8gdW5sZXNzIHRoZXJlIGlzIG1hdGNoaW5nIGVudHJ5IGluIHRhc2tNZXRyaWNWYWx1ZXMsIGluIHdoaWNoIGNhc2Ugd2Ugd2lsbFxuICAgIC8vIHVzZSB0aGF0IHZhbHVlLCBpLmUuIHRoaXMgQWRkTWV0cmljU3ViT3AgaXMgYWN0dWFsbHkgYSByZXZlcnQgb2YgYVxuICAgIC8vIERlbGV0ZU1ldHJpY1N1Yk9wLlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgdGFzay5zZXRNZXRyaWMoXG4gICAgICAgIHRoaXMubmFtZSxcbiAgICAgICAgdGhpcy50YXNrTWV0cmljVmFsdWVzLmdldChpbmRleCkgfHwgdGhpcy5tZXRyaWNEZWZpbml0aW9uLmRlZmF1bHRcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlTWV0cmljU3ViT3AodGhpcy5uYW1lKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVsZXRlTWV0cmljU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG5hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IG1ldHJpY0RlZmluaXRpb24gPSBwbGFuLmdldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lKTtcblxuICAgIGlmIChtZXRyaWNEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYFRoZSBtZXRyaWMgd2l0aCBuYW1lICR7dGhpcy5uYW1lfSBkb2VzIG5vdCBleGlzdCBhbmQgY2FuJ3QgYmUgZGVsZXRlZC5gXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChtZXRyaWNEZWZpbml0aW9uLmlzU3RhdGljKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYFRoZSBzdGF0aWMgTWV0cmljICR7dGhpcy5uYW1lfSBjYW4ndCBiZSBkZWxldGVkLmApO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSBmcm9tIHJlc291cmNlIGRlZmluaXRpb25zLlxuICAgIHBsYW4uZGVsZXRlTWV0cmljRGVmaW5pdGlvbih0aGlzLm5hbWUpO1xuXG4gICAgY29uc3QgdGFza0luZGV4VG9EZWxldGVkTWV0cmljVmFsdWU6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCk7XG5cbiAgICAvLyBOb3cgbG9vayBhdCBhbGwgVGFza3MgYW5kIHJlbW92ZSBgdGhpcy5uYW1lYCBmcm9tIHRoZSBtZXRyaWMgd2hpbGUgYWxzb1xuICAgIC8vIGJ1aWxkaW5nIHVwIHRoZSBpbmZvIG5lZWRlZCBmb3IgYSByZXZlcnQuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRhc2suZ2V0TWV0cmljKHRoaXMubmFtZSk7XG4gICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0YXNrSW5kZXhUb0RlbGV0ZWRNZXRyaWNWYWx1ZS5zZXQoaW5kZXgsIHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHRhc2suZGVsZXRlTWV0cmljKHRoaXMubmFtZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZShtZXRyaWNEZWZpbml0aW9uLCB0YXNrSW5kZXhUb0RlbGV0ZWRNZXRyaWNWYWx1ZSksXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGludmVyc2UoXG4gICAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbixcbiAgICBtZXRyaWNWYWx1ZXNGb3JEZWxldGVkUmVzb3VyY2VOYW1lOiBNYXA8bnVtYmVyLCBudW1iZXI+XG4gICk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IEFkZE1ldHJpY1N1Yk9wKFxuICAgICAgdGhpcy5uYW1lLFxuICAgICAgbWV0cmljRGVmaW5pdGlvbixcbiAgICAgIG1ldHJpY1ZhbHVlc0ZvckRlbGV0ZWRSZXNvdXJjZU5hbWVcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZW5hbWVNZXRyaWNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgb2xkTmFtZTogc3RyaW5nO1xuICBuZXdOYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Iob2xkTmFtZTogc3RyaW5nLCBuZXdOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLm9sZE5hbWUgPSBvbGROYW1lO1xuICAgIHRoaXMubmV3TmFtZSA9IG5ld05hbWU7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgaWYgKHBsYW4uZ2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5ld05hbWUpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm5ld05hbWV9IGFscmVhZHkgZXhpc3RzIGFzIGEgbWV0cmljLmApO1xuICAgIH1cblxuICAgIGNvbnN0IG1ldHJpY0RlZmluaXRpb24gPSBwbGFuLmdldE1ldHJpY0RlZmluaXRpb24odGhpcy5vbGROYW1lKTtcbiAgICBpZiAobWV0cmljRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5vbGROYW1lfSBkb2VzIG5vdCBleGlzdCBhcyBhIE1ldHJpY2ApO1xuICAgIH1cbiAgICBpZiAobWV0cmljRGVmaW5pdGlvbi5pc1N0YXRpYykge1xuICAgICAgcmV0dXJuIGVycm9yKGBTdGF0aWMgbWV0cmljICR7dGhpcy5vbGROYW1lfSBjYW4ndCBiZSByZW5hbWVkLmApO1xuICAgIH1cblxuICAgIHBsYW4uc2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5ld05hbWUsIG1ldHJpY0RlZmluaXRpb24pO1xuICAgIHBsYW4uZGVsZXRlTWV0cmljRGVmaW5pdGlvbih0aGlzLm9sZE5hbWUpO1xuXG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCByZW5hbWUgdGhpcyBtZXRyaWMuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRhc2suZ2V0TWV0cmljKHRoaXMub2xkTmFtZSkgfHwgbWV0cmljRGVmaW5pdGlvbi5kZWZhdWx0O1xuICAgICAgdGFzay5zZXRNZXRyaWModGhpcy5uZXdOYW1lLCB2YWx1ZSk7XG4gICAgICB0YXNrLmRlbGV0ZU1ldHJpYyh0aGlzLm9sZE5hbWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFJlbmFtZU1ldHJpY1N1Yk9wKHRoaXMubmV3TmFtZSwgdGhpcy5vbGROYW1lKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVXBkYXRlTWV0cmljU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG5hbWU6IHN0cmluZztcbiAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbjtcblxuICAvLyBNYXBzIGFuIGluZGV4IG9mIGEgVGFzayB0byBhIHZhbHVlIGZvciB0aGUgZ2l2ZW4gbWV0cmljIGtleS5cbiAgdGFza01ldHJpY1ZhbHVlczogTWFwPG51bWJlciwgbnVtYmVyPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbixcbiAgICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpIC8vIFNob3VsZCBvbmx5IGJlIHN1cHBsaWVkIGJ5IGludmVyc2UgYWN0aW9ucy5cbiAgKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLm1ldHJpY0RlZmluaXRpb24gPSBtZXRyaWNEZWZpbml0aW9uO1xuICAgIHRoaXMudGFza01ldHJpY1ZhbHVlcyA9IHRhc2tNZXRyaWNWYWx1ZXM7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3Qgb2xkTWV0cmljRGVmaW5pdGlvbiA9IHBsYW4uZ2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5hbWUpO1xuICAgIGlmIChvbGRNZXRyaWNEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm5hbWV9IGRvZXMgbm90IGV4aXN0IGFzIGEgTWV0cmljYCk7XG4gICAgfVxuICAgIGlmIChvbGRNZXRyaWNEZWZpbml0aW9uLmlzU3RhdGljKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYFN0YXRpYyBtZXRyaWMgJHt0aGlzLm5hbWV9IGNhbid0IGJlIHVwZGF0ZWQuYCk7XG4gICAgfVxuXG4gICAgcGxhbi5zZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSwgdGhpcy5tZXRyaWNEZWZpbml0aW9uKTtcblxuICAgIGNvbnN0IHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCk7XG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCB1cGRhdGUgdGhlIG1ldHJpYyB2YWx1ZXMgdG8gcmVmbGVjdCB0aGUgbmV3XG4gICAgLy8gbWV0cmljIGRlZmluaXRpb24sIHVubGVzcyB0aGVyZSBpcyBtYXRjaGluZyBlbnRyeSBpbiB0YXNrTWV0cmljVmFsdWVzLCBpblxuICAgIC8vIHdoaWNoIGNhc2Ugd2Ugd2lsbCB1c2UgdGhhdCB2YWx1ZSwgaS5lLiB0aGlzIFVwZGF0ZU1ldHJpY1N1Yk9wIGlzXG4gICAgLy8gYWN0dWFsbHkgYSByZXZlcnQgb2YgYW5vdGhlciBVcGRhdGVNZXRyaWNTdWJPcC5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IG9sZFZhbHVlID0gdGFzay5nZXRNZXRyaWModGhpcy5uYW1lKSE7XG5cbiAgICAgIGxldCBuZXdWYWx1ZTogbnVtYmVyO1xuICAgICAgaWYgKHRoaXMudGFza01ldHJpY1ZhbHVlcy5oYXMoaW5kZXgpKSB7XG4gICAgICAgIC8vIHRhc2tNZXRyaWNWYWx1ZXMgaGFzIGEgdmFsdWUgdGhlbiB1c2UgdGhhdCwgYXMgdGhpcyBpcyBhbiBpbnZlcnNlXG4gICAgICAgIC8vIG9wZXJhdGlvbi5cbiAgICAgICAgbmV3VmFsdWUgPSB0aGlzLnRhc2tNZXRyaWNWYWx1ZXMuZ2V0KGluZGV4KSE7XG4gICAgICB9IGVsc2UgaWYgKG9sZFZhbHVlID09PSBvbGRNZXRyaWNEZWZpbml0aW9uLmRlZmF1bHQpIHtcbiAgICAgICAgLy8gSWYgdGhlIG9sZFZhbHVlIGlzIHRoZSBkZWZhdWx0LCBjaGFuZ2UgaXQgdG8gdGhlIG5ldyBkZWZhdWx0LlxuICAgICAgICBuZXdWYWx1ZSA9IHRoaXMubWV0cmljRGVmaW5pdGlvbi5kZWZhdWx0O1xuICAgICAgICB0YXNrTWV0cmljVmFsdWVzLnNldChpbmRleCwgb2xkVmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQ2xhbXAuXG4gICAgICAgIG5ld1ZhbHVlID0gdGhpcy5tZXRyaWNEZWZpbml0aW9uLnJhbmdlLmNsYW1wKG9sZFZhbHVlKTtcbiAgICAgICAgbmV3VmFsdWUgPSB0aGlzLm1ldHJpY0RlZmluaXRpb24ucHJlY2lzaW9uLnJvdW5kKG5ld1ZhbHVlKTtcbiAgICAgICAgdGFza01ldHJpY1ZhbHVlcy5zZXQoaW5kZXgsIG9sZFZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHRhc2suc2V0TWV0cmljKHRoaXMubmFtZSwgbmV3VmFsdWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2Uob2xkTWV0cmljRGVmaW5pdGlvbiwgdGFza01ldHJpY1ZhbHVlcyksXG4gICAgfSk7XG4gIH1cblxuICBpbnZlcnNlKFxuICAgIG9sZE1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb24sXG4gICAgdGFza01ldHJpY1ZhbHVlczogTWFwPG51bWJlciwgbnVtYmVyPlxuICApOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBVcGRhdGVNZXRyaWNTdWJPcChcbiAgICAgIHRoaXMubmFtZSxcbiAgICAgIG9sZE1ldHJpY0RlZmluaXRpb24sXG4gICAgICB0YXNrTWV0cmljVmFsdWVzXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2V0TWV0cmljVmFsdWVTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgbmFtZTogc3RyaW5nO1xuICB2YWx1ZTogbnVtYmVyO1xuICB0YXNrSW5kZXg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIHZhbHVlOiBudW1iZXIsIHRhc2tJbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy50YXNrSW5kZXggPSB0YXNrSW5kZXg7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgbWV0cmljc0RlZmluaXRpb24gPSBwbGFuLmdldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lKTtcbiAgICBpZiAobWV0cmljc0RlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmFtZX0gZG9lcyBub3QgZXhpc3QgYXMgYSBNZXRyaWNgKTtcbiAgICB9XG5cbiAgICBjb25zdCB0YXNrID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLnRhc2tJbmRleF07XG4gICAgY29uc3Qgb2xkVmFsdWUgPSB0YXNrLmdldE1ldHJpYyh0aGlzLm5hbWUpIHx8IG1ldHJpY3NEZWZpbml0aW9uLmRlZmF1bHQ7XG4gICAgdGFzay5zZXRNZXRyaWModGhpcy5uYW1lLCBtZXRyaWNzRGVmaW5pdGlvbi5wcmVjaXNpb24ucm91bmQodGhpcy52YWx1ZSkpO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG9sZFZhbHVlKSB9KTtcbiAgfVxuXG4gIGludmVyc2UodmFsdWU6IG51bWJlcik6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFNldE1ldHJpY1ZhbHVlU3ViT3AodGhpcy5uYW1lLCB2YWx1ZSwgdGhpcy50YXNrSW5kZXgpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBZGRNZXRyaWNPcChcbiAgbmFtZTogc3RyaW5nLFxuICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uXG4pOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBBZGRNZXRyaWNTdWJPcChuYW1lLCBtZXRyaWNEZWZpbml0aW9uKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRGVsZXRlTWV0cmljT3AobmFtZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgRGVsZXRlTWV0cmljU3ViT3AobmFtZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJlbmFtZU1ldHJpY09wKG9sZE5hbWU6IHN0cmluZywgbmV3TmFtZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgUmVuYW1lTWV0cmljU3ViT3Aob2xkTmFtZSwgbmV3TmFtZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFVwZGF0ZU1ldHJpY09wKFxuICBuYW1lOiBzdHJpbmcsXG4gIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb25cbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFVwZGF0ZU1ldHJpY1N1Yk9wKG5hbWUsIG1ldHJpY0RlZmluaXRpb24pXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZXRNZXRyaWNWYWx1ZU9wKFxuICBuYW1lOiBzdHJpbmcsXG4gIHZhbHVlOiBudW1iZXIsXG4gIHRhc2tJbmRleDogbnVtYmVyXG4pOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBTZXRNZXRyaWNWYWx1ZVN1Yk9wKG5hbWUsIHZhbHVlLCB0YXNrSW5kZXgpXSk7XG59XG4iLCAiLy8gRWFjaCBSZXNvdXJzZSBoYXMgYSBrZXksIHdoaWNoIGlzIHRoZSBuYW1lLCBhbmQgYSBsaXN0IG9mIGFjY2VwdGFibGUgdmFsdWVzLlxuLy8gVGhlIGxpc3Qgb2YgdmFsdWVzIGNhbiBuZXZlciBiZSBlbXB0eSwgYW5kIHRoZSBmaXJzdCB2YWx1ZSBpbiBgdmFsdWVzYCBpcyB0aGVcbi8vIGRlZmF1bHQgdmFsdWUgZm9yIGEgUmVzb3VyY2UuXG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1JFU09VUkNFX1ZBTFVFID0gXCJcIjtcblxuZXhwb3J0IGludGVyZmFjZSBSZXNvdXJjZURlZmluaXRpb25TZXJpYWxpemVkIHtcbiAgdmFsdWVzOiBzdHJpbmdbXTtcbn1cblxuZXhwb3J0IGNsYXNzIFJlc291cmNlRGVmaW5pdGlvbiB7XG4gIHZhbHVlczogc3RyaW5nW107XG4gIGlzU3RhdGljOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHZhbHVlczogc3RyaW5nW10gPSBbREVGQVVMVF9SRVNPVVJDRV9WQUxVRV0sXG4gICAgaXNTdGF0aWM6IGJvb2xlYW4gPSBmYWxzZVxuICApIHtcbiAgICB0aGlzLnZhbHVlcyA9IHZhbHVlcztcbiAgICB0aGlzLmlzU3RhdGljID0gaXNTdGF0aWM7XG4gIH1cblxuICB0b0pTT04oKTogUmVzb3VyY2VEZWZpbml0aW9uU2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbHVlczogdGhpcy52YWx1ZXMsXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBGcm9tSlNPTihzOiBSZXNvdXJjZURlZmluaXRpb25TZXJpYWxpemVkKTogUmVzb3VyY2VEZWZpbml0aW9uIHtcbiAgICByZXR1cm4gbmV3IFJlc291cmNlRGVmaW5pdGlvbihzLnZhbHVlcyk7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgUmVzb3VyY2VEZWZpbml0aW9ucyA9IHsgW2tleTogc3RyaW5nXTogUmVzb3VyY2VEZWZpbml0aW9uIH07XG5leHBvcnQgdHlwZSBSZXNvdXJjZURlZmluaXRpb25zU2VyaWFsaXplZCA9IHtcbiAgW2tleTogc3RyaW5nXTogUmVzb3VyY2VEZWZpbml0aW9uU2VyaWFsaXplZDtcbn07XG4iLCAiaW1wb3J0IHsgUmVzdWx0LCBvaywgZXJyb3IgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhbi50c1wiO1xuaW1wb3J0IHsgT3AsIFN1Yk9wLCBTdWJPcFJlc3VsdCB9IGZyb20gXCIuL29wcy50c1wiO1xuaW1wb3J0IHtcbiAgREVGQVVMVF9SRVNPVVJDRV9WQUxVRSxcbiAgUmVzb3VyY2VEZWZpbml0aW9uLFxufSBmcm9tIFwiLi4vcmVzb3VyY2VzL3Jlc291cmNlcy50c1wiO1xuaW1wb3J0IHsgVGFzayB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuXG5leHBvcnQgY2xhc3MgQWRkUmVzb3VyY2VTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG5cbiAgLy8gTWFwcyBhbiBpbmRleCBvZiBhIFRhc2sgdG8gYSB2YWx1ZSBmb3IgdGhlIGdpdmVuIHJlc291cmNlIGtleS5cbiAgdGFza1Jlc291cmNlVmFsdWVzOiBNYXA8bnVtYmVyLCBzdHJpbmc+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICB0YXNrUmVzb3VyY2VWYWx1ZXM6IE1hcDxudW1iZXIsIHN0cmluZz4gPSBuZXcgTWFwPG51bWJlciwgc3RyaW5nPigpIC8vIFNob3VsZCBvbmx5IGJlIHN1cHBsaWVkIGJ5IGludmVyc2UgYWN0aW9ucy5cbiAgKSB7XG4gICAgdGhpcy5rZXkgPSBuYW1lO1xuICAgIHRoaXMudGFza1Jlc291cmNlVmFsdWVzID0gdGFza1Jlc291cmNlVmFsdWVzO1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGZvdW5kTWF0Y2ggPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKGZvdW5kTWF0Y2ggIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBhbHJlYWR5IGV4aXN0cyBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuXG4gICAgcGxhbi5zZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXksIG5ldyBSZXNvdXJjZURlZmluaXRpb24oKSk7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIGFkZCB0aGlzIGtleSBhbmQgc2V0IGl0IHRvIHRoZSBkZWZhdWx0LCB1bmxlc3NcbiAgICAvLyB0aGVyZSBpcyBtYXRjaGluZyBlbnRyeSBpbiB0YXNrUmVzb3VyY2VWYWx1ZXMsIGluIHdoaWNoIGNhc2Ugd2Ugd2lsbCB1c2UgdGhhdCB2YWx1ZS5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIHRhc2suc2V0UmVzb3VyY2UoXG4gICAgICAgIHRoaXMua2V5LFxuICAgICAgICB0aGlzLnRhc2tSZXNvdXJjZVZhbHVlcy5nZXQoaW5kZXgpIHx8IERFRkFVTFRfUkVTT1VSQ0VfVkFMVUVcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlUmVzb3VyY2VTdXBPcCh0aGlzLmtleSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlbGV0ZVJlc291cmNlU3VwT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMua2V5ID0gbmFtZTtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCByZXNvdXJjZURlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKHJlc291cmNlRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGBUaGUgcmVzb3VyY2Ugd2l0aCBuYW1lICR7dGhpcy5rZXl9IGRvZXMgbm90IGV4aXN0IGFuZCBjYW4ndCBiZSBkZWxldGVkLmBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGZyb20gcmVzb3VyY2UgZGVmaW5pdGlvbnMuXG4gICAgcGxhbi5kZWxldGVNZXRyaWNEZWZpbml0aW9uKHRoaXMua2V5KTtcblxuICAgIGNvbnN0IHRhc2tJbmRleFRvRGVsZXRlZFJlc291cmNlVmFsdWU6IE1hcDxudW1iZXIsIHN0cmluZz4gPSBuZXcgTWFwKCk7XG5cbiAgICAvLyBOb3cgbG9vayBhdCBhbGwgVGFza3MgYW5kIHJlbW92ZSBgdGhpcy5rZXlgIGZyb20gdGhlIHJlc291cmNlcyB3aGlsZSBhbHNvXG4gICAgLy8gYnVpbGRpbmcgdXAgdGhlIGluZm8gbmVlZGVkIGZvciBhIHJldmVydC5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGFzay5nZXRSZXNvdXJjZSh0aGlzLmtleSkgfHwgREVGQVVMVF9SRVNPVVJDRV9WQUxVRTtcbiAgICAgIHRhc2tJbmRleFRvRGVsZXRlZFJlc291cmNlVmFsdWUuc2V0KGluZGV4LCB2YWx1ZSk7XG4gICAgICB0YXNrLmRlbGV0ZVJlc291cmNlKHRoaXMua2V5KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKHRhc2tJbmRleFRvRGVsZXRlZFJlc291cmNlVmFsdWUpLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZlcnNlKFxuICAgIHJlc291cmNlVmFsdWVzRm9yRGVsZXRlZFJlc291cmNlS2V5OiBNYXA8bnVtYmVyLCBzdHJpbmc+XG4gICk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IEFkZFJlc291cmNlU3ViT3AodGhpcy5rZXksIHJlc291cmNlVmFsdWVzRm9yRGVsZXRlZFJlc291cmNlS2V5KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQWRkUmVzb3VyY2VPcHRpb25TdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG4gIHZhbHVlOiBzdHJpbmc7XG4gIGluZGljZXNPZlRhc2tzVG9DaGFuZ2U6IG51bWJlcltdID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgdmFsdWU6IHN0cmluZyxcbiAgICBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlOiBudW1iZXJbXSA9IFtdIC8vIFRoaXMgc2hvdWxkIG9ubHkgYmUgc3VwcGxpZWQgd2hlbiBiZWluZyBjb25zdHJ1Y3RlZCBhcyBhIGludmVyc2Ugb3BlcmF0aW9uLlxuICApIHtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5pbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlID0gaW5kaWNlc09mVGFza3NUb0NoYW5nZTtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBkZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChkZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lc24ndCBleGlzdCBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuICAgIGNvbnN0IGV4aXN0aW5nSW5kZXggPSBkZWZpbml0aW9uLnZhbHVlcy5maW5kSW5kZXgoXG4gICAgICAodmFsdWU6IHN0cmluZykgPT4gdmFsdWUgPT09IHRoaXMudmFsdWVcbiAgICApO1xuICAgIGlmIChleGlzdGluZ0luZGV4ICE9PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgJHt0aGlzLnZhbHVlfSBhbHJlYWR5IGV4aXN0cyBhcyBhIHZhbHVlIGluIHRoZSBSZXNvdXJjZSAke3RoaXMua2V5fS5gXG4gICAgICApO1xuICAgIH1cbiAgICBkZWZpbml0aW9uLnZhbHVlcy5wdXNoKHRoaXMudmFsdWUpO1xuXG4gICAgLy8gTm93IGxvb2sgYXQgYWxsIFRhc2tzIGFuZCBzZXQgdGhlIHZhbHVlIGZvciB0aGUgZ2l2ZW4ga2V5IGZvciBhbGwgdGhlXG4gICAgLy8gdGFza3MgbGlzdGVkIGluIGBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlYC5cbiAgICB0aGlzLmluZGljZXNPZlRhc2tzVG9DaGFuZ2UuZm9yRWFjaCgodGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIHBsYW4uY2hhcnQuVmVydGljZXNbdGFza0luZGV4XS5zZXRSZXNvdXJjZSh0aGlzLmtleSwgdGhpcy52YWx1ZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIHByaXZhdGUgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBEZWxldGVSZXNvdXJjZU9wdGlvblN1Yk9wKFxuICAgICAgdGhpcy5rZXksXG4gICAgICB0aGlzLnZhbHVlLFxuICAgICAgdGhpcy5pbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVsZXRlUmVzb3VyY2VPcHRpb25TdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG4gIHZhbHVlOiBzdHJpbmc7XG4gIGluZGljZXNPZlRhc2tzVG9DaGFuZ2U6IG51bWJlcltdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGtleTogc3RyaW5nLFxuICAgIHZhbHVlOiBzdHJpbmcsXG4gICAgaW5kaWNlc09mVGFza3NUb0NoYW5nZTogbnVtYmVyW10gPSBbXVxuICApIHtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5pbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlID0gaW5kaWNlc09mVGFza3NUb0NoYW5nZTtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBkZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChkZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lc24ndCBleGlzdCBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuICAgIGNvbnN0IHZhbHVlSW5kZXggPSBkZWZpbml0aW9uLnZhbHVlcy5maW5kSW5kZXgoXG4gICAgICAodmFsdWU6IHN0cmluZykgPT4gdmFsdWUgPT09IHRoaXMudmFsdWVcbiAgICApO1xuICAgIGlmICh2YWx1ZUluZGV4ID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgJHt0aGlzLnZhbHVlfSBkb2VzIG5vdCBleGlzdCBhcyBhIHZhbHVlIGluIHRoZSBSZXNvdXJjZSAke3RoaXMua2V5fS5gXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZGVmaW5pdGlvbi52YWx1ZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGBSZXNvdXJjZXMgbXVzdCBoYXZlIGF0IGxlYXN0IG9uZSB2YWx1ZS4gJHt0aGlzLnZhbHVlfSBvbmx5IGhhcyBvbmUgdmFsdWUsIHNvIGl0IGNhbid0IGJlIGRlbGV0ZWQuIGBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgZGVmaW5pdGlvbi52YWx1ZXMuc3BsaWNlKHZhbHVlSW5kZXgsIDEpO1xuXG4gICAgLy8gTm93IGl0ZXJhdGUgdGhvdWdoIGFsbCB0aGUgdGFza3MgYW5kIGNoYW5nZSBhbGwgdGFza3MgdGhhdCBoYXZlXG4gICAgLy8gXCJrZXk6dmFsdWVcIiB0byBpbnN0ZWFkIGJlIFwia2V5OmRlZmF1bHRcIi4gUmVjb3JkIHdoaWNoIHRhc2tzIGdvdCBjaGFuZ2VkXG4gICAgLy8gc28gdGhhdCB3ZSBjYW4gdXNlIHRoYXQgaW5mb3JtYXRpb24gd2hlbiB3ZSBjcmVhdGUgdGhlIGludmVydCBvcGVyYXRpb24uXG5cbiAgICBjb25zdCBpbmRpY2VzT2ZUYXNrc1dpdGhNYXRjaGluZ1Jlc291cmNlVmFsdWVzOiBudW1iZXJbXSA9IFtdO1xuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCByZXNvdXJjZVZhbHVlID0gdGFzay5nZXRSZXNvdXJjZSh0aGlzLmtleSk7XG4gICAgICBpZiAocmVzb3VyY2VWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gU2luY2UgdGhlIHZhbHVlIGlzIG5vIGxvbmdlciB2YWxpZCB3ZSBjaGFuZ2UgaXQgYmFjayB0byB0aGUgZGVmYXVsdC5cbiAgICAgIHRhc2suc2V0UmVzb3VyY2UodGhpcy5rZXksIGRlZmluaXRpb24udmFsdWVzWzBdKTtcblxuICAgICAgLy8gUmVjb3JkIHdoaWNoIHRhc2sgd2UganVzdCBjaGFuZ2VkLlxuICAgICAgaW5kaWNlc09mVGFza3NXaXRoTWF0Y2hpbmdSZXNvdXJjZVZhbHVlcy5wdXNoKGluZGV4KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKGluZGljZXNPZlRhc2tzV2l0aE1hdGNoaW5nUmVzb3VyY2VWYWx1ZXMpLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZlcnNlKGluZGljZXNPZlRhc2tzVG9DaGFuZ2U6IG51bWJlcltdKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgQWRkUmVzb3VyY2VPcHRpb25TdWJPcChcbiAgICAgIHRoaXMua2V5LFxuICAgICAgdGhpcy52YWx1ZSxcbiAgICAgIGluZGljZXNPZlRhc2tzVG9DaGFuZ2VcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZW5hbWVSZXNvdXJjZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBvbGRLZXk6IHN0cmluZztcbiAgbmV3S2V5OiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Iob2xkS2V5OiBzdHJpbmcsIG5ld0tleTogc3RyaW5nKSB7XG4gICAgdGhpcy5vbGRLZXkgPSBvbGRLZXk7XG4gICAgdGhpcy5uZXdLZXkgPSBuZXdLZXk7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3Qgb2xkRGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMub2xkS2V5KTtcbiAgICBpZiAob2xkRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5vbGRLZXl9IGRvZXMgbm90IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG5cbiAgICAvLyBDb25maXJtIHRoZSBuZXdLZXkgaXMgbm90IGFscmVhZHkgdXNlZC5cbiAgICBjb25zdCBuZXdLZXlEZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5uZXdLZXkpO1xuICAgIGlmIChuZXdLZXlEZWZpbml0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm5ld0tleX0gYWxyZWFkeSBleGlzdHMgYXMgYSByZXNvdXJjZSBuYW1lLmApO1xuICAgIH1cblxuICAgIHBsYW4uZGVsZXRlUmVzb3VyY2VEZWZpbml0aW9uKHRoaXMub2xkS2V5KTtcbiAgICBwbGFuLnNldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLm5ld0tleSwgb2xkRGVmaW5pdGlvbik7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIGNoYW5nZSBvbGRLZXkgLT4gbmV3a2V5IGZvciB0aGUgZ2l2ZW4gcmVzb3VyY2Uga2V5LlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaykgPT4ge1xuICAgICAgY29uc3QgY3VycmVudFZhbHVlID1cbiAgICAgICAgdGFzay5nZXRSZXNvdXJjZSh0aGlzLm9sZEtleSkgfHwgREVGQVVMVF9SRVNPVVJDRV9WQUxVRTtcbiAgICAgIHRhc2suc2V0UmVzb3VyY2UodGhpcy5uZXdLZXksIGN1cnJlbnRWYWx1ZSk7XG4gICAgICB0YXNrLmRlbGV0ZVJlc291cmNlKHRoaXMub2xkS2V5KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBSZW5hbWVSZXNvdXJjZVN1Yk9wKHRoaXMubmV3S2V5LCB0aGlzLm9sZEtleSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbmFtZVJlc291cmNlT3B0aW9uU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuICBvbGRWYWx1ZTogc3RyaW5nO1xuICBuZXdWYWx1ZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGtleTogc3RyaW5nLCBvbGRWYWx1ZTogc3RyaW5nLCBuZXdWYWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy5vbGRWYWx1ZSA9IG9sZFZhbHVlO1xuICAgIHRoaXMubmV3VmFsdWUgPSBuZXdWYWx1ZTtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBmb3VuZE1hdGNoID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChmb3VuZE1hdGNoID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lcyBub3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cblxuICAgIC8vIENvbmZpcm0gdGhlIG9sZFZhbHVlIGlzIGluIHRoZXJlLlxuICAgIGNvbnN0IG9sZFZhbHVlSW5kZXggPSBmb3VuZE1hdGNoLnZhbHVlcy5pbmRleE9mKHRoaXMub2xkVmFsdWUpO1xuXG4gICAgaWYgKG9sZFZhbHVlSW5kZXggPT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXMgbm90IGEgdmFsdWUgJHt0aGlzLm9sZFZhbHVlfWApO1xuICAgIH1cblxuICAgIC8vIENvbmZpcm0gdGhlIG5ld1ZhbHVlIGlzIG5vdCBpbiB0aGVyZS5cbiAgICBjb25zdCBuZXdWYWx1ZUluZGV4ID0gZm91bmRNYXRjaC52YWx1ZXMuaW5kZXhPZih0aGlzLm5ld1ZhbHVlKTtcbiAgICBpZiAobmV3VmFsdWVJbmRleCAhPT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gYWxyZWFkeSBoYXMgYSB2YWx1ZSAke3RoaXMubmV3VmFsdWV9YCk7XG4gICAgfVxuXG4gICAgLy8gU3dhcCB0aGUgdmFsdWVzLlxuICAgIGZvdW5kTWF0Y2gudmFsdWVzLnNwbGljZShvbGRWYWx1ZUluZGV4LCAxLCB0aGlzLm5ld1ZhbHVlKTtcblxuICAgIC8vIE5vdyBsb29wIG92ZXIgZXZlcnkgdGFzayBhbmQgY2hhbmdlIG9sZFZhbHVlIC0+IG5ld1ZhbHVlIGZvciB0aGUgZ2l2ZW4gcmVzb3VyY2Uga2V5LlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaykgPT4ge1xuICAgICAgY29uc3QgY3VycmVudFZhbHVlID0gdGFzay5nZXRSZXNvdXJjZSh0aGlzLmtleSk7XG4gICAgICBpZiAoY3VycmVudFZhbHVlID09PSB0aGlzLm9sZFZhbHVlKSB7XG4gICAgICAgIHRhc2suc2V0UmVzb3VyY2UodGhpcy5rZXksIHRoaXMubmV3VmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFJlbmFtZVJlc291cmNlT3B0aW9uU3ViT3AoXG4gICAgICB0aGlzLmtleSxcbiAgICAgIHRoaXMubmV3VmFsdWUsXG4gICAgICB0aGlzLm9sZFZhbHVlXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTW92ZVJlc291cmNlT3B0aW9uU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuICBvbGRJbmRleDogbnVtYmVyO1xuICBuZXdJbmRleDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKGtleTogc3RyaW5nLCBvbGRWYWx1ZTogbnVtYmVyLCBuZXdWYWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy5vbGRJbmRleCA9IG9sZFZhbHVlO1xuICAgIHRoaXMubmV3SW5kZXggPSBuZXdWYWx1ZTtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBkZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChkZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lcyBub3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9sZEluZGV4ID4gZGVmaW5pdGlvbi52YWx1ZXMubGVuZ3RoIC0gMSkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgJHt0aGlzLmtleX0gZG9lcyBub3QgaGF2ZSBhIHZhbHVlIGF0IGluZGV4ICR7dGhpcy5vbGRJbmRleH1gXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAodGhpcy5uZXdJbmRleCA+IGRlZmluaXRpb24udmFsdWVzLmxlbmd0aCAtIDEpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYCR7dGhpcy5rZXl9IGRvZXMgbm90IGhhdmUgYSB2YWx1ZSBhdCBpbmRleCAke3RoaXMubmV3SW5kZXh9YFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBTd2FwIHRoZSB2YWx1ZXMuXG4gICAgY29uc3QgdG1wID0gZGVmaW5pdGlvbi52YWx1ZXNbdGhpcy5vbGRJbmRleF07XG4gICAgZGVmaW5pdGlvbi52YWx1ZXNbdGhpcy5vbGRJbmRleF0gPSBkZWZpbml0aW9uLnZhbHVlc1t0aGlzLm5ld0luZGV4XTtcbiAgICBkZWZpbml0aW9uLnZhbHVlc1t0aGlzLm5ld0luZGV4XSA9IHRtcDtcblxuICAgIC8vIFdlIGRvbid0IG5lZWQgdG8gZG8gYW55dGhpbmcgd2l0aCBUYXNrcyBiZWNhdXNlIHRoZSBpbmRleCBvZiBhIHZhbHVlIGlzXG4gICAgLy8gaXJyZWxldmFudCBzaW5jZSB3ZSBzdG9yZSB0aGUgdmFsdWUgaXRzZWxmLCBub3QgdGhlIGluZGV4LlxuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IE1vdmVSZXNvdXJjZU9wdGlvblN1Yk9wKHRoaXMua2V5LCB0aGlzLm5ld0luZGV4LCB0aGlzLm9sZEluZGV4KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2V0UmVzb3VyY2VWYWx1ZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcbiAgdmFsdWU6IHN0cmluZztcbiAgdGFza0luZGV4OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Ioa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIHRhc2tJbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMudGFza0luZGV4ID0gdGFza0luZGV4O1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGZvdW5kTWF0Y2ggPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKGZvdW5kTWF0Y2ggPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2VzIG5vdCBleGlzdCBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuXG4gICAgY29uc3QgZm91bmRWYWx1ZU1hdGNoID0gZm91bmRNYXRjaC52YWx1ZXMuZmluZEluZGV4KCh2OiBzdHJpbmcpID0+IHtcbiAgICAgIHJldHVybiB2ID09PSB0aGlzLnZhbHVlO1xuICAgIH0pO1xuICAgIGlmIChmb3VuZFZhbHVlTWF0Y2ggPT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXMgbm90IGhhdmUgYSB2YWx1ZSBvZiAke3RoaXMudmFsdWV9YCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRhc2tJbmRleCA8IDAgfHwgdGhpcy50YXNrSW5kZXggPj0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBlcnJvcihgVGhlcmUgaXMgbm8gVGFzayBhdCBpbmRleCAke3RoaXMudGFza0luZGV4fWApO1xuICAgIH1cblxuICAgIGNvbnN0IHRhc2sgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMudGFza0luZGV4XTtcbiAgICBjb25zdCBvbGRWYWx1ZSA9IHRhc2suZ2V0UmVzb3VyY2UodGhpcy5rZXkpITtcbiAgICB0YXNrLnNldFJlc291cmNlKHRoaXMua2V5LCB0aGlzLnZhbHVlKTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZShvbGRWYWx1ZSkgfSk7XG4gIH1cblxuICBpbnZlcnNlKG9sZFZhbHVlOiBzdHJpbmcpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBTZXRSZXNvdXJjZVZhbHVlU3ViT3AodGhpcy5rZXksIG9sZFZhbHVlLCB0aGlzLnRhc2tJbmRleCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFkZFJlc291cmNlT3AobmFtZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgQWRkUmVzb3VyY2VTdWJPcChuYW1lKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRGVsZXRlUmVzb3VyY2VPcChuYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBEZWxldGVSZXNvdXJjZVN1cE9wKG5hbWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBZGRSZXNvdXJjZU9wdGlvbk9wKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgQWRkUmVzb3VyY2VPcHRpb25TdWJPcChrZXksIHZhbHVlKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRGVsZXRlUmVzb3VyY2VPcHRpb25PcChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IERlbGV0ZVJlc291cmNlT3B0aW9uU3ViT3Aoa2V5LCB2YWx1ZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJlbmFtZVJlc291cmNlT3B0aW9uT3AoXG4gIGtleTogc3RyaW5nLFxuICBvbGRWYWx1ZTogc3RyaW5nLFxuICBuZXdWYWx1ZTogc3RyaW5nXG4pOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBSZW5hbWVSZXNvdXJjZU9wdGlvblN1Yk9wKGtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmVuYW1lUmVzb3VyY2VPcChvbGRWYWx1ZTogc3RyaW5nLCBuZXdWYWx1ZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgUmVuYW1lUmVzb3VyY2VTdWJPcChvbGRWYWx1ZSwgbmV3VmFsdWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBNb3ZlUmVzb3VyY2VPcHRpb25PcChcbiAga2V5OiBzdHJpbmcsXG4gIG9sZEluZGV4OiBudW1iZXIsXG4gIG5ld0luZGV4OiBudW1iZXJcbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IE1vdmVSZXNvdXJjZU9wdGlvblN1Yk9wKGtleSwgb2xkSW5kZXgsIG5ld0luZGV4KV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU2V0UmVzb3VyY2VWYWx1ZU9wKFxuICBrZXk6IHN0cmluZyxcbiAgdmFsdWU6IHN0cmluZyxcbiAgdGFza0luZGV4OiBudW1iZXJcbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFNldFJlc291cmNlVmFsdWVTdWJPcChrZXksIHZhbHVlLCB0YXNrSW5kZXgpXSk7XG59XG4iLCAiaW1wb3J0IHtcbiAgVmVydGV4LFxuICBWZXJ0ZXhJbmRpY2VzLFxuICBEaXJlY3RlZEdyYXBoLFxuICBlZGdlc0J5U3JjVG9NYXAsXG59IGZyb20gXCIuLi9kYWcudHNcIjtcblxuLyoqXG5UaGUgcmV0dXJuIHR5cGUgZm9yIHRoZSBUb3Bsb2dpY2FsU29ydCBmdW5jdGlvbi4gXG4gKi9cbnR5cGUgVFNSZXR1cm4gPSB7XG4gIGhhc0N5Y2xlczogYm9vbGVhbjtcblxuICBjeWNsZTogVmVydGV4SW5kaWNlcztcblxuICBvcmRlcjogVmVydGV4SW5kaWNlcztcbn07XG5cbi8qKlxuUmV0dXJucyBhIHRvcG9sb2dpY2FsIHNvcnQgb3JkZXIgZm9yIGEgRGlyZWN0ZWRHcmFwaCwgb3IgdGhlIG1lbWJlcnMgb2YgYSBjeWNsZSBpZiBhXG50b3BvbG9naWNhbCBzb3J0IGNhbid0IGJlIGRvbmUuXG4gXG4gVGhlIHRvcG9sb2dpY2FsIHNvcnQgY29tZXMgZnJvbTpcblxuICAgIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1RvcG9sb2dpY2FsX3NvcnRpbmcjRGVwdGgtZmlyc3Rfc2VhcmNoXG5cbkwgXHUyMTkwIEVtcHR5IGxpc3QgdGhhdCB3aWxsIGNvbnRhaW4gdGhlIHNvcnRlZCBub2Rlc1xud2hpbGUgZXhpc3RzIG5vZGVzIHdpdGhvdXQgYSBwZXJtYW5lbnQgbWFyayBkb1xuICAgIHNlbGVjdCBhbiB1bm1hcmtlZCBub2RlIG5cbiAgICB2aXNpdChuKVxuXG5mdW5jdGlvbiB2aXNpdChub2RlIG4pXG4gICAgaWYgbiBoYXMgYSBwZXJtYW5lbnQgbWFyayB0aGVuXG4gICAgICAgIHJldHVyblxuICAgIGlmIG4gaGFzIGEgdGVtcG9yYXJ5IG1hcmsgdGhlblxuICAgICAgICBzdG9wICAgKGdyYXBoIGhhcyBhdCBsZWFzdCBvbmUgY3ljbGUpXG5cbiAgICBtYXJrIG4gd2l0aCBhIHRlbXBvcmFyeSBtYXJrXG5cbiAgICBmb3IgZWFjaCBub2RlIG0gd2l0aCBhbiBlZGdlIGZyb20gbiB0byBtIGRvXG4gICAgICAgIHZpc2l0KG0pXG5cbiAgICByZW1vdmUgdGVtcG9yYXJ5IG1hcmsgZnJvbSBuXG4gICAgbWFyayBuIHdpdGggYSBwZXJtYW5lbnQgbWFya1xuICAgIGFkZCBuIHRvIGhlYWQgb2YgTFxuXG4gKi9cbmV4cG9ydCBjb25zdCB0b3BvbG9naWNhbFNvcnQgPSAoZzogRGlyZWN0ZWRHcmFwaCk6IFRTUmV0dXJuID0+IHtcbiAgY29uc3QgcmV0OiBUU1JldHVybiA9IHtcbiAgICBoYXNDeWNsZXM6IGZhbHNlLFxuICAgIGN5Y2xlOiBbXSxcbiAgICBvcmRlcjogW10sXG4gIH07XG5cbiAgY29uc3QgZWRnZU1hcCA9IGVkZ2VzQnlTcmNUb01hcChnLkVkZ2VzKTtcblxuICBjb25zdCBub2Rlc1dpdGhvdXRQZXJtYW5lbnRNYXJrID0gbmV3IFNldDxudW1iZXI+KCk7XG4gIGcuVmVydGljZXMuZm9yRWFjaCgoXzogVmVydGV4LCBpbmRleDogbnVtYmVyKSA9PlxuICAgIG5vZGVzV2l0aG91dFBlcm1hbmVudE1hcmsuYWRkKGluZGV4KVxuICApO1xuXG4gIGNvbnN0IGhhc1Blcm1hbmVudE1hcmsgPSAoaW5kZXg6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xuICAgIHJldHVybiAhbm9kZXNXaXRob3V0UGVybWFuZW50TWFyay5oYXMoaW5kZXgpO1xuICB9O1xuXG4gIGNvbnN0IHRlbXBvcmFyeU1hcmsgPSBuZXcgU2V0PG51bWJlcj4oKTtcblxuICBjb25zdCB2aXNpdCA9IChpbmRleDogbnVtYmVyKTogYm9vbGVhbiA9PiB7XG4gICAgaWYgKGhhc1Blcm1hbmVudE1hcmsoaW5kZXgpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHRlbXBvcmFyeU1hcmsuaGFzKGluZGV4KSkge1xuICAgICAgLy8gV2Ugb25seSByZXR1cm4gZmFsc2Ugb24gZmluZGluZyBhIGxvb3AsIHdoaWNoIGlzIHN0b3JlZCBpblxuICAgICAgLy8gdGVtcG9yYXJ5TWFyay5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdGVtcG9yYXJ5TWFyay5hZGQoaW5kZXgpO1xuXG4gICAgY29uc3QgbmV4dEVkZ2VzID0gZWRnZU1hcC5nZXQoaW5kZXgpO1xuICAgIGlmIChuZXh0RWRnZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXh0RWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZSA9IG5leHRFZGdlc1tpXTtcbiAgICAgICAgaWYgKCF2aXNpdChlLmopKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGVtcG9yYXJ5TWFyay5kZWxldGUoaW5kZXgpO1xuICAgIG5vZGVzV2l0aG91dFBlcm1hbmVudE1hcmsuZGVsZXRlKGluZGV4KTtcbiAgICByZXQub3JkZXIudW5zaGlmdChpbmRleCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLy8gV2Ugd2lsbCBwcmVzdW1lIHRoYXQgVmVydGV4WzBdIGlzIHRoZSBzdGFydCBub2RlIGFuZCB0aGF0IHdlIHNob3VsZCBzdGFydCB0aGVyZS5cbiAgY29uc3Qgb2sgPSB2aXNpdCgwKTtcbiAgaWYgKCFvaykge1xuICAgIHJldC5oYXNDeWNsZXMgPSB0cnVlO1xuICAgIHJldC5jeWNsZSA9IFsuLi50ZW1wb3JhcnlNYXJrLmtleXMoKV07XG4gIH1cblxuICByZXR1cm4gcmV0O1xufTtcbiIsICJpbXBvcnQgeyBSZXN1bHQsIG9rLCBlcnJvciB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7XG4gIFZlcnRleEluZGljZXMsXG4gIEVkZ2VzLFxuICBEaXJlY3RlZEdyYXBoLFxuICBlZGdlc0J5U3JjVG9NYXAsXG4gIGVkZ2VzQnlEc3RUb01hcCxcbiAgRGlyZWN0ZWRFZGdlLFxuICBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkLFxufSBmcm9tIFwiLi4vZGFnL2RhZ1wiO1xuXG5pbXBvcnQgeyB0b3BvbG9naWNhbFNvcnQgfSBmcm9tIFwiLi4vZGFnL2FsZ29yaXRobXMvdG9wb3NvcnQudHNcIjtcbmltcG9ydCB7IE1ldHJpY1ZhbHVlcyB9IGZyb20gXCIuLi9tZXRyaWNzL21ldHJpY3MudHNcIjtcblxuZXhwb3J0IHR5cGUgVGFza1N0YXRlID0gXCJ1bnN0YXJ0ZWRcIiB8IFwic3RhcnRlZFwiIHwgXCJjb21wbGV0ZVwiO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9UQVNLX05BTUUgPSBcIlRhc2sgTmFtZVwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRhc2tTZXJpYWxpemVkIHtcbiAgcmVzb3VyY2VzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xuICBtZXRyaWNzOiBNZXRyaWNWYWx1ZXM7XG4gIG5hbWU6IHN0cmluZztcbiAgc3RhdGU6IFRhc2tTdGF0ZTtcbn1cblxuLy8gRG8gd2UgY3JlYXRlIHN1Yi1jbGFzc2VzIGFuZCB0aGVuIHNlcmlhbGl6ZSBzZXBhcmF0ZWx5PyBPciBkbyB3ZSBoYXZlIGFcbi8vIGNvbmZpZyBhYm91dCB3aGljaCB0eXBlIG9mIER1cmF0aW9uU2FtcGxlciBpcyBiZWluZyB1c2VkP1xuLy9cbi8vIFdlIGNhbiB1c2UgdHJhZGl0aW9uYWwgb3B0aW1pc3RpYy9wZXNzaW1pc3RpYyB2YWx1ZS4gT3IgSmFjb2JpYW4nc1xuLy8gdW5jZXJ0YWludGx5IG11bHRpcGxpZXJzIFsxLjEsIDEuNSwgMiwgNV0gYW5kIHRoZWlyIGludmVyc2VzIHRvIGdlbmVyYXRlIGFuXG4vLyBvcHRpbWlzdGljIHBlc3NpbWlzdGljLlxuXG4vKiogVGFzayBpcyBhIFZlcnRleCB3aXRoIGRldGFpbHMgYWJvdXQgdGhlIFRhc2sgdG8gY29tcGxldGUuICovXG5leHBvcnQgY2xhc3MgVGFzayB7XG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZyA9IFwiXCIpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lIHx8IERFRkFVTFRfVEFTS19OQU1FO1xuICAgIHRoaXMubWV0cmljcyA9IHt9O1xuICAgIHRoaXMucmVzb3VyY2VzID0ge307XG4gIH1cblxuICAvLyBSZXNvdXJjZSBrZXlzIGFuZCB2YWx1ZXMuIFRoZSBwYXJlbnQgcGxhbiBjb250YWlucyBhbGwgdGhlIHJlc291cmNlXG4gIC8vIGRlZmluaXRpb25zLlxuXG4gIHJlc291cmNlczogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcblxuICBtZXRyaWNzOiBNZXRyaWNWYWx1ZXM7XG5cbiAgbmFtZTogc3RyaW5nO1xuXG4gIHN0YXRlOiBUYXNrU3RhdGUgPSBcInVuc3RhcnRlZFwiO1xuXG4gIHRvSlNPTigpOiBUYXNrU2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc291cmNlczogdGhpcy5yZXNvdXJjZXMsXG4gICAgICBtZXRyaWNzOiB0aGlzLm1ldHJpY3MsXG4gICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICBzdGF0ZTogdGhpcy5zdGF0ZSxcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIGdldCBkdXJhdGlvbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldE1ldHJpYyhcIkR1cmF0aW9uXCIpITtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgZHVyYXRpb24odmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMuc2V0TWV0cmljKFwiRHVyYXRpb25cIiwgdmFsdWUpO1xuICB9XG5cbiAgcHVibGljIGdldE1ldHJpYyhrZXk6IHN0cmluZyk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMubWV0cmljc1trZXldO1xuICB9XG5cbiAgcHVibGljIHNldE1ldHJpYyhrZXk6IHN0cmluZywgdmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMubWV0cmljc1trZXldID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZGVsZXRlTWV0cmljKGtleTogc3RyaW5nKSB7XG4gICAgZGVsZXRlIHRoaXMubWV0cmljc1trZXldO1xuICB9XG5cbiAgcHVibGljIGdldFJlc291cmNlKGtleTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5yZXNvdXJjZXNba2V5XTtcbiAgfVxuXG4gIHB1YmxpYyBzZXRSZXNvdXJjZShrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMucmVzb3VyY2VzW2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBkZWxldGVSZXNvdXJjZShrZXk6IHN0cmluZykge1xuICAgIGRlbGV0ZSB0aGlzLnJlc291cmNlc1trZXldO1xuICB9XG5cbiAgcHVibGljIGR1cCgpOiBUYXNrIHtcbiAgICBjb25zdCByZXQgPSBuZXcgVGFzaygpO1xuICAgIHJldC5yZXNvdXJjZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnJlc291cmNlcyk7XG4gICAgcmV0Lm1ldHJpY3MgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLm1ldHJpY3MpO1xuICAgIHJldC5uYW1lID0gdGhpcy5uYW1lO1xuICAgIHJldC5zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBUYXNrcyA9IFRhc2tbXTtcblxuZXhwb3J0IGludGVyZmFjZSBDaGFydFNlcmlhbGl6ZWQge1xuICB2ZXJ0aWNlczogVGFza1NlcmlhbGl6ZWRbXTtcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVNlcmlhbGl6ZWRbXTtcbn1cblxuLyoqIEEgQ2hhcnQgaXMgYSBEaXJlY3RlZEdyYXBoLCBidXQgd2l0aCBUYXNrcyBmb3IgVmVydGljZXMuICovXG5leHBvcnQgY2xhc3MgQ2hhcnQge1xuICBWZXJ0aWNlczogVGFza3M7XG4gIEVkZ2VzOiBFZGdlcztcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBjb25zdCBzdGFydCA9IG5ldyBUYXNrKFwiU3RhcnRcIik7XG4gICAgc3RhcnQuc2V0TWV0cmljKFwiRHVyYXRpb25cIiwgMCk7XG4gICAgY29uc3QgZmluaXNoID0gbmV3IFRhc2soXCJGaW5pc2hcIik7XG4gICAgZmluaXNoLnNldE1ldHJpYyhcIkR1cmF0aW9uXCIsIDApO1xuICAgIHRoaXMuVmVydGljZXMgPSBbc3RhcnQsIGZpbmlzaF07XG4gICAgdGhpcy5FZGdlcyA9IFtuZXcgRGlyZWN0ZWRFZGdlKDAsIDEpXTtcbiAgfVxuXG4gIHRvSlNPTigpOiBDaGFydFNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICB2ZXJ0aWNlczogdGhpcy5WZXJ0aWNlcy5tYXAoKHQ6IFRhc2spID0+IHQudG9KU09OKCkpLFxuICAgICAgZWRnZXM6IHRoaXMuRWRnZXMubWFwKChlOiBEaXJlY3RlZEVkZ2UpID0+IGUudG9KU09OKCkpLFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgVG9wb2xvZ2ljYWxPcmRlciA9IFZlcnRleEluZGljZXM7XG5cbmV4cG9ydCB0eXBlIFZhbGlkYXRlUmVzdWx0ID0gUmVzdWx0PFRvcG9sb2dpY2FsT3JkZXI+O1xuXG4vKiogVmFsaWRhdGVzIGEgRGlyZWN0ZWRHcmFwaCBpcyBhIHZhbGlkIENoYXJ0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQ2hhcnQoZzogRGlyZWN0ZWRHcmFwaCk6IFZhbGlkYXRlUmVzdWx0IHtcbiAgaWYgKGcuVmVydGljZXMubGVuZ3RoIDwgMikge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIFwiQ2hhcnQgbXVzdCBjb250YWluIGF0IGxlYXN0IHR3byBub2RlLCB0aGUgc3RhcnQgYW5kIGZpbmlzaCB0YXNrcy5cIlxuICAgICk7XG4gIH1cblxuICBjb25zdCBlZGdlc0J5RHN0ID0gZWRnZXNCeURzdFRvTWFwKGcuRWRnZXMpO1xuICBjb25zdCBlZGdlc0J5U3JjID0gZWRnZXNCeVNyY1RvTWFwKGcuRWRnZXMpO1xuXG4gIC8vIFRoZSBmaXJzdCBWZXJ0ZXgsIFRfMCBha2EgdGhlIFN0YXJ0IE1pbGVzdG9uZSwgbXVzdCBoYXZlIDAgaW5jb21pbmcgZWRnZXMuXG4gIGlmIChlZGdlc0J5RHN0LmdldCgwKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGVycm9yKFwiVGhlIHN0YXJ0IG5vZGUgKDApIGhhcyBhbiBpbmNvbWluZyBlZGdlLlwiKTtcbiAgfVxuXG4gIC8vIEFuZCBvbmx5IFRfMCBzaG91bGQgaGF2ZSAwIGluY29taW5nIGVkZ2VzLlxuICBmb3IgKGxldCBpID0gMTsgaSA8IGcuVmVydGljZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZWRnZXNCeURzdC5nZXQoaSkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgRm91bmQgbm9kZSB0aGF0IGlzbid0ICgwKSB0aGF0IGhhcyBubyBpbmNvbWluZyBlZGdlczogJHtpfWBcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLy8gVGhlIGxhc3QgVmVydGV4LCBUX2ZpbmlzaCwgdGhlIEZpbmlzaCBNaWxlc3RvbmUsIG11c3QgaGF2ZSAwIG91dGdvaW5nIGVkZ2VzLlxuICBpZiAoZWRnZXNCeVNyYy5nZXQoZy5WZXJ0aWNlcy5sZW5ndGggLSAxKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGVycm9yKFxuICAgICAgXCJUaGUgbGFzdCBub2RlLCB3aGljaCBzaG91bGQgYmUgdGhlIEZpbmlzaCBNaWxlc3RvbmUsIGhhcyBhbiBvdXRnb2luZyBlZGdlLlwiXG4gICAgKTtcbiAgfVxuXG4gIC8vIEFuZCBvbmx5IFRfZmluaXNoIHNob3VsZCBoYXZlIDAgb3V0Z29pbmcgZWRnZXMuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZy5WZXJ0aWNlcy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICBpZiAoZWRnZXNCeVNyYy5nZXQoaSkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgRm91bmQgbm9kZSB0aGF0IGlzbid0IFRfZmluaXNoIHRoYXQgaGFzIG5vIG91dGdvaW5nIGVkZ2VzOiAke2l9YFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBudW1WZXJ0aWNlcyA9IGcuVmVydGljZXMubGVuZ3RoO1xuICAvLyBBbmQgYWxsIGVkZ2VzIG1ha2Ugc2Vuc2UsIGkuZS4gdGhleSBhbGwgcG9pbnQgdG8gdmVydGV4ZXMgdGhhdCBleGlzdC5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBnLkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IGcuRWRnZXNbaV07XG4gICAgaWYgKFxuICAgICAgZWxlbWVudC5pIDwgMCB8fFxuICAgICAgZWxlbWVudC5pID49IG51bVZlcnRpY2VzIHx8XG4gICAgICBlbGVtZW50LmogPCAwIHx8XG4gICAgICBlbGVtZW50LmogPj0gbnVtVmVydGljZXNcbiAgICApIHtcbiAgICAgIHJldHVybiBlcnJvcihgRWRnZSAke2VsZW1lbnR9IHBvaW50cyB0byBhIG5vbi1leGlzdGVudCBWZXJ0ZXguYCk7XG4gICAgfVxuICB9XG5cbiAgLy8gTm93IHdlIGNvbmZpcm0gdGhhdCB3ZSBoYXZlIGEgRGlyZWN0ZWQgQWN5Y2xpYyBHcmFwaCwgaS5lLiB0aGUgZ3JhcGggaGFzIG5vXG4gIC8vIGN5Y2xlcyBieSBjcmVhdGluZyBhIHRvcG9sb2dpY2FsIHNvcnQgc3RhcnRpbmcgYXQgVF8wXG4gIC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1RvcG9sb2dpY2FsX3NvcnRpbmcjRGVwdGgtZmlyc3Rfc2VhcmNoXG4gIGNvbnN0IHRzUmV0ID0gdG9wb2xvZ2ljYWxTb3J0KGcpO1xuICBpZiAodHNSZXQuaGFzQ3ljbGVzKSB7XG4gICAgcmV0dXJuIGVycm9yKGBDaGFydCBoYXMgY3ljbGU6ICR7Wy4uLnRzUmV0LmN5Y2xlXS5qb2luKFwiLCBcIil9YCk7XG4gIH1cblxuICByZXR1cm4gb2sodHNSZXQub3JkZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQ2hhcnRWYWxpZGF0ZShjOiBDaGFydCk6IFZhbGlkYXRlUmVzdWx0IHtcbiAgY29uc3QgcmV0ID0gdmFsaWRhdGVDaGFydChjKTtcbiAgaWYgKCFyZXQub2spIHtcbiAgICByZXR1cm4gcmV0O1xuICB9XG4gIGlmIChjLlZlcnRpY2VzWzBdLmR1cmF0aW9uICE9PSAwKSB7XG4gICAgcmV0dXJuIGVycm9yKFxuICAgICAgYFN0YXJ0IE1pbGVzdG9uZSBtdXN0IGhhdmUgZHVyYXRpb24gb2YgMCwgaW5zdGVhZCBnb3QgJHtjLlZlcnRpY2VzWzBdLmR1cmF0aW9ufWBcbiAgICApO1xuICB9XG4gIGlmIChjLlZlcnRpY2VzW2MuVmVydGljZXMubGVuZ3RoIC0gMV0uZHVyYXRpb24gIT09IDApIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBgRmluaXNoIE1pbGVzdG9uZSBtdXN0IGhhdmUgZHVyYXRpb24gb2YgMCwgaW5zdGVhZCBnb3QgJHtcbiAgICAgICAgYy5WZXJ0aWNlc1tjLlZlcnRpY2VzLmxlbmd0aCAtIDFdLmR1cmF0aW9uXG4gICAgICB9YFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cbiIsICJpbXBvcnQgeyBSb3VuZGVyIH0gZnJvbSBcIi4uL3R5cGVzL3R5cGVzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJlY2lzaW9uU2VyaWFsaXplZCB7XG4gIHByZWNpc2lvbjogbnVtYmVyO1xufVxuZXhwb3J0IGNsYXNzIFByZWNpc2lvbiB7XG4gIHByaXZhdGUgbXVsdGlwbGllcjogbnVtYmVyO1xuICBwcml2YXRlIF9wcmVjaXNpb246IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihwcmVjaXNpb246IG51bWJlciA9IDApIHtcbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShwcmVjaXNpb24pKSB7XG4gICAgICBwcmVjaXNpb24gPSAwO1xuICAgIH1cbiAgICB0aGlzLl9wcmVjaXNpb24gPSBNYXRoLmFicyhNYXRoLnRydW5jKHByZWNpc2lvbikpO1xuICAgIHRoaXMubXVsdGlwbGllciA9IDEwICoqIHRoaXMuX3ByZWNpc2lvbjtcbiAgfVxuXG4gIHJvdW5kKHg6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIE1hdGgudHJ1bmMoeCAqIHRoaXMubXVsdGlwbGllcikgLyB0aGlzLm11bHRpcGxpZXI7XG4gIH1cblxuICByb3VuZGVyKCk6IFJvdW5kZXIge1xuICAgIHJldHVybiAoeDogbnVtYmVyKTogbnVtYmVyID0+IHRoaXMucm91bmQoeCk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHByZWNpc2lvbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9wcmVjaXNpb247XG4gIH1cblxuICB0b0pTT04oKTogUHJlY2lzaW9uU2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByZWNpc2lvbjogdGhpcy5fcHJlY2lzaW9uLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgRnJvbUpTT04oczogUHJlY2lzaW9uU2VyaWFsaXplZCB8IHVuZGVmaW5lZCk6IFByZWNpc2lvbiB7XG4gICAgaWYgKHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG5ldyBQcmVjaXNpb24oKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcmVjaXNpb24ocy5wcmVjaXNpb24pO1xuICB9XG59XG4iLCAiLy8gVXRpbGl0aWVzIGZvciBkZWFsaW5nIHdpdGggYSByYW5nZSBvZiBudW1iZXJzLlxuXG5leHBvcnQgaW50ZXJmYWNlIE1ldHJpY1JhbmdlU2VyaWFsaXplZCB7XG4gIG1pbjogbnVtYmVyO1xuICBtYXg6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNvbnN0IGNsYW1wID0gKHg6IG51bWJlciwgbWluOiBudW1iZXIsIG1heDogbnVtYmVyKTogbnVtYmVyID0+IHtcbiAgaWYgKHggPiBtYXgpIHtcbiAgICByZXR1cm4gbWF4O1xuICB9XG4gIGlmICh4IDwgbWluKSB7XG4gICAgcmV0dXJuIG1pbjtcbiAgfVxuICByZXR1cm4geDtcbn07XG5cbi8vIFJhbmdlIGRlZmluZXMgYSByYW5nZSBvZiBudW1iZXJzLCBmcm9tIFttaW4sIG1heF0gaW5jbHVzaXZlLlxuZXhwb3J0IGNsYXNzIE1ldHJpY1JhbmdlIHtcbiAgcHJpdmF0ZSBfbWluOiBudW1iZXIgPSAtTnVtYmVyLk1BWF9WQUxVRTtcbiAgcHJpdmF0ZSBfbWF4OiBudW1iZXIgPSBOdW1iZXIuTUFYX1ZBTFVFO1xuXG4gIGNvbnN0cnVjdG9yKG1pbjogbnVtYmVyID0gLU51bWJlci5NQVhfVkFMVUUsIG1heDogbnVtYmVyID0gTnVtYmVyLk1BWF9WQUxVRSkge1xuICAgIGlmIChtYXggPCBtaW4pIHtcbiAgICAgIFttaW4sIG1heF0gPSBbbWF4LCBtaW5dO1xuICAgIH1cbiAgICB0aGlzLl9taW4gPSBtaW47XG4gICAgdGhpcy5fbWF4ID0gbWF4O1xuICB9XG5cbiAgY2xhbXAodmFsdWU6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIGNsYW1wKHZhbHVlLCB0aGlzLl9taW4sIHRoaXMuX21heCk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1pbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9taW47XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1heCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9tYXg7XG4gIH1cblxuICB0b0pTT04oKTogTWV0cmljUmFuZ2VTZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgbWluOiB0aGlzLl9taW4sXG4gICAgICBtYXg6IHRoaXMuX21heCxcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIEZyb21KU09OKHM6IE1ldHJpY1JhbmdlU2VyaWFsaXplZCB8IHVuZGVmaW5lZCk6IE1ldHJpY1JhbmdlIHtcbiAgICBpZiAocyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbmV3IE1ldHJpY1JhbmdlKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgTWV0cmljUmFuZ2Uocy5taW4sIHMubWF4KTtcbiAgfVxufVxuIiwgIi8vIE1ldHJpY3MgZGVmaW5lIGZsb2F0aW5nIHBvaW50IHZhbHVlcyB0aGF0IGFyZSB0cmFja2VkIHBlciBUYXNrLlxuXG5pbXBvcnQgeyBQcmVjaXNpb24sIFByZWNpc2lvblNlcmlhbGl6ZWQgfSBmcm9tIFwiLi4vcHJlY2lzaW9uL3ByZWNpc2lvbi50c1wiO1xuaW1wb3J0IHsgY2xhbXAsIE1ldHJpY1JhbmdlLCBNZXRyaWNSYW5nZVNlcmlhbGl6ZWQgfSBmcm9tIFwiLi9yYW5nZS50c1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIE1ldHJpY0RlZmluaXRpb25TZXJpYWxpemVkIHtcbiAgcmFuZ2U6IE1ldHJpY1JhbmdlU2VyaWFsaXplZDtcbiAgZGVmYXVsdDogbnVtYmVyO1xuICBwcmVjaXNpb246IFByZWNpc2lvblNlcmlhbGl6ZWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBNZXRyaWNEZWZpbml0aW9uIHtcbiAgcmFuZ2U6IE1ldHJpY1JhbmdlO1xuICBkZWZhdWx0OiBudW1iZXI7XG4gIGlzU3RhdGljOiBib29sZWFuO1xuICBwcmVjaXNpb246IFByZWNpc2lvbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBkZWZhdWx0VmFsdWU6IG51bWJlcixcbiAgICByYW5nZTogTWV0cmljUmFuZ2UgPSBuZXcgTWV0cmljUmFuZ2UoKSxcbiAgICBpc1N0YXRpYzogYm9vbGVhbiA9IGZhbHNlLFxuICAgIHByZWNpc2lvbjogUHJlY2lzaW9uID0gbmV3IFByZWNpc2lvbigxKVxuICApIHtcbiAgICB0aGlzLnJhbmdlID0gcmFuZ2U7XG4gICAgdGhpcy5kZWZhdWx0ID0gY2xhbXAoZGVmYXVsdFZhbHVlLCByYW5nZS5taW4sIHJhbmdlLm1heCk7XG4gICAgdGhpcy5pc1N0YXRpYyA9IGlzU3RhdGljO1xuICAgIHRoaXMucHJlY2lzaW9uID0gcHJlY2lzaW9uO1xuICB9XG5cbiAgdG9KU09OKCk6IE1ldHJpY0RlZmluaXRpb25TZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmFuZ2U6IHRoaXMucmFuZ2UudG9KU09OKCksXG4gICAgICBkZWZhdWx0OiB0aGlzLmRlZmF1bHQsXG4gICAgICBwcmVjaXNpb246IHRoaXMucHJlY2lzaW9uLnRvSlNPTigpLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgRnJvbUpTT04oczogTWV0cmljRGVmaW5pdGlvblNlcmlhbGl6ZWQgfCB1bmRlZmluZWQpOiBNZXRyaWNEZWZpbml0aW9uIHtcbiAgICBpZiAocyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbmV3IE1ldHJpY0RlZmluaXRpb24oMCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgTWV0cmljRGVmaW5pdGlvbihcbiAgICAgIHMuZGVmYXVsdCB8fCAwLFxuICAgICAgTWV0cmljUmFuZ2UuRnJvbUpTT04ocy5yYW5nZSksXG4gICAgICBmYWxzZSxcbiAgICAgIFByZWNpc2lvbi5Gcm9tSlNPTihzLnByZWNpc2lvbilcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIE1ldHJpY0RlZmluaXRpb25zID0geyBba2V5OiBzdHJpbmddOiBNZXRyaWNEZWZpbml0aW9uIH07XG5cbmV4cG9ydCB0eXBlIE1ldHJpY0RlZmluaXRpb25zU2VyaWFsaXplZCA9IHtcbiAgW2tleTogc3RyaW5nXTogTWV0cmljRGVmaW5pdGlvblNlcmlhbGl6ZWQ7XG59O1xuXG5leHBvcnQgdHlwZSBNZXRyaWNWYWx1ZXMgPSB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9O1xuIiwgIi8qKlxuICogVHJpYW5ndWxhciBpcyB0aGUgaW52ZXJzZSBDdW11bGF0aXZlIERlbnNpdHkgRnVuY3Rpb24gKENERikgZm9yIHRoZVxuICogdHJpYW5ndWxhciBkaXN0cmlidXRpb24uXG4gKlxuICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVHJpYW5ndWxhcl9kaXN0cmlidXRpb24jR2VuZXJhdGluZ19yYW5kb21fdmFyaWF0ZXNcbiAqXG4gKiBUaGUgaW52ZXJzZSBvZiB0aGUgQ0RGIGlzIHVzZWZ1bCBmb3IgZ2VuZXJhdGluZyBzYW1wbGVzIGZyb20gdGhlXG4gKiBkaXN0cmlidXRpb24sIGkuZS4gcGFzc2luZyBpbiB2YWx1ZXMgZnJvbSB0aGUgdW5pZm9ybSBkaXN0cmlidXRpb24gWzAsIDFdXG4gKiB3aWxsIHByb2R1Y2Ugc2FtcGxlIHRoYXQgbG9vayBsaWtlIHRoZXkgY29tZSBmcm9tIHRoZSB0cmlhbmd1bGFyXG4gKiBkaXN0cmlidXRpb24uXG4gKlxuICpcbiAqL1xuXG5leHBvcnQgY2xhc3MgVHJpYW5ndWxhciB7XG4gIHByaXZhdGUgYTogbnVtYmVyO1xuICBwcml2YXRlIGI6IG51bWJlcjtcbiAgcHJpdmF0ZSBjOiBudW1iZXI7XG4gIHByaXZhdGUgRl9jOiBudW1iZXI7XG5cbiAgLyoqICBUaGUgdHJpYW5ndWxhciBkaXN0cmlidXRpb24gaXMgYSBjb250aW51b3VzIHByb2JhYmlsaXR5IGRpc3RyaWJ1dGlvbiB3aXRoXG4gIGxvd2VyIGxpbWl0IGBhYCwgdXBwZXIgbGltaXQgYGJgLCBhbmQgbW9kZSBgY2AsIHdoZXJlIGEgPCBiIGFuZCBhIFx1MjI2NCBjIFx1MjI2NCBiLiAqL1xuICBjb25zdHJ1Y3RvcihhOiBudW1iZXIsIGI6IG51bWJlciwgYzogbnVtYmVyKSB7XG4gICAgdGhpcy5hID0gYTtcbiAgICB0aGlzLmIgPSBiO1xuICAgIHRoaXMuYyA9IGM7XG5cbiAgICAvLyBGX2MgaXMgdGhlIGN1dG9mZiBpbiB0aGUgZG9tYWluIHdoZXJlIHdlIHN3aXRjaCBiZXR3ZWVuIHRoZSB0d28gaGFsdmVzIG9mXG4gICAgLy8gdGhlIHRyaWFuZ2xlLlxuICAgIHRoaXMuRl9jID0gKGMgLSBhKSAvIChiIC0gYSk7XG4gIH1cblxuICAvKiogIFByb2R1Y2UgYSBzYW1wbGUgZnJvbSB0aGUgdHJpYW5ndWxhciBkaXN0cmlidXRpb24uIFRoZSB2YWx1ZSBvZiAncCdcbiAgIHNob3VsZCBiZSBpbiBbMCwgMS4wXS4gKi9cbiAgc2FtcGxlKHA6IG51bWJlcik6IG51bWJlciB7XG4gICAgaWYgKHAgPCAwKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9IGVsc2UgaWYgKHAgPiAxLjApIHtcbiAgICAgIHJldHVybiAxLjA7XG4gICAgfSBlbHNlIGlmIChwIDwgdGhpcy5GX2MpIHtcbiAgICAgIHJldHVybiB0aGlzLmEgKyBNYXRoLnNxcnQocCAqICh0aGlzLmIgLSB0aGlzLmEpICogKHRoaXMuYyAtIHRoaXMuYSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICB0aGlzLmIgLSBNYXRoLnNxcnQoKDEgLSBwKSAqICh0aGlzLmIgLSB0aGlzLmEpICogKHRoaXMuYiAtIHRoaXMuYykpXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuIiwgImltcG9ydCB7IFRyaWFuZ3VsYXIgfSBmcm9tIFwiLi90cmlhbmd1bGFyLnRzXCI7XG5cbmV4cG9ydCB0eXBlIFVuY2VydGFpbnR5ID0gXCJsb3dcIiB8IFwibW9kZXJhdGVcIiB8IFwiaGlnaFwiIHwgXCJleHRyZW1lXCI7XG5cbmV4cG9ydCBjb25zdCBVbmNlcnRhaW50eVRvTnVtOiBSZWNvcmQ8VW5jZXJ0YWludHksIG51bWJlcj4gPSB7XG4gIGxvdzogMS4xLFxuICBtb2RlcmF0ZTogMS41LFxuICBoaWdoOiAyLFxuICBleHRyZW1lOiA1LFxufTtcblxuZXhwb3J0IGNsYXNzIEphY29iaWFuIHtcbiAgcHJpdmF0ZSB0cmlhbmd1bGFyOiBUcmlhbmd1bGFyO1xuICBjb25zdHJ1Y3RvcihleHBlY3RlZDogbnVtYmVyLCB1bmNlcnRhaW50eTogVW5jZXJ0YWludHkpIHtcbiAgICBjb25zdCBtdWwgPSBVbmNlcnRhaW50eVRvTnVtW3VuY2VydGFpbnR5XTtcbiAgICB0aGlzLnRyaWFuZ3VsYXIgPSBuZXcgVHJpYW5ndWxhcihleHBlY3RlZCAvIG11bCwgZXhwZWN0ZWQgKiBtdWwsIGV4cGVjdGVkKTtcbiAgfVxuXG4gIHNhbXBsZShwOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnRyaWFuZ3VsYXIuc2FtcGxlKHApO1xuICB9XG59XG4iLCAiaW1wb3J0IHtcbiAgQ2hhcnQsXG4gIENoYXJ0U2VyaWFsaXplZCxcbiAgVGFzayxcbiAgVGFza1NlcmlhbGl6ZWQsXG4gIHZhbGlkYXRlQ2hhcnQsXG59IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgRGlyZWN0ZWRFZGdlLCBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkIH0gZnJvbSBcIi4uL2RhZy9kYWcudHNcIjtcbmltcG9ydCB7XG4gIE1ldHJpY0RlZmluaXRpb24sXG4gIE1ldHJpY0RlZmluaXRpb25zLFxuICBNZXRyaWNEZWZpbml0aW9uc1NlcmlhbGl6ZWQsXG59IGZyb20gXCIuLi9tZXRyaWNzL21ldHJpY3MudHNcIjtcbmltcG9ydCB7IE1ldHJpY1JhbmdlIH0gZnJvbSBcIi4uL21ldHJpY3MvcmFuZ2UudHNcIjtcbmltcG9ydCB7IFJhdGlvbmFsaXplRWRnZXNPcCB9IGZyb20gXCIuLi9vcHMvY2hhcnQudHNcIjtcbmltcG9ydCB7XG4gIFJlc291cmNlRGVmaW5pdGlvbixcbiAgUmVzb3VyY2VEZWZpbml0aW9ucyxcbiAgUmVzb3VyY2VEZWZpbml0aW9uc1NlcmlhbGl6ZWQsXG59IGZyb20gXCIuLi9yZXNvdXJjZXMvcmVzb3VyY2VzLnRzXCI7XG5pbXBvcnQgeyBSZXN1bHQsIG9rIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgVW5jZXJ0YWludHlUb051bSB9IGZyb20gXCIuLi9zdGF0cy9jZGYvdHJpYW5ndWxhci9qYWNvYmlhbi50c1wiO1xuXG5leHBvcnQgdHlwZSBTdGF0aWNNZXRyaWNLZXlzID0gXCJEdXJhdGlvblwiIHwgXCJQZXJjZW50IENvbXBsZXRlXCI7XG5cbmV4cG9ydCBjb25zdCBTdGF0aWNNZXRyaWNEZWZpbml0aW9uczogTWV0cmljRGVmaW5pdGlvbnMgPSB7XG4gIC8vIEhvdyBsb25nIGEgdGFzayB3aWxsIHRha2UsIGluIGRheXMuXG4gIER1cmF0aW9uOiBuZXcgTWV0cmljRGVmaW5pdGlvbigwLCBuZXcgTWV0cmljUmFuZ2UoKSwgdHJ1ZSksXG4gIC8vIFRoZSBwZXJjZW50IGNvbXBsZXRlIGZvciBhIHRhc2suXG4gIFBlcmNlbnQ6IG5ldyBNZXRyaWNEZWZpbml0aW9uKDAsIG5ldyBNZXRyaWNSYW5nZSgwLCAxMDApLCB0cnVlKSxcbn07XG5cbmV4cG9ydCBjb25zdCBTdGF0aWNSZXNvdXJjZURlZmluaXRpb25zOiBSZXNvdXJjZURlZmluaXRpb25zID0ge1xuICBVbmNlcnRhaW50eTogbmV3IFJlc291cmNlRGVmaW5pdGlvbihPYmplY3Qua2V5cyhVbmNlcnRhaW50eVRvTnVtKSwgdHJ1ZSksXG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIFBsYW5TZXJpYWxpemVkIHtcbiAgY2hhcnQ6IENoYXJ0U2VyaWFsaXplZDtcbiAgcmVzb3VyY2VEZWZpbml0aW9uczogUmVzb3VyY2VEZWZpbml0aW9uc1NlcmlhbGl6ZWQ7XG4gIG1ldHJpY0RlZmluaXRpb25zOiBNZXRyaWNEZWZpbml0aW9uc1NlcmlhbGl6ZWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBQbGFuIHtcbiAgY2hhcnQ6IENoYXJ0O1xuXG4gIHJlc291cmNlRGVmaW5pdGlvbnM6IFJlc291cmNlRGVmaW5pdGlvbnM7XG5cbiAgbWV0cmljRGVmaW5pdGlvbnM6IE1ldHJpY0RlZmluaXRpb25zO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY2hhcnQgPSBuZXcgQ2hhcnQoKTtcblxuICAgIHRoaXMucmVzb3VyY2VEZWZpbml0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIFN0YXRpY1Jlc291cmNlRGVmaW5pdGlvbnMpO1xuICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBTdGF0aWNNZXRyaWNEZWZpbml0aW9ucyk7XG4gICAgdGhpcy5hcHBseU1ldHJpY3NBbmRSZXNvdXJjZXNUb1ZlcnRpY2VzKCk7XG4gIH1cblxuICBhcHBseU1ldHJpY3NBbmRSZXNvdXJjZXNUb1ZlcnRpY2VzKCkge1xuICAgIE9iamVjdC5rZXlzKHRoaXMubWV0cmljRGVmaW5pdGlvbnMpLmZvckVhY2goKG1ldHJpY05hbWU6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgbWQgPSB0aGlzLm1ldHJpY0RlZmluaXRpb25zW21ldHJpY05hbWVdITtcbiAgICAgIHRoaXMuY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaykgPT4ge1xuICAgICAgICB0YXNrLnNldE1ldHJpYyhtZXRyaWNOYW1lLCBtZC5kZWZhdWx0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIE9iamVjdC5lbnRyaWVzKHRoaXMucmVzb3VyY2VEZWZpbml0aW9ucykuZm9yRWFjaChcbiAgICAgIChba2V5LCByZXNvdXJjZURlZmluaXRpb25dKSA9PiB7XG4gICAgICAgIHRoaXMuY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaykgPT4ge1xuICAgICAgICAgIHRhc2suc2V0UmVzb3VyY2Uoa2V5LCByZXNvdXJjZURlZmluaXRpb24udmFsdWVzWzBdKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIHRvSlNPTigpOiBQbGFuU2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNoYXJ0OiB0aGlzLmNoYXJ0LnRvSlNPTigpLFxuICAgICAgcmVzb3VyY2VEZWZpbml0aW9uczogT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICBPYmplY3QuZW50cmllcyh0aGlzLnJlc291cmNlRGVmaW5pdGlvbnMpLmZpbHRlcihcbiAgICAgICAgICAoW2tleSwgcmVzb3VyY2VEZWZpbml0aW9uXSkgPT4gIXJlc291cmNlRGVmaW5pdGlvbi5pc1N0YXRpY1xuICAgICAgICApXG4gICAgICApLFxuICAgICAgbWV0cmljRGVmaW5pdGlvbnM6IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgT2JqZWN0LmVudHJpZXModGhpcy5tZXRyaWNEZWZpbml0aW9ucylcbiAgICAgICAgICAuZmlsdGVyKChba2V5LCBtZXRyaWNEZWZpbml0aW9uXSkgPT4gIW1ldHJpY0RlZmluaXRpb24uaXNTdGF0aWMpXG4gICAgICAgICAgLm1hcCgoW2tleSwgbWV0cmljRGVmaW5pdGlvbl0pID0+IFtrZXksIG1ldHJpY0RlZmluaXRpb24udG9KU09OKCldKVxuICAgICAgKSxcbiAgICB9O1xuICB9XG5cbiAgZ2V0TWV0cmljRGVmaW5pdGlvbihrZXk6IHN0cmluZyk6IE1ldHJpY0RlZmluaXRpb24gfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLm1ldHJpY0RlZmluaXRpb25zW2tleV07XG4gIH1cblxuICBzZXRNZXRyaWNEZWZpbml0aW9uKGtleTogc3RyaW5nLCBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uKSB7XG4gICAgdGhpcy5tZXRyaWNEZWZpbml0aW9uc1trZXldID0gbWV0cmljRGVmaW5pdGlvbjtcbiAgfVxuXG4gIGRlbGV0ZU1ldHJpY0RlZmluaXRpb24oa2V5OiBzdHJpbmcpIHtcbiAgICBkZWxldGUgdGhpcy5tZXRyaWNEZWZpbml0aW9uc1trZXldO1xuICB9XG5cbiAgZ2V0UmVzb3VyY2VEZWZpbml0aW9uKGtleTogc3RyaW5nKTogUmVzb3VyY2VEZWZpbml0aW9uIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5yZXNvdXJjZURlZmluaXRpb25zW2tleV07XG4gIH1cblxuICBzZXRSZXNvdXJjZURlZmluaXRpb24oa2V5OiBzdHJpbmcsIHZhbHVlOiBSZXNvdXJjZURlZmluaXRpb24pIHtcbiAgICB0aGlzLnJlc291cmNlRGVmaW5pdGlvbnNba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgZGVsZXRlUmVzb3VyY2VEZWZpbml0aW9uKGtleTogc3RyaW5nKSB7XG4gICAgZGVsZXRlIHRoaXMucmVzb3VyY2VEZWZpbml0aW9uc1trZXldO1xuICB9XG5cbiAgLy8gUmV0dXJucyBhIG5ldyBUYXNrIHdpdGggZGVmYXVsdHMgZm9yIGFsbCBtZXRyaWNzIGFuZCByZXNvdXJjZXMuXG4gIG5ld1Rhc2soKTogVGFzayB7XG4gICAgY29uc3QgcmV0ID0gbmV3IFRhc2soKTtcbiAgICBPYmplY3Qua2V5cyh0aGlzLm1ldHJpY0RlZmluaXRpb25zKS5mb3JFYWNoKChtZXRyaWNOYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnN0IG1kID0gdGhpcy5nZXRNZXRyaWNEZWZpbml0aW9uKG1ldHJpY05hbWUpITtcblxuICAgICAgcmV0LnNldE1ldHJpYyhtZXRyaWNOYW1lLCBtZC5kZWZhdWx0KTtcbiAgICB9KTtcbiAgICBPYmplY3QuZW50cmllcyh0aGlzLnJlc291cmNlRGVmaW5pdGlvbnMpLmZvckVhY2goXG4gICAgICAoW2tleSwgcmVzb3VyY2VEZWZpbml0aW9uXSkgPT4ge1xuICAgICAgICByZXQuc2V0UmVzb3VyY2Uoa2V5LCByZXNvdXJjZURlZmluaXRpb24udmFsdWVzWzBdKTtcbiAgICAgIH1cbiAgICApO1xuICAgIHJldHVybiByZXQ7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IEZyb21KU09OID0gKHRleHQ6IHN0cmluZyk6IFJlc3VsdDxQbGFuPiA9PiB7XG4gIGNvbnN0IHBsYW5TZXJpYWxpemVkOiBQbGFuU2VyaWFsaXplZCA9IEpTT04ucGFyc2UodGV4dCk7XG4gIGNvbnN0IHBsYW4gPSBuZXcgUGxhbigpO1xuXG4gIHBsYW4uY2hhcnQuVmVydGljZXMgPSBwbGFuU2VyaWFsaXplZC5jaGFydC52ZXJ0aWNlcy5tYXAoXG4gICAgKHRhc2tTZXJpYWxpemVkOiBUYXNrU2VyaWFsaXplZCk6IFRhc2sgPT4ge1xuICAgICAgY29uc3QgdGFzayA9IG5ldyBUYXNrKHRhc2tTZXJpYWxpemVkLm5hbWUpO1xuICAgICAgdGFzay5zdGF0ZSA9IHRhc2tTZXJpYWxpemVkLnN0YXRlO1xuICAgICAgdGFzay5tZXRyaWNzID0gdGFza1NlcmlhbGl6ZWQubWV0cmljcztcbiAgICAgIHRhc2sucmVzb3VyY2VzID0gdGFza1NlcmlhbGl6ZWQucmVzb3VyY2VzO1xuXG4gICAgICByZXR1cm4gdGFzaztcbiAgICB9XG4gICk7XG4gIHBsYW4uY2hhcnQuRWRnZXMgPSBwbGFuU2VyaWFsaXplZC5jaGFydC5lZGdlcy5tYXAoXG4gICAgKGRpcmVjdGVkRWRnZVNlcmlhbGl6ZWQ6IERpcmVjdGVkRWRnZVNlcmlhbGl6ZWQpOiBEaXJlY3RlZEVkZ2UgPT5cbiAgICAgIG5ldyBEaXJlY3RlZEVkZ2UoZGlyZWN0ZWRFZGdlU2VyaWFsaXplZC5pLCBkaXJlY3RlZEVkZ2VTZXJpYWxpemVkLmopXG4gICk7XG5cbiAgY29uc3QgZGVzZXJpYWxpemVkTWV0cmljRGVmaW5pdGlvbnMgPSBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgT2JqZWN0LmVudHJpZXMocGxhblNlcmlhbGl6ZWQubWV0cmljRGVmaW5pdGlvbnMpLm1hcChcbiAgICAgIChba2V5LCBzZXJpYWxpemVkTWV0cmljRGVmaW5pdGlvbl0pID0+IFtcbiAgICAgICAga2V5LFxuICAgICAgICBNZXRyaWNEZWZpbml0aW9uLkZyb21KU09OKHNlcmlhbGl6ZWRNZXRyaWNEZWZpbml0aW9uKSxcbiAgICAgIF1cbiAgICApXG4gICk7XG5cbiAgcGxhbi5tZXRyaWNEZWZpbml0aW9ucyA9IE9iamVjdC5hc3NpZ24oXG4gICAge30sXG4gICAgU3RhdGljTWV0cmljRGVmaW5pdGlvbnMsXG4gICAgZGVzZXJpYWxpemVkTWV0cmljRGVmaW5pdGlvbnNcbiAgKTtcblxuICBjb25zdCBkZXNlcmlhbGl6ZWRSZXNvdXJjZURlZmluaXRpb25zID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgIE9iamVjdC5lbnRyaWVzKHBsYW5TZXJpYWxpemVkLnJlc291cmNlRGVmaW5pdGlvbnMpLm1hcChcbiAgICAgIChba2V5LCBzZXJpYWxpemVkUmVzb3VyY2VEZWZpbml0aW9uXSkgPT4gW1xuICAgICAgICBrZXksXG4gICAgICAgIFJlc291cmNlRGVmaW5pdGlvbi5Gcm9tSlNPTihzZXJpYWxpemVkUmVzb3VyY2VEZWZpbml0aW9uKSxcbiAgICAgIF1cbiAgICApXG4gICk7XG5cbiAgcGxhbi5yZXNvdXJjZURlZmluaXRpb25zID0gT2JqZWN0LmFzc2lnbihcbiAgICB7fSxcbiAgICBTdGF0aWNSZXNvdXJjZURlZmluaXRpb25zLFxuICAgIGRlc2VyaWFsaXplZFJlc291cmNlRGVmaW5pdGlvbnNcbiAgKTtcblxuICBjb25zdCByZXQgPSBSYXRpb25hbGl6ZUVkZ2VzT3AoKS5hcHBseShwbGFuKTtcbiAgaWYgKCFyZXQub2spIHtcbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgY29uc3QgcmV0VmFsID0gdmFsaWRhdGVDaGFydChwbGFuLmNoYXJ0KTtcbiAgaWYgKCFyZXRWYWwub2spIHtcbiAgICByZXR1cm4gcmV0VmFsO1xuICB9XG4gIHJldHVybiBvayhwbGFuKTtcbn07XG4iLCAiLyoqIEEgY29vcmRpbmF0ZSBwb2ludCBvbiB0aGUgcmVuZGVyaW5nIHN1cmZhY2UuICovXG5leHBvcnQgY2xhc3MgUG9pbnQge1xuICB4OiBudW1iZXI7XG4gIHk6IG51bWJlcjtcblxuICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgfVxuXG4gIGFkZCh4OiBudW1iZXIsIHk6IG51bWJlcik6IFBvaW50IHtcbiAgICB0aGlzLnggKz0geDtcbiAgICB0aGlzLnkgKz0geTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHN1bShyaHM6IFBvaW50KTogUG9pbnQge1xuICAgIHJldHVybiBuZXcgUG9pbnQodGhpcy54ICsgcmhzLngsIHRoaXMueSArIHJocy55KTtcbiAgfVxuXG4gIGVxdWFsKHJoczogUG9pbnQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy54ID09PSByaHMueCAmJiB0aGlzLnkgPT09IHJocy55O1xuICB9XG5cbiAgc2V0KHJoczogUG9pbnQpOiBQb2ludCB7XG4gICAgdGhpcy54ID0gcmhzLng7XG4gICAgdGhpcy55ID0gcmhzLnk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBkdXAoKTogUG9pbnQge1xuICAgIHJldHVybiBuZXcgUG9pbnQodGhpcy54LCB0aGlzLnkpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgUG9pbnQgfSBmcm9tIFwiLi4vc2NhbGUvcG9pbnQudHNcIjtcblxuLy8gVmFsdWVzIGFyZSByZXR1cm5lZCBhcyBwZXJjZW50YWdlcy5cbmV4cG9ydCBpbnRlcmZhY2UgRGl2aWRlck1vdmVSZXN1bHQge1xuICBiZWZvcmU6IG51bWJlcjtcbiAgYWZ0ZXI6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNvbnN0IERJVklERVJfTU9WRV9FVkVOVCA9IFwiZGl2aWRlcl9tb3ZlXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVjdCB7XG4gIHRvcDogbnVtYmVyO1xuICBsZWZ0OiBudW1iZXI7XG4gIHdpZHRoOiBudW1iZXI7XG4gIGhlaWdodDogbnVtYmVyO1xufVxuXG5leHBvcnQgY29uc3QgZ2V0UGFnZVJlY3QgPSAoZWxlOiBIVE1MRWxlbWVudCk6IFJlY3QgPT4ge1xuICBjb25zdCB2aWV3cG9ydFJlY3QgPSBlbGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHJldHVybiB7XG4gICAgdG9wOiB2aWV3cG9ydFJlY3QudG9wICsgd2luZG93LnNjcm9sbFksXG4gICAgbGVmdDogdmlld3BvcnRSZWN0LmxlZnQgKyB3aW5kb3cuc2Nyb2xsWCxcbiAgICB3aWR0aDogdmlld3BvcnRSZWN0LndpZHRoLFxuICAgIGhlaWdodDogdmlld3BvcnRSZWN0LmhlaWdodCxcbiAgfTtcbn07XG5cbi8qKiBNb3VzZU1vdmUgd2F0Y2hlcyBtb3VzZSBldmVudHMgZm9yIGEgZ2l2ZW4gSFRNTEVsZW1lbnQgYW5kIGVtaXRzXG4gKiBldmVudHMgYXJvdW5kIGRyYWdnaW5nLlxuICpcbiAqIFRoZSBlbWl0dGVkIGV2ZW50IGlzIFwiZHJhZ3JhbmdlXCIgYW5kIGlzIGEgQ3VzdG9tRXZlbnQ8RHJhZ1JhbmdlPi5cbiAqXG4gKiBPbmNlIHRoZSBtb3VzZSBpcyBwcmVzc2VkIGRvd24gaW4gdGhlIEhUTUxFbGVtZW50IGFuIGV2ZW50IHdpbGwgYmVcbiAqIGVtaXR0ZWQgcGVyaW9kaWNhbGx5IGFzIHRoZSBtb3VzZSBtb3Zlcy5cbiAqXG4gKiBPbmNlIHRoZSBtb3VzZSBpcyByZWxlYXNlZCwgb3IgZXhpdHMgdGhlIEhUTUxFbGVtZW50IG9uZSBsYXN0IGV2ZW50XG4gKiBpcyBlbWl0dGVkLlxuICovXG5leHBvcnQgY2xhc3MgRGl2aWRlck1vdmUge1xuICBiZWdpbjogUG9pbnQgfCBudWxsID0gbnVsbDtcbiAgcGFyZW50UmVjdDogUmVjdCB8IG51bGwgPSBudWxsO1xuICBjdXJyZW50TW92ZUxvY2F0aW9uOiBQb2ludCA9IG5ldyBQb2ludCgwLCAwKTtcbiAgbGFzdE1vdmVTZW50OiBQb2ludCA9IG5ldyBQb2ludCgwLCAwKTtcbiAgcGFyZW50OiBIVE1MRWxlbWVudDtcbiAgZGl2aWRlcjogSFRNTEVsZW1lbnQ7XG4gIGludGVybnZhbEhhbmRsZTogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihwYXJlbnQ6IEhUTUxFbGVtZW50LCBkaXZpZGVyOiBIVE1MRWxlbWVudCkge1xuICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICAgIHRoaXMuZGl2aWRlciA9IGRpdmlkZXI7XG4gICAgdGhpcy5kaXZpZGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZWRvd24uYmluZCh0aGlzKSk7XG4gIH1cblxuICBkZXRhY2goKSB7XG4gICAgdGhpcy5wYXJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmRpdmlkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlZG93bi5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnBhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNldXAuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5wYXJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZWxlYXZlLmJpbmQodGhpcykpO1xuICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuaW50ZXJudmFsSGFuZGxlKTtcbiAgfVxuXG4gIG9uVGltZW91dCgpIHtcbiAgICBpZiAoIXRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi5lcXVhbCh0aGlzLmxhc3RNb3ZlU2VudCkpIHtcbiAgICAgIHRoaXMucGFyZW50LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIC8vIFRPRE8gY2xhbXAgcmVzdWx0cyB0byBbNSwgOTVdJS5cbiAgICAgICAgbmV3IEN1c3RvbUV2ZW50PERpdmlkZXJNb3ZlUmVzdWx0PihESVZJREVSX01PVkVfRVZFTlQsIHtcbiAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgIGJlZm9yZTpcbiAgICAgICAgICAgICAgKDEwMCAqICh0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueCAtIHRoaXMucGFyZW50UmVjdCEubGVmdCkpIC9cbiAgICAgICAgICAgICAgdGhpcy5wYXJlbnRSZWN0IS53aWR0aCxcbiAgICAgICAgICAgIGFmdGVyOlxuICAgICAgICAgICAgICAoMTAwICpcbiAgICAgICAgICAgICAgICAodGhpcy5wYXJlbnRSZWN0IS5sZWZ0ICtcbiAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50UmVjdCEud2lkdGggLVxuICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLngpKSAvXG4gICAgICAgICAgICAgIHRoaXMucGFyZW50UmVjdCEud2lkdGgsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgICB0aGlzLmxhc3RNb3ZlU2VudC5zZXQodGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uKTtcbiAgICB9XG4gIH1cblxuICBtb3VzZW1vdmUoZTogTW91c2VFdmVudCkge1xuICAgIGlmICh0aGlzLmJlZ2luID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi54ID0gZS5wYWdlWDtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueSA9IGUucGFnZVk7XG4gIH1cblxuICBtb3VzZWRvd24oZTogTW91c2VFdmVudCkge1xuICAgIHRoaXMuaW50ZXJudmFsSGFuZGxlID0gd2luZG93LnNldEludGVydmFsKHRoaXMub25UaW1lb3V0LmJpbmQodGhpcyksIDE2KTtcbiAgICB0aGlzLnBhcmVudFJlY3QgPSBnZXRQYWdlUmVjdCh0aGlzLnBhcmVudCk7XG5cbiAgICB0aGlzLnBhcmVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICAgIHRoaXMucGFyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnBhcmVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlbGVhdmUuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmJlZ2luID0gbmV3IFBvaW50KGUucGFnZVgsIGUucGFnZVkpO1xuICB9XG5cbiAgbW91c2V1cChlOiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKHRoaXMuYmVnaW4gPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5maW5pc2hlZChuZXcgUG9pbnQoZS5wYWdlWCwgZS5wYWdlWSkpO1xuICB9XG5cbiAgbW91c2VsZWF2ZShlOiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKHRoaXMuYmVnaW4gPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5maW5pc2hlZChuZXcgUG9pbnQoZS5wYWdlWCwgZS5wYWdlWSkpO1xuICB9XG5cbiAgZmluaXNoZWQoZW5kOiBQb2ludCkge1xuICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuaW50ZXJudmFsSGFuZGxlKTtcblxuICAgIHRoaXMucGFyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5wYXJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZXVwLmJpbmQodGhpcykpO1xuICAgIHRoaXMucGFyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIHRoaXMubW91c2VsZWF2ZS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbiA9IGVuZDtcbiAgICB0aGlzLm9uVGltZW91dCgpO1xuICAgIHRoaXMuYmVnaW4gPSBudWxsO1xuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbiA9IG5ldyBQb2ludCgwLCAwKTtcbiAgICB0aGlzLmxhc3RNb3ZlU2VudCA9IG5ldyBQb2ludCgwLCAwKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IFBvaW50IH0gZnJvbSBcIi4uL3NjYWxlL3BvaW50LnRzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhZ1JhbmdlIHtcbiAgYmVnaW46IFBvaW50O1xuICBlbmQ6IFBvaW50O1xufVxuXG5leHBvcnQgY29uc3QgRFJBR19SQU5HRV9FVkVOVCA9IFwiZHJhZ3JhbmdlXCI7XG5cbi8qKiBNb3VzZU1vdmUgd2F0Y2hlcyBtb3VzZSBldmVudHMgZm9yIGEgZ2l2ZW4gSFRNTEVsZW1lbnQgYW5kIGVtaXRzXG4gKiBldmVudHMgYXJvdW5kIGRyYWdnaW5nLlxuICpcbiAqIFRoZSBlbWl0dGVkIGV2ZW50IGlzIFwiZHJhZ3JhbmdlXCIgYW5kIGlzIGEgQ3VzdG9tRXZlbnQ8RHJhZ1JhbmdlPi5cbiAqXG4gKiBPbmNlIHRoZSBtb3VzZSBpcyBwcmVzc2VkIGRvd24gaW4gdGhlIEhUTUxFbGVtZW50IGFuIGV2ZW50IHdpbGwgYmVcbiAqIGVtaXR0ZWQgcGVyaW9kaWNhbGx5IGFzIHRoZSBtb3VzZSBtb3Zlcy5cbiAqXG4gKiBPbmNlIHRoZSBtb3VzZSBpcyByZWxlYXNlZCwgb3IgZXhpdHMgdGhlIEhUTUxFbGVtZW50IG9uZSBsYXN0IGV2ZW50XG4gKiBpcyBlbWl0dGVkLlxuICovXG5leHBvcnQgY2xhc3MgTW91c2VNb3ZlIHtcbiAgYmVnaW46IFBvaW50IHwgbnVsbCA9IG51bGw7XG4gIGN1cnJlbnRNb3ZlTG9jYXRpb246IFBvaW50ID0gbmV3IFBvaW50KDAsIDApO1xuICBsYXN0TW92ZVNlbnQ6IFBvaW50ID0gbmV3IFBvaW50KDAsIDApO1xuICBlbGU6IEhUTUxFbGVtZW50O1xuICBpbnRlcm52YWxIYW5kbGU6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoZWxlOiBIVE1MRWxlbWVudCkge1xuICAgIHRoaXMuZWxlID0gZWxlO1xuICAgIGVsZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICAgIGVsZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2Vkb3duLmJpbmQodGhpcykpO1xuICAgIGVsZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNldXAuYmluZCh0aGlzKSk7XG4gICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIHRoaXMubW91c2VsZWF2ZS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIGRldGFjaCgpIHtcbiAgICB0aGlzLmVsZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICAgIHRoaXMuZWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZWRvd24uYmluZCh0aGlzKSk7XG4gICAgdGhpcy5lbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZXVwLmJpbmQodGhpcykpO1xuICAgIHRoaXMuZWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIHRoaXMubW91c2VsZWF2ZS5iaW5kKHRoaXMpKTtcbiAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmludGVybnZhbEhhbmRsZSk7XG4gIH1cblxuICBvblRpbWVvdXQoKSB7XG4gICAgaWYgKCF0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24uZXF1YWwodGhpcy5sYXN0TW92ZVNlbnQpKSB7XG4gICAgICB0aGlzLmVsZS5kaXNwYXRjaEV2ZW50KFxuICAgICAgICBuZXcgQ3VzdG9tRXZlbnQ8RHJhZ1JhbmdlPihEUkFHX1JBTkdFX0VWRU5ULCB7XG4gICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICBiZWdpbjogdGhpcy5iZWdpbiEuZHVwKCksXG4gICAgICAgICAgICBlbmQ6IHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi5kdXAoKSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KVxuICAgICAgKTtcbiAgICAgIHRoaXMubGFzdE1vdmVTZW50LnNldCh0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIG1vdXNlbW92ZShlOiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKHRoaXMuYmVnaW4gPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLnggPSBlLm9mZnNldFg7XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLnkgPSBlLm9mZnNldFk7XG4gIH1cblxuICBtb3VzZWRvd24oZTogTW91c2VFdmVudCkge1xuICAgIHRoaXMuaW50ZXJudmFsSGFuZGxlID0gd2luZG93LnNldEludGVydmFsKHRoaXMub25UaW1lb3V0LmJpbmQodGhpcyksIDE2KTtcbiAgICB0aGlzLmJlZ2luID0gbmV3IFBvaW50KGUub2Zmc2V0WCwgZS5vZmZzZXRZKTtcbiAgfVxuXG4gIG1vdXNldXAoZTogTW91c2VFdmVudCkge1xuICAgIHRoaXMuZmluaXNoZWQobmV3IFBvaW50KGUub2Zmc2V0WCwgZS5vZmZzZXRZKSk7XG4gIH1cblxuICBtb3VzZWxlYXZlKGU6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAodGhpcy5iZWdpbiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmZpbmlzaGVkKG5ldyBQb2ludChlLm9mZnNldFgsIGUub2Zmc2V0WSkpO1xuICB9XG5cbiAgZmluaXNoZWQoZW5kOiBQb2ludCkge1xuICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuaW50ZXJudmFsSGFuZGxlKTtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24gPSBlbmQ7XG4gICAgdGhpcy5vblRpbWVvdXQoKTtcbiAgICB0aGlzLmJlZ2luID0gbnVsbDtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24gPSBuZXcgUG9pbnQoMCwgMCk7XG4gICAgdGhpcy5sYXN0TW92ZVNlbnQgPSBuZXcgUG9pbnQoMCwgMCk7XG4gIH1cbn1cbiIsICJleHBvcnQgY29uc3QgTUlOX0RJU1BMQVlfUkFOR0UgPSA3O1xuXG4vKiogUmVwcmVzZW50cyBhIHJhbmdlIG9mIGRheXMgb3ZlciB3aGljaCB0byBkaXNwbGF5IGEgem9vbWVkIGluIHZpZXcsIHVzaW5nXG4gKiB0aGUgaGFsZi1vcGVuIGludGVydmFsIFtiZWdpbiwgZW5kKS5cbiAqL1xuZXhwb3J0IGNsYXNzIERpc3BsYXlSYW5nZSB7XG4gIHByaXZhdGUgX2JlZ2luOiBudW1iZXI7XG4gIHByaXZhdGUgX2VuZDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKGJlZ2luOiBudW1iZXIsIGVuZDogbnVtYmVyKSB7XG4gICAgdGhpcy5fYmVnaW4gPSBiZWdpbjtcbiAgICB0aGlzLl9lbmQgPSBlbmQ7XG4gICAgaWYgKHRoaXMuX2JlZ2luID4gdGhpcy5fZW5kKSB7XG4gICAgICBbdGhpcy5fZW5kLCB0aGlzLl9iZWdpbl0gPSBbdGhpcy5fYmVnaW4sIHRoaXMuX2VuZF07XG4gICAgfVxuICAgIGlmICh0aGlzLl9lbmQgLSB0aGlzLl9iZWdpbiA8IE1JTl9ESVNQTEFZX1JBTkdFKSB7XG4gICAgICB0aGlzLl9lbmQgPSB0aGlzLl9iZWdpbiArIE1JTl9ESVNQTEFZX1JBTkdFO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBpbih4OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4geCA+PSB0aGlzLl9iZWdpbiAmJiB4IDw9IHRoaXMuX2VuZDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgYmVnaW4oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fYmVnaW47XG4gIH1cblxuICBwdWJsaWMgZ2V0IGVuZCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9lbmQ7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHJhbmdlSW5EYXlzKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2VuZCAtIHRoaXMuX2JlZ2luO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgRGlyZWN0ZWRFZGdlLCBFZGdlcyB9IGZyb20gXCIuLi8uLi9kYWcvZGFnXCI7XG5pbXBvcnQgeyBvaywgUmVzdWx0IH0gZnJvbSBcIi4uLy4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgU3BhbiB9IGZyb20gXCIuLi8uLi9zbGFjay9zbGFja1wiO1xuaW1wb3J0IHsgQ2hhcnQsIFRhc2ssIFRhc2tzLCB2YWxpZGF0ZUNoYXJ0IH0gZnJvbSBcIi4uL2NoYXJ0XCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2hhcnRMaWtlIHtcbiAgVmVydGljZXM6IFRhc2tzO1xuICBFZGdlczogRWRnZXM7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRmlsdGVyUmVzdWx0IHtcbiAgY2hhcnRMaWtlOiBDaGFydExpa2U7XG4gIGRpc3BsYXlPcmRlcjogbnVtYmVyW107XG4gIGhpZ2hsaWdodGVkVGFza3M6IG51bWJlcltdO1xuICBzcGFuczogU3BhbltdO1xuICBsYWJlbHM6IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgdHlwZSBGaWx0ZXJGdW5jID0gKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IGJvb2xlYW47XG5cbmV4cG9ydCBjb25zdCBmaWx0ZXIgPSAoXG4gIGNoYXJ0OiBDaGFydCxcbiAgZmlsdGVyRnVuYzogRmlsdGVyRnVuYyB8IG51bGwsXG4gIGhpZ2hsaWdodGVkVGFza3M6IG51bWJlcltdLFxuICBzcGFuczogU3BhbltdLFxuICBsYWJlbHM6IHN0cmluZ1tdXG4pOiBSZXN1bHQ8RmlsdGVyUmVzdWx0PiA9PiB7XG4gIGNvbnN0IHZyZXQgPSB2YWxpZGF0ZUNoYXJ0KGNoYXJ0KTtcbiAgaWYgKCF2cmV0Lm9rKSB7XG4gICAgcmV0dXJuIHZyZXQ7XG4gIH1cbiAgY29uc3QgdG9wb2xvZ2ljYWxPcmRlciA9IHZyZXQudmFsdWU7XG4gIGlmIChmaWx0ZXJGdW5jID09PSBudWxsKSB7XG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIGNoYXJ0TGlrZTogY2hhcnQsXG4gICAgICBkaXNwbGF5T3JkZXI6IHZyZXQudmFsdWUsXG4gICAgICBoaWdobGlnaHRlZFRhc2tzOiBoaWdobGlnaHRlZFRhc2tzLFxuICAgICAgc3BhbnMsXG4gICAgICBsYWJlbHMsXG4gICAgfSk7XG4gIH1cbiAgY29uc3QgdGFza3M6IFRhc2tzID0gW107XG4gIGNvbnN0IGVkZ2VzOiBFZGdlcyA9IFtdO1xuICBjb25zdCBkaXNwbGF5T3JkZXI6IG51bWJlcltdID0gW107XG4gIGNvbnN0IGZpbHRlcmVkU3BhbnM6IFNwYW5bXSA9IFtdO1xuICBjb25zdCBmaWx0ZXJlZExhYmVsczogc3RyaW5nW10gPSBbXTtcblxuICBjb25zdCBmcm9tT3JpZ2luYWxUb05ld0luZGV4OiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpO1xuXG4gIC8vIEZpcnN0IGZpbHRlciB0aGUgdGFza3MuXG4gIGNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIG9yaWdpbmFsSW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGlmIChmaWx0ZXJGdW5jKHRhc2ssIG9yaWdpbmFsSW5kZXgpKSB7XG4gICAgICB0YXNrcy5wdXNoKHRhc2spO1xuICAgICAgZmlsdGVyZWRTcGFucy5wdXNoKHNwYW5zW29yaWdpbmFsSW5kZXhdKTtcbiAgICAgIGZpbHRlcmVkTGFiZWxzLnB1c2gobGFiZWxzW29yaWdpbmFsSW5kZXhdKTtcbiAgICAgIGNvbnN0IG5ld0luZGV4ID0gdGFza3MubGVuZ3RoIC0gMTtcbiAgICAgIGZyb21PcmlnaW5hbFRvTmV3SW5kZXguc2V0KG9yaWdpbmFsSW5kZXgsIG5ld0luZGV4KTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIE5vdyBmaWx0ZXIgdGhlIGVkZ2VzIHdoaWxlIGFsc28gcmV3cml0aW5nIHRoZW0uXG4gIGNoYXJ0LkVkZ2VzLmZvckVhY2goKGRpcmVjdGVkRWRnZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgaWYgKFxuICAgICAgIWZyb21PcmlnaW5hbFRvTmV3SW5kZXguaGFzKGRpcmVjdGVkRWRnZS5pKSB8fFxuICAgICAgIWZyb21PcmlnaW5hbFRvTmV3SW5kZXguaGFzKGRpcmVjdGVkRWRnZS5qKVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBlZGdlcy5wdXNoKFxuICAgICAgbmV3IERpcmVjdGVkRWRnZShcbiAgICAgICAgZnJvbU9yaWdpbmFsVG9OZXdJbmRleC5nZXQoZGlyZWN0ZWRFZGdlLmkpLFxuICAgICAgICBmcm9tT3JpZ2luYWxUb05ld0luZGV4LmdldChkaXJlY3RlZEVkZ2UuailcbiAgICAgIClcbiAgICApO1xuICB9KTtcblxuICAvLyBOb3cgZmlsdGVyIGFuZCByZWluZGV4IHRoZSB0b3BvbG9naWNhbC9kaXNwbGF5IG9yZGVyLlxuICB0b3BvbG9naWNhbE9yZGVyLmZvckVhY2goKG9yaWdpbmFsVGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCB0YXNrOiBUYXNrID0gY2hhcnQuVmVydGljZXNbb3JpZ2luYWxUYXNrSW5kZXhdO1xuICAgIGlmICghZmlsdGVyRnVuYyh0YXNrLCBvcmlnaW5hbFRhc2tJbmRleCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZGlzcGxheU9yZGVyLnB1c2goZnJvbU9yaWdpbmFsVG9OZXdJbmRleC5nZXQob3JpZ2luYWxUYXNrSW5kZXgpISk7XG4gIH0pO1xuXG4gIC8vIFJlLWluZGV4IGhpZ2hsaWdodGVkIHRhc2tzLlxuICBjb25zdCB1cGRhdGVkSGlnaGxpZ2h0ZWRUYXNrcyA9IGhpZ2hsaWdodGVkVGFza3MubWFwKFxuICAgIChvcmlnaW5hbFRhc2tJbmRleDogbnVtYmVyKTogbnVtYmVyID0+XG4gICAgICBmcm9tT3JpZ2luYWxUb05ld0luZGV4LmdldChvcmlnaW5hbFRhc2tJbmRleCkhXG4gICk7XG5cbiAgcmV0dXJuIG9rKHtcbiAgICBjaGFydExpa2U6IHtcbiAgICAgIEVkZ2VzOiBlZGdlcyxcbiAgICAgIFZlcnRpY2VzOiB0YXNrcyxcbiAgICB9LFxuICAgIGRpc3BsYXlPcmRlcjogZGlzcGxheU9yZGVyLFxuICAgIGhpZ2hsaWdodGVkVGFza3M6IHVwZGF0ZWRIaWdobGlnaHRlZFRhc2tzLFxuICAgIHNwYW5zOiBmaWx0ZXJlZFNwYW5zLFxuICAgIGxhYmVsczogZmlsdGVyZWRMYWJlbHMsXG4gIH0pO1xufTtcbiIsICJpbXBvcnQgeyBjbGFtcCB9IGZyb20gXCIuLi8uLi9tZXRyaWNzL3JhbmdlLnRzXCI7XG5pbXBvcnQgeyBSZW5kZXJPcHRpb25zIH0gZnJvbSBcIi4uL3JlbmRlcmVyLnRzXCI7XG5pbXBvcnQgeyBQb2ludCB9IGZyb20gXCIuL3BvaW50LnRzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGF5Um93IHtcbiAgZGF5OiBudW1iZXI7XG4gIHJvdzogbnVtYmVyO1xufVxuXG4vKiogRmVhdHVyZXMgb2YgdGhlIGNoYXJ0IHdlIGNhbiBhc2sgZm9yIGNvb3JkaW5hdGVzIG9mLCB3aGVyZSB0aGUgdmFsdWUgcmV0dXJuZWQgaXNcbiAqIHRoZSB0b3AgbGVmdCBjb29yZGluYXRlIG9mIHRoZSBmZWF0dXJlLlxuICovXG5leHBvcnQgZW51bSBGZWF0dXJlIHtcbiAgdGFza0xpbmVTdGFydCxcbiAgdGV4dFN0YXJ0LFxuICBncm91cFRleHRTdGFydCxcbiAgcGVyY2VudFN0YXJ0LFxuICB2ZXJ0aWNhbEFycm93RGVzdFRvcCxcbiAgdmVydGljYWxBcnJvd0Rlc3RCb3R0b20sXG4gIGhvcml6b250YWxBcnJvd0Rlc3QsXG4gIHZlcnRpY2FsQXJyb3dTdGFydCxcbiAgaG9yaXpvbnRhbEFycm93U3RhcnQsXG4gIHZlcnRpY2FsQXJyb3dEZXN0VG9NaWxlc3RvbmVUb3AsXG4gIHZlcnRpY2FsQXJyb3dEZXN0VG9NaWxlc3RvbmVCb3R0b20sXG4gIGhvcml6b250YWxBcnJvd0Rlc3RUb01pbGVzdG9uZSxcbiAgdmVydGljYWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZVRvcCxcbiAgdmVydGljYWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZUJvdHRvbSxcbiAgaG9yaXpvbnRhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lLFxuICBncm91cEVudmVsb3BlU3RhcnQsXG4gIHRhc2tFbnZlbG9wZVRvcCxcblxuICBkaXNwbGF5UmFuZ2VUb3AsXG4gIHRhc2tSb3dCb3R0b20sXG5cbiAgdGltZU1hcmtTdGFydCxcbiAgdGltZU1hcmtFbmQsXG4gIHRpbWVUZXh0U3RhcnQsXG5cbiAgZ3JvdXBUaXRsZVRleHRTdGFydCxcblxuICB0YXNrc0NsaXBSZWN0T3JpZ2luLFxuICBncm91cEJ5T3JpZ2luLFxufVxuXG4vKiogU2l6ZXMgb2YgZmVhdHVyZXMgb2YgYSByZW5kZXJlZCBjaGFydC4gKi9cbmV4cG9ydCBlbnVtIE1ldHJpYyB7XG4gIHRhc2tMaW5lSGVpZ2h0LFxuICBwZXJjZW50SGVpZ2h0LFxuICBhcnJvd0hlYWRIZWlnaHQsXG4gIGFycm93SGVhZFdpZHRoLFxuICBtaWxlc3RvbmVEaWFtZXRlcixcbiAgbGluZURhc2hMaW5lLFxuICBsaW5lRGFzaEdhcCxcbiAgdGV4dFhPZmZzZXQsXG59XG5cbi8qKiBNYWtlcyBhIG51bWJlciBvZGQsIGFkZHMgb25lIGlmIGV2ZW4uICovXG5jb25zdCBtYWtlT2RkID0gKG46IG51bWJlcik6IG51bWJlciA9PiB7XG4gIGlmIChuICUgMiA9PT0gMCkge1xuICAgIHJldHVybiBuICsgMTtcbiAgfVxuICByZXR1cm4gbjtcbn07XG5cbi8qKiBTY2FsZSBjb25zb2xpZGF0ZXMgYWxsIGNhbGN1bGF0aW9ucyBhcm91bmQgcmVuZGVyaW5nIGEgY2hhcnQgb250byBhIHN1cmZhY2UuICovXG5leHBvcnQgY2xhc3MgU2NhbGUge1xuICBwcml2YXRlIGRheVdpZHRoUHg6IG51bWJlcjtcbiAgcHJpdmF0ZSByb3dIZWlnaHRQeDogbnVtYmVyO1xuICBwcml2YXRlIGJsb2NrU2l6ZVB4OiBudW1iZXI7XG4gIHByaXZhdGUgdGFza0hlaWdodFB4OiBudW1iZXI7XG4gIHByaXZhdGUgbGluZVdpZHRoUHg6IG51bWJlcjtcbiAgcHJpdmF0ZSBtYXJnaW5TaXplUHg6IG51bWJlcjtcbiAgcHJpdmF0ZSB0aW1lbGluZUhlaWdodFB4OiBudW1iZXI7XG4gIHByaXZhdGUgb3JpZ2luOiBQb2ludDtcbiAgcHJpdmF0ZSB0b3RhbE51bWJlck9mRGF5czogbnVtYmVyO1xuICBwcml2YXRlIGdyb3VwQnlDb2x1bW5XaWR0aFB4OiBudW1iZXI7XG5cbiAgcHJpdmF0ZSB0aW1lbGluZU9yaWdpbjogUG9pbnQ7XG4gIHByaXZhdGUgdGFza3NPcmlnaW46IFBvaW50O1xuICBwcml2YXRlIGdyb3VwQnlPcmlnaW46IFBvaW50O1xuICBwcml2YXRlIHRhc2tzQ2xpcFJlY3RPcmlnaW46IFBvaW50O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gICAgY2FudmFzV2lkdGhQeDogbnVtYmVyLFxuICAgIHRvdGFsTnVtYmVyT2ZEYXlzOiBudW1iZXIsXG4gICAgbWF4R3JvdXBOYW1lTGVuZ3RoOiBudW1iZXIgPSAwXG4gICkge1xuICAgIHRoaXMudG90YWxOdW1iZXJPZkRheXMgPSB0b3RhbE51bWJlck9mRGF5cztcbiAgICB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4ID0gbWF4R3JvdXBOYW1lTGVuZ3RoICogb3B0cy5mb250U2l6ZVB4O1xuXG4gICAgdGhpcy5ibG9ja1NpemVQeCA9IE1hdGguZmxvb3Iob3B0cy5mb250U2l6ZVB4IC8gMyk7XG4gICAgdGhpcy50YXNrSGVpZ2h0UHggPSBtYWtlT2RkKE1hdGguZmxvb3IoKHRoaXMuYmxvY2tTaXplUHggKiAzKSAvIDQpKTtcbiAgICB0aGlzLmxpbmVXaWR0aFB4ID0gbWFrZU9kZChNYXRoLmZsb29yKHRoaXMudGFza0hlaWdodFB4IC8gMykpO1xuICAgIGNvbnN0IG1pbGVzdG9uZVJhZGl1cyA9IE1hdGguY2VpbCh0aGlzLnRhc2tIZWlnaHRQeCAvIDIpICsgdGhpcy5saW5lV2lkdGhQeDtcbiAgICB0aGlzLm1hcmdpblNpemVQeCA9IG1pbGVzdG9uZVJhZGl1cztcbiAgICB0aGlzLnRpbWVsaW5lSGVpZ2h0UHggPSBvcHRzLmhhc1RpbWVsaW5lXG4gICAgICA/IE1hdGguY2VpbCgob3B0cy5mb250U2l6ZVB4ICogNCkgLyAzKVxuICAgICAgOiAwO1xuXG4gICAgdGhpcy50aW1lbGluZU9yaWdpbiA9IG5ldyBQb2ludChtaWxlc3RvbmVSYWRpdXMsIDApO1xuICAgIHRoaXMuZ3JvdXBCeU9yaWdpbiA9IG5ldyBQb2ludCgwLCBtaWxlc3RvbmVSYWRpdXMgKyB0aGlzLnRpbWVsaW5lSGVpZ2h0UHgpO1xuXG4gICAgbGV0IGJlZ2luT2Zmc2V0ID0gMDtcbiAgICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UgPT09IG51bGwgfHwgb3B0cy5kaXNwbGF5UmFuZ2VVc2FnZSA9PT0gXCJoaWdobGlnaHRcIikge1xuICAgICAgLy8gRG8gbm90IGZvcmNlIGRheVdpZHRoUHggdG8gYW4gaW50ZWdlciwgaXQgY291bGQgZ28gdG8gMCBhbmQgY2F1c2UgYWxsXG4gICAgICAvLyB0YXNrcyB0byBiZSByZW5kZXJlZCBhdCAwIHdpZHRoLlxuICAgICAgdGhpcy5kYXlXaWR0aFB4ID1cbiAgICAgICAgKGNhbnZhc1dpZHRoUHggLSB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4IC0gMiAqIHRoaXMubWFyZ2luU2l6ZVB4KSAvXG4gICAgICAgIHRvdGFsTnVtYmVyT2ZEYXlzO1xuICAgICAgdGhpcy5vcmlnaW4gPSBuZXcgUG9pbnQoMCwgMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFNob3VsZCB3ZSBzZXQgeC1tYXJnaW5zIHRvIDAgaWYgYSBTdWJSYW5nZSBpcyByZXF1ZXN0ZWQ/XG4gICAgICAvLyBPciBzaG91bGQgd2UgdG90YWxseSBkcm9wIGFsbCBtYXJnaW5zIGZyb20gaGVyZSBhbmQganVzdCB1c2VcbiAgICAgIC8vIENTUyBtYXJnaW5zIG9uIHRoZSBjYW52YXMgZWxlbWVudD9cbiAgICAgIHRoaXMuZGF5V2lkdGhQeCA9XG4gICAgICAgIChjYW52YXNXaWR0aFB4IC0gdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCAtIDIgKiB0aGlzLm1hcmdpblNpemVQeCkgL1xuICAgICAgICBvcHRzLmRpc3BsYXlSYW5nZS5yYW5nZUluRGF5cztcbiAgICAgIGJlZ2luT2Zmc2V0ID0gTWF0aC5mbG9vcihcbiAgICAgICAgdGhpcy5kYXlXaWR0aFB4ICogb3B0cy5kaXNwbGF5UmFuZ2UuYmVnaW4gKyB0aGlzLm1hcmdpblNpemVQeFxuICAgICAgKTtcbiAgICAgIHRoaXMub3JpZ2luID0gbmV3IFBvaW50KC1iZWdpbk9mZnNldCArIHRoaXMubWFyZ2luU2l6ZVB4LCAwKTtcbiAgICB9XG5cbiAgICB0aGlzLnRhc2tzT3JpZ2luID0gbmV3IFBvaW50KFxuICAgICAgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCAtIGJlZ2luT2Zmc2V0ICsgbWlsZXN0b25lUmFkaXVzLFxuICAgICAgdGhpcy50aW1lbGluZUhlaWdodFB4ICsgbWlsZXN0b25lUmFkaXVzXG4gICAgKTtcblxuICAgIHRoaXMudGFza3NDbGlwUmVjdE9yaWdpbiA9IG5ldyBQb2ludChcbiAgICAgIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHgsXG4gICAgICB0aGlzLnRpbWVsaW5lSGVpZ2h0UHhcbiAgICApO1xuXG4gICAgaWYgKG9wdHMuaGFzVGV4dCkge1xuICAgICAgdGhpcy5yb3dIZWlnaHRQeCA9IDYgKiB0aGlzLmJsb2NrU2l6ZVB4OyAvLyBUaGlzIG1pZ2h0IGFsc28gYmUgYChjYW52YXNIZWlnaHRQeCAtIDIgKiBvcHRzLm1hcmdpblNpemVQeCkgLyBudW1iZXJTd2ltTGFuZXNgIGlmIGhlaWdodCBpcyBzdXBwbGllZD9cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yb3dIZWlnaHRQeCA9IDEuMSAqIHRoaXMuYmxvY2tTaXplUHg7XG4gICAgfVxuICB9XG5cbiAgLyoqIFRoZSBoZWlnaHQgb2YgdGhlIGNoYXJ0LiBOb3RlIHRoYXQgaXQncyBub3QgY29uc3RyYWluZWQgYnkgdGhlIGNhbnZhcy4gKi9cbiAgcHVibGljIGhlaWdodChtYXhSb3dzOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiAoXG4gICAgICBtYXhSb3dzICogdGhpcy5yb3dIZWlnaHRQeCArIHRoaXMudGltZWxpbmVIZWlnaHRQeCArIDIgKiB0aGlzLm1hcmdpblNpemVQeFxuICAgICk7XG4gIH1cblxuICBwdWJsaWMgZGF5Um93RnJvbVBvaW50KHBvaW50OiBQb2ludCk6IERheVJvdyB7XG4gICAgLy8gVGhpcyBzaG91bGQgYWxzbyBjbGFtcCB0aGUgcmV0dXJuZWQgJ3gnIHZhbHVlIHRvIFswLCBtYXhSb3dzKS5cbiAgICByZXR1cm4ge1xuICAgICAgZGF5OiBjbGFtcChcbiAgICAgICAgTWF0aC5mbG9vcihcbiAgICAgICAgICAod2luZG93LmRldmljZVBpeGVsUmF0aW8gKiBwb2ludC54IC1cbiAgICAgICAgICAgIHRoaXMub3JpZ2luLnggLVxuICAgICAgICAgICAgdGhpcy5tYXJnaW5TaXplUHggLVxuICAgICAgICAgICAgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCkgL1xuICAgICAgICAgICAgdGhpcy5kYXlXaWR0aFB4XG4gICAgICAgICksXG4gICAgICAgIDAsXG4gICAgICAgIHRoaXMudG90YWxOdW1iZXJPZkRheXNcbiAgICAgICksXG4gICAgICByb3c6IE1hdGguZmxvb3IoXG4gICAgICAgICh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyAqIHBvaW50LnkgLVxuICAgICAgICAgIHRoaXMub3JpZ2luLnkgLVxuICAgICAgICAgIHRoaXMubWFyZ2luU2l6ZVB4IC1cbiAgICAgICAgICB0aGlzLnRpbWVsaW5lSGVpZ2h0UHgpIC9cbiAgICAgICAgICB0aGlzLnJvd0hlaWdodFB4XG4gICAgICApLFxuICAgIH07XG4gIH1cblxuICAvKiogVGhlIHRvcCBsZWZ0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94IGZvciBhIHNpbmdsZSB0YXNrLiAqL1xuICBwcml2YXRlIHRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdzogbnVtYmVyLCBkYXk6IG51bWJlcik6IFBvaW50IHtcbiAgICByZXR1cm4gdGhpcy5vcmlnaW4uc3VtKFxuICAgICAgbmV3IFBvaW50KFxuICAgICAgICBNYXRoLmZsb29yKFxuICAgICAgICAgIGRheSAqIHRoaXMuZGF5V2lkdGhQeCArIHRoaXMubWFyZ2luU2l6ZVB4ICsgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeFxuICAgICAgICApLFxuICAgICAgICBNYXRoLmZsb29yKFxuICAgICAgICAgIHJvdyAqIHRoaXMucm93SGVpZ2h0UHggKyB0aGlzLm1hcmdpblNpemVQeCArIHRoaXMudGltZWxpbmVIZWlnaHRQeFxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgcHJpdmF0ZSBncm91cFJvd0VudmVsb3BlU3RhcnQocm93OiBudW1iZXIsIGRheTogbnVtYmVyKTogUG9pbnQge1xuICAgIHJldHVybiB0aGlzLmdyb3VwQnlPcmlnaW4uc3VtKFxuICAgICAgbmV3IFBvaW50KFxuICAgICAgICAwLFxuICAgICAgICByb3cgKiB0aGlzLnJvd0hlaWdodFB4ICsgdGhpcy5tYXJnaW5TaXplUHggKyB0aGlzLnRpbWVsaW5lSGVpZ2h0UHhcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBncm91cEhlYWRlclN0YXJ0KCk6IFBvaW50IHtcbiAgICByZXR1cm4gdGhpcy5vcmlnaW4uc3VtKG5ldyBQb2ludCh0aGlzLm1hcmdpblNpemVQeCwgdGhpcy5tYXJnaW5TaXplUHgpKTtcbiAgfVxuXG4gIHByaXZhdGUgdGltZUVudmVsb3BlU3RhcnQoZGF5OiBudW1iZXIpOiBQb2ludCB7XG4gICAgcmV0dXJuIHRoaXMub3JpZ2luLnN1bShcbiAgICAgIG5ldyBQb2ludChcbiAgICAgICAgZGF5ICogdGhpcy5kYXlXaWR0aFB4ICsgdGhpcy5tYXJnaW5TaXplUHggKyB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4LFxuICAgICAgICB0aGlzLm1hcmdpblNpemVQeFxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgY29vcmRpbmF0ZSBvZiB0aGUgaXRlbSAqL1xuICBmZWF0dXJlKHJvdzogbnVtYmVyLCBkYXk6IG51bWJlciwgY29vcmQ6IEZlYXR1cmUpOiBQb2ludCB7XG4gICAgc3dpdGNoIChjb29yZCkge1xuICAgICAgY2FzZSBGZWF0dXJlLnRhc2tMaW5lU3RhcnQ6XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb3A6XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSkuYWRkKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgdGhpcy5yb3dIZWlnaHRQeCAtIHRoaXMuYmxvY2tTaXplUHhcbiAgICAgICAgKTtcblxuICAgICAgY2FzZSBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0Qm90dG9tOlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSkuYWRkKDAsIHRoaXMucm93SGVpZ2h0UHgpO1xuICAgICAgY2FzZSBGZWF0dXJlLnRleHRTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza1Jvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpLmFkZChcbiAgICAgICAgICB0aGlzLmJsb2NrU2l6ZVB4LFxuICAgICAgICAgIHRoaXMuYmxvY2tTaXplUHhcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5ncm91cFRleHRTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KS5hZGQoXG4gICAgICAgICAgdGhpcy5ibG9ja1NpemVQeCxcbiAgICAgICAgICB0aGlzLmJsb2NrU2l6ZVB4XG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUucGVyY2VudFN0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSkuYWRkKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgdGhpcy5yb3dIZWlnaHRQeCAtIHRoaXMubGluZVdpZHRoUHhcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dEZXN0OlxuICAgICAgY2FzZSBGZWF0dXJlLmhvcml6b250YWxBcnJvd1N0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSkuYWRkKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgTWF0aC5mbG9vcih0aGlzLnJvd0hlaWdodFB4IC0gMC41ICogdGhpcy5ibG9ja1NpemVQeCkgLSAxXG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZVRvcDpcbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvcCkuYWRkKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgLTEgKiB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpXG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZUJvdHRvbTpcbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvcCkuYWRkKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKVxuICAgICAgICApO1xuICAgICAgY2FzZSBGZWF0dXJlLmhvcml6b250YWxBcnJvd0Rlc3RUb01pbGVzdG9uZTpcbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dEZXN0KS5hZGQoXG4gICAgICAgICAgLTEgKiB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpLFxuICAgICAgICAgIC0xICogdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKVxuICAgICAgICApO1xuICAgICAgY2FzZSBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydEZyb21NaWxlc3RvbmVUb3A6XG4gICAgICAgIHJldHVybiB0aGlzLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0KS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICAtMSAqIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlcilcbiAgICAgICAgKTtcblxuICAgICAgY2FzZSBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydEZyb21NaWxlc3RvbmVCb3R0b206XG4gICAgICAgIHJldHVybiB0aGlzLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0KS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpXG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lOlxuICAgICAgICByZXR1cm4gdGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLmhvcml6b250YWxBcnJvd1N0YXJ0KS5hZGQoXG4gICAgICAgICAgdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKSxcbiAgICAgICAgICAwXG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUudGFza0VudmVsb3BlVG9wOlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSk7XG4gICAgICBjYXNlIEZlYXR1cmUuZ3JvdXBFbnZlbG9wZVN0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy5ncm91cFJvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpO1xuICAgICAgY2FzZSBGZWF0dXJlLnRpbWVNYXJrU3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRpbWVFbnZlbG9wZVN0YXJ0KGRheSk7XG4gICAgICBjYXNlIEZlYXR1cmUudGltZU1hcmtFbmQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRpbWVFbnZlbG9wZVN0YXJ0KGRheSkuYWRkKDAsIHRoaXMucm93SGVpZ2h0UHggKiAocm93ICsgMSkpO1xuICAgICAgY2FzZSBGZWF0dXJlLnRpbWVUZXh0U3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRpbWVFbnZlbG9wZVN0YXJ0KGRheSkuYWRkKHRoaXMuYmxvY2tTaXplUHgsIDApO1xuXG4gICAgICBjYXNlIEZlYXR1cmUuZ3JvdXBUaXRsZVRleHRTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBIZWFkZXJTdGFydCgpLmFkZCh0aGlzLmJsb2NrU2l6ZVB4LCAwKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5kaXNwbGF5UmFuZ2VUb3A6XG4gICAgICAgIHJldHVybiB0aGlzLnRpbWVFbnZlbG9wZVN0YXJ0KGRheSk7XG4gICAgICBjYXNlIEZlYXR1cmUudGFza1Jvd0JvdHRvbTpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza1Jvd0VudmVsb3BlU3RhcnQocm93ICsgMSwgZGF5KTtcbiAgICAgIGNhc2UgRmVhdHVyZS50YXNrc0NsaXBSZWN0T3JpZ2luOlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrc0NsaXBSZWN0T3JpZ2luO1xuICAgICAgY2FzZSBGZWF0dXJlLmdyb3VwQnlPcmlnaW46XG4gICAgICAgIHJldHVybiB0aGlzLmdyb3VwQnlPcmlnaW47XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBUaGUgbGluZSBiZWxvdyB3aWxsIG5vdCBjb21waWxlIGlmIHlvdSBtaXNzZWQgYW4gZW51bSBpbiB0aGUgc3dpdGNoIGFib3ZlLlxuICAgICAgICBjb29yZCBzYXRpc2ZpZXMgbmV2ZXI7XG4gICAgICAgIHJldHVybiBuZXcgUG9pbnQoMCwgMCk7XG4gICAgfVxuICB9XG5cbiAgbWV0cmljKGZlYXR1cmU6IE1ldHJpYyk6IG51bWJlciB7XG4gICAgc3dpdGNoIChmZWF0dXJlKSB7XG4gICAgICBjYXNlIE1ldHJpYy50YXNrTGluZUhlaWdodDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza0hlaWdodFB4O1xuICAgICAgY2FzZSBNZXRyaWMucGVyY2VudEhlaWdodDpcbiAgICAgICAgcmV0dXJuIHRoaXMubGluZVdpZHRoUHg7XG4gICAgICBjYXNlIE1ldHJpYy5hcnJvd0hlYWRIZWlnaHQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tIZWlnaHRQeDtcbiAgICAgIGNhc2UgTWV0cmljLmFycm93SGVhZFdpZHRoOlxuICAgICAgICByZXR1cm4gTWF0aC5jZWlsKHRoaXMudGFza0hlaWdodFB4KTtcbiAgICAgIGNhc2UgTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyOlxuICAgICAgICByZXR1cm4gTWF0aC5jZWlsKHRoaXMudGFza0hlaWdodFB4KTtcbiAgICAgIGNhc2UgTWV0cmljLmxpbmVEYXNoTGluZTpcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tTaXplUHg7XG4gICAgICBjYXNlIE1ldHJpYy5saW5lRGFzaEdhcDpcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tTaXplUHg7XG4gICAgICBjYXNlIE1ldHJpYy50ZXh0WE9mZnNldDpcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tTaXplUHg7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBUaGUgbGluZSBiZWxvdyB3aWxsIG5vdCBjb21waWxlIGlmIHlvdSBtaXNzZWQgYW4gZW51bSBpbiB0aGUgc3dpdGNoIGFib3ZlLlxuICAgICAgICBmZWF0dXJlIHNhdGlzZmllcyBuZXZlcjtcbiAgICAgICAgcmV0dXJuIDAuMDtcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBUYXNrLCB2YWxpZGF0ZUNoYXJ0IH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBDaGFydExpa2UsIGZpbHRlciwgRmlsdGVyRnVuYyB9IGZyb20gXCIuLi9jaGFydC9maWx0ZXIvZmlsdGVyLnRzXCI7XG5pbXBvcnQgeyBEaXJlY3RlZEVkZ2UsIFZlcnRleEluZGljZXMgfSBmcm9tIFwiLi4vZGFnL2RhZy50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcbmltcG9ydCB7IFJlc291cmNlRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9yZXNvdXJjZXMvcmVzb3VyY2VzLnRzXCI7XG5pbXBvcnQgeyBSZXN1bHQsIG9rIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgU3BhbiB9IGZyb20gXCIuLi9zbGFjay9zbGFjay50c1wiO1xuaW1wb3J0IHsgRGlzcGxheVJhbmdlIH0gZnJvbSBcIi4vcmFuZ2UvcmFuZ2UudHNcIjtcbmltcG9ydCB7IFBvaW50IH0gZnJvbSBcIi4vc2NhbGUvcG9pbnQudHNcIjtcbmltcG9ydCB7IEZlYXR1cmUsIE1ldHJpYywgU2NhbGUgfSBmcm9tIFwiLi9zY2FsZS9zY2FsZS50c1wiO1xuXG50eXBlIERpcmVjdGlvbiA9IFwidXBcIiB8IFwiZG93blwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbG9ycyB7XG4gIHN1cmZhY2U6IHN0cmluZztcbiAgb25TdXJmYWNlOiBzdHJpbmc7XG4gIG9uU3VyZmFjZU11dGVkOiBzdHJpbmc7XG4gIG9uU3VyZmFjZUhpZ2hsaWdodDogc3RyaW5nO1xuICBvdmVybGF5OiBzdHJpbmc7XG4gIGdyb3VwQ29sb3I6IHN0cmluZztcbn1cblxuZXhwb3J0IHR5cGUgVGFza0luZGV4VG9Sb3cgPSBNYXA8bnVtYmVyLCBudW1iZXI+O1xuXG4vKiogRnVuY3Rpb24gdXNlIHRvIHByb2R1Y2UgYSB0ZXh0IGxhYmVsIGZvciBhIHRhc2sgYW5kIGl0cyBzbGFjay4gKi9cbmV4cG9ydCB0eXBlIFRhc2tMYWJlbCA9ICh0YXNrSW5kZXg6IG51bWJlcikgPT4gc3RyaW5nO1xuXG4vKiogQ29udHJvbHMgb2YgdGhlIGRpc3BsYXlSYW5nZSBpbiBSZW5kZXJPcHRpb25zIGlzIHVzZWQuXG4gKlxuICogIFwicmVzdHJpY3RcIjogT25seSBkaXNwbGF5IHRoZSBwYXJ0cyBvZiB0aGUgY2hhcnQgdGhhdCBhcHBlYXIgaW4gdGhlIHJhbmdlLlxuICpcbiAqICBcImhpZ2hsaWdodFwiOiBEaXNwbGF5IHRoZSBmdWxsIHJhbmdlIG9mIHRoZSBkYXRhLCBidXQgaGlnaGxpZ2h0IHRoZSByYW5nZS5cbiAqL1xuZXhwb3J0IHR5cGUgRGlzcGxheVJhbmdlVXNhZ2UgPSBcInJlc3RyaWN0XCIgfCBcImhpZ2hsaWdodFwiO1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdFRhc2tMYWJlbDogVGFza0xhYmVsID0gKHRhc2tJbmRleDogbnVtYmVyKTogc3RyaW5nID0+XG4gIHRhc2tJbmRleC50b0ZpeGVkKDApO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlbmRlck9wdGlvbnMge1xuICAvKiogVGhlIHRleHQgZm9udCBzaXplLCB0aGlzIGRyaXZlcyB0aGUgc2l6ZSBvZiBhbGwgb3RoZXIgY2hhcnQgZmVhdHVyZXMuXG4gICAqICovXG4gIGZvbnRTaXplUHg6IG51bWJlcjtcblxuICAvKiogRGlzcGxheSB0ZXh0IGlmIHRydWUuICovXG4gIGhhc1RleHQ6IGJvb2xlYW47XG5cbiAgLyoqIElmIHN1cHBsaWVkIHRoZW4gb25seSB0aGUgdGFza3MgaW4gdGhlIGdpdmVuIHJhbmdlIHdpbGwgYmUgZGlzcGxheWVkLiAqL1xuICBkaXNwbGF5UmFuZ2U6IERpc3BsYXlSYW5nZSB8IG51bGw7XG5cbiAgLyoqIENvbnRyb2xzIGhvdyB0aGUgYGRpc3BsYXlSYW5nZWAgaXMgdXNlZCBpZiBzdXBwbGllZC4gKi9cbiAgZGlzcGxheVJhbmdlVXNhZ2U6IERpc3BsYXlSYW5nZVVzYWdlO1xuXG4gIC8qKiBUaGUgY29sb3IgdGhlbWUuICovXG4gIGNvbG9yczogQ29sb3JzO1xuXG4gIC8qKiBJZiB0cnVlIHRoZW4gZGlzcGxheSB0aW1lcyBhdCB0aGUgdG9wIG9mIHRoZSBjaGFydC4gKi9cbiAgaGFzVGltZWxpbmU6IGJvb2xlYW47XG5cbiAgLyoqIElmIHRydWUgdGhlbiBkaXNwbGF5IHRoZSB0YXNrIGJhcnMuICovXG4gIGhhc1Rhc2tzOiBib29sZWFuO1xuXG4gIC8qKiBJZiB0cnVlIHRoZW4gZHJhdyB2ZXJ0aWNhbCBsaW5lcyBmcm9tIHRoZSB0aW1lbGluZSBkb3duIHRvIHRhc2sgc3RhcnQgYW5kXG4gICAqIGZpbmlzaCBwb2ludHMuICovXG4gIGRyYXdUaW1lTWFya2Vyc09uVGFza3M6IGJvb2xlYW47XG5cbiAgLyoqIERyYXcgZGVwZW5kZW5jeSBlZGdlcyBiZXR3ZWVuIHRhc2tzIGlmIHRydWUuICovXG4gIGhhc0VkZ2VzOiBib29sZWFuO1xuXG4gIC8qKiBGdW5jdGlvbiB0aGF0IHByb2R1Y2VzIGRpc3BsYXkgdGV4dCBmb3IgYSBUYXNrIGFuZCBpdHMgYXNzb2NpYXRlZCBTbGFjay4gKi9cbiAgdGFza0xhYmVsOiBUYXNrTGFiZWw7XG5cbiAgLyoqIFRoZSBpbmRpY2VzIG9mIHRhc2tzIHRoYXQgc2hvdWxkIGJlIGhpZ2hsaWdodGVkIHdoZW4gZHJhdywgdHlwaWNhbGx5IHVzZWRcbiAgICogdG8gaGlnaGxpZ2h0IHRoZSBjcml0aWNhbCBwYXRoLiAqL1xuICB0YXNrSGlnaGxpZ2h0czogbnVtYmVyW107XG5cbiAgLyoqIEZpbHRlciB0aGUgVGFza3MgdG8gYmUgZGlzcGxheWVkLiAqL1xuICBmaWx0ZXJGdW5jOiBGaWx0ZXJGdW5jIHwgbnVsbDtcblxuICAvKiogR3JvdXAgdGhlIHRhc2tzIHRvZ2V0aGVyIHZlcnRpY2FsbHkgYmFzZWQgb24gdGhlIGdpdmVuIHJlc291cmNlLiBJZiB0aGVcbiAgICogZW1wdHkgc3RyaW5nIGlzIHN1cHBsaWVkIHRoZW4ganVzdCBkaXNwbGF5IGJ5IHRvcG9sb2dpY2FsIG9yZGVyLlxuICAgKi9cbiAgZ3JvdXBCeVJlc291cmNlOiBzdHJpbmc7XG59XG5cbmNvbnN0IHZlcnRpY2FsQXJyb3dTdGFydEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uID0gKFxuICB0YXNrOiBUYXNrLFxuICBkaXJlY3Rpb246IERpcmVjdGlvblxuKTogRmVhdHVyZSA9PiB7XG4gIGlmICh0YXNrLmR1cmF0aW9uID09PSAwKSB7XG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJkb3duXCIpIHtcbiAgICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydEZyb21NaWxlc3RvbmVCb3R0b207XG4gICAgfVxuICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydEZyb21NaWxlc3RvbmVUb3A7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0O1xuICB9XG59O1xuXG5jb25zdCB2ZXJ0aWNhbEFycm93RGVzdEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uID0gKFxuICB0YXNrOiBUYXNrLFxuICBkaXJlY3Rpb246IERpcmVjdGlvblxuKTogRmVhdHVyZSA9PiB7XG4gIGlmICh0YXNrLmR1cmF0aW9uID09PSAwKSB7XG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJkb3duXCIpIHtcbiAgICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9NaWxlc3RvbmVUb3A7XG4gICAgfVxuICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9NaWxlc3RvbmVCb3R0b207XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJkb3duXCIpIHtcbiAgICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9wO1xuICAgIH1cbiAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdEJvdHRvbTtcbiAgfVxufTtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuY29uc3QgaG9yaXpvbnRhbEFycm93U3RhcnRGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbiA9ICh0YXNrOiBUYXNrKTogRmVhdHVyZSA9PiB7XG4gIGlmICh0YXNrLmR1cmF0aW9uID09PSAwKSB7XG4gICAgcmV0dXJuIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBGZWF0dXJlLmhvcml6b250YWxBcnJvd1N0YXJ0O1xuICB9XG59O1xuXG5jb25zdCBob3Jpem9udGFsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24gPSAodGFzazogVGFzayk6IEZlYXR1cmUgPT4ge1xuICBpZiAodGFzay5kdXJhdGlvbiA9PT0gMCkge1xuICAgIHJldHVybiBGZWF0dXJlLmhvcml6b250YWxBcnJvd0Rlc3RUb01pbGVzdG9uZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dEZXN0O1xuICB9XG59O1xuXG4vKipcbiAqIENvbXB1dGUgd2hhdCB0aGUgaGVpZ2h0IG9mIHRoZSBjYW52YXMgc2hvdWxkIGJlLiBOb3RlIHRoYXQgdGhlIHZhbHVlIGRvZXNuJ3RcbiAqIGtub3cgYWJvdXQgYHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvYCwgc28gaWYgdGhlIGNhbnZhcyBpcyBhbHJlYWR5IHNjYWxlZCBieVxuICogYHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvYCB0aGVuIHNvIHdpbGwgdGhlIHJlc3VsdCBvZiB0aGlzIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3VnZ2VzdGVkQ2FudmFzSGVpZ2h0KFxuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LFxuICBzcGFuczogU3BhbltdLFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBtYXhSb3dzOiBudW1iZXJcbik6IG51bWJlciB7XG4gIGlmICghb3B0cy5oYXNUYXNrcykge1xuICAgIG1heFJvd3MgPSAwO1xuICB9XG4gIHJldHVybiBuZXcgU2NhbGUoXG4gICAgb3B0cyxcbiAgICBjYW52YXMud2lkdGgsXG4gICAgc3BhbnNbc3BhbnMubGVuZ3RoIC0gMV0uZmluaXNoICsgMVxuICApLmhlaWdodChtYXhSb3dzKTtcbn1cblxuLy8gVE9ETyAtIFBhc3MgaW4gbWF4IHJvd3MsIGFuZCBhIG1hcHBpbmcgdGhhdCBtYXBzIGZyb20gdGFza0luZGV4IHRvIHJvdyxcbi8vIGJlY2F1c2UgdHdvIGRpZmZlcmVudCB0YXNrcyBtaWdodCBiZSBwbGFjZWQgb24gdGhlIHNhbWUgcm93LiBBbHNvIHdlIHNob3VsZFxuLy8gcGFzcyBpbiBtYXggcm93cz8gT3Igc2hvdWxkIHRoYXQgY29tZSBmcm9tIHRoZSBhYm92ZSBtYXBwaW5nP1xuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclRhc2tzVG9DYW52YXMoXG4gIHBhcmVudDogSFRNTEVsZW1lbnQsXG4gIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBwbGFuOiBQbGFuLFxuICBzcGFuczogU3BhbltdLFxuICBvcHRzOiBSZW5kZXJPcHRpb25zXG4pOiBSZXN1bHQ8U2NhbGU+IHtcbiAgY29uc3QgdnJldCA9IHZhbGlkYXRlQ2hhcnQocGxhbi5jaGFydCk7XG4gIGlmICghdnJldC5vaykge1xuICAgIHJldHVybiB2cmV0O1xuICB9XG5cbiAgY29uc3Qgb3JpZ2luYWxMYWJlbHMgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLm1hcChcbiAgICAodGFzazogVGFzaywgdGFza0luZGV4OiBudW1iZXIpID0+IG9wdHMudGFza0xhYmVsKHRhc2tJbmRleClcbiAgKTtcblxuICAvLyBBcHBseSB0aGUgZmlsdGVyIGFuZCB3b3JrIHdpdGggdGhlIENoYXJ0TGlrZSByZXR1cm4gZnJvbSB0aGlzIHBvaW50IG9uLlxuICAvLyBGaXRsZXIgYWxzbyBuZWVkcyB0byBiZSBhcHBsaWVkIHRvIHNwYW5zLlxuICBjb25zdCBmcmV0ID0gZmlsdGVyKFxuICAgIHBsYW4uY2hhcnQsXG4gICAgb3B0cy5maWx0ZXJGdW5jLFxuICAgIG9wdHMudGFza0hpZ2hsaWdodHMsXG4gICAgc3BhbnMsXG4gICAgb3JpZ2luYWxMYWJlbHNcbiAgKTtcbiAgaWYgKCFmcmV0Lm9rKSB7XG4gICAgcmV0dXJuIGZyZXQ7XG4gIH1cbiAgY29uc3QgY2hhcnRMaWtlID0gZnJldC52YWx1ZS5jaGFydExpa2U7XG4gIGNvbnN0IGxhYmVscyA9IGZyZXQudmFsdWUubGFiZWxzO1xuICBjb25zdCByZXNvdXJjZURlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbihvcHRzLmdyb3VwQnlSZXNvdXJjZSk7XG5cbiAgLy8gSGlnaGxpZ2h0ZWQgdGFza3MuXG4gIGNvbnN0IHRhc2tIaWdobGlnaHRzOiBTZXQ8bnVtYmVyPiA9IG5ldyBTZXQoZnJldC52YWx1ZS5oaWdobGlnaHRlZFRhc2tzKTtcbiAgc3BhbnMgPSBmcmV0LnZhbHVlLnNwYW5zO1xuXG4gIC8vIFRPRE8gVHVybiB0aGlzIGludG8gYW4gb3B0aW9uIHNpbmNlIHdlIHdvbid0IGFsd2F5cyB3YW50IHRoaXMuXG4gIGNvbnN0IG5ld0hlaWdodCA9IHN1Z2dlc3RlZENhbnZhc0hlaWdodChcbiAgICBjYW52YXMsXG4gICAgc3BhbnMsXG4gICAgb3B0cyxcbiAgICBjaGFydExpa2UuVmVydGljZXMubGVuZ3RoICsgMiAvLyBUT0RPIC0gV2h5IGRvIHdlIG5lZWQgdGhlICsyIGhlcmUhP1xuICApO1xuICBjYW52YXMuaGVpZ2h0ID0gbmV3SGVpZ2h0O1xuICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gYCR7bmV3SGVpZ2h0IC8gd2luZG93LmRldmljZVBpeGVsUmF0aW99cHhgO1xuXG4gIC8vIENhbGN1bGF0ZSBob3cgd2lkZSB3ZSBuZWVkIHRvIG1ha2UgdGhlIGdyb3VwQnkgY29sdW1uLlxuICBsZXQgbWF4R3JvdXBOYW1lTGVuZ3RoID0gMDtcbiAgaWYgKG9wdHMuZ3JvdXBCeVJlc291cmNlICE9PSBcIlwiICYmIG9wdHMuaGFzVGV4dCkge1xuICAgIG1heEdyb3VwTmFtZUxlbmd0aCA9IG9wdHMuZ3JvdXBCeVJlc291cmNlLmxlbmd0aDtcbiAgICBpZiAocmVzb3VyY2VEZWZpbml0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXMuZm9yRWFjaCgodmFsdWU6IHN0cmluZykgPT4ge1xuICAgICAgICBtYXhHcm91cE5hbWVMZW5ndGggPSBNYXRoLm1heChtYXhHcm91cE5hbWVMZW5ndGgsIHZhbHVlLmxlbmd0aCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBjb25zdCB0b3RhbE51bWJlck9mUm93cyA9IHNwYW5zLmxlbmd0aDtcbiAgY29uc3QgdG90YWxOdW1iZXJPZkRheXMgPSBzcGFuc1tzcGFucy5sZW5ndGggLSAxXS5maW5pc2g7XG4gIGNvbnN0IHNjYWxlID0gbmV3IFNjYWxlKFxuICAgIG9wdHMsXG4gICAgY2FudmFzLndpZHRoLFxuICAgIHRvdGFsTnVtYmVyT2ZEYXlzICsgMSxcbiAgICBtYXhHcm91cE5hbWVMZW5ndGhcbiAgKTtcblxuICBjb25zdCB0YXNrTGluZUhlaWdodCA9IHNjYWxlLm1ldHJpYyhNZXRyaWMudGFza0xpbmVIZWlnaHQpO1xuICBjb25zdCBkaWFtb25kRGlhbWV0ZXIgPSBzY2FsZS5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKTtcbiAgY29uc3QgcGVyY2VudEhlaWdodCA9IHNjYWxlLm1ldHJpYyhNZXRyaWMucGVyY2VudEhlaWdodCk7XG4gIGNvbnN0IGFycm93SGVhZEhlaWdodCA9IHNjYWxlLm1ldHJpYyhNZXRyaWMuYXJyb3dIZWFkSGVpZ2h0KTtcbiAgY29uc3QgYXJyb3dIZWFkV2lkdGggPSBzY2FsZS5tZXRyaWMoTWV0cmljLmFycm93SGVhZFdpZHRoKTtcbiAgY29uc3QgZGF5c1dpdGhUaW1lTWFya2VyczogU2V0PG51bWJlcj4gPSBuZXcgU2V0KCk7XG4gIGNvbnN0IHRpcmV0ID0gdGFza0luZGV4VG9Sb3dGcm9tR3JvdXBCeShcbiAgICBvcHRzLFxuICAgIHJlc291cmNlRGVmaW5pdGlvbixcbiAgICBjaGFydExpa2UsXG4gICAgZnJldC52YWx1ZS5kaXNwbGF5T3JkZXJcbiAgKTtcbiAgaWYgKCF0aXJldC5vaykge1xuICAgIHJldHVybiB0aXJldDtcbiAgfVxuICBjb25zdCB0YXNrSW5kZXhUb1JvdyA9IHRpcmV0LnZhbHVlLnRhc2tJbmRleFRvUm93O1xuICBjb25zdCByb3dSYW5nZXMgPSB0aXJldC52YWx1ZS5yb3dSYW5nZXM7XG5cbiAgLy8gU2V0IHVwIGNhbnZhcyBiYXNpY3MuXG4gIGNsZWFyQ2FudmFzKGN0eCwgb3B0cywgY2FudmFzKTtcbiAgc2V0Rm9udFNpemUoY3R4LCBvcHRzKTtcblxuICBjb25zdCBjbGlwUmVnaW9uID0gbmV3IFBhdGgyRCgpO1xuICBjb25zdCBjbGlwT3JpZ2luID0gc2NhbGUuZmVhdHVyZSgwLCAwLCBGZWF0dXJlLnRhc2tzQ2xpcFJlY3RPcmlnaW4pO1xuICBjb25zdCBjbGlwV2lkdGggPSBjYW52YXMud2lkdGggLSBjbGlwT3JpZ2luLng7XG4gIGNsaXBSZWdpb24ucmVjdChjbGlwT3JpZ2luLngsIDAsIGNsaXBXaWR0aCwgY2FudmFzLmhlaWdodCk7XG5cbiAgLy8gRHJhdyBiaWcgcmVkIHJlY3Qgb3ZlciB3aGVyZSB0aGUgY2xpcCByZWdpb24gd2lsbCBiZS5cbiAgaWYgKDApIHtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xuICAgIGN0eC5saW5lV2lkdGggPSAyO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguc3Ryb2tlKGNsaXBSZWdpb24pO1xuICB9XG5cbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuXG4gIGlmIChyb3dSYW5nZXMgIT09IG51bGwpIHtcbiAgICBpZiAob3B0cy5oYXNUYXNrcykge1xuICAgICAgZHJhd1N3aW1MYW5lSGlnaGxpZ2h0cyhcbiAgICAgICAgY3R4LFxuICAgICAgICBzY2FsZSxcbiAgICAgICAgcm93UmFuZ2VzLFxuICAgICAgICB0b3RhbE51bWJlck9mRGF5cyxcbiAgICAgICAgb3B0cy5jb2xvcnMuZ3JvdXBDb2xvclxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAocmVzb3VyY2VEZWZpbml0aW9uICE9PSB1bmRlZmluZWQgJiYgb3B0cy5oYXNUZXh0KSB7XG4gICAgICBkcmF3U3dpbUxhbmVMYWJlbHMoY3R4LCBvcHRzLCByZXNvdXJjZURlZmluaXRpb24sIHNjYWxlLCByb3dSYW5nZXMpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcblxuICBjdHguc2F2ZSgpO1xuICBjdHguY2xpcChjbGlwUmVnaW9uKTtcbiAgLy8gRHJhdyB0YXNrcyBpbiB0aGVpciByb3dzLlxuICBjaGFydExpa2UuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgdGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCByb3cgPSB0YXNrSW5kZXhUb1Jvdy5nZXQodGFza0luZGV4KSE7XG4gICAgY29uc3Qgc3BhbiA9IHNwYW5zW3Rhc2tJbmRleF07XG4gICAgY29uc3QgdGFza1N0YXJ0ID0gc2NhbGUuZmVhdHVyZShyb3csIHNwYW4uc3RhcnQsIEZlYXR1cmUudGFza0xpbmVTdGFydCk7XG4gICAgY29uc3QgdGFza0VuZCA9IHNjYWxlLmZlYXR1cmUocm93LCBzcGFuLmZpbmlzaCwgRmVhdHVyZS50YXNrTGluZVN0YXJ0KTtcblxuICAgIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VNdXRlZDtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VNdXRlZDtcblxuICAgIC8vIERyYXcgaW4gdGltZSBtYXJrZXJzIGlmIGRpc3BsYXllZC5cbiAgICAvLyBUT0RPIC0gTWFrZSBzdXJlIHRoZXkgZG9uJ3Qgb3ZlcmxhcC5cbiAgICBpZiAob3B0cy5kcmF3VGltZU1hcmtlcnNPblRhc2tzKSB7XG4gICAgICBkcmF3VGltZU1hcmtlckF0RGF5VG9UYXNrKFxuICAgICAgICBjdHgsXG4gICAgICAgIHJvdyxcbiAgICAgICAgc3Bhbi5zdGFydCxcbiAgICAgICAgdGFzayxcbiAgICAgICAgb3B0cyxcbiAgICAgICAgc2NhbGUsXG4gICAgICAgIGRheXNXaXRoVGltZU1hcmtlcnNcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHRhc2tIaWdobGlnaHRzLmhhcyh0YXNrSW5kZXgpKSB7XG4gICAgICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlSGlnaGxpZ2h0O1xuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlSGlnaGxpZ2h0O1xuICAgIH0gZWxzZSB7XG4gICAgICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICAgIH1cbiAgICBpZiAob3B0cy5oYXNUYXNrcykge1xuICAgICAgaWYgKHRhc2tTdGFydC54ID09PSB0YXNrRW5kLngpIHtcbiAgICAgICAgZHJhd01pbGVzdG9uZShjdHgsIHRhc2tTdGFydCwgZGlhbW9uZERpYW1ldGVyLCBwZXJjZW50SGVpZ2h0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRyYXdUYXNrQmFyKGN0eCwgdGFza1N0YXJ0LCB0YXNrRW5kLCB0YXNrTGluZUhlaWdodCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNraXAgZHJhd2luZyB0aGUgdGV4dCBvZiB0aGUgU3RhcnQgYW5kIEZpbmlzaCB0YXNrcy5cbiAgICAgIGlmICh0YXNrSW5kZXggIT09IDAgJiYgdGFza0luZGV4ICE9PSB0b3RhbE51bWJlck9mUm93cyAtIDEpIHtcbiAgICAgICAgZHJhd1Rhc2tUZXh0KFxuICAgICAgICAgIGN0eCxcbiAgICAgICAgICBvcHRzLFxuICAgICAgICAgIHNjYWxlLFxuICAgICAgICAgIHJvdyxcbiAgICAgICAgICBzcGFuLFxuICAgICAgICAgIHRhc2ssXG4gICAgICAgICAgdGFza0luZGV4LFxuICAgICAgICAgIGNsaXBXaWR0aCxcbiAgICAgICAgICBsYWJlbHNcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIGN0eC5saW5lV2lkdGggPSAxO1xuICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VNdXRlZDtcblxuICAvLyBOb3cgZHJhdyBhbGwgdGhlIGFycm93cywgaS5lLiBlZGdlcy5cbiAgaWYgKG9wdHMuaGFzRWRnZXMgJiYgb3B0cy5oYXNUYXNrcykge1xuICAgIGNvbnN0IGhpZ2hsaWdodGVkRWRnZXM6IERpcmVjdGVkRWRnZVtdID0gW107XG4gICAgY29uc3Qgbm9ybWFsRWRnZXM6IERpcmVjdGVkRWRnZVtdID0gW107XG4gICAgY2hhcnRMaWtlLkVkZ2VzLmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgICAgaWYgKHRhc2tIaWdobGlnaHRzLmhhcyhlLmkpICYmIHRhc2tIaWdobGlnaHRzLmhhcyhlLmopKSB7XG4gICAgICAgIGhpZ2hsaWdodGVkRWRnZXMucHVzaChlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vcm1hbEVkZ2VzLnB1c2goZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VNdXRlZDtcbiAgICBkcmF3RWRnZXMoXG4gICAgICBjdHgsXG4gICAgICBvcHRzLFxuICAgICAgbm9ybWFsRWRnZXMsXG4gICAgICBzcGFucyxcbiAgICAgIGNoYXJ0TGlrZS5WZXJ0aWNlcyxcbiAgICAgIHNjYWxlLFxuICAgICAgdGFza0luZGV4VG9Sb3csXG4gICAgICBhcnJvd0hlYWRXaWR0aCxcbiAgICAgIGFycm93SGVhZEhlaWdodCxcbiAgICAgIHRhc2tIaWdobGlnaHRzXG4gICAgKTtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VIaWdobGlnaHQ7XG4gICAgZHJhd0VkZ2VzKFxuICAgICAgY3R4LFxuICAgICAgb3B0cyxcbiAgICAgIGhpZ2hsaWdodGVkRWRnZXMsXG4gICAgICBzcGFucyxcbiAgICAgIGNoYXJ0TGlrZS5WZXJ0aWNlcyxcbiAgICAgIHNjYWxlLFxuICAgICAgdGFza0luZGV4VG9Sb3csXG4gICAgICBhcnJvd0hlYWRXaWR0aCxcbiAgICAgIGFycm93SGVhZEhlaWdodCxcbiAgICAgIHRhc2tIaWdobGlnaHRzXG4gICAgKTtcbiAgfVxuXG4gIGN0eC5yZXN0b3JlKCk7XG5cbiAgLy8gTm93IGRyYXcgdGhlIHJhbmdlIGhpZ2hsaWdodHMgaWYgcmVxdWlyZWQuXG4gIGlmIChvcHRzLmRpc3BsYXlSYW5nZSAhPT0gbnVsbCAmJiBvcHRzLmRpc3BsYXlSYW5nZVVzYWdlID09PSBcImhpZ2hsaWdodFwiKSB7XG4gICAgLy8gRHJhdyBhIHJlY3Qgb3ZlciBlYWNoIHNpZGUgdGhhdCBpc24ndCBpbiB0aGUgcmFuZ2UuXG4gICAgaWYgKG9wdHMuZGlzcGxheVJhbmdlLmJlZ2luID4gMCkge1xuICAgICAgZHJhd1JhbmdlT3ZlcmxheShcbiAgICAgICAgY3R4LFxuICAgICAgICBvcHRzLFxuICAgICAgICBzY2FsZSxcbiAgICAgICAgMCxcbiAgICAgICAgb3B0cy5kaXNwbGF5UmFuZ2UuYmVnaW4sXG4gICAgICAgIHRvdGFsTnVtYmVyT2ZSb3dzXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UuZW5kIDwgdG90YWxOdW1iZXJPZkRheXMpIHtcbiAgICAgIGRyYXdSYW5nZU92ZXJsYXkoXG4gICAgICAgIGN0eCxcbiAgICAgICAgb3B0cyxcbiAgICAgICAgc2NhbGUsXG4gICAgICAgIG9wdHMuZGlzcGxheVJhbmdlLmVuZCxcbiAgICAgICAgdG90YWxOdW1iZXJPZkRheXMgKyAxLFxuICAgICAgICB0b3RhbE51bWJlck9mUm93c1xuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2soc2NhbGUpO1xufVxuXG5mdW5jdGlvbiBkcmF3RWRnZXMoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBlZGdlczogRGlyZWN0ZWRFZGdlW10sXG4gIHNwYW5zOiBTcGFuW10sXG4gIHRhc2tzOiBUYXNrW10sXG4gIHNjYWxlOiBTY2FsZSxcbiAgdGFza0luZGV4VG9Sb3c6IFRhc2tJbmRleFRvUm93LFxuICBhcnJvd0hlYWRXaWR0aDogbnVtYmVyLFxuICBhcnJvd0hlYWRIZWlnaHQ6IG51bWJlcixcbiAgdGFza0hpZ2hsaWdodHM6IFNldDxudW1iZXI+XG4pIHtcbiAgZWRnZXMuZm9yRWFjaCgoZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgY29uc3Qgc3JjU2xhY2s6IFNwYW4gPSBzcGFuc1tlLmldO1xuICAgIGNvbnN0IGRzdFNsYWNrOiBTcGFuID0gc3BhbnNbZS5qXTtcbiAgICBjb25zdCBzcmNUYXNrOiBUYXNrID0gdGFza3NbZS5pXTtcbiAgICBjb25zdCBkc3RUYXNrOiBUYXNrID0gdGFza3NbZS5qXTtcbiAgICBjb25zdCBzcmNSb3cgPSB0YXNrSW5kZXhUb1Jvdy5nZXQoZS5pKSE7XG4gICAgY29uc3QgZHN0Um93ID0gdGFza0luZGV4VG9Sb3cuZ2V0KGUuaikhO1xuICAgIGNvbnN0IHNyY0RheSA9IHNyY1NsYWNrLmZpbmlzaDtcbiAgICBjb25zdCBkc3REYXkgPSBkc3RTbGFjay5zdGFydDtcblxuICAgIGlmICh0YXNrSGlnaGxpZ2h0cy5oYXMoZS5pKSAmJiB0YXNrSGlnaGxpZ2h0cy5oYXMoZS5qKSkge1xuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlSGlnaGxpZ2h0O1xuICAgIH0gZWxzZSB7XG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VNdXRlZDtcbiAgICB9XG5cbiAgICBkcmF3QXJyb3dCZXR3ZWVuVGFza3MoXG4gICAgICBjdHgsXG4gICAgICBzcmNEYXksXG4gICAgICBkc3REYXksXG4gICAgICBzY2FsZSxcbiAgICAgIHNyY1JvdyxcbiAgICAgIHNyY1Rhc2ssXG4gICAgICBkc3RSb3csXG4gICAgICBkc3RUYXNrLFxuICAgICAgYXJyb3dIZWFkV2lkdGgsXG4gICAgICBhcnJvd0hlYWRIZWlnaHRcbiAgICApO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZHJhd1JhbmdlT3ZlcmxheShcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIHNjYWxlOiBTY2FsZSxcbiAgYmVnaW5EYXk6IG51bWJlcixcbiAgZW5kRGF5OiBudW1iZXIsXG4gIHRvdGFsTnVtYmVyT2ZSb3dzOiBudW1iZXJcbikge1xuICBjb25zdCB0b3BMZWZ0ID0gc2NhbGUuZmVhdHVyZSgwLCBiZWdpbkRheSwgRmVhdHVyZS5kaXNwbGF5UmFuZ2VUb3ApO1xuICBjb25zdCBib3R0b21SaWdodCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgdG90YWxOdW1iZXJPZlJvd3MsXG4gICAgZW5kRGF5LFxuICAgIEZlYXR1cmUudGFza1Jvd0JvdHRvbVxuICApO1xuICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub3ZlcmxheTtcbiAgY3R4LmZpbGxSZWN0KFxuICAgIHRvcExlZnQueCxcbiAgICB0b3BMZWZ0LnksXG4gICAgYm90dG9tUmlnaHQueCAtIHRvcExlZnQueCxcbiAgICBib3R0b21SaWdodC55IC0gdG9wTGVmdC55XG4gICk7XG4gIGNvbnNvbGUubG9nKFwiZHJhd1JhbmdlT3ZlcmxheVwiLCB0b3BMZWZ0LCBib3R0b21SaWdodCk7XG59XG5cbmZ1bmN0aW9uIGRyYXdBcnJvd0JldHdlZW5UYXNrcyhcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHNyY0RheTogbnVtYmVyLFxuICBkc3REYXk6IG51bWJlcixcbiAgc2NhbGU6IFNjYWxlLFxuICBzcmNSb3c6IG51bWJlcixcbiAgc3JjVGFzazogVGFzayxcbiAgZHN0Um93OiBudW1iZXIsXG4gIGRzdFRhc2s6IFRhc2ssXG4gIGFycm93SGVhZFdpZHRoOiBudW1iZXIsXG4gIGFycm93SGVhZEhlaWdodDogbnVtYmVyXG4pIHtcbiAgaWYgKHNyY0RheSA9PT0gZHN0RGF5KSB7XG4gICAgZHJhd1ZlcnRpY2FsQXJyb3dUb1Rhc2soXG4gICAgICBjdHgsXG4gICAgICBzY2FsZSxcbiAgICAgIHNyY1JvdyxcbiAgICAgIHNyY0RheSxcbiAgICAgIHNyY1Rhc2ssXG4gICAgICBkc3RSb3csXG4gICAgICBkc3REYXksXG4gICAgICBkc3RUYXNrLFxuICAgICAgYXJyb3dIZWFkV2lkdGgsXG4gICAgICBhcnJvd0hlYWRIZWlnaHRcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIGRyYXdMU2hhcGVkQXJyb3dUb1Rhc2soXG4gICAgICBjdHgsXG4gICAgICBzY2FsZSxcbiAgICAgIHNyY1JvdyxcbiAgICAgIHNyY0RheSxcbiAgICAgIHNyY1Rhc2ssXG4gICAgICBkc3RSb3csXG4gICAgICBkc3RUYXNrLFxuICAgICAgZHN0RGF5LFxuICAgICAgYXJyb3dIZWFkSGVpZ2h0LFxuICAgICAgYXJyb3dIZWFkV2lkdGhcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNsZWFyQ2FudmFzKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudFxuKSB7XG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5zdXJmYWNlO1xuICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gIGN0eC5maWxsUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xufVxuXG5mdW5jdGlvbiBzZXRGb250U2l6ZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgb3B0czogUmVuZGVyT3B0aW9ucykge1xuICBjdHguZm9udCA9IGAke29wdHMuZm9udFNpemVQeH1weCBzZXJpZmA7XG59XG5cbi8vIERyYXcgTCBzaGFwZWQgYXJyb3csIGZpcnN0IGdvaW5nIGJldHdlZW4gcm93cywgdGhlbiBnb2luZyBiZXR3ZWVuIGRheXMuXG5mdW5jdGlvbiBkcmF3TFNoYXBlZEFycm93VG9UYXNrKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgc2NhbGU6IFNjYWxlLFxuICBzcmNSb3c6IG51bWJlcixcbiAgc3JjRGF5OiBudW1iZXIsXG4gIHNyY1Rhc2s6IFRhc2ssXG4gIGRzdFJvdzogbnVtYmVyLFxuICBkc3RUYXNrOiBUYXNrLFxuICBkc3REYXk6IG51bWJlcixcbiAgYXJyb3dIZWFkSGVpZ2h0OiBudW1iZXIsXG4gIGFycm93SGVhZFdpZHRoOiBudW1iZXJcbikge1xuICAvLyBEcmF3IHZlcnRpY2FsIHBhcnQgb2YgdGhlIFwiTFwiLlxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGNvbnN0IGRpcmVjdGlvbjogRGlyZWN0aW9uID0gc3JjUm93IDwgZHN0Um93ID8gXCJkb3duXCIgOiBcInVwXCI7XG4gIGNvbnN0IHZlcnRMaW5lU3RhcnQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIHNyY1JvdyxcbiAgICBzcmNEYXksXG4gICAgdmVydGljYWxBcnJvd1N0YXJ0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24oc3JjVGFzaywgZGlyZWN0aW9uKVxuICApO1xuICBjb25zdCB2ZXJ0TGluZUVuZCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgZHN0Um93LFxuICAgIHNyY0RheSxcbiAgICBob3Jpem9udGFsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24oZHN0VGFzaylcbiAgKTtcbiAgY3R4Lm1vdmVUbyh2ZXJ0TGluZVN0YXJ0LnggKyAwLjUsIHZlcnRMaW5lU3RhcnQueSk7XG4gIGN0eC5saW5lVG8odmVydExpbmVTdGFydC54ICsgMC41LCB2ZXJ0TGluZUVuZC55KTtcblxuICAvLyBEcmF3IGhvcml6b250YWwgcGFydCBvZiB0aGUgXCJMXCIuXG4gIGNvbnN0IGhvcnpMaW5lU3RhcnQgPSB2ZXJ0TGluZUVuZDtcbiAgY29uc3QgaG9yekxpbmVFbmQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIGRzdFJvdyxcbiAgICBkc3REYXksXG4gICAgaG9yaXpvbnRhbEFycm93RGVzdEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uKGRzdFRhc2spXG4gICk7XG4gIGN0eC5tb3ZlVG8odmVydExpbmVTdGFydC54ICsgMC41LCBob3J6TGluZVN0YXJ0LnkpO1xuICBjdHgubGluZVRvKGhvcnpMaW5lRW5kLnggKyAwLjUsIGhvcnpMaW5lRW5kLnkpO1xuXG4gIC8vIERyYXcgdGhlIGFycm93aGVhZC4gVGhpcyBhcnJvdyBoZWFkIHdpbGwgYWx3YXlzIHBvaW50IHRvIHRoZSByaWdodFxuICAvLyBzaW5jZSB0aGF0J3MgaG93IHRpbWUgZmxvd3MuXG4gIGN0eC5tb3ZlVG8oaG9yekxpbmVFbmQueCArIDAuNSwgaG9yekxpbmVFbmQueSk7XG4gIGN0eC5saW5lVG8oXG4gICAgaG9yekxpbmVFbmQueCAtIGFycm93SGVhZEhlaWdodCArIDAuNSxcbiAgICBob3J6TGluZUVuZC55ICsgYXJyb3dIZWFkV2lkdGhcbiAgKTtcbiAgY3R4Lm1vdmVUbyhob3J6TGluZUVuZC54ICsgMC41LCBob3J6TGluZUVuZC55KTtcbiAgY3R4LmxpbmVUbyhcbiAgICBob3J6TGluZUVuZC54IC0gYXJyb3dIZWFkSGVpZ2h0ICsgMC41LFxuICAgIGhvcnpMaW5lRW5kLnkgLSBhcnJvd0hlYWRXaWR0aFxuICApO1xuICBjdHguc3Ryb2tlKCk7XG59XG5cbmZ1bmN0aW9uIGRyYXdWZXJ0aWNhbEFycm93VG9UYXNrKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgc2NhbGU6IFNjYWxlLFxuICBzcmNSb3c6IG51bWJlcixcbiAgc3JjRGF5OiBudW1iZXIsXG4gIHNyY1Rhc2s6IFRhc2ssXG4gIGRzdFJvdzogbnVtYmVyLFxuICBkc3REYXk6IG51bWJlcixcbiAgZHN0VGFzazogVGFzayxcbiAgYXJyb3dIZWFkV2lkdGg6IG51bWJlcixcbiAgYXJyb3dIZWFkSGVpZ2h0OiBudW1iZXJcbikge1xuICBjb25zdCBkaXJlY3Rpb246IERpcmVjdGlvbiA9IHNyY1JvdyA8IGRzdFJvdyA/IFwiZG93blwiIDogXCJ1cFwiO1xuICBjb25zdCBhcnJvd1N0YXJ0ID0gc2NhbGUuZmVhdHVyZShcbiAgICBzcmNSb3csXG4gICAgc3JjRGF5LFxuICAgIHZlcnRpY2FsQXJyb3dTdGFydEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uKHNyY1Rhc2ssIGRpcmVjdGlvbilcbiAgKTtcbiAgY29uc3QgYXJyb3dFbmQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIGRzdFJvdyxcbiAgICBkc3REYXksXG4gICAgdmVydGljYWxBcnJvd0Rlc3RGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbihkc3RUYXNrLCBkaXJlY3Rpb24pXG4gICk7XG5cbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHgubW92ZVRvKGFycm93U3RhcnQueCArIDAuNSwgYXJyb3dTdGFydC55KTtcbiAgY3R4LmxpbmVUbyhhcnJvd0VuZC54ICsgMC41LCBhcnJvd0VuZC55KTtcblxuICAvLyBEcmF3IHRoZSBhcnJvd2hlYWQuXG4gIGNvbnN0IGRlbHRhWSA9IGRpcmVjdGlvbiA9PT0gXCJkb3duXCIgPyAtYXJyb3dIZWFkSGVpZ2h0IDogYXJyb3dIZWFkSGVpZ2h0O1xuICBjdHgubW92ZVRvKGFycm93RW5kLnggKyAwLjUsIGFycm93RW5kLnkpO1xuICBjdHgubGluZVRvKGFycm93RW5kLnggLSBhcnJvd0hlYWRXaWR0aCArIDAuNSwgYXJyb3dFbmQueSArIGRlbHRhWSk7XG4gIGN0eC5tb3ZlVG8oYXJyb3dFbmQueCArIDAuNSwgYXJyb3dFbmQueSk7XG4gIGN0eC5saW5lVG8oYXJyb3dFbmQueCArIGFycm93SGVhZFdpZHRoICsgMC41LCBhcnJvd0VuZC55ICsgZGVsdGFZKTtcbiAgY3R4LnN0cm9rZSgpO1xufVxuXG5mdW5jdGlvbiBkcmF3VGFza1RleHQoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBzY2FsZTogU2NhbGUsXG4gIHJvdzogbnVtYmVyLFxuICBzcGFuOiBTcGFuLFxuICB0YXNrOiBUYXNrLFxuICB0YXNrSW5kZXg6IG51bWJlcixcbiAgY2xpcFdpZHRoOiBudW1iZXIsXG4gIGxhYmVsczogc3RyaW5nW11cbikge1xuICBpZiAoIW9wdHMuaGFzVGV4dCkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBsYWJlbCA9IGxhYmVsc1t0YXNrSW5kZXhdO1xuXG4gIGxldCB4U3RhcnRJblRpbWUgPSBzcGFuLnN0YXJ0O1xuICBsZXQgeFBpeGVsRGVsdGEgPSAwO1xuICAvLyBEZXRlcm1pbmUgd2hlcmUgb24gdGhlIHgtYXhpcyB0byBzdGFydCBkcmF3aW5nIHRoZSB0YXNrIHRleHQuXG4gIGlmIChvcHRzLmRpc3BsYXlSYW5nZSAhPT0gbnVsbCAmJiBvcHRzLmRpc3BsYXlSYW5nZVVzYWdlID09PSBcInJlc3RyaWN0XCIpIHtcbiAgICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UuaW4oc3Bhbi5zdGFydCkpIHtcbiAgICAgIHhTdGFydEluVGltZSA9IHNwYW4uc3RhcnQ7XG4gICAgICB4UGl4ZWxEZWx0YSA9IDA7XG4gICAgfSBlbHNlIGlmIChvcHRzLmRpc3BsYXlSYW5nZS5pbihzcGFuLmZpbmlzaCkpIHtcbiAgICAgIHhTdGFydEluVGltZSA9IHNwYW4uZmluaXNoO1xuICAgICAgY29uc3QgbWVhcyA9IGN0eC5tZWFzdXJlVGV4dChsYWJlbCk7XG4gICAgICB4UGl4ZWxEZWx0YSA9IC1tZWFzLndpZHRoIC0gMiAqIHNjYWxlLm1ldHJpYyhNZXRyaWMudGV4dFhPZmZzZXQpO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICBzcGFuLnN0YXJ0IDwgb3B0cy5kaXNwbGF5UmFuZ2UuYmVnaW4gJiZcbiAgICAgIHNwYW4uZmluaXNoID4gb3B0cy5kaXNwbGF5UmFuZ2UuZW5kXG4gICAgKSB7XG4gICAgICB4U3RhcnRJblRpbWUgPSBvcHRzLmRpc3BsYXlSYW5nZS5iZWdpbjtcbiAgICAgIHhQaXhlbERlbHRhID0gY2xpcFdpZHRoIC8gMjtcbiAgICB9XG4gIH1cbiAgY3R4LmxpbmVXaWR0aCA9IDE7XG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gIGN0eC50ZXh0QmFzZWxpbmUgPSBcInRvcFwiO1xuICBjb25zdCB0ZXh0U3RhcnQgPSBzY2FsZS5mZWF0dXJlKHJvdywgeFN0YXJ0SW5UaW1lLCBGZWF0dXJlLnRleHRTdGFydCk7XG4gIGN0eC5maWxsVGV4dChsYWJlbCwgdGV4dFN0YXJ0LnggKyB4UGl4ZWxEZWx0YSwgdGV4dFN0YXJ0LnkpO1xufVxuXG5mdW5jdGlvbiBkcmF3VGFza0JhcihcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHRhc2tTdGFydDogUG9pbnQsXG4gIHRhc2tFbmQ6IFBvaW50LFxuICB0YXNrTGluZUhlaWdodDogbnVtYmVyXG4pIHtcbiAgY3R4LmZpbGxSZWN0KFxuICAgIHRhc2tTdGFydC54LFxuICAgIHRhc2tTdGFydC55LFxuICAgIHRhc2tFbmQueCAtIHRhc2tTdGFydC54LFxuICAgIHRhc2tMaW5lSGVpZ2h0XG4gICk7XG59XG5cbmZ1bmN0aW9uIGRyYXdNaWxlc3RvbmUoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICB0YXNrU3RhcnQ6IFBvaW50LFxuICBkaWFtb25kRGlhbWV0ZXI6IG51bWJlcixcbiAgcGVyY2VudEhlaWdodDogbnVtYmVyXG4pIHtcbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHgubGluZVdpZHRoID0gcGVyY2VudEhlaWdodCAvIDI7XG4gIGN0eC5tb3ZlVG8odGFza1N0YXJ0LngsIHRhc2tTdGFydC55IC0gZGlhbW9uZERpYW1ldGVyKTtcbiAgY3R4LmxpbmVUbyh0YXNrU3RhcnQueCArIGRpYW1vbmREaWFtZXRlciwgdGFza1N0YXJ0LnkpO1xuICBjdHgubGluZVRvKHRhc2tTdGFydC54LCB0YXNrU3RhcnQueSArIGRpYW1vbmREaWFtZXRlcik7XG4gIGN0eC5saW5lVG8odGFza1N0YXJ0LnggLSBkaWFtb25kRGlhbWV0ZXIsIHRhc2tTdGFydC55KTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xuICBjdHguc3Ryb2tlKCk7XG59XG5cbmNvbnN0IGRyYXdUaW1lTWFya2VyQXREYXlUb1Rhc2sgPSAoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICByb3c6IG51bWJlcixcbiAgZGF5OiBudW1iZXIsXG4gIHRhc2s6IFRhc2ssXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIHNjYWxlOiBTY2FsZSxcbiAgZGF5c1dpdGhUaW1lTWFya2VyczogU2V0PG51bWJlcj5cbikgPT4ge1xuICBpZiAoZGF5c1dpdGhUaW1lTWFya2Vycy5oYXMoZGF5KSkge1xuICAgIHJldHVybjtcbiAgfVxuICBkYXlzV2l0aFRpbWVNYXJrZXJzLmFkZChkYXkpO1xuICBjb25zdCB0aW1lTWFya1N0YXJ0ID0gc2NhbGUuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS50aW1lTWFya1N0YXJ0KTtcbiAgY29uc3QgdGltZU1hcmtFbmQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIHJvdyxcbiAgICBkYXksXG4gICAgdmVydGljYWxBcnJvd0Rlc3RGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbih0YXNrLCBcImRvd25cIilcbiAgKTtcbiAgY3R4LmxpbmVXaWR0aCA9IDE7XG5cbiAgY3R4LnNldExpbmVEYXNoKFtcbiAgICBzY2FsZS5tZXRyaWMoTWV0cmljLmxpbmVEYXNoTGluZSksXG4gICAgc2NhbGUubWV0cmljKE1ldHJpYy5saW5lRGFzaEdhcCksXG4gIF0pO1xuICBjdHgubW92ZVRvKHRpbWVNYXJrU3RhcnQueCArIDAuNSwgdGltZU1hcmtTdGFydC55KTtcbiAgY3R4LmxpbmVUbyh0aW1lTWFya1N0YXJ0LnggKyAwLjUsIHRpbWVNYXJrRW5kLnkpO1xuICBjdHguc3Ryb2tlKCk7XG5cbiAgY3R4LnNldExpbmVEYXNoKFtdKTtcblxuICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICBjdHgudGV4dEJhc2VsaW5lID0gXCJ0b3BcIjtcbiAgY29uc3QgdGV4dFN0YXJ0ID0gc2NhbGUuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS50aW1lVGV4dFN0YXJ0KTtcbiAgaWYgKG9wdHMuaGFzVGV4dCAmJiBvcHRzLmhhc1RpbWVsaW5lKSB7XG4gICAgY3R4LmZpbGxUZXh0KGAke2RheX1gLCB0ZXh0U3RhcnQueCwgdGV4dFN0YXJ0LnkpO1xuICB9XG59O1xuXG4vKiogUmVwcmVzZW50cyBhIGhhbGYtb3BlbiBpbnRlcnZhbCBvZiByb3dzLCBlLmcuIFtzdGFydCwgZmluaXNoKS4gKi9cbmludGVyZmFjZSBSb3dSYW5nZSB7XG4gIHN0YXJ0OiBudW1iZXI7XG4gIGZpbmlzaDogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgVGFza0luZGV4VG9Sb3dSZXR1cm4ge1xuICB0YXNrSW5kZXhUb1JvdzogVGFza0luZGV4VG9Sb3c7XG5cbiAgLyoqIE1hcHMgZWFjaCByZXNvdXJjZSB2YWx1ZSBpbmRleCB0byBhIHJhbmdlIG9mIHJvd3MuICovXG4gIHJvd1JhbmdlczogTWFwPG51bWJlciwgUm93UmFuZ2U+IHwgbnVsbDtcblxuICByZXNvdXJjZURlZmluaXRpb246IFJlc291cmNlRGVmaW5pdGlvbiB8IG51bGw7XG59XG5cbmNvbnN0IHRhc2tJbmRleFRvUm93RnJvbUdyb3VwQnkgPSAoXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIHJlc291cmNlRGVmaW5pdGlvbjogUmVzb3VyY2VEZWZpbml0aW9uIHwgdW5kZWZpbmVkLFxuICBjaGFydExpa2U6IENoYXJ0TGlrZSxcbiAgZGlzcGxheU9yZGVyOiBWZXJ0ZXhJbmRpY2VzXG4pOiBSZXN1bHQ8VGFza0luZGV4VG9Sb3dSZXR1cm4+ID0+IHtcbiAgLy8gZGlzcGxheU9yZGVyIG1hcHMgZnJvbSByb3cgdG8gdGFzayBpbmRleCwgdGhpcyB3aWxsIHByb2R1Y2UgdGhlIGludmVyc2UgbWFwcGluZy5cbiAgY29uc3QgdGFza0luZGV4VG9Sb3cgPSBuZXcgTWFwKFxuICAgIC8vIFRoaXMgbG9va3MgYmFja3dhcmRzLCBidXQgaXQgaXNuJ3QuIFJlbWVtYmVyIHRoYXQgdGhlIG1hcCBjYWxsYmFjayB0YWtlc1xuICAgIC8vICh2YWx1ZSwgaW5kZXgpIGFzIGl0cyBhcmd1bWVudHMuXG4gICAgZGlzcGxheU9yZGVyLm1hcCgodGFza0luZGV4OiBudW1iZXIsIHJvdzogbnVtYmVyKSA9PiBbdGFza0luZGV4LCByb3ddKVxuICApO1xuXG4gIGlmIChyZXNvdXJjZURlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBvayh7XG4gICAgICB0YXNrSW5kZXhUb1JvdzogdGFza0luZGV4VG9Sb3csXG4gICAgICByb3dSYW5nZXM6IG51bGwsXG4gICAgICByZXNvdXJjZURlZmluaXRpb246IG51bGwsXG4gICAgfSk7XG4gIH1cblxuICBjb25zdCBzdGFydFRhc2tJbmRleCA9IDA7XG4gIGNvbnN0IGZpbmlzaFRhc2tJbmRleCA9IGNoYXJ0TGlrZS5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICBjb25zdCBpZ25vcmFibGUgPSBbc3RhcnRUYXNrSW5kZXgsIGZpbmlzaFRhc2tJbmRleF07XG5cbiAgLy8gR3JvdXAgYWxsIHRhc2tzIGJ5IHRoZWlyIHJlc291cmNlIHZhbHVlLCB3aGlsZSBwcmVzZXJ2aW5nIGRpc3BsYXlPcmRlclxuICAvLyBvcmRlciB3aXRoIHRoZSBncm91cHMuXG4gIGNvbnN0IGdyb3VwcyA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXJbXT4oKTtcbiAgZGlzcGxheU9yZGVyLmZvckVhY2goKHRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgY29uc3QgcmVzb3VyY2VWYWx1ZSA9XG4gICAgICBjaGFydExpa2UuVmVydGljZXNbdGFza0luZGV4XS5nZXRSZXNvdXJjZShvcHRzLmdyb3VwQnlSZXNvdXJjZSkgfHwgXCJcIjtcbiAgICBjb25zdCBncm91cE1lbWJlcnMgPSBncm91cHMuZ2V0KHJlc291cmNlVmFsdWUpIHx8IFtdO1xuICAgIGdyb3VwTWVtYmVycy5wdXNoKHRhc2tJbmRleCk7XG4gICAgZ3JvdXBzLnNldChyZXNvdXJjZVZhbHVlLCBncm91cE1lbWJlcnMpO1xuICB9KTtcblxuICBjb25zdCByZXQgPSBuZXcgTWFwPG51bWJlciwgbnVtYmVyPigpO1xuXG4gIC8vIFVnaCwgU3RhcnQgYW5kIEZpbmlzaCBUYXNrcyBuZWVkIHRvIGJlIG1hcHBlZCwgYnV0IHNob3VsZCBub3QgYmUgZG9uZSB2aWFcbiAgLy8gcmVzb3VyY2UgdmFsdWUsIHNvIFN0YXJ0IHNob3VsZCBhbHdheXMgYmUgZmlyc3QuXG4gIHJldC5zZXQoMCwgMCk7XG5cbiAgLy8gTm93IGluY3JlbWVudCB1cCB0aGUgcm93cyBhcyB3ZSBtb3ZlIHRocm91Z2ggYWxsIHRoZSBncm91cHMuXG4gIGxldCByb3cgPSAxO1xuICAvLyBBbmQgdHJhY2sgaG93IG1hbnkgcm93cyBhcmUgaW4gZWFjaCBncm91cC5cbiAgY29uc3Qgcm93UmFuZ2VzOiBNYXA8bnVtYmVyLCBSb3dSYW5nZT4gPSBuZXcgTWFwKCk7XG4gIHJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXMuZm9yRWFjaChcbiAgICAocmVzb3VyY2VWYWx1ZTogc3RyaW5nLCByZXNvdXJjZUluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IHN0YXJ0T2ZSb3cgPSByb3c7XG4gICAgICAoZ3JvdXBzLmdldChyZXNvdXJjZVZhbHVlKSB8fCBbXSkuZm9yRWFjaCgodGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgaWYgKGlnbm9yYWJsZS5pbmNsdWRlcyh0YXNrSW5kZXgpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJldC5zZXQodGFza0luZGV4LCByb3cpO1xuICAgICAgICByb3crKztcbiAgICAgIH0pO1xuICAgICAgcm93UmFuZ2VzLnNldChyZXNvdXJjZUluZGV4LCB7IHN0YXJ0OiBzdGFydE9mUm93LCBmaW5pc2g6IHJvdyB9KTtcbiAgICB9XG4gICk7XG4gIHJldC5zZXQoZmluaXNoVGFza0luZGV4LCByb3cpO1xuXG4gIHJldHVybiBvayh7XG4gICAgdGFza0luZGV4VG9Sb3c6IHJldCxcbiAgICByb3dSYW5nZXM6IHJvd1JhbmdlcyxcbiAgICByZXNvdXJjZURlZmluaXRpb246IHJlc291cmNlRGVmaW5pdGlvbixcbiAgfSk7XG59O1xuXG5jb25zdCBkcmF3U3dpbUxhbmVIaWdobGlnaHRzID0gKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgc2NhbGU6IFNjYWxlLFxuICByb3dSYW5nZXM6IE1hcDxudW1iZXIsIFJvd1JhbmdlPixcbiAgdG90YWxOdW1iZXJPZkRheXM6IG51bWJlcixcbiAgZ3JvdXBDb2xvcjogc3RyaW5nXG4pID0+IHtcbiAgY3R4LmZpbGxTdHlsZSA9IGdyb3VwQ29sb3I7XG5cbiAgbGV0IGdyb3VwID0gMDtcbiAgcm93UmFuZ2VzLmZvckVhY2goKHJvd1JhbmdlOiBSb3dSYW5nZSkgPT4ge1xuICAgIGNvbnN0IHRvcExlZnQgPSBzY2FsZS5mZWF0dXJlKFxuICAgICAgcm93UmFuZ2Uuc3RhcnQsXG4gICAgICAwLFxuICAgICAgRmVhdHVyZS5ncm91cEVudmVsb3BlU3RhcnRcbiAgICApO1xuICAgIGNvbnN0IGJvdHRvbVJpZ2h0ID0gc2NhbGUuZmVhdHVyZShcbiAgICAgIHJvd1JhbmdlLmZpbmlzaCxcbiAgICAgIHRvdGFsTnVtYmVyT2ZEYXlzICsgMSxcbiAgICAgIEZlYXR1cmUudGFza0VudmVsb3BlVG9wXG4gICAgKTtcbiAgICBncm91cCsrO1xuICAgIC8vIE9ubHkgaGlnaGxpZ2h0IGV2ZXJ5IG90aGVyIGdyb3VwIGJhY2tncm91ZCB3aXRoIHRoZSBncm91cENvbG9yLlxuICAgIGlmIChncm91cCAlIDIgPT0gMSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjdHguZmlsbFJlY3QoXG4gICAgICB0b3BMZWZ0LngsXG4gICAgICB0b3BMZWZ0LnksXG4gICAgICBib3R0b21SaWdodC54IC0gdG9wTGVmdC54LFxuICAgICAgYm90dG9tUmlnaHQueSAtIHRvcExlZnQueVxuICAgICk7XG4gIH0pO1xufTtcblxuY29uc3QgZHJhd1N3aW1MYW5lTGFiZWxzID0gKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgcmVzb3VyY2VEZWZpbml0aW9uOiBSZXNvdXJjZURlZmluaXRpb24sXG4gIHNjYWxlOiBTY2FsZSxcbiAgcm93UmFuZ2VzOiBNYXA8bnVtYmVyLCBSb3dSYW5nZT5cbikgPT4ge1xuICBpZiAocm93UmFuZ2VzKSBjdHgubGluZVdpZHRoID0gMTtcbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY29uc3QgZ3JvdXBCeU9yaWdpbiA9IHNjYWxlLmZlYXR1cmUoMCwgMCwgRmVhdHVyZS5ncm91cEJ5T3JpZ2luKTtcblxuICBpZiAob3B0cy5oYXNUaW1lbGluZSkge1xuICAgIGN0eC50ZXh0QmFzZWxpbmUgPSBcImJvdHRvbVwiO1xuICAgIGN0eC5maWxsVGV4dChvcHRzLmdyb3VwQnlSZXNvdXJjZSwgZ3JvdXBCeU9yaWdpbi54LCBncm91cEJ5T3JpZ2luLnkpO1xuICB9XG5cbiAgaWYgKG9wdHMuaGFzVGFza3MpIHtcbiAgICBjdHgudGV4dEJhc2VsaW5lID0gXCJ0b3BcIjtcbiAgICByb3dSYW5nZXMuZm9yRWFjaCgocm93UmFuZ2U6IFJvd1JhbmdlLCByZXNvdXJjZUluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGlmIChyb3dSYW5nZS5zdGFydCA9PT0gcm93UmFuZ2UuZmluaXNoKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHRleHRTdGFydCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgICAgIHJvd1JhbmdlLnN0YXJ0LFxuICAgICAgICAwLFxuICAgICAgICBGZWF0dXJlLmdyb3VwVGV4dFN0YXJ0XG4gICAgICApO1xuICAgICAgY3R4LmZpbGxUZXh0KFxuICAgICAgICByZXNvdXJjZURlZmluaXRpb24udmFsdWVzW3Jlc291cmNlSW5kZXhdLFxuICAgICAgICB0ZXh0U3RhcnQueCxcbiAgICAgICAgdGV4dFN0YXJ0LnlcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cbn07XG4iLCAiaW1wb3J0IHsgUmVzdWx0LCBvaywgZXJyb3IgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBUYXNrLCBDaGFydCwgQ2hhcnRWYWxpZGF0ZSB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgRGlyZWN0ZWRFZGdlLCBlZGdlc0J5U3JjQW5kRHN0VG9NYXAgfSBmcm9tIFwiLi4vZGFnL2RhZy50c1wiO1xuaW1wb3J0IHsgUm91bmRlciB9IGZyb20gXCIuLi90eXBlcy90eXBlcy50c1wiO1xuXG4vKiogU3BhbiByZXByZXNlbnRzIHdoZW4gYSB0YXNrIHdpbGwgYmUgZG9uZSwgaS5lLiBpdCBjb250YWlucyB0aGUgdGltZSB0aGUgdGFza1xuICogaXMgZXhwZWN0ZWQgdG8gYmVnaW4gYW5kIGVuZC4gKi9cbmV4cG9ydCBjbGFzcyBTcGFuIHtcbiAgc3RhcnQ6IG51bWJlcjtcbiAgZmluaXNoOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Ioc3RhcnQ6IG51bWJlciA9IDAsIGZpbmlzaDogbnVtYmVyID0gMCkge1xuICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcbiAgICB0aGlzLmZpbmlzaCA9IGZpbmlzaDtcbiAgfVxufVxuXG4vKiogVGhlIHN0YW5kYXJkIHNsYWNrIGNhbGN1bGF0aW9uIHZhbHVlcy4gKi9cbmV4cG9ydCBjbGFzcyBTbGFjayB7XG4gIGVhcmx5OiBTcGFuID0gbmV3IFNwYW4oKTtcbiAgbGF0ZTogU3BhbiA9IG5ldyBTcGFuKCk7XG4gIHNsYWNrOiBudW1iZXIgPSAwO1xufVxuXG5leHBvcnQgdHlwZSBUYXNrRHVyYXRpb24gPSAodDogVGFzaywgdGFza0luZGV4OiBudW1iZXIpID0+IG51bWJlcjtcblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRUYXNrRHVyYXRpb24gPSAodDogVGFzayk6IG51bWJlciA9PiB7XG4gIHJldHVybiB0LmR1cmF0aW9uO1xufTtcblxuZXhwb3J0IHR5cGUgU2xhY2tSZXN1bHQgPSBSZXN1bHQ8U2xhY2tbXT47XG5cbi8vIENhbGN1bGF0ZSB0aGUgc2xhY2sgZm9yIGVhY2ggVGFzayBpbiB0aGUgQ2hhcnQuXG5leHBvcnQgZnVuY3Rpb24gQ29tcHV0ZVNsYWNrKFxuICBjOiBDaGFydCxcbiAgdGFza0R1cmF0aW9uOiBUYXNrRHVyYXRpb24gPSBkZWZhdWx0VGFza0R1cmF0aW9uLFxuICByb3VuZDogUm91bmRlclxuKTogU2xhY2tSZXN1bHQge1xuICAvLyBDcmVhdGUgYSBTbGFjayBmb3IgZWFjaCBUYXNrLlxuICBjb25zdCBzbGFja3M6IFNsYWNrW10gPSBuZXcgQXJyYXkoYy5WZXJ0aWNlcy5sZW5ndGgpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGMuVmVydGljZXMubGVuZ3RoOyBpKyspIHtcbiAgICBzbGFja3NbaV0gPSBuZXcgU2xhY2soKTtcbiAgfVxuXG4gIGNvbnN0IHIgPSBDaGFydFZhbGlkYXRlKGMpO1xuICBpZiAoIXIub2spIHtcbiAgICByZXR1cm4gZXJyb3Ioci5lcnJvcik7XG4gIH1cblxuICBjb25zdCBlZGdlcyA9IGVkZ2VzQnlTcmNBbmREc3RUb01hcChjLkVkZ2VzKTtcblxuICBjb25zdCB0b3BvbG9naWNhbE9yZGVyID0gci52YWx1ZTtcblxuICAvLyBGaXJzdCBnbyBmb3J3YXJkIHRocm91Z2ggdGhlIHRvcG9sb2dpY2FsIHNvcnQgYW5kIGZpbmQgdGhlIGVhcmx5IHN0YXJ0IGZvclxuICAvLyBlYWNoIHRhc2ssIHdoaWNoIGlzIHRoZSBtYXggb2YgYWxsIHRoZSBwcmVkZWNlc3NvcnMgZWFybHkgZmluaXNoIHZhbHVlcy5cbiAgLy8gU2luY2Ugd2Uga25vdyB0aGUgZHVyYXRpb24gd2UgY2FuIGFsc28gY29tcHV0ZSB0aGUgZWFybHkgZmluaXNoLlxuICB0b3BvbG9naWNhbE9yZGVyLnNsaWNlKDEpLmZvckVhY2goKHZlcnRleEluZGV4OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCB0YXNrID0gYy5WZXJ0aWNlc1t2ZXJ0ZXhJbmRleF07XG4gICAgY29uc3Qgc2xhY2sgPSBzbGFja3NbdmVydGV4SW5kZXhdO1xuICAgIHNsYWNrLmVhcmx5LnN0YXJ0ID0gTWF0aC5tYXgoXG4gICAgICAuLi5lZGdlcy5ieURzdC5nZXQodmVydGV4SW5kZXgpIS5tYXAoKGU6IERpcmVjdGVkRWRnZSk6IG51bWJlciA9PiB7XG4gICAgICAgIGNvbnN0IHByZWRlY2Vzc29yU2xhY2sgPSBzbGFja3NbZS5pXTtcbiAgICAgICAgcmV0dXJuIHByZWRlY2Vzc29yU2xhY2suZWFybHkuZmluaXNoO1xuICAgICAgfSlcbiAgICApO1xuICAgIHNsYWNrLmVhcmx5LmZpbmlzaCA9IHJvdW5kKFxuICAgICAgc2xhY2suZWFybHkuc3RhcnQgKyB0YXNrRHVyYXRpb24odGFzaywgdmVydGV4SW5kZXgpXG4gICAgKTtcbiAgfSk7XG5cbiAgLy8gTm93IGJhY2t3YXJkcyB0aHJvdWdoIHRoZSB0b3BvbG9naWNhbCBzb3J0IGFuZCBmaW5kIHRoZSBsYXRlIGZpbmlzaCBvZiBlYWNoXG4gIC8vIHRhc2ssIHdoaWNoIGlzIHRoZSBtaW4gb2YgYWxsIHRoZSBzdWNjZXNzb3IgdGFza3MgbGF0ZSBzdGFydHMuIEFnYWluIHNpbmNlXG4gIC8vIHdlIGtub3cgdGhlIGR1cmF0aW9uIHdlIGNhbiBhbHNvIGNvbXB1dGUgdGhlIGxhdGUgc3RhcnQuIEZpbmFsbHksIHNpbmNlIHdlXG4gIC8vIG5vdyBoYXZlIGFsbCB0aGUgZWFybHkvbGF0ZSBhbmQgc3RhcnQvZmluaXNoIHZhbHVlcyB3ZSBjYW4gbm93IGNhbGN1YXRlIHRoZVxuICAvLyBzbGFjay5cbiAgdG9wb2xvZ2ljYWxPcmRlci5yZXZlcnNlKCkuZm9yRWFjaCgodmVydGV4SW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHRhc2sgPSBjLlZlcnRpY2VzW3ZlcnRleEluZGV4XTtcbiAgICBjb25zdCBzbGFjayA9IHNsYWNrc1t2ZXJ0ZXhJbmRleF07XG4gICAgY29uc3Qgc3VjY2Vzc29ycyA9IGVkZ2VzLmJ5U3JjLmdldCh2ZXJ0ZXhJbmRleCk7XG4gICAgaWYgKCFzdWNjZXNzb3JzKSB7XG4gICAgICBzbGFjay5sYXRlLmZpbmlzaCA9IHNsYWNrLmVhcmx5LmZpbmlzaDtcbiAgICAgIHNsYWNrLmxhdGUuc3RhcnQgPSBzbGFjay5lYXJseS5zdGFydDtcbiAgICB9IGVsc2Uge1xuICAgICAgc2xhY2subGF0ZS5maW5pc2ggPSBNYXRoLm1pbihcbiAgICAgICAgLi4uZWRnZXMuYnlTcmMuZ2V0KHZlcnRleEluZGV4KSEubWFwKChlOiBEaXJlY3RlZEVkZ2UpOiBudW1iZXIgPT4ge1xuICAgICAgICAgIGNvbnN0IHN1Y2Nlc3NvclNsYWNrID0gc2xhY2tzW2Uual07XG4gICAgICAgICAgcmV0dXJuIHN1Y2Nlc3NvclNsYWNrLmxhdGUuc3RhcnQ7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgICAgc2xhY2subGF0ZS5zdGFydCA9IHJvdW5kKFxuICAgICAgICBzbGFjay5sYXRlLmZpbmlzaCAtIHRhc2tEdXJhdGlvbih0YXNrLCB2ZXJ0ZXhJbmRleClcbiAgICAgICk7XG4gICAgICBzbGFjay5zbGFjayA9IHJvdW5kKHNsYWNrLmxhdGUuZmluaXNoIC0gc2xhY2suZWFybHkuZmluaXNoKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBvayhzbGFja3MpO1xufVxuXG5leHBvcnQgY29uc3QgQ3JpdGljYWxQYXRoID0gKHNsYWNrczogU2xhY2tbXSwgcm91bmQ6IFJvdW5kZXIpOiBudW1iZXJbXSA9PiB7XG4gIGNvbnN0IHJldDogbnVtYmVyW10gPSBbXTtcbiAgc2xhY2tzLmZvckVhY2goKHNsYWNrOiBTbGFjaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGlmIChcbiAgICAgIHJvdW5kKHNsYWNrLmxhdGUuZmluaXNoIC0gc2xhY2suZWFybHkuZmluaXNoKSA8IE51bWJlci5FUFNJTE9OICYmXG4gICAgICByb3VuZChzbGFjay5lYXJseS5maW5pc2ggLSBzbGFjay5lYXJseS5zdGFydCkgPiBOdW1iZXIuRVBTSUxPTlxuICAgICkge1xuICAgICAgcmV0LnB1c2goaW5kZXgpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiByZXQ7XG59O1xuIiwgIi8vIFdoZW4gYWRkaW5nIHByb3BlcnRpZXMgdG8gQ29sb3JUaGVtZSBhbHNvIG1ha2Ugc3VyZSB0byBhZGQgYSBjb3JyZXNwb25kaW5nXG4vLyBDU1MgQHByb3BlcnR5IGRlY2xhcmF0aW9uLlxuLy9cbi8vIE5vdGUgdGhhdCBlYWNoIHByb3BlcnR5IGFzc3VtZXMgdGhlIHByZXNlbmNlIG9mIGEgQ1NTIHZhcmlhYmxlIG9mIHRoZSBzYW1lIG5hbWVcbi8vIHdpdGggYSBwcmVjZWVkaW5nIGAtLWAuXG5leHBvcnQgaW50ZXJmYWNlIFRoZW1lIHtcbiAgc3VyZmFjZTogc3RyaW5nO1xuICBvblN1cmZhY2U6IHN0cmluZztcbiAgb25TdXJmYWNlTXV0ZWQ6IHN0cmluZztcbiAgb25TdXJmYWNlU2Vjb25kYXJ5OiBzdHJpbmc7XG4gIG92ZXJsYXk6IHN0cmluZztcbiAgZ3JvdXBDb2xvcjogc3RyaW5nO1xufVxuXG50eXBlIFRoZW1lUHJvcCA9IGtleW9mIFRoZW1lO1xuXG5jb25zdCBjb2xvclRoZW1lUHJvdG90eXBlOiBUaGVtZSA9IHtcbiAgc3VyZmFjZTogXCJcIixcbiAgb25TdXJmYWNlOiBcIlwiLFxuICBvblN1cmZhY2VNdXRlZDogXCJcIixcbiAgb25TdXJmYWNlU2Vjb25kYXJ5OiBcIlwiLFxuICBvdmVybGF5OiBcIlwiLFxuICBncm91cENvbG9yOiBcIlwiLFxufTtcblxuZXhwb3J0IGNvbnN0IGNvbG9yVGhlbWVGcm9tRWxlbWVudCA9IChlbGU6IEhUTUxFbGVtZW50KTogVGhlbWUgPT4ge1xuICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlKTtcbiAgY29uc3QgcmV0ID0gT2JqZWN0LmFzc2lnbih7fSwgY29sb3JUaGVtZVByb3RvdHlwZSk7XG4gIE9iamVjdC5rZXlzKHJldCkuZm9yRWFjaCgobmFtZTogc3RyaW5nKSA9PiB7XG4gICAgcmV0W25hbWUgYXMgVGhlbWVQcm9wXSA9IHN0eWxlLmdldFByb3BlcnR5VmFsdWUoYC0tJHtuYW1lfWApO1xuICB9KTtcbiAgcmV0dXJuIHJldDtcbn07XG4iLCAiLyoqIFdoZW4gdGhlIGdpdmVuIGVsZW1lbnQgaXMgY2xpY2tlZCwgdGhlbiB0b2dnbGUgdGhlIGBkYXJrbW9kZWAgY2xhc3Mgb24gdGhlXG4gKiBib2R5IGVsZW1lbnQuICovXG5leHBvcnQgY29uc3QgdG9nZ2xlVGhlbWUgPSAoKSA9PiB7XG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZShcImRhcmttb2RlXCIpO1xufTtcbiIsICJpbXBvcnQgeyBUYXNrIH0gZnJvbSBcIi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IEZpbHRlckZ1bmMgfSBmcm9tIFwiLi9jaGFydC9maWx0ZXIvZmlsdGVyLnRzXCI7XG5pbXBvcnQgeyBlZGdlc0J5U3JjQW5kRHN0VG9NYXAgfSBmcm9tIFwiLi9kYWcvZGFnLnRzXCI7XG5pbXBvcnQge1xuICBEdXBUYXNrT3AsXG4gIEluc2VydE5ld0VtcHR5VGFza0FmdGVyT3AsXG4gIFNldFRhc2tOYW1lT3AsXG4gIFNwbGl0VGFza09wLFxufSBmcm9tIFwiLi9vcHMvY2hhcnQudHNcIjtcbmltcG9ydCB7IFNldE1ldHJpY1ZhbHVlT3AgfSBmcm9tIFwiLi9vcHMvbWV0cmljcy50c1wiO1xuaW1wb3J0IHsgT3AsIGFwcGx5QWxsT3BzVG9QbGFuIH0gZnJvbSBcIi4vb3BzL29wcy50c1wiO1xuaW1wb3J0IHtcbiAgQWRkUmVzb3VyY2VPcCxcbiAgQWRkUmVzb3VyY2VPcHRpb25PcCxcbiAgU2V0UmVzb3VyY2VWYWx1ZU9wLFxufSBmcm9tIFwiLi9vcHMvcmVzb3VyY2VzLnRzXCI7XG5pbXBvcnQgeyBGcm9tSlNPTiwgUGxhbiB9IGZyb20gXCIuL3BsYW4vcGxhbi50c1wiO1xuaW1wb3J0IHsgUHJlY2lzaW9uIH0gZnJvbSBcIi4vcHJlY2lzaW9uL3ByZWNpc2lvbi50c1wiO1xuaW1wb3J0IHtcbiAgRElWSURFUl9NT1ZFX0VWRU5ULFxuICBEaXZpZGVyTW92ZSxcbiAgRGl2aWRlck1vdmVSZXN1bHQsXG59IGZyb20gXCIuL3JlbmRlcmVyL2RpdmlkZXJtb3ZlL2RpdmlkZXJtb3ZlLnRzXCI7XG5pbXBvcnQge1xuICBEUkFHX1JBTkdFX0VWRU5ULFxuICBEcmFnUmFuZ2UsXG4gIE1vdXNlTW92ZSxcbn0gZnJvbSBcIi4vcmVuZGVyZXIvbW91c2Vtb3ZlL21vdXNlbW92ZS50c1wiO1xuaW1wb3J0IHsgRGlzcGxheVJhbmdlIH0gZnJvbSBcIi4vcmVuZGVyZXIvcmFuZ2UvcmFuZ2UudHNcIjtcbmltcG9ydCB7XG4gIFJlbmRlck9wdGlvbnMsXG4gIFRhc2tMYWJlbCxcbiAgcmVuZGVyVGFza3NUb0NhbnZhcyxcbn0gZnJvbSBcIi4vcmVuZGVyZXIvcmVuZGVyZXIudHNcIjtcbmltcG9ydCB7IFNjYWxlIH0gZnJvbSBcIi4vcmVuZGVyZXIvc2NhbGUvc2NhbGUudHNcIjtcbmltcG9ydCB7IFJlc3VsdCB9IGZyb20gXCIuL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgQ29tcHV0ZVNsYWNrLCBDcml0aWNhbFBhdGgsIFNsYWNrLCBTcGFuIH0gZnJvbSBcIi4vc2xhY2svc2xhY2sudHNcIjtcbmltcG9ydCB7IEphY29iaWFuLCBVbmNlcnRhaW50eSB9IGZyb20gXCIuL3N0YXRzL2NkZi90cmlhbmd1bGFyL2phY29iaWFuLnRzXCI7XG5pbXBvcnQgeyBUaGVtZSwgY29sb3JUaGVtZUZyb21FbGVtZW50IH0gZnJvbSBcIi4vc3R5bGUvdGhlbWUvdGhlbWUudHNcIjtcbmltcG9ydCB7IHRvZ2dsZVRoZW1lIH0gZnJvbSBcIi4vc3R5bGUvdG9nZ2xlci90b2dnbGVyLnRzXCI7XG5cbmNvbnN0IEZPTlRfU0laRV9QWCA9IDMyO1xuXG5sZXQgcGxhbiA9IG5ldyBQbGFuKCk7XG5jb25zdCBwcmVjaXNpb24gPSBuZXcgUHJlY2lzaW9uKDIpO1xuXG5jb25zdCBybmRJbnQgPSAobjogbnVtYmVyKTogbnVtYmVyID0+IHtcbiAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG4pO1xufTtcblxuY29uc3QgRFVSQVRJT04gPSAxMDA7XG5cbmNvbnN0IHJuZER1cmF0aW9uID0gKCk6IG51bWJlciA9PiB7XG4gIHJldHVybiBybmRJbnQoRFVSQVRJT04pO1xufTtcblxuY29uc3QgcGVvcGxlOiBzdHJpbmdbXSA9IFtcIkZyZWRcIiwgXCJCYXJuZXlcIiwgXCJXaWxtYVwiLCBcIkJldHR5XCJdO1xuXG5sZXQgdGFza0lEID0gMDtcbmNvbnN0IHJuZE5hbWUgPSAoKTogc3RyaW5nID0+IGBUICR7dGFza0lEKyt9YDtcblxuY29uc3Qgb3BzOiBPcFtdID0gW0FkZFJlc291cmNlT3AoXCJQZXJzb25cIildO1xuXG5wZW9wbGUuZm9yRWFjaCgocGVyc29uOiBzdHJpbmcpID0+IHtcbiAgb3BzLnB1c2goQWRkUmVzb3VyY2VPcHRpb25PcChcIlBlcnNvblwiLCBwZXJzb24pKTtcbn0pO1xuXG5vcHMucHVzaChcbiAgSW5zZXJ0TmV3RW1wdHlUYXNrQWZ0ZXJPcCgwKSxcbiAgU2V0TWV0cmljVmFsdWVPcChcIkR1cmF0aW9uXCIsIHJuZER1cmF0aW9uKCksIDEpLFxuICBTZXRUYXNrTmFtZU9wKDEsIHJuZE5hbWUoKSksXG4gIFNldFJlc291cmNlVmFsdWVPcChcIlBlcnNvblwiLCBwZW9wbGVbcm5kSW50KHBlb3BsZS5sZW5ndGgpXSwgMSksXG4gIFNldFJlc291cmNlVmFsdWVPcChcIlVuY2VydGFpbnR5XCIsIFwibW9kZXJhdGVcIiwgMSlcbik7XG5cbmxldCBudW1UYXNrcyA9IDE7XG5mb3IgKGxldCBpID0gMDsgaSA8IDE1OyBpKyspIHtcbiAgbGV0IGluZGV4ID0gcm5kSW50KG51bVRhc2tzKSArIDE7XG4gIG9wcy5wdXNoKFxuICAgIFNwbGl0VGFza09wKGluZGV4KSxcbiAgICBTZXRNZXRyaWNWYWx1ZU9wKFwiRHVyYXRpb25cIiwgcm5kRHVyYXRpb24oKSwgaW5kZXggKyAxKSxcbiAgICBTZXRUYXNrTmFtZU9wKGluZGV4ICsgMSwgcm5kTmFtZSgpKSxcbiAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJQZXJzb25cIiwgcGVvcGxlW3JuZEludChwZW9wbGUubGVuZ3RoKV0sIGluZGV4ICsgMSksXG4gICAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiVW5jZXJ0YWludHlcIiwgXCJtb2RlcmF0ZVwiLCBpbmRleCArIDEpXG4gICk7XG4gIG51bVRhc2tzKys7XG4gIGluZGV4ID0gcm5kSW50KG51bVRhc2tzKSArIDE7XG4gIG9wcy5wdXNoKFxuICAgIER1cFRhc2tPcChpbmRleCksXG4gICAgU2V0TWV0cmljVmFsdWVPcChcIkR1cmF0aW9uXCIsIHJuZER1cmF0aW9uKCksIGluZGV4ICsgMSksXG4gICAgU2V0VGFza05hbWVPcChpbmRleCArIDEsIHJuZE5hbWUoKSksXG4gICAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiUGVyc29uXCIsIHBlb3BsZVtybmRJbnQocGVvcGxlLmxlbmd0aCldLCBpbmRleCArIDEpLFxuICAgIFNldFJlc291cmNlVmFsdWVPcChcIlVuY2VydGFpbnR5XCIsIFwibW9kZXJhdGVcIiwgaW5kZXggKyAxKVxuICApO1xuICBudW1UYXNrcysrO1xufVxuXG5jb25zdCByZXMgPSBhcHBseUFsbE9wc1RvUGxhbihvcHMsIHBsYW4pO1xuXG5pZiAoIXJlcy5vaykge1xuICBjb25zb2xlLmxvZyhyZXMuZXJyb3IpO1xufVxuXG5sZXQgc2xhY2tzOiBTbGFja1tdID0gW107XG5sZXQgc3BhbnM6IFNwYW5bXSA9IFtdO1xubGV0IGNyaXRpY2FsUGF0aDogbnVtYmVyW10gPSBbXTtcblxuY29uc3QgcmVjYWxjdWxhdGVTcGFuID0gKCkgPT4ge1xuICBjb25zdCBzbGFja1Jlc3VsdCA9IENvbXB1dGVTbGFjayhwbGFuLmNoYXJ0LCB1bmRlZmluZWQsIHByZWNpc2lvbi5yb3VuZGVyKCkpO1xuICBpZiAoIXNsYWNrUmVzdWx0Lm9rKSB7XG4gICAgY29uc29sZS5lcnJvcihzbGFja1Jlc3VsdCk7XG4gIH0gZWxzZSB7XG4gICAgc2xhY2tzID0gc2xhY2tSZXN1bHQudmFsdWU7XG4gIH1cblxuICBzcGFucyA9IHNsYWNrcy5tYXAoKHZhbHVlOiBTbGFjayk6IFNwYW4gPT4ge1xuICAgIHJldHVybiB2YWx1ZS5lYXJseTtcbiAgfSk7XG4gIGNyaXRpY2FsUGF0aCA9IENyaXRpY2FsUGF0aChzbGFja3MsIHByZWNpc2lvbi5yb3VuZGVyKCkpO1xufTtcblxucmVjYWxjdWxhdGVTcGFuKCk7XG5cbmNvbnN0IHRhc2tMYWJlbDogVGFza0xhYmVsID0gKHRhc2tJbmRleDogbnVtYmVyKTogc3RyaW5nID0+XG4gIGAke3BsYW4uY2hhcnQuVmVydGljZXNbdGFza0luZGV4XS5uYW1lfWA7XG4vLyAgYCR7cGxhbi5jaGFydC5WZXJ0aWNlc1t0YXNrSW5kZXhdLm5hbWV9ICgke3BsYW4uY2hhcnQuVmVydGljZXNbdGFza0luZGV4XS5yZXNvdXJjZXNbXCJQZXJzb25cIl19KSBgO1xuXG4vLyBEcmFnZ2luZyBvbiB0aGUgcmFkYXIuXG5cbi8vIFRPRE8gRXh0cmFjdCB0aGlzIGFzIGEgaGVscGVyIGZvciB0aGUgcmFkYXIgdmlldy5cbmxldCBkaXNwbGF5UmFuZ2U6IERpc3BsYXlSYW5nZSB8IG51bGwgPSBudWxsO1xubGV0IHNjYWxlOiBTY2FsZSB8IG51bGwgPSBudWxsO1xuXG5jb25zdCByYWRhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KFwiI3JhZGFyXCIpITtcbm5ldyBNb3VzZU1vdmUocmFkYXIpO1xuXG5jb25zdCBkcmFnUmFuZ2VIYW5kbGVyID0gKGU6IEN1c3RvbUV2ZW50PERyYWdSYW5nZT4pID0+IHtcbiAgaWYgKHNjYWxlID09PSBudWxsKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnNvbGUubG9nKFwibW91c2VcIiwgZS5kZXRhaWwpO1xuICBjb25zdCBiZWdpbiA9IHNjYWxlLmRheVJvd0Zyb21Qb2ludChlLmRldGFpbC5iZWdpbik7XG4gIGNvbnN0IGVuZCA9IHNjYWxlLmRheVJvd0Zyb21Qb2ludChlLmRldGFpbC5lbmQpO1xuICBkaXNwbGF5UmFuZ2UgPSBuZXcgRGlzcGxheVJhbmdlKGJlZ2luLmRheSwgZW5kLmRheSk7XG4gIGNvbnNvbGUubG9nKGRpc3BsYXlSYW5nZSk7XG4gIHBhaW50Q2hhcnQoKTtcbn07XG5cbnJhZGFyLmFkZEV2ZW50TGlzdGVuZXIoRFJBR19SQU5HRV9FVkVOVCwgZHJhZ1JhbmdlSGFuZGxlciBhcyBFdmVudExpc3RlbmVyKTtcblxuLy8gRGl2aWRlciBkcmFnZ2luZy5cbmNvbnN0IHdyYXBwZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihcIi53cmFwcGVyXCIpITtcbmNvbnN0IGRpdmlkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihcIiNkaXZpZGVyXCIpITtcbm5ldyBEaXZpZGVyTW92ZShkb2N1bWVudC5ib2R5LCBkaXZpZGVyKTtcblxuY29uc3QgZGl2aWRlckRyYWdSYW5nZUhhbmRsZXIgPSAoZTogQ3VzdG9tRXZlbnQ8RGl2aWRlck1vdmVSZXN1bHQ+KSA9PiB7XG4gIHdyYXBwZXIuc3R5bGUuc2V0UHJvcGVydHkoXG4gICAgXCJncmlkLXRlbXBsYXRlLWNvbHVtbnNcIixcbiAgICBgJHtlLmRldGFpbC5iZWZvcmV9JSAxMHB4IGF1dG9gXG4gICk7XG4gIHBhaW50Q2hhcnQoKTtcbiAgY29uc29sZS5sb2coXCJtb3VzZVwiLCBlLmRldGFpbC5iZWZvcmUsIGUuZGV0YWlsLmFmdGVyKTtcbn07XG5cbmRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcihcbiAgRElWSURFUl9NT1ZFX0VWRU5ULFxuICBkaXZpZGVyRHJhZ1JhbmdlSGFuZGxlciBhcyBFdmVudExpc3RlbmVyXG4pO1xuXG5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Jlc2V0LXpvb21cIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gIGRpc3BsYXlSYW5nZSA9IG51bGw7XG4gIHBhaW50Q2hhcnQoKTtcbn0pO1xuXG5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RhcmstbW9kZS10b2dnbGVcIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKFwiY2xpY2tcIik7XG4gIHRvZ2dsZVRoZW1lKCk7XG4gIHBhaW50Q2hhcnQoKTtcbn0pO1xuXG5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3JhZGFyLXRvZ2dsZVwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyYWRhci1wYXJlbnRcIikhLmNsYXNzTGlzdC50b2dnbGUoXCJoaWRkZW5cIik7XG59KTtcblxubGV0IHRvcFRpbWVsaW5lOiBib29sZWFuID0gZmFsc2U7XG5cbmRvY3VtZW50XG4gIC5xdWVyeVNlbGVjdG9yKFwiI3RvcC10aW1lbGluZS10b2dnbGVcIikhXG4gIC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIHRvcFRpbWVsaW5lID0gIXRvcFRpbWVsaW5lO1xuICAgIHBhaW50Q2hhcnQoKTtcbiAgfSk7XG5cbmxldCBncm91cEJ5T3B0aW9uczogc3RyaW5nW10gPSBbXCJcIiwgLi4uT2JqZWN0LmtleXMocGxhbi5yZXNvdXJjZURlZmluaXRpb25zKV07XG5sZXQgZ3JvdXBCeU9wdGlvbnNJbmRleDogbnVtYmVyID0gMDtcblxuY29uc3QgdG9nZ2xlR3JvdXBCeSA9ICgpID0+IHtcbiAgZ3JvdXBCeU9wdGlvbnNJbmRleCA9IChncm91cEJ5T3B0aW9uc0luZGV4ICsgMSkgJSBncm91cEJ5T3B0aW9ucy5sZW5ndGg7XG59O1xuXG5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dyb3VwLWJ5LXRvZ2dsZVwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgdG9nZ2xlR3JvdXBCeSgpO1xuICBwYWludENoYXJ0KCk7XG59KTtcblxubGV0IGNyaXRpY2FsUGF0aHNPbmx5ID0gZmFsc2U7XG5jb25zdCB0b2dnbGVDcml0aWNhbFBhdGhzT25seSA9ICgpID0+IHtcbiAgY3JpdGljYWxQYXRoc09ubHkgPSAhY3JpdGljYWxQYXRoc09ubHk7XG59O1xuXG5kb2N1bWVudFxuICAucXVlcnlTZWxlY3RvcihcIiNjcml0aWNhbC1wYXRocy10b2dnbGVcIikhXG4gIC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIHRvZ2dsZUNyaXRpY2FsUGF0aHNPbmx5KCk7XG4gICAgcGFpbnRDaGFydCgpO1xuICB9KTtcblxuY29uc3QgcGFpbnRDaGFydCA9ICgpID0+IHtcbiAgY29uc29sZS50aW1lKFwicGFpbnRDaGFydFwiKTtcblxuICBjb25zdCB0aGVtZUNvbG9yczogVGhlbWUgPSBjb2xvclRoZW1lRnJvbUVsZW1lbnQoZG9jdW1lbnQuYm9keSk7XG5cbiAgbGV0IGZpbHRlckZ1bmM6IEZpbHRlckZ1bmMgfCBudWxsID0gbnVsbDtcbiAgaWYgKGNyaXRpY2FsUGF0aHNPbmx5KSB7XG4gICAgY29uc3QgaGlnaGxpZ2h0U2V0ID0gbmV3IFNldChjcml0aWNhbFBhdGgpO1xuICAgIGNvbnN0IHN0YXJ0QW5kRmluaXNoID0gWzAsIHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMV07XG4gICAgZmlsdGVyRnVuYyA9ICh0YXNrOiBUYXNrLCB0YXNrSW5kZXg6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xuICAgICAgaWYgKHN0YXJ0QW5kRmluaXNoLmluY2x1ZGVzKHRhc2tJbmRleCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gaGlnaGxpZ2h0U2V0Lmhhcyh0YXNrSW5kZXgpO1xuICAgIH07XG4gIH1cblxuICBjb25zdCByYWRhck9wdHM6IFJlbmRlck9wdGlvbnMgPSB7XG4gICAgZm9udFNpemVQeDogNixcbiAgICBoYXNUZXh0OiBmYWxzZSxcbiAgICBkaXNwbGF5UmFuZ2U6IGRpc3BsYXlSYW5nZSxcbiAgICBkaXNwbGF5UmFuZ2VVc2FnZTogXCJoaWdobGlnaHRcIixcbiAgICBjb2xvcnM6IHtcbiAgICAgIHN1cmZhY2U6IHRoZW1lQ29sb3JzLnN1cmZhY2UsXG4gICAgICBvblN1cmZhY2U6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZSxcbiAgICAgIG9uU3VyZmFjZU11dGVkOiB0aGVtZUNvbG9ycy5vblN1cmZhY2VNdXRlZCxcbiAgICAgIG9uU3VyZmFjZUhpZ2hsaWdodDogdGhlbWVDb2xvcnMub25TdXJmYWNlU2Vjb25kYXJ5LFxuICAgICAgb3ZlcmxheTogdGhlbWVDb2xvcnMub3ZlcmxheSxcbiAgICAgIGdyb3VwQ29sb3I6IHRoZW1lQ29sb3JzLmdyb3VwQ29sb3IsXG4gICAgfSxcbiAgICBoYXNUaW1lbGluZTogZmFsc2UsXG4gICAgaGFzVGFza3M6IHRydWUsXG4gICAgaGFzRWRnZXM6IGZhbHNlLFxuICAgIGRyYXdUaW1lTWFya2Vyc09uVGFza3M6IGZhbHNlLFxuICAgIHRhc2tMYWJlbDogdGFza0xhYmVsLFxuICAgIHRhc2tIaWdobGlnaHRzOiBjcml0aWNhbFBhdGgsXG4gICAgZmlsdGVyRnVuYzogbnVsbCxcbiAgICBncm91cEJ5UmVzb3VyY2U6IGdyb3VwQnlPcHRpb25zW2dyb3VwQnlPcHRpb25zSW5kZXhdLFxuICB9O1xuXG4gIGNvbnN0IHpvb21PcHRzOiBSZW5kZXJPcHRpb25zID0ge1xuICAgIGZvbnRTaXplUHg6IEZPTlRfU0laRV9QWCxcbiAgICBoYXNUZXh0OiB0cnVlLFxuICAgIGRpc3BsYXlSYW5nZTogZGlzcGxheVJhbmdlLFxuICAgIGRpc3BsYXlSYW5nZVVzYWdlOiBcInJlc3RyaWN0XCIsXG4gICAgY29sb3JzOiB7XG4gICAgICBzdXJmYWNlOiB0aGVtZUNvbG9ycy5zdXJmYWNlLFxuICAgICAgb25TdXJmYWNlOiB0aGVtZUNvbG9ycy5vblN1cmZhY2UsXG4gICAgICBvblN1cmZhY2VNdXRlZDogdGhlbWVDb2xvcnMub25TdXJmYWNlTXV0ZWQsXG4gICAgICBvblN1cmZhY2VIaWdobGlnaHQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZVNlY29uZGFyeSxcbiAgICAgIG92ZXJsYXk6IHRoZW1lQ29sb3JzLm92ZXJsYXksXG4gICAgICBncm91cENvbG9yOiB0aGVtZUNvbG9ycy5ncm91cENvbG9yLFxuICAgIH0sXG4gICAgaGFzVGltZWxpbmU6IHRvcFRpbWVsaW5lLFxuICAgIGhhc1Rhc2tzOiB0cnVlLFxuICAgIGhhc0VkZ2VzOiB0cnVlLFxuICAgIGRyYXdUaW1lTWFya2Vyc09uVGFza3M6IHRydWUsXG4gICAgdGFza0xhYmVsOiB0YXNrTGFiZWwsXG4gICAgdGFza0hpZ2hsaWdodHM6IGNyaXRpY2FsUGF0aCxcbiAgICBmaWx0ZXJGdW5jOiBmaWx0ZXJGdW5jLFxuICAgIGdyb3VwQnlSZXNvdXJjZTogZ3JvdXBCeU9wdGlvbnNbZ3JvdXBCeU9wdGlvbnNJbmRleF0sXG4gIH07XG5cbiAgY29uc3QgdGltZWxpbmVPcHRzOiBSZW5kZXJPcHRpb25zID0ge1xuICAgIGZvbnRTaXplUHg6IEZPTlRfU0laRV9QWCxcbiAgICBoYXNUZXh0OiB0cnVlLFxuICAgIGRpc3BsYXlSYW5nZTogZGlzcGxheVJhbmdlLFxuICAgIGRpc3BsYXlSYW5nZVVzYWdlOiBcInJlc3RyaWN0XCIsXG4gICAgY29sb3JzOiB7XG4gICAgICBzdXJmYWNlOiB0aGVtZUNvbG9ycy5zdXJmYWNlLFxuICAgICAgb25TdXJmYWNlOiB0aGVtZUNvbG9ycy5vblN1cmZhY2UsXG4gICAgICBvblN1cmZhY2VNdXRlZDogdGhlbWVDb2xvcnMub25TdXJmYWNlTXV0ZWQsXG4gICAgICBvblN1cmZhY2VIaWdobGlnaHQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZVNlY29uZGFyeSxcbiAgICAgIG92ZXJsYXk6IHRoZW1lQ29sb3JzLm92ZXJsYXksXG4gICAgICBncm91cENvbG9yOiB0aGVtZUNvbG9ycy5ncm91cENvbG9yLFxuICAgIH0sXG4gICAgaGFzVGltZWxpbmU6IHRydWUsXG4gICAgaGFzVGFza3M6IGZhbHNlLFxuICAgIGhhc0VkZ2VzOiB0cnVlLFxuICAgIGRyYXdUaW1lTWFya2Vyc09uVGFza3M6IHRydWUsXG4gICAgdGFza0xhYmVsOiB0YXNrTGFiZWwsXG4gICAgdGFza0hpZ2hsaWdodHM6IGNyaXRpY2FsUGF0aCxcbiAgICBmaWx0ZXJGdW5jOiBmaWx0ZXJGdW5jLFxuICAgIGdyb3VwQnlSZXNvdXJjZTogZ3JvdXBCeU9wdGlvbnNbZ3JvdXBCeU9wdGlvbnNJbmRleF0sXG4gIH07XG5cbiAgcGFpbnRPbmVDaGFydChcIiN6b29tZWRcIiwgem9vbU9wdHMpO1xuICBwYWludE9uZUNoYXJ0KFwiI3RpbWVsaW5lXCIsIHRpbWVsaW5lT3B0cyk7XG4gIGNvbnN0IHJldCA9IHBhaW50T25lQ2hhcnQoXCIjcmFkYXJcIiwgcmFkYXJPcHRzKTtcblxuICBpZiAoIXJldC5vaykge1xuICAgIHJldHVybjtcbiAgfVxuICBzY2FsZSA9IHJldC52YWx1ZTtcbiAgY29uc29sZS50aW1lRW5kKFwicGFpbnRDaGFydFwiKTtcbn07XG5cbmNvbnN0IHBhaW50T25lQ2hhcnQgPSAoXG4gIGNhbnZhc0lEOiBzdHJpbmcsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnNcbik6IFJlc3VsdDxTY2FsZT4gPT4ge1xuICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxDYW52YXNFbGVtZW50PihjYW52YXNJRCkhO1xuICBjb25zdCBwYXJlbnQgPSBjYW52YXMhLnBhcmVudEVsZW1lbnQhO1xuICBjb25zdCByYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuICBjb25zdCB3aWR0aCA9IHBhcmVudC5jbGllbnRXaWR0aCAtIEZPTlRfU0laRV9QWDtcbiAgY29uc3QgaGVpZ2h0ID0gcGFyZW50LmNsaWVudEhlaWdodDtcbiAgY29uc3QgY2FudmFzV2lkdGggPSBNYXRoLmNlaWwod2lkdGggKiByYXRpbyk7XG4gIGNvbnN0IGNhbnZhc0hlaWdodCA9IE1hdGguY2VpbChoZWlnaHQgKiByYXRpbyk7XG4gIGNhbnZhcy53aWR0aCA9IGNhbnZhc1dpZHRoO1xuICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzSGVpZ2h0O1xuICBjYW52YXMuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGA7XG4gIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgO1xuXG4gIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIikhO1xuICBjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG5cbiAgcmV0dXJuIHJlbmRlclRhc2tzVG9DYW52YXMocGFyZW50LCBjYW52YXMsIGN0eCwgcGxhbiwgc3BhbnMsIG9wdHMpO1xufTtcblxuZXhwb3J0IGludGVyZmFjZSBDcml0aWNhbFBhdGhFbnRyeSB7XG4gIGNvdW50OiBudW1iZXI7XG4gIHRhc2tzOiBudW1iZXJbXTtcbiAgZHVyYXRpb25zOiBudW1iZXJbXTtcbn1cblxuY29uc3Qgc2ltdWxhdGUgPSAoKSA9PiB7XG4gIC8vIFNpbXVsYXRlIHRoZSB1bmNlcnRhaW50eSBpbiB0aGUgcGxhbiBhbmQgZ2VuZXJhdGUgcG9zc2libGUgYWx0ZXJuYXRlXG4gIC8vIGNyaXRpY2FsIHBhdGhzLlxuICBjb25zdCBNQVhfUkFORE9NID0gMTAwMDtcbiAgY29uc3QgTlVNX1NJTVVMQVRJT05fTE9PUFMgPSAxMDA7XG5cbiAgY29uc3QgYWxsQ3JpdGljYWxQYXRocyA9IG5ldyBNYXA8c3RyaW5nLCBDcml0aWNhbFBhdGhFbnRyeT4oKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IE5VTV9TSU1VTEFUSU9OX0xPT1BTOyBpKyspIHtcbiAgICBjb25zdCBkdXJhdGlvbnMgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLm1hcCgodDogVGFzaykgPT4ge1xuICAgICAgY29uc3QgcmF3RHVyYXRpb24gPSBuZXcgSmFjb2JpYW4oXG4gICAgICAgIHQuZHVyYXRpb24sXG4gICAgICAgIHQuZ2V0UmVzb3VyY2UoXCJVbmNlcnRhaW50eVwiKSBhcyBVbmNlcnRhaW50eVxuICAgICAgKS5zYW1wbGUocm5kSW50KE1BWF9SQU5ET00pIC8gTUFYX1JBTkRPTSk7XG4gICAgICByZXR1cm4gcHJlY2lzaW9uLnJvdW5kKHJhd0R1cmF0aW9uKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHNsYWNrc1JldCA9IENvbXB1dGVTbGFjayhcbiAgICAgIHBsYW4uY2hhcnQsXG4gICAgICAodDogVGFzaywgdGFza0luZGV4OiBudW1iZXIpID0+IGR1cmF0aW9uc1t0YXNrSW5kZXhdLFxuICAgICAgcHJlY2lzaW9uLnJvdW5kZXIoKVxuICAgICk7XG4gICAgaWYgKCFzbGFja3NSZXQub2spIHtcbiAgICAgIHRocm93IHNsYWNrc1JldC5lcnJvcjtcbiAgICB9XG4gICAgY29uc3QgY3JpdGljYWxQYXRoID0gQ3JpdGljYWxQYXRoKHNsYWNrc1JldC52YWx1ZSwgcHJlY2lzaW9uLnJvdW5kZXIoKSk7XG4gICAgY29uc3QgY3JpdGljYWxQYXRoQXNTdHJpbmcgPSBgJHtjcml0aWNhbFBhdGh9YDtcbiAgICBsZXQgcGF0aEVudHJ5ID0gYWxsQ3JpdGljYWxQYXRocy5nZXQoY3JpdGljYWxQYXRoQXNTdHJpbmcpO1xuICAgIGlmIChwYXRoRW50cnkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcGF0aEVudHJ5ID0ge1xuICAgICAgICBjb3VudDogMCxcbiAgICAgICAgdGFza3M6IGNyaXRpY2FsUGF0aCxcbiAgICAgICAgZHVyYXRpb25zOiBkdXJhdGlvbnMsXG4gICAgICB9O1xuICAgICAgYWxsQ3JpdGljYWxQYXRocy5zZXQoY3JpdGljYWxQYXRoQXNTdHJpbmcsIHBhdGhFbnRyeSk7XG4gICAgfVxuICAgIHBhdGhFbnRyeS5jb3VudCsrO1xuICB9XG5cbiAgbGV0IGRpc3BsYXkgPSBcIlwiO1xuICBhbGxDcml0aWNhbFBhdGhzLmZvckVhY2goKHZhbHVlOiBDcml0aWNhbFBhdGhFbnRyeSwga2V5OiBzdHJpbmcpID0+IHtcbiAgICBkaXNwbGF5ID0gZGlzcGxheSArIGBcXG4gPGxpIGRhdGEta2V5PSR7a2V5fT4ke3ZhbHVlLmNvdW50fSA6ICR7a2V5fTwvbGk+YDtcbiAgfSk7XG5cbiAgY29uc3QgY3JpdGlhbFBhdGhzID1cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxVTGlzdEVsZW1lbnQ+KFwiI2NyaXRpY2FsUGF0aHNcIikhO1xuICBjcml0aWFsUGF0aHMuaW5uZXJIVE1MID0gZGlzcGxheTtcblxuICAvLyBFbmFibGUgY2xpY2tpbmcgb24gYWx0ZXJuYXRlIGNyaXRpY2FsIHBhdGhzLlxuICBjcml0aWFsUGF0aHMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgY29uc3QgY3JpdGljYWxQYXRoRW50cnkgPSBhbGxDcml0aWNhbFBhdGhzLmdldChcbiAgICAgIChlLnRhcmdldCBhcyBIVE1MTElFbGVtZW50KS5kYXRhc2V0LmtleSFcbiAgICApITtcbiAgICBjcml0aWNhbFBhdGhFbnRyeS5kdXJhdGlvbnMuZm9yRWFjaChcbiAgICAgIChkdXJhdGlvbjogbnVtYmVyLCB0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tJbmRleF0uZHVyYXRpb24gPSBkdXJhdGlvbjtcbiAgICAgIH1cbiAgICApO1xuICAgIHJlY2FsY3VsYXRlU3BhbigpO1xuICAgIHBhaW50Q2hhcnQoKTtcbiAgfSk7XG5cbiAgLy8gR2VuZXJhdGUgYSB0YWJsZSBvZiB0YXNrcyBvbiB0aGUgY3JpdGljYWwgcGF0aCwgc29ydGVkIGJ5IGR1cmF0aW9uLCBhbG9uZ1xuICAvLyB3aXRoIHRoZWlyIHBlcmNlbnRhZ2UgY2hhbmNlIG9mIGFwcGVhcmluZyBvbiB0aGUgY3JpdGljYWwgcGF0aC5cblxuICBpbnRlcmZhY2UgQ3JpdGljYWxQYXRoVGFza0VudHJ5IHtcbiAgICB0YXNrSW5kZXg6IG51bWJlcjtcbiAgICBkdXJhdGlvbjogbnVtYmVyO1xuICAgIG51bVRpbWVzQXBwZWFyZWQ6IG51bWJlcjtcbiAgfVxuXG4gIGNvbnN0IGNyaXRpYWxUYXNrczogTWFwPG51bWJlciwgQ3JpdGljYWxQYXRoVGFza0VudHJ5PiA9IG5ldyBNYXAoKTtcblxuICBhbGxDcml0aWNhbFBhdGhzLmZvckVhY2goKHZhbHVlOiBDcml0aWNhbFBhdGhFbnRyeSkgPT4ge1xuICAgIHZhbHVlLnRhc2tzLmZvckVhY2goKHRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBsZXQgdGFza0VudHJ5ID0gY3JpdGlhbFRhc2tzLmdldCh0YXNrSW5kZXgpO1xuICAgICAgaWYgKHRhc2tFbnRyeSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRhc2tFbnRyeSA9IHtcbiAgICAgICAgICB0YXNrSW5kZXg6IHRhc2tJbmRleCxcbiAgICAgICAgICBkdXJhdGlvbjogcGxhbi5jaGFydC5WZXJ0aWNlc1t0YXNrSW5kZXhdLmR1cmF0aW9uLFxuICAgICAgICAgIG51bVRpbWVzQXBwZWFyZWQ6IDAsXG4gICAgICAgIH07XG4gICAgICAgIGNyaXRpYWxUYXNrcy5zZXQodGFza0luZGV4LCB0YXNrRW50cnkpO1xuICAgICAgfVxuICAgICAgdGFza0VudHJ5Lm51bVRpbWVzQXBwZWFyZWQgKz0gdmFsdWUuY291bnQ7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGNvbnN0IGNyaXRpY2FsVGFza3NEdXJhdGlvbkRlc2NlbmRpbmcgPSBbLi4uY3JpdGlhbFRhc2tzLnZhbHVlcygpXS5zb3J0KFxuICAgIChhOiBDcml0aWNhbFBhdGhUYXNrRW50cnksIGI6IENyaXRpY2FsUGF0aFRhc2tFbnRyeSk6IG51bWJlciA9PiB7XG4gICAgICByZXR1cm4gYi5kdXJhdGlvbiAtIGEuZHVyYXRpb247XG4gICAgfVxuICApO1xuXG4gIGxldCBjcml0aWFsVGFza3NUYWJsZSA9IGNyaXRpY2FsVGFza3NEdXJhdGlvbkRlc2NlbmRpbmdcbiAgICAubWFwKFxuICAgICAgKHRhc2tFbnRyeTogQ3JpdGljYWxQYXRoVGFza0VudHJ5KSA9PiBgPHRyPlxuICA8dGQ+JHtwbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tFbnRyeS50YXNrSW5kZXhdLm5hbWV9PC90ZD5cbiAgPHRkPiR7dGFza0VudHJ5LmR1cmF0aW9ufTwvdGQ+XG4gIDx0ZD4ke01hdGguZmxvb3IoKDEwMCAqIHRhc2tFbnRyeS5udW1UaW1lc0FwcGVhcmVkKSAvIE5VTV9TSU1VTEFUSU9OX0xPT1BTKX08L3RkPlxuPC90cj5gXG4gICAgKVxuICAgIC5qb2luKFwiXFxuXCIpO1xuICBjcml0aWFsVGFza3NUYWJsZSA9XG4gICAgYDx0cj48dGg+TmFtZTwvdGg+PHRoPkR1cmF0aW9uPC90aD48dGg+JTwvdGg+PC90cj5cXG5gICsgY3JpdGlhbFRhc2tzVGFibGU7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY3JpdGljYWxUYXNrc1wiKSEuaW5uZXJIVE1MID0gY3JpdGlhbFRhc2tzVGFibGU7XG5cbiAgLy8gU2hvdyBhbGwgdGFza3MgdGhhdCBjb3VsZCBiZSBvbiB0aGUgY3JpdGljYWwgcGF0aC5cbiAgcmVjYWxjdWxhdGVTcGFuKCk7XG4gIGNyaXRpY2FsUGF0aCA9IGNyaXRpY2FsVGFza3NEdXJhdGlvbkRlc2NlbmRpbmcubWFwKFxuICAgICh0YXNrRW50cnk6IENyaXRpY2FsUGF0aFRhc2tFbnRyeSkgPT4gdGFza0VudHJ5LnRhc2tJbmRleFxuICApO1xuICBwYWludENoYXJ0KCk7XG5cbiAgLy8gUG9wdWxhdGUgdGhlIGRvd25sb2FkIGxpbmsuXG4gIGNvbnN0IGRvd25sb2FkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MTGlua0VsZW1lbnQ+KFwiI2Rvd25sb2FkXCIpITtcbiAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkocGxhbiwgbnVsbCwgXCIgIFwiKSk7XG4gIGNvbnN0IGRvd25sb2FkQmxvYiA9IG5ldyBCbG9iKFtKU09OLnN0cmluZ2lmeShwbGFuLCBudWxsLCBcIiAgXCIpXSwge1xuICAgIHR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICB9KTtcbiAgZG93bmxvYWQuaHJlZiA9IFVSTC5jcmVhdGVPYmplY3RVUkwoZG93bmxvYWRCbG9iKTtcbn07XG5cbi8vIFJlYWN0IHRvIHRoZSB1cGxvYWQgaW5wdXQuXG5jb25zdCBmaWxlVXBsb2FkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MSW5wdXRFbGVtZW50PihcIiNmaWxlLXVwbG9hZFwiKSE7XG5maWxlVXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgYXN5bmMgKCkgPT4ge1xuICBjb25zdCBqc29uID0gYXdhaXQgZmlsZVVwbG9hZC5maWxlcyFbMF0udGV4dCgpO1xuICBjb25zdCByZXQgPSBGcm9tSlNPTihqc29uKTtcbiAgaWYgKCFyZXQub2spIHtcbiAgICBjb25zb2xlLmxvZyhyZXQuZXJyb3IpO1xuICAgIHRocm93IHJldC5lcnJvcjtcbiAgfVxuICBwbGFuID0gcmV0LnZhbHVlO1xuICBncm91cEJ5T3B0aW9ucyA9IFtcIlwiLCAuLi5PYmplY3Qua2V5cyhwbGFuLnJlc291cmNlRGVmaW5pdGlvbnMpXTtcbiAgcmVjYWxjdWxhdGVTcGFuKCk7XG4gIHNpbXVsYXRlKCk7XG4gIGNvbnN0IG1hcHMgPSBlZGdlc0J5U3JjQW5kRHN0VG9NYXAocGxhbi5jaGFydC5FZGdlcyk7XG4gIGNvbnNvbGUubG9nKG1hcHMpO1xuICBjb25zb2xlLmxvZyhwbGFuKTtcbiAgcGFpbnRDaGFydCgpO1xufSk7XG5cbmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2ltdWxhdGVcIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gIHNpbXVsYXRlKCk7XG4gIHBhaW50Q2hhcnQoKTtcbn0pO1xuXG5zaW11bGF0ZSgpO1xucGFpbnRDaGFydCgpO1xud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgcGFpbnRDaGFydCk7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7QUFpQk8sTUFBTSxlQUFOLE1BQW1CO0FBQUEsSUFDeEIsSUFBWTtB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SSxLQUFLLFVBQVUsTUFBTSxNQUFNLElBQUksQ0FBQztBQUM1QyxVQUFNLGVBQWUsSUFBSSxLQUFLLENBQUMsS0FBSyxVQUFVLE1BQU0sTUFBTSxJQUFJLENBQUMsR0FBRztBQUFBLE1BQ2hFLE1BQU07QUFBQSxJQUNSLENBQUM7QUFDRCxhQUFTLE9BQU8sSUFBSSxnQkFBZ0IsWUFBWTtBQUFBLEVBQ2xEO0FBR0EsTUFBTSxhQUFhLFNBQVMsY0FBZ0MsY0FBYztBQUMxRSxhQUFXLGlCQUFpQixVQUFVLFlBQVk7QUFDaEQsVUFBTSxPQUFPLE1BQU0sV0FBVyxNQUFPLENBQUMsRUFBRSxLQUFLO0FBQzdDLFVBQU0sTUFBTSxTQUFTLElBQUk7QUFDekIsUUFBSSxDQUFDLElBQUksSUFBSTtBQUNYLGNBQVEsSUFBSSxJQUFJLEtBQUs7QUFDckIsWUFBTSxJQUFJO0FBQUEsSUFDWjtBQUNBLFdBQU8sSUFBSTtBQUNYLHFCQUFpQixDQUFDLElBQUksR0FBRyxPQUFPLEtBQUssS0FBSyxtQkFBbUIsQ0FBQztBQUM5RCxvQkFBZ0I7QUFDaEIsYUFBUztBQUNULFVBQU0sT0FBTyxzQkFBc0IsS0FBSyxNQUFNLEtBQUs7QUFDbkQsWUFBUSxJQUFJLElBQUk7QUFDaEIsWUFBUSxJQUFJLElBQUk7QUFDaEIsZUFBVztBQUFBLEVBQ2IsQ0FBQztBQUVELFdBQVMsY0FBYyxXQUFXLEVBQUcsaUJBQWlCLFNBQVMsTUFBTTtBQUNuRSxhQUFTO0FBQ1QsZUFBVztBQUFBLEVBQ2IsQ0FBQztBQUVELFdBQVM7QUFDVCxhQUFXO0FBQ1gsU0FBTyxpQkFBaUIsVUFBVSxVQUFVOyIsCiAgIm5hbWVzIjogWyJwbGFuIiwgInJlcyIsICJvcHMiLCAicGxhbiIsICJwbGFuIiwgInBsYW4iLCAicGxhbiIsICJvayIsICJwcmVjaXNpb24iLCAicHJlY2lzaW9uIiwgInBsYW4iLCAiZGl2aWRlciIsICJzcGFucyIsICJzcGFucyIsICJwbGFuIiwgInNjYWxlIiwgInJvdyIsICJzbGFja3MiLCAiY3JpdGljYWxQYXRoIl0KfQo=
