// When adding properties to ColorTheme also make sure to add a corresponding
// CSS @property declaration.
//
// Note that each property assumes the presence of a CSS variable of the same name
// with a preceeding `--`.

const cssVariableNames = [
  "primary",
  "on-primary",
  "primary-variant",
  "on-primary-variant",
  "secondary",
  "on-secondary",
  "background",
  "on-background",
  "surface",
  "on-surface",
  "on-surface-muted",
  "surface-1dp",
  "surface-2dp",
  "disabled",
  "on-disabled",
  "error",
  "on-error",
  "transparent-overlay",
  "group-color",
] as const;

type cssVariableKeys = (typeof cssVariableNames)[number];

export class Theme2 {
  values: Map<cssVariableKeys, string> = new Map();
  _fontSize: number = 14;

  loadFromElement(ele: HTMLElement) {
    const style = getComputedStyle(ele);
    cssVariableNames.forEach((key) => {
      this.values.set(key, style.getPropertyValue(`--${key}`));
    });
    this._fontSize =
      +style.getPropertyValue("font-size").split("px")[0] *
      window.devicePixelRatio *
      1.2;
    if (this._fontSize === 0) {
      this._fontSize = 24;
    }
    console.log(this._fontSize);
  }

  fontSize(): number {
    return this._fontSize;
  }

  get(key: cssVariableKeys): string {
    return this.values.get(key) || "";
  }
}
