import { assert } from "@esm-bundle/chai";
import { DirectedEdge } from "./dag.ts";

describe("DirectedEdge", () => {
  it("has equality comparison", () => {
    assert.isTrue(new DirectedEdge(1, 2).equal(new DirectedEdge(1, 2)));
    assert.isFalse(new DirectedEdge(1, 2).equal(new DirectedEdge(5, 2)));
    assert.isFalse(new DirectedEdge(1, 2).equal(new DirectedEdge(1, 5)));
  });
});
