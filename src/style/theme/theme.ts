// When adding properties to ColorTheme also make sure to add a corresponding
// CSS @property declaration.
//
// Note that each property assumes the presence of a CSS variable of the same name
// with a preceeding `--`.
export interface Theme {
  surface: string;
  onSurface: string;
  onSurfaceSecondary: string;
  overlay: string;
  groupColor1: string;
  groupColor2: string;
}

export const arrayOfGroupColors = (t: Theme): string[] => {
  return [t.groupColor1, t.groupColor2];
};

type ThemeProp = keyof Theme;

const colorThemePrototype: Theme = {
  surface: "",
  onSurface: "",
  onSurfaceSecondary: "",
  overlay: "",
  groupColor1: "",
  groupColor2: "",
};

export const colorThemeFromElement = (ele: HTMLElement): Theme => {
  const style = getComputedStyle(ele);
  const ret = Object.assign({}, colorThemePrototype);
  Object.keys(ret).forEach((name: string) => {
    ret[name as ThemeProp] = style.getPropertyValue(`--${name}`);
  });
  return ret;
};
