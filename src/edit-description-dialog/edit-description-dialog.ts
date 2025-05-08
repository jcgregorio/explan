/**
 * Pop-up dialog that allows editing the description in a textarea.
 *
 * HTML structure is found in index.html.
 */

export class EditDescriptionDialog extends HTMLElement {
  dialog: HTMLDialogElement | null = null;
  inputElement: HTMLTextAreaElement | null = null;
  resolve: (value: string | null) => void = () => {};

  connectedCallback(): void {
    this.dialog = this.querySelector('dialog')!;
    this.inputElement = this.querySelector('textarea');

    this.querySelector('#description-cancel')!.addEventListener('click', () => {
      this.dialog!.close();
      this.resolve(null);
    });

    this.querySelector('#description-ok')!.addEventListener('click', () => {
      this.dialog!.close();
      this.resolve(this.inputElement!.value);
    });
  }

  prompt(description: string): Promise<string | null> {
    const p = new Promise<string | null>((resolve) => {
      this.resolve = resolve;
    });

    this.inputElement!.value = description;
    this.dialog!.showModal();

    return p;
  }
}

customElements.define('edit-description-dialog', EditDescriptionDialog);
