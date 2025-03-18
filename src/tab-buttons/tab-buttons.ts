class TabButtons extends HTMLElement {
  allButtons: HTMLButtonElement[] = [];

  connectedCallback(): void {
    this.querySelectorAll("button").forEach((button: HTMLButtonElement) => {
      const target = button.dataset.target;
      if (!target) {
        return;
      }
      this.allButtons.push(button);
      button.addEventListener("click", () => this.hideAllBut(target));
    });
  }

  hideAllBut(target: string) {
    this.allButtons.forEach((button: HTMLButtonElement) => {
      const tabPanel = document.getElementById(button.dataset.target!);
      if (button.dataset.target === target) {
        tabPanel?.classList.remove("hidden");
        button.classList.add("selected");
      } else {
        tabPanel?.classList.add("hidden");
        button.classList.remove("selected");
      }
    });
  }
}

customElements.define("tab-buttons", TabButtons);
