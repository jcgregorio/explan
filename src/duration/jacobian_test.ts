import { assert } from "@esm-bundle/chai";
import { JacobianDuration, Uncertainty } from "./jacobian";

describe("JacobianDuration", () => {
  it("Uses triangular ", () => {
    const j = new JacobianDuration(Uncertainty.extreme);

    // Since extreme == 5.0 x.
    assert.equal(j.sample(5, 1.0), 25);
    assert.equal(j.sample(5, 0), 1);
  });

  it("Can duplicate itself", () => {
    const j = new JacobianDuration(Uncertainty.extreme);
    const copy = j.dup();
    j.uncertainty = Uncertainty.low;

    // Note the original is changed, but the copy is not.
    assert.equal((copy as JacobianDuration).uncertainty, Uncertainty.extreme);
    assert.equal(j.uncertainty, Uncertainty.low);
  });
});
