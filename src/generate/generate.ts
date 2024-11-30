import {
  DupTaskOp,
  InsertNewEmptyTaskAfterOp,
  SetTaskNameOp,
  SplitTaskOp,
} from "../ops/chart";
import { SetMetricValueOp } from "../ops/metrics";
import { Op, applyAllOpsToPlan } from "../ops/ops";
import {
  AddResourceOp,
  AddResourceOptionOp,
  SetResourceValueOp,
} from "../ops/resources";
import { Plan } from "../plan/plan";

const people: string[] = ["Fred", "Barney", "Wilma", "Betty"];

const DURATION = 100;

const rndInt = (n: number): number => {
  return Math.floor(Math.random() * n);
};

const rndDuration = (): number => {
  return rndInt(DURATION);
};

export const generateRandomPlan = (): Plan => {
  const plan = new Plan();
  let taskID = 0;

  const rndName = (): string => `T ${taskID++}`;

  const ops: Op[] = [AddResourceOp("Person")];

  people.forEach((person: string) => {
    ops.push(AddResourceOptionOp("Person", person));
  });

  ops.push(
    InsertNewEmptyTaskAfterOp(0),
    SetMetricValueOp("Duration", rndDuration(), 1),
    SetTaskNameOp(1, rndName()),
    SetResourceValueOp("Person", people[rndInt(people.length)], 1),
    SetResourceValueOp("Uncertainty", "moderate", 1)
  );

  let numTasks = 1;
  for (let i = 0; i < 15; i++) {
    let index = rndInt(numTasks) + 1;
    ops.push(
      SplitTaskOp(index),
      SetMetricValueOp("Duration", rndDuration(), index + 1),
      SetTaskNameOp(index + 1, rndName()),
      SetResourceValueOp("Person", people[rndInt(people.length)], index + 1),
      SetResourceValueOp("Uncertainty", "moderate", index + 1)
    );
    numTasks++;
    index = rndInt(numTasks) + 1;
    ops.push(
      DupTaskOp(index),
      SetMetricValueOp("Duration", rndDuration(), index + 1),
      SetTaskNameOp(index + 1, rndName()),
      SetResourceValueOp("Person", people[rndInt(people.length)], index + 1),
      SetResourceValueOp("Uncertainty", "moderate", index + 1)
    );
    numTasks++;
  }

  const res = applyAllOpsToPlan(ops, plan);

  if (!res.ok) {
    console.log(res.error);
  }
  return plan;
};
