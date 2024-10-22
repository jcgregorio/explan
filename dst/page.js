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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2RhZy9kYWcudHMiLCAiLi4vc3JjL3Jlc3VsdC50cyIsICIuLi9zcmMvb3BzL29wcy50cyIsICIuLi9zcmMvb3BzL2NoYXJ0LnRzIiwgIi4uL3NyYy9vcHMvbWV0cmljcy50cyIsICIuLi9zcmMvcmVzb3VyY2VzL3Jlc291cmNlcy50cyIsICIuLi9zcmMvb3BzL3Jlc291cmNlcy50cyIsICIuLi9zcmMvZGFnL2FsZ29yaXRobXMvdG9wb3NvcnQudHMiLCAiLi4vc3JjL2NoYXJ0L2NoYXJ0LnRzIiwgIi4uL3NyYy9wcmVjaXNpb24vcHJlY2lzaW9uLnRzIiwgIi4uL3NyYy9tZXRyaWNzL3JhbmdlLnRzIiwgIi4uL3NyYy9tZXRyaWNzL21ldHJpY3MudHMiLCAiLi4vc3JjL3N0YXRzL2NkZi90cmlhbmd1bGFyL3RyaWFuZ3VsYXIudHMiLCAiLi4vc3JjL3N0YXRzL2NkZi90cmlhbmd1bGFyL2phY29iaWFuLnRzIiwgIi4uL3NyYy9wbGFuL3BsYW4udHMiLCAiLi4vc3JjL3JlbmRlcmVyL3NjYWxlL3BvaW50LnRzIiwgIi4uL3NyYy9yZW5kZXJlci9tb3VzZW1vdmUvbW91c2Vtb3ZlLnRzIiwgIi4uL3NyYy9yZW5kZXJlci9yYW5nZS9yYW5nZS50cyIsICIuLi9zcmMvcmVuZGVyZXIvc2NhbGUvc2NhbGUudHMiLCAiLi4vc3JjL3JlbmRlcmVyL3JlbmRlcmVyLnRzIiwgIi4uL3NyYy9zbGFjay9zbGFjay50cyIsICIuLi9zcmMvc3R5bGUvdGhlbWUvdGhlbWUudHMiLCAiLi4vc3JjL3N0eWxlL3RvZ2dsZXIvdG9nZ2xlci50cyIsICIuLi9zcmMvcGFnZS50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqIE9uZSB2ZXJ0ZXggb2YgYSBncmFwaC4gKi9cbmV4cG9ydCB0eXBlIFZlcnRleCA9IG9iamVjdDtcblxuLyoqIEV2ZXJ5IFZlcnRleCBpbiBhIGdyYXBoLiAqL1xuZXhwb3J0IHR5cGUgVmVydGljZXMgPSBWZXJ0ZXhbXTtcblxuLyoqIEEgc3Vic2V0IG9mIFZlcnRpY2VzIHJlZmVycmVkIHRvIGJ5IHRoZWlyIGluZGV4IG51bWJlci4gKi9cbmV4cG9ydCB0eXBlIFZlcnRleEluZGljZXMgPSBudW1iZXJbXTtcblxuZXhwb3J0IGludGVyZmFjZSBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkIHtcbiAgaTogbnVtYmVyO1xuICBqOiBudW1iZXI7XG59XG5cbi8qKiBPbmUgZWRnZSBvZiBhIGdyYXBoLCB3aGljaCBpcyBhIGRpcmVjdGVkIGNvbm5lY3Rpb24gZnJvbSB0aGUgaSd0aCBWZXJ0ZXggdG9cbnRoZSBqJ3RoIFZlcnRleCwgd2hlcmUgdGhlIFZlcnRleCBpcyBzdG9yZWQgaW4gYSBWZXJ0aWNlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIERpcmVjdGVkRWRnZSB7XG4gIGk6IG51bWJlciA9IDA7XG4gIGo6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoaTogbnVtYmVyID0gMCwgajogbnVtYmVyID0gMCkge1xuICAgIHRoaXMuaSA9IGk7XG4gICAgdGhpcy5qID0gajtcbiAgfVxuXG4gIGVxdWFsKHJoczogRGlyZWN0ZWRFZGdlKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHJocy5pID09PSB0aGlzLmkgJiYgcmhzLmogPT09IHRoaXMuajtcbiAgfVxuXG4gIHRvSlNPTigpOiBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgaTogdGhpcy5pLFxuICAgICAgajogdGhpcy5qLFxuICAgIH07XG4gIH1cbn1cblxuLyoqIEV2ZXJ5IEVnZGUgaW4gYSBncmFwaC4gKi9cbmV4cG9ydCB0eXBlIEVkZ2VzID0gRGlyZWN0ZWRFZGdlW107XG5cbi8qKiBBIGdyYXBoIGlzIGp1c3QgYSBjb2xsZWN0aW9uIG9mIFZlcnRpY2VzIGFuZCBFZGdlcyBiZXR3ZWVuIHRob3NlIHZlcnRpY2VzLiAqL1xuZXhwb3J0IHR5cGUgRGlyZWN0ZWRHcmFwaCA9IHtcbiAgVmVydGljZXM6IFZlcnRpY2VzO1xuICBFZGdlczogRWRnZXM7XG59O1xuXG4vKipcbiBHcm91cHMgdGhlIEVkZ2VzIGJ5IHRoZWlyIGBpYCB2YWx1ZS5cblxuIEBwYXJhbSBlZGdlcyAtIEFsbCB0aGUgRWdlcyBpbiBhIERpcmVjdGVkR3JhcGguXG4gQHJldHVybnMgQSBtYXAgZnJvbSB0aGUgVmVydGV4IGluZGV4IHRvIGFsbCB0aGUgRWRnZXMgdGhhdCBzdGFydCBhdFxuICAgYXQgdGhhdCBWZXJ0ZXggaW5kZXguXG4gKi9cbmV4cG9ydCBjb25zdCBlZGdlc0J5U3JjVG9NYXAgPSAoZWRnZXM6IEVkZ2VzKTogTWFwPG51bWJlciwgRWRnZXM+ID0+IHtcbiAgY29uc3QgcmV0ID0gbmV3IE1hcDxudW1iZXIsIEVkZ2VzPigpO1xuXG4gIGVkZ2VzLmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgIGNvbnN0IGFyciA9IHJldC5nZXQoZS5pKSB8fCBbXTtcbiAgICBhcnIucHVzaChlKTtcbiAgICByZXQuc2V0KGUuaSwgYXJyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJldDtcbn07XG5cbi8qKlxuICAgR3JvdXBzIHRoZSBFZGdlcyBieSB0aGVpciBgamAgdmFsdWUuXG4gIFxuICAgQHBhcmFtIGVkZ2VzIC0gQWxsIHRoZSBFZGdlcyBpbiBhIERpcmVjdGVkR3JhcGguXG4gICBAcmV0dXJucyBBIG1hcCBmcm9tIHRoZSBWZXJ0ZXggaW5kZXggdG8gYWxsIHRoZSBFZGdlcyB0aGF0IGVuZCBhdFxuICAgICBhdCB0aGF0IFZlcnRleCBpbmRleC5cbiAgICovXG5cbmV4cG9ydCBjb25zdCBlZGdlc0J5RHN0VG9NYXAgPSAoZWRnZXM6IEVkZ2VzKTogTWFwPG51bWJlciwgRWRnZXM+ID0+IHtcbiAgY29uc3QgcmV0ID0gbmV3IE1hcDxudW1iZXIsIEVkZ2VzPigpO1xuXG4gIGVkZ2VzLmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgIGNvbnN0IGFyciA9IHJldC5nZXQoZS5qKSB8fCBbXTtcbiAgICBhcnIucHVzaChlKTtcbiAgICByZXQuc2V0KGUuaiwgYXJyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJldDtcbn07XG5cbmV4cG9ydCB0eXBlIFNyY0FuZERzdFJldHVybiA9IHtcbiAgYnlTcmM6IE1hcDxudW1iZXIsIEVkZ2VzPjtcbiAgYnlEc3Q6IE1hcDxudW1iZXIsIEVkZ2VzPjtcbn07XG5cbmV4cG9ydCBjb25zdCBlZGdlc0J5U3JjQW5kRHN0VG9NYXAgPSAoZWRnZXM6IEVkZ2VzKTogU3JjQW5kRHN0UmV0dXJuID0+IHtcbiAgY29uc3QgcmV0ID0ge1xuICAgIGJ5U3JjOiBuZXcgTWFwPG51bWJlciwgRWRnZXM+KCksXG4gICAgYnlEc3Q6IG5ldyBNYXA8bnVtYmVyLCBFZGdlcz4oKSxcbiAgfTtcblxuICBlZGdlcy5mb3JFYWNoKChlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICBsZXQgYXJyID0gcmV0LmJ5U3JjLmdldChlLmkpIHx8IFtdO1xuICAgIGFyci5wdXNoKGUpO1xuICAgIHJldC5ieVNyYy5zZXQoZS5pLCBhcnIpO1xuICAgIGFyciA9IHJldC5ieURzdC5nZXQoZS5qKSB8fCBbXTtcbiAgICBhcnIucHVzaChlKTtcbiAgICByZXQuYnlEc3Quc2V0KGUuaiwgYXJyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJldDtcbn07XG4iLCAiLyoqIFJlc3VsdCBhbGxvd3MgZWFzaWVyIGhhbmRsaW5nIG9mIHJldHVybmluZyBlaXRoZXIgYW4gZXJyb3Igb3IgYSB2YWx1ZSBmcm9tIGFcbiAqIGZ1bmN0aW9uLiAqL1xuZXhwb3J0IHR5cGUgUmVzdWx0PFQ+ID0geyBvazogdHJ1ZTsgdmFsdWU6IFQgfSB8IHsgb2s6IGZhbHNlOyBlcnJvcjogRXJyb3IgfTtcblxuZXhwb3J0IGZ1bmN0aW9uIG9rPFQ+KHZhbHVlOiBUKTogUmVzdWx0PFQ+IHtcbiAgcmV0dXJuIHsgb2s6IHRydWUsIHZhbHVlOiB2YWx1ZSB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXJyb3I8VD4odmFsdWU6IHN0cmluZyB8IEVycm9yKTogUmVzdWx0PFQ+IHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IG5ldyBFcnJvcih2YWx1ZSkgfTtcbiAgfVxuICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiB2YWx1ZSB9O1xufVxuIiwgImltcG9ydCB7IFJlc3VsdCwgb2sgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhbi50c1wiO1xuXG4vLyBPcGVyYXRpb25zIG9uIFBsYW5zLiBOb3RlIHRoZXkgYXJlIHJldmVyc2libGUsIHNvIHdlIGNhbiBoYXZlIGFuICd1bmRvJyBsaXN0LlxuXG4vLyBBbHNvLCBzb21lIG9wZXJhdGlvbnMgbWlnaHQgaGF2ZSAncGFydGlhbHMnLCBpLmUuIHJldHVybiBhIGxpc3Qgb2YgdmFsaWRcbi8vIG9wdGlvbnMgdGhhdCBjYW4gYmUgcGFzc2VkIHRvIHRoZSBvcGVyYXRpb24uIEZvciBleGFtcGxlLCBhZGRpbmcgYVxuLy8gcHJlZGVjZXNzb3IgY291bGQgbGlzdCBhbGwgdGhlIFRhc2tzIHRoYXQgd291bGQgbm90IGZvcm0gYSBsb29wLCBpLmUuIGV4Y2x1ZGVcbi8vIGFsbCBkZXNjZW5kZW50cywgYW5kIHRoZSBUYXNrIGl0c2VsZiwgZnJvbSB0aGUgbGlzdCBvZiBvcHRpb25zLlxuLy9cbi8vICogQ2hhbmdlIHN0cmluZyB2YWx1ZSBpbiBhIFRhc2suXG4vLyAqIENoYW5nZSBkdXJhdGlvbiB2YWx1ZSBpbiBhIFRhc2suXG4vLyAqIEluc2VydCBuZXcgZW1wdHkgVGFzayBhZnRlciBJbmRleC5cbi8vICogU3BsaXQgYSBUYXNrLiAoUHJlZGVjZXNzb3IgdGFrZXMgYWxsIGluY29taW5nIGVkZ2VzLCBzb3VyY2UgdGFza3MgYWxsIG91dGdvaW5nIGVkZ2VzKS5cbi8vXG4vLyAqIER1cGxpY2F0ZSBhIFRhc2sgKGFsbCBlZGdlcyBhcmUgZHVwbGljYXRlZCBmcm9tIHRoZSBzb3VyY2UgVGFzaykuXG4vLyAqIERlbGV0ZSBwcmVkZWNlc3NvciB0byBhIFRhc2suXG4vLyAqIERlbGV0ZSBzdWNjZXNzb3IgdG8gYSBUYXNrLlxuLy8gKiBEZWxldGUgYSBUYXNrLlxuXG4vLyBOZWVkIFVuZG8vUmVkbyBTdGFja3MuXG4vLyBUaGVzZSByZWNvcmQgdGhlIHN1Yi1vcHMgZm9yIGVhY2ggbGFyZ2Ugb3AuIEUuZy4gYW4gaW5zZXJ0IHRhc2sgb3AgaXMgbWFkZVxuLy8gb2YgdGhyZWUgc3ViLW9wczpcbi8vICAgIDEuIGluc2VydCB0YXNrIGludG8gVmVydGljZXMgYW5kIHJlbnVtYmVyIEVkZ2VzXG4vLyAgICAyLiBBZGQgZWRnZSBmcm9tIFN0YXJ0IHRvIE5ldyBUYXNrXG4vLyAgICAzLiBBZGQgZWRnZSBmcm9tIE5ldyBUYXNrIHRvIEZpbmlzaFxuLy9cbi8vIEVhY2ggc3ViLW9wOlxuLy8gICAgMS4gUmVjb3JkcyBhbGwgdGhlIGluZm8gaXQgbmVlZHMgdG8gd29yay5cbi8vICAgIDIuIENhbiBiZSBcImFwcGxpZWRcIiB0byBhIFBsYW4uXG4vLyAgICAzLiBDYW4gZ2VuZXJhdGUgaXRzIGludmVyc2Ugc3ViLW9wLlxuXG4vLyBUaGUgcmVzdWx0cyBmcm9tIGFwcGx5aW5nIGEgU3ViT3AuIFRoaXMgaXMgdGhlIG9ubHkgd2F5IHRvIGdldCB0aGUgaW52ZXJzZSBvZlxuLy8gYSBTdWJPcCBzaW5jZSB0aGUgU3ViT3AgaW52ZXJzZSBtaWdodCBkZXBlbmQgb24gdGhlIHN0YXRlIG9mIHRoZSBQbGFuIGF0IHRoZVxuLy8gdGltZSB0aGUgU3ViT3Agd2FzIGFwcGxpZWQuXG5leHBvcnQgaW50ZXJmYWNlIFN1Yk9wUmVzdWx0IHtcbiAgcGxhbjogUGxhbjtcbiAgaW52ZXJzZTogU3ViT3A7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3ViT3Age1xuICAvLyBJZiB0aGUgYXBwbHkgcmV0dXJucyBhbiBlcnJvciBpdCBpcyBndWFyYW50ZWVkIG5vdCB0byBoYXZlIG1vZGlmaWVkIHRoZVxuICAvLyBQbGFuLlxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0Pjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBPcFJlc3VsdCB7XG4gIHBsYW46IFBsYW47XG4gIGludmVyc2U6IE9wO1xufVxuXG4vLyBPcCBhcmUgb3BlcmF0aW9ucyBhcmUgYXBwbGllZCB0byBtYWtlIGNoYW5nZXMgdG8gYSBQbGFuLlxuZXhwb3J0IGNsYXNzIE9wIHtcbiAgc3ViT3BzOiBTdWJPcFtdID0gW107XG5cbiAgY29uc3RydWN0b3Ioc3ViT3BzOiBTdWJPcFtdKSB7XG4gICAgdGhpcy5zdWJPcHMgPSBzdWJPcHM7XG4gIH1cblxuICAvLyBSZXZlcnRzIGFsbCBTdWJPcHMgdXAgdG8gdGhlIGdpdmVuIGluZGV4LlxuICBhcHBseUFsbEludmVyc2VTdWJPcHNUb1BsYW4oXG4gICAgcGxhbjogUGxhbixcbiAgICBpbnZlcnNlU3ViT3BzOiBTdWJPcFtdXG4gICk6IFJlc3VsdDxQbGFuPiB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnZlcnNlU3ViT3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlID0gaW52ZXJzZVN1Yk9wc1tpXS5hcHBseShwbGFuKTtcbiAgICAgIGlmICghZS5vaykge1xuICAgICAgICByZXR1cm4gZTtcbiAgICAgIH1cbiAgICAgIHBsYW4gPSBlLnZhbHVlLnBsYW47XG4gICAgfVxuXG4gICAgcmV0dXJuIG9rKHBsYW4pO1xuICB9XG5cbiAgLy8gQXBwbGllcyB0aGUgT3AgdG8gYSBQbGFuLlxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PE9wUmVzdWx0PiB7XG4gICAgY29uc3QgaW52ZXJzZVN1Yk9wczogU3ViT3BbXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zdWJPcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGUgPSB0aGlzLnN1Yk9wc1tpXS5hcHBseShwbGFuKTtcbiAgICAgIGlmICghZS5vaykge1xuICAgICAgICAvLyBSZXZlcnQgYWxsIHRoZSBTdWJPcHMgYXBwbGllZCB1cCB0byB0aGlzIHBvaW50IHRvIGdldCB0aGUgUGxhbiBiYWNrIGluIGFcbiAgICAgICAgLy8gZ29vZCBwbGFjZS5cbiAgICAgICAgY29uc3QgcmV2ZXJ0RXJyID0gdGhpcy5hcHBseUFsbEludmVyc2VTdWJPcHNUb1BsYW4ocGxhbiwgaW52ZXJzZVN1Yk9wcyk7XG4gICAgICAgIGlmICghcmV2ZXJ0RXJyLm9rKSB7XG4gICAgICAgICAgcmV0dXJuIHJldmVydEVycjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZTtcbiAgICAgIH1cbiAgICAgIHBsYW4gPSBlLnZhbHVlLnBsYW47XG4gICAgICBpbnZlcnNlU3ViT3BzLnVuc2hpZnQoZS52YWx1ZS5pbnZlcnNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IG5ldyBPcChpbnZlcnNlU3ViT3BzKSxcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBBbGxPcHNSZXN1bHQgPSB7XG4gIG9wczogT3BbXTtcbiAgcGxhbjogUGxhbjtcbn07XG5cbmNvbnN0IGFwcGx5QWxsSW52ZXJzZU9wc1RvUGxhbiA9IChpbnZlcnNlczogT3BbXSwgcGxhbjogUGxhbik6IFJlc3VsdDxQbGFuPiA9PiB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaW52ZXJzZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCByZXMgPSBpbnZlcnNlc1tpXS5hcHBseShwbGFuKTtcbiAgICBpZiAoIXJlcy5vaykge1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgcGxhbiA9IHJlcy52YWx1ZS5wbGFuO1xuICB9XG5cbiAgcmV0dXJuIG9rKHBsYW4pO1xufTtcblxuLy8gQ29udmVuaWVuY2UgZnVuY3Rpb24gZm9yIGFwcGx5aW5nIG11bHRpcGxlIE9wcyB0byBhIHBsYW4sIHVzZWQgbW9zdGx5IGZvclxuLy8gdGVzdGluZy5cbmV4cG9ydCBjb25zdCBhcHBseUFsbE9wc1RvUGxhbiA9IChcbiAgb3BzOiBPcFtdLFxuICBwbGFuOiBQbGFuXG4pOiBSZXN1bHQ8QWxsT3BzUmVzdWx0PiA9PiB7XG4gIGNvbnN0IGludmVyc2VzOiBPcFtdID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcmVzID0gb3BzW2ldLmFwcGx5KHBsYW4pO1xuICAgIGlmICghcmVzLm9rKSB7XG4gICAgICBjb25zdCBpbnZlcnNlUmVzID0gYXBwbHlBbGxJbnZlcnNlT3BzVG9QbGFuKGludmVyc2VzLCBwbGFuKTtcbiAgICAgIGlmICghaW52ZXJzZVJlcy5vaykge1xuICAgICAgICAvLyBUT0RPIENhbiB3ZSB3cmFwIHRoZSBFcnJvciBpbiBhbm90aGVyIGVycm9yIHRvIG1ha2UgaXQgY2xlYXIgdGhpc1xuICAgICAgICAvLyBlcnJvciBoYXBwZW5lZCB3aGVuIHRyeWluZyB0byBjbGVhbiB1cCBmcm9tIHRoZSBwcmV2aW91cyBFcnJvciB3aGVuXG4gICAgICAgIC8vIHRoZSBhcHBseSgpIGZhaWxlZC5cbiAgICAgICAgcmV0dXJuIGludmVyc2VSZXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH1cbiAgICBpbnZlcnNlcy51bnNoaWZ0KHJlcy52YWx1ZS5pbnZlcnNlKTtcbiAgICBwbGFuID0gcmVzLnZhbHVlLnBsYW47XG4gIH1cblxuICByZXR1cm4gb2soe1xuICAgIG9wczogaW52ZXJzZXMsXG4gICAgcGxhbjogcGxhbixcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgYXBwbHlBbGxPcHNUb1BsYW5BbmRUaGVuSW52ZXJzZSA9IChcbiAgb3BzOiBPcFtdLFxuICBwbGFuOiBQbGFuXG4pOiBSZXN1bHQ8QWxsT3BzUmVzdWx0PiA9PiB7XG4gIGNvbnN0IHJlcyA9IGFwcGx5QWxsT3BzVG9QbGFuKG9wcywgcGxhbik7XG4gIGlmICghcmVzLm9rKSB7XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICByZXR1cm4gYXBwbHlBbGxPcHNUb1BsYW4ocmVzLnZhbHVlLm9wcywgcmVzLnZhbHVlLnBsYW4pO1xufTtcbi8vIE5vT3AgaXMgYSBuby1vcC5cbmV4cG9ydCBmdW5jdGlvbiBOb09wKCk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbXSk7XG59XG4iLCAiaW1wb3J0IHsgUmVzdWx0LCBvaywgZXJyb3IgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBEaXJlY3RlZEVkZ2UsIGVkZ2VzQnlTcmNBbmREc3RUb01hcCB9IGZyb20gXCIuLi9kYWcvZGFnLnRzXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhbi50c1wiO1xuaW1wb3J0IHsgQ2hhcnQsIFRhc2tTdGF0ZSB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgT3AsIFN1Yk9wLCBTdWJPcFJlc3VsdCB9IGZyb20gXCIuL29wcy50c1wiO1xuXG4vKiogQSB2YWx1ZSBvZiAtMSBmb3IgaiBtZWFucyB0aGUgRmluaXNoIE1pbGVzdG9uZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBEaXJlY3RlZEVkZ2VGb3JQbGFuKFxuICBpOiBudW1iZXIsXG4gIGo6IG51bWJlcixcbiAgcGxhbjogUGxhblxuKTogUmVzdWx0PERpcmVjdGVkRWRnZT4ge1xuICBjb25zdCBjaGFydCA9IHBsYW4uY2hhcnQ7XG4gIGlmIChqID09PSAtMSkge1xuICAgIGogPSBjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICB9XG4gIGlmIChpIDwgMCB8fCBpID49IGNoYXJ0LlZlcnRpY2VzLmxlbmd0aCkge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIGBpIGluZGV4IG91dCBvZiByYW5nZTogJHtpfSBub3QgaW4gWzAsICR7Y2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMX1dYFxuICAgICk7XG4gIH1cbiAgaWYgKGogPCAwIHx8IGogPj0gY2hhcnQuVmVydGljZXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGVycm9yKFxuICAgICAgYGogaW5kZXggb3V0IG9mIHJhbmdlOiAke2p9IG5vdCBpbiBbMCwgJHtjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxfV1gXG4gICAgKTtcbiAgfVxuICBpZiAoaSA9PT0gaikge1xuICAgIHJldHVybiBlcnJvcihgQSBUYXNrIGNhbiBub3QgZGVwZW5kIG9uIGl0c2VsZjogJHtpfSA9PT0gJHtqfWApO1xuICB9XG4gIHJldHVybiBvayhuZXcgRGlyZWN0ZWRFZGdlKGksIGopKTtcbn1cblxuZXhwb3J0IGNsYXNzIEFkZEVkZ2VTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaTogbnVtYmVyID0gMDtcbiAgajogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpOiBudW1iZXIsIGo6IG51bWJlcikge1xuICAgIHRoaXMuaSA9IGk7XG4gICAgdGhpcy5qID0gajtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBpZiAodGhpcy5pID09PSAtMSkge1xuICAgICAgdGhpcy5pID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICAgIH1cbiAgICBpZiAodGhpcy5qID09PSAtMSkge1xuICAgICAgdGhpcy5qID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICAgIH1cblxuICAgIGNvbnN0IGUgPSBEaXJlY3RlZEVkZ2VGb3JQbGFuKHRoaXMuaSwgdGhpcy5qLCBwbGFuKTtcbiAgICBpZiAoIWUub2spIHtcbiAgICAgIHJldHVybiBlO1xuICAgIH1cblxuICAgIC8vIE9ubHkgYWRkIHRoZSBlZGdlIGlmIGl0IGRvZXNuJ3QgZXhpc3RzIGFscmVhZHkuXG4gICAgaWYgKCFwbGFuLmNoYXJ0LkVkZ2VzLmZpbmQoKHZhbHVlOiBEaXJlY3RlZEVkZ2UpID0+IHZhbHVlLmVxdWFsKGUudmFsdWUpKSkge1xuICAgICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKGUudmFsdWUpO1xuICAgIH1cblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCksXG4gICAgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFJlbW92ZUVkZ2VTdXBPcCh0aGlzLmksIHRoaXMuaik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbW92ZUVkZ2VTdXBPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaTogbnVtYmVyID0gMDtcbiAgajogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpOiBudW1iZXIsIGo6IG51bWJlcikge1xuICAgIHRoaXMuaSA9IGk7XG4gICAgdGhpcy5qID0gajtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBpZiAodGhpcy5pID09PSAtMSkge1xuICAgICAgdGhpcy5pID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICAgIH1cbiAgICBpZiAodGhpcy5qID09PSAtMSkge1xuICAgICAgdGhpcy5qID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICAgIH1cblxuICAgIGNvbnN0IGUgPSBEaXJlY3RlZEVkZ2VGb3JQbGFuKHRoaXMuaSwgdGhpcy5qLCBwbGFuKTtcbiAgICBpZiAoIWUub2spIHtcbiAgICAgIHJldHVybiBlO1xuICAgIH1cbiAgICBwbGFuLmNoYXJ0LkVkZ2VzID0gcGxhbi5jaGFydC5FZGdlcy5maWx0ZXIoXG4gICAgICAodjogRGlyZWN0ZWRFZGdlKTogYm9vbGVhbiA9PiAhdi5lcXVhbChlLnZhbHVlKVxuICAgICk7XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpLFxuICAgIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBBZGRFZGdlU3ViT3AodGhpcy5pLCB0aGlzLmopO1xuICB9XG59XG5cbmZ1bmN0aW9uIGluZGV4SW5SYW5nZUZvclZlcnRpY2VzKGluZGV4OiBudW1iZXIsIGNoYXJ0OiBDaGFydCk6IFJlc3VsdDxudWxsPiB7XG4gIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPiBjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAyKSB7XG4gICAgcmV0dXJuIGVycm9yKGAke2luZGV4fSBpcyBub3QgaW4gcmFuZ2UgWzAsICR7Y2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMn1dYCk7XG4gIH1cbiAgcmV0dXJuIG9rKG51bGwpO1xufVxuXG5mdW5jdGlvbiBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlc0V4Y2x1c2l2ZShcbiAgaW5kZXg6IG51bWJlcixcbiAgY2hhcnQ6IENoYXJ0XG4pOiBSZXN1bHQ8bnVsbD4ge1xuICBpZiAoaW5kZXggPCAxIHx8IGluZGV4ID4gY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMikge1xuICAgIHJldHVybiBlcnJvcihgJHtpbmRleH0gaXMgbm90IGluIHJhbmdlIFsxLCAke2NoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDJ9XWApO1xuICB9XG4gIHJldHVybiBvayhudWxsKTtcbn1cblxuZXhwb3J0IGNsYXNzIEFkZFRhc2tBZnRlclN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBpbmRleDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGNoYXJ0ID0gcGxhbi5jaGFydDtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLmluZGV4LCBjaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuc3BsaWNlKHRoaXMuaW5kZXggKyAxLCAwLCBwbGFuLm5ld1Rhc2soKSk7XG5cbiAgICAvLyBVcGRhdGUgRWRnZXMuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFydC5FZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZWRnZSA9IGNoYXJ0LkVkZ2VzW2ldO1xuICAgICAgaWYgKGVkZ2UuaSA+PSB0aGlzLmluZGV4ICsgMSkge1xuICAgICAgICBlZGdlLmkrKztcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlLmogPj0gdGhpcy5pbmRleCArIDEpIHtcbiAgICAgICAgZWRnZS5qKys7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBEZWxldGVUYXNrU3ViT3AodGhpcy5pbmRleCArIDEpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEdXBUYXNrU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGluZGV4OiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGluZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgY2hhcnQgPSBwbGFuLmNoYXJ0O1xuICAgIGNvbnN0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzRXhjbHVzaXZlKHRoaXMuaW5kZXgsIGNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBjb25zdCBjb3B5ID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLmluZGV4XS5kdXAoKTtcbiAgICAvLyBJbnNlcnQgdGhlIGR1cGxpY2F0ZSBpbW1lZGlhdGVseSBhZnRlciB0aGUgVGFzayBpdCBpcyBjb3BpZWQgZnJvbS5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLnNwbGljZSh0aGlzLmluZGV4LCAwLCBjb3B5KTtcblxuICAgIC8vIFVwZGF0ZSBFZGdlcy5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJ0LkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlZGdlID0gY2hhcnQuRWRnZXNbaV07XG4gICAgICBpZiAoZWRnZS5pID4gdGhpcy5pbmRleCkge1xuICAgICAgICBlZGdlLmkrKztcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlLmogPiB0aGlzLmluZGV4KSB7XG4gICAgICAgIGVkZ2UuaisrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlVGFza1N1Yk9wKHRoaXMuaW5kZXggKyAxKTtcbiAgfVxufVxuXG50eXBlIFN1YnN0aXR1dGlvbiA9IE1hcDxEaXJlY3RlZEVkZ2UsIERpcmVjdGVkRWRnZT47XG5cbmV4cG9ydCBjbGFzcyBNb3ZlQWxsT3V0Z29pbmdFZGdlc0Zyb21Ub1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBmcm9tVGFza0luZGV4OiBudW1iZXIgPSAwO1xuICB0b1Rhc2tJbmRleDogbnVtYmVyID0gMDtcbiAgYWN0dWFsTW92ZXM6IFN1YnN0aXR1dGlvbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBmcm9tVGFza0luZGV4OiBudW1iZXIsXG4gICAgdG9UYXNrSW5kZXg6IG51bWJlcixcbiAgICBhY3R1YWxNb3ZlczogU3Vic3RpdHV0aW9uID0gbmV3IE1hcCgpXG4gICkge1xuICAgIHRoaXMuZnJvbVRhc2tJbmRleCA9IGZyb21UYXNrSW5kZXg7XG4gICAgdGhpcy50b1Rhc2tJbmRleCA9IHRvVGFza0luZGV4O1xuICAgIHRoaXMuYWN0dWFsTW92ZXMgPSBhY3R1YWxNb3ZlcztcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBjaGFydCA9IHBsYW4uY2hhcnQ7XG4gICAgbGV0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzRXhjbHVzaXZlKHRoaXMuZnJvbVRhc2tJbmRleCwgY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlc0V4Y2x1c2l2ZSh0aGlzLnRvVGFza0luZGV4LCBjaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYWN0dWFsTW92ZXMudmFsdWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc3QgYWN0dWFsTW92ZXM6IFN1YnN0aXR1dGlvbiA9IG5ldyBNYXAoKTtcbiAgICAgIC8vIFVwZGF0ZSBhbGwgRWRnZXMgdGhhdCBzdGFydCBhdCAnZnJvbVRhc2tJbmRleCcgYW5kIGNoYW5nZSB0aGUgc3RhcnQgdG8gJ3RvVGFza0luZGV4Jy5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hhcnQuRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZWRnZSA9IGNoYXJ0LkVkZ2VzW2ldO1xuICAgICAgICAvLyBTa2lwIHRoZSBjb3JuZXIgY2FzZSB0aGVyZSBmcm9tVGFza0luZGV4IHBvaW50cyB0byBUYXNrSW5kZXguXG4gICAgICAgIGlmIChlZGdlLmkgPT09IHRoaXMuZnJvbVRhc2tJbmRleCAmJiBlZGdlLmogPT09IHRoaXMudG9UYXNrSW5kZXgpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlZGdlLmkgPT09IHRoaXMuZnJvbVRhc2tJbmRleCkge1xuICAgICAgICAgIGFjdHVhbE1vdmVzLnNldChcbiAgICAgICAgICAgIG5ldyBEaXJlY3RlZEVkZ2UodGhpcy50b1Rhc2tJbmRleCwgZWRnZS5qKSxcbiAgICAgICAgICAgIG5ldyBEaXJlY3RlZEVkZ2UoZWRnZS5pLCBlZGdlLmopXG4gICAgICAgICAgKTtcbiAgICAgICAgICBlZGdlLmkgPSB0aGlzLnRvVGFza0luZGV4O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gb2soe1xuICAgICAgICBwbGFuOiBwbGFuLFxuICAgICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UoXG4gICAgICAgICAgdGhpcy50b1Rhc2tJbmRleCxcbiAgICAgICAgICB0aGlzLmZyb21UYXNrSW5kZXgsXG4gICAgICAgICAgYWN0dWFsTW92ZXNcbiAgICAgICAgKSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJ0LkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG5ld0VkZ2UgPSB0aGlzLmFjdHVhbE1vdmVzLmdldChwbGFuLmNoYXJ0LkVkZ2VzW2ldKTtcbiAgICAgICAgaWYgKG5ld0VkZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHBsYW4uY2hhcnQuRWRnZXNbaV0gPSBuZXdFZGdlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvayh7XG4gICAgICAgIHBsYW46IHBsYW4sXG4gICAgICAgIGludmVyc2U6IG5ldyBNb3ZlQWxsT3V0Z29pbmdFZGdlc0Zyb21Ub1N1Yk9wKFxuICAgICAgICAgIHRoaXMudG9UYXNrSW5kZXgsXG4gICAgICAgICAgdGhpcy5mcm9tVGFza0luZGV4XG4gICAgICAgICksXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBpbnZlcnNlKFxuICAgIHRvVGFza0luZGV4OiBudW1iZXIsXG4gICAgZnJvbVRhc2tJbmRleDogbnVtYmVyLFxuICAgIGFjdHVhbE1vdmVzOiBTdWJzdGl0dXRpb25cbiAgKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgTW92ZUFsbE91dGdvaW5nRWRnZXNGcm9tVG9TdWJPcChcbiAgICAgIHRvVGFza0luZGV4LFxuICAgICAgZnJvbVRhc2tJbmRleCxcbiAgICAgIGFjdHVhbE1vdmVzXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29weUFsbEVkZ2VzRnJvbVRvU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGZyb21JbmRleDogbnVtYmVyID0gMDtcbiAgdG9JbmRleDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3Rvcihmcm9tSW5kZXg6IG51bWJlciwgdG9JbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5mcm9tSW5kZXggPSBmcm9tSW5kZXg7XG4gICAgdGhpcy50b0luZGV4ID0gdG9JbmRleDtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLmZyb21JbmRleCwgcGxhbi5jaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgY29uc3QgbmV3RWRnZXM6IERpcmVjdGVkRWRnZVtdID0gW107XG4gICAgcGxhbi5jaGFydC5FZGdlcy5mb3JFYWNoKChlZGdlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICAgIGlmIChlZGdlLmkgPT09IHRoaXMuZnJvbUluZGV4KSB7XG4gICAgICAgIG5ld0VkZ2VzLnB1c2gobmV3IERpcmVjdGVkRWRnZSh0aGlzLnRvSW5kZXgsIGVkZ2UuaikpO1xuICAgICAgfVxuICAgICAgaWYgKGVkZ2UuaiA9PT0gdGhpcy5mcm9tSW5kZXgpIHtcbiAgICAgICAgbmV3RWRnZXMucHVzaChuZXcgRGlyZWN0ZWRFZGdlKGVkZ2UuaSwgdGhpcy50b0luZGV4KSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKC4uLm5ld0VkZ2VzKTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IG5ldyBSZW1vdmVBbGxFZGdlc1N1Yk9wKG5ld0VkZ2VzKSB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVtb3ZlQWxsRWRnZXNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVtdO1xuXG4gIGNvbnN0cnVjdG9yKGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSkge1xuICAgIHRoaXMuZWRnZXMgPSBlZGdlcztcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBwbGFuLmNoYXJ0LkVkZ2VzID0gcGxhbi5jaGFydC5FZGdlcy5maWx0ZXIoXG4gICAgICAoZWRnZTogRGlyZWN0ZWRFZGdlKSA9PlxuICAgICAgICAtMSA9PT1cbiAgICAgICAgdGhpcy5lZGdlcy5maW5kSW5kZXgoKHRvQmVSZW1vdmVkOiBEaXJlY3RlZEVkZ2UpID0+XG4gICAgICAgICAgZWRnZS5lcXVhbCh0b0JlUmVtb3ZlZClcbiAgICAgICAgKVxuICAgICk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiBuZXcgQWRkQWxsRWRnZXNTdWJPcCh0aGlzLmVkZ2VzKSB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQWRkQWxsRWRnZXNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVtdO1xuXG4gIGNvbnN0cnVjdG9yKGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSkge1xuICAgIHRoaXMuZWRnZXMgPSBlZGdlcztcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBwbGFuLmNoYXJ0LkVkZ2VzLnB1c2goLi4udGhpcy5lZGdlcyk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiBuZXcgUmVtb3ZlQWxsRWRnZXNTdWJPcCh0aGlzLmVkZ2VzKSB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVsZXRlVGFza1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBpbmRleDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGNoYXJ0ID0gcGxhbi5jaGFydDtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLmluZGV4LCBjaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGNoYXJ0LlZlcnRpY2VzLnNwbGljZSh0aGlzLmluZGV4LCAxKTtcblxuICAgIC8vIFVwZGF0ZSBFZGdlcy5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJ0LkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlZGdlID0gY2hhcnQuRWRnZXNbaV07XG4gICAgICBpZiAoZWRnZS5pID4gdGhpcy5pbmRleCkge1xuICAgICAgICBlZGdlLmktLTtcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlLmogPiB0aGlzLmluZGV4KSB7XG4gICAgICAgIGVkZ2Uuai0tO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBBZGRUYXNrQWZ0ZXJTdWJPcCh0aGlzLmluZGV4IC0gMSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJhdGlvbmFsaXplRWRnZXNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBzcmNBbmREc3QgPSBlZGdlc0J5U3JjQW5kRHN0VG9NYXAocGxhbi5jaGFydC5FZGdlcyk7XG4gICAgY29uc3QgU3RhcnQgPSAwO1xuICAgIGNvbnN0IEZpbmlzaCA9IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcblxuICAgIC8vIGxvb3Agb3ZlciBhbGwgdmVydGljcyBmcm9tIFtTdGFydCwgRmluaXNoKSBhbmQgbG9vayBmb3IgdGhlaXJcbiAgICAvLyBkZXN0aW5hdGlvbnMuIElmIHRoZXkgaGF2ZSBub25lIHRoZW4gYWRkIGluIGFuIGVkZ2UgdG8gRmluaXNoLiBJZiB0aGV5XG4gICAgLy8gaGF2ZSBtb3JlIHRoYW4gb25lIHRoZW4gcmVtb3ZlIGFueSBsaW5rcyB0byBGaW5pc2guXG4gICAgZm9yIChsZXQgaSA9IFN0YXJ0OyBpIDwgRmluaXNoOyBpKyspIHtcbiAgICAgIGNvbnN0IGRlc3RpbmF0aW9ucyA9IHNyY0FuZERzdC5ieVNyYy5nZXQoaSk7XG4gICAgICBpZiAoZGVzdGluYXRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgdG9CZUFkZGVkID0gbmV3IERpcmVjdGVkRWRnZShpLCBGaW5pc2gpO1xuICAgICAgICBwbGFuLmNoYXJ0LkVkZ2VzLnB1c2godG9CZUFkZGVkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEFyZSB0aGVyZSBhbnkgdW5lZWRlZCBFZ2RlcyB0byBGaW5pc2g/IElmIHNvIGZpbHRlciB0aGVtIG91dC5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIGRlc3RpbmF0aW9ucy5sZW5ndGggPiAxICYmXG4gICAgICAgICAgZGVzdGluYXRpb25zLmZpbmQoKHZhbHVlOiBEaXJlY3RlZEVkZ2UpID0+IHZhbHVlLmogPT09IEZpbmlzaClcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29uc3QgdG9CZVJlbW92ZWQgPSBuZXcgRGlyZWN0ZWRFZGdlKGksIEZpbmlzaCk7XG4gICAgICAgICAgcGxhbi5jaGFydC5FZGdlcyA9IHBsYW4uY2hhcnQuRWRnZXMuZmlsdGVyKFxuICAgICAgICAgICAgKHZhbHVlOiBEaXJlY3RlZEVkZ2UpID0+ICF0b0JlUmVtb3ZlZC5lcXVhbCh2YWx1ZSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gbG9vcCBvdmVyIGFsbCB2ZXJ0aWNzIGZyb20oU3RhcnQsIEZpbmlzaF0gYW5kIGxvb2sgZm9yIHRoZWlyIHNvdXJjZXMuIElmXG4gICAgLy8gdGhleSBoYXZlIG5vbmUgdGhlbiBhZGQgaW4gYW4gZWRnZSBmcm9tIFN0YXJ0LiBJZiB0aGV5IGhhdmUgbW9yZSB0aGFuIG9uZVxuICAgIC8vIHRoZW4gcmVtb3ZlIGFueSBsaW5rcyBmcm9tIFN0YXJ0LlxuICAgIGZvciAobGV0IGkgPSBTdGFydCArIDE7IGkgPCBGaW5pc2g7IGkrKykge1xuICAgICAgY29uc3QgZGVzdGluYXRpb25zID0gc3JjQW5kRHN0LmJ5RHN0LmdldChpKTtcbiAgICAgIGlmIChkZXN0aW5hdGlvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCB0b0JlQWRkZWQgPSBuZXcgRGlyZWN0ZWRFZGdlKFN0YXJ0LCBpKTtcbiAgICAgICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKHRvQmVBZGRlZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBcmUgdGhlcmUgYW55IHVuLW5lZWRlZCBFZ2RlcyBmcm9tIFN0YXJ0PyBJZiBzbyBmaWx0ZXIgdGhlbSBvdXQuXG4gICAgICAgIGlmIChcbiAgICAgICAgICBkZXN0aW5hdGlvbnMubGVuZ3RoID4gMSAmJlxuICAgICAgICAgIGRlc3RpbmF0aW9ucy5maW5kKCh2YWx1ZTogRGlyZWN0ZWRFZGdlKSA9PiB2YWx1ZS5pID09PSBTdGFydClcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29uc3QgdG9CZVJlbW92ZWQgPSBuZXcgRGlyZWN0ZWRFZGdlKFN0YXJ0LCBpKTtcbiAgICAgICAgICBwbGFuLmNoYXJ0LkVkZ2VzID0gcGxhbi5jaGFydC5FZGdlcy5maWx0ZXIoXG4gICAgICAgICAgICAodmFsdWU6IERpcmVjdGVkRWRnZSkgPT4gIXRvQmVSZW1vdmVkLmVxdWFsKHZhbHVlKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHBsYW4uY2hhcnQuRWRnZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBwbGFuLmNoYXJ0LkVkZ2VzLnB1c2gobmV3IERpcmVjdGVkRWRnZShTdGFydCwgRmluaXNoKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZXRUYXNrTmFtZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICB0YXNrSW5kZXg6IG51bWJlcjtcbiAgbmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHRhc2tJbmRleDogbnVtYmVyLCBuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLnRhc2tJbmRleCA9IHRhc2tJbmRleDtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzKHRoaXMudGFza0luZGV4LCBwbGFuLmNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgY29uc3Qgb2xkTmFtZSA9IHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdLm5hbWU7XG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLnRhc2tJbmRleF0ubmFtZSA9IHRoaXMubmFtZTtcbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZShvbGROYW1lKSxcbiAgICB9KTtcbiAgfVxuXG4gIGludmVyc2Uob2xkTmFtZTogc3RyaW5nKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgU2V0VGFza05hbWVTdWJPcCh0aGlzLnRhc2tJbmRleCwgb2xkTmFtZSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNldFRhc2tTdGF0ZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICB0YXNrU3RhdGU6IFRhc2tTdGF0ZTtcbiAgdGFza0luZGV4OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IodGFza0luZGV4OiBudW1iZXIsIHRhc2tTdGF0ZTogVGFza1N0YXRlKSB7XG4gICAgdGhpcy50YXNrSW5kZXggPSB0YXNrSW5kZXg7XG4gICAgdGhpcy50YXNrU3RhdGUgPSB0YXNrU3RhdGU7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXModGhpcy50YXNrSW5kZXgsIHBsYW4uY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICBjb25zdCBvbGRTdGF0ZSA9IHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdLnN0YXRlO1xuICAgIHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdLnN0YXRlID0gdGhpcy50YXNrU3RhdGU7XG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2Uob2xkU3RhdGUpLFxuICAgIH0pO1xuICB9XG5cbiAgaW52ZXJzZSh0YXNrU3RhdGU6IFRhc2tTdGF0ZSk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFNldFRhc2tTdGF0ZVN1Yk9wKHRoaXMudGFza0luZGV4LCB0YXNrU3RhdGUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBJbnNlcnROZXdFbXB0eVRhc2tBZnRlck9wKHRhc2tJbmRleDogbnVtYmVyKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gICAgbmV3IEFkZFRhc2tBZnRlclN1Yk9wKHRhc2tJbmRleCksXG4gICAgbmV3IEFkZEVkZ2VTdWJPcCgwLCB0YXNrSW5kZXggKyAxKSxcbiAgICBuZXcgQWRkRWRnZVN1Yk9wKHRhc2tJbmRleCArIDEsIC0xKSxcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gIF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU2V0VGFza05hbWVPcCh0YXNrSW5kZXg6IG51bWJlciwgbmFtZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgU2V0VGFza05hbWVTdWJPcCh0YXNrSW5kZXgsIG5hbWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZXRUYXNrU3RhdGVPcCh0YXNrSW5kZXg6IG51bWJlciwgdGFza1N0YXRlOiBUYXNrU3RhdGUpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBTZXRUYXNrU3RhdGVTdWJPcCh0YXNrSW5kZXgsIHRhc2tTdGF0ZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNwbGl0VGFza09wKHRhc2tJbmRleDogbnVtYmVyKTogT3Age1xuICBjb25zdCBzdWJPcHM6IFN1Yk9wW10gPSBbXG4gICAgbmV3IER1cFRhc2tTdWJPcCh0YXNrSW5kZXgpLFxuICAgIG5ldyBBZGRFZGdlU3ViT3AodGFza0luZGV4LCB0YXNrSW5kZXggKyAxKSxcbiAgICBuZXcgTW92ZUFsbE91dGdvaW5nRWRnZXNGcm9tVG9TdWJPcCh0YXNrSW5kZXgsIHRhc2tJbmRleCArIDEpLFxuICBdO1xuXG4gIHJldHVybiBuZXcgT3Aoc3ViT3BzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIER1cFRhc2tPcCh0YXNrSW5kZXg6IG51bWJlcik6IE9wIHtcbiAgY29uc3Qgc3ViT3BzOiBTdWJPcFtdID0gW1xuICAgIG5ldyBEdXBUYXNrU3ViT3AodGFza0luZGV4KSxcbiAgICBuZXcgQ29weUFsbEVkZ2VzRnJvbVRvU3ViT3AodGFza0luZGV4LCB0YXNrSW5kZXggKyAxKSxcbiAgXTtcblxuICByZXR1cm4gbmV3IE9wKHN1Yk9wcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBZGRFZGdlT3AoZnJvbVRhc2tJbmRleDogbnVtYmVyLCB0b1Rhc2tJbmRleDogbnVtYmVyKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gICAgbmV3IEFkZEVkZ2VTdWJPcChmcm9tVGFza0luZGV4LCB0b1Rhc2tJbmRleCksXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICBdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJhdGlvbmFsaXplRWRnZXNPcCgpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKV0pO1xufVxuIiwgIi8vIENoYW5nZU1ldHJpY1ZhbHVlXG5cbmltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IE1ldHJpY0RlZmluaXRpb24gfSBmcm9tIFwiLi4vbWV0cmljcy9tZXRyaWNzLnRzXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhbi50c1wiO1xuaW1wb3J0IHsgUmVzdWx0LCBlcnJvciwgb2sgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBPcCwgU3ViT3AsIFN1Yk9wUmVzdWx0IH0gZnJvbSBcIi4vb3BzLnRzXCI7XG5cbmV4cG9ydCBjbGFzcyBBZGRNZXRyaWNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgbmFtZTogc3RyaW5nO1xuICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uO1xuXG4gIC8vIE1hcHMgYW4gaW5kZXggb2YgYSBUYXNrIHRvIGEgdmFsdWUgZm9yIHRoZSBnaXZlbiBtZXRyaWMga2V5LlxuICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uLFxuICAgIHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCkgLy8gU2hvdWxkIG9ubHkgYmUgc3VwcGxpZWQgYnkgaW52ZXJzZSBhY3Rpb25zLlxuICApIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbiA9IG1ldHJpY0RlZmluaXRpb247XG4gICAgdGhpcy50YXNrTWV0cmljVmFsdWVzID0gdGFza01ldHJpY1ZhbHVlcztcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBpZiAocGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmFtZX0gYWxyZWFkeSBleGlzdHMgYXMgYSBNZXRyaWNgKTtcbiAgICB9XG5cbiAgICBwbGFuLnNldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lLCB0aGlzLm1ldHJpY0RlZmluaXRpb24pO1xuXG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCBhZGQgdGhpcyBtZXRyaWMgYW5kIHNldCBpdCB0byB0aGUgZGVmYXVsdCxcbiAgICAvLyB1bmxlc3MgdGhlcmUgaXMgbWF0Y2hpbmcgZW50cnkgaW4gdGFza01ldHJpY1ZhbHVlcywgaW4gd2hpY2ggY2FzZSB3ZSB3aWxsXG4gICAgLy8gdXNlIHRoYXQgdmFsdWUsIGkuZS4gdGhpcyBBZGRNZXRyaWNTdWJPcCBpcyBhY3R1YWxseSBhIHJldmVydCBvZiBhXG4gICAgLy8gRGVsZXRlTWV0cmljU3ViT3AuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICB0YXNrLnNldE1ldHJpYyhcbiAgICAgICAgdGhpcy5uYW1lLFxuICAgICAgICB0aGlzLnRhc2tNZXRyaWNWYWx1ZXMuZ2V0KGluZGV4KSB8fCB0aGlzLm1ldHJpY0RlZmluaXRpb24uZGVmYXVsdFxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBEZWxldGVNZXRyaWNTdWJPcCh0aGlzLm5hbWUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWxldGVNZXRyaWNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgbmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgbWV0cmljRGVmaW5pdGlvbiA9IHBsYW4uZ2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5hbWUpO1xuXG4gICAgaWYgKG1ldHJpY0RlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgVGhlIG1ldHJpYyB3aXRoIG5hbWUgJHt0aGlzLm5hbWV9IGRvZXMgbm90IGV4aXN0IGFuZCBjYW4ndCBiZSBkZWxldGVkLmBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKG1ldHJpY0RlZmluaXRpb24uaXNTdGF0aWMpIHtcbiAgICAgIHJldHVybiBlcnJvcihgVGhlIHN0YXRpYyBNZXRyaWMgJHt0aGlzLm5hbWV9IGNhbid0IGJlIGRlbGV0ZWQuYCk7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGZyb20gcmVzb3VyY2UgZGVmaW5pdGlvbnMuXG4gICAgcGxhbi5kZWxldGVNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSk7XG5cbiAgICBjb25zdCB0YXNrSW5kZXhUb0RlbGV0ZWRNZXRyaWNWYWx1ZTogTWFwPG51bWJlciwgbnVtYmVyPiA9IG5ldyBNYXAoKTtcblxuICAgIC8vIE5vdyBsb29rIGF0IGFsbCBUYXNrcyBhbmQgcmVtb3ZlIGB0aGlzLm5hbWVgIGZyb20gdGhlIG1ldHJpYyB3aGlsZSBhbHNvXG4gICAgLy8gYnVpbGRpbmcgdXAgdGhlIGluZm8gbmVlZGVkIGZvciBhIHJldmVydC5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGFzay5nZXRNZXRyaWModGhpcy5uYW1lKTtcbiAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRhc2tJbmRleFRvRGVsZXRlZE1ldHJpY1ZhbHVlLnNldChpbmRleCwgdmFsdWUpO1xuICAgICAgfVxuICAgICAgdGFzay5kZWxldGVNZXRyaWModGhpcy5uYW1lKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG1ldHJpY0RlZmluaXRpb24sIHRhc2tJbmRleFRvRGVsZXRlZE1ldHJpY1ZhbHVlKSxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgaW52ZXJzZShcbiAgICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uLFxuICAgIG1ldHJpY1ZhbHVlc0ZvckRlbGV0ZWRSZXNvdXJjZU5hbWU6IE1hcDxudW1iZXIsIG51bWJlcj5cbiAgKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgQWRkTWV0cmljU3ViT3AoXG4gICAgICB0aGlzLm5hbWUsXG4gICAgICBtZXRyaWNEZWZpbml0aW9uLFxuICAgICAgbWV0cmljVmFsdWVzRm9yRGVsZXRlZFJlc291cmNlTmFtZVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbmFtZU1ldHJpY1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBvbGROYW1lOiBzdHJpbmc7XG4gIG5ld05hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihvbGROYW1lOiBzdHJpbmcsIG5ld05hbWU6IHN0cmluZykge1xuICAgIHRoaXMub2xkTmFtZSA9IG9sZE5hbWU7XG4gICAgdGhpcy5uZXdOYW1lID0gbmV3TmFtZTtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBpZiAocGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmV3TmFtZSkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmV3TmFtZX0gYWxyZWFkeSBleGlzdHMgYXMgYSBtZXRyaWMuYCk7XG4gICAgfVxuXG4gICAgY29uc3QgbWV0cmljRGVmaW5pdGlvbiA9IHBsYW4uZ2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm9sZE5hbWUpO1xuICAgIGlmIChtZXRyaWNEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm9sZE5hbWV9IGRvZXMgbm90IGV4aXN0IGFzIGEgTWV0cmljYCk7XG4gICAgfVxuICAgIGlmIChtZXRyaWNEZWZpbml0aW9uLmlzU3RhdGljKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYFN0YXRpYyBtZXRyaWMgJHt0aGlzLm9sZE5hbWV9IGNhbid0IGJlIHJlbmFtZWQuYCk7XG4gICAgfVxuXG4gICAgcGxhbi5zZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmV3TmFtZSwgbWV0cmljRGVmaW5pdGlvbik7XG4gICAgcGxhbi5kZWxldGVNZXRyaWNEZWZpbml0aW9uKHRoaXMub2xkTmFtZSk7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIHJlbmFtZSB0aGlzIG1ldHJpYy5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2spID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGFzay5nZXRNZXRyaWModGhpcy5vbGROYW1lKSB8fCBtZXRyaWNEZWZpbml0aW9uLmRlZmF1bHQ7XG4gICAgICB0YXNrLnNldE1ldHJpYyh0aGlzLm5ld05hbWUsIHZhbHVlKTtcbiAgICAgIHRhc2suZGVsZXRlTWV0cmljKHRoaXMub2xkTmFtZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgUmVuYW1lTWV0cmljU3ViT3AodGhpcy5uZXdOYW1lLCB0aGlzLm9sZE5hbWUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBVcGRhdGVNZXRyaWNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgbmFtZTogc3RyaW5nO1xuICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uO1xuXG4gIC8vIE1hcHMgYW4gaW5kZXggb2YgYSBUYXNrIHRvIGEgdmFsdWUgZm9yIHRoZSBnaXZlbiBtZXRyaWMga2V5LlxuICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uLFxuICAgIHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCkgLy8gU2hvdWxkIG9ubHkgYmUgc3VwcGxpZWQgYnkgaW52ZXJzZSBhY3Rpb25zLlxuICApIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbiA9IG1ldHJpY0RlZmluaXRpb247XG4gICAgdGhpcy50YXNrTWV0cmljVmFsdWVzID0gdGFza01ldHJpY1ZhbHVlcztcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBvbGRNZXRyaWNEZWZpbml0aW9uID0gcGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSk7XG4gICAgaWYgKG9sZE1ldHJpY0RlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmFtZX0gZG9lcyBub3QgZXhpc3QgYXMgYSBNZXRyaWNgKTtcbiAgICB9XG4gICAgaWYgKG9sZE1ldHJpY0RlZmluaXRpb24uaXNTdGF0aWMpIHtcbiAgICAgIHJldHVybiBlcnJvcihgU3RhdGljIG1ldHJpYyAke3RoaXMubmFtZX0gY2FuJ3QgYmUgdXBkYXRlZC5gKTtcbiAgICB9XG5cbiAgICBwbGFuLnNldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lLCB0aGlzLm1ldHJpY0RlZmluaXRpb24pO1xuXG4gICAgY29uc3QgdGFza01ldHJpY1ZhbHVlczogTWFwPG51bWJlciwgbnVtYmVyPiA9IG5ldyBNYXAoKTtcbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIHVwZGF0ZSB0aGUgbWV0cmljIHZhbHVlcyB0byByZWZsZWN0IHRoZSBuZXdcbiAgICAvLyBtZXRyaWMgZGVmaW5pdGlvbiwgdW5sZXNzIHRoZXJlIGlzIG1hdGNoaW5nIGVudHJ5IGluIHRhc2tNZXRyaWNWYWx1ZXMsIGluXG4gICAgLy8gd2hpY2ggY2FzZSB3ZSB3aWxsIHVzZSB0aGF0IHZhbHVlLCBpLmUuIHRoaXMgVXBkYXRlTWV0cmljU3ViT3AgaXNcbiAgICAvLyBhY3R1YWxseSBhIHJldmVydCBvZiBhbm90aGVyIFVwZGF0ZU1ldHJpY1N1Yk9wLlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3Qgb2xkVmFsdWUgPSB0YXNrLmdldE1ldHJpYyh0aGlzLm5hbWUpITtcblxuICAgICAgbGV0IG5ld1ZhbHVlOiBudW1iZXI7XG4gICAgICBpZiAodGhpcy50YXNrTWV0cmljVmFsdWVzLmhhcyhpbmRleCkpIHtcbiAgICAgICAgLy8gdGFza01ldHJpY1ZhbHVlcyBoYXMgYSB2YWx1ZSB0aGVuIHVzZSB0aGF0LCBhcyB0aGlzIGlzIGFuIGludmVyc2VcbiAgICAgICAgLy8gb3BlcmF0aW9uLlxuICAgICAgICBuZXdWYWx1ZSA9IHRoaXMudGFza01ldHJpY1ZhbHVlcy5nZXQoaW5kZXgpITtcbiAgICAgIH0gZWxzZSBpZiAob2xkVmFsdWUgPT09IG9sZE1ldHJpY0RlZmluaXRpb24uZGVmYXVsdCkge1xuICAgICAgICAvLyBJZiB0aGUgb2xkVmFsdWUgaXMgdGhlIGRlZmF1bHQsIGNoYW5nZSBpdCB0byB0aGUgbmV3IGRlZmF1bHQuXG4gICAgICAgIG5ld1ZhbHVlID0gdGhpcy5tZXRyaWNEZWZpbml0aW9uLmRlZmF1bHQ7XG4gICAgICAgIHRhc2tNZXRyaWNWYWx1ZXMuc2V0KGluZGV4LCBvbGRWYWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBDbGFtcC5cbiAgICAgICAgbmV3VmFsdWUgPSB0aGlzLm1ldHJpY0RlZmluaXRpb24ucmFuZ2UuY2xhbXAob2xkVmFsdWUpO1xuICAgICAgICBuZXdWYWx1ZSA9IHRoaXMubWV0cmljRGVmaW5pdGlvbi5wcmVjaXNpb24ucm91bmQobmV3VmFsdWUpO1xuICAgICAgICB0YXNrTWV0cmljVmFsdWVzLnNldChpbmRleCwgb2xkVmFsdWUpO1xuICAgICAgfVxuICAgICAgdGFzay5zZXRNZXRyaWModGhpcy5uYW1lLCBuZXdWYWx1ZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZShvbGRNZXRyaWNEZWZpbml0aW9uLCB0YXNrTWV0cmljVmFsdWVzKSxcbiAgICB9KTtcbiAgfVxuXG4gIGludmVyc2UoXG4gICAgb2xkTWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbixcbiAgICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+XG4gICk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFVwZGF0ZU1ldHJpY1N1Yk9wKFxuICAgICAgdGhpcy5uYW1lLFxuICAgICAgb2xkTWV0cmljRGVmaW5pdGlvbixcbiAgICAgIHRhc2tNZXRyaWNWYWx1ZXNcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZXRNZXRyaWNWYWx1ZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBuYW1lOiBzdHJpbmc7XG4gIHZhbHVlOiBudW1iZXI7XG4gIHRhc2tJbmRleDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgdmFsdWU6IG51bWJlciwgdGFza0luZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLnRhc2tJbmRleCA9IHRhc2tJbmRleDtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBtZXRyaWNzRGVmaW5pdGlvbiA9IHBsYW4uZ2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5hbWUpO1xuICAgIGlmIChtZXRyaWNzRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5uYW1lfSBkb2VzIG5vdCBleGlzdCBhcyBhIE1ldHJpY2ApO1xuICAgIH1cblxuICAgIGNvbnN0IHRhc2sgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMudGFza0luZGV4XTtcbiAgICBjb25zdCBvbGRWYWx1ZSA9IHRhc2suZ2V0TWV0cmljKHRoaXMubmFtZSkgfHwgbWV0cmljc0RlZmluaXRpb24uZGVmYXVsdDtcbiAgICB0YXNrLnNldE1ldHJpYyh0aGlzLm5hbWUsIG1ldHJpY3NEZWZpbml0aW9uLnByZWNpc2lvbi5yb3VuZCh0aGlzLnZhbHVlKSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2Uob2xkVmFsdWUpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSh2YWx1ZTogbnVtYmVyKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgU2V0TWV0cmljVmFsdWVTdWJPcCh0aGlzLm5hbWUsIHZhbHVlLCB0aGlzLnRhc2tJbmRleCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFkZE1ldHJpY09wKFxuICBuYW1lOiBzdHJpbmcsXG4gIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb25cbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IEFkZE1ldHJpY1N1Yk9wKG5hbWUsIG1ldHJpY0RlZmluaXRpb24pXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZWxldGVNZXRyaWNPcChuYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBEZWxldGVNZXRyaWNTdWJPcChuYW1lKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmVuYW1lTWV0cmljT3Aob2xkTmFtZTogc3RyaW5nLCBuZXdOYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBSZW5hbWVNZXRyaWNTdWJPcChvbGROYW1lLCBuZXdOYW1lKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gVXBkYXRlTWV0cmljT3AoXG4gIG5hbWU6IHN0cmluZyxcbiAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvblxuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgVXBkYXRlTWV0cmljU3ViT3AobmFtZSwgbWV0cmljRGVmaW5pdGlvbildKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNldE1ldHJpY1ZhbHVlT3AoXG4gIG5hbWU6IHN0cmluZyxcbiAgdmFsdWU6IG51bWJlcixcbiAgdGFza0luZGV4OiBudW1iZXJcbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFNldE1ldHJpY1ZhbHVlU3ViT3AobmFtZSwgdmFsdWUsIHRhc2tJbmRleCldKTtcbn1cbiIsICIvLyBFYWNoIFJlc291cnNlIGhhcyBhIGtleSwgd2hpY2ggaXMgdGhlIG5hbWUsIGFuZCBhIGxpc3Qgb2YgYWNjZXB0YWJsZSB2YWx1ZXMuXG4vLyBUaGUgbGlzdCBvZiB2YWx1ZXMgY2FuIG5ldmVyIGJlIGVtcHR5LCBhbmQgdGhlIGZpcnN0IHZhbHVlIGluIGB2YWx1ZXNgIGlzIHRoZVxuLy8gZGVmYXVsdCB2YWx1ZSBmb3IgYSBSZXNvdXJjZS5cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUkVTT1VSQ0VfVkFMVUUgPSBcIlwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlc291cmNlRGVmaW5pdGlvblNlcmlhbGl6ZWQge1xuICB2YWx1ZXM6IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgY2xhc3MgUmVzb3VyY2VEZWZpbml0aW9uIHtcbiAgdmFsdWVzOiBzdHJpbmdbXTtcbiAgaXNTdGF0aWM6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgdmFsdWVzOiBzdHJpbmdbXSA9IFtERUZBVUxUX1JFU09VUkNFX1ZBTFVFXSxcbiAgICBpc1N0YXRpYzogYm9vbGVhbiA9IGZhbHNlXG4gICkge1xuICAgIHRoaXMudmFsdWVzID0gdmFsdWVzO1xuICAgIHRoaXMuaXNTdGF0aWMgPSBpc1N0YXRpYztcbiAgfVxuXG4gIHRvSlNPTigpOiBSZXNvdXJjZURlZmluaXRpb25TZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsdWVzOiB0aGlzLnZhbHVlcyxcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIEZyb21KU09OKHM6IFJlc291cmNlRGVmaW5pdGlvblNlcmlhbGl6ZWQpOiBSZXNvdXJjZURlZmluaXRpb24ge1xuICAgIHJldHVybiBuZXcgUmVzb3VyY2VEZWZpbml0aW9uKHMudmFsdWVzKTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBSZXNvdXJjZURlZmluaXRpb25zID0geyBba2V5OiBzdHJpbmddOiBSZXNvdXJjZURlZmluaXRpb24gfTtcbmV4cG9ydCB0eXBlIFJlc291cmNlRGVmaW5pdGlvbnNTZXJpYWxpemVkID0ge1xuICBba2V5OiBzdHJpbmddOiBSZXNvdXJjZURlZmluaXRpb25TZXJpYWxpemVkO1xufTtcbiIsICJpbXBvcnQgeyBSZXN1bHQsIG9rLCBlcnJvciB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuLnRzXCI7XG5pbXBvcnQgeyBPcCwgU3ViT3AsIFN1Yk9wUmVzdWx0IH0gZnJvbSBcIi4vb3BzLnRzXCI7XG5pbXBvcnQge1xuICBERUZBVUxUX1JFU09VUkNFX1ZBTFVFLFxuICBSZXNvdXJjZURlZmluaXRpb24sXG59IGZyb20gXCIuLi9yZXNvdXJjZXMvcmVzb3VyY2VzLnRzXCI7XG5pbXBvcnQgeyBUYXNrIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5cbmV4cG9ydCBjbGFzcyBBZGRSZXNvdXJjZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcblxuICAvLyBNYXBzIGFuIGluZGV4IG9mIGEgVGFzayB0byBhIHZhbHVlIGZvciB0aGUgZ2l2ZW4gcmVzb3VyY2Uga2V5LlxuICB0YXNrUmVzb3VyY2VWYWx1ZXM6IE1hcDxudW1iZXIsIHN0cmluZz47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHRhc2tSZXNvdXJjZVZhbHVlczogTWFwPG51bWJlciwgc3RyaW5nPiA9IG5ldyBNYXA8bnVtYmVyLCBzdHJpbmc+KCkgLy8gU2hvdWxkIG9ubHkgYmUgc3VwcGxpZWQgYnkgaW52ZXJzZSBhY3Rpb25zLlxuICApIHtcbiAgICB0aGlzLmtleSA9IG5hbWU7XG4gICAgdGhpcy50YXNrUmVzb3VyY2VWYWx1ZXMgPSB0YXNrUmVzb3VyY2VWYWx1ZXM7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZm91bmRNYXRjaCA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZm91bmRNYXRjaCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGFscmVhZHkgZXhpc3RzIGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG5cbiAgICBwbGFuLnNldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSwgbmV3IFJlc291cmNlRGVmaW5pdGlvbigpKTtcblxuICAgIC8vIE5vdyBsb29wIG92ZXIgZXZlcnkgdGFzayBhbmQgYWRkIHRoaXMga2V5IGFuZCBzZXQgaXQgdG8gdGhlIGRlZmF1bHQsIHVubGVzc1xuICAgIC8vIHRoZXJlIGlzIG1hdGNoaW5nIGVudHJ5IGluIHRhc2tSZXNvdXJjZVZhbHVlcywgaW4gd2hpY2ggY2FzZSB3ZSB3aWxsIHVzZSB0aGF0IHZhbHVlLlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgdGFzay5zZXRSZXNvdXJjZShcbiAgICAgICAgdGhpcy5rZXksXG4gICAgICAgIHRoaXMudGFza1Jlc291cmNlVmFsdWVzLmdldChpbmRleCkgfHwgREVGQVVMVF9SRVNPVVJDRV9WQUxVRVxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBEZWxldGVSZXNvdXJjZVN1cE9wKHRoaXMua2V5KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVsZXRlUmVzb3VyY2VTdXBPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5rZXkgPSBuYW1lO1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IHJlc291cmNlRGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAocmVzb3VyY2VEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYFRoZSByZXNvdXJjZSB3aXRoIG5hbWUgJHt0aGlzLmtleX0gZG9lcyBub3QgZXhpc3QgYW5kIGNhbid0IGJlIGRlbGV0ZWQuYFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgZnJvbSByZXNvdXJjZSBkZWZpbml0aW9ucy5cbiAgICBwbGFuLmRlbGV0ZU1ldHJpY0RlZmluaXRpb24odGhpcy5rZXkpO1xuXG4gICAgY29uc3QgdGFza0luZGV4VG9EZWxldGVkUmVzb3VyY2VWYWx1ZTogTWFwPG51bWJlciwgc3RyaW5nPiA9IG5ldyBNYXAoKTtcblxuICAgIC8vIE5vdyBsb29rIGF0IGFsbCBUYXNrcyBhbmQgcmVtb3ZlIGB0aGlzLmtleWAgZnJvbSB0aGUgcmVzb3VyY2VzIHdoaWxlIGFsc29cbiAgICAvLyBidWlsZGluZyB1cCB0aGUgaW5mbyBuZWVkZWQgZm9yIGEgcmV2ZXJ0LlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSB0YXNrLmdldFJlc291cmNlKHRoaXMua2V5KSB8fCBERUZBVUxUX1JFU09VUkNFX1ZBTFVFO1xuICAgICAgdGFza0luZGV4VG9EZWxldGVkUmVzb3VyY2VWYWx1ZS5zZXQoaW5kZXgsIHZhbHVlKTtcbiAgICAgIHRhc2suZGVsZXRlUmVzb3VyY2UodGhpcy5rZXkpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UodGFza0luZGV4VG9EZWxldGVkUmVzb3VyY2VWYWx1ZSksXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGludmVyc2UoXG4gICAgcmVzb3VyY2VWYWx1ZXNGb3JEZWxldGVkUmVzb3VyY2VLZXk6IE1hcDxudW1iZXIsIHN0cmluZz5cbiAgKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgQWRkUmVzb3VyY2VTdWJPcCh0aGlzLmtleSwgcmVzb3VyY2VWYWx1ZXNGb3JEZWxldGVkUmVzb3VyY2VLZXkpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBZGRSZXNvdXJjZU9wdGlvblN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcbiAgdmFsdWU6IHN0cmluZztcbiAgaW5kaWNlc09mVGFza3NUb0NoYW5nZTogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBrZXk6IHN0cmluZyxcbiAgICB2YWx1ZTogc3RyaW5nLFxuICAgIGluZGljZXNPZlRhc2tzVG9DaGFuZ2U6IG51bWJlcltdID0gW10gLy8gVGhpcyBzaG91bGQgb25seSBiZSBzdXBwbGllZCB3aGVuIGJlaW5nIGNvbnN0cnVjdGVkIGFzIGEgaW52ZXJzZSBvcGVyYXRpb24uXG4gICkge1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLmluZGljZXNPZlRhc2tzVG9DaGFuZ2UgPSBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlO1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGRlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKGRlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2Vzbid0IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG4gICAgY29uc3QgZXhpc3RpbmdJbmRleCA9IGRlZmluaXRpb24udmFsdWVzLmZpbmRJbmRleChcbiAgICAgICh2YWx1ZTogc3RyaW5nKSA9PiB2YWx1ZSA9PT0gdGhpcy52YWx1ZVxuICAgICk7XG4gICAgaWYgKGV4aXN0aW5nSW5kZXggIT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGAke3RoaXMudmFsdWV9IGFscmVhZHkgZXhpc3RzIGFzIGEgdmFsdWUgaW4gdGhlIFJlc291cmNlICR7dGhpcy5rZXl9LmBcbiAgICAgICk7XG4gICAgfVxuICAgIGRlZmluaXRpb24udmFsdWVzLnB1c2godGhpcy52YWx1ZSk7XG5cbiAgICAvLyBOb3cgbG9vayBhdCBhbGwgVGFza3MgYW5kIHNldCB0aGUgdmFsdWUgZm9yIHRoZSBnaXZlbiBrZXkgZm9yIGFsbCB0aGVcbiAgICAvLyB0YXNrcyBsaXN0ZWQgaW4gYGluZGljZXNPZlRhc2tzVG9DaGFuZ2VgLlxuICAgIHRoaXMuaW5kaWNlc09mVGFza3NUb0NoYW5nZS5mb3JFYWNoKCh0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgcGxhbi5jaGFydC5WZXJ0aWNlc1t0YXNrSW5kZXhdLnNldFJlc291cmNlKHRoaXMua2V5LCB0aGlzLnZhbHVlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IERlbGV0ZVJlc291cmNlT3B0aW9uU3ViT3AoXG4gICAgICB0aGlzLmtleSxcbiAgICAgIHRoaXMudmFsdWUsXG4gICAgICB0aGlzLmluZGljZXNPZlRhc2tzVG9DaGFuZ2VcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWxldGVSZXNvdXJjZU9wdGlvblN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcbiAgdmFsdWU6IHN0cmluZztcbiAgaW5kaWNlc09mVGFza3NUb0NoYW5nZTogbnVtYmVyW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgdmFsdWU6IHN0cmluZyxcbiAgICBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlOiBudW1iZXJbXSA9IFtdXG4gICkge1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLmluZGljZXNPZlRhc2tzVG9DaGFuZ2UgPSBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlO1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGRlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKGRlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2Vzbid0IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG4gICAgY29uc3QgdmFsdWVJbmRleCA9IGRlZmluaXRpb24udmFsdWVzLmZpbmRJbmRleChcbiAgICAgICh2YWx1ZTogc3RyaW5nKSA9PiB2YWx1ZSA9PT0gdGhpcy52YWx1ZVxuICAgICk7XG4gICAgaWYgKHZhbHVlSW5kZXggPT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGAke3RoaXMudmFsdWV9IGRvZXMgbm90IGV4aXN0IGFzIGEgdmFsdWUgaW4gdGhlIFJlc291cmNlICR7dGhpcy5rZXl9LmBcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChkZWZpbml0aW9uLnZhbHVlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYFJlc291cmNlcyBtdXN0IGhhdmUgYXQgbGVhc3Qgb25lIHZhbHVlLiAke3RoaXMudmFsdWV9IG9ubHkgaGFzIG9uZSB2YWx1ZSwgc28gaXQgY2FuJ3QgYmUgZGVsZXRlZC4gYFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBkZWZpbml0aW9uLnZhbHVlcy5zcGxpY2UodmFsdWVJbmRleCwgMSk7XG5cbiAgICAvLyBOb3cgaXRlcmF0ZSB0aG91Z2ggYWxsIHRoZSB0YXNrcyBhbmQgY2hhbmdlIGFsbCB0YXNrcyB0aGF0IGhhdmVcbiAgICAvLyBcImtleTp2YWx1ZVwiIHRvIGluc3RlYWQgYmUgXCJrZXk6ZGVmYXVsdFwiLiBSZWNvcmQgd2hpY2ggdGFza3MgZ290IGNoYW5nZWRcbiAgICAvLyBzbyB0aGF0IHdlIGNhbiB1c2UgdGhhdCBpbmZvcm1hdGlvbiB3aGVuIHdlIGNyZWF0ZSB0aGUgaW52ZXJ0IG9wZXJhdGlvbi5cblxuICAgIGNvbnN0IGluZGljZXNPZlRhc2tzV2l0aE1hdGNoaW5nUmVzb3VyY2VWYWx1ZXM6IG51bWJlcltdID0gW107XG5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IHJlc291cmNlVmFsdWUgPSB0YXNrLmdldFJlc291cmNlKHRoaXMua2V5KTtcbiAgICAgIGlmIChyZXNvdXJjZVZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBTaW5jZSB0aGUgdmFsdWUgaXMgbm8gbG9uZ2VyIHZhbGlkIHdlIGNoYW5nZSBpdCBiYWNrIHRvIHRoZSBkZWZhdWx0LlxuICAgICAgdGFzay5zZXRSZXNvdXJjZSh0aGlzLmtleSwgZGVmaW5pdGlvbi52YWx1ZXNbMF0pO1xuXG4gICAgICAvLyBSZWNvcmQgd2hpY2ggdGFzayB3ZSBqdXN0IGNoYW5nZWQuXG4gICAgICBpbmRpY2VzT2ZUYXNrc1dpdGhNYXRjaGluZ1Jlc291cmNlVmFsdWVzLnB1c2goaW5kZXgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UoaW5kaWNlc09mVGFza3NXaXRoTWF0Y2hpbmdSZXNvdXJjZVZhbHVlcyksXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGludmVyc2UoaW5kaWNlc09mVGFza3NUb0NoYW5nZTogbnVtYmVyW10pOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBBZGRSZXNvdXJjZU9wdGlvblN1Yk9wKFxuICAgICAgdGhpcy5rZXksXG4gICAgICB0aGlzLnZhbHVlLFxuICAgICAgaW5kaWNlc09mVGFza3NUb0NoYW5nZVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbmFtZVJlc291cmNlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG9sZEtleTogc3RyaW5nO1xuICBuZXdLZXk6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihvbGRLZXk6IHN0cmluZywgbmV3S2V5OiBzdHJpbmcpIHtcbiAgICB0aGlzLm9sZEtleSA9IG9sZEtleTtcbiAgICB0aGlzLm5ld0tleSA9IG5ld0tleTtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBvbGREZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5vbGRLZXkpO1xuICAgIGlmIChvbGREZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm9sZEtleX0gZG9lcyBub3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cblxuICAgIC8vIENvbmZpcm0gdGhlIG5ld0tleSBpcyBub3QgYWxyZWFkeSB1c2VkLlxuICAgIGNvbnN0IG5ld0tleURlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLm5ld0tleSk7XG4gICAgaWYgKG5ld0tleURlZmluaXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmV3S2V5fSBhbHJlYWR5IGV4aXN0cyBhcyBhIHJlc291cmNlIG5hbWUuYCk7XG4gICAgfVxuXG4gICAgcGxhbi5kZWxldGVSZXNvdXJjZURlZmluaXRpb24odGhpcy5vbGRLZXkpO1xuICAgIHBsYW4uc2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMubmV3S2V5LCBvbGREZWZpbml0aW9uKTtcblxuICAgIC8vIE5vdyBsb29wIG92ZXIgZXZlcnkgdGFzayBhbmQgY2hhbmdlIG9sZEtleSAtPiBuZXdrZXkgZm9yIHRoZSBnaXZlbiByZXNvdXJjZSBrZXkuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICBjb25zdCBjdXJyZW50VmFsdWUgPVxuICAgICAgICB0YXNrLmdldFJlc291cmNlKHRoaXMub2xkS2V5KSB8fCBERUZBVUxUX1JFU09VUkNFX1ZBTFVFO1xuICAgICAgdGFzay5zZXRSZXNvdXJjZSh0aGlzLm5ld0tleSwgY3VycmVudFZhbHVlKTtcbiAgICAgIHRhc2suZGVsZXRlUmVzb3VyY2UodGhpcy5vbGRLZXkpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFJlbmFtZVJlc291cmNlU3ViT3AodGhpcy5uZXdLZXksIHRoaXMub2xkS2V5KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVuYW1lUmVzb3VyY2VPcHRpb25TdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG4gIG9sZFZhbHVlOiBzdHJpbmc7XG4gIG5ld1ZhbHVlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Ioa2V5OiBzdHJpbmcsIG9sZFZhbHVlOiBzdHJpbmcsIG5ld1ZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLm9sZFZhbHVlID0gb2xkVmFsdWU7XG4gICAgdGhpcy5uZXdWYWx1ZSA9IG5ld1ZhbHVlO1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGZvdW5kTWF0Y2ggPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKGZvdW5kTWF0Y2ggPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2VzIG5vdCBleGlzdCBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuXG4gICAgLy8gQ29uZmlybSB0aGUgb2xkVmFsdWUgaXMgaW4gdGhlcmUuXG4gICAgY29uc3Qgb2xkVmFsdWVJbmRleCA9IGZvdW5kTWF0Y2gudmFsdWVzLmluZGV4T2YodGhpcy5vbGRWYWx1ZSk7XG5cbiAgICBpZiAob2xkVmFsdWVJbmRleCA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lcyBub3QgYSB2YWx1ZSAke3RoaXMub2xkVmFsdWV9YCk7XG4gICAgfVxuXG4gICAgLy8gQ29uZmlybSB0aGUgbmV3VmFsdWUgaXMgbm90IGluIHRoZXJlLlxuICAgIGNvbnN0IG5ld1ZhbHVlSW5kZXggPSBmb3VuZE1hdGNoLnZhbHVlcy5pbmRleE9mKHRoaXMubmV3VmFsdWUpO1xuICAgIGlmIChuZXdWYWx1ZUluZGV4ICE9PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBhbHJlYWR5IGhhcyBhIHZhbHVlICR7dGhpcy5uZXdWYWx1ZX1gKTtcbiAgICB9XG5cbiAgICAvLyBTd2FwIHRoZSB2YWx1ZXMuXG4gICAgZm91bmRNYXRjaC52YWx1ZXMuc3BsaWNlKG9sZFZhbHVlSW5kZXgsIDEsIHRoaXMubmV3VmFsdWUpO1xuXG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCBjaGFuZ2Ugb2xkVmFsdWUgLT4gbmV3VmFsdWUgZm9yIHRoZSBnaXZlbiByZXNvdXJjZSBrZXkuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICBjb25zdCBjdXJyZW50VmFsdWUgPSB0YXNrLmdldFJlc291cmNlKHRoaXMua2V5KTtcbiAgICAgIGlmIChjdXJyZW50VmFsdWUgPT09IHRoaXMub2xkVmFsdWUpIHtcbiAgICAgICAgdGFzay5zZXRSZXNvdXJjZSh0aGlzLmtleSwgdGhpcy5uZXdWYWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgUmVuYW1lUmVzb3VyY2VPcHRpb25TdWJPcChcbiAgICAgIHRoaXMua2V5LFxuICAgICAgdGhpcy5uZXdWYWx1ZSxcbiAgICAgIHRoaXMub2xkVmFsdWVcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBNb3ZlUmVzb3VyY2VPcHRpb25TdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG4gIG9sZEluZGV4OiBudW1iZXI7XG4gIG5ld0luZGV4OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Ioa2V5OiBzdHJpbmcsIG9sZFZhbHVlOiBudW1iZXIsIG5ld1ZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLm9sZEluZGV4ID0gb2xkVmFsdWU7XG4gICAgdGhpcy5uZXdJbmRleCA9IG5ld1ZhbHVlO1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGRlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKGRlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2VzIG5vdCBleGlzdCBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub2xkSW5kZXggPiBkZWZpbml0aW9uLnZhbHVlcy5sZW5ndGggLSAxKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGAke3RoaXMua2V5fSBkb2VzIG5vdCBoYXZlIGEgdmFsdWUgYXQgaW5kZXggJHt0aGlzLm9sZEluZGV4fWBcbiAgICAgICk7XG4gICAgfVxuICAgIGlmICh0aGlzLm5ld0luZGV4ID4gZGVmaW5pdGlvbi52YWx1ZXMubGVuZ3RoIC0gMSkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgJHt0aGlzLmtleX0gZG9lcyBub3QgaGF2ZSBhIHZhbHVlIGF0IGluZGV4ICR7dGhpcy5uZXdJbmRleH1gXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIFN3YXAgdGhlIHZhbHVlcy5cbiAgICBjb25zdCB0bXAgPSBkZWZpbml0aW9uLnZhbHVlc1t0aGlzLm9sZEluZGV4XTtcbiAgICBkZWZpbml0aW9uLnZhbHVlc1t0aGlzLm9sZEluZGV4XSA9IGRlZmluaXRpb24udmFsdWVzW3RoaXMubmV3SW5kZXhdO1xuICAgIGRlZmluaXRpb24udmFsdWVzW3RoaXMubmV3SW5kZXhdID0gdG1wO1xuXG4gICAgLy8gV2UgZG9uJ3QgbmVlZCB0byBkbyBhbnl0aGluZyB3aXRoIFRhc2tzIGJlY2F1c2UgdGhlIGluZGV4IG9mIGEgdmFsdWUgaXNcbiAgICAvLyBpcnJlbGV2YW50IHNpbmNlIHdlIHN0b3JlIHRoZSB2YWx1ZSBpdHNlbGYsIG5vdCB0aGUgaW5kZXguXG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgTW92ZVJlc291cmNlT3B0aW9uU3ViT3AodGhpcy5rZXksIHRoaXMubmV3SW5kZXgsIHRoaXMub2xkSW5kZXgpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZXRSZXNvdXJjZVZhbHVlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuICB2YWx1ZTogc3RyaW5nO1xuICB0YXNrSW5kZXg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZywgdGFza0luZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy50YXNrSW5kZXggPSB0YXNrSW5kZXg7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZm91bmRNYXRjaCA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZm91bmRNYXRjaCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXMgbm90IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG5cbiAgICBjb25zdCBmb3VuZFZhbHVlTWF0Y2ggPSBmb3VuZE1hdGNoLnZhbHVlcy5maW5kSW5kZXgoKHY6IHN0cmluZykgPT4ge1xuICAgICAgcmV0dXJuIHYgPT09IHRoaXMudmFsdWU7XG4gICAgfSk7XG4gICAgaWYgKGZvdW5kVmFsdWVNYXRjaCA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lcyBub3QgaGF2ZSBhIHZhbHVlIG9mICR7dGhpcy52YWx1ZX1gKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGFza0luZGV4IDwgMCB8fCB0aGlzLnRhc2tJbmRleCA+PSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGVycm9yKGBUaGVyZSBpcyBubyBUYXNrIGF0IGluZGV4ICR7dGhpcy50YXNrSW5kZXh9YCk7XG4gICAgfVxuXG4gICAgY29uc3QgdGFzayA9IHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdO1xuICAgIGNvbnN0IG9sZFZhbHVlID0gdGFzay5nZXRSZXNvdXJjZSh0aGlzLmtleSkhO1xuICAgIHRhc2suc2V0UmVzb3VyY2UodGhpcy5rZXksIHRoaXMudmFsdWUpO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG9sZFZhbHVlKSB9KTtcbiAgfVxuXG4gIGludmVyc2Uob2xkVmFsdWU6IHN0cmluZyk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFNldFJlc291cmNlVmFsdWVTdWJPcCh0aGlzLmtleSwgb2xkVmFsdWUsIHRoaXMudGFza0luZGV4KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQWRkUmVzb3VyY2VPcChuYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBBZGRSZXNvdXJjZVN1Yk9wKG5hbWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZWxldGVSZXNvdXJjZU9wKG5hbWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IERlbGV0ZVJlc291cmNlU3VwT3AobmFtZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFkZFJlc291cmNlT3B0aW9uT3Aoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBBZGRSZXNvdXJjZU9wdGlvblN1Yk9wKGtleSwgdmFsdWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZWxldGVSZXNvdXJjZU9wdGlvbk9wKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgRGVsZXRlUmVzb3VyY2VPcHRpb25TdWJPcChrZXksIHZhbHVlKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmVuYW1lUmVzb3VyY2VPcHRpb25PcChcbiAga2V5OiBzdHJpbmcsXG4gIG9sZFZhbHVlOiBzdHJpbmcsXG4gIG5ld1ZhbHVlOiBzdHJpbmdcbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFJlbmFtZVJlc291cmNlT3B0aW9uU3ViT3Aoa2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZW5hbWVSZXNvdXJjZU9wKG9sZFZhbHVlOiBzdHJpbmcsIG5ld1ZhbHVlOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBSZW5hbWVSZXNvdXJjZVN1Yk9wKG9sZFZhbHVlLCBuZXdWYWx1ZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIE1vdmVSZXNvdXJjZU9wdGlvbk9wKFxuICBrZXk6IHN0cmluZyxcbiAgb2xkSW5kZXg6IG51bWJlcixcbiAgbmV3SW5kZXg6IG51bWJlclxuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgTW92ZVJlc291cmNlT3B0aW9uU3ViT3Aoa2V5LCBvbGRJbmRleCwgbmV3SW5kZXgpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZXRSZXNvdXJjZVZhbHVlT3AoXG4gIGtleTogc3RyaW5nLFxuICB2YWx1ZTogc3RyaW5nLFxuICB0YXNrSW5kZXg6IG51bWJlclxuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgU2V0UmVzb3VyY2VWYWx1ZVN1Yk9wKGtleSwgdmFsdWUsIHRhc2tJbmRleCldKTtcbn1cbiIsICJpbXBvcnQge1xuICBWZXJ0ZXgsXG4gIFZlcnRleEluZGljZXMsXG4gIERpcmVjdGVkR3JhcGgsXG4gIGVkZ2VzQnlTcmNUb01hcCxcbn0gZnJvbSBcIi4uL2RhZy50c1wiO1xuXG4vKipcblRoZSByZXR1cm4gdHlwZSBmb3IgdGhlIFRvcGxvZ2ljYWxTb3J0IGZ1bmN0aW9uLiBcbiAqL1xudHlwZSBUU1JldHVybiA9IHtcbiAgaGFzQ3ljbGVzOiBib29sZWFuO1xuXG4gIGN5Y2xlOiBWZXJ0ZXhJbmRpY2VzO1xuXG4gIG9yZGVyOiBWZXJ0ZXhJbmRpY2VzO1xufTtcblxuLyoqXG5SZXR1cm5zIGEgdG9wb2xvZ2ljYWwgc29ydCBvcmRlciBmb3IgYSBEaXJlY3RlZEdyYXBoLCBvciB0aGUgbWVtYmVycyBvZiBhIGN5Y2xlIGlmIGFcbnRvcG9sb2dpY2FsIHNvcnQgY2FuJ3QgYmUgZG9uZS5cbiBcbiBUaGUgdG9wb2xvZ2ljYWwgc29ydCBjb21lcyBmcm9tOlxuXG4gICAgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVG9wb2xvZ2ljYWxfc29ydGluZyNEZXB0aC1maXJzdF9zZWFyY2hcblxuTCBcdTIxOTAgRW1wdHkgbGlzdCB0aGF0IHdpbGwgY29udGFpbiB0aGUgc29ydGVkIG5vZGVzXG53aGlsZSBleGlzdHMgbm9kZXMgd2l0aG91dCBhIHBlcm1hbmVudCBtYXJrIGRvXG4gICAgc2VsZWN0IGFuIHVubWFya2VkIG5vZGUgblxuICAgIHZpc2l0KG4pXG5cbmZ1bmN0aW9uIHZpc2l0KG5vZGUgbilcbiAgICBpZiBuIGhhcyBhIHBlcm1hbmVudCBtYXJrIHRoZW5cbiAgICAgICAgcmV0dXJuXG4gICAgaWYgbiBoYXMgYSB0ZW1wb3JhcnkgbWFyayB0aGVuXG4gICAgICAgIHN0b3AgICAoZ3JhcGggaGFzIGF0IGxlYXN0IG9uZSBjeWNsZSlcblxuICAgIG1hcmsgbiB3aXRoIGEgdGVtcG9yYXJ5IG1hcmtcblxuICAgIGZvciBlYWNoIG5vZGUgbSB3aXRoIGFuIGVkZ2UgZnJvbSBuIHRvIG0gZG9cbiAgICAgICAgdmlzaXQobSlcblxuICAgIHJlbW92ZSB0ZW1wb3JhcnkgbWFyayBmcm9tIG5cbiAgICBtYXJrIG4gd2l0aCBhIHBlcm1hbmVudCBtYXJrXG4gICAgYWRkIG4gdG8gaGVhZCBvZiBMXG5cbiAqL1xuZXhwb3J0IGNvbnN0IHRvcG9sb2dpY2FsU29ydCA9IChnOiBEaXJlY3RlZEdyYXBoKTogVFNSZXR1cm4gPT4ge1xuICBjb25zdCByZXQ6IFRTUmV0dXJuID0ge1xuICAgIGhhc0N5Y2xlczogZmFsc2UsXG4gICAgY3ljbGU6IFtdLFxuICAgIG9yZGVyOiBbXSxcbiAgfTtcblxuICBjb25zdCBlZGdlTWFwID0gZWRnZXNCeVNyY1RvTWFwKGcuRWRnZXMpO1xuXG4gIGNvbnN0IG5vZGVzV2l0aG91dFBlcm1hbmVudE1hcmsgPSBuZXcgU2V0PG51bWJlcj4oKTtcbiAgZy5WZXJ0aWNlcy5mb3JFYWNoKChfOiBWZXJ0ZXgsIGluZGV4OiBudW1iZXIpID0+XG4gICAgbm9kZXNXaXRob3V0UGVybWFuZW50TWFyay5hZGQoaW5kZXgpXG4gICk7XG5cbiAgY29uc3QgaGFzUGVybWFuZW50TWFyayA9IChpbmRleDogbnVtYmVyKTogYm9vbGVhbiA9PiB7XG4gICAgcmV0dXJuICFub2Rlc1dpdGhvdXRQZXJtYW5lbnRNYXJrLmhhcyhpbmRleCk7XG4gIH07XG5cbiAgY29uc3QgdGVtcG9yYXJ5TWFyayA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuXG4gIGNvbnN0IHZpc2l0ID0gKGluZGV4OiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgICBpZiAoaGFzUGVybWFuZW50TWFyayhpbmRleCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAodGVtcG9yYXJ5TWFyay5oYXMoaW5kZXgpKSB7XG4gICAgICAvLyBXZSBvbmx5IHJldHVybiBmYWxzZSBvbiBmaW5kaW5nIGEgbG9vcCwgd2hpY2ggaXMgc3RvcmVkIGluXG4gICAgICAvLyB0ZW1wb3JhcnlNYXJrLlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0ZW1wb3JhcnlNYXJrLmFkZChpbmRleCk7XG5cbiAgICBjb25zdCBuZXh0RWRnZXMgPSBlZGdlTWFwLmdldChpbmRleCk7XG4gICAgaWYgKG5leHRFZGdlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5leHRFZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBlID0gbmV4dEVkZ2VzW2ldO1xuICAgICAgICBpZiAoIXZpc2l0KGUuaikpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0ZW1wb3JhcnlNYXJrLmRlbGV0ZShpbmRleCk7XG4gICAgbm9kZXNXaXRob3V0UGVybWFuZW50TWFyay5kZWxldGUoaW5kZXgpO1xuICAgIHJldC5vcmRlci51bnNoaWZ0KGluZGV4KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBXZSB3aWxsIHByZXN1bWUgdGhhdCBWZXJ0ZXhbMF0gaXMgdGhlIHN0YXJ0IG5vZGUgYW5kIHRoYXQgd2Ugc2hvdWxkIHN0YXJ0IHRoZXJlLlxuICBjb25zdCBvayA9IHZpc2l0KDApO1xuICBpZiAoIW9rKSB7XG4gICAgcmV0Lmhhc0N5Y2xlcyA9IHRydWU7XG4gICAgcmV0LmN5Y2xlID0gWy4uLnRlbXBvcmFyeU1hcmsua2V5cygpXTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59O1xuIiwgImltcG9ydCB7IFJlc3VsdCwgb2ssIGVycm9yIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHtcbiAgVmVydGV4SW5kaWNlcyxcbiAgRWRnZXMsXG4gIERpcmVjdGVkR3JhcGgsXG4gIGVkZ2VzQnlTcmNUb01hcCxcbiAgZWRnZXNCeURzdFRvTWFwLFxuICBEaXJlY3RlZEVkZ2UsXG4gIERpcmVjdGVkRWRnZVNlcmlhbGl6ZWQsXG59IGZyb20gXCIuLi9kYWcvZGFnXCI7XG5cbmltcG9ydCB7IHRvcG9sb2dpY2FsU29ydCB9IGZyb20gXCIuLi9kYWcvYWxnb3JpdGhtcy90b3Bvc29ydC50c1wiO1xuaW1wb3J0IHsgTWV0cmljVmFsdWVzIH0gZnJvbSBcIi4uL21ldHJpY3MvbWV0cmljcy50c1wiO1xuXG5leHBvcnQgdHlwZSBUYXNrU3RhdGUgPSBcInVuc3RhcnRlZFwiIHwgXCJzdGFydGVkXCIgfCBcImNvbXBsZXRlXCI7XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1RBU0tfTkFNRSA9IFwiVGFzayBOYW1lXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFza1NlcmlhbGl6ZWQge1xuICByZXNvdXJjZXM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XG4gIG1ldHJpY3M6IE1ldHJpY1ZhbHVlcztcbiAgbmFtZTogc3RyaW5nO1xuICBzdGF0ZTogVGFza1N0YXRlO1xufVxuXG4vLyBEbyB3ZSBjcmVhdGUgc3ViLWNsYXNzZXMgYW5kIHRoZW4gc2VyaWFsaXplIHNlcGFyYXRlbHk/IE9yIGRvIHdlIGhhdmUgYVxuLy8gY29uZmlnIGFib3V0IHdoaWNoIHR5cGUgb2YgRHVyYXRpb25TYW1wbGVyIGlzIGJlaW5nIHVzZWQ/XG4vL1xuLy8gV2UgY2FuIHVzZSB0cmFkaXRpb25hbCBvcHRpbWlzdGljL3Blc3NpbWlzdGljIHZhbHVlLiBPciBKYWNvYmlhbidzXG4vLyB1bmNlcnRhaW50bHkgbXVsdGlwbGllcnMgWzEuMSwgMS41LCAyLCA1XSBhbmQgdGhlaXIgaW52ZXJzZXMgdG8gZ2VuZXJhdGUgYW5cbi8vIG9wdGltaXN0aWMgcGVzc2ltaXN0aWMuXG5cbi8qKiBUYXNrIGlzIGEgVmVydGV4IHdpdGggZGV0YWlscyBhYm91dCB0aGUgVGFzayB0byBjb21wbGV0ZS4gKi9cbmV4cG9ydCBjbGFzcyBUYXNrIHtcbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nID0gXCJcIikge1xuICAgIHRoaXMubmFtZSA9IG5hbWUgfHwgREVGQVVMVF9UQVNLX05BTUU7XG4gICAgdGhpcy5tZXRyaWNzID0ge307XG4gICAgdGhpcy5yZXNvdXJjZXMgPSB7fTtcbiAgfVxuXG4gIC8vIFJlc291cmNlIGtleXMgYW5kIHZhbHVlcy4gVGhlIHBhcmVudCBwbGFuIGNvbnRhaW5zIGFsbCB0aGUgcmVzb3VyY2VcbiAgLy8gZGVmaW5pdGlvbnMuXG5cbiAgcmVzb3VyY2VzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xuXG4gIG1ldHJpY3M6IE1ldHJpY1ZhbHVlcztcblxuICBuYW1lOiBzdHJpbmc7XG5cbiAgc3RhdGU6IFRhc2tTdGF0ZSA9IFwidW5zdGFydGVkXCI7XG5cbiAgdG9KU09OKCk6IFRhc2tTZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzb3VyY2VzOiB0aGlzLnJlc291cmNlcyxcbiAgICAgIG1ldHJpY3M6IHRoaXMubWV0cmljcyxcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgIHN0YXRlOiB0aGlzLnN0YXRlLFxuICAgIH07XG4gIH1cblxuICBwdWJsaWMgZ2V0IGR1cmF0aW9uKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TWV0cmljKFwiRHVyYXRpb25cIikhO1xuICB9XG5cbiAgcHVibGljIHNldCBkdXJhdGlvbih2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5zZXRNZXRyaWMoXCJEdXJhdGlvblwiLCB2YWx1ZSk7XG4gIH1cblxuICBwdWJsaWMgZ2V0TWV0cmljKGtleTogc3RyaW5nKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5tZXRyaWNzW2tleV07XG4gIH1cblxuICBwdWJsaWMgc2V0TWV0cmljKGtleTogc3RyaW5nLCB2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5tZXRyaWNzW2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBkZWxldGVNZXRyaWMoa2V5OiBzdHJpbmcpIHtcbiAgICBkZWxldGUgdGhpcy5tZXRyaWNzW2tleV07XG4gIH1cblxuICBwdWJsaWMgZ2V0UmVzb3VyY2Uoa2V5OiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLnJlc291cmNlc1trZXldO1xuICB9XG5cbiAgcHVibGljIHNldFJlc291cmNlKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5yZXNvdXJjZXNba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGRlbGV0ZVJlc291cmNlKGtleTogc3RyaW5nKSB7XG4gICAgZGVsZXRlIHRoaXMucmVzb3VyY2VzW2tleV07XG4gIH1cblxuICBwdWJsaWMgZHVwKCk6IFRhc2sge1xuICAgIGNvbnN0IHJldCA9IG5ldyBUYXNrKCk7XG4gICAgcmV0LnJlc291cmNlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMucmVzb3VyY2VzKTtcbiAgICByZXQubWV0cmljcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMubWV0cmljcyk7XG4gICAgcmV0Lm5hbWUgPSB0aGlzLm5hbWU7XG4gICAgcmV0LnN0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICByZXR1cm4gcmV0O1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFRhc2tzID0gVGFza1tdO1xuXG5leHBvcnQgaW50ZXJmYWNlIENoYXJ0U2VyaWFsaXplZCB7XG4gIHZlcnRpY2VzOiBUYXNrU2VyaWFsaXplZFtdO1xuICBlZGdlczogRGlyZWN0ZWRFZGdlU2VyaWFsaXplZFtdO1xufVxuXG4vKiogQSBDaGFydCBpcyBhIERpcmVjdGVkR3JhcGgsIGJ1dCB3aXRoIFRhc2tzIGZvciBWZXJ0aWNlcy4gKi9cbmV4cG9ydCBjbGFzcyBDaGFydCB7XG4gIFZlcnRpY2VzOiBUYXNrcztcbiAgRWRnZXM6IEVkZ2VzO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGNvbnN0IHN0YXJ0ID0gbmV3IFRhc2soXCJTdGFydFwiKTtcbiAgICBzdGFydC5zZXRNZXRyaWMoXCJEdXJhdGlvblwiLCAwKTtcbiAgICBjb25zdCBmaW5pc2ggPSBuZXcgVGFzayhcIkZpbmlzaFwiKTtcbiAgICBmaW5pc2guc2V0TWV0cmljKFwiRHVyYXRpb25cIiwgMCk7XG4gICAgdGhpcy5WZXJ0aWNlcyA9IFtzdGFydCwgZmluaXNoXTtcbiAgICB0aGlzLkVkZ2VzID0gW25ldyBEaXJlY3RlZEVkZ2UoMCwgMSldO1xuICB9XG5cbiAgdG9KU09OKCk6IENoYXJ0U2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZlcnRpY2VzOiB0aGlzLlZlcnRpY2VzLm1hcCgodDogVGFzaykgPT4gdC50b0pTT04oKSksXG4gICAgICBlZGdlczogdGhpcy5FZGdlcy5tYXAoKGU6IERpcmVjdGVkRWRnZSkgPT4gZS50b0pTT04oKSksXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBUb3BvbG9naWNhbE9yZGVyID0gVmVydGV4SW5kaWNlcztcblxuZXhwb3J0IHR5cGUgVmFsaWRhdGVSZXN1bHQgPSBSZXN1bHQ8VG9wb2xvZ2ljYWxPcmRlcj47XG5cbi8qKiBWYWxpZGF0ZXMgYSBEaXJlY3RlZEdyYXBoIGlzIGEgdmFsaWQgQ2hhcnQuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVDaGFydChnOiBEaXJlY3RlZEdyYXBoKTogVmFsaWRhdGVSZXN1bHQge1xuICBpZiAoZy5WZXJ0aWNlcy5sZW5ndGggPCAyKSB7XG4gICAgcmV0dXJuIGVycm9yKFxuICAgICAgXCJDaGFydCBtdXN0IGNvbnRhaW4gYXQgbGVhc3QgdHdvIG5vZGUsIHRoZSBzdGFydCBhbmQgZmluaXNoIHRhc2tzLlwiXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN0IGVkZ2VzQnlEc3QgPSBlZGdlc0J5RHN0VG9NYXAoZy5FZGdlcyk7XG4gIGNvbnN0IGVkZ2VzQnlTcmMgPSBlZGdlc0J5U3JjVG9NYXAoZy5FZGdlcyk7XG5cbiAgLy8gVGhlIGZpcnN0IFZlcnRleCwgVF8wIGFrYSB0aGUgU3RhcnQgTWlsZXN0b25lLCBtdXN0IGhhdmUgMCBpbmNvbWluZyBlZGdlcy5cbiAgaWYgKGVkZ2VzQnlEc3QuZ2V0KDApICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gZXJyb3IoXCJUaGUgc3RhcnQgbm9kZSAoMCkgaGFzIGFuIGluY29taW5nIGVkZ2UuXCIpO1xuICB9XG5cbiAgLy8gQW5kIG9ubHkgVF8wIHNob3VsZCBoYXZlIDAgaW5jb21pbmcgZWRnZXMuXG4gIGZvciAobGV0IGkgPSAxOyBpIDwgZy5WZXJ0aWNlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChlZGdlc0J5RHN0LmdldChpKSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGBGb3VuZCBub2RlIHRoYXQgaXNuJ3QgKDApIHRoYXQgaGFzIG5vIGluY29taW5nIGVkZ2VzOiAke2l9YFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvLyBUaGUgbGFzdCBWZXJ0ZXgsIFRfZmluaXNoLCB0aGUgRmluaXNoIE1pbGVzdG9uZSwgbXVzdCBoYXZlIDAgb3V0Z29pbmcgZWRnZXMuXG4gIGlmIChlZGdlc0J5U3JjLmdldChnLlZlcnRpY2VzLmxlbmd0aCAtIDEpICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBcIlRoZSBsYXN0IG5vZGUsIHdoaWNoIHNob3VsZCBiZSB0aGUgRmluaXNoIE1pbGVzdG9uZSwgaGFzIGFuIG91dGdvaW5nIGVkZ2UuXCJcbiAgICApO1xuICB9XG5cbiAgLy8gQW5kIG9ubHkgVF9maW5pc2ggc2hvdWxkIGhhdmUgMCBvdXRnb2luZyBlZGdlcy5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBnLlZlcnRpY2VzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgIGlmIChlZGdlc0J5U3JjLmdldChpKSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGBGb3VuZCBub2RlIHRoYXQgaXNuJ3QgVF9maW5pc2ggdGhhdCBoYXMgbm8gb3V0Z29pbmcgZWRnZXM6ICR7aX1gXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG51bVZlcnRpY2VzID0gZy5WZXJ0aWNlcy5sZW5ndGg7XG4gIC8vIEFuZCBhbGwgZWRnZXMgbWFrZSBzZW5zZSwgaS5lLiB0aGV5IGFsbCBwb2ludCB0byB2ZXJ0ZXhlcyB0aGF0IGV4aXN0LlxuICBmb3IgKGxldCBpID0gMDsgaSA8IGcuRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBlbGVtZW50ID0gZy5FZGdlc1tpXTtcbiAgICBpZiAoXG4gICAgICBlbGVtZW50LmkgPCAwIHx8XG4gICAgICBlbGVtZW50LmkgPj0gbnVtVmVydGljZXMgfHxcbiAgICAgIGVsZW1lbnQuaiA8IDAgfHxcbiAgICAgIGVsZW1lbnQuaiA+PSBudW1WZXJ0aWNlc1xuICAgICkge1xuICAgICAgcmV0dXJuIGVycm9yKGBFZGdlICR7ZWxlbWVudH0gcG9pbnRzIHRvIGEgbm9uLWV4aXN0ZW50IFZlcnRleC5gKTtcbiAgICB9XG4gIH1cblxuICAvLyBOb3cgd2UgY29uZmlybSB0aGF0IHdlIGhhdmUgYSBEaXJlY3RlZCBBY3ljbGljIEdyYXBoLCBpLmUuIHRoZSBncmFwaCBoYXMgbm9cbiAgLy8gY3ljbGVzIGJ5IGNyZWF0aW5nIGEgdG9wb2xvZ2ljYWwgc29ydCBzdGFydGluZyBhdCBUXzBcbiAgLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVG9wb2xvZ2ljYWxfc29ydGluZyNEZXB0aC1maXJzdF9zZWFyY2hcbiAgY29uc3QgdHNSZXQgPSB0b3BvbG9naWNhbFNvcnQoZyk7XG4gIGlmICh0c1JldC5oYXNDeWNsZXMpIHtcbiAgICByZXR1cm4gZXJyb3IoYENoYXJ0IGhhcyBjeWNsZTogJHtbLi4udHNSZXQuY3ljbGVdLmpvaW4oXCIsIFwiKX1gKTtcbiAgfVxuXG4gIHJldHVybiBvayh0c1JldC5vcmRlcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDaGFydFZhbGlkYXRlKGM6IENoYXJ0KTogVmFsaWRhdGVSZXN1bHQge1xuICBjb25zdCByZXQgPSB2YWxpZGF0ZUNoYXJ0KGMpO1xuICBpZiAoIXJldC5vaykge1xuICAgIHJldHVybiByZXQ7XG4gIH1cbiAgaWYgKGMuVmVydGljZXNbMF0uZHVyYXRpb24gIT09IDApIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBgU3RhcnQgTWlsZXN0b25lIG11c3QgaGF2ZSBkdXJhdGlvbiBvZiAwLCBpbnN0ZWFkIGdvdCAke2MuVmVydGljZXNbMF0uZHVyYXRpb259YFxuICAgICk7XG4gIH1cbiAgaWYgKGMuVmVydGljZXNbYy5WZXJ0aWNlcy5sZW5ndGggLSAxXS5kdXJhdGlvbiAhPT0gMCkge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIGBGaW5pc2ggTWlsZXN0b25lIG11c3QgaGF2ZSBkdXJhdGlvbiBvZiAwLCBpbnN0ZWFkIGdvdCAke1xuICAgICAgICBjLlZlcnRpY2VzW2MuVmVydGljZXMubGVuZ3RoIC0gMV0uZHVyYXRpb25cbiAgICAgIH1gXG4gICAgKTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuIiwgImltcG9ydCB7IFJvdW5kZXIgfSBmcm9tIFwiLi4vdHlwZXMvdHlwZXNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBQcmVjaXNpb25TZXJpYWxpemVkIHtcbiAgcHJlY2lzaW9uOiBudW1iZXI7XG59XG5leHBvcnQgY2xhc3MgUHJlY2lzaW9uIHtcbiAgcHJpdmF0ZSBtdWx0aXBsaWVyOiBudW1iZXI7XG4gIHByaXZhdGUgX3ByZWNpc2lvbjogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHByZWNpc2lvbjogbnVtYmVyID0gMCkge1xuICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHByZWNpc2lvbikpIHtcbiAgICAgIHByZWNpc2lvbiA9IDA7XG4gICAgfVxuICAgIHRoaXMuX3ByZWNpc2lvbiA9IE1hdGguYWJzKE1hdGgudHJ1bmMocHJlY2lzaW9uKSk7XG4gICAgdGhpcy5tdWx0aXBsaWVyID0gMTAgKiogdGhpcy5fcHJlY2lzaW9uO1xuICB9XG5cbiAgcm91bmQoeDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gTWF0aC50cnVuYyh4ICogdGhpcy5tdWx0aXBsaWVyKSAvIHRoaXMubXVsdGlwbGllcjtcbiAgfVxuXG4gIHJvdW5kZXIoKTogUm91bmRlciB7XG4gICAgcmV0dXJuICh4OiBudW1iZXIpOiBudW1iZXIgPT4gdGhpcy5yb3VuZCh4KTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgcHJlY2lzaW9uKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3ByZWNpc2lvbjtcbiAgfVxuXG4gIHRvSlNPTigpOiBQcmVjaXNpb25TZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgcHJlY2lzaW9uOiB0aGlzLl9wcmVjaXNpb24sXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBGcm9tSlNPTihzOiBQcmVjaXNpb25TZXJpYWxpemVkIHwgdW5kZWZpbmVkKTogUHJlY2lzaW9uIHtcbiAgICBpZiAocyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbmV3IFByZWNpc2lvbigpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByZWNpc2lvbihzLnByZWNpc2lvbik7XG4gIH1cbn1cbiIsICIvLyBVdGlsaXRpZXMgZm9yIGRlYWxpbmcgd2l0aCBhIHJhbmdlIG9mIG51bWJlcnMuXG5cbmV4cG9ydCBpbnRlcmZhY2UgTWV0cmljUmFuZ2VTZXJpYWxpemVkIHtcbiAgbWluOiBudW1iZXI7XG4gIG1heDogbnVtYmVyO1xufVxuXG5leHBvcnQgY29uc3QgY2xhbXAgPSAoeDogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIpOiBudW1iZXIgPT4ge1xuICBpZiAoeCA+IG1heCkge1xuICAgIHJldHVybiBtYXg7XG4gIH1cbiAgaWYgKHggPCBtaW4pIHtcbiAgICByZXR1cm4gbWluO1xuICB9XG4gIHJldHVybiB4O1xufTtcblxuLy8gUmFuZ2UgZGVmaW5lcyBhIHJhbmdlIG9mIG51bWJlcnMsIGZyb20gW21pbiwgbWF4XSBpbmNsdXNpdmUuXG5leHBvcnQgY2xhc3MgTWV0cmljUmFuZ2Uge1xuICBwcml2YXRlIF9taW46IG51bWJlciA9IC1OdW1iZXIuTUFYX1ZBTFVFO1xuICBwcml2YXRlIF9tYXg6IG51bWJlciA9IE51bWJlci5NQVhfVkFMVUU7XG5cbiAgY29uc3RydWN0b3IobWluOiBudW1iZXIgPSAtTnVtYmVyLk1BWF9WQUxVRSwgbWF4OiBudW1iZXIgPSBOdW1iZXIuTUFYX1ZBTFVFKSB7XG4gICAgaWYgKG1heCA8IG1pbikge1xuICAgICAgW21pbiwgbWF4XSA9IFttYXgsIG1pbl07XG4gICAgfVxuICAgIHRoaXMuX21pbiA9IG1pbjtcbiAgICB0aGlzLl9tYXggPSBtYXg7XG4gIH1cblxuICBjbGFtcCh2YWx1ZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gY2xhbXAodmFsdWUsIHRoaXMuX21pbiwgdGhpcy5fbWF4KTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWluKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX21pbjtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWF4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX21heDtcbiAgfVxuXG4gIHRvSlNPTigpOiBNZXRyaWNSYW5nZVNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICBtaW46IHRoaXMuX21pbixcbiAgICAgIG1heDogdGhpcy5fbWF4LFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgRnJvbUpTT04oczogTWV0cmljUmFuZ2VTZXJpYWxpemVkIHwgdW5kZWZpbmVkKTogTWV0cmljUmFuZ2Uge1xuICAgIGlmIChzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBuZXcgTWV0cmljUmFuZ2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBNZXRyaWNSYW5nZShzLm1pbiwgcy5tYXgpO1xuICB9XG59XG4iLCAiLy8gTWV0cmljcyBkZWZpbmUgZmxvYXRpbmcgcG9pbnQgdmFsdWVzIHRoYXQgYXJlIHRyYWNrZWQgcGVyIFRhc2suXG5cbmltcG9ydCB7IFByZWNpc2lvbiwgUHJlY2lzaW9uU2VyaWFsaXplZCB9IGZyb20gXCIuLi9wcmVjaXNpb24vcHJlY2lzaW9uLnRzXCI7XG5pbXBvcnQgeyBjbGFtcCwgTWV0cmljUmFuZ2UsIE1ldHJpY1JhbmdlU2VyaWFsaXplZCB9IGZyb20gXCIuL3JhbmdlLnRzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWV0cmljRGVmaW5pdGlvblNlcmlhbGl6ZWQge1xuICByYW5nZTogTWV0cmljUmFuZ2VTZXJpYWxpemVkO1xuICBkZWZhdWx0OiBudW1iZXI7XG4gIHByZWNpc2lvbjogUHJlY2lzaW9uU2VyaWFsaXplZDtcbn1cblxuZXhwb3J0IGNsYXNzIE1ldHJpY0RlZmluaXRpb24ge1xuICByYW5nZTogTWV0cmljUmFuZ2U7XG4gIGRlZmF1bHQ6IG51bWJlcjtcbiAgaXNTdGF0aWM6IGJvb2xlYW47XG4gIHByZWNpc2lvbjogUHJlY2lzaW9uO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGRlZmF1bHRWYWx1ZTogbnVtYmVyLFxuICAgIHJhbmdlOiBNZXRyaWNSYW5nZSA9IG5ldyBNZXRyaWNSYW5nZSgpLFxuICAgIGlzU3RhdGljOiBib29sZWFuID0gZmFsc2UsXG4gICAgcHJlY2lzaW9uOiBQcmVjaXNpb24gPSBuZXcgUHJlY2lzaW9uKDEpXG4gICkge1xuICAgIHRoaXMucmFuZ2UgPSByYW5nZTtcbiAgICB0aGlzLmRlZmF1bHQgPSBjbGFtcChkZWZhdWx0VmFsdWUsIHJhbmdlLm1pbiwgcmFuZ2UubWF4KTtcbiAgICB0aGlzLmlzU3RhdGljID0gaXNTdGF0aWM7XG4gICAgdGhpcy5wcmVjaXNpb24gPSBwcmVjaXNpb247XG4gIH1cblxuICB0b0pTT04oKTogTWV0cmljRGVmaW5pdGlvblNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICByYW5nZTogdGhpcy5yYW5nZS50b0pTT04oKSxcbiAgICAgIGRlZmF1bHQ6IHRoaXMuZGVmYXVsdCxcbiAgICAgIHByZWNpc2lvbjogdGhpcy5wcmVjaXNpb24udG9KU09OKCksXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBGcm9tSlNPTihzOiBNZXRyaWNEZWZpbml0aW9uU2VyaWFsaXplZCB8IHVuZGVmaW5lZCk6IE1ldHJpY0RlZmluaXRpb24ge1xuICAgIGlmIChzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBuZXcgTWV0cmljRGVmaW5pdGlvbigwKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBNZXRyaWNEZWZpbml0aW9uKFxuICAgICAgcy5kZWZhdWx0IHx8IDAsXG4gICAgICBNZXRyaWNSYW5nZS5Gcm9tSlNPTihzLnJhbmdlKSxcbiAgICAgIGZhbHNlLFxuICAgICAgUHJlY2lzaW9uLkZyb21KU09OKHMucHJlY2lzaW9uKVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgTWV0cmljRGVmaW5pdGlvbnMgPSB7IFtrZXk6IHN0cmluZ106IE1ldHJpY0RlZmluaXRpb24gfTtcblxuZXhwb3J0IHR5cGUgTWV0cmljRGVmaW5pdGlvbnNTZXJpYWxpemVkID0ge1xuICBba2V5OiBzdHJpbmddOiBNZXRyaWNEZWZpbml0aW9uU2VyaWFsaXplZDtcbn07XG5cbmV4cG9ydCB0eXBlIE1ldHJpY1ZhbHVlcyA9IHsgW2tleTogc3RyaW5nXTogbnVtYmVyIH07XG4iLCAiLyoqXG4gKiBUcmlhbmd1bGFyIGlzIHRoZSBpbnZlcnNlIEN1bXVsYXRpdmUgRGVuc2l0eSBGdW5jdGlvbiAoQ0RGKSBmb3IgdGhlXG4gKiB0cmlhbmd1bGFyIGRpc3RyaWJ1dGlvbi5cbiAqXG4gKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Ucmlhbmd1bGFyX2Rpc3RyaWJ1dGlvbiNHZW5lcmF0aW5nX3JhbmRvbV92YXJpYXRlc1xuICpcbiAqIFRoZSBpbnZlcnNlIG9mIHRoZSBDREYgaXMgdXNlZnVsIGZvciBnZW5lcmF0aW5nIHNhbXBsZXMgZnJvbSB0aGVcbiAqIGRpc3RyaWJ1dGlvbiwgaS5lLiBwYXNzaW5nIGluIHZhbHVlcyBmcm9tIHRoZSB1bmlmb3JtIGRpc3RyaWJ1dGlvbiBbMCwgMV1cbiAqIHdpbGwgcHJvZHVjZSBzYW1wbGUgdGhhdCBsb29rIGxpa2UgdGhleSBjb21lIGZyb20gdGhlIHRyaWFuZ3VsYXJcbiAqIGRpc3RyaWJ1dGlvbi5cbiAqXG4gKlxuICovXG5cbmV4cG9ydCBjbGFzcyBUcmlhbmd1bGFyIHtcbiAgcHJpdmF0ZSBhOiBudW1iZXI7XG4gIHByaXZhdGUgYjogbnVtYmVyO1xuICBwcml2YXRlIGM6IG51bWJlcjtcbiAgcHJpdmF0ZSBGX2M6IG51bWJlcjtcblxuICAvKiogIFRoZSB0cmlhbmd1bGFyIGRpc3RyaWJ1dGlvbiBpcyBhIGNvbnRpbnVvdXMgcHJvYmFiaWxpdHkgZGlzdHJpYnV0aW9uIHdpdGhcbiAgbG93ZXIgbGltaXQgYGFgLCB1cHBlciBsaW1pdCBgYmAsIGFuZCBtb2RlIGBjYCwgd2hlcmUgYSA8IGIgYW5kIGEgXHUyMjY0IGMgXHUyMjY0IGIuICovXG4gIGNvbnN0cnVjdG9yKGE6IG51bWJlciwgYjogbnVtYmVyLCBjOiBudW1iZXIpIHtcbiAgICB0aGlzLmEgPSBhO1xuICAgIHRoaXMuYiA9IGI7XG4gICAgdGhpcy5jID0gYztcblxuICAgIC8vIEZfYyBpcyB0aGUgY3V0b2ZmIGluIHRoZSBkb21haW4gd2hlcmUgd2Ugc3dpdGNoIGJldHdlZW4gdGhlIHR3byBoYWx2ZXMgb2ZcbiAgICAvLyB0aGUgdHJpYW5nbGUuXG4gICAgdGhpcy5GX2MgPSAoYyAtIGEpIC8gKGIgLSBhKTtcbiAgfVxuXG4gIC8qKiAgUHJvZHVjZSBhIHNhbXBsZSBmcm9tIHRoZSB0cmlhbmd1bGFyIGRpc3RyaWJ1dGlvbi4gVGhlIHZhbHVlIG9mICdwJ1xuICAgc2hvdWxkIGJlIGluIFswLCAxLjBdLiAqL1xuICBzYW1wbGUocDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICBpZiAocCA8IDApIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH0gZWxzZSBpZiAocCA+IDEuMCkge1xuICAgICAgcmV0dXJuIDEuMDtcbiAgICB9IGVsc2UgaWYgKHAgPCB0aGlzLkZfYykge1xuICAgICAgcmV0dXJuIHRoaXMuYSArIE1hdGguc3FydChwICogKHRoaXMuYiAtIHRoaXMuYSkgKiAodGhpcy5jIC0gdGhpcy5hKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHRoaXMuYiAtIE1hdGguc3FydCgoMSAtIHApICogKHRoaXMuYiAtIHRoaXMuYSkgKiAodGhpcy5iIC0gdGhpcy5jKSlcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG4iLCAiaW1wb3J0IHsgVHJpYW5ndWxhciB9IGZyb20gXCIuL3RyaWFuZ3VsYXIudHNcIjtcblxuZXhwb3J0IHR5cGUgVW5jZXJ0YWludHkgPSBcImxvd1wiIHwgXCJtb2RlcmF0ZVwiIHwgXCJoaWdoXCIgfCBcImV4dHJlbWVcIjtcblxuZXhwb3J0IGNvbnN0IFVuY2VydGFpbnR5VG9OdW06IFJlY29yZDxVbmNlcnRhaW50eSwgbnVtYmVyPiA9IHtcbiAgbG93OiAxLjEsXG4gIG1vZGVyYXRlOiAxLjUsXG4gIGhpZ2g6IDIsXG4gIGV4dHJlbWU6IDUsXG59O1xuXG5leHBvcnQgY2xhc3MgSmFjb2JpYW4ge1xuICBwcml2YXRlIHRyaWFuZ3VsYXI6IFRyaWFuZ3VsYXI7XG4gIGNvbnN0cnVjdG9yKGV4cGVjdGVkOiBudW1iZXIsIHVuY2VydGFpbnR5OiBVbmNlcnRhaW50eSkge1xuICAgIGNvbnN0IG11bCA9IFVuY2VydGFpbnR5VG9OdW1bdW5jZXJ0YWludHldO1xuICAgIHRoaXMudHJpYW5ndWxhciA9IG5ldyBUcmlhbmd1bGFyKGV4cGVjdGVkIC8gbXVsLCBleHBlY3RlZCAqIG11bCwgZXhwZWN0ZWQpO1xuICB9XG5cbiAgc2FtcGxlKHA6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMudHJpYW5ndWxhci5zYW1wbGUocCk7XG4gIH1cbn1cbiIsICJpbXBvcnQge1xuICBDaGFydCxcbiAgQ2hhcnRTZXJpYWxpemVkLFxuICBUYXNrLFxuICBUYXNrU2VyaWFsaXplZCxcbiAgdmFsaWRhdGVDaGFydCxcbn0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBEaXJlY3RlZEVkZ2UsIERpcmVjdGVkRWRnZVNlcmlhbGl6ZWQgfSBmcm9tIFwiLi4vZGFnL2RhZy50c1wiO1xuaW1wb3J0IHtcbiAgTWV0cmljRGVmaW5pdGlvbixcbiAgTWV0cmljRGVmaW5pdGlvbnMsXG4gIE1ldHJpY0RlZmluaXRpb25zU2VyaWFsaXplZCxcbn0gZnJvbSBcIi4uL21ldHJpY3MvbWV0cmljcy50c1wiO1xuaW1wb3J0IHsgTWV0cmljUmFuZ2UgfSBmcm9tIFwiLi4vbWV0cmljcy9yYW5nZS50c1wiO1xuaW1wb3J0IHsgUmF0aW9uYWxpemVFZGdlc09wIH0gZnJvbSBcIi4uL29wcy9jaGFydC50c1wiO1xuaW1wb3J0IHtcbiAgUmVzb3VyY2VEZWZpbml0aW9uLFxuICBSZXNvdXJjZURlZmluaXRpb25zLFxuICBSZXNvdXJjZURlZmluaXRpb25zU2VyaWFsaXplZCxcbn0gZnJvbSBcIi4uL3Jlc291cmNlcy9yZXNvdXJjZXMudHNcIjtcbmltcG9ydCB7IFJlc3VsdCwgb2sgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBVbmNlcnRhaW50eVRvTnVtIH0gZnJvbSBcIi4uL3N0YXRzL2NkZi90cmlhbmd1bGFyL2phY29iaWFuLnRzXCI7XG5cbmV4cG9ydCB0eXBlIFN0YXRpY01ldHJpY0tleXMgPSBcIkR1cmF0aW9uXCIgfCBcIlBlcmNlbnQgQ29tcGxldGVcIjtcblxuZXhwb3J0IGNvbnN0IFN0YXRpY01ldHJpY0RlZmluaXRpb25zOiBNZXRyaWNEZWZpbml0aW9ucyA9IHtcbiAgLy8gSG93IGxvbmcgYSB0YXNrIHdpbGwgdGFrZSwgaW4gZGF5cy5cbiAgRHVyYXRpb246IG5ldyBNZXRyaWNEZWZpbml0aW9uKDAsIG5ldyBNZXRyaWNSYW5nZSgpLCB0cnVlKSxcbiAgLy8gVGhlIHBlcmNlbnQgY29tcGxldGUgZm9yIGEgdGFzay5cbiAgUGVyY2VudDogbmV3IE1ldHJpY0RlZmluaXRpb24oMCwgbmV3IE1ldHJpY1JhbmdlKDAsIDEwMCksIHRydWUpLFxufTtcblxuZXhwb3J0IGNvbnN0IFN0YXRpY1Jlc291cmNlRGVmaW5pdGlvbnM6IFJlc291cmNlRGVmaW5pdGlvbnMgPSB7XG4gIFVuY2VydGFpbnR5OiBuZXcgUmVzb3VyY2VEZWZpbml0aW9uKE9iamVjdC5rZXlzKFVuY2VydGFpbnR5VG9OdW0pLCB0cnVlKSxcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGxhblNlcmlhbGl6ZWQge1xuICBjaGFydDogQ2hhcnRTZXJpYWxpemVkO1xuICByZXNvdXJjZURlZmluaXRpb25zOiBSZXNvdXJjZURlZmluaXRpb25zU2VyaWFsaXplZDtcbiAgbWV0cmljRGVmaW5pdGlvbnM6IE1ldHJpY0RlZmluaXRpb25zU2VyaWFsaXplZDtcbn1cblxuZXhwb3J0IGNsYXNzIFBsYW4ge1xuICBjaGFydDogQ2hhcnQ7XG5cbiAgcmVzb3VyY2VEZWZpbml0aW9uczogUmVzb3VyY2VEZWZpbml0aW9ucztcblxuICBtZXRyaWNEZWZpbml0aW9uczogTWV0cmljRGVmaW5pdGlvbnM7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jaGFydCA9IG5ldyBDaGFydCgpO1xuXG4gICAgdGhpcy5yZXNvdXJjZURlZmluaXRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgU3RhdGljUmVzb3VyY2VEZWZpbml0aW9ucyk7XG4gICAgdGhpcy5tZXRyaWNEZWZpbml0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIFN0YXRpY01ldHJpY0RlZmluaXRpb25zKTtcbiAgICB0aGlzLmFwcGx5TWV0cmljc0FuZFJlc291cmNlc1RvVmVydGljZXMoKTtcbiAgfVxuXG4gIGFwcGx5TWV0cmljc0FuZFJlc291cmNlc1RvVmVydGljZXMoKSB7XG4gICAgT2JqZWN0LmtleXModGhpcy5tZXRyaWNEZWZpbml0aW9ucykuZm9yRWFjaCgobWV0cmljTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBtZCA9IHRoaXMubWV0cmljRGVmaW5pdGlvbnNbbWV0cmljTmFtZV0hO1xuICAgICAgdGhpcy5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICAgIHRhc2suc2V0TWV0cmljKG1ldHJpY05hbWUsIG1kLmRlZmF1bHQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgT2JqZWN0LmVudHJpZXModGhpcy5yZXNvdXJjZURlZmluaXRpb25zKS5mb3JFYWNoKFxuICAgICAgKFtrZXksIHJlc291cmNlRGVmaW5pdGlvbl0pID0+IHtcbiAgICAgICAgdGhpcy5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICAgICAgdGFzay5zZXRSZXNvdXJjZShrZXksIHJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXNbMF0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgdG9KU09OKCk6IFBsYW5TZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2hhcnQ6IHRoaXMuY2hhcnQudG9KU09OKCksXG4gICAgICByZXNvdXJjZURlZmluaXRpb25zOiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHRoaXMucmVzb3VyY2VEZWZpbml0aW9ucykuZmlsdGVyKFxuICAgICAgICAgIChba2V5LCByZXNvdXJjZURlZmluaXRpb25dKSA9PiAhcmVzb3VyY2VEZWZpbml0aW9uLmlzU3RhdGljXG4gICAgICAgIClcbiAgICAgICksXG4gICAgICBtZXRyaWNEZWZpbml0aW9uczogT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICBPYmplY3QuZW50cmllcyh0aGlzLm1ldHJpY0RlZmluaXRpb25zKVxuICAgICAgICAgIC5maWx0ZXIoKFtrZXksIG1ldHJpY0RlZmluaXRpb25dKSA9PiAhbWV0cmljRGVmaW5pdGlvbi5pc1N0YXRpYylcbiAgICAgICAgICAubWFwKChba2V5LCBtZXRyaWNEZWZpbml0aW9uXSkgPT4gW2tleSwgbWV0cmljRGVmaW5pdGlvbi50b0pTT04oKV0pXG4gICAgICApLFxuICAgIH07XG4gIH1cblxuICBnZXRNZXRyaWNEZWZpbml0aW9uKGtleTogc3RyaW5nKTogTWV0cmljRGVmaW5pdGlvbiB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMubWV0cmljRGVmaW5pdGlvbnNba2V5XTtcbiAgfVxuXG4gIHNldE1ldHJpY0RlZmluaXRpb24oa2V5OiBzdHJpbmcsIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb24pIHtcbiAgICB0aGlzLm1ldHJpY0RlZmluaXRpb25zW2tleV0gPSBtZXRyaWNEZWZpbml0aW9uO1xuICB9XG5cbiAgZGVsZXRlTWV0cmljRGVmaW5pdGlvbihrZXk6IHN0cmluZykge1xuICAgIGRlbGV0ZSB0aGlzLm1ldHJpY0RlZmluaXRpb25zW2tleV07XG4gIH1cblxuICBnZXRSZXNvdXJjZURlZmluaXRpb24oa2V5OiBzdHJpbmcpOiBSZXNvdXJjZURlZmluaXRpb24gfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLnJlc291cmNlRGVmaW5pdGlvbnNba2V5XTtcbiAgfVxuXG4gIHNldFJlc291cmNlRGVmaW5pdGlvbihrZXk6IHN0cmluZywgdmFsdWU6IFJlc291cmNlRGVmaW5pdGlvbikge1xuICAgIHRoaXMucmVzb3VyY2VEZWZpbml0aW9uc1trZXldID0gdmFsdWU7XG4gIH1cblxuICBkZWxldGVSZXNvdXJjZURlZmluaXRpb24oa2V5OiBzdHJpbmcpIHtcbiAgICBkZWxldGUgdGhpcy5yZXNvdXJjZURlZmluaXRpb25zW2tleV07XG4gIH1cblxuICAvLyBSZXR1cm5zIGEgbmV3IFRhc2sgd2l0aCBkZWZhdWx0cyBmb3IgYWxsIG1ldHJpY3MgYW5kIHJlc291cmNlcy5cbiAgbmV3VGFzaygpOiBUYXNrIHtcbiAgICBjb25zdCByZXQgPSBuZXcgVGFzaygpO1xuICAgIE9iamVjdC5rZXlzKHRoaXMubWV0cmljRGVmaW5pdGlvbnMpLmZvckVhY2goKG1ldHJpY05hbWU6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgbWQgPSB0aGlzLmdldE1ldHJpY0RlZmluaXRpb24obWV0cmljTmFtZSkhO1xuXG4gICAgICByZXQuc2V0TWV0cmljKG1ldHJpY05hbWUsIG1kLmRlZmF1bHQpO1xuICAgIH0pO1xuICAgIE9iamVjdC5lbnRyaWVzKHRoaXMucmVzb3VyY2VEZWZpbml0aW9ucykuZm9yRWFjaChcbiAgICAgIChba2V5LCByZXNvdXJjZURlZmluaXRpb25dKSA9PiB7XG4gICAgICAgIHJldC5zZXRSZXNvdXJjZShrZXksIHJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXNbMF0pO1xuICAgICAgfVxuICAgICk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgRnJvbUpTT04gPSAodGV4dDogc3RyaW5nKTogUmVzdWx0PFBsYW4+ID0+IHtcbiAgY29uc3QgcGxhblNlcmlhbGl6ZWQ6IFBsYW5TZXJpYWxpemVkID0gSlNPTi5wYXJzZSh0ZXh0KTtcbiAgY29uc3QgcGxhbiA9IG5ldyBQbGFuKCk7XG5cbiAgcGxhbi5jaGFydC5WZXJ0aWNlcyA9IHBsYW5TZXJpYWxpemVkLmNoYXJ0LnZlcnRpY2VzLm1hcChcbiAgICAodGFza1NlcmlhbGl6ZWQ6IFRhc2tTZXJpYWxpemVkKTogVGFzayA9PiB7XG4gICAgICBjb25zdCB0YXNrID0gbmV3IFRhc2sodGFza1NlcmlhbGl6ZWQubmFtZSk7XG4gICAgICB0YXNrLnN0YXRlID0gdGFza1NlcmlhbGl6ZWQuc3RhdGU7XG4gICAgICB0YXNrLm1ldHJpY3MgPSB0YXNrU2VyaWFsaXplZC5tZXRyaWNzO1xuICAgICAgdGFzay5yZXNvdXJjZXMgPSB0YXNrU2VyaWFsaXplZC5yZXNvdXJjZXM7XG5cbiAgICAgIHJldHVybiB0YXNrO1xuICAgIH1cbiAgKTtcbiAgcGxhbi5jaGFydC5FZGdlcyA9IHBsYW5TZXJpYWxpemVkLmNoYXJ0LmVkZ2VzLm1hcChcbiAgICAoZGlyZWN0ZWRFZGdlU2VyaWFsaXplZDogRGlyZWN0ZWRFZGdlU2VyaWFsaXplZCk6IERpcmVjdGVkRWRnZSA9PlxuICAgICAgbmV3IERpcmVjdGVkRWRnZShkaXJlY3RlZEVkZ2VTZXJpYWxpemVkLmksIGRpcmVjdGVkRWRnZVNlcmlhbGl6ZWQuailcbiAgKTtcblxuICBjb25zdCBkZXNlcmlhbGl6ZWRNZXRyaWNEZWZpbml0aW9ucyA9IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICBPYmplY3QuZW50cmllcyhwbGFuU2VyaWFsaXplZC5tZXRyaWNEZWZpbml0aW9ucykubWFwKFxuICAgICAgKFtrZXksIHNlcmlhbGl6ZWRNZXRyaWNEZWZpbml0aW9uXSkgPT4gW1xuICAgICAgICBrZXksXG4gICAgICAgIE1ldHJpY0RlZmluaXRpb24uRnJvbUpTT04oc2VyaWFsaXplZE1ldHJpY0RlZmluaXRpb24pLFxuICAgICAgXVxuICAgIClcbiAgKTtcblxuICBwbGFuLm1ldHJpY0RlZmluaXRpb25zID0gT2JqZWN0LmFzc2lnbihcbiAgICB7fSxcbiAgICBTdGF0aWNNZXRyaWNEZWZpbml0aW9ucyxcbiAgICBkZXNlcmlhbGl6ZWRNZXRyaWNEZWZpbml0aW9uc1xuICApO1xuXG4gIGNvbnN0IGRlc2VyaWFsaXplZFJlc291cmNlRGVmaW5pdGlvbnMgPSBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgT2JqZWN0LmVudHJpZXMocGxhblNlcmlhbGl6ZWQucmVzb3VyY2VEZWZpbml0aW9ucykubWFwKFxuICAgICAgKFtrZXksIHNlcmlhbGl6ZWRSZXNvdXJjZURlZmluaXRpb25dKSA9PiBbXG4gICAgICAgIGtleSxcbiAgICAgICAgUmVzb3VyY2VEZWZpbml0aW9uLkZyb21KU09OKHNlcmlhbGl6ZWRSZXNvdXJjZURlZmluaXRpb24pLFxuICAgICAgXVxuICAgIClcbiAgKTtcblxuICBwbGFuLnJlc291cmNlRGVmaW5pdGlvbnMgPSBPYmplY3QuYXNzaWduKFxuICAgIHt9LFxuICAgIFN0YXRpY1Jlc291cmNlRGVmaW5pdGlvbnMsXG4gICAgZGVzZXJpYWxpemVkUmVzb3VyY2VEZWZpbml0aW9uc1xuICApO1xuXG4gIGNvbnN0IHJldCA9IFJhdGlvbmFsaXplRWRnZXNPcCgpLmFwcGx5KHBsYW4pO1xuICBpZiAoIXJldC5vaykge1xuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBjb25zdCByZXRWYWwgPSB2YWxpZGF0ZUNoYXJ0KHBsYW4uY2hhcnQpO1xuICBpZiAoIXJldFZhbC5vaykge1xuICAgIHJldHVybiByZXRWYWw7XG4gIH1cbiAgcmV0dXJuIG9rKHBsYW4pO1xufTtcbiIsICIvKiogQSBjb29yZGluYXRlIHBvaW50IG9uIHRoZSByZW5kZXJpbmcgc3VyZmFjZS4gKi9cbmV4cG9ydCBjbGFzcyBQb2ludCB7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICB9XG5cbiAgYWRkKHg6IG51bWJlciwgeTogbnVtYmVyKTogUG9pbnQge1xuICAgIHRoaXMueCArPSB4O1xuICAgIHRoaXMueSArPSB5O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc3VtKHJoczogUG9pbnQpOiBQb2ludCB7XG4gICAgcmV0dXJuIG5ldyBQb2ludCh0aGlzLnggKyByaHMueCwgdGhpcy55ICsgcmhzLnkpO1xuICB9XG5cbiAgZXF1YWwocmhzOiBQb2ludCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnggPT09IHJocy54ICYmIHRoaXMueSA9PT0gcmhzLnk7XG4gIH1cblxuICBzZXQocmhzOiBQb2ludCk6IFBvaW50IHtcbiAgICB0aGlzLnggPSByaHMueDtcbiAgICB0aGlzLnkgPSByaHMueTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGR1cCgpOiBQb2ludCB7XG4gICAgcmV0dXJuIG5ldyBQb2ludCh0aGlzLngsIHRoaXMueSk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBQb2ludCB9IGZyb20gXCIuLi9zY2FsZS9wb2ludC50c1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIERyYWdSYW5nZSB7XG4gIGJlZ2luOiBQb2ludDtcbiAgZW5kOiBQb2ludDtcbn1cblxuZXhwb3J0IGNvbnN0IERSQUdfUkFOR0VfRVZFTlQgPSBcImRyYWdyYW5nZVwiO1xuXG4vKiogTW91c2VNb3ZlIHdhdGNoZXMgbW91c2UgZXZlbnRzIGZvciBhIGdpdmVuIEhUTUxFbGVtZW50IGFuZCBlbWl0c1xuICogZXZlbnRzIGFyb3VuZCBkcmFnZ2luZy5cbiAqXG4gKiBUaGUgZW1pdHRlZCBldmVudCBpcyBcImRyYWdyYW5nZVwiIGFuZCBpcyBhIEN1c3RvbUV2ZW50PERyYWdSYW5nZT4uXG4gKlxuICogT25jZSB0aGUgbW91c2UgaXMgcHJlc3NlZCBkb3duIGluIHRoZSBIVE1MRWxlbWVudCBhbiBldmVudCB3aWxsIGJlXG4gKiBlbWl0dGVkIHBlcmlvZGljYWxseSBhcyB0aGUgbW91c2UgbW92ZXMuXG4gKlxuICogT25jZSB0aGUgbW91c2UgaXMgcmVsZWFzZWQsIG9yIGV4aXRzIHRoZSBIVE1MRWxlbWVudCBvbmUgbGFzdCBldmVudFxuICogaXMgZW1pdHRlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIE1vdXNlTW92ZSB7XG4gIGJlZ2luOiBQb2ludCB8IG51bGwgPSBudWxsO1xuICBjdXJyZW50TW92ZUxvY2F0aW9uOiBQb2ludCA9IG5ldyBQb2ludCgwLCAwKTtcbiAgbGFzdE1vdmVTZW50OiBQb2ludCA9IG5ldyBQb2ludCgwLCAwKTtcbiAgZWxlOiBIVE1MRWxlbWVudDtcbiAgaW50ZXJudmFsSGFuZGxlOiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGVsZTogSFRNTEVsZW1lbnQpIHtcbiAgICB0aGlzLmVsZSA9IGVsZTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlZG93bi5iaW5kKHRoaXMpKTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZXVwLmJpbmQodGhpcykpO1xuICAgIGVsZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlbGVhdmUuYmluZCh0aGlzKSk7XG4gIH1cblxuICBkZXRhY2goKSB7XG4gICAgdGhpcy5lbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmVsZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2Vkb3duLmJpbmQodGhpcykpO1xuICAgIHRoaXMuZWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmVsZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlbGVhdmUuYmluZCh0aGlzKSk7XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcm52YWxIYW5kbGUpO1xuICB9XG5cbiAgb25UaW1lb3V0KCkge1xuICAgIGlmICghdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLmVxdWFsKHRoaXMubGFzdE1vdmVTZW50KSkge1xuICAgICAgdGhpcy5lbGUuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgbmV3IEN1c3RvbUV2ZW50PERyYWdSYW5nZT4oRFJBR19SQU5HRV9FVkVOVCwge1xuICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgYmVnaW46IHRoaXMuYmVnaW4hLmR1cCgpLFxuICAgICAgICAgICAgZW5kOiB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24uZHVwKCksXG4gICAgICAgICAgfSxcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgICB0aGlzLmxhc3RNb3ZlU2VudC5zZXQodGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uKTtcbiAgICB9XG4gIH1cblxuICBtb3VzZW1vdmUoZTogTW91c2VFdmVudCkge1xuICAgIGlmICh0aGlzLmJlZ2luID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi54ID0gZS5vZmZzZXRYO1xuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi55ID0gZS5vZmZzZXRZO1xuICB9XG5cbiAgbW91c2Vkb3duKGU6IE1vdXNlRXZlbnQpIHtcbiAgICB0aGlzLmludGVybnZhbEhhbmRsZSA9IHdpbmRvdy5zZXRJbnRlcnZhbCh0aGlzLm9uVGltZW91dC5iaW5kKHRoaXMpLCAxNik7XG4gICAgdGhpcy5iZWdpbiA9IG5ldyBQb2ludChlLm9mZnNldFgsIGUub2Zmc2V0WSk7XG4gIH1cblxuICBtb3VzZXVwKGU6IE1vdXNlRXZlbnQpIHtcbiAgICB0aGlzLmZpbmlzaGVkKG5ldyBQb2ludChlLm9mZnNldFgsIGUub2Zmc2V0WSkpO1xuICB9XG5cbiAgbW91c2VsZWF2ZShlOiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKHRoaXMuYmVnaW4gPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5maW5pc2hlZChuZXcgUG9pbnQoZS5vZmZzZXRYLCBlLm9mZnNldFkpKTtcbiAgfVxuXG4gIGZpbmlzaGVkKGVuZDogUG9pbnQpIHtcbiAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmludGVybnZhbEhhbmRsZSk7XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uID0gZW5kO1xuICAgIHRoaXMub25UaW1lb3V0KCk7XG4gICAgdGhpcy5iZWdpbiA9IG51bGw7XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uID0gbmV3IFBvaW50KDAsIDApO1xuICAgIHRoaXMubGFzdE1vdmVTZW50ID0gbmV3IFBvaW50KDAsIDApO1xuICB9XG59XG4iLCAiZXhwb3J0IGNvbnN0IE1JTl9ESVNQTEFZX1JBTkdFID0gNztcblxuLyoqIFJlcHJlc2VudHMgYSByYW5nZSBvZiBkYXlzIG92ZXIgd2hpY2ggdG8gZGlzcGxheSBhIHpvb21lZCBpbiB2aWV3LCB1c2luZ1xuICogdGhlIGhhbGYtb3BlbiBpbnRlcnZhbCBbYmVnaW4sIGVuZCkuXG4gKi9cbmV4cG9ydCBjbGFzcyBEaXNwbGF5UmFuZ2Uge1xuICBwcml2YXRlIF9iZWdpbjogbnVtYmVyO1xuICBwcml2YXRlIF9lbmQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihiZWdpbjogbnVtYmVyLCBlbmQ6IG51bWJlcikge1xuICAgIHRoaXMuX2JlZ2luID0gYmVnaW47XG4gICAgdGhpcy5fZW5kID0gZW5kO1xuICAgIGlmICh0aGlzLl9iZWdpbiA+IHRoaXMuX2VuZCkge1xuICAgICAgW3RoaXMuX2VuZCwgdGhpcy5fYmVnaW5dID0gW3RoaXMuX2JlZ2luLCB0aGlzLl9lbmRdO1xuICAgIH1cbiAgICBpZiAodGhpcy5fZW5kIC0gdGhpcy5fYmVnaW4gPCBNSU5fRElTUExBWV9SQU5HRSkge1xuICAgICAgdGhpcy5fZW5kID0gdGhpcy5fYmVnaW4gKyBNSU5fRElTUExBWV9SQU5HRTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgaW4oeDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHggPj0gdGhpcy5fYmVnaW4gJiYgeCA8PSB0aGlzLl9lbmQ7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGJlZ2luKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2JlZ2luO1xuICB9XG5cbiAgcHVibGljIGdldCBlbmQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fZW5kO1xuICB9XG5cbiAgcHVibGljIGdldCByYW5nZUluRGF5cygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9lbmQgLSB0aGlzLl9iZWdpbjtcbiAgfVxufVxuIiwgImltcG9ydCB7IGNsYW1wIH0gZnJvbSBcIi4uLy4uL21ldHJpY3MvcmFuZ2UudHNcIjtcbmltcG9ydCB7IFJlbmRlck9wdGlvbnMgfSBmcm9tIFwiLi4vcmVuZGVyZXIudHNcIjtcbmltcG9ydCB7IFBvaW50IH0gZnJvbSBcIi4vcG9pbnQudHNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBEYXlSb3cge1xuICBkYXk6IG51bWJlcjtcbiAgcm93OiBudW1iZXI7XG59XG5cbi8qKiBGZWF0dXJlcyBvZiB0aGUgY2hhcnQgd2UgY2FuIGFzayBmb3IgY29vcmRpbmF0ZXMgb2YsIHdoZXJlIHRoZSB2YWx1ZSByZXR1cm5lZCBpc1xuICogdGhlIHRvcCBsZWZ0IGNvb3JkaW5hdGUgb2YgdGhlIGZlYXR1cmUuXG4gKi9cbmV4cG9ydCBlbnVtIEZlYXR1cmUge1xuICB0YXNrTGluZVN0YXJ0LFxuICB0ZXh0U3RhcnQsXG4gIGdyb3VwVGV4dFN0YXJ0LFxuICBwZXJjZW50U3RhcnQsXG4gIHZlcnRpY2FsQXJyb3dEZXN0VG9wLFxuICB2ZXJ0aWNhbEFycm93RGVzdEJvdHRvbSxcbiAgaG9yaXpvbnRhbEFycm93RGVzdCxcbiAgdmVydGljYWxBcnJvd1N0YXJ0LFxuICBob3Jpem9udGFsQXJyb3dTdGFydCxcbiAgdmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZVRvcCxcbiAgdmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZUJvdHRvbSxcbiAgaG9yaXpvbnRhbEFycm93RGVzdFRvTWlsZXN0b25lLFxuICB2ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lVG9wLFxuICB2ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lQm90dG9tLFxuICBob3Jpem9udGFsQXJyb3dTdGFydEZyb21NaWxlc3RvbmUsXG4gIGdyb3VwRW52ZWxvcGVTdGFydCxcbiAgdGFza0VudmVsb3BlVG9wLFxuXG4gIGRpc3BsYXlSYW5nZVRvcCxcbiAgdGFza1Jvd0JvdHRvbSxcblxuICB0aW1lTWFya1N0YXJ0LFxuICB0aW1lTWFya0VuZCxcbiAgdGltZVRleHRTdGFydCxcblxuICBncm91cFRpdGxlVGV4dFN0YXJ0LFxuXG4gIHRhc2tzQ2xpcFJlY3RPcmlnaW4sXG4gIGdyb3VwQnlPcmlnaW4sXG59XG5cbi8qKiBTaXplcyBvZiBmZWF0dXJlcyBvZiBhIHJlbmRlcmVkIGNoYXJ0LiAqL1xuZXhwb3J0IGVudW0gTWV0cmljIHtcbiAgdGFza0xpbmVIZWlnaHQsXG4gIHBlcmNlbnRIZWlnaHQsXG4gIGFycm93SGVhZEhlaWdodCxcbiAgYXJyb3dIZWFkV2lkdGgsXG4gIG1pbGVzdG9uZURpYW1ldGVyLFxuICBsaW5lRGFzaExpbmUsXG4gIGxpbmVEYXNoR2FwLFxuICB0ZXh0WE9mZnNldCxcbn1cblxuLyoqIE1ha2VzIGEgbnVtYmVyIG9kZCwgYWRkcyBvbmUgaWYgZXZlbi4gKi9cbmNvbnN0IG1ha2VPZGQgPSAobjogbnVtYmVyKTogbnVtYmVyID0+IHtcbiAgaWYgKG4gJSAyID09PSAwKSB7XG4gICAgcmV0dXJuIG4gKyAxO1xuICB9XG4gIHJldHVybiBuO1xufTtcblxuLyoqIFNjYWxlIGNvbnNvbGlkYXRlcyBhbGwgY2FsY3VsYXRpb25zIGFyb3VuZCByZW5kZXJpbmcgYSBjaGFydCBvbnRvIGEgc3VyZmFjZS4gKi9cbmV4cG9ydCBjbGFzcyBTY2FsZSB7XG4gIHByaXZhdGUgZGF5V2lkdGhQeDogbnVtYmVyO1xuICBwcml2YXRlIHJvd0hlaWdodFB4OiBudW1iZXI7XG4gIHByaXZhdGUgYmxvY2tTaXplUHg6IG51bWJlcjtcbiAgcHJpdmF0ZSB0YXNrSGVpZ2h0UHg6IG51bWJlcjtcbiAgcHJpdmF0ZSBsaW5lV2lkdGhQeDogbnVtYmVyO1xuICBwcml2YXRlIG1hcmdpblNpemVQeDogbnVtYmVyO1xuICBwcml2YXRlIHRpbWVsaW5lSGVpZ2h0UHg6IG51bWJlcjtcbiAgcHJpdmF0ZSBvcmlnaW46IFBvaW50O1xuICBwcml2YXRlIHRvdGFsTnVtYmVyT2ZEYXlzOiBudW1iZXI7XG4gIHByaXZhdGUgZ3JvdXBCeUNvbHVtbldpZHRoUHg6IG51bWJlcjtcblxuICBwcml2YXRlIHRpbWVsaW5lT3JpZ2luOiBQb2ludDtcbiAgcHJpdmF0ZSB0YXNrc09yaWdpbjogUG9pbnQ7XG4gIHByaXZhdGUgZ3JvdXBCeU9yaWdpbjogUG9pbnQ7XG4gIHByaXZhdGUgdGFza3NDbGlwUmVjdE9yaWdpbjogUG9pbnQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgICBjYW52YXNXaWR0aFB4OiBudW1iZXIsXG4gICAgdG90YWxOdW1iZXJPZkRheXM6IG51bWJlcixcbiAgICBtYXhHcm91cE5hbWVMZW5ndGg6IG51bWJlciA9IDBcbiAgKSB7XG4gICAgdGhpcy50b3RhbE51bWJlck9mRGF5cyA9IHRvdGFsTnVtYmVyT2ZEYXlzO1xuICAgIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHggPSBtYXhHcm91cE5hbWVMZW5ndGggKiBvcHRzLmZvbnRTaXplUHg7XG5cbiAgICB0aGlzLmJsb2NrU2l6ZVB4ID0gTWF0aC5mbG9vcihvcHRzLmZvbnRTaXplUHggLyAzKTtcbiAgICB0aGlzLnRhc2tIZWlnaHRQeCA9IG1ha2VPZGQoTWF0aC5mbG9vcigodGhpcy5ibG9ja1NpemVQeCAqIDMpIC8gNCkpO1xuICAgIHRoaXMubGluZVdpZHRoUHggPSBtYWtlT2RkKE1hdGguZmxvb3IodGhpcy50YXNrSGVpZ2h0UHggLyAzKSk7XG4gICAgY29uc3QgbWlsZXN0b25lUmFkaXVzID0gTWF0aC5jZWlsKHRoaXMudGFza0hlaWdodFB4IC8gMikgKyB0aGlzLmxpbmVXaWR0aFB4O1xuICAgIHRoaXMubWFyZ2luU2l6ZVB4ID0gbWlsZXN0b25lUmFkaXVzO1xuICAgIHRoaXMudGltZWxpbmVIZWlnaHRQeCA9IG9wdHMuaGFzVGltZWxpbmVcbiAgICAgID8gTWF0aC5jZWlsKChvcHRzLmZvbnRTaXplUHggKiA0KSAvIDMpXG4gICAgICA6IDA7XG5cbiAgICB0aGlzLnRpbWVsaW5lT3JpZ2luID0gbmV3IFBvaW50KG1pbGVzdG9uZVJhZGl1cywgMCk7XG4gICAgdGhpcy5ncm91cEJ5T3JpZ2luID0gbmV3IFBvaW50KDAsIG1pbGVzdG9uZVJhZGl1cyArIHRoaXMudGltZWxpbmVIZWlnaHRQeCk7XG5cbiAgICBsZXQgYmVnaW5PZmZzZXQgPSAwO1xuICAgIGlmIChvcHRzLmRpc3BsYXlSYW5nZSA9PT0gbnVsbCB8fCBvcHRzLmRpc3BsYXlSYW5nZVVzYWdlID09PSBcImhpZ2hsaWdodFwiKSB7XG4gICAgICAvLyBEbyBub3QgZm9yY2UgZGF5V2lkdGhQeCB0byBhbiBpbnRlZ2VyLCBpdCBjb3VsZCBnbyB0byAwIGFuZCBjYXVzZSBhbGxcbiAgICAgIC8vIHRhc2tzIHRvIGJlIHJlbmRlcmVkIGF0IDAgd2lkdGguXG4gICAgICB0aGlzLmRheVdpZHRoUHggPVxuICAgICAgICAoY2FudmFzV2lkdGhQeCAtIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHggLSAyICogdGhpcy5tYXJnaW5TaXplUHgpIC9cbiAgICAgICAgdG90YWxOdW1iZXJPZkRheXM7XG4gICAgICB0aGlzLm9yaWdpbiA9IG5ldyBQb2ludCgwLCAwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU2hvdWxkIHdlIHNldCB4LW1hcmdpbnMgdG8gMCBpZiBhIFN1YlJhbmdlIGlzIHJlcXVlc3RlZD9cbiAgICAgIC8vIE9yIHNob3VsZCB3ZSB0b3RhbGx5IGRyb3AgYWxsIG1hcmdpbnMgZnJvbSBoZXJlIGFuZCBqdXN0IHVzZVxuICAgICAgLy8gQ1NTIG1hcmdpbnMgb24gdGhlIGNhbnZhcyBlbGVtZW50P1xuICAgICAgdGhpcy5kYXlXaWR0aFB4ID1cbiAgICAgICAgKGNhbnZhc1dpZHRoUHggLSB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4IC0gMiAqIHRoaXMubWFyZ2luU2l6ZVB4KSAvXG4gICAgICAgIG9wdHMuZGlzcGxheVJhbmdlLnJhbmdlSW5EYXlzO1xuICAgICAgYmVnaW5PZmZzZXQgPSBNYXRoLmZsb29yKFxuICAgICAgICB0aGlzLmRheVdpZHRoUHggKiBvcHRzLmRpc3BsYXlSYW5nZS5iZWdpbiArIHRoaXMubWFyZ2luU2l6ZVB4XG4gICAgICApO1xuICAgICAgdGhpcy5vcmlnaW4gPSBuZXcgUG9pbnQoLWJlZ2luT2Zmc2V0ICsgdGhpcy5tYXJnaW5TaXplUHgsIDApO1xuICAgIH1cblxuICAgIHRoaXMudGFza3NPcmlnaW4gPSBuZXcgUG9pbnQoXG4gICAgICB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4IC0gYmVnaW5PZmZzZXQgKyBtaWxlc3RvbmVSYWRpdXMsXG4gICAgICB0aGlzLnRpbWVsaW5lSGVpZ2h0UHggKyBtaWxlc3RvbmVSYWRpdXNcbiAgICApO1xuXG4gICAgdGhpcy50YXNrc0NsaXBSZWN0T3JpZ2luID0gbmV3IFBvaW50KFxuICAgICAgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCxcbiAgICAgIHRoaXMudGltZWxpbmVIZWlnaHRQeFxuICAgICk7XG5cbiAgICBpZiAob3B0cy5oYXNUZXh0KSB7XG4gICAgICB0aGlzLnJvd0hlaWdodFB4ID0gNiAqIHRoaXMuYmxvY2tTaXplUHg7IC8vIFRoaXMgbWlnaHQgYWxzbyBiZSBgKGNhbnZhc0hlaWdodFB4IC0gMiAqIG9wdHMubWFyZ2luU2l6ZVB4KSAvIG51bWJlclN3aW1MYW5lc2AgaWYgaGVpZ2h0IGlzIHN1cHBsaWVkP1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJvd0hlaWdodFB4ID0gMS4xICogdGhpcy5ibG9ja1NpemVQeDtcbiAgICB9XG4gIH1cblxuICAvKiogVGhlIGhlaWdodCBvZiB0aGUgY2hhcnQuIE5vdGUgdGhhdCBpdCdzIG5vdCBjb25zdHJhaW5lZCBieSB0aGUgY2FudmFzLiAqL1xuICBwdWJsaWMgaGVpZ2h0KG1heFJvd3M6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIChcbiAgICAgIG1heFJvd3MgKiB0aGlzLnJvd0hlaWdodFB4ICsgdGhpcy50aW1lbGluZUhlaWdodFB4ICsgMiAqIHRoaXMubWFyZ2luU2l6ZVB4XG4gICAgKTtcbiAgfVxuXG4gIHB1YmxpYyBkYXlSb3dGcm9tUG9pbnQocG9pbnQ6IFBvaW50KTogRGF5Um93IHtcbiAgICAvLyBUaGlzIHNob3VsZCBhbHNvIGNsYW1wIHRoZSByZXR1cm5lZCAneCcgdmFsdWUgdG8gWzAsIG1heFJvd3MpLlxuICAgIHJldHVybiB7XG4gICAgICBkYXk6IGNsYW1wKFxuICAgICAgICBNYXRoLmZsb29yKFxuICAgICAgICAgICh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyAqIHBvaW50LnggLVxuICAgICAgICAgICAgdGhpcy5vcmlnaW4ueCAtXG4gICAgICAgICAgICB0aGlzLm1hcmdpblNpemVQeCAtXG4gICAgICAgICAgICB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4KSAvXG4gICAgICAgICAgICB0aGlzLmRheVdpZHRoUHhcbiAgICAgICAgKSxcbiAgICAgICAgMCxcbiAgICAgICAgdGhpcy50b3RhbE51bWJlck9mRGF5c1xuICAgICAgKSxcbiAgICAgIHJvdzogTWF0aC5mbG9vcihcbiAgICAgICAgKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvICogcG9pbnQueSAtXG4gICAgICAgICAgdGhpcy5vcmlnaW4ueSAtXG4gICAgICAgICAgdGhpcy5tYXJnaW5TaXplUHggLVxuICAgICAgICAgIHRoaXMudGltZWxpbmVIZWlnaHRQeCkgL1xuICAgICAgICAgIHRoaXMucm93SGVpZ2h0UHhcbiAgICAgICksXG4gICAgfTtcbiAgfVxuXG4gIC8qKiBUaGUgdG9wIGxlZnQgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3ggZm9yIGEgc2luZ2xlIHRhc2suICovXG4gIHByaXZhdGUgdGFza1Jvd0VudmVsb3BlU3RhcnQocm93OiBudW1iZXIsIGRheTogbnVtYmVyKTogUG9pbnQge1xuICAgIHJldHVybiB0aGlzLm9yaWdpbi5zdW0oXG4gICAgICBuZXcgUG9pbnQoXG4gICAgICAgIE1hdGguZmxvb3IoXG4gICAgICAgICAgZGF5ICogdGhpcy5kYXlXaWR0aFB4ICsgdGhpcy5tYXJnaW5TaXplUHggKyB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4XG4gICAgICAgICksXG4gICAgICAgIE1hdGguZmxvb3IoXG4gICAgICAgICAgcm93ICogdGhpcy5yb3dIZWlnaHRQeCArIHRoaXMubWFyZ2luU2l6ZVB4ICsgdGhpcy50aW1lbGluZUhlaWdodFB4XG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICBwcml2YXRlIGdyb3VwUm93RW52ZWxvcGVTdGFydChyb3c6IG51bWJlciwgZGF5OiBudW1iZXIpOiBQb2ludCB7XG4gICAgcmV0dXJuIHRoaXMuZ3JvdXBCeU9yaWdpbi5zdW0oXG4gICAgICBuZXcgUG9pbnQoXG4gICAgICAgIDAsXG4gICAgICAgIHJvdyAqIHRoaXMucm93SGVpZ2h0UHggKyB0aGlzLm1hcmdpblNpemVQeCArIHRoaXMudGltZWxpbmVIZWlnaHRQeFxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIGdyb3VwSGVhZGVyU3RhcnQoKTogUG9pbnQge1xuICAgIHJldHVybiB0aGlzLm9yaWdpbi5zdW0obmV3IFBvaW50KHRoaXMubWFyZ2luU2l6ZVB4LCB0aGlzLm1hcmdpblNpemVQeCkpO1xuICB9XG5cbiAgcHJpdmF0ZSB0aW1lRW52ZWxvcGVTdGFydChkYXk6IG51bWJlcik6IFBvaW50IHtcbiAgICByZXR1cm4gdGhpcy5vcmlnaW4uc3VtKFxuICAgICAgbmV3IFBvaW50KFxuICAgICAgICBkYXkgKiB0aGlzLmRheVdpZHRoUHggKyB0aGlzLm1hcmdpblNpemVQeCArIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHgsXG4gICAgICAgIHRoaXMubWFyZ2luU2l6ZVB4XG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSBjb29yZGluYXRlIG9mIHRoZSBpdGVtICovXG4gIGZlYXR1cmUocm93OiBudW1iZXIsIGRheTogbnVtYmVyLCBjb29yZDogRmVhdHVyZSk6IFBvaW50IHtcbiAgICBzd2l0Y2ggKGNvb3JkKSB7XG4gICAgICBjYXNlIEZlYXR1cmUudGFza0xpbmVTdGFydDpcbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvcDpcbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLnJvd0hlaWdodFB4IC0gdGhpcy5ibG9ja1NpemVQeFxuICAgICAgICApO1xuXG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RCb3R0b206XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KS5hZGQoMCwgdGhpcy5yb3dIZWlnaHRQeCk7XG4gICAgICBjYXNlIEZlYXR1cmUudGV4dFN0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSkuYWRkKFxuICAgICAgICAgIHRoaXMuYmxvY2tTaXplUHgsXG4gICAgICAgICAgdGhpcy5ibG9ja1NpemVQeFxuICAgICAgICApO1xuICAgICAgY2FzZSBGZWF0dXJlLmdyb3VwVGV4dFN0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy5ncm91cFJvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpLmFkZChcbiAgICAgICAgICB0aGlzLmJsb2NrU2l6ZVB4LFxuICAgICAgICAgIHRoaXMuYmxvY2tTaXplUHhcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5wZXJjZW50U3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLnJvd0hlaWdodFB4IC0gdGhpcy5saW5lV2lkdGhQeFxuICAgICAgICApO1xuICAgICAgY2FzZSBGZWF0dXJlLmhvcml6b250YWxBcnJvd0Rlc3Q6XG4gICAgICBjYXNlIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93U3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICBNYXRoLmZsb29yKHRoaXMucm93SGVpZ2h0UHggLSAwLjUgKiB0aGlzLmJsb2NrU2l6ZVB4KSAtIDFcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvTWlsZXN0b25lVG9wOlxuICAgICAgICByZXR1cm4gdGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9wKS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICAtMSAqIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlcilcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvTWlsZXN0b25lQm90dG9tOlxuICAgICAgICByZXR1cm4gdGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9wKS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpXG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93RGVzdFRvTWlsZXN0b25lOlxuICAgICAgICByZXR1cm4gdGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLmhvcml6b250YWxBcnJvd0Rlc3QpLmFkZChcbiAgICAgICAgICAtMSAqIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlciksXG4gICAgICAgICAgLTEgKiB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpXG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZVRvcDpcbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnQpLmFkZChcbiAgICAgICAgICAwLFxuICAgICAgICAgIC0xICogdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKVxuICAgICAgICApO1xuXG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZUJvdHRvbTpcbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnQpLmFkZChcbiAgICAgICAgICAwLFxuICAgICAgICAgIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlcilcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dTdGFydEZyb21NaWxlc3RvbmU6XG4gICAgICAgIHJldHVybiB0aGlzLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93U3RhcnQpLmFkZChcbiAgICAgICAgICB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpLFxuICAgICAgICAgIDBcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS50YXNrRW52ZWxvcGVUb3A6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KTtcbiAgICAgIGNhc2UgRmVhdHVyZS5ncm91cEVudmVsb3BlU3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLmdyb3VwUm93RW52ZWxvcGVTdGFydChyb3csIGRheSk7XG4gICAgICBjYXNlIEZlYXR1cmUudGltZU1hcmtTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZUVudmVsb3BlU3RhcnQoZGF5KTtcbiAgICAgIGNhc2UgRmVhdHVyZS50aW1lTWFya0VuZDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZUVudmVsb3BlU3RhcnQoZGF5KS5hZGQoMCwgdGhpcy5yb3dIZWlnaHRQeCAqIChyb3cgKyAxKSk7XG4gICAgICBjYXNlIEZlYXR1cmUudGltZVRleHRTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZUVudmVsb3BlU3RhcnQoZGF5KS5hZGQodGhpcy5ibG9ja1NpemVQeCwgMCk7XG5cbiAgICAgIGNhc2UgRmVhdHVyZS5ncm91cFRpdGxlVGV4dFN0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy5ncm91cEhlYWRlclN0YXJ0KCkuYWRkKHRoaXMuYmxvY2tTaXplUHgsIDApO1xuICAgICAgY2FzZSBGZWF0dXJlLmRpc3BsYXlSYW5nZVRvcDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZUVudmVsb3BlU3RhcnQoZGF5KTtcbiAgICAgIGNhc2UgRmVhdHVyZS50YXNrUm93Qm90dG9tOlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3cgKyAxLCBkYXkpO1xuICAgICAgY2FzZSBGZWF0dXJlLnRhc2tzQ2xpcFJlY3RPcmlnaW46XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tzQ2xpcFJlY3RPcmlnaW47XG4gICAgICBjYXNlIEZlYXR1cmUuZ3JvdXBCeU9yaWdpbjpcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBCeU9yaWdpbjtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIFRoZSBsaW5lIGJlbG93IHdpbGwgbm90IGNvbXBpbGUgaWYgeW91IG1pc3NlZCBhbiBlbnVtIGluIHRoZSBzd2l0Y2ggYWJvdmUuXG4gICAgICAgIGNvb3JkIHNhdGlzZmllcyBuZXZlcjtcbiAgICAgICAgcmV0dXJuIG5ldyBQb2ludCgwLCAwKTtcbiAgICB9XG4gIH1cblxuICBtZXRyaWMoZmVhdHVyZTogTWV0cmljKTogbnVtYmVyIHtcbiAgICBzd2l0Y2ggKGZlYXR1cmUpIHtcbiAgICAgIGNhc2UgTWV0cmljLnRhc2tMaW5lSGVpZ2h0OlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrSGVpZ2h0UHg7XG4gICAgICBjYXNlIE1ldHJpYy5wZXJjZW50SGVpZ2h0OlxuICAgICAgICByZXR1cm4gdGhpcy5saW5lV2lkdGhQeDtcbiAgICAgIGNhc2UgTWV0cmljLmFycm93SGVhZEhlaWdodDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza0hlaWdodFB4O1xuICAgICAgY2FzZSBNZXRyaWMuYXJyb3dIZWFkV2lkdGg6XG4gICAgICAgIHJldHVybiBNYXRoLmNlaWwodGhpcy50YXNrSGVpZ2h0UHgpO1xuICAgICAgY2FzZSBNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXI6XG4gICAgICAgIHJldHVybiBNYXRoLmNlaWwodGhpcy50YXNrSGVpZ2h0UHgpO1xuICAgICAgY2FzZSBNZXRyaWMubGluZURhc2hMaW5lOlxuICAgICAgICByZXR1cm4gdGhpcy5ibG9ja1NpemVQeDtcbiAgICAgIGNhc2UgTWV0cmljLmxpbmVEYXNoR2FwOlxuICAgICAgICByZXR1cm4gdGhpcy5ibG9ja1NpemVQeDtcbiAgICAgIGNhc2UgTWV0cmljLnRleHRYT2Zmc2V0OlxuICAgICAgICByZXR1cm4gdGhpcy5ibG9ja1NpemVQeDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIFRoZSBsaW5lIGJlbG93IHdpbGwgbm90IGNvbXBpbGUgaWYgeW91IG1pc3NlZCBhbiBlbnVtIGluIHRoZSBzd2l0Y2ggYWJvdmUuXG4gICAgICAgIGZlYXR1cmUgc2F0aXNmaWVzIG5ldmVyO1xuICAgICAgICByZXR1cm4gMC4wO1xuICAgIH1cbiAgfVxufVxuIiwgImltcG9ydCB7IFRhc2ssIHZhbGlkYXRlQ2hhcnQgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IERpcmVjdGVkRWRnZSB9IGZyb20gXCIuLi9kYWcvZGFnLnRzXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhbi50c1wiO1xuaW1wb3J0IHsgUmVzb3VyY2VEZWZpbml0aW9uIH0gZnJvbSBcIi4uL3Jlc291cmNlcy9yZXNvdXJjZXMudHNcIjtcbmltcG9ydCB7IFJlc3VsdCwgb2sgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBTcGFuIH0gZnJvbSBcIi4uL3NsYWNrL3NsYWNrLnRzXCI7XG5pbXBvcnQgeyBEaXNwbGF5UmFuZ2UgfSBmcm9tIFwiLi9yYW5nZS9yYW5nZS50c1wiO1xuaW1wb3J0IHsgUG9pbnQgfSBmcm9tIFwiLi9zY2FsZS9wb2ludC50c1wiO1xuaW1wb3J0IHsgRmVhdHVyZSwgTWV0cmljLCBTY2FsZSB9IGZyb20gXCIuL3NjYWxlL3NjYWxlLnRzXCI7XG5cbnR5cGUgRGlyZWN0aW9uID0gXCJ1cFwiIHwgXCJkb3duXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29sb3JzIHtcbiAgc3VyZmFjZTogc3RyaW5nO1xuICBvblN1cmZhY2U6IHN0cmluZztcbiAgb25TdXJmYWNlTXV0ZWQ6IHN0cmluZztcbiAgb25TdXJmYWNlSGlnaGxpZ2h0OiBzdHJpbmc7XG4gIG92ZXJsYXk6IHN0cmluZztcbiAgZ3JvdXBDb2xvcjogc3RyaW5nO1xufVxuXG5leHBvcnQgdHlwZSBUYXNrSW5kZXhUb1JvdyA9IE1hcDxudW1iZXIsIG51bWJlcj47XG5cbi8qKiBGdW5jdGlvbiB1c2UgdG8gcHJvZHVjZSBhIHRleHQgbGFiZWwgZm9yIGEgdGFzayBhbmQgaXRzIHNsYWNrLiAqL1xuZXhwb3J0IHR5cGUgVGFza0xhYmVsID0gKHRhc2tJbmRleDogbnVtYmVyKSA9PiBzdHJpbmc7XG5cbi8qKiBDb250cm9scyBvZiB0aGUgZGlzcGxheVJhbmdlIGluIFJlbmRlck9wdGlvbnMgaXMgdXNlZC5cbiAqXG4gKiAgXCJyZXN0cmljdFwiOiBPbmx5IGRpc3BsYXkgdGhlIHBhcnRzIG9mIHRoZSBjaGFydCB0aGF0IGFwcGVhciBpbiB0aGUgcmFuZ2UuXG4gKlxuICogIFwiaGlnaGxpZ2h0XCI6IERpc3BsYXkgdGhlIGZ1bGwgcmFuZ2Ugb2YgdGhlIGRhdGEsIGJ1dCBoaWdobGlnaHQgdGhlIHJhbmdlLlxuICovXG5leHBvcnQgdHlwZSBEaXNwbGF5UmFuZ2VVc2FnZSA9IFwicmVzdHJpY3RcIiB8IFwiaGlnaGxpZ2h0XCI7XG5cbmV4cG9ydCBjb25zdCBkZWZhdWx0VGFza0xhYmVsOiBUYXNrTGFiZWwgPSAodGFza0luZGV4OiBudW1iZXIpOiBzdHJpbmcgPT5cbiAgdGFza0luZGV4LnRvRml4ZWQoMCk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyT3B0aW9ucyB7XG4gIC8qKiBUaGUgdGV4dCBmb250IHNpemUsIHRoaXMgZHJpdmVzIHRoZSBzaXplIG9mIGFsbCBvdGhlciBjaGFydCBmZWF0dXJlcy5cbiAgICogKi9cbiAgZm9udFNpemVQeDogbnVtYmVyO1xuXG4gIC8qKiBEaXNwbGF5IHRleHQgaWYgdHJ1ZS4gKi9cbiAgaGFzVGV4dDogYm9vbGVhbjtcblxuICAvKiogSWYgc3VwcGxpZWQgdGhlbiBvbmx5IHRoZSB0YXNrcyBpbiB0aGUgZ2l2ZW4gcmFuZ2Ugd2lsbCBiZSBkaXNwbGF5ZWQuICovXG4gIGRpc3BsYXlSYW5nZTogRGlzcGxheVJhbmdlIHwgbnVsbDtcblxuICAvKiogQ29udHJvbHMgaG93IHRoZSBgZGlzcGxheVJhbmdlYCBpcyB1c2VkIGlmIHN1cHBsaWVkLiAqL1xuICBkaXNwbGF5UmFuZ2VVc2FnZTogRGlzcGxheVJhbmdlVXNhZ2U7XG5cbiAgLyoqIFRoZSBjb2xvciB0aGVtZS4gKi9cbiAgY29sb3JzOiBDb2xvcnM7XG5cbiAgLyoqIElmIHRydWUgdGhlbiBkaXNwbGF5IHRpbWVzIGF0IHRoZSB0b3Agb2YgdGhlIGNoYXJ0LiAqL1xuICBoYXNUaW1lbGluZTogYm9vbGVhbjtcblxuICAvKiogSWYgdHJ1ZSB0aGVuIGRpc3BsYXkgdGhlIHRhc2sgYmFycy4gKi9cbiAgaGFzVGFza3M6IGJvb2xlYW47XG5cbiAgLyoqIElmIHRydWUgdGhlbiBkcmF3IHZlcnRpY2FsIGxpbmVzIGZyb20gdGhlIHRpbWVsaW5lIGRvd24gdG8gdGFzayBzdGFydCBhbmRcbiAgICogZmluaXNoIHBvaW50cy4gKi9cbiAgZHJhd1RpbWVNYXJrZXJzT25UYXNrczogYm9vbGVhbjtcblxuICAvKiogRHJhdyBkZXBlbmRlbmN5IGVkZ2VzIGJldHdlZW4gdGFza3MgaWYgdHJ1ZS4gKi9cbiAgaGFzRWRnZXM6IGJvb2xlYW47XG5cbiAgLyoqIEZ1bmN0aW9uIHRoYXQgcHJvZHVjZXMgZGlzcGxheSB0ZXh0IGZvciBhIFRhc2sgYW5kIGl0cyBhc3NvY2lhdGVkIFNsYWNrLiAqL1xuICB0YXNrTGFiZWw6IFRhc2tMYWJlbDtcblxuICAvKiogVGhlIGluZGljZXMgb2YgdGFza3MgdGhhdCBzaG91bGQgYmUgaGlnaGxpZ2h0ZWQgd2hlbiBkcmF3LCB0eXBpY2FsbHkgdXNlZFxuICAgKiB0byBoaWdobGlnaHQgdGhlIGNyaXRpY2FsIHBhdGguICovXG4gIHRhc2tIaWdobGlnaHRzOiBudW1iZXJbXTtcblxuICAvKiogR3JvdXAgdGhlIHRhc2tzIHRvZ2V0aGVyIHZlcnRpY2FsbHkgYmFzZWQgb24gdGhlIGdpdmVuIHJlc291cmNlLiBJZiB0aGVcbiAgICogZW1wdHkgc3RyaW5nIGlzIHN1cHBsaWVkIHRoZW4ganVzdCBkaXNwbGF5IGJ5IHRvcG9sb2dpY2FsIG9yZGVyLlxuICAgKi9cbiAgZ3JvdXBCeVJlc291cmNlOiBzdHJpbmc7XG59XG5cbmNvbnN0IHZlcnRpY2FsQXJyb3dTdGFydEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uID0gKFxuICB0YXNrOiBUYXNrLFxuICBkaXJlY3Rpb246IERpcmVjdGlvblxuKTogRmVhdHVyZSA9PiB7XG4gIGlmICh0YXNrLmR1cmF0aW9uID09PSAwKSB7XG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJkb3duXCIpIHtcbiAgICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydEZyb21NaWxlc3RvbmVCb3R0b207XG4gICAgfVxuICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydEZyb21NaWxlc3RvbmVUb3A7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0O1xuICB9XG59O1xuXG5jb25zdCB2ZXJ0aWNhbEFycm93RGVzdEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uID0gKFxuICB0YXNrOiBUYXNrLFxuICBkaXJlY3Rpb246IERpcmVjdGlvblxuKTogRmVhdHVyZSA9PiB7XG4gIGlmICh0YXNrLmR1cmF0aW9uID09PSAwKSB7XG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJkb3duXCIpIHtcbiAgICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9NaWxlc3RvbmVUb3A7XG4gICAgfVxuICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9NaWxlc3RvbmVCb3R0b207XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJkb3duXCIpIHtcbiAgICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9wO1xuICAgIH1cbiAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdEJvdHRvbTtcbiAgfVxufTtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuY29uc3QgaG9yaXpvbnRhbEFycm93U3RhcnRGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbiA9ICh0YXNrOiBUYXNrKTogRmVhdHVyZSA9PiB7XG4gIGlmICh0YXNrLmR1cmF0aW9uID09PSAwKSB7XG4gICAgcmV0dXJuIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBGZWF0dXJlLmhvcml6b250YWxBcnJvd1N0YXJ0O1xuICB9XG59O1xuXG5jb25zdCBob3Jpem9udGFsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24gPSAodGFzazogVGFzayk6IEZlYXR1cmUgPT4ge1xuICBpZiAodGFzay5kdXJhdGlvbiA9PT0gMCkge1xuICAgIHJldHVybiBGZWF0dXJlLmhvcml6b250YWxBcnJvd0Rlc3RUb01pbGVzdG9uZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dEZXN0O1xuICB9XG59O1xuXG4vKipcbiAqIENvbXB1dGUgd2hhdCB0aGUgaGVpZ2h0IG9mIHRoZSBjYW52YXMgc2hvdWxkIGJlLiBOb3RlIHRoYXQgdGhlIHZhbHVlIGRvZXNuJ3RcbiAqIGtub3cgYWJvdXQgYHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvYCwgc28gaWYgdGhlIGNhbnZhcyBpcyBhbHJlYWR5IHNjYWxlZCBieVxuICogYHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvYCB0aGVuIHNvIHdpbGwgdGhlIHJlc3VsdCBvZiB0aGlzIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3VnZ2VzdGVkQ2FudmFzSGVpZ2h0KFxuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LFxuICBzcGFuczogU3BhbltdLFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBtYXhSb3dzOiBudW1iZXJcbik6IG51bWJlciB7XG4gIGlmICghb3B0cy5oYXNUYXNrcykge1xuICAgIG1heFJvd3MgPSAwO1xuICB9XG4gIHJldHVybiBuZXcgU2NhbGUoXG4gICAgb3B0cyxcbiAgICBjYW52YXMud2lkdGgsXG4gICAgc3BhbnNbc3BhbnMubGVuZ3RoIC0gMV0uZmluaXNoICsgMVxuICApLmhlaWdodChtYXhSb3dzKTtcbn1cblxuLy8gVE9ETyAtIFBhc3MgaW4gbWF4IHJvd3MsIGFuZCBhIG1hcHBpbmcgdGhhdCBtYXBzIGZyb20gdGFza0luZGV4IHRvIHJvdyxcbi8vIGJlY2F1c2UgdHdvIGRpZmZlcmVudCB0YXNrcyBtaWdodCBiZSBwbGFjZWQgb24gdGhlIHNhbWUgcm93LiBBbHNvIHdlIHNob3VsZFxuLy8gcGFzcyBpbiBtYXggcm93cz8gT3Igc2hvdWxkIHRoYXQgY29tZSBmcm9tIHRoZSBhYm92ZSBtYXBwaW5nP1xuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclRhc2tzVG9DYW52YXMoXG4gIHBhcmVudDogSFRNTEVsZW1lbnQsXG4gIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBwbGFuOiBQbGFuLFxuICBzcGFuczogU3BhbltdLFxuICBvcHRzOiBSZW5kZXJPcHRpb25zXG4pOiBSZXN1bHQ8U2NhbGU+IHtcbiAgY29uc3QgdnJldCA9IHZhbGlkYXRlQ2hhcnQocGxhbi5jaGFydCk7XG4gIGlmICghdnJldC5vaykge1xuICAgIHJldHVybiB2cmV0O1xuICB9XG5cbiAgLy8gSGlnaGxpZ2h0ZWQgdGFza3MuXG4gIGNvbnN0IHRhc2tIaWdobGlnaHRzOiBTZXQ8bnVtYmVyPiA9IG5ldyBTZXQob3B0cy50YXNrSGlnaGxpZ2h0cyk7XG5cbiAgLy8gQ2FsY3VsYXRlIGhvdyB3aWRlIHdlIG5lZWQgdG8gbWFrZSB0aGUgZ3JvdXBCeSBjb2x1bW4uXG4gIGxldCBtYXhHcm91cE5hbWVMZW5ndGggPSAwO1xuICBpZiAob3B0cy5ncm91cEJ5UmVzb3VyY2UgIT09IFwiXCIgJiYgb3B0cy5oYXNUZXh0KSB7XG4gICAgbWF4R3JvdXBOYW1lTGVuZ3RoID0gb3B0cy5ncm91cEJ5UmVzb3VyY2UubGVuZ3RoO1xuICAgIGNvbnN0IHJlc291cmNlRGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKG9wdHMuZ3JvdXBCeVJlc291cmNlKTtcbiAgICBpZiAocmVzb3VyY2VEZWZpbml0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXMuZm9yRWFjaCgodmFsdWU6IHN0cmluZykgPT4ge1xuICAgICAgICBtYXhHcm91cE5hbWVMZW5ndGggPSBNYXRoLm1heChtYXhHcm91cE5hbWVMZW5ndGgsIHZhbHVlLmxlbmd0aCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBjb25zdCB0b3RhbE51bWJlck9mUm93cyA9IHNwYW5zLmxlbmd0aDtcbiAgY29uc3QgdG90YWxOdW1iZXJPZkRheXMgPSBzcGFuc1tzcGFucy5sZW5ndGggLSAxXS5maW5pc2g7XG4gIGNvbnN0IHNjYWxlID0gbmV3IFNjYWxlKFxuICAgIG9wdHMsXG4gICAgY2FudmFzLndpZHRoLFxuICAgIHRvdGFsTnVtYmVyT2ZEYXlzICsgMSxcbiAgICBtYXhHcm91cE5hbWVMZW5ndGhcbiAgKTtcblxuICBjb25zdCB0YXNrTGluZUhlaWdodCA9IHNjYWxlLm1ldHJpYyhNZXRyaWMudGFza0xpbmVIZWlnaHQpO1xuICBjb25zdCBkaWFtb25kRGlhbWV0ZXIgPSBzY2FsZS5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKTtcbiAgY29uc3QgcGVyY2VudEhlaWdodCA9IHNjYWxlLm1ldHJpYyhNZXRyaWMucGVyY2VudEhlaWdodCk7XG4gIGNvbnN0IGFycm93SGVhZEhlaWdodCA9IHNjYWxlLm1ldHJpYyhNZXRyaWMuYXJyb3dIZWFkSGVpZ2h0KTtcbiAgY29uc3QgYXJyb3dIZWFkV2lkdGggPSBzY2FsZS5tZXRyaWMoTWV0cmljLmFycm93SGVhZFdpZHRoKTtcbiAgY29uc3QgZGF5c1dpdGhUaW1lTWFya2VyczogU2V0PG51bWJlcj4gPSBuZXcgU2V0KCk7XG4gIGNvbnN0IHRpcmV0ID0gdGFza0luZGV4VG9Sb3dGcm9tR3JvdXBCeShvcHRzLCBwbGFuKTtcbiAgaWYgKCF0aXJldC5vaykge1xuICAgIHJldHVybiB0aXJldDtcbiAgfVxuICBjb25zdCB0YXNrSW5kZXhUb1JvdyA9IHRpcmV0LnZhbHVlLnRhc2tJbmRleFRvUm93O1xuICBjb25zdCByb3dSYW5nZXMgPSB0aXJldC52YWx1ZS5yb3dSYW5nZXM7XG4gIGNvbnN0IHJlc291cmNlRGVmaW5pdGlvbiA9IHRpcmV0LnZhbHVlLnJlc291cmNlRGVmaW5pdGlvbjtcblxuICAvLyBTZXQgdXAgY2FudmFzIGJhc2ljcy5cbiAgY2xlYXJDYW52YXMoY3R4LCBvcHRzLCBjYW52YXMpO1xuICBzZXRGb250U2l6ZShjdHgsIG9wdHMpO1xuXG4gIGNvbnN0IGNsaXBSZWdpb24gPSBuZXcgUGF0aDJEKCk7XG4gIGNvbnN0IGNsaXBPcmlnaW4gPSBzY2FsZS5mZWF0dXJlKDAsIDAsIEZlYXR1cmUudGFza3NDbGlwUmVjdE9yaWdpbik7XG4gIGNvbnN0IGNsaXBXaWR0aCA9IGNhbnZhcy53aWR0aCAtIGNsaXBPcmlnaW4ueDtcbiAgY2xpcFJlZ2lvbi5yZWN0KGNsaXBPcmlnaW4ueCwgMCwgY2xpcFdpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblxuICAvLyBEcmF3IGJpZyByZWQgcmVjdCBvdmVyIHdoZXJlIHRoZSBjbGlwIHJlZ2lvbiB3aWxsIGJlLlxuICBpZiAoMCkge1xuICAgIGN0eC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XG4gICAgY3R4LmxpbmVXaWR0aCA9IDI7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5zdHJva2UoY2xpcFJlZ2lvbik7XG4gIH1cblxuICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG5cbiAgaWYgKHJvd1JhbmdlcyAhPT0gbnVsbCkge1xuICAgIGlmIChvcHRzLmhhc1Rhc2tzKSB7XG4gICAgICBkcmF3U3dpbUxhbmVIaWdobGlnaHRzKFxuICAgICAgICBjdHgsXG4gICAgICAgIHNjYWxlLFxuICAgICAgICByb3dSYW5nZXMsXG4gICAgICAgIHRvdGFsTnVtYmVyT2ZEYXlzLFxuICAgICAgICBvcHRzLmNvbG9ycy5ncm91cENvbG9yXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChyZXNvdXJjZURlZmluaXRpb24gIT09IG51bGwgJiYgb3B0cy5oYXNUZXh0KSB7XG4gICAgICBkcmF3U3dpbUxhbmVMYWJlbHMoY3R4LCBvcHRzLCByZXNvdXJjZURlZmluaXRpb24sIHNjYWxlLCByb3dSYW5nZXMpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcblxuICBjdHguc2F2ZSgpO1xuICBjdHguY2xpcChjbGlwUmVnaW9uKTtcbiAgLy8gRHJhdyB0YXNrcyBpbiB0aGVpciByb3dzLlxuICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIHRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgY29uc3Qgcm93ID0gdGFza0luZGV4VG9Sb3cuZ2V0KHRhc2tJbmRleCkhO1xuICAgIGNvbnN0IHNwYW4gPSBzcGFuc1t0YXNrSW5kZXhdO1xuICAgIGNvbnN0IHRhc2tTdGFydCA9IHNjYWxlLmZlYXR1cmUocm93LCBzcGFuLnN0YXJ0LCBGZWF0dXJlLnRhc2tMaW5lU3RhcnQpO1xuICAgIGNvbnN0IHRhc2tFbmQgPSBzY2FsZS5mZWF0dXJlKHJvdywgc3Bhbi5maW5pc2gsIEZlYXR1cmUudGFza0xpbmVTdGFydCk7XG5cbiAgICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlTXV0ZWQ7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlTXV0ZWQ7XG5cbiAgICAvLyBEcmF3IGluIHRpbWUgbWFya2VycyBpZiBkaXNwbGF5ZWQuXG4gICAgLy8gVE9ETyAtIE1ha2Ugc3VyZSB0aGV5IGRvbid0IG92ZXJsYXAuXG4gICAgaWYgKG9wdHMuZHJhd1RpbWVNYXJrZXJzT25UYXNrcykge1xuICAgICAgZHJhd1RpbWVNYXJrZXJBdERheVRvVGFzayhcbiAgICAgICAgY3R4LFxuICAgICAgICByb3csXG4gICAgICAgIHNwYW4uc3RhcnQsXG4gICAgICAgIHRhc2ssXG4gICAgICAgIG9wdHMsXG4gICAgICAgIHNjYWxlLFxuICAgICAgICBkYXlzV2l0aFRpbWVNYXJrZXJzXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmICh0YXNrSGlnaGxpZ2h0cy5oYXModGFza0luZGV4KSkge1xuICAgICAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZUhpZ2hsaWdodDtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZUhpZ2hsaWdodDtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgICB9XG4gICAgaWYgKG9wdHMuaGFzVGFza3MpIHtcbiAgICAgIGlmICh0YXNrU3RhcnQueCA9PT0gdGFza0VuZC54KSB7XG4gICAgICAgIGRyYXdNaWxlc3RvbmUoY3R4LCB0YXNrU3RhcnQsIGRpYW1vbmREaWFtZXRlciwgcGVyY2VudEhlaWdodCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkcmF3VGFza0JhcihjdHgsIHRhc2tTdGFydCwgdGFza0VuZCwgdGFza0xpbmVIZWlnaHQpO1xuICAgICAgfVxuXG4gICAgICAvLyBTa2lwIGRyYXdpbmcgdGhlIHRlc3Qgb2YgdGhlIFN0YXJ0IGFuZCBGaW5pc2ggdGFza3MuXG4gICAgICBpZiAodGFza0luZGV4ICE9PSAwICYmIHRhc2tJbmRleCAhPT0gdG90YWxOdW1iZXJPZlJvd3MgLSAxKSB7XG4gICAgICAgIGRyYXdUYXNrVGV4dChjdHgsIG9wdHMsIHNjYWxlLCByb3csIHNwYW4sIHRhc2ssIHRhc2tJbmRleCwgY2xpcFdpZHRoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIGN0eC5saW5lV2lkdGggPSAxO1xuICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VNdXRlZDtcblxuICAvLyBOb3cgZHJhdyBhbGwgdGhlIGFycm93cywgaS5lLiBlZGdlcy5cbiAgaWYgKG9wdHMuaGFzRWRnZXMgJiYgb3B0cy5oYXNUYXNrcykge1xuICAgIGNvbnN0IGhpZ2hsaWdodGVkRWRnZXM6IERpcmVjdGVkRWRnZVtdID0gW107XG4gICAgY29uc3Qgbm9ybWFsRWRnZXM6IERpcmVjdGVkRWRnZVtdID0gW107XG4gICAgcGxhbi5jaGFydC5FZGdlcy5mb3JFYWNoKChlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICAgIGlmIChcbiAgICAgICAgb3B0cy50YXNrSGlnaGxpZ2h0cy5pbmNsdWRlcyhlLmkpICYmXG4gICAgICAgIG9wdHMudGFza0hpZ2hsaWdodHMuaW5jbHVkZXMoZS5qKVxuICAgICAgKSB7XG4gICAgICAgIGhpZ2hsaWdodGVkRWRnZXMucHVzaChlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vcm1hbEVkZ2VzLnB1c2goZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VNdXRlZDtcbiAgICBkcmF3RWRnZXMoXG4gICAgICBjdHgsXG4gICAgICBvcHRzLFxuICAgICAgbm9ybWFsRWRnZXMsXG4gICAgICBzcGFucyxcbiAgICAgIHBsYW4uY2hhcnQuVmVydGljZXMsXG4gICAgICBzY2FsZSxcbiAgICAgIHRhc2tJbmRleFRvUm93LFxuICAgICAgYXJyb3dIZWFkV2lkdGgsXG4gICAgICBhcnJvd0hlYWRIZWlnaHRcbiAgICApO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZUhpZ2hsaWdodDtcbiAgICBkcmF3RWRnZXMoXG4gICAgICBjdHgsXG4gICAgICBvcHRzLFxuICAgICAgaGlnaGxpZ2h0ZWRFZGdlcyxcbiAgICAgIHNwYW5zLFxuICAgICAgcGxhbi5jaGFydC5WZXJ0aWNlcyxcbiAgICAgIHNjYWxlLFxuICAgICAgdGFza0luZGV4VG9Sb3csXG4gICAgICBhcnJvd0hlYWRXaWR0aCxcbiAgICAgIGFycm93SGVhZEhlaWdodFxuICAgICk7XG4gIH1cblxuICBjdHgucmVzdG9yZSgpO1xuXG4gIC8vIE5vdyBkcmF3IHRoZSByYW5nZSBoaWdobGlnaHRzIGlmIHJlcXVpcmVkLlxuICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UgIT09IG51bGwgJiYgb3B0cy5kaXNwbGF5UmFuZ2VVc2FnZSA9PT0gXCJoaWdobGlnaHRcIikge1xuICAgIC8vIERyYXcgYSByZWN0IG92ZXIgZWFjaCBzaWRlIHRoYXQgaXNuJ3QgaW4gdGhlIHJhbmdlLlxuICAgIGlmIChvcHRzLmRpc3BsYXlSYW5nZS5iZWdpbiA+IDApIHtcbiAgICAgIGRyYXdSYW5nZU92ZXJsYXkoXG4gICAgICAgIGN0eCxcbiAgICAgICAgb3B0cyxcbiAgICAgICAgc2NhbGUsXG4gICAgICAgIDAsXG4gICAgICAgIG9wdHMuZGlzcGxheVJhbmdlLmJlZ2luLFxuICAgICAgICB0b3RhbE51bWJlck9mUm93c1xuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKG9wdHMuZGlzcGxheVJhbmdlLmVuZCA8IHRvdGFsTnVtYmVyT2ZEYXlzKSB7XG4gICAgICBkcmF3UmFuZ2VPdmVybGF5KFxuICAgICAgICBjdHgsXG4gICAgICAgIG9wdHMsXG4gICAgICAgIHNjYWxlLFxuICAgICAgICBvcHRzLmRpc3BsYXlSYW5nZS5lbmQsXG4gICAgICAgIHRvdGFsTnVtYmVyT2ZEYXlzICsgMSxcbiAgICAgICAgdG90YWxOdW1iZXJPZlJvd3NcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9rKHNjYWxlKTtcbn1cblxuZnVuY3Rpb24gZHJhd0VkZ2VzKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVtdLFxuICBzcGFuczogU3BhbltdLFxuICB0YXNrczogVGFza1tdLFxuICBzY2FsZTogU2NhbGUsXG4gIHRhc2tJbmRleFRvUm93OiBUYXNrSW5kZXhUb1JvdyxcbiAgYXJyb3dIZWFkV2lkdGg6IG51bWJlcixcbiAgYXJyb3dIZWFkSGVpZ2h0OiBudW1iZXJcbikge1xuICBlZGdlcy5mb3JFYWNoKChlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICBjb25zdCBzcmNTbGFjazogU3BhbiA9IHNwYW5zW2UuaV07XG4gICAgY29uc3QgZHN0U2xhY2s6IFNwYW4gPSBzcGFuc1tlLmpdO1xuICAgIGNvbnN0IHNyY1Rhc2s6IFRhc2sgPSB0YXNrc1tlLmldO1xuICAgIGNvbnN0IGRzdFRhc2s6IFRhc2sgPSB0YXNrc1tlLmpdO1xuICAgIGNvbnN0IHNyY1JvdyA9IHRhc2tJbmRleFRvUm93LmdldChlLmkpITtcbiAgICBjb25zdCBkc3RSb3cgPSB0YXNrSW5kZXhUb1Jvdy5nZXQoZS5qKSE7XG4gICAgY29uc3Qgc3JjRGF5ID0gc3JjU2xhY2suZmluaXNoO1xuICAgIGNvbnN0IGRzdERheSA9IGRzdFNsYWNrLnN0YXJ0O1xuXG4gICAgaWYgKFxuICAgICAgb3B0cy50YXNrSGlnaGxpZ2h0cy5pbmNsdWRlcyhlLmkpICYmXG4gICAgICBvcHRzLnRhc2tIaWdobGlnaHRzLmluY2x1ZGVzKGUuailcbiAgICApIHtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZUhpZ2hsaWdodDtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlTXV0ZWQ7XG4gICAgfVxuXG4gICAgZHJhd0Fycm93QmV0d2VlblRhc2tzKFxuICAgICAgY3R4LFxuICAgICAgc3JjRGF5LFxuICAgICAgZHN0RGF5LFxuICAgICAgc2NhbGUsXG4gICAgICBzcmNSb3csXG4gICAgICBzcmNUYXNrLFxuICAgICAgZHN0Um93LFxuICAgICAgZHN0VGFzayxcbiAgICAgIGFycm93SGVhZFdpZHRoLFxuICAgICAgYXJyb3dIZWFkSGVpZ2h0XG4gICAgKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGRyYXdSYW5nZU92ZXJsYXkoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBzY2FsZTogU2NhbGUsXG4gIGJlZ2luRGF5OiBudW1iZXIsXG4gIGVuZERheTogbnVtYmVyLFxuICB0b3RhbE51bWJlck9mUm93czogbnVtYmVyXG4pIHtcbiAgY29uc3QgdG9wTGVmdCA9IHNjYWxlLmZlYXR1cmUoMCwgYmVnaW5EYXksIEZlYXR1cmUuZGlzcGxheVJhbmdlVG9wKTtcbiAgY29uc3QgYm90dG9tUmlnaHQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIHRvdGFsTnVtYmVyT2ZSb3dzLFxuICAgIGVuZERheSxcbiAgICBGZWF0dXJlLnRhc2tSb3dCb3R0b21cbiAgKTtcbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm92ZXJsYXk7XG4gIGN0eC5maWxsUmVjdChcbiAgICB0b3BMZWZ0LngsXG4gICAgdG9wTGVmdC55LFxuICAgIGJvdHRvbVJpZ2h0LnggLSB0b3BMZWZ0LngsXG4gICAgYm90dG9tUmlnaHQueSAtIHRvcExlZnQueVxuICApO1xuICBjb25zb2xlLmxvZyhcImRyYXdSYW5nZU92ZXJsYXlcIiwgdG9wTGVmdCwgYm90dG9tUmlnaHQpO1xufVxuXG5mdW5jdGlvbiBkcmF3QXJyb3dCZXR3ZWVuVGFza3MoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBzcmNEYXk6IG51bWJlcixcbiAgZHN0RGF5OiBudW1iZXIsXG4gIHNjYWxlOiBTY2FsZSxcbiAgc3JjUm93OiBudW1iZXIsXG4gIHNyY1Rhc2s6IFRhc2ssXG4gIGRzdFJvdzogbnVtYmVyLFxuICBkc3RUYXNrOiBUYXNrLFxuICBhcnJvd0hlYWRXaWR0aDogbnVtYmVyLFxuICBhcnJvd0hlYWRIZWlnaHQ6IG51bWJlclxuKSB7XG4gIGlmIChzcmNEYXkgPT09IGRzdERheSkge1xuICAgIC8vIFRPRE8gLSBPbmNlIHdlIGNhbiBwcmVzZW50IHRoaW5ncyBpbiBhbiBvcmRlciBiZXNpZGVzIHRvcG9sb2dpY2FsIHNvcnQsXG4gICAgLy8gZS5nLiBhbGxvdyBncm91cGluZyBpbnRvIHN3aW1sYW5lcyBieSByZXNvdXJjZSwgdGhlbiB0aGVzZSBhcnJvd3MgbWlnaHRcbiAgICAvLyBzdGFydCBwb2ludGluZyB1cCwgc28gYm90aCB0aGUgYXJyb3cgc3RhcnQgYW5kIGFycm93IGhlYWQgZGlyZWN0aW9uXG4gICAgLy8gbWlnaHQgY2hhbmdlIGFuZCBuZWVkIHRvIGRlcGVuZCBvbiB0aGUgZGlyZWN0aW9uIGZyb20gc3JjUm93IHRvIGRzdFJvdy5cbiAgICBkcmF3VmVydGljYWxBcnJvd1RvVGFzayhcbiAgICAgIGN0eCxcbiAgICAgIHNjYWxlLFxuICAgICAgc3JjUm93LFxuICAgICAgc3JjRGF5LFxuICAgICAgc3JjVGFzayxcbiAgICAgIGRzdFJvdyxcbiAgICAgIGRzdERheSxcbiAgICAgIGRzdFRhc2ssXG4gICAgICBhcnJvd0hlYWRXaWR0aCxcbiAgICAgIGFycm93SGVhZEhlaWdodFxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgZHJhd0xTaGFwZWRBcnJvd1RvVGFzayhcbiAgICAgIGN0eCxcbiAgICAgIHNjYWxlLFxuICAgICAgc3JjUm93LFxuICAgICAgc3JjRGF5LFxuICAgICAgc3JjVGFzayxcbiAgICAgIGRzdFJvdyxcbiAgICAgIGRzdFRhc2ssXG4gICAgICBkc3REYXksXG4gICAgICBhcnJvd0hlYWRIZWlnaHQsXG4gICAgICBhcnJvd0hlYWRXaWR0aFxuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xlYXJDYW52YXMoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50XG4pIHtcbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLnN1cmZhY2U7XG4gIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY3R4LmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG59XG5cbmZ1bmN0aW9uIHNldEZvbnRTaXplKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBvcHRzOiBSZW5kZXJPcHRpb25zKSB7XG4gIGN0eC5mb250ID0gYCR7b3B0cy5mb250U2l6ZVB4fXB4IHNlcmlmYDtcbn1cblxuLy8gRHJhdyBMIHNoYXBlZCBhcnJvdywgZmlyc3QgZ29pbmcgYmV0d2VlbiByb3dzLCB0aGVuIGdvaW5nIGJldHdlZW4gZGF5cy5cbmZ1bmN0aW9uIGRyYXdMU2hhcGVkQXJyb3dUb1Rhc2soXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBzY2FsZTogU2NhbGUsXG4gIHNyY1JvdzogbnVtYmVyLFxuICBzcmNEYXk6IG51bWJlcixcbiAgc3JjVGFzazogVGFzayxcbiAgZHN0Um93OiBudW1iZXIsXG4gIGRzdFRhc2s6IFRhc2ssXG4gIGRzdERheTogbnVtYmVyLFxuICBhcnJvd0hlYWRIZWlnaHQ6IG51bWJlcixcbiAgYXJyb3dIZWFkV2lkdGg6IG51bWJlclxuKSB7XG4gIC8vIFRPRE8gLSBPbmNlIHdlIGNhbiBwcmVzZW50IHRoaW5ncyBpbiBhbiBvcmRlciBiZXNpZGVzIHRvcG9sb2dpY2FsIHNvcnQsXG4gIC8vIGUuZy4gYWxsb3cgZ3JvdXBpbmcgaW50byBzd2ltbGFuZXMgYnkgcmVzb3VyY2UsIHRoZW4gdGhlIHZlcnRpY2FsXG4gIC8vIHNlY3Rpb24gb2YgdGhlIFwiTFwiIG1pZ2h0IHN0YXJ0IHBvaW50aW5nIHVwLCBzbyBib3RoIHRoZVxuICAvLyB2ZXJ0aWNhbEFycm93U3RhcnQgYW5kIHZlcnRpY2FsQXJyb3dEZXN0IGxvY2F0aW9ucyBtaWdodCBjaGFuZ2UgYW5kXG4gIC8vIG5lZWQgdG8gZGVwZW5kIG9uIHRoZSBkaXJlY3Rpb24gZnJvbSBzcmNSb3cgdG8gZHN0Um93LlxuXG4gIC8vIERyYXcgdmVydGljYWwgcGFydCBvZiB0aGUgXCJMXCIuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY29uc3QgZGlyZWN0aW9uOiBEaXJlY3Rpb24gPSBzcmNSb3cgPCBkc3RSb3cgPyBcImRvd25cIiA6IFwidXBcIjtcbiAgY29uc3QgdmVydExpbmVTdGFydCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgc3JjUm93LFxuICAgIHNyY0RheSxcbiAgICB2ZXJ0aWNhbEFycm93U3RhcnRGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbihzcmNUYXNrLCBkaXJlY3Rpb24pXG4gICk7XG4gIGNvbnN0IHZlcnRMaW5lRW5kID0gc2NhbGUuZmVhdHVyZShcbiAgICBkc3RSb3csXG4gICAgc3JjRGF5LFxuICAgIGhvcml6b250YWxBcnJvd0Rlc3RGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbihkc3RUYXNrKVxuICApO1xuICBjdHgubW92ZVRvKHZlcnRMaW5lU3RhcnQueCArIDAuNSwgdmVydExpbmVTdGFydC55KTtcbiAgY3R4LmxpbmVUbyh2ZXJ0TGluZVN0YXJ0LnggKyAwLjUsIHZlcnRMaW5lRW5kLnkpO1xuXG4gIC8vIERyYXcgaG9yaXpvbnRhbCBwYXJ0IG9mIHRoZSBcIkxcIi5cbiAgY29uc3QgaG9yekxpbmVTdGFydCA9IHZlcnRMaW5lRW5kO1xuICBjb25zdCBob3J6TGluZUVuZCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgZHN0Um93LFxuICAgIGRzdERheSxcbiAgICBob3Jpem9udGFsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24oZHN0VGFzaylcbiAgKTtcbiAgY3R4Lm1vdmVUbyh2ZXJ0TGluZVN0YXJ0LnggKyAwLjUsIGhvcnpMaW5lU3RhcnQueSk7XG4gIGN0eC5saW5lVG8oaG9yekxpbmVFbmQueCArIDAuNSwgaG9yekxpbmVFbmQueSk7XG5cbiAgLy8gRHJhdyB0aGUgYXJyb3doZWFkLiBUaGlzIGFycm93IGhlYWQgd2lsbCBhbHdheXMgcG9pbnQgdG8gdGhlIHJpZ2h0XG4gIC8vIHNpbmNlIHRoYXQncyBob3cgdGltZSBmbG93cy5cbiAgY3R4Lm1vdmVUbyhob3J6TGluZUVuZC54ICsgMC41LCBob3J6TGluZUVuZC55KTtcbiAgY3R4LmxpbmVUbyhcbiAgICBob3J6TGluZUVuZC54IC0gYXJyb3dIZWFkSGVpZ2h0ICsgMC41LFxuICAgIGhvcnpMaW5lRW5kLnkgKyBhcnJvd0hlYWRXaWR0aFxuICApO1xuICBjdHgubW92ZVRvKGhvcnpMaW5lRW5kLnggKyAwLjUsIGhvcnpMaW5lRW5kLnkpO1xuICBjdHgubGluZVRvKFxuICAgIGhvcnpMaW5lRW5kLnggLSBhcnJvd0hlYWRIZWlnaHQgKyAwLjUsXG4gICAgaG9yekxpbmVFbmQueSAtIGFycm93SGVhZFdpZHRoXG4gICk7XG4gIGN0eC5zdHJva2UoKTtcbn1cblxuZnVuY3Rpb24gZHJhd1ZlcnRpY2FsQXJyb3dUb1Rhc2soXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBzY2FsZTogU2NhbGUsXG4gIHNyY1JvdzogbnVtYmVyLFxuICBzcmNEYXk6IG51bWJlcixcbiAgc3JjVGFzazogVGFzayxcbiAgZHN0Um93OiBudW1iZXIsXG4gIGRzdERheTogbnVtYmVyLFxuICBkc3RUYXNrOiBUYXNrLFxuICBhcnJvd0hlYWRXaWR0aDogbnVtYmVyLFxuICBhcnJvd0hlYWRIZWlnaHQ6IG51bWJlclxuKSB7XG4gIGNvbnN0IGRpcmVjdGlvbjogRGlyZWN0aW9uID0gc3JjUm93IDwgZHN0Um93ID8gXCJkb3duXCIgOiBcInVwXCI7XG4gIGNvbnN0IGFycm93U3RhcnQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIHNyY1JvdyxcbiAgICBzcmNEYXksXG4gICAgdmVydGljYWxBcnJvd1N0YXJ0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24oc3JjVGFzaywgZGlyZWN0aW9uKVxuICApO1xuICBjb25zdCBhcnJvd0VuZCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgZHN0Um93LFxuICAgIGRzdERheSxcbiAgICB2ZXJ0aWNhbEFycm93RGVzdEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uKGRzdFRhc2ssIGRpcmVjdGlvbilcbiAgKTtcblxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5tb3ZlVG8oYXJyb3dTdGFydC54ICsgMC41LCBhcnJvd1N0YXJ0LnkpO1xuICBjdHgubGluZVRvKGFycm93RW5kLnggKyAwLjUsIGFycm93RW5kLnkpO1xuXG4gIC8vIERyYXcgdGhlIGFycm93aGVhZC5cbiAgY29uc3QgZGVsdGFZID0gZGlyZWN0aW9uID09PSBcImRvd25cIiA/IC1hcnJvd0hlYWRIZWlnaHQgOiBhcnJvd0hlYWRIZWlnaHQ7XG4gIGN0eC5tb3ZlVG8oYXJyb3dFbmQueCArIDAuNSwgYXJyb3dFbmQueSk7XG4gIGN0eC5saW5lVG8oYXJyb3dFbmQueCAtIGFycm93SGVhZFdpZHRoICsgMC41LCBhcnJvd0VuZC55ICsgZGVsdGFZKTtcbiAgY3R4Lm1vdmVUbyhhcnJvd0VuZC54ICsgMC41LCBhcnJvd0VuZC55KTtcbiAgY3R4LmxpbmVUbyhhcnJvd0VuZC54ICsgYXJyb3dIZWFkV2lkdGggKyAwLjUsIGFycm93RW5kLnkgKyBkZWx0YVkpO1xuICBjdHguc3Ryb2tlKCk7XG59XG5cbmZ1bmN0aW9uIGRyYXdUYXNrVGV4dChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIHNjYWxlOiBTY2FsZSxcbiAgcm93OiBudW1iZXIsXG4gIHNwYW46IFNwYW4sXG4gIHRhc2s6IFRhc2ssXG4gIHRhc2tJbmRleDogbnVtYmVyLFxuICBjbGlwV2lkdGg6IG51bWJlclxuKSB7XG4gIGlmICghb3B0cy5oYXNUZXh0KSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IGxhYmVsID0gb3B0cy50YXNrTGFiZWwodGFza0luZGV4KTtcblxuICBsZXQgeFN0YXJ0SW5UaW1lID0gc3Bhbi5zdGFydDtcbiAgbGV0IHhQaXhlbERlbHRhID0gMDtcbiAgLy8gRGV0ZXJtaW5lIHdoZXJlIG9uIHRoZSB4LWF4aXMgdG8gc3RhcnQgZHJhd2luZyB0aGUgdGFzayB0ZXh0LlxuICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UgIT09IG51bGwgJiYgb3B0cy5kaXNwbGF5UmFuZ2VVc2FnZSA9PT0gXCJyZXN0cmljdFwiKSB7XG4gICAgaWYgKG9wdHMuZGlzcGxheVJhbmdlLmluKHNwYW4uc3RhcnQpKSB7XG4gICAgICB4U3RhcnRJblRpbWUgPSBzcGFuLnN0YXJ0O1xuICAgICAgeFBpeGVsRGVsdGEgPSAwO1xuICAgIH0gZWxzZSBpZiAob3B0cy5kaXNwbGF5UmFuZ2UuaW4oc3Bhbi5maW5pc2gpKSB7XG4gICAgICB4U3RhcnRJblRpbWUgPSBzcGFuLmZpbmlzaDtcbiAgICAgIGNvbnN0IG1lYXMgPSBjdHgubWVhc3VyZVRleHQobGFiZWwpO1xuICAgICAgeFBpeGVsRGVsdGEgPSAtbWVhcy53aWR0aCAtIDIgKiBzY2FsZS5tZXRyaWMoTWV0cmljLnRleHRYT2Zmc2V0KTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgc3Bhbi5zdGFydCA8IG9wdHMuZGlzcGxheVJhbmdlLmJlZ2luICYmXG4gICAgICBzcGFuLmZpbmlzaCA+IG9wdHMuZGlzcGxheVJhbmdlLmVuZFxuICAgICkge1xuICAgICAgeFN0YXJ0SW5UaW1lID0gb3B0cy5kaXNwbGF5UmFuZ2UuYmVnaW47XG4gICAgICB4UGl4ZWxEZWx0YSA9IGNsaXBXaWR0aCAvIDI7XG4gICAgfVxuICB9XG4gIGN0eC5saW5lV2lkdGggPSAxO1xuICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICBjdHgudGV4dEJhc2VsaW5lID0gXCJ0b3BcIjtcbiAgY29uc3QgdGV4dFN0YXJ0ID0gc2NhbGUuZmVhdHVyZShyb3csIHhTdGFydEluVGltZSwgRmVhdHVyZS50ZXh0U3RhcnQpO1xuICBjdHguZmlsbFRleHQoXG4gICAgb3B0cy50YXNrTGFiZWwodGFza0luZGV4KSxcbiAgICB0ZXh0U3RhcnQueCArIHhQaXhlbERlbHRhLFxuICAgIHRleHRTdGFydC55XG4gICk7XG59XG5cbmZ1bmN0aW9uIGRyYXdUYXNrQmFyKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgdGFza1N0YXJ0OiBQb2ludCxcbiAgdGFza0VuZDogUG9pbnQsXG4gIHRhc2tMaW5lSGVpZ2h0OiBudW1iZXJcbikge1xuICBjdHguZmlsbFJlY3QoXG4gICAgdGFza1N0YXJ0LngsXG4gICAgdGFza1N0YXJ0LnksXG4gICAgdGFza0VuZC54IC0gdGFza1N0YXJ0LngsXG4gICAgdGFza0xpbmVIZWlnaHRcbiAgKTtcbn1cblxuZnVuY3Rpb24gZHJhd01pbGVzdG9uZShcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHRhc2tTdGFydDogUG9pbnQsXG4gIGRpYW1vbmREaWFtZXRlcjogbnVtYmVyLFxuICBwZXJjZW50SGVpZ2h0OiBudW1iZXJcbikge1xuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5saW5lV2lkdGggPSBwZXJjZW50SGVpZ2h0IC8gMjtcbiAgY3R4Lm1vdmVUbyh0YXNrU3RhcnQueCwgdGFza1N0YXJ0LnkgLSBkaWFtb25kRGlhbWV0ZXIpO1xuICBjdHgubGluZVRvKHRhc2tTdGFydC54ICsgZGlhbW9uZERpYW1ldGVyLCB0YXNrU3RhcnQueSk7XG4gIGN0eC5saW5lVG8odGFza1N0YXJ0LngsIHRhc2tTdGFydC55ICsgZGlhbW9uZERpYW1ldGVyKTtcbiAgY3R4LmxpbmVUbyh0YXNrU3RhcnQueCAtIGRpYW1vbmREaWFtZXRlciwgdGFza1N0YXJ0LnkpO1xuICBjdHguY2xvc2VQYXRoKCk7XG4gIGN0eC5zdHJva2UoKTtcbn1cblxuY29uc3QgZHJhd1RpbWVNYXJrZXJBdERheVRvVGFzayA9IChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHJvdzogbnVtYmVyLFxuICBkYXk6IG51bWJlcixcbiAgdGFzazogVGFzayxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgc2NhbGU6IFNjYWxlLFxuICBkYXlzV2l0aFRpbWVNYXJrZXJzOiBTZXQ8bnVtYmVyPlxuKSA9PiB7XG4gIGlmIChkYXlzV2l0aFRpbWVNYXJrZXJzLmhhcyhkYXkpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGRheXNXaXRoVGltZU1hcmtlcnMuYWRkKGRheSk7XG4gIGNvbnN0IHRpbWVNYXJrU3RhcnQgPSBzY2FsZS5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLnRpbWVNYXJrU3RhcnQpO1xuICBjb25zdCB0aW1lTWFya0VuZCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgcm93LFxuICAgIGRheSxcbiAgICB2ZXJ0aWNhbEFycm93RGVzdEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uKHRhc2ssIFwiZG93blwiKVxuICApO1xuICBjdHgubGluZVdpZHRoID0gMTtcblxuICBjdHguc2V0TGluZURhc2goW1xuICAgIHNjYWxlLm1ldHJpYyhNZXRyaWMubGluZURhc2hMaW5lKSxcbiAgICBzY2FsZS5tZXRyaWMoTWV0cmljLmxpbmVEYXNoR2FwKSxcbiAgXSk7XG4gIGN0eC5tb3ZlVG8odGltZU1hcmtTdGFydC54ICsgMC41LCB0aW1lTWFya1N0YXJ0LnkpO1xuICBjdHgubGluZVRvKHRpbWVNYXJrU3RhcnQueCArIDAuNSwgdGltZU1hcmtFbmQueSk7XG4gIGN0eC5zdHJva2UoKTtcblxuICBjdHguc2V0TGluZURhc2goW10pO1xuXG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gIGN0eC50ZXh0QmFzZWxpbmUgPSBcInRvcFwiO1xuICBjb25zdCB0ZXh0U3RhcnQgPSBzY2FsZS5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLnRpbWVUZXh0U3RhcnQpO1xuICBpZiAob3B0cy5oYXNUZXh0ICYmIG9wdHMuaGFzVGltZWxpbmUpIHtcbiAgICBjdHguZmlsbFRleHQoYCR7ZGF5fWAsIHRleHRTdGFydC54LCB0ZXh0U3RhcnQueSk7XG4gIH1cbn07XG5cbi8qKiBSZXByZXNlbnRzIGEgaGFsZi1vcGVuIGludGVydmFsIG9mIHJvd3MsIGUuZy4gW3N0YXJ0LCBmaW5pc2gpLiAqL1xuaW50ZXJmYWNlIFJvd1JhbmdlIHtcbiAgc3RhcnQ6IG51bWJlcjtcbiAgZmluaXNoOiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBUYXNrSW5kZXhUb1Jvd1JldHVybiB7XG4gIHRhc2tJbmRleFRvUm93OiBUYXNrSW5kZXhUb1JvdztcblxuICAvKiogTWFwcyBlYWNoIHJlc291cmNlIHZhbHVlIGluZGV4IHRvIGEgcmFuZ2Ugb2Ygcm93cy4gKi9cbiAgcm93UmFuZ2VzOiBNYXA8bnVtYmVyLCBSb3dSYW5nZT4gfCBudWxsO1xuXG4gIHJlc291cmNlRGVmaW5pdGlvbjogUmVzb3VyY2VEZWZpbml0aW9uIHwgbnVsbDtcbn1cblxuY29uc3QgdGFza0luZGV4VG9Sb3dGcm9tR3JvdXBCeSA9IChcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgcGxhbjogUGxhblxuKTogUmVzdWx0PFRhc2tJbmRleFRvUm93UmV0dXJuPiA9PiB7XG4gIGNvbnN0IHZyZXQgPSB2YWxpZGF0ZUNoYXJ0KHBsYW4uY2hhcnQpO1xuICBpZiAoIXZyZXQub2spIHtcbiAgICByZXR1cm4gdnJldDtcbiAgfVxuICBjb25zdCB0b3BvbG9naWNhbE9yZGVyID0gdnJldC52YWx1ZTtcblxuICBjb25zdCByZXNvdXJjZSA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKG9wdHMuZ3JvdXBCeVJlc291cmNlKTtcblxuICAvLyB0b3BvbG9naWNhbE9yZGVyIG1hcHMgZnJvbSByb3cgdG8gdGFzayBpbmRleCwgdGhpcyB3aWxsIHByb2R1Y2UgdGhlIGludmVyc2UgbWFwcGluZy5cbiAgY29uc3QgdGFza0luZGV4VG9Sb3cgPSBuZXcgTWFwKFxuICAgIC8vIFRoaXMgbG9va3MgYmFja3dhcmRzLCBidXQgaXQgaXNuJ3QuIFJlbWVtYmVyIHRoYXQgdGhlIG1hcCBjYWxsYmFjayB0YWtlc1xuICAgIC8vICh2YWx1ZSwgaW5kZXgpIGFzIGl0cyBhcmd1bWVudHMuXG4gICAgdG9wb2xvZ2ljYWxPcmRlci5tYXAoKHRhc2tJbmRleDogbnVtYmVyLCByb3c6IG51bWJlcikgPT4gW3Rhc2tJbmRleCwgcm93XSlcbiAgKTtcblxuICBpZiAocmVzb3VyY2UgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBvayh7XG4gICAgICB0YXNrSW5kZXhUb1JvdzogdGFza0luZGV4VG9Sb3csXG4gICAgICByb3dSYW5nZXM6IG51bGwsXG4gICAgICByZXNvdXJjZURlZmluaXRpb246IG51bGwsXG4gICAgfSk7XG4gIH1cblxuICBjb25zdCBzdGFydFRhc2tJbmRleCA9IDA7XG4gIGNvbnN0IGZpbmlzaFRhc2tJbmRleCA9IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgY29uc3QgaWdub3JhYmxlID0gW3N0YXJ0VGFza0luZGV4LCBmaW5pc2hUYXNrSW5kZXhdO1xuXG4gIC8vIEdyb3VwIGFsbCB0YXNrcyBieSB0aGVpciByZXNvdXJjZSB2YWx1ZSwgd2hpbGUgcHJlc2VydmluZyB0b3BvbG9naWNhbFxuICAvLyBvcmRlciB3aXRoIHRoZSBncm91cHMuXG4gIGNvbnN0IGdyb3VwcyA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXJbXT4oKTtcbiAgdG9wb2xvZ2ljYWxPcmRlci5mb3JFYWNoKCh0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHJlc291cmNlVmFsdWUgPVxuICAgICAgcGxhbi5jaGFydC5WZXJ0aWNlc1t0YXNrSW5kZXhdLmdldFJlc291cmNlKG9wdHMuZ3JvdXBCeVJlc291cmNlKSB8fCBcIlwiO1xuICAgIGNvbnN0IGdyb3VwTWVtYmVycyA9IGdyb3Vwcy5nZXQocmVzb3VyY2VWYWx1ZSkgfHwgW107XG4gICAgZ3JvdXBNZW1iZXJzLnB1c2godGFza0luZGV4KTtcbiAgICBncm91cHMuc2V0KHJlc291cmNlVmFsdWUsIGdyb3VwTWVtYmVycyk7XG4gIH0pO1xuXG4gIGNvbnN0IHJldCA9IG5ldyBNYXA8bnVtYmVyLCBudW1iZXI+KCk7XG5cbiAgLy8gVWdoLCBTdGFydCBhbmQgRmluaXNoIFRhc2tzIG5lZWQgdG8gYmUgbWFwcGVkLCBidXQgc2hvdWxkIG5vdCBiZSBkb25lIHZpYVxuICAvLyByZXNvdXJjZSB2YWx1ZSwgc28gU3RhcnQgc2hvdWxkIGFsd2F5cyBiZSBmaXJzdC5cbiAgcmV0LnNldCgwLCAwKTtcblxuICAvLyBOb3cgaW5jcmVtZW50IHVwIHRoZSByb3dzIGFzIHdlIG1vdmUgdGhyb3VnaCBhbGwgdGhlIGdyb3Vwcy5cbiAgbGV0IHJvdyA9IDE7XG4gIC8vIEFuZCB0cmFjayBob3cgbWFueSByb3dzIGFyZSBpbiBlYWNoIGdyb3VwLlxuICBjb25zdCByb3dSYW5nZXM6IE1hcDxudW1iZXIsIFJvd1JhbmdlPiA9IG5ldyBNYXAoKTtcbiAgcmVzb3VyY2UudmFsdWVzLmZvckVhY2goKHJlc291cmNlVmFsdWU6IHN0cmluZywgcmVzb3VyY2VJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgY29uc3Qgc3RhcnRPZlJvdyA9IHJvdztcbiAgICAoZ3JvdXBzLmdldChyZXNvdXJjZVZhbHVlKSB8fCBbXSkuZm9yRWFjaCgodGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGlmIChpZ25vcmFibGUuaW5jbHVkZXModGFza0luZGV4KSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICByZXQuc2V0KHRhc2tJbmRleCwgcm93KTtcbiAgICAgIHJvdysrO1xuICAgIH0pO1xuICAgIHJvd1Jhbmdlcy5zZXQocmVzb3VyY2VJbmRleCwgeyBzdGFydDogc3RhcnRPZlJvdywgZmluaXNoOiByb3cgfSk7XG4gIH0pO1xuICByZXQuc2V0KGZpbmlzaFRhc2tJbmRleCwgcm93KTtcblxuICByZXR1cm4gb2soe1xuICAgIHRhc2tJbmRleFRvUm93OiByZXQsXG4gICAgcm93UmFuZ2VzOiByb3dSYW5nZXMsXG4gICAgcmVzb3VyY2VEZWZpbml0aW9uOiByZXNvdXJjZSxcbiAgfSk7XG59O1xuXG5jb25zdCBkcmF3U3dpbUxhbmVIaWdobGlnaHRzID0gKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgc2NhbGU6IFNjYWxlLFxuICByb3dSYW5nZXM6IE1hcDxudW1iZXIsIFJvd1JhbmdlPixcbiAgdG90YWxOdW1iZXJPZkRheXM6IG51bWJlcixcbiAgZ3JvdXBDb2xvcjogc3RyaW5nXG4pID0+IHtcbiAgY3R4LmZpbGxTdHlsZSA9IGdyb3VwQ29sb3I7XG5cbiAgbGV0IGdyb3VwID0gMDtcbiAgcm93UmFuZ2VzLmZvckVhY2goKHJvd1JhbmdlOiBSb3dSYW5nZSkgPT4ge1xuICAgIGNvbnN0IHRvcExlZnQgPSBzY2FsZS5mZWF0dXJlKFxuICAgICAgcm93UmFuZ2Uuc3RhcnQsXG4gICAgICAwLFxuICAgICAgRmVhdHVyZS5ncm91cEVudmVsb3BlU3RhcnRcbiAgICApO1xuICAgIGNvbnN0IGJvdHRvbVJpZ2h0ID0gc2NhbGUuZmVhdHVyZShcbiAgICAgIHJvd1JhbmdlLmZpbmlzaCxcbiAgICAgIHRvdGFsTnVtYmVyT2ZEYXlzICsgMSxcbiAgICAgIEZlYXR1cmUudGFza0VudmVsb3BlVG9wXG4gICAgKTtcbiAgICBncm91cCsrO1xuICAgIC8vIE9ubHkgaGlnaGxpZ2h0IGV2ZXJ5IG90aGVyIGdyb3VwIGJhY2tncm91ZCB3aXRoIHRoZSBncm91cENvbG9yLlxuICAgIGlmIChncm91cCAlIDIgPT0gMSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjdHguZmlsbFJlY3QoXG4gICAgICB0b3BMZWZ0LngsXG4gICAgICB0b3BMZWZ0LnksXG4gICAgICBib3R0b21SaWdodC54IC0gdG9wTGVmdC54LFxuICAgICAgYm90dG9tUmlnaHQueSAtIHRvcExlZnQueVxuICAgICk7XG4gIH0pO1xufTtcblxuY29uc3QgZHJhd1N3aW1MYW5lTGFiZWxzID0gKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgcmVzb3VyY2VEZWZpbml0aW9uOiBSZXNvdXJjZURlZmluaXRpb24sXG4gIHNjYWxlOiBTY2FsZSxcbiAgcm93UmFuZ2VzOiBNYXA8bnVtYmVyLCBSb3dSYW5nZT5cbikgPT4ge1xuICBpZiAocm93UmFuZ2VzKSBjdHgubGluZVdpZHRoID0gMTtcbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY29uc3QgZ3JvdXBCeU9yaWdpbiA9IHNjYWxlLmZlYXR1cmUoMCwgMCwgRmVhdHVyZS5ncm91cEJ5T3JpZ2luKTtcblxuICBpZiAob3B0cy5oYXNUaW1lbGluZSkge1xuICAgIGN0eC50ZXh0QmFzZWxpbmUgPSBcImJvdHRvbVwiO1xuICAgIGN0eC5maWxsVGV4dChvcHRzLmdyb3VwQnlSZXNvdXJjZSwgZ3JvdXBCeU9yaWdpbi54LCBncm91cEJ5T3JpZ2luLnkpO1xuICB9XG5cbiAgaWYgKG9wdHMuaGFzVGFza3MpIHtcbiAgICBjdHgudGV4dEJhc2VsaW5lID0gXCJ0b3BcIjtcbiAgICByb3dSYW5nZXMuZm9yRWFjaCgocm93UmFuZ2U6IFJvd1JhbmdlLCByZXNvdXJjZUluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGlmIChyb3dSYW5nZS5zdGFydCA9PT0gcm93UmFuZ2UuZmluaXNoKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHRleHRTdGFydCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgICAgIHJvd1JhbmdlLnN0YXJ0LFxuICAgICAgICAwLFxuICAgICAgICBGZWF0dXJlLmdyb3VwVGV4dFN0YXJ0XG4gICAgICApO1xuICAgICAgY3R4LmZpbGxUZXh0KFxuICAgICAgICByZXNvdXJjZURlZmluaXRpb24udmFsdWVzW3Jlc291cmNlSW5kZXhdLFxuICAgICAgICB0ZXh0U3RhcnQueCxcbiAgICAgICAgdGV4dFN0YXJ0LnlcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cbn07XG4iLCAiaW1wb3J0IHsgUmVzdWx0LCBvaywgZXJyb3IgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBUYXNrLCBDaGFydCwgQ2hhcnRWYWxpZGF0ZSB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgRGlyZWN0ZWRFZGdlLCBlZGdlc0J5U3JjQW5kRHN0VG9NYXAgfSBmcm9tIFwiLi4vZGFnL2RhZy50c1wiO1xuaW1wb3J0IHsgUm91bmRlciB9IGZyb20gXCIuLi90eXBlcy90eXBlcy50c1wiO1xuXG4vKiogU3BhbiByZXByZXNlbnRzIHdoZW4gYSB0YXNrIHdpbGwgYmUgZG9uZSwgaS5lLiBpdCBjb250YWlucyB0aGUgdGltZSB0aGUgdGFza1xuICogaXMgZXhwZWN0ZWQgdG8gYmVnaW4gYW5kIGVuZC4gKi9cbmV4cG9ydCBjbGFzcyBTcGFuIHtcbiAgc3RhcnQ6IG51bWJlciA9IDA7XG4gIGZpbmlzaDogbnVtYmVyID0gMDtcbn1cblxuLyoqIFRoZSBzdGFuZGFyZCBzbGFjayBjYWxjdWxhdGlvbiB2YWx1ZXMuICovXG5leHBvcnQgY2xhc3MgU2xhY2sge1xuICBlYXJseTogU3BhbiA9IG5ldyBTcGFuKCk7XG4gIGxhdGU6IFNwYW4gPSBuZXcgU3BhbigpO1xuICBzbGFjazogbnVtYmVyID0gMDtcbn1cblxuZXhwb3J0IHR5cGUgVGFza0R1cmF0aW9uID0gKHQ6IFRhc2ssIHRhc2tJbmRleDogbnVtYmVyKSA9PiBudW1iZXI7XG5cbmV4cG9ydCBjb25zdCBkZWZhdWx0VGFza0R1cmF0aW9uID0gKHQ6IFRhc2spOiBudW1iZXIgPT4ge1xuICByZXR1cm4gdC5kdXJhdGlvbjtcbn07XG5cbmV4cG9ydCB0eXBlIFNsYWNrUmVzdWx0ID0gUmVzdWx0PFNsYWNrW10+O1xuXG4vLyBDYWxjdWxhdGUgdGhlIHNsYWNrIGZvciBlYWNoIFRhc2sgaW4gdGhlIENoYXJ0LlxuZXhwb3J0IGZ1bmN0aW9uIENvbXB1dGVTbGFjayhcbiAgYzogQ2hhcnQsXG4gIHRhc2tEdXJhdGlvbjogVGFza0R1cmF0aW9uID0gZGVmYXVsdFRhc2tEdXJhdGlvbixcbiAgcm91bmQ6IFJvdW5kZXJcbik6IFNsYWNrUmVzdWx0IHtcbiAgLy8gQ3JlYXRlIGEgU2xhY2sgZm9yIGVhY2ggVGFzay5cbiAgY29uc3Qgc2xhY2tzOiBTbGFja1tdID0gbmV3IEFycmF5KGMuVmVydGljZXMubGVuZ3RoKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjLlZlcnRpY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgc2xhY2tzW2ldID0gbmV3IFNsYWNrKCk7XG4gIH1cblxuICBjb25zdCByID0gQ2hhcnRWYWxpZGF0ZShjKTtcbiAgaWYgKCFyLm9rKSB7XG4gICAgcmV0dXJuIGVycm9yKHIuZXJyb3IpO1xuICB9XG5cbiAgY29uc3QgZWRnZXMgPSBlZGdlc0J5U3JjQW5kRHN0VG9NYXAoYy5FZGdlcyk7XG5cbiAgY29uc3QgdG9wb2xvZ2ljYWxPcmRlciA9IHIudmFsdWU7XG5cbiAgLy8gRmlyc3QgZ28gZm9yd2FyZCB0aHJvdWdoIHRoZSB0b3BvbG9naWNhbCBzb3J0IGFuZCBmaW5kIHRoZSBlYXJseSBzdGFydCBmb3JcbiAgLy8gZWFjaCB0YXNrLCB3aGljaCBpcyB0aGUgbWF4IG9mIGFsbCB0aGUgcHJlZGVjZXNzb3JzIGVhcmx5IGZpbmlzaCB2YWx1ZXMuXG4gIC8vIFNpbmNlIHdlIGtub3cgdGhlIGR1cmF0aW9uIHdlIGNhbiBhbHNvIGNvbXB1dGUgdGhlIGVhcmx5IGZpbmlzaC5cbiAgdG9wb2xvZ2ljYWxPcmRlci5zbGljZSgxKS5mb3JFYWNoKCh2ZXJ0ZXhJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgY29uc3QgdGFzayA9IGMuVmVydGljZXNbdmVydGV4SW5kZXhdO1xuICAgIGNvbnN0IHNsYWNrID0gc2xhY2tzW3ZlcnRleEluZGV4XTtcbiAgICBzbGFjay5lYXJseS5zdGFydCA9IE1hdGgubWF4KFxuICAgICAgLi4uZWRnZXMuYnlEc3QuZ2V0KHZlcnRleEluZGV4KSEubWFwKChlOiBEaXJlY3RlZEVkZ2UpOiBudW1iZXIgPT4ge1xuICAgICAgICBjb25zdCBwcmVkZWNlc3NvclNsYWNrID0gc2xhY2tzW2UuaV07XG4gICAgICAgIHJldHVybiBwcmVkZWNlc3NvclNsYWNrLmVhcmx5LmZpbmlzaDtcbiAgICAgIH0pXG4gICAgKTtcbiAgICBzbGFjay5lYXJseS5maW5pc2ggPSByb3VuZChcbiAgICAgIHNsYWNrLmVhcmx5LnN0YXJ0ICsgdGFza0R1cmF0aW9uKHRhc2ssIHZlcnRleEluZGV4KVxuICAgICk7XG4gIH0pO1xuXG4gIC8vIE5vdyBiYWNrd2FyZHMgdGhyb3VnaCB0aGUgdG9wb2xvZ2ljYWwgc29ydCBhbmQgZmluZCB0aGUgbGF0ZSBmaW5pc2ggb2YgZWFjaFxuICAvLyB0YXNrLCB3aGljaCBpcyB0aGUgbWluIG9mIGFsbCB0aGUgc3VjY2Vzc29yIHRhc2tzIGxhdGUgc3RhcnRzLiBBZ2FpbiBzaW5jZVxuICAvLyB3ZSBrbm93IHRoZSBkdXJhdGlvbiB3ZSBjYW4gYWxzbyBjb21wdXRlIHRoZSBsYXRlIHN0YXJ0LiBGaW5hbGx5LCBzaW5jZSB3ZVxuICAvLyBub3cgaGF2ZSBhbGwgdGhlIGVhcmx5L2xhdGUgYW5kIHN0YXJ0L2ZpbmlzaCB2YWx1ZXMgd2UgY2FuIG5vdyBjYWxjdWF0ZSB0aGVcbiAgLy8gc2xhY2suXG4gIHRvcG9sb2dpY2FsT3JkZXIucmV2ZXJzZSgpLmZvckVhY2goKHZlcnRleEluZGV4OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCB0YXNrID0gYy5WZXJ0aWNlc1t2ZXJ0ZXhJbmRleF07XG4gICAgY29uc3Qgc2xhY2sgPSBzbGFja3NbdmVydGV4SW5kZXhdO1xuICAgIGNvbnN0IHN1Y2Nlc3NvcnMgPSBlZGdlcy5ieVNyYy5nZXQodmVydGV4SW5kZXgpO1xuICAgIGlmICghc3VjY2Vzc29ycykge1xuICAgICAgc2xhY2subGF0ZS5maW5pc2ggPSBzbGFjay5lYXJseS5maW5pc2g7XG4gICAgICBzbGFjay5sYXRlLnN0YXJ0ID0gc2xhY2suZWFybHkuc3RhcnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNsYWNrLmxhdGUuZmluaXNoID0gTWF0aC5taW4oXG4gICAgICAgIC4uLmVkZ2VzLmJ5U3JjLmdldCh2ZXJ0ZXhJbmRleCkhLm1hcCgoZTogRGlyZWN0ZWRFZGdlKTogbnVtYmVyID0+IHtcbiAgICAgICAgICBjb25zdCBzdWNjZXNzb3JTbGFjayA9IHNsYWNrc1tlLmpdO1xuICAgICAgICAgIHJldHVybiBzdWNjZXNzb3JTbGFjay5sYXRlLnN0YXJ0O1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICAgIHNsYWNrLmxhdGUuc3RhcnQgPSByb3VuZChcbiAgICAgICAgc2xhY2subGF0ZS5maW5pc2ggLSB0YXNrRHVyYXRpb24odGFzaywgdmVydGV4SW5kZXgpXG4gICAgICApO1xuICAgICAgc2xhY2suc2xhY2sgPSByb3VuZChzbGFjay5sYXRlLmZpbmlzaCAtIHNsYWNrLmVhcmx5LmZpbmlzaCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gb2soc2xhY2tzKTtcbn1cblxuZXhwb3J0IGNvbnN0IENyaXRpY2FsUGF0aCA9IChzbGFja3M6IFNsYWNrW10sIHJvdW5kOiBSb3VuZGVyKTogbnVtYmVyW10gPT4ge1xuICBjb25zdCByZXQ6IG51bWJlcltdID0gW107XG4gIHNsYWNrcy5mb3JFYWNoKChzbGFjazogU2xhY2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICBpZiAoXG4gICAgICByb3VuZChzbGFjay5sYXRlLmZpbmlzaCAtIHNsYWNrLmVhcmx5LmZpbmlzaCkgPCBOdW1iZXIuRVBTSUxPTiAmJlxuICAgICAgcm91bmQoc2xhY2suZWFybHkuZmluaXNoIC0gc2xhY2suZWFybHkuc3RhcnQpID4gTnVtYmVyLkVQU0lMT05cbiAgICApIHtcbiAgICAgIHJldC5wdXNoKGluZGV4KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmV0O1xufTtcbiIsICIvLyBXaGVuIGFkZGluZyBwcm9wZXJ0aWVzIHRvIENvbG9yVGhlbWUgYWxzbyBtYWtlIHN1cmUgdG8gYWRkIGEgY29ycmVzcG9uZGluZ1xuLy8gQ1NTIEBwcm9wZXJ0eSBkZWNsYXJhdGlvbi5cbi8vXG4vLyBOb3RlIHRoYXQgZWFjaCBwcm9wZXJ0eSBhc3N1bWVzIHRoZSBwcmVzZW5jZSBvZiBhIENTUyB2YXJpYWJsZSBvZiB0aGUgc2FtZSBuYW1lXG4vLyB3aXRoIGEgcHJlY2VlZGluZyBgLS1gLlxuZXhwb3J0IGludGVyZmFjZSBUaGVtZSB7XG4gIHN1cmZhY2U6IHN0cmluZztcbiAgb25TdXJmYWNlOiBzdHJpbmc7XG4gIG9uU3VyZmFjZU11dGVkOiBzdHJpbmc7XG4gIG9uU3VyZmFjZVNlY29uZGFyeTogc3RyaW5nO1xuICBvdmVybGF5OiBzdHJpbmc7XG4gIGdyb3VwQ29sb3I6IHN0cmluZztcbn1cblxudHlwZSBUaGVtZVByb3AgPSBrZXlvZiBUaGVtZTtcblxuY29uc3QgY29sb3JUaGVtZVByb3RvdHlwZTogVGhlbWUgPSB7XG4gIHN1cmZhY2U6IFwiXCIsXG4gIG9uU3VyZmFjZTogXCJcIixcbiAgb25TdXJmYWNlTXV0ZWQ6IFwiXCIsXG4gIG9uU3VyZmFjZVNlY29uZGFyeTogXCJcIixcbiAgb3ZlcmxheTogXCJcIixcbiAgZ3JvdXBDb2xvcjogXCJcIixcbn07XG5cbmV4cG9ydCBjb25zdCBjb2xvclRoZW1lRnJvbUVsZW1lbnQgPSAoZWxlOiBIVE1MRWxlbWVudCk6IFRoZW1lID0+IHtcbiAgY29uc3Qgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsZSk7XG4gIGNvbnN0IHJldCA9IE9iamVjdC5hc3NpZ24oe30sIGNvbG9yVGhlbWVQcm90b3R5cGUpO1xuICBPYmplY3Qua2V5cyhyZXQpLmZvckVhY2goKG5hbWU6IHN0cmluZykgPT4ge1xuICAgIHJldFtuYW1lIGFzIFRoZW1lUHJvcF0gPSBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKGAtLSR7bmFtZX1gKTtcbiAgfSk7XG4gIHJldHVybiByZXQ7XG59O1xuIiwgIi8qKiBXaGVuIHRoZSBnaXZlbiBlbGVtZW50IGlzIGNsaWNrZWQsIHRoZW4gdG9nZ2xlIHRoZSBgZGFya21vZGVgIGNsYXNzIG9uIHRoZVxuICogYm9keSBlbGVtZW50LiAqL1xuZXhwb3J0IGNvbnN0IHRvZ2dsZVRoZW1lID0gKCkgPT4ge1xuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoXCJkYXJrbW9kZVwiKTtcbn07XG4iLCAiaW1wb3J0IHsgVGFzayB9IGZyb20gXCIuL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBlZGdlc0J5U3JjQW5kRHN0VG9NYXAgfSBmcm9tIFwiLi9kYWcvZGFnLnRzXCI7XG5pbXBvcnQge1xuICBEdXBUYXNrT3AsXG4gIEluc2VydE5ld0VtcHR5VGFza0FmdGVyT3AsXG4gIFNldFRhc2tOYW1lT3AsXG4gIFNwbGl0VGFza09wLFxufSBmcm9tIFwiLi9vcHMvY2hhcnQudHNcIjtcbmltcG9ydCB7IFNldE1ldHJpY1ZhbHVlT3AgfSBmcm9tIFwiLi9vcHMvbWV0cmljcy50c1wiO1xuaW1wb3J0IHsgT3AsIGFwcGx5QWxsT3BzVG9QbGFuIH0gZnJvbSBcIi4vb3BzL29wcy50c1wiO1xuaW1wb3J0IHtcbiAgQWRkUmVzb3VyY2VPcCxcbiAgQWRkUmVzb3VyY2VPcHRpb25PcCxcbiAgU2V0UmVzb3VyY2VWYWx1ZU9wLFxufSBmcm9tIFwiLi9vcHMvcmVzb3VyY2VzLnRzXCI7XG5pbXBvcnQgeyBGcm9tSlNPTiwgUGxhbiB9IGZyb20gXCIuL3BsYW4vcGxhbi50c1wiO1xuaW1wb3J0IHsgUHJlY2lzaW9uIH0gZnJvbSBcIi4vcHJlY2lzaW9uL3ByZWNpc2lvbi50c1wiO1xuaW1wb3J0IHtcbiAgRFJBR19SQU5HRV9FVkVOVCxcbiAgRHJhZ1JhbmdlLFxuICBNb3VzZU1vdmUsXG59IGZyb20gXCIuL3JlbmRlcmVyL21vdXNlbW92ZS9tb3VzZW1vdmUudHNcIjtcbmltcG9ydCB7IERpc3BsYXlSYW5nZSB9IGZyb20gXCIuL3JlbmRlcmVyL3JhbmdlL3JhbmdlLnRzXCI7XG5pbXBvcnQge1xuICBSZW5kZXJPcHRpb25zLFxuICBUYXNrTGFiZWwsXG4gIHJlbmRlclRhc2tzVG9DYW52YXMsXG4gIHN1Z2dlc3RlZENhbnZhc0hlaWdodCxcbn0gZnJvbSBcIi4vcmVuZGVyZXIvcmVuZGVyZXIudHNcIjtcbmltcG9ydCB7IFNjYWxlIH0gZnJvbSBcIi4vcmVuZGVyZXIvc2NhbGUvc2NhbGUudHNcIjtcbmltcG9ydCB7IFJlc3VsdCB9IGZyb20gXCIuL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgQ29tcHV0ZVNsYWNrLCBDcml0aWNhbFBhdGgsIFNsYWNrLCBTcGFuIH0gZnJvbSBcIi4vc2xhY2svc2xhY2sudHNcIjtcbmltcG9ydCB7IEphY29iaWFuLCBVbmNlcnRhaW50eSB9IGZyb20gXCIuL3N0YXRzL2NkZi90cmlhbmd1bGFyL2phY29iaWFuLnRzXCI7XG5pbXBvcnQgeyBUaGVtZSwgY29sb3JUaGVtZUZyb21FbGVtZW50IH0gZnJvbSBcIi4vc3R5bGUvdGhlbWUvdGhlbWUudHNcIjtcbmltcG9ydCB7IHRvZ2dsZVRoZW1lIH0gZnJvbSBcIi4vc3R5bGUvdG9nZ2xlci90b2dnbGVyLnRzXCI7XG5cbmNvbnN0IEZPTlRfU0laRV9QWCA9IDMyO1xuXG5sZXQgcGxhbiA9IG5ldyBQbGFuKCk7XG5jb25zdCBwcmVjaXNpb24gPSBuZXcgUHJlY2lzaW9uKDIpO1xuXG5jb25zdCBybmRJbnQgPSAobjogbnVtYmVyKTogbnVtYmVyID0+IHtcbiAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG4pO1xufTtcblxuY29uc3QgRFVSQVRJT04gPSAxMDAwO1xuXG5jb25zdCBybmREdXJhdGlvbiA9ICgpOiBudW1iZXIgPT4ge1xuICByZXR1cm4gcm5kSW50KERVUkFUSU9OKTtcbn07XG5cbmNvbnN0IHBlb3BsZTogc3RyaW5nW10gPSBbXCJGcmVkXCIsIFwiQmFybmV5XCIsIFwiV2lsbWFcIiwgXCJCZXR0eVwiXTtcblxuY29uc3Qgcm5kTmFtZSA9ICgpOiBzdHJpbmcgPT4gYCR7U3RyaW5nLmZyb21DaGFyQ29kZSg2NSArIHJuZEludCgyNikpfWA7XG5cbmNvbnN0IG9wczogT3BbXSA9IFtBZGRSZXNvdXJjZU9wKFwiUGVyc29uXCIpXTtcblxucGVvcGxlLmZvckVhY2goKHBlcnNvbjogc3RyaW5nKSA9PiB7XG4gIG9wcy5wdXNoKEFkZFJlc291cmNlT3B0aW9uT3AoXCJQZXJzb25cIiwgcGVyc29uKSk7XG59KTtcblxub3BzLnB1c2goXG4gIEluc2VydE5ld0VtcHR5VGFza0FmdGVyT3AoMCksXG4gIFNldE1ldHJpY1ZhbHVlT3AoXCJEdXJhdGlvblwiLCBybmREdXJhdGlvbigpLCAxKSxcbiAgU2V0VGFza05hbWVPcCgxLCBybmROYW1lKCkpLFxuICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJQZXJzb25cIiwgcGVvcGxlW3JuZEludChwZW9wbGUubGVuZ3RoKV0sIDEpLFxuICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJVbmNlcnRhaW50eVwiLCBcIm1vZGVyYXRlXCIsIDEpXG4pO1xuXG5sZXQgbnVtVGFza3MgPSAxO1xuZm9yIChsZXQgaSA9IDA7IGkgPCAyMDsgaSsrKSB7XG4gIGxldCBpbmRleCA9IHJuZEludChudW1UYXNrcykgKyAxO1xuICBvcHMucHVzaChcbiAgICBTcGxpdFRhc2tPcChpbmRleCksXG4gICAgU2V0TWV0cmljVmFsdWVPcChcIkR1cmF0aW9uXCIsIHJuZER1cmF0aW9uKCksIGluZGV4ICsgMSksXG4gICAgU2V0VGFza05hbWVPcChpbmRleCArIDEsIHJuZE5hbWUoKSksXG4gICAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiUGVyc29uXCIsIHBlb3BsZVtybmRJbnQocGVvcGxlLmxlbmd0aCldLCBpbmRleCArIDEpLFxuICAgIFNldFJlc291cmNlVmFsdWVPcChcIlVuY2VydGFpbnR5XCIsIFwibW9kZXJhdGVcIiwgaW5kZXggKyAxKVxuICApO1xuICBudW1UYXNrcysrO1xuICBpbmRleCA9IHJuZEludChudW1UYXNrcykgKyAxO1xuICBvcHMucHVzaChcbiAgICBEdXBUYXNrT3AoaW5kZXgpLFxuICAgIFNldE1ldHJpY1ZhbHVlT3AoXCJEdXJhdGlvblwiLCBybmREdXJhdGlvbigpLCBpbmRleCArIDEpLFxuICAgIFNldFRhc2tOYW1lT3AoaW5kZXggKyAxLCBybmROYW1lKCkpLFxuICAgIFNldFJlc291cmNlVmFsdWVPcChcIlBlcnNvblwiLCBwZW9wbGVbcm5kSW50KHBlb3BsZS5sZW5ndGgpXSwgaW5kZXggKyAxKSxcbiAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJVbmNlcnRhaW50eVwiLCBcIm1vZGVyYXRlXCIsIGluZGV4ICsgMSlcbiAgKTtcbiAgbnVtVGFza3MrKztcbn1cblxuY29uc3QgcmVzID0gYXBwbHlBbGxPcHNUb1BsYW4ob3BzLCBwbGFuKTtcblxuaWYgKCFyZXMub2spIHtcbiAgY29uc29sZS5sb2cocmVzLmVycm9yKTtcbn1cblxubGV0IHNsYWNrczogU2xhY2tbXSA9IFtdO1xubGV0IHNwYW5zOiBTcGFuW10gPSBbXTtcbmxldCBjcml0aWNhbFBhdGg6IG51bWJlcltdID0gW107XG5cbmNvbnN0IHJlY2FsY3VsYXRlU3BhbiA9ICgpID0+IHtcbiAgY29uc3Qgc2xhY2tSZXN1bHQgPSBDb21wdXRlU2xhY2socGxhbi5jaGFydCwgdW5kZWZpbmVkLCBwcmVjaXNpb24ucm91bmRlcigpKTtcbiAgaWYgKCFzbGFja1Jlc3VsdC5vaykge1xuICAgIGNvbnNvbGUuZXJyb3Ioc2xhY2tSZXN1bHQpO1xuICB9IGVsc2Uge1xuICAgIHNsYWNrcyA9IHNsYWNrUmVzdWx0LnZhbHVlO1xuICB9XG5cbiAgc3BhbnMgPSBzbGFja3MubWFwKCh2YWx1ZTogU2xhY2spOiBTcGFuID0+IHtcbiAgICByZXR1cm4gdmFsdWUuZWFybHk7XG4gIH0pO1xuICBjcml0aWNhbFBhdGggPSBDcml0aWNhbFBhdGgoc2xhY2tzLCBwcmVjaXNpb24ucm91bmRlcigpKTtcbn07XG5cbnJlY2FsY3VsYXRlU3BhbigpO1xuXG5jb25zdCB0YXNrTGFiZWw6IFRhc2tMYWJlbCA9ICh0YXNrSW5kZXg6IG51bWJlcik6IHN0cmluZyA9PlxuICBgJHtwbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tJbmRleF0ubmFtZX1gO1xuLy8gIGAke3BsYW4uY2hhcnQuVmVydGljZXNbdGFza0luZGV4XS5uYW1lfSAoJHtwbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tJbmRleF0ucmVzb3VyY2VzW1wiUGVyc29uXCJdfSkgYDtcblxuLy8gVE9ETyBFeHRyYWN0IHRoaXMgYXMgYSBoZWxwZXIgZm9yIHRoZSByYWRhciB2aWV3LlxubGV0IGRpc3BsYXlSYW5nZTogRGlzcGxheVJhbmdlIHwgbnVsbCA9IG51bGw7XG5sZXQgc2NhbGU6IFNjYWxlIHwgbnVsbCA9IG51bGw7XG5cbmNvbnN0IHJhZGFyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oXCIjcmFkYXJcIikhO1xubmV3IE1vdXNlTW92ZShyYWRhcik7XG5cbmNvbnN0IGRyYWdSYW5nZUhhbmRsZXIgPSAoZTogQ3VzdG9tRXZlbnQ8RHJhZ1JhbmdlPikgPT4ge1xuICBpZiAoc2NhbGUgPT09IG51bGwpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc29sZS5sb2coXCJtb3VzZVwiLCBlLmRldGFpbCk7XG4gIGNvbnN0IGJlZ2luID0gc2NhbGUuZGF5Um93RnJvbVBvaW50KGUuZGV0YWlsLmJlZ2luKTtcbiAgY29uc3QgZW5kID0gc2NhbGUuZGF5Um93RnJvbVBvaW50KGUuZGV0YWlsLmVuZCk7XG4gIGRpc3BsYXlSYW5nZSA9IG5ldyBEaXNwbGF5UmFuZ2UoYmVnaW4uZGF5LCBlbmQuZGF5KTtcbiAgY29uc29sZS5sb2coZGlzcGxheVJhbmdlKTtcbiAgcGFpbnRDaGFydCgpO1xufTtcblxucmFkYXIuYWRkRXZlbnRMaXN0ZW5lcihEUkFHX1JBTkdFX0VWRU5ULCBkcmFnUmFuZ2VIYW5kbGVyIGFzIEV2ZW50TGlzdGVuZXIpO1xuXG5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RhcmstbW9kZS10b2dnbGVcIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKFwiY2xpY2tcIik7XG4gIHRvZ2dsZVRoZW1lKCk7XG4gIHBhaW50Q2hhcnQoKTtcbn0pO1xuXG5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3JhZGFyLXRvZ2dsZVwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyYWRhci1wYXJlbnRcIikhLmNsYXNzTGlzdC50b2dnbGUoXCJoaWRkZW5cIik7XG59KTtcblxubGV0IHRvcFRpbWVsaW5lOiBib29sZWFuID0gZmFsc2U7XG5cbmRvY3VtZW50XG4gIC5xdWVyeVNlbGVjdG9yKFwiI3RvcC10aW1lbGluZS10b2dnbGVcIikhXG4gIC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIHRvcFRpbWVsaW5lID0gIXRvcFRpbWVsaW5lO1xuICAgIHBhaW50Q2hhcnQoKTtcbiAgfSk7XG5cbmxldCBncm91cEJ5T3B0aW9uczogc3RyaW5nW10gPSBbXCJcIiwgLi4uT2JqZWN0LmtleXMocGxhbi5yZXNvdXJjZURlZmluaXRpb25zKV07XG5sZXQgZ3JvdXBCeU9wdGlvbnNJbmRleDogbnVtYmVyID0gMDtcblxuY29uc3QgdG9nZ2xlR3JvdXBCeSA9ICgpID0+IHtcbiAgZ3JvdXBCeU9wdGlvbnNJbmRleCA9IChncm91cEJ5T3B0aW9uc0luZGV4ICsgMSkgJSBncm91cEJ5T3B0aW9ucy5sZW5ndGg7XG59O1xuXG5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dyb3VwLWJ5LXRvZ2dsZVwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgdG9nZ2xlR3JvdXBCeSgpO1xuICBwYWludENoYXJ0KCk7XG59KTtcblxuY29uc3QgcGFpbnRDaGFydCA9ICgpID0+IHtcbiAgY29uc29sZS50aW1lKFwicGFpbnRDaGFydFwiKTtcblxuICBjb25zdCB0aGVtZUNvbG9yczogVGhlbWUgPSBjb2xvclRoZW1lRnJvbUVsZW1lbnQoZG9jdW1lbnQuYm9keSk7XG5cbiAgY29uc3QgcmFkYXJPcHRzOiBSZW5kZXJPcHRpb25zID0ge1xuICAgIGZvbnRTaXplUHg6IDYsXG4gICAgaGFzVGV4dDogZmFsc2UsXG4gICAgZGlzcGxheVJhbmdlOiBkaXNwbGF5UmFuZ2UsXG4gICAgZGlzcGxheVJhbmdlVXNhZ2U6IFwiaGlnaGxpZ2h0XCIsXG4gICAgY29sb3JzOiB7XG4gICAgICBzdXJmYWNlOiB0aGVtZUNvbG9ycy5zdXJmYWNlLFxuICAgICAgb25TdXJmYWNlOiB0aGVtZUNvbG9ycy5vblN1cmZhY2UsXG4gICAgICBvblN1cmZhY2VNdXRlZDogdGhlbWVDb2xvcnMub25TdXJmYWNlTXV0ZWQsXG4gICAgICBvblN1cmZhY2VIaWdobGlnaHQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZVNlY29uZGFyeSxcbiAgICAgIG92ZXJsYXk6IHRoZW1lQ29sb3JzLm92ZXJsYXksXG4gICAgICBncm91cENvbG9yOiB0aGVtZUNvbG9ycy5ncm91cENvbG9yLFxuICAgIH0sXG4gICAgaGFzVGltZWxpbmU6IGZhbHNlLFxuICAgIGhhc1Rhc2tzOiB0cnVlLFxuICAgIGhhc0VkZ2VzOiBmYWxzZSxcbiAgICBkcmF3VGltZU1hcmtlcnNPblRhc2tzOiBmYWxzZSxcbiAgICB0YXNrTGFiZWw6IHRhc2tMYWJlbCxcbiAgICB0YXNrSGlnaGxpZ2h0czogY3JpdGljYWxQYXRoLFxuICAgIGdyb3VwQnlSZXNvdXJjZTogZ3JvdXBCeU9wdGlvbnNbZ3JvdXBCeU9wdGlvbnNJbmRleF0sXG4gIH07XG5cbiAgY29uc3Qgem9vbU9wdHM6IFJlbmRlck9wdGlvbnMgPSB7XG4gICAgZm9udFNpemVQeDogRk9OVF9TSVpFX1BYLFxuICAgIGhhc1RleHQ6IHRydWUsXG4gICAgZGlzcGxheVJhbmdlOiBkaXNwbGF5UmFuZ2UsXG4gICAgZGlzcGxheVJhbmdlVXNhZ2U6IFwicmVzdHJpY3RcIixcbiAgICBjb2xvcnM6IHtcbiAgICAgIHN1cmZhY2U6IHRoZW1lQ29sb3JzLnN1cmZhY2UsXG4gICAgICBvblN1cmZhY2U6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZSxcbiAgICAgIG9uU3VyZmFjZU11dGVkOiB0aGVtZUNvbG9ycy5vblN1cmZhY2VNdXRlZCxcbiAgICAgIG9uU3VyZmFjZUhpZ2hsaWdodDogdGhlbWVDb2xvcnMub25TdXJmYWNlU2Vjb25kYXJ5LFxuICAgICAgb3ZlcmxheTogdGhlbWVDb2xvcnMub3ZlcmxheSxcbiAgICAgIGdyb3VwQ29sb3I6IHRoZW1lQ29sb3JzLmdyb3VwQ29sb3IsXG4gICAgfSxcbiAgICBoYXNUaW1lbGluZTogdG9wVGltZWxpbmUsXG4gICAgaGFzVGFza3M6IHRydWUsXG4gICAgaGFzRWRnZXM6IHRydWUsXG4gICAgZHJhd1RpbWVNYXJrZXJzT25UYXNrczogdHJ1ZSxcbiAgICB0YXNrTGFiZWw6IHRhc2tMYWJlbCxcbiAgICB0YXNrSGlnaGxpZ2h0czogY3JpdGljYWxQYXRoLFxuICAgIGdyb3VwQnlSZXNvdXJjZTogZ3JvdXBCeU9wdGlvbnNbZ3JvdXBCeU9wdGlvbnNJbmRleF0sXG4gIH07XG5cbiAgY29uc3QgdGltZWxpbmVPcHRzOiBSZW5kZXJPcHRpb25zID0ge1xuICAgIGZvbnRTaXplUHg6IEZPTlRfU0laRV9QWCxcbiAgICBoYXNUZXh0OiB0cnVlLFxuICAgIGRpc3BsYXlSYW5nZTogZGlzcGxheVJhbmdlLFxuICAgIGRpc3BsYXlSYW5nZVVzYWdlOiBcInJlc3RyaWN0XCIsXG4gICAgY29sb3JzOiB7XG4gICAgICBzdXJmYWNlOiB0aGVtZUNvbG9ycy5zdXJmYWNlLFxuICAgICAgb25TdXJmYWNlOiB0aGVtZUNvbG9ycy5vblN1cmZhY2UsXG4gICAgICBvblN1cmZhY2VNdXRlZDogdGhlbWVDb2xvcnMub25TdXJmYWNlTXV0ZWQsXG4gICAgICBvblN1cmZhY2VIaWdobGlnaHQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZVNlY29uZGFyeSxcbiAgICAgIG92ZXJsYXk6IHRoZW1lQ29sb3JzLm92ZXJsYXksXG4gICAgICBncm91cENvbG9yOiB0aGVtZUNvbG9ycy5ncm91cENvbG9yLFxuICAgIH0sXG4gICAgaGFzVGltZWxpbmU6IHRydWUsXG4gICAgaGFzVGFza3M6IGZhbHNlLFxuICAgIGhhc0VkZ2VzOiB0cnVlLFxuICAgIGRyYXdUaW1lTWFya2Vyc09uVGFza3M6IHRydWUsXG4gICAgdGFza0xhYmVsOiB0YXNrTGFiZWwsXG4gICAgdGFza0hpZ2hsaWdodHM6IGNyaXRpY2FsUGF0aCxcbiAgICBncm91cEJ5UmVzb3VyY2U6IGdyb3VwQnlPcHRpb25zW2dyb3VwQnlPcHRpb25zSW5kZXhdLFxuICB9O1xuXG4gIHBhaW50T25lQ2hhcnQoXCIjem9vbWVkXCIsIHpvb21PcHRzKTtcbiAgcGFpbnRPbmVDaGFydChcIiN0aW1lbGluZVwiLCB0aW1lbGluZU9wdHMpO1xuICBjb25zdCByZXQgPSBwYWludE9uZUNoYXJ0KFwiI3JhZGFyXCIsIHJhZGFyT3B0cyk7XG5cbiAgaWYgKCFyZXQub2spIHtcbiAgICByZXR1cm47XG4gIH1cbiAgc2NhbGUgPSByZXQudmFsdWU7XG4gIGNvbnNvbGUudGltZUVuZChcInBhaW50Q2hhcnRcIik7XG59O1xuXG5jb25zdCBwYWludE9uZUNoYXJ0ID0gKFxuICBjYW52YXNJRDogc3RyaW5nLFxuICBvcHRzOiBSZW5kZXJPcHRpb25zXG4pOiBSZXN1bHQ8U2NhbGU+ID0+IHtcbiAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MQ2FudmFzRWxlbWVudD4oY2FudmFzSUQpITtcbiAgY29uc3QgcGFyZW50ID0gY2FudmFzIS5wYXJlbnRFbGVtZW50ITtcbiAgY29uc3QgcmF0aW8gPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbztcbiAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSBwYXJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIGNvbnN0IGNhbnZhc1dpZHRoID0gTWF0aC5jZWlsKHdpZHRoICogcmF0aW8pO1xuICBjb25zdCBjYW52YXNIZWlnaHQgPSBNYXRoLmNlaWwoaGVpZ2h0ICogcmF0aW8pO1xuICBjYW52YXMud2lkdGggPSBjYW52YXNXaWR0aDtcbiAgY2FudmFzLmhlaWdodCA9IGNhbnZhc0hlaWdodDtcbiAgY2FudmFzLnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgO1xuICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YDtcblxuICAvLyBOb3cgdXBkYXRlIHRoZSBjYW52YXMgaGVpZ2h0IHNvIHRoYXQgaXQgZml0cyB0aGUgY2hhcnQgYmVpbmcgZHJhd24uXG4gIC8vIFRPRE8gVHVybiB0aGlzIGludG8gYW4gb3B0aW9uIHNpbmNlIHdlIHdvbid0IGFsd2F5cyB3YW50IHRoaXMuXG5cbiAgaWYgKDEpIHtcbiAgICBjb25zdCBuZXdIZWlnaHQgPSBzdWdnZXN0ZWRDYW52YXNIZWlnaHQoXG4gICAgICBjYW52YXMsXG4gICAgICBzcGFucyxcbiAgICAgIG9wdHMsXG4gICAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCArIDIgLy8gVE9ETyAtIFdoeSBkbyB3ZSBuZWVkIHRoZSArMiBoZXJlIT9cbiAgICApO1xuICAgIGNhbnZhcy5oZWlnaHQgPSBuZXdIZWlnaHQ7XG4gICAgY2FudmFzLnN0eWxlLmhlaWdodCA9IGAke25ld0hlaWdodCAvIHJhdGlvfXB4YDtcbiAgfVxuICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpITtcbiAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuXG4gIHJldHVybiByZW5kZXJUYXNrc1RvQ2FudmFzKHBhcmVudCwgY2FudmFzLCBjdHgsIHBsYW4sIHNwYW5zLCBvcHRzKTtcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ3JpdGljYWxQYXRoRW50cnkge1xuICBjb3VudDogbnVtYmVyO1xuICB0YXNrczogbnVtYmVyW107XG4gIGR1cmF0aW9uczogbnVtYmVyW107XG59XG5cbmNvbnN0IHNpbXVsYXRlID0gKCkgPT4ge1xuICAvLyBTaW11bGF0ZSB0aGUgdW5jZXJ0YWludHkgaW4gdGhlIHBsYW4gYW5kIGdlbmVyYXRlIHBvc3NpYmxlIGFsdGVybmF0ZVxuICAvLyBjcml0aWNhbCBwYXRocy5cbiAgY29uc3QgTUFYX1JBTkRPTSA9IDEwMDA7XG4gIGNvbnN0IE5VTV9TSU1VTEFUSU9OX0xPT1BTID0gMTAwO1xuXG4gIGNvbnN0IGFsbENyaXRpY2FsUGF0aHMgPSBuZXcgTWFwPHN0cmluZywgQ3JpdGljYWxQYXRoRW50cnk+KCk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBOVU1fU0lNVUxBVElPTl9MT09QUzsgaSsrKSB7XG4gICAgY29uc3QgZHVyYXRpb25zID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5tYXAoKHQ6IFRhc2spID0+IHtcbiAgICAgIGNvbnN0IHJhd0R1cmF0aW9uID0gbmV3IEphY29iaWFuKFxuICAgICAgICB0LmR1cmF0aW9uLFxuICAgICAgICB0LmdldFJlc291cmNlKFwiVW5jZXJ0YWludHlcIikgYXMgVW5jZXJ0YWludHlcbiAgICAgICkuc2FtcGxlKHJuZEludChNQVhfUkFORE9NKSAvIE1BWF9SQU5ET00pO1xuICAgICAgcmV0dXJuIHByZWNpc2lvbi5yb3VuZChyYXdEdXJhdGlvbik7XG4gICAgfSk7XG5cbiAgICBjb25zdCBzbGFja3NSZXQgPSBDb21wdXRlU2xhY2soXG4gICAgICBwbGFuLmNoYXJ0LFxuICAgICAgKHQ6IFRhc2ssIHRhc2tJbmRleDogbnVtYmVyKSA9PiBkdXJhdGlvbnNbdGFza0luZGV4XSxcbiAgICAgIHByZWNpc2lvbi5yb3VuZGVyKClcbiAgICApO1xuICAgIGlmICghc2xhY2tzUmV0Lm9rKSB7XG4gICAgICB0aHJvdyBzbGFja3NSZXQuZXJyb3I7XG4gICAgfVxuICAgIGNvbnN0IGNyaXRpY2FsUGF0aCA9IENyaXRpY2FsUGF0aChzbGFja3NSZXQudmFsdWUsIHByZWNpc2lvbi5yb3VuZGVyKCkpO1xuICAgIGNvbnN0IGNyaXRpY2FsUGF0aEFzU3RyaW5nID0gYCR7Y3JpdGljYWxQYXRofWA7XG4gICAgbGV0IHBhdGhFbnRyeSA9IGFsbENyaXRpY2FsUGF0aHMuZ2V0KGNyaXRpY2FsUGF0aEFzU3RyaW5nKTtcbiAgICBpZiAocGF0aEVudHJ5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHBhdGhFbnRyeSA9IHtcbiAgICAgICAgY291bnQ6IDAsXG4gICAgICAgIHRhc2tzOiBjcml0aWNhbFBhdGgsXG4gICAgICAgIGR1cmF0aW9uczogZHVyYXRpb25zLFxuICAgICAgfTtcbiAgICAgIGFsbENyaXRpY2FsUGF0aHMuc2V0KGNyaXRpY2FsUGF0aEFzU3RyaW5nLCBwYXRoRW50cnkpO1xuICAgIH1cbiAgICBwYXRoRW50cnkuY291bnQrKztcbiAgfVxuXG4gIGxldCBkaXNwbGF5ID0gXCJcIjtcbiAgYWxsQ3JpdGljYWxQYXRocy5mb3JFYWNoKCh2YWx1ZTogQ3JpdGljYWxQYXRoRW50cnksIGtleTogc3RyaW5nKSA9PiB7XG4gICAgZGlzcGxheSA9XG4gICAgICBkaXNwbGF5ICtcbiAgICAgIGBcXG4gPGxpIGRhdGEta2V5PSR7a2V5fT4ke3ZhbHVlLmNvdW50fSA6ICR7a2V5fSA6ICR7dmFsdWUuZHVyYXRpb25zLmpvaW4oXCIsIFwiKX08L2xpPmA7XG4gIH0pO1xuXG4gIGNvbnN0IGNyaXRpYWxQYXRocyA9XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MVUxpc3RFbGVtZW50PihcIiNjcml0aWNhbFBhdGhzXCIpITtcbiAgY3JpdGlhbFBhdGhzLmlubmVySFRNTCA9IGRpc3BsYXk7XG5cbiAgLy8gRW5hYmxlIGNsaWNraW5nIG9uIGFsdGVybmF0ZSBjcml0aWNhbCBwYXRocy5cbiAgY3JpdGlhbFBhdGhzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgIGNvbnN0IGNyaXRpY2FsUGF0aEVudHJ5ID0gYWxsQ3JpdGljYWxQYXRocy5nZXQoXG4gICAgICAoZS50YXJnZXQgYXMgSFRNTExJRWxlbWVudCkuZGF0YXNldC5rZXkhXG4gICAgKSE7XG4gICAgY3JpdGljYWxQYXRoRW50cnkuZHVyYXRpb25zLmZvckVhY2goXG4gICAgICAoZHVyYXRpb246IG51bWJlciwgdGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgcGxhbi5jaGFydC5WZXJ0aWNlc1t0YXNrSW5kZXhdLmR1cmF0aW9uID0gZHVyYXRpb247XG4gICAgICB9XG4gICAgKTtcbiAgICByZWNhbGN1bGF0ZVNwYW4oKTtcbiAgICBwYWludENoYXJ0KCk7XG4gIH0pO1xuXG4gIC8vIEdlbmVyYXRlIGEgdGFibGUgb2YgdGFza3Mgb24gdGhlIGNyaXRpY2FsIHBhdGgsIHNvcnRlZCBieSBkdXJhdGlvbiwgYWxvbmdcbiAgLy8gd2l0aCB0aGVpciBwZXJjZW50YWdlIGNoYW5jZSBvZiBhcHBlYXJpbmcgb24gdGhlIGNyaXRpY2FsIHBhdGguXG5cbiAgaW50ZXJmYWNlIENyaXRpY2FsUGF0aFRhc2tFbnRyeSB7XG4gICAgdGFza0luZGV4OiBudW1iZXI7XG4gICAgZHVyYXRpb246IG51bWJlcjtcbiAgICBudW1UaW1lc0FwcGVhcmVkOiBudW1iZXI7XG4gIH1cblxuICBjb25zdCBjcml0aWFsVGFza3M6IE1hcDxudW1iZXIsIENyaXRpY2FsUGF0aFRhc2tFbnRyeT4gPSBuZXcgTWFwKCk7XG5cbiAgYWxsQ3JpdGljYWxQYXRocy5mb3JFYWNoKCh2YWx1ZTogQ3JpdGljYWxQYXRoRW50cnkpID0+IHtcbiAgICB2YWx1ZS50YXNrcy5mb3JFYWNoKCh0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgbGV0IHRhc2tFbnRyeSA9IGNyaXRpYWxUYXNrcy5nZXQodGFza0luZGV4KTtcbiAgICAgIGlmICh0YXNrRW50cnkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0YXNrRW50cnkgPSB7XG4gICAgICAgICAgdGFza0luZGV4OiB0YXNrSW5kZXgsXG4gICAgICAgICAgZHVyYXRpb246IHBsYW4uY2hhcnQuVmVydGljZXNbdGFza0luZGV4XS5kdXJhdGlvbixcbiAgICAgICAgICBudW1UaW1lc0FwcGVhcmVkOiAwLFxuICAgICAgICB9O1xuICAgICAgICBjcml0aWFsVGFza3Muc2V0KHRhc2tJbmRleCwgdGFza0VudHJ5KTtcbiAgICAgIH1cbiAgICAgIHRhc2tFbnRyeS5udW1UaW1lc0FwcGVhcmVkICs9IHZhbHVlLmNvdW50O1xuICAgIH0pO1xuICB9KTtcblxuICBjb25zdCBjcml0aWNhbFRhc2tzRHVyYXRpb25EZXNjZW5kaW5nID0gWy4uLmNyaXRpYWxUYXNrcy52YWx1ZXMoKV0uc29ydChcbiAgICAoYTogQ3JpdGljYWxQYXRoVGFza0VudHJ5LCBiOiBDcml0aWNhbFBhdGhUYXNrRW50cnkpOiBudW1iZXIgPT4ge1xuICAgICAgcmV0dXJuIGIuZHVyYXRpb24gLSBhLmR1cmF0aW9uO1xuICAgIH1cbiAgKTtcblxuICBsZXQgY3JpdGlhbFRhc2tzVGFibGUgPSBjcml0aWNhbFRhc2tzRHVyYXRpb25EZXNjZW5kaW5nXG4gICAgLm1hcChcbiAgICAgICh0YXNrRW50cnk6IENyaXRpY2FsUGF0aFRhc2tFbnRyeSkgPT4gYDx0cj5cbiAgPHRkPiR7cGxhbi5jaGFydC5WZXJ0aWNlc1t0YXNrRW50cnkudGFza0luZGV4XS5uYW1lfTwvdGQ+XG4gIDx0ZD4ke3Rhc2tFbnRyeS5kdXJhdGlvbn08L3RkPlxuICA8dGQ+JHtNYXRoLmZsb29yKCgxMDAgKiB0YXNrRW50cnkubnVtVGltZXNBcHBlYXJlZCkgLyBOVU1fU0lNVUxBVElPTl9MT09QUyl9PC90ZD5cbjwvdHI+YFxuICAgIClcbiAgICAuam9pbihcIlxcblwiKTtcbiAgY3JpdGlhbFRhc2tzVGFibGUgPVxuICAgIGA8dHI+PHRoPk5hbWU8L3RoPjx0aD5EdXJhdGlvbjwvdGg+PHRoPiU8L3RoPjwvdHI+XFxuYCArIGNyaXRpYWxUYXNrc1RhYmxlO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NyaXRpY2FsVGFza3NcIikhLmlubmVySFRNTCA9IGNyaXRpYWxUYXNrc1RhYmxlO1xuXG4gIC8vIFNob3cgYWxsIHRhc2tzIHRoYXQgY291bGQgYmUgb24gdGhlIGNyaXRpY2FsIHBhdGguXG5cbiAgcmVjYWxjdWxhdGVTcGFuKCk7XG4gIGNyaXRpY2FsUGF0aCA9IGNyaXRpY2FsVGFza3NEdXJhdGlvbkRlc2NlbmRpbmcubWFwKFxuICAgICh0YXNrRW50cnk6IENyaXRpY2FsUGF0aFRhc2tFbnRyeSkgPT4gdGFza0VudHJ5LnRhc2tJbmRleFxuICApO1xuICBwYWludENoYXJ0KCk7XG5cbiAgLy8gUG9wdWxhdGUgdGhlIGRvd25sb2FkIGxpbmsuXG5cbiAgY29uc3QgZG93bmxvYWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxMaW5rRWxlbWVudD4oXCIjZG93bmxvYWRcIikhO1xuICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShwbGFuLCBudWxsLCBcIiAgXCIpKTtcbiAgY29uc3QgZG93bmxvYWRCbG9iID0gbmV3IEJsb2IoW0pTT04uc3RyaW5naWZ5KHBsYW4sIG51bGwsIFwiICBcIildLCB7XG4gICAgdHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gIH0pO1xuICBkb3dubG9hZC5ocmVmID0gVVJMLmNyZWF0ZU9iamVjdFVSTChkb3dubG9hZEJsb2IpO1xufTtcblxuLy8gUmVhY3QgdG8gdGhlIHVwbG9hZCBpbnB1dC5cbmNvbnN0IGZpbGVVcGxvYWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxJbnB1dEVsZW1lbnQ+KFwiI2ZpbGUtdXBsb2FkXCIpITtcbmZpbGVVcGxvYWQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IGpzb24gPSBhd2FpdCBmaWxlVXBsb2FkLmZpbGVzIVswXS50ZXh0KCk7XG4gIGNvbnN0IHJldCA9IEZyb21KU09OKGpzb24pO1xuICBpZiAoIXJldC5vaykge1xuICAgIGNvbnNvbGUubG9nKHJldC5lcnJvcik7XG4gICAgdGhyb3cgcmV0LmVycm9yO1xuICB9XG4gIHBsYW4gPSByZXQudmFsdWU7XG4gIGdyb3VwQnlPcHRpb25zID0gW1wiXCIsIC4uLk9iamVjdC5rZXlzKHBsYW4ucmVzb3VyY2VEZWZpbml0aW9ucyldO1xuICByZWNhbGN1bGF0ZVNwYW4oKTtcbiAgc2ltdWxhdGUoKTtcbiAgY29uc3QgbWFwcyA9IGVkZ2VzQnlTcmNBbmREc3RUb01hcChwbGFuLmNoYXJ0LkVkZ2VzKTtcbiAgY29uc29sZS5sb2cobWFwcyk7XG4gIGNvbnNvbGUubG9nKHBsYW4pO1xuICBwYWludENoYXJ0KCk7XG59KTtcblxuc2ltdWxhdGUoKTtcbnBhaW50Q2hhcnQoKTtcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHBhaW50Q2hhcnQpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7O0FBaUJPLE1BQU0sZUFBTixNQUFtQjtBQUFBLElBQ3hCLElBQVk7QUFBQSxJQUNaLElBQVk7QUFBQSxJQUVaLFlBQVksSUFBWSxHQUFHLElBQVksR0FBRztBQUN4QyxXQUFLLElBQUk7QUFDVCxXQUFLLElBQUk7QUFBQSxJQUNYO0FBQUEsSUFFQSxNQUFNLEtBQTRCO0FBQ2hDLGFBQU8sSUFBSSxNQUFNLEtBQUssS0FBSyxJQUFJLE1BQU0sS0FBSztBQUFBLElBQzVDO0FBQUEsSUFFQSxTQUFpQztBQUMvQixhQUFPO0FBQUEsUUFDTCxHQUFHLEtBQUs7QUFBQSxRQUNSLEdBQUcsS0FBSztBQUFBLE1BQ1Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQWtCTyxNQUFNLGtCQUFrQixDQUFDLFVBQXFDO0FBQ25FLFVBQU0sTUFBTSxvQkFBSSxJQUFtQjtBQUVuQyxVQUFNLFFBQVEsQ0FBQyxNQUFvQjtBQUNqQyxZQUFNLE1BQU0sSUFBSSxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUM7QUFDN0IsVUFBSSxLQUFLLENBQUM7QUFDVixVQUFJLElBQUksRUFBRSxHQUFHLEdBQUc7QUFBQSxJQUNsQixDQUFDO0FBRUQsV0FBTztBQUFBLEVBQ1Q7QUFVTyxNQUFNLGtCQUFrQixDQUFDLFVBQXFDO0FBQ25FLFVBQU0sTUFBTSxvQkFBSSxJQUFtQjtBQUVuQyxVQUFNLFFBQVEsQ0FBQyxNQUFvQjtBQUNqQyxZQUFNLE1BQU0sSUFBSSxJQUFJ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QUFBQSxNQUNDLENBQUMsY0FBcUM7QUFBQSxRQUNwQyxLQUFLLE1BQU0sU0FBUyxVQUFVLFNBQVMsRUFBRSxJQUFJO0FBQUEsUUFDN0MsVUFBVSxRQUFRO0FBQUEsUUFDbEIsS0FBSyxNQUFPLE1BQU0sVUFBVSxtQkFBb0Isb0JBQW9CLENBQUM7QUFBQTtBQUFBLElBRXpFLEVBQ0MsS0FBSyxJQUFJO0FBQ1osd0JBQ0U7QUFBQSxJQUF3RDtBQUMxRCxhQUFTLGNBQWMsZ0JBQWdCLEVBQUcsWUFBWTtBQUl0RCxvQkFBZ0I7QUFDaEIsbUJBQWUsZ0NBQWdDO0FBQUEsTUFDN0MsQ0FBQyxjQUFxQyxVQUFVO0FBQUEsSUFDbEQ7QUFDQSxlQUFXO0FBSVgsVUFBTSxXQUFXLFNBQVMsY0FBK0IsV0FBVztBQUNwRSxZQUFRLElBQUksS0FBSyxVQUFVLE1BQU0sTUFBTSxJQUFJLENBQUM7QUFDNUMsVUFBTSxlQUFlLElBQUksS0FBSyxDQUFDLEtBQUssVUFBVSxNQUFNLE1BQU0sSUFBSSxDQUFDLEdBQUc7QUFBQSxNQUNoRSxNQUFNO0FBQUEsSUFDUixDQUFDO0FBQ0QsYUFBUyxPQUFPLElBQUksZ0JBQWdCLFlBQVk7QUFBQSxFQUNsRDtBQUdBLE1BQU0sYUFBYSxTQUFTLGNBQWdDLGNBQWM7QUFDMUUsYUFBVyxpQkFBaUIsVUFBVSxZQUFZO0FBQ2hELFVBQU0sT0FBTyxNQUFNLFdBQVcsTUFBTyxDQUFDLEVBQUUsS0FBSztBQUM3QyxVQUFNLE1BQU0sU0FBUyxJQUFJO0FBQ3pCLFFBQUksQ0FBQyxJQUFJLElBQUk7QUFDWCxjQUFRLElBQUksSUFBSSxLQUFLO0FBQ3JCLFlBQU0sSUFBSTtBQUFBLElBQ1o7QUFDQSxXQUFPLElBQUk7QUFDWCxxQkFBaUIsQ0FBQyxJQUFJLEdBQUcsT0FBTyxLQUFLLEtBQUssbUJBQW1CLENBQUM7QUFDOUQsb0JBQWdCO0FBQ2hCLGFBQVM7QUFDVCxVQUFNLE9BQU8sc0JBQXNCLEtBQUssTUFBTSxLQUFLO0FBQ25ELFlBQVEsSUFBSSxJQUFJO0FBQ2hCLFlBQVEsSUFBSSxJQUFJO0FBQ2hCLGVBQVc7QUFBQSxFQUNiLENBQUM7QUFFRCxXQUFTO0FBQ1QsYUFBVztBQUNYLFNBQU8saUJBQWlCLFVBQVUsVUFBVTsiLAogICJuYW1lcyI6IFsicGxhbiIsICJyZXMiLCAib3BzIiwgInBsYW4iLCAicGxhbiIsICJwbGFuIiwgInBsYW4iLCAib2siLCAicHJlY2lzaW9uIiwgInByZWNpc2lvbiIsICJwbGFuIiwgInNwYW5zIiwgInBsYW4iLCAicmVzb3VyY2VEZWZpbml0aW9uIiwgInNjYWxlIiwgInJvdyIsICJzbGFja3MiLCAiY3JpdGljYWxQYXRoIl0KfQo=
