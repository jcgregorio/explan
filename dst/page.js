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
  var RESIZING_CLASS = "resizing";
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
    /** The point where dragging started, in Page coordinates. */
    begin = null;
    /** The dimensions of the parent element in Page coordinates as of mousedown
     * on the divider.. */
    parentRect = null;
    /** The current mouse position in Page coordinates. */
    currentMoveLocation = new Point(0, 0);
    /** The last mouse position in Page coordinates reported via CustomEvent. */
    lastMoveSent = new Point(0, 0);
    /** The parent element that contains the divider. */
    parent;
    /** The divider element to be dragged across the parent element. */
    divider;
    /** The handle of the window.setInterval(). */
    internvalHandle = 0;
    /** The type of divider, either vertical ("column"), or horizontal ("row"). */
    dividerType;
    constructor(parent, divider2, dividerType = "column") {
      this.parent = parent;
      this.divider = divider2;
      this.dividerType = dividerType;
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
        let diffPercent = 0;
        if (this.dividerType === "column") {
          diffPercent = 100 * (this.currentMoveLocation.x - this.parentRect.left) / this.parentRect.width;
        } else {
          diffPercent = 100 * (this.currentMoveLocation.y - this.parentRect.top) / this.parentRect.height;
        }
        diffPercent = clamp(diffPercent, 5, 95);
        this.parent.dispatchEvent(
          new CustomEvent(DIVIDER_MOVE_EVENT, {
            detail: {
              before: diffPercent,
              after: 100 - diffPercent
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
      this.parent.classList.add(RESIZING_CLASS);
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
      this.parent.classList.remove(RESIZING_CLASS);
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
        case 8 /* rowHeight */:
          return this.rowHeightPx;
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
      opts.taskEmphasize,
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
        if (opts.highlightedTask !== null && taskIndex === opts.highlightedTask) {
          const oldFillStyle = ctx.fillStyle;
          const highlightStart = scale2.feature(
            row,
            span.start,
            16 /* taskEnvelopeTop */
          );
          const highlightEnd = scale2.feature(
            row + 1,
            span.finish,
            16 /* taskEnvelopeTop */
          );
          ctx.fillStyle = opts.colors.highlight;
          drawTaskHighlight(ctx, highlightStart, highlightEnd);
          ctx.fillStyle = oldFillStyle;
        }
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
  function drawTaskHighlight(ctx, highlightStart, highlightEnd) {
    ctx.fillRect(
      highlightStart.x,
      highlightStart.y,
      highlightEnd.x - highlightStart.x,
      highlightEnd.y - highlightStart.y
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
    groupColor: "",
    highlight: ""
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
  new DividerMove(document.body, divider, "column");
  var dividerDragRangeHandler = (e) => {
    wrapper.style.setProperty(
      "grid-template-columns",
      `calc(${e.detail.before}% - 15px) 10px auto`
    );
    paintChart();
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
        groupColor: themeColors.groupColor,
        highlight: themeColors.highlight
      },
      hasTimeline: false,
      hasTasks: true,
      hasEdges: false,
      drawTimeMarkersOnTasks: false,
      taskLabel,
      taskEmphasize: criticalPath,
      filterFunc: null,
      groupByResource: groupByOptions[groupByOptionsIndex],
      highlightedTask: null
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
        groupColor: themeColors.groupColor,
        highlight: themeColors.highlight
      },
      hasTimeline: topTimeline,
      hasTasks: true,
      hasEdges: true,
      drawTimeMarkersOnTasks: true,
      taskLabel,
      taskEmphasize: criticalPath,
      filterFunc,
      groupByResource: groupByOptions[groupByOptionsIndex],
      highlightedTask: 1
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
        groupColor: themeColors.groupColor,
        highlight: themeColors.highlight
      },
      hasTimeline: true,
      hasTasks: false,
      hasEdges: true,
      drawTimeMarkersOnTasks: true,
      taskLabel,
      taskEmphasize: criticalPath,
      filterFunc,
      groupByResource: groupByOptions[groupByOptionsIndex],
      highlightedTask: null
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2RhZy9kYWcudHMiLCAiLi4vc3JjL3Jlc3VsdC50cyIsICIuLi9zcmMvb3BzL29wcy50cyIsICIuLi9zcmMvb3BzL2NoYXJ0LnRzIiwgIi4uL3NyYy9vcHMvbWV0cmljcy50cyIsICIuLi9zcmMvcmVzb3VyY2VzL3Jlc291cmNlcy50cyIsICIuLi9zcmMvb3BzL3Jlc291cmNlcy50cyIsICIuLi9zcmMvZGFnL2FsZ29yaXRobXMvdG9wb3NvcnQudHMiLCAiLi4vc3JjL2NoYXJ0L2NoYXJ0LnRzIiwgIi4uL3NyYy9wcmVjaXNpb24vcHJlY2lzaW9uLnRzIiwgIi4uL3NyYy9tZXRyaWNzL3JhbmdlLnRzIiwgIi4uL3NyYy9tZXRyaWNzL21ldHJpY3MudHMiLCAiLi4vc3JjL3N0YXRzL2NkZi90cmlhbmd1bGFyL3RyaWFuZ3VsYXIudHMiLCAiLi4vc3JjL3N0YXRzL2NkZi90cmlhbmd1bGFyL2phY29iaWFuLnRzIiwgIi4uL3NyYy9wbGFuL3BsYW4udHMiLCAiLi4vc3JjL3JlbmRlcmVyL3NjYWxlL3BvaW50LnRzIiwgIi4uL3NyYy9yZW5kZXJlci9kaXZpZGVybW92ZS9kaXZpZGVybW92ZS50cyIsICIuLi9zcmMvcmVuZGVyZXIvbW91c2Vtb3ZlL21vdXNlbW92ZS50cyIsICIuLi9zcmMvcmVuZGVyZXIvcmFuZ2UvcmFuZ2UudHMiLCAiLi4vc3JjL2NoYXJ0L2ZpbHRlci9maWx0ZXIudHMiLCAiLi4vc3JjL3JlbmRlcmVyL3NjYWxlL3NjYWxlLnRzIiwgIi4uL3NyYy9yZW5kZXJlci9yZW5kZXJlci50cyIsICIuLi9zcmMvc2xhY2svc2xhY2sudHMiLCAiLi4vc3JjL3N0eWxlL3RoZW1lL3RoZW1lLnRzIiwgIi4uL3NyYy9zdHlsZS90b2dnbGVyL3RvZ2dsZXIudHMiLCAiLi4vc3JjL3BhZ2UudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKiBPbmUgdmVydGV4IG9mIGEgZ3JhcGguICovXG5leHBvcnQgdHlwZSBWZXJ0ZXggPSBvYmplY3Q7XG5cbi8qKiBFdmVyeSBWZXJ0ZXggaW4gYSBncmFwaC4gKi9cbmV4cG9ydCB0eXBlIFZlcnRpY2VzID0gVmVydGV4W107XG5cbi8qKiBBIHN1YnNldCBvZiBWZXJ0aWNlcyByZWZlcnJlZCB0byBieSB0aGVpciBpbmRleCBudW1iZXIuICovXG5leHBvcnQgdHlwZSBWZXJ0ZXhJbmRpY2VzID0gbnVtYmVyW107XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlyZWN0ZWRFZGdlU2VyaWFsaXplZCB7XG4gIGk6IG51bWJlcjtcbiAgajogbnVtYmVyO1xufVxuXG4vKiogT25lIGVkZ2Ugb2YgYSBncmFwaCwgd2hpY2ggaXMgYSBkaXJlY3RlZCBjb25uZWN0aW9uIGZyb20gdGhlIGkndGggVmVydGV4IHRvXG50aGUgaid0aCBWZXJ0ZXgsIHdoZXJlIHRoZSBWZXJ0ZXggaXMgc3RvcmVkIGluIGEgVmVydGljZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBEaXJlY3RlZEVkZ2Uge1xuICBpOiBudW1iZXIgPSAwO1xuICBqOiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGk6IG51bWJlciA9IDAsIGo6IG51bWJlciA9IDApIHtcbiAgICB0aGlzLmkgPSBpO1xuICAgIHRoaXMuaiA9IGo7XG4gIH1cblxuICBlcXVhbChyaHM6IERpcmVjdGVkRWRnZSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiByaHMuaSA9PT0gdGhpcy5pICYmIHJocy5qID09PSB0aGlzLmo7XG4gIH1cblxuICB0b0pTT04oKTogRGlyZWN0ZWRFZGdlU2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGk6IHRoaXMuaSxcbiAgICAgIGo6IHRoaXMuaixcbiAgICB9O1xuICB9XG59XG5cbi8qKiBFdmVyeSBFZ2RlIGluIGEgZ3JhcGguICovXG5leHBvcnQgdHlwZSBFZGdlcyA9IERpcmVjdGVkRWRnZVtdO1xuXG4vKiogQSBncmFwaCBpcyBqdXN0IGEgY29sbGVjdGlvbiBvZiBWZXJ0aWNlcyBhbmQgRWRnZXMgYmV0d2VlbiB0aG9zZSB2ZXJ0aWNlcy4gKi9cbmV4cG9ydCB0eXBlIERpcmVjdGVkR3JhcGggPSB7XG4gIFZlcnRpY2VzOiBWZXJ0aWNlcztcbiAgRWRnZXM6IEVkZ2VzO1xufTtcblxuLyoqXG4gR3JvdXBzIHRoZSBFZGdlcyBieSB0aGVpciBgaWAgdmFsdWUuXG5cbiBAcGFyYW0gZWRnZXMgLSBBbGwgdGhlIEVnZXMgaW4gYSBEaXJlY3RlZEdyYXBoLlxuIEByZXR1cm5zIEEgbWFwIGZyb20gdGhlIFZlcnRleCBpbmRleCB0byBhbGwgdGhlIEVkZ2VzIHRoYXQgc3RhcnQgYXRcbiAgIGF0IHRoYXQgVmVydGV4IGluZGV4LlxuICovXG5leHBvcnQgY29uc3QgZWRnZXNCeVNyY1RvTWFwID0gKGVkZ2VzOiBFZGdlcyk6IE1hcDxudW1iZXIsIEVkZ2VzPiA9PiB7XG4gIGNvbnN0IHJldCA9IG5ldyBNYXA8bnVtYmVyLCBFZGdlcz4oKTtcblxuICBlZGdlcy5mb3JFYWNoKChlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICBjb25zdCBhcnIgPSByZXQuZ2V0KGUuaSkgfHwgW107XG4gICAgYXJyLnB1c2goZSk7XG4gICAgcmV0LnNldChlLmksIGFycik7XG4gIH0pO1xuXG4gIHJldHVybiByZXQ7XG59O1xuXG4vKipcbiAgIEdyb3VwcyB0aGUgRWRnZXMgYnkgdGhlaXIgYGpgIHZhbHVlLlxuICBcbiAgIEBwYXJhbSBlZGdlcyAtIEFsbCB0aGUgRWRnZXMgaW4gYSBEaXJlY3RlZEdyYXBoLlxuICAgQHJldHVybnMgQSBtYXAgZnJvbSB0aGUgVmVydGV4IGluZGV4IHRvIGFsbCB0aGUgRWRnZXMgdGhhdCBlbmQgYXRcbiAgICAgYXQgdGhhdCBWZXJ0ZXggaW5kZXguXG4gICAqL1xuXG5leHBvcnQgY29uc3QgZWRnZXNCeURzdFRvTWFwID0gKGVkZ2VzOiBFZGdlcyk6IE1hcDxudW1iZXIsIEVkZ2VzPiA9PiB7XG4gIGNvbnN0IHJldCA9IG5ldyBNYXA8bnVtYmVyLCBFZGdlcz4oKTtcblxuICBlZGdlcy5mb3JFYWNoKChlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICBjb25zdCBhcnIgPSByZXQuZ2V0KGUuaikgfHwgW107XG4gICAgYXJyLnB1c2goZSk7XG4gICAgcmV0LnNldChlLmosIGFycik7XG4gIH0pO1xuXG4gIHJldHVybiByZXQ7XG59O1xuXG5leHBvcnQgdHlwZSBTcmNBbmREc3RSZXR1cm4gPSB7XG4gIGJ5U3JjOiBNYXA8bnVtYmVyLCBFZGdlcz47XG4gIGJ5RHN0OiBNYXA8bnVtYmVyLCBFZGdlcz47XG59O1xuXG5leHBvcnQgY29uc3QgZWRnZXNCeVNyY0FuZERzdFRvTWFwID0gKGVkZ2VzOiBFZGdlcyk6IFNyY0FuZERzdFJldHVybiA9PiB7XG4gIGNvbnN0IHJldCA9IHtcbiAgICBieVNyYzogbmV3IE1hcDxudW1iZXIsIEVkZ2VzPigpLFxuICAgIGJ5RHN0OiBuZXcgTWFwPG51bWJlciwgRWRnZXM+KCksXG4gIH07XG5cbiAgZWRnZXMuZm9yRWFjaCgoZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgbGV0IGFyciA9IHJldC5ieVNyYy5nZXQoZS5pKSB8fCBbXTtcbiAgICBhcnIucHVzaChlKTtcbiAgICByZXQuYnlTcmMuc2V0KGUuaSwgYXJyKTtcbiAgICBhcnIgPSByZXQuYnlEc3QuZ2V0KGUuaikgfHwgW107XG4gICAgYXJyLnB1c2goZSk7XG4gICAgcmV0LmJ5RHN0LnNldChlLmosIGFycik7XG4gIH0pO1xuXG4gIHJldHVybiByZXQ7XG59O1xuIiwgIi8qKiBSZXN1bHQgYWxsb3dzIGVhc2llciBoYW5kbGluZyBvZiByZXR1cm5pbmcgZWl0aGVyIGFuIGVycm9yIG9yIGEgdmFsdWUgZnJvbSBhXG4gKiBmdW5jdGlvbi4gKi9cbmV4cG9ydCB0eXBlIFJlc3VsdDxUPiA9IHsgb2s6IHRydWU7IHZhbHVlOiBUIH0gfCB7IG9rOiBmYWxzZTsgZXJyb3I6IEVycm9yIH07XG5cbmV4cG9ydCBmdW5jdGlvbiBvazxUPih2YWx1ZTogVCk6IFJlc3VsdDxUPiB7XG4gIHJldHVybiB7IG9rOiB0cnVlLCB2YWx1ZTogdmFsdWUgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVycm9yPFQ+KHZhbHVlOiBzdHJpbmcgfCBFcnJvcik6IFJlc3VsdDxUPiB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpIHtcbiAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBuZXcgRXJyb3IodmFsdWUpIH07XG4gIH1cbiAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogdmFsdWUgfTtcbn1cbiIsICJpbXBvcnQgeyBSZXN1bHQsIG9rIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcblxuLy8gT3BlcmF0aW9ucyBvbiBQbGFucy4gTm90ZSB0aGV5IGFyZSByZXZlcnNpYmxlLCBzbyB3ZSBjYW4gaGF2ZSBhbiAndW5kbycgbGlzdC5cblxuLy8gQWxzbywgc29tZSBvcGVyYXRpb25zIG1pZ2h0IGhhdmUgJ3BhcnRpYWxzJywgaS5lLiByZXR1cm4gYSBsaXN0IG9mIHZhbGlkXG4vLyBvcHRpb25zIHRoYXQgY2FuIGJlIHBhc3NlZCB0byB0aGUgb3BlcmF0aW9uLiBGb3IgZXhhbXBsZSwgYWRkaW5nIGFcbi8vIHByZWRlY2Vzc29yIGNvdWxkIGxpc3QgYWxsIHRoZSBUYXNrcyB0aGF0IHdvdWxkIG5vdCBmb3JtIGEgbG9vcCwgaS5lLiBleGNsdWRlXG4vLyBhbGwgZGVzY2VuZGVudHMsIGFuZCB0aGUgVGFzayBpdHNlbGYsIGZyb20gdGhlIGxpc3Qgb2Ygb3B0aW9ucy5cbi8vXG4vLyAqIENoYW5nZSBzdHJpbmcgdmFsdWUgaW4gYSBUYXNrLlxuLy8gKiBDaGFuZ2UgZHVyYXRpb24gdmFsdWUgaW4gYSBUYXNrLlxuLy8gKiBJbnNlcnQgbmV3IGVtcHR5IFRhc2sgYWZ0ZXIgSW5kZXguXG4vLyAqIFNwbGl0IGEgVGFzay4gKFByZWRlY2Vzc29yIHRha2VzIGFsbCBpbmNvbWluZyBlZGdlcywgc291cmNlIHRhc2tzIGFsbCBvdXRnb2luZyBlZGdlcykuXG4vL1xuLy8gKiBEdXBsaWNhdGUgYSBUYXNrIChhbGwgZWRnZXMgYXJlIGR1cGxpY2F0ZWQgZnJvbSB0aGUgc291cmNlIFRhc2spLlxuLy8gKiBEZWxldGUgcHJlZGVjZXNzb3IgdG8gYSBUYXNrLlxuLy8gKiBEZWxldGUgc3VjY2Vzc29yIHRvIGEgVGFzay5cbi8vICogRGVsZXRlIGEgVGFzay5cblxuLy8gTmVlZCBVbmRvL1JlZG8gU3RhY2tzLlxuLy8gVGhlc2UgcmVjb3JkIHRoZSBzdWItb3BzIGZvciBlYWNoIGxhcmdlIG9wLiBFLmcuIGFuIGluc2VydCB0YXNrIG9wIGlzIG1hZGVcbi8vIG9mIHRocmVlIHN1Yi1vcHM6XG4vLyAgICAxLiBpbnNlcnQgdGFzayBpbnRvIFZlcnRpY2VzIGFuZCByZW51bWJlciBFZGdlc1xuLy8gICAgMi4gQWRkIGVkZ2UgZnJvbSBTdGFydCB0byBOZXcgVGFza1xuLy8gICAgMy4gQWRkIGVkZ2UgZnJvbSBOZXcgVGFzayB0byBGaW5pc2hcbi8vXG4vLyBFYWNoIHN1Yi1vcDpcbi8vICAgIDEuIFJlY29yZHMgYWxsIHRoZSBpbmZvIGl0IG5lZWRzIHRvIHdvcmsuXG4vLyAgICAyLiBDYW4gYmUgXCJhcHBsaWVkXCIgdG8gYSBQbGFuLlxuLy8gICAgMy4gQ2FuIGdlbmVyYXRlIGl0cyBpbnZlcnNlIHN1Yi1vcC5cblxuLy8gVGhlIHJlc3VsdHMgZnJvbSBhcHBseWluZyBhIFN1Yk9wLiBUaGlzIGlzIHRoZSBvbmx5IHdheSB0byBnZXQgdGhlIGludmVyc2Ugb2Zcbi8vIGEgU3ViT3Agc2luY2UgdGhlIFN1Yk9wIGludmVyc2UgbWlnaHQgZGVwZW5kIG9uIHRoZSBzdGF0ZSBvZiB0aGUgUGxhbiBhdCB0aGVcbi8vIHRpbWUgdGhlIFN1Yk9wIHdhcyBhcHBsaWVkLlxuZXhwb3J0IGludGVyZmFjZSBTdWJPcFJlc3VsdCB7XG4gIHBsYW46IFBsYW47XG4gIGludmVyc2U6IFN1Yk9wO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFN1Yk9wIHtcbiAgLy8gSWYgdGhlIGFwcGx5IHJldHVybnMgYW4gZXJyb3IgaXQgaXMgZ3VhcmFudGVlZCBub3QgdG8gaGF2ZSBtb2RpZmllZCB0aGVcbiAgLy8gUGxhbi5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3BSZXN1bHQge1xuICBwbGFuOiBQbGFuO1xuICBpbnZlcnNlOiBPcDtcbn1cblxuLy8gT3AgYXJlIG9wZXJhdGlvbnMgYXJlIGFwcGxpZWQgdG8gbWFrZSBjaGFuZ2VzIHRvIGEgUGxhbi5cbmV4cG9ydCBjbGFzcyBPcCB7XG4gIHN1Yk9wczogU3ViT3BbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKHN1Yk9wczogU3ViT3BbXSkge1xuICAgIHRoaXMuc3ViT3BzID0gc3ViT3BzO1xuICB9XG5cbiAgLy8gUmV2ZXJ0cyBhbGwgU3ViT3BzIHVwIHRvIHRoZSBnaXZlbiBpbmRleC5cbiAgYXBwbHlBbGxJbnZlcnNlU3ViT3BzVG9QbGFuKFxuICAgIHBsYW46IFBsYW4sXG4gICAgaW52ZXJzZVN1Yk9wczogU3ViT3BbXVxuICApOiBSZXN1bHQ8UGxhbj4ge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW52ZXJzZVN1Yk9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZSA9IGludmVyc2VTdWJPcHNbaV0uYXBwbHkocGxhbik7XG4gICAgICBpZiAoIWUub2spIHtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgICBwbGFuID0gZS52YWx1ZS5wbGFuO1xuICAgIH1cblxuICAgIHJldHVybiBvayhwbGFuKTtcbiAgfVxuXG4gIC8vIEFwcGxpZXMgdGhlIE9wIHRvIGEgUGxhbi5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGludmVyc2VTdWJPcHM6IFN1Yk9wW10gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc3ViT3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlID0gdGhpcy5zdWJPcHNbaV0uYXBwbHkocGxhbik7XG4gICAgICBpZiAoIWUub2spIHtcbiAgICAgICAgLy8gUmV2ZXJ0IGFsbCB0aGUgU3ViT3BzIGFwcGxpZWQgdXAgdG8gdGhpcyBwb2ludCB0byBnZXQgdGhlIFBsYW4gYmFjayBpbiBhXG4gICAgICAgIC8vIGdvb2QgcGxhY2UuXG4gICAgICAgIGNvbnN0IHJldmVydEVyciA9IHRoaXMuYXBwbHlBbGxJbnZlcnNlU3ViT3BzVG9QbGFuKHBsYW4sIGludmVyc2VTdWJPcHMpO1xuICAgICAgICBpZiAoIXJldmVydEVyci5vaykge1xuICAgICAgICAgIHJldHVybiByZXZlcnRFcnI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgICBwbGFuID0gZS52YWx1ZS5wbGFuO1xuICAgICAgaW52ZXJzZVN1Yk9wcy51bnNoaWZ0KGUudmFsdWUuaW52ZXJzZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiBuZXcgT3AoaW52ZXJzZVN1Yk9wcyksXG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgQWxsT3BzUmVzdWx0ID0ge1xuICBvcHM6IE9wW107XG4gIHBsYW46IFBsYW47XG59O1xuXG5jb25zdCBhcHBseUFsbEludmVyc2VPcHNUb1BsYW4gPSAoaW52ZXJzZXM6IE9wW10sIHBsYW46IFBsYW4pOiBSZXN1bHQ8UGxhbj4gPT4ge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGludmVyc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcmVzID0gaW52ZXJzZXNbaV0uYXBwbHkocGxhbik7XG4gICAgaWYgKCFyZXMub2spIHtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICAgIHBsYW4gPSByZXMudmFsdWUucGxhbjtcbiAgfVxuXG4gIHJldHVybiBvayhwbGFuKTtcbn07XG5cbi8vIENvbnZlbmllbmNlIGZ1bmN0aW9uIGZvciBhcHBseWluZyBtdWx0aXBsZSBPcHMgdG8gYSBwbGFuLCB1c2VkIG1vc3RseSBmb3Jcbi8vIHRlc3RpbmcuXG5leHBvcnQgY29uc3QgYXBwbHlBbGxPcHNUb1BsYW4gPSAoXG4gIG9wczogT3BbXSxcbiAgcGxhbjogUGxhblxuKTogUmVzdWx0PEFsbE9wc1Jlc3VsdD4gPT4ge1xuICBjb25zdCBpbnZlcnNlczogT3BbXSA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG9wcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHJlcyA9IG9wc1tpXS5hcHBseShwbGFuKTtcbiAgICBpZiAoIXJlcy5vaykge1xuICAgICAgY29uc3QgaW52ZXJzZVJlcyA9IGFwcGx5QWxsSW52ZXJzZU9wc1RvUGxhbihpbnZlcnNlcywgcGxhbik7XG4gICAgICBpZiAoIWludmVyc2VSZXMub2spIHtcbiAgICAgICAgLy8gVE9ETyBDYW4gd2Ugd3JhcCB0aGUgRXJyb3IgaW4gYW5vdGhlciBlcnJvciB0byBtYWtlIGl0IGNsZWFyIHRoaXNcbiAgICAgICAgLy8gZXJyb3IgaGFwcGVuZWQgd2hlbiB0cnlpbmcgdG8gY2xlYW4gdXAgZnJvbSB0aGUgcHJldmlvdXMgRXJyb3Igd2hlblxuICAgICAgICAvLyB0aGUgYXBwbHkoKSBmYWlsZWQuXG4gICAgICAgIHJldHVybiBpbnZlcnNlUmVzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgaW52ZXJzZXMudW5zaGlmdChyZXMudmFsdWUuaW52ZXJzZSk7XG4gICAgcGxhbiA9IHJlcy52YWx1ZS5wbGFuO1xuICB9XG5cbiAgcmV0dXJuIG9rKHtcbiAgICBvcHM6IGludmVyc2VzLFxuICAgIHBsYW46IHBsYW4sXG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGFwcGx5QWxsT3BzVG9QbGFuQW5kVGhlbkludmVyc2UgPSAoXG4gIG9wczogT3BbXSxcbiAgcGxhbjogUGxhblxuKTogUmVzdWx0PEFsbE9wc1Jlc3VsdD4gPT4ge1xuICBjb25zdCByZXMgPSBhcHBseUFsbE9wc1RvUGxhbihvcHMsIHBsYW4pO1xuICBpZiAoIXJlcy5vaykge1xuICAgIHJldHVybiByZXM7XG4gIH1cbiAgcmV0dXJuIGFwcGx5QWxsT3BzVG9QbGFuKHJlcy52YWx1ZS5vcHMsIHJlcy52YWx1ZS5wbGFuKTtcbn07XG4vLyBOb09wIGlzIGEgbm8tb3AuXG5leHBvcnQgZnVuY3Rpb24gTm9PcCgpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW10pO1xufVxuIiwgImltcG9ydCB7IFJlc3VsdCwgb2ssIGVycm9yIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgRGlyZWN0ZWRFZGdlLCBlZGdlc0J5U3JjQW5kRHN0VG9NYXAgfSBmcm9tIFwiLi4vZGFnL2RhZy50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcbmltcG9ydCB7IENoYXJ0LCBUYXNrU3RhdGUgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IE9wLCBTdWJPcCwgU3ViT3BSZXN1bHQgfSBmcm9tIFwiLi9vcHMudHNcIjtcblxuLyoqIEEgdmFsdWUgb2YgLTEgZm9yIGogbWVhbnMgdGhlIEZpbmlzaCBNaWxlc3RvbmUuICovXG5leHBvcnQgZnVuY3Rpb24gRGlyZWN0ZWRFZGdlRm9yUGxhbihcbiAgaTogbnVtYmVyLFxuICBqOiBudW1iZXIsXG4gIHBsYW46IFBsYW5cbik6IFJlc3VsdDxEaXJlY3RlZEVkZ2U+IHtcbiAgY29uc3QgY2hhcnQgPSBwbGFuLmNoYXJ0O1xuICBpZiAoaiA9PT0gLTEpIHtcbiAgICBqID0gY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgfVxuICBpZiAoaSA8IDAgfHwgaSA+PSBjaGFydC5WZXJ0aWNlcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBgaSBpbmRleCBvdXQgb2YgcmFuZ2U6ICR7aX0gbm90IGluIFswLCAke2NoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDF9XWBcbiAgICApO1xuICB9XG4gIGlmIChqIDwgMCB8fCBqID49IGNoYXJ0LlZlcnRpY2VzLmxlbmd0aCkge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIGBqIGluZGV4IG91dCBvZiByYW5nZTogJHtqfSBub3QgaW4gWzAsICR7Y2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMX1dYFxuICAgICk7XG4gIH1cbiAgaWYgKGkgPT09IGopIHtcbiAgICByZXR1cm4gZXJyb3IoYEEgVGFzayBjYW4gbm90IGRlcGVuZCBvbiBpdHNlbGY6ICR7aX0gPT09ICR7an1gKTtcbiAgfVxuICByZXR1cm4gb2sobmV3IERpcmVjdGVkRWRnZShpLCBqKSk7XG59XG5cbmV4cG9ydCBjbGFzcyBBZGRFZGdlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGk6IG51bWJlciA9IDA7XG4gIGo6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoaTogbnVtYmVyLCBqOiBudW1iZXIpIHtcbiAgICB0aGlzLmkgPSBpO1xuICAgIHRoaXMuaiA9IGo7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgaWYgKHRoaXMuaSA9PT0gLTEpIHtcbiAgICAgIHRoaXMuaSA9IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaiA9PT0gLTEpIHtcbiAgICAgIHRoaXMuaiA9IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgICB9XG5cbiAgICBjb25zdCBlID0gRGlyZWN0ZWRFZGdlRm9yUGxhbih0aGlzLmksIHRoaXMuaiwgcGxhbik7XG4gICAgaWYgKCFlLm9rKSB7XG4gICAgICByZXR1cm4gZTtcbiAgICB9XG5cbiAgICAvLyBPbmx5IGFkZCB0aGUgZWRnZSBpZiBpdCBkb2Vzbid0IGV4aXN0cyBhbHJlYWR5LlxuICAgIGlmICghcGxhbi5jaGFydC5FZGdlcy5maW5kKCh2YWx1ZTogRGlyZWN0ZWRFZGdlKSA9PiB2YWx1ZS5lcXVhbChlLnZhbHVlKSkpIHtcbiAgICAgIHBsYW4uY2hhcnQuRWRnZXMucHVzaChlLnZhbHVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpLFxuICAgIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBSZW1vdmVFZGdlU3VwT3AodGhpcy5pLCB0aGlzLmopO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZW1vdmVFZGdlU3VwT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGk6IG51bWJlciA9IDA7XG4gIGo6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoaTogbnVtYmVyLCBqOiBudW1iZXIpIHtcbiAgICB0aGlzLmkgPSBpO1xuICAgIHRoaXMuaiA9IGo7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgaWYgKHRoaXMuaSA9PT0gLTEpIHtcbiAgICAgIHRoaXMuaSA9IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaiA9PT0gLTEpIHtcbiAgICAgIHRoaXMuaiA9IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgICB9XG5cbiAgICBjb25zdCBlID0gRGlyZWN0ZWRFZGdlRm9yUGxhbih0aGlzLmksIHRoaXMuaiwgcGxhbik7XG4gICAgaWYgKCFlLm9rKSB7XG4gICAgICByZXR1cm4gZTtcbiAgICB9XG4gICAgcGxhbi5jaGFydC5FZGdlcyA9IHBsYW4uY2hhcnQuRWRnZXMuZmlsdGVyKFxuICAgICAgKHY6IERpcmVjdGVkRWRnZSk6IGJvb2xlYW4gPT4gIXYuZXF1YWwoZS52YWx1ZSlcbiAgICApO1xuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSxcbiAgICB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgQWRkRWRnZVN1Yk9wKHRoaXMuaSwgdGhpcy5qKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyhpbmRleDogbnVtYmVyLCBjaGFydDogQ2hhcnQpOiBSZXN1bHQ8bnVsbD4ge1xuICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID4gY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMikge1xuICAgIHJldHVybiBlcnJvcihgJHtpbmRleH0gaXMgbm90IGluIHJhbmdlIFswLCAke2NoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDJ9XWApO1xuICB9XG4gIHJldHVybiBvayhudWxsKTtcbn1cblxuZnVuY3Rpb24gaW5kZXhJblJhbmdlRm9yVmVydGljZXNFeGNsdXNpdmUoXG4gIGluZGV4OiBudW1iZXIsXG4gIGNoYXJ0OiBDaGFydFxuKTogUmVzdWx0PG51bGw+IHtcbiAgaWYgKGluZGV4IDwgMSB8fCBpbmRleCA+IGNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDIpIHtcbiAgICByZXR1cm4gZXJyb3IoYCR7aW5kZXh9IGlzIG5vdCBpbiByYW5nZSBbMSwgJHtjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAyfV1gKTtcbiAgfVxuICByZXR1cm4gb2sobnVsbCk7XG59XG5cbmV4cG9ydCBjbGFzcyBBZGRUYXNrQWZ0ZXJTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaW5kZXg6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoaW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMuaW5kZXggPSBpbmRleDtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBjaGFydCA9IHBsYW4uY2hhcnQ7XG4gICAgY29uc3QgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXModGhpcy5pbmRleCwgY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLnNwbGljZSh0aGlzLmluZGV4ICsgMSwgMCwgcGxhbi5uZXdUYXNrKCkpO1xuXG4gICAgLy8gVXBkYXRlIEVkZ2VzLlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hhcnQuRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVkZ2UgPSBjaGFydC5FZGdlc1tpXTtcbiAgICAgIGlmIChlZGdlLmkgPj0gdGhpcy5pbmRleCArIDEpIHtcbiAgICAgICAgZWRnZS5pKys7XG4gICAgICB9XG4gICAgICBpZiAoZWRnZS5qID49IHRoaXMuaW5kZXggKyAxKSB7XG4gICAgICAgIGVkZ2UuaisrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlVGFza1N1Yk9wKHRoaXMuaW5kZXggKyAxKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRHVwVGFza1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBpbmRleDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGNoYXJ0ID0gcGxhbi5jaGFydDtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlc0V4Y2x1c2l2ZSh0aGlzLmluZGV4LCBjaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgY29uc3QgY29weSA9IHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy5pbmRleF0uZHVwKCk7XG4gICAgLy8gSW5zZXJ0IHRoZSBkdXBsaWNhdGUgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIFRhc2sgaXQgaXMgY29waWVkIGZyb20uXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5zcGxpY2UodGhpcy5pbmRleCwgMCwgY29weSk7XG5cbiAgICAvLyBVcGRhdGUgRWRnZXMuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFydC5FZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZWRnZSA9IGNoYXJ0LkVkZ2VzW2ldO1xuICAgICAgaWYgKGVkZ2UuaSA+IHRoaXMuaW5kZXgpIHtcbiAgICAgICAgZWRnZS5pKys7XG4gICAgICB9XG4gICAgICBpZiAoZWRnZS5qID4gdGhpcy5pbmRleCkge1xuICAgICAgICBlZGdlLmorKztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IERlbGV0ZVRhc2tTdWJPcCh0aGlzLmluZGV4ICsgMSk7XG4gIH1cbn1cblxudHlwZSBTdWJzdGl0dXRpb24gPSBNYXA8RGlyZWN0ZWRFZGdlLCBEaXJlY3RlZEVkZ2U+O1xuXG5leHBvcnQgY2xhc3MgTW92ZUFsbE91dGdvaW5nRWRnZXNGcm9tVG9TdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgZnJvbVRhc2tJbmRleDogbnVtYmVyID0gMDtcbiAgdG9UYXNrSW5kZXg6IG51bWJlciA9IDA7XG4gIGFjdHVhbE1vdmVzOiBTdWJzdGl0dXRpb247XG5cbiAgY29uc3RydWN0b3IoXG4gICAgZnJvbVRhc2tJbmRleDogbnVtYmVyLFxuICAgIHRvVGFza0luZGV4OiBudW1iZXIsXG4gICAgYWN0dWFsTW92ZXM6IFN1YnN0aXR1dGlvbiA9IG5ldyBNYXAoKVxuICApIHtcbiAgICB0aGlzLmZyb21UYXNrSW5kZXggPSBmcm9tVGFza0luZGV4O1xuICAgIHRoaXMudG9UYXNrSW5kZXggPSB0b1Rhc2tJbmRleDtcbiAgICB0aGlzLmFjdHVhbE1vdmVzID0gYWN0dWFsTW92ZXM7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgY2hhcnQgPSBwbGFuLmNoYXJ0O1xuICAgIGxldCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlc0V4Y2x1c2l2ZSh0aGlzLmZyb21UYXNrSW5kZXgsIGNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXNFeGNsdXNpdmUodGhpcy50b1Rhc2tJbmRleCwgY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGlmICh0aGlzLmFjdHVhbE1vdmVzLnZhbHVlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGNvbnN0IGFjdHVhbE1vdmVzOiBTdWJzdGl0dXRpb24gPSBuZXcgTWFwKCk7XG4gICAgICAvLyBVcGRhdGUgYWxsIEVkZ2VzIHRoYXQgc3RhcnQgYXQgJ2Zyb21UYXNrSW5kZXgnIGFuZCBjaGFuZ2UgdGhlIHN0YXJ0IHRvICd0b1Rhc2tJbmRleCcuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJ0LkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGVkZ2UgPSBjaGFydC5FZGdlc1tpXTtcbiAgICAgICAgLy8gU2tpcCB0aGUgY29ybmVyIGNhc2UgdGhlcmUgZnJvbVRhc2tJbmRleCBwb2ludHMgdG8gVGFza0luZGV4LlxuICAgICAgICBpZiAoZWRnZS5pID09PSB0aGlzLmZyb21UYXNrSW5kZXggJiYgZWRnZS5qID09PSB0aGlzLnRvVGFza0luZGV4KSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZWRnZS5pID09PSB0aGlzLmZyb21UYXNrSW5kZXgpIHtcbiAgICAgICAgICBhY3R1YWxNb3Zlcy5zZXQoXG4gICAgICAgICAgICBuZXcgRGlyZWN0ZWRFZGdlKHRoaXMudG9UYXNrSW5kZXgsIGVkZ2UuaiksXG4gICAgICAgICAgICBuZXcgRGlyZWN0ZWRFZGdlKGVkZ2UuaSwgZWRnZS5qKVxuICAgICAgICAgICk7XG4gICAgICAgICAgZWRnZS5pID0gdGhpcy50b1Rhc2tJbmRleDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG9rKHtcbiAgICAgICAgcGxhbjogcGxhbixcbiAgICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKFxuICAgICAgICAgIHRoaXMudG9UYXNrSW5kZXgsXG4gICAgICAgICAgdGhpcy5mcm9tVGFza0luZGV4LFxuICAgICAgICAgIGFjdHVhbE1vdmVzXG4gICAgICAgICksXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFydC5FZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBuZXdFZGdlID0gdGhpcy5hY3R1YWxNb3Zlcy5nZXQocGxhbi5jaGFydC5FZGdlc1tpXSk7XG4gICAgICAgIGlmIChuZXdFZGdlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBwbGFuLmNoYXJ0LkVkZ2VzW2ldID0gbmV3RWRnZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gb2soe1xuICAgICAgICBwbGFuOiBwbGFuLFxuICAgICAgICBpbnZlcnNlOiBuZXcgTW92ZUFsbE91dGdvaW5nRWRnZXNGcm9tVG9TdWJPcChcbiAgICAgICAgICB0aGlzLnRvVGFza0luZGV4LFxuICAgICAgICAgIHRoaXMuZnJvbVRhc2tJbmRleFxuICAgICAgICApLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgaW52ZXJzZShcbiAgICB0b1Rhc2tJbmRleDogbnVtYmVyLFxuICAgIGZyb21UYXNrSW5kZXg6IG51bWJlcixcbiAgICBhY3R1YWxNb3ZlczogU3Vic3RpdHV0aW9uXG4gICk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IE1vdmVBbGxPdXRnb2luZ0VkZ2VzRnJvbVRvU3ViT3AoXG4gICAgICB0b1Rhc2tJbmRleCxcbiAgICAgIGZyb21UYXNrSW5kZXgsXG4gICAgICBhY3R1YWxNb3Zlc1xuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvcHlBbGxFZGdlc0Zyb21Ub1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBmcm9tSW5kZXg6IG51bWJlciA9IDA7XG4gIHRvSW5kZXg6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoZnJvbUluZGV4OiBudW1iZXIsIHRvSW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMuZnJvbUluZGV4ID0gZnJvbUluZGV4O1xuICAgIHRoaXMudG9JbmRleCA9IHRvSW5kZXg7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXModGhpcy5mcm9tSW5kZXgsIHBsYW4uY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGNvbnN0IG5ld0VkZ2VzOiBEaXJlY3RlZEVkZ2VbXSA9IFtdO1xuICAgIHBsYW4uY2hhcnQuRWRnZXMuZm9yRWFjaCgoZWRnZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgICBpZiAoZWRnZS5pID09PSB0aGlzLmZyb21JbmRleCkge1xuICAgICAgICBuZXdFZGdlcy5wdXNoKG5ldyBEaXJlY3RlZEVkZ2UodGhpcy50b0luZGV4LCBlZGdlLmopKTtcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlLmogPT09IHRoaXMuZnJvbUluZGV4KSB7XG4gICAgICAgIG5ld0VkZ2VzLnB1c2gobmV3IERpcmVjdGVkRWRnZShlZGdlLmksIHRoaXMudG9JbmRleCkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHBsYW4uY2hhcnQuRWRnZXMucHVzaCguLi5uZXdFZGdlcyk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiBuZXcgUmVtb3ZlQWxsRWRnZXNTdWJPcChuZXdFZGdlcykgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbW92ZUFsbEVkZ2VzU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXTtcblxuICBjb25zdHJ1Y3RvcihlZGdlczogRGlyZWN0ZWRFZGdlW10pIHtcbiAgICB0aGlzLmVkZ2VzID0gZWRnZXM7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgcGxhbi5jaGFydC5FZGdlcyA9IHBsYW4uY2hhcnQuRWRnZXMuZmlsdGVyKFxuICAgICAgKGVkZ2U6IERpcmVjdGVkRWRnZSkgPT5cbiAgICAgICAgLTEgPT09XG4gICAgICAgIHRoaXMuZWRnZXMuZmluZEluZGV4KCh0b0JlUmVtb3ZlZDogRGlyZWN0ZWRFZGdlKSA9PlxuICAgICAgICAgIGVkZ2UuZXF1YWwodG9CZVJlbW92ZWQpXG4gICAgICAgIClcbiAgICApO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogbmV3IEFkZEFsbEVkZ2VzU3ViT3AodGhpcy5lZGdlcykgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFkZEFsbEVkZ2VzU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXTtcblxuICBjb25zdHJ1Y3RvcihlZGdlczogRGlyZWN0ZWRFZGdlW10pIHtcbiAgICB0aGlzLmVkZ2VzID0gZWRnZXM7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKC4uLnRoaXMuZWRnZXMpO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogbmV3IFJlbW92ZUFsbEVkZ2VzU3ViT3AodGhpcy5lZGdlcykgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlbGV0ZVRhc2tTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaW5kZXg6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoaW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMuaW5kZXggPSBpbmRleDtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBjaGFydCA9IHBsYW4uY2hhcnQ7XG4gICAgY29uc3QgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXModGhpcy5pbmRleCwgY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICBjaGFydC5WZXJ0aWNlcy5zcGxpY2UodGhpcy5pbmRleCwgMSk7XG5cbiAgICAvLyBVcGRhdGUgRWRnZXMuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFydC5FZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZWRnZSA9IGNoYXJ0LkVkZ2VzW2ldO1xuICAgICAgaWYgKGVkZ2UuaSA+IHRoaXMuaW5kZXgpIHtcbiAgICAgICAgZWRnZS5pLS07XG4gICAgICB9XG4gICAgICBpZiAoZWRnZS5qID4gdGhpcy5pbmRleCkge1xuICAgICAgICBlZGdlLmotLTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgQWRkVGFza0FmdGVyU3ViT3AodGhpcy5pbmRleCAtIDEpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGNvbnN0cnVjdG9yKCkge31cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3Qgc3JjQW5kRHN0ID0gZWRnZXNCeVNyY0FuZERzdFRvTWFwKHBsYW4uY2hhcnQuRWRnZXMpO1xuICAgIGNvbnN0IFN0YXJ0ID0gMDtcbiAgICBjb25zdCBGaW5pc2ggPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDE7XG5cbiAgICAvLyBsb29wIG92ZXIgYWxsIHZlcnRpY3MgZnJvbSBbU3RhcnQsIEZpbmlzaCkgYW5kIGxvb2sgZm9yIHRoZWlyXG4gICAgLy8gZGVzdGluYXRpb25zLiBJZiB0aGV5IGhhdmUgbm9uZSB0aGVuIGFkZCBpbiBhbiBlZGdlIHRvIEZpbmlzaC4gSWYgdGhleVxuICAgIC8vIGhhdmUgbW9yZSB0aGFuIG9uZSB0aGVuIHJlbW92ZSBhbnkgbGlua3MgdG8gRmluaXNoLlxuICAgIGZvciAobGV0IGkgPSBTdGFydDsgaSA8IEZpbmlzaDsgaSsrKSB7XG4gICAgICBjb25zdCBkZXN0aW5hdGlvbnMgPSBzcmNBbmREc3QuYnlTcmMuZ2V0KGkpO1xuICAgICAgaWYgKGRlc3RpbmF0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IHRvQmVBZGRlZCA9IG5ldyBEaXJlY3RlZEVkZ2UoaSwgRmluaXNoKTtcbiAgICAgICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKHRvQmVBZGRlZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBcmUgdGhlcmUgYW55IHVuZWVkZWQgRWdkZXMgdG8gRmluaXNoPyBJZiBzbyBmaWx0ZXIgdGhlbSBvdXQuXG4gICAgICAgIGlmIChcbiAgICAgICAgICBkZXN0aW5hdGlvbnMubGVuZ3RoID4gMSAmJlxuICAgICAgICAgIGRlc3RpbmF0aW9ucy5maW5kKCh2YWx1ZTogRGlyZWN0ZWRFZGdlKSA9PiB2YWx1ZS5qID09PSBGaW5pc2gpXG4gICAgICAgICkge1xuICAgICAgICAgIGNvbnN0IHRvQmVSZW1vdmVkID0gbmV3IERpcmVjdGVkRWRnZShpLCBGaW5pc2gpO1xuICAgICAgICAgIHBsYW4uY2hhcnQuRWRnZXMgPSBwbGFuLmNoYXJ0LkVkZ2VzLmZpbHRlcihcbiAgICAgICAgICAgICh2YWx1ZTogRGlyZWN0ZWRFZGdlKSA9PiAhdG9CZVJlbW92ZWQuZXF1YWwodmFsdWUpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGxvb3Agb3ZlciBhbGwgdmVydGljcyBmcm9tKFN0YXJ0LCBGaW5pc2hdIGFuZCBsb29rIGZvciB0aGVpciBzb3VyY2VzLiBJZlxuICAgIC8vIHRoZXkgaGF2ZSBub25lIHRoZW4gYWRkIGluIGFuIGVkZ2UgZnJvbSBTdGFydC4gSWYgdGhleSBoYXZlIG1vcmUgdGhhbiBvbmVcbiAgICAvLyB0aGVuIHJlbW92ZSBhbnkgbGlua3MgZnJvbSBTdGFydC5cbiAgICBmb3IgKGxldCBpID0gU3RhcnQgKyAxOyBpIDwgRmluaXNoOyBpKyspIHtcbiAgICAgIGNvbnN0IGRlc3RpbmF0aW9ucyA9IHNyY0FuZERzdC5ieURzdC5nZXQoaSk7XG4gICAgICBpZiAoZGVzdGluYXRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgdG9CZUFkZGVkID0gbmV3IERpcmVjdGVkRWRnZShTdGFydCwgaSk7XG4gICAgICAgIHBsYW4uY2hhcnQuRWRnZXMucHVzaCh0b0JlQWRkZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXJlIHRoZXJlIGFueSB1bi1uZWVkZWQgRWdkZXMgZnJvbSBTdGFydD8gSWYgc28gZmlsdGVyIHRoZW0gb3V0LlxuICAgICAgICBpZiAoXG4gICAgICAgICAgZGVzdGluYXRpb25zLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgICBkZXN0aW5hdGlvbnMuZmluZCgodmFsdWU6IERpcmVjdGVkRWRnZSkgPT4gdmFsdWUuaSA9PT0gU3RhcnQpXG4gICAgICAgICkge1xuICAgICAgICAgIGNvbnN0IHRvQmVSZW1vdmVkID0gbmV3IERpcmVjdGVkRWRnZShTdGFydCwgaSk7XG4gICAgICAgICAgcGxhbi5jaGFydC5FZGdlcyA9IHBsYW4uY2hhcnQuRWRnZXMuZmlsdGVyKFxuICAgICAgICAgICAgKHZhbHVlOiBEaXJlY3RlZEVkZ2UpID0+ICF0b0JlUmVtb3ZlZC5lcXVhbCh2YWx1ZSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChwbGFuLmNoYXJ0LkVkZ2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKG5ldyBEaXJlY3RlZEVkZ2UoU3RhcnQsIEZpbmlzaCkpO1xuICAgIH1cblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2V0VGFza05hbWVTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgdGFza0luZGV4OiBudW1iZXI7XG4gIG5hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcih0YXNrSW5kZXg6IG51bWJlciwgbmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy50YXNrSW5kZXggPSB0YXNrSW5kZXg7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLnRhc2tJbmRleCwgcGxhbi5jaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGNvbnN0IG9sZE5hbWUgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMudGFza0luZGV4XS5uYW1lO1xuICAgIHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdLm5hbWUgPSB0aGlzLm5hbWU7XG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2Uob2xkTmFtZSksXG4gICAgfSk7XG4gIH1cblxuICBpbnZlcnNlKG9sZE5hbWU6IHN0cmluZyk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFNldFRhc2tOYW1lU3ViT3AodGhpcy50YXNrSW5kZXgsIG9sZE5hbWUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZXRUYXNrU3RhdGVTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgdGFza1N0YXRlOiBUYXNrU3RhdGU7XG4gIHRhc2tJbmRleDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHRhc2tJbmRleDogbnVtYmVyLCB0YXNrU3RhdGU6IFRhc2tTdGF0ZSkge1xuICAgIHRoaXMudGFza0luZGV4ID0gdGFza0luZGV4O1xuICAgIHRoaXMudGFza1N0YXRlID0gdGFza1N0YXRlO1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzKHRoaXMudGFza0luZGV4LCBwbGFuLmNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgY29uc3Qgb2xkU3RhdGUgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMudGFza0luZGV4XS5zdGF0ZTtcbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMudGFza0luZGV4XS5zdGF0ZSA9IHRoaXMudGFza1N0YXRlO1xuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG9sZFN0YXRlKSxcbiAgICB9KTtcbiAgfVxuXG4gIGludmVyc2UodGFza1N0YXRlOiBUYXNrU3RhdGUpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBTZXRUYXNrU3RhdGVTdWJPcCh0aGlzLnRhc2tJbmRleCwgdGFza1N0YXRlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gSW5zZXJ0TmV3RW1wdHlUYXNrQWZ0ZXJPcCh0YXNrSW5kZXg6IG51bWJlcik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICAgIG5ldyBBZGRUYXNrQWZ0ZXJTdWJPcCh0YXNrSW5kZXgpLFxuICAgIG5ldyBBZGRFZGdlU3ViT3AoMCwgdGFza0luZGV4ICsgMSksXG4gICAgbmV3IEFkZEVkZ2VTdWJPcCh0YXNrSW5kZXggKyAxLCAtMSksXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICBdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNldFRhc2tOYW1lT3AodGFza0luZGV4OiBudW1iZXIsIG5hbWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFNldFRhc2tOYW1lU3ViT3AodGFza0luZGV4LCBuYW1lKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU2V0VGFza1N0YXRlT3AodGFza0luZGV4OiBudW1iZXIsIHRhc2tTdGF0ZTogVGFza1N0YXRlKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgU2V0VGFza1N0YXRlU3ViT3AodGFza0luZGV4LCB0YXNrU3RhdGUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTcGxpdFRhc2tPcCh0YXNrSW5kZXg6IG51bWJlcik6IE9wIHtcbiAgY29uc3Qgc3ViT3BzOiBTdWJPcFtdID0gW1xuICAgIG5ldyBEdXBUYXNrU3ViT3AodGFza0luZGV4KSxcbiAgICBuZXcgQWRkRWRnZVN1Yk9wKHRhc2tJbmRleCwgdGFza0luZGV4ICsgMSksXG4gICAgbmV3IE1vdmVBbGxPdXRnb2luZ0VkZ2VzRnJvbVRvU3ViT3AodGFza0luZGV4LCB0YXNrSW5kZXggKyAxKSxcbiAgXTtcblxuICByZXR1cm4gbmV3IE9wKHN1Yk9wcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEdXBUYXNrT3AodGFza0luZGV4OiBudW1iZXIpOiBPcCB7XG4gIGNvbnN0IHN1Yk9wczogU3ViT3BbXSA9IFtcbiAgICBuZXcgRHVwVGFza1N1Yk9wKHRhc2tJbmRleCksXG4gICAgbmV3IENvcHlBbGxFZGdlc0Zyb21Ub1N1Yk9wKHRhc2tJbmRleCwgdGFza0luZGV4ICsgMSksXG4gIF07XG5cbiAgcmV0dXJuIG5ldyBPcChzdWJPcHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQWRkRWRnZU9wKGZyb21UYXNrSW5kZXg6IG51bWJlciwgdG9UYXNrSW5kZXg6IG51bWJlcik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICAgIG5ldyBBZGRFZGdlU3ViT3AoZnJvbVRhc2tJbmRleCwgdG9UYXNrSW5kZXgpLFxuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSYXRpb25hbGl6ZUVkZ2VzT3AoKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCldKTtcbn1cbiIsICIvLyBDaGFuZ2VNZXRyaWNWYWx1ZVxuXG5pbXBvcnQgeyBUYXNrIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBNZXRyaWNEZWZpbml0aW9uIH0gZnJvbSBcIi4uL21ldHJpY3MvbWV0cmljcy50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcbmltcG9ydCB7IFJlc3VsdCwgZXJyb3IsIG9rIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgT3AsIFN1Yk9wLCBTdWJPcFJlc3VsdCB9IGZyb20gXCIuL29wcy50c1wiO1xuXG5leHBvcnQgY2xhc3MgQWRkTWV0cmljU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG5hbWU6IHN0cmluZztcbiAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbjtcblxuICAvLyBNYXBzIGFuIGluZGV4IG9mIGEgVGFzayB0byBhIHZhbHVlIGZvciB0aGUgZ2l2ZW4gbWV0cmljIGtleS5cbiAgdGFza01ldHJpY1ZhbHVlczogTWFwPG51bWJlciwgbnVtYmVyPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbixcbiAgICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpIC8vIFNob3VsZCBvbmx5IGJlIHN1cHBsaWVkIGJ5IGludmVyc2UgYWN0aW9ucy5cbiAgKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLm1ldHJpY0RlZmluaXRpb24gPSBtZXRyaWNEZWZpbml0aW9uO1xuICAgIHRoaXMudGFza01ldHJpY1ZhbHVlcyA9IHRhc2tNZXRyaWNWYWx1ZXM7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgaWYgKHBsYW4uZ2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5hbWUpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm5hbWV9IGFscmVhZHkgZXhpc3RzIGFzIGEgTWV0cmljYCk7XG4gICAgfVxuXG4gICAgcGxhbi5zZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSwgdGhpcy5tZXRyaWNEZWZpbml0aW9uKTtcblxuICAgIC8vIE5vdyBsb29wIG92ZXIgZXZlcnkgdGFzayBhbmQgYWRkIHRoaXMgbWV0cmljIGFuZCBzZXQgaXQgdG8gdGhlIGRlZmF1bHQsXG4gICAgLy8gdW5sZXNzIHRoZXJlIGlzIG1hdGNoaW5nIGVudHJ5IGluIHRhc2tNZXRyaWNWYWx1ZXMsIGluIHdoaWNoIGNhc2Ugd2Ugd2lsbFxuICAgIC8vIHVzZSB0aGF0IHZhbHVlLCBpLmUuIHRoaXMgQWRkTWV0cmljU3ViT3AgaXMgYWN0dWFsbHkgYSByZXZlcnQgb2YgYVxuICAgIC8vIERlbGV0ZU1ldHJpY1N1Yk9wLlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgdGFzay5zZXRNZXRyaWMoXG4gICAgICAgIHRoaXMubmFtZSxcbiAgICAgICAgdGhpcy50YXNrTWV0cmljVmFsdWVzLmdldChpbmRleCkgfHwgdGhpcy5tZXRyaWNEZWZpbml0aW9uLmRlZmF1bHRcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlTWV0cmljU3ViT3AodGhpcy5uYW1lKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVsZXRlTWV0cmljU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG5hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IG1ldHJpY0RlZmluaXRpb24gPSBwbGFuLmdldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lKTtcblxuICAgIGlmIChtZXRyaWNEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYFRoZSBtZXRyaWMgd2l0aCBuYW1lICR7dGhpcy5uYW1lfSBkb2VzIG5vdCBleGlzdCBhbmQgY2FuJ3QgYmUgZGVsZXRlZC5gXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChtZXRyaWNEZWZpbml0aW9uLmlzU3RhdGljKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYFRoZSBzdGF0aWMgTWV0cmljICR7dGhpcy5uYW1lfSBjYW4ndCBiZSBkZWxldGVkLmApO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSBmcm9tIHJlc291cmNlIGRlZmluaXRpb25zLlxuICAgIHBsYW4uZGVsZXRlTWV0cmljRGVmaW5pdGlvbih0aGlzLm5hbWUpO1xuXG4gICAgY29uc3QgdGFza0luZGV4VG9EZWxldGVkTWV0cmljVmFsdWU6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCk7XG5cbiAgICAvLyBOb3cgbG9vayBhdCBhbGwgVGFza3MgYW5kIHJlbW92ZSBgdGhpcy5uYW1lYCBmcm9tIHRoZSBtZXRyaWMgd2hpbGUgYWxzb1xuICAgIC8vIGJ1aWxkaW5nIHVwIHRoZSBpbmZvIG5lZWRlZCBmb3IgYSByZXZlcnQuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRhc2suZ2V0TWV0cmljKHRoaXMubmFtZSk7XG4gICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0YXNrSW5kZXhUb0RlbGV0ZWRNZXRyaWNWYWx1ZS5zZXQoaW5kZXgsIHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHRhc2suZGVsZXRlTWV0cmljKHRoaXMubmFtZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZShtZXRyaWNEZWZpbml0aW9uLCB0YXNrSW5kZXhUb0RlbGV0ZWRNZXRyaWNWYWx1ZSksXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGludmVyc2UoXG4gICAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbixcbiAgICBtZXRyaWNWYWx1ZXNGb3JEZWxldGVkUmVzb3VyY2VOYW1lOiBNYXA8bnVtYmVyLCBudW1iZXI+XG4gICk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IEFkZE1ldHJpY1N1Yk9wKFxuICAgICAgdGhpcy5uYW1lLFxuICAgICAgbWV0cmljRGVmaW5pdGlvbixcbiAgICAgIG1ldHJpY1ZhbHVlc0ZvckRlbGV0ZWRSZXNvdXJjZU5hbWVcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZW5hbWVNZXRyaWNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgb2xkTmFtZTogc3RyaW5nO1xuICBuZXdOYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Iob2xkTmFtZTogc3RyaW5nLCBuZXdOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLm9sZE5hbWUgPSBvbGROYW1lO1xuICAgIHRoaXMubmV3TmFtZSA9IG5ld05hbWU7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgaWYgKHBsYW4uZ2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5ld05hbWUpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm5ld05hbWV9IGFscmVhZHkgZXhpc3RzIGFzIGEgbWV0cmljLmApO1xuICAgIH1cblxuICAgIGNvbnN0IG1ldHJpY0RlZmluaXRpb24gPSBwbGFuLmdldE1ldHJpY0RlZmluaXRpb24odGhpcy5vbGROYW1lKTtcbiAgICBpZiAobWV0cmljRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5vbGROYW1lfSBkb2VzIG5vdCBleGlzdCBhcyBhIE1ldHJpY2ApO1xuICAgIH1cbiAgICBpZiAobWV0cmljRGVmaW5pdGlvbi5pc1N0YXRpYykge1xuICAgICAgcmV0dXJuIGVycm9yKGBTdGF0aWMgbWV0cmljICR7dGhpcy5vbGROYW1lfSBjYW4ndCBiZSByZW5hbWVkLmApO1xuICAgIH1cblxuICAgIHBsYW4uc2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5ld05hbWUsIG1ldHJpY0RlZmluaXRpb24pO1xuICAgIHBsYW4uZGVsZXRlTWV0cmljRGVmaW5pdGlvbih0aGlzLm9sZE5hbWUpO1xuXG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCByZW5hbWUgdGhpcyBtZXRyaWMuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRhc2suZ2V0TWV0cmljKHRoaXMub2xkTmFtZSkgfHwgbWV0cmljRGVmaW5pdGlvbi5kZWZhdWx0O1xuICAgICAgdGFzay5zZXRNZXRyaWModGhpcy5uZXdOYW1lLCB2YWx1ZSk7XG4gICAgICB0YXNrLmRlbGV0ZU1ldHJpYyh0aGlzLm9sZE5hbWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFJlbmFtZU1ldHJpY1N1Yk9wKHRoaXMubmV3TmFtZSwgdGhpcy5vbGROYW1lKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVXBkYXRlTWV0cmljU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG5hbWU6IHN0cmluZztcbiAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbjtcblxuICAvLyBNYXBzIGFuIGluZGV4IG9mIGEgVGFzayB0byBhIHZhbHVlIGZvciB0aGUgZ2l2ZW4gbWV0cmljIGtleS5cbiAgdGFza01ldHJpY1ZhbHVlczogTWFwPG51bWJlciwgbnVtYmVyPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbixcbiAgICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpIC8vIFNob3VsZCBvbmx5IGJlIHN1cHBsaWVkIGJ5IGludmVyc2UgYWN0aW9ucy5cbiAgKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLm1ldHJpY0RlZmluaXRpb24gPSBtZXRyaWNEZWZpbml0aW9uO1xuICAgIHRoaXMudGFza01ldHJpY1ZhbHVlcyA9IHRhc2tNZXRyaWNWYWx1ZXM7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3Qgb2xkTWV0cmljRGVmaW5pdGlvbiA9IHBsYW4uZ2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5hbWUpO1xuICAgIGlmIChvbGRNZXRyaWNEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm5hbWV9IGRvZXMgbm90IGV4aXN0IGFzIGEgTWV0cmljYCk7XG4gICAgfVxuICAgIGlmIChvbGRNZXRyaWNEZWZpbml0aW9uLmlzU3RhdGljKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYFN0YXRpYyBtZXRyaWMgJHt0aGlzLm5hbWV9IGNhbid0IGJlIHVwZGF0ZWQuYCk7XG4gICAgfVxuXG4gICAgcGxhbi5zZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSwgdGhpcy5tZXRyaWNEZWZpbml0aW9uKTtcblxuICAgIGNvbnN0IHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCk7XG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCB1cGRhdGUgdGhlIG1ldHJpYyB2YWx1ZXMgdG8gcmVmbGVjdCB0aGUgbmV3XG4gICAgLy8gbWV0cmljIGRlZmluaXRpb24sIHVubGVzcyB0aGVyZSBpcyBtYXRjaGluZyBlbnRyeSBpbiB0YXNrTWV0cmljVmFsdWVzLCBpblxuICAgIC8vIHdoaWNoIGNhc2Ugd2Ugd2lsbCB1c2UgdGhhdCB2YWx1ZSwgaS5lLiB0aGlzIFVwZGF0ZU1ldHJpY1N1Yk9wIGlzXG4gICAgLy8gYWN0dWFsbHkgYSByZXZlcnQgb2YgYW5vdGhlciBVcGRhdGVNZXRyaWNTdWJPcC5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IG9sZFZhbHVlID0gdGFzay5nZXRNZXRyaWModGhpcy5uYW1lKSE7XG5cbiAgICAgIGxldCBuZXdWYWx1ZTogbnVtYmVyO1xuICAgICAgaWYgKHRoaXMudGFza01ldHJpY1ZhbHVlcy5oYXMoaW5kZXgpKSB7XG4gICAgICAgIC8vIHRhc2tNZXRyaWNWYWx1ZXMgaGFzIGEgdmFsdWUgdGhlbiB1c2UgdGhhdCwgYXMgdGhpcyBpcyBhbiBpbnZlcnNlXG4gICAgICAgIC8vIG9wZXJhdGlvbi5cbiAgICAgICAgbmV3VmFsdWUgPSB0aGlzLnRhc2tNZXRyaWNWYWx1ZXMuZ2V0KGluZGV4KSE7XG4gICAgICB9IGVsc2UgaWYgKG9sZFZhbHVlID09PSBvbGRNZXRyaWNEZWZpbml0aW9uLmRlZmF1bHQpIHtcbiAgICAgICAgLy8gSWYgdGhlIG9sZFZhbHVlIGlzIHRoZSBkZWZhdWx0LCBjaGFuZ2UgaXQgdG8gdGhlIG5ldyBkZWZhdWx0LlxuICAgICAgICBuZXdWYWx1ZSA9IHRoaXMubWV0cmljRGVmaW5pdGlvbi5kZWZhdWx0O1xuICAgICAgICB0YXNrTWV0cmljVmFsdWVzLnNldChpbmRleCwgb2xkVmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQ2xhbXAuXG4gICAgICAgIG5ld1ZhbHVlID0gdGhpcy5tZXRyaWNEZWZpbml0aW9uLnJhbmdlLmNsYW1wKG9sZFZhbHVlKTtcbiAgICAgICAgbmV3VmFsdWUgPSB0aGlzLm1ldHJpY0RlZmluaXRpb24ucHJlY2lzaW9uLnJvdW5kKG5ld1ZhbHVlKTtcbiAgICAgICAgdGFza01ldHJpY1ZhbHVlcy5zZXQoaW5kZXgsIG9sZFZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHRhc2suc2V0TWV0cmljKHRoaXMubmFtZSwgbmV3VmFsdWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2Uob2xkTWV0cmljRGVmaW5pdGlvbiwgdGFza01ldHJpY1ZhbHVlcyksXG4gICAgfSk7XG4gIH1cblxuICBpbnZlcnNlKFxuICAgIG9sZE1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb24sXG4gICAgdGFza01ldHJpY1ZhbHVlczogTWFwPG51bWJlciwgbnVtYmVyPlxuICApOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBVcGRhdGVNZXRyaWNTdWJPcChcbiAgICAgIHRoaXMubmFtZSxcbiAgICAgIG9sZE1ldHJpY0RlZmluaXRpb24sXG4gICAgICB0YXNrTWV0cmljVmFsdWVzXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2V0TWV0cmljVmFsdWVTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgbmFtZTogc3RyaW5nO1xuICB2YWx1ZTogbnVtYmVyO1xuICB0YXNrSW5kZXg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIHZhbHVlOiBudW1iZXIsIHRhc2tJbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy50YXNrSW5kZXggPSB0YXNrSW5kZXg7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgbWV0cmljc0RlZmluaXRpb24gPSBwbGFuLmdldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lKTtcbiAgICBpZiAobWV0cmljc0RlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmFtZX0gZG9lcyBub3QgZXhpc3QgYXMgYSBNZXRyaWNgKTtcbiAgICB9XG5cbiAgICBjb25zdCB0YXNrID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLnRhc2tJbmRleF07XG4gICAgY29uc3Qgb2xkVmFsdWUgPSB0YXNrLmdldE1ldHJpYyh0aGlzLm5hbWUpIHx8IG1ldHJpY3NEZWZpbml0aW9uLmRlZmF1bHQ7XG4gICAgdGFzay5zZXRNZXRyaWModGhpcy5uYW1lLCBtZXRyaWNzRGVmaW5pdGlvbi5wcmVjaXNpb24ucm91bmQodGhpcy52YWx1ZSkpO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG9sZFZhbHVlKSB9KTtcbiAgfVxuXG4gIGludmVyc2UodmFsdWU6IG51bWJlcik6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFNldE1ldHJpY1ZhbHVlU3ViT3AodGhpcy5uYW1lLCB2YWx1ZSwgdGhpcy50YXNrSW5kZXgpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBZGRNZXRyaWNPcChcbiAgbmFtZTogc3RyaW5nLFxuICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uXG4pOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBBZGRNZXRyaWNTdWJPcChuYW1lLCBtZXRyaWNEZWZpbml0aW9uKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRGVsZXRlTWV0cmljT3AobmFtZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgRGVsZXRlTWV0cmljU3ViT3AobmFtZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJlbmFtZU1ldHJpY09wKG9sZE5hbWU6IHN0cmluZywgbmV3TmFtZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgUmVuYW1lTWV0cmljU3ViT3Aob2xkTmFtZSwgbmV3TmFtZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFVwZGF0ZU1ldHJpY09wKFxuICBuYW1lOiBzdHJpbmcsXG4gIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb25cbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFVwZGF0ZU1ldHJpY1N1Yk9wKG5hbWUsIG1ldHJpY0RlZmluaXRpb24pXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZXRNZXRyaWNWYWx1ZU9wKFxuICBuYW1lOiBzdHJpbmcsXG4gIHZhbHVlOiBudW1iZXIsXG4gIHRhc2tJbmRleDogbnVtYmVyXG4pOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBTZXRNZXRyaWNWYWx1ZVN1Yk9wKG5hbWUsIHZhbHVlLCB0YXNrSW5kZXgpXSk7XG59XG4iLCAiLy8gRWFjaCBSZXNvdXJzZSBoYXMgYSBrZXksIHdoaWNoIGlzIHRoZSBuYW1lLCBhbmQgYSBsaXN0IG9mIGFjY2VwdGFibGUgdmFsdWVzLlxuLy8gVGhlIGxpc3Qgb2YgdmFsdWVzIGNhbiBuZXZlciBiZSBlbXB0eSwgYW5kIHRoZSBmaXJzdCB2YWx1ZSBpbiBgdmFsdWVzYCBpcyB0aGVcbi8vIGRlZmF1bHQgdmFsdWUgZm9yIGEgUmVzb3VyY2UuXG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1JFU09VUkNFX1ZBTFVFID0gXCJcIjtcblxuZXhwb3J0IGludGVyZmFjZSBSZXNvdXJjZURlZmluaXRpb25TZXJpYWxpemVkIHtcbiAgdmFsdWVzOiBzdHJpbmdbXTtcbn1cblxuZXhwb3J0IGNsYXNzIFJlc291cmNlRGVmaW5pdGlvbiB7XG4gIHZhbHVlczogc3RyaW5nW107XG4gIGlzU3RhdGljOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHZhbHVlczogc3RyaW5nW10gPSBbREVGQVVMVF9SRVNPVVJDRV9WQUxVRV0sXG4gICAgaXNTdGF0aWM6IGJvb2xlYW4gPSBmYWxzZVxuICApIHtcbiAgICB0aGlzLnZhbHVlcyA9IHZhbHVlcztcbiAgICB0aGlzLmlzU3RhdGljID0gaXNTdGF0aWM7XG4gIH1cblxuICB0b0pTT04oKTogUmVzb3VyY2VEZWZpbml0aW9uU2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbHVlczogdGhpcy52YWx1ZXMsXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBGcm9tSlNPTihzOiBSZXNvdXJjZURlZmluaXRpb25TZXJpYWxpemVkKTogUmVzb3VyY2VEZWZpbml0aW9uIHtcbiAgICByZXR1cm4gbmV3IFJlc291cmNlRGVmaW5pdGlvbihzLnZhbHVlcyk7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgUmVzb3VyY2VEZWZpbml0aW9ucyA9IHsgW2tleTogc3RyaW5nXTogUmVzb3VyY2VEZWZpbml0aW9uIH07XG5leHBvcnQgdHlwZSBSZXNvdXJjZURlZmluaXRpb25zU2VyaWFsaXplZCA9IHtcbiAgW2tleTogc3RyaW5nXTogUmVzb3VyY2VEZWZpbml0aW9uU2VyaWFsaXplZDtcbn07XG4iLCAiaW1wb3J0IHsgUmVzdWx0LCBvaywgZXJyb3IgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhbi50c1wiO1xuaW1wb3J0IHsgT3AsIFN1Yk9wLCBTdWJPcFJlc3VsdCB9IGZyb20gXCIuL29wcy50c1wiO1xuaW1wb3J0IHtcbiAgREVGQVVMVF9SRVNPVVJDRV9WQUxVRSxcbiAgUmVzb3VyY2VEZWZpbml0aW9uLFxufSBmcm9tIFwiLi4vcmVzb3VyY2VzL3Jlc291cmNlcy50c1wiO1xuaW1wb3J0IHsgVGFzayB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuXG5leHBvcnQgY2xhc3MgQWRkUmVzb3VyY2VTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG5cbiAgLy8gTWFwcyBhbiBpbmRleCBvZiBhIFRhc2sgdG8gYSB2YWx1ZSBmb3IgdGhlIGdpdmVuIHJlc291cmNlIGtleS5cbiAgdGFza1Jlc291cmNlVmFsdWVzOiBNYXA8bnVtYmVyLCBzdHJpbmc+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICB0YXNrUmVzb3VyY2VWYWx1ZXM6IE1hcDxudW1iZXIsIHN0cmluZz4gPSBuZXcgTWFwPG51bWJlciwgc3RyaW5nPigpIC8vIFNob3VsZCBvbmx5IGJlIHN1cHBsaWVkIGJ5IGludmVyc2UgYWN0aW9ucy5cbiAgKSB7XG4gICAgdGhpcy5rZXkgPSBuYW1lO1xuICAgIHRoaXMudGFza1Jlc291cmNlVmFsdWVzID0gdGFza1Jlc291cmNlVmFsdWVzO1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGZvdW5kTWF0Y2ggPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKGZvdW5kTWF0Y2ggIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBhbHJlYWR5IGV4aXN0cyBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuXG4gICAgcGxhbi5zZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXksIG5ldyBSZXNvdXJjZURlZmluaXRpb24oKSk7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIGFkZCB0aGlzIGtleSBhbmQgc2V0IGl0IHRvIHRoZSBkZWZhdWx0LCB1bmxlc3NcbiAgICAvLyB0aGVyZSBpcyBtYXRjaGluZyBlbnRyeSBpbiB0YXNrUmVzb3VyY2VWYWx1ZXMsIGluIHdoaWNoIGNhc2Ugd2Ugd2lsbCB1c2UgdGhhdCB2YWx1ZS5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIHRhc2suc2V0UmVzb3VyY2UoXG4gICAgICAgIHRoaXMua2V5LFxuICAgICAgICB0aGlzLnRhc2tSZXNvdXJjZVZhbHVlcy5nZXQoaW5kZXgpIHx8IERFRkFVTFRfUkVTT1VSQ0VfVkFMVUVcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlUmVzb3VyY2VTdXBPcCh0aGlzLmtleSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlbGV0ZVJlc291cmNlU3VwT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMua2V5ID0gbmFtZTtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCByZXNvdXJjZURlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKHJlc291cmNlRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGBUaGUgcmVzb3VyY2Ugd2l0aCBuYW1lICR7dGhpcy5rZXl9IGRvZXMgbm90IGV4aXN0IGFuZCBjYW4ndCBiZSBkZWxldGVkLmBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGZyb20gcmVzb3VyY2UgZGVmaW5pdGlvbnMuXG4gICAgcGxhbi5kZWxldGVNZXRyaWNEZWZpbml0aW9uKHRoaXMua2V5KTtcblxuICAgIGNvbnN0IHRhc2tJbmRleFRvRGVsZXRlZFJlc291cmNlVmFsdWU6IE1hcDxudW1iZXIsIHN0cmluZz4gPSBuZXcgTWFwKCk7XG5cbiAgICAvLyBOb3cgbG9vayBhdCBhbGwgVGFza3MgYW5kIHJlbW92ZSBgdGhpcy5rZXlgIGZyb20gdGhlIHJlc291cmNlcyB3aGlsZSBhbHNvXG4gICAgLy8gYnVpbGRpbmcgdXAgdGhlIGluZm8gbmVlZGVkIGZvciBhIHJldmVydC5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGFzay5nZXRSZXNvdXJjZSh0aGlzLmtleSkgfHwgREVGQVVMVF9SRVNPVVJDRV9WQUxVRTtcbiAgICAgIHRhc2tJbmRleFRvRGVsZXRlZFJlc291cmNlVmFsdWUuc2V0KGluZGV4LCB2YWx1ZSk7XG4gICAgICB0YXNrLmRlbGV0ZVJlc291cmNlKHRoaXMua2V5KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKHRhc2tJbmRleFRvRGVsZXRlZFJlc291cmNlVmFsdWUpLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZlcnNlKFxuICAgIHJlc291cmNlVmFsdWVzRm9yRGVsZXRlZFJlc291cmNlS2V5OiBNYXA8bnVtYmVyLCBzdHJpbmc+XG4gICk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IEFkZFJlc291cmNlU3ViT3AodGhpcy5rZXksIHJlc291cmNlVmFsdWVzRm9yRGVsZXRlZFJlc291cmNlS2V5KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQWRkUmVzb3VyY2VPcHRpb25TdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG4gIHZhbHVlOiBzdHJpbmc7XG4gIGluZGljZXNPZlRhc2tzVG9DaGFuZ2U6IG51bWJlcltdID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgdmFsdWU6IHN0cmluZyxcbiAgICBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlOiBudW1iZXJbXSA9IFtdIC8vIFRoaXMgc2hvdWxkIG9ubHkgYmUgc3VwcGxpZWQgd2hlbiBiZWluZyBjb25zdHJ1Y3RlZCBhcyBhIGludmVyc2Ugb3BlcmF0aW9uLlxuICApIHtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5pbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlID0gaW5kaWNlc09mVGFza3NUb0NoYW5nZTtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBkZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChkZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lc24ndCBleGlzdCBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuICAgIGNvbnN0IGV4aXN0aW5nSW5kZXggPSBkZWZpbml0aW9uLnZhbHVlcy5maW5kSW5kZXgoXG4gICAgICAodmFsdWU6IHN0cmluZykgPT4gdmFsdWUgPT09IHRoaXMudmFsdWVcbiAgICApO1xuICAgIGlmIChleGlzdGluZ0luZGV4ICE9PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgJHt0aGlzLnZhbHVlfSBhbHJlYWR5IGV4aXN0cyBhcyBhIHZhbHVlIGluIHRoZSBSZXNvdXJjZSAke3RoaXMua2V5fS5gXG4gICAgICApO1xuICAgIH1cbiAgICBkZWZpbml0aW9uLnZhbHVlcy5wdXNoKHRoaXMudmFsdWUpO1xuXG4gICAgLy8gTm93IGxvb2sgYXQgYWxsIFRhc2tzIGFuZCBzZXQgdGhlIHZhbHVlIGZvciB0aGUgZ2l2ZW4ga2V5IGZvciBhbGwgdGhlXG4gICAgLy8gdGFza3MgbGlzdGVkIGluIGBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlYC5cbiAgICB0aGlzLmluZGljZXNPZlRhc2tzVG9DaGFuZ2UuZm9yRWFjaCgodGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIHBsYW4uY2hhcnQuVmVydGljZXNbdGFza0luZGV4XS5zZXRSZXNvdXJjZSh0aGlzLmtleSwgdGhpcy52YWx1ZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIHByaXZhdGUgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBEZWxldGVSZXNvdXJjZU9wdGlvblN1Yk9wKFxuICAgICAgdGhpcy5rZXksXG4gICAgICB0aGlzLnZhbHVlLFxuICAgICAgdGhpcy5pbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVsZXRlUmVzb3VyY2VPcHRpb25TdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG4gIHZhbHVlOiBzdHJpbmc7XG4gIGluZGljZXNPZlRhc2tzVG9DaGFuZ2U6IG51bWJlcltdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGtleTogc3RyaW5nLFxuICAgIHZhbHVlOiBzdHJpbmcsXG4gICAgaW5kaWNlc09mVGFza3NUb0NoYW5nZTogbnVtYmVyW10gPSBbXVxuICApIHtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5pbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlID0gaW5kaWNlc09mVGFza3NUb0NoYW5nZTtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBkZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChkZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lc24ndCBleGlzdCBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuICAgIGNvbnN0IHZhbHVlSW5kZXggPSBkZWZpbml0aW9uLnZhbHVlcy5maW5kSW5kZXgoXG4gICAgICAodmFsdWU6IHN0cmluZykgPT4gdmFsdWUgPT09IHRoaXMudmFsdWVcbiAgICApO1xuICAgIGlmICh2YWx1ZUluZGV4ID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgJHt0aGlzLnZhbHVlfSBkb2VzIG5vdCBleGlzdCBhcyBhIHZhbHVlIGluIHRoZSBSZXNvdXJjZSAke3RoaXMua2V5fS5gXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZGVmaW5pdGlvbi52YWx1ZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGBSZXNvdXJjZXMgbXVzdCBoYXZlIGF0IGxlYXN0IG9uZSB2YWx1ZS4gJHt0aGlzLnZhbHVlfSBvbmx5IGhhcyBvbmUgdmFsdWUsIHNvIGl0IGNhbid0IGJlIGRlbGV0ZWQuIGBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgZGVmaW5pdGlvbi52YWx1ZXMuc3BsaWNlKHZhbHVlSW5kZXgsIDEpO1xuXG4gICAgLy8gTm93IGl0ZXJhdGUgdGhvdWdoIGFsbCB0aGUgdGFza3MgYW5kIGNoYW5nZSBhbGwgdGFza3MgdGhhdCBoYXZlXG4gICAgLy8gXCJrZXk6dmFsdWVcIiB0byBpbnN0ZWFkIGJlIFwia2V5OmRlZmF1bHRcIi4gUmVjb3JkIHdoaWNoIHRhc2tzIGdvdCBjaGFuZ2VkXG4gICAgLy8gc28gdGhhdCB3ZSBjYW4gdXNlIHRoYXQgaW5mb3JtYXRpb24gd2hlbiB3ZSBjcmVhdGUgdGhlIGludmVydCBvcGVyYXRpb24uXG5cbiAgICBjb25zdCBpbmRpY2VzT2ZUYXNrc1dpdGhNYXRjaGluZ1Jlc291cmNlVmFsdWVzOiBudW1iZXJbXSA9IFtdO1xuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCByZXNvdXJjZVZhbHVlID0gdGFzay5nZXRSZXNvdXJjZSh0aGlzLmtleSk7XG4gICAgICBpZiAocmVzb3VyY2VWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gU2luY2UgdGhlIHZhbHVlIGlzIG5vIGxvbmdlciB2YWxpZCB3ZSBjaGFuZ2UgaXQgYmFjayB0byB0aGUgZGVmYXVsdC5cbiAgICAgIHRhc2suc2V0UmVzb3VyY2UodGhpcy5rZXksIGRlZmluaXRpb24udmFsdWVzWzBdKTtcblxuICAgICAgLy8gUmVjb3JkIHdoaWNoIHRhc2sgd2UganVzdCBjaGFuZ2VkLlxuICAgICAgaW5kaWNlc09mVGFza3NXaXRoTWF0Y2hpbmdSZXNvdXJjZVZhbHVlcy5wdXNoKGluZGV4KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKGluZGljZXNPZlRhc2tzV2l0aE1hdGNoaW5nUmVzb3VyY2VWYWx1ZXMpLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZlcnNlKGluZGljZXNPZlRhc2tzVG9DaGFuZ2U6IG51bWJlcltdKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgQWRkUmVzb3VyY2VPcHRpb25TdWJPcChcbiAgICAgIHRoaXMua2V5LFxuICAgICAgdGhpcy52YWx1ZSxcbiAgICAgIGluZGljZXNPZlRhc2tzVG9DaGFuZ2VcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZW5hbWVSZXNvdXJjZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBvbGRLZXk6IHN0cmluZztcbiAgbmV3S2V5OiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Iob2xkS2V5OiBzdHJpbmcsIG5ld0tleTogc3RyaW5nKSB7XG4gICAgdGhpcy5vbGRLZXkgPSBvbGRLZXk7XG4gICAgdGhpcy5uZXdLZXkgPSBuZXdLZXk7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3Qgb2xkRGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMub2xkS2V5KTtcbiAgICBpZiAob2xkRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5vbGRLZXl9IGRvZXMgbm90IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG5cbiAgICAvLyBDb25maXJtIHRoZSBuZXdLZXkgaXMgbm90IGFscmVhZHkgdXNlZC5cbiAgICBjb25zdCBuZXdLZXlEZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5uZXdLZXkpO1xuICAgIGlmIChuZXdLZXlEZWZpbml0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm5ld0tleX0gYWxyZWFkeSBleGlzdHMgYXMgYSByZXNvdXJjZSBuYW1lLmApO1xuICAgIH1cblxuICAgIHBsYW4uZGVsZXRlUmVzb3VyY2VEZWZpbml0aW9uKHRoaXMub2xkS2V5KTtcbiAgICBwbGFuLnNldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLm5ld0tleSwgb2xkRGVmaW5pdGlvbik7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIGNoYW5nZSBvbGRLZXkgLT4gbmV3a2V5IGZvciB0aGUgZ2l2ZW4gcmVzb3VyY2Uga2V5LlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaykgPT4ge1xuICAgICAgY29uc3QgY3VycmVudFZhbHVlID1cbiAgICAgICAgdGFzay5nZXRSZXNvdXJjZSh0aGlzLm9sZEtleSkgfHwgREVGQVVMVF9SRVNPVVJDRV9WQUxVRTtcbiAgICAgIHRhc2suc2V0UmVzb3VyY2UodGhpcy5uZXdLZXksIGN1cnJlbnRWYWx1ZSk7XG4gICAgICB0YXNrLmRlbGV0ZVJlc291cmNlKHRoaXMub2xkS2V5KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBSZW5hbWVSZXNvdXJjZVN1Yk9wKHRoaXMubmV3S2V5LCB0aGlzLm9sZEtleSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbmFtZVJlc291cmNlT3B0aW9uU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuICBvbGRWYWx1ZTogc3RyaW5nO1xuICBuZXdWYWx1ZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGtleTogc3RyaW5nLCBvbGRWYWx1ZTogc3RyaW5nLCBuZXdWYWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy5vbGRWYWx1ZSA9IG9sZFZhbHVlO1xuICAgIHRoaXMubmV3VmFsdWUgPSBuZXdWYWx1ZTtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBmb3VuZE1hdGNoID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChmb3VuZE1hdGNoID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lcyBub3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cblxuICAgIC8vIENvbmZpcm0gdGhlIG9sZFZhbHVlIGlzIGluIHRoZXJlLlxuICAgIGNvbnN0IG9sZFZhbHVlSW5kZXggPSBmb3VuZE1hdGNoLnZhbHVlcy5pbmRleE9mKHRoaXMub2xkVmFsdWUpO1xuXG4gICAgaWYgKG9sZFZhbHVlSW5kZXggPT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXMgbm90IGEgdmFsdWUgJHt0aGlzLm9sZFZhbHVlfWApO1xuICAgIH1cblxuICAgIC8vIENvbmZpcm0gdGhlIG5ld1ZhbHVlIGlzIG5vdCBpbiB0aGVyZS5cbiAgICBjb25zdCBuZXdWYWx1ZUluZGV4ID0gZm91bmRNYXRjaC52YWx1ZXMuaW5kZXhPZih0aGlzLm5ld1ZhbHVlKTtcbiAgICBpZiAobmV3VmFsdWVJbmRleCAhPT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gYWxyZWFkeSBoYXMgYSB2YWx1ZSAke3RoaXMubmV3VmFsdWV9YCk7XG4gICAgfVxuXG4gICAgLy8gU3dhcCB0aGUgdmFsdWVzLlxuICAgIGZvdW5kTWF0Y2gudmFsdWVzLnNwbGljZShvbGRWYWx1ZUluZGV4LCAxLCB0aGlzLm5ld1ZhbHVlKTtcblxuICAgIC8vIE5vdyBsb29wIG92ZXIgZXZlcnkgdGFzayBhbmQgY2hhbmdlIG9sZFZhbHVlIC0+IG5ld1ZhbHVlIGZvciB0aGUgZ2l2ZW4gcmVzb3VyY2Uga2V5LlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaykgPT4ge1xuICAgICAgY29uc3QgY3VycmVudFZhbHVlID0gdGFzay5nZXRSZXNvdXJjZSh0aGlzLmtleSk7XG4gICAgICBpZiAoY3VycmVudFZhbHVlID09PSB0aGlzLm9sZFZhbHVlKSB7XG4gICAgICAgIHRhc2suc2V0UmVzb3VyY2UodGhpcy5rZXksIHRoaXMubmV3VmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFJlbmFtZVJlc291cmNlT3B0aW9uU3ViT3AoXG4gICAgICB0aGlzLmtleSxcbiAgICAgIHRoaXMubmV3VmFsdWUsXG4gICAgICB0aGlzLm9sZFZhbHVlXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTW92ZVJlc291cmNlT3B0aW9uU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuICBvbGRJbmRleDogbnVtYmVyO1xuICBuZXdJbmRleDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKGtleTogc3RyaW5nLCBvbGRWYWx1ZTogbnVtYmVyLCBuZXdWYWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy5vbGRJbmRleCA9IG9sZFZhbHVlO1xuICAgIHRoaXMubmV3SW5kZXggPSBuZXdWYWx1ZTtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBkZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChkZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lcyBub3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9sZEluZGV4ID4gZGVmaW5pdGlvbi52YWx1ZXMubGVuZ3RoIC0gMSkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgJHt0aGlzLmtleX0gZG9lcyBub3QgaGF2ZSBhIHZhbHVlIGF0IGluZGV4ICR7dGhpcy5vbGRJbmRleH1gXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAodGhpcy5uZXdJbmRleCA+IGRlZmluaXRpb24udmFsdWVzLmxlbmd0aCAtIDEpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYCR7dGhpcy5rZXl9IGRvZXMgbm90IGhhdmUgYSB2YWx1ZSBhdCBpbmRleCAke3RoaXMubmV3SW5kZXh9YFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBTd2FwIHRoZSB2YWx1ZXMuXG4gICAgY29uc3QgdG1wID0gZGVmaW5pdGlvbi52YWx1ZXNbdGhpcy5vbGRJbmRleF07XG4gICAgZGVmaW5pdGlvbi52YWx1ZXNbdGhpcy5vbGRJbmRleF0gPSBkZWZpbml0aW9uLnZhbHVlc1t0aGlzLm5ld0luZGV4XTtcbiAgICBkZWZpbml0aW9uLnZhbHVlc1t0aGlzLm5ld0luZGV4XSA9IHRtcDtcblxuICAgIC8vIFdlIGRvbid0IG5lZWQgdG8gZG8gYW55dGhpbmcgd2l0aCBUYXNrcyBiZWNhdXNlIHRoZSBpbmRleCBvZiBhIHZhbHVlIGlzXG4gICAgLy8gaXJyZWxldmFudCBzaW5jZSB3ZSBzdG9yZSB0aGUgdmFsdWUgaXRzZWxmLCBub3QgdGhlIGluZGV4LlxuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IE1vdmVSZXNvdXJjZU9wdGlvblN1Yk9wKHRoaXMua2V5LCB0aGlzLm5ld0luZGV4LCB0aGlzLm9sZEluZGV4KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2V0UmVzb3VyY2VWYWx1ZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcbiAgdmFsdWU6IHN0cmluZztcbiAgdGFza0luZGV4OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Ioa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIHRhc2tJbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMudGFza0luZGV4ID0gdGFza0luZGV4O1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGZvdW5kTWF0Y2ggPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKGZvdW5kTWF0Y2ggPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2VzIG5vdCBleGlzdCBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuXG4gICAgY29uc3QgZm91bmRWYWx1ZU1hdGNoID0gZm91bmRNYXRjaC52YWx1ZXMuZmluZEluZGV4KCh2OiBzdHJpbmcpID0+IHtcbiAgICAgIHJldHVybiB2ID09PSB0aGlzLnZhbHVlO1xuICAgIH0pO1xuICAgIGlmIChmb3VuZFZhbHVlTWF0Y2ggPT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXMgbm90IGhhdmUgYSB2YWx1ZSBvZiAke3RoaXMudmFsdWV9YCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRhc2tJbmRleCA8IDAgfHwgdGhpcy50YXNrSW5kZXggPj0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBlcnJvcihgVGhlcmUgaXMgbm8gVGFzayBhdCBpbmRleCAke3RoaXMudGFza0luZGV4fWApO1xuICAgIH1cblxuICAgIGNvbnN0IHRhc2sgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMudGFza0luZGV4XTtcbiAgICBjb25zdCBvbGRWYWx1ZSA9IHRhc2suZ2V0UmVzb3VyY2UodGhpcy5rZXkpITtcbiAgICB0YXNrLnNldFJlc291cmNlKHRoaXMua2V5LCB0aGlzLnZhbHVlKTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZShvbGRWYWx1ZSkgfSk7XG4gIH1cblxuICBpbnZlcnNlKG9sZFZhbHVlOiBzdHJpbmcpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBTZXRSZXNvdXJjZVZhbHVlU3ViT3AodGhpcy5rZXksIG9sZFZhbHVlLCB0aGlzLnRhc2tJbmRleCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFkZFJlc291cmNlT3AobmFtZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgQWRkUmVzb3VyY2VTdWJPcChuYW1lKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRGVsZXRlUmVzb3VyY2VPcChuYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBEZWxldGVSZXNvdXJjZVN1cE9wKG5hbWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBZGRSZXNvdXJjZU9wdGlvbk9wKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgQWRkUmVzb3VyY2VPcHRpb25TdWJPcChrZXksIHZhbHVlKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRGVsZXRlUmVzb3VyY2VPcHRpb25PcChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IERlbGV0ZVJlc291cmNlT3B0aW9uU3ViT3Aoa2V5LCB2YWx1ZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJlbmFtZVJlc291cmNlT3B0aW9uT3AoXG4gIGtleTogc3RyaW5nLFxuICBvbGRWYWx1ZTogc3RyaW5nLFxuICBuZXdWYWx1ZTogc3RyaW5nXG4pOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBSZW5hbWVSZXNvdXJjZU9wdGlvblN1Yk9wKGtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmVuYW1lUmVzb3VyY2VPcChvbGRWYWx1ZTogc3RyaW5nLCBuZXdWYWx1ZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgUmVuYW1lUmVzb3VyY2VTdWJPcChvbGRWYWx1ZSwgbmV3VmFsdWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBNb3ZlUmVzb3VyY2VPcHRpb25PcChcbiAga2V5OiBzdHJpbmcsXG4gIG9sZEluZGV4OiBudW1iZXIsXG4gIG5ld0luZGV4OiBudW1iZXJcbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IE1vdmVSZXNvdXJjZU9wdGlvblN1Yk9wKGtleSwgb2xkSW5kZXgsIG5ld0luZGV4KV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU2V0UmVzb3VyY2VWYWx1ZU9wKFxuICBrZXk6IHN0cmluZyxcbiAgdmFsdWU6IHN0cmluZyxcbiAgdGFza0luZGV4OiBudW1iZXJcbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFNldFJlc291cmNlVmFsdWVTdWJPcChrZXksIHZhbHVlLCB0YXNrSW5kZXgpXSk7XG59XG4iLCAiaW1wb3J0IHtcbiAgVmVydGV4LFxuICBWZXJ0ZXhJbmRpY2VzLFxuICBEaXJlY3RlZEdyYXBoLFxuICBlZGdlc0J5U3JjVG9NYXAsXG59IGZyb20gXCIuLi9kYWcudHNcIjtcblxuLyoqXG5UaGUgcmV0dXJuIHR5cGUgZm9yIHRoZSBUb3Bsb2dpY2FsU29ydCBmdW5jdGlvbi4gXG4gKi9cbnR5cGUgVFNSZXR1cm4gPSB7XG4gIGhhc0N5Y2xlczogYm9vbGVhbjtcblxuICBjeWNsZTogVmVydGV4SW5kaWNlcztcblxuICBvcmRlcjogVmVydGV4SW5kaWNlcztcbn07XG5cbi8qKlxuUmV0dXJucyBhIHRvcG9sb2dpY2FsIHNvcnQgb3JkZXIgZm9yIGEgRGlyZWN0ZWRHcmFwaCwgb3IgdGhlIG1lbWJlcnMgb2YgYSBjeWNsZSBpZiBhXG50b3BvbG9naWNhbCBzb3J0IGNhbid0IGJlIGRvbmUuXG4gXG4gVGhlIHRvcG9sb2dpY2FsIHNvcnQgY29tZXMgZnJvbTpcblxuICAgIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1RvcG9sb2dpY2FsX3NvcnRpbmcjRGVwdGgtZmlyc3Rfc2VhcmNoXG5cbkwgXHUyMTkwIEVtcHR5IGxpc3QgdGhhdCB3aWxsIGNvbnRhaW4gdGhlIHNvcnRlZCBub2Rlc1xud2hpbGUgZXhpc3RzIG5vZGVzIHdpdGhvdXQgYSBwZXJtYW5lbnQgbWFyayBkb1xuICAgIHNlbGVjdCBhbiB1bm1hcmtlZCBub2RlIG5cbiAgICB2aXNpdChuKVxuXG5mdW5jdGlvbiB2aXNpdChub2RlIG4pXG4gICAgaWYgbiBoYXMgYSBwZXJtYW5lbnQgbWFyayB0aGVuXG4gICAgICAgIHJldHVyblxuICAgIGlmIG4gaGFzIGEgdGVtcG9yYXJ5IG1hcmsgdGhlblxuICAgICAgICBzdG9wICAgKGdyYXBoIGhhcyBhdCBsZWFzdCBvbmUgY3ljbGUpXG5cbiAgICBtYXJrIG4gd2l0aCBhIHRlbXBvcmFyeSBtYXJrXG5cbiAgICBmb3IgZWFjaCBub2RlIG0gd2l0aCBhbiBlZGdlIGZyb20gbiB0byBtIGRvXG4gICAgICAgIHZpc2l0KG0pXG5cbiAgICByZW1vdmUgdGVtcG9yYXJ5IG1hcmsgZnJvbSBuXG4gICAgbWFyayBuIHdpdGggYSBwZXJtYW5lbnQgbWFya1xuICAgIGFkZCBuIHRvIGhlYWQgb2YgTFxuXG4gKi9cbmV4cG9ydCBjb25zdCB0b3BvbG9naWNhbFNvcnQgPSAoZzogRGlyZWN0ZWRHcmFwaCk6IFRTUmV0dXJuID0+IHtcbiAgY29uc3QgcmV0OiBUU1JldHVybiA9IHtcbiAgICBoYXNDeWNsZXM6IGZhbHNlLFxuICAgIGN5Y2xlOiBbXSxcbiAgICBvcmRlcjogW10sXG4gIH07XG5cbiAgY29uc3QgZWRnZU1hcCA9IGVkZ2VzQnlTcmNUb01hcChnLkVkZ2VzKTtcblxuICBjb25zdCBub2Rlc1dpdGhvdXRQZXJtYW5lbnRNYXJrID0gbmV3IFNldDxudW1iZXI+KCk7XG4gIGcuVmVydGljZXMuZm9yRWFjaCgoXzogVmVydGV4LCBpbmRleDogbnVtYmVyKSA9PlxuICAgIG5vZGVzV2l0aG91dFBlcm1hbmVudE1hcmsuYWRkKGluZGV4KVxuICApO1xuXG4gIGNvbnN0IGhhc1Blcm1hbmVudE1hcmsgPSAoaW5kZXg6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xuICAgIHJldHVybiAhbm9kZXNXaXRob3V0UGVybWFuZW50TWFyay5oYXMoaW5kZXgpO1xuICB9O1xuXG4gIGNvbnN0IHRlbXBvcmFyeU1hcmsgPSBuZXcgU2V0PG51bWJlcj4oKTtcblxuICBjb25zdCB2aXNpdCA9IChpbmRleDogbnVtYmVyKTogYm9vbGVhbiA9PiB7XG4gICAgaWYgKGhhc1Blcm1hbmVudE1hcmsoaW5kZXgpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHRlbXBvcmFyeU1hcmsuaGFzKGluZGV4KSkge1xuICAgICAgLy8gV2Ugb25seSByZXR1cm4gZmFsc2Ugb24gZmluZGluZyBhIGxvb3AsIHdoaWNoIGlzIHN0b3JlZCBpblxuICAgICAgLy8gdGVtcG9yYXJ5TWFyay5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdGVtcG9yYXJ5TWFyay5hZGQoaW5kZXgpO1xuXG4gICAgY29uc3QgbmV4dEVkZ2VzID0gZWRnZU1hcC5nZXQoaW5kZXgpO1xuICAgIGlmIChuZXh0RWRnZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXh0RWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZSA9IG5leHRFZGdlc1tpXTtcbiAgICAgICAgaWYgKCF2aXNpdChlLmopKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGVtcG9yYXJ5TWFyay5kZWxldGUoaW5kZXgpO1xuICAgIG5vZGVzV2l0aG91dFBlcm1hbmVudE1hcmsuZGVsZXRlKGluZGV4KTtcbiAgICByZXQub3JkZXIudW5zaGlmdChpbmRleCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLy8gV2Ugd2lsbCBwcmVzdW1lIHRoYXQgVmVydGV4WzBdIGlzIHRoZSBzdGFydCBub2RlIGFuZCB0aGF0IHdlIHNob3VsZCBzdGFydCB0aGVyZS5cbiAgY29uc3Qgb2sgPSB2aXNpdCgwKTtcbiAgaWYgKCFvaykge1xuICAgIHJldC5oYXNDeWNsZXMgPSB0cnVlO1xuICAgIHJldC5jeWNsZSA9IFsuLi50ZW1wb3JhcnlNYXJrLmtleXMoKV07XG4gIH1cblxuICByZXR1cm4gcmV0O1xufTtcbiIsICJpbXBvcnQgeyBSZXN1bHQsIG9rLCBlcnJvciB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7XG4gIFZlcnRleEluZGljZXMsXG4gIEVkZ2VzLFxuICBEaXJlY3RlZEdyYXBoLFxuICBlZGdlc0J5U3JjVG9NYXAsXG4gIGVkZ2VzQnlEc3RUb01hcCxcbiAgRGlyZWN0ZWRFZGdlLFxuICBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkLFxufSBmcm9tIFwiLi4vZGFnL2RhZ1wiO1xuXG5pbXBvcnQgeyB0b3BvbG9naWNhbFNvcnQgfSBmcm9tIFwiLi4vZGFnL2FsZ29yaXRobXMvdG9wb3NvcnQudHNcIjtcbmltcG9ydCB7IE1ldHJpY1ZhbHVlcyB9IGZyb20gXCIuLi9tZXRyaWNzL21ldHJpY3MudHNcIjtcblxuZXhwb3J0IHR5cGUgVGFza1N0YXRlID0gXCJ1bnN0YXJ0ZWRcIiB8IFwic3RhcnRlZFwiIHwgXCJjb21wbGV0ZVwiO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9UQVNLX05BTUUgPSBcIlRhc2sgTmFtZVwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRhc2tTZXJpYWxpemVkIHtcbiAgcmVzb3VyY2VzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xuICBtZXRyaWNzOiBNZXRyaWNWYWx1ZXM7XG4gIG5hbWU6IHN0cmluZztcbiAgc3RhdGU6IFRhc2tTdGF0ZTtcbn1cblxuLy8gRG8gd2UgY3JlYXRlIHN1Yi1jbGFzc2VzIGFuZCB0aGVuIHNlcmlhbGl6ZSBzZXBhcmF0ZWx5PyBPciBkbyB3ZSBoYXZlIGFcbi8vIGNvbmZpZyBhYm91dCB3aGljaCB0eXBlIG9mIER1cmF0aW9uU2FtcGxlciBpcyBiZWluZyB1c2VkP1xuLy9cbi8vIFdlIGNhbiB1c2UgdHJhZGl0aW9uYWwgb3B0aW1pc3RpYy9wZXNzaW1pc3RpYyB2YWx1ZS4gT3IgSmFjb2JpYW4nc1xuLy8gdW5jZXJ0YWludGx5IG11bHRpcGxpZXJzIFsxLjEsIDEuNSwgMiwgNV0gYW5kIHRoZWlyIGludmVyc2VzIHRvIGdlbmVyYXRlIGFuXG4vLyBvcHRpbWlzdGljIHBlc3NpbWlzdGljLlxuXG4vKiogVGFzayBpcyBhIFZlcnRleCB3aXRoIGRldGFpbHMgYWJvdXQgdGhlIFRhc2sgdG8gY29tcGxldGUuICovXG5leHBvcnQgY2xhc3MgVGFzayB7XG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZyA9IFwiXCIpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lIHx8IERFRkFVTFRfVEFTS19OQU1FO1xuICAgIHRoaXMubWV0cmljcyA9IHt9O1xuICAgIHRoaXMucmVzb3VyY2VzID0ge307XG4gIH1cblxuICAvLyBSZXNvdXJjZSBrZXlzIGFuZCB2YWx1ZXMuIFRoZSBwYXJlbnQgcGxhbiBjb250YWlucyBhbGwgdGhlIHJlc291cmNlXG4gIC8vIGRlZmluaXRpb25zLlxuXG4gIHJlc291cmNlczogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcblxuICBtZXRyaWNzOiBNZXRyaWNWYWx1ZXM7XG5cbiAgbmFtZTogc3RyaW5nO1xuXG4gIHN0YXRlOiBUYXNrU3RhdGUgPSBcInVuc3RhcnRlZFwiO1xuXG4gIHRvSlNPTigpOiBUYXNrU2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc291cmNlczogdGhpcy5yZXNvdXJjZXMsXG4gICAgICBtZXRyaWNzOiB0aGlzLm1ldHJpY3MsXG4gICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICBzdGF0ZTogdGhpcy5zdGF0ZSxcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIGdldCBkdXJhdGlvbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldE1ldHJpYyhcIkR1cmF0aW9uXCIpITtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgZHVyYXRpb24odmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMuc2V0TWV0cmljKFwiRHVyYXRpb25cIiwgdmFsdWUpO1xuICB9XG5cbiAgcHVibGljIGdldE1ldHJpYyhrZXk6IHN0cmluZyk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMubWV0cmljc1trZXldO1xuICB9XG5cbiAgcHVibGljIHNldE1ldHJpYyhrZXk6IHN0cmluZywgdmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMubWV0cmljc1trZXldID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZGVsZXRlTWV0cmljKGtleTogc3RyaW5nKSB7XG4gICAgZGVsZXRlIHRoaXMubWV0cmljc1trZXldO1xuICB9XG5cbiAgcHVibGljIGdldFJlc291cmNlKGtleTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5yZXNvdXJjZXNba2V5XTtcbiAgfVxuXG4gIHB1YmxpYyBzZXRSZXNvdXJjZShrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMucmVzb3VyY2VzW2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBkZWxldGVSZXNvdXJjZShrZXk6IHN0cmluZykge1xuICAgIGRlbGV0ZSB0aGlzLnJlc291cmNlc1trZXldO1xuICB9XG5cbiAgcHVibGljIGR1cCgpOiBUYXNrIHtcbiAgICBjb25zdCByZXQgPSBuZXcgVGFzaygpO1xuICAgIHJldC5yZXNvdXJjZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnJlc291cmNlcyk7XG4gICAgcmV0Lm1ldHJpY3MgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLm1ldHJpY3MpO1xuICAgIHJldC5uYW1lID0gdGhpcy5uYW1lO1xuICAgIHJldC5zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBUYXNrcyA9IFRhc2tbXTtcblxuZXhwb3J0IGludGVyZmFjZSBDaGFydFNlcmlhbGl6ZWQge1xuICB2ZXJ0aWNlczogVGFza1NlcmlhbGl6ZWRbXTtcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVNlcmlhbGl6ZWRbXTtcbn1cblxuLyoqIEEgQ2hhcnQgaXMgYSBEaXJlY3RlZEdyYXBoLCBidXQgd2l0aCBUYXNrcyBmb3IgVmVydGljZXMuICovXG5leHBvcnQgY2xhc3MgQ2hhcnQge1xuICBWZXJ0aWNlczogVGFza3M7XG4gIEVkZ2VzOiBFZGdlcztcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBjb25zdCBzdGFydCA9IG5ldyBUYXNrKFwiU3RhcnRcIik7XG4gICAgc3RhcnQuc2V0TWV0cmljKFwiRHVyYXRpb25cIiwgMCk7XG4gICAgY29uc3QgZmluaXNoID0gbmV3IFRhc2soXCJGaW5pc2hcIik7XG4gICAgZmluaXNoLnNldE1ldHJpYyhcIkR1cmF0aW9uXCIsIDApO1xuICAgIHRoaXMuVmVydGljZXMgPSBbc3RhcnQsIGZpbmlzaF07XG4gICAgdGhpcy5FZGdlcyA9IFtuZXcgRGlyZWN0ZWRFZGdlKDAsIDEpXTtcbiAgfVxuXG4gIHRvSlNPTigpOiBDaGFydFNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICB2ZXJ0aWNlczogdGhpcy5WZXJ0aWNlcy5tYXAoKHQ6IFRhc2spID0+IHQudG9KU09OKCkpLFxuICAgICAgZWRnZXM6IHRoaXMuRWRnZXMubWFwKChlOiBEaXJlY3RlZEVkZ2UpID0+IGUudG9KU09OKCkpLFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgVG9wb2xvZ2ljYWxPcmRlciA9IFZlcnRleEluZGljZXM7XG5cbmV4cG9ydCB0eXBlIFZhbGlkYXRlUmVzdWx0ID0gUmVzdWx0PFRvcG9sb2dpY2FsT3JkZXI+O1xuXG4vKiogVmFsaWRhdGVzIGEgRGlyZWN0ZWRHcmFwaCBpcyBhIHZhbGlkIENoYXJ0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQ2hhcnQoZzogRGlyZWN0ZWRHcmFwaCk6IFZhbGlkYXRlUmVzdWx0IHtcbiAgaWYgKGcuVmVydGljZXMubGVuZ3RoIDwgMikge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIFwiQ2hhcnQgbXVzdCBjb250YWluIGF0IGxlYXN0IHR3byBub2RlLCB0aGUgc3RhcnQgYW5kIGZpbmlzaCB0YXNrcy5cIlxuICAgICk7XG4gIH1cblxuICBjb25zdCBlZGdlc0J5RHN0ID0gZWRnZXNCeURzdFRvTWFwKGcuRWRnZXMpO1xuICBjb25zdCBlZGdlc0J5U3JjID0gZWRnZXNCeVNyY1RvTWFwKGcuRWRnZXMpO1xuXG4gIC8vIFRoZSBmaXJzdCBWZXJ0ZXgsIFRfMCBha2EgdGhlIFN0YXJ0IE1pbGVzdG9uZSwgbXVzdCBoYXZlIDAgaW5jb21pbmcgZWRnZXMuXG4gIGlmIChlZGdlc0J5RHN0LmdldCgwKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGVycm9yKFwiVGhlIHN0YXJ0IG5vZGUgKDApIGhhcyBhbiBpbmNvbWluZyBlZGdlLlwiKTtcbiAgfVxuXG4gIC8vIEFuZCBvbmx5IFRfMCBzaG91bGQgaGF2ZSAwIGluY29taW5nIGVkZ2VzLlxuICBmb3IgKGxldCBpID0gMTsgaSA8IGcuVmVydGljZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZWRnZXNCeURzdC5nZXQoaSkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgRm91bmQgbm9kZSB0aGF0IGlzbid0ICgwKSB0aGF0IGhhcyBubyBpbmNvbWluZyBlZGdlczogJHtpfWBcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLy8gVGhlIGxhc3QgVmVydGV4LCBUX2ZpbmlzaCwgdGhlIEZpbmlzaCBNaWxlc3RvbmUsIG11c3QgaGF2ZSAwIG91dGdvaW5nIGVkZ2VzLlxuICBpZiAoZWRnZXNCeVNyYy5nZXQoZy5WZXJ0aWNlcy5sZW5ndGggLSAxKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGVycm9yKFxuICAgICAgXCJUaGUgbGFzdCBub2RlLCB3aGljaCBzaG91bGQgYmUgdGhlIEZpbmlzaCBNaWxlc3RvbmUsIGhhcyBhbiBvdXRnb2luZyBlZGdlLlwiXG4gICAgKTtcbiAgfVxuXG4gIC8vIEFuZCBvbmx5IFRfZmluaXNoIHNob3VsZCBoYXZlIDAgb3V0Z29pbmcgZWRnZXMuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZy5WZXJ0aWNlcy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICBpZiAoZWRnZXNCeVNyYy5nZXQoaSkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgRm91bmQgbm9kZSB0aGF0IGlzbid0IFRfZmluaXNoIHRoYXQgaGFzIG5vIG91dGdvaW5nIGVkZ2VzOiAke2l9YFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBudW1WZXJ0aWNlcyA9IGcuVmVydGljZXMubGVuZ3RoO1xuICAvLyBBbmQgYWxsIGVkZ2VzIG1ha2Ugc2Vuc2UsIGkuZS4gdGhleSBhbGwgcG9pbnQgdG8gdmVydGV4ZXMgdGhhdCBleGlzdC5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBnLkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IGcuRWRnZXNbaV07XG4gICAgaWYgKFxuICAgICAgZWxlbWVudC5pIDwgMCB8fFxuICAgICAgZWxlbWVudC5pID49IG51bVZlcnRpY2VzIHx8XG4gICAgICBlbGVtZW50LmogPCAwIHx8XG4gICAgICBlbGVtZW50LmogPj0gbnVtVmVydGljZXNcbiAgICApIHtcbiAgICAgIHJldHVybiBlcnJvcihgRWRnZSAke2VsZW1lbnR9IHBvaW50cyB0byBhIG5vbi1leGlzdGVudCBWZXJ0ZXguYCk7XG4gICAgfVxuICB9XG5cbiAgLy8gTm93IHdlIGNvbmZpcm0gdGhhdCB3ZSBoYXZlIGEgRGlyZWN0ZWQgQWN5Y2xpYyBHcmFwaCwgaS5lLiB0aGUgZ3JhcGggaGFzIG5vXG4gIC8vIGN5Y2xlcyBieSBjcmVhdGluZyBhIHRvcG9sb2dpY2FsIHNvcnQgc3RhcnRpbmcgYXQgVF8wXG4gIC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1RvcG9sb2dpY2FsX3NvcnRpbmcjRGVwdGgtZmlyc3Rfc2VhcmNoXG4gIGNvbnN0IHRzUmV0ID0gdG9wb2xvZ2ljYWxTb3J0KGcpO1xuICBpZiAodHNSZXQuaGFzQ3ljbGVzKSB7XG4gICAgcmV0dXJuIGVycm9yKGBDaGFydCBoYXMgY3ljbGU6ICR7Wy4uLnRzUmV0LmN5Y2xlXS5qb2luKFwiLCBcIil9YCk7XG4gIH1cblxuICByZXR1cm4gb2sodHNSZXQub3JkZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQ2hhcnRWYWxpZGF0ZShjOiBDaGFydCk6IFZhbGlkYXRlUmVzdWx0IHtcbiAgY29uc3QgcmV0ID0gdmFsaWRhdGVDaGFydChjKTtcbiAgaWYgKCFyZXQub2spIHtcbiAgICByZXR1cm4gcmV0O1xuICB9XG4gIGlmIChjLlZlcnRpY2VzWzBdLmR1cmF0aW9uICE9PSAwKSB7XG4gICAgcmV0dXJuIGVycm9yKFxuICAgICAgYFN0YXJ0IE1pbGVzdG9uZSBtdXN0IGhhdmUgZHVyYXRpb24gb2YgMCwgaW5zdGVhZCBnb3QgJHtjLlZlcnRpY2VzWzBdLmR1cmF0aW9ufWBcbiAgICApO1xuICB9XG4gIGlmIChjLlZlcnRpY2VzW2MuVmVydGljZXMubGVuZ3RoIC0gMV0uZHVyYXRpb24gIT09IDApIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBgRmluaXNoIE1pbGVzdG9uZSBtdXN0IGhhdmUgZHVyYXRpb24gb2YgMCwgaW5zdGVhZCBnb3QgJHtcbiAgICAgICAgYy5WZXJ0aWNlc1tjLlZlcnRpY2VzLmxlbmd0aCAtIDFdLmR1cmF0aW9uXG4gICAgICB9YFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cbiIsICJpbXBvcnQgeyBSb3VuZGVyIH0gZnJvbSBcIi4uL3R5cGVzL3R5cGVzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJlY2lzaW9uU2VyaWFsaXplZCB7XG4gIHByZWNpc2lvbjogbnVtYmVyO1xufVxuZXhwb3J0IGNsYXNzIFByZWNpc2lvbiB7XG4gIHByaXZhdGUgbXVsdGlwbGllcjogbnVtYmVyO1xuICBwcml2YXRlIF9wcmVjaXNpb246IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihwcmVjaXNpb246IG51bWJlciA9IDApIHtcbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShwcmVjaXNpb24pKSB7XG4gICAgICBwcmVjaXNpb24gPSAwO1xuICAgIH1cbiAgICB0aGlzLl9wcmVjaXNpb24gPSBNYXRoLmFicyhNYXRoLnRydW5jKHByZWNpc2lvbikpO1xuICAgIHRoaXMubXVsdGlwbGllciA9IDEwICoqIHRoaXMuX3ByZWNpc2lvbjtcbiAgfVxuXG4gIHJvdW5kKHg6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIE1hdGgudHJ1bmMoeCAqIHRoaXMubXVsdGlwbGllcikgLyB0aGlzLm11bHRpcGxpZXI7XG4gIH1cblxuICByb3VuZGVyKCk6IFJvdW5kZXIge1xuICAgIHJldHVybiAoeDogbnVtYmVyKTogbnVtYmVyID0+IHRoaXMucm91bmQoeCk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHByZWNpc2lvbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9wcmVjaXNpb247XG4gIH1cblxuICB0b0pTT04oKTogUHJlY2lzaW9uU2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByZWNpc2lvbjogdGhpcy5fcHJlY2lzaW9uLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgRnJvbUpTT04oczogUHJlY2lzaW9uU2VyaWFsaXplZCB8IHVuZGVmaW5lZCk6IFByZWNpc2lvbiB7XG4gICAgaWYgKHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG5ldyBQcmVjaXNpb24oKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcmVjaXNpb24ocy5wcmVjaXNpb24pO1xuICB9XG59XG4iLCAiLy8gVXRpbGl0aWVzIGZvciBkZWFsaW5nIHdpdGggYSByYW5nZSBvZiBudW1iZXJzLlxuXG5leHBvcnQgaW50ZXJmYWNlIE1ldHJpY1JhbmdlU2VyaWFsaXplZCB7XG4gIG1pbjogbnVtYmVyO1xuICBtYXg6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNvbnN0IGNsYW1wID0gKHg6IG51bWJlciwgbWluOiBudW1iZXIsIG1heDogbnVtYmVyKTogbnVtYmVyID0+IHtcbiAgaWYgKHggPiBtYXgpIHtcbiAgICByZXR1cm4gbWF4O1xuICB9XG4gIGlmICh4IDwgbWluKSB7XG4gICAgcmV0dXJuIG1pbjtcbiAgfVxuICByZXR1cm4geDtcbn07XG5cbi8vIFJhbmdlIGRlZmluZXMgYSByYW5nZSBvZiBudW1iZXJzLCBmcm9tIFttaW4sIG1heF0gaW5jbHVzaXZlLlxuZXhwb3J0IGNsYXNzIE1ldHJpY1JhbmdlIHtcbiAgcHJpdmF0ZSBfbWluOiBudW1iZXIgPSAtTnVtYmVyLk1BWF9WQUxVRTtcbiAgcHJpdmF0ZSBfbWF4OiBudW1iZXIgPSBOdW1iZXIuTUFYX1ZBTFVFO1xuXG4gIGNvbnN0cnVjdG9yKG1pbjogbnVtYmVyID0gLU51bWJlci5NQVhfVkFMVUUsIG1heDogbnVtYmVyID0gTnVtYmVyLk1BWF9WQUxVRSkge1xuICAgIGlmIChtYXggPCBtaW4pIHtcbiAgICAgIFttaW4sIG1heF0gPSBbbWF4LCBtaW5dO1xuICAgIH1cbiAgICB0aGlzLl9taW4gPSBtaW47XG4gICAgdGhpcy5fbWF4ID0gbWF4O1xuICB9XG5cbiAgY2xhbXAodmFsdWU6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIGNsYW1wKHZhbHVlLCB0aGlzLl9taW4sIHRoaXMuX21heCk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1pbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9taW47XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1heCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9tYXg7XG4gIH1cblxuICB0b0pTT04oKTogTWV0cmljUmFuZ2VTZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgbWluOiB0aGlzLl9taW4sXG4gICAgICBtYXg6IHRoaXMuX21heCxcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIEZyb21KU09OKHM6IE1ldHJpY1JhbmdlU2VyaWFsaXplZCB8IHVuZGVmaW5lZCk6IE1ldHJpY1JhbmdlIHtcbiAgICBpZiAocyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbmV3IE1ldHJpY1JhbmdlKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgTWV0cmljUmFuZ2Uocy5taW4sIHMubWF4KTtcbiAgfVxufVxuIiwgIi8vIE1ldHJpY3MgZGVmaW5lIGZsb2F0aW5nIHBvaW50IHZhbHVlcyB0aGF0IGFyZSB0cmFja2VkIHBlciBUYXNrLlxuXG5pbXBvcnQgeyBQcmVjaXNpb24sIFByZWNpc2lvblNlcmlhbGl6ZWQgfSBmcm9tIFwiLi4vcHJlY2lzaW9uL3ByZWNpc2lvbi50c1wiO1xuaW1wb3J0IHsgY2xhbXAsIE1ldHJpY1JhbmdlLCBNZXRyaWNSYW5nZVNlcmlhbGl6ZWQgfSBmcm9tIFwiLi9yYW5nZS50c1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIE1ldHJpY0RlZmluaXRpb25TZXJpYWxpemVkIHtcbiAgcmFuZ2U6IE1ldHJpY1JhbmdlU2VyaWFsaXplZDtcbiAgZGVmYXVsdDogbnVtYmVyO1xuICBwcmVjaXNpb246IFByZWNpc2lvblNlcmlhbGl6ZWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBNZXRyaWNEZWZpbml0aW9uIHtcbiAgcmFuZ2U6IE1ldHJpY1JhbmdlO1xuICBkZWZhdWx0OiBudW1iZXI7XG4gIGlzU3RhdGljOiBib29sZWFuO1xuICBwcmVjaXNpb246IFByZWNpc2lvbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBkZWZhdWx0VmFsdWU6IG51bWJlcixcbiAgICByYW5nZTogTWV0cmljUmFuZ2UgPSBuZXcgTWV0cmljUmFuZ2UoKSxcbiAgICBpc1N0YXRpYzogYm9vbGVhbiA9IGZhbHNlLFxuICAgIHByZWNpc2lvbjogUHJlY2lzaW9uID0gbmV3IFByZWNpc2lvbigxKVxuICApIHtcbiAgICB0aGlzLnJhbmdlID0gcmFuZ2U7XG4gICAgdGhpcy5kZWZhdWx0ID0gY2xhbXAoZGVmYXVsdFZhbHVlLCByYW5nZS5taW4sIHJhbmdlLm1heCk7XG4gICAgdGhpcy5pc1N0YXRpYyA9IGlzU3RhdGljO1xuICAgIHRoaXMucHJlY2lzaW9uID0gcHJlY2lzaW9uO1xuICB9XG5cbiAgdG9KU09OKCk6IE1ldHJpY0RlZmluaXRpb25TZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmFuZ2U6IHRoaXMucmFuZ2UudG9KU09OKCksXG4gICAgICBkZWZhdWx0OiB0aGlzLmRlZmF1bHQsXG4gICAgICBwcmVjaXNpb246IHRoaXMucHJlY2lzaW9uLnRvSlNPTigpLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgRnJvbUpTT04oczogTWV0cmljRGVmaW5pdGlvblNlcmlhbGl6ZWQgfCB1bmRlZmluZWQpOiBNZXRyaWNEZWZpbml0aW9uIHtcbiAgICBpZiAocyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbmV3IE1ldHJpY0RlZmluaXRpb24oMCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgTWV0cmljRGVmaW5pdGlvbihcbiAgICAgIHMuZGVmYXVsdCB8fCAwLFxuICAgICAgTWV0cmljUmFuZ2UuRnJvbUpTT04ocy5yYW5nZSksXG4gICAgICBmYWxzZSxcbiAgICAgIFByZWNpc2lvbi5Gcm9tSlNPTihzLnByZWNpc2lvbilcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIE1ldHJpY0RlZmluaXRpb25zID0geyBba2V5OiBzdHJpbmddOiBNZXRyaWNEZWZpbml0aW9uIH07XG5cbmV4cG9ydCB0eXBlIE1ldHJpY0RlZmluaXRpb25zU2VyaWFsaXplZCA9IHtcbiAgW2tleTogc3RyaW5nXTogTWV0cmljRGVmaW5pdGlvblNlcmlhbGl6ZWQ7XG59O1xuXG5leHBvcnQgdHlwZSBNZXRyaWNWYWx1ZXMgPSB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9O1xuIiwgIi8qKlxuICogVHJpYW5ndWxhciBpcyB0aGUgaW52ZXJzZSBDdW11bGF0aXZlIERlbnNpdHkgRnVuY3Rpb24gKENERikgZm9yIHRoZVxuICogdHJpYW5ndWxhciBkaXN0cmlidXRpb24uXG4gKlxuICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVHJpYW5ndWxhcl9kaXN0cmlidXRpb24jR2VuZXJhdGluZ19yYW5kb21fdmFyaWF0ZXNcbiAqXG4gKiBUaGUgaW52ZXJzZSBvZiB0aGUgQ0RGIGlzIHVzZWZ1bCBmb3IgZ2VuZXJhdGluZyBzYW1wbGVzIGZyb20gdGhlXG4gKiBkaXN0cmlidXRpb24sIGkuZS4gcGFzc2luZyBpbiB2YWx1ZXMgZnJvbSB0aGUgdW5pZm9ybSBkaXN0cmlidXRpb24gWzAsIDFdXG4gKiB3aWxsIHByb2R1Y2Ugc2FtcGxlIHRoYXQgbG9vayBsaWtlIHRoZXkgY29tZSBmcm9tIHRoZSB0cmlhbmd1bGFyXG4gKiBkaXN0cmlidXRpb24uXG4gKlxuICpcbiAqL1xuXG5leHBvcnQgY2xhc3MgVHJpYW5ndWxhciB7XG4gIHByaXZhdGUgYTogbnVtYmVyO1xuICBwcml2YXRlIGI6IG51bWJlcjtcbiAgcHJpdmF0ZSBjOiBudW1iZXI7XG4gIHByaXZhdGUgRl9jOiBudW1iZXI7XG5cbiAgLyoqICBUaGUgdHJpYW5ndWxhciBkaXN0cmlidXRpb24gaXMgYSBjb250aW51b3VzIHByb2JhYmlsaXR5IGRpc3RyaWJ1dGlvbiB3aXRoXG4gIGxvd2VyIGxpbWl0IGBhYCwgdXBwZXIgbGltaXQgYGJgLCBhbmQgbW9kZSBgY2AsIHdoZXJlIGEgPCBiIGFuZCBhIFx1MjI2NCBjIFx1MjI2NCBiLiAqL1xuICBjb25zdHJ1Y3RvcihhOiBudW1iZXIsIGI6IG51bWJlciwgYzogbnVtYmVyKSB7XG4gICAgdGhpcy5hID0gYTtcbiAgICB0aGlzLmIgPSBiO1xuICAgIHRoaXMuYyA9IGM7XG5cbiAgICAvLyBGX2MgaXMgdGhlIGN1dG9mZiBpbiB0aGUgZG9tYWluIHdoZXJlIHdlIHN3aXRjaCBiZXR3ZWVuIHRoZSB0d28gaGFsdmVzIG9mXG4gICAgLy8gdGhlIHRyaWFuZ2xlLlxuICAgIHRoaXMuRl9jID0gKGMgLSBhKSAvIChiIC0gYSk7XG4gIH1cblxuICAvKiogIFByb2R1Y2UgYSBzYW1wbGUgZnJvbSB0aGUgdHJpYW5ndWxhciBkaXN0cmlidXRpb24uIFRoZSB2YWx1ZSBvZiAncCdcbiAgIHNob3VsZCBiZSBpbiBbMCwgMS4wXS4gKi9cbiAgc2FtcGxlKHA6IG51bWJlcik6IG51bWJlciB7XG4gICAgaWYgKHAgPCAwKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9IGVsc2UgaWYgKHAgPiAxLjApIHtcbiAgICAgIHJldHVybiAxLjA7XG4gICAgfSBlbHNlIGlmIChwIDwgdGhpcy5GX2MpIHtcbiAgICAgIHJldHVybiB0aGlzLmEgKyBNYXRoLnNxcnQocCAqICh0aGlzLmIgLSB0aGlzLmEpICogKHRoaXMuYyAtIHRoaXMuYSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICB0aGlzLmIgLSBNYXRoLnNxcnQoKDEgLSBwKSAqICh0aGlzLmIgLSB0aGlzLmEpICogKHRoaXMuYiAtIHRoaXMuYykpXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuIiwgImltcG9ydCB7IFRyaWFuZ3VsYXIgfSBmcm9tIFwiLi90cmlhbmd1bGFyLnRzXCI7XG5cbmV4cG9ydCB0eXBlIFVuY2VydGFpbnR5ID0gXCJsb3dcIiB8IFwibW9kZXJhdGVcIiB8IFwiaGlnaFwiIHwgXCJleHRyZW1lXCI7XG5cbmV4cG9ydCBjb25zdCBVbmNlcnRhaW50eVRvTnVtOiBSZWNvcmQ8VW5jZXJ0YWludHksIG51bWJlcj4gPSB7XG4gIGxvdzogMS4xLFxuICBtb2RlcmF0ZTogMS41LFxuICBoaWdoOiAyLFxuICBleHRyZW1lOiA1LFxufTtcblxuZXhwb3J0IGNsYXNzIEphY29iaWFuIHtcbiAgcHJpdmF0ZSB0cmlhbmd1bGFyOiBUcmlhbmd1bGFyO1xuICBjb25zdHJ1Y3RvcihleHBlY3RlZDogbnVtYmVyLCB1bmNlcnRhaW50eTogVW5jZXJ0YWludHkpIHtcbiAgICBjb25zdCBtdWwgPSBVbmNlcnRhaW50eVRvTnVtW3VuY2VydGFpbnR5XTtcbiAgICB0aGlzLnRyaWFuZ3VsYXIgPSBuZXcgVHJpYW5ndWxhcihleHBlY3RlZCAvIG11bCwgZXhwZWN0ZWQgKiBtdWwsIGV4cGVjdGVkKTtcbiAgfVxuXG4gIHNhbXBsZShwOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnRyaWFuZ3VsYXIuc2FtcGxlKHApO1xuICB9XG59XG4iLCAiaW1wb3J0IHtcbiAgQ2hhcnQsXG4gIENoYXJ0U2VyaWFsaXplZCxcbiAgVGFzayxcbiAgVGFza1NlcmlhbGl6ZWQsXG4gIHZhbGlkYXRlQ2hhcnQsXG59IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgRGlyZWN0ZWRFZGdlLCBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkIH0gZnJvbSBcIi4uL2RhZy9kYWcudHNcIjtcbmltcG9ydCB7XG4gIE1ldHJpY0RlZmluaXRpb24sXG4gIE1ldHJpY0RlZmluaXRpb25zLFxuICBNZXRyaWNEZWZpbml0aW9uc1NlcmlhbGl6ZWQsXG59IGZyb20gXCIuLi9tZXRyaWNzL21ldHJpY3MudHNcIjtcbmltcG9ydCB7IE1ldHJpY1JhbmdlIH0gZnJvbSBcIi4uL21ldHJpY3MvcmFuZ2UudHNcIjtcbmltcG9ydCB7IFJhdGlvbmFsaXplRWRnZXNPcCB9IGZyb20gXCIuLi9vcHMvY2hhcnQudHNcIjtcbmltcG9ydCB7XG4gIFJlc291cmNlRGVmaW5pdGlvbixcbiAgUmVzb3VyY2VEZWZpbml0aW9ucyxcbiAgUmVzb3VyY2VEZWZpbml0aW9uc1NlcmlhbGl6ZWQsXG59IGZyb20gXCIuLi9yZXNvdXJjZXMvcmVzb3VyY2VzLnRzXCI7XG5pbXBvcnQgeyBSZXN1bHQsIG9rIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgVW5jZXJ0YWludHlUb051bSB9IGZyb20gXCIuLi9zdGF0cy9jZGYvdHJpYW5ndWxhci9qYWNvYmlhbi50c1wiO1xuXG5leHBvcnQgdHlwZSBTdGF0aWNNZXRyaWNLZXlzID0gXCJEdXJhdGlvblwiIHwgXCJQZXJjZW50IENvbXBsZXRlXCI7XG5cbmV4cG9ydCBjb25zdCBTdGF0aWNNZXRyaWNEZWZpbml0aW9uczogTWV0cmljRGVmaW5pdGlvbnMgPSB7XG4gIC8vIEhvdyBsb25nIGEgdGFzayB3aWxsIHRha2UsIGluIGRheXMuXG4gIER1cmF0aW9uOiBuZXcgTWV0cmljRGVmaW5pdGlvbigwLCBuZXcgTWV0cmljUmFuZ2UoKSwgdHJ1ZSksXG4gIC8vIFRoZSBwZXJjZW50IGNvbXBsZXRlIGZvciBhIHRhc2suXG4gIFBlcmNlbnQ6IG5ldyBNZXRyaWNEZWZpbml0aW9uKDAsIG5ldyBNZXRyaWNSYW5nZSgwLCAxMDApLCB0cnVlKSxcbn07XG5cbmV4cG9ydCBjb25zdCBTdGF0aWNSZXNvdXJjZURlZmluaXRpb25zOiBSZXNvdXJjZURlZmluaXRpb25zID0ge1xuICBVbmNlcnRhaW50eTogbmV3IFJlc291cmNlRGVmaW5pdGlvbihPYmplY3Qua2V5cyhVbmNlcnRhaW50eVRvTnVtKSwgdHJ1ZSksXG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIFBsYW5TZXJpYWxpemVkIHtcbiAgY2hhcnQ6IENoYXJ0U2VyaWFsaXplZDtcbiAgcmVzb3VyY2VEZWZpbml0aW9uczogUmVzb3VyY2VEZWZpbml0aW9uc1NlcmlhbGl6ZWQ7XG4gIG1ldHJpY0RlZmluaXRpb25zOiBNZXRyaWNEZWZpbml0aW9uc1NlcmlhbGl6ZWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBQbGFuIHtcbiAgY2hhcnQ6IENoYXJ0O1xuXG4gIHJlc291cmNlRGVmaW5pdGlvbnM6IFJlc291cmNlRGVmaW5pdGlvbnM7XG5cbiAgbWV0cmljRGVmaW5pdGlvbnM6IE1ldHJpY0RlZmluaXRpb25zO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY2hhcnQgPSBuZXcgQ2hhcnQoKTtcblxuICAgIHRoaXMucmVzb3VyY2VEZWZpbml0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIFN0YXRpY1Jlc291cmNlRGVmaW5pdGlvbnMpO1xuICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBTdGF0aWNNZXRyaWNEZWZpbml0aW9ucyk7XG4gICAgdGhpcy5hcHBseU1ldHJpY3NBbmRSZXNvdXJjZXNUb1ZlcnRpY2VzKCk7XG4gIH1cblxuICBhcHBseU1ldHJpY3NBbmRSZXNvdXJjZXNUb1ZlcnRpY2VzKCkge1xuICAgIE9iamVjdC5rZXlzKHRoaXMubWV0cmljRGVmaW5pdGlvbnMpLmZvckVhY2goKG1ldHJpY05hbWU6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgbWQgPSB0aGlzLm1ldHJpY0RlZmluaXRpb25zW21ldHJpY05hbWVdITtcbiAgICAgIHRoaXMuY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaykgPT4ge1xuICAgICAgICB0YXNrLnNldE1ldHJpYyhtZXRyaWNOYW1lLCBtZC5kZWZhdWx0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIE9iamVjdC5lbnRyaWVzKHRoaXMucmVzb3VyY2VEZWZpbml0aW9ucykuZm9yRWFjaChcbiAgICAgIChba2V5LCByZXNvdXJjZURlZmluaXRpb25dKSA9PiB7XG4gICAgICAgIHRoaXMuY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaykgPT4ge1xuICAgICAgICAgIHRhc2suc2V0UmVzb3VyY2Uoa2V5LCByZXNvdXJjZURlZmluaXRpb24udmFsdWVzWzBdKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIHRvSlNPTigpOiBQbGFuU2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNoYXJ0OiB0aGlzLmNoYXJ0LnRvSlNPTigpLFxuICAgICAgcmVzb3VyY2VEZWZpbml0aW9uczogT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICBPYmplY3QuZW50cmllcyh0aGlzLnJlc291cmNlRGVmaW5pdGlvbnMpLmZpbHRlcihcbiAgICAgICAgICAoW2tleSwgcmVzb3VyY2VEZWZpbml0aW9uXSkgPT4gIXJlc291cmNlRGVmaW5pdGlvbi5pc1N0YXRpY1xuICAgICAgICApXG4gICAgICApLFxuICAgICAgbWV0cmljRGVmaW5pdGlvbnM6IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgT2JqZWN0LmVudHJpZXModGhpcy5tZXRyaWNEZWZpbml0aW9ucylcbiAgICAgICAgICAuZmlsdGVyKChba2V5LCBtZXRyaWNEZWZpbml0aW9uXSkgPT4gIW1ldHJpY0RlZmluaXRpb24uaXNTdGF0aWMpXG4gICAgICAgICAgLm1hcCgoW2tleSwgbWV0cmljRGVmaW5pdGlvbl0pID0+IFtrZXksIG1ldHJpY0RlZmluaXRpb24udG9KU09OKCldKVxuICAgICAgKSxcbiAgICB9O1xuICB9XG5cbiAgZ2V0TWV0cmljRGVmaW5pdGlvbihrZXk6IHN0cmluZyk6IE1ldHJpY0RlZmluaXRpb24gfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLm1ldHJpY0RlZmluaXRpb25zW2tleV07XG4gIH1cblxuICBzZXRNZXRyaWNEZWZpbml0aW9uKGtleTogc3RyaW5nLCBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uKSB7XG4gICAgdGhpcy5tZXRyaWNEZWZpbml0aW9uc1trZXldID0gbWV0cmljRGVmaW5pdGlvbjtcbiAgfVxuXG4gIGRlbGV0ZU1ldHJpY0RlZmluaXRpb24oa2V5OiBzdHJpbmcpIHtcbiAgICBkZWxldGUgdGhpcy5tZXRyaWNEZWZpbml0aW9uc1trZXldO1xuICB9XG5cbiAgZ2V0UmVzb3VyY2VEZWZpbml0aW9uKGtleTogc3RyaW5nKTogUmVzb3VyY2VEZWZpbml0aW9uIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5yZXNvdXJjZURlZmluaXRpb25zW2tleV07XG4gIH1cblxuICBzZXRSZXNvdXJjZURlZmluaXRpb24oa2V5OiBzdHJpbmcsIHZhbHVlOiBSZXNvdXJjZURlZmluaXRpb24pIHtcbiAgICB0aGlzLnJlc291cmNlRGVmaW5pdGlvbnNba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgZGVsZXRlUmVzb3VyY2VEZWZpbml0aW9uKGtleTogc3RyaW5nKSB7XG4gICAgZGVsZXRlIHRoaXMucmVzb3VyY2VEZWZpbml0aW9uc1trZXldO1xuICB9XG5cbiAgLy8gUmV0dXJucyBhIG5ldyBUYXNrIHdpdGggZGVmYXVsdHMgZm9yIGFsbCBtZXRyaWNzIGFuZCByZXNvdXJjZXMuXG4gIG5ld1Rhc2soKTogVGFzayB7XG4gICAgY29uc3QgcmV0ID0gbmV3IFRhc2soKTtcbiAgICBPYmplY3Qua2V5cyh0aGlzLm1ldHJpY0RlZmluaXRpb25zKS5mb3JFYWNoKChtZXRyaWNOYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnN0IG1kID0gdGhpcy5nZXRNZXRyaWNEZWZpbml0aW9uKG1ldHJpY05hbWUpITtcblxuICAgICAgcmV0LnNldE1ldHJpYyhtZXRyaWNOYW1lLCBtZC5kZWZhdWx0KTtcbiAgICB9KTtcbiAgICBPYmplY3QuZW50cmllcyh0aGlzLnJlc291cmNlRGVmaW5pdGlvbnMpLmZvckVhY2goXG4gICAgICAoW2tleSwgcmVzb3VyY2VEZWZpbml0aW9uXSkgPT4ge1xuICAgICAgICByZXQuc2V0UmVzb3VyY2Uoa2V5LCByZXNvdXJjZURlZmluaXRpb24udmFsdWVzWzBdKTtcbiAgICAgIH1cbiAgICApO1xuICAgIHJldHVybiByZXQ7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IEZyb21KU09OID0gKHRleHQ6IHN0cmluZyk6IFJlc3VsdDxQbGFuPiA9PiB7XG4gIGNvbnN0IHBsYW5TZXJpYWxpemVkOiBQbGFuU2VyaWFsaXplZCA9IEpTT04ucGFyc2UodGV4dCk7XG4gIGNvbnN0IHBsYW4gPSBuZXcgUGxhbigpO1xuXG4gIHBsYW4uY2hhcnQuVmVydGljZXMgPSBwbGFuU2VyaWFsaXplZC5jaGFydC52ZXJ0aWNlcy5tYXAoXG4gICAgKHRhc2tTZXJpYWxpemVkOiBUYXNrU2VyaWFsaXplZCk6IFRhc2sgPT4ge1xuICAgICAgY29uc3QgdGFzayA9IG5ldyBUYXNrKHRhc2tTZXJpYWxpemVkLm5hbWUpO1xuICAgICAgdGFzay5zdGF0ZSA9IHRhc2tTZXJpYWxpemVkLnN0YXRlO1xuICAgICAgdGFzay5tZXRyaWNzID0gdGFza1NlcmlhbGl6ZWQubWV0cmljcztcbiAgICAgIHRhc2sucmVzb3VyY2VzID0gdGFza1NlcmlhbGl6ZWQucmVzb3VyY2VzO1xuXG4gICAgICByZXR1cm4gdGFzaztcbiAgICB9XG4gICk7XG4gIHBsYW4uY2hhcnQuRWRnZXMgPSBwbGFuU2VyaWFsaXplZC5jaGFydC5lZGdlcy5tYXAoXG4gICAgKGRpcmVjdGVkRWRnZVNlcmlhbGl6ZWQ6IERpcmVjdGVkRWRnZVNlcmlhbGl6ZWQpOiBEaXJlY3RlZEVkZ2UgPT5cbiAgICAgIG5ldyBEaXJlY3RlZEVkZ2UoZGlyZWN0ZWRFZGdlU2VyaWFsaXplZC5pLCBkaXJlY3RlZEVkZ2VTZXJpYWxpemVkLmopXG4gICk7XG5cbiAgY29uc3QgZGVzZXJpYWxpemVkTWV0cmljRGVmaW5pdGlvbnMgPSBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgT2JqZWN0LmVudHJpZXMocGxhblNlcmlhbGl6ZWQubWV0cmljRGVmaW5pdGlvbnMpLm1hcChcbiAgICAgIChba2V5LCBzZXJpYWxpemVkTWV0cmljRGVmaW5pdGlvbl0pID0+IFtcbiAgICAgICAga2V5LFxuICAgICAgICBNZXRyaWNEZWZpbml0aW9uLkZyb21KU09OKHNlcmlhbGl6ZWRNZXRyaWNEZWZpbml0aW9uKSxcbiAgICAgIF1cbiAgICApXG4gICk7XG5cbiAgcGxhbi5tZXRyaWNEZWZpbml0aW9ucyA9IE9iamVjdC5hc3NpZ24oXG4gICAge30sXG4gICAgU3RhdGljTWV0cmljRGVmaW5pdGlvbnMsXG4gICAgZGVzZXJpYWxpemVkTWV0cmljRGVmaW5pdGlvbnNcbiAgKTtcblxuICBjb25zdCBkZXNlcmlhbGl6ZWRSZXNvdXJjZURlZmluaXRpb25zID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgIE9iamVjdC5lbnRyaWVzKHBsYW5TZXJpYWxpemVkLnJlc291cmNlRGVmaW5pdGlvbnMpLm1hcChcbiAgICAgIChba2V5LCBzZXJpYWxpemVkUmVzb3VyY2VEZWZpbml0aW9uXSkgPT4gW1xuICAgICAgICBrZXksXG4gICAgICAgIFJlc291cmNlRGVmaW5pdGlvbi5Gcm9tSlNPTihzZXJpYWxpemVkUmVzb3VyY2VEZWZpbml0aW9uKSxcbiAgICAgIF1cbiAgICApXG4gICk7XG5cbiAgcGxhbi5yZXNvdXJjZURlZmluaXRpb25zID0gT2JqZWN0LmFzc2lnbihcbiAgICB7fSxcbiAgICBTdGF0aWNSZXNvdXJjZURlZmluaXRpb25zLFxuICAgIGRlc2VyaWFsaXplZFJlc291cmNlRGVmaW5pdGlvbnNcbiAgKTtcblxuICBjb25zdCByZXQgPSBSYXRpb25hbGl6ZUVkZ2VzT3AoKS5hcHBseShwbGFuKTtcbiAgaWYgKCFyZXQub2spIHtcbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgY29uc3QgcmV0VmFsID0gdmFsaWRhdGVDaGFydChwbGFuLmNoYXJ0KTtcbiAgaWYgKCFyZXRWYWwub2spIHtcbiAgICByZXR1cm4gcmV0VmFsO1xuICB9XG4gIHJldHVybiBvayhwbGFuKTtcbn07XG4iLCAiLyoqIEEgY29vcmRpbmF0ZSBwb2ludCBvbiB0aGUgcmVuZGVyaW5nIHN1cmZhY2UuICovXG5leHBvcnQgY2xhc3MgUG9pbnQge1xuICB4OiBudW1iZXI7XG4gIHk6IG51bWJlcjtcblxuICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgfVxuXG4gIGFkZCh4OiBudW1iZXIsIHk6IG51bWJlcik6IFBvaW50IHtcbiAgICB0aGlzLnggKz0geDtcbiAgICB0aGlzLnkgKz0geTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHN1bShyaHM6IFBvaW50KTogUG9pbnQge1xuICAgIHJldHVybiBuZXcgUG9pbnQodGhpcy54ICsgcmhzLngsIHRoaXMueSArIHJocy55KTtcbiAgfVxuXG4gIGVxdWFsKHJoczogUG9pbnQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy54ID09PSByaHMueCAmJiB0aGlzLnkgPT09IHJocy55O1xuICB9XG5cbiAgc2V0KHJoczogUG9pbnQpOiBQb2ludCB7XG4gICAgdGhpcy54ID0gcmhzLng7XG4gICAgdGhpcy55ID0gcmhzLnk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBkdXAoKTogUG9pbnQge1xuICAgIHJldHVybiBuZXcgUG9pbnQodGhpcy54LCB0aGlzLnkpO1xuICB9XG59XG4iLCAiLyoqXG4gKiBGdW5jdGlvbmFsaXR5IGZvciBjcmVhdGluZyBkcmFnZ2FibGUgZGl2aWRlcnMgYmV0d2VlbiBlbGVtZW50cyBvbiBhIHBhZ2UuXG4gKi9cbmltcG9ydCB7IGNsYW1wIH0gZnJvbSBcIi4uLy4uL21ldHJpY3MvcmFuZ2UudHNcIjtcbmltcG9ydCB7IFBvaW50IH0gZnJvbSBcIi4uL3NjYWxlL3BvaW50LnRzXCI7XG5cbi8vIFZhbHVlcyBhcmUgcmV0dXJuZWQgYXMgcGVyY2VudGFnZXMgYXJvdW5kIHRoZSBjdXJyZW50IG1vdXNlIGxvY2F0aW9uLiBUaGF0XG4vLyBpcywgaWYgd2UgYXJlIGluIFwiY29sdW1uXCIgbW9kZSB0aGVuIGBiZWZvcmVgIHdvdWxkIGVxdWFsIHRoZSBtb3VzZSBwb3NpdGlvblxuLy8gYXMgYSAlIG9mIHRoZSB3aWR0aCBvZiB0aGUgcGFyZW50IGVsZW1lbnQgZnJvbSB0aGUgbGVmdCBoYW5kIHNpZGUgb2YgdGhlXG4vLyBwYXJlbnQgZWxlbWVudC4gVGhlIGBhZnRlcmAgdmFsdWUgaXMganVzdCAxMDAtYmVmb3JlLlxuZXhwb3J0IGludGVyZmFjZSBEaXZpZGVyTW92ZVJlc3VsdCB7XG4gIGJlZm9yZTogbnVtYmVyO1xuICBhZnRlcjogbnVtYmVyO1xufVxuXG5leHBvcnQgdHlwZSBEaXZpZGVyVHlwZSA9IFwiY29sdW1uXCIgfCBcInJvd1wiO1xuXG5leHBvcnQgY29uc3QgRElWSURFUl9NT1ZFX0VWRU5UID0gXCJkaXZpZGVyX21vdmVcIjtcblxuZXhwb3J0IGNvbnN0IFJFU0laSU5HX0NMQVNTID0gXCJyZXNpemluZ1wiO1xuXG5pbnRlcmZhY2UgUmVjdCB7XG4gIHRvcDogbnVtYmVyO1xuICBsZWZ0OiBudW1iZXI7XG4gIHdpZHRoOiBudW1iZXI7XG4gIGhlaWdodDogbnVtYmVyO1xufVxuXG4vKiogUmV0dXJucyBhIGJvdW5kaW5nIHJlY3RhbmdsZSBmb3IgYW4gZWxlbWVudCBpbiBQYWdlIGNvb3JkaW5hdGVzLCBhcyBvcHBvc2VkXG4gKiB0byBWaWV3UG9ydCBjb29yZGluYXRlcywgd2hpY2ggaXMgd2hhdCBnZXRCb3VuZGluZ0NsaWVudFJlY3QoKSByZXR1cm5zLlxuICovXG5leHBvcnQgY29uc3QgZ2V0UGFnZVJlY3QgPSAoZWxlOiBIVE1MRWxlbWVudCk6IFJlY3QgPT4ge1xuICBjb25zdCB2aWV3cG9ydFJlY3QgPSBlbGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHJldHVybiB7XG4gICAgdG9wOiB2aWV3cG9ydFJlY3QudG9wICsgd2luZG93LnNjcm9sbFksXG4gICAgbGVmdDogdmlld3BvcnRSZWN0LmxlZnQgKyB3aW5kb3cuc2Nyb2xsWCxcbiAgICB3aWR0aDogdmlld3BvcnRSZWN0LndpZHRoLFxuICAgIGhlaWdodDogdmlld3BvcnRSZWN0LmhlaWdodCxcbiAgfTtcbn07XG5cbi8qKiBEaXZpZGVyTW92ZSBpcyBjb3JlIGZ1bmN0aW9uYWxpdHkgZm9yIGNyZWF0aW5nIGRyYWdnYWJsZSBkaXZpZGVycyBiZXR3ZWVuXG4gKiBlbGVtZW50cyBvbiBhIHBhZ2UuXG4gKlxuICogQ29uc3RydWN0IGEgRGl2aWRlck1vZGUgd2l0aCBhIHBhcmVudCBlbGVtZW50IGFuZCBhIGRpdmlkZXIgZWxlbWVudCwgd2hlcmVcbiAqIHRoZSBkaXZpZGVyIGVsZW1lbnQgaXMgdGhlIGVsZW1lbnQgYmV0d2VlbiBvdGhlciBwYWdlIGVsZW1lbnRzIHRoYXQgaXNcbiAqIGV4cGVjdGVkIHRvIGJlIGRyYWdnZWQuIEZvciBleGFtcGxlLCBpbiB0aGUgZm9sbG93aW5nIGV4YW1wbGUgI2NvbnRhaW5lclxuICogd291bGQgYmUgdGhlIGBwYXJlbnRgLCBhbmQgI2RpdmlkZXIgd291bGQgYmUgdGhlIGBkaXZpZGVyYCBlbGVtZW50LlxuICpcbiAqICA8ZGl2IGlkPWNvbnRhaW5lcj5cbiAqICAgIDxkaXYgaWQ9bGVmdD48L2Rpdj4gIDxkaXYgaWQ9ZGl2aWRlcj48L2Rpdj4gPGRpdiBpZD1yaWdodD48L2Rpdj9cbiAqICA8L2Rpdj5cbiAqXG4gKiBEaXZpZGVyTW9kZSB3YWl0cyBmb3IgYSBtb3VzZWRvd24gZXZlbnQgb24gdGhlIGBkaXZpZGVyYCBlbGVtZW50IGFuZCB0aGVuXG4gKiB3YXRjaGVzIG1vdXNlIGV2ZW50cyBmb3IgdGhlIGdpdmVuIHBhcmVudCBIVE1MRWxlbWVudCBhbmQgZW1pdHMgZXZlbnRzIGFyb3VuZFxuICogZHJhZ2dpbmcuXG4gKlxuICogVGhlIGVtaXR0ZWQgZXZlbnQgaXMgXCJkaXZpZGVyX21vdmVcIiBhbmQgaXMgYSBDdXN0b21FdmVudDxEaXZpZGVyTW92ZVJlc3VsdD4uXG4gKlxuICogSXQgaXMgdXAgdG8gdGhlIHVzZXIgb2YgRGl2aWRlck1vdmUgdG8gbGlzdGVuIGZvciB0aGUgXCJkaXZpZGVyX21vdmVcIiBldmVudHNcbiAqIGFuZCB1cGRhdGUgdGhlIENTUyBvZiB0aGUgcGFnZSBhcHByb3ByaWF0ZWx5IHRvIHJlZmxlY3QgdGhlIHBvc2l0aW9uIG9mIHRoZVxuICogZGl2aWRlci5cbiAqXG4gKiBPbmNlIHRoZSBtb3VzZSBpcyBkb3duIGFuIGV2ZW50IHdpbGwgYmUgZW1pdHRlZCBwZXJpb2RpY2FsbHkgYXMgdGhlIG1vdXNlXG4gKiBtb3Zlcy5cbiAqXG4gKiBPbmNlIHRoZSBtb3VzZSBpcyByZWxlYXNlZCwgb3IgaWYgdGhlIG1vdXNlIGV4aXRzIHRoZSBwYXJlbnQgSFRNTEVsZW1lbnQsIG9uZVxuICogbGFzdCBldmVudCBpcyBlbWl0dGVkLlxuICpcbiAqIFdoaWxlIGRyYWdnaW5nIHRoZSBkaXZpZGVyLCB0aGUgXCJyZXNpemluZ1wiIGNsYXNzIHdpbGwgYmUgYWRkZWQgdG8gdGhlIHBhcmVudFxuICogZWxlbWVudC4gVGhpcyBjYW4gYmUgdXNlZCB0byBzZXQgYSBzdHlsZSwgZS5nLiAndXNlci1zZWxlY3Q6IG5vbmUnLlxuICovXG5leHBvcnQgY2xhc3MgRGl2aWRlck1vdmUge1xuICAvKiogVGhlIHBvaW50IHdoZXJlIGRyYWdnaW5nIHN0YXJ0ZWQsIGluIFBhZ2UgY29vcmRpbmF0ZXMuICovXG4gIGJlZ2luOiBQb2ludCB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBUaGUgZGltZW5zaW9ucyBvZiB0aGUgcGFyZW50IGVsZW1lbnQgaW4gUGFnZSBjb29yZGluYXRlcyBhcyBvZiBtb3VzZWRvd25cbiAgICogb24gdGhlIGRpdmlkZXIuLiAqL1xuICBwYXJlbnRSZWN0OiBSZWN0IHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFRoZSBjdXJyZW50IG1vdXNlIHBvc2l0aW9uIGluIFBhZ2UgY29vcmRpbmF0ZXMuICovXG4gIGN1cnJlbnRNb3ZlTG9jYXRpb246IFBvaW50ID0gbmV3IFBvaW50KDAsIDApO1xuXG4gIC8qKiBUaGUgbGFzdCBtb3VzZSBwb3NpdGlvbiBpbiBQYWdlIGNvb3JkaW5hdGVzIHJlcG9ydGVkIHZpYSBDdXN0b21FdmVudC4gKi9cbiAgbGFzdE1vdmVTZW50OiBQb2ludCA9IG5ldyBQb2ludCgwLCAwKTtcblxuICAvKiogVGhlIHBhcmVudCBlbGVtZW50IHRoYXQgY29udGFpbnMgdGhlIGRpdmlkZXIuICovXG4gIHBhcmVudDogSFRNTEVsZW1lbnQ7XG5cbiAgLyoqIFRoZSBkaXZpZGVyIGVsZW1lbnQgdG8gYmUgZHJhZ2dlZCBhY3Jvc3MgdGhlIHBhcmVudCBlbGVtZW50LiAqL1xuICBkaXZpZGVyOiBIVE1MRWxlbWVudDtcblxuICAvKiogVGhlIGhhbmRsZSBvZiB0aGUgd2luZG93LnNldEludGVydmFsKCkuICovXG4gIGludGVybnZhbEhhbmRsZTogbnVtYmVyID0gMDtcblxuICAvKiogVGhlIHR5cGUgb2YgZGl2aWRlciwgZWl0aGVyIHZlcnRpY2FsIChcImNvbHVtblwiKSwgb3IgaG9yaXpvbnRhbCAoXCJyb3dcIikuICovXG4gIGRpdmlkZXJUeXBlOiBEaXZpZGVyVHlwZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwYXJlbnQ6IEhUTUxFbGVtZW50LFxuICAgIGRpdmlkZXI6IEhUTUxFbGVtZW50LFxuICAgIGRpdmlkZXJUeXBlOiBEaXZpZGVyVHlwZSA9IFwiY29sdW1uXCJcbiAgKSB7XG4gICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgdGhpcy5kaXZpZGVyID0gZGl2aWRlcjtcbiAgICB0aGlzLmRpdmlkZXJUeXBlID0gZGl2aWRlclR5cGU7XG4gICAgdGhpcy5kaXZpZGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZWRvd24uYmluZCh0aGlzKSk7XG4gIH1cblxuICBkZXRhY2goKSB7XG4gICAgdGhpcy5wYXJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmRpdmlkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlZG93bi5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnBhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNldXAuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5wYXJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZWxlYXZlLmJpbmQodGhpcykpO1xuICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuaW50ZXJudmFsSGFuZGxlKTtcbiAgfVxuXG4gIG9uVGltZW91dCgpIHtcbiAgICBpZiAoIXRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi5lcXVhbCh0aGlzLmxhc3RNb3ZlU2VudCkpIHtcbiAgICAgIGxldCBkaWZmUGVyY2VudDogbnVtYmVyID0gMDtcbiAgICAgIGlmICh0aGlzLmRpdmlkZXJUeXBlID09PSBcImNvbHVtblwiKSB7XG4gICAgICAgIGRpZmZQZXJjZW50ID1cbiAgICAgICAgICAoMTAwICogKHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi54IC0gdGhpcy5wYXJlbnRSZWN0IS5sZWZ0KSkgL1xuICAgICAgICAgIHRoaXMucGFyZW50UmVjdCEud2lkdGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkaWZmUGVyY2VudCA9XG4gICAgICAgICAgKDEwMCAqICh0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueSAtIHRoaXMucGFyZW50UmVjdCEudG9wKSkgL1xuICAgICAgICAgIHRoaXMucGFyZW50UmVjdCEuaGVpZ2h0O1xuICAgICAgfVxuICAgICAgLy8gVE9ETyAtIFNob3VsZCBjbGFtcCBiZSBzZXR0YWJsZSBpbiB0aGUgY29uc3RydWN0b3I/XG4gICAgICBkaWZmUGVyY2VudCA9IGNsYW1wKGRpZmZQZXJjZW50LCA1LCA5NSk7XG5cbiAgICAgIHRoaXMucGFyZW50LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudDxEaXZpZGVyTW92ZVJlc3VsdD4oRElWSURFUl9NT1ZFX0VWRU5ULCB7XG4gICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICBiZWZvcmU6IGRpZmZQZXJjZW50LFxuICAgICAgICAgICAgYWZ0ZXI6IDEwMCAtIGRpZmZQZXJjZW50LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgICAgdGhpcy5sYXN0TW92ZVNlbnQuc2V0KHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbik7XG4gICAgfVxuICB9XG5cbiAgbW91c2Vtb3ZlKGU6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAodGhpcy5iZWdpbiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueCA9IGUucGFnZVg7XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLnkgPSBlLnBhZ2VZO1xuICB9XG5cbiAgbW91c2Vkb3duKGU6IE1vdXNlRXZlbnQpIHtcbiAgICB0aGlzLmludGVybnZhbEhhbmRsZSA9IHdpbmRvdy5zZXRJbnRlcnZhbCh0aGlzLm9uVGltZW91dC5iaW5kKHRoaXMpLCAxNik7XG4gICAgdGhpcy5wYXJlbnRSZWN0ID0gZ2V0UGFnZVJlY3QodGhpcy5wYXJlbnQpO1xuXG4gICAgdGhpcy5wYXJlbnQuY2xhc3NMaXN0LmFkZChSRVNJWklOR19DTEFTUyk7XG5cbiAgICB0aGlzLnBhcmVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICAgIHRoaXMucGFyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnBhcmVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlbGVhdmUuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmJlZ2luID0gbmV3IFBvaW50KGUucGFnZVgsIGUucGFnZVkpO1xuICB9XG5cbiAgbW91c2V1cChlOiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKHRoaXMuYmVnaW4gPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5maW5pc2hlZChuZXcgUG9pbnQoZS5wYWdlWCwgZS5wYWdlWSkpO1xuICB9XG5cbiAgbW91c2VsZWF2ZShlOiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKHRoaXMuYmVnaW4gPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5maW5pc2hlZChuZXcgUG9pbnQoZS5wYWdlWCwgZS5wYWdlWSkpO1xuICB9XG5cbiAgZmluaXNoZWQoZW5kOiBQb2ludCkge1xuICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuaW50ZXJudmFsSGFuZGxlKTtcblxuICAgIHRoaXMucGFyZW50LmNsYXNzTGlzdC5yZW1vdmUoUkVTSVpJTkdfQ0xBU1MpO1xuXG4gICAgdGhpcy5wYXJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnBhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNldXAuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5wYXJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZWxlYXZlLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uID0gZW5kO1xuICAgIHRoaXMub25UaW1lb3V0KCk7XG4gICAgdGhpcy5iZWdpbiA9IG51bGw7XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uID0gbmV3IFBvaW50KDAsIDApO1xuICAgIHRoaXMubGFzdE1vdmVTZW50ID0gbmV3IFBvaW50KDAsIDApO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgUG9pbnQgfSBmcm9tIFwiLi4vc2NhbGUvcG9pbnQudHNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBEcmFnUmFuZ2Uge1xuICBiZWdpbjogUG9pbnQ7XG4gIGVuZDogUG9pbnQ7XG59XG5cbmV4cG9ydCBjb25zdCBEUkFHX1JBTkdFX0VWRU5UID0gXCJkcmFncmFuZ2VcIjtcblxuLyoqIE1vdXNlTW92ZSB3YXRjaGVzIG1vdXNlIGV2ZW50cyBmb3IgYSBnaXZlbiBIVE1MRWxlbWVudCBhbmQgZW1pdHNcbiAqIGV2ZW50cyBhcm91bmQgZHJhZ2dpbmcuXG4gKlxuICogVGhlIGVtaXR0ZWQgZXZlbnQgaXMgXCJkcmFncmFuZ2VcIiBhbmQgaXMgYSBDdXN0b21FdmVudDxEcmFnUmFuZ2U+LlxuICpcbiAqIE9uY2UgdGhlIG1vdXNlIGlzIHByZXNzZWQgZG93biBpbiB0aGUgSFRNTEVsZW1lbnQgYW4gZXZlbnQgd2lsbCBiZVxuICogZW1pdHRlZCBwZXJpb2RpY2FsbHkgYXMgdGhlIG1vdXNlIG1vdmVzLlxuICpcbiAqIE9uY2UgdGhlIG1vdXNlIGlzIHJlbGVhc2VkLCBvciBleGl0cyB0aGUgSFRNTEVsZW1lbnQgb25lIGxhc3QgZXZlbnRcbiAqIGlzIGVtaXR0ZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBNb3VzZU1vdmUge1xuICBiZWdpbjogUG9pbnQgfCBudWxsID0gbnVsbDtcbiAgY3VycmVudE1vdmVMb2NhdGlvbjogUG9pbnQgPSBuZXcgUG9pbnQoMCwgMCk7XG4gIGxhc3RNb3ZlU2VudDogUG9pbnQgPSBuZXcgUG9pbnQoMCwgMCk7XG4gIGVsZTogSFRNTEVsZW1lbnQ7XG4gIGludGVybnZhbEhhbmRsZTogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihlbGU6IEhUTUxFbGVtZW50KSB7XG4gICAgdGhpcy5lbGUgPSBlbGU7XG4gICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZWRvd24uYmluZCh0aGlzKSk7XG4gICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZWxlYXZlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgZGV0YWNoKCkge1xuICAgIHRoaXMuZWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5lbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlZG93bi5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmVsZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNldXAuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5lbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZWxlYXZlLmJpbmQodGhpcykpO1xuICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuaW50ZXJudmFsSGFuZGxlKTtcbiAgfVxuXG4gIG9uVGltZW91dCgpIHtcbiAgICBpZiAoIXRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi5lcXVhbCh0aGlzLmxhc3RNb3ZlU2VudCkpIHtcbiAgICAgIHRoaXMuZWxlLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudDxEcmFnUmFuZ2U+KERSQUdfUkFOR0VfRVZFTlQsIHtcbiAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgIGJlZ2luOiB0aGlzLmJlZ2luIS5kdXAoKSxcbiAgICAgICAgICAgIGVuZDogdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLmR1cCgpLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgICAgdGhpcy5sYXN0TW92ZVNlbnQuc2V0KHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbik7XG4gICAgfVxuICB9XG5cbiAgbW91c2Vtb3ZlKGU6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAodGhpcy5iZWdpbiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueCA9IGUub2Zmc2V0WDtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueSA9IGUub2Zmc2V0WTtcbiAgfVxuXG4gIG1vdXNlZG93bihlOiBNb3VzZUV2ZW50KSB7XG4gICAgdGhpcy5pbnRlcm52YWxIYW5kbGUgPSB3aW5kb3cuc2V0SW50ZXJ2YWwodGhpcy5vblRpbWVvdXQuYmluZCh0aGlzKSwgMTYpO1xuICAgIHRoaXMuYmVnaW4gPSBuZXcgUG9pbnQoZS5vZmZzZXRYLCBlLm9mZnNldFkpO1xuICB9XG5cbiAgbW91c2V1cChlOiBNb3VzZUV2ZW50KSB7XG4gICAgdGhpcy5maW5pc2hlZChuZXcgUG9pbnQoZS5vZmZzZXRYLCBlLm9mZnNldFkpKTtcbiAgfVxuXG4gIG1vdXNlbGVhdmUoZTogTW91c2VFdmVudCkge1xuICAgIGlmICh0aGlzLmJlZ2luID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZmluaXNoZWQobmV3IFBvaW50KGUub2Zmc2V0WCwgZS5vZmZzZXRZKSk7XG4gIH1cblxuICBmaW5pc2hlZChlbmQ6IFBvaW50KSB7XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcm52YWxIYW5kbGUpO1xuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbiA9IGVuZDtcbiAgICB0aGlzLm9uVGltZW91dCgpO1xuICAgIHRoaXMuYmVnaW4gPSBudWxsO1xuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbiA9IG5ldyBQb2ludCgwLCAwKTtcbiAgICB0aGlzLmxhc3RNb3ZlU2VudCA9IG5ldyBQb2ludCgwLCAwKTtcbiAgfVxufVxuIiwgImV4cG9ydCBjb25zdCBNSU5fRElTUExBWV9SQU5HRSA9IDc7XG5cbi8qKiBSZXByZXNlbnRzIGEgcmFuZ2Ugb2YgZGF5cyBvdmVyIHdoaWNoIHRvIGRpc3BsYXkgYSB6b29tZWQgaW4gdmlldywgdXNpbmdcbiAqIHRoZSBoYWxmLW9wZW4gaW50ZXJ2YWwgW2JlZ2luLCBlbmQpLlxuICovXG5leHBvcnQgY2xhc3MgRGlzcGxheVJhbmdlIHtcbiAgcHJpdmF0ZSBfYmVnaW46IG51bWJlcjtcbiAgcHJpdmF0ZSBfZW5kOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoYmVnaW46IG51bWJlciwgZW5kOiBudW1iZXIpIHtcbiAgICB0aGlzLl9iZWdpbiA9IGJlZ2luO1xuICAgIHRoaXMuX2VuZCA9IGVuZDtcbiAgICBpZiAodGhpcy5fYmVnaW4gPiB0aGlzLl9lbmQpIHtcbiAgICAgIFt0aGlzLl9lbmQsIHRoaXMuX2JlZ2luXSA9IFt0aGlzLl9iZWdpbiwgdGhpcy5fZW5kXTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2VuZCAtIHRoaXMuX2JlZ2luIDwgTUlOX0RJU1BMQVlfUkFOR0UpIHtcbiAgICAgIHRoaXMuX2VuZCA9IHRoaXMuX2JlZ2luICsgTUlOX0RJU1BMQVlfUkFOR0U7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGluKHg6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIHJldHVybiB4ID49IHRoaXMuX2JlZ2luICYmIHggPD0gdGhpcy5fZW5kO1xuICB9XG5cbiAgcHVibGljIGdldCBiZWdpbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9iZWdpbjtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgZW5kKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2VuZDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgcmFuZ2VJbkRheXMoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fZW5kIC0gdGhpcy5fYmVnaW47XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBEaXJlY3RlZEVkZ2UsIEVkZ2VzIH0gZnJvbSBcIi4uLy4uL2RhZy9kYWdcIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyBTcGFuIH0gZnJvbSBcIi4uLy4uL3NsYWNrL3NsYWNrXCI7XG5pbXBvcnQgeyBDaGFydCwgVGFzaywgVGFza3MsIHZhbGlkYXRlQ2hhcnQgfSBmcm9tIFwiLi4vY2hhcnRcIjtcblxuZXhwb3J0IGludGVyZmFjZSBDaGFydExpa2Uge1xuICBWZXJ0aWNlczogVGFza3M7XG4gIEVkZ2VzOiBFZGdlcztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBGaWx0ZXJSZXN1bHQge1xuICBjaGFydExpa2U6IENoYXJ0TGlrZTtcbiAgZGlzcGxheU9yZGVyOiBudW1iZXJbXTtcbiAgaGlnaGxpZ2h0ZWRUYXNrczogbnVtYmVyW107XG4gIHNwYW5zOiBTcGFuW107XG4gIGxhYmVsczogc3RyaW5nW107XG59XG5cbmV4cG9ydCB0eXBlIEZpbHRlckZ1bmMgPSAodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4gYm9vbGVhbjtcblxuZXhwb3J0IGNvbnN0IGZpbHRlciA9IChcbiAgY2hhcnQ6IENoYXJ0LFxuICBmaWx0ZXJGdW5jOiBGaWx0ZXJGdW5jIHwgbnVsbCxcbiAgaGlnaGxpZ2h0ZWRUYXNrczogbnVtYmVyW10sXG4gIHNwYW5zOiBTcGFuW10sXG4gIGxhYmVsczogc3RyaW5nW11cbik6IFJlc3VsdDxGaWx0ZXJSZXN1bHQ+ID0+IHtcbiAgY29uc3QgdnJldCA9IHZhbGlkYXRlQ2hhcnQoY2hhcnQpO1xuICBpZiAoIXZyZXQub2spIHtcbiAgICByZXR1cm4gdnJldDtcbiAgfVxuICBjb25zdCB0b3BvbG9naWNhbE9yZGVyID0gdnJldC52YWx1ZTtcbiAgaWYgKGZpbHRlckZ1bmMgPT09IG51bGwpIHtcbiAgICByZXR1cm4gb2soe1xuICAgICAgY2hhcnRMaWtlOiBjaGFydCxcbiAgICAgIGRpc3BsYXlPcmRlcjogdnJldC52YWx1ZSxcbiAgICAgIGhpZ2hsaWdodGVkVGFza3M6IGhpZ2hsaWdodGVkVGFza3MsXG4gICAgICBzcGFucyxcbiAgICAgIGxhYmVscyxcbiAgICB9KTtcbiAgfVxuICBjb25zdCB0YXNrczogVGFza3MgPSBbXTtcbiAgY29uc3QgZWRnZXM6IEVkZ2VzID0gW107XG4gIGNvbnN0IGRpc3BsYXlPcmRlcjogbnVtYmVyW10gPSBbXTtcbiAgY29uc3QgZmlsdGVyZWRTcGFuczogU3BhbltdID0gW107XG4gIGNvbnN0IGZpbHRlcmVkTGFiZWxzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIGNvbnN0IGZyb21PcmlnaW5hbFRvTmV3SW5kZXg6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCk7XG5cbiAgLy8gRmlyc3QgZmlsdGVyIHRoZSB0YXNrcy5cbiAgY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgb3JpZ2luYWxJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgaWYgKGZpbHRlckZ1bmModGFzaywgb3JpZ2luYWxJbmRleCkpIHtcbiAgICAgIHRhc2tzLnB1c2godGFzayk7XG4gICAgICBmaWx0ZXJlZFNwYW5zLnB1c2goc3BhbnNbb3JpZ2luYWxJbmRleF0pO1xuICAgICAgZmlsdGVyZWRMYWJlbHMucHVzaChsYWJlbHNbb3JpZ2luYWxJbmRleF0pO1xuICAgICAgY29uc3QgbmV3SW5kZXggPSB0YXNrcy5sZW5ndGggLSAxO1xuICAgICAgZnJvbU9yaWdpbmFsVG9OZXdJbmRleC5zZXQob3JpZ2luYWxJbmRleCwgbmV3SW5kZXgpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gTm93IGZpbHRlciB0aGUgZWRnZXMgd2hpbGUgYWxzbyByZXdyaXRpbmcgdGhlbS5cbiAgY2hhcnQuRWRnZXMuZm9yRWFjaCgoZGlyZWN0ZWRFZGdlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICBpZiAoXG4gICAgICAhZnJvbU9yaWdpbmFsVG9OZXdJbmRleC5oYXMoZGlyZWN0ZWRFZGdlLmkpIHx8XG4gICAgICAhZnJvbU9yaWdpbmFsVG9OZXdJbmRleC5oYXMoZGlyZWN0ZWRFZGdlLmopXG4gICAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGVkZ2VzLnB1c2goXG4gICAgICBuZXcgRGlyZWN0ZWRFZGdlKFxuICAgICAgICBmcm9tT3JpZ2luYWxUb05ld0luZGV4LmdldChkaXJlY3RlZEVkZ2UuaSksXG4gICAgICAgIGZyb21PcmlnaW5hbFRvTmV3SW5kZXguZ2V0KGRpcmVjdGVkRWRnZS5qKVxuICAgICAgKVxuICAgICk7XG4gIH0pO1xuXG4gIC8vIE5vdyBmaWx0ZXIgYW5kIHJlaW5kZXggdGhlIHRvcG9sb2dpY2FsL2Rpc3BsYXkgb3JkZXIuXG4gIHRvcG9sb2dpY2FsT3JkZXIuZm9yRWFjaCgob3JpZ2luYWxUYXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHRhc2s6IFRhc2sgPSBjaGFydC5WZXJ0aWNlc1tvcmlnaW5hbFRhc2tJbmRleF07XG4gICAgaWYgKCFmaWx0ZXJGdW5jKHRhc2ssIG9yaWdpbmFsVGFza0luZGV4KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkaXNwbGF5T3JkZXIucHVzaChmcm9tT3JpZ2luYWxUb05ld0luZGV4LmdldChvcmlnaW5hbFRhc2tJbmRleCkhKTtcbiAgfSk7XG5cbiAgLy8gUmUtaW5kZXggaGlnaGxpZ2h0ZWQgdGFza3MuXG4gIGNvbnN0IHVwZGF0ZWRIaWdobGlnaHRlZFRhc2tzID0gaGlnaGxpZ2h0ZWRUYXNrcy5tYXAoXG4gICAgKG9yaWdpbmFsVGFza0luZGV4OiBudW1iZXIpOiBudW1iZXIgPT5cbiAgICAgIGZyb21PcmlnaW5hbFRvTmV3SW5kZXguZ2V0KG9yaWdpbmFsVGFza0luZGV4KSFcbiAgKTtcblxuICByZXR1cm4gb2soe1xuICAgIGNoYXJ0TGlrZToge1xuICAgICAgRWRnZXM6IGVkZ2VzLFxuICAgICAgVmVydGljZXM6IHRhc2tzLFxuICAgIH0sXG4gICAgZGlzcGxheU9yZGVyOiBkaXNwbGF5T3JkZXIsXG4gICAgaGlnaGxpZ2h0ZWRUYXNrczogdXBkYXRlZEhpZ2hsaWdodGVkVGFza3MsXG4gICAgc3BhbnM6IGZpbHRlcmVkU3BhbnMsXG4gICAgbGFiZWxzOiBmaWx0ZXJlZExhYmVscyxcbiAgfSk7XG59O1xuIiwgImltcG9ydCB7IGNsYW1wIH0gZnJvbSBcIi4uLy4uL21ldHJpY3MvcmFuZ2UudHNcIjtcbmltcG9ydCB7IFJlbmRlck9wdGlvbnMgfSBmcm9tIFwiLi4vcmVuZGVyZXIudHNcIjtcbmltcG9ydCB7IFBvaW50IH0gZnJvbSBcIi4vcG9pbnQudHNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBEYXlSb3cge1xuICBkYXk6IG51bWJlcjtcbiAgcm93OiBudW1iZXI7XG59XG5cbi8qKiBGZWF0dXJlcyBvZiB0aGUgY2hhcnQgd2UgY2FuIGFzayBmb3IgY29vcmRpbmF0ZXMgb2YsIHdoZXJlIHRoZSB2YWx1ZSByZXR1cm5lZCBpc1xuICogdGhlIHRvcCBsZWZ0IGNvb3JkaW5hdGUgb2YgdGhlIGZlYXR1cmUuXG4gKi9cbmV4cG9ydCBlbnVtIEZlYXR1cmUge1xuICB0YXNrTGluZVN0YXJ0LFxuICB0ZXh0U3RhcnQsXG4gIGdyb3VwVGV4dFN0YXJ0LFxuICBwZXJjZW50U3RhcnQsXG4gIHZlcnRpY2FsQXJyb3dEZXN0VG9wLFxuICB2ZXJ0aWNhbEFycm93RGVzdEJvdHRvbSxcbiAgaG9yaXpvbnRhbEFycm93RGVzdCxcbiAgdmVydGljYWxBcnJvd1N0YXJ0LFxuICBob3Jpem9udGFsQXJyb3dTdGFydCxcbiAgdmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZVRvcCxcbiAgdmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZUJvdHRvbSxcbiAgaG9yaXpvbnRhbEFycm93RGVzdFRvTWlsZXN0b25lLFxuICB2ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lVG9wLFxuICB2ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lQm90dG9tLFxuICBob3Jpem9udGFsQXJyb3dTdGFydEZyb21NaWxlc3RvbmUsXG4gIGdyb3VwRW52ZWxvcGVTdGFydCxcbiAgdGFza0VudmVsb3BlVG9wLFxuXG4gIGRpc3BsYXlSYW5nZVRvcCxcbiAgdGFza1Jvd0JvdHRvbSxcblxuICB0aW1lTWFya1N0YXJ0LFxuICB0aW1lTWFya0VuZCxcbiAgdGltZVRleHRTdGFydCxcblxuICBncm91cFRpdGxlVGV4dFN0YXJ0LFxuXG4gIHRhc2tzQ2xpcFJlY3RPcmlnaW4sXG4gIGdyb3VwQnlPcmlnaW4sXG59XG5cbi8qKiBTaXplcyBvZiBmZWF0dXJlcyBvZiBhIHJlbmRlcmVkIGNoYXJ0LiAqL1xuZXhwb3J0IGVudW0gTWV0cmljIHtcbiAgdGFza0xpbmVIZWlnaHQsXG4gIHBlcmNlbnRIZWlnaHQsXG4gIGFycm93SGVhZEhlaWdodCxcbiAgYXJyb3dIZWFkV2lkdGgsXG4gIG1pbGVzdG9uZURpYW1ldGVyLFxuICBsaW5lRGFzaExpbmUsXG4gIGxpbmVEYXNoR2FwLFxuICB0ZXh0WE9mZnNldCxcbiAgcm93SGVpZ2h0LFxufVxuXG4vKiogTWFrZXMgYSBudW1iZXIgb2RkLCBhZGRzIG9uZSBpZiBldmVuLiAqL1xuY29uc3QgbWFrZU9kZCA9IChuOiBudW1iZXIpOiBudW1iZXIgPT4ge1xuICBpZiAobiAlIDIgPT09IDApIHtcbiAgICByZXR1cm4gbiArIDE7XG4gIH1cbiAgcmV0dXJuIG47XG59O1xuXG4vKiogU2NhbGUgY29uc29saWRhdGVzIGFsbCBjYWxjdWxhdGlvbnMgYXJvdW5kIHJlbmRlcmluZyBhIGNoYXJ0IG9udG8gYSBzdXJmYWNlLiAqL1xuZXhwb3J0IGNsYXNzIFNjYWxlIHtcbiAgcHJpdmF0ZSBkYXlXaWR0aFB4OiBudW1iZXI7XG4gIHByaXZhdGUgcm93SGVpZ2h0UHg6IG51bWJlcjtcbiAgcHJpdmF0ZSBibG9ja1NpemVQeDogbnVtYmVyO1xuICBwcml2YXRlIHRhc2tIZWlnaHRQeDogbnVtYmVyO1xuICBwcml2YXRlIGxpbmVXaWR0aFB4OiBudW1iZXI7XG4gIHByaXZhdGUgbWFyZ2luU2l6ZVB4OiBudW1iZXI7XG4gIHByaXZhdGUgdGltZWxpbmVIZWlnaHRQeDogbnVtYmVyO1xuICBwcml2YXRlIG9yaWdpbjogUG9pbnQ7XG4gIHByaXZhdGUgdG90YWxOdW1iZXJPZkRheXM6IG51bWJlcjtcbiAgcHJpdmF0ZSBncm91cEJ5Q29sdW1uV2lkdGhQeDogbnVtYmVyO1xuXG4gIHByaXZhdGUgdGltZWxpbmVPcmlnaW46IFBvaW50O1xuICBwcml2YXRlIHRhc2tzT3JpZ2luOiBQb2ludDtcbiAgcHJpdmF0ZSBncm91cEJ5T3JpZ2luOiBQb2ludDtcbiAgcHJpdmF0ZSB0YXNrc0NsaXBSZWN0T3JpZ2luOiBQb2ludDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICAgIGNhbnZhc1dpZHRoUHg6IG51bWJlcixcbiAgICB0b3RhbE51bWJlck9mRGF5czogbnVtYmVyLFxuICAgIG1heEdyb3VwTmFtZUxlbmd0aDogbnVtYmVyID0gMFxuICApIHtcbiAgICB0aGlzLnRvdGFsTnVtYmVyT2ZEYXlzID0gdG90YWxOdW1iZXJPZkRheXM7XG4gICAgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCA9IG1heEdyb3VwTmFtZUxlbmd0aCAqIG9wdHMuZm9udFNpemVQeDtcblxuICAgIHRoaXMuYmxvY2tTaXplUHggPSBNYXRoLmZsb29yKG9wdHMuZm9udFNpemVQeCAvIDMpO1xuICAgIHRoaXMudGFza0hlaWdodFB4ID0gbWFrZU9kZChNYXRoLmZsb29yKCh0aGlzLmJsb2NrU2l6ZVB4ICogMykgLyA0KSk7XG4gICAgdGhpcy5saW5lV2lkdGhQeCA9IG1ha2VPZGQoTWF0aC5mbG9vcih0aGlzLnRhc2tIZWlnaHRQeCAvIDMpKTtcbiAgICBjb25zdCBtaWxlc3RvbmVSYWRpdXMgPSBNYXRoLmNlaWwodGhpcy50YXNrSGVpZ2h0UHggLyAyKSArIHRoaXMubGluZVdpZHRoUHg7XG4gICAgdGhpcy5tYXJnaW5TaXplUHggPSBtaWxlc3RvbmVSYWRpdXM7XG4gICAgdGhpcy50aW1lbGluZUhlaWdodFB4ID0gb3B0cy5oYXNUaW1lbGluZVxuICAgICAgPyBNYXRoLmNlaWwoKG9wdHMuZm9udFNpemVQeCAqIDQpIC8gMylcbiAgICAgIDogMDtcblxuICAgIHRoaXMudGltZWxpbmVPcmlnaW4gPSBuZXcgUG9pbnQobWlsZXN0b25lUmFkaXVzLCAwKTtcbiAgICB0aGlzLmdyb3VwQnlPcmlnaW4gPSBuZXcgUG9pbnQoMCwgbWlsZXN0b25lUmFkaXVzICsgdGhpcy50aW1lbGluZUhlaWdodFB4KTtcblxuICAgIGxldCBiZWdpbk9mZnNldCA9IDA7XG4gICAgaWYgKG9wdHMuZGlzcGxheVJhbmdlID09PSBudWxsIHx8IG9wdHMuZGlzcGxheVJhbmdlVXNhZ2UgPT09IFwiaGlnaGxpZ2h0XCIpIHtcbiAgICAgIC8vIERvIG5vdCBmb3JjZSBkYXlXaWR0aFB4IHRvIGFuIGludGVnZXIsIGl0IGNvdWxkIGdvIHRvIDAgYW5kIGNhdXNlIGFsbFxuICAgICAgLy8gdGFza3MgdG8gYmUgcmVuZGVyZWQgYXQgMCB3aWR0aC5cbiAgICAgIHRoaXMuZGF5V2lkdGhQeCA9XG4gICAgICAgIChjYW52YXNXaWR0aFB4IC0gdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCAtIDIgKiB0aGlzLm1hcmdpblNpemVQeCkgL1xuICAgICAgICB0b3RhbE51bWJlck9mRGF5cztcbiAgICAgIHRoaXMub3JpZ2luID0gbmV3IFBvaW50KDAsIDApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTaG91bGQgd2Ugc2V0IHgtbWFyZ2lucyB0byAwIGlmIGEgU3ViUmFuZ2UgaXMgcmVxdWVzdGVkP1xuICAgICAgLy8gT3Igc2hvdWxkIHdlIHRvdGFsbHkgZHJvcCBhbGwgbWFyZ2lucyBmcm9tIGhlcmUgYW5kIGp1c3QgdXNlXG4gICAgICAvLyBDU1MgbWFyZ2lucyBvbiB0aGUgY2FudmFzIGVsZW1lbnQ/XG4gICAgICB0aGlzLmRheVdpZHRoUHggPVxuICAgICAgICAoY2FudmFzV2lkdGhQeCAtIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHggLSAyICogdGhpcy5tYXJnaW5TaXplUHgpIC9cbiAgICAgICAgb3B0cy5kaXNwbGF5UmFuZ2UucmFuZ2VJbkRheXM7XG4gICAgICBiZWdpbk9mZnNldCA9IE1hdGguZmxvb3IoXG4gICAgICAgIHRoaXMuZGF5V2lkdGhQeCAqIG9wdHMuZGlzcGxheVJhbmdlLmJlZ2luICsgdGhpcy5tYXJnaW5TaXplUHhcbiAgICAgICk7XG4gICAgICB0aGlzLm9yaWdpbiA9IG5ldyBQb2ludCgtYmVnaW5PZmZzZXQgKyB0aGlzLm1hcmdpblNpemVQeCwgMCk7XG4gICAgfVxuXG4gICAgdGhpcy50YXNrc09yaWdpbiA9IG5ldyBQb2ludChcbiAgICAgIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHggLSBiZWdpbk9mZnNldCArIG1pbGVzdG9uZVJhZGl1cyxcbiAgICAgIHRoaXMudGltZWxpbmVIZWlnaHRQeCArIG1pbGVzdG9uZVJhZGl1c1xuICAgICk7XG5cbiAgICB0aGlzLnRhc2tzQ2xpcFJlY3RPcmlnaW4gPSBuZXcgUG9pbnQoXG4gICAgICB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4LFxuICAgICAgdGhpcy50aW1lbGluZUhlaWdodFB4XG4gICAgKTtcblxuICAgIGlmIChvcHRzLmhhc1RleHQpIHtcbiAgICAgIHRoaXMucm93SGVpZ2h0UHggPSA2ICogdGhpcy5ibG9ja1NpemVQeDsgLy8gVGhpcyBtaWdodCBhbHNvIGJlIGAoY2FudmFzSGVpZ2h0UHggLSAyICogb3B0cy5tYXJnaW5TaXplUHgpIC8gbnVtYmVyU3dpbUxhbmVzYCBpZiBoZWlnaHQgaXMgc3VwcGxpZWQ/XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucm93SGVpZ2h0UHggPSAxLjEgKiB0aGlzLmJsb2NrU2l6ZVB4O1xuICAgIH1cbiAgfVxuXG4gIC8qKiBUaGUgaGVpZ2h0IG9mIHRoZSBjaGFydC4gTm90ZSB0aGF0IGl0J3Mgbm90IGNvbnN0cmFpbmVkIGJ5IHRoZSBjYW52YXMuICovXG4gIHB1YmxpYyBoZWlnaHQobWF4Um93czogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gKFxuICAgICAgbWF4Um93cyAqIHRoaXMucm93SGVpZ2h0UHggKyB0aGlzLnRpbWVsaW5lSGVpZ2h0UHggKyAyICogdGhpcy5tYXJnaW5TaXplUHhcbiAgICApO1xuICB9XG5cbiAgcHVibGljIGRheVJvd0Zyb21Qb2ludChwb2ludDogUG9pbnQpOiBEYXlSb3cge1xuICAgIC8vIFRoaXMgc2hvdWxkIGFsc28gY2xhbXAgdGhlIHJldHVybmVkICd4JyB2YWx1ZSB0byBbMCwgbWF4Um93cykuXG4gICAgcmV0dXJuIHtcbiAgICAgIGRheTogY2xhbXAoXG4gICAgICAgIE1hdGguZmxvb3IoXG4gICAgICAgICAgKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvICogcG9pbnQueCAtXG4gICAgICAgICAgICB0aGlzLm9yaWdpbi54IC1cbiAgICAgICAgICAgIHRoaXMubWFyZ2luU2l6ZVB4IC1cbiAgICAgICAgICAgIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHgpIC9cbiAgICAgICAgICAgIHRoaXMuZGF5V2lkdGhQeFxuICAgICAgICApLFxuICAgICAgICAwLFxuICAgICAgICB0aGlzLnRvdGFsTnVtYmVyT2ZEYXlzXG4gICAgICApLFxuICAgICAgcm93OiBNYXRoLmZsb29yKFxuICAgICAgICAod2luZG93LmRldmljZVBpeGVsUmF0aW8gKiBwb2ludC55IC1cbiAgICAgICAgICB0aGlzLm9yaWdpbi55IC1cbiAgICAgICAgICB0aGlzLm1hcmdpblNpemVQeCAtXG4gICAgICAgICAgdGhpcy50aW1lbGluZUhlaWdodFB4KSAvXG4gICAgICAgICAgdGhpcy5yb3dIZWlnaHRQeFxuICAgICAgKSxcbiAgICB9O1xuICB9XG5cbiAgLyoqIFRoZSB0b3AgbGVmdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveCBmb3IgYSBzaW5nbGUgdGFzay4gKi9cbiAgcHJpdmF0ZSB0YXNrUm93RW52ZWxvcGVTdGFydChyb3c6IG51bWJlciwgZGF5OiBudW1iZXIpOiBQb2ludCB7XG4gICAgcmV0dXJuIHRoaXMub3JpZ2luLnN1bShcbiAgICAgIG5ldyBQb2ludChcbiAgICAgICAgTWF0aC5mbG9vcihcbiAgICAgICAgICBkYXkgKiB0aGlzLmRheVdpZHRoUHggKyB0aGlzLm1hcmdpblNpemVQeCArIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHhcbiAgICAgICAgKSxcbiAgICAgICAgTWF0aC5mbG9vcihcbiAgICAgICAgICByb3cgKiB0aGlzLnJvd0hlaWdodFB4ICsgdGhpcy5tYXJnaW5TaXplUHggKyB0aGlzLnRpbWVsaW5lSGVpZ2h0UHhcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gIHByaXZhdGUgZ3JvdXBSb3dFbnZlbG9wZVN0YXJ0KHJvdzogbnVtYmVyLCBkYXk6IG51bWJlcik6IFBvaW50IHtcbiAgICByZXR1cm4gdGhpcy5ncm91cEJ5T3JpZ2luLnN1bShcbiAgICAgIG5ldyBQb2ludChcbiAgICAgICAgMCxcbiAgICAgICAgcm93ICogdGhpcy5yb3dIZWlnaHRQeCArIHRoaXMubWFyZ2luU2l6ZVB4ICsgdGhpcy50aW1lbGluZUhlaWdodFB4XG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgZ3JvdXBIZWFkZXJTdGFydCgpOiBQb2ludCB7XG4gICAgcmV0dXJuIHRoaXMub3JpZ2luLnN1bShuZXcgUG9pbnQodGhpcy5tYXJnaW5TaXplUHgsIHRoaXMubWFyZ2luU2l6ZVB4KSk7XG4gIH1cblxuICBwcml2YXRlIHRpbWVFbnZlbG9wZVN0YXJ0KGRheTogbnVtYmVyKTogUG9pbnQge1xuICAgIHJldHVybiB0aGlzLm9yaWdpbi5zdW0oXG4gICAgICBuZXcgUG9pbnQoXG4gICAgICAgIGRheSAqIHRoaXMuZGF5V2lkdGhQeCArIHRoaXMubWFyZ2luU2l6ZVB4ICsgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCxcbiAgICAgICAgdGhpcy5tYXJnaW5TaXplUHhcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgLyoqIFJldHVybnMgdGhlIGNvb3JkaW5hdGUgb2YgdGhlIGl0ZW0gKi9cbiAgZmVhdHVyZShyb3c6IG51bWJlciwgZGF5OiBudW1iZXIsIGNvb3JkOiBGZWF0dXJlKTogUG9pbnQge1xuICAgIHN3aXRjaCAoY29vcmQpIHtcbiAgICAgIGNhc2UgRmVhdHVyZS50YXNrTGluZVN0YXJ0OlxuICAgICAgY2FzZSBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9wOlxuICAgICAgY2FzZSBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza1Jvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpLmFkZChcbiAgICAgICAgICAwLFxuICAgICAgICAgIHRoaXMucm93SGVpZ2h0UHggLSB0aGlzLmJsb2NrU2l6ZVB4XG4gICAgICAgICk7XG5cbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdEJvdHRvbTpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza1Jvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpLmFkZCgwLCB0aGlzLnJvd0hlaWdodFB4KTtcbiAgICAgIGNhc2UgRmVhdHVyZS50ZXh0U3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KS5hZGQoXG4gICAgICAgICAgdGhpcy5ibG9ja1NpemVQeCxcbiAgICAgICAgICB0aGlzLmJsb2NrU2l6ZVB4XG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUuZ3JvdXBUZXh0U3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLmdyb3VwUm93RW52ZWxvcGVTdGFydChyb3csIGRheSkuYWRkKFxuICAgICAgICAgIHRoaXMuYmxvY2tTaXplUHgsXG4gICAgICAgICAgdGhpcy5ibG9ja1NpemVQeFxuICAgICAgICApO1xuICAgICAgY2FzZSBGZWF0dXJlLnBlcmNlbnRTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza1Jvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpLmFkZChcbiAgICAgICAgICAwLFxuICAgICAgICAgIHRoaXMucm93SGVpZ2h0UHggLSB0aGlzLmxpbmVXaWR0aFB4XG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93RGVzdDpcbiAgICAgIGNhc2UgRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza1Jvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpLmFkZChcbiAgICAgICAgICAwLFxuICAgICAgICAgIE1hdGguZmxvb3IodGhpcy5yb3dIZWlnaHRQeCAtIDAuNSAqIHRoaXMuYmxvY2tTaXplUHgpIC0gMVxuICAgICAgICApO1xuICAgICAgY2FzZSBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9NaWxlc3RvbmVUb3A6XG4gICAgICAgIHJldHVybiB0aGlzLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb3ApLmFkZChcbiAgICAgICAgICAwLFxuICAgICAgICAgIC0xICogdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKVxuICAgICAgICApO1xuICAgICAgY2FzZSBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9NaWxlc3RvbmVCb3R0b206XG4gICAgICAgIHJldHVybiB0aGlzLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb3ApLmFkZChcbiAgICAgICAgICAwLFxuICAgICAgICAgIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlcilcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dEZXN0VG9NaWxlc3RvbmU6XG4gICAgICAgIHJldHVybiB0aGlzLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93RGVzdCkuYWRkKFxuICAgICAgICAgIC0xICogdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKSxcbiAgICAgICAgICAtMSAqIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlcilcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lVG9wOlxuICAgICAgICByZXR1cm4gdGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydCkuYWRkKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgLTEgKiB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpXG4gICAgICAgICk7XG5cbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lQm90dG9tOlxuICAgICAgICByZXR1cm4gdGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydCkuYWRkKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKVxuICAgICAgICApO1xuICAgICAgY2FzZSBGZWF0dXJlLmhvcml6b250YWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZTpcbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dTdGFydCkuYWRkKFxuICAgICAgICAgIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlciksXG4gICAgICAgICAgMFxuICAgICAgICApO1xuICAgICAgY2FzZSBGZWF0dXJlLnRhc2tFbnZlbG9wZVRvcDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza1Jvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpO1xuICAgICAgY2FzZSBGZWF0dXJlLmdyb3VwRW52ZWxvcGVTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KTtcbiAgICAgIGNhc2UgRmVhdHVyZS50aW1lTWFya1N0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy50aW1lRW52ZWxvcGVTdGFydChkYXkpO1xuICAgICAgY2FzZSBGZWF0dXJlLnRpbWVNYXJrRW5kOlxuICAgICAgICByZXR1cm4gdGhpcy50aW1lRW52ZWxvcGVTdGFydChkYXkpLmFkZCgwLCB0aGlzLnJvd0hlaWdodFB4ICogKHJvdyArIDEpKTtcbiAgICAgIGNhc2UgRmVhdHVyZS50aW1lVGV4dFN0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy50aW1lRW52ZWxvcGVTdGFydChkYXkpLmFkZCh0aGlzLmJsb2NrU2l6ZVB4LCAwKTtcblxuICAgICAgY2FzZSBGZWF0dXJlLmdyb3VwVGl0bGVUZXh0U3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLmdyb3VwSGVhZGVyU3RhcnQoKS5hZGQodGhpcy5ibG9ja1NpemVQeCwgMCk7XG4gICAgICBjYXNlIEZlYXR1cmUuZGlzcGxheVJhbmdlVG9wOlxuICAgICAgICByZXR1cm4gdGhpcy50aW1lRW52ZWxvcGVTdGFydChkYXkpO1xuICAgICAgY2FzZSBGZWF0dXJlLnRhc2tSb3dCb3R0b206XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdyArIDEsIGRheSk7XG4gICAgICBjYXNlIEZlYXR1cmUudGFza3NDbGlwUmVjdE9yaWdpbjpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza3NDbGlwUmVjdE9yaWdpbjtcbiAgICAgIGNhc2UgRmVhdHVyZS5ncm91cEJ5T3JpZ2luOlxuICAgICAgICByZXR1cm4gdGhpcy5ncm91cEJ5T3JpZ2luO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gVGhlIGxpbmUgYmVsb3cgd2lsbCBub3QgY29tcGlsZSBpZiB5b3UgbWlzc2VkIGFuIGVudW0gaW4gdGhlIHN3aXRjaCBhYm92ZS5cbiAgICAgICAgY29vcmQgc2F0aXNmaWVzIG5ldmVyO1xuICAgICAgICByZXR1cm4gbmV3IFBvaW50KDAsIDApO1xuICAgIH1cbiAgfVxuXG4gIG1ldHJpYyhmZWF0dXJlOiBNZXRyaWMpOiBudW1iZXIge1xuICAgIHN3aXRjaCAoZmVhdHVyZSkge1xuICAgICAgY2FzZSBNZXRyaWMudGFza0xpbmVIZWlnaHQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tIZWlnaHRQeDtcbiAgICAgIGNhc2UgTWV0cmljLnBlcmNlbnRIZWlnaHQ6XG4gICAgICAgIHJldHVybiB0aGlzLmxpbmVXaWR0aFB4O1xuICAgICAgY2FzZSBNZXRyaWMuYXJyb3dIZWFkSGVpZ2h0OlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrSGVpZ2h0UHg7XG4gICAgICBjYXNlIE1ldHJpYy5hcnJvd0hlYWRXaWR0aDpcbiAgICAgICAgcmV0dXJuIE1hdGguY2VpbCh0aGlzLnRhc2tIZWlnaHRQeCk7XG4gICAgICBjYXNlIE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlcjpcbiAgICAgICAgcmV0dXJuIE1hdGguY2VpbCh0aGlzLnRhc2tIZWlnaHRQeCk7XG4gICAgICBjYXNlIE1ldHJpYy5saW5lRGFzaExpbmU6XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2NrU2l6ZVB4O1xuICAgICAgY2FzZSBNZXRyaWMubGluZURhc2hHYXA6XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2NrU2l6ZVB4O1xuICAgICAgY2FzZSBNZXRyaWMudGV4dFhPZmZzZXQ6XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2NrU2l6ZVB4O1xuICAgICAgY2FzZSBNZXRyaWMucm93SGVpZ2h0OlxuICAgICAgICByZXR1cm4gdGhpcy5yb3dIZWlnaHRQeDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIFRoZSBsaW5lIGJlbG93IHdpbGwgbm90IGNvbXBpbGUgaWYgeW91IG1pc3NlZCBhbiBlbnVtIGluIHRoZSBzd2l0Y2ggYWJvdmUuXG4gICAgICAgIGZlYXR1cmUgc2F0aXNmaWVzIG5ldmVyO1xuICAgICAgICByZXR1cm4gMC4wO1xuICAgIH1cbiAgfVxufVxuIiwgImltcG9ydCB7IFRhc2ssIHZhbGlkYXRlQ2hhcnQgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IENoYXJ0TGlrZSwgZmlsdGVyLCBGaWx0ZXJGdW5jIH0gZnJvbSBcIi4uL2NoYXJ0L2ZpbHRlci9maWx0ZXIudHNcIjtcbmltcG9ydCB7IERpcmVjdGVkRWRnZSwgVmVydGV4SW5kaWNlcyB9IGZyb20gXCIuLi9kYWcvZGFnLnRzXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhbi50c1wiO1xuaW1wb3J0IHsgUmVzb3VyY2VEZWZpbml0aW9uIH0gZnJvbSBcIi4uL3Jlc291cmNlcy9yZXNvdXJjZXMudHNcIjtcbmltcG9ydCB7IFJlc3VsdCwgb2sgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBTcGFuIH0gZnJvbSBcIi4uL3NsYWNrL3NsYWNrLnRzXCI7XG5pbXBvcnQgeyBEaXNwbGF5UmFuZ2UgfSBmcm9tIFwiLi9yYW5nZS9yYW5nZS50c1wiO1xuaW1wb3J0IHsgUG9pbnQgfSBmcm9tIFwiLi9zY2FsZS9wb2ludC50c1wiO1xuaW1wb3J0IHsgRmVhdHVyZSwgTWV0cmljLCBTY2FsZSB9IGZyb20gXCIuL3NjYWxlL3NjYWxlLnRzXCI7XG5cbnR5cGUgRGlyZWN0aW9uID0gXCJ1cFwiIHwgXCJkb3duXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29sb3JzIHtcbiAgc3VyZmFjZTogc3RyaW5nO1xuICBvblN1cmZhY2U6IHN0cmluZztcbiAgb25TdXJmYWNlTXV0ZWQ6IHN0cmluZztcbiAgb25TdXJmYWNlSGlnaGxpZ2h0OiBzdHJpbmc7XG4gIG92ZXJsYXk6IHN0cmluZztcbiAgZ3JvdXBDb2xvcjogc3RyaW5nO1xuICBoaWdobGlnaHQ6IHN0cmluZztcbn1cblxuZXhwb3J0IHR5cGUgVGFza0luZGV4VG9Sb3cgPSBNYXA8bnVtYmVyLCBudW1iZXI+O1xuXG4vKiogRnVuY3Rpb24gdXNlIHRvIHByb2R1Y2UgYSB0ZXh0IGxhYmVsIGZvciBhIHRhc2sgYW5kIGl0cyBzbGFjay4gKi9cbmV4cG9ydCB0eXBlIFRhc2tMYWJlbCA9ICh0YXNrSW5kZXg6IG51bWJlcikgPT4gc3RyaW5nO1xuXG4vKiogQ29udHJvbHMgb2YgdGhlIGRpc3BsYXlSYW5nZSBpbiBSZW5kZXJPcHRpb25zIGlzIHVzZWQuXG4gKlxuICogIFwicmVzdHJpY3RcIjogT25seSBkaXNwbGF5IHRoZSBwYXJ0cyBvZiB0aGUgY2hhcnQgdGhhdCBhcHBlYXIgaW4gdGhlIHJhbmdlLlxuICpcbiAqICBcImhpZ2hsaWdodFwiOiBEaXNwbGF5IHRoZSBmdWxsIHJhbmdlIG9mIHRoZSBkYXRhLCBidXQgaGlnaGxpZ2h0IHRoZSByYW5nZS5cbiAqL1xuZXhwb3J0IHR5cGUgRGlzcGxheVJhbmdlVXNhZ2UgPSBcInJlc3RyaWN0XCIgfCBcImhpZ2hsaWdodFwiO1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdFRhc2tMYWJlbDogVGFza0xhYmVsID0gKHRhc2tJbmRleDogbnVtYmVyKTogc3RyaW5nID0+XG4gIHRhc2tJbmRleC50b0ZpeGVkKDApO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlbmRlck9wdGlvbnMge1xuICAvKiogVGhlIHRleHQgZm9udCBzaXplLCB0aGlzIGRyaXZlcyB0aGUgc2l6ZSBvZiBhbGwgb3RoZXIgY2hhcnQgZmVhdHVyZXMuXG4gICAqICovXG4gIGZvbnRTaXplUHg6IG51bWJlcjtcblxuICAvKiogRGlzcGxheSB0ZXh0IGlmIHRydWUuICovXG4gIGhhc1RleHQ6IGJvb2xlYW47XG5cbiAgLyoqIElmIHN1cHBsaWVkIHRoZW4gb25seSB0aGUgdGFza3MgaW4gdGhlIGdpdmVuIHJhbmdlIHdpbGwgYmUgZGlzcGxheWVkLiAqL1xuICBkaXNwbGF5UmFuZ2U6IERpc3BsYXlSYW5nZSB8IG51bGw7XG5cbiAgLyoqIENvbnRyb2xzIGhvdyB0aGUgYGRpc3BsYXlSYW5nZWAgaXMgdXNlZCBpZiBzdXBwbGllZC4gKi9cbiAgZGlzcGxheVJhbmdlVXNhZ2U6IERpc3BsYXlSYW5nZVVzYWdlO1xuXG4gIC8qKiBUaGUgY29sb3IgdGhlbWUuICovXG4gIGNvbG9yczogQ29sb3JzO1xuXG4gIC8qKiBJZiB0cnVlIHRoZW4gZGlzcGxheSB0aW1lcyBhdCB0aGUgdG9wIG9mIHRoZSBjaGFydC4gKi9cbiAgaGFzVGltZWxpbmU6IGJvb2xlYW47XG5cbiAgLyoqIElmIHRydWUgdGhlbiBkaXNwbGF5IHRoZSB0YXNrIGJhcnMuICovXG4gIGhhc1Rhc2tzOiBib29sZWFuO1xuXG4gIC8qKiBJZiB0cnVlIHRoZW4gZHJhdyB2ZXJ0aWNhbCBsaW5lcyBmcm9tIHRoZSB0aW1lbGluZSBkb3duIHRvIHRhc2sgc3RhcnQgYW5kXG4gICAqIGZpbmlzaCBwb2ludHMuICovXG4gIGRyYXdUaW1lTWFya2Vyc09uVGFza3M6IGJvb2xlYW47XG5cbiAgLyoqIERyYXcgZGVwZW5kZW5jeSBlZGdlcyBiZXR3ZWVuIHRhc2tzIGlmIHRydWUuICovXG4gIGhhc0VkZ2VzOiBib29sZWFuO1xuXG4gIC8qKiBGdW5jdGlvbiB0aGF0IHByb2R1Y2VzIGRpc3BsYXkgdGV4dCBmb3IgYSBUYXNrIGFuZCBpdHMgYXNzb2NpYXRlZCBTbGFjay4gKi9cbiAgdGFza0xhYmVsOiBUYXNrTGFiZWw7XG5cbiAgLyoqIFRoZSBpbmRpY2VzIG9mIHRhc2tzIHRoYXQgc2hvdWxkIGJlIGVtcGhhc2l6ZWQgd2hlbiBkcmF3LCB0eXBpY2FsbHkgdXNlZFxuICAgKiB0byBkZW5vdGUgdGhlIGNyaXRpY2FsIHBhdGguICovXG4gIHRhc2tFbXBoYXNpemU6IG51bWJlcltdO1xuXG4gIC8qKiBGaWx0ZXIgdGhlIFRhc2tzIHRvIGJlIGRpc3BsYXllZC4gKi9cbiAgZmlsdGVyRnVuYzogRmlsdGVyRnVuYyB8IG51bGw7XG5cbiAgLyoqIEdyb3VwIHRoZSB0YXNrcyB0b2dldGhlciB2ZXJ0aWNhbGx5IGJhc2VkIG9uIHRoZSBnaXZlbiByZXNvdXJjZS4gSWYgdGhlXG4gICAqIGVtcHR5IHN0cmluZyBpcyBzdXBwbGllZCB0aGVuIGp1c3QgZGlzcGxheSBieSB0b3BvbG9naWNhbCBvcmRlci5cbiAgICovXG4gIGdyb3VwQnlSZXNvdXJjZTogc3RyaW5nO1xuXG4gIC8qKiBUYXNrIHRvIGhpZ2hsaWdodC4gKi9cbiAgaGlnaGxpZ2h0ZWRUYXNrOiBudWxsIHwgbnVtYmVyO1xufVxuXG5jb25zdCB2ZXJ0aWNhbEFycm93U3RhcnRGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbiA9IChcbiAgdGFzazogVGFzayxcbiAgZGlyZWN0aW9uOiBEaXJlY3Rpb25cbik6IEZlYXR1cmUgPT4ge1xuICBpZiAodGFzay5kdXJhdGlvbiA9PT0gMCkge1xuICAgIGlmIChkaXJlY3Rpb24gPT09IFwiZG93blwiKSB7XG4gICAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lQm90dG9tO1xuICAgIH1cbiAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lVG9wO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydDtcbiAgfVxufTtcblxuY29uc3QgdmVydGljYWxBcnJvd0Rlc3RGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbiA9IChcbiAgdGFzazogVGFzayxcbiAgZGlyZWN0aW9uOiBEaXJlY3Rpb25cbik6IEZlYXR1cmUgPT4ge1xuICBpZiAodGFzay5kdXJhdGlvbiA9PT0gMCkge1xuICAgIGlmIChkaXJlY3Rpb24gPT09IFwiZG93blwiKSB7XG4gICAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvTWlsZXN0b25lVG9wO1xuICAgIH1cbiAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvTWlsZXN0b25lQm90dG9tO1xuICB9IGVsc2Uge1xuICAgIGlmIChkaXJlY3Rpb24gPT09IFwiZG93blwiKSB7XG4gICAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvcDtcbiAgICB9XG4gICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RCb3R0b207XG4gIH1cbn07XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbmNvbnN0IGhvcml6b250YWxBcnJvd1N0YXJ0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24gPSAodGFzazogVGFzayk6IEZlYXR1cmUgPT4ge1xuICBpZiAodGFzay5kdXJhdGlvbiA9PT0gMCkge1xuICAgIHJldHVybiBGZWF0dXJlLmhvcml6b250YWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dTdGFydDtcbiAgfVxufTtcblxuY29uc3QgaG9yaXpvbnRhbEFycm93RGVzdEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uID0gKHRhc2s6IFRhc2spOiBGZWF0dXJlID0+IHtcbiAgaWYgKHRhc2suZHVyYXRpb24gPT09IDApIHtcbiAgICByZXR1cm4gRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dEZXN0VG9NaWxlc3RvbmU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93RGVzdDtcbiAgfVxufTtcblxuLyoqXG4gKiBDb21wdXRlIHdoYXQgdGhlIGhlaWdodCBvZiB0aGUgY2FudmFzIHNob3VsZCBiZS4gTm90ZSB0aGF0IHRoZSB2YWx1ZSBkb2Vzbid0XG4gKiBrbm93IGFib3V0IGB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpb2AsIHNvIGlmIHRoZSBjYW52YXMgaXMgYWxyZWFkeSBzY2FsZWQgYnlcbiAqIGB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpb2AgdGhlbiBzbyB3aWxsIHRoZSByZXN1bHQgb2YgdGhpcyBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1Z2dlc3RlZENhbnZhc0hlaWdodChcbiAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcbiAgc3BhbnM6IFNwYW5bXSxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgbWF4Um93czogbnVtYmVyXG4pOiBudW1iZXIge1xuICBpZiAoIW9wdHMuaGFzVGFza3MpIHtcbiAgICBtYXhSb3dzID0gMDtcbiAgfVxuICByZXR1cm4gbmV3IFNjYWxlKFxuICAgIG9wdHMsXG4gICAgY2FudmFzLndpZHRoLFxuICAgIHNwYW5zW3NwYW5zLmxlbmd0aCAtIDFdLmZpbmlzaCArIDFcbiAgKS5oZWlnaHQobWF4Um93cyk7XG59XG5cbi8vIFRPRE8gLSBQYXNzIGluIG1heCByb3dzLCBhbmQgYSBtYXBwaW5nIHRoYXQgbWFwcyBmcm9tIHRhc2tJbmRleCB0byByb3csXG4vLyBiZWNhdXNlIHR3byBkaWZmZXJlbnQgdGFza3MgbWlnaHQgYmUgcGxhY2VkIG9uIHRoZSBzYW1lIHJvdy4gQWxzbyB3ZSBzaG91bGRcbi8vIHBhc3MgaW4gbWF4IHJvd3M/IE9yIHNob3VsZCB0aGF0IGNvbWUgZnJvbSB0aGUgYWJvdmUgbWFwcGluZz9cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJUYXNrc1RvQ2FudmFzKFxuICBwYXJlbnQ6IEhUTUxFbGVtZW50LFxuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgcGxhbjogUGxhbixcbiAgc3BhbnM6IFNwYW5bXSxcbiAgb3B0czogUmVuZGVyT3B0aW9uc1xuKTogUmVzdWx0PFNjYWxlPiB7XG4gIGNvbnN0IHZyZXQgPSB2YWxpZGF0ZUNoYXJ0KHBsYW4uY2hhcnQpO1xuICBpZiAoIXZyZXQub2spIHtcbiAgICByZXR1cm4gdnJldDtcbiAgfVxuXG4gIGNvbnN0IG9yaWdpbmFsTGFiZWxzID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5tYXAoXG4gICAgKHRhc2s6IFRhc2ssIHRhc2tJbmRleDogbnVtYmVyKSA9PiBvcHRzLnRhc2tMYWJlbCh0YXNrSW5kZXgpXG4gICk7XG5cbiAgLy8gQXBwbHkgdGhlIGZpbHRlciBhbmQgd29yayB3aXRoIHRoZSBDaGFydExpa2UgcmV0dXJuIGZyb20gdGhpcyBwb2ludCBvbi5cbiAgLy8gRml0bGVyIGFsc28gbmVlZHMgdG8gYmUgYXBwbGllZCB0byBzcGFucy5cbiAgY29uc3QgZnJldCA9IGZpbHRlcihcbiAgICBwbGFuLmNoYXJ0LFxuICAgIG9wdHMuZmlsdGVyRnVuYyxcbiAgICBvcHRzLnRhc2tFbXBoYXNpemUsXG4gICAgc3BhbnMsXG4gICAgb3JpZ2luYWxMYWJlbHNcbiAgKTtcbiAgaWYgKCFmcmV0Lm9rKSB7XG4gICAgcmV0dXJuIGZyZXQ7XG4gIH1cbiAgY29uc3QgY2hhcnRMaWtlID0gZnJldC52YWx1ZS5jaGFydExpa2U7XG4gIGNvbnN0IGxhYmVscyA9IGZyZXQudmFsdWUubGFiZWxzO1xuICBjb25zdCByZXNvdXJjZURlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbihvcHRzLmdyb3VwQnlSZXNvdXJjZSk7XG5cbiAgLy8gSGlnaGxpZ2h0ZWQgdGFza3MuXG4gIGNvbnN0IHRhc2tIaWdobGlnaHRzOiBTZXQ8bnVtYmVyPiA9IG5ldyBTZXQoZnJldC52YWx1ZS5oaWdobGlnaHRlZFRhc2tzKTtcbiAgc3BhbnMgPSBmcmV0LnZhbHVlLnNwYW5zO1xuXG4gIC8vIFRPRE8gVHVybiB0aGlzIGludG8gYW4gb3B0aW9uIHNpbmNlIHdlIHdvbid0IGFsd2F5cyB3YW50IHRoaXMuXG4gIGNvbnN0IG5ld0hlaWdodCA9IHN1Z2dlc3RlZENhbnZhc0hlaWdodChcbiAgICBjYW52YXMsXG4gICAgc3BhbnMsXG4gICAgb3B0cyxcbiAgICBjaGFydExpa2UuVmVydGljZXMubGVuZ3RoICsgMiAvLyBUT0RPIC0gV2h5IGRvIHdlIG5lZWQgdGhlICsyIGhlcmUhP1xuICApO1xuICBjYW52YXMuaGVpZ2h0ID0gbmV3SGVpZ2h0O1xuICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gYCR7bmV3SGVpZ2h0IC8gd2luZG93LmRldmljZVBpeGVsUmF0aW99cHhgO1xuXG4gIC8vIENhbGN1bGF0ZSBob3cgd2lkZSB3ZSBuZWVkIHRvIG1ha2UgdGhlIGdyb3VwQnkgY29sdW1uLlxuICBsZXQgbWF4R3JvdXBOYW1lTGVuZ3RoID0gMDtcbiAgaWYgKG9wdHMuZ3JvdXBCeVJlc291cmNlICE9PSBcIlwiICYmIG9wdHMuaGFzVGV4dCkge1xuICAgIG1heEdyb3VwTmFtZUxlbmd0aCA9IG9wdHMuZ3JvdXBCeVJlc291cmNlLmxlbmd0aDtcbiAgICBpZiAocmVzb3VyY2VEZWZpbml0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXMuZm9yRWFjaCgodmFsdWU6IHN0cmluZykgPT4ge1xuICAgICAgICBtYXhHcm91cE5hbWVMZW5ndGggPSBNYXRoLm1heChtYXhHcm91cE5hbWVMZW5ndGgsIHZhbHVlLmxlbmd0aCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBjb25zdCB0b3RhbE51bWJlck9mUm93cyA9IHNwYW5zLmxlbmd0aDtcbiAgY29uc3QgdG90YWxOdW1iZXJPZkRheXMgPSBzcGFuc1tzcGFucy5sZW5ndGggLSAxXS5maW5pc2g7XG4gIGNvbnN0IHNjYWxlID0gbmV3IFNjYWxlKFxuICAgIG9wdHMsXG4gICAgY2FudmFzLndpZHRoLFxuICAgIHRvdGFsTnVtYmVyT2ZEYXlzICsgMSxcbiAgICBtYXhHcm91cE5hbWVMZW5ndGhcbiAgKTtcblxuICBjb25zdCB0YXNrTGluZUhlaWdodCA9IHNjYWxlLm1ldHJpYyhNZXRyaWMudGFza0xpbmVIZWlnaHQpO1xuICBjb25zdCBkaWFtb25kRGlhbWV0ZXIgPSBzY2FsZS5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKTtcbiAgY29uc3QgcGVyY2VudEhlaWdodCA9IHNjYWxlLm1ldHJpYyhNZXRyaWMucGVyY2VudEhlaWdodCk7XG4gIGNvbnN0IGFycm93SGVhZEhlaWdodCA9IHNjYWxlLm1ldHJpYyhNZXRyaWMuYXJyb3dIZWFkSGVpZ2h0KTtcbiAgY29uc3QgYXJyb3dIZWFkV2lkdGggPSBzY2FsZS5tZXRyaWMoTWV0cmljLmFycm93SGVhZFdpZHRoKTtcbiAgY29uc3QgZGF5c1dpdGhUaW1lTWFya2VyczogU2V0PG51bWJlcj4gPSBuZXcgU2V0KCk7XG4gIGNvbnN0IHRpcmV0ID0gdGFza0luZGV4VG9Sb3dGcm9tR3JvdXBCeShcbiAgICBvcHRzLFxuICAgIHJlc291cmNlRGVmaW5pdGlvbixcbiAgICBjaGFydExpa2UsXG4gICAgZnJldC52YWx1ZS5kaXNwbGF5T3JkZXJcbiAgKTtcbiAgaWYgKCF0aXJldC5vaykge1xuICAgIHJldHVybiB0aXJldDtcbiAgfVxuICBjb25zdCB0YXNrSW5kZXhUb1JvdyA9IHRpcmV0LnZhbHVlLnRhc2tJbmRleFRvUm93O1xuICBjb25zdCByb3dSYW5nZXMgPSB0aXJldC52YWx1ZS5yb3dSYW5nZXM7XG5cbiAgLy8gU2V0IHVwIGNhbnZhcyBiYXNpY3MuXG4gIGNsZWFyQ2FudmFzKGN0eCwgb3B0cywgY2FudmFzKTtcbiAgc2V0Rm9udFNpemUoY3R4LCBvcHRzKTtcblxuICBjb25zdCBjbGlwUmVnaW9uID0gbmV3IFBhdGgyRCgpO1xuICBjb25zdCBjbGlwT3JpZ2luID0gc2NhbGUuZmVhdHVyZSgwLCAwLCBGZWF0dXJlLnRhc2tzQ2xpcFJlY3RPcmlnaW4pO1xuICBjb25zdCBjbGlwV2lkdGggPSBjYW52YXMud2lkdGggLSBjbGlwT3JpZ2luLng7XG4gIGNsaXBSZWdpb24ucmVjdChjbGlwT3JpZ2luLngsIDAsIGNsaXBXaWR0aCwgY2FudmFzLmhlaWdodCk7XG5cbiAgLy8gRHJhdyBiaWcgcmVkIHJlY3Qgb3ZlciB3aGVyZSB0aGUgY2xpcCByZWdpb24gd2lsbCBiZS5cbiAgaWYgKDApIHtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xuICAgIGN0eC5saW5lV2lkdGggPSAyO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguc3Ryb2tlKGNsaXBSZWdpb24pO1xuICB9XG5cbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuXG4gIGlmIChyb3dSYW5nZXMgIT09IG51bGwpIHtcbiAgICBpZiAob3B0cy5oYXNUYXNrcykge1xuICAgICAgZHJhd1N3aW1MYW5lSGlnaGxpZ2h0cyhcbiAgICAgICAgY3R4LFxuICAgICAgICBzY2FsZSxcbiAgICAgICAgcm93UmFuZ2VzLFxuICAgICAgICB0b3RhbE51bWJlck9mRGF5cyxcbiAgICAgICAgb3B0cy5jb2xvcnMuZ3JvdXBDb2xvclxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAocmVzb3VyY2VEZWZpbml0aW9uICE9PSB1bmRlZmluZWQgJiYgb3B0cy5oYXNUZXh0KSB7XG4gICAgICBkcmF3U3dpbUxhbmVMYWJlbHMoY3R4LCBvcHRzLCByZXNvdXJjZURlZmluaXRpb24sIHNjYWxlLCByb3dSYW5nZXMpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcblxuICBjdHguc2F2ZSgpO1xuICBjdHguY2xpcChjbGlwUmVnaW9uKTtcbiAgLy8gRHJhdyB0YXNrcyBpbiB0aGVpciByb3dzLlxuICBjaGFydExpa2UuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgdGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCByb3cgPSB0YXNrSW5kZXhUb1Jvdy5nZXQodGFza0luZGV4KSE7XG4gICAgY29uc3Qgc3BhbiA9IHNwYW5zW3Rhc2tJbmRleF07XG4gICAgY29uc3QgdGFza1N0YXJ0ID0gc2NhbGUuZmVhdHVyZShyb3csIHNwYW4uc3RhcnQsIEZlYXR1cmUudGFza0xpbmVTdGFydCk7XG4gICAgY29uc3QgdGFza0VuZCA9IHNjYWxlLmZlYXR1cmUocm93LCBzcGFuLmZpbmlzaCwgRmVhdHVyZS50YXNrTGluZVN0YXJ0KTtcblxuICAgIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VNdXRlZDtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VNdXRlZDtcblxuICAgIC8vIERyYXcgaW4gdGltZSBtYXJrZXJzIGlmIGRpc3BsYXllZC5cbiAgICAvLyBUT0RPIC0gTWFrZSBzdXJlIHRoZXkgZG9uJ3Qgb3ZlcmxhcC5cbiAgICBpZiAob3B0cy5kcmF3VGltZU1hcmtlcnNPblRhc2tzKSB7XG4gICAgICBkcmF3VGltZU1hcmtlckF0RGF5VG9UYXNrKFxuICAgICAgICBjdHgsXG4gICAgICAgIHJvdyxcbiAgICAgICAgc3Bhbi5zdGFydCxcbiAgICAgICAgdGFzayxcbiAgICAgICAgb3B0cyxcbiAgICAgICAgc2NhbGUsXG4gICAgICAgIGRheXNXaXRoVGltZU1hcmtlcnNcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHRhc2tIaWdobGlnaHRzLmhhcyh0YXNrSW5kZXgpKSB7XG4gICAgICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlSGlnaGxpZ2h0O1xuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlSGlnaGxpZ2h0O1xuICAgIH0gZWxzZSB7XG4gICAgICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICAgIH1cbiAgICBpZiAob3B0cy5oYXNUYXNrcykge1xuICAgICAgaWYgKG9wdHMuaGlnaGxpZ2h0ZWRUYXNrICE9PSBudWxsICYmIHRhc2tJbmRleCA9PT0gb3B0cy5oaWdobGlnaHRlZFRhc2spIHtcbiAgICAgICAgY29uc3Qgb2xkRmlsbFN0eWxlID0gY3R4LmZpbGxTdHlsZTtcbiAgICAgICAgY29uc3QgaGlnaGxpZ2h0U3RhcnQgPSBzY2FsZS5mZWF0dXJlKFxuICAgICAgICAgIHJvdyxcbiAgICAgICAgICBzcGFuLnN0YXJ0LFxuICAgICAgICAgIEZlYXR1cmUudGFza0VudmVsb3BlVG9wXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGhpZ2hsaWdodEVuZCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgICAgICAgcm93ICsgMSxcbiAgICAgICAgICBzcGFuLmZpbmlzaCxcbiAgICAgICAgICBGZWF0dXJlLnRhc2tFbnZlbG9wZVRvcFxuICAgICAgICApO1xuICAgICAgICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMuaGlnaGxpZ2h0O1xuICAgICAgICBkcmF3VGFza0hpZ2hsaWdodChjdHgsIGhpZ2hsaWdodFN0YXJ0LCBoaWdobGlnaHRFbmQpO1xuICAgICAgICBjdHguZmlsbFN0eWxlID0gb2xkRmlsbFN0eWxlO1xuICAgICAgfVxuXG4gICAgICBpZiAodGFza1N0YXJ0LnggPT09IHRhc2tFbmQueCkge1xuICAgICAgICBkcmF3TWlsZXN0b25lKGN0eCwgdGFza1N0YXJ0LCBkaWFtb25kRGlhbWV0ZXIsIHBlcmNlbnRIZWlnaHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZHJhd1Rhc2tCYXIoY3R4LCB0YXNrU3RhcnQsIHRhc2tFbmQsIHRhc2tMaW5lSGVpZ2h0KTtcbiAgICAgIH1cblxuICAgICAgLy8gU2tpcCBkcmF3aW5nIHRoZSB0ZXh0IG9mIHRoZSBTdGFydCBhbmQgRmluaXNoIHRhc2tzLlxuICAgICAgaWYgKHRhc2tJbmRleCAhPT0gMCAmJiB0YXNrSW5kZXggIT09IHRvdGFsTnVtYmVyT2ZSb3dzIC0gMSkge1xuICAgICAgICBkcmF3VGFza1RleHQoXG4gICAgICAgICAgY3R4LFxuICAgICAgICAgIG9wdHMsXG4gICAgICAgICAgc2NhbGUsXG4gICAgICAgICAgcm93LFxuICAgICAgICAgIHNwYW4sXG4gICAgICAgICAgdGFzayxcbiAgICAgICAgICB0YXNrSW5kZXgsXG4gICAgICAgICAgY2xpcFdpZHRoLFxuICAgICAgICAgIGxhYmVsc1xuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgY3R4LmxpbmVXaWR0aCA9IDE7XG4gIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZU11dGVkO1xuXG4gIC8vIE5vdyBkcmF3IGFsbCB0aGUgYXJyb3dzLCBpLmUuIGVkZ2VzLlxuICBpZiAob3B0cy5oYXNFZGdlcyAmJiBvcHRzLmhhc1Rhc2tzKSB7XG4gICAgY29uc3QgaGlnaGxpZ2h0ZWRFZGdlczogRGlyZWN0ZWRFZGdlW10gPSBbXTtcbiAgICBjb25zdCBub3JtYWxFZGdlczogRGlyZWN0ZWRFZGdlW10gPSBbXTtcbiAgICBjaGFydExpa2UuRWRnZXMuZm9yRWFjaCgoZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgICBpZiAodGFza0hpZ2hsaWdodHMuaGFzKGUuaSkgJiYgdGFza0hpZ2hsaWdodHMuaGFzKGUuaikpIHtcbiAgICAgICAgaGlnaGxpZ2h0ZWRFZGdlcy5wdXNoKGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9ybWFsRWRnZXMucHVzaChlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZU11dGVkO1xuICAgIGRyYXdFZGdlcyhcbiAgICAgIGN0eCxcbiAgICAgIG9wdHMsXG4gICAgICBub3JtYWxFZGdlcyxcbiAgICAgIHNwYW5zLFxuICAgICAgY2hhcnRMaWtlLlZlcnRpY2VzLFxuICAgICAgc2NhbGUsXG4gICAgICB0YXNrSW5kZXhUb1JvdyxcbiAgICAgIGFycm93SGVhZFdpZHRoLFxuICAgICAgYXJyb3dIZWFkSGVpZ2h0LFxuICAgICAgdGFza0hpZ2hsaWdodHNcbiAgICApO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZUhpZ2hsaWdodDtcbiAgICBkcmF3RWRnZXMoXG4gICAgICBjdHgsXG4gICAgICBvcHRzLFxuICAgICAgaGlnaGxpZ2h0ZWRFZGdlcyxcbiAgICAgIHNwYW5zLFxuICAgICAgY2hhcnRMaWtlLlZlcnRpY2VzLFxuICAgICAgc2NhbGUsXG4gICAgICB0YXNrSW5kZXhUb1JvdyxcbiAgICAgIGFycm93SGVhZFdpZHRoLFxuICAgICAgYXJyb3dIZWFkSGVpZ2h0LFxuICAgICAgdGFza0hpZ2hsaWdodHNcbiAgICApO1xuICB9XG5cbiAgY3R4LnJlc3RvcmUoKTtcblxuICAvLyBOb3cgZHJhdyB0aGUgcmFuZ2UgaGlnaGxpZ2h0cyBpZiByZXF1aXJlZC5cbiAgaWYgKG9wdHMuZGlzcGxheVJhbmdlICE9PSBudWxsICYmIG9wdHMuZGlzcGxheVJhbmdlVXNhZ2UgPT09IFwiaGlnaGxpZ2h0XCIpIHtcbiAgICAvLyBEcmF3IGEgcmVjdCBvdmVyIGVhY2ggc2lkZSB0aGF0IGlzbid0IGluIHRoZSByYW5nZS5cbiAgICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UuYmVnaW4gPiAwKSB7XG4gICAgICBkcmF3UmFuZ2VPdmVybGF5KFxuICAgICAgICBjdHgsXG4gICAgICAgIG9wdHMsXG4gICAgICAgIHNjYWxlLFxuICAgICAgICAwLFxuICAgICAgICBvcHRzLmRpc3BsYXlSYW5nZS5iZWdpbixcbiAgICAgICAgdG90YWxOdW1iZXJPZlJvd3NcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChvcHRzLmRpc3BsYXlSYW5nZS5lbmQgPCB0b3RhbE51bWJlck9mRGF5cykge1xuICAgICAgZHJhd1JhbmdlT3ZlcmxheShcbiAgICAgICAgY3R4LFxuICAgICAgICBvcHRzLFxuICAgICAgICBzY2FsZSxcbiAgICAgICAgb3B0cy5kaXNwbGF5UmFuZ2UuZW5kLFxuICAgICAgICB0b3RhbE51bWJlck9mRGF5cyArIDEsXG4gICAgICAgIHRvdGFsTnVtYmVyT2ZSb3dzXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvayhzY2FsZSk7XG59XG5cbmZ1bmN0aW9uIGRyYXdFZGdlcyhcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSxcbiAgc3BhbnM6IFNwYW5bXSxcbiAgdGFza3M6IFRhc2tbXSxcbiAgc2NhbGU6IFNjYWxlLFxuICB0YXNrSW5kZXhUb1JvdzogVGFza0luZGV4VG9Sb3csXG4gIGFycm93SGVhZFdpZHRoOiBudW1iZXIsXG4gIGFycm93SGVhZEhlaWdodDogbnVtYmVyLFxuICB0YXNrSGlnaGxpZ2h0czogU2V0PG51bWJlcj5cbikge1xuICBlZGdlcy5mb3JFYWNoKChlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICBjb25zdCBzcmNTbGFjazogU3BhbiA9IHNwYW5zW2UuaV07XG4gICAgY29uc3QgZHN0U2xhY2s6IFNwYW4gPSBzcGFuc1tlLmpdO1xuICAgIGNvbnN0IHNyY1Rhc2s6IFRhc2sgPSB0YXNrc1tlLmldO1xuICAgIGNvbnN0IGRzdFRhc2s6IFRhc2sgPSB0YXNrc1tlLmpdO1xuICAgIGNvbnN0IHNyY1JvdyA9IHRhc2tJbmRleFRvUm93LmdldChlLmkpITtcbiAgICBjb25zdCBkc3RSb3cgPSB0YXNrSW5kZXhUb1Jvdy5nZXQoZS5qKSE7XG4gICAgY29uc3Qgc3JjRGF5ID0gc3JjU2xhY2suZmluaXNoO1xuICAgIGNvbnN0IGRzdERheSA9IGRzdFNsYWNrLnN0YXJ0O1xuXG4gICAgaWYgKHRhc2tIaWdobGlnaHRzLmhhcyhlLmkpICYmIHRhc2tIaWdobGlnaHRzLmhhcyhlLmopKSB7XG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VIaWdobGlnaHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZU11dGVkO1xuICAgIH1cblxuICAgIGRyYXdBcnJvd0JldHdlZW5UYXNrcyhcbiAgICAgIGN0eCxcbiAgICAgIHNyY0RheSxcbiAgICAgIGRzdERheSxcbiAgICAgIHNjYWxlLFxuICAgICAgc3JjUm93LFxuICAgICAgc3JjVGFzayxcbiAgICAgIGRzdFJvdyxcbiAgICAgIGRzdFRhc2ssXG4gICAgICBhcnJvd0hlYWRXaWR0aCxcbiAgICAgIGFycm93SGVhZEhlaWdodFxuICAgICk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBkcmF3UmFuZ2VPdmVybGF5KFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgc2NhbGU6IFNjYWxlLFxuICBiZWdpbkRheTogbnVtYmVyLFxuICBlbmREYXk6IG51bWJlcixcbiAgdG90YWxOdW1iZXJPZlJvd3M6IG51bWJlclxuKSB7XG4gIGNvbnN0IHRvcExlZnQgPSBzY2FsZS5mZWF0dXJlKDAsIGJlZ2luRGF5LCBGZWF0dXJlLmRpc3BsYXlSYW5nZVRvcCk7XG4gIGNvbnN0IGJvdHRvbVJpZ2h0ID0gc2NhbGUuZmVhdHVyZShcbiAgICB0b3RhbE51bWJlck9mUm93cyxcbiAgICBlbmREYXksXG4gICAgRmVhdHVyZS50YXNrUm93Qm90dG9tXG4gICk7XG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vdmVybGF5O1xuICBjdHguZmlsbFJlY3QoXG4gICAgdG9wTGVmdC54LFxuICAgIHRvcExlZnQueSxcbiAgICBib3R0b21SaWdodC54IC0gdG9wTGVmdC54LFxuICAgIGJvdHRvbVJpZ2h0LnkgLSB0b3BMZWZ0LnlcbiAgKTtcbiAgY29uc29sZS5sb2coXCJkcmF3UmFuZ2VPdmVybGF5XCIsIHRvcExlZnQsIGJvdHRvbVJpZ2h0KTtcbn1cblxuZnVuY3Rpb24gZHJhd0Fycm93QmV0d2VlblRhc2tzKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgc3JjRGF5OiBudW1iZXIsXG4gIGRzdERheTogbnVtYmVyLFxuICBzY2FsZTogU2NhbGUsXG4gIHNyY1JvdzogbnVtYmVyLFxuICBzcmNUYXNrOiBUYXNrLFxuICBkc3RSb3c6IG51bWJlcixcbiAgZHN0VGFzazogVGFzayxcbiAgYXJyb3dIZWFkV2lkdGg6IG51bWJlcixcbiAgYXJyb3dIZWFkSGVpZ2h0OiBudW1iZXJcbikge1xuICBpZiAoc3JjRGF5ID09PSBkc3REYXkpIHtcbiAgICBkcmF3VmVydGljYWxBcnJvd1RvVGFzayhcbiAgICAgIGN0eCxcbiAgICAgIHNjYWxlLFxuICAgICAgc3JjUm93LFxuICAgICAgc3JjRGF5LFxuICAgICAgc3JjVGFzayxcbiAgICAgIGRzdFJvdyxcbiAgICAgIGRzdERheSxcbiAgICAgIGRzdFRhc2ssXG4gICAgICBhcnJvd0hlYWRXaWR0aCxcbiAgICAgIGFycm93SGVhZEhlaWdodFxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgZHJhd0xTaGFwZWRBcnJvd1RvVGFzayhcbiAgICAgIGN0eCxcbiAgICAgIHNjYWxlLFxuICAgICAgc3JjUm93LFxuICAgICAgc3JjRGF5LFxuICAgICAgc3JjVGFzayxcbiAgICAgIGRzdFJvdyxcbiAgICAgIGRzdFRhc2ssXG4gICAgICBkc3REYXksXG4gICAgICBhcnJvd0hlYWRIZWlnaHQsXG4gICAgICBhcnJvd0hlYWRXaWR0aFxuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xlYXJDYW52YXMoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50XG4pIHtcbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLnN1cmZhY2U7XG4gIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY3R4LmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG59XG5cbmZ1bmN0aW9uIHNldEZvbnRTaXplKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBvcHRzOiBSZW5kZXJPcHRpb25zKSB7XG4gIGN0eC5mb250ID0gYCR7b3B0cy5mb250U2l6ZVB4fXB4IHNlcmlmYDtcbn1cblxuLy8gRHJhdyBMIHNoYXBlZCBhcnJvdywgZmlyc3QgZ29pbmcgYmV0d2VlbiByb3dzLCB0aGVuIGdvaW5nIGJldHdlZW4gZGF5cy5cbmZ1bmN0aW9uIGRyYXdMU2hhcGVkQXJyb3dUb1Rhc2soXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBzY2FsZTogU2NhbGUsXG4gIHNyY1JvdzogbnVtYmVyLFxuICBzcmNEYXk6IG51bWJlcixcbiAgc3JjVGFzazogVGFzayxcbiAgZHN0Um93OiBudW1iZXIsXG4gIGRzdFRhc2s6IFRhc2ssXG4gIGRzdERheTogbnVtYmVyLFxuICBhcnJvd0hlYWRIZWlnaHQ6IG51bWJlcixcbiAgYXJyb3dIZWFkV2lkdGg6IG51bWJlclxuKSB7XG4gIC8vIERyYXcgdmVydGljYWwgcGFydCBvZiB0aGUgXCJMXCIuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY29uc3QgZGlyZWN0aW9uOiBEaXJlY3Rpb24gPSBzcmNSb3cgPCBkc3RSb3cgPyBcImRvd25cIiA6IFwidXBcIjtcbiAgY29uc3QgdmVydExpbmVTdGFydCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgc3JjUm93LFxuICAgIHNyY0RheSxcbiAgICB2ZXJ0aWNhbEFycm93U3RhcnRGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbihzcmNUYXNrLCBkaXJlY3Rpb24pXG4gICk7XG4gIGNvbnN0IHZlcnRMaW5lRW5kID0gc2NhbGUuZmVhdHVyZShcbiAgICBkc3RSb3csXG4gICAgc3JjRGF5LFxuICAgIGhvcml6b250YWxBcnJvd0Rlc3RGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbihkc3RUYXNrKVxuICApO1xuICBjdHgubW92ZVRvKHZlcnRMaW5lU3RhcnQueCArIDAuNSwgdmVydExpbmVTdGFydC55KTtcbiAgY3R4LmxpbmVUbyh2ZXJ0TGluZVN0YXJ0LnggKyAwLjUsIHZlcnRMaW5lRW5kLnkpO1xuXG4gIC8vIERyYXcgaG9yaXpvbnRhbCBwYXJ0IG9mIHRoZSBcIkxcIi5cbiAgY29uc3QgaG9yekxpbmVTdGFydCA9IHZlcnRMaW5lRW5kO1xuICBjb25zdCBob3J6TGluZUVuZCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgZHN0Um93LFxuICAgIGRzdERheSxcbiAgICBob3Jpem9udGFsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24oZHN0VGFzaylcbiAgKTtcbiAgY3R4Lm1vdmVUbyh2ZXJ0TGluZVN0YXJ0LnggKyAwLjUsIGhvcnpMaW5lU3RhcnQueSk7XG4gIGN0eC5saW5lVG8oaG9yekxpbmVFbmQueCArIDAuNSwgaG9yekxpbmVFbmQueSk7XG5cbiAgLy8gRHJhdyB0aGUgYXJyb3doZWFkLiBUaGlzIGFycm93IGhlYWQgd2lsbCBhbHdheXMgcG9pbnQgdG8gdGhlIHJpZ2h0XG4gIC8vIHNpbmNlIHRoYXQncyBob3cgdGltZSBmbG93cy5cbiAgY3R4Lm1vdmVUbyhob3J6TGluZUVuZC54ICsgMC41LCBob3J6TGluZUVuZC55KTtcbiAgY3R4LmxpbmVUbyhcbiAgICBob3J6TGluZUVuZC54IC0gYXJyb3dIZWFkSGVpZ2h0ICsgMC41LFxuICAgIGhvcnpMaW5lRW5kLnkgKyBhcnJvd0hlYWRXaWR0aFxuICApO1xuICBjdHgubW92ZVRvKGhvcnpMaW5lRW5kLnggKyAwLjUsIGhvcnpMaW5lRW5kLnkpO1xuICBjdHgubGluZVRvKFxuICAgIGhvcnpMaW5lRW5kLnggLSBhcnJvd0hlYWRIZWlnaHQgKyAwLjUsXG4gICAgaG9yekxpbmVFbmQueSAtIGFycm93SGVhZFdpZHRoXG4gICk7XG4gIGN0eC5zdHJva2UoKTtcbn1cblxuZnVuY3Rpb24gZHJhd1ZlcnRpY2FsQXJyb3dUb1Rhc2soXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBzY2FsZTogU2NhbGUsXG4gIHNyY1JvdzogbnVtYmVyLFxuICBzcmNEYXk6IG51bWJlcixcbiAgc3JjVGFzazogVGFzayxcbiAgZHN0Um93OiBudW1iZXIsXG4gIGRzdERheTogbnVtYmVyLFxuICBkc3RUYXNrOiBUYXNrLFxuICBhcnJvd0hlYWRXaWR0aDogbnVtYmVyLFxuICBhcnJvd0hlYWRIZWlnaHQ6IG51bWJlclxuKSB7XG4gIGNvbnN0IGRpcmVjdGlvbjogRGlyZWN0aW9uID0gc3JjUm93IDwgZHN0Um93ID8gXCJkb3duXCIgOiBcInVwXCI7XG4gIGNvbnN0IGFycm93U3RhcnQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIHNyY1JvdyxcbiAgICBzcmNEYXksXG4gICAgdmVydGljYWxBcnJvd1N0YXJ0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24oc3JjVGFzaywgZGlyZWN0aW9uKVxuICApO1xuICBjb25zdCBhcnJvd0VuZCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgZHN0Um93LFxuICAgIGRzdERheSxcbiAgICB2ZXJ0aWNhbEFycm93RGVzdEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uKGRzdFRhc2ssIGRpcmVjdGlvbilcbiAgKTtcblxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5tb3ZlVG8oYXJyb3dTdGFydC54ICsgMC41LCBhcnJvd1N0YXJ0LnkpO1xuICBjdHgubGluZVRvKGFycm93RW5kLnggKyAwLjUsIGFycm93RW5kLnkpO1xuXG4gIC8vIERyYXcgdGhlIGFycm93aGVhZC5cbiAgY29uc3QgZGVsdGFZID0gZGlyZWN0aW9uID09PSBcImRvd25cIiA/IC1hcnJvd0hlYWRIZWlnaHQgOiBhcnJvd0hlYWRIZWlnaHQ7XG4gIGN0eC5tb3ZlVG8oYXJyb3dFbmQueCArIDAuNSwgYXJyb3dFbmQueSk7XG4gIGN0eC5saW5lVG8oYXJyb3dFbmQueCAtIGFycm93SGVhZFdpZHRoICsgMC41LCBhcnJvd0VuZC55ICsgZGVsdGFZKTtcbiAgY3R4Lm1vdmVUbyhhcnJvd0VuZC54ICsgMC41LCBhcnJvd0VuZC55KTtcbiAgY3R4LmxpbmVUbyhhcnJvd0VuZC54ICsgYXJyb3dIZWFkV2lkdGggKyAwLjUsIGFycm93RW5kLnkgKyBkZWx0YVkpO1xuICBjdHguc3Ryb2tlKCk7XG59XG5cbmZ1bmN0aW9uIGRyYXdUYXNrVGV4dChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIHNjYWxlOiBTY2FsZSxcbiAgcm93OiBudW1iZXIsXG4gIHNwYW46IFNwYW4sXG4gIHRhc2s6IFRhc2ssXG4gIHRhc2tJbmRleDogbnVtYmVyLFxuICBjbGlwV2lkdGg6IG51bWJlcixcbiAgbGFiZWxzOiBzdHJpbmdbXVxuKSB7XG4gIGlmICghb3B0cy5oYXNUZXh0KSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IGxhYmVsID0gbGFiZWxzW3Rhc2tJbmRleF07XG5cbiAgbGV0IHhTdGFydEluVGltZSA9IHNwYW4uc3RhcnQ7XG4gIGxldCB4UGl4ZWxEZWx0YSA9IDA7XG4gIC8vIERldGVybWluZSB3aGVyZSBvbiB0aGUgeC1heGlzIHRvIHN0YXJ0IGRyYXdpbmcgdGhlIHRhc2sgdGV4dC5cbiAgaWYgKG9wdHMuZGlzcGxheVJhbmdlICE9PSBudWxsICYmIG9wdHMuZGlzcGxheVJhbmdlVXNhZ2UgPT09IFwicmVzdHJpY3RcIikge1xuICAgIGlmIChvcHRzLmRpc3BsYXlSYW5nZS5pbihzcGFuLnN0YXJ0KSkge1xuICAgICAgeFN0YXJ0SW5UaW1lID0gc3Bhbi5zdGFydDtcbiAgICAgIHhQaXhlbERlbHRhID0gMDtcbiAgICB9IGVsc2UgaWYgKG9wdHMuZGlzcGxheVJhbmdlLmluKHNwYW4uZmluaXNoKSkge1xuICAgICAgeFN0YXJ0SW5UaW1lID0gc3Bhbi5maW5pc2g7XG4gICAgICBjb25zdCBtZWFzID0gY3R4Lm1lYXN1cmVUZXh0KGxhYmVsKTtcbiAgICAgIHhQaXhlbERlbHRhID0gLW1lYXMud2lkdGggLSAyICogc2NhbGUubWV0cmljKE1ldHJpYy50ZXh0WE9mZnNldCk7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHNwYW4uc3RhcnQgPCBvcHRzLmRpc3BsYXlSYW5nZS5iZWdpbiAmJlxuICAgICAgc3Bhbi5maW5pc2ggPiBvcHRzLmRpc3BsYXlSYW5nZS5lbmRcbiAgICApIHtcbiAgICAgIHhTdGFydEluVGltZSA9IG9wdHMuZGlzcGxheVJhbmdlLmJlZ2luO1xuICAgICAgeFBpeGVsRGVsdGEgPSBjbGlwV2lkdGggLyAyO1xuICAgIH1cbiAgfVxuICBjdHgubGluZVdpZHRoID0gMTtcbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY3R4LnRleHRCYXNlbGluZSA9IFwidG9wXCI7XG4gIGNvbnN0IHRleHRTdGFydCA9IHNjYWxlLmZlYXR1cmUocm93LCB4U3RhcnRJblRpbWUsIEZlYXR1cmUudGV4dFN0YXJ0KTtcbiAgY3R4LmZpbGxUZXh0KGxhYmVsLCB0ZXh0U3RhcnQueCArIHhQaXhlbERlbHRhLCB0ZXh0U3RhcnQueSk7XG59XG5cbmZ1bmN0aW9uIGRyYXdUYXNrQmFyKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgdGFza1N0YXJ0OiBQb2ludCxcbiAgdGFza0VuZDogUG9pbnQsXG4gIHRhc2tMaW5lSGVpZ2h0OiBudW1iZXJcbikge1xuICBjdHguZmlsbFJlY3QoXG4gICAgdGFza1N0YXJ0LngsXG4gICAgdGFza1N0YXJ0LnksXG4gICAgdGFza0VuZC54IC0gdGFza1N0YXJ0LngsXG4gICAgdGFza0xpbmVIZWlnaHRcbiAgKTtcbn1cblxuZnVuY3Rpb24gZHJhd1Rhc2tIaWdobGlnaHQoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBoaWdobGlnaHRTdGFydDogUG9pbnQsXG4gIGhpZ2hsaWdodEVuZDogUG9pbnRcbikge1xuICBjdHguZmlsbFJlY3QoXG4gICAgaGlnaGxpZ2h0U3RhcnQueCxcbiAgICBoaWdobGlnaHRTdGFydC55LFxuICAgIGhpZ2hsaWdodEVuZC54IC0gaGlnaGxpZ2h0U3RhcnQueCxcbiAgICBoaWdobGlnaHRFbmQueSAtIGhpZ2hsaWdodFN0YXJ0LnlcbiAgKTtcbn1cblxuZnVuY3Rpb24gZHJhd01pbGVzdG9uZShcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHRhc2tTdGFydDogUG9pbnQsXG4gIGRpYW1vbmREaWFtZXRlcjogbnVtYmVyLFxuICBwZXJjZW50SGVpZ2h0OiBudW1iZXJcbikge1xuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5saW5lV2lkdGggPSBwZXJjZW50SGVpZ2h0IC8gMjtcbiAgY3R4Lm1vdmVUbyh0YXNrU3RhcnQueCwgdGFza1N0YXJ0LnkgLSBkaWFtb25kRGlhbWV0ZXIpO1xuICBjdHgubGluZVRvKHRhc2tTdGFydC54ICsgZGlhbW9uZERpYW1ldGVyLCB0YXNrU3RhcnQueSk7XG4gIGN0eC5saW5lVG8odGFza1N0YXJ0LngsIHRhc2tTdGFydC55ICsgZGlhbW9uZERpYW1ldGVyKTtcbiAgY3R4LmxpbmVUbyh0YXNrU3RhcnQueCAtIGRpYW1vbmREaWFtZXRlciwgdGFza1N0YXJ0LnkpO1xuICBjdHguY2xvc2VQYXRoKCk7XG4gIGN0eC5zdHJva2UoKTtcbn1cblxuY29uc3QgZHJhd1RpbWVNYXJrZXJBdERheVRvVGFzayA9IChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHJvdzogbnVtYmVyLFxuICBkYXk6IG51bWJlcixcbiAgdGFzazogVGFzayxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgc2NhbGU6IFNjYWxlLFxuICBkYXlzV2l0aFRpbWVNYXJrZXJzOiBTZXQ8bnVtYmVyPlxuKSA9PiB7XG4gIGlmIChkYXlzV2l0aFRpbWVNYXJrZXJzLmhhcyhkYXkpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGRheXNXaXRoVGltZU1hcmtlcnMuYWRkKGRheSk7XG4gIGNvbnN0IHRpbWVNYXJrU3RhcnQgPSBzY2FsZS5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLnRpbWVNYXJrU3RhcnQpO1xuICBjb25zdCB0aW1lTWFya0VuZCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgcm93LFxuICAgIGRheSxcbiAgICB2ZXJ0aWNhbEFycm93RGVzdEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uKHRhc2ssIFwiZG93blwiKVxuICApO1xuICBjdHgubGluZVdpZHRoID0gMTtcblxuICBjdHguc2V0TGluZURhc2goW1xuICAgIHNjYWxlLm1ldHJpYyhNZXRyaWMubGluZURhc2hMaW5lKSxcbiAgICBzY2FsZS5tZXRyaWMoTWV0cmljLmxpbmVEYXNoR2FwKSxcbiAgXSk7XG4gIGN0eC5tb3ZlVG8odGltZU1hcmtTdGFydC54ICsgMC41LCB0aW1lTWFya1N0YXJ0LnkpO1xuICBjdHgubGluZVRvKHRpbWVNYXJrU3RhcnQueCArIDAuNSwgdGltZU1hcmtFbmQueSk7XG4gIGN0eC5zdHJva2UoKTtcblxuICBjdHguc2V0TGluZURhc2goW10pO1xuXG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gIGN0eC50ZXh0QmFzZWxpbmUgPSBcInRvcFwiO1xuICBjb25zdCB0ZXh0U3RhcnQgPSBzY2FsZS5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLnRpbWVUZXh0U3RhcnQpO1xuICBpZiAob3B0cy5oYXNUZXh0ICYmIG9wdHMuaGFzVGltZWxpbmUpIHtcbiAgICBjdHguZmlsbFRleHQoYCR7ZGF5fWAsIHRleHRTdGFydC54LCB0ZXh0U3RhcnQueSk7XG4gIH1cbn07XG5cbi8qKiBSZXByZXNlbnRzIGEgaGFsZi1vcGVuIGludGVydmFsIG9mIHJvd3MsIGUuZy4gW3N0YXJ0LCBmaW5pc2gpLiAqL1xuaW50ZXJmYWNlIFJvd1JhbmdlIHtcbiAgc3RhcnQ6IG51bWJlcjtcbiAgZmluaXNoOiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBUYXNrSW5kZXhUb1Jvd1JldHVybiB7XG4gIHRhc2tJbmRleFRvUm93OiBUYXNrSW5kZXhUb1JvdztcblxuICAvKiogTWFwcyBlYWNoIHJlc291cmNlIHZhbHVlIGluZGV4IHRvIGEgcmFuZ2Ugb2Ygcm93cy4gKi9cbiAgcm93UmFuZ2VzOiBNYXA8bnVtYmVyLCBSb3dSYW5nZT4gfCBudWxsO1xuXG4gIHJlc291cmNlRGVmaW5pdGlvbjogUmVzb3VyY2VEZWZpbml0aW9uIHwgbnVsbDtcbn1cblxuY29uc3QgdGFza0luZGV4VG9Sb3dGcm9tR3JvdXBCeSA9IChcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgcmVzb3VyY2VEZWZpbml0aW9uOiBSZXNvdXJjZURlZmluaXRpb24gfCB1bmRlZmluZWQsXG4gIGNoYXJ0TGlrZTogQ2hhcnRMaWtlLFxuICBkaXNwbGF5T3JkZXI6IFZlcnRleEluZGljZXNcbik6IFJlc3VsdDxUYXNrSW5kZXhUb1Jvd1JldHVybj4gPT4ge1xuICAvLyBkaXNwbGF5T3JkZXIgbWFwcyBmcm9tIHJvdyB0byB0YXNrIGluZGV4LCB0aGlzIHdpbGwgcHJvZHVjZSB0aGUgaW52ZXJzZSBtYXBwaW5nLlxuICBjb25zdCB0YXNrSW5kZXhUb1JvdyA9IG5ldyBNYXAoXG4gICAgLy8gVGhpcyBsb29rcyBiYWNrd2FyZHMsIGJ1dCBpdCBpc24ndC4gUmVtZW1iZXIgdGhhdCB0aGUgbWFwIGNhbGxiYWNrIHRha2VzXG4gICAgLy8gKHZhbHVlLCBpbmRleCkgYXMgaXRzIGFyZ3VtZW50cy5cbiAgICBkaXNwbGF5T3JkZXIubWFwKCh0YXNrSW5kZXg6IG51bWJlciwgcm93OiBudW1iZXIpID0+IFt0YXNrSW5kZXgsIHJvd10pXG4gICk7XG5cbiAgaWYgKHJlc291cmNlRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHRhc2tJbmRleFRvUm93OiB0YXNrSW5kZXhUb1JvdyxcbiAgICAgIHJvd1JhbmdlczogbnVsbCxcbiAgICAgIHJlc291cmNlRGVmaW5pdGlvbjogbnVsbCxcbiAgICB9KTtcbiAgfVxuXG4gIGNvbnN0IHN0YXJ0VGFza0luZGV4ID0gMDtcbiAgY29uc3QgZmluaXNoVGFza0luZGV4ID0gY2hhcnRMaWtlLlZlcnRpY2VzLmxlbmd0aCAtIDE7XG4gIGNvbnN0IGlnbm9yYWJsZSA9IFtzdGFydFRhc2tJbmRleCwgZmluaXNoVGFza0luZGV4XTtcblxuICAvLyBHcm91cCBhbGwgdGFza3MgYnkgdGhlaXIgcmVzb3VyY2UgdmFsdWUsIHdoaWxlIHByZXNlcnZpbmcgZGlzcGxheU9yZGVyXG4gIC8vIG9yZGVyIHdpdGggdGhlIGdyb3Vwcy5cbiAgY29uc3QgZ3JvdXBzID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcltdPigpO1xuICBkaXNwbGF5T3JkZXIuZm9yRWFjaCgodGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCByZXNvdXJjZVZhbHVlID1cbiAgICAgIGNoYXJ0TGlrZS5WZXJ0aWNlc1t0YXNrSW5kZXhdLmdldFJlc291cmNlKG9wdHMuZ3JvdXBCeVJlc291cmNlKSB8fCBcIlwiO1xuICAgIGNvbnN0IGdyb3VwTWVtYmVycyA9IGdyb3Vwcy5nZXQocmVzb3VyY2VWYWx1ZSkgfHwgW107XG4gICAgZ3JvdXBNZW1iZXJzLnB1c2godGFza0luZGV4KTtcbiAgICBncm91cHMuc2V0KHJlc291cmNlVmFsdWUsIGdyb3VwTWVtYmVycyk7XG4gIH0pO1xuXG4gIGNvbnN0IHJldCA9IG5ldyBNYXA8bnVtYmVyLCBudW1iZXI+KCk7XG5cbiAgLy8gVWdoLCBTdGFydCBhbmQgRmluaXNoIFRhc2tzIG5lZWQgdG8gYmUgbWFwcGVkLCBidXQgc2hvdWxkIG5vdCBiZSBkb25lIHZpYVxuICAvLyByZXNvdXJjZSB2YWx1ZSwgc28gU3RhcnQgc2hvdWxkIGFsd2F5cyBiZSBmaXJzdC5cbiAgcmV0LnNldCgwLCAwKTtcblxuICAvLyBOb3cgaW5jcmVtZW50IHVwIHRoZSByb3dzIGFzIHdlIG1vdmUgdGhyb3VnaCBhbGwgdGhlIGdyb3Vwcy5cbiAgbGV0IHJvdyA9IDE7XG4gIC8vIEFuZCB0cmFjayBob3cgbWFueSByb3dzIGFyZSBpbiBlYWNoIGdyb3VwLlxuICBjb25zdCByb3dSYW5nZXM6IE1hcDxudW1iZXIsIFJvd1JhbmdlPiA9IG5ldyBNYXAoKTtcbiAgcmVzb3VyY2VEZWZpbml0aW9uLnZhbHVlcy5mb3JFYWNoKFxuICAgIChyZXNvdXJjZVZhbHVlOiBzdHJpbmcsIHJlc291cmNlSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3Qgc3RhcnRPZlJvdyA9IHJvdztcbiAgICAgIChncm91cHMuZ2V0KHJlc291cmNlVmFsdWUpIHx8IFtdKS5mb3JFYWNoKCh0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICBpZiAoaWdub3JhYmxlLmluY2x1ZGVzKHRhc2tJbmRleCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0LnNldCh0YXNrSW5kZXgsIHJvdyk7XG4gICAgICAgIHJvdysrO1xuICAgICAgfSk7XG4gICAgICByb3dSYW5nZXMuc2V0KHJlc291cmNlSW5kZXgsIHsgc3RhcnQ6IHN0YXJ0T2ZSb3csIGZpbmlzaDogcm93IH0pO1xuICAgIH1cbiAgKTtcbiAgcmV0LnNldChmaW5pc2hUYXNrSW5kZXgsIHJvdyk7XG5cbiAgcmV0dXJuIG9rKHtcbiAgICB0YXNrSW5kZXhUb1JvdzogcmV0LFxuICAgIHJvd1Jhbmdlczogcm93UmFuZ2VzLFxuICAgIHJlc291cmNlRGVmaW5pdGlvbjogcmVzb3VyY2VEZWZpbml0aW9uLFxuICB9KTtcbn07XG5cbmNvbnN0IGRyYXdTd2ltTGFuZUhpZ2hsaWdodHMgPSAoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBzY2FsZTogU2NhbGUsXG4gIHJvd1JhbmdlczogTWFwPG51bWJlciwgUm93UmFuZ2U+LFxuICB0b3RhbE51bWJlck9mRGF5czogbnVtYmVyLFxuICBncm91cENvbG9yOiBzdHJpbmdcbikgPT4ge1xuICBjdHguZmlsbFN0eWxlID0gZ3JvdXBDb2xvcjtcblxuICBsZXQgZ3JvdXAgPSAwO1xuICByb3dSYW5nZXMuZm9yRWFjaCgocm93UmFuZ2U6IFJvd1JhbmdlKSA9PiB7XG4gICAgY29uc3QgdG9wTGVmdCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgICByb3dSYW5nZS5zdGFydCxcbiAgICAgIDAsXG4gICAgICBGZWF0dXJlLmdyb3VwRW52ZWxvcGVTdGFydFxuICAgICk7XG4gICAgY29uc3QgYm90dG9tUmlnaHQgPSBzY2FsZS5mZWF0dXJlKFxuICAgICAgcm93UmFuZ2UuZmluaXNoLFxuICAgICAgdG90YWxOdW1iZXJPZkRheXMgKyAxLFxuICAgICAgRmVhdHVyZS50YXNrRW52ZWxvcGVUb3BcbiAgICApO1xuICAgIGdyb3VwKys7XG4gICAgLy8gT25seSBoaWdobGlnaHQgZXZlcnkgb3RoZXIgZ3JvdXAgYmFja2dyb3VkIHdpdGggdGhlIGdyb3VwQ29sb3IuXG4gICAgaWYgKGdyb3VwICUgMiA9PSAxKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGN0eC5maWxsUmVjdChcbiAgICAgIHRvcExlZnQueCxcbiAgICAgIHRvcExlZnQueSxcbiAgICAgIGJvdHRvbVJpZ2h0LnggLSB0b3BMZWZ0LngsXG4gICAgICBib3R0b21SaWdodC55IC0gdG9wTGVmdC55XG4gICAgKTtcbiAgfSk7XG59O1xuXG5jb25zdCBkcmF3U3dpbUxhbmVMYWJlbHMgPSAoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICByZXNvdXJjZURlZmluaXRpb246IFJlc291cmNlRGVmaW5pdGlvbixcbiAgc2NhbGU6IFNjYWxlLFxuICByb3dSYW5nZXM6IE1hcDxudW1iZXIsIFJvd1JhbmdlPlxuKSA9PiB7XG4gIGlmIChyb3dSYW5nZXMpIGN0eC5saW5lV2lkdGggPSAxO1xuICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICBjb25zdCBncm91cEJ5T3JpZ2luID0gc2NhbGUuZmVhdHVyZSgwLCAwLCBGZWF0dXJlLmdyb3VwQnlPcmlnaW4pO1xuXG4gIGlmIChvcHRzLmhhc1RpbWVsaW5lKSB7XG4gICAgY3R4LnRleHRCYXNlbGluZSA9IFwiYm90dG9tXCI7XG4gICAgY3R4LmZpbGxUZXh0KG9wdHMuZ3JvdXBCeVJlc291cmNlLCBncm91cEJ5T3JpZ2luLngsIGdyb3VwQnlPcmlnaW4ueSk7XG4gIH1cblxuICBpZiAob3B0cy5oYXNUYXNrcykge1xuICAgIGN0eC50ZXh0QmFzZWxpbmUgPSBcInRvcFwiO1xuICAgIHJvd1Jhbmdlcy5mb3JFYWNoKChyb3dSYW5nZTogUm93UmFuZ2UsIHJlc291cmNlSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgaWYgKHJvd1JhbmdlLnN0YXJ0ID09PSByb3dSYW5nZS5maW5pc2gpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgdGV4dFN0YXJ0ID0gc2NhbGUuZmVhdHVyZShcbiAgICAgICAgcm93UmFuZ2Uuc3RhcnQsXG4gICAgICAgIDAsXG4gICAgICAgIEZlYXR1cmUuZ3JvdXBUZXh0U3RhcnRcbiAgICAgICk7XG4gICAgICBjdHguZmlsbFRleHQoXG4gICAgICAgIHJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXNbcmVzb3VyY2VJbmRleF0sXG4gICAgICAgIHRleHRTdGFydC54LFxuICAgICAgICB0ZXh0U3RhcnQueVxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxufTtcbiIsICJpbXBvcnQgeyBSZXN1bHQsIG9rLCBlcnJvciB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IFRhc2ssIENoYXJ0LCBDaGFydFZhbGlkYXRlIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBEaXJlY3RlZEVkZ2UsIGVkZ2VzQnlTcmNBbmREc3RUb01hcCB9IGZyb20gXCIuLi9kYWcvZGFnLnRzXCI7XG5pbXBvcnQgeyBSb3VuZGVyIH0gZnJvbSBcIi4uL3R5cGVzL3R5cGVzLnRzXCI7XG5cbi8qKiBTcGFuIHJlcHJlc2VudHMgd2hlbiBhIHRhc2sgd2lsbCBiZSBkb25lLCBpLmUuIGl0IGNvbnRhaW5zIHRoZSB0aW1lIHRoZSB0YXNrXG4gKiBpcyBleHBlY3RlZCB0byBiZWdpbiBhbmQgZW5kLiAqL1xuZXhwb3J0IGNsYXNzIFNwYW4ge1xuICBzdGFydDogbnVtYmVyO1xuICBmaW5pc2g6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihzdGFydDogbnVtYmVyID0gMCwgZmluaXNoOiBudW1iZXIgPSAwKSB7XG4gICAgdGhpcy5zdGFydCA9IHN0YXJ0O1xuICAgIHRoaXMuZmluaXNoID0gZmluaXNoO1xuICB9XG59XG5cbi8qKiBUaGUgc3RhbmRhcmQgc2xhY2sgY2FsY3VsYXRpb24gdmFsdWVzLiAqL1xuZXhwb3J0IGNsYXNzIFNsYWNrIHtcbiAgZWFybHk6IFNwYW4gPSBuZXcgU3BhbigpO1xuICBsYXRlOiBTcGFuID0gbmV3IFNwYW4oKTtcbiAgc2xhY2s6IG51bWJlciA9IDA7XG59XG5cbmV4cG9ydCB0eXBlIFRhc2tEdXJhdGlvbiA9ICh0OiBUYXNrLCB0YXNrSW5kZXg6IG51bWJlcikgPT4gbnVtYmVyO1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdFRhc2tEdXJhdGlvbiA9ICh0OiBUYXNrKTogbnVtYmVyID0+IHtcbiAgcmV0dXJuIHQuZHVyYXRpb247XG59O1xuXG5leHBvcnQgdHlwZSBTbGFja1Jlc3VsdCA9IFJlc3VsdDxTbGFja1tdPjtcblxuLy8gQ2FsY3VsYXRlIHRoZSBzbGFjayBmb3IgZWFjaCBUYXNrIGluIHRoZSBDaGFydC5cbmV4cG9ydCBmdW5jdGlvbiBDb21wdXRlU2xhY2soXG4gIGM6IENoYXJ0LFxuICB0YXNrRHVyYXRpb246IFRhc2tEdXJhdGlvbiA9IGRlZmF1bHRUYXNrRHVyYXRpb24sXG4gIHJvdW5kOiBSb3VuZGVyXG4pOiBTbGFja1Jlc3VsdCB7XG4gIC8vIENyZWF0ZSBhIFNsYWNrIGZvciBlYWNoIFRhc2suXG4gIGNvbnN0IHNsYWNrczogU2xhY2tbXSA9IG5ldyBBcnJheShjLlZlcnRpY2VzLmxlbmd0aCk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYy5WZXJ0aWNlcy5sZW5ndGg7IGkrKykge1xuICAgIHNsYWNrc1tpXSA9IG5ldyBTbGFjaygpO1xuICB9XG5cbiAgY29uc3QgciA9IENoYXJ0VmFsaWRhdGUoYyk7XG4gIGlmICghci5vaykge1xuICAgIHJldHVybiBlcnJvcihyLmVycm9yKTtcbiAgfVxuXG4gIGNvbnN0IGVkZ2VzID0gZWRnZXNCeVNyY0FuZERzdFRvTWFwKGMuRWRnZXMpO1xuXG4gIGNvbnN0IHRvcG9sb2dpY2FsT3JkZXIgPSByLnZhbHVlO1xuXG4gIC8vIEZpcnN0IGdvIGZvcndhcmQgdGhyb3VnaCB0aGUgdG9wb2xvZ2ljYWwgc29ydCBhbmQgZmluZCB0aGUgZWFybHkgc3RhcnQgZm9yXG4gIC8vIGVhY2ggdGFzaywgd2hpY2ggaXMgdGhlIG1heCBvZiBhbGwgdGhlIHByZWRlY2Vzc29ycyBlYXJseSBmaW5pc2ggdmFsdWVzLlxuICAvLyBTaW5jZSB3ZSBrbm93IHRoZSBkdXJhdGlvbiB3ZSBjYW4gYWxzbyBjb21wdXRlIHRoZSBlYXJseSBmaW5pc2guXG4gIHRvcG9sb2dpY2FsT3JkZXIuc2xpY2UoMSkuZm9yRWFjaCgodmVydGV4SW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHRhc2sgPSBjLlZlcnRpY2VzW3ZlcnRleEluZGV4XTtcbiAgICBjb25zdCBzbGFjayA9IHNsYWNrc1t2ZXJ0ZXhJbmRleF07XG4gICAgc2xhY2suZWFybHkuc3RhcnQgPSBNYXRoLm1heChcbiAgICAgIC4uLmVkZ2VzLmJ5RHN0LmdldCh2ZXJ0ZXhJbmRleCkhLm1hcCgoZTogRGlyZWN0ZWRFZGdlKTogbnVtYmVyID0+IHtcbiAgICAgICAgY29uc3QgcHJlZGVjZXNzb3JTbGFjayA9IHNsYWNrc1tlLmldO1xuICAgICAgICByZXR1cm4gcHJlZGVjZXNzb3JTbGFjay5lYXJseS5maW5pc2g7XG4gICAgICB9KVxuICAgICk7XG4gICAgc2xhY2suZWFybHkuZmluaXNoID0gcm91bmQoXG4gICAgICBzbGFjay5lYXJseS5zdGFydCArIHRhc2tEdXJhdGlvbih0YXNrLCB2ZXJ0ZXhJbmRleClcbiAgICApO1xuICB9KTtcblxuICAvLyBOb3cgYmFja3dhcmRzIHRocm91Z2ggdGhlIHRvcG9sb2dpY2FsIHNvcnQgYW5kIGZpbmQgdGhlIGxhdGUgZmluaXNoIG9mIGVhY2hcbiAgLy8gdGFzaywgd2hpY2ggaXMgdGhlIG1pbiBvZiBhbGwgdGhlIHN1Y2Nlc3NvciB0YXNrcyBsYXRlIHN0YXJ0cy4gQWdhaW4gc2luY2VcbiAgLy8gd2Uga25vdyB0aGUgZHVyYXRpb24gd2UgY2FuIGFsc28gY29tcHV0ZSB0aGUgbGF0ZSBzdGFydC4gRmluYWxseSwgc2luY2Ugd2VcbiAgLy8gbm93IGhhdmUgYWxsIHRoZSBlYXJseS9sYXRlIGFuZCBzdGFydC9maW5pc2ggdmFsdWVzIHdlIGNhbiBub3cgY2FsY3VhdGUgdGhlXG4gIC8vIHNsYWNrLlxuICB0b3BvbG9naWNhbE9yZGVyLnJldmVyc2UoKS5mb3JFYWNoKCh2ZXJ0ZXhJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgY29uc3QgdGFzayA9IGMuVmVydGljZXNbdmVydGV4SW5kZXhdO1xuICAgIGNvbnN0IHNsYWNrID0gc2xhY2tzW3ZlcnRleEluZGV4XTtcbiAgICBjb25zdCBzdWNjZXNzb3JzID0gZWRnZXMuYnlTcmMuZ2V0KHZlcnRleEluZGV4KTtcbiAgICBpZiAoIXN1Y2Nlc3NvcnMpIHtcbiAgICAgIHNsYWNrLmxhdGUuZmluaXNoID0gc2xhY2suZWFybHkuZmluaXNoO1xuICAgICAgc2xhY2subGF0ZS5zdGFydCA9IHNsYWNrLmVhcmx5LnN0YXJ0O1xuICAgIH0gZWxzZSB7XG4gICAgICBzbGFjay5sYXRlLmZpbmlzaCA9IE1hdGgubWluKFxuICAgICAgICAuLi5lZGdlcy5ieVNyYy5nZXQodmVydGV4SW5kZXgpIS5tYXAoKGU6IERpcmVjdGVkRWRnZSk6IG51bWJlciA9PiB7XG4gICAgICAgICAgY29uc3Qgc3VjY2Vzc29yU2xhY2sgPSBzbGFja3NbZS5qXTtcbiAgICAgICAgICByZXR1cm4gc3VjY2Vzc29yU2xhY2subGF0ZS5zdGFydDtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgICBzbGFjay5sYXRlLnN0YXJ0ID0gcm91bmQoXG4gICAgICAgIHNsYWNrLmxhdGUuZmluaXNoIC0gdGFza0R1cmF0aW9uKHRhc2ssIHZlcnRleEluZGV4KVxuICAgICAgKTtcbiAgICAgIHNsYWNrLnNsYWNrID0gcm91bmQoc2xhY2subGF0ZS5maW5pc2ggLSBzbGFjay5lYXJseS5maW5pc2gpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIG9rKHNsYWNrcyk7XG59XG5cbmV4cG9ydCBjb25zdCBDcml0aWNhbFBhdGggPSAoc2xhY2tzOiBTbGFja1tdLCByb3VuZDogUm91bmRlcik6IG51bWJlcltdID0+IHtcbiAgY29uc3QgcmV0OiBudW1iZXJbXSA9IFtdO1xuICBzbGFja3MuZm9yRWFjaCgoc2xhY2s6IFNsYWNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgaWYgKFxuICAgICAgcm91bmQoc2xhY2subGF0ZS5maW5pc2ggLSBzbGFjay5lYXJseS5maW5pc2gpIDwgTnVtYmVyLkVQU0lMT04gJiZcbiAgICAgIHJvdW5kKHNsYWNrLmVhcmx5LmZpbmlzaCAtIHNsYWNrLmVhcmx5LnN0YXJ0KSA+IE51bWJlci5FUFNJTE9OXG4gICAgKSB7XG4gICAgICByZXQucHVzaChpbmRleCk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHJldDtcbn07XG4iLCAiLy8gV2hlbiBhZGRpbmcgcHJvcGVydGllcyB0byBDb2xvclRoZW1lIGFsc28gbWFrZSBzdXJlIHRvIGFkZCBhIGNvcnJlc3BvbmRpbmdcbi8vIENTUyBAcHJvcGVydHkgZGVjbGFyYXRpb24uXG4vL1xuLy8gTm90ZSB0aGF0IGVhY2ggcHJvcGVydHkgYXNzdW1lcyB0aGUgcHJlc2VuY2Ugb2YgYSBDU1MgdmFyaWFibGUgb2YgdGhlIHNhbWUgbmFtZVxuLy8gd2l0aCBhIHByZWNlZWRpbmcgYC0tYC5cbmV4cG9ydCBpbnRlcmZhY2UgVGhlbWUge1xuICBzdXJmYWNlOiBzdHJpbmc7XG4gIG9uU3VyZmFjZTogc3RyaW5nO1xuICBvblN1cmZhY2VNdXRlZDogc3RyaW5nO1xuICBvblN1cmZhY2VTZWNvbmRhcnk6IHN0cmluZztcbiAgb3ZlcmxheTogc3RyaW5nO1xuICBncm91cENvbG9yOiBzdHJpbmc7XG4gIGhpZ2hsaWdodDogc3RyaW5nO1xufVxuXG50eXBlIFRoZW1lUHJvcCA9IGtleW9mIFRoZW1lO1xuXG5jb25zdCBjb2xvclRoZW1lUHJvdG90eXBlOiBUaGVtZSA9IHtcbiAgc3VyZmFjZTogXCJcIixcbiAgb25TdXJmYWNlOiBcIlwiLFxuICBvblN1cmZhY2VNdXRlZDogXCJcIixcbiAgb25TdXJmYWNlU2Vjb25kYXJ5OiBcIlwiLFxuICBvdmVybGF5OiBcIlwiLFxuICBncm91cENvbG9yOiBcIlwiLFxuICBoaWdobGlnaHQ6IFwiXCIsXG59O1xuXG5leHBvcnQgY29uc3QgY29sb3JUaGVtZUZyb21FbGVtZW50ID0gKGVsZTogSFRNTEVsZW1lbnQpOiBUaGVtZSA9PiB7XG4gIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbGUpO1xuICBjb25zdCByZXQgPSBPYmplY3QuYXNzaWduKHt9LCBjb2xvclRoZW1lUHJvdG90eXBlKTtcbiAgT2JqZWN0LmtleXMocmV0KS5mb3JFYWNoKChuYW1lOiBzdHJpbmcpID0+IHtcbiAgICByZXRbbmFtZSBhcyBUaGVtZVByb3BdID0gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShgLS0ke25hbWV9YCk7XG4gIH0pO1xuICByZXR1cm4gcmV0O1xufTtcbiIsICIvKiogV2hlbiB0aGUgZ2l2ZW4gZWxlbWVudCBpcyBjbGlja2VkLCB0aGVuIHRvZ2dsZSB0aGUgYGRhcmttb2RlYCBjbGFzcyBvbiB0aGVcbiAqIGJvZHkgZWxlbWVudC4gKi9cbmV4cG9ydCBjb25zdCB0b2dnbGVUaGVtZSA9ICgpID0+IHtcbiAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKFwiZGFya21vZGVcIik7XG59O1xuIiwgImltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgRmlsdGVyRnVuYyB9IGZyb20gXCIuL2NoYXJ0L2ZpbHRlci9maWx0ZXIudHNcIjtcbmltcG9ydCB7IGVkZ2VzQnlTcmNBbmREc3RUb01hcCB9IGZyb20gXCIuL2RhZy9kYWcudHNcIjtcbmltcG9ydCB7XG4gIER1cFRhc2tPcCxcbiAgSW5zZXJ0TmV3RW1wdHlUYXNrQWZ0ZXJPcCxcbiAgU2V0VGFza05hbWVPcCxcbiAgU3BsaXRUYXNrT3AsXG59IGZyb20gXCIuL29wcy9jaGFydC50c1wiO1xuaW1wb3J0IHsgU2V0TWV0cmljVmFsdWVPcCB9IGZyb20gXCIuL29wcy9tZXRyaWNzLnRzXCI7XG5pbXBvcnQgeyBPcCwgYXBwbHlBbGxPcHNUb1BsYW4gfSBmcm9tIFwiLi9vcHMvb3BzLnRzXCI7XG5pbXBvcnQge1xuICBBZGRSZXNvdXJjZU9wLFxuICBBZGRSZXNvdXJjZU9wdGlvbk9wLFxuICBTZXRSZXNvdXJjZVZhbHVlT3AsXG59IGZyb20gXCIuL29wcy9yZXNvdXJjZXMudHNcIjtcbmltcG9ydCB7IEZyb21KU09OLCBQbGFuIH0gZnJvbSBcIi4vcGxhbi9wbGFuLnRzXCI7XG5pbXBvcnQgeyBQcmVjaXNpb24gfSBmcm9tIFwiLi9wcmVjaXNpb24vcHJlY2lzaW9uLnRzXCI7XG5pbXBvcnQge1xuICBESVZJREVSX01PVkVfRVZFTlQsXG4gIERpdmlkZXJNb3ZlLFxuICBEaXZpZGVyTW92ZVJlc3VsdCxcbn0gZnJvbSBcIi4vcmVuZGVyZXIvZGl2aWRlcm1vdmUvZGl2aWRlcm1vdmUudHNcIjtcbmltcG9ydCB7XG4gIERSQUdfUkFOR0VfRVZFTlQsXG4gIERyYWdSYW5nZSxcbiAgTW91c2VNb3ZlLFxufSBmcm9tIFwiLi9yZW5kZXJlci9tb3VzZW1vdmUvbW91c2Vtb3ZlLnRzXCI7XG5pbXBvcnQgeyBEaXNwbGF5UmFuZ2UgfSBmcm9tIFwiLi9yZW5kZXJlci9yYW5nZS9yYW5nZS50c1wiO1xuaW1wb3J0IHtcbiAgUmVuZGVyT3B0aW9ucyxcbiAgVGFza0xhYmVsLFxuICByZW5kZXJUYXNrc1RvQ2FudmFzLFxufSBmcm9tIFwiLi9yZW5kZXJlci9yZW5kZXJlci50c1wiO1xuaW1wb3J0IHsgU2NhbGUgfSBmcm9tIFwiLi9yZW5kZXJlci9zY2FsZS9zY2FsZS50c1wiO1xuaW1wb3J0IHsgUmVzdWx0IH0gZnJvbSBcIi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBDb21wdXRlU2xhY2ssIENyaXRpY2FsUGF0aCwgU2xhY2ssIFNwYW4gfSBmcm9tIFwiLi9zbGFjay9zbGFjay50c1wiO1xuaW1wb3J0IHsgSmFjb2JpYW4sIFVuY2VydGFpbnR5IH0gZnJvbSBcIi4vc3RhdHMvY2RmL3RyaWFuZ3VsYXIvamFjb2JpYW4udHNcIjtcbmltcG9ydCB7IFRoZW1lLCBjb2xvclRoZW1lRnJvbUVsZW1lbnQgfSBmcm9tIFwiLi9zdHlsZS90aGVtZS90aGVtZS50c1wiO1xuaW1wb3J0IHsgdG9nZ2xlVGhlbWUgfSBmcm9tIFwiLi9zdHlsZS90b2dnbGVyL3RvZ2dsZXIudHNcIjtcblxuY29uc3QgRk9OVF9TSVpFX1BYID0gMzI7XG5cbmxldCBwbGFuID0gbmV3IFBsYW4oKTtcbmNvbnN0IHByZWNpc2lvbiA9IG5ldyBQcmVjaXNpb24oMik7XG5cbmNvbnN0IHJuZEludCA9IChuOiBudW1iZXIpOiBudW1iZXIgPT4ge1xuICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbik7XG59O1xuXG5jb25zdCBEVVJBVElPTiA9IDEwMDtcblxuY29uc3Qgcm5kRHVyYXRpb24gPSAoKTogbnVtYmVyID0+IHtcbiAgcmV0dXJuIHJuZEludChEVVJBVElPTik7XG59O1xuXG5jb25zdCBwZW9wbGU6IHN0cmluZ1tdID0gW1wiRnJlZFwiLCBcIkJhcm5leVwiLCBcIldpbG1hXCIsIFwiQmV0dHlcIl07XG5cbmxldCB0YXNrSUQgPSAwO1xuY29uc3Qgcm5kTmFtZSA9ICgpOiBzdHJpbmcgPT4gYFQgJHt0YXNrSUQrK31gO1xuXG5jb25zdCBvcHM6IE9wW10gPSBbQWRkUmVzb3VyY2VPcChcIlBlcnNvblwiKV07XG5cbnBlb3BsZS5mb3JFYWNoKChwZXJzb246IHN0cmluZykgPT4ge1xuICBvcHMucHVzaChBZGRSZXNvdXJjZU9wdGlvbk9wKFwiUGVyc29uXCIsIHBlcnNvbikpO1xufSk7XG5cbm9wcy5wdXNoKFxuICBJbnNlcnROZXdFbXB0eVRhc2tBZnRlck9wKDApLFxuICBTZXRNZXRyaWNWYWx1ZU9wKFwiRHVyYXRpb25cIiwgcm5kRHVyYXRpb24oKSwgMSksXG4gIFNldFRhc2tOYW1lT3AoMSwgcm5kTmFtZSgpKSxcbiAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiUGVyc29uXCIsIHBlb3BsZVtybmRJbnQocGVvcGxlLmxlbmd0aCldLCAxKSxcbiAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiVW5jZXJ0YWludHlcIiwgXCJtb2RlcmF0ZVwiLCAxKVxuKTtcblxubGV0IG51bVRhc2tzID0gMTtcbmZvciAobGV0IGkgPSAwOyBpIDwgMTU7IGkrKykge1xuICBsZXQgaW5kZXggPSBybmRJbnQobnVtVGFza3MpICsgMTtcbiAgb3BzLnB1c2goXG4gICAgU3BsaXRUYXNrT3AoaW5kZXgpLFxuICAgIFNldE1ldHJpY1ZhbHVlT3AoXCJEdXJhdGlvblwiLCBybmREdXJhdGlvbigpLCBpbmRleCArIDEpLFxuICAgIFNldFRhc2tOYW1lT3AoaW5kZXggKyAxLCBybmROYW1lKCkpLFxuICAgIFNldFJlc291cmNlVmFsdWVPcChcIlBlcnNvblwiLCBwZW9wbGVbcm5kSW50KHBlb3BsZS5sZW5ndGgpXSwgaW5kZXggKyAxKSxcbiAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJVbmNlcnRhaW50eVwiLCBcIm1vZGVyYXRlXCIsIGluZGV4ICsgMSlcbiAgKTtcbiAgbnVtVGFza3MrKztcbiAgaW5kZXggPSBybmRJbnQobnVtVGFza3MpICsgMTtcbiAgb3BzLnB1c2goXG4gICAgRHVwVGFza09wKGluZGV4KSxcbiAgICBTZXRNZXRyaWNWYWx1ZU9wKFwiRHVyYXRpb25cIiwgcm5kRHVyYXRpb24oKSwgaW5kZXggKyAxKSxcbiAgICBTZXRUYXNrTmFtZU9wKGluZGV4ICsgMSwgcm5kTmFtZSgpKSxcbiAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJQZXJzb25cIiwgcGVvcGxlW3JuZEludChwZW9wbGUubGVuZ3RoKV0sIGluZGV4ICsgMSksXG4gICAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiVW5jZXJ0YWludHlcIiwgXCJtb2RlcmF0ZVwiLCBpbmRleCArIDEpXG4gICk7XG4gIG51bVRhc2tzKys7XG59XG5cbmNvbnN0IHJlcyA9IGFwcGx5QWxsT3BzVG9QbGFuKG9wcywgcGxhbik7XG5cbmlmICghcmVzLm9rKSB7XG4gIGNvbnNvbGUubG9nKHJlcy5lcnJvcik7XG59XG5cbmxldCBzbGFja3M6IFNsYWNrW10gPSBbXTtcbmxldCBzcGFuczogU3BhbltdID0gW107XG5sZXQgY3JpdGljYWxQYXRoOiBudW1iZXJbXSA9IFtdO1xuXG5jb25zdCByZWNhbGN1bGF0ZVNwYW4gPSAoKSA9PiB7XG4gIGNvbnN0IHNsYWNrUmVzdWx0ID0gQ29tcHV0ZVNsYWNrKHBsYW4uY2hhcnQsIHVuZGVmaW5lZCwgcHJlY2lzaW9uLnJvdW5kZXIoKSk7XG4gIGlmICghc2xhY2tSZXN1bHQub2spIHtcbiAgICBjb25zb2xlLmVycm9yKHNsYWNrUmVzdWx0KTtcbiAgfSBlbHNlIHtcbiAgICBzbGFja3MgPSBzbGFja1Jlc3VsdC52YWx1ZTtcbiAgfVxuXG4gIHNwYW5zID0gc2xhY2tzLm1hcCgodmFsdWU6IFNsYWNrKTogU3BhbiA9PiB7XG4gICAgcmV0dXJuIHZhbHVlLmVhcmx5O1xuICB9KTtcbiAgY3JpdGljYWxQYXRoID0gQ3JpdGljYWxQYXRoKHNsYWNrcywgcHJlY2lzaW9uLnJvdW5kZXIoKSk7XG59O1xuXG5yZWNhbGN1bGF0ZVNwYW4oKTtcblxuY29uc3QgdGFza0xhYmVsOiBUYXNrTGFiZWwgPSAodGFza0luZGV4OiBudW1iZXIpOiBzdHJpbmcgPT5cbiAgYCR7cGxhbi5jaGFydC5WZXJ0aWNlc1t0YXNrSW5kZXhdLm5hbWV9YDtcbi8vICBgJHtwbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tJbmRleF0ubmFtZX0gKCR7cGxhbi5jaGFydC5WZXJ0aWNlc1t0YXNrSW5kZXhdLnJlc291cmNlc1tcIlBlcnNvblwiXX0pIGA7XG5cbi8vIERyYWdnaW5nIG9uIHRoZSByYWRhci5cblxuLy8gVE9ETyBFeHRyYWN0IHRoaXMgYXMgYSBoZWxwZXIgZm9yIHRoZSByYWRhciB2aWV3LlxubGV0IGRpc3BsYXlSYW5nZTogRGlzcGxheVJhbmdlIHwgbnVsbCA9IG51bGw7XG5sZXQgc2NhbGU6IFNjYWxlIHwgbnVsbCA9IG51bGw7XG5cbmNvbnN0IHJhZGFyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oXCIjcmFkYXJcIikhO1xubmV3IE1vdXNlTW92ZShyYWRhcik7XG5cbmNvbnN0IGRyYWdSYW5nZUhhbmRsZXIgPSAoZTogQ3VzdG9tRXZlbnQ8RHJhZ1JhbmdlPikgPT4ge1xuICBpZiAoc2NhbGUgPT09IG51bGwpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc29sZS5sb2coXCJtb3VzZVwiLCBlLmRldGFpbCk7XG4gIGNvbnN0IGJlZ2luID0gc2NhbGUuZGF5Um93RnJvbVBvaW50KGUuZGV0YWlsLmJlZ2luKTtcbiAgY29uc3QgZW5kID0gc2NhbGUuZGF5Um93RnJvbVBvaW50KGUuZGV0YWlsLmVuZCk7XG4gIGRpc3BsYXlSYW5nZSA9IG5ldyBEaXNwbGF5UmFuZ2UoYmVnaW4uZGF5LCBlbmQuZGF5KTtcbiAgY29uc29sZS5sb2coZGlzcGxheVJhbmdlKTtcbiAgcGFpbnRDaGFydCgpO1xufTtcblxucmFkYXIuYWRkRXZlbnRMaXN0ZW5lcihEUkFHX1JBTkdFX0VWRU5ULCBkcmFnUmFuZ2VIYW5kbGVyIGFzIEV2ZW50TGlzdGVuZXIpO1xuXG4vLyBEaXZpZGVyIGRyYWdnaW5nLlxuY29uc3Qgd3JhcHBlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KFwiLndyYXBwZXJcIikhO1xuY29uc3QgZGl2aWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KFwiI2RpdmlkZXJcIikhO1xubmV3IERpdmlkZXJNb3ZlKGRvY3VtZW50LmJvZHksIGRpdmlkZXIsIFwiY29sdW1uXCIpO1xuXG5jb25zdCBkaXZpZGVyRHJhZ1JhbmdlSGFuZGxlciA9IChlOiBDdXN0b21FdmVudDxEaXZpZGVyTW92ZVJlc3VsdD4pID0+IHtcbiAgd3JhcHBlci5zdHlsZS5zZXRQcm9wZXJ0eShcbiAgICBcImdyaWQtdGVtcGxhdGUtY29sdW1uc1wiLFxuICAgIGBjYWxjKCR7ZS5kZXRhaWwuYmVmb3JlfSUgLSAxNXB4KSAxMHB4IGF1dG9gXG4gICk7XG4gIHBhaW50Q2hhcnQoKTtcbn07XG5cbmRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcihcbiAgRElWSURFUl9NT1ZFX0VWRU5ULFxuICBkaXZpZGVyRHJhZ1JhbmdlSGFuZGxlciBhcyBFdmVudExpc3RlbmVyXG4pO1xuXG5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Jlc2V0LXpvb21cIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gIGRpc3BsYXlSYW5nZSA9IG51bGw7XG4gIHBhaW50Q2hhcnQoKTtcbn0pO1xuXG5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RhcmstbW9kZS10b2dnbGVcIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKFwiY2xpY2tcIik7XG4gIHRvZ2dsZVRoZW1lKCk7XG4gIHBhaW50Q2hhcnQoKTtcbn0pO1xuXG5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3JhZGFyLXRvZ2dsZVwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyYWRhci1wYXJlbnRcIikhLmNsYXNzTGlzdC50b2dnbGUoXCJoaWRkZW5cIik7XG59KTtcblxubGV0IHRvcFRpbWVsaW5lOiBib29sZWFuID0gZmFsc2U7XG5cbmRvY3VtZW50XG4gIC5xdWVyeVNlbGVjdG9yKFwiI3RvcC10aW1lbGluZS10b2dnbGVcIikhXG4gIC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIHRvcFRpbWVsaW5lID0gIXRvcFRpbWVsaW5lO1xuICAgIHBhaW50Q2hhcnQoKTtcbiAgfSk7XG5cbmxldCBncm91cEJ5T3B0aW9uczogc3RyaW5nW10gPSBbXCJcIiwgLi4uT2JqZWN0LmtleXMocGxhbi5yZXNvdXJjZURlZmluaXRpb25zKV07XG5sZXQgZ3JvdXBCeU9wdGlvbnNJbmRleDogbnVtYmVyID0gMDtcblxuY29uc3QgdG9nZ2xlR3JvdXBCeSA9ICgpID0+IHtcbiAgZ3JvdXBCeU9wdGlvbnNJbmRleCA9IChncm91cEJ5T3B0aW9uc0luZGV4ICsgMSkgJSBncm91cEJ5T3B0aW9ucy5sZW5ndGg7XG59O1xuXG5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dyb3VwLWJ5LXRvZ2dsZVwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgdG9nZ2xlR3JvdXBCeSgpO1xuICBwYWludENoYXJ0KCk7XG59KTtcblxubGV0IGNyaXRpY2FsUGF0aHNPbmx5ID0gZmFsc2U7XG5jb25zdCB0b2dnbGVDcml0aWNhbFBhdGhzT25seSA9ICgpID0+IHtcbiAgY3JpdGljYWxQYXRoc09ubHkgPSAhY3JpdGljYWxQYXRoc09ubHk7XG59O1xuXG5kb2N1bWVudFxuICAucXVlcnlTZWxlY3RvcihcIiNjcml0aWNhbC1wYXRocy10b2dnbGVcIikhXG4gIC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIHRvZ2dsZUNyaXRpY2FsUGF0aHNPbmx5KCk7XG4gICAgcGFpbnRDaGFydCgpO1xuICB9KTtcblxuY29uc3QgcGFpbnRDaGFydCA9ICgpID0+IHtcbiAgY29uc29sZS50aW1lKFwicGFpbnRDaGFydFwiKTtcblxuICBjb25zdCB0aGVtZUNvbG9yczogVGhlbWUgPSBjb2xvclRoZW1lRnJvbUVsZW1lbnQoZG9jdW1lbnQuYm9keSk7XG5cbiAgbGV0IGZpbHRlckZ1bmM6IEZpbHRlckZ1bmMgfCBudWxsID0gbnVsbDtcbiAgaWYgKGNyaXRpY2FsUGF0aHNPbmx5KSB7XG4gICAgY29uc3QgaGlnaGxpZ2h0U2V0ID0gbmV3IFNldChjcml0aWNhbFBhdGgpO1xuICAgIGNvbnN0IHN0YXJ0QW5kRmluaXNoID0gWzAsIHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMV07XG4gICAgZmlsdGVyRnVuYyA9ICh0YXNrOiBUYXNrLCB0YXNrSW5kZXg6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xuICAgICAgaWYgKHN0YXJ0QW5kRmluaXNoLmluY2x1ZGVzKHRhc2tJbmRleCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gaGlnaGxpZ2h0U2V0Lmhhcyh0YXNrSW5kZXgpO1xuICAgIH07XG4gIH1cblxuICBjb25zdCByYWRhck9wdHM6IFJlbmRlck9wdGlvbnMgPSB7XG4gICAgZm9udFNpemVQeDogNixcbiAgICBoYXNUZXh0OiBmYWxzZSxcbiAgICBkaXNwbGF5UmFuZ2U6IGRpc3BsYXlSYW5nZSxcbiAgICBkaXNwbGF5UmFuZ2VVc2FnZTogXCJoaWdobGlnaHRcIixcbiAgICBjb2xvcnM6IHtcbiAgICAgIHN1cmZhY2U6IHRoZW1lQ29sb3JzLnN1cmZhY2UsXG4gICAgICBvblN1cmZhY2U6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZSxcbiAgICAgIG9uU3VyZmFjZU11dGVkOiB0aGVtZUNvbG9ycy5vblN1cmZhY2VNdXRlZCxcbiAgICAgIG9uU3VyZmFjZUhpZ2hsaWdodDogdGhlbWVDb2xvcnMub25TdXJmYWNlU2Vjb25kYXJ5LFxuICAgICAgb3ZlcmxheTogdGhlbWVDb2xvcnMub3ZlcmxheSxcbiAgICAgIGdyb3VwQ29sb3I6IHRoZW1lQ29sb3JzLmdyb3VwQ29sb3IsXG4gICAgICBoaWdobGlnaHQ6IHRoZW1lQ29sb3JzLmhpZ2hsaWdodCxcbiAgICB9LFxuICAgIGhhc1RpbWVsaW5lOiBmYWxzZSxcbiAgICBoYXNUYXNrczogdHJ1ZSxcbiAgICBoYXNFZGdlczogZmFsc2UsXG4gICAgZHJhd1RpbWVNYXJrZXJzT25UYXNrczogZmFsc2UsXG4gICAgdGFza0xhYmVsOiB0YXNrTGFiZWwsXG4gICAgdGFza0VtcGhhc2l6ZTogY3JpdGljYWxQYXRoLFxuICAgIGZpbHRlckZ1bmM6IG51bGwsXG4gICAgZ3JvdXBCeVJlc291cmNlOiBncm91cEJ5T3B0aW9uc1tncm91cEJ5T3B0aW9uc0luZGV4XSxcbiAgICBoaWdobGlnaHRlZFRhc2s6IG51bGwsXG4gIH07XG5cbiAgY29uc3Qgem9vbU9wdHM6IFJlbmRlck9wdGlvbnMgPSB7XG4gICAgZm9udFNpemVQeDogRk9OVF9TSVpFX1BYLFxuICAgIGhhc1RleHQ6IHRydWUsXG4gICAgZGlzcGxheVJhbmdlOiBkaXNwbGF5UmFuZ2UsXG4gICAgZGlzcGxheVJhbmdlVXNhZ2U6IFwicmVzdHJpY3RcIixcbiAgICBjb2xvcnM6IHtcbiAgICAgIHN1cmZhY2U6IHRoZW1lQ29sb3JzLnN1cmZhY2UsXG4gICAgICBvblN1cmZhY2U6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZSxcbiAgICAgIG9uU3VyZmFjZU11dGVkOiB0aGVtZUNvbG9ycy5vblN1cmZhY2VNdXRlZCxcbiAgICAgIG9uU3VyZmFjZUhpZ2hsaWdodDogdGhlbWVDb2xvcnMub25TdXJmYWNlU2Vjb25kYXJ5LFxuICAgICAgb3ZlcmxheTogdGhlbWVDb2xvcnMub3ZlcmxheSxcbiAgICAgIGdyb3VwQ29sb3I6IHRoZW1lQ29sb3JzLmdyb3VwQ29sb3IsXG4gICAgICBoaWdobGlnaHQ6IHRoZW1lQ29sb3JzLmhpZ2hsaWdodCxcbiAgICB9LFxuICAgIGhhc1RpbWVsaW5lOiB0b3BUaW1lbGluZSxcbiAgICBoYXNUYXNrczogdHJ1ZSxcbiAgICBoYXNFZGdlczogdHJ1ZSxcbiAgICBkcmF3VGltZU1hcmtlcnNPblRhc2tzOiB0cnVlLFxuICAgIHRhc2tMYWJlbDogdGFza0xhYmVsLFxuICAgIHRhc2tFbXBoYXNpemU6IGNyaXRpY2FsUGF0aCxcbiAgICBmaWx0ZXJGdW5jOiBmaWx0ZXJGdW5jLFxuICAgIGdyb3VwQnlSZXNvdXJjZTogZ3JvdXBCeU9wdGlvbnNbZ3JvdXBCeU9wdGlvbnNJbmRleF0sXG4gICAgaGlnaGxpZ2h0ZWRUYXNrOiAxLFxuICB9O1xuXG4gIGNvbnN0IHRpbWVsaW5lT3B0czogUmVuZGVyT3B0aW9ucyA9IHtcbiAgICBmb250U2l6ZVB4OiBGT05UX1NJWkVfUFgsXG4gICAgaGFzVGV4dDogdHJ1ZSxcbiAgICBkaXNwbGF5UmFuZ2U6IGRpc3BsYXlSYW5nZSxcbiAgICBkaXNwbGF5UmFuZ2VVc2FnZTogXCJyZXN0cmljdFwiLFxuICAgIGNvbG9yczoge1xuICAgICAgc3VyZmFjZTogdGhlbWVDb2xvcnMuc3VyZmFjZSxcbiAgICAgIG9uU3VyZmFjZTogdGhlbWVDb2xvcnMub25TdXJmYWNlLFxuICAgICAgb25TdXJmYWNlTXV0ZWQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZU11dGVkLFxuICAgICAgb25TdXJmYWNlSGlnaGxpZ2h0OiB0aGVtZUNvbG9ycy5vblN1cmZhY2VTZWNvbmRhcnksXG4gICAgICBvdmVybGF5OiB0aGVtZUNvbG9ycy5vdmVybGF5LFxuICAgICAgZ3JvdXBDb2xvcjogdGhlbWVDb2xvcnMuZ3JvdXBDb2xvcixcbiAgICAgIGhpZ2hsaWdodDogdGhlbWVDb2xvcnMuaGlnaGxpZ2h0LFxuICAgIH0sXG4gICAgaGFzVGltZWxpbmU6IHRydWUsXG4gICAgaGFzVGFza3M6IGZhbHNlLFxuICAgIGhhc0VkZ2VzOiB0cnVlLFxuICAgIGRyYXdUaW1lTWFya2Vyc09uVGFza3M6IHRydWUsXG4gICAgdGFza0xhYmVsOiB0YXNrTGFiZWwsXG4gICAgdGFza0VtcGhhc2l6ZTogY3JpdGljYWxQYXRoLFxuICAgIGZpbHRlckZ1bmM6IGZpbHRlckZ1bmMsXG4gICAgZ3JvdXBCeVJlc291cmNlOiBncm91cEJ5T3B0aW9uc1tncm91cEJ5T3B0aW9uc0luZGV4XSxcbiAgICBoaWdobGlnaHRlZFRhc2s6IG51bGwsXG4gIH07XG5cbiAgcGFpbnRPbmVDaGFydChcIiN6b29tZWRcIiwgem9vbU9wdHMpO1xuICBwYWludE9uZUNoYXJ0KFwiI3RpbWVsaW5lXCIsIHRpbWVsaW5lT3B0cyk7XG4gIGNvbnN0IHJldCA9IHBhaW50T25lQ2hhcnQoXCIjcmFkYXJcIiwgcmFkYXJPcHRzKTtcblxuICBpZiAoIXJldC5vaykge1xuICAgIHJldHVybjtcbiAgfVxuICBzY2FsZSA9IHJldC52YWx1ZTtcbiAgY29uc29sZS50aW1lRW5kKFwicGFpbnRDaGFydFwiKTtcbn07XG5cbmNvbnN0IHBhaW50T25lQ2hhcnQgPSAoXG4gIGNhbnZhc0lEOiBzdHJpbmcsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnNcbik6IFJlc3VsdDxTY2FsZT4gPT4ge1xuICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxDYW52YXNFbGVtZW50PihjYW52YXNJRCkhO1xuICBjb25zdCBwYXJlbnQgPSBjYW52YXMhLnBhcmVudEVsZW1lbnQhO1xuICBjb25zdCByYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuICBjb25zdCB3aWR0aCA9IHBhcmVudC5jbGllbnRXaWR0aCAtIEZPTlRfU0laRV9QWDtcbiAgY29uc3QgaGVpZ2h0ID0gcGFyZW50LmNsaWVudEhlaWdodDtcbiAgY29uc3QgY2FudmFzV2lkdGggPSBNYXRoLmNlaWwod2lkdGggKiByYXRpbyk7XG4gIGNvbnN0IGNhbnZhc0hlaWdodCA9IE1hdGguY2VpbChoZWlnaHQgKiByYXRpbyk7XG4gIGNhbnZhcy53aWR0aCA9IGNhbnZhc1dpZHRoO1xuICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzSGVpZ2h0O1xuICBjYW52YXMuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGA7XG4gIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgO1xuXG4gIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIikhO1xuICBjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG5cbiAgcmV0dXJuIHJlbmRlclRhc2tzVG9DYW52YXMocGFyZW50LCBjYW52YXMsIGN0eCwgcGxhbiwgc3BhbnMsIG9wdHMpO1xufTtcblxuZXhwb3J0IGludGVyZmFjZSBDcml0aWNhbFBhdGhFbnRyeSB7XG4gIGNvdW50OiBudW1iZXI7XG4gIHRhc2tzOiBudW1iZXJbXTtcbiAgZHVyYXRpb25zOiBudW1iZXJbXTtcbn1cblxuY29uc3Qgc2ltdWxhdGUgPSAoKSA9PiB7XG4gIC8vIFNpbXVsYXRlIHRoZSB1bmNlcnRhaW50eSBpbiB0aGUgcGxhbiBhbmQgZ2VuZXJhdGUgcG9zc2libGUgYWx0ZXJuYXRlXG4gIC8vIGNyaXRpY2FsIHBhdGhzLlxuICBjb25zdCBNQVhfUkFORE9NID0gMTAwMDtcbiAgY29uc3QgTlVNX1NJTVVMQVRJT05fTE9PUFMgPSAxMDA7XG5cbiAgY29uc3QgYWxsQ3JpdGljYWxQYXRocyA9IG5ldyBNYXA8c3RyaW5nLCBDcml0aWNhbFBhdGhFbnRyeT4oKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IE5VTV9TSU1VTEFUSU9OX0xPT1BTOyBpKyspIHtcbiAgICBjb25zdCBkdXJhdGlvbnMgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLm1hcCgodDogVGFzaykgPT4ge1xuICAgICAgY29uc3QgcmF3RHVyYXRpb24gPSBuZXcgSmFjb2JpYW4oXG4gICAgICAgIHQuZHVyYXRpb24sXG4gICAgICAgIHQuZ2V0UmVzb3VyY2UoXCJVbmNlcnRhaW50eVwiKSBhcyBVbmNlcnRhaW50eVxuICAgICAgKS5zYW1wbGUocm5kSW50KE1BWF9SQU5ET00pIC8gTUFYX1JBTkRPTSk7XG4gICAgICByZXR1cm4gcHJlY2lzaW9uLnJvdW5kKHJhd0R1cmF0aW9uKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHNsYWNrc1JldCA9IENvbXB1dGVTbGFjayhcbiAgICAgIHBsYW4uY2hhcnQsXG4gICAgICAodDogVGFzaywgdGFza0luZGV4OiBudW1iZXIpID0+IGR1cmF0aW9uc1t0YXNrSW5kZXhdLFxuICAgICAgcHJlY2lzaW9uLnJvdW5kZXIoKVxuICAgICk7XG4gICAgaWYgKCFzbGFja3NSZXQub2spIHtcbiAgICAgIHRocm93IHNsYWNrc1JldC5lcnJvcjtcbiAgICB9XG4gICAgY29uc3QgY3JpdGljYWxQYXRoID0gQ3JpdGljYWxQYXRoKHNsYWNrc1JldC52YWx1ZSwgcHJlY2lzaW9uLnJvdW5kZXIoKSk7XG4gICAgY29uc3QgY3JpdGljYWxQYXRoQXNTdHJpbmcgPSBgJHtjcml0aWNhbFBhdGh9YDtcbiAgICBsZXQgcGF0aEVudHJ5ID0gYWxsQ3JpdGljYWxQYXRocy5nZXQoY3JpdGljYWxQYXRoQXNTdHJpbmcpO1xuICAgIGlmIChwYXRoRW50cnkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcGF0aEVudHJ5ID0ge1xuICAgICAgICBjb3VudDogMCxcbiAgICAgICAgdGFza3M6IGNyaXRpY2FsUGF0aCxcbiAgICAgICAgZHVyYXRpb25zOiBkdXJhdGlvbnMsXG4gICAgICB9O1xuICAgICAgYWxsQ3JpdGljYWxQYXRocy5zZXQoY3JpdGljYWxQYXRoQXNTdHJpbmcsIHBhdGhFbnRyeSk7XG4gICAgfVxuICAgIHBhdGhFbnRyeS5jb3VudCsrO1xuICB9XG5cbiAgbGV0IGRpc3BsYXkgPSBcIlwiO1xuICBhbGxDcml0aWNhbFBhdGhzLmZvckVhY2goKHZhbHVlOiBDcml0aWNhbFBhdGhFbnRyeSwga2V5OiBzdHJpbmcpID0+IHtcbiAgICBkaXNwbGF5ID0gZGlzcGxheSArIGBcXG4gPGxpIGRhdGEta2V5PSR7a2V5fT4ke3ZhbHVlLmNvdW50fSA6ICR7a2V5fTwvbGk+YDtcbiAgfSk7XG5cbiAgY29uc3QgY3JpdGlhbFBhdGhzID1cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxVTGlzdEVsZW1lbnQ+KFwiI2NyaXRpY2FsUGF0aHNcIikhO1xuICBjcml0aWFsUGF0aHMuaW5uZXJIVE1MID0gZGlzcGxheTtcblxuICAvLyBFbmFibGUgY2xpY2tpbmcgb24gYWx0ZXJuYXRlIGNyaXRpY2FsIHBhdGhzLlxuICBjcml0aWFsUGF0aHMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgY29uc3QgY3JpdGljYWxQYXRoRW50cnkgPSBhbGxDcml0aWNhbFBhdGhzLmdldChcbiAgICAgIChlLnRhcmdldCBhcyBIVE1MTElFbGVtZW50KS5kYXRhc2V0LmtleSFcbiAgICApITtcbiAgICBjcml0aWNhbFBhdGhFbnRyeS5kdXJhdGlvbnMuZm9yRWFjaChcbiAgICAgIChkdXJhdGlvbjogbnVtYmVyLCB0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tJbmRleF0uZHVyYXRpb24gPSBkdXJhdGlvbjtcbiAgICAgIH1cbiAgICApO1xuICAgIHJlY2FsY3VsYXRlU3BhbigpO1xuICAgIHBhaW50Q2hhcnQoKTtcbiAgfSk7XG5cbiAgLy8gR2VuZXJhdGUgYSB0YWJsZSBvZiB0YXNrcyBvbiB0aGUgY3JpdGljYWwgcGF0aCwgc29ydGVkIGJ5IGR1cmF0aW9uLCBhbG9uZ1xuICAvLyB3aXRoIHRoZWlyIHBlcmNlbnRhZ2UgY2hhbmNlIG9mIGFwcGVhcmluZyBvbiB0aGUgY3JpdGljYWwgcGF0aC5cblxuICBpbnRlcmZhY2UgQ3JpdGljYWxQYXRoVGFza0VudHJ5IHtcbiAgICB0YXNrSW5kZXg6IG51bWJlcjtcbiAgICBkdXJhdGlvbjogbnVtYmVyO1xuICAgIG51bVRpbWVzQXBwZWFyZWQ6IG51bWJlcjtcbiAgfVxuXG4gIGNvbnN0IGNyaXRpYWxUYXNrczogTWFwPG51bWJlciwgQ3JpdGljYWxQYXRoVGFza0VudHJ5PiA9IG5ldyBNYXAoKTtcblxuICBhbGxDcml0aWNhbFBhdGhzLmZvckVhY2goKHZhbHVlOiBDcml0aWNhbFBhdGhFbnRyeSkgPT4ge1xuICAgIHZhbHVlLnRhc2tzLmZvckVhY2goKHRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBsZXQgdGFza0VudHJ5ID0gY3JpdGlhbFRhc2tzLmdldCh0YXNrSW5kZXgpO1xuICAgICAgaWYgKHRhc2tFbnRyeSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRhc2tFbnRyeSA9IHtcbiAgICAgICAgICB0YXNrSW5kZXg6IHRhc2tJbmRleCxcbiAgICAgICAgICBkdXJhdGlvbjogcGxhbi5jaGFydC5WZXJ0aWNlc1t0YXNrSW5kZXhdLmR1cmF0aW9uLFxuICAgICAgICAgIG51bVRpbWVzQXBwZWFyZWQ6IDAsXG4gICAgICAgIH07XG4gICAgICAgIGNyaXRpYWxUYXNrcy5zZXQodGFza0luZGV4LCB0YXNrRW50cnkpO1xuICAgICAgfVxuICAgICAgdGFza0VudHJ5Lm51bVRpbWVzQXBwZWFyZWQgKz0gdmFsdWUuY291bnQ7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGNvbnN0IGNyaXRpY2FsVGFza3NEdXJhdGlvbkRlc2NlbmRpbmcgPSBbLi4uY3JpdGlhbFRhc2tzLnZhbHVlcygpXS5zb3J0KFxuICAgIChhOiBDcml0aWNhbFBhdGhUYXNrRW50cnksIGI6IENyaXRpY2FsUGF0aFRhc2tFbnRyeSk6IG51bWJlciA9PiB7XG4gICAgICByZXR1cm4gYi5kdXJhdGlvbiAtIGEuZHVyYXRpb247XG4gICAgfVxuICApO1xuXG4gIGxldCBjcml0aWFsVGFza3NUYWJsZSA9IGNyaXRpY2FsVGFza3NEdXJhdGlvbkRlc2NlbmRpbmdcbiAgICAubWFwKFxuICAgICAgKHRhc2tFbnRyeTogQ3JpdGljYWxQYXRoVGFza0VudHJ5KSA9PiBgPHRyPlxuICA8dGQ+JHtwbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tFbnRyeS50YXNrSW5kZXhdLm5hbWV9PC90ZD5cbiAgPHRkPiR7dGFza0VudHJ5LmR1cmF0aW9ufTwvdGQ+XG4gIDx0ZD4ke01hdGguZmxvb3IoKDEwMCAqIHRhc2tFbnRyeS5udW1UaW1lc0FwcGVhcmVkKSAvIE5VTV9TSU1VTEFUSU9OX0xPT1BTKX08L3RkPlxuPC90cj5gXG4gICAgKVxuICAgIC5qb2luKFwiXFxuXCIpO1xuICBjcml0aWFsVGFza3NUYWJsZSA9XG4gICAgYDx0cj48dGg+TmFtZTwvdGg+PHRoPkR1cmF0aW9uPC90aD48dGg+JTwvdGg+PC90cj5cXG5gICsgY3JpdGlhbFRhc2tzVGFibGU7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY3JpdGljYWxUYXNrc1wiKSEuaW5uZXJIVE1MID0gY3JpdGlhbFRhc2tzVGFibGU7XG5cbiAgLy8gU2hvdyBhbGwgdGFza3MgdGhhdCBjb3VsZCBiZSBvbiB0aGUgY3JpdGljYWwgcGF0aC5cbiAgcmVjYWxjdWxhdGVTcGFuKCk7XG4gIGNyaXRpY2FsUGF0aCA9IGNyaXRpY2FsVGFza3NEdXJhdGlvbkRlc2NlbmRpbmcubWFwKFxuICAgICh0YXNrRW50cnk6IENyaXRpY2FsUGF0aFRhc2tFbnRyeSkgPT4gdGFza0VudHJ5LnRhc2tJbmRleFxuICApO1xuICBwYWludENoYXJ0KCk7XG5cbiAgLy8gUG9wdWxhdGUgdGhlIGRvd25sb2FkIGxpbmsuXG4gIGNvbnN0IGRvd25sb2FkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MTGlua0VsZW1lbnQ+KFwiI2Rvd25sb2FkXCIpITtcbiAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkocGxhbiwgbnVsbCwgXCIgIFwiKSk7XG4gIGNvbnN0IGRvd25sb2FkQmxvYiA9IG5ldyBCbG9iKFtKU09OLnN0cmluZ2lmeShwbGFuLCBudWxsLCBcIiAgXCIpXSwge1xuICAgIHR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICB9KTtcbiAgZG93bmxvYWQuaHJlZiA9IFVSTC5jcmVhdGVPYmplY3RVUkwoZG93bmxvYWRCbG9iKTtcbn07XG5cbi8vIFJlYWN0IHRvIHRoZSB1cGxvYWQgaW5wdXQuXG5jb25zdCBmaWxlVXBsb2FkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MSW5wdXRFbGVtZW50PihcIiNmaWxlLXVwbG9hZFwiKSE7XG5maWxlVXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgYXN5bmMgKCkgPT4ge1xuICBjb25zdCBqc29uID0gYXdhaXQgZmlsZVVwbG9hZC5maWxlcyFbMF0udGV4dCgpO1xuICBjb25zdCByZXQgPSBGcm9tSlNPTihqc29uKTtcbiAgaWYgKCFyZXQub2spIHtcbiAgICBjb25zb2xlLmxvZyhyZXQuZXJyb3IpO1xuICAgIHRocm93IHJldC5lcnJvcjtcbiAgfVxuICBwbGFuID0gcmV0LnZhbHVlO1xuICBncm91cEJ5T3B0aW9ucyA9IFtcIlwiLCAuLi5PYmplY3Qua2V5cyhwbGFuLnJlc291cmNlRGVmaW5pdGlvbnMpXTtcbiAgcmVjYWxjdWxhdGVTcGFuKCk7XG4gIHNpbXVsYXRlKCk7XG4gIGNvbnN0IG1hcHMgPSBlZGdlc0J5U3JjQW5kRHN0VG9NYXAocGxhbi5jaGFydC5FZGdlcyk7XG4gIGNvbnNvbGUubG9nKG1hcHMpO1xuICBjb25zb2xlLmxvZyhwbGFuKTtcbiAgcGFpbnRDaGFydCgpO1xufSk7XG5cbmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2ltdWxhdGVcIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gIHNpbXVsYXRlKCk7XG4gIHBhaW50Q2hhcnQoKTtcbn0pO1xuXG5zaW11bGF0ZSgpO1xucGFpbnRDaGFydCgpO1xud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgcGFpbnRDaGFydCk7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7QUFpQk8sTUFBTSxlQUFOLE1BQW1CO0FBQUEsSUFDeEIsSUFBWTtBQUFBLElBQ1osSUFBWTtBQUFBLElBRVosWUFBWSxJQUFZLEdBQUcsSUFBWSxHQUFHO0FBQ3hDLFdBQUssSUFBSTtBQUNULFdBQUssSUFBSTtBQUFBLElBQ1g7QUFBQSxJQUVBLE1BQU0sS0FBNEI7QUFDaEMsYUFBTyxJQUFJLE1BQU0sS0FBSyxLQUFLLElBQUksTUFBTSxLQUFLO0FBQUEsSUFDNUM7QUFBQSxJQUVBLFNBQWlDO0FBQy9CLGFBQU87QUFBQSxRQUNMLEdBQUcsS0FBSztBQUFBLFFBQ1IsR0FBRyxLQUFLO0FBQUEsTUFDVjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBa0JPLE1BQU0sa0JBQWtCLENBQUMsVUFBcUM7QUFDbkUsVUFBTSxNQUFNLG9CQUFJLElBQW1CO0FBRW5DLFVBQU0sUUFBUSxDQUFDLE1BQW9CO0FBQ2pDLFlBQU0sTUFBTSxJQUFJLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQztBQUM3QixVQUFJLEtBQUssQ0FBQztBQUNWLFVBQUksSUFBSSxFQUFFLEdBQUcsR0FBRztBQUFBLElBQ2xCLENBQUM7QUFFRCxXQUFPO0FBQUEsRUFDVDtBQVVPLE1BQU0sa0JBQWtCLENBQUMsVUFBcUM7QUFDbkUsVUFBTSxNQUFNLG9CQUFJLElBQW1CO0FBRW5DLFVBQU0sUUFBUSxDQUFDLE1BQW9CO0FBQ2pDLFlBQU0sTUFBTSxJQUFJLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQztBQUM3QixVQUFJLEtBQUssQ0FBQztBQUNWLFVBQUksSUFBSSxFQUFFLEdBQUcsR0FBRztBQUFBLElBQ2xCLENBQUM7QUFFRCxXQUFPO0FBQUEsRUFDVDtBQU9PLE1BQU0sd0JBQXdCLENBQUMsVUFBa0M7QUFDdEUsVUFBTSxNQUFN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SUFDbEQ7QUFDQSxlQUFXO0FBR1gsVUFBTSxXQUFXLFNBQVMsY0FBK0IsV0FBVztBQUNwRSxZQUFRLElBQUksS0FBSyxVQUFVLE1BQU0sTUFBTSxJQUFJLENBQUM7QUFDNUMsVUFBTSxlQUFlLElBQUksS0FBSyxDQUFDLEtBQUssVUFBVSxNQUFNLE1BQU0sSUFBSSxDQUFDLEdBQUc7QUFBQSxNQUNoRSxNQUFNO0FBQUEsSUFDUixDQUFDO0FBQ0QsYUFBUyxPQUFPLElBQUksZ0JBQWdCLFlBQVk7QUFBQSxFQUNsRDtBQUdBLE1BQU0sYUFBYSxTQUFTLGNBQWdDLGNBQWM7QUFDMUUsYUFBVyxpQkFBaUIsVUFBVSxZQUFZO0FBQ2hELFVBQU0sT0FBTyxNQUFNLFdBQVcsTUFBTyxDQUFDLEVBQUUsS0FBSztBQUM3QyxVQUFNLE1BQU0sU0FBUyxJQUFJO0FBQ3pCLFFBQUksQ0FBQyxJQUFJLElBQUk7QUFDWCxjQUFRLElBQUksSUFBSSxLQUFLO0FBQ3JCLFlBQU0sSUFBSTtBQUFBLElBQ1o7QUFDQSxXQUFPLElBQUk7QUFDWCxxQkFBaUIsQ0FBQyxJQUFJLEdBQUcsT0FBTyxLQUFLLEtBQUssbUJBQW1CLENBQUM7QUFDOUQsb0JBQWdCO0FBQ2hCLGFBQVM7QUFDVCxVQUFNLE9BQU8sc0JBQXNCLEtBQUssTUFBTSxLQUFLO0FBQ25ELFlBQVEsSUFBSSxJQUFJO0FBQ2hCLFlBQVEsSUFBSSxJQUFJO0FBQ2hCLGVBQVc7QUFBQSxFQUNiLENBQUM7QUFFRCxXQUFTLGNBQWMsV0FBVyxFQUFHLGlCQUFpQixTQUFTLE1BQU07QUFDbkUsYUFBUztBQUNULGVBQVc7QUFBQSxFQUNiLENBQUM7QUFFRCxXQUFTO0FBQ1QsYUFBVztBQUNYLFNBQU8saUJBQWlCLFVBQVUsVUFBVTsiLAogICJuYW1lcyI6IFsicGxhbiIsICJyZXMiLCAib3BzIiwgInBsYW4iLCAicGxhbiIsICJwbGFuIiwgInBsYW4iLCAib2siLCAicHJlY2lzaW9uIiwgInByZWNpc2lvbiIsICJwbGFuIiwgImRpdmlkZXIiLCAic3BhbnMiLCAic3BhbnMiLCAicGxhbiIsICJzY2FsZSIsICJyb3ciLCAic2xhY2tzIiwgImNyaXRpY2FsUGF0aCJdCn0K
