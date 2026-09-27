const test = require('node:test');
const assert = require('node:assert/strict');
const { QuadraticDragSolver } = require('../../src/solver/QuadraticDragSolver');
const { SimulationParameters } = require('../../src/domain/SimulationParameters');

test('QuadraticDragSolver returns initial state when height starts at zero', () => {
  const solver = new QuadraticDragSolver();
  const parameters = new SimulationParameters({
    gravity: 9.81,
    initialHeight: 0,
    initialVelocity: -1,
    timeStep: 0.1,
    mass: 80,
    dragCoefficient: 1,
    fluidDensity: 1.225,
    referenceArea: 0.7
  });

  const states = solver.solve(parameters);

  assert.equal(states.length, 1);
  assert.equal(states[0].time, 0);
  assert.equal(states[0].height, 0);
  assert.equal(states[0].velocity, -1);
});

test('QuadraticDragSolver produces slower descent than no-drag case under same start', () => {
  const solver = new QuadraticDragSolver();
  const parameters = new SimulationParameters({
    gravity: 9.81,
    initialHeight: 200,
    initialVelocity: 0,
    timeStep: 0.1,
    mass: 80,
    dragCoefficient: 1,
    fluidDensity: 1.225,
    referenceArea: 0.7
  });

  const states = solver.solve(parameters);
  const finalState = states[states.length - 1];

  assert.ok(states.length > 2);
  assert.equal(finalState.height, 0);
  assert.ok(finalState.time > 6.4);
});

test('QuadraticDragSolver clamps final height at ground and increases time monotonically', () => {
  const solver = new QuadraticDragSolver();
  const parameters = new SimulationParameters({
    gravity: 9.81,
    initialHeight: 50,
    initialVelocity: -2,
    timeStep: 0.05,
    mass: 80,
    dragCoefficient: 1,
    fluidDensity: 1.225,
    referenceArea: 0.7
  });

  const states = solver.solve(parameters);

  assert.equal(states[states.length - 1].height, 0);

  for (let index = 1; index < states.length; index += 1) {
    assert.ok(states[index].time > states[index - 1].time);
    assert.ok(states[index].height >= 0);
  }
});
