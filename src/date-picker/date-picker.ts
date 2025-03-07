import { TemplateResult, html, render } from "lit-html";
import { Plan } from "../plan/plan.ts";
import { UnitBase } from "../units/unit.ts";
import { dateControlValue } from "../date-control-utils/date-control-utils.ts";

declare global {
  interface GlobalEventHandlersEventMap {
    "date-picker-input": CustomEvent<number>;
  }
}

export interface DatePickerValue {
  unit: UnitBase;
  dateOffset: number;
}

export class DatePicker extends HTMLElement {
  _value: DatePickerValue | null = null;

  public set value(v: DatePickerValue) {
    this._value = v;
    this.render();
  }

  private render() {
    render(this.template(), this);
  }

  private template(): TemplateResult {
    if (this._value === null) {
      return html``;
    }
    const kind = this._value.unit.kind();
    if (kind === "Unitless") {
      return html` <input
        type="text"
        .value=${this._value.dateOffset}
        @input=${(e: InputEvent) => this.inputChanged(e)}
      />`;
    } else {
      return html`
        <input
          type="date"
          .value=${dateControlValue(
            this._value.unit.asDate(this._value.dateOffset)
          )}
          @input=${(e: InputEvent) => this.inputChanged(e)}
        />
      `;
    }
  }

  private inputChanged(e: InputEvent) {
    const newOffset = this._value!.unit.parse(
      (e.target as HTMLInputElement).value
    );
    this.dispatchEvent(
      new CustomEvent("date-picker-input", {
        bubbles: true,
        detail: newOffset,
      })
    );
  }
}

customElements.define("date-picker", DatePicker);
