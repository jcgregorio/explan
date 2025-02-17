import { assert } from "@esm-bundle/chai";
import { DirectedEdge } from "./dag.ts";

describe("DirectedEdge", () => {
  it("has equality comparison", () => {
    assert.isTrue(new DirectedEdge(1, 2).equal(new DirectedEdge(1, 2)));
    assert.isFalse(new DirectedEdge(1, 2).equal(new DirectedEdge(5, 2)));
    assert.isFalse(new DirectedEdge(1, 2).equal(new DirectedEdge(1, 5)));
  });

  it("Roundtrips through JSON", () => {
    const e = new DirectedEdge(2, 1);
    const actual = DirectedEdge.fromJSON(e.toJSON());
    assert.deepEqual(actual, e);
  });
});
