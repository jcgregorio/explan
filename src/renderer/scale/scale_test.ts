import { assertEquals } from "https://deno.land/std/assert/mod.ts";
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

Deno.test("Basic size calculations 12px font:", () => {
  optsForTest.fontSizePx = 12;
  const s = new Scale(optsForTest, 256, 20);
  assertEquals(s.metric(Metric.percentHeight), 1);
  assertEquals(s.metric(Metric.taskLineHeight), 3);

  assertEquals(s["dayWidthPx"], 11);
  assertEquals(s["blockSizePx"], 4);
  assertEquals(
    s.feature(1, 1, Feature.taskLineStart),
    // margin + dayWidthPx, margin + rowHeight + 5*blockSize
    new Point(10 + 11, 10 + 6 * 4 + 5 * 4)
  );
});

Deno.test("Basic size calculations 24px font:", () => {
  optsForTest.fontSizePx = 24;
  const s = new Scale(optsForTest, 256, 20);
  assertEquals(s.metric(Metric.percentHeight), 3);
  assertEquals(s.metric(Metric.taskLineHeight), 7);

  assertEquals(s["dayWidthPx"], 11);
  assertEquals(s["blockSizePx"], 8);
  assertEquals(
    s.feature(1, 1, Feature.taskLineStart),
    // margin + dayWidthPx, margin + rowHeight + 5*blockSize
    new Point(10 + 11, 10 + 6 * 8 + 5 * 8)
  );
});
