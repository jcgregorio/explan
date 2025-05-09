import { TemplateResult, html, render } from 'lit-html';
import { ExplanMain } from '../explanMain/explanMain';

export class ImageExportPanel extends HTMLElement {
  explanMain: ExplanMain | null = null;
  planDefinitionChangedCallback: () => void;

  constructor() {
    super();
    this.planDefinitionChangedCallback = () => {
      if (this.explanMain !== null) {
        this.render();
      }
    };
  }

  connectedCallback(): void {
    document.addEventListener(
      'plan-definition-changed',
      this.planDefinitionChangedCallback
    );
  }

  disconnectedCallback(): void {
    document.removeEventListener(
      'plan-definition-changed',
      this.planDefinitionChangedCallback
    );
  }

  private render() {
    render(this.template(), this);
  }

  setConfig(explanMain: ExplanMain) {
    this.explanMain = explanMain;
    this.render();
  }

  private template(): TemplateResult {
    if (!this.explanMain) {
      return html``;
    }
    const imageExportWidth = this.explanMain.imageExportWidthPx;
    return html` <h3>Image Export</h3>
    
    <div>
        <label>
        Width (px) 
        <input 
            type=number 
            .value=${imageExportWidth}
            @change=${(e: InputEvent) => this.widthChange(e)}
            min=100
            max=1000000
            step=1
            required
        >
        </lable>
    </div>
    <div>
        <label>
        <input 
            type=checkbox 
            .checked=${this.explanMain.imageExportBackgroundTransparent}
            @input=${(e: InputEvent) => {
              this.transparentChange(e);
            }}
        >
        Transparent Background
        </label>
    </div>
    `;
  }

  private widthChange(e: InputEvent) {
    const newWidth: number = +(e.target as HTMLInputElement).value;
    if (newWidth > 0 && newWidth < 1000000) {
      this.explanMain!.imageExportWidthPx = newWidth;
    }
  }

  private transparentChange(e: InputEvent) {
    const b: boolean = (e.target as HTMLInputElement).checked;
    this.explanMain!.imageExportBackgroundTransparent = b;
  }
}

customElements.define('image-export-panel', ImageExportPanel);
