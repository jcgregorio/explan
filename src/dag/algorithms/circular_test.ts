import { assert } from "@esm-bundle/chai";
import { allSuccessors } from "./circular.ts";
import { Chart } from "../../chart/chart.ts";
import { DirectedEdge, DirectedGraph } from "../dag.ts";

describe("allSuccessors", () => {
  it("returns an empty list on a new chart.", () => {
    assert.isEmpty(allSuccessors(0, new Chart()));
    assert.isEmpty(allSuccessors(1, new Chart()));
  });

  it("returns an empty list on an out of bounds index.", () => {
    assert.isEmpty(allSuccessors(-1, new Chart()));
    assert.isEmpty(allSuccessors(2, new Chart()));
  });

  it("finds all the correct children", () => {
    const g: DirectedGraph = {
      Vertices: [{}, {}, {}, {}, {}],
      Edges: [
        new DirectedEdge(0, 1),
        new DirectedEdge(1, 2),
        new DirectedEdge(1, 3),
        new DirectedEdge(2, 4),
        new DirectedEdge(3, 4),
      ],
    };
    assert.deepEqual(allSuccessors(1, g), [2, 3]);
  });

  it("finds all the correct children", () => {
    const g: DirectedGraph = {
      Vertices: [{}, {}, {}, {}, {}],
      Edges: [
        new DirectedEdge(0, 1),
        new DirectedEdge(1, 2),
        new DirectedEdge(1, 3),
        new DirectedEdge(2, 3),
        new DirectedEdge(2, 4),
        new DirectedEdge(3, 4),
      ],
    };
    assert.deepEqual(allSuccessors(1, g), [2, 3]);
  });
});
