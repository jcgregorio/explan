import { TemplateResult, html, render } from 'lit-html';
import { UnitBase } from '../units/unit.ts';
import { dateDisplay } from '../date-control-utils/date-control-utils.ts';
import { live } from 'lit-html/directives/live.js';
import { reportErrorMsg } from '../report-error/report-error.ts';

declare global {
  interface GlobalEventHandlersEventMap {
    'date-picker-input': CustomEvent<number>;
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
    if (kind === 'Unitless') {
      return html` <input
        type="text"
        .value=${live(this._value.dateOffset)}
        @change=${(e: InputEvent) => this.inputChanged(e)}
      />`;
    } else {
      return html`
        <input
          type="date"
          .value=${live(
            dateDisplay(this._value.unit.asDate(this._value.dateOffset))
          )}
          @input=${(e: InputEvent) => this.inputChanged(e)}
        />
      `;
    }
  }

  private inputChanged(e: InputEvent) {
    const ret = this._value!.unit.parse((e.target as HTMLInputElement).value);
    if (!ret.ok) {
      this.render();
      reportErrorMsg(ret.error);
    } else {
      this.dispatchEvent(
        new CustomEvent<number>('date-picker-input', {
          bubbles: true,
          detail: ret.value,
        })
      );
    }
  }
}

customElements.define('date-picker', DatePicker);
