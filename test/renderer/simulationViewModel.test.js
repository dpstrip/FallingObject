const test = require('node:test');
const assert = require('node:assert/strict');
const {
  formatNumber,
  toTableRows,
  toChartSeries
} = require('../../src/renderer/simulationViewModel');

test('formatNumber formats to 4 decimals', () => {
  assert.equal(formatNumber(1), '1.0000');
  assert.equal(formatNumber(1.23456), '1.2346');
});

test('toTableRows maps simulation states to formatted rows', () => {
  const rows = toTableRows([
    { time: 0, height: 100, velocity: -1.5 },
    { time: 0.1, height: 99.8, velocity: -2.481 }
  ]);

  assert.deepEqual(rows, [
    { time: '0.0000', height: '100.0000', velocity: '-1.5000' },
    { time: '0.1000', height: '99.8000', velocity: '-2.4810' }
  ]);
});

test('toChartSeries maps simulation states to rounded numeric arrays', () => {
  const series = toChartSeries([
    { time: 0.123456, height: 9.87654, velocity: -1.23456 }
  ]);

  assert.deepEqual(series, {
    labels: [0.1235],
    heights: [9.8765],
    velocities: [-1.2346]
  });
});
