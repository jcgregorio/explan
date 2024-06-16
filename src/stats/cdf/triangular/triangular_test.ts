import { assert } from "@esm-bundle/chai";
import { Triangular } from "./triangular.ts";

it("Test with simple case c=b.", () => {
  const t = new Triangular(0, 1, 1);
  assert.equal(0, t.sample(0));
  assert.equal(Math.SQRT2 / 2, t.sample(0.5));
  assert.equal(1, t.sample(1));
});

it("Test with simple case c=a.", () => {
  const t = new Triangular(0, 1, 0);
  assert.equal(0, t.sample(0));
  assert.equal(1 - Math.SQRT2 / 2, t.sample(0.5));
  assert.equal(1, t.sample(1));
});
