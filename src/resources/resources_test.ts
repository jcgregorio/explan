import { assert } from "@esm-bundle/chai";
import { ResourceDefinition } from "./resources";

describe("ResourceDefinition", () => {
  it("Roundtrips through JSON", () => {
    const r = new ResourceDefinition(["a", "b", "c"], true);
    const actual = ResourceDefinition.fromJSON(r.toJSON());
    assert.deepEqual(actual, r);
  });
});
