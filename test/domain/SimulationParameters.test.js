const test = require('node:test');
const assert = require('node:assert/strict');
const { SimulationParameters } = require('../../src/domain/SimulationParameters');

test('SimulationParameters stores constructor values', () => {
  const parameters = new SimulationParameters({
    gravity: 9.81,
    initialHeight: 100,
    initialVelocity: -5,
    timeStep: 0.1
  });

  assert.equal(parameters.gravity, 9.81);
  assert.equal(parameters.initialHeight, 100);
  assert.equal(parameters.initialVelocity, -5);
  assert.equal(parameters.timeStep, 0.1);
});
