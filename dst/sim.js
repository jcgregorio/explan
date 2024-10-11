"use strict";
(() => {
  // src/stats/cdf/triangular/triangular.ts
  var Triangular = class {
    a;
    b;
    c;
    F_c;
    /**  The triangular distribution is a continuous probability distribution with
    lower limit `a`, upper limit `b`, and mode `c`, where a < b and a ≤ c ≤ b. */
    constructor(a, b, c) {
      this.a = a;
      this.b = b;
      this.c = c;
      this.F_c = (c - a) / (b - a);
    }
    /**  Produce a sample from the triangular distribution. The value of 'p'
     should be in [0, 1.0]. */
    sample(p) {
      if (p < 0) {
        return 0;
      } else if (p > 1) {
        return 1;
      } else if (p < this.F_c) {
        return this.a + Math.sqrt(p * (this.b - this.a) * (this.c - this.a));
      } else {
        return this.b - Math.sqrt((1 - p) * (this.b - this.a) * (this.b - this.c));
      }
    }
  };

  // src/stats/cdf/triangular/jacobian.ts
  var UncertaintyToNum = {
    low: 1.1,
    moderate: 1.5,
    high: 2,
    extreme: 5
  };
  var Jacobian = class {
    triangular;
    constructor(expected, uncertainty) {
      const mul = UncertaintyToNum[uncertainty];
      this.triangular = new Triangular(expected / mul, expected * mul, expected);
    }
    sample(p) {
      return this.triangular.sample(p);
    }
  };

  // src/sim.ts
  var t = new Triangular(1, 10, 3);
  var histogram = new Array(10);
  histogram.fill(0);
  for (let i = 0; i < 1e3; i++) {
    const s = t.sample(i / 1e3);
    histogram[Math.floor(s)] += 1;
  }
  console.log("histogram:", histogram);
  var Quartiles = (s) => {
    console.log("quartiles: ", s.sample(0.25), s.sample(0.5), s.sample(0.75));
  };
  Quartiles(new Jacobian(5, "extreme"));
  Quartiles(new Jacobian(5, "low"));
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL3N0YXRzL2NkZi90cmlhbmd1bGFyL3RyaWFuZ3VsYXIudHMiLCAiLi4vc3JjL3N0YXRzL2NkZi90cmlhbmd1bGFyL2phY29iaWFuLnRzIiwgIi4uL3NyYy9zaW0udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogVHJpYW5ndWxhciBpcyB0aGUgaW52ZXJzZSBDdW11bGF0aXZlIERlbnNpdHkgRnVuY3Rpb24gKENERikgZm9yIHRoZVxuICogdHJpYW5ndWxhciBkaXN0cmlidXRpb24uXG4gKlxuICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVHJpYW5ndWxhcl9kaXN0cmlidXRpb24jR2VuZXJhdGluZ19yYW5kb21fdmFyaWF0ZXNcbiAqXG4gKiBUaGUgaW52ZXJzZSBvZiB0aGUgQ0RGIGlzIHVzZWZ1bCBmb3IgZ2VuZXJhdGluZyBzYW1wbGVzIGZyb20gdGhlXG4gKiBkaXN0cmlidXRpb24sIGkuZS4gcGFzc2luZyBpbiB2YWx1ZXMgZnJvbSB0aGUgdW5pZm9ybSBkaXN0cmlidXRpb24gWzAsIDFdXG4gKiB3aWxsIHByb2R1Y2Ugc2FtcGxlIHRoYXQgbG9vayBsaWtlIHRoZXkgY29tZSBmcm9tIHRoZSB0cmlhbmd1bGFyXG4gKiBkaXN0cmlidXRpb24uXG4gKlxuICpcbiAqL1xuXG5leHBvcnQgY2xhc3MgVHJpYW5ndWxhciB7XG4gIHByaXZhdGUgYTogbnVtYmVyO1xuICBwcml2YXRlIGI6IG51bWJlcjtcbiAgcHJpdmF0ZSBjOiBudW1iZXI7XG4gIHByaXZhdGUgRl9jOiBudW1iZXI7XG5cbiAgLyoqICBUaGUgdHJpYW5ndWxhciBkaXN0cmlidXRpb24gaXMgYSBjb250aW51b3VzIHByb2JhYmlsaXR5IGRpc3RyaWJ1dGlvbiB3aXRoXG4gIGxvd2VyIGxpbWl0IGBhYCwgdXBwZXIgbGltaXQgYGJgLCBhbmQgbW9kZSBgY2AsIHdoZXJlIGEgPCBiIGFuZCBhIFx1MjI2NCBjIFx1MjI2NCBiLiAqL1xuICBjb25zdHJ1Y3RvcihhOiBudW1iZXIsIGI6IG51bWJlciwgYzogbnVtYmVyKSB7XG4gICAgdGhpcy5hID0gYTtcbiAgICB0aGlzLmIgPSBiO1xuICAgIHRoaXMuYyA9IGM7XG5cbiAgICAvLyBGX2MgaXMgdGhlIGN1dG9mZiBpbiB0aGUgZG9tYWluIHdoZXJlIHdlIHN3aXRjaCBiZXR3ZWVuIHRoZSB0d28gaGFsdmVzIG9mXG4gICAgLy8gdGhlIHRyaWFuZ2xlLlxuICAgIHRoaXMuRl9jID0gKGMgLSBhKSAvIChiIC0gYSk7XG4gIH1cblxuICAvKiogIFByb2R1Y2UgYSBzYW1wbGUgZnJvbSB0aGUgdHJpYW5ndWxhciBkaXN0cmlidXRpb24uIFRoZSB2YWx1ZSBvZiAncCdcbiAgIHNob3VsZCBiZSBpbiBbMCwgMS4wXS4gKi9cbiAgc2FtcGxlKHA6IG51bWJlcik6IG51bWJlciB7XG4gICAgaWYgKHAgPCAwKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9IGVsc2UgaWYgKHAgPiAxLjApIHtcbiAgICAgIHJldHVybiAxLjA7XG4gICAgfSBlbHNlIGlmIChwIDwgdGhpcy5GX2MpIHtcbiAgICAgIHJldHVybiB0aGlzLmEgKyBNYXRoLnNxcnQocCAqICh0aGlzLmIgLSB0aGlzLmEpICogKHRoaXMuYyAtIHRoaXMuYSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICB0aGlzLmIgLSBNYXRoLnNxcnQoKDEgLSBwKSAqICh0aGlzLmIgLSB0aGlzLmEpICogKHRoaXMuYiAtIHRoaXMuYykpXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuIiwgImltcG9ydCB7IFRyaWFuZ3VsYXIgfSBmcm9tIFwiLi90cmlhbmd1bGFyLnRzXCI7XG5cbmV4cG9ydCB0eXBlIFVuY2VydGFpbnR5ID0gXCJsb3dcIiB8IFwibW9kZXJhdGVcIiB8IFwiaGlnaFwiIHwgXCJleHRyZW1lXCI7XG5cbmV4cG9ydCBjb25zdCBVbmNlcnRhaW50eVRvTnVtOiBSZWNvcmQ8VW5jZXJ0YWludHksIG51bWJlcj4gPSB7XG4gIGxvdzogMS4xLFxuICBtb2RlcmF0ZTogMS41LFxuICBoaWdoOiAyLFxuICBleHRyZW1lOiA1LFxufTtcblxuZXhwb3J0IGNsYXNzIEphY29iaWFuIHtcbiAgcHJpdmF0ZSB0cmlhbmd1bGFyOiBUcmlhbmd1bGFyO1xuICBjb25zdHJ1Y3RvcihleHBlY3RlZDogbnVtYmVyLCB1bmNlcnRhaW50eTogVW5jZXJ0YWludHkpIHtcbiAgICBjb25zdCBtdWwgPSBVbmNlcnRhaW50eVRvTnVtW3VuY2VydGFpbnR5XTtcbiAgICB0aGlzLnRyaWFuZ3VsYXIgPSBuZXcgVHJpYW5ndWxhcihleHBlY3RlZCAvIG11bCwgZXhwZWN0ZWQgKiBtdWwsIGV4cGVjdGVkKTtcbiAgfVxuXG4gIHNhbXBsZShwOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnRyaWFuZ3VsYXIuc2FtcGxlKHApO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgVHJpYW5ndWxhciB9IGZyb20gXCIuL3N0YXRzL2NkZi90cmlhbmd1bGFyL3RyaWFuZ3VsYXIudHNcIjtcbmltcG9ydCB7IEphY29iaWFuLCBVbmNlcnRhaW50eSB9IGZyb20gXCIuL3N0YXRzL2NkZi90cmlhbmd1bGFyL2phY29iaWFuLnRzXCI7XG5jb25zdCB0ID0gbmV3IFRyaWFuZ3VsYXIoMSwgMTAsIDMpO1xuXG5jb25zdCBoaXN0b2dyYW06IG51bWJlcltdID0gbmV3IEFycmF5KDEwKTtcbmhpc3RvZ3JhbS5maWxsKDApO1xuXG5mb3IgKGxldCBpID0gMDsgaSA8IDEwMDA7IGkrKykge1xuICBjb25zdCBzID0gdC5zYW1wbGUoaSAvIDEwMDApO1xuICBoaXN0b2dyYW1bTWF0aC5mbG9vcihzKV0gKz0gMTtcbn1cblxuY29uc29sZS5sb2coXCJoaXN0b2dyYW06XCIsIGhpc3RvZ3JhbSk7XG5cbmludGVyZmFjZSBTYW1wbGVyIHtcbiAgc2FtcGxlKHA6IG51bWJlcik6IG51bWJlcjtcbn1cblxuY29uc3QgUXVhcnRpbGVzID0gKHM6IFNhbXBsZXIpOiB2b2lkID0+IHtcbiAgY29uc29sZS5sb2coXCJxdWFydGlsZXM6IFwiLCBzLnNhbXBsZSgwLjI1KSwgcy5zYW1wbGUoMC41KSwgcy5zYW1wbGUoMC43NSkpO1xufTtcblxuUXVhcnRpbGVzKG5ldyBKYWNvYmlhbig1LCBcImV4dHJlbWVcIikpO1xuXG5RdWFydGlsZXMobmV3IEphY29iaWFuKDUsIFwibG93XCIpKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7OztBQWNPLE1BQU0sYUFBTixNQUFpQjtBQUFBLElBQ2Q7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQTtBQUFBO0FBQUEsSUFJUixZQUFZLEdBQVcsR0FBVyxHQUFXO0FBQzNDLFdBQUssSUFBSTtBQUNULFdBQUssSUFBSTtBQUNULFdBQUssSUFBSTtBQUlULFdBQUssT0FBTyxJQUFJLE1BQU0sSUFBSTtBQUFBLElBQzVCO0FBQUE7QUFBQTtBQUFBLElBSUEsT0FBTyxHQUFtQjtBQUN4QixVQUFJLElBQUksR0FBRztBQUNULGVBQU87QUFBQSxNQUNULFdBQVcsSUFBSSxHQUFLO0FBQ2xCLGVBQU87QUFBQSxNQUNULFdBQVcsSUFBSSxLQUFLLEtBQUs7QUFDdkIsZUFBTyxLQUFLLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxJQUFJLEtBQUssTUFBTSxLQUFLLElBQUksS0FBSyxFQUFFO0FBQUEsTUFDckUsT0FBTztBQUNMLGVBQ0UsS0FBSyxJQUFJLEtBQUssTUFBTSxJQUFJLE1BQU0sS0FBSyxJQUFJLEtBQUssTUFBTSxLQUFLLElBQUksS0FBSyxFQUFFO0FBQUEsTUFFdEU7QUFBQSxJQUNGO0FBQUEsRUFDRjs7O0FDM0NPLE1BQU0sbUJBQWdEO0FBQUEsSUFDM0QsS0FBSztBQUFBLElBQ0wsVUFBVTtBQUFBLElBQ1YsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLEVBQ1g7QUFFTyxNQUFNLFdBQU4sTUFBZTtBQUFBLElBQ1o7QUFBQSxJQUNSLFlBQVksVUFBa0IsYUFBMEI7QUFDdEQsWUFBTSxNQUFNLGlCQUFpQixXQUFXO0FBQ3hDLFdBQUssYUFBYSxJQUFJLFdBQVcsV0FBVyxLQUFLLFdBQVcsS0FBSyxRQUFRO0FBQUEsSUFDM0U7QUFBQSxJQUVBLE9BQU8sR0FBbUI7QUFDeEIsYUFBTyxLQUFLLFdBQVcsT0FBTyxDQUFDO0FBQUEsSUFDakM7QUFBQSxFQUNGOzs7QUNuQkEsTUFBTSxJQUFJLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQztBQUVqQyxNQUFNLFlBQXNCLElBQUksTUFBTSxFQUFFO0FBQ3hDLFlBQVUsS0FBSyxDQUFDO0FBRWhCLFdBQVMsSUFBSSxHQUFHLElBQUksS0FBTSxLQUFLO0FBQzdCLFVBQU0sSUFBSSxFQUFFLE9BQU8sSUFBSSxHQUFJO0FBQzNCLGNBQVUsS0FBSyxNQUFNLENBQUMsQ0FBQyxLQUFLO0FBQUEsRUFDOUI7QUFFQSxVQUFRLElBQUksY0FBYyxTQUFTO0FBTW5DLE1BQU0sWUFBWSxDQUFDLE1BQXFCO0FBQ3RDLFlBQVEsSUFBSSxlQUFlLEVBQUUsT0FBTyxJQUFJLEdBQUcsRUFBRSxPQUFPLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQUEsRUFDMUU7QUFFQSxZQUFVLElBQUksU0FBUyxHQUFHLFNBQVMsQ0FBQztBQUVwQyxZQUFVLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
