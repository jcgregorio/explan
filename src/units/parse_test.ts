import { assert } from '@esm-bundle/chai';
import { changeUnits, durationToHuman, parseHumanDuration } from './parse.ts';
import { Result } from '../result.ts';

const isOK = <T>(r: Result<T>): T => {
  assert.isTrue(r.ok);
  return r.value;
};

describe('parseDuration', () => {
  it('handles shorthand durations', () => {
    assert.equal(isOK(parseHumanDuration('w', 7)), 0);
    assert.equal(isOK(parseHumanDuration('1w', 7)), 7);
    assert.equal(isOK(parseHumanDuration('1w', 5)), 5);
    assert.equal(isOK(parseHumanDuration('1d1w', 5)), 6);
    assert.equal(isOK(parseHumanDuration('1w1d', 5)), 6);
    assert.equal(isOK(parseHumanDuration('1w1d1m', 5)), 4 * 5 + 5 + 3);
    assert.equal(isOK(parseHumanDuration('1w1d1m', 7)), 4 * 7 + 7 + 3);
    assert.equal(isOK(parseHumanDuration('10d', 7)), 10);
    assert.equal(isOK(parseHumanDuration('10d', 7)), 10);
    assert.equal(isOK(parseHumanDuration('1y', 7)), 364);
    assert.equal(isOK(parseHumanDuration('1y', 5)), 260);
    assert.equal(isOK(parseHumanDuration('', 5)), 0);
    assert.equal(isOK(parseHumanDuration('  \n', 5)), 0);

    assert.equal(isOK(parseHumanDuration('  \n', 0)), 0);
    assert.equal(isOK(parseHumanDuration('5', 0)), 5);
    assert.equal(isOK(parseHumanDuration('07.500', 0)), 7.5);
  });

  it('handles numbers', () => {
    assert.equal(isOK(parseHumanDuration('1', 5)), 1);
    assert.equal(isOK(parseHumanDuration('100', 5)), 100);
    assert.equal(isOK(parseHumanDuration('1101.124', 5)), 1101.124);
  });

  it('detects invalid durations numbers', () => {
    assert.isFalse(parseHumanDuration('f', 5).ok);
    assert.isFalse(parseHumanDuration('123z', 5).ok);
    assert.isFalse(parseHumanDuration('-12', 5).ok);

    assert.isFalse(parseHumanDuration('f', 7).ok);
    assert.isFalse(parseHumanDuration('123z', 7).ok);
    assert.isFalse(parseHumanDuration('-12', 7).ok);
    assert.isFalse(parseHumanDuration('0.5y', 7).ok);

    assert.isFalse(parseHumanDuration('w', 0).ok);
    assert.isFalse(parseHumanDuration('2m', 0).ok);
  });
});

describe('durationToHuman', () => {
  it('converts correctly to human duration strings', () => {
    assert.equal(isOK(durationToHuman(7.5, 0)), '7.5');
    assert.equal(isOK(durationToHuman(7.5, 5)), '1w2d');
    assert.equal(isOK(durationToHuman(7.5, 7)), '1w');

    assert.equal(isOK(durationToHuman(0, 0)), '0');
    assert.equal(isOK(durationToHuman(0, 5)), '0');
    assert.equal(isOK(durationToHuman(0, 7)), '0');

    assert.equal(isOK(durationToHuman(1, 0)), '1');
    assert.equal(isOK(durationToHuman(1, 5)), '1d');
    assert.equal(isOK(durationToHuman(1, 7)), '1d');

    assert.equal(isOK(durationToHuman(8, 0)), '8');
    assert.equal(isOK(durationToHuman(8, 5)), '1w3d');
    assert.equal(isOK(durationToHuman(8, 7)), '1w1d');

    assert.equal(isOK(durationToHuman(30, 0)), '30');
    assert.equal(isOK(durationToHuman(30, 5)), '1m1w3d');
    assert.equal(isOK(durationToHuman(4 * 5 + 2, 5)), '1m');
    assert.equal(isOK(durationToHuman(30, 7)), '1m');

    assert.equal(isOK(durationToHuman(365, 0)), '365');
    assert.equal(isOK(durationToHuman(365, 5)), '1y4m3w2d');
    assert.equal(isOK(durationToHuman(260, 5)), '1y'); // 5 * 52 weeks in a year
    assert.equal(isOK(durationToHuman(365, 7)), '1y1d');
  });
});

describe('changeUnits', () => {
  it('converts units w/o error', () => {
    assert.equal(isOK(changeUnits(365, 7, 5)), 261); // 5 * 52 weeks in a year, +1 day
    assert.equal(isOK(changeUnits(365, 5, 7)), 501);
    assert.equal(isOK(changeUnits(365, 0, 7)), 365);
    assert.equal(isOK(changeUnits(365, 7, 0)), 365);
    assert.equal(isOK(changeUnits(365, 0, 5)), 365);
    assert.equal(isOK(changeUnits(365, 5, 0)), 365);
  });
});
