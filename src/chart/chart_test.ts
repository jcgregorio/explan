import { assert } from "@esm-bundle/chai";
import { ChartValidate, Task, validateDirectedGraph } from "./chart.ts";
import { Chart } from "./chart.ts";
import { DirectedEdge, DirectedGraph } from "../dag/dag.ts";

describe("validateChart", () => {
  it("A directed graph validates:", () => {
    const G: DirectedGraph = {
      Vertices: [{}, {}, {}, {}],
      Edges: [
        new DirectedEdge(0, 1),
        new DirectedEdge(0, 2),
        new DirectedEdge(1, 3),
        new DirectedEdge(2, 3),
      ],
    };
    assert.isTrue(validateDirectedGraph(G).ok);
  });

  it("A directed graph with a loop fails to validate:", () => {
    const GWithLoop: DirectedGraph = {
      Vertices: [{}, {}, {}, {}],
      Edges: [
        new DirectedEdge(0, 1),
        new DirectedEdge(0, 2),
        new DirectedEdge(1, 3),
        new DirectedEdge(2, 3),
        new DirectedEdge(2, 0),
      ],
    };
    assert.isFalse(validateDirectedGraph(GWithLoop).ok);
  });

  it("A default chart validates.", () => {
    const r = validateDirectedGraph(new Chart());
    assert.isTrue(r.ok);
  });
});

describe("ChartValidate", () => {
  it("A default chart validates.", () => {
    const r = ChartValidate(new Chart());
    assert.isTrue(r.ok);
  });

  it("Fails on Tasks with duplicate IDs.", () => {
    const c = new Chart();
    c.Vertices[0].id = "fred";
    c.Vertices[1].id = "fred";
    const r = ChartValidate(c);
    assert.isFalse(r.ok);
  });
});

describe("Task", () => {
  it("Can duplicate itself", () => {
    const t = new Task();
    const copy = t.dup();

    // Yhey only differ in the ID.
    assert.notDeepEqual(t, copy);
    t.id = "fred";
    copy.id = "fred";
    assert.deepEqual(t, copy);

    // Modify the copy and show they become different.
    copy.name = "Some new name.";
    assert.notDeepEqual(t, copy);
  });

  it("Duplicates are correct of metrics.", () => {
    const t = new Task();
    const copy = t.dup();
    t.id = "fred";
    copy.id = "fred";
    assert.deepEqual(t, copy);

    // Modify the copy and show they become different.
    copy.setMetric("Some new name", 12);
    assert.notDeepEqual(t, copy);
  });

  it("Duplicates are correct of resources.", () => {
    const t = new Task();
    const copy = t.dup();
    t.id = "fred";
    copy.id = "fred";
    assert.deepEqual(t, copy);

    // Modify the copy and show they become different.
    copy.setResource("Some new name", "wilma");
    assert.notDeepEqual(t, copy);
  });

  it("Round-trips through JSON", () => {
    const task = new Task();
    task.duration = 12;
    const actual = Task.fromJSON(task.toJSON());
    assert.deepEqual(actual, task);
  });
});

describe("Chart", () => {
  it("Round-trips through JSON", () => {
    const c = new Chart();
    c.Vertices[0].duration = 10;
    const actual = Chart.fromJSON(c.toJSON());
    assert.deepEqual(actual, c);
  });
});
