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
    const taskHighlights = new Set(opts.taskHighlights);
    let maxGroupNameLength = 0;
    if (opts.groupByResource !== "" && opts.hasText) {
      maxGroupNameLength = opts.groupByResource.length;
      const resourceDefinition2 = plan2.getResourceDefinition(opts.groupByResource);
      if (resourceDefinition2 !== void 0) {
        resourceDefinition2.values.forEach((value) => {
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
    const tiret = taskIndexToRowFromGroupBy(opts, plan2);
    if (!tiret.ok) {
      return tiret;
    }
    const taskIndexToRow = tiret.value.taskIndexToRow;
    const rowRanges = tiret.value.rowRanges;
    const resourceDefinition = tiret.value.resourceDefinition;
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
      if (resourceDefinition !== null && opts.hasText) {
        drawSwimLaneLabels(ctx, opts, resourceDefinition, scale2, rowRanges);
      }
    }
    ctx.fillStyle = opts.colors.onSurface;
    ctx.strokeStyle = opts.colors.onSurface;
    ctx.save();
    ctx.clip(clipRegion);
    plan2.chart.Vertices.forEach((task, taskIndex) => {
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
          drawTaskText(ctx, opts, scale2, row, span, task, taskIndex, clipWidth);
        }
      }
    });
    ctx.lineWidth = 1;
    ctx.strokeStyle = opts.colors.onSurfaceMuted;
    if (opts.hasEdges && opts.hasTasks) {
      const highlightedEdges = [];
      const normalEdges = [];
      plan2.chart.Edges.forEach((e) => {
        if (opts.taskHighlights.includes(e.i) && opts.taskHighlights.includes(e.j)) {
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
        plan2.chart.Vertices,
        scale2,
        taskIndexToRow,
        arrowHeadWidth,
        arrowHeadHeight
      );
      ctx.strokeStyle = opts.colors.onSurfaceHighlight;
      drawEdges(
        ctx,
        opts,
        highlightedEdges,
        spans2,
        plan2.chart.Vertices,
        scale2,
        taskIndexToRow,
        arrowHeadWidth,
        arrowHeadHeight
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
  function drawEdges(ctx, opts, edges, spans2, tasks, scale2, taskIndexToRow, arrowHeadWidth, arrowHeadHeight) {
    edges.forEach((e) => {
      const srcSlack = spans2[e.i];
      const dstSlack = spans2[e.j];
      const srcTask = tasks[e.i];
      const dstTask = tasks[e.j];
      const srcRow = taskIndexToRow.get(e.i);
      const dstRow = taskIndexToRow.get(e.j);
      const srcDay = srcSlack.finish;
      const dstDay = dstSlack.start;
      if (opts.taskHighlights.includes(e.i) && opts.taskHighlights.includes(e.j)) {
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
  function drawTaskText(ctx, opts, scale2, row, span, task, taskIndex, clipWidth) {
    if (!opts.hasText) {
      return;
    }
    const label = opts.taskLabel(taskIndex);
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
    ctx.fillText(
      opts.taskLabel(taskIndex),
      textStart.x + xPixelDelta,
      textStart.y
    );
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
  var taskIndexToRowFromGroupBy = (opts, plan2) => {
    const vret = validateChart(plan2.chart);
    if (!vret.ok) {
      return vret;
    }
    const topologicalOrder = vret.value;
    const resource = plan2.getResourceDefinition(opts.groupByResource);
    const taskIndexToRow = new Map(
      // This looks backwards, but it isn't. Remember that the map callback takes
      // (value, index) as its arguments.
      topologicalOrder.map((taskIndex, row2) => [taskIndex, row2])
    );
    if (resource === void 0) {
      return ok({
        taskIndexToRow,
        rowRanges: null,
        resourceDefinition: null
      });
    }
    const startTaskIndex = 0;
    const finishTaskIndex = plan2.chart.Vertices.length - 1;
    const ignorable = [startTaskIndex, finishTaskIndex];
    const groups = /* @__PURE__ */ new Map();
    topologicalOrder.forEach((taskIndex) => {
      const resourceValue = plan2.chart.Vertices[taskIndex].getResource(opts.groupByResource) || "";
      const groupMembers = groups.get(resourceValue) || [];
      groupMembers.push(taskIndex);
      groups.set(resourceValue, groupMembers);
    });
    const ret = /* @__PURE__ */ new Map();
    ret.set(0, 0);
    let row = 1;
    const rowRanges = /* @__PURE__ */ new Map();
    resource.values.forEach((resourceValue, resourceIndex) => {
      const startOfRow = row;
      (groups.get(resourceValue) || []).forEach((taskIndex) => {
        if (ignorable.includes(taskIndex)) {
          return;
        }
        ret.set(taskIndex, row);
        row++;
      });
      rowRanges.set(resourceIndex, { start: startOfRow, finish: row });
    });
    ret.set(finishTaskIndex, row);
    return ok({
      taskIndexToRow: ret,
      rowRanges,
      resourceDefinition: resource
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
  var DURATION = 1e3;
  var rndDuration = () => {
    return rndInt(DURATION);
  };
  var people = ["Fred", "Barney", "Wilma", "Betty"];
  var rndName = () => `${String.fromCharCode(65 + rndInt(26))}`;
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
  var paintChart = () => {
    console.time("paintChart");
    const themeColors = colorThemeFromElement(document.body);
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
      filterFunc: null,
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
      filterFunc: null,
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
    const { width, height } = parent.getBoundingClientRect();
    const canvasWidth = Math.ceil(width * ratio);
    const canvasHeight = Math.ceil(height * ratio);
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    if (1) {
      const newHeight = suggestedCanvasHeight(
        canvas,
        spans,
        opts,
        plan.chart.Vertices.length + 2
        // TODO - Why do we need the +2 here!?
      );
      canvas.height = newHeight;
      canvas.style.height = `${newHeight / ratio}px`;
    }
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
 <li data-key=${key}>${value.count} : ${key} : ${value.durations.join(", ")}</li>`;
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
  simulate();
  paintChart();
  window.addEventListener("resize", paintChart);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2RhZy9kYWcudHMiLCAiLi4vc3JjL3Jlc3VsdC50cyIsICIuLi9zcmMvb3BzL29wcy50cyIsICIuLi9zcmMvb3BzL2NoYXJ0LnRzIiwgIi4uL3NyYy9vcHMvbWV0cmljcy50cyIsICIuLi9zcmMvcmVzb3VyY2VzL3Jlc291cmNlcy50cyIsICIuLi9zcmMvb3BzL3Jlc291cmNlcy50cyIsICIuLi9zcmMvZGFnL2FsZ29yaXRobXMvdG9wb3NvcnQudHMiLCAiLi4vc3JjL2NoYXJ0L2NoYXJ0LnRzIiwgIi4uL3NyYy9wcmVjaXNpb24vcHJlY2lzaW9uLnRzIiwgIi4uL3NyYy9tZXRyaWNzL3JhbmdlLnRzIiwgIi4uL3NyYy9tZXRyaWNzL21ldHJpY3MudHMiLCAiLi4vc3JjL3N0YXRzL2NkZi90cmlhbmd1bGFyL3RyaWFuZ3VsYXIudHMiLCAiLi4vc3JjL3N0YXRzL2NkZi90cmlhbmd1bGFyL2phY29iaWFuLnRzIiwgIi4uL3NyYy9wbGFuL3BsYW4udHMiLCAiLi4vc3JjL3JlbmRlcmVyL3NjYWxlL3BvaW50LnRzIiwgIi4uL3NyYy9yZW5kZXJlci9tb3VzZW1vdmUvbW91c2Vtb3ZlLnRzIiwgIi4uL3NyYy9yZW5kZXJlci9yYW5nZS9yYW5nZS50cyIsICIuLi9zcmMvcmVuZGVyZXIvc2NhbGUvc2NhbGUudHMiLCAiLi4vc3JjL3JlbmRlcmVyL3JlbmRlcmVyLnRzIiwgIi4uL3NyYy9zbGFjay9zbGFjay50cyIsICIuLi9zcmMvc3R5bGUvdGhlbWUvdGhlbWUudHMiLCAiLi4vc3JjL3N0eWxlL3RvZ2dsZXIvdG9nZ2xlci50cyIsICIuLi9zcmMvcGFnZS50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqIE9uZSB2ZXJ0ZXggb2YgYSBncmFwaC4gKi9cbmV4cG9ydCB0eXBlIFZlcnRleCA9IG9iamVjdDtcblxuLyoqIEV2ZXJ5IFZlcnRleCBpbiBhIGdyYXBoLiAqL1xuZXhwb3J0IHR5cGUgVmVydGljZXMgPSBWZXJ0ZXhbXTtcblxuLyoqIEEgc3Vic2V0IG9mIFZlcnRpY2VzIHJlZmVycmVkIHRvIGJ5IHRoZWlyIGluZGV4IG51bWJlci4gKi9cbmV4cG9ydCB0eXBlIFZlcnRleEluZGljZXMgPSBudW1iZXJbXTtcblxuZXhwb3J0IGludGVyZmFjZSBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkIHtcbiAgaTogbnVtYmVyO1xuICBqOiBudW1iZXI7XG59XG5cbi8qKiBPbmUgZWRnZSBvZiBhIGdyYXBoLCB3aGljaCBpcyBhIGRpcmVjdGVkIGNvbm5lY3Rpb24gZnJvbSB0aGUgaSd0aCBWZXJ0ZXggdG9cbnRoZSBqJ3RoIFZlcnRleCwgd2hlcmUgdGhlIFZlcnRleCBpcyBzdG9yZWQgaW4gYSBWZXJ0aWNlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIERpcmVjdGVkRWRnZSB7XG4gIGk6IG51bWJlciA9IDA7XG4gIGo6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoaTogbnVtYmVyID0gMCwgajogbnVtYmVyID0gMCkge1xuICAgIHRoaXMuaSA9IGk7XG4gICAgdGhpcy5qID0gajtcbiAgfVxuXG4gIGVxdWFsKHJoczogRGlyZWN0ZWRFZGdlKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHJocy5pID09PSB0aGlzLmkgJiYgcmhzLmogPT09IHRoaXMuajtcbiAgfVxuXG4gIHRvSlNPTigpOiBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgaTogdGhpcy5pLFxuICAgICAgajogdGhpcy5qLFxuICAgIH07XG4gIH1cbn1cblxuLyoqIEV2ZXJ5IEVnZGUgaW4gYSBncmFwaC4gKi9cbmV4cG9ydCB0eXBlIEVkZ2VzID0gRGlyZWN0ZWRFZGdlW107XG5cbi8qKiBBIGdyYXBoIGlzIGp1c3QgYSBjb2xsZWN0aW9uIG9mIFZlcnRpY2VzIGFuZCBFZGdlcyBiZXR3ZWVuIHRob3NlIHZlcnRpY2VzLiAqL1xuZXhwb3J0IHR5cGUgRGlyZWN0ZWRHcmFwaCA9IHtcbiAgVmVydGljZXM6IFZlcnRpY2VzO1xuICBFZGdlczogRWRnZXM7XG59O1xuXG4vKipcbiBHcm91cHMgdGhlIEVkZ2VzIGJ5IHRoZWlyIGBpYCB2YWx1ZS5cblxuIEBwYXJhbSBlZGdlcyAtIEFsbCB0aGUgRWdlcyBpbiBhIERpcmVjdGVkR3JhcGguXG4gQHJldHVybnMgQSBtYXAgZnJvbSB0aGUgVmVydGV4IGluZGV4IHRvIGFsbCB0aGUgRWRnZXMgdGhhdCBzdGFydCBhdFxuICAgYXQgdGhhdCBWZXJ0ZXggaW5kZXguXG4gKi9cbmV4cG9ydCBjb25zdCBlZGdlc0J5U3JjVG9NYXAgPSAoZWRnZXM6IEVkZ2VzKTogTWFwPG51bWJlciwgRWRnZXM+ID0+IHtcbiAgY29uc3QgcmV0ID0gbmV3IE1hcDxudW1iZXIsIEVkZ2VzPigpO1xuXG4gIGVkZ2VzLmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgIGNvbnN0IGFyciA9IHJldC5nZXQoZS5pKSB8fCBbXTtcbiAgICBhcnIucHVzaChlKTtcbiAgICByZXQuc2V0KGUuaSwgYXJyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJldDtcbn07XG5cbi8qKlxuICAgR3JvdXBzIHRoZSBFZGdlcyBieSB0aGVpciBgamAgdmFsdWUuXG4gIFxuICAgQHBhcmFtIGVkZ2VzIC0gQWxsIHRoZSBFZGdlcyBpbiBhIERpcmVjdGVkR3JhcGguXG4gICBAcmV0dXJucyBBIG1hcCBmcm9tIHRoZSBWZXJ0ZXggaW5kZXggdG8gYWxsIHRoZSBFZGdlcyB0aGF0IGVuZCBhdFxuICAgICBhdCB0aGF0IFZlcnRleCBpbmRleC5cbiAgICovXG5cbmV4cG9ydCBjb25zdCBlZGdlc0J5RHN0VG9NYXAgPSAoZWRnZXM6IEVkZ2VzKTogTWFwPG51bWJlciwgRWRnZXM+ID0+IHtcbiAgY29uc3QgcmV0ID0gbmV3IE1hcDxudW1iZXIsIEVkZ2VzPigpO1xuXG4gIGVkZ2VzLmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgIGNvbnN0IGFyciA9IHJldC5nZXQoZS5qKSB8fCBbXTtcbiAgICBhcnIucHVzaChlKTtcbiAgICByZXQuc2V0KGUuaiwgYXJyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJldDtcbn07XG5cbmV4cG9ydCB0eXBlIFNyY0FuZERzdFJldHVybiA9IHtcbiAgYnlTcmM6IE1hcDxudW1iZXIsIEVkZ2VzPjtcbiAgYnlEc3Q6IE1hcDxudW1iZXIsIEVkZ2VzPjtcbn07XG5cbmV4cG9ydCBjb25zdCBlZGdlc0J5U3JjQW5kRHN0VG9NYXAgPSAoZWRnZXM6IEVkZ2VzKTogU3JjQW5kRHN0UmV0dXJuID0+IHtcbiAgY29uc3QgcmV0ID0ge1xuICAgIGJ5U3JjOiBuZXcgTWFwPG51bWJlciwgRWRnZXM+KCksXG4gICAgYnlEc3Q6IG5ldyBNYXA8bnVtYmVyLCBFZGdlcz4oKSxcbiAgfTtcblxuICBlZGdlcy5mb3JFYWNoKChlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICBsZXQgYXJyID0gcmV0LmJ5U3JjLmdldChlLmkpIHx8IFtdO1xuICAgIGFyci5wdXNoKGUpO1xuICAgIHJldC5ieVNyYy5zZXQoZS5pLCBhcnIpO1xuICAgIGFyciA9IHJldC5ieURzdC5nZXQoZS5qKSB8fCBbXTtcbiAgICBhcnIucHVzaChlKTtcbiAgICByZXQuYnlEc3Quc2V0KGUuaiwgYXJyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJldDtcbn07XG4iLCAiLyoqIFJlc3VsdCBhbGxvd3MgZWFzaWVyIGhhbmRsaW5nIG9mIHJldHVybmluZyBlaXRoZXIgYW4gZXJyb3Igb3IgYSB2YWx1ZSBmcm9tIGFcbiAqIGZ1bmN0aW9uLiAqL1xuZXhwb3J0IHR5cGUgUmVzdWx0PFQ+ID0geyBvazogdHJ1ZTsgdmFsdWU6IFQgfSB8IHsgb2s6IGZhbHNlOyBlcnJvcjogRXJyb3IgfTtcblxuZXhwb3J0IGZ1bmN0aW9uIG9rPFQ+KHZhbHVlOiBUKTogUmVzdWx0PFQ+IHtcbiAgcmV0dXJuIHsgb2s6IHRydWUsIHZhbHVlOiB2YWx1ZSB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXJyb3I8VD4odmFsdWU6IHN0cmluZyB8IEVycm9yKTogUmVzdWx0PFQ+IHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IG5ldyBFcnJvcih2YWx1ZSkgfTtcbiAgfVxuICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiB2YWx1ZSB9O1xufVxuIiwgImltcG9ydCB7IFJlc3VsdCwgb2sgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhbi50c1wiO1xuXG4vLyBPcGVyYXRpb25zIG9uIFBsYW5zLiBOb3RlIHRoZXkgYXJlIHJldmVyc2libGUsIHNvIHdlIGNhbiBoYXZlIGFuICd1bmRvJyBsaXN0LlxuXG4vLyBBbHNvLCBzb21lIG9wZXJhdGlvbnMgbWlnaHQgaGF2ZSAncGFydGlhbHMnLCBpLmUuIHJldHVybiBhIGxpc3Qgb2YgdmFsaWRcbi8vIG9wdGlvbnMgdGhhdCBjYW4gYmUgcGFzc2VkIHRvIHRoZSBvcGVyYXRpb24uIEZvciBleGFtcGxlLCBhZGRpbmcgYVxuLy8gcHJlZGVjZXNzb3IgY291bGQgbGlzdCBhbGwgdGhlIFRhc2tzIHRoYXQgd291bGQgbm90IGZvcm0gYSBsb29wLCBpLmUuIGV4Y2x1ZGVcbi8vIGFsbCBkZXNjZW5kZW50cywgYW5kIHRoZSBUYXNrIGl0c2VsZiwgZnJvbSB0aGUgbGlzdCBvZiBvcHRpb25zLlxuLy9cbi8vICogQ2hhbmdlIHN0cmluZyB2YWx1ZSBpbiBhIFRhc2suXG4vLyAqIENoYW5nZSBkdXJhdGlvbiB2YWx1ZSBpbiBhIFRhc2suXG4vLyAqIEluc2VydCBuZXcgZW1wdHkgVGFzayBhZnRlciBJbmRleC5cbi8vICogU3BsaXQgYSBUYXNrLiAoUHJlZGVjZXNzb3IgdGFrZXMgYWxsIGluY29taW5nIGVkZ2VzLCBzb3VyY2UgdGFza3MgYWxsIG91dGdvaW5nIGVkZ2VzKS5cbi8vXG4vLyAqIER1cGxpY2F0ZSBhIFRhc2sgKGFsbCBlZGdlcyBhcmUgZHVwbGljYXRlZCBmcm9tIHRoZSBzb3VyY2UgVGFzaykuXG4vLyAqIERlbGV0ZSBwcmVkZWNlc3NvciB0byBhIFRhc2suXG4vLyAqIERlbGV0ZSBzdWNjZXNzb3IgdG8gYSBUYXNrLlxuLy8gKiBEZWxldGUgYSBUYXNrLlxuXG4vLyBOZWVkIFVuZG8vUmVkbyBTdGFja3MuXG4vLyBUaGVzZSByZWNvcmQgdGhlIHN1Yi1vcHMgZm9yIGVhY2ggbGFyZ2Ugb3AuIEUuZy4gYW4gaW5zZXJ0IHRhc2sgb3AgaXMgbWFkZVxuLy8gb2YgdGhyZWUgc3ViLW9wczpcbi8vICAgIDEuIGluc2VydCB0YXNrIGludG8gVmVydGljZXMgYW5kIHJlbnVtYmVyIEVkZ2VzXG4vLyAgICAyLiBBZGQgZWRnZSBmcm9tIFN0YXJ0IHRvIE5ldyBUYXNrXG4vLyAgICAzLiBBZGQgZWRnZSBmcm9tIE5ldyBUYXNrIHRvIEZpbmlzaFxuLy9cbi8vIEVhY2ggc3ViLW9wOlxuLy8gICAgMS4gUmVjb3JkcyBhbGwgdGhlIGluZm8gaXQgbmVlZHMgdG8gd29yay5cbi8vICAgIDIuIENhbiBiZSBcImFwcGxpZWRcIiB0byBhIFBsYW4uXG4vLyAgICAzLiBDYW4gZ2VuZXJhdGUgaXRzIGludmVyc2Ugc3ViLW9wLlxuXG4vLyBUaGUgcmVzdWx0cyBmcm9tIGFwcGx5aW5nIGEgU3ViT3AuIFRoaXMgaXMgdGhlIG9ubHkgd2F5IHRvIGdldCB0aGUgaW52ZXJzZSBvZlxuLy8gYSBTdWJPcCBzaW5jZSB0aGUgU3ViT3AgaW52ZXJzZSBtaWdodCBkZXBlbmQgb24gdGhlIHN0YXRlIG9mIHRoZSBQbGFuIGF0IHRoZVxuLy8gdGltZSB0aGUgU3ViT3Agd2FzIGFwcGxpZWQuXG5leHBvcnQgaW50ZXJmYWNlIFN1Yk9wUmVzdWx0IHtcbiAgcGxhbjogUGxhbjtcbiAgaW52ZXJzZTogU3ViT3A7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3ViT3Age1xuICAvLyBJZiB0aGUgYXBwbHkgcmV0dXJucyBhbiBlcnJvciBpdCBpcyBndWFyYW50ZWVkIG5vdCB0byBoYXZlIG1vZGlmaWVkIHRoZVxuICAvLyBQbGFuLlxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0Pjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBPcFJlc3VsdCB7XG4gIHBsYW46IFBsYW47XG4gIGludmVyc2U6IE9wO1xufVxuXG4vLyBPcCBhcmUgb3BlcmF0aW9ucyBhcmUgYXBwbGllZCB0byBtYWtlIGNoYW5nZXMgdG8gYSBQbGFuLlxuZXhwb3J0IGNsYXNzIE9wIHtcbiAgc3ViT3BzOiBTdWJPcFtdID0gW107XG5cbiAgY29uc3RydWN0b3Ioc3ViT3BzOiBTdWJPcFtdKSB7XG4gICAgdGhpcy5zdWJPcHMgPSBzdWJPcHM7XG4gIH1cblxuICAvLyBSZXZlcnRzIGFsbCBTdWJPcHMgdXAgdG8gdGhlIGdpdmVuIGluZGV4LlxuICBhcHBseUFsbEludmVyc2VTdWJPcHNUb1BsYW4oXG4gICAgcGxhbjogUGxhbixcbiAgICBpbnZlcnNlU3ViT3BzOiBTdWJPcFtdXG4gICk6IFJlc3VsdDxQbGFuPiB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnZlcnNlU3ViT3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlID0gaW52ZXJzZVN1Yk9wc1tpXS5hcHBseShwbGFuKTtcbiAgICAgIGlmICghZS5vaykge1xuICAgICAgICByZXR1cm4gZTtcbiAgICAgIH1cbiAgICAgIHBsYW4gPSBlLnZhbHVlLnBsYW47XG4gICAgfVxuXG4gICAgcmV0dXJuIG9rKHBsYW4pO1xuICB9XG5cbiAgLy8gQXBwbGllcyB0aGUgT3AgdG8gYSBQbGFuLlxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PE9wUmVzdWx0PiB7XG4gICAgY29uc3QgaW52ZXJzZVN1Yk9wczogU3ViT3BbXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zdWJPcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGUgPSB0aGlzLnN1Yk9wc1tpXS5hcHBseShwbGFuKTtcbiAgICAgIGlmICghZS5vaykge1xuICAgICAgICAvLyBSZXZlcnQgYWxsIHRoZSBTdWJPcHMgYXBwbGllZCB1cCB0byB0aGlzIHBvaW50IHRvIGdldCB0aGUgUGxhbiBiYWNrIGluIGFcbiAgICAgICAgLy8gZ29vZCBwbGFjZS5cbiAgICAgICAgY29uc3QgcmV2ZXJ0RXJyID0gdGhpcy5hcHBseUFsbEludmVyc2VTdWJPcHNUb1BsYW4ocGxhbiwgaW52ZXJzZVN1Yk9wcyk7XG4gICAgICAgIGlmICghcmV2ZXJ0RXJyLm9rKSB7XG4gICAgICAgICAgcmV0dXJuIHJldmVydEVycjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZTtcbiAgICAgIH1cbiAgICAgIHBsYW4gPSBlLnZhbHVlLnBsYW47XG4gICAgICBpbnZlcnNlU3ViT3BzLnVuc2hpZnQoZS52YWx1ZS5pbnZlcnNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IG5ldyBPcChpbnZlcnNlU3ViT3BzKSxcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBBbGxPcHNSZXN1bHQgPSB7XG4gIG9wczogT3BbXTtcbiAgcGxhbjogUGxhbjtcbn07XG5cbmNvbnN0IGFwcGx5QWxsSW52ZXJzZU9wc1RvUGxhbiA9IChpbnZlcnNlczogT3BbXSwgcGxhbjogUGxhbik6IFJlc3VsdDxQbGFuPiA9PiB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaW52ZXJzZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCByZXMgPSBpbnZlcnNlc1tpXS5hcHBseShwbGFuKTtcbiAgICBpZiAoIXJlcy5vaykge1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgcGxhbiA9IHJlcy52YWx1ZS5wbGFuO1xuICB9XG5cbiAgcmV0dXJuIG9rKHBsYW4pO1xufTtcblxuLy8gQ29udmVuaWVuY2UgZnVuY3Rpb24gZm9yIGFwcGx5aW5nIG11bHRpcGxlIE9wcyB0byBhIHBsYW4sIHVzZWQgbW9zdGx5IGZvclxuLy8gdGVzdGluZy5cbmV4cG9ydCBjb25zdCBhcHBseUFsbE9wc1RvUGxhbiA9IChcbiAgb3BzOiBPcFtdLFxuICBwbGFuOiBQbGFuXG4pOiBSZXN1bHQ8QWxsT3BzUmVzdWx0PiA9PiB7XG4gIGNvbnN0IGludmVyc2VzOiBPcFtdID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcmVzID0gb3BzW2ldLmFwcGx5KHBsYW4pO1xuICAgIGlmICghcmVzLm9rKSB7XG4gICAgICBjb25zdCBpbnZlcnNlUmVzID0gYXBwbHlBbGxJbnZlcnNlT3BzVG9QbGFuKGludmVyc2VzLCBwbGFuKTtcbiAgICAgIGlmICghaW52ZXJzZVJlcy5vaykge1xuICAgICAgICAvLyBUT0RPIENhbiB3ZSB3cmFwIHRoZSBFcnJvciBpbiBhbm90aGVyIGVycm9yIHRvIG1ha2UgaXQgY2xlYXIgdGhpc1xuICAgICAgICAvLyBlcnJvciBoYXBwZW5lZCB3aGVuIHRyeWluZyB0byBjbGVhbiB1cCBmcm9tIHRoZSBwcmV2aW91cyBFcnJvciB3aGVuXG4gICAgICAgIC8vIHRoZSBhcHBseSgpIGZhaWxlZC5cbiAgICAgICAgcmV0dXJuIGludmVyc2VSZXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH1cbiAgICBpbnZlcnNlcy51bnNoaWZ0KHJlcy52YWx1ZS5pbnZlcnNlKTtcbiAgICBwbGFuID0gcmVzLnZhbHVlLnBsYW47XG4gIH1cblxuICByZXR1cm4gb2soe1xuICAgIG9wczogaW52ZXJzZXMsXG4gICAgcGxhbjogcGxhbixcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgYXBwbHlBbGxPcHNUb1BsYW5BbmRUaGVuSW52ZXJzZSA9IChcbiAgb3BzOiBPcFtdLFxuICBwbGFuOiBQbGFuXG4pOiBSZXN1bHQ8QWxsT3BzUmVzdWx0PiA9PiB7XG4gIGNvbnN0IHJlcyA9IGFwcGx5QWxsT3BzVG9QbGFuKG9wcywgcGxhbik7XG4gIGlmICghcmVzLm9rKSB7XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICByZXR1cm4gYXBwbHlBbGxPcHNUb1BsYW4ocmVzLnZhbHVlLm9wcywgcmVzLnZhbHVlLnBsYW4pO1xufTtcbi8vIE5vT3AgaXMgYSBuby1vcC5cbmV4cG9ydCBmdW5jdGlvbiBOb09wKCk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbXSk7XG59XG4iLCAiaW1wb3J0IHsgUmVzdWx0LCBvaywgZXJyb3IgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBEaXJlY3RlZEVkZ2UsIGVkZ2VzQnlTcmNBbmREc3RUb01hcCB9IGZyb20gXCIuLi9kYWcvZGFnLnRzXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhbi50c1wiO1xuaW1wb3J0IHsgQ2hhcnQsIFRhc2tTdGF0ZSB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgT3AsIFN1Yk9wLCBTdWJPcFJlc3VsdCB9IGZyb20gXCIuL29wcy50c1wiO1xuXG4vKiogQSB2YWx1ZSBvZiAtMSBmb3IgaiBtZWFucyB0aGUgRmluaXNoIE1pbGVzdG9uZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBEaXJlY3RlZEVkZ2VGb3JQbGFuKFxuICBpOiBudW1iZXIsXG4gIGo6IG51bWJlcixcbiAgcGxhbjogUGxhblxuKTogUmVzdWx0PERpcmVjdGVkRWRnZT4ge1xuICBjb25zdCBjaGFydCA9IHBsYW4uY2hhcnQ7XG4gIGlmIChqID09PSAtMSkge1xuICAgIGogPSBjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICB9XG4gIGlmIChpIDwgMCB8fCBpID49IGNoYXJ0LlZlcnRpY2VzLmxlbmd0aCkge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIGBpIGluZGV4IG91dCBvZiByYW5nZTogJHtpfSBub3QgaW4gWzAsICR7Y2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMX1dYFxuICAgICk7XG4gIH1cbiAgaWYgKGogPCAwIHx8IGogPj0gY2hhcnQuVmVydGljZXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGVycm9yKFxuICAgICAgYGogaW5kZXggb3V0IG9mIHJhbmdlOiAke2p9IG5vdCBpbiBbMCwgJHtjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxfV1gXG4gICAgKTtcbiAgfVxuICBpZiAoaSA9PT0gaikge1xuICAgIHJldHVybiBlcnJvcihgQSBUYXNrIGNhbiBub3QgZGVwZW5kIG9uIGl0c2VsZjogJHtpfSA9PT0gJHtqfWApO1xuICB9XG4gIHJldHVybiBvayhuZXcgRGlyZWN0ZWRFZGdlKGksIGopKTtcbn1cblxuZXhwb3J0IGNsYXNzIEFkZEVkZ2VTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaTogbnVtYmVyID0gMDtcbiAgajogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpOiBudW1iZXIsIGo6IG51bWJlcikge1xuICAgIHRoaXMuaSA9IGk7XG4gICAgdGhpcy5qID0gajtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBpZiAodGhpcy5pID09PSAtMSkge1xuICAgICAgdGhpcy5pID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICAgIH1cbiAgICBpZiAodGhpcy5qID09PSAtMSkge1xuICAgICAgdGhpcy5qID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICAgIH1cblxuICAgIGNvbnN0IGUgPSBEaXJlY3RlZEVkZ2VGb3JQbGFuKHRoaXMuaSwgdGhpcy5qLCBwbGFuKTtcbiAgICBpZiAoIWUub2spIHtcbiAgICAgIHJldHVybiBlO1xuICAgIH1cblxuICAgIC8vIE9ubHkgYWRkIHRoZSBlZGdlIGlmIGl0IGRvZXNuJ3QgZXhpc3RzIGFscmVhZHkuXG4gICAgaWYgKCFwbGFuLmNoYXJ0LkVkZ2VzLmZpbmQoKHZhbHVlOiBEaXJlY3RlZEVkZ2UpID0+IHZhbHVlLmVxdWFsKGUudmFsdWUpKSkge1xuICAgICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKGUudmFsdWUpO1xuICAgIH1cblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCksXG4gICAgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFJlbW92ZUVkZ2VTdXBPcCh0aGlzLmksIHRoaXMuaik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbW92ZUVkZ2VTdXBPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaTogbnVtYmVyID0gMDtcbiAgajogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpOiBudW1iZXIsIGo6IG51bWJlcikge1xuICAgIHRoaXMuaSA9IGk7XG4gICAgdGhpcy5qID0gajtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBpZiAodGhpcy5pID09PSAtMSkge1xuICAgICAgdGhpcy5pID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICAgIH1cbiAgICBpZiAodGhpcy5qID09PSAtMSkge1xuICAgICAgdGhpcy5qID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICAgIH1cblxuICAgIGNvbnN0IGUgPSBEaXJlY3RlZEVkZ2VGb3JQbGFuKHRoaXMuaSwgdGhpcy5qLCBwbGFuKTtcbiAgICBpZiAoIWUub2spIHtcbiAgICAgIHJldHVybiBlO1xuICAgIH1cbiAgICBwbGFuLmNoYXJ0LkVkZ2VzID0gcGxhbi5jaGFydC5FZGdlcy5maWx0ZXIoXG4gICAgICAodjogRGlyZWN0ZWRFZGdlKTogYm9vbGVhbiA9PiAhdi5lcXVhbChlLnZhbHVlKVxuICAgICk7XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpLFxuICAgIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBBZGRFZGdlU3ViT3AodGhpcy5pLCB0aGlzLmopO1xuICB9XG59XG5cbmZ1bmN0aW9uIGluZGV4SW5SYW5nZUZvclZlcnRpY2VzKGluZGV4OiBudW1iZXIsIGNoYXJ0OiBDaGFydCk6IFJlc3VsdDxudWxsPiB7XG4gIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPiBjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAyKSB7XG4gICAgcmV0dXJuIGVycm9yKGAke2luZGV4fSBpcyBub3QgaW4gcmFuZ2UgWzAsICR7Y2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMn1dYCk7XG4gIH1cbiAgcmV0dXJuIG9rKG51bGwpO1xufVxuXG5mdW5jdGlvbiBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlc0V4Y2x1c2l2ZShcbiAgaW5kZXg6IG51bWJlcixcbiAgY2hhcnQ6IENoYXJ0XG4pOiBSZXN1bHQ8bnVsbD4ge1xuICBpZiAoaW5kZXggPCAxIHx8IGluZGV4ID4gY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMikge1xuICAgIHJldHVybiBlcnJvcihgJHtpbmRleH0gaXMgbm90IGluIHJhbmdlIFsxLCAke2NoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDJ9XWApO1xuICB9XG4gIHJldHVybiBvayhudWxsKTtcbn1cblxuZXhwb3J0IGNsYXNzIEFkZFRhc2tBZnRlclN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBpbmRleDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGNoYXJ0ID0gcGxhbi5jaGFydDtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLmluZGV4LCBjaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuc3BsaWNlKHRoaXMuaW5kZXggKyAxLCAwLCBwbGFuLm5ld1Rhc2soKSk7XG5cbiAgICAvLyBVcGRhdGUgRWRnZXMuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFydC5FZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZWRnZSA9IGNoYXJ0LkVkZ2VzW2ldO1xuICAgICAgaWYgKGVkZ2UuaSA+PSB0aGlzLmluZGV4ICsgMSkge1xuICAgICAgICBlZGdlLmkrKztcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlLmogPj0gdGhpcy5pbmRleCArIDEpIHtcbiAgICAgICAgZWRnZS5qKys7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBEZWxldGVUYXNrU3ViT3AodGhpcy5pbmRleCArIDEpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEdXBUYXNrU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGluZGV4OiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGluZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgY2hhcnQgPSBwbGFuLmNoYXJ0O1xuICAgIGNvbnN0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzRXhjbHVzaXZlKHRoaXMuaW5kZXgsIGNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBjb25zdCBjb3B5ID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLmluZGV4XS5kdXAoKTtcbiAgICAvLyBJbnNlcnQgdGhlIGR1cGxpY2F0ZSBpbW1lZGlhdGVseSBhZnRlciB0aGUgVGFzayBpdCBpcyBjb3BpZWQgZnJvbS5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLnNwbGljZSh0aGlzLmluZGV4LCAwLCBjb3B5KTtcblxuICAgIC8vIFVwZGF0ZSBFZGdlcy5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJ0LkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlZGdlID0gY2hhcnQuRWRnZXNbaV07XG4gICAgICBpZiAoZWRnZS5pID4gdGhpcy5pbmRleCkge1xuICAgICAgICBlZGdlLmkrKztcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlLmogPiB0aGlzLmluZGV4KSB7XG4gICAgICAgIGVkZ2UuaisrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlVGFza1N1Yk9wKHRoaXMuaW5kZXggKyAxKTtcbiAgfVxufVxuXG50eXBlIFN1YnN0aXR1dGlvbiA9IE1hcDxEaXJlY3RlZEVkZ2UsIERpcmVjdGVkRWRnZT47XG5cbmV4cG9ydCBjbGFzcyBNb3ZlQWxsT3V0Z29pbmdFZGdlc0Zyb21Ub1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBmcm9tVGFza0luZGV4OiBudW1iZXIgPSAwO1xuICB0b1Rhc2tJbmRleDogbnVtYmVyID0gMDtcbiAgYWN0dWFsTW92ZXM6IFN1YnN0aXR1dGlvbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBmcm9tVGFza0luZGV4OiBudW1iZXIsXG4gICAgdG9UYXNrSW5kZXg6IG51bWJlcixcbiAgICBhY3R1YWxNb3ZlczogU3Vic3RpdHV0aW9uID0gbmV3IE1hcCgpXG4gICkge1xuICAgIHRoaXMuZnJvbVRhc2tJbmRleCA9IGZyb21UYXNrSW5kZXg7XG4gICAgdGhpcy50b1Rhc2tJbmRleCA9IHRvVGFza0luZGV4O1xuICAgIHRoaXMuYWN0dWFsTW92ZXMgPSBhY3R1YWxNb3ZlcztcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBjaGFydCA9IHBsYW4uY2hhcnQ7XG4gICAgbGV0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzRXhjbHVzaXZlKHRoaXMuZnJvbVRhc2tJbmRleCwgY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlc0V4Y2x1c2l2ZSh0aGlzLnRvVGFza0luZGV4LCBjaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYWN0dWFsTW92ZXMudmFsdWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc3QgYWN0dWFsTW92ZXM6IFN1YnN0aXR1dGlvbiA9IG5ldyBNYXAoKTtcbiAgICAgIC8vIFVwZGF0ZSBhbGwgRWRnZXMgdGhhdCBzdGFydCBhdCAnZnJvbVRhc2tJbmRleCcgYW5kIGNoYW5nZSB0aGUgc3RhcnQgdG8gJ3RvVGFza0luZGV4Jy5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hhcnQuRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZWRnZSA9IGNoYXJ0LkVkZ2VzW2ldO1xuICAgICAgICAvLyBTa2lwIHRoZSBjb3JuZXIgY2FzZSB0aGVyZSBmcm9tVGFza0luZGV4IHBvaW50cyB0byBUYXNrSW5kZXguXG4gICAgICAgIGlmIChlZGdlLmkgPT09IHRoaXMuZnJvbVRhc2tJbmRleCAmJiBlZGdlLmogPT09IHRoaXMudG9UYXNrSW5kZXgpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlZGdlLmkgPT09IHRoaXMuZnJvbVRhc2tJbmRleCkge1xuICAgICAgICAgIGFjdHVhbE1vdmVzLnNldChcbiAgICAgICAgICAgIG5ldyBEaXJlY3RlZEVkZ2UodGhpcy50b1Rhc2tJbmRleCwgZWRnZS5qKSxcbiAgICAgICAgICAgIG5ldyBEaXJlY3RlZEVkZ2UoZWRnZS5pLCBlZGdlLmopXG4gICAgICAgICAgKTtcbiAgICAgICAgICBlZGdlLmkgPSB0aGlzLnRvVGFza0luZGV4O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gb2soe1xuICAgICAgICBwbGFuOiBwbGFuLFxuICAgICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UoXG4gICAgICAgICAgdGhpcy50b1Rhc2tJbmRleCxcbiAgICAgICAgICB0aGlzLmZyb21UYXNrSW5kZXgsXG4gICAgICAgICAgYWN0dWFsTW92ZXNcbiAgICAgICAgKSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJ0LkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG5ld0VkZ2UgPSB0aGlzLmFjdHVhbE1vdmVzLmdldChwbGFuLmNoYXJ0LkVkZ2VzW2ldKTtcbiAgICAgICAgaWYgKG5ld0VkZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHBsYW4uY2hhcnQuRWRnZXNbaV0gPSBuZXdFZGdlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvayh7XG4gICAgICAgIHBsYW46IHBsYW4sXG4gICAgICAgIGludmVyc2U6IG5ldyBNb3ZlQWxsT3V0Z29pbmdFZGdlc0Zyb21Ub1N1Yk9wKFxuICAgICAgICAgIHRoaXMudG9UYXNrSW5kZXgsXG4gICAgICAgICAgdGhpcy5mcm9tVGFza0luZGV4XG4gICAgICAgICksXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBpbnZlcnNlKFxuICAgIHRvVGFza0luZGV4OiBudW1iZXIsXG4gICAgZnJvbVRhc2tJbmRleDogbnVtYmVyLFxuICAgIGFjdHVhbE1vdmVzOiBTdWJzdGl0dXRpb25cbiAgKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgTW92ZUFsbE91dGdvaW5nRWRnZXNGcm9tVG9TdWJPcChcbiAgICAgIHRvVGFza0luZGV4LFxuICAgICAgZnJvbVRhc2tJbmRleCxcbiAgICAgIGFjdHVhbE1vdmVzXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29weUFsbEVkZ2VzRnJvbVRvU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGZyb21JbmRleDogbnVtYmVyID0gMDtcbiAgdG9JbmRleDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3Rvcihmcm9tSW5kZXg6IG51bWJlciwgdG9JbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5mcm9tSW5kZXggPSBmcm9tSW5kZXg7XG4gICAgdGhpcy50b0luZGV4ID0gdG9JbmRleDtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLmZyb21JbmRleCwgcGxhbi5jaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgY29uc3QgbmV3RWRnZXM6IERpcmVjdGVkRWRnZVtdID0gW107XG4gICAgcGxhbi5jaGFydC5FZGdlcy5mb3JFYWNoKChlZGdlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICAgIGlmIChlZGdlLmkgPT09IHRoaXMuZnJvbUluZGV4KSB7XG4gICAgICAgIG5ld0VkZ2VzLnB1c2gobmV3IERpcmVjdGVkRWRnZSh0aGlzLnRvSW5kZXgsIGVkZ2UuaikpO1xuICAgICAgfVxuICAgICAgaWYgKGVkZ2UuaiA9PT0gdGhpcy5mcm9tSW5kZXgpIHtcbiAgICAgICAgbmV3RWRnZXMucHVzaChuZXcgRGlyZWN0ZWRFZGdlKGVkZ2UuaSwgdGhpcy50b0luZGV4KSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKC4uLm5ld0VkZ2VzKTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IG5ldyBSZW1vdmVBbGxFZGdlc1N1Yk9wKG5ld0VkZ2VzKSB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVtb3ZlQWxsRWRnZXNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVtdO1xuXG4gIGNvbnN0cnVjdG9yKGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSkge1xuICAgIHRoaXMuZWRnZXMgPSBlZGdlcztcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBwbGFuLmNoYXJ0LkVkZ2VzID0gcGxhbi5jaGFydC5FZGdlcy5maWx0ZXIoXG4gICAgICAoZWRnZTogRGlyZWN0ZWRFZGdlKSA9PlxuICAgICAgICAtMSA9PT1cbiAgICAgICAgdGhpcy5lZGdlcy5maW5kSW5kZXgoKHRvQmVSZW1vdmVkOiBEaXJlY3RlZEVkZ2UpID0+XG4gICAgICAgICAgZWRnZS5lcXVhbCh0b0JlUmVtb3ZlZClcbiAgICAgICAgKVxuICAgICk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiBuZXcgQWRkQWxsRWRnZXNTdWJPcCh0aGlzLmVkZ2VzKSB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQWRkQWxsRWRnZXNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVtdO1xuXG4gIGNvbnN0cnVjdG9yKGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSkge1xuICAgIHRoaXMuZWRnZXMgPSBlZGdlcztcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBwbGFuLmNoYXJ0LkVkZ2VzLnB1c2goLi4udGhpcy5lZGdlcyk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiBuZXcgUmVtb3ZlQWxsRWRnZXNTdWJPcCh0aGlzLmVkZ2VzKSB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVsZXRlVGFza1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBpbmRleDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGNoYXJ0ID0gcGxhbi5jaGFydDtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLmluZGV4LCBjaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGNoYXJ0LlZlcnRpY2VzLnNwbGljZSh0aGlzLmluZGV4LCAxKTtcblxuICAgIC8vIFVwZGF0ZSBFZGdlcy5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJ0LkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlZGdlID0gY2hhcnQuRWRnZXNbaV07XG4gICAgICBpZiAoZWRnZS5pID4gdGhpcy5pbmRleCkge1xuICAgICAgICBlZGdlLmktLTtcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlLmogPiB0aGlzLmluZGV4KSB7XG4gICAgICAgIGVkZ2Uuai0tO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBBZGRUYXNrQWZ0ZXJTdWJPcCh0aGlzLmluZGV4IC0gMSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJhdGlvbmFsaXplRWRnZXNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBzcmNBbmREc3QgPSBlZGdlc0J5U3JjQW5kRHN0VG9NYXAocGxhbi5jaGFydC5FZGdlcyk7XG4gICAgY29uc3QgU3RhcnQgPSAwO1xuICAgIGNvbnN0IEZpbmlzaCA9IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcblxuICAgIC8vIGxvb3Agb3ZlciBhbGwgdmVydGljcyBmcm9tIFtTdGFydCwgRmluaXNoKSBhbmQgbG9vayBmb3IgdGhlaXJcbiAgICAvLyBkZXN0aW5hdGlvbnMuIElmIHRoZXkgaGF2ZSBub25lIHRoZW4gYWRkIGluIGFuIGVkZ2UgdG8gRmluaXNoLiBJZiB0aGV5XG4gICAgLy8gaGF2ZSBtb3JlIHRoYW4gb25lIHRoZW4gcmVtb3ZlIGFueSBsaW5rcyB0byBGaW5pc2guXG4gICAgZm9yIChsZXQgaSA9IFN0YXJ0OyBpIDwgRmluaXNoOyBpKyspIHtcbiAgICAgIGNvbnN0IGRlc3RpbmF0aW9ucyA9IHNyY0FuZERzdC5ieVNyYy5nZXQoaSk7XG4gICAgICBpZiAoZGVzdGluYXRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgdG9CZUFkZGVkID0gbmV3IERpcmVjdGVkRWRnZShpLCBGaW5pc2gpO1xuICAgICAgICBwbGFuLmNoYXJ0LkVkZ2VzLnB1c2godG9CZUFkZGVkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEFyZSB0aGVyZSBhbnkgdW5lZWRlZCBFZ2RlcyB0byBGaW5pc2g/IElmIHNvIGZpbHRlciB0aGVtIG91dC5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIGRlc3RpbmF0aW9ucy5sZW5ndGggPiAxICYmXG4gICAgICAgICAgZGVzdGluYXRpb25zLmZpbmQoKHZhbHVlOiBEaXJlY3RlZEVkZ2UpID0+IHZhbHVlLmogPT09IEZpbmlzaClcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29uc3QgdG9CZVJlbW92ZWQgPSBuZXcgRGlyZWN0ZWRFZGdlKGksIEZpbmlzaCk7XG4gICAgICAgICAgcGxhbi5jaGFydC5FZGdlcyA9IHBsYW4uY2hhcnQuRWRnZXMuZmlsdGVyKFxuICAgICAgICAgICAgKHZhbHVlOiBEaXJlY3RlZEVkZ2UpID0+ICF0b0JlUmVtb3ZlZC5lcXVhbCh2YWx1ZSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gbG9vcCBvdmVyIGFsbCB2ZXJ0aWNzIGZyb20oU3RhcnQsIEZpbmlzaF0gYW5kIGxvb2sgZm9yIHRoZWlyIHNvdXJjZXMuIElmXG4gICAgLy8gdGhleSBoYXZlIG5vbmUgdGhlbiBhZGQgaW4gYW4gZWRnZSBmcm9tIFN0YXJ0LiBJZiB0aGV5IGhhdmUgbW9yZSB0aGFuIG9uZVxuICAgIC8vIHRoZW4gcmVtb3ZlIGFueSBsaW5rcyBmcm9tIFN0YXJ0LlxuICAgIGZvciAobGV0IGkgPSBTdGFydCArIDE7IGkgPCBGaW5pc2g7IGkrKykge1xuICAgICAgY29uc3QgZGVzdGluYXRpb25zID0gc3JjQW5kRHN0LmJ5RHN0LmdldChpKTtcbiAgICAgIGlmIChkZXN0aW5hdGlvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCB0b0JlQWRkZWQgPSBuZXcgRGlyZWN0ZWRFZGdlKFN0YXJ0LCBpKTtcbiAgICAgICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKHRvQmVBZGRlZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBcmUgdGhlcmUgYW55IHVuLW5lZWRlZCBFZ2RlcyBmcm9tIFN0YXJ0PyBJZiBzbyBmaWx0ZXIgdGhlbSBvdXQuXG4gICAgICAgIGlmIChcbiAgICAgICAgICBkZXN0aW5hdGlvbnMubGVuZ3RoID4gMSAmJlxuICAgICAgICAgIGRlc3RpbmF0aW9ucy5maW5kKCh2YWx1ZTogRGlyZWN0ZWRFZGdlKSA9PiB2YWx1ZS5pID09PSBTdGFydClcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29uc3QgdG9CZVJlbW92ZWQgPSBuZXcgRGlyZWN0ZWRFZGdlKFN0YXJ0LCBpKTtcbiAgICAgICAgICBwbGFuLmNoYXJ0LkVkZ2VzID0gcGxhbi5jaGFydC5FZGdlcy5maWx0ZXIoXG4gICAgICAgICAgICAodmFsdWU6IERpcmVjdGVkRWRnZSkgPT4gIXRvQmVSZW1vdmVkLmVxdWFsKHZhbHVlKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHBsYW4uY2hhcnQuRWRnZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBwbGFuLmNoYXJ0LkVkZ2VzLnB1c2gobmV3IERpcmVjdGVkRWRnZShTdGFydCwgRmluaXNoKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZXRUYXNrTmFtZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICB0YXNrSW5kZXg6IG51bWJlcjtcbiAgbmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHRhc2tJbmRleDogbnVtYmVyLCBuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLnRhc2tJbmRleCA9IHRhc2tJbmRleDtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzKHRoaXMudGFza0luZGV4LCBwbGFuLmNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgY29uc3Qgb2xkTmFtZSA9IHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdLm5hbWU7XG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLnRhc2tJbmRleF0ubmFtZSA9IHRoaXMubmFtZTtcbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZShvbGROYW1lKSxcbiAgICB9KTtcbiAgfVxuXG4gIGludmVyc2Uob2xkTmFtZTogc3RyaW5nKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgU2V0VGFza05hbWVTdWJPcCh0aGlzLnRhc2tJbmRleCwgb2xkTmFtZSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNldFRhc2tTdGF0ZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICB0YXNrU3RhdGU6IFRhc2tTdGF0ZTtcbiAgdGFza0luZGV4OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IodGFza0luZGV4OiBudW1iZXIsIHRhc2tTdGF0ZTogVGFza1N0YXRlKSB7XG4gICAgdGhpcy50YXNrSW5kZXggPSB0YXNrSW5kZXg7XG4gICAgdGhpcy50YXNrU3RhdGUgPSB0YXNrU3RhdGU7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXModGhpcy50YXNrSW5kZXgsIHBsYW4uY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICBjb25zdCBvbGRTdGF0ZSA9IHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdLnN0YXRlO1xuICAgIHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdLnN0YXRlID0gdGhpcy50YXNrU3RhdGU7XG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2Uob2xkU3RhdGUpLFxuICAgIH0pO1xuICB9XG5cbiAgaW52ZXJzZSh0YXNrU3RhdGU6IFRhc2tTdGF0ZSk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFNldFRhc2tTdGF0ZVN1Yk9wKHRoaXMudGFza0luZGV4LCB0YXNrU3RhdGUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBJbnNlcnROZXdFbXB0eVRhc2tBZnRlck9wKHRhc2tJbmRleDogbnVtYmVyKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gICAgbmV3IEFkZFRhc2tBZnRlclN1Yk9wKHRhc2tJbmRleCksXG4gICAgbmV3IEFkZEVkZ2VTdWJPcCgwLCB0YXNrSW5kZXggKyAxKSxcbiAgICBuZXcgQWRkRWRnZVN1Yk9wKHRhc2tJbmRleCArIDEsIC0xKSxcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gIF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU2V0VGFza05hbWVPcCh0YXNrSW5kZXg6IG51bWJlciwgbmFtZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgU2V0VGFza05hbWVTdWJPcCh0YXNrSW5kZXgsIG5hbWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZXRUYXNrU3RhdGVPcCh0YXNrSW5kZXg6IG51bWJlciwgdGFza1N0YXRlOiBUYXNrU3RhdGUpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBTZXRUYXNrU3RhdGVTdWJPcCh0YXNrSW5kZXgsIHRhc2tTdGF0ZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNwbGl0VGFza09wKHRhc2tJbmRleDogbnVtYmVyKTogT3Age1xuICBjb25zdCBzdWJPcHM6IFN1Yk9wW10gPSBbXG4gICAgbmV3IER1cFRhc2tTdWJPcCh0YXNrSW5kZXgpLFxuICAgIG5ldyBBZGRFZGdlU3ViT3AodGFza0luZGV4LCB0YXNrSW5kZXggKyAxKSxcbiAgICBuZXcgTW92ZUFsbE91dGdvaW5nRWRnZXNGcm9tVG9TdWJPcCh0YXNrSW5kZXgsIHRhc2tJbmRleCArIDEpLFxuICBdO1xuXG4gIHJldHVybiBuZXcgT3Aoc3ViT3BzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIER1cFRhc2tPcCh0YXNrSW5kZXg6IG51bWJlcik6IE9wIHtcbiAgY29uc3Qgc3ViT3BzOiBTdWJPcFtdID0gW1xuICAgIG5ldyBEdXBUYXNrU3ViT3AodGFza0luZGV4KSxcbiAgICBuZXcgQ29weUFsbEVkZ2VzRnJvbVRvU3ViT3AodGFza0luZGV4LCB0YXNrSW5kZXggKyAxKSxcbiAgXTtcblxuICByZXR1cm4gbmV3IE9wKHN1Yk9wcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBZGRFZGdlT3AoZnJvbVRhc2tJbmRleDogbnVtYmVyLCB0b1Rhc2tJbmRleDogbnVtYmVyKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gICAgbmV3IEFkZEVkZ2VTdWJPcChmcm9tVGFza0luZGV4LCB0b1Rhc2tJbmRleCksXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICBdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJhdGlvbmFsaXplRWRnZXNPcCgpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKV0pO1xufVxuIiwgIi8vIENoYW5nZU1ldHJpY1ZhbHVlXG5cbmltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IE1ldHJpY0RlZmluaXRpb24gfSBmcm9tIFwiLi4vbWV0cmljcy9tZXRyaWNzLnRzXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhbi50c1wiO1xuaW1wb3J0IHsgUmVzdWx0LCBlcnJvciwgb2sgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBPcCwgU3ViT3AsIFN1Yk9wUmVzdWx0IH0gZnJvbSBcIi4vb3BzLnRzXCI7XG5cbmV4cG9ydCBjbGFzcyBBZGRNZXRyaWNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgbmFtZTogc3RyaW5nO1xuICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uO1xuXG4gIC8vIE1hcHMgYW4gaW5kZXggb2YgYSBUYXNrIHRvIGEgdmFsdWUgZm9yIHRoZSBnaXZlbiBtZXRyaWMga2V5LlxuICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uLFxuICAgIHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCkgLy8gU2hvdWxkIG9ubHkgYmUgc3VwcGxpZWQgYnkgaW52ZXJzZSBhY3Rpb25zLlxuICApIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbiA9IG1ldHJpY0RlZmluaXRpb247XG4gICAgdGhpcy50YXNrTWV0cmljVmFsdWVzID0gdGFza01ldHJpY1ZhbHVlcztcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBpZiAocGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmFtZX0gYWxyZWFkeSBleGlzdHMgYXMgYSBNZXRyaWNgKTtcbiAgICB9XG5cbiAgICBwbGFuLnNldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lLCB0aGlzLm1ldHJpY0RlZmluaXRpb24pO1xuXG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCBhZGQgdGhpcyBtZXRyaWMgYW5kIHNldCBpdCB0byB0aGUgZGVmYXVsdCxcbiAgICAvLyB1bmxlc3MgdGhlcmUgaXMgbWF0Y2hpbmcgZW50cnkgaW4gdGFza01ldHJpY1ZhbHVlcywgaW4gd2hpY2ggY2FzZSB3ZSB3aWxsXG4gICAgLy8gdXNlIHRoYXQgdmFsdWUsIGkuZS4gdGhpcyBBZGRNZXRyaWNTdWJPcCBpcyBhY3R1YWxseSBhIHJldmVydCBvZiBhXG4gICAgLy8gRGVsZXRlTWV0cmljU3ViT3AuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICB0YXNrLnNldE1ldHJpYyhcbiAgICAgICAgdGhpcy5uYW1lLFxuICAgICAgICB0aGlzLnRhc2tNZXRyaWNWYWx1ZXMuZ2V0KGluZGV4KSB8fCB0aGlzLm1ldHJpY0RlZmluaXRpb24uZGVmYXVsdFxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBEZWxldGVNZXRyaWNTdWJPcCh0aGlzLm5hbWUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWxldGVNZXRyaWNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgbmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgbWV0cmljRGVmaW5pdGlvbiA9IHBsYW4uZ2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5hbWUpO1xuXG4gICAgaWYgKG1ldHJpY0RlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgVGhlIG1ldHJpYyB3aXRoIG5hbWUgJHt0aGlzLm5hbWV9IGRvZXMgbm90IGV4aXN0IGFuZCBjYW4ndCBiZSBkZWxldGVkLmBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKG1ldHJpY0RlZmluaXRpb24uaXNTdGF0aWMpIHtcbiAgICAgIHJldHVybiBlcnJvcihgVGhlIHN0YXRpYyBNZXRyaWMgJHt0aGlzLm5hbWV9IGNhbid0IGJlIGRlbGV0ZWQuYCk7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGZyb20gcmVzb3VyY2UgZGVmaW5pdGlvbnMuXG4gICAgcGxhbi5kZWxldGVNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSk7XG5cbiAgICBjb25zdCB0YXNrSW5kZXhUb0RlbGV0ZWRNZXRyaWNWYWx1ZTogTWFwPG51bWJlciwgbnVtYmVyPiA9IG5ldyBNYXAoKTtcblxuICAgIC8vIE5vdyBsb29rIGF0IGFsbCBUYXNrcyBhbmQgcmVtb3ZlIGB0aGlzLm5hbWVgIGZyb20gdGhlIG1ldHJpYyB3aGlsZSBhbHNvXG4gICAgLy8gYnVpbGRpbmcgdXAgdGhlIGluZm8gbmVlZGVkIGZvciBhIHJldmVydC5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGFzay5nZXRNZXRyaWModGhpcy5uYW1lKTtcbiAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRhc2tJbmRleFRvRGVsZXRlZE1ldHJpY1ZhbHVlLnNldChpbmRleCwgdmFsdWUpO1xuICAgICAgfVxuICAgICAgdGFzay5kZWxldGVNZXRyaWModGhpcy5uYW1lKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG1ldHJpY0RlZmluaXRpb24sIHRhc2tJbmRleFRvRGVsZXRlZE1ldHJpY1ZhbHVlKSxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgaW52ZXJzZShcbiAgICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uLFxuICAgIG1ldHJpY1ZhbHVlc0ZvckRlbGV0ZWRSZXNvdXJjZU5hbWU6IE1hcDxudW1iZXIsIG51bWJlcj5cbiAgKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgQWRkTWV0cmljU3ViT3AoXG4gICAgICB0aGlzLm5hbWUsXG4gICAgICBtZXRyaWNEZWZpbml0aW9uLFxuICAgICAgbWV0cmljVmFsdWVzRm9yRGVsZXRlZFJlc291cmNlTmFtZVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbmFtZU1ldHJpY1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBvbGROYW1lOiBzdHJpbmc7XG4gIG5ld05hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihvbGROYW1lOiBzdHJpbmcsIG5ld05hbWU6IHN0cmluZykge1xuICAgIHRoaXMub2xkTmFtZSA9IG9sZE5hbWU7XG4gICAgdGhpcy5uZXdOYW1lID0gbmV3TmFtZTtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBpZiAocGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmV3TmFtZSkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmV3TmFtZX0gYWxyZWFkeSBleGlzdHMgYXMgYSBtZXRyaWMuYCk7XG4gICAgfVxuXG4gICAgY29uc3QgbWV0cmljRGVmaW5pdGlvbiA9IHBsYW4uZ2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm9sZE5hbWUpO1xuICAgIGlmIChtZXRyaWNEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm9sZE5hbWV9IGRvZXMgbm90IGV4aXN0IGFzIGEgTWV0cmljYCk7XG4gICAgfVxuICAgIGlmIChtZXRyaWNEZWZpbml0aW9uLmlzU3RhdGljKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYFN0YXRpYyBtZXRyaWMgJHt0aGlzLm9sZE5hbWV9IGNhbid0IGJlIHJlbmFtZWQuYCk7XG4gICAgfVxuXG4gICAgcGxhbi5zZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmV3TmFtZSwgbWV0cmljRGVmaW5pdGlvbik7XG4gICAgcGxhbi5kZWxldGVNZXRyaWNEZWZpbml0aW9uKHRoaXMub2xkTmFtZSk7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIHJlbmFtZSB0aGlzIG1ldHJpYy5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2spID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGFzay5nZXRNZXRyaWModGhpcy5vbGROYW1lKSB8fCBtZXRyaWNEZWZpbml0aW9uLmRlZmF1bHQ7XG4gICAgICB0YXNrLnNldE1ldHJpYyh0aGlzLm5ld05hbWUsIHZhbHVlKTtcbiAgICAgIHRhc2suZGVsZXRlTWV0cmljKHRoaXMub2xkTmFtZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgUmVuYW1lTWV0cmljU3ViT3AodGhpcy5uZXdOYW1lLCB0aGlzLm9sZE5hbWUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBVcGRhdGVNZXRyaWNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgbmFtZTogc3RyaW5nO1xuICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uO1xuXG4gIC8vIE1hcHMgYW4gaW5kZXggb2YgYSBUYXNrIHRvIGEgdmFsdWUgZm9yIHRoZSBnaXZlbiBtZXRyaWMga2V5LlxuICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uLFxuICAgIHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCkgLy8gU2hvdWxkIG9ubHkgYmUgc3VwcGxpZWQgYnkgaW52ZXJzZSBhY3Rpb25zLlxuICApIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbiA9IG1ldHJpY0RlZmluaXRpb247XG4gICAgdGhpcy50YXNrTWV0cmljVmFsdWVzID0gdGFza01ldHJpY1ZhbHVlcztcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBvbGRNZXRyaWNEZWZpbml0aW9uID0gcGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSk7XG4gICAgaWYgKG9sZE1ldHJpY0RlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmFtZX0gZG9lcyBub3QgZXhpc3QgYXMgYSBNZXRyaWNgKTtcbiAgICB9XG4gICAgaWYgKG9sZE1ldHJpY0RlZmluaXRpb24uaXNTdGF0aWMpIHtcbiAgICAgIHJldHVybiBlcnJvcihgU3RhdGljIG1ldHJpYyAke3RoaXMubmFtZX0gY2FuJ3QgYmUgdXBkYXRlZC5gKTtcbiAgICB9XG5cbiAgICBwbGFuLnNldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lLCB0aGlzLm1ldHJpY0RlZmluaXRpb24pO1xuXG4gICAgY29uc3QgdGFza01ldHJpY1ZhbHVlczogTWFwPG51bWJlciwgbnVtYmVyPiA9IG5ldyBNYXAoKTtcbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIHVwZGF0ZSB0aGUgbWV0cmljIHZhbHVlcyB0byByZWZsZWN0IHRoZSBuZXdcbiAgICAvLyBtZXRyaWMgZGVmaW5pdGlvbiwgdW5sZXNzIHRoZXJlIGlzIG1hdGNoaW5nIGVudHJ5IGluIHRhc2tNZXRyaWNWYWx1ZXMsIGluXG4gICAgLy8gd2hpY2ggY2FzZSB3ZSB3aWxsIHVzZSB0aGF0IHZhbHVlLCBpLmUuIHRoaXMgVXBkYXRlTWV0cmljU3ViT3AgaXNcbiAgICAvLyBhY3R1YWxseSBhIHJldmVydCBvZiBhbm90aGVyIFVwZGF0ZU1ldHJpY1N1Yk9wLlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3Qgb2xkVmFsdWUgPSB0YXNrLmdldE1ldHJpYyh0aGlzLm5hbWUpITtcblxuICAgICAgbGV0IG5ld1ZhbHVlOiBudW1iZXI7XG4gICAgICBpZiAodGhpcy50YXNrTWV0cmljVmFsdWVzLmhhcyhpbmRleCkpIHtcbiAgICAgICAgLy8gdGFza01ldHJpY1ZhbHVlcyBoYXMgYSB2YWx1ZSB0aGVuIHVzZSB0aGF0LCBhcyB0aGlzIGlzIGFuIGludmVyc2VcbiAgICAgICAgLy8gb3BlcmF0aW9uLlxuICAgICAgICBuZXdWYWx1ZSA9IHRoaXMudGFza01ldHJpY1ZhbHVlcy5nZXQoaW5kZXgpITtcbiAgICAgIH0gZWxzZSBpZiAob2xkVmFsdWUgPT09IG9sZE1ldHJpY0RlZmluaXRpb24uZGVmYXVsdCkge1xuICAgICAgICAvLyBJZiB0aGUgb2xkVmFsdWUgaXMgdGhlIGRlZmF1bHQsIGNoYW5nZSBpdCB0byB0aGUgbmV3IGRlZmF1bHQuXG4gICAgICAgIG5ld1ZhbHVlID0gdGhpcy5tZXRyaWNEZWZpbml0aW9uLmRlZmF1bHQ7XG4gICAgICAgIHRhc2tNZXRyaWNWYWx1ZXMuc2V0KGluZGV4LCBvbGRWYWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBDbGFtcC5cbiAgICAgICAgbmV3VmFsdWUgPSB0aGlzLm1ldHJpY0RlZmluaXRpb24ucmFuZ2UuY2xhbXAob2xkVmFsdWUpO1xuICAgICAgICBuZXdWYWx1ZSA9IHRoaXMubWV0cmljRGVmaW5pdGlvbi5wcmVjaXNpb24ucm91bmQobmV3VmFsdWUpO1xuICAgICAgICB0YXNrTWV0cmljVmFsdWVzLnNldChpbmRleCwgb2xkVmFsdWUpO1xuICAgICAgfVxuICAgICAgdGFzay5zZXRNZXRyaWModGhpcy5uYW1lLCBuZXdWYWx1ZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZShvbGRNZXRyaWNEZWZpbml0aW9uLCB0YXNrTWV0cmljVmFsdWVzKSxcbiAgICB9KTtcbiAgfVxuXG4gIGludmVyc2UoXG4gICAgb2xkTWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbixcbiAgICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+XG4gICk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFVwZGF0ZU1ldHJpY1N1Yk9wKFxuICAgICAgdGhpcy5uYW1lLFxuICAgICAgb2xkTWV0cmljRGVmaW5pdGlvbixcbiAgICAgIHRhc2tNZXRyaWNWYWx1ZXNcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZXRNZXRyaWNWYWx1ZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBuYW1lOiBzdHJpbmc7XG4gIHZhbHVlOiBudW1iZXI7XG4gIHRhc2tJbmRleDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgdmFsdWU6IG51bWJlciwgdGFza0luZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLnRhc2tJbmRleCA9IHRhc2tJbmRleDtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBtZXRyaWNzRGVmaW5pdGlvbiA9IHBsYW4uZ2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5hbWUpO1xuICAgIGlmIChtZXRyaWNzRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5uYW1lfSBkb2VzIG5vdCBleGlzdCBhcyBhIE1ldHJpY2ApO1xuICAgIH1cblxuICAgIGNvbnN0IHRhc2sgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMudGFza0luZGV4XTtcbiAgICBjb25zdCBvbGRWYWx1ZSA9IHRhc2suZ2V0TWV0cmljKHRoaXMubmFtZSkgfHwgbWV0cmljc0RlZmluaXRpb24uZGVmYXVsdDtcbiAgICB0YXNrLnNldE1ldHJpYyh0aGlzLm5hbWUsIG1ldHJpY3NEZWZpbml0aW9uLnByZWNpc2lvbi5yb3VuZCh0aGlzLnZhbHVlKSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2Uob2xkVmFsdWUpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSh2YWx1ZTogbnVtYmVyKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgU2V0TWV0cmljVmFsdWVTdWJPcCh0aGlzLm5hbWUsIHZhbHVlLCB0aGlzLnRhc2tJbmRleCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFkZE1ldHJpY09wKFxuICBuYW1lOiBzdHJpbmcsXG4gIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb25cbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IEFkZE1ldHJpY1N1Yk9wKG5hbWUsIG1ldHJpY0RlZmluaXRpb24pXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZWxldGVNZXRyaWNPcChuYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBEZWxldGVNZXRyaWNTdWJPcChuYW1lKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmVuYW1lTWV0cmljT3Aob2xkTmFtZTogc3RyaW5nLCBuZXdOYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBSZW5hbWVNZXRyaWNTdWJPcChvbGROYW1lLCBuZXdOYW1lKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gVXBkYXRlTWV0cmljT3AoXG4gIG5hbWU6IHN0cmluZyxcbiAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvblxuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgVXBkYXRlTWV0cmljU3ViT3AobmFtZSwgbWV0cmljRGVmaW5pdGlvbildKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNldE1ldHJpY1ZhbHVlT3AoXG4gIG5hbWU6IHN0cmluZyxcbiAgdmFsdWU6IG51bWJlcixcbiAgdGFza0luZGV4OiBudW1iZXJcbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFNldE1ldHJpY1ZhbHVlU3ViT3AobmFtZSwgdmFsdWUsIHRhc2tJbmRleCldKTtcbn1cbiIsICIvLyBFYWNoIFJlc291cnNlIGhhcyBhIGtleSwgd2hpY2ggaXMgdGhlIG5hbWUsIGFuZCBhIGxpc3Qgb2YgYWNjZXB0YWJsZSB2YWx1ZXMuXG4vLyBUaGUgbGlzdCBvZiB2YWx1ZXMgY2FuIG5ldmVyIGJlIGVtcHR5LCBhbmQgdGhlIGZpcnN0IHZhbHVlIGluIGB2YWx1ZXNgIGlzIHRoZVxuLy8gZGVmYXVsdCB2YWx1ZSBmb3IgYSBSZXNvdXJjZS5cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUkVTT1VSQ0VfVkFMVUUgPSBcIlwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlc291cmNlRGVmaW5pdGlvblNlcmlhbGl6ZWQge1xuICB2YWx1ZXM6IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgY2xhc3MgUmVzb3VyY2VEZWZpbml0aW9uIHtcbiAgdmFsdWVzOiBzdHJpbmdbXTtcbiAgaXNTdGF0aWM6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgdmFsdWVzOiBzdHJpbmdbXSA9IFtERUZBVUxUX1JFU09VUkNFX1ZBTFVFXSxcbiAgICBpc1N0YXRpYzogYm9vbGVhbiA9IGZhbHNlXG4gICkge1xuICAgIHRoaXMudmFsdWVzID0gdmFsdWVzO1xuICAgIHRoaXMuaXNTdGF0aWMgPSBpc1N0YXRpYztcbiAgfVxuXG4gIHRvSlNPTigpOiBSZXNvdXJjZURlZmluaXRpb25TZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsdWVzOiB0aGlzLnZhbHVlcyxcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIEZyb21KU09OKHM6IFJlc291cmNlRGVmaW5pdGlvblNlcmlhbGl6ZWQpOiBSZXNvdXJjZURlZmluaXRpb24ge1xuICAgIHJldHVybiBuZXcgUmVzb3VyY2VEZWZpbml0aW9uKHMudmFsdWVzKTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBSZXNvdXJjZURlZmluaXRpb25zID0geyBba2V5OiBzdHJpbmddOiBSZXNvdXJjZURlZmluaXRpb24gfTtcbmV4cG9ydCB0eXBlIFJlc291cmNlRGVmaW5pdGlvbnNTZXJpYWxpemVkID0ge1xuICBba2V5OiBzdHJpbmddOiBSZXNvdXJjZURlZmluaXRpb25TZXJpYWxpemVkO1xufTtcbiIsICJpbXBvcnQgeyBSZXN1bHQsIG9rLCBlcnJvciB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuLnRzXCI7XG5pbXBvcnQgeyBPcCwgU3ViT3AsIFN1Yk9wUmVzdWx0IH0gZnJvbSBcIi4vb3BzLnRzXCI7XG5pbXBvcnQge1xuICBERUZBVUxUX1JFU09VUkNFX1ZBTFVFLFxuICBSZXNvdXJjZURlZmluaXRpb24sXG59IGZyb20gXCIuLi9yZXNvdXJjZXMvcmVzb3VyY2VzLnRzXCI7XG5pbXBvcnQgeyBUYXNrIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5cbmV4cG9ydCBjbGFzcyBBZGRSZXNvdXJjZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcblxuICAvLyBNYXBzIGFuIGluZGV4IG9mIGEgVGFzayB0byBhIHZhbHVlIGZvciB0aGUgZ2l2ZW4gcmVzb3VyY2Uga2V5LlxuICB0YXNrUmVzb3VyY2VWYWx1ZXM6IE1hcDxudW1iZXIsIHN0cmluZz47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHRhc2tSZXNvdXJjZVZhbHVlczogTWFwPG51bWJlciwgc3RyaW5nPiA9IG5ldyBNYXA8bnVtYmVyLCBzdHJpbmc+KCkgLy8gU2hvdWxkIG9ubHkgYmUgc3VwcGxpZWQgYnkgaW52ZXJzZSBhY3Rpb25zLlxuICApIHtcbiAgICB0aGlzLmtleSA9IG5hbWU7XG4gICAgdGhpcy50YXNrUmVzb3VyY2VWYWx1ZXMgPSB0YXNrUmVzb3VyY2VWYWx1ZXM7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZm91bmRNYXRjaCA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZm91bmRNYXRjaCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGFscmVhZHkgZXhpc3RzIGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG5cbiAgICBwbGFuLnNldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSwgbmV3IFJlc291cmNlRGVmaW5pdGlvbigpKTtcblxuICAgIC8vIE5vdyBsb29wIG92ZXIgZXZlcnkgdGFzayBhbmQgYWRkIHRoaXMga2V5IGFuZCBzZXQgaXQgdG8gdGhlIGRlZmF1bHQsIHVubGVzc1xuICAgIC8vIHRoZXJlIGlzIG1hdGNoaW5nIGVudHJ5IGluIHRhc2tSZXNvdXJjZVZhbHVlcywgaW4gd2hpY2ggY2FzZSB3ZSB3aWxsIHVzZSB0aGF0IHZhbHVlLlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgdGFzay5zZXRSZXNvdXJjZShcbiAgICAgICAgdGhpcy5rZXksXG4gICAgICAgIHRoaXMudGFza1Jlc291cmNlVmFsdWVzLmdldChpbmRleCkgfHwgREVGQVVMVF9SRVNPVVJDRV9WQUxVRVxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBEZWxldGVSZXNvdXJjZVN1cE9wKHRoaXMua2V5KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVsZXRlUmVzb3VyY2VTdXBPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5rZXkgPSBuYW1lO1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IHJlc291cmNlRGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAocmVzb3VyY2VEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYFRoZSByZXNvdXJjZSB3aXRoIG5hbWUgJHt0aGlzLmtleX0gZG9lcyBub3QgZXhpc3QgYW5kIGNhbid0IGJlIGRlbGV0ZWQuYFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgZnJvbSByZXNvdXJjZSBkZWZpbml0aW9ucy5cbiAgICBwbGFuLmRlbGV0ZU1ldHJpY0RlZmluaXRpb24odGhpcy5rZXkpO1xuXG4gICAgY29uc3QgdGFza0luZGV4VG9EZWxldGVkUmVzb3VyY2VWYWx1ZTogTWFwPG51bWJlciwgc3RyaW5nPiA9IG5ldyBNYXAoKTtcblxuICAgIC8vIE5vdyBsb29rIGF0IGFsbCBUYXNrcyBhbmQgcmVtb3ZlIGB0aGlzLmtleWAgZnJvbSB0aGUgcmVzb3VyY2VzIHdoaWxlIGFsc29cbiAgICAvLyBidWlsZGluZyB1cCB0aGUgaW5mbyBuZWVkZWQgZm9yIGEgcmV2ZXJ0LlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSB0YXNrLmdldFJlc291cmNlKHRoaXMua2V5KSB8fCBERUZBVUxUX1JFU09VUkNFX1ZBTFVFO1xuICAgICAgdGFza0luZGV4VG9EZWxldGVkUmVzb3VyY2VWYWx1ZS5zZXQoaW5kZXgsIHZhbHVlKTtcbiAgICAgIHRhc2suZGVsZXRlUmVzb3VyY2UodGhpcy5rZXkpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UodGFza0luZGV4VG9EZWxldGVkUmVzb3VyY2VWYWx1ZSksXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGludmVyc2UoXG4gICAgcmVzb3VyY2VWYWx1ZXNGb3JEZWxldGVkUmVzb3VyY2VLZXk6IE1hcDxudW1iZXIsIHN0cmluZz5cbiAgKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgQWRkUmVzb3VyY2VTdWJPcCh0aGlzLmtleSwgcmVzb3VyY2VWYWx1ZXNGb3JEZWxldGVkUmVzb3VyY2VLZXkpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBZGRSZXNvdXJjZU9wdGlvblN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcbiAgdmFsdWU6IHN0cmluZztcbiAgaW5kaWNlc09mVGFza3NUb0NoYW5nZTogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBrZXk6IHN0cmluZyxcbiAgICB2YWx1ZTogc3RyaW5nLFxuICAgIGluZGljZXNPZlRhc2tzVG9DaGFuZ2U6IG51bWJlcltdID0gW10gLy8gVGhpcyBzaG91bGQgb25seSBiZSBzdXBwbGllZCB3aGVuIGJlaW5nIGNvbnN0cnVjdGVkIGFzIGEgaW52ZXJzZSBvcGVyYXRpb24uXG4gICkge1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLmluZGljZXNPZlRhc2tzVG9DaGFuZ2UgPSBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlO1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGRlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKGRlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2Vzbid0IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG4gICAgY29uc3QgZXhpc3RpbmdJbmRleCA9IGRlZmluaXRpb24udmFsdWVzLmZpbmRJbmRleChcbiAgICAgICh2YWx1ZTogc3RyaW5nKSA9PiB2YWx1ZSA9PT0gdGhpcy52YWx1ZVxuICAgICk7XG4gICAgaWYgKGV4aXN0aW5nSW5kZXggIT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGAke3RoaXMudmFsdWV9IGFscmVhZHkgZXhpc3RzIGFzIGEgdmFsdWUgaW4gdGhlIFJlc291cmNlICR7dGhpcy5rZXl9LmBcbiAgICAgICk7XG4gICAgfVxuICAgIGRlZmluaXRpb24udmFsdWVzLnB1c2godGhpcy52YWx1ZSk7XG5cbiAgICAvLyBOb3cgbG9vayBhdCBhbGwgVGFza3MgYW5kIHNldCB0aGUgdmFsdWUgZm9yIHRoZSBnaXZlbiBrZXkgZm9yIGFsbCB0aGVcbiAgICAvLyB0YXNrcyBsaXN0ZWQgaW4gYGluZGljZXNPZlRhc2tzVG9DaGFuZ2VgLlxuICAgIHRoaXMuaW5kaWNlc09mVGFza3NUb0NoYW5nZS5mb3JFYWNoKCh0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgcGxhbi5jaGFydC5WZXJ0aWNlc1t0YXNrSW5kZXhdLnNldFJlc291cmNlKHRoaXMua2V5LCB0aGlzLnZhbHVlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IERlbGV0ZVJlc291cmNlT3B0aW9uU3ViT3AoXG4gICAgICB0aGlzLmtleSxcbiAgICAgIHRoaXMudmFsdWUsXG4gICAgICB0aGlzLmluZGljZXNPZlRhc2tzVG9DaGFuZ2VcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWxldGVSZXNvdXJjZU9wdGlvblN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcbiAgdmFsdWU6IHN0cmluZztcbiAgaW5kaWNlc09mVGFza3NUb0NoYW5nZTogbnVtYmVyW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgdmFsdWU6IHN0cmluZyxcbiAgICBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlOiBudW1iZXJbXSA9IFtdXG4gICkge1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLmluZGljZXNPZlRhc2tzVG9DaGFuZ2UgPSBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlO1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGRlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKGRlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2Vzbid0IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG4gICAgY29uc3QgdmFsdWVJbmRleCA9IGRlZmluaXRpb24udmFsdWVzLmZpbmRJbmRleChcbiAgICAgICh2YWx1ZTogc3RyaW5nKSA9PiB2YWx1ZSA9PT0gdGhpcy52YWx1ZVxuICAgICk7XG4gICAgaWYgKHZhbHVlSW5kZXggPT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGAke3RoaXMudmFsdWV9IGRvZXMgbm90IGV4aXN0IGFzIGEgdmFsdWUgaW4gdGhlIFJlc291cmNlICR7dGhpcy5rZXl9LmBcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChkZWZpbml0aW9uLnZhbHVlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYFJlc291cmNlcyBtdXN0IGhhdmUgYXQgbGVhc3Qgb25lIHZhbHVlLiAke3RoaXMudmFsdWV9IG9ubHkgaGFzIG9uZSB2YWx1ZSwgc28gaXQgY2FuJ3QgYmUgZGVsZXRlZC4gYFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBkZWZpbml0aW9uLnZhbHVlcy5zcGxpY2UodmFsdWVJbmRleCwgMSk7XG5cbiAgICAvLyBOb3cgaXRlcmF0ZSB0aG91Z2ggYWxsIHRoZSB0YXNrcyBhbmQgY2hhbmdlIGFsbCB0YXNrcyB0aGF0IGhhdmVcbiAgICAvLyBcImtleTp2YWx1ZVwiIHRvIGluc3RlYWQgYmUgXCJrZXk6ZGVmYXVsdFwiLiBSZWNvcmQgd2hpY2ggdGFza3MgZ290IGNoYW5nZWRcbiAgICAvLyBzbyB0aGF0IHdlIGNhbiB1c2UgdGhhdCBpbmZvcm1hdGlvbiB3aGVuIHdlIGNyZWF0ZSB0aGUgaW52ZXJ0IG9wZXJhdGlvbi5cblxuICAgIGNvbnN0IGluZGljZXNPZlRhc2tzV2l0aE1hdGNoaW5nUmVzb3VyY2VWYWx1ZXM6IG51bWJlcltdID0gW107XG5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IHJlc291cmNlVmFsdWUgPSB0YXNrLmdldFJlc291cmNlKHRoaXMua2V5KTtcbiAgICAgIGlmIChyZXNvdXJjZVZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBTaW5jZSB0aGUgdmFsdWUgaXMgbm8gbG9uZ2VyIHZhbGlkIHdlIGNoYW5nZSBpdCBiYWNrIHRvIHRoZSBkZWZhdWx0LlxuICAgICAgdGFzay5zZXRSZXNvdXJjZSh0aGlzLmtleSwgZGVmaW5pdGlvbi52YWx1ZXNbMF0pO1xuXG4gICAgICAvLyBSZWNvcmQgd2hpY2ggdGFzayB3ZSBqdXN0IGNoYW5nZWQuXG4gICAgICBpbmRpY2VzT2ZUYXNrc1dpdGhNYXRjaGluZ1Jlc291cmNlVmFsdWVzLnB1c2goaW5kZXgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UoaW5kaWNlc09mVGFza3NXaXRoTWF0Y2hpbmdSZXNvdXJjZVZhbHVlcyksXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGludmVyc2UoaW5kaWNlc09mVGFza3NUb0NoYW5nZTogbnVtYmVyW10pOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBBZGRSZXNvdXJjZU9wdGlvblN1Yk9wKFxuICAgICAgdGhpcy5rZXksXG4gICAgICB0aGlzLnZhbHVlLFxuICAgICAgaW5kaWNlc09mVGFza3NUb0NoYW5nZVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbmFtZVJlc291cmNlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG9sZEtleTogc3RyaW5nO1xuICBuZXdLZXk6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihvbGRLZXk6IHN0cmluZywgbmV3S2V5OiBzdHJpbmcpIHtcbiAgICB0aGlzLm9sZEtleSA9IG9sZEtleTtcbiAgICB0aGlzLm5ld0tleSA9IG5ld0tleTtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBvbGREZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5vbGRLZXkpO1xuICAgIGlmIChvbGREZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm9sZEtleX0gZG9lcyBub3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cblxuICAgIC8vIENvbmZpcm0gdGhlIG5ld0tleSBpcyBub3QgYWxyZWFkeSB1c2VkLlxuICAgIGNvbnN0IG5ld0tleURlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLm5ld0tleSk7XG4gICAgaWYgKG5ld0tleURlZmluaXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmV3S2V5fSBhbHJlYWR5IGV4aXN0cyBhcyBhIHJlc291cmNlIG5hbWUuYCk7XG4gICAgfVxuXG4gICAgcGxhbi5kZWxldGVSZXNvdXJjZURlZmluaXRpb24odGhpcy5vbGRLZXkpO1xuICAgIHBsYW4uc2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMubmV3S2V5LCBvbGREZWZpbml0aW9uKTtcblxuICAgIC8vIE5vdyBsb29wIG92ZXIgZXZlcnkgdGFzayBhbmQgY2hhbmdlIG9sZEtleSAtPiBuZXdrZXkgZm9yIHRoZSBnaXZlbiByZXNvdXJjZSBrZXkuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICBjb25zdCBjdXJyZW50VmFsdWUgPVxuICAgICAgICB0YXNrLmdldFJlc291cmNlKHRoaXMub2xkS2V5KSB8fCBERUZBVUxUX1JFU09VUkNFX1ZBTFVFO1xuICAgICAgdGFzay5zZXRSZXNvdXJjZSh0aGlzLm5ld0tleSwgY3VycmVudFZhbHVlKTtcbiAgICAgIHRhc2suZGVsZXRlUmVzb3VyY2UodGhpcy5vbGRLZXkpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFJlbmFtZVJlc291cmNlU3ViT3AodGhpcy5uZXdLZXksIHRoaXMub2xkS2V5KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVuYW1lUmVzb3VyY2VPcHRpb25TdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG4gIG9sZFZhbHVlOiBzdHJpbmc7XG4gIG5ld1ZhbHVlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Ioa2V5OiBzdHJpbmcsIG9sZFZhbHVlOiBzdHJpbmcsIG5ld1ZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLm9sZFZhbHVlID0gb2xkVmFsdWU7XG4gICAgdGhpcy5uZXdWYWx1ZSA9IG5ld1ZhbHVlO1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGZvdW5kTWF0Y2ggPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKGZvdW5kTWF0Y2ggPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2VzIG5vdCBleGlzdCBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuXG4gICAgLy8gQ29uZmlybSB0aGUgb2xkVmFsdWUgaXMgaW4gdGhlcmUuXG4gICAgY29uc3Qgb2xkVmFsdWVJbmRleCA9IGZvdW5kTWF0Y2gudmFsdWVzLmluZGV4T2YodGhpcy5vbGRWYWx1ZSk7XG5cbiAgICBpZiAob2xkVmFsdWVJbmRleCA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lcyBub3QgYSB2YWx1ZSAke3RoaXMub2xkVmFsdWV9YCk7XG4gICAgfVxuXG4gICAgLy8gQ29uZmlybSB0aGUgbmV3VmFsdWUgaXMgbm90IGluIHRoZXJlLlxuICAgIGNvbnN0IG5ld1ZhbHVlSW5kZXggPSBmb3VuZE1hdGNoLnZhbHVlcy5pbmRleE9mKHRoaXMubmV3VmFsdWUpO1xuICAgIGlmIChuZXdWYWx1ZUluZGV4ICE9PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBhbHJlYWR5IGhhcyBhIHZhbHVlICR7dGhpcy5uZXdWYWx1ZX1gKTtcbiAgICB9XG5cbiAgICAvLyBTd2FwIHRoZSB2YWx1ZXMuXG4gICAgZm91bmRNYXRjaC52YWx1ZXMuc3BsaWNlKG9sZFZhbHVlSW5kZXgsIDEsIHRoaXMubmV3VmFsdWUpO1xuXG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCBjaGFuZ2Ugb2xkVmFsdWUgLT4gbmV3VmFsdWUgZm9yIHRoZSBnaXZlbiByZXNvdXJjZSBrZXkuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICBjb25zdCBjdXJyZW50VmFsdWUgPSB0YXNrLmdldFJlc291cmNlKHRoaXMua2V5KTtcbiAgICAgIGlmIChjdXJyZW50VmFsdWUgPT09IHRoaXMub2xkVmFsdWUpIHtcbiAgICAgICAgdGFzay5zZXRSZXNvdXJjZSh0aGlzLmtleSwgdGhpcy5uZXdWYWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgUmVuYW1lUmVzb3VyY2VPcHRpb25TdWJPcChcbiAgICAgIHRoaXMua2V5LFxuICAgICAgdGhpcy5uZXdWYWx1ZSxcbiAgICAgIHRoaXMub2xkVmFsdWVcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBNb3ZlUmVzb3VyY2VPcHRpb25TdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG4gIG9sZEluZGV4OiBudW1iZXI7XG4gIG5ld0luZGV4OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Ioa2V5OiBzdHJpbmcsIG9sZFZhbHVlOiBudW1iZXIsIG5ld1ZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLm9sZEluZGV4ID0gb2xkVmFsdWU7XG4gICAgdGhpcy5uZXdJbmRleCA9IG5ld1ZhbHVlO1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGRlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKGRlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2VzIG5vdCBleGlzdCBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub2xkSW5kZXggPiBkZWZpbml0aW9uLnZhbHVlcy5sZW5ndGggLSAxKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGAke3RoaXMua2V5fSBkb2VzIG5vdCBoYXZlIGEgdmFsdWUgYXQgaW5kZXggJHt0aGlzLm9sZEluZGV4fWBcbiAgICAgICk7XG4gICAgfVxuICAgIGlmICh0aGlzLm5ld0luZGV4ID4gZGVmaW5pdGlvbi52YWx1ZXMubGVuZ3RoIC0gMSkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgJHt0aGlzLmtleX0gZG9lcyBub3QgaGF2ZSBhIHZhbHVlIGF0IGluZGV4ICR7dGhpcy5uZXdJbmRleH1gXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIFN3YXAgdGhlIHZhbHVlcy5cbiAgICBjb25zdCB0bXAgPSBkZWZpbml0aW9uLnZhbHVlc1t0aGlzLm9sZEluZGV4XTtcbiAgICBkZWZpbml0aW9uLnZhbHVlc1t0aGlzLm9sZEluZGV4XSA9IGRlZmluaXRpb24udmFsdWVzW3RoaXMubmV3SW5kZXhdO1xuICAgIGRlZmluaXRpb24udmFsdWVzW3RoaXMubmV3SW5kZXhdID0gdG1wO1xuXG4gICAgLy8gV2UgZG9uJ3QgbmVlZCB0byBkbyBhbnl0aGluZyB3aXRoIFRhc2tzIGJlY2F1c2UgdGhlIGluZGV4IG9mIGEgdmFsdWUgaXNcbiAgICAvLyBpcnJlbGV2YW50IHNpbmNlIHdlIHN0b3JlIHRoZSB2YWx1ZSBpdHNlbGYsIG5vdCB0aGUgaW5kZXguXG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgTW92ZVJlc291cmNlT3B0aW9uU3ViT3AodGhpcy5rZXksIHRoaXMubmV3SW5kZXgsIHRoaXMub2xkSW5kZXgpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZXRSZXNvdXJjZVZhbHVlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuICB2YWx1ZTogc3RyaW5nO1xuICB0YXNrSW5kZXg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZywgdGFza0luZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy50YXNrSW5kZXggPSB0YXNrSW5kZXg7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZm91bmRNYXRjaCA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZm91bmRNYXRjaCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXMgbm90IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG5cbiAgICBjb25zdCBmb3VuZFZhbHVlTWF0Y2ggPSBmb3VuZE1hdGNoLnZhbHVlcy5maW5kSW5kZXgoKHY6IHN0cmluZykgPT4ge1xuICAgICAgcmV0dXJuIHYgPT09IHRoaXMudmFsdWU7XG4gICAgfSk7XG4gICAgaWYgKGZvdW5kVmFsdWVNYXRjaCA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lcyBub3QgaGF2ZSBhIHZhbHVlIG9mICR7dGhpcy52YWx1ZX1gKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGFza0luZGV4IDwgMCB8fCB0aGlzLnRhc2tJbmRleCA+PSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGVycm9yKGBUaGVyZSBpcyBubyBUYXNrIGF0IGluZGV4ICR7dGhpcy50YXNrSW5kZXh9YCk7XG4gICAgfVxuXG4gICAgY29uc3QgdGFzayA9IHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdO1xuICAgIGNvbnN0IG9sZFZhbHVlID0gdGFzay5nZXRSZXNvdXJjZSh0aGlzLmtleSkhO1xuICAgIHRhc2suc2V0UmVzb3VyY2UodGhpcy5rZXksIHRoaXMudmFsdWUpO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG9sZFZhbHVlKSB9KTtcbiAgfVxuXG4gIGludmVyc2Uob2xkVmFsdWU6IHN0cmluZyk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFNldFJlc291cmNlVmFsdWVTdWJPcCh0aGlzLmtleSwgb2xkVmFsdWUsIHRoaXMudGFza0luZGV4KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQWRkUmVzb3VyY2VPcChuYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBBZGRSZXNvdXJjZVN1Yk9wKG5hbWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZWxldGVSZXNvdXJjZU9wKG5hbWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IERlbGV0ZVJlc291cmNlU3VwT3AobmFtZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFkZFJlc291cmNlT3B0aW9uT3Aoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBBZGRSZXNvdXJjZU9wdGlvblN1Yk9wKGtleSwgdmFsdWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZWxldGVSZXNvdXJjZU9wdGlvbk9wKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgRGVsZXRlUmVzb3VyY2VPcHRpb25TdWJPcChrZXksIHZhbHVlKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmVuYW1lUmVzb3VyY2VPcHRpb25PcChcbiAga2V5OiBzdHJpbmcsXG4gIG9sZFZhbHVlOiBzdHJpbmcsXG4gIG5ld1ZhbHVlOiBzdHJpbmdcbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFJlbmFtZVJlc291cmNlT3B0aW9uU3ViT3Aoa2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZW5hbWVSZXNvdXJjZU9wKG9sZFZhbHVlOiBzdHJpbmcsIG5ld1ZhbHVlOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBSZW5hbWVSZXNvdXJjZVN1Yk9wKG9sZFZhbHVlLCBuZXdWYWx1ZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIE1vdmVSZXNvdXJjZU9wdGlvbk9wKFxuICBrZXk6IHN0cmluZyxcbiAgb2xkSW5kZXg6IG51bWJlcixcbiAgbmV3SW5kZXg6IG51bWJlclxuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgTW92ZVJlc291cmNlT3B0aW9uU3ViT3Aoa2V5LCBvbGRJbmRleCwgbmV3SW5kZXgpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZXRSZXNvdXJjZVZhbHVlT3AoXG4gIGtleTogc3RyaW5nLFxuICB2YWx1ZTogc3RyaW5nLFxuICB0YXNrSW5kZXg6IG51bWJlclxuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgU2V0UmVzb3VyY2VWYWx1ZVN1Yk9wKGtleSwgdmFsdWUsIHRhc2tJbmRleCldKTtcbn1cbiIsICJpbXBvcnQge1xuICBWZXJ0ZXgsXG4gIFZlcnRleEluZGljZXMsXG4gIERpcmVjdGVkR3JhcGgsXG4gIGVkZ2VzQnlTcmNUb01hcCxcbn0gZnJvbSBcIi4uL2RhZy50c1wiO1xuXG4vKipcblRoZSByZXR1cm4gdHlwZSBmb3IgdGhlIFRvcGxvZ2ljYWxTb3J0IGZ1bmN0aW9uLiBcbiAqL1xudHlwZSBUU1JldHVybiA9IHtcbiAgaGFzQ3ljbGVzOiBib29sZWFuO1xuXG4gIGN5Y2xlOiBWZXJ0ZXhJbmRpY2VzO1xuXG4gIG9yZGVyOiBWZXJ0ZXhJbmRpY2VzO1xufTtcblxuLyoqXG5SZXR1cm5zIGEgdG9wb2xvZ2ljYWwgc29ydCBvcmRlciBmb3IgYSBEaXJlY3RlZEdyYXBoLCBvciB0aGUgbWVtYmVycyBvZiBhIGN5Y2xlIGlmIGFcbnRvcG9sb2dpY2FsIHNvcnQgY2FuJ3QgYmUgZG9uZS5cbiBcbiBUaGUgdG9wb2xvZ2ljYWwgc29ydCBjb21lcyBmcm9tOlxuXG4gICAgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVG9wb2xvZ2ljYWxfc29ydGluZyNEZXB0aC1maXJzdF9zZWFyY2hcblxuTCBcdTIxOTAgRW1wdHkgbGlzdCB0aGF0IHdpbGwgY29udGFpbiB0aGUgc29ydGVkIG5vZGVzXG53aGlsZSBleGlzdHMgbm9kZXMgd2l0aG91dCBhIHBlcm1hbmVudCBtYXJrIGRvXG4gICAgc2VsZWN0IGFuIHVubWFya2VkIG5vZGUgblxuICAgIHZpc2l0KG4pXG5cbmZ1bmN0aW9uIHZpc2l0KG5vZGUgbilcbiAgICBpZiBuIGhhcyBhIHBlcm1hbmVudCBtYXJrIHRoZW5cbiAgICAgICAgcmV0dXJuXG4gICAgaWYgbiBoYXMgYSB0ZW1wb3JhcnkgbWFyayB0aGVuXG4gICAgICAgIHN0b3AgICAoZ3JhcGggaGFzIGF0IGxlYXN0IG9uZSBjeWNsZSlcblxuICAgIG1hcmsgbiB3aXRoIGEgdGVtcG9yYXJ5IG1hcmtcblxuICAgIGZvciBlYWNoIG5vZGUgbSB3aXRoIGFuIGVkZ2UgZnJvbSBuIHRvIG0gZG9cbiAgICAgICAgdmlzaXQobSlcblxuICAgIHJlbW92ZSB0ZW1wb3JhcnkgbWFyayBmcm9tIG5cbiAgICBtYXJrIG4gd2l0aCBhIHBlcm1hbmVudCBtYXJrXG4gICAgYWRkIG4gdG8gaGVhZCBvZiBMXG5cbiAqL1xuZXhwb3J0IGNvbnN0IHRvcG9sb2dpY2FsU29ydCA9IChnOiBEaXJlY3RlZEdyYXBoKTogVFNSZXR1cm4gPT4ge1xuICBjb25zdCByZXQ6IFRTUmV0dXJuID0ge1xuICAgIGhhc0N5Y2xlczogZmFsc2UsXG4gICAgY3ljbGU6IFtdLFxuICAgIG9yZGVyOiBbXSxcbiAgfTtcblxuICBjb25zdCBlZGdlTWFwID0gZWRnZXNCeVNyY1RvTWFwKGcuRWRnZXMpO1xuXG4gIGNvbnN0IG5vZGVzV2l0aG91dFBlcm1hbmVudE1hcmsgPSBuZXcgU2V0PG51bWJlcj4oKTtcbiAgZy5WZXJ0aWNlcy5mb3JFYWNoKChfOiBWZXJ0ZXgsIGluZGV4OiBudW1iZXIpID0+XG4gICAgbm9kZXNXaXRob3V0UGVybWFuZW50TWFyay5hZGQoaW5kZXgpXG4gICk7XG5cbiAgY29uc3QgaGFzUGVybWFuZW50TWFyayA9IChpbmRleDogbnVtYmVyKTogYm9vbGVhbiA9PiB7XG4gICAgcmV0dXJuICFub2Rlc1dpdGhvdXRQZXJtYW5lbnRNYXJrLmhhcyhpbmRleCk7XG4gIH07XG5cbiAgY29uc3QgdGVtcG9yYXJ5TWFyayA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuXG4gIGNvbnN0IHZpc2l0ID0gKGluZGV4OiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgICBpZiAoaGFzUGVybWFuZW50TWFyayhpbmRleCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAodGVtcG9yYXJ5TWFyay5oYXMoaW5kZXgpKSB7XG4gICAgICAvLyBXZSBvbmx5IHJldHVybiBmYWxzZSBvbiBmaW5kaW5nIGEgbG9vcCwgd2hpY2ggaXMgc3RvcmVkIGluXG4gICAgICAvLyB0ZW1wb3JhcnlNYXJrLlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0ZW1wb3JhcnlNYXJrLmFkZChpbmRleCk7XG5cbiAgICBjb25zdCBuZXh0RWRnZXMgPSBlZGdlTWFwLmdldChpbmRleCk7XG4gICAgaWYgKG5leHRFZGdlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5leHRFZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBlID0gbmV4dEVkZ2VzW2ldO1xuICAgICAgICBpZiAoIXZpc2l0KGUuaikpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0ZW1wb3JhcnlNYXJrLmRlbGV0ZShpbmRleCk7XG4gICAgbm9kZXNXaXRob3V0UGVybWFuZW50TWFyay5kZWxldGUoaW5kZXgpO1xuICAgIHJldC5vcmRlci51bnNoaWZ0KGluZGV4KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBXZSB3aWxsIHByZXN1bWUgdGhhdCBWZXJ0ZXhbMF0gaXMgdGhlIHN0YXJ0IG5vZGUgYW5kIHRoYXQgd2Ugc2hvdWxkIHN0YXJ0IHRoZXJlLlxuICBjb25zdCBvayA9IHZpc2l0KDApO1xuICBpZiAoIW9rKSB7XG4gICAgcmV0Lmhhc0N5Y2xlcyA9IHRydWU7XG4gICAgcmV0LmN5Y2xlID0gWy4uLnRlbXBvcmFyeU1hcmsua2V5cygpXTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59O1xuIiwgImltcG9ydCB7IFJlc3VsdCwgb2ssIGVycm9yIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHtcbiAgVmVydGV4SW5kaWNlcyxcbiAgRWRnZXMsXG4gIERpcmVjdGVkR3JhcGgsXG4gIGVkZ2VzQnlTcmNUb01hcCxcbiAgZWRnZXNCeURzdFRvTWFwLFxuICBEaXJlY3RlZEVkZ2UsXG4gIERpcmVjdGVkRWRnZVNlcmlhbGl6ZWQsXG59IGZyb20gXCIuLi9kYWcvZGFnXCI7XG5cbmltcG9ydCB7IHRvcG9sb2dpY2FsU29ydCB9IGZyb20gXCIuLi9kYWcvYWxnb3JpdGhtcy90b3Bvc29ydC50c1wiO1xuaW1wb3J0IHsgTWV0cmljVmFsdWVzIH0gZnJvbSBcIi4uL21ldHJpY3MvbWV0cmljcy50c1wiO1xuXG5leHBvcnQgdHlwZSBUYXNrU3RhdGUgPSBcInVuc3RhcnRlZFwiIHwgXCJzdGFydGVkXCIgfCBcImNvbXBsZXRlXCI7XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1RBU0tfTkFNRSA9IFwiVGFzayBOYW1lXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFza1NlcmlhbGl6ZWQge1xuICByZXNvdXJjZXM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XG4gIG1ldHJpY3M6IE1ldHJpY1ZhbHVlcztcbiAgbmFtZTogc3RyaW5nO1xuICBzdGF0ZTogVGFza1N0YXRlO1xufVxuXG4vLyBEbyB3ZSBjcmVhdGUgc3ViLWNsYXNzZXMgYW5kIHRoZW4gc2VyaWFsaXplIHNlcGFyYXRlbHk/IE9yIGRvIHdlIGhhdmUgYVxuLy8gY29uZmlnIGFib3V0IHdoaWNoIHR5cGUgb2YgRHVyYXRpb25TYW1wbGVyIGlzIGJlaW5nIHVzZWQ/XG4vL1xuLy8gV2UgY2FuIHVzZSB0cmFkaXRpb25hbCBvcHRpbWlzdGljL3Blc3NpbWlzdGljIHZhbHVlLiBPciBKYWNvYmlhbidzXG4vLyB1bmNlcnRhaW50bHkgbXVsdGlwbGllcnMgWzEuMSwgMS41LCAyLCA1XSBhbmQgdGhlaXIgaW52ZXJzZXMgdG8gZ2VuZXJhdGUgYW5cbi8vIG9wdGltaXN0aWMgcGVzc2ltaXN0aWMuXG5cbi8qKiBUYXNrIGlzIGEgVmVydGV4IHdpdGggZGV0YWlscyBhYm91dCB0aGUgVGFzayB0byBjb21wbGV0ZS4gKi9cbmV4cG9ydCBjbGFzcyBUYXNrIHtcbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nID0gXCJcIikge1xuICAgIHRoaXMubmFtZSA9IG5hbWUgfHwgREVGQVVMVF9UQVNLX05BTUU7XG4gICAgdGhpcy5tZXRyaWNzID0ge307XG4gICAgdGhpcy5yZXNvdXJjZXMgPSB7fTtcbiAgfVxuXG4gIC8vIFJlc291cmNlIGtleXMgYW5kIHZhbHVlcy4gVGhlIHBhcmVudCBwbGFuIGNvbnRhaW5zIGFsbCB0aGUgcmVzb3VyY2VcbiAgLy8gZGVmaW5pdGlvbnMuXG5cbiAgcmVzb3VyY2VzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xuXG4gIG1ldHJpY3M6IE1ldHJpY1ZhbHVlcztcblxuICBuYW1lOiBzdHJpbmc7XG5cbiAgc3RhdGU6IFRhc2tTdGF0ZSA9IFwidW5zdGFydGVkXCI7XG5cbiAgdG9KU09OKCk6IFRhc2tTZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzb3VyY2VzOiB0aGlzLnJlc291cmNlcyxcbiAgICAgIG1ldHJpY3M6IHRoaXMubWV0cmljcyxcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgIHN0YXRlOiB0aGlzLnN0YXRlLFxuICAgIH07XG4gIH1cblxuICBwdWJsaWMgZ2V0IGR1cmF0aW9uKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TWV0cmljKFwiRHVyYXRpb25cIikhO1xuICB9XG5cbiAgcHVibGljIHNldCBkdXJhdGlvbih2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5zZXRNZXRyaWMoXCJEdXJhdGlvblwiLCB2YWx1ZSk7XG4gIH1cblxuICBwdWJsaWMgZ2V0TWV0cmljKGtleTogc3RyaW5nKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5tZXRyaWNzW2tleV07XG4gIH1cblxuICBwdWJsaWMgc2V0TWV0cmljKGtleTogc3RyaW5nLCB2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5tZXRyaWNzW2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBkZWxldGVNZXRyaWMoa2V5OiBzdHJpbmcpIHtcbiAgICBkZWxldGUgdGhpcy5tZXRyaWNzW2tleV07XG4gIH1cblxuICBwdWJsaWMgZ2V0UmVzb3VyY2Uoa2V5OiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLnJlc291cmNlc1trZXldO1xuICB9XG5cbiAgcHVibGljIHNldFJlc291cmNlKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5yZXNvdXJjZXNba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGRlbGV0ZVJlc291cmNlKGtleTogc3RyaW5nKSB7XG4gICAgZGVsZXRlIHRoaXMucmVzb3VyY2VzW2tleV07XG4gIH1cblxuICBwdWJsaWMgZHVwKCk6IFRhc2sge1xuICAgIGNvbnN0IHJldCA9IG5ldyBUYXNrKCk7XG4gICAgcmV0LnJlc291cmNlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMucmVzb3VyY2VzKTtcbiAgICByZXQubWV0cmljcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMubWV0cmljcyk7XG4gICAgcmV0Lm5hbWUgPSB0aGlzLm5hbWU7XG4gICAgcmV0LnN0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICByZXR1cm4gcmV0O1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFRhc2tzID0gVGFza1tdO1xuXG5leHBvcnQgaW50ZXJmYWNlIENoYXJ0U2VyaWFsaXplZCB7XG4gIHZlcnRpY2VzOiBUYXNrU2VyaWFsaXplZFtdO1xuICBlZGdlczogRGlyZWN0ZWRFZGdlU2VyaWFsaXplZFtdO1xufVxuXG4vKiogQSBDaGFydCBpcyBhIERpcmVjdGVkR3JhcGgsIGJ1dCB3aXRoIFRhc2tzIGZvciBWZXJ0aWNlcy4gKi9cbmV4cG9ydCBjbGFzcyBDaGFydCB7XG4gIFZlcnRpY2VzOiBUYXNrcztcbiAgRWRnZXM6IEVkZ2VzO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGNvbnN0IHN0YXJ0ID0gbmV3IFRhc2soXCJTdGFydFwiKTtcbiAgICBzdGFydC5zZXRNZXRyaWMoXCJEdXJhdGlvblwiLCAwKTtcbiAgICBjb25zdCBmaW5pc2ggPSBuZXcgVGFzayhcIkZpbmlzaFwiKTtcbiAgICBmaW5pc2guc2V0TWV0cmljKFwiRHVyYXRpb25cIiwgMCk7XG4gICAgdGhpcy5WZXJ0aWNlcyA9IFtzdGFydCwgZmluaXNoXTtcbiAgICB0aGlzLkVkZ2VzID0gW25ldyBEaXJlY3RlZEVkZ2UoMCwgMSldO1xuICB9XG5cbiAgdG9KU09OKCk6IENoYXJ0U2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZlcnRpY2VzOiB0aGlzLlZlcnRpY2VzLm1hcCgodDogVGFzaykgPT4gdC50b0pTT04oKSksXG4gICAgICBlZGdlczogdGhpcy5FZGdlcy5tYXAoKGU6IERpcmVjdGVkRWRnZSkgPT4gZS50b0pTT04oKSksXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBUb3BvbG9naWNhbE9yZGVyID0gVmVydGV4SW5kaWNlcztcblxuZXhwb3J0IHR5cGUgVmFsaWRhdGVSZXN1bHQgPSBSZXN1bHQ8VG9wb2xvZ2ljYWxPcmRlcj47XG5cbi8qKiBWYWxpZGF0ZXMgYSBEaXJlY3RlZEdyYXBoIGlzIGEgdmFsaWQgQ2hhcnQuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVDaGFydChnOiBEaXJlY3RlZEdyYXBoKTogVmFsaWRhdGVSZXN1bHQge1xuICBpZiAoZy5WZXJ0aWNlcy5sZW5ndGggPCAyKSB7XG4gICAgcmV0dXJuIGVycm9yKFxuICAgICAgXCJDaGFydCBtdXN0IGNvbnRhaW4gYXQgbGVhc3QgdHdvIG5vZGUsIHRoZSBzdGFydCBhbmQgZmluaXNoIHRhc2tzLlwiXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN0IGVkZ2VzQnlEc3QgPSBlZGdlc0J5RHN0VG9NYXAoZy5FZGdlcyk7XG4gIGNvbnN0IGVkZ2VzQnlTcmMgPSBlZGdlc0J5U3JjVG9NYXAoZy5FZGdlcyk7XG5cbiAgLy8gVGhlIGZpcnN0IFZlcnRleCwgVF8wIGFrYSB0aGUgU3RhcnQgTWlsZXN0b25lLCBtdXN0IGhhdmUgMCBpbmNvbWluZyBlZGdlcy5cbiAgaWYgKGVkZ2VzQnlEc3QuZ2V0KDApICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gZXJyb3IoXCJUaGUgc3RhcnQgbm9kZSAoMCkgaGFzIGFuIGluY29taW5nIGVkZ2UuXCIpO1xuICB9XG5cbiAgLy8gQW5kIG9ubHkgVF8wIHNob3VsZCBoYXZlIDAgaW5jb21pbmcgZWRnZXMuXG4gIGZvciAobGV0IGkgPSAxOyBpIDwgZy5WZXJ0aWNlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChlZGdlc0J5RHN0LmdldChpKSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGBGb3VuZCBub2RlIHRoYXQgaXNuJ3QgKDApIHRoYXQgaGFzIG5vIGluY29taW5nIGVkZ2VzOiAke2l9YFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvLyBUaGUgbGFzdCBWZXJ0ZXgsIFRfZmluaXNoLCB0aGUgRmluaXNoIE1pbGVzdG9uZSwgbXVzdCBoYXZlIDAgb3V0Z29pbmcgZWRnZXMuXG4gIGlmIChlZGdlc0J5U3JjLmdldChnLlZlcnRpY2VzLmxlbmd0aCAtIDEpICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBcIlRoZSBsYXN0IG5vZGUsIHdoaWNoIHNob3VsZCBiZSB0aGUgRmluaXNoIE1pbGVzdG9uZSwgaGFzIGFuIG91dGdvaW5nIGVkZ2UuXCJcbiAgICApO1xuICB9XG5cbiAgLy8gQW5kIG9ubHkgVF9maW5pc2ggc2hvdWxkIGhhdmUgMCBvdXRnb2luZyBlZGdlcy5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBnLlZlcnRpY2VzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgIGlmIChlZGdlc0J5U3JjLmdldChpKSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGBGb3VuZCBub2RlIHRoYXQgaXNuJ3QgVF9maW5pc2ggdGhhdCBoYXMgbm8gb3V0Z29pbmcgZWRnZXM6ICR7aX1gXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG51bVZlcnRpY2VzID0gZy5WZXJ0aWNlcy5sZW5ndGg7XG4gIC8vIEFuZCBhbGwgZWRnZXMgbWFrZSBzZW5zZSwgaS5lLiB0aGV5IGFsbCBwb2ludCB0byB2ZXJ0ZXhlcyB0aGF0IGV4aXN0LlxuICBmb3IgKGxldCBpID0gMDsgaSA8IGcuRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBlbGVtZW50ID0gZy5FZGdlc1tpXTtcbiAgICBpZiAoXG4gICAgICBlbGVtZW50LmkgPCAwIHx8XG4gICAgICBlbGVtZW50LmkgPj0gbnVtVmVydGljZXMgfHxcbiAgICAgIGVsZW1lbnQuaiA8IDAgfHxcbiAgICAgIGVsZW1lbnQuaiA+PSBudW1WZXJ0aWNlc1xuICAgICkge1xuICAgICAgcmV0dXJuIGVycm9yKGBFZGdlICR7ZWxlbWVudH0gcG9pbnRzIHRvIGEgbm9uLWV4aXN0ZW50IFZlcnRleC5gKTtcbiAgICB9XG4gIH1cblxuICAvLyBOb3cgd2UgY29uZmlybSB0aGF0IHdlIGhhdmUgYSBEaXJlY3RlZCBBY3ljbGljIEdyYXBoLCBpLmUuIHRoZSBncmFwaCBoYXMgbm9cbiAgLy8gY3ljbGVzIGJ5IGNyZWF0aW5nIGEgdG9wb2xvZ2ljYWwgc29ydCBzdGFydGluZyBhdCBUXzBcbiAgLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVG9wb2xvZ2ljYWxfc29ydGluZyNEZXB0aC1maXJzdF9zZWFyY2hcbiAgY29uc3QgdHNSZXQgPSB0b3BvbG9naWNhbFNvcnQoZyk7XG4gIGlmICh0c1JldC5oYXNDeWNsZXMpIHtcbiAgICByZXR1cm4gZXJyb3IoYENoYXJ0IGhhcyBjeWNsZTogJHtbLi4udHNSZXQuY3ljbGVdLmpvaW4oXCIsIFwiKX1gKTtcbiAgfVxuXG4gIHJldHVybiBvayh0c1JldC5vcmRlcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDaGFydFZhbGlkYXRlKGM6IENoYXJ0KTogVmFsaWRhdGVSZXN1bHQge1xuICBjb25zdCByZXQgPSB2YWxpZGF0ZUNoYXJ0KGMpO1xuICBpZiAoIXJldC5vaykge1xuICAgIHJldHVybiByZXQ7XG4gIH1cbiAgaWYgKGMuVmVydGljZXNbMF0uZHVyYXRpb24gIT09IDApIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBgU3RhcnQgTWlsZXN0b25lIG11c3QgaGF2ZSBkdXJhdGlvbiBvZiAwLCBpbnN0ZWFkIGdvdCAke2MuVmVydGljZXNbMF0uZHVyYXRpb259YFxuICAgICk7XG4gIH1cbiAgaWYgKGMuVmVydGljZXNbYy5WZXJ0aWNlcy5sZW5ndGggLSAxXS5kdXJhdGlvbiAhPT0gMCkge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIGBGaW5pc2ggTWlsZXN0b25lIG11c3QgaGF2ZSBkdXJhdGlvbiBvZiAwLCBpbnN0ZWFkIGdvdCAke1xuICAgICAgICBjLlZlcnRpY2VzW2MuVmVydGljZXMubGVuZ3RoIC0gMV0uZHVyYXRpb25cbiAgICAgIH1gXG4gICAgKTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuIiwgImltcG9ydCB7IFJvdW5kZXIgfSBmcm9tIFwiLi4vdHlwZXMvdHlwZXNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBQcmVjaXNpb25TZXJpYWxpemVkIHtcbiAgcHJlY2lzaW9uOiBudW1iZXI7XG59XG5leHBvcnQgY2xhc3MgUHJlY2lzaW9uIHtcbiAgcHJpdmF0ZSBtdWx0aXBsaWVyOiBudW1iZXI7XG4gIHByaXZhdGUgX3ByZWNpc2lvbjogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHByZWNpc2lvbjogbnVtYmVyID0gMCkge1xuICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHByZWNpc2lvbikpIHtcbiAgICAgIHByZWNpc2lvbiA9IDA7XG4gICAgfVxuICAgIHRoaXMuX3ByZWNpc2lvbiA9IE1hdGguYWJzKE1hdGgudHJ1bmMocHJlY2lzaW9uKSk7XG4gICAgdGhpcy5tdWx0aXBsaWVyID0gMTAgKiogdGhpcy5fcHJlY2lzaW9uO1xuICB9XG5cbiAgcm91bmQoeDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gTWF0aC50cnVuYyh4ICogdGhpcy5tdWx0aXBsaWVyKSAvIHRoaXMubXVsdGlwbGllcjtcbiAgfVxuXG4gIHJvdW5kZXIoKTogUm91bmRlciB7XG4gICAgcmV0dXJuICh4OiBudW1iZXIpOiBudW1iZXIgPT4gdGhpcy5yb3VuZCh4KTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgcHJlY2lzaW9uKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3ByZWNpc2lvbjtcbiAgfVxuXG4gIHRvSlNPTigpOiBQcmVjaXNpb25TZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgcHJlY2lzaW9uOiB0aGlzLl9wcmVjaXNpb24sXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBGcm9tSlNPTihzOiBQcmVjaXNpb25TZXJpYWxpemVkIHwgdW5kZWZpbmVkKTogUHJlY2lzaW9uIHtcbiAgICBpZiAocyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbmV3IFByZWNpc2lvbigpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByZWNpc2lvbihzLnByZWNpc2lvbik7XG4gIH1cbn1cbiIsICIvLyBVdGlsaXRpZXMgZm9yIGRlYWxpbmcgd2l0aCBhIHJhbmdlIG9mIG51bWJlcnMuXG5cbmV4cG9ydCBpbnRlcmZhY2UgTWV0cmljUmFuZ2VTZXJpYWxpemVkIHtcbiAgbWluOiBudW1iZXI7XG4gIG1heDogbnVtYmVyO1xufVxuXG5leHBvcnQgY29uc3QgY2xhbXAgPSAoeDogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIpOiBudW1iZXIgPT4ge1xuICBpZiAoeCA+IG1heCkge1xuICAgIHJldHVybiBtYXg7XG4gIH1cbiAgaWYgKHggPCBtaW4pIHtcbiAgICByZXR1cm4gbWluO1xuICB9XG4gIHJldHVybiB4O1xufTtcblxuLy8gUmFuZ2UgZGVmaW5lcyBhIHJhbmdlIG9mIG51bWJlcnMsIGZyb20gW21pbiwgbWF4XSBpbmNsdXNpdmUuXG5leHBvcnQgY2xhc3MgTWV0cmljUmFuZ2Uge1xuICBwcml2YXRlIF9taW46IG51bWJlciA9IC1OdW1iZXIuTUFYX1ZBTFVFO1xuICBwcml2YXRlIF9tYXg6IG51bWJlciA9IE51bWJlci5NQVhfVkFMVUU7XG5cbiAgY29uc3RydWN0b3IobWluOiBudW1iZXIgPSAtTnVtYmVyLk1BWF9WQUxVRSwgbWF4OiBudW1iZXIgPSBOdW1iZXIuTUFYX1ZBTFVFKSB7XG4gICAgaWYgKG1heCA8IG1pbikge1xuICAgICAgW21pbiwgbWF4XSA9IFttYXgsIG1pbl07XG4gICAgfVxuICAgIHRoaXMuX21pbiA9IG1pbjtcbiAgICB0aGlzLl9tYXggPSBtYXg7XG4gIH1cblxuICBjbGFtcCh2YWx1ZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gY2xhbXAodmFsdWUsIHRoaXMuX21pbiwgdGhpcy5fbWF4KTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWluKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX21pbjtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWF4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX21heDtcbiAgfVxuXG4gIHRvSlNPTigpOiBNZXRyaWNSYW5nZVNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICBtaW46IHRoaXMuX21pbixcbiAgICAgIG1heDogdGhpcy5fbWF4LFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgRnJvbUpTT04oczogTWV0cmljUmFuZ2VTZXJpYWxpemVkIHwgdW5kZWZpbmVkKTogTWV0cmljUmFuZ2Uge1xuICAgIGlmIChzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBuZXcgTWV0cmljUmFuZ2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBNZXRyaWNSYW5nZShzLm1pbiwgcy5tYXgpO1xuICB9XG59XG4iLCAiLy8gTWV0cmljcyBkZWZpbmUgZmxvYXRpbmcgcG9pbnQgdmFsdWVzIHRoYXQgYXJlIHRyYWNrZWQgcGVyIFRhc2suXG5cbmltcG9ydCB7IFByZWNpc2lvbiwgUHJlY2lzaW9uU2VyaWFsaXplZCB9IGZyb20gXCIuLi9wcmVjaXNpb24vcHJlY2lzaW9uLnRzXCI7XG5pbXBvcnQgeyBjbGFtcCwgTWV0cmljUmFuZ2UsIE1ldHJpY1JhbmdlU2VyaWFsaXplZCB9IGZyb20gXCIuL3JhbmdlLnRzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWV0cmljRGVmaW5pdGlvblNlcmlhbGl6ZWQge1xuICByYW5nZTogTWV0cmljUmFuZ2VTZXJpYWxpemVkO1xuICBkZWZhdWx0OiBudW1iZXI7XG4gIHByZWNpc2lvbjogUHJlY2lzaW9uU2VyaWFsaXplZDtcbn1cblxuZXhwb3J0IGNsYXNzIE1ldHJpY0RlZmluaXRpb24ge1xuICByYW5nZTogTWV0cmljUmFuZ2U7XG4gIGRlZmF1bHQ6IG51bWJlcjtcbiAgaXNTdGF0aWM6IGJvb2xlYW47XG4gIHByZWNpc2lvbjogUHJlY2lzaW9uO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGRlZmF1bHRWYWx1ZTogbnVtYmVyLFxuICAgIHJhbmdlOiBNZXRyaWNSYW5nZSA9IG5ldyBNZXRyaWNSYW5nZSgpLFxuICAgIGlzU3RhdGljOiBib29sZWFuID0gZmFsc2UsXG4gICAgcHJlY2lzaW9uOiBQcmVjaXNpb24gPSBuZXcgUHJlY2lzaW9uKDEpXG4gICkge1xuICAgIHRoaXMucmFuZ2UgPSByYW5nZTtcbiAgICB0aGlzLmRlZmF1bHQgPSBjbGFtcChkZWZhdWx0VmFsdWUsIHJhbmdlLm1pbiwgcmFuZ2UubWF4KTtcbiAgICB0aGlzLmlzU3RhdGljID0gaXNTdGF0aWM7XG4gICAgdGhpcy5wcmVjaXNpb24gPSBwcmVjaXNpb247XG4gIH1cblxuICB0b0pTT04oKTogTWV0cmljRGVmaW5pdGlvblNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICByYW5nZTogdGhpcy5yYW5nZS50b0pTT04oKSxcbiAgICAgIGRlZmF1bHQ6IHRoaXMuZGVmYXVsdCxcbiAgICAgIHByZWNpc2lvbjogdGhpcy5wcmVjaXNpb24udG9KU09OKCksXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBGcm9tSlNPTihzOiBNZXRyaWNEZWZpbml0aW9uU2VyaWFsaXplZCB8IHVuZGVmaW5lZCk6IE1ldHJpY0RlZmluaXRpb24ge1xuICAgIGlmIChzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBuZXcgTWV0cmljRGVmaW5pdGlvbigwKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBNZXRyaWNEZWZpbml0aW9uKFxuICAgICAgcy5kZWZhdWx0IHx8IDAsXG4gICAgICBNZXRyaWNSYW5nZS5Gcm9tSlNPTihzLnJhbmdlKSxcbiAgICAgIGZhbHNlLFxuICAgICAgUHJlY2lzaW9uLkZyb21KU09OKHMucHJlY2lzaW9uKVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgTWV0cmljRGVmaW5pdGlvbnMgPSB7IFtrZXk6IHN0cmluZ106IE1ldHJpY0RlZmluaXRpb24gfTtcblxuZXhwb3J0IHR5cGUgTWV0cmljRGVmaW5pdGlvbnNTZXJpYWxpemVkID0ge1xuICBba2V5OiBzdHJpbmddOiBNZXRyaWNEZWZpbml0aW9uU2VyaWFsaXplZDtcbn07XG5cbmV4cG9ydCB0eXBlIE1ldHJpY1ZhbHVlcyA9IHsgW2tleTogc3RyaW5nXTogbnVtYmVyIH07XG4iLCAiLyoqXG4gKiBUcmlhbmd1bGFyIGlzIHRoZSBpbnZlcnNlIEN1bXVsYXRpdmUgRGVuc2l0eSBGdW5jdGlvbiAoQ0RGKSBmb3IgdGhlXG4gKiB0cmlhbmd1bGFyIGRpc3RyaWJ1dGlvbi5cbiAqXG4gKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Ucmlhbmd1bGFyX2Rpc3RyaWJ1dGlvbiNHZW5lcmF0aW5nX3JhbmRvbV92YXJpYXRlc1xuICpcbiAqIFRoZSBpbnZlcnNlIG9mIHRoZSBDREYgaXMgdXNlZnVsIGZvciBnZW5lcmF0aW5nIHNhbXBsZXMgZnJvbSB0aGVcbiAqIGRpc3RyaWJ1dGlvbiwgaS5lLiBwYXNzaW5nIGluIHZhbHVlcyBmcm9tIHRoZSB1bmlmb3JtIGRpc3RyaWJ1dGlvbiBbMCwgMV1cbiAqIHdpbGwgcHJvZHVjZSBzYW1wbGUgdGhhdCBsb29rIGxpa2UgdGhleSBjb21lIGZyb20gdGhlIHRyaWFuZ3VsYXJcbiAqIGRpc3RyaWJ1dGlvbi5cbiAqXG4gKlxuICovXG5cbmV4cG9ydCBjbGFzcyBUcmlhbmd1bGFyIHtcbiAgcHJpdmF0ZSBhOiBudW1iZXI7XG4gIHByaXZhdGUgYjogbnVtYmVyO1xuICBwcml2YXRlIGM6IG51bWJlcjtcbiAgcHJpdmF0ZSBGX2M6IG51bWJlcjtcblxuICAvKiogIFRoZSB0cmlhbmd1bGFyIGRpc3RyaWJ1dGlvbiBpcyBhIGNvbnRpbnVvdXMgcHJvYmFiaWxpdHkgZGlzdHJpYnV0aW9uIHdpdGhcbiAgbG93ZXIgbGltaXQgYGFgLCB1cHBlciBsaW1pdCBgYmAsIGFuZCBtb2RlIGBjYCwgd2hlcmUgYSA8IGIgYW5kIGEgXHUyMjY0IGMgXHUyMjY0IGIuICovXG4gIGNvbnN0cnVjdG9yKGE6IG51bWJlciwgYjogbnVtYmVyLCBjOiBudW1iZXIpIHtcbiAgICB0aGlzLmEgPSBhO1xuICAgIHRoaXMuYiA9IGI7XG4gICAgdGhpcy5jID0gYztcblxuICAgIC8vIEZfYyBpcyB0aGUgY3V0b2ZmIGluIHRoZSBkb21haW4gd2hlcmUgd2Ugc3dpdGNoIGJldHdlZW4gdGhlIHR3byBoYWx2ZXMgb2ZcbiAgICAvLyB0aGUgdHJpYW5nbGUuXG4gICAgdGhpcy5GX2MgPSAoYyAtIGEpIC8gKGIgLSBhKTtcbiAgfVxuXG4gIC8qKiAgUHJvZHVjZSBhIHNhbXBsZSBmcm9tIHRoZSB0cmlhbmd1bGFyIGRpc3RyaWJ1dGlvbi4gVGhlIHZhbHVlIG9mICdwJ1xuICAgc2hvdWxkIGJlIGluIFswLCAxLjBdLiAqL1xuICBzYW1wbGUocDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICBpZiAocCA8IDApIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH0gZWxzZSBpZiAocCA+IDEuMCkge1xuICAgICAgcmV0dXJuIDEuMDtcbiAgICB9IGVsc2UgaWYgKHAgPCB0aGlzLkZfYykge1xuICAgICAgcmV0dXJuIHRoaXMuYSArIE1hdGguc3FydChwICogKHRoaXMuYiAtIHRoaXMuYSkgKiAodGhpcy5jIC0gdGhpcy5hKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHRoaXMuYiAtIE1hdGguc3FydCgoMSAtIHApICogKHRoaXMuYiAtIHRoaXMuYSkgKiAodGhpcy5iIC0gdGhpcy5jKSlcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG4iLCAiaW1wb3J0IHsgVHJpYW5ndWxhciB9IGZyb20gXCIuL3RyaWFuZ3VsYXIudHNcIjtcblxuZXhwb3J0IHR5cGUgVW5jZXJ0YWludHkgPSBcImxvd1wiIHwgXCJtb2RlcmF0ZVwiIHwgXCJoaWdoXCIgfCBcImV4dHJlbWVcIjtcblxuZXhwb3J0IGNvbnN0IFVuY2VydGFpbnR5VG9OdW06IFJlY29yZDxVbmNlcnRhaW50eSwgbnVtYmVyPiA9IHtcbiAgbG93OiAxLjEsXG4gIG1vZGVyYXRlOiAxLjUsXG4gIGhpZ2g6IDIsXG4gIGV4dHJlbWU6IDUsXG59O1xuXG5leHBvcnQgY2xhc3MgSmFjb2JpYW4ge1xuICBwcml2YXRlIHRyaWFuZ3VsYXI6IFRyaWFuZ3VsYXI7XG4gIGNvbnN0cnVjdG9yKGV4cGVjdGVkOiBudW1iZXIsIHVuY2VydGFpbnR5OiBVbmNlcnRhaW50eSkge1xuICAgIGNvbnN0IG11bCA9IFVuY2VydGFpbnR5VG9OdW1bdW5jZXJ0YWludHldO1xuICAgIHRoaXMudHJpYW5ndWxhciA9IG5ldyBUcmlhbmd1bGFyKGV4cGVjdGVkIC8gbXVsLCBleHBlY3RlZCAqIG11bCwgZXhwZWN0ZWQpO1xuICB9XG5cbiAgc2FtcGxlKHA6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMudHJpYW5ndWxhci5zYW1wbGUocCk7XG4gIH1cbn1cbiIsICJpbXBvcnQge1xuICBDaGFydCxcbiAgQ2hhcnRTZXJpYWxpemVkLFxuICBUYXNrLFxuICBUYXNrU2VyaWFsaXplZCxcbiAgdmFsaWRhdGVDaGFydCxcbn0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBEaXJlY3RlZEVkZ2UsIERpcmVjdGVkRWRnZVNlcmlhbGl6ZWQgfSBmcm9tIFwiLi4vZGFnL2RhZy50c1wiO1xuaW1wb3J0IHtcbiAgTWV0cmljRGVmaW5pdGlvbixcbiAgTWV0cmljRGVmaW5pdGlvbnMsXG4gIE1ldHJpY0RlZmluaXRpb25zU2VyaWFsaXplZCxcbn0gZnJvbSBcIi4uL21ldHJpY3MvbWV0cmljcy50c1wiO1xuaW1wb3J0IHsgTWV0cmljUmFuZ2UgfSBmcm9tIFwiLi4vbWV0cmljcy9yYW5nZS50c1wiO1xuaW1wb3J0IHsgUmF0aW9uYWxpemVFZGdlc09wIH0gZnJvbSBcIi4uL29wcy9jaGFydC50c1wiO1xuaW1wb3J0IHtcbiAgUmVzb3VyY2VEZWZpbml0aW9uLFxuICBSZXNvdXJjZURlZmluaXRpb25zLFxuICBSZXNvdXJjZURlZmluaXRpb25zU2VyaWFsaXplZCxcbn0gZnJvbSBcIi4uL3Jlc291cmNlcy9yZXNvdXJjZXMudHNcIjtcbmltcG9ydCB7IFJlc3VsdCwgb2sgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBVbmNlcnRhaW50eVRvTnVtIH0gZnJvbSBcIi4uL3N0YXRzL2NkZi90cmlhbmd1bGFyL2phY29iaWFuLnRzXCI7XG5cbmV4cG9ydCB0eXBlIFN0YXRpY01ldHJpY0tleXMgPSBcIkR1cmF0aW9uXCIgfCBcIlBlcmNlbnQgQ29tcGxldGVcIjtcblxuZXhwb3J0IGNvbnN0IFN0YXRpY01ldHJpY0RlZmluaXRpb25zOiBNZXRyaWNEZWZpbml0aW9ucyA9IHtcbiAgLy8gSG93IGxvbmcgYSB0YXNrIHdpbGwgdGFrZSwgaW4gZGF5cy5cbiAgRHVyYXRpb246IG5ldyBNZXRyaWNEZWZpbml0aW9uKDAsIG5ldyBNZXRyaWNSYW5nZSgpLCB0cnVlKSxcbiAgLy8gVGhlIHBlcmNlbnQgY29tcGxldGUgZm9yIGEgdGFzay5cbiAgUGVyY2VudDogbmV3IE1ldHJpY0RlZmluaXRpb24oMCwgbmV3IE1ldHJpY1JhbmdlKDAsIDEwMCksIHRydWUpLFxufTtcblxuZXhwb3J0IGNvbnN0IFN0YXRpY1Jlc291cmNlRGVmaW5pdGlvbnM6IFJlc291cmNlRGVmaW5pdGlvbnMgPSB7XG4gIFVuY2VydGFpbnR5OiBuZXcgUmVzb3VyY2VEZWZpbml0aW9uKE9iamVjdC5rZXlzKFVuY2VydGFpbnR5VG9OdW0pLCB0cnVlKSxcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGxhblNlcmlhbGl6ZWQge1xuICBjaGFydDogQ2hhcnRTZXJpYWxpemVkO1xuICByZXNvdXJjZURlZmluaXRpb25zOiBSZXNvdXJjZURlZmluaXRpb25zU2VyaWFsaXplZDtcbiAgbWV0cmljRGVmaW5pdGlvbnM6IE1ldHJpY0RlZmluaXRpb25zU2VyaWFsaXplZDtcbn1cblxuZXhwb3J0IGNsYXNzIFBsYW4ge1xuICBjaGFydDogQ2hhcnQ7XG5cbiAgcmVzb3VyY2VEZWZpbml0aW9uczogUmVzb3VyY2VEZWZpbml0aW9ucztcblxuICBtZXRyaWNEZWZpbml0aW9uczogTWV0cmljRGVmaW5pdGlvbnM7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jaGFydCA9IG5ldyBDaGFydCgpO1xuXG4gICAgdGhpcy5yZXNvdXJjZURlZmluaXRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgU3RhdGljUmVzb3VyY2VEZWZpbml0aW9ucyk7XG4gICAgdGhpcy5tZXRyaWNEZWZpbml0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIFN0YXRpY01ldHJpY0RlZmluaXRpb25zKTtcbiAgICB0aGlzLmFwcGx5TWV0cmljc0FuZFJlc291cmNlc1RvVmVydGljZXMoKTtcbiAgfVxuXG4gIGFwcGx5TWV0cmljc0FuZFJlc291cmNlc1RvVmVydGljZXMoKSB7XG4gICAgT2JqZWN0LmtleXModGhpcy5tZXRyaWNEZWZpbml0aW9ucykuZm9yRWFjaCgobWV0cmljTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBtZCA9IHRoaXMubWV0cmljRGVmaW5pdGlvbnNbbWV0cmljTmFtZV0hO1xuICAgICAgdGhpcy5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICAgIHRhc2suc2V0TWV0cmljKG1ldHJpY05hbWUsIG1kLmRlZmF1bHQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgT2JqZWN0LmVudHJpZXModGhpcy5yZXNvdXJjZURlZmluaXRpb25zKS5mb3JFYWNoKFxuICAgICAgKFtrZXksIHJlc291cmNlRGVmaW5pdGlvbl0pID0+IHtcbiAgICAgICAgdGhpcy5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICAgICAgdGFzay5zZXRSZXNvdXJjZShrZXksIHJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXNbMF0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgdG9KU09OKCk6IFBsYW5TZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2hhcnQ6IHRoaXMuY2hhcnQudG9KU09OKCksXG4gICAgICByZXNvdXJjZURlZmluaXRpb25zOiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHRoaXMucmVzb3VyY2VEZWZpbml0aW9ucykuZmlsdGVyKFxuICAgICAgICAgIChba2V5LCByZXNvdXJjZURlZmluaXRpb25dKSA9PiAhcmVzb3VyY2VEZWZpbml0aW9uLmlzU3RhdGljXG4gICAgICAgIClcbiAgICAgICksXG4gICAgICBtZXRyaWNEZWZpbml0aW9uczogT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICBPYmplY3QuZW50cmllcyh0aGlzLm1ldHJpY0RlZmluaXRpb25zKVxuICAgICAgICAgIC5maWx0ZXIoKFtrZXksIG1ldHJpY0RlZmluaXRpb25dKSA9PiAhbWV0cmljRGVmaW5pdGlvbi5pc1N0YXRpYylcbiAgICAgICAgICAubWFwKChba2V5LCBtZXRyaWNEZWZpbml0aW9uXSkgPT4gW2tleSwgbWV0cmljRGVmaW5pdGlvbi50b0pTT04oKV0pXG4gICAgICApLFxuICAgIH07XG4gIH1cblxuICBnZXRNZXRyaWNEZWZpbml0aW9uKGtleTogc3RyaW5nKTogTWV0cmljRGVmaW5pdGlvbiB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMubWV0cmljRGVmaW5pdGlvbnNba2V5XTtcbiAgfVxuXG4gIHNldE1ldHJpY0RlZmluaXRpb24oa2V5OiBzdHJpbmcsIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb24pIHtcbiAgICB0aGlzLm1ldHJpY0RlZmluaXRpb25zW2tleV0gPSBtZXRyaWNEZWZpbml0aW9uO1xuICB9XG5cbiAgZGVsZXRlTWV0cmljRGVmaW5pdGlvbihrZXk6IHN0cmluZykge1xuICAgIGRlbGV0ZSB0aGlzLm1ldHJpY0RlZmluaXRpb25zW2tleV07XG4gIH1cblxuICBnZXRSZXNvdXJjZURlZmluaXRpb24oa2V5OiBzdHJpbmcpOiBSZXNvdXJjZURlZmluaXRpb24gfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLnJlc291cmNlRGVmaW5pdGlvbnNba2V5XTtcbiAgfVxuXG4gIHNldFJlc291cmNlRGVmaW5pdGlvbihrZXk6IHN0cmluZywgdmFsdWU6IFJlc291cmNlRGVmaW5pdGlvbikge1xuICAgIHRoaXMucmVzb3VyY2VEZWZpbml0aW9uc1trZXldID0gdmFsdWU7XG4gIH1cblxuICBkZWxldGVSZXNvdXJjZURlZmluaXRpb24oa2V5OiBzdHJpbmcpIHtcbiAgICBkZWxldGUgdGhpcy5yZXNvdXJjZURlZmluaXRpb25zW2tleV07XG4gIH1cblxuICAvLyBSZXR1cm5zIGEgbmV3IFRhc2sgd2l0aCBkZWZhdWx0cyBmb3IgYWxsIG1ldHJpY3MgYW5kIHJlc291cmNlcy5cbiAgbmV3VGFzaygpOiBUYXNrIHtcbiAgICBjb25zdCByZXQgPSBuZXcgVGFzaygpO1xuICAgIE9iamVjdC5rZXlzKHRoaXMubWV0cmljRGVmaW5pdGlvbnMpLmZvckVhY2goKG1ldHJpY05hbWU6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgbWQgPSB0aGlzLmdldE1ldHJpY0RlZmluaXRpb24obWV0cmljTmFtZSkhO1xuXG4gICAgICByZXQuc2V0TWV0cmljKG1ldHJpY05hbWUsIG1kLmRlZmF1bHQpO1xuICAgIH0pO1xuICAgIE9iamVjdC5lbnRyaWVzKHRoaXMucmVzb3VyY2VEZWZpbml0aW9ucykuZm9yRWFjaChcbiAgICAgIChba2V5LCByZXNvdXJjZURlZmluaXRpb25dKSA9PiB7XG4gICAgICAgIHJldC5zZXRSZXNvdXJjZShrZXksIHJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXNbMF0pO1xuICAgICAgfVxuICAgICk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgRnJvbUpTT04gPSAodGV4dDogc3RyaW5nKTogUmVzdWx0PFBsYW4+ID0+IHtcbiAgY29uc3QgcGxhblNlcmlhbGl6ZWQ6IFBsYW5TZXJpYWxpemVkID0gSlNPTi5wYXJzZSh0ZXh0KTtcbiAgY29uc3QgcGxhbiA9IG5ldyBQbGFuKCk7XG5cbiAgcGxhbi5jaGFydC5WZXJ0aWNlcyA9IHBsYW5TZXJpYWxpemVkLmNoYXJ0LnZlcnRpY2VzLm1hcChcbiAgICAodGFza1NlcmlhbGl6ZWQ6IFRhc2tTZXJpYWxpemVkKTogVGFzayA9PiB7XG4gICAgICBjb25zdCB0YXNrID0gbmV3IFRhc2sodGFza1NlcmlhbGl6ZWQubmFtZSk7XG4gICAgICB0YXNrLnN0YXRlID0gdGFza1NlcmlhbGl6ZWQuc3RhdGU7XG4gICAgICB0YXNrLm1ldHJpY3MgPSB0YXNrU2VyaWFsaXplZC5tZXRyaWNzO1xuICAgICAgdGFzay5yZXNvdXJjZXMgPSB0YXNrU2VyaWFsaXplZC5yZXNvdXJjZXM7XG5cbiAgICAgIHJldHVybiB0YXNrO1xuICAgIH1cbiAgKTtcbiAgcGxhbi5jaGFydC5FZGdlcyA9IHBsYW5TZXJpYWxpemVkLmNoYXJ0LmVkZ2VzLm1hcChcbiAgICAoZGlyZWN0ZWRFZGdlU2VyaWFsaXplZDogRGlyZWN0ZWRFZGdlU2VyaWFsaXplZCk6IERpcmVjdGVkRWRnZSA9PlxuICAgICAgbmV3IERpcmVjdGVkRWRnZShkaXJlY3RlZEVkZ2VTZXJpYWxpemVkLmksIGRpcmVjdGVkRWRnZVNlcmlhbGl6ZWQuailcbiAgKTtcblxuICBjb25zdCBkZXNlcmlhbGl6ZWRNZXRyaWNEZWZpbml0aW9ucyA9IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICBPYmplY3QuZW50cmllcyhwbGFuU2VyaWFsaXplZC5tZXRyaWNEZWZpbml0aW9ucykubWFwKFxuICAgICAgKFtrZXksIHNlcmlhbGl6ZWRNZXRyaWNEZWZpbml0aW9uXSkgPT4gW1xuICAgICAgICBrZXksXG4gICAgICAgIE1ldHJpY0RlZmluaXRpb24uRnJvbUpTT04oc2VyaWFsaXplZE1ldHJpY0RlZmluaXRpb24pLFxuICAgICAgXVxuICAgIClcbiAgKTtcblxuICBwbGFuLm1ldHJpY0RlZmluaXRpb25zID0gT2JqZWN0LmFzc2lnbihcbiAgICB7fSxcbiAgICBTdGF0aWNNZXRyaWNEZWZpbml0aW9ucyxcbiAgICBkZXNlcmlhbGl6ZWRNZXRyaWNEZWZpbml0aW9uc1xuICApO1xuXG4gIGNvbnN0IGRlc2VyaWFsaXplZFJlc291cmNlRGVmaW5pdGlvbnMgPSBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgT2JqZWN0LmVudHJpZXMocGxhblNlcmlhbGl6ZWQucmVzb3VyY2VEZWZpbml0aW9ucykubWFwKFxuICAgICAgKFtrZXksIHNlcmlhbGl6ZWRSZXNvdXJjZURlZmluaXRpb25dKSA9PiBbXG4gICAgICAgIGtleSxcbiAgICAgICAgUmVzb3VyY2VEZWZpbml0aW9uLkZyb21KU09OKHNlcmlhbGl6ZWRSZXNvdXJjZURlZmluaXRpb24pLFxuICAgICAgXVxuICAgIClcbiAgKTtcblxuICBwbGFuLnJlc291cmNlRGVmaW5pdGlvbnMgPSBPYmplY3QuYXNzaWduKFxuICAgIHt9LFxuICAgIFN0YXRpY1Jlc291cmNlRGVmaW5pdGlvbnMsXG4gICAgZGVzZXJpYWxpemVkUmVzb3VyY2VEZWZpbml0aW9uc1xuICApO1xuXG4gIGNvbnN0IHJldCA9IFJhdGlvbmFsaXplRWRnZXNPcCgpLmFwcGx5KHBsYW4pO1xuICBpZiAoIXJldC5vaykge1xuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBjb25zdCByZXRWYWwgPSB2YWxpZGF0ZUNoYXJ0KHBsYW4uY2hhcnQpO1xuICBpZiAoIXJldFZhbC5vaykge1xuICAgIHJldHVybiByZXRWYWw7XG4gIH1cbiAgcmV0dXJuIG9rKHBsYW4pO1xufTtcbiIsICIvKiogQSBjb29yZGluYXRlIHBvaW50IG9uIHRoZSByZW5kZXJpbmcgc3VyZmFjZS4gKi9cbmV4cG9ydCBjbGFzcyBQb2ludCB7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICB9XG5cbiAgYWRkKHg6IG51bWJlciwgeTogbnVtYmVyKTogUG9pbnQge1xuICAgIHRoaXMueCArPSB4O1xuICAgIHRoaXMueSArPSB5O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc3VtKHJoczogUG9pbnQpOiBQb2ludCB7XG4gICAgcmV0dXJuIG5ldyBQb2ludCh0aGlzLnggKyByaHMueCwgdGhpcy55ICsgcmhzLnkpO1xuICB9XG5cbiAgZXF1YWwocmhzOiBQb2ludCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnggPT09IHJocy54ICYmIHRoaXMueSA9PT0gcmhzLnk7XG4gIH1cblxuICBzZXQocmhzOiBQb2ludCk6IFBvaW50IHtcbiAgICB0aGlzLnggPSByaHMueDtcbiAgICB0aGlzLnkgPSByaHMueTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGR1cCgpOiBQb2ludCB7XG4gICAgcmV0dXJuIG5ldyBQb2ludCh0aGlzLngsIHRoaXMueSk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBQb2ludCB9IGZyb20gXCIuLi9zY2FsZS9wb2ludC50c1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIERyYWdSYW5nZSB7XG4gIGJlZ2luOiBQb2ludDtcbiAgZW5kOiBQb2ludDtcbn1cblxuZXhwb3J0IGNvbnN0IERSQUdfUkFOR0VfRVZFTlQgPSBcImRyYWdyYW5nZVwiO1xuXG4vKiogTW91c2VNb3ZlIHdhdGNoZXMgbW91c2UgZXZlbnRzIGZvciBhIGdpdmVuIEhUTUxFbGVtZW50IGFuZCBlbWl0c1xuICogZXZlbnRzIGFyb3VuZCBkcmFnZ2luZy5cbiAqXG4gKiBUaGUgZW1pdHRlZCBldmVudCBpcyBcImRyYWdyYW5nZVwiIGFuZCBpcyBhIEN1c3RvbUV2ZW50PERyYWdSYW5nZT4uXG4gKlxuICogT25jZSB0aGUgbW91c2UgaXMgcHJlc3NlZCBkb3duIGluIHRoZSBIVE1MRWxlbWVudCBhbiBldmVudCB3aWxsIGJlXG4gKiBlbWl0dGVkIHBlcmlvZGljYWxseSBhcyB0aGUgbW91c2UgbW92ZXMuXG4gKlxuICogT25jZSB0aGUgbW91c2UgaXMgcmVsZWFzZWQsIG9yIGV4aXRzIHRoZSBIVE1MRWxlbWVudCBvbmUgbGFzdCBldmVudFxuICogaXMgZW1pdHRlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIE1vdXNlTW92ZSB7XG4gIGJlZ2luOiBQb2ludCB8IG51bGwgPSBudWxsO1xuICBjdXJyZW50TW92ZUxvY2F0aW9uOiBQb2ludCA9IG5ldyBQb2ludCgwLCAwKTtcbiAgbGFzdE1vdmVTZW50OiBQb2ludCA9IG5ldyBQb2ludCgwLCAwKTtcbiAgZWxlOiBIVE1MRWxlbWVudDtcbiAgaW50ZXJudmFsSGFuZGxlOiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGVsZTogSFRNTEVsZW1lbnQpIHtcbiAgICB0aGlzLmVsZSA9IGVsZTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlZG93bi5iaW5kKHRoaXMpKTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZXVwLmJpbmQodGhpcykpO1xuICAgIGVsZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlbGVhdmUuYmluZCh0aGlzKSk7XG4gIH1cblxuICBkZXRhY2goKSB7XG4gICAgdGhpcy5lbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmVsZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2Vkb3duLmJpbmQodGhpcykpO1xuICAgIHRoaXMuZWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmVsZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlbGVhdmUuYmluZCh0aGlzKSk7XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcm52YWxIYW5kbGUpO1xuICB9XG5cbiAgb25UaW1lb3V0KCkge1xuICAgIGlmICghdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLmVxdWFsKHRoaXMubGFzdE1vdmVTZW50KSkge1xuICAgICAgdGhpcy5lbGUuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgbmV3IEN1c3RvbUV2ZW50PERyYWdSYW5nZT4oRFJBR19SQU5HRV9FVkVOVCwge1xuICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgYmVnaW46IHRoaXMuYmVnaW4hLmR1cCgpLFxuICAgICAgICAgICAgZW5kOiB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24uZHVwKCksXG4gICAgICAgICAgfSxcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgICB0aGlzLmxhc3RNb3ZlU2VudC5zZXQodGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uKTtcbiAgICB9XG4gIH1cblxuICBtb3VzZW1vdmUoZTogTW91c2VFdmVudCkge1xuICAgIGlmICh0aGlzLmJlZ2luID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi54ID0gZS5vZmZzZXRYO1xuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi55ID0gZS5vZmZzZXRZO1xuICB9XG5cbiAgbW91c2Vkb3duKGU6IE1vdXNlRXZlbnQpIHtcbiAgICB0aGlzLmludGVybnZhbEhhbmRsZSA9IHdpbmRvdy5zZXRJbnRlcnZhbCh0aGlzLm9uVGltZW91dC5iaW5kKHRoaXMpLCAxNik7XG4gICAgdGhpcy5iZWdpbiA9IG5ldyBQb2ludChlLm9mZnNldFgsIGUub2Zmc2V0WSk7XG4gIH1cblxuICBtb3VzZXVwKGU6IE1vdXNlRXZlbnQpIHtcbiAgICB0aGlzLmZpbmlzaGVkKG5ldyBQb2ludChlLm9mZnNldFgsIGUub2Zmc2V0WSkpO1xuICB9XG5cbiAgbW91c2VsZWF2ZShlOiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKHRoaXMuYmVnaW4gPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5maW5pc2hlZChuZXcgUG9pbnQoZS5vZmZzZXRYLCBlLm9mZnNldFkpKTtcbiAgfVxuXG4gIGZpbmlzaGVkKGVuZDogUG9pbnQpIHtcbiAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmludGVybnZhbEhhbmRsZSk7XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uID0gZW5kO1xuICAgIHRoaXMub25UaW1lb3V0KCk7XG4gICAgdGhpcy5iZWdpbiA9IG51bGw7XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uID0gbmV3IFBvaW50KDAsIDApO1xuICAgIHRoaXMubGFzdE1vdmVTZW50ID0gbmV3IFBvaW50KDAsIDApO1xuICB9XG59XG4iLCAiZXhwb3J0IGNvbnN0IE1JTl9ESVNQTEFZX1JBTkdFID0gNztcblxuLyoqIFJlcHJlc2VudHMgYSByYW5nZSBvZiBkYXlzIG92ZXIgd2hpY2ggdG8gZGlzcGxheSBhIHpvb21lZCBpbiB2aWV3LCB1c2luZ1xuICogdGhlIGhhbGYtb3BlbiBpbnRlcnZhbCBbYmVnaW4sIGVuZCkuXG4gKi9cbmV4cG9ydCBjbGFzcyBEaXNwbGF5UmFuZ2Uge1xuICBwcml2YXRlIF9iZWdpbjogbnVtYmVyO1xuICBwcml2YXRlIF9lbmQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihiZWdpbjogbnVtYmVyLCBlbmQ6IG51bWJlcikge1xuICAgIHRoaXMuX2JlZ2luID0gYmVnaW47XG4gICAgdGhpcy5fZW5kID0gZW5kO1xuICAgIGlmICh0aGlzLl9iZWdpbiA+IHRoaXMuX2VuZCkge1xuICAgICAgW3RoaXMuX2VuZCwgdGhpcy5fYmVnaW5dID0gW3RoaXMuX2JlZ2luLCB0aGlzLl9lbmRdO1xuICAgIH1cbiAgICBpZiAodGhpcy5fZW5kIC0gdGhpcy5fYmVnaW4gPCBNSU5fRElTUExBWV9SQU5HRSkge1xuICAgICAgdGhpcy5fZW5kID0gdGhpcy5fYmVnaW4gKyBNSU5fRElTUExBWV9SQU5HRTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgaW4oeDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHggPj0gdGhpcy5fYmVnaW4gJiYgeCA8PSB0aGlzLl9lbmQ7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGJlZ2luKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2JlZ2luO1xuICB9XG5cbiAgcHVibGljIGdldCBlbmQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fZW5kO1xuICB9XG5cbiAgcHVibGljIGdldCByYW5nZUluRGF5cygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9lbmQgLSB0aGlzLl9iZWdpbjtcbiAgfVxufVxuIiwgImltcG9ydCB7IGNsYW1wIH0gZnJvbSBcIi4uLy4uL21ldHJpY3MvcmFuZ2UudHNcIjtcbmltcG9ydCB7IFJlbmRlck9wdGlvbnMgfSBmcm9tIFwiLi4vcmVuZGVyZXIudHNcIjtcbmltcG9ydCB7IFBvaW50IH0gZnJvbSBcIi4vcG9pbnQudHNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBEYXlSb3cge1xuICBkYXk6IG51bWJlcjtcbiAgcm93OiBudW1iZXI7XG59XG5cbi8qKiBGZWF0dXJlcyBvZiB0aGUgY2hhcnQgd2UgY2FuIGFzayBmb3IgY29vcmRpbmF0ZXMgb2YsIHdoZXJlIHRoZSB2YWx1ZSByZXR1cm5lZCBpc1xuICogdGhlIHRvcCBsZWZ0IGNvb3JkaW5hdGUgb2YgdGhlIGZlYXR1cmUuXG4gKi9cbmV4cG9ydCBlbnVtIEZlYXR1cmUge1xuICB0YXNrTGluZVN0YXJ0LFxuICB0ZXh0U3RhcnQsXG4gIGdyb3VwVGV4dFN0YXJ0LFxuICBwZXJjZW50U3RhcnQsXG4gIHZlcnRpY2FsQXJyb3dEZXN0VG9wLFxuICB2ZXJ0aWNhbEFycm93RGVzdEJvdHRvbSxcbiAgaG9yaXpvbnRhbEFycm93RGVzdCxcbiAgdmVydGljYWxBcnJvd1N0YXJ0LFxuICBob3Jpem9udGFsQXJyb3dTdGFydCxcbiAgdmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZVRvcCxcbiAgdmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZUJvdHRvbSxcbiAgaG9yaXpvbnRhbEFycm93RGVzdFRvTWlsZXN0b25lLFxuICB2ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lVG9wLFxuICB2ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lQm90dG9tLFxuICBob3Jpem9udGFsQXJyb3dTdGFydEZyb21NaWxlc3RvbmUsXG4gIGdyb3VwRW52ZWxvcGVTdGFydCxcbiAgdGFza0VudmVsb3BlVG9wLFxuXG4gIGRpc3BsYXlSYW5nZVRvcCxcbiAgdGFza1Jvd0JvdHRvbSxcblxuICB0aW1lTWFya1N0YXJ0LFxuICB0aW1lTWFya0VuZCxcbiAgdGltZVRleHRTdGFydCxcblxuICBncm91cFRpdGxlVGV4dFN0YXJ0LFxuXG4gIHRhc2tzQ2xpcFJlY3RPcmlnaW4sXG4gIGdyb3VwQnlPcmlnaW4sXG59XG5cbi8qKiBTaXplcyBvZiBmZWF0dXJlcyBvZiBhIHJlbmRlcmVkIGNoYXJ0LiAqL1xuZXhwb3J0IGVudW0gTWV0cmljIHtcbiAgdGFza0xpbmVIZWlnaHQsXG4gIHBlcmNlbnRIZWlnaHQsXG4gIGFycm93SGVhZEhlaWdodCxcbiAgYXJyb3dIZWFkV2lkdGgsXG4gIG1pbGVzdG9uZURpYW1ldGVyLFxuICBsaW5lRGFzaExpbmUsXG4gIGxpbmVEYXNoR2FwLFxuICB0ZXh0WE9mZnNldCxcbn1cblxuLyoqIE1ha2VzIGEgbnVtYmVyIG9kZCwgYWRkcyBvbmUgaWYgZXZlbi4gKi9cbmNvbnN0IG1ha2VPZGQgPSAobjogbnVtYmVyKTogbnVtYmVyID0+IHtcbiAgaWYgKG4gJSAyID09PSAwKSB7XG4gICAgcmV0dXJuIG4gKyAxO1xuICB9XG4gIHJldHVybiBuO1xufTtcblxuLyoqIFNjYWxlIGNvbnNvbGlkYXRlcyBhbGwgY2FsY3VsYXRpb25zIGFyb3VuZCByZW5kZXJpbmcgYSBjaGFydCBvbnRvIGEgc3VyZmFjZS4gKi9cbmV4cG9ydCBjbGFzcyBTY2FsZSB7XG4gIHByaXZhdGUgZGF5V2lkdGhQeDogbnVtYmVyO1xuICBwcml2YXRlIHJvd0hlaWdodFB4OiBudW1iZXI7XG4gIHByaXZhdGUgYmxvY2tTaXplUHg6IG51bWJlcjtcbiAgcHJpdmF0ZSB0YXNrSGVpZ2h0UHg6IG51bWJlcjtcbiAgcHJpdmF0ZSBsaW5lV2lkdGhQeDogbnVtYmVyO1xuICBwcml2YXRlIG1hcmdpblNpemVQeDogbnVtYmVyO1xuICBwcml2YXRlIHRpbWVsaW5lSGVpZ2h0UHg6IG51bWJlcjtcbiAgcHJpdmF0ZSBvcmlnaW46IFBvaW50O1xuICBwcml2YXRlIHRvdGFsTnVtYmVyT2ZEYXlzOiBudW1iZXI7XG4gIHByaXZhdGUgZ3JvdXBCeUNvbHVtbldpZHRoUHg6IG51bWJlcjtcblxuICBwcml2YXRlIHRpbWVsaW5lT3JpZ2luOiBQb2ludDtcbiAgcHJpdmF0ZSB0YXNrc09yaWdpbjogUG9pbnQ7XG4gIHByaXZhdGUgZ3JvdXBCeU9yaWdpbjogUG9pbnQ7XG4gIHByaXZhdGUgdGFza3NDbGlwUmVjdE9yaWdpbjogUG9pbnQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgICBjYW52YXNXaWR0aFB4OiBudW1iZXIsXG4gICAgdG90YWxOdW1iZXJPZkRheXM6IG51bWJlcixcbiAgICBtYXhHcm91cE5hbWVMZW5ndGg6IG51bWJlciA9IDBcbiAgKSB7XG4gICAgdGhpcy50b3RhbE51bWJlck9mRGF5cyA9IHRvdGFsTnVtYmVyT2ZEYXlzO1xuICAgIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHggPSBtYXhHcm91cE5hbWVMZW5ndGggKiBvcHRzLmZvbnRTaXplUHg7XG5cbiAgICB0aGlzLmJsb2NrU2l6ZVB4ID0gTWF0aC5mbG9vcihvcHRzLmZvbnRTaXplUHggLyAzKTtcbiAgICB0aGlzLnRhc2tIZWlnaHRQeCA9IG1ha2VPZGQoTWF0aC5mbG9vcigodGhpcy5ibG9ja1NpemVQeCAqIDMpIC8gNCkpO1xuICAgIHRoaXMubGluZVdpZHRoUHggPSBtYWtlT2RkKE1hdGguZmxvb3IodGhpcy50YXNrSGVpZ2h0UHggLyAzKSk7XG4gICAgY29uc3QgbWlsZXN0b25lUmFkaXVzID0gTWF0aC5jZWlsKHRoaXMudGFza0hlaWdodFB4IC8gMikgKyB0aGlzLmxpbmVXaWR0aFB4O1xuICAgIHRoaXMubWFyZ2luU2l6ZVB4ID0gbWlsZXN0b25lUmFkaXVzO1xuICAgIHRoaXMudGltZWxpbmVIZWlnaHRQeCA9IG9wdHMuaGFzVGltZWxpbmVcbiAgICAgID8gTWF0aC5jZWlsKChvcHRzLmZvbnRTaXplUHggKiA0KSAvIDMpXG4gICAgICA6IDA7XG5cbiAgICB0aGlzLnRpbWVsaW5lT3JpZ2luID0gbmV3IFBvaW50KG1pbGVzdG9uZVJhZGl1cywgMCk7XG4gICAgdGhpcy5ncm91cEJ5T3JpZ2luID0gbmV3IFBvaW50KDAsIG1pbGVzdG9uZVJhZGl1cyArIHRoaXMudGltZWxpbmVIZWlnaHRQeCk7XG5cbiAgICBsZXQgYmVnaW5PZmZzZXQgPSAwO1xuICAgIGlmIChvcHRzLmRpc3BsYXlSYW5nZSA9PT0gbnVsbCB8fCBvcHRzLmRpc3BsYXlSYW5nZVVzYWdlID09PSBcImhpZ2hsaWdodFwiKSB7XG4gICAgICAvLyBEbyBub3QgZm9yY2UgZGF5V2lkdGhQeCB0byBhbiBpbnRlZ2VyLCBpdCBjb3VsZCBnbyB0byAwIGFuZCBjYXVzZSBhbGxcbiAgICAgIC8vIHRhc2tzIHRvIGJlIHJlbmRlcmVkIGF0IDAgd2lkdGguXG4gICAgICB0aGlzLmRheVdpZHRoUHggPVxuICAgICAgICAoY2FudmFzV2lkdGhQeCAtIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHggLSAyICogdGhpcy5tYXJnaW5TaXplUHgpIC9cbiAgICAgICAgdG90YWxOdW1iZXJPZkRheXM7XG4gICAgICB0aGlzLm9yaWdpbiA9IG5ldyBQb2ludCgwLCAwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU2hvdWxkIHdlIHNldCB4LW1hcmdpbnMgdG8gMCBpZiBhIFN1YlJhbmdlIGlzIHJlcXVlc3RlZD9cbiAgICAgIC8vIE9yIHNob3VsZCB3ZSB0b3RhbGx5IGRyb3AgYWxsIG1hcmdpbnMgZnJvbSBoZXJlIGFuZCBqdXN0IHVzZVxuICAgICAgLy8gQ1NTIG1hcmdpbnMgb24gdGhlIGNhbnZhcyBlbGVtZW50P1xuICAgICAgdGhpcy5kYXlXaWR0aFB4ID1cbiAgICAgICAgKGNhbnZhc1dpZHRoUHggLSB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4IC0gMiAqIHRoaXMubWFyZ2luU2l6ZVB4KSAvXG4gICAgICAgIG9wdHMuZGlzcGxheVJhbmdlLnJhbmdlSW5EYXlzO1xuICAgICAgYmVnaW5PZmZzZXQgPSBNYXRoLmZsb29yKFxuICAgICAgICB0aGlzLmRheVdpZHRoUHggKiBvcHRzLmRpc3BsYXlSYW5nZS5iZWdpbiArIHRoaXMubWFyZ2luU2l6ZVB4XG4gICAgICApO1xuICAgICAgdGhpcy5vcmlnaW4gPSBuZXcgUG9pbnQoLWJlZ2luT2Zmc2V0ICsgdGhpcy5tYXJnaW5TaXplUHgsIDApO1xuICAgIH1cblxuICAgIHRoaXMudGFza3NPcmlnaW4gPSBuZXcgUG9pbnQoXG4gICAgICB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4IC0gYmVnaW5PZmZzZXQgKyBtaWxlc3RvbmVSYWRpdXMsXG4gICAgICB0aGlzLnRpbWVsaW5lSGVpZ2h0UHggKyBtaWxlc3RvbmVSYWRpdXNcbiAgICApO1xuXG4gICAgdGhpcy50YXNrc0NsaXBSZWN0T3JpZ2luID0gbmV3IFBvaW50KFxuICAgICAgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCxcbiAgICAgIHRoaXMudGltZWxpbmVIZWlnaHRQeFxuICAgICk7XG5cbiAgICBpZiAob3B0cy5oYXNUZXh0KSB7XG4gICAgICB0aGlzLnJvd0hlaWdodFB4ID0gNiAqIHRoaXMuYmxvY2tTaXplUHg7IC8vIFRoaXMgbWlnaHQgYWxzbyBiZSBgKGNhbnZhc0hlaWdodFB4IC0gMiAqIG9wdHMubWFyZ2luU2l6ZVB4KSAvIG51bWJlclN3aW1MYW5lc2AgaWYgaGVpZ2h0IGlzIHN1cHBsaWVkP1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJvd0hlaWdodFB4ID0gMS4xICogdGhpcy5ibG9ja1NpemVQeDtcbiAgICB9XG4gIH1cblxuICAvKiogVGhlIGhlaWdodCBvZiB0aGUgY2hhcnQuIE5vdGUgdGhhdCBpdCdzIG5vdCBjb25zdHJhaW5lZCBieSB0aGUgY2FudmFzLiAqL1xuICBwdWJsaWMgaGVpZ2h0KG1heFJvd3M6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIChcbiAgICAgIG1heFJvd3MgKiB0aGlzLnJvd0hlaWdodFB4ICsgdGhpcy50aW1lbGluZUhlaWdodFB4ICsgMiAqIHRoaXMubWFyZ2luU2l6ZVB4XG4gICAgKTtcbiAgfVxuXG4gIHB1YmxpYyBkYXlSb3dGcm9tUG9pbnQocG9pbnQ6IFBvaW50KTogRGF5Um93IHtcbiAgICAvLyBUaGlzIHNob3VsZCBhbHNvIGNsYW1wIHRoZSByZXR1cm5lZCAneCcgdmFsdWUgdG8gWzAsIG1heFJvd3MpLlxuICAgIHJldHVybiB7XG4gICAgICBkYXk6IGNsYW1wKFxuICAgICAgICBNYXRoLmZsb29yKFxuICAgICAgICAgICh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyAqIHBvaW50LnggLVxuICAgICAgICAgICAgdGhpcy5vcmlnaW4ueCAtXG4gICAgICAgICAgICB0aGlzLm1hcmdpblNpemVQeCAtXG4gICAgICAgICAgICB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4KSAvXG4gICAgICAgICAgICB0aGlzLmRheVdpZHRoUHhcbiAgICAgICAgKSxcbiAgICAgICAgMCxcbiAgICAgICAgdGhpcy50b3RhbE51bWJlck9mRGF5c1xuICAgICAgKSxcbiAgICAgIHJvdzogTWF0aC5mbG9vcihcbiAgICAgICAgKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvICogcG9pbnQueSAtXG4gICAgICAgICAgdGhpcy5vcmlnaW4ueSAtXG4gICAgICAgICAgdGhpcy5tYXJnaW5TaXplUHggLVxuICAgICAgICAgIHRoaXMudGltZWxpbmVIZWlnaHRQeCkgL1xuICAgICAgICAgIHRoaXMucm93SGVpZ2h0UHhcbiAgICAgICksXG4gICAgfTtcbiAgfVxuXG4gIC8qKiBUaGUgdG9wIGxlZnQgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3ggZm9yIGEgc2luZ2xlIHRhc2suICovXG4gIHByaXZhdGUgdGFza1Jvd0VudmVsb3BlU3RhcnQocm93OiBudW1iZXIsIGRheTogbnVtYmVyKTogUG9pbnQge1xuICAgIHJldHVybiB0aGlzLm9yaWdpbi5zdW0oXG4gICAgICBuZXcgUG9pbnQoXG4gICAgICAgIE1hdGguZmxvb3IoXG4gICAgICAgICAgZGF5ICogdGhpcy5kYXlXaWR0aFB4ICsgdGhpcy5tYXJnaW5TaXplUHggKyB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4XG4gICAgICAgICksXG4gICAgICAgIE1hdGguZmxvb3IoXG4gICAgICAgICAgcm93ICogdGhpcy5yb3dIZWlnaHRQeCArIHRoaXMubWFyZ2luU2l6ZVB4ICsgdGhpcy50aW1lbGluZUhlaWdodFB4XG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICBwcml2YXRlIGdyb3VwUm93RW52ZWxvcGVTdGFydChyb3c6IG51bWJlciwgZGF5OiBudW1iZXIpOiBQb2ludCB7XG4gICAgcmV0dXJuIHRoaXMuZ3JvdXBCeU9yaWdpbi5zdW0oXG4gICAgICBuZXcgUG9pbnQoXG4gICAgICAgIDAsXG4gICAgICAgIHJvdyAqIHRoaXMucm93SGVpZ2h0UHggKyB0aGlzLm1hcmdpblNpemVQeCArIHRoaXMudGltZWxpbmVIZWlnaHRQeFxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIGdyb3VwSGVhZGVyU3RhcnQoKTogUG9pbnQge1xuICAgIHJldHVybiB0aGlzLm9yaWdpbi5zdW0obmV3IFBvaW50KHRoaXMubWFyZ2luU2l6ZVB4LCB0aGlzLm1hcmdpblNpemVQeCkpO1xuICB9XG5cbiAgcHJpdmF0ZSB0aW1lRW52ZWxvcGVTdGFydChkYXk6IG51bWJlcik6IFBvaW50IHtcbiAgICByZXR1cm4gdGhpcy5vcmlnaW4uc3VtKFxuICAgICAgbmV3IFBvaW50KFxuICAgICAgICBkYXkgKiB0aGlzLmRheVdpZHRoUHggKyB0aGlzLm1hcmdpblNpemVQeCArIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHgsXG4gICAgICAgIHRoaXMubWFyZ2luU2l6ZVB4XG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSBjb29yZGluYXRlIG9mIHRoZSBpdGVtICovXG4gIGZlYXR1cmUocm93OiBudW1iZXIsIGRheTogbnVtYmVyLCBjb29yZDogRmVhdHVyZSk6IFBvaW50IHtcbiAgICBzd2l0Y2ggKGNvb3JkKSB7XG4gICAgICBjYXNlIEZlYXR1cmUudGFza0xpbmVTdGFydDpcbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvcDpcbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLnJvd0hlaWdodFB4IC0gdGhpcy5ibG9ja1NpemVQeFxuICAgICAgICApO1xuXG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RCb3R0b206XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KS5hZGQoMCwgdGhpcy5yb3dIZWlnaHRQeCk7XG4gICAgICBjYXNlIEZlYXR1cmUudGV4dFN0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSkuYWRkKFxuICAgICAgICAgIHRoaXMuYmxvY2tTaXplUHgsXG4gICAgICAgICAgdGhpcy5ibG9ja1NpemVQeFxuICAgICAgICApO1xuICAgICAgY2FzZSBGZWF0dXJlLmdyb3VwVGV4dFN0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy5ncm91cFJvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpLmFkZChcbiAgICAgICAgICB0aGlzLmJsb2NrU2l6ZVB4LFxuICAgICAgICAgIHRoaXMuYmxvY2tTaXplUHhcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5wZXJjZW50U3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLnJvd0hlaWdodFB4IC0gdGhpcy5saW5lV2lkdGhQeFxuICAgICAgICApO1xuICAgICAgY2FzZSBGZWF0dXJlLmhvcml6b250YWxBcnJvd0Rlc3Q6XG4gICAgICBjYXNlIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93U3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICBNYXRoLmZsb29yKHRoaXMucm93SGVpZ2h0UHggLSAwLjUgKiB0aGlzLmJsb2NrU2l6ZVB4KSAtIDFcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvTWlsZXN0b25lVG9wOlxuICAgICAgICByZXR1cm4gdGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9wKS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICAtMSAqIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlcilcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvTWlsZXN0b25lQm90dG9tOlxuICAgICAgICByZXR1cm4gdGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9wKS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpXG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93RGVzdFRvTWlsZXN0b25lOlxuICAgICAgICByZXR1cm4gdGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLmhvcml6b250YWxBcnJvd0Rlc3QpLmFkZChcbiAgICAgICAgICAtMSAqIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlciksXG4gICAgICAgICAgLTEgKiB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpXG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZVRvcDpcbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnQpLmFkZChcbiAgICAgICAgICAwLFxuICAgICAgICAgIC0xICogdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKVxuICAgICAgICApO1xuXG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZUJvdHRvbTpcbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnQpLmFkZChcbiAgICAgICAgICAwLFxuICAgICAgICAgIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlcilcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dTdGFydEZyb21NaWxlc3RvbmU6XG4gICAgICAgIHJldHVybiB0aGlzLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93U3RhcnQpLmFkZChcbiAgICAgICAgICB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpLFxuICAgICAgICAgIDBcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS50YXNrRW52ZWxvcGVUb3A6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KTtcbiAgICAgIGNhc2UgRmVhdHVyZS5ncm91cEVudmVsb3BlU3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLmdyb3VwUm93RW52ZWxvcGVTdGFydChyb3csIGRheSk7XG4gICAgICBjYXNlIEZlYXR1cmUudGltZU1hcmtTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZUVudmVsb3BlU3RhcnQoZGF5KTtcbiAgICAgIGNhc2UgRmVhdHVyZS50aW1lTWFya0VuZDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZUVudmVsb3BlU3RhcnQoZGF5KS5hZGQoMCwgdGhpcy5yb3dIZWlnaHRQeCAqIChyb3cgKyAxKSk7XG4gICAgICBjYXNlIEZlYXR1cmUudGltZVRleHRTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZUVudmVsb3BlU3RhcnQoZGF5KS5hZGQodGhpcy5ibG9ja1NpemVQeCwgMCk7XG5cbiAgICAgIGNhc2UgRmVhdHVyZS5ncm91cFRpdGxlVGV4dFN0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy5ncm91cEhlYWRlclN0YXJ0KCkuYWRkKHRoaXMuYmxvY2tTaXplUHgsIDApO1xuICAgICAgY2FzZSBGZWF0dXJlLmRpc3BsYXlSYW5nZVRvcDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZUVudmVsb3BlU3RhcnQoZGF5KTtcbiAgICAgIGNhc2UgRmVhdHVyZS50YXNrUm93Qm90dG9tOlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3cgKyAxLCBkYXkpO1xuICAgICAgY2FzZSBGZWF0dXJlLnRhc2tzQ2xpcFJlY3RPcmlnaW46XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tzQ2xpcFJlY3RPcmlnaW47XG4gICAgICBjYXNlIEZlYXR1cmUuZ3JvdXBCeU9yaWdpbjpcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBCeU9yaWdpbjtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIFRoZSBsaW5lIGJlbG93IHdpbGwgbm90IGNvbXBpbGUgaWYgeW91IG1pc3NlZCBhbiBlbnVtIGluIHRoZSBzd2l0Y2ggYWJvdmUuXG4gICAgICAgIGNvb3JkIHNhdGlzZmllcyBuZXZlcjtcbiAgICAgICAgcmV0dXJuIG5ldyBQb2ludCgwLCAwKTtcbiAgICB9XG4gIH1cblxuICBtZXRyaWMoZmVhdHVyZTogTWV0cmljKTogbnVtYmVyIHtcbiAgICBzd2l0Y2ggKGZlYXR1cmUpIHtcbiAgICAgIGNhc2UgTWV0cmljLnRhc2tMaW5lSGVpZ2h0OlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrSGVpZ2h0UHg7XG4gICAgICBjYXNlIE1ldHJpYy5wZXJjZW50SGVpZ2h0OlxuICAgICAgICByZXR1cm4gdGhpcy5saW5lV2lkdGhQeDtcbiAgICAgIGNhc2UgTWV0cmljLmFycm93SGVhZEhlaWdodDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza0hlaWdodFB4O1xuICAgICAgY2FzZSBNZXRyaWMuYXJyb3dIZWFkV2lkdGg6XG4gICAgICAgIHJldHVybiBNYXRoLmNlaWwodGhpcy50YXNrSGVpZ2h0UHgpO1xuICAgICAgY2FzZSBNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXI6XG4gICAgICAgIHJldHVybiBNYXRoLmNlaWwodGhpcy50YXNrSGVpZ2h0UHgpO1xuICAgICAgY2FzZSBNZXRyaWMubGluZURhc2hMaW5lOlxuICAgICAgICByZXR1cm4gdGhpcy5ibG9ja1NpemVQeDtcbiAgICAgIGNhc2UgTWV0cmljLmxpbmVEYXNoR2FwOlxuICAgICAgICByZXR1cm4gdGhpcy5ibG9ja1NpemVQeDtcbiAgICAgIGNhc2UgTWV0cmljLnRleHRYT2Zmc2V0OlxuICAgICAgICByZXR1cm4gdGhpcy5ibG9ja1NpemVQeDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIFRoZSBsaW5lIGJlbG93IHdpbGwgbm90IGNvbXBpbGUgaWYgeW91IG1pc3NlZCBhbiBlbnVtIGluIHRoZSBzd2l0Y2ggYWJvdmUuXG4gICAgICAgIGZlYXR1cmUgc2F0aXNmaWVzIG5ldmVyO1xuICAgICAgICByZXR1cm4gMC4wO1xuICAgIH1cbiAgfVxufVxuIiwgImltcG9ydCB7IFRhc2ssIHZhbGlkYXRlQ2hhcnQgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IEZpbHRlckZ1bmMgfSBmcm9tIFwiLi4vY2hhcnQvZmlsdGVyL2ZpbHRlci50c1wiO1xuaW1wb3J0IHsgRGlyZWN0ZWRFZGdlIH0gZnJvbSBcIi4uL2RhZy9kYWcudHNcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuLnRzXCI7XG5pbXBvcnQgeyBSZXNvdXJjZURlZmluaXRpb24gfSBmcm9tIFwiLi4vcmVzb3VyY2VzL3Jlc291cmNlcy50c1wiO1xuaW1wb3J0IHsgUmVzdWx0LCBvayB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IFNwYW4gfSBmcm9tIFwiLi4vc2xhY2svc2xhY2sudHNcIjtcbmltcG9ydCB7IERpc3BsYXlSYW5nZSB9IGZyb20gXCIuL3JhbmdlL3JhbmdlLnRzXCI7XG5pbXBvcnQgeyBQb2ludCB9IGZyb20gXCIuL3NjYWxlL3BvaW50LnRzXCI7XG5pbXBvcnQgeyBGZWF0dXJlLCBNZXRyaWMsIFNjYWxlIH0gZnJvbSBcIi4vc2NhbGUvc2NhbGUudHNcIjtcblxudHlwZSBEaXJlY3Rpb24gPSBcInVwXCIgfCBcImRvd25cIjtcblxuZXhwb3J0IGludGVyZmFjZSBDb2xvcnMge1xuICBzdXJmYWNlOiBzdHJpbmc7XG4gIG9uU3VyZmFjZTogc3RyaW5nO1xuICBvblN1cmZhY2VNdXRlZDogc3RyaW5nO1xuICBvblN1cmZhY2VIaWdobGlnaHQ6IHN0cmluZztcbiAgb3ZlcmxheTogc3RyaW5nO1xuICBncm91cENvbG9yOiBzdHJpbmc7XG59XG5cbmV4cG9ydCB0eXBlIFRhc2tJbmRleFRvUm93ID0gTWFwPG51bWJlciwgbnVtYmVyPjtcblxuLyoqIEZ1bmN0aW9uIHVzZSB0byBwcm9kdWNlIGEgdGV4dCBsYWJlbCBmb3IgYSB0YXNrIGFuZCBpdHMgc2xhY2suICovXG5leHBvcnQgdHlwZSBUYXNrTGFiZWwgPSAodGFza0luZGV4OiBudW1iZXIpID0+IHN0cmluZztcblxuLyoqIENvbnRyb2xzIG9mIHRoZSBkaXNwbGF5UmFuZ2UgaW4gUmVuZGVyT3B0aW9ucyBpcyB1c2VkLlxuICpcbiAqICBcInJlc3RyaWN0XCI6IE9ubHkgZGlzcGxheSB0aGUgcGFydHMgb2YgdGhlIGNoYXJ0IHRoYXQgYXBwZWFyIGluIHRoZSByYW5nZS5cbiAqXG4gKiAgXCJoaWdobGlnaHRcIjogRGlzcGxheSB0aGUgZnVsbCByYW5nZSBvZiB0aGUgZGF0YSwgYnV0IGhpZ2hsaWdodCB0aGUgcmFuZ2UuXG4gKi9cbmV4cG9ydCB0eXBlIERpc3BsYXlSYW5nZVVzYWdlID0gXCJyZXN0cmljdFwiIHwgXCJoaWdobGlnaHRcIjtcblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRUYXNrTGFiZWw6IFRhc2tMYWJlbCA9ICh0YXNrSW5kZXg6IG51bWJlcik6IHN0cmluZyA9PlxuICB0YXNrSW5kZXgudG9GaXhlZCgwKTtcblxuZXhwb3J0IGludGVyZmFjZSBSZW5kZXJPcHRpb25zIHtcbiAgLyoqIFRoZSB0ZXh0IGZvbnQgc2l6ZSwgdGhpcyBkcml2ZXMgdGhlIHNpemUgb2YgYWxsIG90aGVyIGNoYXJ0IGZlYXR1cmVzLlxuICAgKiAqL1xuICBmb250U2l6ZVB4OiBudW1iZXI7XG5cbiAgLyoqIERpc3BsYXkgdGV4dCBpZiB0cnVlLiAqL1xuICBoYXNUZXh0OiBib29sZWFuO1xuXG4gIC8qKiBJZiBzdXBwbGllZCB0aGVuIG9ubHkgdGhlIHRhc2tzIGluIHRoZSBnaXZlbiByYW5nZSB3aWxsIGJlIGRpc3BsYXllZC4gKi9cbiAgZGlzcGxheVJhbmdlOiBEaXNwbGF5UmFuZ2UgfCBudWxsO1xuXG4gIC8qKiBDb250cm9scyBob3cgdGhlIGBkaXNwbGF5UmFuZ2VgIGlzIHVzZWQgaWYgc3VwcGxpZWQuICovXG4gIGRpc3BsYXlSYW5nZVVzYWdlOiBEaXNwbGF5UmFuZ2VVc2FnZTtcblxuICAvKiogVGhlIGNvbG9yIHRoZW1lLiAqL1xuICBjb2xvcnM6IENvbG9ycztcblxuICAvKiogSWYgdHJ1ZSB0aGVuIGRpc3BsYXkgdGltZXMgYXQgdGhlIHRvcCBvZiB0aGUgY2hhcnQuICovXG4gIGhhc1RpbWVsaW5lOiBib29sZWFuO1xuXG4gIC8qKiBJZiB0cnVlIHRoZW4gZGlzcGxheSB0aGUgdGFzayBiYXJzLiAqL1xuICBoYXNUYXNrczogYm9vbGVhbjtcblxuICAvKiogSWYgdHJ1ZSB0aGVuIGRyYXcgdmVydGljYWwgbGluZXMgZnJvbSB0aGUgdGltZWxpbmUgZG93biB0byB0YXNrIHN0YXJ0IGFuZFxuICAgKiBmaW5pc2ggcG9pbnRzLiAqL1xuICBkcmF3VGltZU1hcmtlcnNPblRhc2tzOiBib29sZWFuO1xuXG4gIC8qKiBEcmF3IGRlcGVuZGVuY3kgZWRnZXMgYmV0d2VlbiB0YXNrcyBpZiB0cnVlLiAqL1xuICBoYXNFZGdlczogYm9vbGVhbjtcblxuICAvKiogRnVuY3Rpb24gdGhhdCBwcm9kdWNlcyBkaXNwbGF5IHRleHQgZm9yIGEgVGFzayBhbmQgaXRzIGFzc29jaWF0ZWQgU2xhY2suICovXG4gIHRhc2tMYWJlbDogVGFza0xhYmVsO1xuXG4gIC8qKiBUaGUgaW5kaWNlcyBvZiB0YXNrcyB0aGF0IHNob3VsZCBiZSBoaWdobGlnaHRlZCB3aGVuIGRyYXcsIHR5cGljYWxseSB1c2VkXG4gICAqIHRvIGhpZ2hsaWdodCB0aGUgY3JpdGljYWwgcGF0aC4gKi9cbiAgdGFza0hpZ2hsaWdodHM6IG51bWJlcltdO1xuXG4gIC8qKiBGaWx0ZXIgdGhlIFRhc2tzIHRvIGJlIGRpc3BsYXllZC4gKi9cbiAgZmlsdGVyRnVuYzogRmlsdGVyRnVuYyB8IG51bGw7XG5cbiAgLyoqIEdyb3VwIHRoZSB0YXNrcyB0b2dldGhlciB2ZXJ0aWNhbGx5IGJhc2VkIG9uIHRoZSBnaXZlbiByZXNvdXJjZS4gSWYgdGhlXG4gICAqIGVtcHR5IHN0cmluZyBpcyBzdXBwbGllZCB0aGVuIGp1c3QgZGlzcGxheSBieSB0b3BvbG9naWNhbCBvcmRlci5cbiAgICovXG4gIGdyb3VwQnlSZXNvdXJjZTogc3RyaW5nO1xufVxuXG5jb25zdCB2ZXJ0aWNhbEFycm93U3RhcnRGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbiA9IChcbiAgdGFzazogVGFzayxcbiAgZGlyZWN0aW9uOiBEaXJlY3Rpb25cbik6IEZlYXR1cmUgPT4ge1xuICBpZiAodGFzay5kdXJhdGlvbiA9PT0gMCkge1xuICAgIGlmIChkaXJlY3Rpb24gPT09IFwiZG93blwiKSB7XG4gICAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lQm90dG9tO1xuICAgIH1cbiAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lVG9wO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydDtcbiAgfVxufTtcblxuY29uc3QgdmVydGljYWxBcnJvd0Rlc3RGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbiA9IChcbiAgdGFzazogVGFzayxcbiAgZGlyZWN0aW9uOiBEaXJlY3Rpb25cbik6IEZlYXR1cmUgPT4ge1xuICBpZiAodGFzay5kdXJhdGlvbiA9PT0gMCkge1xuICAgIGlmIChkaXJlY3Rpb24gPT09IFwiZG93blwiKSB7XG4gICAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvTWlsZXN0b25lVG9wO1xuICAgIH1cbiAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvTWlsZXN0b25lQm90dG9tO1xuICB9IGVsc2Uge1xuICAgIGlmIChkaXJlY3Rpb24gPT09IFwiZG93blwiKSB7XG4gICAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvcDtcbiAgICB9XG4gICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RCb3R0b207XG4gIH1cbn07XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbmNvbnN0IGhvcml6b250YWxBcnJvd1N0YXJ0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24gPSAodGFzazogVGFzayk6IEZlYXR1cmUgPT4ge1xuICBpZiAodGFzay5kdXJhdGlvbiA9PT0gMCkge1xuICAgIHJldHVybiBGZWF0dXJlLmhvcml6b250YWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dTdGFydDtcbiAgfVxufTtcblxuY29uc3QgaG9yaXpvbnRhbEFycm93RGVzdEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uID0gKHRhc2s6IFRhc2spOiBGZWF0dXJlID0+IHtcbiAgaWYgKHRhc2suZHVyYXRpb24gPT09IDApIHtcbiAgICByZXR1cm4gRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dEZXN0VG9NaWxlc3RvbmU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93RGVzdDtcbiAgfVxufTtcblxuLyoqXG4gKiBDb21wdXRlIHdoYXQgdGhlIGhlaWdodCBvZiB0aGUgY2FudmFzIHNob3VsZCBiZS4gTm90ZSB0aGF0IHRoZSB2YWx1ZSBkb2Vzbid0XG4gKiBrbm93IGFib3V0IGB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpb2AsIHNvIGlmIHRoZSBjYW52YXMgaXMgYWxyZWFkeSBzY2FsZWQgYnlcbiAqIGB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpb2AgdGhlbiBzbyB3aWxsIHRoZSByZXN1bHQgb2YgdGhpcyBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1Z2dlc3RlZENhbnZhc0hlaWdodChcbiAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcbiAgc3BhbnM6IFNwYW5bXSxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgbWF4Um93czogbnVtYmVyXG4pOiBudW1iZXIge1xuICBpZiAoIW9wdHMuaGFzVGFza3MpIHtcbiAgICBtYXhSb3dzID0gMDtcbiAgfVxuICByZXR1cm4gbmV3IFNjYWxlKFxuICAgIG9wdHMsXG4gICAgY2FudmFzLndpZHRoLFxuICAgIHNwYW5zW3NwYW5zLmxlbmd0aCAtIDFdLmZpbmlzaCArIDFcbiAgKS5oZWlnaHQobWF4Um93cyk7XG59XG5cbi8vIFRPRE8gLSBQYXNzIGluIG1heCByb3dzLCBhbmQgYSBtYXBwaW5nIHRoYXQgbWFwcyBmcm9tIHRhc2tJbmRleCB0byByb3csXG4vLyBiZWNhdXNlIHR3byBkaWZmZXJlbnQgdGFza3MgbWlnaHQgYmUgcGxhY2VkIG9uIHRoZSBzYW1lIHJvdy4gQWxzbyB3ZSBzaG91bGRcbi8vIHBhc3MgaW4gbWF4IHJvd3M/IE9yIHNob3VsZCB0aGF0IGNvbWUgZnJvbSB0aGUgYWJvdmUgbWFwcGluZz9cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJUYXNrc1RvQ2FudmFzKFxuICBwYXJlbnQ6IEhUTUxFbGVtZW50LFxuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgcGxhbjogUGxhbixcbiAgc3BhbnM6IFNwYW5bXSxcbiAgb3B0czogUmVuZGVyT3B0aW9uc1xuKTogUmVzdWx0PFNjYWxlPiB7XG4gIGNvbnN0IHZyZXQgPSB2YWxpZGF0ZUNoYXJ0KHBsYW4uY2hhcnQpO1xuICBpZiAoIXZyZXQub2spIHtcbiAgICByZXR1cm4gdnJldDtcbiAgfVxuXG4gIC8vIEhpZ2hsaWdodGVkIHRhc2tzLlxuICBjb25zdCB0YXNrSGlnaGxpZ2h0czogU2V0PG51bWJlcj4gPSBuZXcgU2V0KG9wdHMudGFza0hpZ2hsaWdodHMpO1xuXG4gIC8vIENhbGN1bGF0ZSBob3cgd2lkZSB3ZSBuZWVkIHRvIG1ha2UgdGhlIGdyb3VwQnkgY29sdW1uLlxuICBsZXQgbWF4R3JvdXBOYW1lTGVuZ3RoID0gMDtcbiAgaWYgKG9wdHMuZ3JvdXBCeVJlc291cmNlICE9PSBcIlwiICYmIG9wdHMuaGFzVGV4dCkge1xuICAgIG1heEdyb3VwTmFtZUxlbmd0aCA9IG9wdHMuZ3JvdXBCeVJlc291cmNlLmxlbmd0aDtcbiAgICBjb25zdCByZXNvdXJjZURlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbihvcHRzLmdyb3VwQnlSZXNvdXJjZSk7XG4gICAgaWYgKHJlc291cmNlRGVmaW5pdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXNvdXJjZURlZmluaXRpb24udmFsdWVzLmZvckVhY2goKHZhbHVlOiBzdHJpbmcpID0+IHtcbiAgICAgICAgbWF4R3JvdXBOYW1lTGVuZ3RoID0gTWF0aC5tYXgobWF4R3JvdXBOYW1lTGVuZ3RoLCB2YWx1ZS5sZW5ndGgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgdG90YWxOdW1iZXJPZlJvd3MgPSBzcGFucy5sZW5ndGg7XG4gIGNvbnN0IHRvdGFsTnVtYmVyT2ZEYXlzID0gc3BhbnNbc3BhbnMubGVuZ3RoIC0gMV0uZmluaXNoO1xuICBjb25zdCBzY2FsZSA9IG5ldyBTY2FsZShcbiAgICBvcHRzLFxuICAgIGNhbnZhcy53aWR0aCxcbiAgICB0b3RhbE51bWJlck9mRGF5cyArIDEsXG4gICAgbWF4R3JvdXBOYW1lTGVuZ3RoXG4gICk7XG5cbiAgY29uc3QgdGFza0xpbmVIZWlnaHQgPSBzY2FsZS5tZXRyaWMoTWV0cmljLnRhc2tMaW5lSGVpZ2h0KTtcbiAgY29uc3QgZGlhbW9uZERpYW1ldGVyID0gc2NhbGUubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlcik7XG4gIGNvbnN0IHBlcmNlbnRIZWlnaHQgPSBzY2FsZS5tZXRyaWMoTWV0cmljLnBlcmNlbnRIZWlnaHQpO1xuICBjb25zdCBhcnJvd0hlYWRIZWlnaHQgPSBzY2FsZS5tZXRyaWMoTWV0cmljLmFycm93SGVhZEhlaWdodCk7XG4gIGNvbnN0IGFycm93SGVhZFdpZHRoID0gc2NhbGUubWV0cmljKE1ldHJpYy5hcnJvd0hlYWRXaWR0aCk7XG4gIGNvbnN0IGRheXNXaXRoVGltZU1hcmtlcnM6IFNldDxudW1iZXI+ID0gbmV3IFNldCgpO1xuICBjb25zdCB0aXJldCA9IHRhc2tJbmRleFRvUm93RnJvbUdyb3VwQnkob3B0cywgcGxhbik7XG4gIGlmICghdGlyZXQub2spIHtcbiAgICByZXR1cm4gdGlyZXQ7XG4gIH1cbiAgY29uc3QgdGFza0luZGV4VG9Sb3cgPSB0aXJldC52YWx1ZS50YXNrSW5kZXhUb1JvdztcbiAgY29uc3Qgcm93UmFuZ2VzID0gdGlyZXQudmFsdWUucm93UmFuZ2VzO1xuICBjb25zdCByZXNvdXJjZURlZmluaXRpb24gPSB0aXJldC52YWx1ZS5yZXNvdXJjZURlZmluaXRpb247XG5cbiAgLy8gU2V0IHVwIGNhbnZhcyBiYXNpY3MuXG4gIGNsZWFyQ2FudmFzKGN0eCwgb3B0cywgY2FudmFzKTtcbiAgc2V0Rm9udFNpemUoY3R4LCBvcHRzKTtcblxuICBjb25zdCBjbGlwUmVnaW9uID0gbmV3IFBhdGgyRCgpO1xuICBjb25zdCBjbGlwT3JpZ2luID0gc2NhbGUuZmVhdHVyZSgwLCAwLCBGZWF0dXJlLnRhc2tzQ2xpcFJlY3RPcmlnaW4pO1xuICBjb25zdCBjbGlwV2lkdGggPSBjYW52YXMud2lkdGggLSBjbGlwT3JpZ2luLng7XG4gIGNsaXBSZWdpb24ucmVjdChjbGlwT3JpZ2luLngsIDAsIGNsaXBXaWR0aCwgY2FudmFzLmhlaWdodCk7XG5cbiAgLy8gRHJhdyBiaWcgcmVkIHJlY3Qgb3ZlciB3aGVyZSB0aGUgY2xpcCByZWdpb24gd2lsbCBiZS5cbiAgaWYgKDApIHtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xuICAgIGN0eC5saW5lV2lkdGggPSAyO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguc3Ryb2tlKGNsaXBSZWdpb24pO1xuICB9XG5cbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuXG4gIGlmIChyb3dSYW5nZXMgIT09IG51bGwpIHtcbiAgICBpZiAob3B0cy5oYXNUYXNrcykge1xuICAgICAgZHJhd1N3aW1MYW5lSGlnaGxpZ2h0cyhcbiAgICAgICAgY3R4LFxuICAgICAgICBzY2FsZSxcbiAgICAgICAgcm93UmFuZ2VzLFxuICAgICAgICB0b3RhbE51bWJlck9mRGF5cyxcbiAgICAgICAgb3B0cy5jb2xvcnMuZ3JvdXBDb2xvclxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAocmVzb3VyY2VEZWZpbml0aW9uICE9PSBudWxsICYmIG9wdHMuaGFzVGV4dCkge1xuICAgICAgZHJhd1N3aW1MYW5lTGFiZWxzKGN0eCwgb3B0cywgcmVzb3VyY2VEZWZpbml0aW9uLCBzY2FsZSwgcm93UmFuZ2VzKTtcbiAgICB9XG4gIH1cblxuICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG5cbiAgY3R4LnNhdmUoKTtcbiAgY3R4LmNsaXAoY2xpcFJlZ2lvbik7XG4gIC8vIERyYXcgdGFza3MgaW4gdGhlaXIgcm93cy5cbiAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCB0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHJvdyA9IHRhc2tJbmRleFRvUm93LmdldCh0YXNrSW5kZXgpITtcbiAgICBjb25zdCBzcGFuID0gc3BhbnNbdGFza0luZGV4XTtcbiAgICBjb25zdCB0YXNrU3RhcnQgPSBzY2FsZS5mZWF0dXJlKHJvdywgc3Bhbi5zdGFydCwgRmVhdHVyZS50YXNrTGluZVN0YXJ0KTtcbiAgICBjb25zdCB0YXNrRW5kID0gc2NhbGUuZmVhdHVyZShyb3csIHNwYW4uZmluaXNoLCBGZWF0dXJlLnRhc2tMaW5lU3RhcnQpO1xuXG4gICAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZU11dGVkO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZU11dGVkO1xuXG4gICAgLy8gRHJhdyBpbiB0aW1lIG1hcmtlcnMgaWYgZGlzcGxheWVkLlxuICAgIC8vIFRPRE8gLSBNYWtlIHN1cmUgdGhleSBkb24ndCBvdmVybGFwLlxuICAgIGlmIChvcHRzLmRyYXdUaW1lTWFya2Vyc09uVGFza3MpIHtcbiAgICAgIGRyYXdUaW1lTWFya2VyQXREYXlUb1Rhc2soXG4gICAgICAgIGN0eCxcbiAgICAgICAgcm93LFxuICAgICAgICBzcGFuLnN0YXJ0LFxuICAgICAgICB0YXNrLFxuICAgICAgICBvcHRzLFxuICAgICAgICBzY2FsZSxcbiAgICAgICAgZGF5c1dpdGhUaW1lTWFya2Vyc1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAodGFza0hpZ2hsaWdodHMuaGFzKHRhc2tJbmRleCkpIHtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VIaWdobGlnaHQ7XG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VIaWdobGlnaHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gICAgfVxuICAgIGlmIChvcHRzLmhhc1Rhc2tzKSB7XG4gICAgICBpZiAodGFza1N0YXJ0LnggPT09IHRhc2tFbmQueCkge1xuICAgICAgICBkcmF3TWlsZXN0b25lKGN0eCwgdGFza1N0YXJ0LCBkaWFtb25kRGlhbWV0ZXIsIHBlcmNlbnRIZWlnaHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZHJhd1Rhc2tCYXIoY3R4LCB0YXNrU3RhcnQsIHRhc2tFbmQsIHRhc2tMaW5lSGVpZ2h0KTtcbiAgICAgIH1cblxuICAgICAgLy8gU2tpcCBkcmF3aW5nIHRoZSB0ZXN0IG9mIHRoZSBTdGFydCBhbmQgRmluaXNoIHRhc2tzLlxuICAgICAgaWYgKHRhc2tJbmRleCAhPT0gMCAmJiB0YXNrSW5kZXggIT09IHRvdGFsTnVtYmVyT2ZSb3dzIC0gMSkge1xuICAgICAgICBkcmF3VGFza1RleHQoY3R4LCBvcHRzLCBzY2FsZSwgcm93LCBzcGFuLCB0YXNrLCB0YXNrSW5kZXgsIGNsaXBXaWR0aCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBjdHgubGluZVdpZHRoID0gMTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlTXV0ZWQ7XG5cbiAgLy8gTm93IGRyYXcgYWxsIHRoZSBhcnJvd3MsIGkuZS4gZWRnZXMuXG4gIGlmIChvcHRzLmhhc0VkZ2VzICYmIG9wdHMuaGFzVGFza3MpIHtcbiAgICBjb25zdCBoaWdobGlnaHRlZEVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSA9IFtdO1xuICAgIGNvbnN0IG5vcm1hbEVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSA9IFtdO1xuICAgIHBsYW4uY2hhcnQuRWRnZXMuZm9yRWFjaCgoZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgIG9wdHMudGFza0hpZ2hsaWdodHMuaW5jbHVkZXMoZS5pKSAmJlxuICAgICAgICBvcHRzLnRhc2tIaWdobGlnaHRzLmluY2x1ZGVzKGUuailcbiAgICAgICkge1xuICAgICAgICBoaWdobGlnaHRlZEVkZ2VzLnB1c2goZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub3JtYWxFZGdlcy5wdXNoKGUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlTXV0ZWQ7XG4gICAgZHJhd0VkZ2VzKFxuICAgICAgY3R4LFxuICAgICAgb3B0cyxcbiAgICAgIG5vcm1hbEVkZ2VzLFxuICAgICAgc3BhbnMsXG4gICAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLFxuICAgICAgc2NhbGUsXG4gICAgICB0YXNrSW5kZXhUb1JvdyxcbiAgICAgIGFycm93SGVhZFdpZHRoLFxuICAgICAgYXJyb3dIZWFkSGVpZ2h0XG4gICAgKTtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VIaWdobGlnaHQ7XG4gICAgZHJhd0VkZ2VzKFxuICAgICAgY3R4LFxuICAgICAgb3B0cyxcbiAgICAgIGhpZ2hsaWdodGVkRWRnZXMsXG4gICAgICBzcGFucyxcbiAgICAgIHBsYW4uY2hhcnQuVmVydGljZXMsXG4gICAgICBzY2FsZSxcbiAgICAgIHRhc2tJbmRleFRvUm93LFxuICAgICAgYXJyb3dIZWFkV2lkdGgsXG4gICAgICBhcnJvd0hlYWRIZWlnaHRcbiAgICApO1xuICB9XG5cbiAgY3R4LnJlc3RvcmUoKTtcblxuICAvLyBOb3cgZHJhdyB0aGUgcmFuZ2UgaGlnaGxpZ2h0cyBpZiByZXF1aXJlZC5cbiAgaWYgKG9wdHMuZGlzcGxheVJhbmdlICE9PSBudWxsICYmIG9wdHMuZGlzcGxheVJhbmdlVXNhZ2UgPT09IFwiaGlnaGxpZ2h0XCIpIHtcbiAgICAvLyBEcmF3IGEgcmVjdCBvdmVyIGVhY2ggc2lkZSB0aGF0IGlzbid0IGluIHRoZSByYW5nZS5cbiAgICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UuYmVnaW4gPiAwKSB7XG4gICAgICBkcmF3UmFuZ2VPdmVybGF5KFxuICAgICAgICBjdHgsXG4gICAgICAgIG9wdHMsXG4gICAgICAgIHNjYWxlLFxuICAgICAgICAwLFxuICAgICAgICBvcHRzLmRpc3BsYXlSYW5nZS5iZWdpbixcbiAgICAgICAgdG90YWxOdW1iZXJPZlJvd3NcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChvcHRzLmRpc3BsYXlSYW5nZS5lbmQgPCB0b3RhbE51bWJlck9mRGF5cykge1xuICAgICAgZHJhd1JhbmdlT3ZlcmxheShcbiAgICAgICAgY3R4LFxuICAgICAgICBvcHRzLFxuICAgICAgICBzY2FsZSxcbiAgICAgICAgb3B0cy5kaXNwbGF5UmFuZ2UuZW5kLFxuICAgICAgICB0b3RhbE51bWJlck9mRGF5cyArIDEsXG4gICAgICAgIHRvdGFsTnVtYmVyT2ZSb3dzXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvayhzY2FsZSk7XG59XG5cbmZ1bmN0aW9uIGRyYXdFZGdlcyhcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSxcbiAgc3BhbnM6IFNwYW5bXSxcbiAgdGFza3M6IFRhc2tbXSxcbiAgc2NhbGU6IFNjYWxlLFxuICB0YXNrSW5kZXhUb1JvdzogVGFza0luZGV4VG9Sb3csXG4gIGFycm93SGVhZFdpZHRoOiBudW1iZXIsXG4gIGFycm93SGVhZEhlaWdodDogbnVtYmVyXG4pIHtcbiAgZWRnZXMuZm9yRWFjaCgoZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgY29uc3Qgc3JjU2xhY2s6IFNwYW4gPSBzcGFuc1tlLmldO1xuICAgIGNvbnN0IGRzdFNsYWNrOiBTcGFuID0gc3BhbnNbZS5qXTtcbiAgICBjb25zdCBzcmNUYXNrOiBUYXNrID0gdGFza3NbZS5pXTtcbiAgICBjb25zdCBkc3RUYXNrOiBUYXNrID0gdGFza3NbZS5qXTtcbiAgICBjb25zdCBzcmNSb3cgPSB0YXNrSW5kZXhUb1Jvdy5nZXQoZS5pKSE7XG4gICAgY29uc3QgZHN0Um93ID0gdGFza0luZGV4VG9Sb3cuZ2V0KGUuaikhO1xuICAgIGNvbnN0IHNyY0RheSA9IHNyY1NsYWNrLmZpbmlzaDtcbiAgICBjb25zdCBkc3REYXkgPSBkc3RTbGFjay5zdGFydDtcblxuICAgIGlmIChcbiAgICAgIG9wdHMudGFza0hpZ2hsaWdodHMuaW5jbHVkZXMoZS5pKSAmJlxuICAgICAgb3B0cy50YXNrSGlnaGxpZ2h0cy5pbmNsdWRlcyhlLmopXG4gICAgKSB7XG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VIaWdobGlnaHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZU11dGVkO1xuICAgIH1cblxuICAgIGRyYXdBcnJvd0JldHdlZW5UYXNrcyhcbiAgICAgIGN0eCxcbiAgICAgIHNyY0RheSxcbiAgICAgIGRzdERheSxcbiAgICAgIHNjYWxlLFxuICAgICAgc3JjUm93LFxuICAgICAgc3JjVGFzayxcbiAgICAgIGRzdFJvdyxcbiAgICAgIGRzdFRhc2ssXG4gICAgICBhcnJvd0hlYWRXaWR0aCxcbiAgICAgIGFycm93SGVhZEhlaWdodFxuICAgICk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBkcmF3UmFuZ2VPdmVybGF5KFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgc2NhbGU6IFNjYWxlLFxuICBiZWdpbkRheTogbnVtYmVyLFxuICBlbmREYXk6IG51bWJlcixcbiAgdG90YWxOdW1iZXJPZlJvd3M6IG51bWJlclxuKSB7XG4gIGNvbnN0IHRvcExlZnQgPSBzY2FsZS5mZWF0dXJlKDAsIGJlZ2luRGF5LCBGZWF0dXJlLmRpc3BsYXlSYW5nZVRvcCk7XG4gIGNvbnN0IGJvdHRvbVJpZ2h0ID0gc2NhbGUuZmVhdHVyZShcbiAgICB0b3RhbE51bWJlck9mUm93cyxcbiAgICBlbmREYXksXG4gICAgRmVhdHVyZS50YXNrUm93Qm90dG9tXG4gICk7XG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vdmVybGF5O1xuICBjdHguZmlsbFJlY3QoXG4gICAgdG9wTGVmdC54LFxuICAgIHRvcExlZnQueSxcbiAgICBib3R0b21SaWdodC54IC0gdG9wTGVmdC54LFxuICAgIGJvdHRvbVJpZ2h0LnkgLSB0b3BMZWZ0LnlcbiAgKTtcbiAgY29uc29sZS5sb2coXCJkcmF3UmFuZ2VPdmVybGF5XCIsIHRvcExlZnQsIGJvdHRvbVJpZ2h0KTtcbn1cblxuZnVuY3Rpb24gZHJhd0Fycm93QmV0d2VlblRhc2tzKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgc3JjRGF5OiBudW1iZXIsXG4gIGRzdERheTogbnVtYmVyLFxuICBzY2FsZTogU2NhbGUsXG4gIHNyY1JvdzogbnVtYmVyLFxuICBzcmNUYXNrOiBUYXNrLFxuICBkc3RSb3c6IG51bWJlcixcbiAgZHN0VGFzazogVGFzayxcbiAgYXJyb3dIZWFkV2lkdGg6IG51bWJlcixcbiAgYXJyb3dIZWFkSGVpZ2h0OiBudW1iZXJcbikge1xuICBpZiAoc3JjRGF5ID09PSBkc3REYXkpIHtcbiAgICAvLyBUT0RPIC0gT25jZSB3ZSBjYW4gcHJlc2VudCB0aGluZ3MgaW4gYW4gb3JkZXIgYmVzaWRlcyB0b3BvbG9naWNhbCBzb3J0LFxuICAgIC8vIGUuZy4gYWxsb3cgZ3JvdXBpbmcgaW50byBzd2ltbGFuZXMgYnkgcmVzb3VyY2UsIHRoZW4gdGhlc2UgYXJyb3dzIG1pZ2h0XG4gICAgLy8gc3RhcnQgcG9pbnRpbmcgdXAsIHNvIGJvdGggdGhlIGFycm93IHN0YXJ0IGFuZCBhcnJvdyBoZWFkIGRpcmVjdGlvblxuICAgIC8vIG1pZ2h0IGNoYW5nZSBhbmQgbmVlZCB0byBkZXBlbmQgb24gdGhlIGRpcmVjdGlvbiBmcm9tIHNyY1JvdyB0byBkc3RSb3cuXG4gICAgZHJhd1ZlcnRpY2FsQXJyb3dUb1Rhc2soXG4gICAgICBjdHgsXG4gICAgICBzY2FsZSxcbiAgICAgIHNyY1JvdyxcbiAgICAgIHNyY0RheSxcbiAgICAgIHNyY1Rhc2ssXG4gICAgICBkc3RSb3csXG4gICAgICBkc3REYXksXG4gICAgICBkc3RUYXNrLFxuICAgICAgYXJyb3dIZWFkV2lkdGgsXG4gICAgICBhcnJvd0hlYWRIZWlnaHRcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIGRyYXdMU2hhcGVkQXJyb3dUb1Rhc2soXG4gICAgICBjdHgsXG4gICAgICBzY2FsZSxcbiAgICAgIHNyY1JvdyxcbiAgICAgIHNyY0RheSxcbiAgICAgIHNyY1Rhc2ssXG4gICAgICBkc3RSb3csXG4gICAgICBkc3RUYXNrLFxuICAgICAgZHN0RGF5LFxuICAgICAgYXJyb3dIZWFkSGVpZ2h0LFxuICAgICAgYXJyb3dIZWFkV2lkdGhcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNsZWFyQ2FudmFzKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudFxuKSB7XG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5zdXJmYWNlO1xuICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gIGN0eC5maWxsUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xufVxuXG5mdW5jdGlvbiBzZXRGb250U2l6ZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgb3B0czogUmVuZGVyT3B0aW9ucykge1xuICBjdHguZm9udCA9IGAke29wdHMuZm9udFNpemVQeH1weCBzZXJpZmA7XG59XG5cbi8vIERyYXcgTCBzaGFwZWQgYXJyb3csIGZpcnN0IGdvaW5nIGJldHdlZW4gcm93cywgdGhlbiBnb2luZyBiZXR3ZWVuIGRheXMuXG5mdW5jdGlvbiBkcmF3TFNoYXBlZEFycm93VG9UYXNrKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgc2NhbGU6IFNjYWxlLFxuICBzcmNSb3c6IG51bWJlcixcbiAgc3JjRGF5OiBudW1iZXIsXG4gIHNyY1Rhc2s6IFRhc2ssXG4gIGRzdFJvdzogbnVtYmVyLFxuICBkc3RUYXNrOiBUYXNrLFxuICBkc3REYXk6IG51bWJlcixcbiAgYXJyb3dIZWFkSGVpZ2h0OiBudW1iZXIsXG4gIGFycm93SGVhZFdpZHRoOiBudW1iZXJcbikge1xuICAvLyBUT0RPIC0gT25jZSB3ZSBjYW4gcHJlc2VudCB0aGluZ3MgaW4gYW4gb3JkZXIgYmVzaWRlcyB0b3BvbG9naWNhbCBzb3J0LFxuICAvLyBlLmcuIGFsbG93IGdyb3VwaW5nIGludG8gc3dpbWxhbmVzIGJ5IHJlc291cmNlLCB0aGVuIHRoZSB2ZXJ0aWNhbFxuICAvLyBzZWN0aW9uIG9mIHRoZSBcIkxcIiBtaWdodCBzdGFydCBwb2ludGluZyB1cCwgc28gYm90aCB0aGVcbiAgLy8gdmVydGljYWxBcnJvd1N0YXJ0IGFuZCB2ZXJ0aWNhbEFycm93RGVzdCBsb2NhdGlvbnMgbWlnaHQgY2hhbmdlIGFuZFxuICAvLyBuZWVkIHRvIGRlcGVuZCBvbiB0aGUgZGlyZWN0aW9uIGZyb20gc3JjUm93IHRvIGRzdFJvdy5cblxuICAvLyBEcmF3IHZlcnRpY2FsIHBhcnQgb2YgdGhlIFwiTFwiLlxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGNvbnN0IGRpcmVjdGlvbjogRGlyZWN0aW9uID0gc3JjUm93IDwgZHN0Um93ID8gXCJkb3duXCIgOiBcInVwXCI7XG4gIGNvbnN0IHZlcnRMaW5lU3RhcnQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIHNyY1JvdyxcbiAgICBzcmNEYXksXG4gICAgdmVydGljYWxBcnJvd1N0YXJ0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24oc3JjVGFzaywgZGlyZWN0aW9uKVxuICApO1xuICBjb25zdCB2ZXJ0TGluZUVuZCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgZHN0Um93LFxuICAgIHNyY0RheSxcbiAgICBob3Jpem9udGFsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24oZHN0VGFzaylcbiAgKTtcbiAgY3R4Lm1vdmVUbyh2ZXJ0TGluZVN0YXJ0LnggKyAwLjUsIHZlcnRMaW5lU3RhcnQueSk7XG4gIGN0eC5saW5lVG8odmVydExpbmVTdGFydC54ICsgMC41LCB2ZXJ0TGluZUVuZC55KTtcblxuICAvLyBEcmF3IGhvcml6b250YWwgcGFydCBvZiB0aGUgXCJMXCIuXG4gIGNvbnN0IGhvcnpMaW5lU3RhcnQgPSB2ZXJ0TGluZUVuZDtcbiAgY29uc3QgaG9yekxpbmVFbmQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIGRzdFJvdyxcbiAgICBkc3REYXksXG4gICAgaG9yaXpvbnRhbEFycm93RGVzdEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uKGRzdFRhc2spXG4gICk7XG4gIGN0eC5tb3ZlVG8odmVydExpbmVTdGFydC54ICsgMC41LCBob3J6TGluZVN0YXJ0LnkpO1xuICBjdHgubGluZVRvKGhvcnpMaW5lRW5kLnggKyAwLjUsIGhvcnpMaW5lRW5kLnkpO1xuXG4gIC8vIERyYXcgdGhlIGFycm93aGVhZC4gVGhpcyBhcnJvdyBoZWFkIHdpbGwgYWx3YXlzIHBvaW50IHRvIHRoZSByaWdodFxuICAvLyBzaW5jZSB0aGF0J3MgaG93IHRpbWUgZmxvd3MuXG4gIGN0eC5tb3ZlVG8oaG9yekxpbmVFbmQueCArIDAuNSwgaG9yekxpbmVFbmQueSk7XG4gIGN0eC5saW5lVG8oXG4gICAgaG9yekxpbmVFbmQueCAtIGFycm93SGVhZEhlaWdodCArIDAuNSxcbiAgICBob3J6TGluZUVuZC55ICsgYXJyb3dIZWFkV2lkdGhcbiAgKTtcbiAgY3R4Lm1vdmVUbyhob3J6TGluZUVuZC54ICsgMC41LCBob3J6TGluZUVuZC55KTtcbiAgY3R4LmxpbmVUbyhcbiAgICBob3J6TGluZUVuZC54IC0gYXJyb3dIZWFkSGVpZ2h0ICsgMC41LFxuICAgIGhvcnpMaW5lRW5kLnkgLSBhcnJvd0hlYWRXaWR0aFxuICApO1xuICBjdHguc3Ryb2tlKCk7XG59XG5cbmZ1bmN0aW9uIGRyYXdWZXJ0aWNhbEFycm93VG9UYXNrKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgc2NhbGU6IFNjYWxlLFxuICBzcmNSb3c6IG51bWJlcixcbiAgc3JjRGF5OiBudW1iZXIsXG4gIHNyY1Rhc2s6IFRhc2ssXG4gIGRzdFJvdzogbnVtYmVyLFxuICBkc3REYXk6IG51bWJlcixcbiAgZHN0VGFzazogVGFzayxcbiAgYXJyb3dIZWFkV2lkdGg6IG51bWJlcixcbiAgYXJyb3dIZWFkSGVpZ2h0OiBudW1iZXJcbikge1xuICBjb25zdCBkaXJlY3Rpb246IERpcmVjdGlvbiA9IHNyY1JvdyA8IGRzdFJvdyA/IFwiZG93blwiIDogXCJ1cFwiO1xuICBjb25zdCBhcnJvd1N0YXJ0ID0gc2NhbGUuZmVhdHVyZShcbiAgICBzcmNSb3csXG4gICAgc3JjRGF5LFxuICAgIHZlcnRpY2FsQXJyb3dTdGFydEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uKHNyY1Rhc2ssIGRpcmVjdGlvbilcbiAgKTtcbiAgY29uc3QgYXJyb3dFbmQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIGRzdFJvdyxcbiAgICBkc3REYXksXG4gICAgdmVydGljYWxBcnJvd0Rlc3RGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbihkc3RUYXNrLCBkaXJlY3Rpb24pXG4gICk7XG5cbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHgubW92ZVRvKGFycm93U3RhcnQueCArIDAuNSwgYXJyb3dTdGFydC55KTtcbiAgY3R4LmxpbmVUbyhhcnJvd0VuZC54ICsgMC41LCBhcnJvd0VuZC55KTtcblxuICAvLyBEcmF3IHRoZSBhcnJvd2hlYWQuXG4gIGNvbnN0IGRlbHRhWSA9IGRpcmVjdGlvbiA9PT0gXCJkb3duXCIgPyAtYXJyb3dIZWFkSGVpZ2h0IDogYXJyb3dIZWFkSGVpZ2h0O1xuICBjdHgubW92ZVRvKGFycm93RW5kLnggKyAwLjUsIGFycm93RW5kLnkpO1xuICBjdHgubGluZVRvKGFycm93RW5kLnggLSBhcnJvd0hlYWRXaWR0aCArIDAuNSwgYXJyb3dFbmQueSArIGRlbHRhWSk7XG4gIGN0eC5tb3ZlVG8oYXJyb3dFbmQueCArIDAuNSwgYXJyb3dFbmQueSk7XG4gIGN0eC5saW5lVG8oYXJyb3dFbmQueCArIGFycm93SGVhZFdpZHRoICsgMC41LCBhcnJvd0VuZC55ICsgZGVsdGFZKTtcbiAgY3R4LnN0cm9rZSgpO1xufVxuXG5mdW5jdGlvbiBkcmF3VGFza1RleHQoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBzY2FsZTogU2NhbGUsXG4gIHJvdzogbnVtYmVyLFxuICBzcGFuOiBTcGFuLFxuICB0YXNrOiBUYXNrLFxuICB0YXNrSW5kZXg6IG51bWJlcixcbiAgY2xpcFdpZHRoOiBudW1iZXJcbikge1xuICBpZiAoIW9wdHMuaGFzVGV4dCkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBsYWJlbCA9IG9wdHMudGFza0xhYmVsKHRhc2tJbmRleCk7XG5cbiAgbGV0IHhTdGFydEluVGltZSA9IHNwYW4uc3RhcnQ7XG4gIGxldCB4UGl4ZWxEZWx0YSA9IDA7XG4gIC8vIERldGVybWluZSB3aGVyZSBvbiB0aGUgeC1heGlzIHRvIHN0YXJ0IGRyYXdpbmcgdGhlIHRhc2sgdGV4dC5cbiAgaWYgKG9wdHMuZGlzcGxheVJhbmdlICE9PSBudWxsICYmIG9wdHMuZGlzcGxheVJhbmdlVXNhZ2UgPT09IFwicmVzdHJpY3RcIikge1xuICAgIGlmIChvcHRzLmRpc3BsYXlSYW5nZS5pbihzcGFuLnN0YXJ0KSkge1xuICAgICAgeFN0YXJ0SW5UaW1lID0gc3Bhbi5zdGFydDtcbiAgICAgIHhQaXhlbERlbHRhID0gMDtcbiAgICB9IGVsc2UgaWYgKG9wdHMuZGlzcGxheVJhbmdlLmluKHNwYW4uZmluaXNoKSkge1xuICAgICAgeFN0YXJ0SW5UaW1lID0gc3Bhbi5maW5pc2g7XG4gICAgICBjb25zdCBtZWFzID0gY3R4Lm1lYXN1cmVUZXh0KGxhYmVsKTtcbiAgICAgIHhQaXhlbERlbHRhID0gLW1lYXMud2lkdGggLSAyICogc2NhbGUubWV0cmljKE1ldHJpYy50ZXh0WE9mZnNldCk7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHNwYW4uc3RhcnQgPCBvcHRzLmRpc3BsYXlSYW5nZS5iZWdpbiAmJlxuICAgICAgc3Bhbi5maW5pc2ggPiBvcHRzLmRpc3BsYXlSYW5nZS5lbmRcbiAgICApIHtcbiAgICAgIHhTdGFydEluVGltZSA9IG9wdHMuZGlzcGxheVJhbmdlLmJlZ2luO1xuICAgICAgeFBpeGVsRGVsdGEgPSBjbGlwV2lkdGggLyAyO1xuICAgIH1cbiAgfVxuICBjdHgubGluZVdpZHRoID0gMTtcbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY3R4LnRleHRCYXNlbGluZSA9IFwidG9wXCI7XG4gIGNvbnN0IHRleHRTdGFydCA9IHNjYWxlLmZlYXR1cmUocm93LCB4U3RhcnRJblRpbWUsIEZlYXR1cmUudGV4dFN0YXJ0KTtcbiAgY3R4LmZpbGxUZXh0KFxuICAgIG9wdHMudGFza0xhYmVsKHRhc2tJbmRleCksXG4gICAgdGV4dFN0YXJ0LnggKyB4UGl4ZWxEZWx0YSxcbiAgICB0ZXh0U3RhcnQueVxuICApO1xufVxuXG5mdW5jdGlvbiBkcmF3VGFza0JhcihcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHRhc2tTdGFydDogUG9pbnQsXG4gIHRhc2tFbmQ6IFBvaW50LFxuICB0YXNrTGluZUhlaWdodDogbnVtYmVyXG4pIHtcbiAgY3R4LmZpbGxSZWN0KFxuICAgIHRhc2tTdGFydC54LFxuICAgIHRhc2tTdGFydC55LFxuICAgIHRhc2tFbmQueCAtIHRhc2tTdGFydC54LFxuICAgIHRhc2tMaW5lSGVpZ2h0XG4gICk7XG59XG5cbmZ1bmN0aW9uIGRyYXdNaWxlc3RvbmUoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICB0YXNrU3RhcnQ6IFBvaW50LFxuICBkaWFtb25kRGlhbWV0ZXI6IG51bWJlcixcbiAgcGVyY2VudEhlaWdodDogbnVtYmVyXG4pIHtcbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHgubGluZVdpZHRoID0gcGVyY2VudEhlaWdodCAvIDI7XG4gIGN0eC5tb3ZlVG8odGFza1N0YXJ0LngsIHRhc2tTdGFydC55IC0gZGlhbW9uZERpYW1ldGVyKTtcbiAgY3R4LmxpbmVUbyh0YXNrU3RhcnQueCArIGRpYW1vbmREaWFtZXRlciwgdGFza1N0YXJ0LnkpO1xuICBjdHgubGluZVRvKHRhc2tTdGFydC54LCB0YXNrU3RhcnQueSArIGRpYW1vbmREaWFtZXRlcik7XG4gIGN0eC5saW5lVG8odGFza1N0YXJ0LnggLSBkaWFtb25kRGlhbWV0ZXIsIHRhc2tTdGFydC55KTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xuICBjdHguc3Ryb2tlKCk7XG59XG5cbmNvbnN0IGRyYXdUaW1lTWFya2VyQXREYXlUb1Rhc2sgPSAoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICByb3c6IG51bWJlcixcbiAgZGF5OiBudW1iZXIsXG4gIHRhc2s6IFRhc2ssXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIHNjYWxlOiBTY2FsZSxcbiAgZGF5c1dpdGhUaW1lTWFya2VyczogU2V0PG51bWJlcj5cbikgPT4ge1xuICBpZiAoZGF5c1dpdGhUaW1lTWFya2Vycy5oYXMoZGF5KSkge1xuICAgIHJldHVybjtcbiAgfVxuICBkYXlzV2l0aFRpbWVNYXJrZXJzLmFkZChkYXkpO1xuICBjb25zdCB0aW1lTWFya1N0YXJ0ID0gc2NhbGUuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS50aW1lTWFya1N0YXJ0KTtcbiAgY29uc3QgdGltZU1hcmtFbmQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIHJvdyxcbiAgICBkYXksXG4gICAgdmVydGljYWxBcnJvd0Rlc3RGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbih0YXNrLCBcImRvd25cIilcbiAgKTtcbiAgY3R4LmxpbmVXaWR0aCA9IDE7XG5cbiAgY3R4LnNldExpbmVEYXNoKFtcbiAgICBzY2FsZS5tZXRyaWMoTWV0cmljLmxpbmVEYXNoTGluZSksXG4gICAgc2NhbGUubWV0cmljKE1ldHJpYy5saW5lRGFzaEdhcCksXG4gIF0pO1xuICBjdHgubW92ZVRvKHRpbWVNYXJrU3RhcnQueCArIDAuNSwgdGltZU1hcmtTdGFydC55KTtcbiAgY3R4LmxpbmVUbyh0aW1lTWFya1N0YXJ0LnggKyAwLjUsIHRpbWVNYXJrRW5kLnkpO1xuICBjdHguc3Ryb2tlKCk7XG5cbiAgY3R4LnNldExpbmVEYXNoKFtdKTtcblxuICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICBjdHgudGV4dEJhc2VsaW5lID0gXCJ0b3BcIjtcbiAgY29uc3QgdGV4dFN0YXJ0ID0gc2NhbGUuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS50aW1lVGV4dFN0YXJ0KTtcbiAgaWYgKG9wdHMuaGFzVGV4dCAmJiBvcHRzLmhhc1RpbWVsaW5lKSB7XG4gICAgY3R4LmZpbGxUZXh0KGAke2RheX1gLCB0ZXh0U3RhcnQueCwgdGV4dFN0YXJ0LnkpO1xuICB9XG59O1xuXG4vKiogUmVwcmVzZW50cyBhIGhhbGYtb3BlbiBpbnRlcnZhbCBvZiByb3dzLCBlLmcuIFtzdGFydCwgZmluaXNoKS4gKi9cbmludGVyZmFjZSBSb3dSYW5nZSB7XG4gIHN0YXJ0OiBudW1iZXI7XG4gIGZpbmlzaDogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgVGFza0luZGV4VG9Sb3dSZXR1cm4ge1xuICB0YXNrSW5kZXhUb1JvdzogVGFza0luZGV4VG9Sb3c7XG5cbiAgLyoqIE1hcHMgZWFjaCByZXNvdXJjZSB2YWx1ZSBpbmRleCB0byBhIHJhbmdlIG9mIHJvd3MuICovXG4gIHJvd1JhbmdlczogTWFwPG51bWJlciwgUm93UmFuZ2U+IHwgbnVsbDtcblxuICByZXNvdXJjZURlZmluaXRpb246IFJlc291cmNlRGVmaW5pdGlvbiB8IG51bGw7XG59XG5cbmNvbnN0IHRhc2tJbmRleFRvUm93RnJvbUdyb3VwQnkgPSAoXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIHBsYW46IFBsYW5cbik6IFJlc3VsdDxUYXNrSW5kZXhUb1Jvd1JldHVybj4gPT4ge1xuICBjb25zdCB2cmV0ID0gdmFsaWRhdGVDaGFydChwbGFuLmNoYXJ0KTtcbiAgaWYgKCF2cmV0Lm9rKSB7XG4gICAgcmV0dXJuIHZyZXQ7XG4gIH1cbiAgY29uc3QgdG9wb2xvZ2ljYWxPcmRlciA9IHZyZXQudmFsdWU7XG5cbiAgY29uc3QgcmVzb3VyY2UgPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbihvcHRzLmdyb3VwQnlSZXNvdXJjZSk7XG5cbiAgLy8gdG9wb2xvZ2ljYWxPcmRlciBtYXBzIGZyb20gcm93IHRvIHRhc2sgaW5kZXgsIHRoaXMgd2lsbCBwcm9kdWNlIHRoZSBpbnZlcnNlIG1hcHBpbmcuXG4gIGNvbnN0IHRhc2tJbmRleFRvUm93ID0gbmV3IE1hcChcbiAgICAvLyBUaGlzIGxvb2tzIGJhY2t3YXJkcywgYnV0IGl0IGlzbid0LiBSZW1lbWJlciB0aGF0IHRoZSBtYXAgY2FsbGJhY2sgdGFrZXNcbiAgICAvLyAodmFsdWUsIGluZGV4KSBhcyBpdHMgYXJndW1lbnRzLlxuICAgIHRvcG9sb2dpY2FsT3JkZXIubWFwKCh0YXNrSW5kZXg6IG51bWJlciwgcm93OiBudW1iZXIpID0+IFt0YXNrSW5kZXgsIHJvd10pXG4gICk7XG5cbiAgaWYgKHJlc291cmNlID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gb2soe1xuICAgICAgdGFza0luZGV4VG9Sb3c6IHRhc2tJbmRleFRvUm93LFxuICAgICAgcm93UmFuZ2VzOiBudWxsLFxuICAgICAgcmVzb3VyY2VEZWZpbml0aW9uOiBudWxsLFxuICAgIH0pO1xuICB9XG5cbiAgY29uc3Qgc3RhcnRUYXNrSW5kZXggPSAwO1xuICBjb25zdCBmaW5pc2hUYXNrSW5kZXggPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDE7XG4gIGNvbnN0IGlnbm9yYWJsZSA9IFtzdGFydFRhc2tJbmRleCwgZmluaXNoVGFza0luZGV4XTtcblxuICAvLyBHcm91cCBhbGwgdGFza3MgYnkgdGhlaXIgcmVzb3VyY2UgdmFsdWUsIHdoaWxlIHByZXNlcnZpbmcgdG9wb2xvZ2ljYWxcbiAgLy8gb3JkZXIgd2l0aCB0aGUgZ3JvdXBzLlxuICBjb25zdCBncm91cHMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyW10+KCk7XG4gIHRvcG9sb2dpY2FsT3JkZXIuZm9yRWFjaCgodGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCByZXNvdXJjZVZhbHVlID1cbiAgICAgIHBsYW4uY2hhcnQuVmVydGljZXNbdGFza0luZGV4XS5nZXRSZXNvdXJjZShvcHRzLmdyb3VwQnlSZXNvdXJjZSkgfHwgXCJcIjtcbiAgICBjb25zdCBncm91cE1lbWJlcnMgPSBncm91cHMuZ2V0KHJlc291cmNlVmFsdWUpIHx8IFtdO1xuICAgIGdyb3VwTWVtYmVycy5wdXNoKHRhc2tJbmRleCk7XG4gICAgZ3JvdXBzLnNldChyZXNvdXJjZVZhbHVlLCBncm91cE1lbWJlcnMpO1xuICB9KTtcblxuICBjb25zdCByZXQgPSBuZXcgTWFwPG51bWJlciwgbnVtYmVyPigpO1xuXG4gIC8vIFVnaCwgU3RhcnQgYW5kIEZpbmlzaCBUYXNrcyBuZWVkIHRvIGJlIG1hcHBlZCwgYnV0IHNob3VsZCBub3QgYmUgZG9uZSB2aWFcbiAgLy8gcmVzb3VyY2UgdmFsdWUsIHNvIFN0YXJ0IHNob3VsZCBhbHdheXMgYmUgZmlyc3QuXG4gIHJldC5zZXQoMCwgMCk7XG5cbiAgLy8gTm93IGluY3JlbWVudCB1cCB0aGUgcm93cyBhcyB3ZSBtb3ZlIHRocm91Z2ggYWxsIHRoZSBncm91cHMuXG4gIGxldCByb3cgPSAxO1xuICAvLyBBbmQgdHJhY2sgaG93IG1hbnkgcm93cyBhcmUgaW4gZWFjaCBncm91cC5cbiAgY29uc3Qgcm93UmFuZ2VzOiBNYXA8bnVtYmVyLCBSb3dSYW5nZT4gPSBuZXcgTWFwKCk7XG4gIHJlc291cmNlLnZhbHVlcy5mb3JFYWNoKChyZXNvdXJjZVZhbHVlOiBzdHJpbmcsIHJlc291cmNlSW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHN0YXJ0T2ZSb3cgPSByb3c7XG4gICAgKGdyb3Vwcy5nZXQocmVzb3VyY2VWYWx1ZSkgfHwgW10pLmZvckVhY2goKHRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBpZiAoaWdub3JhYmxlLmluY2x1ZGVzKHRhc2tJbmRleCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmV0LnNldCh0YXNrSW5kZXgsIHJvdyk7XG4gICAgICByb3crKztcbiAgICB9KTtcbiAgICByb3dSYW5nZXMuc2V0KHJlc291cmNlSW5kZXgsIHsgc3RhcnQ6IHN0YXJ0T2ZSb3csIGZpbmlzaDogcm93IH0pO1xuICB9KTtcbiAgcmV0LnNldChmaW5pc2hUYXNrSW5kZXgsIHJvdyk7XG5cbiAgcmV0dXJuIG9rKHtcbiAgICB0YXNrSW5kZXhUb1JvdzogcmV0LFxuICAgIHJvd1Jhbmdlczogcm93UmFuZ2VzLFxuICAgIHJlc291cmNlRGVmaW5pdGlvbjogcmVzb3VyY2UsXG4gIH0pO1xufTtcblxuY29uc3QgZHJhd1N3aW1MYW5lSGlnaGxpZ2h0cyA9IChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHNjYWxlOiBTY2FsZSxcbiAgcm93UmFuZ2VzOiBNYXA8bnVtYmVyLCBSb3dSYW5nZT4sXG4gIHRvdGFsTnVtYmVyT2ZEYXlzOiBudW1iZXIsXG4gIGdyb3VwQ29sb3I6IHN0cmluZ1xuKSA9PiB7XG4gIGN0eC5maWxsU3R5bGUgPSBncm91cENvbG9yO1xuXG4gIGxldCBncm91cCA9IDA7XG4gIHJvd1Jhbmdlcy5mb3JFYWNoKChyb3dSYW5nZTogUm93UmFuZ2UpID0+IHtcbiAgICBjb25zdCB0b3BMZWZ0ID0gc2NhbGUuZmVhdHVyZShcbiAgICAgIHJvd1JhbmdlLnN0YXJ0LFxuICAgICAgMCxcbiAgICAgIEZlYXR1cmUuZ3JvdXBFbnZlbG9wZVN0YXJ0XG4gICAgKTtcbiAgICBjb25zdCBib3R0b21SaWdodCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgICByb3dSYW5nZS5maW5pc2gsXG4gICAgICB0b3RhbE51bWJlck9mRGF5cyArIDEsXG4gICAgICBGZWF0dXJlLnRhc2tFbnZlbG9wZVRvcFxuICAgICk7XG4gICAgZ3JvdXArKztcbiAgICAvLyBPbmx5IGhpZ2hsaWdodCBldmVyeSBvdGhlciBncm91cCBiYWNrZ3JvdWQgd2l0aCB0aGUgZ3JvdXBDb2xvci5cbiAgICBpZiAoZ3JvdXAgJSAyID09IDEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY3R4LmZpbGxSZWN0KFxuICAgICAgdG9wTGVmdC54LFxuICAgICAgdG9wTGVmdC55LFxuICAgICAgYm90dG9tUmlnaHQueCAtIHRvcExlZnQueCxcbiAgICAgIGJvdHRvbVJpZ2h0LnkgLSB0b3BMZWZ0LnlcbiAgICApO1xuICB9KTtcbn07XG5cbmNvbnN0IGRyYXdTd2ltTGFuZUxhYmVscyA9IChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIHJlc291cmNlRGVmaW5pdGlvbjogUmVzb3VyY2VEZWZpbml0aW9uLFxuICBzY2FsZTogU2NhbGUsXG4gIHJvd1JhbmdlczogTWFwPG51bWJlciwgUm93UmFuZ2U+XG4pID0+IHtcbiAgaWYgKHJvd1JhbmdlcykgY3R4LmxpbmVXaWR0aCA9IDE7XG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gIGNvbnN0IGdyb3VwQnlPcmlnaW4gPSBzY2FsZS5mZWF0dXJlKDAsIDAsIEZlYXR1cmUuZ3JvdXBCeU9yaWdpbik7XG5cbiAgaWYgKG9wdHMuaGFzVGltZWxpbmUpIHtcbiAgICBjdHgudGV4dEJhc2VsaW5lID0gXCJib3R0b21cIjtcbiAgICBjdHguZmlsbFRleHQob3B0cy5ncm91cEJ5UmVzb3VyY2UsIGdyb3VwQnlPcmlnaW4ueCwgZ3JvdXBCeU9yaWdpbi55KTtcbiAgfVxuXG4gIGlmIChvcHRzLmhhc1Rhc2tzKSB7XG4gICAgY3R4LnRleHRCYXNlbGluZSA9IFwidG9wXCI7XG4gICAgcm93UmFuZ2VzLmZvckVhY2goKHJvd1JhbmdlOiBSb3dSYW5nZSwgcmVzb3VyY2VJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBpZiAocm93UmFuZ2Uuc3RhcnQgPT09IHJvd1JhbmdlLmZpbmlzaCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCB0ZXh0U3RhcnQgPSBzY2FsZS5mZWF0dXJlKFxuICAgICAgICByb3dSYW5nZS5zdGFydCxcbiAgICAgICAgMCxcbiAgICAgICAgRmVhdHVyZS5ncm91cFRleHRTdGFydFxuICAgICAgKTtcbiAgICAgIGN0eC5maWxsVGV4dChcbiAgICAgICAgcmVzb3VyY2VEZWZpbml0aW9uLnZhbHVlc1tyZXNvdXJjZUluZGV4XSxcbiAgICAgICAgdGV4dFN0YXJ0LngsXG4gICAgICAgIHRleHRTdGFydC55XG4gICAgICApO1xuICAgIH0pO1xuICB9XG59O1xuIiwgImltcG9ydCB7IFJlc3VsdCwgb2ssIGVycm9yIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgVGFzaywgQ2hhcnQsIENoYXJ0VmFsaWRhdGUgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IERpcmVjdGVkRWRnZSwgZWRnZXNCeVNyY0FuZERzdFRvTWFwIH0gZnJvbSBcIi4uL2RhZy9kYWcudHNcIjtcbmltcG9ydCB7IFJvdW5kZXIgfSBmcm9tIFwiLi4vdHlwZXMvdHlwZXMudHNcIjtcblxuLyoqIFNwYW4gcmVwcmVzZW50cyB3aGVuIGEgdGFzayB3aWxsIGJlIGRvbmUsIGkuZS4gaXQgY29udGFpbnMgdGhlIHRpbWUgdGhlIHRhc2tcbiAqIGlzIGV4cGVjdGVkIHRvIGJlZ2luIGFuZCBlbmQuICovXG5leHBvcnQgY2xhc3MgU3BhbiB7XG4gIHN0YXJ0OiBudW1iZXIgPSAwO1xuICBmaW5pc2g6IG51bWJlciA9IDA7XG59XG5cbi8qKiBUaGUgc3RhbmRhcmQgc2xhY2sgY2FsY3VsYXRpb24gdmFsdWVzLiAqL1xuZXhwb3J0IGNsYXNzIFNsYWNrIHtcbiAgZWFybHk6IFNwYW4gPSBuZXcgU3BhbigpO1xuICBsYXRlOiBTcGFuID0gbmV3IFNwYW4oKTtcbiAgc2xhY2s6IG51bWJlciA9IDA7XG59XG5cbmV4cG9ydCB0eXBlIFRhc2tEdXJhdGlvbiA9ICh0OiBUYXNrLCB0YXNrSW5kZXg6IG51bWJlcikgPT4gbnVtYmVyO1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdFRhc2tEdXJhdGlvbiA9ICh0OiBUYXNrKTogbnVtYmVyID0+IHtcbiAgcmV0dXJuIHQuZHVyYXRpb247XG59O1xuXG5leHBvcnQgdHlwZSBTbGFja1Jlc3VsdCA9IFJlc3VsdDxTbGFja1tdPjtcblxuLy8gQ2FsY3VsYXRlIHRoZSBzbGFjayBmb3IgZWFjaCBUYXNrIGluIHRoZSBDaGFydC5cbmV4cG9ydCBmdW5jdGlvbiBDb21wdXRlU2xhY2soXG4gIGM6IENoYXJ0LFxuICB0YXNrRHVyYXRpb246IFRhc2tEdXJhdGlvbiA9IGRlZmF1bHRUYXNrRHVyYXRpb24sXG4gIHJvdW5kOiBSb3VuZGVyXG4pOiBTbGFja1Jlc3VsdCB7XG4gIC8vIENyZWF0ZSBhIFNsYWNrIGZvciBlYWNoIFRhc2suXG4gIGNvbnN0IHNsYWNrczogU2xhY2tbXSA9IG5ldyBBcnJheShjLlZlcnRpY2VzLmxlbmd0aCk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYy5WZXJ0aWNlcy5sZW5ndGg7IGkrKykge1xuICAgIHNsYWNrc1tpXSA9IG5ldyBTbGFjaygpO1xuICB9XG5cbiAgY29uc3QgciA9IENoYXJ0VmFsaWRhdGUoYyk7XG4gIGlmICghci5vaykge1xuICAgIHJldHVybiBlcnJvcihyLmVycm9yKTtcbiAgfVxuXG4gIGNvbnN0IGVkZ2VzID0gZWRnZXNCeVNyY0FuZERzdFRvTWFwKGMuRWRnZXMpO1xuXG4gIGNvbnN0IHRvcG9sb2dpY2FsT3JkZXIgPSByLnZhbHVlO1xuXG4gIC8vIEZpcnN0IGdvIGZvcndhcmQgdGhyb3VnaCB0aGUgdG9wb2xvZ2ljYWwgc29ydCBhbmQgZmluZCB0aGUgZWFybHkgc3RhcnQgZm9yXG4gIC8vIGVhY2ggdGFzaywgd2hpY2ggaXMgdGhlIG1heCBvZiBhbGwgdGhlIHByZWRlY2Vzc29ycyBlYXJseSBmaW5pc2ggdmFsdWVzLlxuICAvLyBTaW5jZSB3ZSBrbm93IHRoZSBkdXJhdGlvbiB3ZSBjYW4gYWxzbyBjb21wdXRlIHRoZSBlYXJseSBmaW5pc2guXG4gIHRvcG9sb2dpY2FsT3JkZXIuc2xpY2UoMSkuZm9yRWFjaCgodmVydGV4SW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHRhc2sgPSBjLlZlcnRpY2VzW3ZlcnRleEluZGV4XTtcbiAgICBjb25zdCBzbGFjayA9IHNsYWNrc1t2ZXJ0ZXhJbmRleF07XG4gICAgc2xhY2suZWFybHkuc3RhcnQgPSBNYXRoLm1heChcbiAgICAgIC4uLmVkZ2VzLmJ5RHN0LmdldCh2ZXJ0ZXhJbmRleCkhLm1hcCgoZTogRGlyZWN0ZWRFZGdlKTogbnVtYmVyID0+IHtcbiAgICAgICAgY29uc3QgcHJlZGVjZXNzb3JTbGFjayA9IHNsYWNrc1tlLmldO1xuICAgICAgICByZXR1cm4gcHJlZGVjZXNzb3JTbGFjay5lYXJseS5maW5pc2g7XG4gICAgICB9KVxuICAgICk7XG4gICAgc2xhY2suZWFybHkuZmluaXNoID0gcm91bmQoXG4gICAgICBzbGFjay5lYXJseS5zdGFydCArIHRhc2tEdXJhdGlvbih0YXNrLCB2ZXJ0ZXhJbmRleClcbiAgICApO1xuICB9KTtcblxuICAvLyBOb3cgYmFja3dhcmRzIHRocm91Z2ggdGhlIHRvcG9sb2dpY2FsIHNvcnQgYW5kIGZpbmQgdGhlIGxhdGUgZmluaXNoIG9mIGVhY2hcbiAgLy8gdGFzaywgd2hpY2ggaXMgdGhlIG1pbiBvZiBhbGwgdGhlIHN1Y2Nlc3NvciB0YXNrcyBsYXRlIHN0YXJ0cy4gQWdhaW4gc2luY2VcbiAgLy8gd2Uga25vdyB0aGUgZHVyYXRpb24gd2UgY2FuIGFsc28gY29tcHV0ZSB0aGUgbGF0ZSBzdGFydC4gRmluYWxseSwgc2luY2Ugd2VcbiAgLy8gbm93IGhhdmUgYWxsIHRoZSBlYXJseS9sYXRlIGFuZCBzdGFydC9maW5pc2ggdmFsdWVzIHdlIGNhbiBub3cgY2FsY3VhdGUgdGhlXG4gIC8vIHNsYWNrLlxuICB0b3BvbG9naWNhbE9yZGVyLnJldmVyc2UoKS5mb3JFYWNoKCh2ZXJ0ZXhJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgY29uc3QgdGFzayA9IGMuVmVydGljZXNbdmVydGV4SW5kZXhdO1xuICAgIGNvbnN0IHNsYWNrID0gc2xhY2tzW3ZlcnRleEluZGV4XTtcbiAgICBjb25zdCBzdWNjZXNzb3JzID0gZWRnZXMuYnlTcmMuZ2V0KHZlcnRleEluZGV4KTtcbiAgICBpZiAoIXN1Y2Nlc3NvcnMpIHtcbiAgICAgIHNsYWNrLmxhdGUuZmluaXNoID0gc2xhY2suZWFybHkuZmluaXNoO1xuICAgICAgc2xhY2subGF0ZS5zdGFydCA9IHNsYWNrLmVhcmx5LnN0YXJ0O1xuICAgIH0gZWxzZSB7XG4gICAgICBzbGFjay5sYXRlLmZpbmlzaCA9IE1hdGgubWluKFxuICAgICAgICAuLi5lZGdlcy5ieVNyYy5nZXQodmVydGV4SW5kZXgpIS5tYXAoKGU6IERpcmVjdGVkRWRnZSk6IG51bWJlciA9PiB7XG4gICAgICAgICAgY29uc3Qgc3VjY2Vzc29yU2xhY2sgPSBzbGFja3NbZS5qXTtcbiAgICAgICAgICByZXR1cm4gc3VjY2Vzc29yU2xhY2subGF0ZS5zdGFydDtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgICBzbGFjay5sYXRlLnN0YXJ0ID0gcm91bmQoXG4gICAgICAgIHNsYWNrLmxhdGUuZmluaXNoIC0gdGFza0R1cmF0aW9uKHRhc2ssIHZlcnRleEluZGV4KVxuICAgICAgKTtcbiAgICAgIHNsYWNrLnNsYWNrID0gcm91bmQoc2xhY2subGF0ZS5maW5pc2ggLSBzbGFjay5lYXJseS5maW5pc2gpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIG9rKHNsYWNrcyk7XG59XG5cbmV4cG9ydCBjb25zdCBDcml0aWNhbFBhdGggPSAoc2xhY2tzOiBTbGFja1tdLCByb3VuZDogUm91bmRlcik6IG51bWJlcltdID0+IHtcbiAgY29uc3QgcmV0OiBudW1iZXJbXSA9IFtdO1xuICBzbGFja3MuZm9yRWFjaCgoc2xhY2s6IFNsYWNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgaWYgKFxuICAgICAgcm91bmQoc2xhY2subGF0ZS5maW5pc2ggLSBzbGFjay5lYXJseS5maW5pc2gpIDwgTnVtYmVyLkVQU0lMT04gJiZcbiAgICAgIHJvdW5kKHNsYWNrLmVhcmx5LmZpbmlzaCAtIHNsYWNrLmVhcmx5LnN0YXJ0KSA+IE51bWJlci5FUFNJTE9OXG4gICAgKSB7XG4gICAgICByZXQucHVzaChpbmRleCk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHJldDtcbn07XG4iLCAiLy8gV2hlbiBhZGRpbmcgcHJvcGVydGllcyB0byBDb2xvclRoZW1lIGFsc28gbWFrZSBzdXJlIHRvIGFkZCBhIGNvcnJlc3BvbmRpbmdcbi8vIENTUyBAcHJvcGVydHkgZGVjbGFyYXRpb24uXG4vL1xuLy8gTm90ZSB0aGF0IGVhY2ggcHJvcGVydHkgYXNzdW1lcyB0aGUgcHJlc2VuY2Ugb2YgYSBDU1MgdmFyaWFibGUgb2YgdGhlIHNhbWUgbmFtZVxuLy8gd2l0aCBhIHByZWNlZWRpbmcgYC0tYC5cbmV4cG9ydCBpbnRlcmZhY2UgVGhlbWUge1xuICBzdXJmYWNlOiBzdHJpbmc7XG4gIG9uU3VyZmFjZTogc3RyaW5nO1xuICBvblN1cmZhY2VNdXRlZDogc3RyaW5nO1xuICBvblN1cmZhY2VTZWNvbmRhcnk6IHN0cmluZztcbiAgb3ZlcmxheTogc3RyaW5nO1xuICBncm91cENvbG9yOiBzdHJpbmc7XG59XG5cbnR5cGUgVGhlbWVQcm9wID0ga2V5b2YgVGhlbWU7XG5cbmNvbnN0IGNvbG9yVGhlbWVQcm90b3R5cGU6IFRoZW1lID0ge1xuICBzdXJmYWNlOiBcIlwiLFxuICBvblN1cmZhY2U6IFwiXCIsXG4gIG9uU3VyZmFjZU11dGVkOiBcIlwiLFxuICBvblN1cmZhY2VTZWNvbmRhcnk6IFwiXCIsXG4gIG92ZXJsYXk6IFwiXCIsXG4gIGdyb3VwQ29sb3I6IFwiXCIsXG59O1xuXG5leHBvcnQgY29uc3QgY29sb3JUaGVtZUZyb21FbGVtZW50ID0gKGVsZTogSFRNTEVsZW1lbnQpOiBUaGVtZSA9PiB7XG4gIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbGUpO1xuICBjb25zdCByZXQgPSBPYmplY3QuYXNzaWduKHt9LCBjb2xvclRoZW1lUHJvdG90eXBlKTtcbiAgT2JqZWN0LmtleXMocmV0KS5mb3JFYWNoKChuYW1lOiBzdHJpbmcpID0+IHtcbiAgICByZXRbbmFtZSBhcyBUaGVtZVByb3BdID0gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShgLS0ke25hbWV9YCk7XG4gIH0pO1xuICByZXR1cm4gcmV0O1xufTtcbiIsICIvKiogV2hlbiB0aGUgZ2l2ZW4gZWxlbWVudCBpcyBjbGlja2VkLCB0aGVuIHRvZ2dsZSB0aGUgYGRhcmttb2RlYCBjbGFzcyBvbiB0aGVcbiAqIGJvZHkgZWxlbWVudC4gKi9cbmV4cG9ydCBjb25zdCB0b2dnbGVUaGVtZSA9ICgpID0+IHtcbiAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKFwiZGFya21vZGVcIik7XG59O1xuIiwgImltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgZWRnZXNCeVNyY0FuZERzdFRvTWFwIH0gZnJvbSBcIi4vZGFnL2RhZy50c1wiO1xuaW1wb3J0IHtcbiAgRHVwVGFza09wLFxuICBJbnNlcnROZXdFbXB0eVRhc2tBZnRlck9wLFxuICBTZXRUYXNrTmFtZU9wLFxuICBTcGxpdFRhc2tPcCxcbn0gZnJvbSBcIi4vb3BzL2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBTZXRNZXRyaWNWYWx1ZU9wIH0gZnJvbSBcIi4vb3BzL21ldHJpY3MudHNcIjtcbmltcG9ydCB7IE9wLCBhcHBseUFsbE9wc1RvUGxhbiB9IGZyb20gXCIuL29wcy9vcHMudHNcIjtcbmltcG9ydCB7XG4gIEFkZFJlc291cmNlT3AsXG4gIEFkZFJlc291cmNlT3B0aW9uT3AsXG4gIFNldFJlc291cmNlVmFsdWVPcCxcbn0gZnJvbSBcIi4vb3BzL3Jlc291cmNlcy50c1wiO1xuaW1wb3J0IHsgRnJvbUpTT04sIFBsYW4gfSBmcm9tIFwiLi9wbGFuL3BsYW4udHNcIjtcbmltcG9ydCB7IFByZWNpc2lvbiB9IGZyb20gXCIuL3ByZWNpc2lvbi9wcmVjaXNpb24udHNcIjtcbmltcG9ydCB7XG4gIERSQUdfUkFOR0VfRVZFTlQsXG4gIERyYWdSYW5nZSxcbiAgTW91c2VNb3ZlLFxufSBmcm9tIFwiLi9yZW5kZXJlci9tb3VzZW1vdmUvbW91c2Vtb3ZlLnRzXCI7XG5pbXBvcnQgeyBEaXNwbGF5UmFuZ2UgfSBmcm9tIFwiLi9yZW5kZXJlci9yYW5nZS9yYW5nZS50c1wiO1xuaW1wb3J0IHtcbiAgUmVuZGVyT3B0aW9ucyxcbiAgVGFza0xhYmVsLFxuICByZW5kZXJUYXNrc1RvQ2FudmFzLFxuICBzdWdnZXN0ZWRDYW52YXNIZWlnaHQsXG59IGZyb20gXCIuL3JlbmRlcmVyL3JlbmRlcmVyLnRzXCI7XG5pbXBvcnQgeyBTY2FsZSB9IGZyb20gXCIuL3JlbmRlcmVyL3NjYWxlL3NjYWxlLnRzXCI7XG5pbXBvcnQgeyBSZXN1bHQgfSBmcm9tIFwiLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IENvbXB1dGVTbGFjaywgQ3JpdGljYWxQYXRoLCBTbGFjaywgU3BhbiB9IGZyb20gXCIuL3NsYWNrL3NsYWNrLnRzXCI7XG5pbXBvcnQgeyBKYWNvYmlhbiwgVW5jZXJ0YWludHkgfSBmcm9tIFwiLi9zdGF0cy9jZGYvdHJpYW5ndWxhci9qYWNvYmlhbi50c1wiO1xuaW1wb3J0IHsgVGhlbWUsIGNvbG9yVGhlbWVGcm9tRWxlbWVudCB9IGZyb20gXCIuL3N0eWxlL3RoZW1lL3RoZW1lLnRzXCI7XG5pbXBvcnQgeyB0b2dnbGVUaGVtZSB9IGZyb20gXCIuL3N0eWxlL3RvZ2dsZXIvdG9nZ2xlci50c1wiO1xuXG5jb25zdCBGT05UX1NJWkVfUFggPSAzMjtcblxubGV0IHBsYW4gPSBuZXcgUGxhbigpO1xuY29uc3QgcHJlY2lzaW9uID0gbmV3IFByZWNpc2lvbigyKTtcblxuY29uc3Qgcm5kSW50ID0gKG46IG51bWJlcik6IG51bWJlciA9PiB7XG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBuKTtcbn07XG5cbmNvbnN0IERVUkFUSU9OID0gMTAwMDtcblxuY29uc3Qgcm5kRHVyYXRpb24gPSAoKTogbnVtYmVyID0+IHtcbiAgcmV0dXJuIHJuZEludChEVVJBVElPTik7XG59O1xuXG5jb25zdCBwZW9wbGU6IHN0cmluZ1tdID0gW1wiRnJlZFwiLCBcIkJhcm5leVwiLCBcIldpbG1hXCIsIFwiQmV0dHlcIl07XG5cbmNvbnN0IHJuZE5hbWUgPSAoKTogc3RyaW5nID0+IGAke1N0cmluZy5mcm9tQ2hhckNvZGUoNjUgKyBybmRJbnQoMjYpKX1gO1xuXG5jb25zdCBvcHM6IE9wW10gPSBbQWRkUmVzb3VyY2VPcChcIlBlcnNvblwiKV07XG5cbnBlb3BsZS5mb3JFYWNoKChwZXJzb246IHN0cmluZykgPT4ge1xuICBvcHMucHVzaChBZGRSZXNvdXJjZU9wdGlvbk9wKFwiUGVyc29uXCIsIHBlcnNvbikpO1xufSk7XG5cbm9wcy5wdXNoKFxuICBJbnNlcnROZXdFbXB0eVRhc2tBZnRlck9wKDApLFxuICBTZXRNZXRyaWNWYWx1ZU9wKFwiRHVyYXRpb25cIiwgcm5kRHVyYXRpb24oKSwgMSksXG4gIFNldFRhc2tOYW1lT3AoMSwgcm5kTmFtZSgpKSxcbiAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiUGVyc29uXCIsIHBlb3BsZVtybmRJbnQocGVvcGxlLmxlbmd0aCldLCAxKSxcbiAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiVW5jZXJ0YWludHlcIiwgXCJtb2RlcmF0ZVwiLCAxKVxuKTtcblxubGV0IG51bVRhc2tzID0gMTtcbmZvciAobGV0IGkgPSAwOyBpIDwgMjA7IGkrKykge1xuICBsZXQgaW5kZXggPSBybmRJbnQobnVtVGFza3MpICsgMTtcbiAgb3BzLnB1c2goXG4gICAgU3BsaXRUYXNrT3AoaW5kZXgpLFxuICAgIFNldE1ldHJpY1ZhbHVlT3AoXCJEdXJhdGlvblwiLCBybmREdXJhdGlvbigpLCBpbmRleCArIDEpLFxuICAgIFNldFRhc2tOYW1lT3AoaW5kZXggKyAxLCBybmROYW1lKCkpLFxuICAgIFNldFJlc291cmNlVmFsdWVPcChcIlBlcnNvblwiLCBwZW9wbGVbcm5kSW50KHBlb3BsZS5sZW5ndGgpXSwgaW5kZXggKyAxKSxcbiAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJVbmNlcnRhaW50eVwiLCBcIm1vZGVyYXRlXCIsIGluZGV4ICsgMSlcbiAgKTtcbiAgbnVtVGFza3MrKztcbiAgaW5kZXggPSBybmRJbnQobnVtVGFza3MpICsgMTtcbiAgb3BzLnB1c2goXG4gICAgRHVwVGFza09wKGluZGV4KSxcbiAgICBTZXRNZXRyaWNWYWx1ZU9wKFwiRHVyYXRpb25cIiwgcm5kRHVyYXRpb24oKSwgaW5kZXggKyAxKSxcbiAgICBTZXRUYXNrTmFtZU9wKGluZGV4ICsgMSwgcm5kTmFtZSgpKSxcbiAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJQZXJzb25cIiwgcGVvcGxlW3JuZEludChwZW9wbGUubGVuZ3RoKV0sIGluZGV4ICsgMSksXG4gICAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiVW5jZXJ0YWludHlcIiwgXCJtb2RlcmF0ZVwiLCBpbmRleCArIDEpXG4gICk7XG4gIG51bVRhc2tzKys7XG59XG5cbmNvbnN0IHJlcyA9IGFwcGx5QWxsT3BzVG9QbGFuKG9wcywgcGxhbik7XG5cbmlmICghcmVzLm9rKSB7XG4gIGNvbnNvbGUubG9nKHJlcy5lcnJvcik7XG59XG5cbmxldCBzbGFja3M6IFNsYWNrW10gPSBbXTtcbmxldCBzcGFuczogU3BhbltdID0gW107XG5sZXQgY3JpdGljYWxQYXRoOiBudW1iZXJbXSA9IFtdO1xuXG5jb25zdCByZWNhbGN1bGF0ZVNwYW4gPSAoKSA9PiB7XG4gIGNvbnN0IHNsYWNrUmVzdWx0ID0gQ29tcHV0ZVNsYWNrKHBsYW4uY2hhcnQsIHVuZGVmaW5lZCwgcHJlY2lzaW9uLnJvdW5kZXIoKSk7XG4gIGlmICghc2xhY2tSZXN1bHQub2spIHtcbiAgICBjb25zb2xlLmVycm9yKHNsYWNrUmVzdWx0KTtcbiAgfSBlbHNlIHtcbiAgICBzbGFja3MgPSBzbGFja1Jlc3VsdC52YWx1ZTtcbiAgfVxuXG4gIHNwYW5zID0gc2xhY2tzLm1hcCgodmFsdWU6IFNsYWNrKTogU3BhbiA9PiB7XG4gICAgcmV0dXJuIHZhbHVlLmVhcmx5O1xuICB9KTtcbiAgY3JpdGljYWxQYXRoID0gQ3JpdGljYWxQYXRoKHNsYWNrcywgcHJlY2lzaW9uLnJvdW5kZXIoKSk7XG59O1xuXG5yZWNhbGN1bGF0ZVNwYW4oKTtcblxuY29uc3QgdGFza0xhYmVsOiBUYXNrTGFiZWwgPSAodGFza0luZGV4OiBudW1iZXIpOiBzdHJpbmcgPT5cbiAgYCR7cGxhbi5jaGFydC5WZXJ0aWNlc1t0YXNrSW5kZXhdLm5hbWV9YDtcbi8vICBgJHtwbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tJbmRleF0ubmFtZX0gKCR7cGxhbi5jaGFydC5WZXJ0aWNlc1t0YXNrSW5kZXhdLnJlc291cmNlc1tcIlBlcnNvblwiXX0pIGA7XG5cbi8vIFRPRE8gRXh0cmFjdCB0aGlzIGFzIGEgaGVscGVyIGZvciB0aGUgcmFkYXIgdmlldy5cbmxldCBkaXNwbGF5UmFuZ2U6IERpc3BsYXlSYW5nZSB8IG51bGwgPSBudWxsO1xubGV0IHNjYWxlOiBTY2FsZSB8IG51bGwgPSBudWxsO1xuXG5jb25zdCByYWRhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KFwiI3JhZGFyXCIpITtcbm5ldyBNb3VzZU1vdmUocmFkYXIpO1xuXG5jb25zdCBkcmFnUmFuZ2VIYW5kbGVyID0gKGU6IEN1c3RvbUV2ZW50PERyYWdSYW5nZT4pID0+IHtcbiAgaWYgKHNjYWxlID09PSBudWxsKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnNvbGUubG9nKFwibW91c2VcIiwgZS5kZXRhaWwpO1xuICBjb25zdCBiZWdpbiA9IHNjYWxlLmRheVJvd0Zyb21Qb2ludChlLmRldGFpbC5iZWdpbik7XG4gIGNvbnN0IGVuZCA9IHNjYWxlLmRheVJvd0Zyb21Qb2ludChlLmRldGFpbC5lbmQpO1xuICBkaXNwbGF5UmFuZ2UgPSBuZXcgRGlzcGxheVJhbmdlKGJlZ2luLmRheSwgZW5kLmRheSk7XG4gIGNvbnNvbGUubG9nKGRpc3BsYXlSYW5nZSk7XG4gIHBhaW50Q2hhcnQoKTtcbn07XG5cbnJhZGFyLmFkZEV2ZW50TGlzdGVuZXIoRFJBR19SQU5HRV9FVkVOVCwgZHJhZ1JhbmdlSGFuZGxlciBhcyBFdmVudExpc3RlbmVyKTtcblxuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkYXJrLW1vZGUtdG9nZ2xlXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICBjb25zb2xlLmxvZyhcImNsaWNrXCIpO1xuICB0b2dnbGVUaGVtZSgpO1xuICBwYWludENoYXJ0KCk7XG59KTtcblxuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyYWRhci10b2dnbGVcIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmFkYXItcGFyZW50XCIpIS5jbGFzc0xpc3QudG9nZ2xlKFwiaGlkZGVuXCIpO1xufSk7XG5cbmxldCB0b3BUaW1lbGluZTogYm9vbGVhbiA9IGZhbHNlO1xuXG5kb2N1bWVudFxuICAucXVlcnlTZWxlY3RvcihcIiN0b3AtdGltZWxpbmUtdG9nZ2xlXCIpIVxuICAuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICB0b3BUaW1lbGluZSA9ICF0b3BUaW1lbGluZTtcbiAgICBwYWludENoYXJ0KCk7XG4gIH0pO1xuXG5sZXQgZ3JvdXBCeU9wdGlvbnM6IHN0cmluZ1tdID0gW1wiXCIsIC4uLk9iamVjdC5rZXlzKHBsYW4ucmVzb3VyY2VEZWZpbml0aW9ucyldO1xubGV0IGdyb3VwQnlPcHRpb25zSW5kZXg6IG51bWJlciA9IDA7XG5cbmNvbnN0IHRvZ2dsZUdyb3VwQnkgPSAoKSA9PiB7XG4gIGdyb3VwQnlPcHRpb25zSW5kZXggPSAoZ3JvdXBCeU9wdGlvbnNJbmRleCArIDEpICUgZ3JvdXBCeU9wdGlvbnMubGVuZ3RoO1xufTtcblxuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNncm91cC1ieS10b2dnbGVcIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gIHRvZ2dsZUdyb3VwQnkoKTtcbiAgcGFpbnRDaGFydCgpO1xufSk7XG5cbmNvbnN0IHBhaW50Q2hhcnQgPSAoKSA9PiB7XG4gIGNvbnNvbGUudGltZShcInBhaW50Q2hhcnRcIik7XG5cbiAgY29uc3QgdGhlbWVDb2xvcnM6IFRoZW1lID0gY29sb3JUaGVtZUZyb21FbGVtZW50KGRvY3VtZW50LmJvZHkpO1xuXG4gIGNvbnN0IHJhZGFyT3B0czogUmVuZGVyT3B0aW9ucyA9IHtcbiAgICBmb250U2l6ZVB4OiA2LFxuICAgIGhhc1RleHQ6IGZhbHNlLFxuICAgIGRpc3BsYXlSYW5nZTogZGlzcGxheVJhbmdlLFxuICAgIGRpc3BsYXlSYW5nZVVzYWdlOiBcImhpZ2hsaWdodFwiLFxuICAgIGNvbG9yczoge1xuICAgICAgc3VyZmFjZTogdGhlbWVDb2xvcnMuc3VyZmFjZSxcbiAgICAgIG9uU3VyZmFjZTogdGhlbWVDb2xvcnMub25TdXJmYWNlLFxuICAgICAgb25TdXJmYWNlTXV0ZWQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZU11dGVkLFxuICAgICAgb25TdXJmYWNlSGlnaGxpZ2h0OiB0aGVtZUNvbG9ycy5vblN1cmZhY2VTZWNvbmRhcnksXG4gICAgICBvdmVybGF5OiB0aGVtZUNvbG9ycy5vdmVybGF5LFxuICAgICAgZ3JvdXBDb2xvcjogdGhlbWVDb2xvcnMuZ3JvdXBDb2xvcixcbiAgICB9LFxuICAgIGhhc1RpbWVsaW5lOiBmYWxzZSxcbiAgICBoYXNUYXNrczogdHJ1ZSxcbiAgICBoYXNFZGdlczogZmFsc2UsXG4gICAgZHJhd1RpbWVNYXJrZXJzT25UYXNrczogZmFsc2UsXG4gICAgdGFza0xhYmVsOiB0YXNrTGFiZWwsXG4gICAgdGFza0hpZ2hsaWdodHM6IGNyaXRpY2FsUGF0aCxcbiAgICBmaWx0ZXJGdW5jOiBudWxsLFxuICAgIGdyb3VwQnlSZXNvdXJjZTogZ3JvdXBCeU9wdGlvbnNbZ3JvdXBCeU9wdGlvbnNJbmRleF0sXG4gIH07XG5cbiAgY29uc3Qgem9vbU9wdHM6IFJlbmRlck9wdGlvbnMgPSB7XG4gICAgZm9udFNpemVQeDogRk9OVF9TSVpFX1BYLFxuICAgIGhhc1RleHQ6IHRydWUsXG4gICAgZGlzcGxheVJhbmdlOiBkaXNwbGF5UmFuZ2UsXG4gICAgZGlzcGxheVJhbmdlVXNhZ2U6IFwicmVzdHJpY3RcIixcbiAgICBjb2xvcnM6IHtcbiAgICAgIHN1cmZhY2U6IHRoZW1lQ29sb3JzLnN1cmZhY2UsXG4gICAgICBvblN1cmZhY2U6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZSxcbiAgICAgIG9uU3VyZmFjZU11dGVkOiB0aGVtZUNvbG9ycy5vblN1cmZhY2VNdXRlZCxcbiAgICAgIG9uU3VyZmFjZUhpZ2hsaWdodDogdGhlbWVDb2xvcnMub25TdXJmYWNlU2Vjb25kYXJ5LFxuICAgICAgb3ZlcmxheTogdGhlbWVDb2xvcnMub3ZlcmxheSxcbiAgICAgIGdyb3VwQ29sb3I6IHRoZW1lQ29sb3JzLmdyb3VwQ29sb3IsXG4gICAgfSxcbiAgICBoYXNUaW1lbGluZTogdG9wVGltZWxpbmUsXG4gICAgaGFzVGFza3M6IHRydWUsXG4gICAgaGFzRWRnZXM6IHRydWUsXG4gICAgZHJhd1RpbWVNYXJrZXJzT25UYXNrczogdHJ1ZSxcbiAgICB0YXNrTGFiZWw6IHRhc2tMYWJlbCxcbiAgICB0YXNrSGlnaGxpZ2h0czogY3JpdGljYWxQYXRoLFxuICAgIGZpbHRlckZ1bmM6IG51bGwsXG4gICAgZ3JvdXBCeVJlc291cmNlOiBncm91cEJ5T3B0aW9uc1tncm91cEJ5T3B0aW9uc0luZGV4XSxcbiAgfTtcblxuICBjb25zdCB0aW1lbGluZU9wdHM6IFJlbmRlck9wdGlvbnMgPSB7XG4gICAgZm9udFNpemVQeDogRk9OVF9TSVpFX1BYLFxuICAgIGhhc1RleHQ6IHRydWUsXG4gICAgZGlzcGxheVJhbmdlOiBkaXNwbGF5UmFuZ2UsXG4gICAgZGlzcGxheVJhbmdlVXNhZ2U6IFwicmVzdHJpY3RcIixcbiAgICBjb2xvcnM6IHtcbiAgICAgIHN1cmZhY2U6IHRoZW1lQ29sb3JzLnN1cmZhY2UsXG4gICAgICBvblN1cmZhY2U6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZSxcbiAgICAgIG9uU3VyZmFjZU11dGVkOiB0aGVtZUNvbG9ycy5vblN1cmZhY2VNdXRlZCxcbiAgICAgIG9uU3VyZmFjZUhpZ2hsaWdodDogdGhlbWVDb2xvcnMub25TdXJmYWNlU2Vjb25kYXJ5LFxuICAgICAgb3ZlcmxheTogdGhlbWVDb2xvcnMub3ZlcmxheSxcbiAgICAgIGdyb3VwQ29sb3I6IHRoZW1lQ29sb3JzLmdyb3VwQ29sb3IsXG4gICAgfSxcbiAgICBoYXNUaW1lbGluZTogdHJ1ZSxcbiAgICBoYXNUYXNrczogZmFsc2UsXG4gICAgaGFzRWRnZXM6IHRydWUsXG4gICAgZHJhd1RpbWVNYXJrZXJzT25UYXNrczogdHJ1ZSxcbiAgICB0YXNrTGFiZWw6IHRhc2tMYWJlbCxcbiAgICB0YXNrSGlnaGxpZ2h0czogY3JpdGljYWxQYXRoLFxuICAgIGZpbHRlckZ1bmM6IG51bGwsXG4gICAgZ3JvdXBCeVJlc291cmNlOiBncm91cEJ5T3B0aW9uc1tncm91cEJ5T3B0aW9uc0luZGV4XSxcbiAgfTtcblxuICBwYWludE9uZUNoYXJ0KFwiI3pvb21lZFwiLCB6b29tT3B0cyk7XG4gIHBhaW50T25lQ2hhcnQoXCIjdGltZWxpbmVcIiwgdGltZWxpbmVPcHRzKTtcbiAgY29uc3QgcmV0ID0gcGFpbnRPbmVDaGFydChcIiNyYWRhclwiLCByYWRhck9wdHMpO1xuXG4gIGlmICghcmV0Lm9rKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHNjYWxlID0gcmV0LnZhbHVlO1xuICBjb25zb2xlLnRpbWVFbmQoXCJwYWludENoYXJ0XCIpO1xufTtcblxuY29uc3QgcGFpbnRPbmVDaGFydCA9IChcbiAgY2FudmFzSUQ6IHN0cmluZyxcbiAgb3B0czogUmVuZGVyT3B0aW9uc1xuKTogUmVzdWx0PFNjYWxlPiA9PiB7XG4gIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTENhbnZhc0VsZW1lbnQ+KGNhbnZhc0lEKSE7XG4gIGNvbnN0IHBhcmVudCA9IGNhbnZhcyEucGFyZW50RWxlbWVudCE7XG4gIGNvbnN0IHJhdGlvID0gd2luZG93LmRldmljZVBpeGVsUmF0aW87XG4gIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gcGFyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICBjb25zdCBjYW52YXNXaWR0aCA9IE1hdGguY2VpbCh3aWR0aCAqIHJhdGlvKTtcbiAgY29uc3QgY2FudmFzSGVpZ2h0ID0gTWF0aC5jZWlsKGhlaWdodCAqIHJhdGlvKTtcbiAgY2FudmFzLndpZHRoID0gY2FudmFzV2lkdGg7XG4gIGNhbnZhcy5oZWlnaHQgPSBjYW52YXNIZWlnaHQ7XG4gIGNhbnZhcy5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YDtcbiAgY2FudmFzLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XG5cbiAgLy8gTm93IHVwZGF0ZSB0aGUgY2FudmFzIGhlaWdodCBzbyB0aGF0IGl0IGZpdHMgdGhlIGNoYXJ0IGJlaW5nIGRyYXduLlxuICAvLyBUT0RPIFR1cm4gdGhpcyBpbnRvIGFuIG9wdGlvbiBzaW5jZSB3ZSB3b24ndCBhbHdheXMgd2FudCB0aGlzLlxuXG4gIGlmICgxKSB7XG4gICAgY29uc3QgbmV3SGVpZ2h0ID0gc3VnZ2VzdGVkQ2FudmFzSGVpZ2h0KFxuICAgICAgY2FudmFzLFxuICAgICAgc3BhbnMsXG4gICAgICBvcHRzLFxuICAgICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggKyAyIC8vIFRPRE8gLSBXaHkgZG8gd2UgbmVlZCB0aGUgKzIgaGVyZSE/XG4gICAgKTtcbiAgICBjYW52YXMuaGVpZ2h0ID0gbmV3SGVpZ2h0O1xuICAgIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBgJHtuZXdIZWlnaHQgLyByYXRpb31weGA7XG4gIH1cbiAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKSE7XG4gIGN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcblxuICByZXR1cm4gcmVuZGVyVGFza3NUb0NhbnZhcyhwYXJlbnQsIGNhbnZhcywgY3R4LCBwbGFuLCBzcGFucywgb3B0cyk7XG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIENyaXRpY2FsUGF0aEVudHJ5IHtcbiAgY291bnQ6IG51bWJlcjtcbiAgdGFza3M6IG51bWJlcltdO1xuICBkdXJhdGlvbnM6IG51bWJlcltdO1xufVxuXG5jb25zdCBzaW11bGF0ZSA9ICgpID0+IHtcbiAgLy8gU2ltdWxhdGUgdGhlIHVuY2VydGFpbnR5IGluIHRoZSBwbGFuIGFuZCBnZW5lcmF0ZSBwb3NzaWJsZSBhbHRlcm5hdGVcbiAgLy8gY3JpdGljYWwgcGF0aHMuXG4gIGNvbnN0IE1BWF9SQU5ET00gPSAxMDAwO1xuICBjb25zdCBOVU1fU0lNVUxBVElPTl9MT09QUyA9IDEwMDtcblxuICBjb25zdCBhbGxDcml0aWNhbFBhdGhzID0gbmV3IE1hcDxzdHJpbmcsIENyaXRpY2FsUGF0aEVudHJ5PigpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgTlVNX1NJTVVMQVRJT05fTE9PUFM7IGkrKykge1xuICAgIGNvbnN0IGR1cmF0aW9ucyA9IHBsYW4uY2hhcnQuVmVydGljZXMubWFwKCh0OiBUYXNrKSA9PiB7XG4gICAgICBjb25zdCByYXdEdXJhdGlvbiA9IG5ldyBKYWNvYmlhbihcbiAgICAgICAgdC5kdXJhdGlvbixcbiAgICAgICAgdC5nZXRSZXNvdXJjZShcIlVuY2VydGFpbnR5XCIpIGFzIFVuY2VydGFpbnR5XG4gICAgICApLnNhbXBsZShybmRJbnQoTUFYX1JBTkRPTSkgLyBNQVhfUkFORE9NKTtcbiAgICAgIHJldHVybiBwcmVjaXNpb24ucm91bmQocmF3RHVyYXRpb24pO1xuICAgIH0pO1xuXG4gICAgY29uc3Qgc2xhY2tzUmV0ID0gQ29tcHV0ZVNsYWNrKFxuICAgICAgcGxhbi5jaGFydCxcbiAgICAgICh0OiBUYXNrLCB0YXNrSW5kZXg6IG51bWJlcikgPT4gZHVyYXRpb25zW3Rhc2tJbmRleF0sXG4gICAgICBwcmVjaXNpb24ucm91bmRlcigpXG4gICAgKTtcbiAgICBpZiAoIXNsYWNrc1JldC5vaykge1xuICAgICAgdGhyb3cgc2xhY2tzUmV0LmVycm9yO1xuICAgIH1cbiAgICBjb25zdCBjcml0aWNhbFBhdGggPSBDcml0aWNhbFBhdGgoc2xhY2tzUmV0LnZhbHVlLCBwcmVjaXNpb24ucm91bmRlcigpKTtcbiAgICBjb25zdCBjcml0aWNhbFBhdGhBc1N0cmluZyA9IGAke2NyaXRpY2FsUGF0aH1gO1xuICAgIGxldCBwYXRoRW50cnkgPSBhbGxDcml0aWNhbFBhdGhzLmdldChjcml0aWNhbFBhdGhBc1N0cmluZyk7XG4gICAgaWYgKHBhdGhFbnRyeSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBwYXRoRW50cnkgPSB7XG4gICAgICAgIGNvdW50OiAwLFxuICAgICAgICB0YXNrczogY3JpdGljYWxQYXRoLFxuICAgICAgICBkdXJhdGlvbnM6IGR1cmF0aW9ucyxcbiAgICAgIH07XG4gICAgICBhbGxDcml0aWNhbFBhdGhzLnNldChjcml0aWNhbFBhdGhBc1N0cmluZywgcGF0aEVudHJ5KTtcbiAgICB9XG4gICAgcGF0aEVudHJ5LmNvdW50Kys7XG4gIH1cblxuICBsZXQgZGlzcGxheSA9IFwiXCI7XG4gIGFsbENyaXRpY2FsUGF0aHMuZm9yRWFjaCgodmFsdWU6IENyaXRpY2FsUGF0aEVudHJ5LCBrZXk6IHN0cmluZykgPT4ge1xuICAgIGRpc3BsYXkgPVxuICAgICAgZGlzcGxheSArXG4gICAgICBgXFxuIDxsaSBkYXRhLWtleT0ke2tleX0+JHt2YWx1ZS5jb3VudH0gOiAke2tleX0gOiAke3ZhbHVlLmR1cmF0aW9ucy5qb2luKFwiLCBcIil9PC9saT5gO1xuICB9KTtcblxuICBjb25zdCBjcml0aWFsUGF0aHMgPVxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTFVMaXN0RWxlbWVudD4oXCIjY3JpdGljYWxQYXRoc1wiKSE7XG4gIGNyaXRpYWxQYXRocy5pbm5lckhUTUwgPSBkaXNwbGF5O1xuXG4gIC8vIEVuYWJsZSBjbGlja2luZyBvbiBhbHRlcm5hdGUgY3JpdGljYWwgcGF0aHMuXG4gIGNyaXRpYWxQYXRocy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICBjb25zdCBjcml0aWNhbFBhdGhFbnRyeSA9IGFsbENyaXRpY2FsUGF0aHMuZ2V0KFxuICAgICAgKGUudGFyZ2V0IGFzIEhUTUxMSUVsZW1lbnQpLmRhdGFzZXQua2V5IVxuICAgICkhO1xuICAgIGNyaXRpY2FsUGF0aEVudHJ5LmR1cmF0aW9ucy5mb3JFYWNoKFxuICAgICAgKGR1cmF0aW9uOiBudW1iZXIsIHRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgIHBsYW4uY2hhcnQuVmVydGljZXNbdGFza0luZGV4XS5kdXJhdGlvbiA9IGR1cmF0aW9uO1xuICAgICAgfVxuICAgICk7XG4gICAgcmVjYWxjdWxhdGVTcGFuKCk7XG4gICAgcGFpbnRDaGFydCgpO1xuICB9KTtcblxuICAvLyBHZW5lcmF0ZSBhIHRhYmxlIG9mIHRhc2tzIG9uIHRoZSBjcml0aWNhbCBwYXRoLCBzb3J0ZWQgYnkgZHVyYXRpb24sIGFsb25nXG4gIC8vIHdpdGggdGhlaXIgcGVyY2VudGFnZSBjaGFuY2Ugb2YgYXBwZWFyaW5nIG9uIHRoZSBjcml0aWNhbCBwYXRoLlxuXG4gIGludGVyZmFjZSBDcml0aWNhbFBhdGhUYXNrRW50cnkge1xuICAgIHRhc2tJbmRleDogbnVtYmVyO1xuICAgIGR1cmF0aW9uOiBudW1iZXI7XG4gICAgbnVtVGltZXNBcHBlYXJlZDogbnVtYmVyO1xuICB9XG5cbiAgY29uc3QgY3JpdGlhbFRhc2tzOiBNYXA8bnVtYmVyLCBDcml0aWNhbFBhdGhUYXNrRW50cnk+ID0gbmV3IE1hcCgpO1xuXG4gIGFsbENyaXRpY2FsUGF0aHMuZm9yRWFjaCgodmFsdWU6IENyaXRpY2FsUGF0aEVudHJ5KSA9PiB7XG4gICAgdmFsdWUudGFza3MuZm9yRWFjaCgodGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGxldCB0YXNrRW50cnkgPSBjcml0aWFsVGFza3MuZ2V0KHRhc2tJbmRleCk7XG4gICAgICBpZiAodGFza0VudHJ5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGFza0VudHJ5ID0ge1xuICAgICAgICAgIHRhc2tJbmRleDogdGFza0luZGV4LFxuICAgICAgICAgIGR1cmF0aW9uOiBwbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tJbmRleF0uZHVyYXRpb24sXG4gICAgICAgICAgbnVtVGltZXNBcHBlYXJlZDogMCxcbiAgICAgICAgfTtcbiAgICAgICAgY3JpdGlhbFRhc2tzLnNldCh0YXNrSW5kZXgsIHRhc2tFbnRyeSk7XG4gICAgICB9XG4gICAgICB0YXNrRW50cnkubnVtVGltZXNBcHBlYXJlZCArPSB2YWx1ZS5jb3VudDtcbiAgICB9KTtcbiAgfSk7XG5cbiAgY29uc3QgY3JpdGljYWxUYXNrc0R1cmF0aW9uRGVzY2VuZGluZyA9IFsuLi5jcml0aWFsVGFza3MudmFsdWVzKCldLnNvcnQoXG4gICAgKGE6IENyaXRpY2FsUGF0aFRhc2tFbnRyeSwgYjogQ3JpdGljYWxQYXRoVGFza0VudHJ5KTogbnVtYmVyID0+IHtcbiAgICAgIHJldHVybiBiLmR1cmF0aW9uIC0gYS5kdXJhdGlvbjtcbiAgICB9XG4gICk7XG5cbiAgbGV0IGNyaXRpYWxUYXNrc1RhYmxlID0gY3JpdGljYWxUYXNrc0R1cmF0aW9uRGVzY2VuZGluZ1xuICAgIC5tYXAoXG4gICAgICAodGFza0VudHJ5OiBDcml0aWNhbFBhdGhUYXNrRW50cnkpID0+IGA8dHI+XG4gIDx0ZD4ke3BsYW4uY2hhcnQuVmVydGljZXNbdGFza0VudHJ5LnRhc2tJbmRleF0ubmFtZX08L3RkPlxuICA8dGQ+JHt0YXNrRW50cnkuZHVyYXRpb259PC90ZD5cbiAgPHRkPiR7TWF0aC5mbG9vcigoMTAwICogdGFza0VudHJ5Lm51bVRpbWVzQXBwZWFyZWQpIC8gTlVNX1NJTVVMQVRJT05fTE9PUFMpfTwvdGQ+XG48L3RyPmBcbiAgICApXG4gICAgLmpvaW4oXCJcXG5cIik7XG4gIGNyaXRpYWxUYXNrc1RhYmxlID1cbiAgICBgPHRyPjx0aD5OYW1lPC90aD48dGg+RHVyYXRpb248L3RoPjx0aD4lPC90aD48L3RyPlxcbmAgKyBjcml0aWFsVGFza3NUYWJsZTtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjcml0aWNhbFRhc2tzXCIpIS5pbm5lckhUTUwgPSBjcml0aWFsVGFza3NUYWJsZTtcblxuICAvLyBTaG93IGFsbCB0YXNrcyB0aGF0IGNvdWxkIGJlIG9uIHRoZSBjcml0aWNhbCBwYXRoLlxuXG4gIHJlY2FsY3VsYXRlU3BhbigpO1xuICBjcml0aWNhbFBhdGggPSBjcml0aWNhbFRhc2tzRHVyYXRpb25EZXNjZW5kaW5nLm1hcChcbiAgICAodGFza0VudHJ5OiBDcml0aWNhbFBhdGhUYXNrRW50cnkpID0+IHRhc2tFbnRyeS50YXNrSW5kZXhcbiAgKTtcbiAgcGFpbnRDaGFydCgpO1xuXG4gIC8vIFBvcHVsYXRlIHRoZSBkb3dubG9hZCBsaW5rLlxuXG4gIGNvbnN0IGRvd25sb2FkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MTGlua0VsZW1lbnQ+KFwiI2Rvd25sb2FkXCIpITtcbiAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkocGxhbiwgbnVsbCwgXCIgIFwiKSk7XG4gIGNvbnN0IGRvd25sb2FkQmxvYiA9IG5ldyBCbG9iKFtKU09OLnN0cmluZ2lmeShwbGFuLCBudWxsLCBcIiAgXCIpXSwge1xuICAgIHR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICB9KTtcbiAgZG93bmxvYWQuaHJlZiA9IFVSTC5jcmVhdGVPYmplY3RVUkwoZG93bmxvYWRCbG9iKTtcbn07XG5cbi8vIFJlYWN0IHRvIHRoZSB1cGxvYWQgaW5wdXQuXG5jb25zdCBmaWxlVXBsb2FkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MSW5wdXRFbGVtZW50PihcIiNmaWxlLXVwbG9hZFwiKSE7XG5maWxlVXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgYXN5bmMgKCkgPT4ge1xuICBjb25zdCBqc29uID0gYXdhaXQgZmlsZVVwbG9hZC5maWxlcyFbMF0udGV4dCgpO1xuICBjb25zdCByZXQgPSBGcm9tSlNPTihqc29uKTtcbiAgaWYgKCFyZXQub2spIHtcbiAgICBjb25zb2xlLmxvZyhyZXQuZXJyb3IpO1xuICAgIHRocm93IHJldC5lcnJvcjtcbiAgfVxuICBwbGFuID0gcmV0LnZhbHVlO1xuICBncm91cEJ5T3B0aW9ucyA9IFtcIlwiLCAuLi5PYmplY3Qua2V5cyhwbGFuLnJlc291cmNlRGVmaW5pdGlvbnMpXTtcbiAgcmVjYWxjdWxhdGVTcGFuKCk7XG4gIHNpbXVsYXRlKCk7XG4gIGNvbnN0IG1hcHMgPSBlZGdlc0J5U3JjQW5kRHN0VG9NYXAocGxhbi5jaGFydC5FZGdlcyk7XG4gIGNvbnNvbGUubG9nKG1hcHMpO1xuICBjb25zb2xlLmxvZyhwbGFuKTtcbiAgcGFpbnRDaGFydCgpO1xufSk7XG5cbnNpbXVsYXRlKCk7XG5wYWludENoYXJ0KCk7XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBwYWludENoYXJ0KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7OztBQWlCTyxNQUFNLGVBQU4sTUFBbUI7QUFBQSxJQUN4QixJQUFZO0FBQUEsSUFDWixJQUFZO0FBQUEsSUFFWixZQUFZLElBQVksR0FBRyxJQUFZLEdBQUc7QUFDeEMsV0FBSyxJQUFJO0FBQ1QsV0FBSyxJQUFJO0FBQUEsSUFDWDtBQUFBLElBRUEsTUFBTSxLQUE0QjtBQUNoQyxhQUFPLElBQUksTUFBTSxLQUFLLEtBQUssSUFBSSxNQUFNLEtBQUs7QUFBQSxJQUM1QztBQUFBLElBRUEsU0FBaUM7QUFDL0IsYUFBTztBQUFBLFFBQ0wsR0FBRyxLQUFLO0FBQUEsUUFDUixHQUFHLEtBQUs7QUFBQSxNQUNWO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFrQk8sTUFBTSxrQkFBa0IsQ0FBQyxVQUFxQztBQUNuRSxVQUFNLE1BQU0sb0JBQUksSUFBbUI7QUFFbkMsVUFBTSxRQUFRLENBQUMsTUFBb0I7QUFDakMsWUFBTSxNQUFNLElBQUksSUFBSSxFQUFFLENB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SUFBSTtBQUN6QixRQUFJLENBQUMsSUFBSSxJQUFJO0FBQ1gsY0FBUSxJQUFJLElBQUksS0FBSztBQUNyQixZQUFNLElBQUk7QUFBQSxJQUNaO0FBQ0EsV0FBTyxJQUFJO0FBQ1gscUJBQWlCLENBQUMsSUFBSSxHQUFHLE9BQU8sS0FBSyxLQUFLLG1CQUFtQixDQUFDO0FBQzlELG9CQUFnQjtBQUNoQixhQUFTO0FBQ1QsVUFBTSxPQUFPLHNCQUFzQixLQUFLLE1BQU0sS0FBSztBQUNuRCxZQUFRLElBQUksSUFBSTtBQUNoQixZQUFRLElBQUksSUFBSTtBQUNoQixlQUFXO0FBQUEsRUFDYixDQUFDO0FBRUQsV0FBUztBQUNULGFBQVc7QUFDWCxTQUFPLGlCQUFpQixVQUFVLFVBQVU7IiwKICAibmFtZXMiOiBbInBsYW4iLCAicmVzIiwgIm9wcyIsICJwbGFuIiwgInBsYW4iLCAicGxhbiIsICJwbGFuIiwgIm9rIiwgInByZWNpc2lvbiIsICJwcmVjaXNpb24iLCAicGxhbiIsICJzcGFucyIsICJwbGFuIiwgInJlc291cmNlRGVmaW5pdGlvbiIsICJzY2FsZSIsICJyb3ciLCAic2xhY2tzIiwgImNyaXRpY2FsUGF0aCJdCn0K
