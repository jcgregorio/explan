import { assert } from "@esm-bundle/chai";
import { Task, validateChart } from "./chart.ts";
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
    assert.isTrue(validateChart(G).ok);
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
    assert.isFalse(validateChart(GWithLoop).ok);
  });

  it("A default chart validates.", () => {
    const r = validateChart(new Chart());
    assert.isTrue(r.ok);
  });
});

describe("Task", () => {
  it("Can duplicate itself", () => {
    const t = new Task();
    const copy = t.dup();
    assert.deepEqual(t, copy);

    // Modify the copy and show they become different.
    copy.name = "Some new name.";
    assert.notDeepEqual(t, copy);
  });
});
