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
          console.log(`dest Adding edge ${toBeAdded}`);
          plan2.chart.Edges.push(toBeAdded);
        } else {
          if (destinations.length > 1 && destinations.find((value) => value.j === Finish)) {
            const toBeRemoved = new DirectedEdge(i, Finish);
            console.log(`dest Removing edge ${toBeRemoved}`);
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
          console.log(`src Adding edge ${toBeAdded}`);
          plan2.chart.Edges.push(toBeAdded);
        } else {
          if (destinations.length > 1 && destinations.find((value) => value.i === Start)) {
            const toBeRemoved = new DirectedEdge(Start, i);
            console.log(`src Removing edge ${toBeRemoved}`);
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
      task.setMetric(this.name, this.value);
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
  var ResourceDefinition = class {
    values;
    isStatic;
    constructor() {
      this.values = [DEFAULT_RESOURCE_VALUE];
      this.isStatic = false;
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
  var StaticMetricDefinitions = {
    // How long a task will take, in days.
    Duration: new MetricDefinition(0, new MetricRange(), true),
    // The percent complete for a task.
    Percent: new MetricDefinition(0, new MetricRange(0, 100), true)
  };
  var StaticResourceDefinitions = {
    Uncertainty: {
      values: Object.keys(UncertaintyToNum),
      isStatic: true
    }
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
          Object.entries(this.metricDefinitions).filter(
            ([key, metricDefinition]) => !metricDefinition.isStatic
          )
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
      (taskSerialized, index) => {
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
    plan2.metricDefinitions = Object.assign(
      plan2.metricDefinitions,
      planSerialized.metricDefinitions
    );
    plan2.resourceDefinitions = Object.assign(
      plan2.resourceDefinitions,
      planSerialized.resourceDefinitions
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

  // src/precision/precision.ts
  var Precision = class {
    multiplier;
    _precision;
    constructor(precision2) {
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
        this.dayWidthPx = Math.floor(
          (canvasWidthPx - this.groupByColumnWidthPx - 2 * this.marginSizePx) / totalNumberOfDays
        );
        this.origin = new Point(0, 0);
      } else {
        this.dayWidthPx = Math.floor(
          (canvasWidthPx - this.groupByColumnWidthPx - 2 * this.marginSizePx) / opts.displayRange.rangeInDays
        );
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
          day * this.dayWidthPx + this.marginSizePx + this.groupByColumnWidthPx,
          row * this.rowHeightPx + this.marginSizePx + this.timelineHeightPx
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
  var roundSpan = (span, round) => {
    span.start = round(span.start);
    span.finish = round(span.finish);
  };
  var defaultTaskDuration = (t) => {
    return t.duration;
  };
  function ComputeSlack(c, taskDuration = defaultTaskDuration, round) {
    const slacks2 = [];
    for (let i = 0; i < c.Vertices.length; i++) {
      slacks2.push(new Slack());
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
        roundSpan(slack.late, round);
        roundSpan(slack.early, round);
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
    allCriticalPaths.forEach((value, key) => {
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2RhZy9kYWcudHMiLCAiLi4vc3JjL3Jlc3VsdC50cyIsICIuLi9zcmMvb3BzL29wcy50cyIsICIuLi9zcmMvb3BzL2NoYXJ0LnRzIiwgIi4uL3NyYy9vcHMvbWV0cmljcy50cyIsICIuLi9zcmMvcmVzb3VyY2VzL3Jlc291cmNlcy50cyIsICIuLi9zcmMvb3BzL3Jlc291cmNlcy50cyIsICIuLi9zcmMvZGFnL2FsZ29yaXRobXMvdG9wb3NvcnQudHMiLCAiLi4vc3JjL2NoYXJ0L2NoYXJ0LnRzIiwgIi4uL3NyYy9tZXRyaWNzL3JhbmdlLnRzIiwgIi4uL3NyYy9tZXRyaWNzL21ldHJpY3MudHMiLCAiLi4vc3JjL3N0YXRzL2NkZi90cmlhbmd1bGFyL3RyaWFuZ3VsYXIudHMiLCAiLi4vc3JjL3N0YXRzL2NkZi90cmlhbmd1bGFyL2phY29iaWFuLnRzIiwgIi4uL3NyYy9wbGFuL3BsYW4udHMiLCAiLi4vc3JjL3ByZWNpc2lvbi9wcmVjaXNpb24udHMiLCAiLi4vc3JjL3JlbmRlcmVyL3NjYWxlL3BvaW50LnRzIiwgIi4uL3NyYy9yZW5kZXJlci9tb3VzZW1vdmUvbW91c2Vtb3ZlLnRzIiwgIi4uL3NyYy9yZW5kZXJlci9yYW5nZS9yYW5nZS50cyIsICIuLi9zcmMvcmVuZGVyZXIvc2NhbGUvc2NhbGUudHMiLCAiLi4vc3JjL3JlbmRlcmVyL3JlbmRlcmVyLnRzIiwgIi4uL3NyYy9zbGFjay9zbGFjay50cyIsICIuLi9zcmMvc3R5bGUvdGhlbWUvdGhlbWUudHMiLCAiLi4vc3JjL3N0eWxlL3RvZ2dsZXIvdG9nZ2xlci50cyIsICIuLi9zcmMvcGFnZS50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqIE9uZSB2ZXJ0ZXggb2YgYSBncmFwaC4gKi9cbmV4cG9ydCB0eXBlIFZlcnRleCA9IG9iamVjdDtcblxuLyoqIEV2ZXJ5IFZlcnRleCBpbiBhIGdyYXBoLiAqL1xuZXhwb3J0IHR5cGUgVmVydGljZXMgPSBWZXJ0ZXhbXTtcblxuLyoqIEEgc3Vic2V0IG9mIFZlcnRpY2VzIHJlZmVycmVkIHRvIGJ5IHRoZWlyIGluZGV4IG51bWJlci4gKi9cbmV4cG9ydCB0eXBlIFZlcnRleEluZGljZXMgPSBudW1iZXJbXTtcblxuZXhwb3J0IGludGVyZmFjZSBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkIHtcbiAgaTogbnVtYmVyO1xuICBqOiBudW1iZXI7XG59XG5cbi8qKiBPbmUgZWRnZSBvZiBhIGdyYXBoLCB3aGljaCBpcyBhIGRpcmVjdGVkIGNvbm5lY3Rpb24gZnJvbSB0aGUgaSd0aCBWZXJ0ZXggdG9cbnRoZSBqJ3RoIFZlcnRleCwgd2hlcmUgdGhlIFZlcnRleCBpcyBzdG9yZWQgaW4gYSBWZXJ0aWNlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIERpcmVjdGVkRWRnZSB7XG4gIGk6IG51bWJlciA9IDA7XG4gIGo6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoaTogbnVtYmVyID0gMCwgajogbnVtYmVyID0gMCkge1xuICAgIHRoaXMuaSA9IGk7XG4gICAgdGhpcy5qID0gajtcbiAgfVxuXG4gIGVxdWFsKHJoczogRGlyZWN0ZWRFZGdlKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHJocy5pID09PSB0aGlzLmkgJiYgcmhzLmogPT09IHRoaXMuajtcbiAgfVxuXG4gIHRvSlNPTigpOiBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgaTogdGhpcy5pLFxuICAgICAgajogdGhpcy5qLFxuICAgIH07XG4gIH1cbn1cblxuLyoqIEV2ZXJ5IEVnZGUgaW4gYSBncmFwaC4gKi9cbmV4cG9ydCB0eXBlIEVkZ2VzID0gRGlyZWN0ZWRFZGdlW107XG5cbi8qKiBBIGdyYXBoIGlzIGp1c3QgYSBjb2xsZWN0aW9uIG9mIFZlcnRpY2VzIGFuZCBFZGdlcyBiZXR3ZWVuIHRob3NlIHZlcnRpY2VzLiAqL1xuZXhwb3J0IHR5cGUgRGlyZWN0ZWRHcmFwaCA9IHtcbiAgVmVydGljZXM6IFZlcnRpY2VzO1xuICBFZGdlczogRWRnZXM7XG59O1xuXG4vKipcbiBHcm91cHMgdGhlIEVkZ2VzIGJ5IHRoZWlyIGBpYCB2YWx1ZS5cblxuIEBwYXJhbSBlZGdlcyAtIEFsbCB0aGUgRWdlcyBpbiBhIERpcmVjdGVkR3JhcGguXG4gQHJldHVybnMgQSBtYXAgZnJvbSB0aGUgVmVydGV4IGluZGV4IHRvIGFsbCB0aGUgRWRnZXMgdGhhdCBzdGFydCBhdFxuICAgYXQgdGhhdCBWZXJ0ZXggaW5kZXguXG4gKi9cbmV4cG9ydCBjb25zdCBlZGdlc0J5U3JjVG9NYXAgPSAoZWRnZXM6IEVkZ2VzKTogTWFwPG51bWJlciwgRWRnZXM+ID0+IHtcbiAgY29uc3QgcmV0ID0gbmV3IE1hcDxudW1iZXIsIEVkZ2VzPigpO1xuXG4gIGVkZ2VzLmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgIGNvbnN0IGFyciA9IHJldC5nZXQoZS5pKSB8fCBbXTtcbiAgICBhcnIucHVzaChlKTtcbiAgICByZXQuc2V0KGUuaSwgYXJyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJldDtcbn07XG5cbi8qKlxuICAgR3JvdXBzIHRoZSBFZGdlcyBieSB0aGVpciBgamAgdmFsdWUuXG4gIFxuICAgQHBhcmFtIGVkZ2VzIC0gQWxsIHRoZSBFZGdlcyBpbiBhIERpcmVjdGVkR3JhcGguXG4gICBAcmV0dXJucyBBIG1hcCBmcm9tIHRoZSBWZXJ0ZXggaW5kZXggdG8gYWxsIHRoZSBFZGdlcyB0aGF0IGVuZCBhdFxuICAgICBhdCB0aGF0IFZlcnRleCBpbmRleC5cbiAgICovXG5cbmV4cG9ydCBjb25zdCBlZGdlc0J5RHN0VG9NYXAgPSAoZWRnZXM6IEVkZ2VzKTogTWFwPG51bWJlciwgRWRnZXM+ID0+IHtcbiAgY29uc3QgcmV0ID0gbmV3IE1hcDxudW1iZXIsIEVkZ2VzPigpO1xuXG4gIGVkZ2VzLmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgIGNvbnN0IGFyciA9IHJldC5nZXQoZS5qKSB8fCBbXTtcbiAgICBhcnIucHVzaChlKTtcbiAgICByZXQuc2V0KGUuaiwgYXJyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJldDtcbn07XG5cbmV4cG9ydCB0eXBlIFNyY0FuZERzdFJldHVybiA9IHtcbiAgYnlTcmM6IE1hcDxudW1iZXIsIEVkZ2VzPjtcbiAgYnlEc3Q6IE1hcDxudW1iZXIsIEVkZ2VzPjtcbn07XG5cbmV4cG9ydCBjb25zdCBlZGdlc0J5U3JjQW5kRHN0VG9NYXAgPSAoZWRnZXM6IEVkZ2VzKTogU3JjQW5kRHN0UmV0dXJuID0+IHtcbiAgY29uc3QgcmV0ID0ge1xuICAgIGJ5U3JjOiBuZXcgTWFwPG51bWJlciwgRWRnZXM+KCksXG4gICAgYnlEc3Q6IG5ldyBNYXA8bnVtYmVyLCBFZGdlcz4oKSxcbiAgfTtcblxuICBlZGdlcy5mb3JFYWNoKChlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICBsZXQgYXJyID0gcmV0LmJ5U3JjLmdldChlLmkpIHx8IFtdO1xuICAgIGFyci5wdXNoKGUpO1xuICAgIHJldC5ieVNyYy5zZXQoZS5pLCBhcnIpO1xuICAgIGFyciA9IHJldC5ieURzdC5nZXQoZS5qKSB8fCBbXTtcbiAgICBhcnIucHVzaChlKTtcbiAgICByZXQuYnlEc3Quc2V0KGUuaiwgYXJyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJldDtcbn07XG4iLCAiLyoqIFJlc3VsdCBhbGxvd3MgZWFzaWVyIGhhbmRsaW5nIG9mIHJldHVybmluZyBlaXRoZXIgYW4gZXJyb3Igb3IgYSB2YWx1ZSBmcm9tIGFcbiAqIGZ1bmN0aW9uLiAqL1xuZXhwb3J0IHR5cGUgUmVzdWx0PFQ+ID0geyBvazogdHJ1ZTsgdmFsdWU6IFQgfSB8IHsgb2s6IGZhbHNlOyBlcnJvcjogRXJyb3IgfTtcblxuZXhwb3J0IGZ1bmN0aW9uIG9rPFQ+KHZhbHVlOiBUKTogUmVzdWx0PFQ+IHtcbiAgcmV0dXJuIHsgb2s6IHRydWUsIHZhbHVlOiB2YWx1ZSB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXJyb3I8VD4odmFsdWU6IHN0cmluZyB8IEVycm9yKTogUmVzdWx0PFQ+IHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IG5ldyBFcnJvcih2YWx1ZSkgfTtcbiAgfVxuICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiB2YWx1ZSB9O1xufVxuIiwgImltcG9ydCB7IFJlc3VsdCwgb2sgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhbi50c1wiO1xuXG4vLyBPcGVyYXRpb25zIG9uIFBsYW5zLiBOb3RlIHRoZXkgYXJlIHJldmVyc2libGUsIHNvIHdlIGNhbiBoYXZlIGFuICd1bmRvJyBsaXN0LlxuXG4vLyBBbHNvLCBzb21lIG9wZXJhdGlvbnMgbWlnaHQgaGF2ZSAncGFydGlhbHMnLCBpLmUuIHJldHVybiBhIGxpc3Qgb2YgdmFsaWRcbi8vIG9wdGlvbnMgdGhhdCBjYW4gYmUgcGFzc2VkIHRvIHRoZSBvcGVyYXRpb24uIEZvciBleGFtcGxlLCBhZGRpbmcgYVxuLy8gcHJlZGVjZXNzb3IgY291bGQgbGlzdCBhbGwgdGhlIFRhc2tzIHRoYXQgd291bGQgbm90IGZvcm0gYSBsb29wLCBpLmUuIGV4Y2x1ZGVcbi8vIGFsbCBkZXNjZW5kZW50cywgYW5kIHRoZSBUYXNrIGl0c2VsZiwgZnJvbSB0aGUgbGlzdCBvZiBvcHRpb25zLlxuLy9cbi8vICogQ2hhbmdlIHN0cmluZyB2YWx1ZSBpbiBhIFRhc2suXG4vLyAqIENoYW5nZSBkdXJhdGlvbiB2YWx1ZSBpbiBhIFRhc2suXG4vLyAqIEluc2VydCBuZXcgZW1wdHkgVGFzayBhZnRlciBJbmRleC5cbi8vICogU3BsaXQgYSBUYXNrLiAoUHJlZGVjZXNzb3IgdGFrZXMgYWxsIGluY29taW5nIGVkZ2VzLCBzb3VyY2UgdGFza3MgYWxsIG91dGdvaW5nIGVkZ2VzKS5cbi8vXG4vLyAqIER1cGxpY2F0ZSBhIFRhc2sgKGFsbCBlZGdlcyBhcmUgZHVwbGljYXRlZCBmcm9tIHRoZSBzb3VyY2UgVGFzaykuXG4vLyAqIERlbGV0ZSBwcmVkZWNlc3NvciB0byBhIFRhc2suXG4vLyAqIERlbGV0ZSBzdWNjZXNzb3IgdG8gYSBUYXNrLlxuLy8gKiBEZWxldGUgYSBUYXNrLlxuXG4vLyBOZWVkIFVuZG8vUmVkbyBTdGFja3MuXG4vLyBUaGVzZSByZWNvcmQgdGhlIHN1Yi1vcHMgZm9yIGVhY2ggbGFyZ2Ugb3AuIEUuZy4gYW4gaW5zZXJ0IHRhc2sgb3AgaXMgbWFkZVxuLy8gb2YgdGhyZWUgc3ViLW9wczpcbi8vICAgIDEuIGluc2VydCB0YXNrIGludG8gVmVydGljZXMgYW5kIHJlbnVtYmVyIEVkZ2VzXG4vLyAgICAyLiBBZGQgZWRnZSBmcm9tIFN0YXJ0IHRvIE5ldyBUYXNrXG4vLyAgICAzLiBBZGQgZWRnZSBmcm9tIE5ldyBUYXNrIHRvIEZpbmlzaFxuLy9cbi8vIEVhY2ggc3ViLW9wOlxuLy8gICAgMS4gUmVjb3JkcyBhbGwgdGhlIGluZm8gaXQgbmVlZHMgdG8gd29yay5cbi8vICAgIDIuIENhbiBiZSBcImFwcGxpZWRcIiB0byBhIFBsYW4uXG4vLyAgICAzLiBDYW4gZ2VuZXJhdGUgaXRzIGludmVyc2Ugc3ViLW9wLlxuXG4vLyBUaGUgcmVzdWx0cyBmcm9tIGFwcGx5aW5nIGEgU3ViT3AuIFRoaXMgaXMgdGhlIG9ubHkgd2F5IHRvIGdldCB0aGUgaW52ZXJzZSBvZlxuLy8gYSBTdWJPcCBzaW5jZSB0aGUgU3ViT3AgaW52ZXJzZSBtaWdodCBkZXBlbmQgb24gdGhlIHN0YXRlIG9mIHRoZSBQbGFuIGF0IHRoZVxuLy8gdGltZSB0aGUgU3ViT3Agd2FzIGFwcGxpZWQuXG5leHBvcnQgaW50ZXJmYWNlIFN1Yk9wUmVzdWx0IHtcbiAgcGxhbjogUGxhbjtcbiAgaW52ZXJzZTogU3ViT3A7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3ViT3Age1xuICAvLyBJZiB0aGUgYXBwbHkgcmV0dXJucyBhbiBlcnJvciBpdCBpcyBndWFyYW50ZWVkIG5vdCB0byBoYXZlIG1vZGlmaWVkIHRoZVxuICAvLyBQbGFuLlxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0Pjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBPcFJlc3VsdCB7XG4gIHBsYW46IFBsYW47XG4gIGludmVyc2U6IE9wO1xufVxuXG4vLyBPcCBhcmUgb3BlcmF0aW9ucyBhcmUgYXBwbGllZCB0byBtYWtlIGNoYW5nZXMgdG8gYSBQbGFuLlxuZXhwb3J0IGNsYXNzIE9wIHtcbiAgc3ViT3BzOiBTdWJPcFtdID0gW107XG5cbiAgY29uc3RydWN0b3Ioc3ViT3BzOiBTdWJPcFtdKSB7XG4gICAgdGhpcy5zdWJPcHMgPSBzdWJPcHM7XG4gIH1cblxuICAvLyBSZXZlcnRzIGFsbCBTdWJPcHMgdXAgdG8gdGhlIGdpdmVuIGluZGV4LlxuICBhcHBseUFsbEludmVyc2VTdWJPcHNUb1BsYW4oXG4gICAgcGxhbjogUGxhbixcbiAgICBpbnZlcnNlU3ViT3BzOiBTdWJPcFtdXG4gICk6IFJlc3VsdDxQbGFuPiB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnZlcnNlU3ViT3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlID0gaW52ZXJzZVN1Yk9wc1tpXS5hcHBseShwbGFuKTtcbiAgICAgIGlmICghZS5vaykge1xuICAgICAgICByZXR1cm4gZTtcbiAgICAgIH1cbiAgICAgIHBsYW4gPSBlLnZhbHVlLnBsYW47XG4gICAgfVxuXG4gICAgcmV0dXJuIG9rKHBsYW4pO1xuICB9XG5cbiAgLy8gQXBwbGllcyB0aGUgT3AgdG8gYSBQbGFuLlxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PE9wUmVzdWx0PiB7XG4gICAgY29uc3QgaW52ZXJzZVN1Yk9wczogU3ViT3BbXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zdWJPcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGUgPSB0aGlzLnN1Yk9wc1tpXS5hcHBseShwbGFuKTtcbiAgICAgIGlmICghZS5vaykge1xuICAgICAgICAvLyBSZXZlcnQgYWxsIHRoZSBTdWJPcHMgYXBwbGllZCB1cCB0byB0aGlzIHBvaW50IHRvIGdldCB0aGUgUGxhbiBiYWNrIGluIGFcbiAgICAgICAgLy8gZ29vZCBwbGFjZS5cbiAgICAgICAgY29uc3QgcmV2ZXJ0RXJyID0gdGhpcy5hcHBseUFsbEludmVyc2VTdWJPcHNUb1BsYW4ocGxhbiwgaW52ZXJzZVN1Yk9wcyk7XG4gICAgICAgIGlmICghcmV2ZXJ0RXJyLm9rKSB7XG4gICAgICAgICAgcmV0dXJuIHJldmVydEVycjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZTtcbiAgICAgIH1cbiAgICAgIHBsYW4gPSBlLnZhbHVlLnBsYW47XG4gICAgICBpbnZlcnNlU3ViT3BzLnVuc2hpZnQoZS52YWx1ZS5pbnZlcnNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IG5ldyBPcChpbnZlcnNlU3ViT3BzKSxcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBBbGxPcHNSZXN1bHQgPSB7XG4gIG9wczogT3BbXTtcbiAgcGxhbjogUGxhbjtcbn07XG5cbmNvbnN0IGFwcGx5QWxsSW52ZXJzZU9wc1RvUGxhbiA9IChpbnZlcnNlczogT3BbXSwgcGxhbjogUGxhbik6IFJlc3VsdDxQbGFuPiA9PiB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaW52ZXJzZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCByZXMgPSBpbnZlcnNlc1tpXS5hcHBseShwbGFuKTtcbiAgICBpZiAoIXJlcy5vaykge1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgcGxhbiA9IHJlcy52YWx1ZS5wbGFuO1xuICB9XG5cbiAgcmV0dXJuIG9rKHBsYW4pO1xufTtcblxuLy8gQ29udmVuaWVuY2UgZnVuY3Rpb24gZm9yIGFwcGx5aW5nIG11bHRpcGxlIE9wcyB0byBhIHBsYW4sIHVzZWQgbW9zdGx5IGZvclxuLy8gdGVzdGluZy5cbmV4cG9ydCBjb25zdCBhcHBseUFsbE9wc1RvUGxhbiA9IChcbiAgb3BzOiBPcFtdLFxuICBwbGFuOiBQbGFuXG4pOiBSZXN1bHQ8QWxsT3BzUmVzdWx0PiA9PiB7XG4gIGNvbnN0IGludmVyc2VzOiBPcFtdID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcmVzID0gb3BzW2ldLmFwcGx5KHBsYW4pO1xuICAgIGlmICghcmVzLm9rKSB7XG4gICAgICBjb25zdCBpbnZlcnNlUmVzID0gYXBwbHlBbGxJbnZlcnNlT3BzVG9QbGFuKGludmVyc2VzLCBwbGFuKTtcbiAgICAgIGlmICghaW52ZXJzZVJlcy5vaykge1xuICAgICAgICAvLyBUT0RPIENhbiB3ZSB3cmFwIHRoZSBFcnJvciBpbiBhbm90aGVyIGVycm9yIHRvIG1ha2UgaXQgY2xlYXIgdGhpc1xuICAgICAgICAvLyBlcnJvciBoYXBwZW5lZCB3aGVuIHRyeWluZyB0byBjbGVhbiB1cCBmcm9tIHRoZSBwcmV2aW91cyBFcnJvciB3aGVuXG4gICAgICAgIC8vIHRoZSBhcHBseSgpIGZhaWxlZC5cbiAgICAgICAgcmV0dXJuIGludmVyc2VSZXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH1cbiAgICBpbnZlcnNlcy51bnNoaWZ0KHJlcy52YWx1ZS5pbnZlcnNlKTtcbiAgICBwbGFuID0gcmVzLnZhbHVlLnBsYW47XG4gIH1cblxuICByZXR1cm4gb2soe1xuICAgIG9wczogaW52ZXJzZXMsXG4gICAgcGxhbjogcGxhbixcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgYXBwbHlBbGxPcHNUb1BsYW5BbmRUaGVuSW52ZXJzZSA9IChcbiAgb3BzOiBPcFtdLFxuICBwbGFuOiBQbGFuXG4pOiBSZXN1bHQ8QWxsT3BzUmVzdWx0PiA9PiB7XG4gIGNvbnN0IHJlcyA9IGFwcGx5QWxsT3BzVG9QbGFuKG9wcywgcGxhbik7XG4gIGlmICghcmVzLm9rKSB7XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICByZXR1cm4gYXBwbHlBbGxPcHNUb1BsYW4ocmVzLnZhbHVlLm9wcywgcmVzLnZhbHVlLnBsYW4pO1xufTtcbi8vIE5vT3AgaXMgYSBuby1vcC5cbmV4cG9ydCBmdW5jdGlvbiBOb09wKCk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbXSk7XG59XG4iLCAiaW1wb3J0IHsgUmVzdWx0LCBvaywgZXJyb3IgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBEaXJlY3RlZEVkZ2UsIGVkZ2VzQnlTcmNBbmREc3RUb01hcCB9IGZyb20gXCIuLi9kYWcvZGFnLnRzXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhbi50c1wiO1xuaW1wb3J0IHsgQ2hhcnQsIFRhc2tTdGF0ZSB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgT3AsIFN1Yk9wLCBTdWJPcFJlc3VsdCB9IGZyb20gXCIuL29wcy50c1wiO1xuXG4vKiogQSB2YWx1ZSBvZiAtMSBmb3IgaiBtZWFucyB0aGUgRmluaXNoIE1pbGVzdG9uZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBEaXJlY3RlZEVkZ2VGb3JQbGFuKFxuICBpOiBudW1iZXIsXG4gIGo6IG51bWJlcixcbiAgcGxhbjogUGxhblxuKTogUmVzdWx0PERpcmVjdGVkRWRnZT4ge1xuICBjb25zdCBjaGFydCA9IHBsYW4uY2hhcnQ7XG4gIGlmIChqID09PSAtMSkge1xuICAgIGogPSBjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICB9XG4gIGlmIChpIDwgMCB8fCBpID49IGNoYXJ0LlZlcnRpY2VzLmxlbmd0aCkge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIGBpIGluZGV4IG91dCBvZiByYW5nZTogJHtpfSBub3QgaW4gWzAsICR7Y2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMX1dYFxuICAgICk7XG4gIH1cbiAgaWYgKGogPCAwIHx8IGogPj0gY2hhcnQuVmVydGljZXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGVycm9yKFxuICAgICAgYGogaW5kZXggb3V0IG9mIHJhbmdlOiAke2p9IG5vdCBpbiBbMCwgJHtjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxfV1gXG4gICAgKTtcbiAgfVxuICBpZiAoaSA9PT0gaikge1xuICAgIHJldHVybiBlcnJvcihgQSBUYXNrIGNhbiBub3QgZGVwZW5kIG9uIGl0c2VsZjogJHtpfSA9PT0gJHtqfWApO1xuICB9XG4gIHJldHVybiBvayhuZXcgRGlyZWN0ZWRFZGdlKGksIGopKTtcbn1cblxuZXhwb3J0IGNsYXNzIEFkZEVkZ2VTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaTogbnVtYmVyID0gMDtcbiAgajogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpOiBudW1iZXIsIGo6IG51bWJlcikge1xuICAgIHRoaXMuaSA9IGk7XG4gICAgdGhpcy5qID0gajtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBpZiAodGhpcy5pID09PSAtMSkge1xuICAgICAgdGhpcy5pID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICAgIH1cbiAgICBpZiAodGhpcy5qID09PSAtMSkge1xuICAgICAgdGhpcy5qID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICAgIH1cblxuICAgIGNvbnN0IGUgPSBEaXJlY3RlZEVkZ2VGb3JQbGFuKHRoaXMuaSwgdGhpcy5qLCBwbGFuKTtcbiAgICBpZiAoIWUub2spIHtcbiAgICAgIHJldHVybiBlO1xuICAgIH1cblxuICAgIC8vIE9ubHkgYWRkIHRoZSBlZGdlIGlmIGl0IGRvZXNuJ3QgZXhpc3RzIGFscmVhZHkuXG4gICAgaWYgKCFwbGFuLmNoYXJ0LkVkZ2VzLmZpbmQoKHZhbHVlOiBEaXJlY3RlZEVkZ2UpID0+IHZhbHVlLmVxdWFsKGUudmFsdWUpKSkge1xuICAgICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKGUudmFsdWUpO1xuICAgIH1cblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCksXG4gICAgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFJlbW92ZUVkZ2VTdXBPcCh0aGlzLmksIHRoaXMuaik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbW92ZUVkZ2VTdXBPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaTogbnVtYmVyID0gMDtcbiAgajogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpOiBudW1iZXIsIGo6IG51bWJlcikge1xuICAgIHRoaXMuaSA9IGk7XG4gICAgdGhpcy5qID0gajtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBpZiAodGhpcy5pID09PSAtMSkge1xuICAgICAgdGhpcy5pID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICAgIH1cbiAgICBpZiAodGhpcy5qID09PSAtMSkge1xuICAgICAgdGhpcy5qID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICAgIH1cblxuICAgIGNvbnN0IGUgPSBEaXJlY3RlZEVkZ2VGb3JQbGFuKHRoaXMuaSwgdGhpcy5qLCBwbGFuKTtcbiAgICBpZiAoIWUub2spIHtcbiAgICAgIHJldHVybiBlO1xuICAgIH1cbiAgICBwbGFuLmNoYXJ0LkVkZ2VzID0gcGxhbi5jaGFydC5FZGdlcy5maWx0ZXIoXG4gICAgICAodjogRGlyZWN0ZWRFZGdlKTogYm9vbGVhbiA9PiAhdi5lcXVhbChlLnZhbHVlKVxuICAgICk7XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpLFxuICAgIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBBZGRFZGdlU3ViT3AodGhpcy5pLCB0aGlzLmopO1xuICB9XG59XG5cbmZ1bmN0aW9uIGluZGV4SW5SYW5nZUZvclZlcnRpY2VzKGluZGV4OiBudW1iZXIsIGNoYXJ0OiBDaGFydCk6IFJlc3VsdDxudWxsPiB7XG4gIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPiBjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAyKSB7XG4gICAgcmV0dXJuIGVycm9yKGAke2luZGV4fSBpcyBub3QgaW4gcmFuZ2UgWzAsICR7Y2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMn1dYCk7XG4gIH1cbiAgcmV0dXJuIG9rKG51bGwpO1xufVxuXG5mdW5jdGlvbiBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlc0V4Y2x1c2l2ZShcbiAgaW5kZXg6IG51bWJlcixcbiAgY2hhcnQ6IENoYXJ0XG4pOiBSZXN1bHQ8bnVsbD4ge1xuICBpZiAoaW5kZXggPCAxIHx8IGluZGV4ID4gY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMikge1xuICAgIHJldHVybiBlcnJvcihgJHtpbmRleH0gaXMgbm90IGluIHJhbmdlIFsxLCAke2NoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDJ9XWApO1xuICB9XG4gIHJldHVybiBvayhudWxsKTtcbn1cblxuZXhwb3J0IGNsYXNzIEFkZFRhc2tBZnRlclN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBpbmRleDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGNoYXJ0ID0gcGxhbi5jaGFydDtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLmluZGV4LCBjaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuc3BsaWNlKHRoaXMuaW5kZXggKyAxLCAwLCBwbGFuLm5ld1Rhc2soKSk7XG5cbiAgICAvLyBVcGRhdGUgRWRnZXMuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFydC5FZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZWRnZSA9IGNoYXJ0LkVkZ2VzW2ldO1xuICAgICAgaWYgKGVkZ2UuaSA+PSB0aGlzLmluZGV4ICsgMSkge1xuICAgICAgICBlZGdlLmkrKztcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlLmogPj0gdGhpcy5pbmRleCArIDEpIHtcbiAgICAgICAgZWRnZS5qKys7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBEZWxldGVUYXNrU3ViT3AodGhpcy5pbmRleCArIDEpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEdXBUYXNrU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGluZGV4OiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGluZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgY2hhcnQgPSBwbGFuLmNoYXJ0O1xuICAgIGNvbnN0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzRXhjbHVzaXZlKHRoaXMuaW5kZXgsIGNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBjb25zdCBjb3B5ID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLmluZGV4XS5kdXAoKTtcbiAgICAvLyBJbnNlcnQgdGhlIGR1cGxpY2F0ZSBpbW1lZGlhdGVseSBhZnRlciB0aGUgVGFzayBpdCBpcyBjb3BpZWQgZnJvbS5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLnNwbGljZSh0aGlzLmluZGV4LCAwLCBjb3B5KTtcblxuICAgIC8vIFVwZGF0ZSBFZGdlcy5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJ0LkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlZGdlID0gY2hhcnQuRWRnZXNbaV07XG4gICAgICBpZiAoZWRnZS5pID4gdGhpcy5pbmRleCkge1xuICAgICAgICBlZGdlLmkrKztcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlLmogPiB0aGlzLmluZGV4KSB7XG4gICAgICAgIGVkZ2UuaisrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlVGFza1N1Yk9wKHRoaXMuaW5kZXggKyAxKTtcbiAgfVxufVxuXG50eXBlIFN1YnN0aXR1dGlvbiA9IE1hcDxEaXJlY3RlZEVkZ2UsIERpcmVjdGVkRWRnZT47XG5cbmV4cG9ydCBjbGFzcyBNb3ZlQWxsT3V0Z29pbmdFZGdlc0Zyb21Ub1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBmcm9tVGFza0luZGV4OiBudW1iZXIgPSAwO1xuICB0b1Rhc2tJbmRleDogbnVtYmVyID0gMDtcbiAgYWN0dWFsTW92ZXM6IFN1YnN0aXR1dGlvbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBmcm9tVGFza0luZGV4OiBudW1iZXIsXG4gICAgdG9UYXNrSW5kZXg6IG51bWJlcixcbiAgICBhY3R1YWxNb3ZlczogU3Vic3RpdHV0aW9uID0gbmV3IE1hcCgpXG4gICkge1xuICAgIHRoaXMuZnJvbVRhc2tJbmRleCA9IGZyb21UYXNrSW5kZXg7XG4gICAgdGhpcy50b1Rhc2tJbmRleCA9IHRvVGFza0luZGV4O1xuICAgIHRoaXMuYWN0dWFsTW92ZXMgPSBhY3R1YWxNb3ZlcztcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBjaGFydCA9IHBsYW4uY2hhcnQ7XG4gICAgbGV0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzRXhjbHVzaXZlKHRoaXMuZnJvbVRhc2tJbmRleCwgY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlc0V4Y2x1c2l2ZSh0aGlzLnRvVGFza0luZGV4LCBjaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYWN0dWFsTW92ZXMudmFsdWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc3QgYWN0dWFsTW92ZXM6IFN1YnN0aXR1dGlvbiA9IG5ldyBNYXAoKTtcbiAgICAgIC8vIFVwZGF0ZSBhbGwgRWRnZXMgdGhhdCBzdGFydCBhdCAnZnJvbVRhc2tJbmRleCcgYW5kIGNoYW5nZSB0aGUgc3RhcnQgdG8gJ3RvVGFza0luZGV4Jy5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hhcnQuRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZWRnZSA9IGNoYXJ0LkVkZ2VzW2ldO1xuICAgICAgICAvLyBTa2lwIHRoZSBjb3JuZXIgY2FzZSB0aGVyZSBmcm9tVGFza0luZGV4IHBvaW50cyB0byBUYXNrSW5kZXguXG4gICAgICAgIGlmIChlZGdlLmkgPT09IHRoaXMuZnJvbVRhc2tJbmRleCAmJiBlZGdlLmogPT09IHRoaXMudG9UYXNrSW5kZXgpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlZGdlLmkgPT09IHRoaXMuZnJvbVRhc2tJbmRleCkge1xuICAgICAgICAgIGFjdHVhbE1vdmVzLnNldChcbiAgICAgICAgICAgIG5ldyBEaXJlY3RlZEVkZ2UodGhpcy50b1Rhc2tJbmRleCwgZWRnZS5qKSxcbiAgICAgICAgICAgIG5ldyBEaXJlY3RlZEVkZ2UoZWRnZS5pLCBlZGdlLmopXG4gICAgICAgICAgKTtcbiAgICAgICAgICBlZGdlLmkgPSB0aGlzLnRvVGFza0luZGV4O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gb2soe1xuICAgICAgICBwbGFuOiBwbGFuLFxuICAgICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UoXG4gICAgICAgICAgdGhpcy50b1Rhc2tJbmRleCxcbiAgICAgICAgICB0aGlzLmZyb21UYXNrSW5kZXgsXG4gICAgICAgICAgYWN0dWFsTW92ZXNcbiAgICAgICAgKSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJ0LkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG5ld0VkZ2UgPSB0aGlzLmFjdHVhbE1vdmVzLmdldChwbGFuLmNoYXJ0LkVkZ2VzW2ldKTtcbiAgICAgICAgaWYgKG5ld0VkZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHBsYW4uY2hhcnQuRWRnZXNbaV0gPSBuZXdFZGdlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvayh7XG4gICAgICAgIHBsYW46IHBsYW4sXG4gICAgICAgIGludmVyc2U6IG5ldyBNb3ZlQWxsT3V0Z29pbmdFZGdlc0Zyb21Ub1N1Yk9wKFxuICAgICAgICAgIHRoaXMudG9UYXNrSW5kZXgsXG4gICAgICAgICAgdGhpcy5mcm9tVGFza0luZGV4XG4gICAgICAgICksXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBpbnZlcnNlKFxuICAgIHRvVGFza0luZGV4OiBudW1iZXIsXG4gICAgZnJvbVRhc2tJbmRleDogbnVtYmVyLFxuICAgIGFjdHVhbE1vdmVzOiBTdWJzdGl0dXRpb25cbiAgKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgTW92ZUFsbE91dGdvaW5nRWRnZXNGcm9tVG9TdWJPcChcbiAgICAgIHRvVGFza0luZGV4LFxuICAgICAgZnJvbVRhc2tJbmRleCxcbiAgICAgIGFjdHVhbE1vdmVzXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29weUFsbEVkZ2VzRnJvbVRvU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGZyb21JbmRleDogbnVtYmVyID0gMDtcbiAgdG9JbmRleDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3Rvcihmcm9tSW5kZXg6IG51bWJlciwgdG9JbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5mcm9tSW5kZXggPSBmcm9tSW5kZXg7XG4gICAgdGhpcy50b0luZGV4ID0gdG9JbmRleDtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLmZyb21JbmRleCwgcGxhbi5jaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgY29uc3QgbmV3RWRnZXM6IERpcmVjdGVkRWRnZVtdID0gW107XG4gICAgcGxhbi5jaGFydC5FZGdlcy5mb3JFYWNoKChlZGdlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICAgIGlmIChlZGdlLmkgPT09IHRoaXMuZnJvbUluZGV4KSB7XG4gICAgICAgIG5ld0VkZ2VzLnB1c2gobmV3IERpcmVjdGVkRWRnZSh0aGlzLnRvSW5kZXgsIGVkZ2UuaikpO1xuICAgICAgfVxuICAgICAgaWYgKGVkZ2UuaiA9PT0gdGhpcy5mcm9tSW5kZXgpIHtcbiAgICAgICAgbmV3RWRnZXMucHVzaChuZXcgRGlyZWN0ZWRFZGdlKGVkZ2UuaSwgdGhpcy50b0luZGV4KSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKC4uLm5ld0VkZ2VzKTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IG5ldyBSZW1vdmVBbGxFZGdlc1N1Yk9wKG5ld0VkZ2VzKSB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVtb3ZlQWxsRWRnZXNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVtdO1xuXG4gIGNvbnN0cnVjdG9yKGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSkge1xuICAgIHRoaXMuZWRnZXMgPSBlZGdlcztcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBwbGFuLmNoYXJ0LkVkZ2VzID0gcGxhbi5jaGFydC5FZGdlcy5maWx0ZXIoXG4gICAgICAoZWRnZTogRGlyZWN0ZWRFZGdlKSA9PlxuICAgICAgICAtMSA9PT1cbiAgICAgICAgdGhpcy5lZGdlcy5maW5kSW5kZXgoKHRvQmVSZW1vdmVkOiBEaXJlY3RlZEVkZ2UpID0+XG4gICAgICAgICAgZWRnZS5lcXVhbCh0b0JlUmVtb3ZlZClcbiAgICAgICAgKVxuICAgICk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiBuZXcgQWRkQWxsRWRnZXNTdWJPcCh0aGlzLmVkZ2VzKSB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQWRkQWxsRWRnZXNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVtdO1xuXG4gIGNvbnN0cnVjdG9yKGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSkge1xuICAgIHRoaXMuZWRnZXMgPSBlZGdlcztcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBwbGFuLmNoYXJ0LkVkZ2VzLnB1c2goLi4udGhpcy5lZGdlcyk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiBuZXcgUmVtb3ZlQWxsRWRnZXNTdWJPcCh0aGlzLmVkZ2VzKSB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVsZXRlVGFza1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBpbmRleDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGNoYXJ0ID0gcGxhbi5jaGFydDtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLmluZGV4LCBjaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGNoYXJ0LlZlcnRpY2VzLnNwbGljZSh0aGlzLmluZGV4LCAxKTtcblxuICAgIC8vIFVwZGF0ZSBFZGdlcy5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJ0LkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlZGdlID0gY2hhcnQuRWRnZXNbaV07XG4gICAgICBpZiAoZWRnZS5pID4gdGhpcy5pbmRleCkge1xuICAgICAgICBlZGdlLmktLTtcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlLmogPiB0aGlzLmluZGV4KSB7XG4gICAgICAgIGVkZ2Uuai0tO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBBZGRUYXNrQWZ0ZXJTdWJPcCh0aGlzLmluZGV4IC0gMSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJhdGlvbmFsaXplRWRnZXNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBzcmNBbmREc3QgPSBlZGdlc0J5U3JjQW5kRHN0VG9NYXAocGxhbi5jaGFydC5FZGdlcyk7XG4gICAgY29uc3QgU3RhcnQgPSAwO1xuICAgIGNvbnN0IEZpbmlzaCA9IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcblxuICAgIC8vIGxvb3Agb3ZlciBhbGwgdmVydGljcyBmcm9tIFtTdGFydCwgRmluaXNoKSBhbmQgbG9vayBmb3IgdGhlaXJcbiAgICAvLyBkZXN0aW5hdGlvbnMuIElmIHRoZXkgaGF2ZSBub25lIHRoZW4gYWRkIGluIGFuIGVkZ2UgdG8gRmluaXNoLiBJZiB0aGV5XG4gICAgLy8gaGF2ZSBtb3JlIHRoYW4gb25lIHRoZW4gcmVtb3ZlIGFueSBsaW5rcyB0byBGaW5pc2guXG4gICAgZm9yIChsZXQgaSA9IFN0YXJ0OyBpIDwgRmluaXNoOyBpKyspIHtcbiAgICAgIGNvbnN0IGRlc3RpbmF0aW9ucyA9IHNyY0FuZERzdC5ieVNyYy5nZXQoaSk7XG4gICAgICBpZiAoZGVzdGluYXRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgdG9CZUFkZGVkID0gbmV3IERpcmVjdGVkRWRnZShpLCBGaW5pc2gpO1xuICAgICAgICBjb25zb2xlLmxvZyhgZGVzdCBBZGRpbmcgZWRnZSAke3RvQmVBZGRlZH1gKTtcbiAgICAgICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKHRvQmVBZGRlZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBcmUgdGhlcmUgYW55IHVuZWVkZWQgRWdkZXMgdG8gRmluaXNoPyBJZiBzbyBmaWx0ZXIgdGhlbSBvdXQuXG4gICAgICAgIGlmIChcbiAgICAgICAgICBkZXN0aW5hdGlvbnMubGVuZ3RoID4gMSAmJlxuICAgICAgICAgIGRlc3RpbmF0aW9ucy5maW5kKCh2YWx1ZTogRGlyZWN0ZWRFZGdlKSA9PiB2YWx1ZS5qID09PSBGaW5pc2gpXG4gICAgICAgICkge1xuICAgICAgICAgIGNvbnN0IHRvQmVSZW1vdmVkID0gbmV3IERpcmVjdGVkRWRnZShpLCBGaW5pc2gpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBkZXN0IFJlbW92aW5nIGVkZ2UgJHt0b0JlUmVtb3ZlZH1gKTtcbiAgICAgICAgICBwbGFuLmNoYXJ0LkVkZ2VzID0gcGxhbi5jaGFydC5FZGdlcy5maWx0ZXIoXG4gICAgICAgICAgICAodmFsdWU6IERpcmVjdGVkRWRnZSkgPT4gIXRvQmVSZW1vdmVkLmVxdWFsKHZhbHVlKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBsb29wIG92ZXIgYWxsIHZlcnRpY3MgZnJvbShTdGFydCwgRmluaXNoXSBhbmQgbG9vayBmb3IgdGhlaXIgc291cmNlcy4gSWZcbiAgICAvLyB0aGV5IGhhdmUgbm9uZSB0aGVuIGFkZCBpbiBhbiBlZGdlIGZyb20gU3RhcnQuIElmIHRoZXkgaGF2ZSBtb3JlIHRoYW4gb25lXG4gICAgLy8gdGhlbiByZW1vdmUgYW55IGxpbmtzIGZyb20gU3RhcnQuXG4gICAgZm9yIChsZXQgaSA9IFN0YXJ0ICsgMTsgaSA8IEZpbmlzaDsgaSsrKSB7XG4gICAgICBjb25zdCBkZXN0aW5hdGlvbnMgPSBzcmNBbmREc3QuYnlEc3QuZ2V0KGkpO1xuICAgICAgaWYgKGRlc3RpbmF0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IHRvQmVBZGRlZCA9IG5ldyBEaXJlY3RlZEVkZ2UoU3RhcnQsIGkpO1xuICAgICAgICBjb25zb2xlLmxvZyhgc3JjIEFkZGluZyBlZGdlICR7dG9CZUFkZGVkfWApO1xuICAgICAgICBwbGFuLmNoYXJ0LkVkZ2VzLnB1c2godG9CZUFkZGVkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEFyZSB0aGVyZSBhbnkgdW4tbmVlZGVkIEVnZGVzIGZyb20gU3RhcnQ/IElmIHNvIGZpbHRlciB0aGVtIG91dC5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIGRlc3RpbmF0aW9ucy5sZW5ndGggPiAxICYmXG4gICAgICAgICAgZGVzdGluYXRpb25zLmZpbmQoKHZhbHVlOiBEaXJlY3RlZEVkZ2UpID0+IHZhbHVlLmkgPT09IFN0YXJ0KVxuICAgICAgICApIHtcbiAgICAgICAgICBjb25zdCB0b0JlUmVtb3ZlZCA9IG5ldyBEaXJlY3RlZEVkZ2UoU3RhcnQsIGkpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBzcmMgUmVtb3ZpbmcgZWRnZSAke3RvQmVSZW1vdmVkfWApO1xuICAgICAgICAgIHBsYW4uY2hhcnQuRWRnZXMgPSBwbGFuLmNoYXJ0LkVkZ2VzLmZpbHRlcihcbiAgICAgICAgICAgICh2YWx1ZTogRGlyZWN0ZWRFZGdlKSA9PiAhdG9CZVJlbW92ZWQuZXF1YWwodmFsdWUpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAocGxhbi5jaGFydC5FZGdlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHBsYW4uY2hhcnQuRWRnZXMucHVzaChuZXcgRGlyZWN0ZWRFZGdlKFN0YXJ0LCBGaW5pc2gpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNldFRhc2tOYW1lU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIHRhc2tJbmRleDogbnVtYmVyO1xuICBuYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IodGFza0luZGV4OiBudW1iZXIsIG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMudGFza0luZGV4ID0gdGFza0luZGV4O1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXModGhpcy50YXNrSW5kZXgsIHBsYW4uY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICBjb25zdCBvbGROYW1lID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLnRhc2tJbmRleF0ubmFtZTtcbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMudGFza0luZGV4XS5uYW1lID0gdGhpcy5uYW1lO1xuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG9sZE5hbWUpLFxuICAgIH0pO1xuICB9XG5cbiAgaW52ZXJzZShvbGROYW1lOiBzdHJpbmcpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBTZXRUYXNrTmFtZVN1Yk9wKHRoaXMudGFza0luZGV4LCBvbGROYW1lKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2V0VGFza1N0YXRlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIHRhc2tTdGF0ZTogVGFza1N0YXRlO1xuICB0YXNrSW5kZXg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3Rvcih0YXNrSW5kZXg6IG51bWJlciwgdGFza1N0YXRlOiBUYXNrU3RhdGUpIHtcbiAgICB0aGlzLnRhc2tJbmRleCA9IHRhc2tJbmRleDtcbiAgICB0aGlzLnRhc2tTdGF0ZSA9IHRhc2tTdGF0ZTtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLnRhc2tJbmRleCwgcGxhbi5jaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGNvbnN0IG9sZFN0YXRlID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLnRhc2tJbmRleF0uc3RhdGU7XG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLnRhc2tJbmRleF0uc3RhdGUgPSB0aGlzLnRhc2tTdGF0ZTtcbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZShvbGRTdGF0ZSksXG4gICAgfSk7XG4gIH1cblxuICBpbnZlcnNlKHRhc2tTdGF0ZTogVGFza1N0YXRlKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgU2V0VGFza1N0YXRlU3ViT3AodGhpcy50YXNrSW5kZXgsIHRhc2tTdGF0ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEluc2VydE5ld0VtcHR5VGFza0FmdGVyT3AodGFza0luZGV4OiBudW1iZXIpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW1xuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgICBuZXcgQWRkVGFza0FmdGVyU3ViT3AodGFza0luZGV4KSxcbiAgICBuZXcgQWRkRWRnZVN1Yk9wKDAsIHRhc2tJbmRleCArIDEpLFxuICAgIG5ldyBBZGRFZGdlU3ViT3AodGFza0luZGV4ICsgMSwgLTEpLFxuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZXRUYXNrTmFtZU9wKHRhc2tJbmRleDogbnVtYmVyLCBuYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBTZXRUYXNrTmFtZVN1Yk9wKHRhc2tJbmRleCwgbmFtZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNldFRhc2tTdGF0ZU9wKHRhc2tJbmRleDogbnVtYmVyLCB0YXNrU3RhdGU6IFRhc2tTdGF0ZSk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFNldFRhc2tTdGF0ZVN1Yk9wKHRhc2tJbmRleCwgdGFza1N0YXRlKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU3BsaXRUYXNrT3AodGFza0luZGV4OiBudW1iZXIpOiBPcCB7XG4gIGNvbnN0IHN1Yk9wczogU3ViT3BbXSA9IFtcbiAgICBuZXcgRHVwVGFza1N1Yk9wKHRhc2tJbmRleCksXG4gICAgbmV3IEFkZEVkZ2VTdWJPcCh0YXNrSW5kZXgsIHRhc2tJbmRleCArIDEpLFxuICAgIG5ldyBNb3ZlQWxsT3V0Z29pbmdFZGdlc0Zyb21Ub1N1Yk9wKHRhc2tJbmRleCwgdGFza0luZGV4ICsgMSksXG4gIF07XG5cbiAgcmV0dXJuIG5ldyBPcChzdWJPcHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRHVwVGFza09wKHRhc2tJbmRleDogbnVtYmVyKTogT3Age1xuICBjb25zdCBzdWJPcHM6IFN1Yk9wW10gPSBbXG4gICAgbmV3IER1cFRhc2tTdWJPcCh0YXNrSW5kZXgpLFxuICAgIG5ldyBDb3B5QWxsRWRnZXNGcm9tVG9TdWJPcCh0YXNrSW5kZXgsIHRhc2tJbmRleCArIDEpLFxuICBdO1xuXG4gIHJldHVybiBuZXcgT3Aoc3ViT3BzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFkZEVkZ2VPcChmcm9tVGFza0luZGV4OiBudW1iZXIsIHRvVGFza0luZGV4OiBudW1iZXIpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW1xuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgICBuZXcgQWRkRWRnZVN1Yk9wKGZyb21UYXNrSW5kZXgsIHRvVGFza0luZGV4KSxcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gIF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmF0aW9uYWxpemVFZGdlc09wKCk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpXSk7XG59XG4iLCAiLy8gQ2hhbmdlTWV0cmljVmFsdWVcblxuaW1wb3J0IHsgVGFzayB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgTWV0cmljRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9tZXRyaWNzL21ldHJpY3MudHNcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuLnRzXCI7XG5pbXBvcnQgeyBSZXN1bHQsIGVycm9yLCBvayB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IE9wLCBTdWJPcCwgU3ViT3BSZXN1bHQgfSBmcm9tIFwiLi9vcHMudHNcIjtcblxuZXhwb3J0IGNsYXNzIEFkZE1ldHJpY1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBuYW1lOiBzdHJpbmc7XG4gIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb247XG5cbiAgLy8gTWFwcyBhbiBpbmRleCBvZiBhIFRhc2sgdG8gYSB2YWx1ZSBmb3IgdGhlIGdpdmVuIG1ldHJpYyBrZXkuXG4gIHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb24sXG4gICAgdGFza01ldHJpY1ZhbHVlczogTWFwPG51bWJlciwgbnVtYmVyPiA9IG5ldyBNYXAoKSAvLyBTaG91bGQgb25seSBiZSBzdXBwbGllZCBieSBpbnZlcnNlIGFjdGlvbnMuXG4gICkge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5tZXRyaWNEZWZpbml0aW9uID0gbWV0cmljRGVmaW5pdGlvbjtcbiAgICB0aGlzLnRhc2tNZXRyaWNWYWx1ZXMgPSB0YXNrTWV0cmljVmFsdWVzO1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGlmIChwbGFuLmdldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5uYW1lfSBhbHJlYWR5IGV4aXN0cyBhcyBhIE1ldHJpY2ApO1xuICAgIH1cblxuICAgIHBsYW4uc2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5hbWUsIHRoaXMubWV0cmljRGVmaW5pdGlvbik7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIGFkZCB0aGlzIG1ldHJpYyBhbmQgc2V0IGl0IHRvIHRoZSBkZWZhdWx0LFxuICAgIC8vIHVubGVzcyB0aGVyZSBpcyBtYXRjaGluZyBlbnRyeSBpbiB0YXNrTWV0cmljVmFsdWVzLCBpbiB3aGljaCBjYXNlIHdlIHdpbGxcbiAgICAvLyB1c2UgdGhhdCB2YWx1ZSwgaS5lLiB0aGlzIEFkZE1ldHJpY1N1Yk9wIGlzIGFjdHVhbGx5IGEgcmV2ZXJ0IG9mIGFcbiAgICAvLyBEZWxldGVNZXRyaWNTdWJPcC5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIHRhc2suc2V0TWV0cmljKFxuICAgICAgICB0aGlzLm5hbWUsXG4gICAgICAgIHRoaXMudGFza01ldHJpY1ZhbHVlcy5nZXQoaW5kZXgpIHx8IHRoaXMubWV0cmljRGVmaW5pdGlvbi5kZWZhdWx0XG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IERlbGV0ZU1ldHJpY1N1Yk9wKHRoaXMubmFtZSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlbGV0ZU1ldHJpY1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBuYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBtZXRyaWNEZWZpbml0aW9uID0gcGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSk7XG5cbiAgICBpZiAobWV0cmljRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGBUaGUgbWV0cmljIHdpdGggbmFtZSAke3RoaXMubmFtZX0gZG9lcyBub3QgZXhpc3QgYW5kIGNhbid0IGJlIGRlbGV0ZWQuYFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAobWV0cmljRGVmaW5pdGlvbi5pc1N0YXRpYykge1xuICAgICAgcmV0dXJuIGVycm9yKGBUaGUgc3RhdGljIE1ldHJpYyAke3RoaXMubmFtZX0gY2FuJ3QgYmUgZGVsZXRlZC5gKTtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgZnJvbSByZXNvdXJjZSBkZWZpbml0aW9ucy5cbiAgICBwbGFuLmRlbGV0ZU1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lKTtcblxuICAgIGNvbnN0IHRhc2tJbmRleFRvRGVsZXRlZE1ldHJpY1ZhbHVlOiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpO1xuXG4gICAgLy8gTm93IGxvb2sgYXQgYWxsIFRhc2tzIGFuZCByZW1vdmUgYHRoaXMubmFtZWAgZnJvbSB0aGUgbWV0cmljIHdoaWxlIGFsc29cbiAgICAvLyBidWlsZGluZyB1cCB0aGUgaW5mbyBuZWVkZWQgZm9yIGEgcmV2ZXJ0LlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSB0YXNrLmdldE1ldHJpYyh0aGlzLm5hbWUpO1xuICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGFza0luZGV4VG9EZWxldGVkTWV0cmljVmFsdWUuc2V0KGluZGV4LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICB0YXNrLmRlbGV0ZU1ldHJpYyh0aGlzLm5hbWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UobWV0cmljRGVmaW5pdGlvbiwgdGFza0luZGV4VG9EZWxldGVkTWV0cmljVmFsdWUpLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZlcnNlKFxuICAgIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb24sXG4gICAgbWV0cmljVmFsdWVzRm9yRGVsZXRlZFJlc291cmNlTmFtZTogTWFwPG51bWJlciwgbnVtYmVyPlxuICApOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBBZGRNZXRyaWNTdWJPcChcbiAgICAgIHRoaXMubmFtZSxcbiAgICAgIG1ldHJpY0RlZmluaXRpb24sXG4gICAgICBtZXRyaWNWYWx1ZXNGb3JEZWxldGVkUmVzb3VyY2VOYW1lXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVuYW1lTWV0cmljU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG9sZE5hbWU6IHN0cmluZztcbiAgbmV3TmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG9sZE5hbWU6IHN0cmluZywgbmV3TmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5vbGROYW1lID0gb2xkTmFtZTtcbiAgICB0aGlzLm5ld05hbWUgPSBuZXdOYW1lO1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGlmIChwbGFuLmdldE1ldHJpY0RlZmluaXRpb24odGhpcy5uZXdOYW1lKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5uZXdOYW1lfSBhbHJlYWR5IGV4aXN0cyBhcyBhIG1ldHJpYy5gKTtcbiAgICB9XG5cbiAgICBjb25zdCBtZXRyaWNEZWZpbml0aW9uID0gcGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMub2xkTmFtZSk7XG4gICAgaWYgKG1ldHJpY0RlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMub2xkTmFtZX0gZG9lcyBub3QgZXhpc3QgYXMgYSBNZXRyaWNgKTtcbiAgICB9XG4gICAgaWYgKG1ldHJpY0RlZmluaXRpb24uaXNTdGF0aWMpIHtcbiAgICAgIHJldHVybiBlcnJvcihgU3RhdGljIG1ldHJpYyAke3RoaXMub2xkTmFtZX0gY2FuJ3QgYmUgcmVuYW1lZC5gKTtcbiAgICB9XG5cbiAgICBwbGFuLnNldE1ldHJpY0RlZmluaXRpb24odGhpcy5uZXdOYW1lLCBtZXRyaWNEZWZpbml0aW9uKTtcbiAgICBwbGFuLmRlbGV0ZU1ldHJpY0RlZmluaXRpb24odGhpcy5vbGROYW1lKTtcblxuICAgIC8vIE5vdyBsb29wIG92ZXIgZXZlcnkgdGFzayBhbmQgcmVuYW1lIHRoaXMgbWV0cmljLlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaykgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSB0YXNrLmdldE1ldHJpYyh0aGlzLm9sZE5hbWUpIHx8IG1ldHJpY0RlZmluaXRpb24uZGVmYXVsdDtcbiAgICAgIHRhc2suc2V0TWV0cmljKHRoaXMubmV3TmFtZSwgdmFsdWUpO1xuICAgICAgdGFzay5kZWxldGVNZXRyaWModGhpcy5vbGROYW1lKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBSZW5hbWVNZXRyaWNTdWJPcCh0aGlzLm5ld05hbWUsIHRoaXMub2xkTmFtZSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFVwZGF0ZU1ldHJpY1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBuYW1lOiBzdHJpbmc7XG4gIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb247XG5cbiAgLy8gTWFwcyBhbiBpbmRleCBvZiBhIFRhc2sgdG8gYSB2YWx1ZSBmb3IgdGhlIGdpdmVuIG1ldHJpYyBrZXkuXG4gIHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb24sXG4gICAgdGFza01ldHJpY1ZhbHVlczogTWFwPG51bWJlciwgbnVtYmVyPiA9IG5ldyBNYXAoKSAvLyBTaG91bGQgb25seSBiZSBzdXBwbGllZCBieSBpbnZlcnNlIGFjdGlvbnMuXG4gICkge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5tZXRyaWNEZWZpbml0aW9uID0gbWV0cmljRGVmaW5pdGlvbjtcbiAgICB0aGlzLnRhc2tNZXRyaWNWYWx1ZXMgPSB0YXNrTWV0cmljVmFsdWVzO1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IG9sZE1ldHJpY0RlZmluaXRpb24gPSBwbGFuLmdldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lKTtcbiAgICBpZiAob2xkTWV0cmljRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5uYW1lfSBkb2VzIG5vdCBleGlzdCBhcyBhIE1ldHJpY2ApO1xuICAgIH1cbiAgICBpZiAob2xkTWV0cmljRGVmaW5pdGlvbi5pc1N0YXRpYykge1xuICAgICAgcmV0dXJuIGVycm9yKGBTdGF0aWMgbWV0cmljICR7dGhpcy5uYW1lfSBjYW4ndCBiZSB1cGRhdGVkLmApO1xuICAgIH1cblxuICAgIHBsYW4uc2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5hbWUsIHRoaXMubWV0cmljRGVmaW5pdGlvbik7XG5cbiAgICBjb25zdCB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpO1xuICAgIC8vIE5vdyBsb29wIG92ZXIgZXZlcnkgdGFzayBhbmQgdXBkYXRlIHRoZSBtZXRyaWMgdmFsdWVzIHRvIHJlZmxlY3QgdGhlIG5ld1xuICAgIC8vIG1ldHJpYyBkZWZpbml0aW9uLCB1bmxlc3MgdGhlcmUgaXMgbWF0Y2hpbmcgZW50cnkgaW4gdGFza01ldHJpY1ZhbHVlcywgaW5cbiAgICAvLyB3aGljaCBjYXNlIHdlIHdpbGwgdXNlIHRoYXQgdmFsdWUsIGkuZS4gdGhpcyBVcGRhdGVNZXRyaWNTdWJPcCBpc1xuICAgIC8vIGFjdHVhbGx5IGEgcmV2ZXJ0IG9mIGFub3RoZXIgVXBkYXRlTWV0cmljU3ViT3AuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCBvbGRWYWx1ZSA9IHRhc2suZ2V0TWV0cmljKHRoaXMubmFtZSkhO1xuXG4gICAgICBsZXQgbmV3VmFsdWU6IG51bWJlcjtcbiAgICAgIGlmICh0aGlzLnRhc2tNZXRyaWNWYWx1ZXMuaGFzKGluZGV4KSkge1xuICAgICAgICAvLyB0YXNrTWV0cmljVmFsdWVzIGhhcyBhIHZhbHVlIHRoZW4gdXNlIHRoYXQsIGFzIHRoaXMgaXMgYW4gaW52ZXJzZVxuICAgICAgICAvLyBvcGVyYXRpb24uXG4gICAgICAgIG5ld1ZhbHVlID0gdGhpcy50YXNrTWV0cmljVmFsdWVzLmdldChpbmRleCkhO1xuICAgICAgfSBlbHNlIGlmIChvbGRWYWx1ZSA9PT0gb2xkTWV0cmljRGVmaW5pdGlvbi5kZWZhdWx0KSB7XG4gICAgICAgIC8vIElmIHRoZSBvbGRWYWx1ZSBpcyB0aGUgZGVmYXVsdCwgY2hhbmdlIGl0IHRvIHRoZSBuZXcgZGVmYXVsdC5cbiAgICAgICAgbmV3VmFsdWUgPSB0aGlzLm1ldHJpY0RlZmluaXRpb24uZGVmYXVsdDtcbiAgICAgICAgdGFza01ldHJpY1ZhbHVlcy5zZXQoaW5kZXgsIG9sZFZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIENsYW1wLlxuICAgICAgICBuZXdWYWx1ZSA9IHRoaXMubWV0cmljRGVmaW5pdGlvbi5yYW5nZS5jbGFtcChvbGRWYWx1ZSk7XG4gICAgICAgIHRhc2tNZXRyaWNWYWx1ZXMuc2V0KGluZGV4LCBvbGRWYWx1ZSk7XG4gICAgICB9XG4gICAgICB0YXNrLnNldE1ldHJpYyh0aGlzLm5hbWUsIG5ld1ZhbHVlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG9sZE1ldHJpY0RlZmluaXRpb24sIHRhc2tNZXRyaWNWYWx1ZXMpLFxuICAgIH0pO1xuICB9XG5cbiAgaW52ZXJzZShcbiAgICBvbGRNZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uLFxuICAgIHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj5cbiAgKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgVXBkYXRlTWV0cmljU3ViT3AoXG4gICAgICB0aGlzLm5hbWUsXG4gICAgICBvbGRNZXRyaWNEZWZpbml0aW9uLFxuICAgICAgdGFza01ldHJpY1ZhbHVlc1xuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNldE1ldHJpY1ZhbHVlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG5hbWU6IHN0cmluZztcbiAgdmFsdWU6IG51bWJlcjtcbiAgdGFza0luZGV4OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCB2YWx1ZTogbnVtYmVyLCB0YXNrSW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMudGFza0luZGV4ID0gdGFza0luZGV4O1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IG1ldHJpY3NEZWZpbml0aW9uID0gcGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSk7XG4gICAgaWYgKG1ldHJpY3NEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm5hbWV9IGRvZXMgbm90IGV4aXN0IGFzIGEgTWV0cmljYCk7XG4gICAgfVxuXG4gICAgY29uc3QgdGFzayA9IHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdO1xuICAgIGNvbnN0IG9sZFZhbHVlID0gdGFzay5nZXRNZXRyaWModGhpcy5uYW1lKSB8fCBtZXRyaWNzRGVmaW5pdGlvbi5kZWZhdWx0O1xuICAgIHRhc2suc2V0TWV0cmljKHRoaXMubmFtZSwgdGhpcy52YWx1ZSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2Uob2xkVmFsdWUpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSh2YWx1ZTogbnVtYmVyKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgU2V0TWV0cmljVmFsdWVTdWJPcCh0aGlzLm5hbWUsIHZhbHVlLCB0aGlzLnRhc2tJbmRleCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFkZE1ldHJpY09wKFxuICBuYW1lOiBzdHJpbmcsXG4gIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb25cbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IEFkZE1ldHJpY1N1Yk9wKG5hbWUsIG1ldHJpY0RlZmluaXRpb24pXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZWxldGVNZXRyaWNPcChuYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBEZWxldGVNZXRyaWNTdWJPcChuYW1lKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmVuYW1lTWV0cmljT3Aob2xkTmFtZTogc3RyaW5nLCBuZXdOYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBSZW5hbWVNZXRyaWNTdWJPcChvbGROYW1lLCBuZXdOYW1lKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gVXBkYXRlTWV0cmljT3AoXG4gIG5hbWU6IHN0cmluZyxcbiAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvblxuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgVXBkYXRlTWV0cmljU3ViT3AobmFtZSwgbWV0cmljRGVmaW5pdGlvbildKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNldE1ldHJpY1ZhbHVlT3AoXG4gIG5hbWU6IHN0cmluZyxcbiAgdmFsdWU6IG51bWJlcixcbiAgdGFza0luZGV4OiBudW1iZXJcbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFNldE1ldHJpY1ZhbHVlU3ViT3AobmFtZSwgdmFsdWUsIHRhc2tJbmRleCldKTtcbn1cbiIsICIvLyBFYWNoIFJlc291cnNlIGhhcyBhIGtleSwgd2hpY2ggaXMgdGhlIG5hbWUsIGFuZCBhIGxpc3Qgb2YgYWNjZXB0YWJsZSB2YWx1ZXMuXG4vLyBUaGUgbGlzdCBvZiB2YWx1ZXMgY2FuIG5ldmVyIGJlIGVtcHR5LCBhbmQgdGhlIGZpcnN0IHZhbHVlIGluIGB2YWx1ZXNgIGlzIHRoZVxuLy8gZGVmYXVsdCB2YWx1ZSBmb3IgYSBSZXNvdXJjZS5cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUkVTT1VSQ0VfVkFMVUUgPSBcIlwiO1xuXG5leHBvcnQgY2xhc3MgUmVzb3VyY2VEZWZpbml0aW9uIHtcbiAgdmFsdWVzOiBzdHJpbmdbXTtcbiAgaXNTdGF0aWM6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy52YWx1ZXMgPSBbREVGQVVMVF9SRVNPVVJDRV9WQUxVRV07XG4gICAgdGhpcy5pc1N0YXRpYyA9IGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFJlc291cmNlRGVmaW5pdGlvbnMgPSB7IFtrZXk6IHN0cmluZ106IFJlc291cmNlRGVmaW5pdGlvbiB9O1xuIiwgImltcG9ydCB7IFJlc3VsdCwgb2ssIGVycm9yIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcbmltcG9ydCB7IE9wLCBTdWJPcCwgU3ViT3BSZXN1bHQgfSBmcm9tIFwiLi9vcHMudHNcIjtcbmltcG9ydCB7XG4gIERFRkFVTFRfUkVTT1VSQ0VfVkFMVUUsXG4gIFJlc291cmNlRGVmaW5pdGlvbixcbn0gZnJvbSBcIi4uL3Jlc291cmNlcy9yZXNvdXJjZXMudHNcIjtcbmltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcblxuZXhwb3J0IGNsYXNzIEFkZFJlc291cmNlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuXG4gIC8vIE1hcHMgYW4gaW5kZXggb2YgYSBUYXNrIHRvIGEgdmFsdWUgZm9yIHRoZSBnaXZlbiByZXNvdXJjZSBrZXkuXG4gIHRhc2tSZXNvdXJjZVZhbHVlczogTWFwPG51bWJlciwgc3RyaW5nPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgdGFza1Jlc291cmNlVmFsdWVzOiBNYXA8bnVtYmVyLCBzdHJpbmc+ID0gbmV3IE1hcDxudW1iZXIsIHN0cmluZz4oKSAvLyBTaG91bGQgb25seSBiZSBzdXBwbGllZCBieSBpbnZlcnNlIGFjdGlvbnMuXG4gICkge1xuICAgIHRoaXMua2V5ID0gbmFtZTtcbiAgICB0aGlzLnRhc2tSZXNvdXJjZVZhbHVlcyA9IHRhc2tSZXNvdXJjZVZhbHVlcztcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBmb3VuZE1hdGNoID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChmb3VuZE1hdGNoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gYWxyZWFkeSBleGlzdHMgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cblxuICAgIHBsYW4uc2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5LCBuZXcgUmVzb3VyY2VEZWZpbml0aW9uKCkpO1xuXG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCBhZGQgdGhpcyBrZXkgYW5kIHNldCBpdCB0byB0aGUgZGVmYXVsdCwgdW5sZXNzXG4gICAgLy8gdGhlcmUgaXMgbWF0Y2hpbmcgZW50cnkgaW4gdGFza1Jlc291cmNlVmFsdWVzLCBpbiB3aGljaCBjYXNlIHdlIHdpbGwgdXNlIHRoYXQgdmFsdWUuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICB0YXNrLnNldFJlc291cmNlKFxuICAgICAgICB0aGlzLmtleSxcbiAgICAgICAgdGhpcy50YXNrUmVzb3VyY2VWYWx1ZXMuZ2V0KGluZGV4KSB8fCBERUZBVUxUX1JFU09VUkNFX1ZBTFVFXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IERlbGV0ZVJlc291cmNlU3VwT3AodGhpcy5rZXkpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWxldGVSZXNvdXJjZVN1cE9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLmtleSA9IG5hbWU7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgcmVzb3VyY2VEZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChyZXNvdXJjZURlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgVGhlIHJlc291cmNlIHdpdGggbmFtZSAke3RoaXMua2V5fSBkb2VzIG5vdCBleGlzdCBhbmQgY2FuJ3QgYmUgZGVsZXRlZC5gXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSBmcm9tIHJlc291cmNlIGRlZmluaXRpb25zLlxuICAgIHBsYW4uZGVsZXRlTWV0cmljRGVmaW5pdGlvbih0aGlzLmtleSk7XG5cbiAgICBjb25zdCB0YXNrSW5kZXhUb0RlbGV0ZWRSZXNvdXJjZVZhbHVlOiBNYXA8bnVtYmVyLCBzdHJpbmc+ID0gbmV3IE1hcCgpO1xuXG4gICAgLy8gTm93IGxvb2sgYXQgYWxsIFRhc2tzIGFuZCByZW1vdmUgYHRoaXMua2V5YCBmcm9tIHRoZSByZXNvdXJjZXMgd2hpbGUgYWxzb1xuICAgIC8vIGJ1aWxkaW5nIHVwIHRoZSBpbmZvIG5lZWRlZCBmb3IgYSByZXZlcnQuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRhc2suZ2V0UmVzb3VyY2UodGhpcy5rZXkpIHx8IERFRkFVTFRfUkVTT1VSQ0VfVkFMVUU7XG4gICAgICB0YXNrSW5kZXhUb0RlbGV0ZWRSZXNvdXJjZVZhbHVlLnNldChpbmRleCwgdmFsdWUpO1xuICAgICAgdGFzay5kZWxldGVSZXNvdXJjZSh0aGlzLmtleSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZSh0YXNrSW5kZXhUb0RlbGV0ZWRSZXNvdXJjZVZhbHVlKSxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgaW52ZXJzZShcbiAgICByZXNvdXJjZVZhbHVlc0ZvckRlbGV0ZWRSZXNvdXJjZUtleTogTWFwPG51bWJlciwgc3RyaW5nPlxuICApOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBBZGRSZXNvdXJjZVN1Yk9wKHRoaXMua2V5LCByZXNvdXJjZVZhbHVlc0ZvckRlbGV0ZWRSZXNvdXJjZUtleSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFkZFJlc291cmNlT3B0aW9uU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuICB2YWx1ZTogc3RyaW5nO1xuICBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlOiBudW1iZXJbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGtleTogc3RyaW5nLFxuICAgIHZhbHVlOiBzdHJpbmcsXG4gICAgaW5kaWNlc09mVGFza3NUb0NoYW5nZTogbnVtYmVyW10gPSBbXSAvLyBUaGlzIHNob3VsZCBvbmx5IGJlIHN1cHBsaWVkIHdoZW4gYmVpbmcgY29uc3RydWN0ZWQgYXMgYSBpbnZlcnNlIG9wZXJhdGlvbi5cbiAgKSB7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuaW5kaWNlc09mVGFza3NUb0NoYW5nZSA9IGluZGljZXNPZlRhc2tzVG9DaGFuZ2U7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXNuJ3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cbiAgICBjb25zdCBleGlzdGluZ0luZGV4ID0gZGVmaW5pdGlvbi52YWx1ZXMuZmluZEluZGV4KFxuICAgICAgKHZhbHVlOiBzdHJpbmcpID0+IHZhbHVlID09PSB0aGlzLnZhbHVlXG4gICAgKTtcbiAgICBpZiAoZXhpc3RpbmdJbmRleCAhPT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYCR7dGhpcy52YWx1ZX0gYWxyZWFkeSBleGlzdHMgYXMgYSB2YWx1ZSBpbiB0aGUgUmVzb3VyY2UgJHt0aGlzLmtleX0uYFxuICAgICAgKTtcbiAgICB9XG4gICAgZGVmaW5pdGlvbi52YWx1ZXMucHVzaCh0aGlzLnZhbHVlKTtcblxuICAgIC8vIE5vdyBsb29rIGF0IGFsbCBUYXNrcyBhbmQgc2V0IHRoZSB2YWx1ZSBmb3IgdGhlIGdpdmVuIGtleSBmb3IgYWxsIHRoZVxuICAgIC8vIHRhc2tzIGxpc3RlZCBpbiBgaW5kaWNlc09mVGFza3NUb0NoYW5nZWAuXG4gICAgdGhpcy5pbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlLmZvckVhY2goKHRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tJbmRleF0uc2V0UmVzb3VyY2UodGhpcy5rZXksIHRoaXMudmFsdWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBwcml2YXRlIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlUmVzb3VyY2VPcHRpb25TdWJPcChcbiAgICAgIHRoaXMua2V5LFxuICAgICAgdGhpcy52YWx1ZSxcbiAgICAgIHRoaXMuaW5kaWNlc09mVGFza3NUb0NoYW5nZVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlbGV0ZVJlc291cmNlT3B0aW9uU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuICB2YWx1ZTogc3RyaW5nO1xuICBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlOiBudW1iZXJbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBrZXk6IHN0cmluZyxcbiAgICB2YWx1ZTogc3RyaW5nLFxuICAgIGluZGljZXNPZlRhc2tzVG9DaGFuZ2U6IG51bWJlcltdID0gW11cbiAgKSB7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuaW5kaWNlc09mVGFza3NUb0NoYW5nZSA9IGluZGljZXNPZlRhc2tzVG9DaGFuZ2U7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXNuJ3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cbiAgICBjb25zdCB2YWx1ZUluZGV4ID0gZGVmaW5pdGlvbi52YWx1ZXMuZmluZEluZGV4KFxuICAgICAgKHZhbHVlOiBzdHJpbmcpID0+IHZhbHVlID09PSB0aGlzLnZhbHVlXG4gICAgKTtcbiAgICBpZiAodmFsdWVJbmRleCA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYCR7dGhpcy52YWx1ZX0gZG9lcyBub3QgZXhpc3QgYXMgYSB2YWx1ZSBpbiB0aGUgUmVzb3VyY2UgJHt0aGlzLmtleX0uYFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGRlZmluaXRpb24udmFsdWVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgUmVzb3VyY2VzIG11c3QgaGF2ZSBhdCBsZWFzdCBvbmUgdmFsdWUuICR7dGhpcy52YWx1ZX0gb25seSBoYXMgb25lIHZhbHVlLCBzbyBpdCBjYW4ndCBiZSBkZWxldGVkLiBgXG4gICAgICApO1xuICAgIH1cblxuICAgIGRlZmluaXRpb24udmFsdWVzLnNwbGljZSh2YWx1ZUluZGV4LCAxKTtcblxuICAgIC8vIE5vdyBpdGVyYXRlIHRob3VnaCBhbGwgdGhlIHRhc2tzIGFuZCBjaGFuZ2UgYWxsIHRhc2tzIHRoYXQgaGF2ZVxuICAgIC8vIFwia2V5OnZhbHVlXCIgdG8gaW5zdGVhZCBiZSBcImtleTpkZWZhdWx0XCIuIFJlY29yZCB3aGljaCB0YXNrcyBnb3QgY2hhbmdlZFxuICAgIC8vIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGF0IGluZm9ybWF0aW9uIHdoZW4gd2UgY3JlYXRlIHRoZSBpbnZlcnQgb3BlcmF0aW9uLlxuXG4gICAgY29uc3QgaW5kaWNlc09mVGFza3NXaXRoTWF0Y2hpbmdSZXNvdXJjZVZhbHVlczogbnVtYmVyW10gPSBbXTtcblxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3QgcmVzb3VyY2VWYWx1ZSA9IHRhc2suZ2V0UmVzb3VyY2UodGhpcy5rZXkpO1xuICAgICAgaWYgKHJlc291cmNlVmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFNpbmNlIHRoZSB2YWx1ZSBpcyBubyBsb25nZXIgdmFsaWQgd2UgY2hhbmdlIGl0IGJhY2sgdG8gdGhlIGRlZmF1bHQuXG4gICAgICB0YXNrLnNldFJlc291cmNlKHRoaXMua2V5LCBkZWZpbml0aW9uLnZhbHVlc1swXSk7XG5cbiAgICAgIC8vIFJlY29yZCB3aGljaCB0YXNrIHdlIGp1c3QgY2hhbmdlZC5cbiAgICAgIGluZGljZXNPZlRhc2tzV2l0aE1hdGNoaW5nUmVzb3VyY2VWYWx1ZXMucHVzaChpbmRleCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZShpbmRpY2VzT2ZUYXNrc1dpdGhNYXRjaGluZ1Jlc291cmNlVmFsdWVzKSxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgaW52ZXJzZShpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlOiBudW1iZXJbXSk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IEFkZFJlc291cmNlT3B0aW9uU3ViT3AoXG4gICAgICB0aGlzLmtleSxcbiAgICAgIHRoaXMudmFsdWUsXG4gICAgICBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVuYW1lUmVzb3VyY2VTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgb2xkS2V5OiBzdHJpbmc7XG4gIG5ld0tleTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG9sZEtleTogc3RyaW5nLCBuZXdLZXk6IHN0cmluZykge1xuICAgIHRoaXMub2xkS2V5ID0gb2xkS2V5O1xuICAgIHRoaXMubmV3S2V5ID0gbmV3S2V5O1xuICB9XG5cbiAgYXBwbHkocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IG9sZERlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLm9sZEtleSk7XG4gICAgaWYgKG9sZERlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMub2xkS2V5fSBkb2VzIG5vdCBleGlzdCBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuXG4gICAgLy8gQ29uZmlybSB0aGUgbmV3S2V5IGlzIG5vdCBhbHJlYWR5IHVzZWQuXG4gICAgY29uc3QgbmV3S2V5RGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMubmV3S2V5KTtcbiAgICBpZiAobmV3S2V5RGVmaW5pdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5uZXdLZXl9IGFscmVhZHkgZXhpc3RzIGFzIGEgcmVzb3VyY2UgbmFtZS5gKTtcbiAgICB9XG5cbiAgICBwbGFuLmRlbGV0ZVJlc291cmNlRGVmaW5pdGlvbih0aGlzLm9sZEtleSk7XG4gICAgcGxhbi5zZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5uZXdLZXksIG9sZERlZmluaXRpb24pO1xuXG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCBjaGFuZ2Ugb2xkS2V5IC0+IG5ld2tleSBmb3IgdGhlIGdpdmVuIHJlc291cmNlIGtleS5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2spID0+IHtcbiAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZSA9XG4gICAgICAgIHRhc2suZ2V0UmVzb3VyY2UodGhpcy5vbGRLZXkpIHx8IERFRkFVTFRfUkVTT1VSQ0VfVkFMVUU7XG4gICAgICB0YXNrLnNldFJlc291cmNlKHRoaXMubmV3S2V5LCBjdXJyZW50VmFsdWUpO1xuICAgICAgdGFzay5kZWxldGVSZXNvdXJjZSh0aGlzLm9sZEtleSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgUmVuYW1lUmVzb3VyY2VTdWJPcCh0aGlzLm5ld0tleSwgdGhpcy5vbGRLZXkpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZW5hbWVSZXNvdXJjZU9wdGlvblN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcbiAgb2xkVmFsdWU6IHN0cmluZztcbiAgbmV3VmFsdWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihrZXk6IHN0cmluZywgb2xkVmFsdWU6IHN0cmluZywgbmV3VmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMub2xkVmFsdWUgPSBvbGRWYWx1ZTtcbiAgICB0aGlzLm5ld1ZhbHVlID0gbmV3VmFsdWU7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZm91bmRNYXRjaCA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZm91bmRNYXRjaCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXMgbm90IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG5cbiAgICAvLyBDb25maXJtIHRoZSBvbGRWYWx1ZSBpcyBpbiB0aGVyZS5cbiAgICBjb25zdCBvbGRWYWx1ZUluZGV4ID0gZm91bmRNYXRjaC52YWx1ZXMuaW5kZXhPZih0aGlzLm9sZFZhbHVlKTtcblxuICAgIGlmIChvbGRWYWx1ZUluZGV4ID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2VzIG5vdCBhIHZhbHVlICR7dGhpcy5vbGRWYWx1ZX1gKTtcbiAgICB9XG5cbiAgICAvLyBDb25maXJtIHRoZSBuZXdWYWx1ZSBpcyBub3QgaW4gdGhlcmUuXG4gICAgY29uc3QgbmV3VmFsdWVJbmRleCA9IGZvdW5kTWF0Y2gudmFsdWVzLmluZGV4T2YodGhpcy5uZXdWYWx1ZSk7XG4gICAgaWYgKG5ld1ZhbHVlSW5kZXggIT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGFscmVhZHkgaGFzIGEgdmFsdWUgJHt0aGlzLm5ld1ZhbHVlfWApO1xuICAgIH1cblxuICAgIC8vIFN3YXAgdGhlIHZhbHVlcy5cbiAgICBmb3VuZE1hdGNoLnZhbHVlcy5zcGxpY2Uob2xkVmFsdWVJbmRleCwgMSwgdGhpcy5uZXdWYWx1ZSk7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIGNoYW5nZSBvbGRWYWx1ZSAtPiBuZXdWYWx1ZSBmb3IgdGhlIGdpdmVuIHJlc291cmNlIGtleS5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2spID0+IHtcbiAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZSA9IHRhc2suZ2V0UmVzb3VyY2UodGhpcy5rZXkpO1xuICAgICAgaWYgKGN1cnJlbnRWYWx1ZSA9PT0gdGhpcy5vbGRWYWx1ZSkge1xuICAgICAgICB0YXNrLnNldFJlc291cmNlKHRoaXMua2V5LCB0aGlzLm5ld1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBSZW5hbWVSZXNvdXJjZU9wdGlvblN1Yk9wKFxuICAgICAgdGhpcy5rZXksXG4gICAgICB0aGlzLm5ld1ZhbHVlLFxuICAgICAgdGhpcy5vbGRWYWx1ZVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1vdmVSZXNvdXJjZU9wdGlvblN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcbiAgb2xkSW5kZXg6IG51bWJlcjtcbiAgbmV3SW5kZXg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihrZXk6IHN0cmluZywgb2xkVmFsdWU6IG51bWJlciwgbmV3VmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMub2xkSW5kZXggPSBvbGRWYWx1ZTtcbiAgICB0aGlzLm5ld0luZGV4ID0gbmV3VmFsdWU7XG4gIH1cblxuICBhcHBseShwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXMgbm90IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vbGRJbmRleCA+IGRlZmluaXRpb24udmFsdWVzLmxlbmd0aCAtIDEpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYCR7dGhpcy5rZXl9IGRvZXMgbm90IGhhdmUgYSB2YWx1ZSBhdCBpbmRleCAke3RoaXMub2xkSW5kZXh9YFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKHRoaXMubmV3SW5kZXggPiBkZWZpbml0aW9uLnZhbHVlcy5sZW5ndGggLSAxKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGAke3RoaXMua2V5fSBkb2VzIG5vdCBoYXZlIGEgdmFsdWUgYXQgaW5kZXggJHt0aGlzLm5ld0luZGV4fWBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gU3dhcCB0aGUgdmFsdWVzLlxuICAgIGNvbnN0IHRtcCA9IGRlZmluaXRpb24udmFsdWVzW3RoaXMub2xkSW5kZXhdO1xuICAgIGRlZmluaXRpb24udmFsdWVzW3RoaXMub2xkSW5kZXhdID0gZGVmaW5pdGlvbi52YWx1ZXNbdGhpcy5uZXdJbmRleF07XG4gICAgZGVmaW5pdGlvbi52YWx1ZXNbdGhpcy5uZXdJbmRleF0gPSB0bXA7XG5cbiAgICAvLyBXZSBkb24ndCBuZWVkIHRvIGRvIGFueXRoaW5nIHdpdGggVGFza3MgYmVjYXVzZSB0aGUgaW5kZXggb2YgYSB2YWx1ZSBpc1xuICAgIC8vIGlycmVsZXZhbnQgc2luY2Ugd2Ugc3RvcmUgdGhlIHZhbHVlIGl0c2VsZiwgbm90IHRoZSBpbmRleC5cblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBNb3ZlUmVzb3VyY2VPcHRpb25TdWJPcCh0aGlzLmtleSwgdGhpcy5uZXdJbmRleCwgdGhpcy5vbGRJbmRleCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNldFJlc291cmNlVmFsdWVTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG4gIHZhbHVlOiBzdHJpbmc7XG4gIHRhc2tJbmRleDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCB0YXNrSW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLnRhc2tJbmRleCA9IHRhc2tJbmRleDtcbiAgfVxuXG4gIGFwcGx5KHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBmb3VuZE1hdGNoID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChmb3VuZE1hdGNoID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lcyBub3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cblxuICAgIGNvbnN0IGZvdW5kVmFsdWVNYXRjaCA9IGZvdW5kTWF0Y2gudmFsdWVzLmZpbmRJbmRleCgodjogc3RyaW5nKSA9PiB7XG4gICAgICByZXR1cm4gdiA9PT0gdGhpcy52YWx1ZTtcbiAgICB9KTtcbiAgICBpZiAoZm91bmRWYWx1ZU1hdGNoID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2VzIG5vdCBoYXZlIGEgdmFsdWUgb2YgJHt0aGlzLnZhbHVlfWApO1xuICAgIH1cbiAgICBpZiAodGhpcy50YXNrSW5kZXggPCAwIHx8IHRoaXMudGFza0luZGV4ID49IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYFRoZXJlIGlzIG5vIFRhc2sgYXQgaW5kZXggJHt0aGlzLnRhc2tJbmRleH1gKTtcbiAgICB9XG5cbiAgICBjb25zdCB0YXNrID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLnRhc2tJbmRleF07XG4gICAgY29uc3Qgb2xkVmFsdWUgPSB0YXNrLmdldFJlc291cmNlKHRoaXMua2V5KSE7XG4gICAgdGFzay5zZXRSZXNvdXJjZSh0aGlzLmtleSwgdGhpcy52YWx1ZSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2Uob2xkVmFsdWUpIH0pO1xuICB9XG5cbiAgaW52ZXJzZShvbGRWYWx1ZTogc3RyaW5nKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgU2V0UmVzb3VyY2VWYWx1ZVN1Yk9wKHRoaXMua2V5LCBvbGRWYWx1ZSwgdGhpcy50YXNrSW5kZXgpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBZGRSZXNvdXJjZU9wKG5hbWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IEFkZFJlc291cmNlU3ViT3AobmFtZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIERlbGV0ZVJlc291cmNlT3AobmFtZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgRGVsZXRlUmVzb3VyY2VTdXBPcChuYW1lKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQWRkUmVzb3VyY2VPcHRpb25PcChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IEFkZFJlc291cmNlT3B0aW9uU3ViT3Aoa2V5LCB2YWx1ZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIERlbGV0ZVJlc291cmNlT3B0aW9uT3Aoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBEZWxldGVSZXNvdXJjZU9wdGlvblN1Yk9wKGtleSwgdmFsdWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZW5hbWVSZXNvdXJjZU9wdGlvbk9wKFxuICBrZXk6IHN0cmluZyxcbiAgb2xkVmFsdWU6IHN0cmluZyxcbiAgbmV3VmFsdWU6IHN0cmluZ1xuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgUmVuYW1lUmVzb3VyY2VPcHRpb25TdWJPcChrZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJlbmFtZVJlc291cmNlT3Aob2xkVmFsdWU6IHN0cmluZywgbmV3VmFsdWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFJlbmFtZVJlc291cmNlU3ViT3Aob2xkVmFsdWUsIG5ld1ZhbHVlKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gTW92ZVJlc291cmNlT3B0aW9uT3AoXG4gIGtleTogc3RyaW5nLFxuICBvbGRJbmRleDogbnVtYmVyLFxuICBuZXdJbmRleDogbnVtYmVyXG4pOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBNb3ZlUmVzb3VyY2VPcHRpb25TdWJPcChrZXksIG9sZEluZGV4LCBuZXdJbmRleCldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNldFJlc291cmNlVmFsdWVPcChcbiAga2V5OiBzdHJpbmcsXG4gIHZhbHVlOiBzdHJpbmcsXG4gIHRhc2tJbmRleDogbnVtYmVyXG4pOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBTZXRSZXNvdXJjZVZhbHVlU3ViT3Aoa2V5LCB2YWx1ZSwgdGFza0luZGV4KV0pO1xufVxuIiwgImltcG9ydCB7XG4gIFZlcnRleCxcbiAgVmVydGV4SW5kaWNlcyxcbiAgRGlyZWN0ZWRHcmFwaCxcbiAgZWRnZXNCeVNyY1RvTWFwLFxufSBmcm9tIFwiLi4vZGFnLnRzXCI7XG5cbi8qKlxuVGhlIHJldHVybiB0eXBlIGZvciB0aGUgVG9wbG9naWNhbFNvcnQgZnVuY3Rpb24uIFxuICovXG50eXBlIFRTUmV0dXJuID0ge1xuICBoYXNDeWNsZXM6IGJvb2xlYW47XG5cbiAgY3ljbGU6IFZlcnRleEluZGljZXM7XG5cbiAgb3JkZXI6IFZlcnRleEluZGljZXM7XG59O1xuXG4vKipcblJldHVybnMgYSB0b3BvbG9naWNhbCBzb3J0IG9yZGVyIGZvciBhIERpcmVjdGVkR3JhcGgsIG9yIHRoZSBtZW1iZXJzIG9mIGEgY3ljbGUgaWYgYVxudG9wb2xvZ2ljYWwgc29ydCBjYW4ndCBiZSBkb25lLlxuIFxuIFRoZSB0b3BvbG9naWNhbCBzb3J0IGNvbWVzIGZyb206XG5cbiAgICBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Ub3BvbG9naWNhbF9zb3J0aW5nI0RlcHRoLWZpcnN0X3NlYXJjaFxuXG5MIFx1MjE5MCBFbXB0eSBsaXN0IHRoYXQgd2lsbCBjb250YWluIHRoZSBzb3J0ZWQgbm9kZXNcbndoaWxlIGV4aXN0cyBub2RlcyB3aXRob3V0IGEgcGVybWFuZW50IG1hcmsgZG9cbiAgICBzZWxlY3QgYW4gdW5tYXJrZWQgbm9kZSBuXG4gICAgdmlzaXQobilcblxuZnVuY3Rpb24gdmlzaXQobm9kZSBuKVxuICAgIGlmIG4gaGFzIGEgcGVybWFuZW50IG1hcmsgdGhlblxuICAgICAgICByZXR1cm5cbiAgICBpZiBuIGhhcyBhIHRlbXBvcmFyeSBtYXJrIHRoZW5cbiAgICAgICAgc3RvcCAgIChncmFwaCBoYXMgYXQgbGVhc3Qgb25lIGN5Y2xlKVxuXG4gICAgbWFyayBuIHdpdGggYSB0ZW1wb3JhcnkgbWFya1xuXG4gICAgZm9yIGVhY2ggbm9kZSBtIHdpdGggYW4gZWRnZSBmcm9tIG4gdG8gbSBkb1xuICAgICAgICB2aXNpdChtKVxuXG4gICAgcmVtb3ZlIHRlbXBvcmFyeSBtYXJrIGZyb20gblxuICAgIG1hcmsgbiB3aXRoIGEgcGVybWFuZW50IG1hcmtcbiAgICBhZGQgbiB0byBoZWFkIG9mIExcblxuICovXG5leHBvcnQgY29uc3QgdG9wb2xvZ2ljYWxTb3J0ID0gKGc6IERpcmVjdGVkR3JhcGgpOiBUU1JldHVybiA9PiB7XG4gIGNvbnN0IHJldDogVFNSZXR1cm4gPSB7XG4gICAgaGFzQ3ljbGVzOiBmYWxzZSxcbiAgICBjeWNsZTogW10sXG4gICAgb3JkZXI6IFtdLFxuICB9O1xuXG4gIGNvbnN0IGVkZ2VNYXAgPSBlZGdlc0J5U3JjVG9NYXAoZy5FZGdlcyk7XG5cbiAgY29uc3Qgbm9kZXNXaXRob3V0UGVybWFuZW50TWFyayA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuICBnLlZlcnRpY2VzLmZvckVhY2goKF86IFZlcnRleCwgaW5kZXg6IG51bWJlcikgPT5cbiAgICBub2Rlc1dpdGhvdXRQZXJtYW5lbnRNYXJrLmFkZChpbmRleClcbiAgKTtcblxuICBjb25zdCBoYXNQZXJtYW5lbnRNYXJrID0gKGluZGV4OiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgICByZXR1cm4gIW5vZGVzV2l0aG91dFBlcm1hbmVudE1hcmsuaGFzKGluZGV4KTtcbiAgfTtcblxuICBjb25zdCB0ZW1wb3JhcnlNYXJrID0gbmV3IFNldDxudW1iZXI+KCk7XG5cbiAgY29uc3QgdmlzaXQgPSAoaW5kZXg6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xuICAgIGlmIChoYXNQZXJtYW5lbnRNYXJrKGluZGV4KSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmICh0ZW1wb3JhcnlNYXJrLmhhcyhpbmRleCkpIHtcbiAgICAgIC8vIFdlIG9ubHkgcmV0dXJuIGZhbHNlIG9uIGZpbmRpbmcgYSBsb29wLCB3aGljaCBpcyBzdG9yZWQgaW5cbiAgICAgIC8vIHRlbXBvcmFyeU1hcmsuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRlbXBvcmFyeU1hcmsuYWRkKGluZGV4KTtcblxuICAgIGNvbnN0IG5leHRFZGdlcyA9IGVkZ2VNYXAuZ2V0KGluZGV4KTtcbiAgICBpZiAobmV4dEVkZ2VzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmV4dEVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGUgPSBuZXh0RWRnZXNbaV07XG4gICAgICAgIGlmICghdmlzaXQoZS5qKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRlbXBvcmFyeU1hcmsuZGVsZXRlKGluZGV4KTtcbiAgICBub2Rlc1dpdGhvdXRQZXJtYW5lbnRNYXJrLmRlbGV0ZShpbmRleCk7XG4gICAgcmV0Lm9yZGVyLnVuc2hpZnQoaW5kZXgpO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8vIFdlIHdpbGwgcHJlc3VtZSB0aGF0IFZlcnRleFswXSBpcyB0aGUgc3RhcnQgbm9kZSBhbmQgdGhhdCB3ZSBzaG91bGQgc3RhcnQgdGhlcmUuXG4gIGNvbnN0IG9rID0gdmlzaXQoMCk7XG4gIGlmICghb2spIHtcbiAgICByZXQuaGFzQ3ljbGVzID0gdHJ1ZTtcbiAgICByZXQuY3ljbGUgPSBbLi4udGVtcG9yYXJ5TWFyay5rZXlzKCldO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn07XG4iLCAiaW1wb3J0IHsgUmVzdWx0LCBvaywgZXJyb3IgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQge1xuICBWZXJ0ZXhJbmRpY2VzLFxuICBFZGdlcyxcbiAgRGlyZWN0ZWRHcmFwaCxcbiAgZWRnZXNCeVNyY1RvTWFwLFxuICBlZGdlc0J5RHN0VG9NYXAsXG4gIERpcmVjdGVkRWRnZSxcbiAgRGlyZWN0ZWRFZGdlU2VyaWFsaXplZCxcbn0gZnJvbSBcIi4uL2RhZy9kYWdcIjtcblxuaW1wb3J0IHsgdG9wb2xvZ2ljYWxTb3J0IH0gZnJvbSBcIi4uL2RhZy9hbGdvcml0aG1zL3RvcG9zb3J0LnRzXCI7XG5pbXBvcnQgeyBNZXRyaWNWYWx1ZXMgfSBmcm9tIFwiLi4vbWV0cmljcy9tZXRyaWNzLnRzXCI7XG5cbmV4cG9ydCB0eXBlIFRhc2tTdGF0ZSA9IFwidW5zdGFydGVkXCIgfCBcInN0YXJ0ZWRcIiB8IFwiY29tcGxldGVcIjtcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfVEFTS19OQU1FID0gXCJUYXNrIE5hbWVcIjtcblxuZXhwb3J0IGludGVyZmFjZSBUYXNrU2VyaWFsaXplZCB7XG4gIHJlc291cmNlczogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcbiAgbWV0cmljczogTWV0cmljVmFsdWVzO1xuICBuYW1lOiBzdHJpbmc7XG4gIHN0YXRlOiBUYXNrU3RhdGU7XG59XG5cbi8vIERvIHdlIGNyZWF0ZSBzdWItY2xhc3NlcyBhbmQgdGhlbiBzZXJpYWxpemUgc2VwYXJhdGVseT8gT3IgZG8gd2UgaGF2ZSBhXG4vLyBjb25maWcgYWJvdXQgd2hpY2ggdHlwZSBvZiBEdXJhdGlvblNhbXBsZXIgaXMgYmVpbmcgdXNlZD9cbi8vXG4vLyBXZSBjYW4gdXNlIHRyYWRpdGlvbmFsIG9wdGltaXN0aWMvcGVzc2ltaXN0aWMgdmFsdWUuIE9yIEphY29iaWFuJ3Ncbi8vIHVuY2VydGFpbnRseSBtdWx0aXBsaWVycyBbMS4xLCAxLjUsIDIsIDVdIGFuZCB0aGVpciBpbnZlcnNlcyB0byBnZW5lcmF0ZSBhblxuLy8gb3B0aW1pc3RpYyBwZXNzaW1pc3RpYy5cblxuLyoqIFRhc2sgaXMgYSBWZXJ0ZXggd2l0aCBkZXRhaWxzIGFib3V0IHRoZSBUYXNrIHRvIGNvbXBsZXRlLiAqL1xuZXhwb3J0IGNsYXNzIFRhc2sge1xuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcgPSBcIlwiKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZSB8fCBERUZBVUxUX1RBU0tfTkFNRTtcbiAgICB0aGlzLm1ldHJpY3MgPSB7fTtcbiAgICB0aGlzLnJlc291cmNlcyA9IHt9O1xuICB9XG5cbiAgLy8gUmVzb3VyY2Uga2V5cyBhbmQgdmFsdWVzLiBUaGUgcGFyZW50IHBsYW4gY29udGFpbnMgYWxsIHRoZSByZXNvdXJjZVxuICAvLyBkZWZpbml0aW9ucy5cblxuICByZXNvdXJjZXM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XG5cbiAgbWV0cmljczogTWV0cmljVmFsdWVzO1xuXG4gIG5hbWU6IHN0cmluZztcblxuICBzdGF0ZTogVGFza1N0YXRlID0gXCJ1bnN0YXJ0ZWRcIjtcblxuICB0b0pTT04oKTogVGFza1NlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICByZXNvdXJjZXM6IHRoaXMucmVzb3VyY2VzLFxuICAgICAgbWV0cmljczogdGhpcy5tZXRyaWNzLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgc3RhdGU6IHRoaXMuc3RhdGUsXG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgZHVyYXRpb24oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRNZXRyaWMoXCJEdXJhdGlvblwiKSE7XG4gIH1cblxuICBwdWJsaWMgc2V0IGR1cmF0aW9uKHZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLnNldE1ldHJpYyhcIkR1cmF0aW9uXCIsIHZhbHVlKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRNZXRyaWMoa2V5OiBzdHJpbmcpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLm1ldHJpY3Nba2V5XTtcbiAgfVxuXG4gIHB1YmxpYyBzZXRNZXRyaWMoa2V5OiBzdHJpbmcsIHZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLm1ldHJpY3Nba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGRlbGV0ZU1ldHJpYyhrZXk6IHN0cmluZykge1xuICAgIGRlbGV0ZSB0aGlzLm1ldHJpY3Nba2V5XTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRSZXNvdXJjZShrZXk6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMucmVzb3VyY2VzW2tleV07XG4gIH1cblxuICBwdWJsaWMgc2V0UmVzb3VyY2Uoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLnJlc291cmNlc1trZXldID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZGVsZXRlUmVzb3VyY2Uoa2V5OiBzdHJpbmcpIHtcbiAgICBkZWxldGUgdGhpcy5yZXNvdXJjZXNba2V5XTtcbiAgfVxuXG4gIHB1YmxpYyBkdXAoKTogVGFzayB7XG4gICAgY29uc3QgcmV0ID0gbmV3IFRhc2soKTtcbiAgICByZXQucmVzb3VyY2VzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5yZXNvdXJjZXMpO1xuICAgIHJldC5tZXRyaWNzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5tZXRyaWNzKTtcbiAgICByZXQubmFtZSA9IHRoaXMubmFtZTtcbiAgICByZXQuc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgIHJldHVybiByZXQ7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgVGFza3MgPSBUYXNrW107XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2hhcnRTZXJpYWxpemVkIHtcbiAgdmVydGljZXM6IFRhc2tTZXJpYWxpemVkW107XG4gIGVkZ2VzOiBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkW107XG59XG5cbi8qKiBBIENoYXJ0IGlzIGEgRGlyZWN0ZWRHcmFwaCwgYnV0IHdpdGggVGFza3MgZm9yIFZlcnRpY2VzLiAqL1xuZXhwb3J0IGNsYXNzIENoYXJ0IHtcbiAgVmVydGljZXM6IFRhc2tzO1xuICBFZGdlczogRWRnZXM7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgY29uc3Qgc3RhcnQgPSBuZXcgVGFzayhcIlN0YXJ0XCIpO1xuICAgIHN0YXJ0LnNldE1ldHJpYyhcIkR1cmF0aW9uXCIsIDApO1xuICAgIGNvbnN0IGZpbmlzaCA9IG5ldyBUYXNrKFwiRmluaXNoXCIpO1xuICAgIGZpbmlzaC5zZXRNZXRyaWMoXCJEdXJhdGlvblwiLCAwKTtcbiAgICB0aGlzLlZlcnRpY2VzID0gW3N0YXJ0LCBmaW5pc2hdO1xuICAgIHRoaXMuRWRnZXMgPSBbbmV3IERpcmVjdGVkRWRnZSgwLCAxKV07XG4gIH1cblxuICB0b0pTT04oKTogQ2hhcnRTZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmVydGljZXM6IHRoaXMuVmVydGljZXMubWFwKCh0OiBUYXNrKSA9PiB0LnRvSlNPTigpKSxcbiAgICAgIGVkZ2VzOiB0aGlzLkVkZ2VzLm1hcCgoZTogRGlyZWN0ZWRFZGdlKSA9PiBlLnRvSlNPTigpKSxcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFRvcG9sb2dpY2FsT3JkZXIgPSBWZXJ0ZXhJbmRpY2VzO1xuXG5leHBvcnQgdHlwZSBWYWxpZGF0ZVJlc3VsdCA9IFJlc3VsdDxUb3BvbG9naWNhbE9yZGVyPjtcblxuLyoqIFZhbGlkYXRlcyBhIERpcmVjdGVkR3JhcGggaXMgYSB2YWxpZCBDaGFydC4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUNoYXJ0KGc6IERpcmVjdGVkR3JhcGgpOiBWYWxpZGF0ZVJlc3VsdCB7XG4gIGlmIChnLlZlcnRpY2VzLmxlbmd0aCA8IDIpIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBcIkNoYXJ0IG11c3QgY29udGFpbiBhdCBsZWFzdCB0d28gbm9kZSwgdGhlIHN0YXJ0IGFuZCBmaW5pc2ggdGFza3MuXCJcbiAgICApO1xuICB9XG5cbiAgY29uc3QgZWRnZXNCeURzdCA9IGVkZ2VzQnlEc3RUb01hcChnLkVkZ2VzKTtcbiAgY29uc3QgZWRnZXNCeVNyYyA9IGVkZ2VzQnlTcmNUb01hcChnLkVkZ2VzKTtcblxuICAvLyBUaGUgZmlyc3QgVmVydGV4LCBUXzAgYWthIHRoZSBTdGFydCBNaWxlc3RvbmUsIG11c3QgaGF2ZSAwIGluY29taW5nIGVkZ2VzLlxuICBpZiAoZWRnZXNCeURzdC5nZXQoMCkgIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBlcnJvcihcIlRoZSBzdGFydCBub2RlICgwKSBoYXMgYW4gaW5jb21pbmcgZWRnZS5cIik7XG4gIH1cblxuICAvLyBBbmQgb25seSBUXzAgc2hvdWxkIGhhdmUgMCBpbmNvbWluZyBlZGdlcy5cbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBnLlZlcnRpY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGVkZ2VzQnlEc3QuZ2V0KGkpID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYEZvdW5kIG5vZGUgdGhhdCBpc24ndCAoMCkgdGhhdCBoYXMgbm8gaW5jb21pbmcgZWRnZXM6ICR7aX1gXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRoZSBsYXN0IFZlcnRleCwgVF9maW5pc2gsIHRoZSBGaW5pc2ggTWlsZXN0b25lLCBtdXN0IGhhdmUgMCBvdXRnb2luZyBlZGdlcy5cbiAgaWYgKGVkZ2VzQnlTcmMuZ2V0KGcuVmVydGljZXMubGVuZ3RoIC0gMSkgIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIFwiVGhlIGxhc3Qgbm9kZSwgd2hpY2ggc2hvdWxkIGJlIHRoZSBGaW5pc2ggTWlsZXN0b25lLCBoYXMgYW4gb3V0Z29pbmcgZWRnZS5cIlxuICAgICk7XG4gIH1cblxuICAvLyBBbmQgb25seSBUX2ZpbmlzaCBzaG91bGQgaGF2ZSAwIG91dGdvaW5nIGVkZ2VzLlxuICBmb3IgKGxldCBpID0gMDsgaSA8IGcuVmVydGljZXMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgaWYgKGVkZ2VzQnlTcmMuZ2V0KGkpID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYEZvdW5kIG5vZGUgdGhhdCBpc24ndCBUX2ZpbmlzaCB0aGF0IGhhcyBubyBvdXRnb2luZyBlZGdlczogJHtpfWBcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgbnVtVmVydGljZXMgPSBnLlZlcnRpY2VzLmxlbmd0aDtcbiAgLy8gQW5kIGFsbCBlZGdlcyBtYWtlIHNlbnNlLCBpLmUuIHRoZXkgYWxsIHBvaW50IHRvIHZlcnRleGVzIHRoYXQgZXhpc3QuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZy5FZGdlcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBnLkVkZ2VzW2ldO1xuICAgIGlmIChcbiAgICAgIGVsZW1lbnQuaSA8IDAgfHxcbiAgICAgIGVsZW1lbnQuaSA+PSBudW1WZXJ0aWNlcyB8fFxuICAgICAgZWxlbWVudC5qIDwgMCB8fFxuICAgICAgZWxlbWVudC5qID49IG51bVZlcnRpY2VzXG4gICAgKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYEVkZ2UgJHtlbGVtZW50fSBwb2ludHMgdG8gYSBub24tZXhpc3RlbnQgVmVydGV4LmApO1xuICAgIH1cbiAgfVxuXG4gIC8vIE5vdyB3ZSBjb25maXJtIHRoYXQgd2UgaGF2ZSBhIERpcmVjdGVkIEFjeWNsaWMgR3JhcGgsIGkuZS4gdGhlIGdyYXBoIGhhcyBub1xuICAvLyBjeWNsZXMgYnkgY3JlYXRpbmcgYSB0b3BvbG9naWNhbCBzb3J0IHN0YXJ0aW5nIGF0IFRfMFxuICAvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Ub3BvbG9naWNhbF9zb3J0aW5nI0RlcHRoLWZpcnN0X3NlYXJjaFxuICBjb25zdCB0c1JldCA9IHRvcG9sb2dpY2FsU29ydChnKTtcbiAgaWYgKHRzUmV0Lmhhc0N5Y2xlcykge1xuICAgIHJldHVybiBlcnJvcihgQ2hhcnQgaGFzIGN5Y2xlOiAke1suLi50c1JldC5jeWNsZV0uam9pbihcIiwgXCIpfWApO1xuICB9XG5cbiAgcmV0dXJuIG9rKHRzUmV0Lm9yZGVyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENoYXJ0VmFsaWRhdGUoYzogQ2hhcnQpOiBWYWxpZGF0ZVJlc3VsdCB7XG4gIGNvbnN0IHJldCA9IHZhbGlkYXRlQ2hhcnQoYyk7XG4gIGlmICghcmV0Lm9rKSB7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuICBpZiAoYy5WZXJ0aWNlc1swXS5kdXJhdGlvbiAhPT0gMCkge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIGBTdGFydCBNaWxlc3RvbmUgbXVzdCBoYXZlIGR1cmF0aW9uIG9mIDAsIGluc3RlYWQgZ290ICR7Yy5WZXJ0aWNlc1swXS5kdXJhdGlvbn1gXG4gICAgKTtcbiAgfVxuICBpZiAoYy5WZXJ0aWNlc1tjLlZlcnRpY2VzLmxlbmd0aCAtIDFdLmR1cmF0aW9uICE9PSAwKSB7XG4gICAgcmV0dXJuIGVycm9yKFxuICAgICAgYEZpbmlzaCBNaWxlc3RvbmUgbXVzdCBoYXZlIGR1cmF0aW9uIG9mIDAsIGluc3RlYWQgZ290ICR7XG4gICAgICAgIGMuVmVydGljZXNbYy5WZXJ0aWNlcy5sZW5ndGggLSAxXS5kdXJhdGlvblxuICAgICAgfWBcbiAgICApO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG4iLCAiLy8gVXRpbGl0aWVzIGZvciBkZWFsaW5nIHdpdGggYSByYW5nZSBvZiBudW1iZXJzLlxuXG5leHBvcnQgY29uc3QgY2xhbXAgPSAoeDogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIpOiBudW1iZXIgPT4ge1xuICBpZiAoeCA+IG1heCkge1xuICAgIHJldHVybiBtYXg7XG4gIH1cbiAgaWYgKHggPCBtaW4pIHtcbiAgICByZXR1cm4gbWluO1xuICB9XG4gIHJldHVybiB4O1xufTtcblxuLy8gUmFuZ2UgZGVmaW5lcyBhIHJhbmdlIG9mIG51bWJlcnMsIGZyb20gW21pbiwgbWF4XSBpbmNsdXNpdmUuXG5leHBvcnQgY2xhc3MgTWV0cmljUmFuZ2Uge1xuICBwcml2YXRlIF9taW46IG51bWJlciA9IC1OdW1iZXIuTUFYX1ZBTFVFO1xuICBwcml2YXRlIF9tYXg6IG51bWJlciA9IE51bWJlci5NQVhfVkFMVUU7XG5cbiAgY29uc3RydWN0b3IobWluOiBudW1iZXIgPSAtTnVtYmVyLk1BWF9WQUxVRSwgbWF4OiBudW1iZXIgPSBOdW1iZXIuTUFYX1ZBTFVFKSB7XG4gICAgaWYgKG1heCA8IG1pbikge1xuICAgICAgW21pbiwgbWF4XSA9IFttYXgsIG1pbl07XG4gICAgfVxuICAgIHRoaXMuX21pbiA9IG1pbjtcbiAgICB0aGlzLl9tYXggPSBtYXg7XG4gIH1cblxuICBjbGFtcCh2YWx1ZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gY2xhbXAodmFsdWUsIHRoaXMuX21pbiwgdGhpcy5fbWF4KTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWluKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX21pbjtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWF4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX21heDtcbiAgfVxufVxuIiwgIi8vIE1ldHJpY3MgZGVmaW5lIGZsb2F0aW5nIHBvaW50IHZhbHVlcyB0aGF0IGFyZSB0cmFja2VkIHBlciBUYXNrLlxuXG5pbXBvcnQgeyBjbGFtcCwgTWV0cmljUmFuZ2UgfSBmcm9tIFwiLi9yYW5nZS50c1wiO1xuXG5leHBvcnQgY2xhc3MgTWV0cmljRGVmaW5pdGlvbiB7XG4gIHJhbmdlOiBNZXRyaWNSYW5nZTtcbiAgZGVmYXVsdDogbnVtYmVyO1xuICBpc1N0YXRpYzogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBkZWZhdWx0VmFsdWU6IG51bWJlcixcbiAgICByYW5nZTogTWV0cmljUmFuZ2UgPSBuZXcgTWV0cmljUmFuZ2UoKSxcbiAgICBpc1N0YXRpYzogYm9vbGVhbiA9IGZhbHNlXG4gICkge1xuICAgIHRoaXMucmFuZ2UgPSByYW5nZTtcbiAgICB0aGlzLmRlZmF1bHQgPSBjbGFtcChkZWZhdWx0VmFsdWUsIHJhbmdlLm1pbiwgcmFuZ2UubWF4KTtcbiAgICB0aGlzLmlzU3RhdGljID0gaXNTdGF0aWM7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgTWV0cmljRGVmaW5pdGlvbnMgPSB7IFtrZXk6IHN0cmluZ106IE1ldHJpY0RlZmluaXRpb24gfTtcblxuZXhwb3J0IHR5cGUgTWV0cmljVmFsdWVzID0geyBba2V5OiBzdHJpbmddOiBudW1iZXIgfTtcbiIsICIvKipcbiAqIFRyaWFuZ3VsYXIgaXMgdGhlIGludmVyc2UgQ3VtdWxhdGl2ZSBEZW5zaXR5IEZ1bmN0aW9uIChDREYpIGZvciB0aGVcbiAqIHRyaWFuZ3VsYXIgZGlzdHJpYnV0aW9uLlxuICpcbiAqIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1RyaWFuZ3VsYXJfZGlzdHJpYnV0aW9uI0dlbmVyYXRpbmdfcmFuZG9tX3ZhcmlhdGVzXG4gKlxuICogVGhlIGludmVyc2Ugb2YgdGhlIENERiBpcyB1c2VmdWwgZm9yIGdlbmVyYXRpbmcgc2FtcGxlcyBmcm9tIHRoZVxuICogZGlzdHJpYnV0aW9uLCBpLmUuIHBhc3NpbmcgaW4gdmFsdWVzIGZyb20gdGhlIHVuaWZvcm0gZGlzdHJpYnV0aW9uIFswLCAxXVxuICogd2lsbCBwcm9kdWNlIHNhbXBsZSB0aGF0IGxvb2sgbGlrZSB0aGV5IGNvbWUgZnJvbSB0aGUgdHJpYW5ndWxhclxuICogZGlzdHJpYnV0aW9uLlxuICpcbiAqXG4gKi9cblxuZXhwb3J0IGNsYXNzIFRyaWFuZ3VsYXIge1xuICBwcml2YXRlIGE6IG51bWJlcjtcbiAgcHJpdmF0ZSBiOiBudW1iZXI7XG4gIHByaXZhdGUgYzogbnVtYmVyO1xuICBwcml2YXRlIEZfYzogbnVtYmVyO1xuXG4gIC8qKiAgVGhlIHRyaWFuZ3VsYXIgZGlzdHJpYnV0aW9uIGlzIGEgY29udGludW91cyBwcm9iYWJpbGl0eSBkaXN0cmlidXRpb24gd2l0aFxuICBsb3dlciBsaW1pdCBgYWAsIHVwcGVyIGxpbWl0IGBiYCwgYW5kIG1vZGUgYGNgLCB3aGVyZSBhIDwgYiBhbmQgYSBcdTIyNjQgYyBcdTIyNjQgYi4gKi9cbiAgY29uc3RydWN0b3IoYTogbnVtYmVyLCBiOiBudW1iZXIsIGM6IG51bWJlcikge1xuICAgIHRoaXMuYSA9IGE7XG4gICAgdGhpcy5iID0gYjtcbiAgICB0aGlzLmMgPSBjO1xuXG4gICAgLy8gRl9jIGlzIHRoZSBjdXRvZmYgaW4gdGhlIGRvbWFpbiB3aGVyZSB3ZSBzd2l0Y2ggYmV0d2VlbiB0aGUgdHdvIGhhbHZlcyBvZlxuICAgIC8vIHRoZSB0cmlhbmdsZS5cbiAgICB0aGlzLkZfYyA9IChjIC0gYSkgLyAoYiAtIGEpO1xuICB9XG5cbiAgLyoqICBQcm9kdWNlIGEgc2FtcGxlIGZyb20gdGhlIHRyaWFuZ3VsYXIgZGlzdHJpYnV0aW9uLiBUaGUgdmFsdWUgb2YgJ3AnXG4gICBzaG91bGQgYmUgaW4gWzAsIDEuMF0uICovXG4gIHNhbXBsZShwOiBudW1iZXIpOiBudW1iZXIge1xuICAgIGlmIChwIDwgMCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfSBlbHNlIGlmIChwID4gMS4wKSB7XG4gICAgICByZXR1cm4gMS4wO1xuICAgIH0gZWxzZSBpZiAocCA8IHRoaXMuRl9jKSB7XG4gICAgICByZXR1cm4gdGhpcy5hICsgTWF0aC5zcXJ0KHAgKiAodGhpcy5iIC0gdGhpcy5hKSAqICh0aGlzLmMgLSB0aGlzLmEpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgdGhpcy5iIC0gTWF0aC5zcXJ0KCgxIC0gcCkgKiAodGhpcy5iIC0gdGhpcy5hKSAqICh0aGlzLmIgLSB0aGlzLmMpKVxuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBUcmlhbmd1bGFyIH0gZnJvbSBcIi4vdHJpYW5ndWxhci50c1wiO1xuXG5leHBvcnQgdHlwZSBVbmNlcnRhaW50eSA9IFwibG93XCIgfCBcIm1vZGVyYXRlXCIgfCBcImhpZ2hcIiB8IFwiZXh0cmVtZVwiO1xuXG5leHBvcnQgY29uc3QgVW5jZXJ0YWludHlUb051bTogUmVjb3JkPFVuY2VydGFpbnR5LCBudW1iZXI+ID0ge1xuICBsb3c6IDEuMSxcbiAgbW9kZXJhdGU6IDEuNSxcbiAgaGlnaDogMixcbiAgZXh0cmVtZTogNSxcbn07XG5cbmV4cG9ydCBjbGFzcyBKYWNvYmlhbiB7XG4gIHByaXZhdGUgdHJpYW5ndWxhcjogVHJpYW5ndWxhcjtcbiAgY29uc3RydWN0b3IoZXhwZWN0ZWQ6IG51bWJlciwgdW5jZXJ0YWludHk6IFVuY2VydGFpbnR5KSB7XG4gICAgY29uc3QgbXVsID0gVW5jZXJ0YWludHlUb051bVt1bmNlcnRhaW50eV07XG4gICAgdGhpcy50cmlhbmd1bGFyID0gbmV3IFRyaWFuZ3VsYXIoZXhwZWN0ZWQgLyBtdWwsIGV4cGVjdGVkICogbXVsLCBleHBlY3RlZCk7XG4gIH1cblxuICBzYW1wbGUocDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy50cmlhbmd1bGFyLnNhbXBsZShwKTtcbiAgfVxufVxuIiwgImltcG9ydCB7XG4gIENoYXJ0LFxuICBDaGFydFNlcmlhbGl6ZWQsXG4gIFRhc2ssXG4gIFRhc2tTZXJpYWxpemVkLFxuICB2YWxpZGF0ZUNoYXJ0LFxufSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IERpcmVjdGVkRWRnZSwgRGlyZWN0ZWRFZGdlU2VyaWFsaXplZCB9IGZyb20gXCIuLi9kYWcvZGFnLnRzXCI7XG5pbXBvcnQgeyBNZXRyaWNEZWZpbml0aW9uLCBNZXRyaWNEZWZpbml0aW9ucyB9IGZyb20gXCIuLi9tZXRyaWNzL21ldHJpY3MudHNcIjtcbmltcG9ydCB7IE1ldHJpY1JhbmdlIH0gZnJvbSBcIi4uL21ldHJpY3MvcmFuZ2UudHNcIjtcbmltcG9ydCB7XG4gIEFkZEVkZ2VPcCxcbiAgSW5zZXJ0TmV3RW1wdHlUYXNrQWZ0ZXJPcCxcbiAgUmF0aW9uYWxpemVFZGdlc09wLFxuICBTZXRUYXNrTmFtZU9wLFxuICBTZXRUYXNrU3RhdGVPcCxcbn0gZnJvbSBcIi4uL29wcy9jaGFydC50c1wiO1xuaW1wb3J0IHsgQWRkTWV0cmljT3AsIFNldE1ldHJpY1ZhbHVlT3AgfSBmcm9tIFwiLi4vb3BzL21ldHJpY3MudHNcIjtcbmltcG9ydCB7IE9wLCBhcHBseUFsbE9wc1RvUGxhbiB9IGZyb20gXCIuLi9vcHMvb3BzLnRzXCI7XG5pbXBvcnQge1xuICBBZGRSZXNvdXJjZU9wLFxuICBBZGRSZXNvdXJjZU9wdGlvbk9wLFxuICBTZXRSZXNvdXJjZVZhbHVlT3AsXG59IGZyb20gXCIuLi9vcHMvcmVzb3VyY2VzLnRzXCI7XG5pbXBvcnQge1xuICBSZXNvdXJjZURlZmluaXRpb24sXG4gIFJlc291cmNlRGVmaW5pdGlvbnMsXG59IGZyb20gXCIuLi9yZXNvdXJjZXMvcmVzb3VyY2VzLnRzXCI7XG5pbXBvcnQgeyBSZXN1bHQsIG9rIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgVW5jZXJ0YWludHlUb051bSB9IGZyb20gXCIuLi9zdGF0cy9jZGYvdHJpYW5ndWxhci9qYWNvYmlhbi50c1wiO1xuXG5leHBvcnQgdHlwZSBTdGF0aWNNZXRyaWNLZXlzID0gXCJEdXJhdGlvblwiIHwgXCJQZXJjZW50IENvbXBsZXRlXCI7XG5cbmV4cG9ydCBjb25zdCBTdGF0aWNNZXRyaWNEZWZpbml0aW9uczogTWV0cmljRGVmaW5pdGlvbnMgPSB7XG4gIC8vIEhvdyBsb25nIGEgdGFzayB3aWxsIHRha2UsIGluIGRheXMuXG4gIER1cmF0aW9uOiBuZXcgTWV0cmljRGVmaW5pdGlvbigwLCBuZXcgTWV0cmljUmFuZ2UoKSwgdHJ1ZSksXG4gIC8vIFRoZSBwZXJjZW50IGNvbXBsZXRlIGZvciBhIHRhc2suXG4gIFBlcmNlbnQ6IG5ldyBNZXRyaWNEZWZpbml0aW9uKDAsIG5ldyBNZXRyaWNSYW5nZSgwLCAxMDApLCB0cnVlKSxcbn07XG5cbmV4cG9ydCBjb25zdCBTdGF0aWNSZXNvdXJjZURlZmluaXRpb25zOiBSZXNvdXJjZURlZmluaXRpb25zID0ge1xuICBVbmNlcnRhaW50eToge1xuICAgIHZhbHVlczogT2JqZWN0LmtleXMoVW5jZXJ0YWludHlUb051bSksXG4gICAgaXNTdGF0aWM6IHRydWUsXG4gIH0sXG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIFBsYW5TZXJpYWxpemVkIHtcbiAgY2hhcnQ6IENoYXJ0U2VyaWFsaXplZDtcbiAgcmVzb3VyY2VEZWZpbml0aW9uczogUmVzb3VyY2VEZWZpbml0aW9ucztcbiAgbWV0cmljRGVmaW5pdGlvbnM6IE1ldHJpY0RlZmluaXRpb25zO1xufVxuXG5leHBvcnQgY2xhc3MgUGxhbiB7XG4gIGNoYXJ0OiBDaGFydDtcblxuICByZXNvdXJjZURlZmluaXRpb25zOiBSZXNvdXJjZURlZmluaXRpb25zO1xuXG4gIG1ldHJpY0RlZmluaXRpb25zOiBNZXRyaWNEZWZpbml0aW9ucztcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNoYXJ0ID0gbmV3IENoYXJ0KCk7XG5cbiAgICB0aGlzLnJlc291cmNlRGVmaW5pdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBTdGF0aWNSZXNvdXJjZURlZmluaXRpb25zKTtcbiAgICB0aGlzLm1ldHJpY0RlZmluaXRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgU3RhdGljTWV0cmljRGVmaW5pdGlvbnMpO1xuICAgIHRoaXMuYXBwbHlNZXRyaWNzQW5kUmVzb3VyY2VzVG9WZXJ0aWNlcygpO1xuICB9XG5cbiAgYXBwbHlNZXRyaWNzQW5kUmVzb3VyY2VzVG9WZXJ0aWNlcygpIHtcbiAgICBPYmplY3Qua2V5cyh0aGlzLm1ldHJpY0RlZmluaXRpb25zKS5mb3JFYWNoKChtZXRyaWNOYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnN0IG1kID0gdGhpcy5tZXRyaWNEZWZpbml0aW9uc1ttZXRyaWNOYW1lXSE7XG4gICAgICB0aGlzLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2spID0+IHtcbiAgICAgICAgdGFzay5zZXRNZXRyaWMobWV0cmljTmFtZSwgbWQuZGVmYXVsdCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBPYmplY3QuZW50cmllcyh0aGlzLnJlc291cmNlRGVmaW5pdGlvbnMpLmZvckVhY2goXG4gICAgICAoW2tleSwgcmVzb3VyY2VEZWZpbml0aW9uXSkgPT4ge1xuICAgICAgICB0aGlzLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2spID0+IHtcbiAgICAgICAgICB0YXNrLnNldFJlc291cmNlKGtleSwgcmVzb3VyY2VEZWZpbml0aW9uLnZhbHVlc1swXSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICB0b0pTT04oKTogUGxhblNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICBjaGFydDogdGhpcy5jaGFydC50b0pTT04oKSxcbiAgICAgIHJlc291cmNlRGVmaW5pdGlvbnM6IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgT2JqZWN0LmVudHJpZXModGhpcy5yZXNvdXJjZURlZmluaXRpb25zKS5maWx0ZXIoXG4gICAgICAgICAgKFtrZXksIHJlc291cmNlRGVmaW5pdGlvbl0pID0+ICFyZXNvdXJjZURlZmluaXRpb24uaXNTdGF0aWNcbiAgICAgICAgKVxuICAgICAgKSxcbiAgICAgIG1ldHJpY0RlZmluaXRpb25zOiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHRoaXMubWV0cmljRGVmaW5pdGlvbnMpLmZpbHRlcihcbiAgICAgICAgICAoW2tleSwgbWV0cmljRGVmaW5pdGlvbl0pID0+ICFtZXRyaWNEZWZpbml0aW9uLmlzU3RhdGljXG4gICAgICAgIClcbiAgICAgICksXG4gICAgfTtcbiAgfVxuXG4gIGdldE1ldHJpY0RlZmluaXRpb24oa2V5OiBzdHJpbmcpOiBNZXRyaWNEZWZpbml0aW9uIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5tZXRyaWNEZWZpbml0aW9uc1trZXldO1xuICB9XG5cbiAgc2V0TWV0cmljRGVmaW5pdGlvbihrZXk6IHN0cmluZywgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbikge1xuICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbnNba2V5XSA9IG1ldHJpY0RlZmluaXRpb247XG4gIH1cblxuICBkZWxldGVNZXRyaWNEZWZpbml0aW9uKGtleTogc3RyaW5nKSB7XG4gICAgZGVsZXRlIHRoaXMubWV0cmljRGVmaW5pdGlvbnNba2V5XTtcbiAgfVxuXG4gIGdldFJlc291cmNlRGVmaW5pdGlvbihrZXk6IHN0cmluZyk6IFJlc291cmNlRGVmaW5pdGlvbiB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMucmVzb3VyY2VEZWZpbml0aW9uc1trZXldO1xuICB9XG5cbiAgc2V0UmVzb3VyY2VEZWZpbml0aW9uKGtleTogc3RyaW5nLCB2YWx1ZTogUmVzb3VyY2VEZWZpbml0aW9uKSB7XG4gICAgdGhpcy5yZXNvdXJjZURlZmluaXRpb25zW2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIGRlbGV0ZVJlc291cmNlRGVmaW5pdGlvbihrZXk6IHN0cmluZykge1xuICAgIGRlbGV0ZSB0aGlzLnJlc291cmNlRGVmaW5pdGlvbnNba2V5XTtcbiAgfVxuXG4gIC8vIFJldHVybnMgYSBuZXcgVGFzayB3aXRoIGRlZmF1bHRzIGZvciBhbGwgbWV0cmljcyBhbmQgcmVzb3VyY2VzLlxuICBuZXdUYXNrKCk6IFRhc2sge1xuICAgIGNvbnN0IHJldCA9IG5ldyBUYXNrKCk7XG4gICAgT2JqZWN0LmtleXModGhpcy5tZXRyaWNEZWZpbml0aW9ucykuZm9yRWFjaCgobWV0cmljTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBtZCA9IHRoaXMuZ2V0TWV0cmljRGVmaW5pdGlvbihtZXRyaWNOYW1lKSE7XG5cbiAgICAgIHJldC5zZXRNZXRyaWMobWV0cmljTmFtZSwgbWQuZGVmYXVsdCk7XG4gICAgfSk7XG4gICAgT2JqZWN0LmVudHJpZXModGhpcy5yZXNvdXJjZURlZmluaXRpb25zKS5mb3JFYWNoKFxuICAgICAgKFtrZXksIHJlc291cmNlRGVmaW5pdGlvbl0pID0+IHtcbiAgICAgICAgcmV0LnNldFJlc291cmNlKGtleSwgcmVzb3VyY2VEZWZpbml0aW9uLnZhbHVlc1swXSk7XG4gICAgICB9XG4gICAgKTtcbiAgICByZXR1cm4gcmV0O1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBGcm9tSlNPTiA9ICh0ZXh0OiBzdHJpbmcpOiBSZXN1bHQ8UGxhbj4gPT4ge1xuICBjb25zdCBwbGFuU2VyaWFsaXplZDogUGxhblNlcmlhbGl6ZWQgPSBKU09OLnBhcnNlKHRleHQpO1xuICBjb25zdCBwbGFuID0gbmV3IFBsYW4oKTtcblxuICBwbGFuLmNoYXJ0LlZlcnRpY2VzID0gcGxhblNlcmlhbGl6ZWQuY2hhcnQudmVydGljZXMubWFwKFxuICAgICh0YXNrU2VyaWFsaXplZDogVGFza1NlcmlhbGl6ZWQsIGluZGV4OiBudW1iZXIpOiBUYXNrID0+IHtcbiAgICAgIGNvbnN0IHRhc2sgPSBuZXcgVGFzayh0YXNrU2VyaWFsaXplZC5uYW1lKTtcbiAgICAgIHRhc2suc3RhdGUgPSB0YXNrU2VyaWFsaXplZC5zdGF0ZTtcbiAgICAgIHRhc2subWV0cmljcyA9IHRhc2tTZXJpYWxpemVkLm1ldHJpY3M7XG4gICAgICB0YXNrLnJlc291cmNlcyA9IHRhc2tTZXJpYWxpemVkLnJlc291cmNlcztcblxuICAgICAgcmV0dXJuIHRhc2s7XG4gICAgfVxuICApO1xuICBwbGFuLmNoYXJ0LkVkZ2VzID0gcGxhblNlcmlhbGl6ZWQuY2hhcnQuZWRnZXMubWFwKFxuICAgIChkaXJlY3RlZEVkZ2VTZXJpYWxpemVkOiBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkKTogRGlyZWN0ZWRFZGdlID0+XG4gICAgICBuZXcgRGlyZWN0ZWRFZGdlKGRpcmVjdGVkRWRnZVNlcmlhbGl6ZWQuaSwgZGlyZWN0ZWRFZGdlU2VyaWFsaXplZC5qKVxuICApO1xuICBwbGFuLm1ldHJpY0RlZmluaXRpb25zID0gT2JqZWN0LmFzc2lnbihcbiAgICBwbGFuLm1ldHJpY0RlZmluaXRpb25zLFxuICAgIHBsYW5TZXJpYWxpemVkLm1ldHJpY0RlZmluaXRpb25zXG4gICk7XG4gIHBsYW4ucmVzb3VyY2VEZWZpbml0aW9ucyA9IE9iamVjdC5hc3NpZ24oXG4gICAgcGxhbi5yZXNvdXJjZURlZmluaXRpb25zLFxuICAgIHBsYW5TZXJpYWxpemVkLnJlc291cmNlRGVmaW5pdGlvbnNcbiAgKTtcblxuICBjb25zdCByZXQgPSBSYXRpb25hbGl6ZUVkZ2VzT3AoKS5hcHBseShwbGFuKTtcbiAgaWYgKCFyZXQub2spIHtcbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgY29uc3QgcmV0VmFsID0gdmFsaWRhdGVDaGFydChwbGFuLmNoYXJ0KTtcbiAgaWYgKCFyZXRWYWwub2spIHtcbiAgICByZXR1cm4gcmV0VmFsO1xuICB9XG4gIHJldHVybiBvayhwbGFuKTtcbn07XG4iLCAiaW1wb3J0IHsgUm91bmRlciB9IGZyb20gXCIuLi90eXBlcy90eXBlc1wiO1xuXG5leHBvcnQgY2xhc3MgUHJlY2lzaW9uIHtcbiAgcHJpdmF0ZSBtdWx0aXBsaWVyOiBudW1iZXI7XG4gIHByaXZhdGUgX3ByZWNpc2lvbjogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHByZWNpc2lvbjogbnVtYmVyKSB7XG4gICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUocHJlY2lzaW9uKSkge1xuICAgICAgcHJlY2lzaW9uID0gMDtcbiAgICB9XG4gICAgdGhpcy5fcHJlY2lzaW9uID0gTWF0aC5hYnMoTWF0aC50cnVuYyhwcmVjaXNpb24pKTtcbiAgICB0aGlzLm11bHRpcGxpZXIgPSAxMCAqKiB0aGlzLl9wcmVjaXNpb247XG4gIH1cblxuICByb3VuZCh4OiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiBNYXRoLnRydW5jKHggKiB0aGlzLm11bHRpcGxpZXIpIC8gdGhpcy5tdWx0aXBsaWVyO1xuICB9XG5cbiAgcm91bmRlcigpOiBSb3VuZGVyIHtcbiAgICByZXR1cm4gKHg6IG51bWJlcik6IG51bWJlciA9PiB0aGlzLnJvdW5kKHgpO1xuICB9XG5cbiAgcHVibGljIGdldCBwcmVjaXNpb24oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fcHJlY2lzaW9uO1xuICB9XG59XG4iLCAiLyoqIEEgY29vcmRpbmF0ZSBwb2ludCBvbiB0aGUgcmVuZGVyaW5nIHN1cmZhY2UuICovXG5leHBvcnQgY2xhc3MgUG9pbnQge1xuICB4OiBudW1iZXI7XG4gIHk6IG51bWJlcjtcblxuICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgfVxuXG4gIGFkZCh4OiBudW1iZXIsIHk6IG51bWJlcik6IFBvaW50IHtcbiAgICB0aGlzLnggKz0geDtcbiAgICB0aGlzLnkgKz0geTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHN1bShyaHM6IFBvaW50KTogUG9pbnQge1xuICAgIHJldHVybiBuZXcgUG9pbnQodGhpcy54ICsgcmhzLngsIHRoaXMueSArIHJocy55KTtcbiAgfVxuXG4gIGVxdWFsKHJoczogUG9pbnQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy54ID09PSByaHMueCAmJiB0aGlzLnkgPT09IHJocy55O1xuICB9XG5cbiAgc2V0KHJoczogUG9pbnQpOiBQb2ludCB7XG4gICAgdGhpcy54ID0gcmhzLng7XG4gICAgdGhpcy55ID0gcmhzLnk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBkdXAoKTogUG9pbnQge1xuICAgIHJldHVybiBuZXcgUG9pbnQodGhpcy54LCB0aGlzLnkpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgUG9pbnQgfSBmcm9tIFwiLi4vc2NhbGUvcG9pbnQudHNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBEcmFnUmFuZ2Uge1xuICBiZWdpbjogUG9pbnQ7XG4gIGVuZDogUG9pbnQ7XG59XG5cbmV4cG9ydCBjb25zdCBEUkFHX1JBTkdFX0VWRU5UID0gXCJkcmFncmFuZ2VcIjtcblxuLyoqIE1vdXNlTW92ZSB3YXRjaGVzIG1vdXNlIGV2ZW50cyBmb3IgYSBnaXZlbiBIVE1MRWxlbWVudCBhbmQgZW1pdHNcbiAqIGV2ZW50cyBhcm91bmQgZHJhZ2dpbmcuXG4gKlxuICogVGhlIGVtaXR0ZWQgZXZlbnQgaXMgXCJkcmFncmFuZ2VcIiBhbmQgaXMgYSBDdXN0b21FdmVudDxEcmFnUmFuZ2U+LlxuICpcbiAqIE9uY2UgdGhlIG1vdXNlIGlzIHByZXNzZWQgZG93biBpbiB0aGUgSFRNTEVsZW1lbnQgYW4gZXZlbnQgd2lsbCBiZVxuICogZW1pdHRlZCBwZXJpb2RpY2FsbHkgYXMgdGhlIG1vdXNlIG1vdmVzLlxuICpcbiAqIE9uY2UgdGhlIG1vdXNlIGlzIHJlbGVhc2VkLCBvciBleGl0cyB0aGUgSFRNTEVsZW1lbnQgb25lIGxhc3QgZXZlbnRcbiAqIGlzIGVtaXR0ZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBNb3VzZU1vdmUge1xuICBiZWdpbjogUG9pbnQgfCBudWxsID0gbnVsbDtcbiAgY3VycmVudE1vdmVMb2NhdGlvbjogUG9pbnQgPSBuZXcgUG9pbnQoMCwgMCk7XG4gIGxhc3RNb3ZlU2VudDogUG9pbnQgPSBuZXcgUG9pbnQoMCwgMCk7XG4gIGVsZTogSFRNTEVsZW1lbnQ7XG4gIGludGVybnZhbEhhbmRsZTogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihlbGU6IEhUTUxFbGVtZW50KSB7XG4gICAgdGhpcy5lbGUgPSBlbGU7XG4gICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZWRvd24uYmluZCh0aGlzKSk7XG4gICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZWxlYXZlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgZGV0YWNoKCkge1xuICAgIHRoaXMuZWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5lbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlZG93bi5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmVsZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNldXAuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5lbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZWxlYXZlLmJpbmQodGhpcykpO1xuICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuaW50ZXJudmFsSGFuZGxlKTtcbiAgfVxuXG4gIG9uVGltZW91dCgpIHtcbiAgICBpZiAoIXRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi5lcXVhbCh0aGlzLmxhc3RNb3ZlU2VudCkpIHtcbiAgICAgIHRoaXMuZWxlLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudDxEcmFnUmFuZ2U+KERSQUdfUkFOR0VfRVZFTlQsIHtcbiAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgIGJlZ2luOiB0aGlzLmJlZ2luIS5kdXAoKSxcbiAgICAgICAgICAgIGVuZDogdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLmR1cCgpLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgICAgdGhpcy5sYXN0TW92ZVNlbnQuc2V0KHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbik7XG4gICAgfVxuICB9XG5cbiAgbW91c2Vtb3ZlKGU6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAodGhpcy5iZWdpbiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueCA9IGUub2Zmc2V0WDtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueSA9IGUub2Zmc2V0WTtcbiAgfVxuXG4gIG1vdXNlZG93bihlOiBNb3VzZUV2ZW50KSB7XG4gICAgdGhpcy5pbnRlcm52YWxIYW5kbGUgPSB3aW5kb3cuc2V0SW50ZXJ2YWwodGhpcy5vblRpbWVvdXQuYmluZCh0aGlzKSwgMTYpO1xuICAgIHRoaXMuYmVnaW4gPSBuZXcgUG9pbnQoZS5vZmZzZXRYLCBlLm9mZnNldFkpO1xuICB9XG5cbiAgbW91c2V1cChlOiBNb3VzZUV2ZW50KSB7XG4gICAgdGhpcy5maW5pc2hlZChuZXcgUG9pbnQoZS5vZmZzZXRYLCBlLm9mZnNldFkpKTtcbiAgfVxuXG4gIG1vdXNlbGVhdmUoZTogTW91c2VFdmVudCkge1xuICAgIGlmICh0aGlzLmJlZ2luID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZmluaXNoZWQobmV3IFBvaW50KGUub2Zmc2V0WCwgZS5vZmZzZXRZKSk7XG4gIH1cblxuICBmaW5pc2hlZChlbmQ6IFBvaW50KSB7XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcm52YWxIYW5kbGUpO1xuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbiA9IGVuZDtcbiAgICB0aGlzLm9uVGltZW91dCgpO1xuICAgIHRoaXMuYmVnaW4gPSBudWxsO1xuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbiA9IG5ldyBQb2ludCgwLCAwKTtcbiAgICB0aGlzLmxhc3RNb3ZlU2VudCA9IG5ldyBQb2ludCgwLCAwKTtcbiAgfVxufVxuIiwgImV4cG9ydCBjb25zdCBNSU5fRElTUExBWV9SQU5HRSA9IDc7XG5cbi8qKiBSZXByZXNlbnRzIGEgcmFuZ2Ugb2YgZGF5cyBvdmVyIHdoaWNoIHRvIGRpc3BsYXkgYSB6b29tZWQgaW4gdmlldywgdXNpbmdcbiAqIHRoZSBoYWxmLW9wZW4gaW50ZXJ2YWwgW2JlZ2luLCBlbmQpLlxuICovXG5leHBvcnQgY2xhc3MgRGlzcGxheVJhbmdlIHtcbiAgcHJpdmF0ZSBfYmVnaW46IG51bWJlcjtcbiAgcHJpdmF0ZSBfZW5kOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoYmVnaW46IG51bWJlciwgZW5kOiBudW1iZXIpIHtcbiAgICB0aGlzLl9iZWdpbiA9IGJlZ2luO1xuICAgIHRoaXMuX2VuZCA9IGVuZDtcbiAgICBpZiAodGhpcy5fYmVnaW4gPiB0aGlzLl9lbmQpIHtcbiAgICAgIFt0aGlzLl9lbmQsIHRoaXMuX2JlZ2luXSA9IFt0aGlzLl9iZWdpbiwgdGhpcy5fZW5kXTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2VuZCAtIHRoaXMuX2JlZ2luIDwgTUlOX0RJU1BMQVlfUkFOR0UpIHtcbiAgICAgIHRoaXMuX2VuZCA9IHRoaXMuX2JlZ2luICsgTUlOX0RJU1BMQVlfUkFOR0U7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGluKHg6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIHJldHVybiB4ID49IHRoaXMuX2JlZ2luICYmIHggPD0gdGhpcy5fZW5kO1xuICB9XG5cbiAgcHVibGljIGdldCBiZWdpbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9iZWdpbjtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgZW5kKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2VuZDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgcmFuZ2VJbkRheXMoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fZW5kIC0gdGhpcy5fYmVnaW47XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBjbGFtcCB9IGZyb20gXCIuLi8uLi9tZXRyaWNzL3JhbmdlLnRzXCI7XG5pbXBvcnQgeyBSZW5kZXJPcHRpb25zIH0gZnJvbSBcIi4uL3JlbmRlcmVyLnRzXCI7XG5pbXBvcnQgeyBQb2ludCB9IGZyb20gXCIuL3BvaW50LnRzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGF5Um93IHtcbiAgZGF5OiBudW1iZXI7XG4gIHJvdzogbnVtYmVyO1xufVxuXG4vKiogRmVhdHVyZXMgb2YgdGhlIGNoYXJ0IHdlIGNhbiBhc2sgZm9yIGNvb3JkaW5hdGVzIG9mLCB3aGVyZSB0aGUgdmFsdWUgcmV0dXJuZWQgaXNcbiAqIHRoZSB0b3AgbGVmdCBjb29yZGluYXRlIG9mIHRoZSBmZWF0dXJlLlxuICovXG5leHBvcnQgZW51bSBGZWF0dXJlIHtcbiAgdGFza0xpbmVTdGFydCxcbiAgdGV4dFN0YXJ0LFxuICBncm91cFRleHRTdGFydCxcbiAgcGVyY2VudFN0YXJ0LFxuICB2ZXJ0aWNhbEFycm93RGVzdFRvcCxcbiAgdmVydGljYWxBcnJvd0Rlc3RCb3R0b20sXG4gIGhvcml6b250YWxBcnJvd0Rlc3QsXG4gIHZlcnRpY2FsQXJyb3dTdGFydCxcbiAgaG9yaXpvbnRhbEFycm93U3RhcnQsXG4gIHZlcnRpY2FsQXJyb3dEZXN0VG9NaWxlc3RvbmVUb3AsXG4gIHZlcnRpY2FsQXJyb3dEZXN0VG9NaWxlc3RvbmVCb3R0b20sXG4gIGhvcml6b250YWxBcnJvd0Rlc3RUb01pbGVzdG9uZSxcbiAgdmVydGljYWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZVRvcCxcbiAgdmVydGljYWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZUJvdHRvbSxcbiAgaG9yaXpvbnRhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lLFxuICBncm91cEVudmVsb3BlU3RhcnQsXG4gIHRhc2tFbnZlbG9wZVRvcCxcblxuICBkaXNwbGF5UmFuZ2VUb3AsXG4gIHRhc2tSb3dCb3R0b20sXG5cbiAgdGltZU1hcmtTdGFydCxcbiAgdGltZU1hcmtFbmQsXG4gIHRpbWVUZXh0U3RhcnQsXG5cbiAgZ3JvdXBUaXRsZVRleHRTdGFydCxcblxuICB0YXNrc0NsaXBSZWN0T3JpZ2luLFxuICBncm91cEJ5T3JpZ2luLFxufVxuXG4vKiogU2l6ZXMgb2YgZmVhdHVyZXMgb2YgYSByZW5kZXJlZCBjaGFydC4gKi9cbmV4cG9ydCBlbnVtIE1ldHJpYyB7XG4gIHRhc2tMaW5lSGVpZ2h0LFxuICBwZXJjZW50SGVpZ2h0LFxuICBhcnJvd0hlYWRIZWlnaHQsXG4gIGFycm93SGVhZFdpZHRoLFxuICBtaWxlc3RvbmVEaWFtZXRlcixcbiAgbGluZURhc2hMaW5lLFxuICBsaW5lRGFzaEdhcCxcbiAgdGV4dFhPZmZzZXQsXG59XG5cbi8qKiBNYWtlcyBhIG51bWJlciBvZGQsIGFkZHMgb25lIGlmIGV2ZW4uICovXG5jb25zdCBtYWtlT2RkID0gKG46IG51bWJlcik6IG51bWJlciA9PiB7XG4gIGlmIChuICUgMiA9PT0gMCkge1xuICAgIHJldHVybiBuICsgMTtcbiAgfVxuICByZXR1cm4gbjtcbn07XG5cbi8qKiBTY2FsZSBjb25zb2xpZGF0ZXMgYWxsIGNhbGN1bGF0aW9ucyBhcm91bmQgcmVuZGVyaW5nIGEgY2hhcnQgb250byBhIHN1cmZhY2UuICovXG5leHBvcnQgY2xhc3MgU2NhbGUge1xuICBwcml2YXRlIGRheVdpZHRoUHg6IG51bWJlcjtcbiAgcHJpdmF0ZSByb3dIZWlnaHRQeDogbnVtYmVyO1xuICBwcml2YXRlIGJsb2NrU2l6ZVB4OiBudW1iZXI7XG4gIHByaXZhdGUgdGFza0hlaWdodFB4OiBudW1iZXI7XG4gIHByaXZhdGUgbGluZVdpZHRoUHg6IG51bWJlcjtcbiAgcHJpdmF0ZSBtYXJnaW5TaXplUHg6IG51bWJlcjtcbiAgcHJpdmF0ZSB0aW1lbGluZUhlaWdodFB4OiBudW1iZXI7XG4gIHByaXZhdGUgb3JpZ2luOiBQb2ludDtcbiAgcHJpdmF0ZSB0b3RhbE51bWJlck9mRGF5czogbnVtYmVyO1xuICBwcml2YXRlIGdyb3VwQnlDb2x1bW5XaWR0aFB4OiBudW1iZXI7XG5cbiAgcHJpdmF0ZSB0aW1lbGluZU9yaWdpbjogUG9pbnQ7XG4gIHByaXZhdGUgdGFza3NPcmlnaW46IFBvaW50O1xuICBwcml2YXRlIGdyb3VwQnlPcmlnaW46IFBvaW50O1xuICBwcml2YXRlIHRhc2tzQ2xpcFJlY3RPcmlnaW46IFBvaW50O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gICAgY2FudmFzV2lkdGhQeDogbnVtYmVyLFxuICAgIHRvdGFsTnVtYmVyT2ZEYXlzOiBudW1iZXIsXG4gICAgbWF4R3JvdXBOYW1lTGVuZ3RoOiBudW1iZXIgPSAwXG4gICkge1xuICAgIHRoaXMudG90YWxOdW1iZXJPZkRheXMgPSB0b3RhbE51bWJlck9mRGF5cztcbiAgICB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4ID0gbWF4R3JvdXBOYW1lTGVuZ3RoICogb3B0cy5mb250U2l6ZVB4O1xuXG4gICAgdGhpcy5ibG9ja1NpemVQeCA9IE1hdGguZmxvb3Iob3B0cy5mb250U2l6ZVB4IC8gMyk7XG4gICAgdGhpcy50YXNrSGVpZ2h0UHggPSBtYWtlT2RkKE1hdGguZmxvb3IoKHRoaXMuYmxvY2tTaXplUHggKiAzKSAvIDQpKTtcbiAgICB0aGlzLmxpbmVXaWR0aFB4ID0gbWFrZU9kZChNYXRoLmZsb29yKHRoaXMudGFza0hlaWdodFB4IC8gMykpO1xuICAgIGNvbnN0IG1pbGVzdG9uZVJhZGl1cyA9IE1hdGguY2VpbCh0aGlzLnRhc2tIZWlnaHRQeCAvIDIpICsgdGhpcy5saW5lV2lkdGhQeDtcbiAgICB0aGlzLm1hcmdpblNpemVQeCA9IG1pbGVzdG9uZVJhZGl1cztcbiAgICB0aGlzLnRpbWVsaW5lSGVpZ2h0UHggPSBvcHRzLmhhc1RpbWVsaW5lXG4gICAgICA/IE1hdGguY2VpbCgob3B0cy5mb250U2l6ZVB4ICogNCkgLyAzKVxuICAgICAgOiAwO1xuXG4gICAgdGhpcy50aW1lbGluZU9yaWdpbiA9IG5ldyBQb2ludChtaWxlc3RvbmVSYWRpdXMsIDApO1xuICAgIHRoaXMuZ3JvdXBCeU9yaWdpbiA9IG5ldyBQb2ludCgwLCBtaWxlc3RvbmVSYWRpdXMgKyB0aGlzLnRpbWVsaW5lSGVpZ2h0UHgpO1xuXG4gICAgbGV0IGJlZ2luT2Zmc2V0ID0gMDtcbiAgICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UgPT09IG51bGwgfHwgb3B0cy5kaXNwbGF5UmFuZ2VVc2FnZSA9PT0gXCJoaWdobGlnaHRcIikge1xuICAgICAgLy8gVE9ETyAtIFRoZSBNYXRoLmZsb29yKCkgY2FsbCBoZXJlIGNhdXNlcyB6b29taW5nIHRvIHN0YXJ0IHRvIGxvb2tcbiAgICAgIC8vIGNob3BweSB3aGVuIGxhcmdlIHJhbmdlcyBvZiB0aGUgY2hhcnQgYXJlIHNlbGVjdGVkLiBPbmUgd2F5IHRvIGZpeCB0aGlzXG4gICAgICAvLyBtaWdodCBiZSB0byBsZXQgdGhpcy5kYXlXaWR0aFB4IGJlIGEgZmxvYXRpbmcgcG9pbnQgdmFsdWUgYW5kIHRoZW5cbiAgICAgIC8vIGFwcGx5IE1hdGguZmxvb3IoKSBjYWxscyB0byBmZWF0dXJlKCkgcmVzdWx0cy5cbiAgICAgIHRoaXMuZGF5V2lkdGhQeCA9IE1hdGguZmxvb3IoXG4gICAgICAgIChjYW52YXNXaWR0aFB4IC0gdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCAtIDIgKiB0aGlzLm1hcmdpblNpemVQeCkgL1xuICAgICAgICAgIHRvdGFsTnVtYmVyT2ZEYXlzXG4gICAgICApO1xuICAgICAgdGhpcy5vcmlnaW4gPSBuZXcgUG9pbnQoMCwgMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFNob3VsZCB3ZSBzZXQgeC1tYXJnaW5zIHRvIDAgaWYgYSBTdWJSYW5nZSBpcyByZXF1ZXN0ZWQ/XG4gICAgICAvLyBPciBzaG91bGQgd2UgdG90YWxseSBkcm9wIGFsbCBtYXJnaW5zIGZyb20gaGVyZSBhbmQganVzdCB1c2VcbiAgICAgIC8vIENTUyBtYXJnaW5zIG9uIHRoZSBjYW52YXMgZWxlbWVudD9cbiAgICAgIHRoaXMuZGF5V2lkdGhQeCA9IE1hdGguZmxvb3IoXG4gICAgICAgIChjYW52YXNXaWR0aFB4IC0gdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCAtIDIgKiB0aGlzLm1hcmdpblNpemVQeCkgL1xuICAgICAgICAgIG9wdHMuZGlzcGxheVJhbmdlLnJhbmdlSW5EYXlzXG4gICAgICApO1xuICAgICAgYmVnaW5PZmZzZXQgPSBNYXRoLmZsb29yKFxuICAgICAgICB0aGlzLmRheVdpZHRoUHggKiBvcHRzLmRpc3BsYXlSYW5nZS5iZWdpbiArIHRoaXMubWFyZ2luU2l6ZVB4XG4gICAgICApO1xuICAgICAgdGhpcy5vcmlnaW4gPSBuZXcgUG9pbnQoLWJlZ2luT2Zmc2V0ICsgdGhpcy5tYXJnaW5TaXplUHgsIDApO1xuICAgIH1cblxuICAgIHRoaXMudGFza3NPcmlnaW4gPSBuZXcgUG9pbnQoXG4gICAgICB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4IC0gYmVnaW5PZmZzZXQgKyBtaWxlc3RvbmVSYWRpdXMsXG4gICAgICB0aGlzLnRpbWVsaW5lSGVpZ2h0UHggKyBtaWxlc3RvbmVSYWRpdXNcbiAgICApO1xuXG4gICAgdGhpcy50YXNrc0NsaXBSZWN0T3JpZ2luID0gbmV3IFBvaW50KFxuICAgICAgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCxcbiAgICAgIHRoaXMudGltZWxpbmVIZWlnaHRQeFxuICAgICk7XG5cbiAgICBpZiAob3B0cy5oYXNUZXh0KSB7XG4gICAgICB0aGlzLnJvd0hlaWdodFB4ID0gNiAqIHRoaXMuYmxvY2tTaXplUHg7IC8vIFRoaXMgbWlnaHQgYWxzbyBiZSBgKGNhbnZhc0hlaWdodFB4IC0gMiAqIG9wdHMubWFyZ2luU2l6ZVB4KSAvIG51bWJlclN3aW1MYW5lc2AgaWYgaGVpZ2h0IGlzIHN1cHBsaWVkP1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJvd0hlaWdodFB4ID0gMS4xICogdGhpcy5ibG9ja1NpemVQeDtcbiAgICB9XG4gIH1cblxuICAvKiogVGhlIGhlaWdodCBvZiB0aGUgY2hhcnQuIE5vdGUgdGhhdCBpdCdzIG5vdCBjb25zdHJhaW5lZCBieSB0aGUgY2FudmFzLiAqL1xuICBwdWJsaWMgaGVpZ2h0KG1heFJvd3M6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIChcbiAgICAgIG1heFJvd3MgKiB0aGlzLnJvd0hlaWdodFB4ICsgdGhpcy50aW1lbGluZUhlaWdodFB4ICsgMiAqIHRoaXMubWFyZ2luU2l6ZVB4XG4gICAgKTtcbiAgfVxuXG4gIHB1YmxpYyBkYXlSb3dGcm9tUG9pbnQocG9pbnQ6IFBvaW50KTogRGF5Um93IHtcbiAgICAvLyBUaGlzIHNob3VsZCBhbHNvIGNsYW1wIHRoZSByZXR1cm5lZCAneCcgdmFsdWUgdG8gWzAsIG1heFJvd3MpLlxuICAgIHJldHVybiB7XG4gICAgICBkYXk6IGNsYW1wKFxuICAgICAgICBNYXRoLmZsb29yKFxuICAgICAgICAgICh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyAqIHBvaW50LnggLVxuICAgICAgICAgICAgdGhpcy5vcmlnaW4ueCAtXG4gICAgICAgICAgICB0aGlzLm1hcmdpblNpemVQeCAtXG4gICAgICAgICAgICB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4KSAvXG4gICAgICAgICAgICB0aGlzLmRheVdpZHRoUHhcbiAgICAgICAgKSxcbiAgICAgICAgMCxcbiAgICAgICAgdGhpcy50b3RhbE51bWJlck9mRGF5c1xuICAgICAgKSxcbiAgICAgIHJvdzogTWF0aC5mbG9vcihcbiAgICAgICAgKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvICogcG9pbnQueSAtXG4gICAgICAgICAgdGhpcy5vcmlnaW4ueSAtXG4gICAgICAgICAgdGhpcy5tYXJnaW5TaXplUHggLVxuICAgICAgICAgIHRoaXMudGltZWxpbmVIZWlnaHRQeCkgL1xuICAgICAgICAgIHRoaXMucm93SGVpZ2h0UHhcbiAgICAgICksXG4gICAgfTtcbiAgfVxuXG4gIC8qKiBUaGUgdG9wIGxlZnQgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3ggZm9yIGEgc2luZ2xlIHRhc2suICovXG4gIHByaXZhdGUgdGFza1Jvd0VudmVsb3BlU3RhcnQocm93OiBudW1iZXIsIGRheTogbnVtYmVyKTogUG9pbnQge1xuICAgIHJldHVybiB0aGlzLm9yaWdpbi5zdW0oXG4gICAgICBuZXcgUG9pbnQoXG4gICAgICAgIGRheSAqIHRoaXMuZGF5V2lkdGhQeCArIHRoaXMubWFyZ2luU2l6ZVB4ICsgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCxcbiAgICAgICAgcm93ICogdGhpcy5yb3dIZWlnaHRQeCArIHRoaXMubWFyZ2luU2l6ZVB4ICsgdGhpcy50aW1lbGluZUhlaWdodFB4XG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgcHJpdmF0ZSBncm91cFJvd0VudmVsb3BlU3RhcnQocm93OiBudW1iZXIsIGRheTogbnVtYmVyKTogUG9pbnQge1xuICAgIHJldHVybiB0aGlzLmdyb3VwQnlPcmlnaW4uc3VtKFxuICAgICAgbmV3IFBvaW50KFxuICAgICAgICAwLFxuICAgICAgICByb3cgKiB0aGlzLnJvd0hlaWdodFB4ICsgdGhpcy5tYXJnaW5TaXplUHggKyB0aGlzLnRpbWVsaW5lSGVpZ2h0UHhcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBncm91cEhlYWRlclN0YXJ0KCk6IFBvaW50IHtcbiAgICByZXR1cm4gdGhpcy5vcmlnaW4uc3VtKG5ldyBQb2ludCh0aGlzLm1hcmdpblNpemVQeCwgdGhpcy5tYXJnaW5TaXplUHgpKTtcbiAgfVxuXG4gIHByaXZhdGUgdGltZUVudmVsb3BlU3RhcnQoZGF5OiBudW1iZXIpOiBQb2ludCB7XG4gICAgcmV0dXJuIHRoaXMub3JpZ2luLnN1bShcbiAgICAgIG5ldyBQb2ludChcbiAgICAgICAgZGF5ICogdGhpcy5kYXlXaWR0aFB4ICsgdGhpcy5tYXJnaW5TaXplUHggKyB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4LFxuICAgICAgICB0aGlzLm1hcmdpblNpemVQeFxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgY29vcmRpbmF0ZSBvZiB0aGUgaXRlbSAqL1xuICBmZWF0dXJlKHJvdzogbnVtYmVyLCBkYXk6IG51bWJlciwgY29vcmQ6IEZlYXR1cmUpOiBQb2ludCB7XG4gICAgc3dpdGNoIChjb29yZCkge1xuICAgICAgY2FzZSBGZWF0dXJlLnRhc2tMaW5lU3RhcnQ6XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb3A6XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSkuYWRkKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgdGhpcy5yb3dIZWlnaHRQeCAtIHRoaXMuYmxvY2tTaXplUHhcbiAgICAgICAgKTtcblxuICAgICAgY2FzZSBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0Qm90dG9tOlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSkuYWRkKDAsIHRoaXMucm93SGVpZ2h0UHgpO1xuICAgICAgY2FzZSBGZWF0dXJlLnRleHRTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza1Jvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpLmFkZChcbiAgICAgICAgICB0aGlzLmJsb2NrU2l6ZVB4LFxuICAgICAgICAgIHRoaXMuYmxvY2tTaXplUHhcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5ncm91cFRleHRTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KS5hZGQoXG4gICAgICAgICAgdGhpcy5ibG9ja1NpemVQeCxcbiAgICAgICAgICB0aGlzLmJsb2NrU2l6ZVB4XG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUucGVyY2VudFN0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSkuYWRkKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgdGhpcy5yb3dIZWlnaHRQeCAtIHRoaXMubGluZVdpZHRoUHhcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dEZXN0OlxuICAgICAgY2FzZSBGZWF0dXJlLmhvcml6b250YWxBcnJvd1N0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSkuYWRkKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgTWF0aC5mbG9vcih0aGlzLnJvd0hlaWdodFB4IC0gMC41ICogdGhpcy5ibG9ja1NpemVQeCkgLSAxXG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZVRvcDpcbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvcCkuYWRkKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgLTEgKiB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpXG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZUJvdHRvbTpcbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvcCkuYWRkKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKVxuICAgICAgICApO1xuICAgICAgY2FzZSBGZWF0dXJlLmhvcml6b250YWxBcnJvd0Rlc3RUb01pbGVzdG9uZTpcbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dEZXN0KS5hZGQoXG4gICAgICAgICAgLTEgKiB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpLFxuICAgICAgICAgIC0xICogdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKVxuICAgICAgICApO1xuICAgICAgY2FzZSBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydEZyb21NaWxlc3RvbmVUb3A6XG4gICAgICAgIHJldHVybiB0aGlzLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0KS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICAtMSAqIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlcilcbiAgICAgICAgKTtcblxuICAgICAgY2FzZSBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydEZyb21NaWxlc3RvbmVCb3R0b206XG4gICAgICAgIHJldHVybiB0aGlzLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0KS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpXG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lOlxuICAgICAgICByZXR1cm4gdGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLmhvcml6b250YWxBcnJvd1N0YXJ0KS5hZGQoXG4gICAgICAgICAgdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKSxcbiAgICAgICAgICAwXG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUudGFza0VudmVsb3BlVG9wOlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSk7XG4gICAgICBjYXNlIEZlYXR1cmUuZ3JvdXBFbnZlbG9wZVN0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy5ncm91cFJvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpO1xuICAgICAgY2FzZSBGZWF0dXJlLnRpbWVNYXJrU3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRpbWVFbnZlbG9wZVN0YXJ0KGRheSk7XG4gICAgICBjYXNlIEZlYXR1cmUudGltZU1hcmtFbmQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRpbWVFbnZlbG9wZVN0YXJ0KGRheSkuYWRkKDAsIHRoaXMucm93SGVpZ2h0UHggKiAocm93ICsgMSkpO1xuICAgICAgY2FzZSBGZWF0dXJlLnRpbWVUZXh0U3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRpbWVFbnZlbG9wZVN0YXJ0KGRheSkuYWRkKHRoaXMuYmxvY2tTaXplUHgsIDApO1xuXG4gICAgICBjYXNlIEZlYXR1cmUuZ3JvdXBUaXRsZVRleHRTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBIZWFkZXJTdGFydCgpLmFkZCh0aGlzLmJsb2NrU2l6ZVB4LCAwKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5kaXNwbGF5UmFuZ2VUb3A6XG4gICAgICAgIHJldHVybiB0aGlzLnRpbWVFbnZlbG9wZVN0YXJ0KGRheSk7XG4gICAgICBjYXNlIEZlYXR1cmUudGFza1Jvd0JvdHRvbTpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza1Jvd0VudmVsb3BlU3RhcnQocm93ICsgMSwgZGF5KTtcbiAgICAgIGNhc2UgRmVhdHVyZS50YXNrc0NsaXBSZWN0T3JpZ2luOlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrc0NsaXBSZWN0T3JpZ2luO1xuICAgICAgY2FzZSBGZWF0dXJlLmdyb3VwQnlPcmlnaW46XG4gICAgICAgIHJldHVybiB0aGlzLmdyb3VwQnlPcmlnaW47XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBUaGUgbGluZSBiZWxvdyB3aWxsIG5vdCBjb21waWxlIGlmIHlvdSBtaXNzZWQgYW4gZW51bSBpbiB0aGUgc3dpdGNoIGFib3ZlLlxuICAgICAgICBjb29yZCBzYXRpc2ZpZXMgbmV2ZXI7XG4gICAgICAgIHJldHVybiBuZXcgUG9pbnQoMCwgMCk7XG4gICAgfVxuICB9XG5cbiAgbWV0cmljKGZlYXR1cmU6IE1ldHJpYyk6IG51bWJlciB7XG4gICAgc3dpdGNoIChmZWF0dXJlKSB7XG4gICAgICBjYXNlIE1ldHJpYy50YXNrTGluZUhlaWdodDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza0hlaWdodFB4O1xuICAgICAgY2FzZSBNZXRyaWMucGVyY2VudEhlaWdodDpcbiAgICAgICAgcmV0dXJuIHRoaXMubGluZVdpZHRoUHg7XG4gICAgICBjYXNlIE1ldHJpYy5hcnJvd0hlYWRIZWlnaHQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tIZWlnaHRQeDtcbiAgICAgIGNhc2UgTWV0cmljLmFycm93SGVhZFdpZHRoOlxuICAgICAgICByZXR1cm4gTWF0aC5jZWlsKHRoaXMudGFza0hlaWdodFB4KTtcbiAgICAgIGNhc2UgTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyOlxuICAgICAgICByZXR1cm4gTWF0aC5jZWlsKHRoaXMudGFza0hlaWdodFB4KTtcbiAgICAgIGNhc2UgTWV0cmljLmxpbmVEYXNoTGluZTpcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tTaXplUHg7XG4gICAgICBjYXNlIE1ldHJpYy5saW5lRGFzaEdhcDpcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tTaXplUHg7XG4gICAgICBjYXNlIE1ldHJpYy50ZXh0WE9mZnNldDpcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tTaXplUHg7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBUaGUgbGluZSBiZWxvdyB3aWxsIG5vdCBjb21waWxlIGlmIHlvdSBtaXNzZWQgYW4gZW51bSBpbiB0aGUgc3dpdGNoIGFib3ZlLlxuICAgICAgICBmZWF0dXJlIHNhdGlzZmllcyBuZXZlcjtcbiAgICAgICAgcmV0dXJuIDAuMDtcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBUYXNrLCB2YWxpZGF0ZUNoYXJ0IH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBEaXJlY3RlZEVkZ2UgfSBmcm9tIFwiLi4vZGFnL2RhZy50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcbmltcG9ydCB7IFJlc291cmNlRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9yZXNvdXJjZXMvcmVzb3VyY2VzLnRzXCI7XG5pbXBvcnQgeyBSZXN1bHQsIG9rIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgU3BhbiB9IGZyb20gXCIuLi9zbGFjay9zbGFjay50c1wiO1xuaW1wb3J0IHsgRGlzcGxheVJhbmdlIH0gZnJvbSBcIi4vcmFuZ2UvcmFuZ2UudHNcIjtcbmltcG9ydCB7IFBvaW50IH0gZnJvbSBcIi4vc2NhbGUvcG9pbnQudHNcIjtcbmltcG9ydCB7IEZlYXR1cmUsIE1ldHJpYywgU2NhbGUgfSBmcm9tIFwiLi9zY2FsZS9zY2FsZS50c1wiO1xuXG50eXBlIERpcmVjdGlvbiA9IFwidXBcIiB8IFwiZG93blwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbG9ycyB7XG4gIHN1cmZhY2U6IHN0cmluZztcbiAgb25TdXJmYWNlOiBzdHJpbmc7XG4gIG9uU3VyZmFjZU11dGVkOiBzdHJpbmc7XG4gIG9uU3VyZmFjZUhpZ2hsaWdodDogc3RyaW5nO1xuICBvdmVybGF5OiBzdHJpbmc7XG4gIGdyb3VwQ29sb3I6IHN0cmluZztcbn1cblxuZXhwb3J0IHR5cGUgVGFza0luZGV4VG9Sb3cgPSBNYXA8bnVtYmVyLCBudW1iZXI+O1xuXG4vKiogRnVuY3Rpb24gdXNlIHRvIHByb2R1Y2UgYSB0ZXh0IGxhYmVsIGZvciBhIHRhc2sgYW5kIGl0cyBzbGFjay4gKi9cbmV4cG9ydCB0eXBlIFRhc2tMYWJlbCA9ICh0YXNrSW5kZXg6IG51bWJlcikgPT4gc3RyaW5nO1xuXG4vKiogQ29udHJvbHMgb2YgdGhlIGRpc3BsYXlSYW5nZSBpbiBSZW5kZXJPcHRpb25zIGlzIHVzZWQuXG4gKlxuICogIFwicmVzdHJpY3RcIjogT25seSBkaXNwbGF5IHRoZSBwYXJ0cyBvZiB0aGUgY2hhcnQgdGhhdCBhcHBlYXIgaW4gdGhlIHJhbmdlLlxuICpcbiAqICBcImhpZ2hsaWdodFwiOiBEaXNwbGF5IHRoZSBmdWxsIHJhbmdlIG9mIHRoZSBkYXRhLCBidXQgaGlnaGxpZ2h0IHRoZSByYW5nZS5cbiAqL1xuZXhwb3J0IHR5cGUgRGlzcGxheVJhbmdlVXNhZ2UgPSBcInJlc3RyaWN0XCIgfCBcImhpZ2hsaWdodFwiO1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdFRhc2tMYWJlbDogVGFza0xhYmVsID0gKHRhc2tJbmRleDogbnVtYmVyKTogc3RyaW5nID0+XG4gIHRhc2tJbmRleC50b0ZpeGVkKDApO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlbmRlck9wdGlvbnMge1xuICAvKiogVGhlIHRleHQgZm9udCBzaXplLCB0aGlzIGRyaXZlcyB0aGUgc2l6ZSBvZiBhbGwgb3RoZXIgY2hhcnQgZmVhdHVyZXMuXG4gICAqICovXG4gIGZvbnRTaXplUHg6IG51bWJlcjtcblxuICAvKiogRGlzcGxheSB0ZXh0IGlmIHRydWUuICovXG4gIGhhc1RleHQ6IGJvb2xlYW47XG5cbiAgLyoqIElmIHN1cHBsaWVkIHRoZW4gb25seSB0aGUgdGFza3MgaW4gdGhlIGdpdmVuIHJhbmdlIHdpbGwgYmUgZGlzcGxheWVkLiAqL1xuICBkaXNwbGF5UmFuZ2U6IERpc3BsYXlSYW5nZSB8IG51bGw7XG5cbiAgLyoqIENvbnRyb2xzIGhvdyB0aGUgYGRpc3BsYXlSYW5nZWAgaXMgdXNlZCBpZiBzdXBwbGllZC4gKi9cbiAgZGlzcGxheVJhbmdlVXNhZ2U6IERpc3BsYXlSYW5nZVVzYWdlO1xuXG4gIC8qKiBUaGUgY29sb3IgdGhlbWUuICovXG4gIGNvbG9yczogQ29sb3JzO1xuXG4gIC8qKiBJZiB0cnVlIHRoZW4gZGlzcGxheSB0aW1lcyBhdCB0aGUgdG9wIG9mIHRoZSBjaGFydC4gKi9cbiAgaGFzVGltZWxpbmU6IGJvb2xlYW47XG5cbiAgLyoqIElmIHRydWUgdGhlbiBkaXNwbGF5IHRoZSB0YXNrIGJhcnMuICovXG4gIGhhc1Rhc2tzOiBib29sZWFuO1xuXG4gIC8qKiBJZiB0cnVlIHRoZW4gZHJhdyB2ZXJ0aWNhbCBsaW5lcyBmcm9tIHRoZSB0aW1lbGluZSBkb3duIHRvIHRhc2sgc3RhcnQgYW5kXG4gICAqIGZpbmlzaCBwb2ludHMuICovXG4gIGRyYXdUaW1lTWFya2Vyc09uVGFza3M6IGJvb2xlYW47XG5cbiAgLyoqIERyYXcgZGVwZW5kZW5jeSBlZGdlcyBiZXR3ZWVuIHRhc2tzIGlmIHRydWUuICovXG4gIGhhc0VkZ2VzOiBib29sZWFuO1xuXG4gIC8qKiBGdW5jdGlvbiB0aGF0IHByb2R1Y2VzIGRpc3BsYXkgdGV4dCBmb3IgYSBUYXNrIGFuZCBpdHMgYXNzb2NpYXRlZCBTbGFjay4gKi9cbiAgdGFza0xhYmVsOiBUYXNrTGFiZWw7XG5cbiAgLyoqIFRoZSBpbmRpY2VzIG9mIHRhc2tzIHRoYXQgc2hvdWxkIGJlIGhpZ2hsaWdodGVkIHdoZW4gZHJhdywgdHlwaWNhbGx5IHVzZWRcbiAgICogdG8gaGlnaGxpZ2h0IHRoZSBjcml0aWNhbCBwYXRoLiAqL1xuICB0YXNrSGlnaGxpZ2h0czogbnVtYmVyW107XG5cbiAgLyoqIEdyb3VwIHRoZSB0YXNrcyB0b2dldGhlciB2ZXJ0aWNhbGx5IGJhc2VkIG9uIHRoZSBnaXZlbiByZXNvdXJjZS4gSWYgdGhlXG4gICAqIGVtcHR5IHN0cmluZyBpcyBzdXBwbGllZCB0aGVuIGp1c3QgZGlzcGxheSBieSB0b3BvbG9naWNhbCBvcmRlci5cbiAgICovXG4gIGdyb3VwQnlSZXNvdXJjZTogc3RyaW5nO1xufVxuXG5jb25zdCB2ZXJ0aWNhbEFycm93U3RhcnRGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbiA9IChcbiAgdGFzazogVGFzayxcbiAgZGlyZWN0aW9uOiBEaXJlY3Rpb25cbik6IEZlYXR1cmUgPT4ge1xuICBpZiAodGFzay5kdXJhdGlvbiA9PT0gMCkge1xuICAgIGlmIChkaXJlY3Rpb24gPT09IFwiZG93blwiKSB7XG4gICAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lQm90dG9tO1xuICAgIH1cbiAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lVG9wO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydDtcbiAgfVxufTtcblxuY29uc3QgdmVydGljYWxBcnJvd0Rlc3RGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbiA9IChcbiAgdGFzazogVGFzayxcbiAgZGlyZWN0aW9uOiBEaXJlY3Rpb25cbik6IEZlYXR1cmUgPT4ge1xuICBpZiAodGFzay5kdXJhdGlvbiA9PT0gMCkge1xuICAgIGlmIChkaXJlY3Rpb24gPT09IFwiZG93blwiKSB7XG4gICAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvTWlsZXN0b25lVG9wO1xuICAgIH1cbiAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvTWlsZXN0b25lQm90dG9tO1xuICB9IGVsc2Uge1xuICAgIGlmIChkaXJlY3Rpb24gPT09IFwiZG93blwiKSB7XG4gICAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvcDtcbiAgICB9XG4gICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RCb3R0b207XG4gIH1cbn07XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbmNvbnN0IGhvcml6b250YWxBcnJvd1N0YXJ0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24gPSAodGFzazogVGFzayk6IEZlYXR1cmUgPT4ge1xuICBpZiAodGFzay5kdXJhdGlvbiA9PT0gMCkge1xuICAgIHJldHVybiBGZWF0dXJlLmhvcml6b250YWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dTdGFydDtcbiAgfVxufTtcblxuY29uc3QgaG9yaXpvbnRhbEFycm93RGVzdEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uID0gKHRhc2s6IFRhc2spOiBGZWF0dXJlID0+IHtcbiAgaWYgKHRhc2suZHVyYXRpb24gPT09IDApIHtcbiAgICByZXR1cm4gRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dEZXN0VG9NaWxlc3RvbmU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93RGVzdDtcbiAgfVxufTtcblxuLyoqXG4gKiBDb21wdXRlIHdoYXQgdGhlIGhlaWdodCBvZiB0aGUgY2FudmFzIHNob3VsZCBiZS4gTm90ZSB0aGF0IHRoZSB2YWx1ZSBkb2Vzbid0XG4gKiBrbm93IGFib3V0IGB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpb2AsIHNvIGlmIHRoZSBjYW52YXMgaXMgYWxyZWFkeSBzY2FsZWQgYnlcbiAqIGB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpb2AgdGhlbiBzbyB3aWxsIHRoZSByZXN1bHQgb2YgdGhpcyBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1Z2dlc3RlZENhbnZhc0hlaWdodChcbiAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcbiAgc3BhbnM6IFNwYW5bXSxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgbWF4Um93czogbnVtYmVyXG4pOiBudW1iZXIge1xuICBpZiAoIW9wdHMuaGFzVGFza3MpIHtcbiAgICBtYXhSb3dzID0gMDtcbiAgfVxuICByZXR1cm4gbmV3IFNjYWxlKFxuICAgIG9wdHMsXG4gICAgY2FudmFzLndpZHRoLFxuICAgIHNwYW5zW3NwYW5zLmxlbmd0aCAtIDFdLmZpbmlzaCArIDFcbiAgKS5oZWlnaHQobWF4Um93cyk7XG59XG5cbi8vIFRPRE8gLSBQYXNzIGluIG1heCByb3dzLCBhbmQgYSBtYXBwaW5nIHRoYXQgbWFwcyBmcm9tIHRhc2tJbmRleCB0byByb3csXG4vLyBiZWNhdXNlIHR3byBkaWZmZXJlbnQgdGFza3MgbWlnaHQgYmUgcGxhY2VkIG9uIHRoZSBzYW1lIHJvdy4gQWxzbyB3ZSBzaG91bGRcbi8vIHBhc3MgaW4gbWF4IHJvd3M/IE9yIHNob3VsZCB0aGF0IGNvbWUgZnJvbSB0aGUgYWJvdmUgbWFwcGluZz9cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJUYXNrc1RvQ2FudmFzKFxuICBwYXJlbnQ6IEhUTUxFbGVtZW50LFxuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgcGxhbjogUGxhbixcbiAgc3BhbnM6IFNwYW5bXSxcbiAgb3B0czogUmVuZGVyT3B0aW9uc1xuKTogUmVzdWx0PFNjYWxlPiB7XG4gIGNvbnN0IHZyZXQgPSB2YWxpZGF0ZUNoYXJ0KHBsYW4uY2hhcnQpO1xuICBpZiAoIXZyZXQub2spIHtcbiAgICByZXR1cm4gdnJldDtcbiAgfVxuXG4gIC8vIEhpZ2hsaWdodGVkIHRhc2tzLlxuICBjb25zdCB0YXNrSGlnaGxpZ2h0czogU2V0PG51bWJlcj4gPSBuZXcgU2V0KG9wdHMudGFza0hpZ2hsaWdodHMpO1xuXG4gIC8vIENhbGN1bGF0ZSBob3cgd2lkZSB3ZSBuZWVkIHRvIG1ha2UgdGhlIGdyb3VwQnkgY29sdW1uLlxuICBsZXQgbWF4R3JvdXBOYW1lTGVuZ3RoID0gMDtcbiAgaWYgKG9wdHMuZ3JvdXBCeVJlc291cmNlICE9PSBcIlwiICYmIG9wdHMuaGFzVGV4dCkge1xuICAgIG1heEdyb3VwTmFtZUxlbmd0aCA9IG9wdHMuZ3JvdXBCeVJlc291cmNlLmxlbmd0aDtcbiAgICBjb25zdCByZXNvdXJjZURlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbihvcHRzLmdyb3VwQnlSZXNvdXJjZSk7XG4gICAgaWYgKHJlc291cmNlRGVmaW5pdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXNvdXJjZURlZmluaXRpb24udmFsdWVzLmZvckVhY2goKHZhbHVlOiBzdHJpbmcpID0+IHtcbiAgICAgICAgbWF4R3JvdXBOYW1lTGVuZ3RoID0gTWF0aC5tYXgobWF4R3JvdXBOYW1lTGVuZ3RoLCB2YWx1ZS5sZW5ndGgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgdG90YWxOdW1iZXJPZlJvd3MgPSBzcGFucy5sZW5ndGg7XG4gIGNvbnN0IHRvdGFsTnVtYmVyT2ZEYXlzID0gc3BhbnNbc3BhbnMubGVuZ3RoIC0gMV0uZmluaXNoO1xuICBjb25zdCBzY2FsZSA9IG5ldyBTY2FsZShcbiAgICBvcHRzLFxuICAgIGNhbnZhcy53aWR0aCxcbiAgICB0b3RhbE51bWJlck9mRGF5cyArIDEsXG4gICAgbWF4R3JvdXBOYW1lTGVuZ3RoXG4gICk7XG5cbiAgY29uc3QgdGFza0xpbmVIZWlnaHQgPSBzY2FsZS5tZXRyaWMoTWV0cmljLnRhc2tMaW5lSGVpZ2h0KTtcbiAgY29uc3QgZGlhbW9uZERpYW1ldGVyID0gc2NhbGUubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlcik7XG4gIGNvbnN0IHBlcmNlbnRIZWlnaHQgPSBzY2FsZS5tZXRyaWMoTWV0cmljLnBlcmNlbnRIZWlnaHQpO1xuICBjb25zdCBhcnJvd0hlYWRIZWlnaHQgPSBzY2FsZS5tZXRyaWMoTWV0cmljLmFycm93SGVhZEhlaWdodCk7XG4gIGNvbnN0IGFycm93SGVhZFdpZHRoID0gc2NhbGUubWV0cmljKE1ldHJpYy5hcnJvd0hlYWRXaWR0aCk7XG4gIGNvbnN0IGRheXNXaXRoVGltZU1hcmtlcnM6IFNldDxudW1iZXI+ID0gbmV3IFNldCgpO1xuICBjb25zdCB0aXJldCA9IHRhc2tJbmRleFRvUm93RnJvbUdyb3VwQnkob3B0cywgcGxhbik7XG4gIGlmICghdGlyZXQub2spIHtcbiAgICByZXR1cm4gdGlyZXQ7XG4gIH1cbiAgY29uc3QgdGFza0luZGV4VG9Sb3cgPSB0aXJldC52YWx1ZS50YXNrSW5kZXhUb1JvdztcbiAgY29uc3Qgcm93UmFuZ2VzID0gdGlyZXQudmFsdWUucm93UmFuZ2VzO1xuICBjb25zdCByZXNvdXJjZURlZmluaXRpb24gPSB0aXJldC52YWx1ZS5yZXNvdXJjZURlZmluaXRpb247XG5cbiAgLy8gU2V0IHVwIGNhbnZhcyBiYXNpY3MuXG4gIGNsZWFyQ2FudmFzKGN0eCwgb3B0cywgY2FudmFzKTtcbiAgc2V0Rm9udFNpemUoY3R4LCBvcHRzKTtcblxuICBjb25zdCBjbGlwUmVnaW9uID0gbmV3IFBhdGgyRCgpO1xuICBjb25zdCBjbGlwT3JpZ2luID0gc2NhbGUuZmVhdHVyZSgwLCAwLCBGZWF0dXJlLnRhc2tzQ2xpcFJlY3RPcmlnaW4pO1xuICBjb25zdCBjbGlwV2lkdGggPSBjYW52YXMud2lkdGggLSBjbGlwT3JpZ2luLng7XG4gIGNsaXBSZWdpb24ucmVjdChjbGlwT3JpZ2luLngsIDAsIGNsaXBXaWR0aCwgY2FudmFzLmhlaWdodCk7XG5cbiAgLy8gRHJhdyBiaWcgcmVkIHJlY3Qgb3ZlciB3aGVyZSB0aGUgY2xpcCByZWdpb24gd2lsbCBiZS5cbiAgaWYgKDApIHtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xuICAgIGN0eC5saW5lV2lkdGggPSAyO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguc3Ryb2tlKGNsaXBSZWdpb24pO1xuICB9XG5cbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuXG4gIGlmIChyb3dSYW5nZXMgIT09IG51bGwpIHtcbiAgICBpZiAob3B0cy5oYXNUYXNrcykge1xuICAgICAgZHJhd1N3aW1MYW5lSGlnaGxpZ2h0cyhcbiAgICAgICAgY3R4LFxuICAgICAgICBzY2FsZSxcbiAgICAgICAgcm93UmFuZ2VzLFxuICAgICAgICB0b3RhbE51bWJlck9mRGF5cyxcbiAgICAgICAgb3B0cy5jb2xvcnMuZ3JvdXBDb2xvclxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAocmVzb3VyY2VEZWZpbml0aW9uICE9PSBudWxsICYmIG9wdHMuaGFzVGV4dCkge1xuICAgICAgZHJhd1N3aW1MYW5lTGFiZWxzKGN0eCwgb3B0cywgcmVzb3VyY2VEZWZpbml0aW9uLCBzY2FsZSwgcm93UmFuZ2VzKTtcbiAgICB9XG4gIH1cblxuICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG5cbiAgY3R4LnNhdmUoKTtcbiAgY3R4LmNsaXAoY2xpcFJlZ2lvbik7XG4gIC8vIERyYXcgdGFza3MgaW4gdGhlaXIgcm93cy5cbiAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCB0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHJvdyA9IHRhc2tJbmRleFRvUm93LmdldCh0YXNrSW5kZXgpITtcbiAgICBjb25zdCBzcGFuID0gc3BhbnNbdGFza0luZGV4XTtcbiAgICBjb25zdCB0YXNrU3RhcnQgPSBzY2FsZS5mZWF0dXJlKHJvdywgc3Bhbi5zdGFydCwgRmVhdHVyZS50YXNrTGluZVN0YXJ0KTtcbiAgICBjb25zdCB0YXNrRW5kID0gc2NhbGUuZmVhdHVyZShyb3csIHNwYW4uZmluaXNoLCBGZWF0dXJlLnRhc2tMaW5lU3RhcnQpO1xuXG4gICAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZU11dGVkO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZU11dGVkO1xuXG4gICAgLy8gRHJhdyBpbiB0aW1lIG1hcmtlcnMgaWYgZGlzcGxheWVkLlxuICAgIC8vIFRPRE8gLSBNYWtlIHN1cmUgdGhleSBkb24ndCBvdmVybGFwLlxuICAgIGlmIChvcHRzLmRyYXdUaW1lTWFya2Vyc09uVGFza3MpIHtcbiAgICAgIGRyYXdUaW1lTWFya2VyQXREYXlUb1Rhc2soXG4gICAgICAgIGN0eCxcbiAgICAgICAgcm93LFxuICAgICAgICBzcGFuLnN0YXJ0LFxuICAgICAgICB0YXNrLFxuICAgICAgICBvcHRzLFxuICAgICAgICBzY2FsZSxcbiAgICAgICAgZGF5c1dpdGhUaW1lTWFya2Vyc1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAodGFza0hpZ2hsaWdodHMuaGFzKHRhc2tJbmRleCkpIHtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VIaWdobGlnaHQ7XG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VIaWdobGlnaHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gICAgfVxuICAgIGlmIChvcHRzLmhhc1Rhc2tzKSB7XG4gICAgICBpZiAodGFza1N0YXJ0LnggPT09IHRhc2tFbmQueCkge1xuICAgICAgICBkcmF3TWlsZXN0b25lKGN0eCwgdGFza1N0YXJ0LCBkaWFtb25kRGlhbWV0ZXIsIHBlcmNlbnRIZWlnaHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZHJhd1Rhc2tCYXIoY3R4LCB0YXNrU3RhcnQsIHRhc2tFbmQsIHRhc2tMaW5lSGVpZ2h0KTtcbiAgICAgIH1cblxuICAgICAgLy8gU2tpcCBkcmF3aW5nIHRoZSB0ZXN0IG9mIHRoZSBTdGFydCBhbmQgRmluaXNoIHRhc2tzLlxuICAgICAgaWYgKHRhc2tJbmRleCAhPT0gMCAmJiB0YXNrSW5kZXggIT09IHRvdGFsTnVtYmVyT2ZSb3dzIC0gMSkge1xuICAgICAgICBkcmF3VGFza1RleHQoY3R4LCBvcHRzLCBzY2FsZSwgcm93LCBzcGFuLCB0YXNrLCB0YXNrSW5kZXgsIGNsaXBXaWR0aCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBjdHgubGluZVdpZHRoID0gMTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlTXV0ZWQ7XG5cbiAgLy8gTm93IGRyYXcgYWxsIHRoZSBhcnJvd3MsIGkuZS4gZWRnZXMuXG4gIGlmIChvcHRzLmhhc0VkZ2VzICYmIG9wdHMuaGFzVGFza3MpIHtcbiAgICBjb25zdCBoaWdobGlnaHRlZEVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSA9IFtdO1xuICAgIGNvbnN0IG5vcm1hbEVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSA9IFtdO1xuICAgIHBsYW4uY2hhcnQuRWRnZXMuZm9yRWFjaCgoZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgIG9wdHMudGFza0hpZ2hsaWdodHMuaW5jbHVkZXMoZS5pKSAmJlxuICAgICAgICBvcHRzLnRhc2tIaWdobGlnaHRzLmluY2x1ZGVzKGUuailcbiAgICAgICkge1xuICAgICAgICBoaWdobGlnaHRlZEVkZ2VzLnB1c2goZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub3JtYWxFZGdlcy5wdXNoKGUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlTXV0ZWQ7XG4gICAgZHJhd0VkZ2VzKFxuICAgICAgY3R4LFxuICAgICAgb3B0cyxcbiAgICAgIG5vcm1hbEVkZ2VzLFxuICAgICAgc3BhbnMsXG4gICAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLFxuICAgICAgc2NhbGUsXG4gICAgICB0YXNrSW5kZXhUb1JvdyxcbiAgICAgIGFycm93SGVhZFdpZHRoLFxuICAgICAgYXJyb3dIZWFkSGVpZ2h0XG4gICAgKTtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VIaWdobGlnaHQ7XG4gICAgZHJhd0VkZ2VzKFxuICAgICAgY3R4LFxuICAgICAgb3B0cyxcbiAgICAgIGhpZ2hsaWdodGVkRWRnZXMsXG4gICAgICBzcGFucyxcbiAgICAgIHBsYW4uY2hhcnQuVmVydGljZXMsXG4gICAgICBzY2FsZSxcbiAgICAgIHRhc2tJbmRleFRvUm93LFxuICAgICAgYXJyb3dIZWFkV2lkdGgsXG4gICAgICBhcnJvd0hlYWRIZWlnaHRcbiAgICApO1xuICB9XG5cbiAgY3R4LnJlc3RvcmUoKTtcblxuICAvLyBOb3cgZHJhdyB0aGUgcmFuZ2UgaGlnaGxpZ2h0cyBpZiByZXF1aXJlZC5cbiAgaWYgKG9wdHMuZGlzcGxheVJhbmdlICE9PSBudWxsICYmIG9wdHMuZGlzcGxheVJhbmdlVXNhZ2UgPT09IFwiaGlnaGxpZ2h0XCIpIHtcbiAgICAvLyBEcmF3IGEgcmVjdCBvdmVyIGVhY2ggc2lkZSB0aGF0IGlzbid0IGluIHRoZSByYW5nZS5cbiAgICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UuYmVnaW4gPiAwKSB7XG4gICAgICBkcmF3UmFuZ2VPdmVybGF5KFxuICAgICAgICBjdHgsXG4gICAgICAgIG9wdHMsXG4gICAgICAgIHNjYWxlLFxuICAgICAgICAwLFxuICAgICAgICBvcHRzLmRpc3BsYXlSYW5nZS5iZWdpbixcbiAgICAgICAgdG90YWxOdW1iZXJPZlJvd3NcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChvcHRzLmRpc3BsYXlSYW5nZS5lbmQgPCB0b3RhbE51bWJlck9mRGF5cykge1xuICAgICAgZHJhd1JhbmdlT3ZlcmxheShcbiAgICAgICAgY3R4LFxuICAgICAgICBvcHRzLFxuICAgICAgICBzY2FsZSxcbiAgICAgICAgb3B0cy5kaXNwbGF5UmFuZ2UuZW5kLFxuICAgICAgICB0b3RhbE51bWJlck9mRGF5cyArIDEsXG4gICAgICAgIHRvdGFsTnVtYmVyT2ZSb3dzXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvayhzY2FsZSk7XG59XG5cbmZ1bmN0aW9uIGRyYXdFZGdlcyhcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSxcbiAgc3BhbnM6IFNwYW5bXSxcbiAgdGFza3M6IFRhc2tbXSxcbiAgc2NhbGU6IFNjYWxlLFxuICB0YXNrSW5kZXhUb1JvdzogVGFza0luZGV4VG9Sb3csXG4gIGFycm93SGVhZFdpZHRoOiBudW1iZXIsXG4gIGFycm93SGVhZEhlaWdodDogbnVtYmVyXG4pIHtcbiAgZWRnZXMuZm9yRWFjaCgoZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgY29uc3Qgc3JjU2xhY2s6IFNwYW4gPSBzcGFuc1tlLmldO1xuICAgIGNvbnN0IGRzdFNsYWNrOiBTcGFuID0gc3BhbnNbZS5qXTtcbiAgICBjb25zdCBzcmNUYXNrOiBUYXNrID0gdGFza3NbZS5pXTtcbiAgICBjb25zdCBkc3RUYXNrOiBUYXNrID0gdGFza3NbZS5qXTtcbiAgICBjb25zdCBzcmNSb3cgPSB0YXNrSW5kZXhUb1Jvdy5nZXQoZS5pKSE7XG4gICAgY29uc3QgZHN0Um93ID0gdGFza0luZGV4VG9Sb3cuZ2V0KGUuaikhO1xuICAgIGNvbnN0IHNyY0RheSA9IHNyY1NsYWNrLmZpbmlzaDtcbiAgICBjb25zdCBkc3REYXkgPSBkc3RTbGFjay5zdGFydDtcblxuICAgIGlmIChcbiAgICAgIG9wdHMudGFza0hpZ2hsaWdodHMuaW5jbHVkZXMoZS5pKSAmJlxuICAgICAgb3B0cy50YXNrSGlnaGxpZ2h0cy5pbmNsdWRlcyhlLmopXG4gICAgKSB7XG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VIaWdobGlnaHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZU11dGVkO1xuICAgIH1cblxuICAgIGRyYXdBcnJvd0JldHdlZW5UYXNrcyhcbiAgICAgIGN0eCxcbiAgICAgIHNyY0RheSxcbiAgICAgIGRzdERheSxcbiAgICAgIHNjYWxlLFxuICAgICAgc3JjUm93LFxuICAgICAgc3JjVGFzayxcbiAgICAgIGRzdFJvdyxcbiAgICAgIGRzdFRhc2ssXG4gICAgICBhcnJvd0hlYWRXaWR0aCxcbiAgICAgIGFycm93SGVhZEhlaWdodFxuICAgICk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBkcmF3UmFuZ2VPdmVybGF5KFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgc2NhbGU6IFNjYWxlLFxuICBiZWdpbkRheTogbnVtYmVyLFxuICBlbmREYXk6IG51bWJlcixcbiAgdG90YWxOdW1iZXJPZlJvd3M6IG51bWJlclxuKSB7XG4gIGNvbnN0IHRvcExlZnQgPSBzY2FsZS5mZWF0dXJlKDAsIGJlZ2luRGF5LCBGZWF0dXJlLmRpc3BsYXlSYW5nZVRvcCk7XG4gIGNvbnN0IGJvdHRvbVJpZ2h0ID0gc2NhbGUuZmVhdHVyZShcbiAgICB0b3RhbE51bWJlck9mUm93cyxcbiAgICBlbmREYXksXG4gICAgRmVhdHVyZS50YXNrUm93Qm90dG9tXG4gICk7XG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vdmVybGF5O1xuICBjdHguZmlsbFJlY3QoXG4gICAgdG9wTGVmdC54LFxuICAgIHRvcExlZnQueSxcbiAgICBib3R0b21SaWdodC54IC0gdG9wTGVmdC54LFxuICAgIGJvdHRvbVJpZ2h0LnkgLSB0b3BMZWZ0LnlcbiAgKTtcbiAgY29uc29sZS5sb2coXCJkcmF3UmFuZ2VPdmVybGF5XCIsIHRvcExlZnQsIGJvdHRvbVJpZ2h0KTtcbn1cblxuZnVuY3Rpb24gZHJhd0Fycm93QmV0d2VlblRhc2tzKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgc3JjRGF5OiBudW1iZXIsXG4gIGRzdERheTogbnVtYmVyLFxuICBzY2FsZTogU2NhbGUsXG4gIHNyY1JvdzogbnVtYmVyLFxuICBzcmNUYXNrOiBUYXNrLFxuICBkc3RSb3c6IG51bWJlcixcbiAgZHN0VGFzazogVGFzayxcbiAgYXJyb3dIZWFkV2lkdGg6IG51bWJlcixcbiAgYXJyb3dIZWFkSGVpZ2h0OiBudW1iZXJcbikge1xuICBpZiAoc3JjRGF5ID09PSBkc3REYXkpIHtcbiAgICAvLyBUT0RPIC0gT25jZSB3ZSBjYW4gcHJlc2VudCB0aGluZ3MgaW4gYW4gb3JkZXIgYmVzaWRlcyB0b3BvbG9naWNhbCBzb3J0LFxuICAgIC8vIGUuZy4gYWxsb3cgZ3JvdXBpbmcgaW50byBzd2ltbGFuZXMgYnkgcmVzb3VyY2UsIHRoZW4gdGhlc2UgYXJyb3dzIG1pZ2h0XG4gICAgLy8gc3RhcnQgcG9pbnRpbmcgdXAsIHNvIGJvdGggdGhlIGFycm93IHN0YXJ0IGFuZCBhcnJvdyBoZWFkIGRpcmVjdGlvblxuICAgIC8vIG1pZ2h0IGNoYW5nZSBhbmQgbmVlZCB0byBkZXBlbmQgb24gdGhlIGRpcmVjdGlvbiBmcm9tIHNyY1JvdyB0byBkc3RSb3cuXG4gICAgZHJhd1ZlcnRpY2FsQXJyb3dUb1Rhc2soXG4gICAgICBjdHgsXG4gICAgICBzY2FsZSxcbiAgICAgIHNyY1JvdyxcbiAgICAgIHNyY0RheSxcbiAgICAgIHNyY1Rhc2ssXG4gICAgICBkc3RSb3csXG4gICAgICBkc3REYXksXG4gICAgICBkc3RUYXNrLFxuICAgICAgYXJyb3dIZWFkV2lkdGgsXG4gICAgICBhcnJvd0hlYWRIZWlnaHRcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIGRyYXdMU2hhcGVkQXJyb3dUb1Rhc2soXG4gICAgICBjdHgsXG4gICAgICBzY2FsZSxcbiAgICAgIHNyY1JvdyxcbiAgICAgIHNyY0RheSxcbiAgICAgIHNyY1Rhc2ssXG4gICAgICBkc3RSb3csXG4gICAgICBkc3RUYXNrLFxuICAgICAgZHN0RGF5LFxuICAgICAgYXJyb3dIZWFkSGVpZ2h0LFxuICAgICAgYXJyb3dIZWFkV2lkdGhcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNsZWFyQ2FudmFzKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudFxuKSB7XG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5zdXJmYWNlO1xuICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gIGN0eC5maWxsUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xufVxuXG5mdW5jdGlvbiBzZXRGb250U2l6ZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgb3B0czogUmVuZGVyT3B0aW9ucykge1xuICBjdHguZm9udCA9IGAke29wdHMuZm9udFNpemVQeH1weCBzZXJpZmA7XG59XG5cbi8vIERyYXcgTCBzaGFwZWQgYXJyb3csIGZpcnN0IGdvaW5nIGJldHdlZW4gcm93cywgdGhlbiBnb2luZyBiZXR3ZWVuIGRheXMuXG5mdW5jdGlvbiBkcmF3TFNoYXBlZEFycm93VG9UYXNrKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgc2NhbGU6IFNjYWxlLFxuICBzcmNSb3c6IG51bWJlcixcbiAgc3JjRGF5OiBudW1iZXIsXG4gIHNyY1Rhc2s6IFRhc2ssXG4gIGRzdFJvdzogbnVtYmVyLFxuICBkc3RUYXNrOiBUYXNrLFxuICBkc3REYXk6IG51bWJlcixcbiAgYXJyb3dIZWFkSGVpZ2h0OiBudW1iZXIsXG4gIGFycm93SGVhZFdpZHRoOiBudW1iZXJcbikge1xuICAvLyBUT0RPIC0gT25jZSB3ZSBjYW4gcHJlc2VudCB0aGluZ3MgaW4gYW4gb3JkZXIgYmVzaWRlcyB0b3BvbG9naWNhbCBzb3J0LFxuICAvLyBlLmcuIGFsbG93IGdyb3VwaW5nIGludG8gc3dpbWxhbmVzIGJ5IHJlc291cmNlLCB0aGVuIHRoZSB2ZXJ0aWNhbFxuICAvLyBzZWN0aW9uIG9mIHRoZSBcIkxcIiBtaWdodCBzdGFydCBwb2ludGluZyB1cCwgc28gYm90aCB0aGVcbiAgLy8gdmVydGljYWxBcnJvd1N0YXJ0IGFuZCB2ZXJ0aWNhbEFycm93RGVzdCBsb2NhdGlvbnMgbWlnaHQgY2hhbmdlIGFuZFxuICAvLyBuZWVkIHRvIGRlcGVuZCBvbiB0aGUgZGlyZWN0aW9uIGZyb20gc3JjUm93IHRvIGRzdFJvdy5cblxuICAvLyBEcmF3IHZlcnRpY2FsIHBhcnQgb2YgdGhlIFwiTFwiLlxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGNvbnN0IGRpcmVjdGlvbjogRGlyZWN0aW9uID0gc3JjUm93IDwgZHN0Um93ID8gXCJkb3duXCIgOiBcInVwXCI7XG4gIGNvbnN0IHZlcnRMaW5lU3RhcnQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIHNyY1JvdyxcbiAgICBzcmNEYXksXG4gICAgdmVydGljYWxBcnJvd1N0YXJ0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24oc3JjVGFzaywgZGlyZWN0aW9uKVxuICApO1xuICBjb25zdCB2ZXJ0TGluZUVuZCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgZHN0Um93LFxuICAgIHNyY0RheSxcbiAgICBob3Jpem9udGFsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24oZHN0VGFzaylcbiAgKTtcbiAgY3R4Lm1vdmVUbyh2ZXJ0TGluZVN0YXJ0LnggKyAwLjUsIHZlcnRMaW5lU3RhcnQueSk7XG4gIGN0eC5saW5lVG8odmVydExpbmVTdGFydC54ICsgMC41LCB2ZXJ0TGluZUVuZC55KTtcblxuICAvLyBEcmF3IGhvcml6b250YWwgcGFydCBvZiB0aGUgXCJMXCIuXG4gIGNvbnN0IGhvcnpMaW5lU3RhcnQgPSB2ZXJ0TGluZUVuZDtcbiAgY29uc3QgaG9yekxpbmVFbmQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIGRzdFJvdyxcbiAgICBkc3REYXksXG4gICAgaG9yaXpvbnRhbEFycm93RGVzdEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uKGRzdFRhc2spXG4gICk7XG4gIGN0eC5tb3ZlVG8odmVydExpbmVTdGFydC54ICsgMC41LCBob3J6TGluZVN0YXJ0LnkpO1xuICBjdHgubGluZVRvKGhvcnpMaW5lRW5kLnggKyAwLjUsIGhvcnpMaW5lRW5kLnkpO1xuXG4gIC8vIERyYXcgdGhlIGFycm93aGVhZC4gVGhpcyBhcnJvdyBoZWFkIHdpbGwgYWx3YXlzIHBvaW50IHRvIHRoZSByaWdodFxuICAvLyBzaW5jZSB0aGF0J3MgaG93IHRpbWUgZmxvd3MuXG4gIGN0eC5tb3ZlVG8oaG9yekxpbmVFbmQueCArIDAuNSwgaG9yekxpbmVFbmQueSk7XG4gIGN0eC5saW5lVG8oXG4gICAgaG9yekxpbmVFbmQueCAtIGFycm93SGVhZEhlaWdodCArIDAuNSxcbiAgICBob3J6TGluZUVuZC55ICsgYXJyb3dIZWFkV2lkdGhcbiAgKTtcbiAgY3R4Lm1vdmVUbyhob3J6TGluZUVuZC54ICsgMC41LCBob3J6TGluZUVuZC55KTtcbiAgY3R4LmxpbmVUbyhcbiAgICBob3J6TGluZUVuZC54IC0gYXJyb3dIZWFkSGVpZ2h0ICsgMC41LFxuICAgIGhvcnpMaW5lRW5kLnkgLSBhcnJvd0hlYWRXaWR0aFxuICApO1xuICBjdHguc3Ryb2tlKCk7XG59XG5cbmZ1bmN0aW9uIGRyYXdWZXJ0aWNhbEFycm93VG9UYXNrKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgc2NhbGU6IFNjYWxlLFxuICBzcmNSb3c6IG51bWJlcixcbiAgc3JjRGF5OiBudW1iZXIsXG4gIHNyY1Rhc2s6IFRhc2ssXG4gIGRzdFJvdzogbnVtYmVyLFxuICBkc3REYXk6IG51bWJlcixcbiAgZHN0VGFzazogVGFzayxcbiAgYXJyb3dIZWFkV2lkdGg6IG51bWJlcixcbiAgYXJyb3dIZWFkSGVpZ2h0OiBudW1iZXJcbikge1xuICBjb25zdCBkaXJlY3Rpb246IERpcmVjdGlvbiA9IHNyY1JvdyA8IGRzdFJvdyA/IFwiZG93blwiIDogXCJ1cFwiO1xuICBjb25zdCBhcnJvd1N0YXJ0ID0gc2NhbGUuZmVhdHVyZShcbiAgICBzcmNSb3csXG4gICAgc3JjRGF5LFxuICAgIHZlcnRpY2FsQXJyb3dTdGFydEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uKHNyY1Rhc2ssIGRpcmVjdGlvbilcbiAgKTtcbiAgY29uc3QgYXJyb3dFbmQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIGRzdFJvdyxcbiAgICBkc3REYXksXG4gICAgdmVydGljYWxBcnJvd0Rlc3RGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbihkc3RUYXNrLCBkaXJlY3Rpb24pXG4gICk7XG5cbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHgubW92ZVRvKGFycm93U3RhcnQueCArIDAuNSwgYXJyb3dTdGFydC55KTtcbiAgY3R4LmxpbmVUbyhhcnJvd0VuZC54ICsgMC41LCBhcnJvd0VuZC55KTtcblxuICAvLyBEcmF3IHRoZSBhcnJvd2hlYWQuXG4gIGNvbnN0IGRlbHRhWSA9IGRpcmVjdGlvbiA9PT0gXCJkb3duXCIgPyAtYXJyb3dIZWFkSGVpZ2h0IDogYXJyb3dIZWFkSGVpZ2h0O1xuICBjdHgubW92ZVRvKGFycm93RW5kLnggKyAwLjUsIGFycm93RW5kLnkpO1xuICBjdHgubGluZVRvKGFycm93RW5kLnggLSBhcnJvd0hlYWRXaWR0aCArIDAuNSwgYXJyb3dFbmQueSArIGRlbHRhWSk7XG4gIGN0eC5tb3ZlVG8oYXJyb3dFbmQueCArIDAuNSwgYXJyb3dFbmQueSk7XG4gIGN0eC5saW5lVG8oYXJyb3dFbmQueCArIGFycm93SGVhZFdpZHRoICsgMC41LCBhcnJvd0VuZC55ICsgZGVsdGFZKTtcbiAgY3R4LnN0cm9rZSgpO1xufVxuXG5mdW5jdGlvbiBkcmF3VGFza1RleHQoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBzY2FsZTogU2NhbGUsXG4gIHJvdzogbnVtYmVyLFxuICBzcGFuOiBTcGFuLFxuICB0YXNrOiBUYXNrLFxuICB0YXNrSW5kZXg6IG51bWJlcixcbiAgY2xpcFdpZHRoOiBudW1iZXJcbikge1xuICBpZiAoIW9wdHMuaGFzVGV4dCkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBsYWJlbCA9IG9wdHMudGFza0xhYmVsKHRhc2tJbmRleCk7XG5cbiAgbGV0IHhTdGFydEluVGltZSA9IHNwYW4uc3RhcnQ7XG4gIGxldCB4UGl4ZWxEZWx0YSA9IDA7XG4gIC8vIERldGVybWluZSB3aGVyZSBvbiB0aGUgeC1heGlzIHRvIHN0YXJ0IGRyYXdpbmcgdGhlIHRhc2sgdGV4dC5cbiAgaWYgKG9wdHMuZGlzcGxheVJhbmdlICE9PSBudWxsICYmIG9wdHMuZGlzcGxheVJhbmdlVXNhZ2UgPT09IFwicmVzdHJpY3RcIikge1xuICAgIGlmIChvcHRzLmRpc3BsYXlSYW5nZS5pbihzcGFuLnN0YXJ0KSkge1xuICAgICAgeFN0YXJ0SW5UaW1lID0gc3Bhbi5zdGFydDtcbiAgICAgIHhQaXhlbERlbHRhID0gMDtcbiAgICB9IGVsc2UgaWYgKG9wdHMuZGlzcGxheVJhbmdlLmluKHNwYW4uZmluaXNoKSkge1xuICAgICAgeFN0YXJ0SW5UaW1lID0gc3Bhbi5maW5pc2g7XG4gICAgICBjb25zdCBtZWFzID0gY3R4Lm1lYXN1cmVUZXh0KGxhYmVsKTtcbiAgICAgIHhQaXhlbERlbHRhID0gLW1lYXMud2lkdGggLSAyICogc2NhbGUubWV0cmljKE1ldHJpYy50ZXh0WE9mZnNldCk7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHNwYW4uc3RhcnQgPCBvcHRzLmRpc3BsYXlSYW5nZS5iZWdpbiAmJlxuICAgICAgc3Bhbi5maW5pc2ggPiBvcHRzLmRpc3BsYXlSYW5nZS5lbmRcbiAgICApIHtcbiAgICAgIHhTdGFydEluVGltZSA9IG9wdHMuZGlzcGxheVJhbmdlLmJlZ2luO1xuICAgICAgeFBpeGVsRGVsdGEgPSBjbGlwV2lkdGggLyAyO1xuICAgIH1cbiAgfVxuICBjdHgubGluZVdpZHRoID0gMTtcbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY3R4LnRleHRCYXNlbGluZSA9IFwidG9wXCI7XG4gIGNvbnN0IHRleHRTdGFydCA9IHNjYWxlLmZlYXR1cmUocm93LCB4U3RhcnRJblRpbWUsIEZlYXR1cmUudGV4dFN0YXJ0KTtcbiAgY3R4LmZpbGxUZXh0KFxuICAgIG9wdHMudGFza0xhYmVsKHRhc2tJbmRleCksXG4gICAgdGV4dFN0YXJ0LnggKyB4UGl4ZWxEZWx0YSxcbiAgICB0ZXh0U3RhcnQueVxuICApO1xufVxuXG5mdW5jdGlvbiBkcmF3VGFza0JhcihcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHRhc2tTdGFydDogUG9pbnQsXG4gIHRhc2tFbmQ6IFBvaW50LFxuICB0YXNrTGluZUhlaWdodDogbnVtYmVyXG4pIHtcbiAgY3R4LmZpbGxSZWN0KFxuICAgIHRhc2tTdGFydC54LFxuICAgIHRhc2tTdGFydC55LFxuICAgIHRhc2tFbmQueCAtIHRhc2tTdGFydC54LFxuICAgIHRhc2tMaW5lSGVpZ2h0XG4gICk7XG59XG5cbmZ1bmN0aW9uIGRyYXdNaWxlc3RvbmUoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICB0YXNrU3RhcnQ6IFBvaW50LFxuICBkaWFtb25kRGlhbWV0ZXI6IG51bWJlcixcbiAgcGVyY2VudEhlaWdodDogbnVtYmVyXG4pIHtcbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHgubGluZVdpZHRoID0gcGVyY2VudEhlaWdodCAvIDI7XG4gIGN0eC5tb3ZlVG8odGFza1N0YXJ0LngsIHRhc2tTdGFydC55IC0gZGlhbW9uZERpYW1ldGVyKTtcbiAgY3R4LmxpbmVUbyh0YXNrU3RhcnQueCArIGRpYW1vbmREaWFtZXRlciwgdGFza1N0YXJ0LnkpO1xuICBjdHgubGluZVRvKHRhc2tTdGFydC54LCB0YXNrU3RhcnQueSArIGRpYW1vbmREaWFtZXRlcik7XG4gIGN0eC5saW5lVG8odGFza1N0YXJ0LnggLSBkaWFtb25kRGlhbWV0ZXIsIHRhc2tTdGFydC55KTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xuICBjdHguc3Ryb2tlKCk7XG59XG5cbmNvbnN0IGRyYXdUaW1lTWFya2VyQXREYXlUb1Rhc2sgPSAoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICByb3c6IG51bWJlcixcbiAgZGF5OiBudW1iZXIsXG4gIHRhc2s6IFRhc2ssXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIHNjYWxlOiBTY2FsZSxcbiAgZGF5c1dpdGhUaW1lTWFya2VyczogU2V0PG51bWJlcj5cbikgPT4ge1xuICBpZiAoZGF5c1dpdGhUaW1lTWFya2Vycy5oYXMoZGF5KSkge1xuICAgIHJldHVybjtcbiAgfVxuICBkYXlzV2l0aFRpbWVNYXJrZXJzLmFkZChkYXkpO1xuICBjb25zdCB0aW1lTWFya1N0YXJ0ID0gc2NhbGUuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS50aW1lTWFya1N0YXJ0KTtcbiAgY29uc3QgdGltZU1hcmtFbmQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIHJvdyxcbiAgICBkYXksXG4gICAgdmVydGljYWxBcnJvd0Rlc3RGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbih0YXNrLCBcImRvd25cIilcbiAgKTtcbiAgY3R4LmxpbmVXaWR0aCA9IDE7XG5cbiAgY3R4LnNldExpbmVEYXNoKFtcbiAgICBzY2FsZS5tZXRyaWMoTWV0cmljLmxpbmVEYXNoTGluZSksXG4gICAgc2NhbGUubWV0cmljKE1ldHJpYy5saW5lRGFzaEdhcCksXG4gIF0pO1xuICBjdHgubW92ZVRvKHRpbWVNYXJrU3RhcnQueCArIDAuNSwgdGltZU1hcmtTdGFydC55KTtcbiAgY3R4LmxpbmVUbyh0aW1lTWFya1N0YXJ0LnggKyAwLjUsIHRpbWVNYXJrRW5kLnkpO1xuICBjdHguc3Ryb2tlKCk7XG5cbiAgY3R4LnNldExpbmVEYXNoKFtdKTtcblxuICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICBjdHgudGV4dEJhc2VsaW5lID0gXCJ0b3BcIjtcbiAgY29uc3QgdGV4dFN0YXJ0ID0gc2NhbGUuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS50aW1lVGV4dFN0YXJ0KTtcbiAgaWYgKG9wdHMuaGFzVGV4dCAmJiBvcHRzLmhhc1RpbWVsaW5lKSB7XG4gICAgY3R4LmZpbGxUZXh0KGAke2RheX1gLCB0ZXh0U3RhcnQueCwgdGV4dFN0YXJ0LnkpO1xuICB9XG59O1xuXG4vKiogUmVwcmVzZW50cyBhIGhhbGYtb3BlbiBpbnRlcnZhbCBvZiByb3dzLCBlLmcuIFtzdGFydCwgZmluaXNoKS4gKi9cbmludGVyZmFjZSBSb3dSYW5nZSB7XG4gIHN0YXJ0OiBudW1iZXI7XG4gIGZpbmlzaDogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgVGFza0luZGV4VG9Sb3dSZXR1cm4ge1xuICB0YXNrSW5kZXhUb1JvdzogVGFza0luZGV4VG9Sb3c7XG5cbiAgLyoqIE1hcHMgZWFjaCByZXNvdXJjZSB2YWx1ZSBpbmRleCB0byBhIHJhbmdlIG9mIHJvd3MuICovXG4gIHJvd1JhbmdlczogTWFwPG51bWJlciwgUm93UmFuZ2U+IHwgbnVsbDtcblxuICByZXNvdXJjZURlZmluaXRpb246IFJlc291cmNlRGVmaW5pdGlvbiB8IG51bGw7XG59XG5cbmNvbnN0IHRhc2tJbmRleFRvUm93RnJvbUdyb3VwQnkgPSAoXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIHBsYW46IFBsYW5cbik6IFJlc3VsdDxUYXNrSW5kZXhUb1Jvd1JldHVybj4gPT4ge1xuICBjb25zdCB2cmV0ID0gdmFsaWRhdGVDaGFydChwbGFuLmNoYXJ0KTtcbiAgaWYgKCF2cmV0Lm9rKSB7XG4gICAgcmV0dXJuIHZyZXQ7XG4gIH1cbiAgY29uc3QgdG9wb2xvZ2ljYWxPcmRlciA9IHZyZXQudmFsdWU7XG5cbiAgY29uc3QgcmVzb3VyY2UgPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbihvcHRzLmdyb3VwQnlSZXNvdXJjZSk7XG5cbiAgLy8gdG9wb2xvZ2ljYWxPcmRlciBtYXBzIGZyb20gcm93IHRvIHRhc2sgaW5kZXgsIHRoaXMgd2lsbCBwcm9kdWNlIHRoZSBpbnZlcnNlIG1hcHBpbmcuXG4gIGNvbnN0IHRhc2tJbmRleFRvUm93ID0gbmV3IE1hcChcbiAgICAvLyBUaGlzIGxvb2tzIGJhY2t3YXJkcywgYnV0IGl0IGlzbid0LiBSZW1lbWJlciB0aGF0IHRoZSBtYXAgY2FsbGJhY2sgdGFrZXNcbiAgICAvLyAodmFsdWUsIGluZGV4KSBhcyBpdHMgYXJndW1lbnRzLlxuICAgIHRvcG9sb2dpY2FsT3JkZXIubWFwKCh0YXNrSW5kZXg6IG51bWJlciwgcm93OiBudW1iZXIpID0+IFt0YXNrSW5kZXgsIHJvd10pXG4gICk7XG5cbiAgaWYgKHJlc291cmNlID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gb2soe1xuICAgICAgdGFza0luZGV4VG9Sb3c6IHRhc2tJbmRleFRvUm93LFxuICAgICAgcm93UmFuZ2VzOiBudWxsLFxuICAgICAgcmVzb3VyY2VEZWZpbml0aW9uOiBudWxsLFxuICAgIH0pO1xuICB9XG5cbiAgY29uc3Qgc3RhcnRUYXNrSW5kZXggPSAwO1xuICBjb25zdCBmaW5pc2hUYXNrSW5kZXggPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDE7XG4gIGNvbnN0IGlnbm9yYWJsZSA9IFtzdGFydFRhc2tJbmRleCwgZmluaXNoVGFza0luZGV4XTtcblxuICAvLyBHcm91cCBhbGwgdGFza3MgYnkgdGhlaXIgcmVzb3VyY2UgdmFsdWUsIHdoaWxlIHByZXNlcnZpbmcgdG9wb2xvZ2ljYWxcbiAgLy8gb3JkZXIgd2l0aCB0aGUgZ3JvdXBzLlxuICBjb25zdCBncm91cHMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyW10+KCk7XG4gIHRvcG9sb2dpY2FsT3JkZXIuZm9yRWFjaCgodGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCByZXNvdXJjZVZhbHVlID1cbiAgICAgIHBsYW4uY2hhcnQuVmVydGljZXNbdGFza0luZGV4XS5nZXRSZXNvdXJjZShvcHRzLmdyb3VwQnlSZXNvdXJjZSkgfHwgXCJcIjtcbiAgICBjb25zdCBncm91cE1lbWJlcnMgPSBncm91cHMuZ2V0KHJlc291cmNlVmFsdWUpIHx8IFtdO1xuICAgIGdyb3VwTWVtYmVycy5wdXNoKHRhc2tJbmRleCk7XG4gICAgZ3JvdXBzLnNldChyZXNvdXJjZVZhbHVlLCBncm91cE1lbWJlcnMpO1xuICB9KTtcblxuICBjb25zdCByZXQgPSBuZXcgTWFwPG51bWJlciwgbnVtYmVyPigpO1xuXG4gIC8vIFVnaCwgU3RhcnQgYW5kIEZpbmlzaCBUYXNrcyBuZWVkIHRvIGJlIG1hcHBlZCwgYnV0IHNob3VsZCBub3QgYmUgZG9uZSB2aWFcbiAgLy8gcmVzb3VyY2UgdmFsdWUsIHNvIFN0YXJ0IHNob3VsZCBhbHdheXMgYmUgZmlyc3QuXG4gIHJldC5zZXQoMCwgMCk7XG5cbiAgLy8gTm93IGluY3JlbWVudCB1cCB0aGUgcm93cyBhcyB3ZSBtb3ZlIHRocm91Z2ggYWxsIHRoZSBncm91cHMuXG4gIGxldCByb3cgPSAxO1xuICAvLyBBbmQgdHJhY2sgaG93IG1hbnkgcm93cyBhcmUgaW4gZWFjaCBncm91cC5cbiAgY29uc3Qgcm93UmFuZ2VzOiBNYXA8bnVtYmVyLCBSb3dSYW5nZT4gPSBuZXcgTWFwKCk7XG4gIHJlc291cmNlLnZhbHVlcy5mb3JFYWNoKChyZXNvdXJjZVZhbHVlOiBzdHJpbmcsIHJlc291cmNlSW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHN0YXJ0T2ZSb3cgPSByb3c7XG4gICAgKGdyb3Vwcy5nZXQocmVzb3VyY2VWYWx1ZSkgfHwgW10pLmZvckVhY2goKHRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBpZiAoaWdub3JhYmxlLmluY2x1ZGVzKHRhc2tJbmRleCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmV0LnNldCh0YXNrSW5kZXgsIHJvdyk7XG4gICAgICByb3crKztcbiAgICB9KTtcbiAgICByb3dSYW5nZXMuc2V0KHJlc291cmNlSW5kZXgsIHsgc3RhcnQ6IHN0YXJ0T2ZSb3csIGZpbmlzaDogcm93IH0pO1xuICB9KTtcbiAgcmV0LnNldChmaW5pc2hUYXNrSW5kZXgsIHJvdyk7XG5cbiAgcmV0dXJuIG9rKHtcbiAgICB0YXNrSW5kZXhUb1JvdzogcmV0LFxuICAgIHJvd1Jhbmdlczogcm93UmFuZ2VzLFxuICAgIHJlc291cmNlRGVmaW5pdGlvbjogcmVzb3VyY2UsXG4gIH0pO1xufTtcblxuY29uc3QgZHJhd1N3aW1MYW5lSGlnaGxpZ2h0cyA9IChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHNjYWxlOiBTY2FsZSxcbiAgcm93UmFuZ2VzOiBNYXA8bnVtYmVyLCBSb3dSYW5nZT4sXG4gIHRvdGFsTnVtYmVyT2ZEYXlzOiBudW1iZXIsXG4gIGdyb3VwQ29sb3I6IHN0cmluZ1xuKSA9PiB7XG4gIGN0eC5maWxsU3R5bGUgPSBncm91cENvbG9yO1xuXG4gIGxldCBncm91cCA9IDA7XG4gIHJvd1Jhbmdlcy5mb3JFYWNoKChyb3dSYW5nZTogUm93UmFuZ2UpID0+IHtcbiAgICBjb25zdCB0b3BMZWZ0ID0gc2NhbGUuZmVhdHVyZShcbiAgICAgIHJvd1JhbmdlLnN0YXJ0LFxuICAgICAgMCxcbiAgICAgIEZlYXR1cmUuZ3JvdXBFbnZlbG9wZVN0YXJ0XG4gICAgKTtcbiAgICBjb25zdCBib3R0b21SaWdodCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgICByb3dSYW5nZS5maW5pc2gsXG4gICAgICB0b3RhbE51bWJlck9mRGF5cyArIDEsXG4gICAgICBGZWF0dXJlLnRhc2tFbnZlbG9wZVRvcFxuICAgICk7XG4gICAgZ3JvdXArKztcbiAgICAvLyBPbmx5IGhpZ2hsaWdodCBldmVyeSBvdGhlciBncm91cCBiYWNrZ3JvdWQgd2l0aCB0aGUgZ3JvdXBDb2xvci5cbiAgICBpZiAoZ3JvdXAgJSAyID09IDEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY3R4LmZpbGxSZWN0KFxuICAgICAgdG9wTGVmdC54LFxuICAgICAgdG9wTGVmdC55LFxuICAgICAgYm90dG9tUmlnaHQueCAtIHRvcExlZnQueCxcbiAgICAgIGJvdHRvbVJpZ2h0LnkgLSB0b3BMZWZ0LnlcbiAgICApO1xuICB9KTtcbn07XG5cbmNvbnN0IGRyYXdTd2ltTGFuZUxhYmVscyA9IChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIHJlc291cmNlRGVmaW5pdGlvbjogUmVzb3VyY2VEZWZpbml0aW9uLFxuICBzY2FsZTogU2NhbGUsXG4gIHJvd1JhbmdlczogTWFwPG51bWJlciwgUm93UmFuZ2U+XG4pID0+IHtcbiAgaWYgKHJvd1JhbmdlcykgY3R4LmxpbmVXaWR0aCA9IDE7XG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gIGNvbnN0IGdyb3VwQnlPcmlnaW4gPSBzY2FsZS5mZWF0dXJlKDAsIDAsIEZlYXR1cmUuZ3JvdXBCeU9yaWdpbik7XG5cbiAgaWYgKG9wdHMuaGFzVGltZWxpbmUpIHtcbiAgICBjdHgudGV4dEJhc2VsaW5lID0gXCJib3R0b21cIjtcbiAgICBjdHguZmlsbFRleHQob3B0cy5ncm91cEJ5UmVzb3VyY2UsIGdyb3VwQnlPcmlnaW4ueCwgZ3JvdXBCeU9yaWdpbi55KTtcbiAgfVxuXG4gIGlmIChvcHRzLmhhc1Rhc2tzKSB7XG4gICAgY3R4LnRleHRCYXNlbGluZSA9IFwidG9wXCI7XG4gICAgcm93UmFuZ2VzLmZvckVhY2goKHJvd1JhbmdlOiBSb3dSYW5nZSwgcmVzb3VyY2VJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBpZiAocm93UmFuZ2Uuc3RhcnQgPT09IHJvd1JhbmdlLmZpbmlzaCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCB0ZXh0U3RhcnQgPSBzY2FsZS5mZWF0dXJlKFxuICAgICAgICByb3dSYW5nZS5zdGFydCxcbiAgICAgICAgMCxcbiAgICAgICAgRmVhdHVyZS5ncm91cFRleHRTdGFydFxuICAgICAgKTtcbiAgICAgIGN0eC5maWxsVGV4dChcbiAgICAgICAgcmVzb3VyY2VEZWZpbml0aW9uLnZhbHVlc1tyZXNvdXJjZUluZGV4XSxcbiAgICAgICAgdGV4dFN0YXJ0LngsXG4gICAgICAgIHRleHRTdGFydC55XG4gICAgICApO1xuICAgIH0pO1xuICB9XG59O1xuIiwgImltcG9ydCB7IFJlc3VsdCwgb2ssIGVycm9yIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgVGFzaywgQ2hhcnQsIENoYXJ0VmFsaWRhdGUgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IERpcmVjdGVkRWRnZSwgZWRnZXNCeVNyY0FuZERzdFRvTWFwIH0gZnJvbSBcIi4uL2RhZy9kYWcudHNcIjtcbmltcG9ydCB7IFJvdW5kZXIgfSBmcm9tIFwiLi4vdHlwZXMvdHlwZXMudHNcIjtcblxuLyoqIFNwYW4gcmVwcmVzZW50cyB3aGVuIGEgdGFzayB3aWxsIGJlIGRvbmUsIGkuZS4gaXQgY29udGFpbnMgdGhlIHRpbWUgdGhlIHRhc2tcbiAqIGlzIGV4cGVjdGVkIHRvIGJlZ2luIGFuZCBlbmQuICovXG5leHBvcnQgY2xhc3MgU3BhbiB7XG4gIHN0YXJ0OiBudW1iZXIgPSAwO1xuICBmaW5pc2g6IG51bWJlciA9IDA7XG59XG5cbi8qKiBUaGUgc3RhbmRhcmQgc2xhY2sgY2FsY3VsYXRpb24gdmFsdWVzLiAqL1xuZXhwb3J0IGNsYXNzIFNsYWNrIHtcbiAgZWFybHk6IFNwYW4gPSBuZXcgU3BhbigpO1xuICBsYXRlOiBTcGFuID0gbmV3IFNwYW4oKTtcbiAgc2xhY2s6IG51bWJlciA9IDA7XG59XG5cbmNvbnN0IHJvdW5kU3BhbiA9IChzcGFuOiBTcGFuLCByb3VuZDogUm91bmRlcikgPT4ge1xuICBzcGFuLnN0YXJ0ID0gcm91bmQoc3Bhbi5zdGFydCk7XG4gIHNwYW4uZmluaXNoID0gcm91bmQoc3Bhbi5maW5pc2gpO1xufTtcblxuY29uc3Qgcm91bmRTbGFjayA9IChzbGFjazogU2xhY2ssIHJvdW5kOiBSb3VuZGVyKSA9PiB7XG4gIHNsYWNrLnNsYWNrID0gcm91bmQoc2xhY2suc2xhY2spO1xuICByb3VuZFNwYW4oc2xhY2suZWFybHksIHJvdW5kKTtcbiAgcm91bmRTcGFuKHNsYWNrLmxhdGUsIHJvdW5kKTtcbn07XG5cbmV4cG9ydCB0eXBlIFRhc2tEdXJhdGlvbiA9ICh0OiBUYXNrLCB0YXNrSW5kZXg6IG51bWJlcikgPT4gbnVtYmVyO1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdFRhc2tEdXJhdGlvbiA9ICh0OiBUYXNrKTogbnVtYmVyID0+IHtcbiAgcmV0dXJuIHQuZHVyYXRpb247XG59O1xuXG5leHBvcnQgdHlwZSBTbGFja1Jlc3VsdCA9IFJlc3VsdDxTbGFja1tdPjtcblxuLy8gQ2FsY3VsYXRlIHRoZSBzbGFjayBmb3IgZWFjaCBUYXNrIGluIHRoZSBDaGFydC5cbmV4cG9ydCBmdW5jdGlvbiBDb21wdXRlU2xhY2soXG4gIGM6IENoYXJ0LFxuICB0YXNrRHVyYXRpb246IFRhc2tEdXJhdGlvbiA9IGRlZmF1bHRUYXNrRHVyYXRpb24sXG4gIHJvdW5kOiBSb3VuZGVyXG4pOiBTbGFja1Jlc3VsdCB7XG4gIC8vIENyZWF0ZSBhIFNsYWNrIGZvciBlYWNoIFRhc2suXG4gIGNvbnN0IHNsYWNrczogU2xhY2tbXSA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGMuVmVydGljZXMubGVuZ3RoOyBpKyspIHtcbiAgICBzbGFja3MucHVzaChuZXcgU2xhY2soKSk7XG4gIH1cblxuICBjb25zdCByID0gQ2hhcnRWYWxpZGF0ZShjKTtcbiAgaWYgKCFyLm9rKSB7XG4gICAgcmV0dXJuIGVycm9yKHIuZXJyb3IpO1xuICB9XG5cbiAgY29uc3QgZWRnZXMgPSBlZGdlc0J5U3JjQW5kRHN0VG9NYXAoYy5FZGdlcyk7XG5cbiAgY29uc3QgdG9wb2xvZ2ljYWxPcmRlciA9IHIudmFsdWU7XG5cbiAgLy8gRmlyc3QgZ28gZm9yd2FyZCB0aHJvdWdoIHRoZSB0b3BvbG9naWNhbCBzb3J0IGFuZCBmaW5kIHRoZSBlYXJseSBzdGFydCBmb3JcbiAgLy8gZWFjaCB0YXNrLCB3aGljaCBpcyB0aGUgbWF4IG9mIGFsbCB0aGUgcHJlZGVjZXNzb3JzIGVhcmx5IGZpbmlzaCB2YWx1ZXMuXG4gIC8vIFNpbmNlIHdlIGtub3cgdGhlIGR1cmF0aW9uIHdlIGNhbiBhbHNvIGNvbXB1dGUgdGhlIGVhcmx5IGZpbmlzaC5cbiAgdG9wb2xvZ2ljYWxPcmRlci5zbGljZSgxKS5mb3JFYWNoKCh2ZXJ0ZXhJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgY29uc3QgdGFzayA9IGMuVmVydGljZXNbdmVydGV4SW5kZXhdO1xuICAgIGNvbnN0IHNsYWNrID0gc2xhY2tzW3ZlcnRleEluZGV4XTtcbiAgICBzbGFjay5lYXJseS5zdGFydCA9IE1hdGgubWF4KFxuICAgICAgLi4uZWRnZXMuYnlEc3QuZ2V0KHZlcnRleEluZGV4KSEubWFwKChlOiBEaXJlY3RlZEVkZ2UpOiBudW1iZXIgPT4ge1xuICAgICAgICBjb25zdCBwcmVkZWNlc3NvclNsYWNrID0gc2xhY2tzW2UuaV07XG4gICAgICAgIHJldHVybiBwcmVkZWNlc3NvclNsYWNrLmVhcmx5LmZpbmlzaDtcbiAgICAgIH0pXG4gICAgKTtcbiAgICBzbGFjay5lYXJseS5maW5pc2ggPSByb3VuZChcbiAgICAgIHNsYWNrLmVhcmx5LnN0YXJ0ICsgdGFza0R1cmF0aW9uKHRhc2ssIHZlcnRleEluZGV4KVxuICAgICk7XG4gIH0pO1xuXG4gIC8vIE5vdyBiYWNrd2FyZHMgdGhyb3VnaCB0aGUgdG9wb2xvZ2ljYWwgc29ydCBhbmQgZmluZCB0aGUgbGF0ZSBmaW5pc2ggb2YgZWFjaFxuICAvLyB0YXNrLCB3aGljaCBpcyB0aGUgbWluIG9mIGFsbCB0aGUgc3VjY2Vzc29yIHRhc2tzIGxhdGUgc3RhcnRzLiBBZ2FpbiBzaW5jZVxuICAvLyB3ZSBrbm93IHRoZSBkdXJhdGlvbiB3ZSBjYW4gYWxzbyBjb21wdXRlIHRoZSBsYXRlIHN0YXJ0LiBGaW5hbGx5LCBzaW5jZSB3ZVxuICAvLyBub3cgaGF2ZSBhbGwgdGhlIGVhcmx5L2xhdGUgYW5kIHN0YXJ0L2ZpbmlzaCB2YWx1ZXMgd2UgY2FuIG5vdyBjYWxjdWF0ZSB0aGVcbiAgLy8gc2xhY2suXG4gIHRvcG9sb2dpY2FsT3JkZXIucmV2ZXJzZSgpLmZvckVhY2goKHZlcnRleEluZGV4OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCB0YXNrID0gYy5WZXJ0aWNlc1t2ZXJ0ZXhJbmRleF07XG4gICAgY29uc3Qgc2xhY2sgPSBzbGFja3NbdmVydGV4SW5kZXhdO1xuICAgIGNvbnN0IHN1Y2Nlc3NvcnMgPSBlZGdlcy5ieVNyYy5nZXQodmVydGV4SW5kZXgpO1xuICAgIGlmICghc3VjY2Vzc29ycykge1xuICAgICAgc2xhY2subGF0ZS5maW5pc2ggPSBzbGFjay5lYXJseS5maW5pc2g7XG4gICAgICBzbGFjay5sYXRlLnN0YXJ0ID0gc2xhY2suZWFybHkuc3RhcnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNsYWNrLmxhdGUuZmluaXNoID0gTWF0aC5taW4oXG4gICAgICAgIC4uLmVkZ2VzLmJ5U3JjLmdldCh2ZXJ0ZXhJbmRleCkhLm1hcCgoZTogRGlyZWN0ZWRFZGdlKTogbnVtYmVyID0+IHtcbiAgICAgICAgICBjb25zdCBzdWNjZXNzb3JTbGFjayA9IHNsYWNrc1tlLmpdO1xuICAgICAgICAgIHJldHVybiBzdWNjZXNzb3JTbGFjay5sYXRlLnN0YXJ0O1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICAgIHNsYWNrLmxhdGUuc3RhcnQgPSByb3VuZChcbiAgICAgICAgc2xhY2subGF0ZS5maW5pc2ggLSB0YXNrRHVyYXRpb24odGFzaywgdmVydGV4SW5kZXgpXG4gICAgICApO1xuICAgICAgcm91bmRTcGFuKHNsYWNrLmxhdGUsIHJvdW5kKTtcbiAgICAgIHJvdW5kU3BhbihzbGFjay5lYXJseSwgcm91bmQpO1xuICAgICAgc2xhY2suc2xhY2sgPSByb3VuZChzbGFjay5sYXRlLmZpbmlzaCAtIHNsYWNrLmVhcmx5LmZpbmlzaCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gb2soc2xhY2tzKTtcbn1cblxuZXhwb3J0IGNvbnN0IENyaXRpY2FsUGF0aCA9IChzbGFja3M6IFNsYWNrW10sIHJvdW5kOiBSb3VuZGVyKTogbnVtYmVyW10gPT4ge1xuICBjb25zdCByZXQ6IG51bWJlcltdID0gW107XG4gIHNsYWNrcy5mb3JFYWNoKChzbGFjazogU2xhY2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICBpZiAoXG4gICAgICByb3VuZChzbGFjay5sYXRlLmZpbmlzaCAtIHNsYWNrLmVhcmx5LmZpbmlzaCkgPCBOdW1iZXIuRVBTSUxPTiAmJlxuICAgICAgcm91bmQoc2xhY2suZWFybHkuZmluaXNoIC0gc2xhY2suZWFybHkuc3RhcnQpID4gTnVtYmVyLkVQU0lMT05cbiAgICApIHtcbiAgICAgIHJldC5wdXNoKGluZGV4KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmV0O1xufTtcbiIsICIvLyBXaGVuIGFkZGluZyBwcm9wZXJ0aWVzIHRvIENvbG9yVGhlbWUgYWxzbyBtYWtlIHN1cmUgdG8gYWRkIGEgY29ycmVzcG9uZGluZ1xuLy8gQ1NTIEBwcm9wZXJ0eSBkZWNsYXJhdGlvbi5cbi8vXG4vLyBOb3RlIHRoYXQgZWFjaCBwcm9wZXJ0eSBhc3N1bWVzIHRoZSBwcmVzZW5jZSBvZiBhIENTUyB2YXJpYWJsZSBvZiB0aGUgc2FtZSBuYW1lXG4vLyB3aXRoIGEgcHJlY2VlZGluZyBgLS1gLlxuZXhwb3J0IGludGVyZmFjZSBUaGVtZSB7XG4gIHN1cmZhY2U6IHN0cmluZztcbiAgb25TdXJmYWNlOiBzdHJpbmc7XG4gIG9uU3VyZmFjZU11dGVkOiBzdHJpbmc7XG4gIG9uU3VyZmFjZVNlY29uZGFyeTogc3RyaW5nO1xuICBvdmVybGF5OiBzdHJpbmc7XG4gIGdyb3VwQ29sb3I6IHN0cmluZztcbn1cblxudHlwZSBUaGVtZVByb3AgPSBrZXlvZiBUaGVtZTtcblxuY29uc3QgY29sb3JUaGVtZVByb3RvdHlwZTogVGhlbWUgPSB7XG4gIHN1cmZhY2U6IFwiXCIsXG4gIG9uU3VyZmFjZTogXCJcIixcbiAgb25TdXJmYWNlTXV0ZWQ6IFwiXCIsXG4gIG9uU3VyZmFjZVNlY29uZGFyeTogXCJcIixcbiAgb3ZlcmxheTogXCJcIixcbiAgZ3JvdXBDb2xvcjogXCJcIixcbn07XG5cbmV4cG9ydCBjb25zdCBjb2xvclRoZW1lRnJvbUVsZW1lbnQgPSAoZWxlOiBIVE1MRWxlbWVudCk6IFRoZW1lID0+IHtcbiAgY29uc3Qgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsZSk7XG4gIGNvbnN0IHJldCA9IE9iamVjdC5hc3NpZ24oe30sIGNvbG9yVGhlbWVQcm90b3R5cGUpO1xuICBPYmplY3Qua2V5cyhyZXQpLmZvckVhY2goKG5hbWU6IHN0cmluZykgPT4ge1xuICAgIHJldFtuYW1lIGFzIFRoZW1lUHJvcF0gPSBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKGAtLSR7bmFtZX1gKTtcbiAgfSk7XG4gIHJldHVybiByZXQ7XG59O1xuIiwgIi8qKiBXaGVuIHRoZSBnaXZlbiBlbGVtZW50IGlzIGNsaWNrZWQsIHRoZW4gdG9nZ2xlIHRoZSBgZGFya21vZGVgIGNsYXNzIG9uIHRoZVxuICogYm9keSBlbGVtZW50LiAqL1xuZXhwb3J0IGNvbnN0IHRvZ2dsZVRoZW1lID0gKCkgPT4ge1xuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoXCJkYXJrbW9kZVwiKTtcbn07XG4iLCAiaW1wb3J0IHsgVGFzayB9IGZyb20gXCIuL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBlZGdlc0J5U3JjQW5kRHN0VG9NYXAgfSBmcm9tIFwiLi9kYWcvZGFnLnRzXCI7XG5pbXBvcnQge1xuICBEdXBUYXNrT3AsXG4gIEluc2VydE5ld0VtcHR5VGFza0FmdGVyT3AsXG4gIFNldFRhc2tOYW1lT3AsXG4gIFNwbGl0VGFza09wLFxufSBmcm9tIFwiLi9vcHMvY2hhcnQudHNcIjtcbmltcG9ydCB7IFNldE1ldHJpY1ZhbHVlT3AgfSBmcm9tIFwiLi9vcHMvbWV0cmljcy50c1wiO1xuaW1wb3J0IHsgT3AsIGFwcGx5QWxsT3BzVG9QbGFuIH0gZnJvbSBcIi4vb3BzL29wcy50c1wiO1xuaW1wb3J0IHtcbiAgQWRkUmVzb3VyY2VPcCxcbiAgQWRkUmVzb3VyY2VPcHRpb25PcCxcbiAgU2V0UmVzb3VyY2VWYWx1ZU9wLFxufSBmcm9tIFwiLi9vcHMvcmVzb3VyY2VzLnRzXCI7XG5pbXBvcnQgeyBGcm9tSlNPTiwgUGxhbiB9IGZyb20gXCIuL3BsYW4vcGxhbi50c1wiO1xuaW1wb3J0IHsgUHJlY2lzaW9uIH0gZnJvbSBcIi4vcHJlY2lzaW9uL3ByZWNpc2lvbi50c1wiO1xuaW1wb3J0IHtcbiAgRFJBR19SQU5HRV9FVkVOVCxcbiAgRHJhZ1JhbmdlLFxuICBNb3VzZU1vdmUsXG59IGZyb20gXCIuL3JlbmRlcmVyL21vdXNlbW92ZS9tb3VzZW1vdmUudHNcIjtcbmltcG9ydCB7IERpc3BsYXlSYW5nZSB9IGZyb20gXCIuL3JlbmRlcmVyL3JhbmdlL3JhbmdlLnRzXCI7XG5pbXBvcnQge1xuICBSZW5kZXJPcHRpb25zLFxuICBUYXNrTGFiZWwsXG4gIHJlbmRlclRhc2tzVG9DYW52YXMsXG4gIHN1Z2dlc3RlZENhbnZhc0hlaWdodCxcbn0gZnJvbSBcIi4vcmVuZGVyZXIvcmVuZGVyZXIudHNcIjtcbmltcG9ydCB7IFNjYWxlIH0gZnJvbSBcIi4vcmVuZGVyZXIvc2NhbGUvc2NhbGUudHNcIjtcbmltcG9ydCB7IFJlc3VsdCB9IGZyb20gXCIuL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgQ29tcHV0ZVNsYWNrLCBDcml0aWNhbFBhdGgsIFNsYWNrLCBTcGFuIH0gZnJvbSBcIi4vc2xhY2svc2xhY2sudHNcIjtcbmltcG9ydCB7IEphY29iaWFuLCBVbmNlcnRhaW50eSB9IGZyb20gXCIuL3N0YXRzL2NkZi90cmlhbmd1bGFyL2phY29iaWFuLnRzXCI7XG5pbXBvcnQgeyBUaGVtZSwgY29sb3JUaGVtZUZyb21FbGVtZW50IH0gZnJvbSBcIi4vc3R5bGUvdGhlbWUvdGhlbWUudHNcIjtcbmltcG9ydCB7IHRvZ2dsZVRoZW1lIH0gZnJvbSBcIi4vc3R5bGUvdG9nZ2xlci90b2dnbGVyLnRzXCI7XG5cbmNvbnN0IEZPTlRfU0laRV9QWCA9IDMyO1xuXG5sZXQgcGxhbiA9IG5ldyBQbGFuKCk7XG5jb25zdCBwcmVjaXNpb24gPSBuZXcgUHJlY2lzaW9uKDIpO1xuXG5jb25zdCBybmRJbnQgPSAobjogbnVtYmVyKTogbnVtYmVyID0+IHtcbiAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG4pO1xufTtcblxuY29uc3QgRFVSQVRJT04gPSAxMDA7XG5cbmNvbnN0IHJuZER1cmF0aW9uID0gKCk6IG51bWJlciA9PiB7XG4gIHJldHVybiBybmRJbnQoRFVSQVRJT04pO1xufTtcblxuY29uc3QgcGVvcGxlOiBzdHJpbmdbXSA9IFtcIkZyZWRcIiwgXCJCYXJuZXlcIiwgXCJXaWxtYVwiLCBcIkJldHR5XCJdO1xuXG5jb25zdCBybmROYW1lID0gKCk6IHN0cmluZyA9PiBgJHtTdHJpbmcuZnJvbUNoYXJDb2RlKDY1ICsgcm5kSW50KDI2KSl9YDtcblxuY29uc3Qgb3BzOiBPcFtdID0gW0FkZFJlc291cmNlT3AoXCJQZXJzb25cIildO1xuXG5wZW9wbGUuZm9yRWFjaCgocGVyc29uOiBzdHJpbmcpID0+IHtcbiAgb3BzLnB1c2goQWRkUmVzb3VyY2VPcHRpb25PcChcIlBlcnNvblwiLCBwZXJzb24pKTtcbn0pO1xuXG5vcHMucHVzaChcbiAgSW5zZXJ0TmV3RW1wdHlUYXNrQWZ0ZXJPcCgwKSxcbiAgU2V0TWV0cmljVmFsdWVPcChcIkR1cmF0aW9uXCIsIHJuZER1cmF0aW9uKCksIDEpLFxuICBTZXRUYXNrTmFtZU9wKDEsIHJuZE5hbWUoKSksXG4gIFNldFJlc291cmNlVmFsdWVPcChcIlBlcnNvblwiLCBwZW9wbGVbcm5kSW50KHBlb3BsZS5sZW5ndGgpXSwgMSksXG4gIFNldFJlc291cmNlVmFsdWVPcChcIlVuY2VydGFpbnR5XCIsIFwibW9kZXJhdGVcIiwgMSlcbik7XG5cbmxldCBudW1UYXNrcyA9IDE7XG5mb3IgKGxldCBpID0gMDsgaSA8IDIwOyBpKyspIHtcbiAgbGV0IGluZGV4ID0gcm5kSW50KG51bVRhc2tzKSArIDE7XG4gIG9wcy5wdXNoKFxuICAgIFNwbGl0VGFza09wKGluZGV4KSxcbiAgICBTZXRNZXRyaWNWYWx1ZU9wKFwiRHVyYXRpb25cIiwgcm5kRHVyYXRpb24oKSwgaW5kZXggKyAxKSxcbiAgICBTZXRUYXNrTmFtZU9wKGluZGV4ICsgMSwgcm5kTmFtZSgpKSxcbiAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJQZXJzb25cIiwgcGVvcGxlW3JuZEludChwZW9wbGUubGVuZ3RoKV0sIGluZGV4ICsgMSksXG4gICAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiVW5jZXJ0YWludHlcIiwgXCJtb2RlcmF0ZVwiLCBpbmRleCArIDEpXG4gICk7XG4gIG51bVRhc2tzKys7XG4gIGluZGV4ID0gcm5kSW50KG51bVRhc2tzKSArIDE7XG4gIG9wcy5wdXNoKFxuICAgIER1cFRhc2tPcChpbmRleCksXG4gICAgU2V0TWV0cmljVmFsdWVPcChcIkR1cmF0aW9uXCIsIHJuZER1cmF0aW9uKCksIGluZGV4ICsgMSksXG4gICAgU2V0VGFza05hbWVPcChpbmRleCArIDEsIHJuZE5hbWUoKSksXG4gICAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiUGVyc29uXCIsIHBlb3BsZVtybmRJbnQocGVvcGxlLmxlbmd0aCldLCBpbmRleCArIDEpLFxuICAgIFNldFJlc291cmNlVmFsdWVPcChcIlVuY2VydGFpbnR5XCIsIFwibW9kZXJhdGVcIiwgaW5kZXggKyAxKVxuICApO1xuICBudW1UYXNrcysrO1xufVxuXG5jb25zdCByZXMgPSBhcHBseUFsbE9wc1RvUGxhbihvcHMsIHBsYW4pO1xuXG5pZiAoIXJlcy5vaykge1xuICBjb25zb2xlLmxvZyhyZXMuZXJyb3IpO1xufVxuXG5sZXQgc2xhY2tzOiBTbGFja1tdID0gW107XG5sZXQgc3BhbnM6IFNwYW5bXSA9IFtdO1xubGV0IGNyaXRpY2FsUGF0aDogbnVtYmVyW10gPSBbXTtcblxuY29uc3QgcmVjYWxjdWxhdGVTcGFuID0gKCkgPT4ge1xuICBjb25zdCBzbGFja1Jlc3VsdCA9IENvbXB1dGVTbGFjayhwbGFuLmNoYXJ0LCB1bmRlZmluZWQsIHByZWNpc2lvbi5yb3VuZGVyKCkpO1xuICBpZiAoIXNsYWNrUmVzdWx0Lm9rKSB7XG4gICAgY29uc29sZS5lcnJvcihzbGFja1Jlc3VsdCk7XG4gIH0gZWxzZSB7XG4gICAgc2xhY2tzID0gc2xhY2tSZXN1bHQudmFsdWU7XG4gIH1cblxuICBzcGFucyA9IHNsYWNrcy5tYXAoKHZhbHVlOiBTbGFjayk6IFNwYW4gPT4ge1xuICAgIHJldHVybiB2YWx1ZS5lYXJseTtcbiAgfSk7XG4gIGNyaXRpY2FsUGF0aCA9IENyaXRpY2FsUGF0aChzbGFja3MsIHByZWNpc2lvbi5yb3VuZGVyKCkpO1xufTtcblxucmVjYWxjdWxhdGVTcGFuKCk7XG5cbmNvbnN0IHRhc2tMYWJlbDogVGFza0xhYmVsID0gKHRhc2tJbmRleDogbnVtYmVyKTogc3RyaW5nID0+XG4gIGAke3BsYW4uY2hhcnQuVmVydGljZXNbdGFza0luZGV4XS5uYW1lfWA7XG4vLyAgYCR7cGxhbi5jaGFydC5WZXJ0aWNlc1t0YXNrSW5kZXhdLm5hbWV9ICgke3BsYW4uY2hhcnQuVmVydGljZXNbdGFza0luZGV4XS5yZXNvdXJjZXNbXCJQZXJzb25cIl19KSBgO1xuXG4vLyBUT0RPIEV4dHJhY3QgdGhpcyBhcyBhIGhlbHBlciBmb3IgdGhlIHJhZGFyIHZpZXcuXG5sZXQgZGlzcGxheVJhbmdlOiBEaXNwbGF5UmFuZ2UgfCBudWxsID0gbnVsbDtcbmxldCBzY2FsZTogU2NhbGUgfCBudWxsID0gbnVsbDtcblxuY29uc3QgcmFkYXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihcIiNyYWRhclwiKSE7XG5uZXcgTW91c2VNb3ZlKHJhZGFyKTtcblxuY29uc3QgZHJhZ1JhbmdlSGFuZGxlciA9IChlOiBDdXN0b21FdmVudDxEcmFnUmFuZ2U+KSA9PiB7XG4gIGlmIChzY2FsZSA9PT0gbnVsbCkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zb2xlLmxvZyhcIm1vdXNlXCIsIGUuZGV0YWlsKTtcbiAgY29uc3QgYmVnaW4gPSBzY2FsZS5kYXlSb3dGcm9tUG9pbnQoZS5kZXRhaWwuYmVnaW4pO1xuICBjb25zdCBlbmQgPSBzY2FsZS5kYXlSb3dGcm9tUG9pbnQoZS5kZXRhaWwuZW5kKTtcbiAgZGlzcGxheVJhbmdlID0gbmV3IERpc3BsYXlSYW5nZShiZWdpbi5kYXksIGVuZC5kYXkpO1xuICBjb25zb2xlLmxvZyhkaXNwbGF5UmFuZ2UpO1xuICBwYWludENoYXJ0KCk7XG59O1xuXG5yYWRhci5hZGRFdmVudExpc3RlbmVyKERSQUdfUkFOR0VfRVZFTlQsIGRyYWdSYW5nZUhhbmRsZXIgYXMgRXZlbnRMaXN0ZW5lcik7XG5cbmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZGFyay1tb2RlLXRvZ2dsZVwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgY29uc29sZS5sb2coXCJjbGlja1wiKTtcbiAgdG9nZ2xlVGhlbWUoKTtcbiAgcGFpbnRDaGFydCgpO1xufSk7XG5cbmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmFkYXItdG9nZ2xlXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3JhZGFyLXBhcmVudFwiKSEuY2xhc3NMaXN0LnRvZ2dsZShcImhpZGRlblwiKTtcbn0pO1xuXG5sZXQgdG9wVGltZWxpbmU6IGJvb2xlYW4gPSBmYWxzZTtcblxuZG9jdW1lbnRcbiAgLnF1ZXJ5U2VsZWN0b3IoXCIjdG9wLXRpbWVsaW5lLXRvZ2dsZVwiKSFcbiAgLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgdG9wVGltZWxpbmUgPSAhdG9wVGltZWxpbmU7XG4gICAgcGFpbnRDaGFydCgpO1xuICB9KTtcblxubGV0IGdyb3VwQnlPcHRpb25zOiBzdHJpbmdbXSA9IFtcIlwiLCAuLi5PYmplY3Qua2V5cyhwbGFuLnJlc291cmNlRGVmaW5pdGlvbnMpXTtcbmxldCBncm91cEJ5T3B0aW9uc0luZGV4OiBudW1iZXIgPSAwO1xuXG5jb25zdCB0b2dnbGVHcm91cEJ5ID0gKCkgPT4ge1xuICBncm91cEJ5T3B0aW9uc0luZGV4ID0gKGdyb3VwQnlPcHRpb25zSW5kZXggKyAxKSAlIGdyb3VwQnlPcHRpb25zLmxlbmd0aDtcbn07XG5cbmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ3JvdXAtYnktdG9nZ2xlXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICB0b2dnbGVHcm91cEJ5KCk7XG4gIHBhaW50Q2hhcnQoKTtcbn0pO1xuXG5jb25zdCBwYWludENoYXJ0ID0gKCkgPT4ge1xuICBjb25zb2xlLnRpbWUoXCJwYWludENoYXJ0XCIpO1xuXG4gIGNvbnN0IHRoZW1lQ29sb3JzOiBUaGVtZSA9IGNvbG9yVGhlbWVGcm9tRWxlbWVudChkb2N1bWVudC5ib2R5KTtcblxuICBjb25zdCByYWRhck9wdHM6IFJlbmRlck9wdGlvbnMgPSB7XG4gICAgZm9udFNpemVQeDogNixcbiAgICBoYXNUZXh0OiBmYWxzZSxcbiAgICBkaXNwbGF5UmFuZ2U6IGRpc3BsYXlSYW5nZSxcbiAgICBkaXNwbGF5UmFuZ2VVc2FnZTogXCJoaWdobGlnaHRcIixcbiAgICBjb2xvcnM6IHtcbiAgICAgIHN1cmZhY2U6IHRoZW1lQ29sb3JzLnN1cmZhY2UsXG4gICAgICBvblN1cmZhY2U6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZSxcbiAgICAgIG9uU3VyZmFjZU11dGVkOiB0aGVtZUNvbG9ycy5vblN1cmZhY2VNdXRlZCxcbiAgICAgIG9uU3VyZmFjZUhpZ2hsaWdodDogdGhlbWVDb2xvcnMub25TdXJmYWNlU2Vjb25kYXJ5LFxuICAgICAgb3ZlcmxheTogdGhlbWVDb2xvcnMub3ZlcmxheSxcbiAgICAgIGdyb3VwQ29sb3I6IHRoZW1lQ29sb3JzLmdyb3VwQ29sb3IsXG4gICAgfSxcbiAgICBoYXNUaW1lbGluZTogZmFsc2UsXG4gICAgaGFzVGFza3M6IHRydWUsXG4gICAgaGFzRWRnZXM6IGZhbHNlLFxuICAgIGRyYXdUaW1lTWFya2Vyc09uVGFza3M6IGZhbHNlLFxuICAgIHRhc2tMYWJlbDogdGFza0xhYmVsLFxuICAgIHRhc2tIaWdobGlnaHRzOiBjcml0aWNhbFBhdGgsXG4gICAgZ3JvdXBCeVJlc291cmNlOiBncm91cEJ5T3B0aW9uc1tncm91cEJ5T3B0aW9uc0luZGV4XSxcbiAgfTtcblxuICBjb25zdCB6b29tT3B0czogUmVuZGVyT3B0aW9ucyA9IHtcbiAgICBmb250U2l6ZVB4OiBGT05UX1NJWkVfUFgsXG4gICAgaGFzVGV4dDogdHJ1ZSxcbiAgICBkaXNwbGF5UmFuZ2U6IGRpc3BsYXlSYW5nZSxcbiAgICBkaXNwbGF5UmFuZ2VVc2FnZTogXCJyZXN0cmljdFwiLFxuICAgIGNvbG9yczoge1xuICAgICAgc3VyZmFjZTogdGhlbWVDb2xvcnMuc3VyZmFjZSxcbiAgICAgIG9uU3VyZmFjZTogdGhlbWVDb2xvcnMub25TdXJmYWNlLFxuICAgICAgb25TdXJmYWNlTXV0ZWQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZU11dGVkLFxuICAgICAgb25TdXJmYWNlSGlnaGxpZ2h0OiB0aGVtZUNvbG9ycy5vblN1cmZhY2VTZWNvbmRhcnksXG4gICAgICBvdmVybGF5OiB0aGVtZUNvbG9ycy5vdmVybGF5LFxuICAgICAgZ3JvdXBDb2xvcjogdGhlbWVDb2xvcnMuZ3JvdXBDb2xvcixcbiAgICB9LFxuICAgIGhhc1RpbWVsaW5lOiB0b3BUaW1lbGluZSxcbiAgICBoYXNUYXNrczogdHJ1ZSxcbiAgICBoYXNFZGdlczogdHJ1ZSxcbiAgICBkcmF3VGltZU1hcmtlcnNPblRhc2tzOiB0cnVlLFxuICAgIHRhc2tMYWJlbDogdGFza0xhYmVsLFxuICAgIHRhc2tIaWdobGlnaHRzOiBjcml0aWNhbFBhdGgsXG4gICAgZ3JvdXBCeVJlc291cmNlOiBncm91cEJ5T3B0aW9uc1tncm91cEJ5T3B0aW9uc0luZGV4XSxcbiAgfTtcblxuICBjb25zdCB0aW1lbGluZU9wdHM6IFJlbmRlck9wdGlvbnMgPSB7XG4gICAgZm9udFNpemVQeDogRk9OVF9TSVpFX1BYLFxuICAgIGhhc1RleHQ6IHRydWUsXG4gICAgZGlzcGxheVJhbmdlOiBkaXNwbGF5UmFuZ2UsXG4gICAgZGlzcGxheVJhbmdlVXNhZ2U6IFwicmVzdHJpY3RcIixcbiAgICBjb2xvcnM6IHtcbiAgICAgIHN1cmZhY2U6IHRoZW1lQ29sb3JzLnN1cmZhY2UsXG4gICAgICBvblN1cmZhY2U6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZSxcbiAgICAgIG9uU3VyZmFjZU11dGVkOiB0aGVtZUNvbG9ycy5vblN1cmZhY2VNdXRlZCxcbiAgICAgIG9uU3VyZmFjZUhpZ2hsaWdodDogdGhlbWVDb2xvcnMub25TdXJmYWNlU2Vjb25kYXJ5LFxuICAgICAgb3ZlcmxheTogdGhlbWVDb2xvcnMub3ZlcmxheSxcbiAgICAgIGdyb3VwQ29sb3I6IHRoZW1lQ29sb3JzLmdyb3VwQ29sb3IsXG4gICAgfSxcbiAgICBoYXNUaW1lbGluZTogdHJ1ZSxcbiAgICBoYXNUYXNrczogZmFsc2UsXG4gICAgaGFzRWRnZXM6IHRydWUsXG4gICAgZHJhd1RpbWVNYXJrZXJzT25UYXNrczogdHJ1ZSxcbiAgICB0YXNrTGFiZWw6IHRhc2tMYWJlbCxcbiAgICB0YXNrSGlnaGxpZ2h0czogY3JpdGljYWxQYXRoLFxuICAgIGdyb3VwQnlSZXNvdXJjZTogZ3JvdXBCeU9wdGlvbnNbZ3JvdXBCeU9wdGlvbnNJbmRleF0sXG4gIH07XG5cbiAgcGFpbnRPbmVDaGFydChcIiN6b29tZWRcIiwgem9vbU9wdHMpO1xuICBwYWludE9uZUNoYXJ0KFwiI3RpbWVsaW5lXCIsIHRpbWVsaW5lT3B0cyk7XG4gIGNvbnN0IHJldCA9IHBhaW50T25lQ2hhcnQoXCIjcmFkYXJcIiwgcmFkYXJPcHRzKTtcblxuICBpZiAoIXJldC5vaykge1xuICAgIHJldHVybjtcbiAgfVxuICBzY2FsZSA9IHJldC52YWx1ZTtcbiAgY29uc29sZS50aW1lRW5kKFwicGFpbnRDaGFydFwiKTtcbn07XG5cbmNvbnN0IHBhaW50T25lQ2hhcnQgPSAoXG4gIGNhbnZhc0lEOiBzdHJpbmcsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnNcbik6IFJlc3VsdDxTY2FsZT4gPT4ge1xuICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxDYW52YXNFbGVtZW50PihjYW52YXNJRCkhO1xuICBjb25zdCBwYXJlbnQgPSBjYW52YXMhLnBhcmVudEVsZW1lbnQhO1xuICBjb25zdCByYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IHBhcmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgY29uc3QgY2FudmFzV2lkdGggPSBNYXRoLmNlaWwod2lkdGggKiByYXRpbyk7XG4gIGNvbnN0IGNhbnZhc0hlaWdodCA9IE1hdGguY2VpbChoZWlnaHQgKiByYXRpbyk7XG4gIGNhbnZhcy53aWR0aCA9IGNhbnZhc1dpZHRoO1xuICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzSGVpZ2h0O1xuICBjYW52YXMuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGA7XG4gIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgO1xuXG4gIC8vIE5vdyB1cGRhdGUgdGhlIGNhbnZhcyBoZWlnaHQgc28gdGhhdCBpdCBmaXRzIHRoZSBjaGFydCBiZWluZyBkcmF3bi5cbiAgLy8gVE9ETyBUdXJuIHRoaXMgaW50byBhbiBvcHRpb24gc2luY2Ugd2Ugd29uJ3QgYWx3YXlzIHdhbnQgdGhpcy5cblxuICBpZiAoMSkge1xuICAgIGNvbnN0IG5ld0hlaWdodCA9IHN1Z2dlc3RlZENhbnZhc0hlaWdodChcbiAgICAgIGNhbnZhcyxcbiAgICAgIHNwYW5zLFxuICAgICAgb3B0cyxcbiAgICAgIHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoICsgMiAvLyBUT0RPIC0gV2h5IGRvIHdlIG5lZWQgdGhlICsyIGhlcmUhP1xuICAgICk7XG4gICAgY2FudmFzLmhlaWdodCA9IG5ld0hlaWdodDtcbiAgICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gYCR7bmV3SGVpZ2h0IC8gcmF0aW99cHhgO1xuICB9XG4gIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIikhO1xuICBjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG5cbiAgcmV0dXJuIHJlbmRlclRhc2tzVG9DYW52YXMocGFyZW50LCBjYW52YXMsIGN0eCwgcGxhbiwgc3BhbnMsIG9wdHMpO1xufTtcblxuZXhwb3J0IGludGVyZmFjZSBDcml0aWNhbFBhdGhFbnRyeSB7XG4gIGNvdW50OiBudW1iZXI7XG4gIHRhc2tzOiBudW1iZXJbXTtcbiAgZHVyYXRpb25zOiBudW1iZXJbXTtcbn1cblxuY29uc3Qgc2ltdWxhdGUgPSAoKSA9PiB7XG4gIC8vIFNpbXVsYXRlIHRoZSB1bmNlcnRhaW50eSBpbiB0aGUgcGxhbiBhbmQgZ2VuZXJhdGUgcG9zc2libGUgYWx0ZXJuYXRlXG4gIC8vIGNyaXRpY2FsIHBhdGhzLlxuICBjb25zdCBNQVhfUkFORE9NID0gMTAwMDtcbiAgY29uc3QgTlVNX1NJTVVMQVRJT05fTE9PUFMgPSAxMDA7XG5cbiAgY29uc3QgYWxsQ3JpdGljYWxQYXRocyA9IG5ldyBNYXA8c3RyaW5nLCBDcml0aWNhbFBhdGhFbnRyeT4oKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IE5VTV9TSU1VTEFUSU9OX0xPT1BTOyBpKyspIHtcbiAgICBjb25zdCBkdXJhdGlvbnMgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLm1hcCgodDogVGFzaykgPT4ge1xuICAgICAgY29uc3QgcmF3RHVyYXRpb24gPSBuZXcgSmFjb2JpYW4oXG4gICAgICAgIHQuZHVyYXRpb24sXG4gICAgICAgIHQuZ2V0UmVzb3VyY2UoXCJVbmNlcnRhaW50eVwiKSBhcyBVbmNlcnRhaW50eVxuICAgICAgKS5zYW1wbGUocm5kSW50KE1BWF9SQU5ET00pIC8gTUFYX1JBTkRPTSk7XG4gICAgICByZXR1cm4gcHJlY2lzaW9uLnJvdW5kKHJhd0R1cmF0aW9uKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHNsYWNrc1JldCA9IENvbXB1dGVTbGFjayhcbiAgICAgIHBsYW4uY2hhcnQsXG4gICAgICAodDogVGFzaywgdGFza0luZGV4OiBudW1iZXIpID0+IGR1cmF0aW9uc1t0YXNrSW5kZXhdLFxuICAgICAgcHJlY2lzaW9uLnJvdW5kZXIoKVxuICAgICk7XG4gICAgaWYgKCFzbGFja3NSZXQub2spIHtcbiAgICAgIHRocm93IHNsYWNrc1JldC5lcnJvcjtcbiAgICB9XG4gICAgY29uc3QgY3JpdGljYWxQYXRoID0gQ3JpdGljYWxQYXRoKHNsYWNrc1JldC52YWx1ZSwgcHJlY2lzaW9uLnJvdW5kZXIoKSk7XG4gICAgY29uc3QgY3JpdGljYWxQYXRoQXNTdHJpbmcgPSBgJHtjcml0aWNhbFBhdGh9YDtcbiAgICBsZXQgcGF0aEVudHJ5ID0gYWxsQ3JpdGljYWxQYXRocy5nZXQoY3JpdGljYWxQYXRoQXNTdHJpbmcpO1xuICAgIGlmIChwYXRoRW50cnkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcGF0aEVudHJ5ID0ge1xuICAgICAgICBjb3VudDogMCxcbiAgICAgICAgdGFza3M6IGNyaXRpY2FsUGF0aCxcbiAgICAgICAgZHVyYXRpb25zOiBkdXJhdGlvbnMsXG4gICAgICB9O1xuICAgICAgYWxsQ3JpdGljYWxQYXRocy5zZXQoY3JpdGljYWxQYXRoQXNTdHJpbmcsIHBhdGhFbnRyeSk7XG4gICAgfVxuICAgIHBhdGhFbnRyeS5jb3VudCsrO1xuICB9XG5cbiAgbGV0IGRpc3BsYXkgPSBcIlwiO1xuICBhbGxDcml0aWNhbFBhdGhzLmZvckVhY2goKHZhbHVlOiBDcml0aWNhbFBhdGhFbnRyeSwga2V5OiBzdHJpbmcpID0+IHtcbiAgICBkaXNwbGF5ID1cbiAgICAgIGRpc3BsYXkgK1xuICAgICAgYFxcbiA8bGkgZGF0YS1rZXk9JHtrZXl9PiR7dmFsdWUuY291bnR9IDogJHtrZXl9IDogJHt2YWx1ZS5kdXJhdGlvbnMuam9pbihcIiwgXCIpfTwvbGk+YDtcbiAgfSk7XG5cbiAgY29uc3QgY3JpdGlhbFBhdGhzID1cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxVTGlzdEVsZW1lbnQ+KFwiI2NyaXRpY2FsUGF0aHNcIikhO1xuICBjcml0aWFsUGF0aHMuaW5uZXJIVE1MID0gZGlzcGxheTtcblxuICAvLyBFbmFibGUgY2xpY2tpbmcgb24gYWx0ZXJuYXRlIGNyaXRpY2FsIHBhdGhzLlxuICBjcml0aWFsUGF0aHMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgY29uc3QgY3JpdGljYWxQYXRoRW50cnkgPSBhbGxDcml0aWNhbFBhdGhzLmdldChcbiAgICAgIChlLnRhcmdldCBhcyBIVE1MTElFbGVtZW50KS5kYXRhc2V0LmtleSFcbiAgICApITtcbiAgICBjcml0aWNhbFBhdGhFbnRyeS5kdXJhdGlvbnMuZm9yRWFjaChcbiAgICAgIChkdXJhdGlvbjogbnVtYmVyLCB0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tJbmRleF0uZHVyYXRpb24gPSBkdXJhdGlvbjtcbiAgICAgIH1cbiAgICApO1xuICAgIHJlY2FsY3VsYXRlU3BhbigpO1xuICAgIHBhaW50Q2hhcnQoKTtcbiAgfSk7XG5cbiAgLy8gR2VuZXJhdGUgYSB0YWJsZSBvZiB0YXNrcyBvbiB0aGUgY3JpdGljYWwgcGF0aCwgc29ydGVkIGJ5IGR1cmF0aW9uLCBhbG9uZ1xuICAvLyB3aXRoIHRoZWlyIHBlcmNlbnRhZ2UgY2hhbmNlIG9mIGFwcGVhcmluZyBvbiB0aGUgY3JpdGljYWwgcGF0aC5cblxuICBpbnRlcmZhY2UgQ3JpdGljYWxQYXRoVGFza0VudHJ5IHtcbiAgICB0YXNrSW5kZXg6IG51bWJlcjtcbiAgICBkdXJhdGlvbjogbnVtYmVyO1xuICAgIG51bVRpbWVzQXBwZWFyZWQ6IG51bWJlcjtcbiAgfVxuXG4gIGNvbnN0IGNyaXRpYWxUYXNrczogTWFwPG51bWJlciwgQ3JpdGljYWxQYXRoVGFza0VudHJ5PiA9IG5ldyBNYXAoKTtcblxuICBhbGxDcml0aWNhbFBhdGhzLmZvckVhY2goKHZhbHVlOiBDcml0aWNhbFBhdGhFbnRyeSwga2V5OiBzdHJpbmcpID0+IHtcbiAgICB2YWx1ZS50YXNrcy5mb3JFYWNoKCh0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgbGV0IHRhc2tFbnRyeSA9IGNyaXRpYWxUYXNrcy5nZXQodGFza0luZGV4KTtcbiAgICAgIGlmICh0YXNrRW50cnkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0YXNrRW50cnkgPSB7XG4gICAgICAgICAgdGFza0luZGV4OiB0YXNrSW5kZXgsXG4gICAgICAgICAgZHVyYXRpb246IHBsYW4uY2hhcnQuVmVydGljZXNbdGFza0luZGV4XS5kdXJhdGlvbixcbiAgICAgICAgICBudW1UaW1lc0FwcGVhcmVkOiAwLFxuICAgICAgICB9O1xuICAgICAgICBjcml0aWFsVGFza3Muc2V0KHRhc2tJbmRleCwgdGFza0VudHJ5KTtcbiAgICAgIH1cbiAgICAgIHRhc2tFbnRyeS5udW1UaW1lc0FwcGVhcmVkICs9IHZhbHVlLmNvdW50O1xuICAgIH0pO1xuICB9KTtcblxuICBjb25zdCBjcml0aWNhbFRhc2tzRHVyYXRpb25EZXNjZW5kaW5nID0gWy4uLmNyaXRpYWxUYXNrcy52YWx1ZXMoKV0uc29ydChcbiAgICAoYTogQ3JpdGljYWxQYXRoVGFza0VudHJ5LCBiOiBDcml0aWNhbFBhdGhUYXNrRW50cnkpOiBudW1iZXIgPT4ge1xuICAgICAgcmV0dXJuIGIuZHVyYXRpb24gLSBhLmR1cmF0aW9uO1xuICAgIH1cbiAgKTtcblxuICBsZXQgY3JpdGlhbFRhc2tzVGFibGUgPSBjcml0aWNhbFRhc2tzRHVyYXRpb25EZXNjZW5kaW5nXG4gICAgLm1hcChcbiAgICAgICh0YXNrRW50cnk6IENyaXRpY2FsUGF0aFRhc2tFbnRyeSkgPT4gYDx0cj5cbiAgPHRkPiR7cGxhbi5jaGFydC5WZXJ0aWNlc1t0YXNrRW50cnkudGFza0luZGV4XS5uYW1lfTwvdGQ+XG4gIDx0ZD4ke3Rhc2tFbnRyeS5kdXJhdGlvbn08L3RkPlxuICA8dGQ+JHtNYXRoLmZsb29yKCgxMDAgKiB0YXNrRW50cnkubnVtVGltZXNBcHBlYXJlZCkgLyBOVU1fU0lNVUxBVElPTl9MT09QUyl9PC90ZD5cbjwvdHI+YFxuICAgIClcbiAgICAuam9pbihcIlxcblwiKTtcbiAgY3JpdGlhbFRhc2tzVGFibGUgPVxuICAgIGA8dHI+PHRoPk5hbWU8L3RoPjx0aD5EdXJhdGlvbjwvdGg+PHRoPiU8L3RoPjwvdHI+XFxuYCArIGNyaXRpYWxUYXNrc1RhYmxlO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NyaXRpY2FsVGFza3NcIikhLmlubmVySFRNTCA9IGNyaXRpYWxUYXNrc1RhYmxlO1xuXG4gIC8vIFNob3cgYWxsIHRhc2tzIHRoYXQgY291bGQgYmUgb24gdGhlIGNyaXRpY2FsIHBhdGguXG5cbiAgcmVjYWxjdWxhdGVTcGFuKCk7XG4gIGNyaXRpY2FsUGF0aCA9IGNyaXRpY2FsVGFza3NEdXJhdGlvbkRlc2NlbmRpbmcubWFwKFxuICAgICh0YXNrRW50cnk6IENyaXRpY2FsUGF0aFRhc2tFbnRyeSkgPT4gdGFza0VudHJ5LnRhc2tJbmRleFxuICApO1xuICBwYWludENoYXJ0KCk7XG5cbiAgLy8gUG9wdWxhdGUgdGhlIGRvd25sb2FkIGxpbmsuXG5cbiAgY29uc3QgZG93bmxvYWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxMaW5rRWxlbWVudD4oXCIjZG93bmxvYWRcIikhO1xuICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShwbGFuLCBudWxsLCBcIiAgXCIpKTtcbiAgY29uc3QgZG93bmxvYWRCbG9iID0gbmV3IEJsb2IoW0pTT04uc3RyaW5naWZ5KHBsYW4sIG51bGwsIFwiICBcIildLCB7XG4gICAgdHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gIH0pO1xuICBkb3dubG9hZC5ocmVmID0gVVJMLmNyZWF0ZU9iamVjdFVSTChkb3dubG9hZEJsb2IpO1xufTtcblxuLy8gUmVhY3QgdG8gdGhlIHVwbG9hZCBpbnB1dC5cbmNvbnN0IGZpbGVVcGxvYWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxJbnB1dEVsZW1lbnQ+KFwiI2ZpbGUtdXBsb2FkXCIpITtcbmZpbGVVcGxvYWQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IGpzb24gPSBhd2FpdCBmaWxlVXBsb2FkLmZpbGVzIVswXS50ZXh0KCk7XG4gIGNvbnN0IHJldCA9IEZyb21KU09OKGpzb24pO1xuICBpZiAoIXJldC5vaykge1xuICAgIGNvbnNvbGUubG9nKHJldC5lcnJvcik7XG4gICAgdGhyb3cgcmV0LmVycm9yO1xuICB9XG4gIHBsYW4gPSByZXQudmFsdWU7XG4gIGdyb3VwQnlPcHRpb25zID0gW1wiXCIsIC4uLk9iamVjdC5rZXlzKHBsYW4ucmVzb3VyY2VEZWZpbml0aW9ucyldO1xuICByZWNhbGN1bGF0ZVNwYW4oKTtcbiAgc2ltdWxhdGUoKTtcbiAgY29uc3QgbWFwcyA9IGVkZ2VzQnlTcmNBbmREc3RUb01hcChwbGFuLmNoYXJ0LkVkZ2VzKTtcbiAgY29uc29sZS5sb2cobWFwcyk7XG4gIGNvbnNvbGUubG9nKHBsYW4pO1xuICBwYWludENoYXJ0KCk7XG59KTtcblxuc2ltdWxhdGUoKTtcbnBhaW50Q2hhcnQoKTtcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHBhaW50Q2hhcnQpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7O0FBaUJPLE1BQU0sZUFBTixNQUFtQjtBQUFBLElBQ3hCLElBQVk7QUFBQSxJQUNaLElBQVk7QUFBQSxJQUVaLFlBQVksSUFBWSxHQUFHLElBQVksR0FBRztBQUN4QyxXQUFLLElBQUk7QUFDVCxXQUFLLElBQUk7QUFBQSxJQUNYO0FBQUEsSUFFQSxNQUFNLEtBQTRCO0FBQ2hDLGFBQU8sSUFBSSxNQUFNLEtBQUssS0FBSyxJQUFJLE1BQU0sS0FBSztBQUFBLElBQzVDO0FBQUEsSUFFQSxTQUFpQztBQUMvQixhQUFPO0FBQUEsUUFDTCxHQUFHLEtBQUs7QUFBQSxRQUNSLEdBQUcsS0FBSztBQUFBLE1BQ1Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQWtCTyxNQUFNLGtCQUFrQixDQUFDLFVBQXFDO0FBQ25FLFVBQU0sTUFBTSxvQkFBSSxJQUFtQjtBQUVuQyxVQUFNLFFBQVEsQ0FBQyxNQUFvQjtBQUNqQyxZQUFNLE1BQU0sSUFBSSxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUM7QUFDN0IsVUFBSSxLQUFLLENBQUM7QUFDVixVQUFJLElBQUksRUFBRSxHQUFHLEdBQUc7QUFBQSxJQUNsQixDQUFDO0FBRUQsV0FBTztBQUFBLEVBQ1Q7QUFVTyxNQUFNLGtCQUFrQixDQUFDLFVBQXFDO0FBQ25FLFVBQU0sTUFBTSxvQkFBSSxJQUFtQjtBQUVuQyxVQUFNLFFBQVEsQ0FBQyxNQUFvQjtBQUNqQyxZQUFNLE1BQU0sSUFBSSxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUM7QUFDN0IsVUFBSSxLQUFLLENBQUM7QUFDVixVQUFJLElBQUksRUFBRSxHQUFHLEdBQUc7QUFBQSxJQUNsQixDQUFDO0FBRUQs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VztBQUlYLFVBQU0sV0FBVyxTQUFTLGNBQStCLFdBQVc7QUFDcEUsWUFBUSxJQUFJLEtBQUssVUFBVSxNQUFNLE1BQU0sSUFBSSxDQUFDO0FBQzVDLFVBQU0sZUFBZSxJQUFJLEtBQUssQ0FBQyxLQUFLLFVBQVUsTUFBTSxNQUFNLElBQUksQ0FBQyxHQUFHO0FBQUEsTUFDaEUsTUFBTTtBQUFBLElBQ1IsQ0FBQztBQUNELGFBQVMsT0FBTyxJQUFJLGdCQUFnQixZQUFZO0FBQUEsRUFDbEQ7QUFHQSxNQUFNLGFBQWEsU0FBUyxjQUFnQyxjQUFjO0FBQzFFLGFBQVcsaUJBQWlCLFVBQVUsWUFBWTtBQUNoRCxVQUFNLE9BQU8sTUFBTSxXQUFXLE1BQU8sQ0FBQyxFQUFFLEtBQUs7QUFDN0MsVUFBTSxNQUFNLFNBQVMsSUFBSTtBQUN6QixRQUFJLENBQUMsSUFBSSxJQUFJO0FBQ1gsY0FBUSxJQUFJLElBQUksS0FBSztBQUNyQixZQUFNLElBQUk7QUFBQSxJQUNaO0FBQ0EsV0FBTyxJQUFJO0FBQ1gscUJBQWlCLENBQUMsSUFBSSxHQUFHLE9BQU8sS0FBSyxLQUFLLG1CQUFtQixDQUFDO0FBQzlELG9CQUFnQjtBQUNoQixhQUFTO0FBQ1QsVUFBTSxPQUFPLHNCQUFzQixLQUFLLE1BQU0sS0FBSztBQUNuRCxZQUFRLElBQUksSUFBSTtBQUNoQixZQUFRLElBQUksSUFBSTtBQUNoQixlQUFXO0FBQUEsRUFDYixDQUFDO0FBRUQsV0FBUztBQUNULGFBQVc7QUFDWCxTQUFPLGlCQUFpQixVQUFVLFVBQVU7IiwKICAibmFtZXMiOiBbInBsYW4iLCAicmVzIiwgIm9wcyIsICJwbGFuIiwgInBsYW4iLCAicGxhbiIsICJwbGFuIiwgIm9rIiwgInBsYW4iLCAicHJlY2lzaW9uIiwgInNwYW5zIiwgInBsYW4iLCAicmVzb3VyY2VEZWZpbml0aW9uIiwgInNjYWxlIiwgInJvdyIsICJzbGFja3MiLCAiY3JpdGljYWxQYXRoIl0KfQo=
