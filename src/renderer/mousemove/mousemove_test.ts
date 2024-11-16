import { assert } from "@esm-bundle/chai";
import { MouseMove } from "./mousemove.ts";
import { Point } from "../scale/point.ts";

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
    div.dispatchEvent(new MouseEvent("mousemove", { clientX: 1, clientY: 2 }));
    assert.deepEqual(mm.readLocation(), new Point(1, 2));
  });
});
