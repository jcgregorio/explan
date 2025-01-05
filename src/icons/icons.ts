import { TemplateResult, html } from "lit-html";

// Look on the main index page for all the allowed names.
//
// Instantiates an SVG icon via the <use> tag.
export const icon = (name: string): TemplateResult => {
  return html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <use href=#${name}>
  </svg>`;
};
