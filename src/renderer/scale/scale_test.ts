import { assert } from "@esm-bundle/chai";
import { RenderOptions } from "../renderer.ts";
import { Feature, Metric, Point, Scale } from "./scale.ts";

const optsForTest: RenderOptions = {
  fontSizePx: 12,
  hasText: true,
  displaySubRange: null,
  colorTheme: {
    surface: "#000",
    onSurface: "#222",
  },
  marginSizePx: 10,
};

it("Basic size calculations 12px font:", () => {
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

it("Basic size calculations 24px font:", () => {
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
