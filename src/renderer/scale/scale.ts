import { clamp } from "../../metrics/range";
import { RenderOptions } from "../renderer";
import { Point } from "./point";

export interface DayRow {
  day: number;
  row: number;
}

/** Features of the chart we can ask for coordinates of, where the value returned is
 * the top left coordinate of the feature.
 */
export enum Feature {
  taskLineStart,
  textStart,
  percentStart,
  verticalArrowDestTop,
  verticalArrowDestBottom,
  horizontalArrowDest,
  verticalArrowStart,
  horizontalArrowStart,
  verticalArrowDestToMilestoneTop,
  verticalArrowDestToMilestoneBottom,
  horizontalArrowDestToMilestone,
  verticalArrowStartFromMilestoneTop,
  verticalArrowStartFromMilestoneBottom,
  horizontalArrowStartFromMilestone,
  taskEnvelopeTop,

  displayRangeTop,
  taskRowBottom,

  timeMarkStart,
  timeMarkEnd,
  timeTextStart,
}

/** Sizes of features of a rendered chart. */
export enum Metric {
  taskLineHeight,
  percentHeight,
  arrowHeadHeight,
  arrowHeadWidth,
  milestoneDiameter,
  lineDashLine,
  lineDashGap,
}

/** Makes a number odd, adds one if even. */
const makeOdd = (n: number): number => {
  if (n % 2 === 0) {
    return n + 1;
  }
  return n;
};

/** Scale consolidates all calculations around rendering a chart onto a surface. */
export class Scale {
  private dayWidthPx: number;
  private rowHeightPx: number;
  private blockSizePx: number;
  private taskHeightPx: number;
  private lineWidthPx: number;
  private marginSizePx: number;
  private topAxisHeightPx: number;
  private origin: Point;
  private totalNumberOfDays: number;

  constructor(
    opts: RenderOptions,
    canvasWidthPx: number,
    totalNumberOfDays: number
  ) {
    this.totalNumberOfDays = totalNumberOfDays;
    this.marginSizePx = opts.marginSizePx;
    this.topAxisHeightPx = opts.displayTimes
      ? Math.ceil((opts.fontSizePx * 4) / 3)
      : 0;
    if (opts.displayRange === null || opts.displayRangeUsage === "highlight") {
      this.dayWidthPx = Math.floor(
        (canvasWidthPx - 2 * opts.marginSizePx) / totalNumberOfDays
      );
      this.origin = new Point(0, 0);
    } else {
      // Should we set x-margins to 0 if a SubRange is requested?
      // Or should we totally drop all margins from here and just use
      // CSS margins on the canvas element?
      this.dayWidthPx = Math.floor(
        (canvasWidthPx - 2 * opts.marginSizePx) / opts.displayRange.rangeInDays
      );
      const beginOffset = Math.floor(
        this.dayWidthPx * opts.displayRange.begin + opts.marginSizePx
      );
      this.origin = new Point(-beginOffset + opts.marginSizePx, 0);
    }

    this.blockSizePx = Math.floor(opts.fontSizePx / 3);
    this.taskHeightPx = makeOdd(Math.floor((this.blockSizePx * 3) / 4));
    this.lineWidthPx = makeOdd(Math.floor(this.taskHeightPx / 3));
    if (opts.hasText) {
      this.rowHeightPx = 6 * this.blockSizePx; // This might also be `(canvasHeightPx - 2 * opts.marginSizePx) / numberSwimLanes` if height is supplied?
    } else {
      this.rowHeightPx = 1.1 * this.blockSizePx;
    }
  }

  /** The height of the chart. Note that it's not constrained by the canvas. */
  public height(maxRows: number): number {
    return (
      maxRows * this.rowHeightPx + this.topAxisHeightPx + 2 * this.marginSizePx
    );
  }

  public dayRowFromPoint(point: Point): DayRow {
    // This should also clamp the returned 'x' value to [0, maxRows).
    return {
      day: clamp(
        Math.floor(
          (window.devicePixelRatio *
            (point.x - this.origin.x - this.marginSizePx)) /
            this.dayWidthPx
        ),
        0,
        this.totalNumberOfDays
      ),
      row: Math.floor(
        (window.devicePixelRatio *
          (point.y -
            this.origin.y -
            this.marginSizePx -
            this.topAxisHeightPx)) /
          this.rowHeightPx
      ),
    };
  }

  /** The top left corner of the bounding box for a single task. */
  private envelopeStart(row: number, day: number): Point {
    return this.origin.sum(
      new Point(
        day * this.dayWidthPx + this.marginSizePx,
        row * this.rowHeightPx + this.marginSizePx + this.topAxisHeightPx
      )
    );
  }

  private timeEnvelopeStart(day: number): Point {
    return this.origin.sum(
      new Point(day * this.dayWidthPx + this.marginSizePx, this.marginSizePx)
    );
  }

  /** Returns the coordinate of the item */
  feature(row: number, day: number, coord: Feature): Point {
    switch (coord) {
      case Feature.taskLineStart:
      case Feature.verticalArrowDestTop:
      case Feature.verticalArrowStart:
        return this.envelopeStart(row, day).add(
          0,
          this.rowHeightPx - this.blockSizePx
        );

      case Feature.verticalArrowDestBottom:
        return this.envelopeStart(row, day).add(0, this.rowHeightPx);
      case Feature.textStart:
        return this.envelopeStart(row, day).add(
          this.blockSizePx,
          this.blockSizePx
        );
      case Feature.percentStart:
        return this.envelopeStart(row, day).add(
          0,
          this.rowHeightPx - this.lineWidthPx
        );
      case Feature.horizontalArrowDest:
      case Feature.horizontalArrowStart:
        return this.envelopeStart(row, day).add(
          0,
          Math.floor(this.rowHeightPx - 0.5 * this.blockSizePx) - 1
        );
      case Feature.verticalArrowDestToMilestoneTop:
        return this.feature(row, day, Feature.verticalArrowDestTop).add(
          0,
          -1 * this.metric(Metric.milestoneDiameter)
        );
      case Feature.verticalArrowDestToMilestoneBottom:
        return this.feature(row, day, Feature.verticalArrowDestTop).add(
          0,
          this.metric(Metric.milestoneDiameter)
        );
      case Feature.horizontalArrowDestToMilestone:
        return this.feature(row, day, Feature.horizontalArrowDest).add(
          -1 * this.metric(Metric.milestoneDiameter),
          -1 * this.metric(Metric.milestoneDiameter)
        );
      case Feature.verticalArrowStartFromMilestoneTop:
        return this.feature(row, day, Feature.verticalArrowStart).add(
          0,
          -1 * this.metric(Metric.milestoneDiameter)
        );

      case Feature.verticalArrowStartFromMilestoneBottom:
        return this.feature(row, day, Feature.verticalArrowStart).add(
          0,
          this.metric(Metric.milestoneDiameter)
        );
      case Feature.horizontalArrowStartFromMilestone:
        return this.feature(row, day, Feature.horizontalArrowStart).add(
          this.metric(Metric.milestoneDiameter),
          0
        );
      case Feature.taskEnvelopeTop:
        return this.envelopeStart(row, day);
      case Feature.timeMarkStart:
        return this.timeEnvelopeStart(day);
      case Feature.timeMarkEnd:
        return this.timeEnvelopeStart(day).add(0, this.rowHeightPx * (row + 1));
      case Feature.timeTextStart:
        return this.timeEnvelopeStart(day).add(this.blockSizePx, 0);
      case Feature.displayRangeTop:
        return this.timeEnvelopeStart(day);
      case Feature.taskRowBottom:
        return this.envelopeStart(row + 1, day);
      default:
        // The line below will not compile if you missed an enum in the switch above.
        coord satisfies never;
        return new Point(0, 0);
    }
  }

  metric(feature: Metric): number {
    switch (feature) {
      case Metric.taskLineHeight:
        return this.taskHeightPx;
        break;

      case Metric.percentHeight:
        return this.lineWidthPx;
        break;

      case Metric.arrowHeadHeight:
        return this.taskHeightPx;
        break;

      case Metric.arrowHeadWidth:
        return Math.ceil(this.taskHeightPx / 2);
        break;

      case Metric.milestoneDiameter:
        return Math.ceil(this.taskHeightPx / 2);
        break;

      case Metric.lineDashLine:
        return this.blockSizePx;
        break;

      case Metric.lineDashGap:
        return this.blockSizePx;
        break;

      default:
        // The line below will not compile if you missed an enum in the switch above.
        feature satisfies never;
        return 0.0;
        break;
    }
  }
}
