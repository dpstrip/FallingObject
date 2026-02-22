const test = require('node:test');
const assert = require('node:assert/strict');
const { SimulationState } = require('../../src/domain/SimulationState');

test('SimulationState stores constructor values', () => {
  const state = new SimulationState(1.2, 50.5, -3.1);

  assert.equal(state.time, 1.2);
  assert.equal(state.height, 50.5);
  assert.equal(state.velocity, -3.1);
});
