import { assert } from "@esm-bundle/chai";
import { RenderOptions, defaultTaskLabel } from "../renderer.ts";
import { Feature, Metric, Scale } from "./scale.ts";
import { DisplayRange } from "../range/range.ts";
import { Point } from "./point.ts";

describe("Scale", () => {
  const optsForTest: RenderOptions = {
    fontSizePx: 12,
    hasText: true,
    displayRange: null,
    displayRangeUsage: "restrict",
    colorTheme: {
      surface: "#000",
      onSurface: "#222",
    },
    marginSizePx: 10,
    displayTimes: false,
    taskLabel: defaultTaskLabel,
  };

  it("Calculates metrics correctly for 12px font", () => {
    optsForTest.fontSizePx = 12;
    const s = new Scale(optsForTest, 256, 20);
    assert.equal(s.metric(Metric.percentHeight), 1);
    assert.equal(s.metric(Metric.taskLineHeight), 3);

    assert.equal(s["dayWidthPx"], 11);
    assert.equal(s["blockSizePx"], 4);
    assert.deepEqual(
      s.feature(1, 1, Feature.taskLineStart),
      // margin + dayWidthPx, margin + rowHeight + 5*blockSize
      new Point(10 + 11, 10 + 6 * 4 + 5 * 4)
    );
  });

  it("Calculates metrics correctly for 24px font", () => {
    optsForTest.fontSizePx = 24;
    const s = new Scale(optsForTest, 256, 20);
    assert.equal(s.metric(Metric.percentHeight), 3);
    assert.equal(s.metric(Metric.taskLineHeight), 7);

    assert.equal(s["dayWidthPx"], 11);
    assert.equal(s["blockSizePx"], 8);
    assert.deepEqual(
      s.feature(1, 1, Feature.taskLineStart),
      // margin + dayWidthPx, margin + rowHeight + 5*blockSize
      new Point(10 + 11, 10 + 6 * 8 + 5 * 8)
    );
  });

  it("Calculates metrics correctly for 12px font with a non-null displaySubRange", () => {
    const optsCopy = Object.assign({}, optsForTest);
    optsCopy.displayRange = new DisplayRange(5, 15);
    optsCopy.fontSizePx = 12;
    const s = new Scale(optsCopy, 256, 20);
    assert.equal(s.metric(Metric.percentHeight), 1);
    assert.equal(s.metric(Metric.taskLineHeight), 3);

    assert.equal(s["dayWidthPx"], 23);
    assert.equal(s["blockSizePx"], 4);

    // Given the subrange, drawing should start to be on the canvas at day 5.
    assert.deepEqual(
      s.feature(1, 5, Feature.taskLineStart),
      // margin + dayWidthPx + origin.x, margin + rowHeight + 5*blockSize + origin.y
      new Point(10, 10 + 6 * 4 + 5 * 4)
    );
    // And earlier days will be drawn in the negative range.
    assert.deepEqual(
      s.feature(1, 4, Feature.taskLineStart),
      // margin + dayWidthPx + origin.x, margin + rowHeight + 5*blockSize + origin.y
      new Point(-13, 10 + 6 * 4 + 5 * 4)
    );
    // And tasks to the right will be larger than 236 = 265 - 2*10, the canvas width in pixels.
    assert.deepEqual(
      s.feature(1, 15, Feature.taskLineStart),
      // margin + dayWidthPx + origin.x, margin + rowHeight + 5*blockSize + origin.y
      new Point(240, 10 + 6 * 4 + 5 * 4)
    );
  });
});
