const test = require('node:test');
const assert = require('node:assert/strict');
const { EulerCromerSolver } = require('../../src/solver/EulerCromerSolver');
const { SimulationParameters } = require('../../src/domain/SimulationParameters');

test('EulerCromerSolver returns initial state when height starts at zero', () => {
  const solver = new EulerCromerSolver();
  const parameters = new SimulationParameters({
    gravity: 9.81,
    initialHeight: 0,
    initialVelocity: -1,
    timeStep: 0.1
  });

  const states = solver.solve(parameters);

  assert.equal(states.length, 1);
  assert.equal(states[0].time, 0);
  assert.equal(states[0].height, 0);
  assert.equal(states[0].velocity, -1);
});

test('EulerCromerSolver computes expected discrete trajectory', () => {
  const solver = new EulerCromerSolver();
  const parameters = new SimulationParameters({
    gravity: 1,
    initialHeight: 2,
    initialVelocity: 0,
    timeStep: 1
  });

  const states = solver.solve(parameters);

  assert.equal(states.length, 3);
  assert.deepEqual(
    states.map((state) => ({ t: state.time, h: state.height, v: state.velocity })),
    [
      { t: 0, h: 2, v: 0 },
      { t: 1, h: 1, v: -1 },
      { t: 2, h: 0, v: -2 }
    ]
  );
});

test('EulerCromerSolver clamps final height at ground and increases time monotonically', () => {
  const solver = new EulerCromerSolver();
  const parameters = new SimulationParameters({
    gravity: 9.81,
    initialHeight: 10,
    initialVelocity: 5,
    timeStep: 0.05
  });

  const states = solver.solve(parameters);

  assert.ok(states.length > 2);
  assert.equal(states[states.length - 1].height, 0);

  for (let index = 1; index < states.length; index += 1) {
    assert.ok(states[index].time > states[index - 1].time);
    assert.ok(states[index].height >= 0);
  }
});
