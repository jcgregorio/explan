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

  loadFromElement(ele: HTMLElement) {
    const style = getComputedStyle(ele);
    cssVariableNames.forEach((key) => {
      this.values.set(key, style.getPropertyValue(`--${key}`));
    });
  }

  get(key: cssVariableKeys): string {
    return this.values.get(key) || "";
  }
}

export interface Theme {
  surface: string;
  onSurface: string;
  onSurfaceMuted: string;
  onSurfaceSecondary: string;
  overlay: string;
  groupColor: string;
  highlight: string;
  added: string;
  removed: string;
}

type ThemeProp = keyof Theme;

const colorThemePrototype: Theme = {
  surface: "",
  onSurface: "",
  onSurfaceMuted: "",
  onSurfaceSecondary: "",
  overlay: "",
  groupColor: "",
  highlight: "",
  added: "",
  removed: "",
};

export const colorThemeFromElement = (ele: HTMLElement): Theme => {
  const style = getComputedStyle(ele);
  const ret = Object.assign({}, colorThemePrototype);
  Object.keys(ret).forEach((name: string) => {
    ret[name as ThemeProp] = style.getPropertyValue(`--${name}`);
  });
  return ret;
};
