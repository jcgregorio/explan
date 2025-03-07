import { TemplateResult, html, render } from "lit-html";
import { Task } from "../chart/chart.ts";
import { icon } from "../icons/icons.ts";

export class TaskCompletionPanel extends HTMLElement {}

customElements.define("task-completion-panel", TaskCompletionPanel);
