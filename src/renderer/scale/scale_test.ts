import { assert } from '@esm-bundle/chai';
import { RenderOptions, defaultTaskLabel } from '../renderer.ts';
import { Feature, Metric, Scale } from './scale.ts';
import { DisplayRange } from '../range/range.ts';
import { pt } from '../../point/point.ts';
import { Theme2 } from '../../style/theme/theme.ts';

describe('Scale', () => {
  const optsForTest: RenderOptions = {
    fontSizePx: 12,
    hasText: true,
    hasTasks: false,
    hasEdges: false,
    filterFunc: null,
    displayRange: null,
    displayRangeUsage: 'restrict',
    colors: new Theme2(),
    hasTimeline: false,
    drawTimeMarkersOnTasks: false,
    groupByResource: '',
    taskLabel: defaultTaskLabel,
    taskDuration: function (): number {
      throw new Error('Function not implemented.');
    },
    taskEmphasize: [],
    highlightedTask: null,
    selectedTaskIndex: 0,
    durationDisplay: () => '',
    taskIsStarted: (): boolean => true,
  };

  it('Calculates metrics correctly for 12px font', () => {
    optsForTest.fontSizePx = 12;
    const s = new Scale(optsForTest, 256, 20);
    assert.equal(s.metric(Metric.percentHeight), 1);
    assert.equal(s.metric(Metric.taskLineHeight), 4);

    assert.equal(s['dayWidthPx'], 12.5);
    assert.equal(s['blockSizePx'], 4);
    assert.equal(s['marginSizePx'], 3);
    assert.equal(s['groupByColumnWidthPx'], 0);
    assert.deepEqual(
      // marginWidthPx + dayWidthPx, marginWidthPx + rowHeight + 5*blockSize
      pt(3 + 12, 3 + 6 * 4 + 5 * 4),
      s.feature(1, 1, Feature.taskLineStart)
    );
  });

  it('Calculates metrics correctly for 24px font', () => {
    optsForTest.fontSizePx = 24;
    const s = new Scale(optsForTest, 256, 20);
    assert.equal(s.metric(Metric.percentHeight), 3);
    assert.equal(s.metric(Metric.taskLineHeight), 8);

    assert.equal(s['dayWidthPx'], 12.1);
    assert.equal(s['blockSizePx'], 8);
    assert.equal(s['marginSizePx'], 7);
    assert.equal(s['groupByColumnWidthPx'], 0);
    assert.deepEqual(
      s.feature(1, 1, Feature.taskLineStart),
      // margin + dayWidthPx, margin + rowHeight + 5*blockSize
      pt(7 + 12, 7 + 6 * 8 + 5 * 8)
    );
  });

  it('Calculates metrics correctly for 12px font with a non-null displaySubRange', () => {
    const optsCopy = Object.assign({}, optsForTest);
    optsCopy.displayRange = new DisplayRange(5, 15);
    optsCopy.fontSizePx = 12;
    const s = new Scale(optsCopy, 256, 20);
    assert.equal(s.metric(Metric.percentHeight), 1);
    assert.equal(s.metric(Metric.taskLineHeight), 4);

    assert.equal(s['dayWidthPx'], 25);
    assert.equal(s['blockSizePx'], 4);
    assert.equal(s['marginSizePx'], 3);
    assert.equal(s['groupByColumnWidthPx'], 0);
    assert.deepEqual(s['origin'], pt(-125, 0));

    // Given the subrange, drawing should start to be on the canvas at day 5.
    assert.deepEqual(
      s.feature(1, 5, Feature.taskLineStart),
      // margin + dayWidthPx + origin.x, margin + rowHeight + 5*blockSize + origin.y
      pt(3, 3 + 6 * 4 + 5 * 4)
    );
    // And earlier days will be drawn in the negative range.
    assert.deepEqual(
      s.feature(1, 4, Feature.taskLineStart),
      // margin + dayWidthPx + origin.x, margin + rowHeight + 5*blockSize + origin.y
      pt(3 - 25, 3 + 6 * 4 + 5 * 4)
    );
    // And tasks to the right will be larger than 236 = 265 - 2*10, the canvas width in pixels.
    assert.deepEqual(
      s.feature(1, 15, Feature.taskLineStart),
      // margin + dayWidthPx + origin.x, margin + rowHeight + 5*blockSize + origin.y
      pt(3 + 15 * 25 - 125, 3 + 6 * 4 + 5 * 4)
    );
  });
});
