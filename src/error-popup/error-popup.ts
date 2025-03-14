import { TemplateResult, html, render } from "lit-html";
import { icon } from "../icons/icons";

export class ErrorPopup extends HTMLElement {
  message: string = "";

  public static displayMessage(message: string, timeout: number = 0) {
    document
      .querySelector<ErrorPopup>("error-popup")!
      .displayMessageImpl(message, timeout);
  }

  private displayMessageImpl(message: string, timeout: number = 0) {
    this.message = message;
    if (timeout !== 0) {
      window.setTimeout(() => this.hide(), timeout);
    }
    this.render();
    this.unhide();
  }

  private unhide() {
    this.classList.remove("hidden");
  }

  private hide() {
    this.classList.add("hidden");
  }

  private render() {
    render(this.template(), this);
  }

  private template(): TemplateResult {
    return html`
      <span>${this.message}</span>
      <button class="icon-button" title="Close" @click=${() => this.hide()}>
        ${icon("check")}
      </button>
    `;
  }
}

customElements.define("error-popup", ErrorPopup);
