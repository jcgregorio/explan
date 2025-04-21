import { MetricDefinition } from '../metrics/metrics';
import { MetricRange } from '../metrics/range';
import {
  DupTaskOp,
  InsertNewEmptyMilestoneAfterOp,
  SetTaskNameOp,
  SplitTaskOp,
} from '../ops/chart';
import { AddMetricOp, SetMetricValueOp } from '../ops/metrics';
import { Op, applyAllOpsToPlan } from '../ops/ops';
import {
  AddResourceOp,
  AddResourceOptionOp,
  DeleteResourceOptionOp,
  SetResourceValueOp,
} from '../ops/resources';
import { Plan } from '../plan/plan';
import { reportIfError } from '../report-error/report-error';
import { Uncertainty } from '../stats/cdf/triangular/jacobian';

const people: string[] = ['Fred', 'Barney', 'Wilma', 'Betty'];
const uncertainties: Uncertainty[] = ['low', 'moderate', 'high'];

const DURATION = 10;

const rndInt = (n: number): number => {
  return Math.floor(Math.random() * n);
};

const rndDuration = (): number => {
  return rndInt(DURATION);
};

const rndUncertainty = (): Uncertainty =>
  uncertainties[rndInt(uncertainties.length)];

export const generateStarterPlan = (): Plan => {
  const plan = new Plan();
  const res = applyAllOpsToPlan(
    [
      InsertNewEmptyMilestoneAfterOp(0),
      SetMetricValueOp('Duration', 10, 1),
      SetResourceValueOp('Uncertainty', 'low', 1),
    ],
    plan
  );

  reportIfError(res);
  return plan;
};

export const generateRandomPlan = (): Plan => {
  const plan = new Plan();

  const ops: Op[] = [AddResourceOp('Person')];

  people.forEach((person: string) => {
    ops.push(AddResourceOptionOp('Person', person));
  });
  ops.push(DeleteResourceOptionOp('Person', ''));

  ops.push(
    AddMetricOp('Cost ($/hr)', new MetricDefinition(15, new MetricRange(0))),
    InsertNewEmptyMilestoneAfterOp(0),
    SetMetricValueOp('Duration', rndDuration(), 1),
    SetTaskNameOp(1, randomTaskName()),
    SetResourceValueOp('Person', people[rndInt(people.length)], 1),
    SetResourceValueOp('Uncertainty', rndUncertainty(), 1)
  );

  let numTasks = 1;
  for (let i = 0; i < 20; i++) {
    let index = rndInt(numTasks) + 1;
    ops.push(
      SplitTaskOp(index),
      SetMetricValueOp('Duration', rndDuration(), index + 1),
      SetTaskNameOp(index + 1, randomTaskName()),
      SetResourceValueOp('Person', people[rndInt(people.length)], index + 1),
      SetResourceValueOp('Uncertainty', rndUncertainty(), index + 1)
    );
    numTasks++;
    index = rndInt(numTasks) + 1;
    ops.push(
      DupTaskOp(index),
      SetMetricValueOp('Duration', rndDuration(), index + 1),
      SetTaskNameOp(index + 1, randomTaskName()),
      SetResourceValueOp('Person', people[rndInt(people.length)], index + 1),
      SetResourceValueOp('Uncertainty', rndUncertainty(), index + 1)
    );
    numTasks++;
  }

  const res = applyAllOpsToPlan(ops, plan);

  reportIfError(res);
  return plan;
};

const parts = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
  'ut',
  'enim',
  'ad',
  'minim',
  'veniam',
  'quis',
  'nostrud',
  'exercitation',
  'ullamco',
  'laboris',
  'nisi',
  'ut',
  'aliquip',
  'ex',
  'ea',
  'commodo',
  'consequat',
  'euis',
  'aute',
  'irure',
  'dolor',
  'in',
  'reprehenderit',
  'in',
  'voluptate',
  'velit',
  'esse',
  'cillum',
  'dolore',
  'eu',
  'fugiat',
  'nulla',
  'pariatur',
  'excepteur',
  'sint',
  'occaecat',
  'cupidatat',
  'non',
  'proident',
  'sunt',
  'in',
  'culpa',
  'qui',
  'officia',
  'deserunt',
  'mollit',
  'anim',
  'id',
  'est',
  'laborum',
];

const partsLength = parts.length;

const randomTaskName = (): string =>
  `${parts[rndInt(partsLength)]} ${parts[rndInt(partsLength)]}`;
