const test = require('node:test');
const assert = require('node:assert/strict');
const { FallingObjectSimulationService } = require('../../src/services/FallingObjectSimulationService');
const { SimulationParameters } = require('../../src/domain/SimulationParameters');
const { ValidationError } = require('../../src/errors/ValidationError');

test('FallingObjectSimulationService returns equation and states', () => {
  const service = new FallingObjectSimulationService();

  const result = service.run({
    gravity: 9.81,
    initialHeight: 100,
    initialVelocity: 0,
    velocityDirection: 'down',
    timeStep: 0.1
  });

  assert.equal(result.equation, "h''(t) = -g");
  assert.ok(Array.isArray(result.states));
  assert.ok(result.states.length > 0);
});

test('FallingObjectSimulationService signs initial velocity from direction', () => {
  let receivedParameters;
  const fakeSolver = {
    solve(parameters) {
      receivedParameters = parameters;
      return [];
    }
  };

  const service = new FallingObjectSimulationService(fakeSolver);

  service.run({
    gravity: 9.81,
    initialHeight: 10,
    initialVelocity: 5,
    velocityDirection: 'down',
    timeStep: 0.1
  });

  assert.ok(receivedParameters instanceof SimulationParameters);
  assert.equal(receivedParameters.initialVelocity, -5);

  service.run({
    gravity: 9.81,
    initialHeight: 10,
    initialVelocity: 5,
    velocityDirection: 'up',
    timeStep: 0.1
  });

  assert.equal(receivedParameters.initialVelocity, 5);
});

test('FallingObjectSimulationService validates gravity', () => {
  const service = new FallingObjectSimulationService();

  assert.throws(
    () => service.run({ gravity: 0, initialHeight: 1, initialVelocity: 0, velocityDirection: 'down', timeStep: 0.1 }),
    (error) => error instanceof ValidationError && error.message === 'Gravity must be a positive number.'
  );
});

test('FallingObjectSimulationService validates height', () => {
  const service = new FallingObjectSimulationService();

  assert.throws(
    () => service.run({ gravity: 9.81, initialHeight: -1, initialVelocity: 0, velocityDirection: 'down', timeStep: 0.1 }),
    (error) => error instanceof ValidationError && error.message === 'Height must be a number greater than or equal to 0.'
  );
});

test('FallingObjectSimulationService validates initial velocity', () => {
  const service = new FallingObjectSimulationService();

  assert.throws(
    () => service.run({ gravity: 9.81, initialHeight: 1, initialVelocity: -1, velocityDirection: 'down', timeStep: 0.1 }),
    (error) => error instanceof ValidationError && error.message === 'Initial velocity must be a number greater than or equal to 0.'
  );
});

test('FallingObjectSimulationService validates time step', () => {
  const service = new FallingObjectSimulationService();

  assert.throws(
    () => service.run({ gravity: 9.81, initialHeight: 1, initialVelocity: 0, velocityDirection: 'down', timeStep: 0 }),
    (error) => error instanceof ValidationError && error.message === 'Time step must be a positive number.'
  );
});

test('FallingObjectSimulationService validates velocity direction', () => {
  const service = new FallingObjectSimulationService();

  assert.throws(
    () => service.run({ gravity: 9.81, initialHeight: 1, initialVelocity: 0, velocityDirection: 'sideways', timeStep: 0.1 }),
    (error) => error instanceof ValidationError && error.message === 'Velocity direction must be either up or down.'
  );
});
