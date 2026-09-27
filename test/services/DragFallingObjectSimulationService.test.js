const test = require('node:test');
const assert = require('node:assert/strict');
const { DragFallingObjectSimulationService } = require('../../src/services/DragFallingObjectSimulationService');
const { SimulationParameters } = require('../../src/domain/SimulationParameters');
const { ValidationError } = require('../../src/errors/ValidationError');

test('DragFallingObjectSimulationService returns equation, terminal velocity and states', () => {
  const service = new DragFallingObjectSimulationService();
  const expectedTerminalVelocity = Math.sqrt((2 * 80 * 9.81) / (1 * 1.225 * 0.7));

  const result = service.run({
    gravity: 9.81,
    initialHeight: 100,
    initialVelocity: 0,
    velocityDirection: 'down',
    timeStep: 0.1,
    mass: 80,
    dragCoefficient: 1,
    fluidDensity: 1.225,
    referenceArea: 0.7
  });

  assert.equal(result.equation, 'm dv/dt = m g - 1/2 Cd rho A v^2');
  assert.ok(Array.isArray(result.states));
  assert.ok(result.states.length > 0);
  assert.ok(Math.abs(result.terminalVelocity - expectedTerminalVelocity) < 0.000001);
});

test('DragFallingObjectSimulationService signs initial velocity from direction', () => {
  let receivedParameters;
  const fakeSolver = {
    solve(parameters) {
      receivedParameters = parameters;
      return [];
    }
  };

  const service = new DragFallingObjectSimulationService(fakeSolver);

  service.run({
    gravity: 9.81,
    initialHeight: 10,
    initialVelocity: 5,
    velocityDirection: 'down',
    timeStep: 0.1,
    mass: 80,
    dragCoefficient: 1,
    fluidDensity: 1.225,
    referenceArea: 0.7
  });

  assert.ok(receivedParameters instanceof SimulationParameters);
  assert.equal(receivedParameters.initialVelocity, -5);

  service.run({
    gravity: 9.81,
    initialHeight: 10,
    initialVelocity: 5,
    velocityDirection: 'up',
    timeStep: 0.1,
    mass: 80,
    dragCoefficient: 1,
    fluidDensity: 1.225,
    referenceArea: 0.7
  });

  assert.equal(receivedParameters.initialVelocity, 5);
});

test('DragFallingObjectSimulationService validates mass', () => {
  const service = new DragFallingObjectSimulationService();

  assert.throws(
    () => service.run({
      gravity: 9.81,
      initialHeight: 1,
      initialVelocity: 0,
      velocityDirection: 'down',
      timeStep: 0.1,
      mass: 0,
      dragCoefficient: 1,
      fluidDensity: 1.225,
      referenceArea: 0.7
    }),
    (error) => error instanceof ValidationError && error.message === 'Mass must be a positive number.'
  );
});
