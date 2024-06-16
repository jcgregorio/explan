import { assert } from "@esm-bundle/chai";
import { validate } from "./chart.ts";
import { Chart } from "./chart.ts";
import { DirectedGraph } from "../dag/dag.ts";

it("A directed graph validates:", () => {
  const G: DirectedGraph = {
    Vertices: [{}, {}, {}, {}],
    Edges: [
      { i: 0, j: 1 },
      { i: 0, j: 2 },
      { i: 1, j: 3 },
      { i: 2, j: 3 },
    ],
  };
  assert.isTrue(validate(G).ok);
});

it("A directed graph with a loop fails to validate:", () => {
  const GWithLoop: DirectedGraph = {
    Vertices: [{}, {}, {}, {}],
    Edges: [
      { i: 0, j: 1 },
      { i: 0, j: 2 },
      { i: 1, j: 3 },
      { i: 2, j: 3 },
      { i: 2, j: 0 },
    ],
  };
  assert.isFalse(validate(GWithLoop).ok);
});

it("A default chart validates.", () => {
  const r = validate(new Chart());
  assert.isTrue(r.ok);
});
