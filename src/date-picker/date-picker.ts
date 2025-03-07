import { TemplateResult, html, render } from "lit-html";
import { Task } from "../chart/chart.ts";
import { icon } from "../icons/icons.ts";
import { Plan } from "../plan/plan.ts";
import { UnitBase } from "../units/unit.ts";

declare global {
  interface GlobalEventHandlersEventMap {
    "date-picker-input": CustomEvent<number>;
  }
}

export class DatePicker extends HTMLElement {
  plan: Plan | null = null;
  dateOffset: number = 0;
  unit: UnitBase | null = null;

  update(plan: Plan, dateOffset: number) {
    this.plan = plan;
    this.unit = plan.durationUnits;
    this.dateOffset = dateOffset;
    this.render();
  }

  private dateControlValue(d: Date): string {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDay()}`;
  }

  private render() {
    render(this.template(), this);
  }

  private template(): TemplateResult {
    if (this.plan === null) {
      return html``;
    }
    const kind = this.unit!.kind();
    if (kind === "Unitless") {
      return html` <input
        type="text"
        value=${this.dateOffset}
        @input=${(e: InputEvent) => this.inputChanged(e)}
      />`;
    } else {
      return html` <input
          type="date"
          value=${this.dateControlValue(this.unit!.asDate(this.dateOffset))}
          @input=${(e: InputEvent) => this.inputChanged(e)}
        `;
    }
  }

  private inputChanged(e: InputEvent) {
    const newOffset = this.unit!.parse((e.target as HTMLInputElement).value);
    this.dispatchEvent(
      new CustomEvent("date-picker-input", {
        bubbles: true,
        detail: newOffset,
      })
    );
  }
}

customElements.define("date-picker", DatePicker);
