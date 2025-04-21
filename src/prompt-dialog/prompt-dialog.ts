export class PromptDialog extends HTMLElement {
  dialog: HTMLDialogElement | null = null;
  heading: HTMLHeadingElement | null = null;
  inputElement: HTMLInputElement | null = null;
  resolve: (value: string | null) => void = () => {};

  connectedCallback(): void {
    this.dialog = this.querySelector('dialog')!;
    this.heading = this.querySelector('h3');
    this.inputElement = this.querySelector('input');

    this.querySelector('#prompt-cancel')!.addEventListener('click', () => {
      this.dialog!.close();
      this.resolve(null);
    });

    this.querySelector('#prompt-ok')!.addEventListener('click', () => {
      this.dialog!.close();
      this.resolve(this.inputElement!.value);
    });
  }

  prompt(heading: string): Promise<string | null> {
    const p = new Promise<string | null>((resolve) => {
      this.resolve = resolve;
    });

    this.heading!.textContent = heading;
    this.inputElement!.value = '';
    this.dialog!.showModal();

    return p;
  }
}

customElements.define('prompt-dialog', PromptDialog);
