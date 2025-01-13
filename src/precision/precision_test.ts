import { assert } from "@esm-bundle/chai";
import { Precision } from "./precision";

describe("Precision", () => {
  it("rounds to the given precision", () => {
    const p = new Precision(2);
    assert.equal(12.36, p.round(12.3567));
  });

  it("handles a precision of 0", () => {
    const p = new Precision(0);
    assert.equal(12, p.round(12.3567));
  });

  it("handles negative numbers", () => {
    const p = new Precision(0);
    assert.equal(-12, p.round(-12.3567));
  });

  it("handles bad numbers handed to the constructor", () => {
    const p = new Precision(-3.2);
    assert.equal(12.357, p.round(12.3567));
    assert.equal(3, p.precision);
  });

  it("handles bad numbers handed to the constructor", () => {
    const p = new Precision(NaN);
    assert.equal(12, p.round(12.3567));
    assert.equal(0, p.precision);
  });

  it("handles bad values handed to the constructor", () => {
    const p = new Precision("foo" as unknown as number);
    assert.equal(12, p.round(12.3567));
    assert.equal(0, p.precision);
  });
  it("handles bad values handed to the constructor", () => {
    const p = new Precision(undefined as unknown as number);
    assert.equal(12, p.round(12.3567));
    assert.equal(0, p.precision);
  });
});
