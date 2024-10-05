import { assert } from "@esm-bundle/chai";
import { DRAG_RANGE_EVENT, DragRange, MouseMove } from "./mousemove.ts";
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
    mm.detach();
    document.body.removeChild(div);
  });

  it("ignores 'mousemove' events if 'mousedown' hasn't occurred first", () => {
    div.dispatchEvent(new MouseEvent("mousemove", { clientX: 1, clientY: 2 }));
    assert.isNull(mm.begin);
    assert.deepEqual(mm.currentMoveLocation, new Point(0, 0));
    assert.deepEqual(mm.lastMoveSent, new Point(0, 0));
  });

  it("records the location of the 'mousemove' event if it comes after a 'mousedown' event", () => {
    div.dispatchEvent(new MouseEvent("mousedown", { clientX: 1, clientY: 1 }));
    div.dispatchEvent(new MouseEvent("mousemove", { clientX: 2, clientY: 2 }));
    assert.isNotNull(mm.begin);
    assert.notDeepEqual(mm.currentMoveLocation, new Point(0, 0));
    assert.deepEqual(mm.lastMoveSent, new Point(0, 0));
  });

  it("emits a DRAG_RANGE_EVENT event after seeing 'mousemove' event(s)", () => {
    div.dispatchEvent(new MouseEvent("mousedown", { clientX: 1, clientY: 1 }));
    div.dispatchEvent(new MouseEvent("mousemove", { clientX: 2, clientY: 3 }));
    let handlerCalled = false;
    const handler = (e: CustomEvent<DragRange>) => {
      assert.isNumber(e.detail.begin.x);
      assert.isNumber(e.detail.begin.y);
      assert.isNumber(e.detail.end.x);
      assert.isNumber(e.detail.end.y);
      // Note the start is (1, 1) and the end is (2, 3), thus the delta should
      // be (1, 2). We don't actually inspect the offsetX and offsetY values
      // directly in a test because they are calculated by the browser from the
      // clientX and clientY and could change over time.
      assert.isTrue(e.detail.begin.add(1, 2).equal(e.detail.end));

      handlerCalled = true;
    };
    div.addEventListener(DRAG_RANGE_EVENT, handler as EventListener);
    mm.onTimeout();
    assert.isTrue(handlerCalled);
    assert.notDeepEqual(mm.currentMoveLocation, new Point(0, 0));
    assert.notDeepEqual(mm.lastMoveSent, new Point(0, 0));
  });

  it("does not emits a second DRAG_RANGE_EVENT event if the mouse hasn't moved again", () => {
    div.dispatchEvent(new MouseEvent("mousedown", { clientX: 1, clientY: 1 }));
    div.dispatchEvent(new MouseEvent("mousemove", { clientX: 2, clientY: 2 }));
    let handlerCalled = false;
    const handler = () => {
      handlerCalled = true;
    };
    div.addEventListener(DRAG_RANGE_EVENT, handler as EventListener);

    // First onTimeout generates an event.
    mm.onTimeout();
    assert.isNotNull(mm.begin);
    assert.isTrue(handlerCalled);

    // Since we haven't sent any different 'mousemove' events then a second
    // timeout will not send an event.
    handlerCalled = false;
    mm.onTimeout();
    assert.isFalse(handlerCalled);
  });

  it("emits a 'dragrange' event after seeing 'mouseup' event", () => {
    let handlerCalled = false;
    const handler = (e: CustomEvent<DragRange>) => {
      assert.isNumber(e.detail.begin.x);
      assert.isNumber(e.detail.begin.y);
      assert.isNumber(e.detail.end.x);
      assert.isNumber(e.detail.end.y);
      // Same as above, only look at the delta of the Points and not the exact
      // values.
      assert.isTrue(e.detail.begin.add(2, 2).equal(e.detail.end));
      handlerCalled = true;
    };
    div.addEventListener("dragrange", handler as EventListener);

    div.dispatchEvent(new MouseEvent("mousedown", { clientX: 1, clientY: 1 }));
    div.dispatchEvent(new MouseEvent("mousemove", { clientX: 2, clientY: 2 }));
    div.dispatchEvent(new MouseEvent("mouseup", { clientX: 3, clientY: 3 }));

    assert.isTrue(handlerCalled);
    assert.isNull(mm.begin);
    assert.deepEqual(mm.currentMoveLocation, new Point(0, 0));
    assert.deepEqual(mm.lastMoveSent, new Point(0, 0));
  });
});
