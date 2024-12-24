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

export const generateStarterPlan = (): Plan => {
  const plan = new Plan();
  let taskID = 0;

  const ops: Op[] = [AddResourceOp("Person")];

  people.forEach((person: string) => {
    ops.push(AddResourceOptionOp("Person", person));
  });

  ops.push(
    InsertNewEmptyTaskAfterOp(0),
    SetMetricValueOp("Duration", 10, 1),
    SetResourceValueOp("Person", "Fred", 1),
    SetResourceValueOp("Uncertainty", "low", 1)
  );

  const res = applyAllOpsToPlan(ops, plan);

  if (!res.ok) {
    console.log(res.error);
  }
  return plan;
};

export const generateRandomPlan = (): Plan => {
  const plan = new Plan();
  let taskID = 0;

  const ops: Op[] = [AddResourceOp("Person")];

  people.forEach((person: string) => {
    ops.push(AddResourceOptionOp("Person", person));
  });

  ops.push(
    InsertNewEmptyTaskAfterOp(0),
    SetMetricValueOp("Duration", rndDuration(), 1),
    SetTaskNameOp(1, randomTaskName()),
    SetResourceValueOp("Person", people[rndInt(people.length)], 1),
    SetResourceValueOp("Uncertainty", "moderate", 1)
  );

  let numTasks = 1;
  for (let i = 0; i < 15; i++) {
    let index = rndInt(numTasks) + 1;
    ops.push(
      SplitTaskOp(index),
      SetMetricValueOp("Duration", rndDuration(), index + 1),
      SetTaskNameOp(index + 1, randomTaskName()),
      SetResourceValueOp("Person", people[rndInt(people.length)], index + 1),
      SetResourceValueOp("Uncertainty", "moderate", index + 1)
    );
    numTasks++;
    index = rndInt(numTasks) + 1;
    ops.push(
      DupTaskOp(index),
      SetMetricValueOp("Duration", rndDuration(), index + 1),
      SetTaskNameOp(index + 1, randomTaskName()),
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

const parts = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "ut",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
  "ullamco",
  "laboris",
  "nisi",
  "ut",
  "aliquip",
  "ex",
  "ea",
  "commodo",
  "consequat",
  "euis",
  "aute",
  "irure",
  "dolor",
  "in",
  "reprehenderit",
  "in",
  "voluptate",
  "velit",
  "esse",
  "cillum",
  "dolore",
  "eu",
  "fugiat",
  "nulla",
  "pariatur",
  "excepteur",
  "sint",
  "occaecat",
  "cupidatat",
  "non",
  "proident",
  "sunt",
  "in",
  "culpa",
  "qui",
  "officia",
  "deserunt",
  "mollit",
  "anim",
  "id",
  "est",
  "laborum",
];

const partsLength = parts.length;

const randomTaskName = (): string =>
  `${parts[rndInt(partsLength)]} ${parts[rndInt(partsLength)]}`;
