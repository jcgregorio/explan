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
}

type ThemeProp = keyof Theme;

const colorThemePrototype: Theme = {
  surface: "",
  onSurface: "",
  onSurfaceSecondary: "",
  overlay: "",
};

export const colorThemeFromElement = (ele: HTMLElement): Theme => {
  const style = getComputedStyle(ele);
  const ret = Object.assign({}, colorThemePrototype);
  Object.keys(ret).forEach((name: string) => {
    ret[name as ThemeProp] = style.getPropertyValue(`--${name}`);
  });
  return ret;
};
