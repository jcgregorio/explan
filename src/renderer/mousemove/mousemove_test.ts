import { assert } from "@esm-bundle/chai";
import { MouseMove } from "./mousemove.ts";

describe("MouseMove", () => {
  let div: HTMLDivElement;
  let mm: MouseMove;

  beforeEach(() => {
    div = document.createElement("div");
    document.body.appendChild(div);
    mm = new MouseMove(div);
  });

  afterEach(() => {
    document.body.removeChild(div);
  });

  it("ignores 'mousemove' events if the mouse hasn't moved", () => {
    assert.isNull(mm.readLocation());
  });

  it("Returns a new point if it moved since the last read. ", () => {
    // Note we send clientX and clientY, but read offsetX and offsetY, so we
    // won't know the actual mouse coordinates returned.
    div.dispatchEvent(new MouseEvent("mousemove", { clientX: 1, clientY: 2 }));
    assert.isNotNull(mm.readLocation());

    // And check that reading had reset the lastReadLocation and we now return
    // null until the mouse moves again.
    assert.isNull(mm.readLocation());
  });
});
