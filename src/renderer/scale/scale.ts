import { clamp } from "../../metrics/range.ts";
import { RenderOptions } from "../renderer.ts";
import { Point } from "./point.ts";

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
  groupTextStart,
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
  groupEnvelopeStart,
  taskEnvelopeTop,

  displayRangeTop,
  taskRowBottom,

  timeMarkStart,
  timeMarkEnd,
  timeTextStart,

  groupTitleTextStart,

  tasksClipRectOrigin,
  groupByOrigin,
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
  textXOffset,
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
  private timelineHeightPx: number;
  private origin: Point;
  private totalNumberOfDays: number;
  private groupByColumnWidthPx: number;

  private timelineOrigin: Point;
  private tasksOrigin: Point;
  private groupByOrigin: Point;
  private tasksClipRectOrigin: Point;

  constructor(
    opts: RenderOptions,
    canvasWidthPx: number,
    totalNumberOfDays: number,
    maxGroupNameLength: number = 0
  ) {
    this.totalNumberOfDays = totalNumberOfDays;
    this.groupByColumnWidthPx = maxGroupNameLength * opts.fontSizePx;

    this.blockSizePx = Math.floor(opts.fontSizePx / 3);
    this.taskHeightPx = makeOdd(Math.floor((this.blockSizePx * 3) / 4));
    this.lineWidthPx = makeOdd(Math.floor(this.taskHeightPx / 3));
    const milestoneRadius = Math.ceil(this.taskHeightPx / 2) + this.lineWidthPx;
    this.marginSizePx = milestoneRadius;
    this.timelineHeightPx = opts.hasTimeline
      ? Math.ceil((opts.fontSizePx * 4) / 3)
      : 0;

    this.timelineOrigin = new Point(milestoneRadius, 0);
    this.groupByOrigin = new Point(0, milestoneRadius + this.timelineHeightPx);

    let beginOffset = 0;
    if (opts.displayRange === null || opts.displayRangeUsage === "highlight") {
      // TODO - The Math.floor() call here causes zooming to start to look
      // choppy when large ranges of the chart are selected. One way to fix this
      // might be to let this.dayWidthPx be a floating point value and then
      // apply Math.floor() calls to feature() results.
      this.dayWidthPx = Math.floor(
        (canvasWidthPx - this.groupByColumnWidthPx - 2 * this.marginSizePx) /
          totalNumberOfDays
      );
      this.origin = new Point(0, 0);
    } else {
      // Should we set x-margins to 0 if a SubRange is requested?
      // Or should we totally drop all margins from here and just use
      // CSS margins on the canvas element?
      this.dayWidthPx = Math.floor(
        (canvasWidthPx - this.groupByColumnWidthPx - 2 * this.marginSizePx) /
          opts.displayRange.rangeInDays
      );
      beginOffset = Math.floor(
        this.dayWidthPx * opts.displayRange.begin + this.marginSizePx
      );
      this.origin = new Point(-beginOffset + this.marginSizePx, 0);
    }

    this.tasksOrigin = new Point(
      this.groupByColumnWidthPx - beginOffset + milestoneRadius,
      this.timelineHeightPx + milestoneRadius
    );

    this.tasksClipRectOrigin = new Point(
      this.groupByColumnWidthPx,
      this.timelineHeightPx
    );

    if (opts.hasText) {
      this.rowHeightPx = 6 * this.blockSizePx; // This might also be `(canvasHeightPx - 2 * opts.marginSizePx) / numberSwimLanes` if height is supplied?
    } else {
      this.rowHeightPx = 1.1 * this.blockSizePx;
    }
  }

  /** The height of the chart. Note that it's not constrained by the canvas. */
  public height(maxRows: number): number {
    return (
      maxRows * this.rowHeightPx + this.timelineHeightPx + 2 * this.marginSizePx
    );
  }

  public dayRowFromPoint(point: Point): DayRow {
    // This should also clamp the returned 'x' value to [0, maxRows).
    return {
      day: clamp(
        Math.floor(
          (window.devicePixelRatio * point.x -
            this.origin.x -
            this.marginSizePx -
            this.groupByColumnWidthPx) /
            this.dayWidthPx
        ),
        0,
        this.totalNumberOfDays
      ),
      row: Math.floor(
        (window.devicePixelRatio * point.y -
          this.origin.y -
          this.marginSizePx -
          this.timelineHeightPx) /
          this.rowHeightPx
      ),
    };
  }

  /** The top left corner of the bounding box for a single task. */
  private taskRowEnvelopeStart(row: number, day: number): Point {
    return this.origin.sum(
      new Point(
        day * this.dayWidthPx + this.marginSizePx + this.groupByColumnWidthPx,
        row * this.rowHeightPx + this.marginSizePx + this.timelineHeightPx
      )
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private groupRowEnvelopeStart(row: number, day: number): Point {
    return this.groupByOrigin.sum(
      new Point(
        0,
        row * this.rowHeightPx + this.marginSizePx + this.timelineHeightPx
      )
    );
  }

  private groupHeaderStart(): Point {
    return this.origin.sum(new Point(this.marginSizePx, this.marginSizePx));
  }

  private timeEnvelopeStart(day: number): Point {
    return this.origin.sum(
      new Point(
        day * this.dayWidthPx + this.marginSizePx + this.groupByColumnWidthPx,
        this.marginSizePx
      )
    );
  }

  /** Returns the coordinate of the item */
  feature(row: number, day: number, coord: Feature): Point {
    switch (coord) {
      case Feature.taskLineStart:
      case Feature.verticalArrowDestTop:
      case Feature.verticalArrowStart:
        return this.taskRowEnvelopeStart(row, day).add(
          0,
          this.rowHeightPx - this.blockSizePx
        );

      case Feature.verticalArrowDestBottom:
        return this.taskRowEnvelopeStart(row, day).add(0, this.rowHeightPx);
      case Feature.textStart:
        return this.taskRowEnvelopeStart(row, day).add(
          this.blockSizePx,
          this.blockSizePx
        );
      case Feature.groupTextStart:
        return this.groupRowEnvelopeStart(row, day).add(
          this.blockSizePx,
          this.blockSizePx
        );
      case Feature.percentStart:
        return this.taskRowEnvelopeStart(row, day).add(
          0,
          this.rowHeightPx - this.lineWidthPx
        );
      case Feature.horizontalArrowDest:
      case Feature.horizontalArrowStart:
        return this.taskRowEnvelopeStart(row, day).add(
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
        return this.taskRowEnvelopeStart(row, day);
      case Feature.groupEnvelopeStart:
        return this.groupRowEnvelopeStart(row, day);
      case Feature.timeMarkStart:
        return this.timeEnvelopeStart(day);
      case Feature.timeMarkEnd:
        return this.timeEnvelopeStart(day).add(0, this.rowHeightPx * (row + 1));
      case Feature.timeTextStart:
        return this.timeEnvelopeStart(day).add(this.blockSizePx, 0);

      case Feature.groupTitleTextStart:
        return this.groupHeaderStart().add(this.blockSizePx, 0);
      case Feature.displayRangeTop:
        return this.timeEnvelopeStart(day);
      case Feature.taskRowBottom:
        return this.taskRowEnvelopeStart(row + 1, day);
      case Feature.tasksClipRectOrigin:
        return this.tasksClipRectOrigin;
      case Feature.groupByOrigin:
        return this.groupByOrigin;
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
      case Metric.percentHeight:
        return this.lineWidthPx;
      case Metric.arrowHeadHeight:
        return this.taskHeightPx;
      case Metric.arrowHeadWidth:
        return Math.ceil(this.taskHeightPx);
      case Metric.milestoneDiameter:
        return Math.ceil(this.taskHeightPx);
      case Metric.lineDashLine:
        return this.blockSizePx;
      case Metric.lineDashGap:
        return this.blockSizePx;
      case Metric.textXOffset:
        return this.blockSizePx;
      default:
        // The line below will not compile if you missed an enum in the switch above.
        feature satisfies never;
        return 0.0;
    }
  }
}
